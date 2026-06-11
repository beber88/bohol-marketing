"""
Content Generation Pipeline - Brief -> Draft -> Brand Guard -> Approve/Revise

Generates marketing content (ad copy, social posts, emails) and runs it through
a brand-guard check. If the guard fails, the content is revised up to
MAX_REVISION_ROUNDS times before being rejected.
"""

from __future__ import annotations

import json
from typing import Literal, TypedDict

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from src.config import ANTHROPIC_API_KEY, BRAND_GUARD_RULES, CMO_MODEL, HAIKU_MODEL


class ContentState(TypedDict):
    brief: dict
    draft: str | None
    brand_guard_result: dict | None
    revision_count: int
    final_content: dict | None
    approved: bool


_writer_llm = ChatAnthropic(
    model=CMO_MODEL,
    api_key=ANTHROPIC_API_KEY,
    max_tokens=2048,
    temperature=0.7,
)

_guard_llm = ChatAnthropic(
    model=HAIKU_MODEL,
    api_key=ANTHROPIC_API_KEY,
    max_tokens=1024,
    temperature=0.0,
)

COPYWRITER_SYSTEM = """\
You are a senior marketing copywriter for Blue Everest Asset Group Holding Inc.,
writing for the Panglao Prime Villas luxury investment property campaign.

Key facts you MUST incorporate:
- Villa C: PHP 30,000,000 / 1,550,000 ILS (Israeli market)
- Villa D: PHP 28,000,000 / 1,450,000 ILS (Israeli market)
- Reservation deposit: 9,999 ILS (Israeli) or equivalent PHP
- Monthly Airbnb income: PHP 395,000 (verified)
- Annual ROI: 17-25%
- Location: Panglao, Bohol, Philippines
- 4 bedrooms, 263.78 sqm
- Developer: Blue Everest Asset Group Holding Inc.

CONTENT RULES (must follow exactly):
- Every piece of content must include at least one specific number
- Every CTA must include BOTH WhatsApp numbers:
  WhatsApp (Marketing): +639542555553
  WhatsApp (Office): +639958565865
- NEVER use: amazing, incredible, dream home, once in a lifetime
- Israeli content: show prices ONLY in shekels, mention 3 legal ownership
  solutions (Deed of Assignment, Leasehold 25+25, Domestic Corporation)
- Filipino content: mention BDO Bank financing availability
- Hebrew register: formal but warm, peer-to-peer professional

Write the content according to the brief provided. Output the content directly,
ready to publish.
"""

BRAND_GUARD_SYSTEM = f"""\
You are a brand compliance checker for Blue Everest Asset Group Holding Inc.
Your job is to review marketing content against strict brand rules and flag
any violations.

RULES TO CHECK:
1. Forbidden words: {json.dumps(BRAND_GUARD_RULES['forbidden_words'])}
   - Also check Hebrew equivalents if content is in Hebrew
2. CTA must include BOTH WhatsApp numbers: {json.dumps(BRAND_GUARD_RULES['required_cta_whatsapp'])}
3. Content must include at least one specific number (price, ROI, sqm, etc.)
4. Israeli content must show prices in ILS only (no PHP, no USD)
5. Filipino content must mention BDO Bank financing
6. Israeli content must reference legal ownership solutions
7. No em dashes or en dashes - only regular hyphens, colons, commas
8. Company name must be correct: "Blue Everest Asset Group Holding Inc."
   (NOT Blueprint, NOT Blue Group)

OUTPUT FORMAT (valid JSON):
{{
  "passed": true/false,
  "violations": [
    {{"rule": "rule name", "detail": "what was wrong", "severity": "critical/warning"}}
  ],
  "suggestions": ["specific fix suggestions"],
  "score": 0-100
}}

Be strict. A single critical violation means passed=false.
"""

REVISION_SYSTEM = """\
You are a senior marketing copywriter for Blue Everest Asset Group Holding Inc.
You are revising a piece of content that failed brand compliance.

Fix ALL violations listed below while maintaining the marketing effectiveness
and tone of the original. Do not over-correct - only fix what is broken.

Output the revised content directly, ready to publish.
"""


def generate_draft(state: ContentState) -> ContentState:
    """Generate initial content draft from the brief."""
    brief = state["brief"]
    brief_text = json.dumps(brief, indent=2, ensure_ascii=False)

    response = _writer_llm.invoke([
        SystemMessage(content=COPYWRITER_SYSTEM),
        HumanMessage(content=(
            f"Please write content according to this brief:\n\n{brief_text}\n\n"
            "Follow all content rules exactly. Output the final content only."
        )),
    ])

    return {
        **state,
        "draft": response.content,
        "revision_count": 0,
    }


def check_brand_guard(state: ContentState) -> ContentState:
    """Run the draft through brand compliance checking."""
    draft = state.get("draft", "")
    brief = state.get("brief", {})
    market = brief.get("market", "general")

    response = _guard_llm.invoke([
        SystemMessage(content=BRAND_GUARD_SYSTEM),
        HumanMessage(content=(
            f"Target market: {market}\n\n"
            f"Content to review:\n{draft}"
        )),
    ])

    guard_result: dict = {"passed": False, "violations": [], "suggestions": [], "score": 0}
    try:
        # Strip markdown fences if present
        text = response.content.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        guard_result = json.loads(text)
    except (json.JSONDecodeError, TypeError, IndexError):
        guard_result = {
            "passed": False,
            "violations": [{"rule": "parse_error", "detail": "Could not parse guard response", "severity": "warning"}],
            "suggestions": ["Manual review required"],
            "score": 50,
            "raw_response": response.content,
        }

    return {
        **state,
        "brand_guard_result": guard_result,
        "approved": guard_result.get("passed", False),
    }


def revise_draft(state: ContentState) -> ContentState:
    """Revise the draft based on brand guard feedback."""
    draft = state.get("draft", "")
    guard_result = state.get("brand_guard_result", {})
    violations = guard_result.get("violations", [])
    suggestions = guard_result.get("suggestions", [])

    violations_text = "\n".join(
        f"- [{v.get('severity', 'warning')}] {v.get('rule', '?')}: {v.get('detail', '?')}"
        for v in violations
    )
    suggestions_text = "\n".join(f"- {s}" for s in suggestions)

    response = _writer_llm.invoke([
        SystemMessage(content=REVISION_SYSTEM),
        HumanMessage(content=(
            f"ORIGINAL CONTENT:\n{draft}\n\n"
            f"VIOLATIONS FOUND:\n{violations_text}\n\n"
            f"SUGGESTED FIXES:\n{suggestions_text}\n\n"
            "Please revise the content to fix all violations. "
            "Output only the revised content."
        )),
    ])

    return {
        **state,
        "draft": response.content,
        "revision_count": state.get("revision_count", 0) + 1,
    }


def should_revise(state: ContentState) -> Literal["revise", "approve", "reject"]:
    """Decide whether to revise, approve, or reject the content."""
    if state.get("approved", False):
        return "approve"

    max_rounds = BRAND_GUARD_RULES.get("max_revision_rounds", 3)
    if state.get("revision_count", 0) >= max_rounds:
        return "reject"

    return "revise"


def _finalize_approved(state: ContentState) -> ContentState:
    """Package approved content as final output."""
    return {
        **state,
        "final_content": {
            "status": "approved",
            "content": state.get("draft", ""),
            "guard_score": state.get("brand_guard_result", {}).get("score", 0),
            "revision_rounds": state.get("revision_count", 0),
        },
    }


def _finalize_rejected(state: ContentState) -> ContentState:
    """Package rejected content with failure details."""
    return {
        **state,
        "final_content": {
            "status": "rejected",
            "last_draft": state.get("draft", ""),
            "last_violations": state.get("brand_guard_result", {}).get("violations", []),
            "revision_rounds": state.get("revision_count", 0),
            "message": (
                f"Content failed brand guard after {state.get('revision_count', 0)} "
                f"revision rounds. Manual intervention required."
            ),
        },
        "approved": False,
    }


def build_content_pipeline():
    """Build and compile the content generation pipeline graph."""
    graph = StateGraph(ContentState)

    graph.add_node("generate", generate_draft)
    graph.add_node("brand_check", check_brand_guard)
    graph.add_node("revise", revise_draft)
    graph.add_node("finalize_approved", _finalize_approved)
    graph.add_node("finalize_rejected", _finalize_rejected)

    graph.set_entry_point("generate")
    graph.add_edge("generate", "brand_check")
    graph.add_conditional_edges(
        "brand_check",
        should_revise,
        {
            "revise": "revise",
            "approve": "finalize_approved",
            "reject": "finalize_rejected",
        },
    )
    graph.add_edge("revise", "brand_check")
    graph.add_edge("finalize_approved", END)
    graph.add_edge("finalize_rejected", END)

    return graph.compile()
