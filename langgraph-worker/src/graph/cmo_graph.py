"""
CMO Orchestration Graph - OODA Loop (Observe, Orient, Decide, Act)

The virtual CMO gathers metrics and campaign data, applies strategic
frameworks, makes Bet/Hold/Kill decisions, and issues briefs to sub-agents.
"""

from __future__ import annotations

import json
from typing import Literal, TypedDict

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from src.config import ANTHROPIC_API_KEY, CMO_MODEL


class CMOState(TypedDict):
    query: str
    metrics: dict | None
    leads_summary: dict | None
    campaign_status: dict | None
    cmo_analysis: str | None
    agent_briefs: list[dict] | None
    escalations: list[str]
    final_output: dict | None


_cmo_llm = ChatAnthropic(
    model=CMO_MODEL,
    api_key=ANTHROPIC_API_KEY,
    max_tokens=4096,
    temperature=0.3,
)

OBSERVE_SYSTEM = """\
You are the Chief Marketing Officer AI for Blue Everest Asset Group Holding Inc.,
running the Panglao Prime Villas campaign in the Philippines.

Your job in this step is OBSERVATION. Summarize the raw data you receive into a
structured situation report. Include:
- Key metrics and their trends (up/down/flat vs prior period)
- Lead volume and quality summary
- Campaign health status for each active campaign
- Any anomalies or red flags

Output valid JSON with keys: situation_summary, metric_highlights (list),
lead_highlights (list), red_flags (list).
"""

ORIENT_SYSTEM = """\
You are the CMO AI for Blue Everest / Panglao Prime Villas.

You have received an observation report. Now ORIENT: apply strategic frameworks
to interpret the data.

Frameworks to apply:
1. ROAS analysis - is each channel returning above 2x?
2. CAC vs LTV - is cost-per-acquisition sustainable?
3. Funnel health - where are the biggest drop-offs?
4. Market comparison - Israel vs Philippines performance
5. Budget pacing - are we on track for the $900/15-day budget?

Output valid JSON with keys: framework_results (list of {framework, finding, severity}),
strategic_posture (one of "aggressive", "steady", "defensive"),
key_insight (string).
"""

DECIDE_SYSTEM = """\
You are the CMO AI for Blue Everest / Panglao Prime Villas.

Based on the orientation analysis, make concrete decisions for each campaign and channel.

For each campaign/channel, decide one of:
- BET: Increase budget, scale what is working
- HOLD: Maintain current course, monitor
- KILL: Stop spending, reallocate budget

Also flag any items that require CEO escalation (spend > $100/day change,
new channel launch, creative strategy pivot).

Output valid JSON with keys:
decisions (list of {campaign, channel, action, rationale, budget_change_usd}),
escalations (list of strings requiring CEO approval),
reallocations (list of {from_campaign, to_campaign, amount_usd, reason}).
"""

ACT_SYSTEM = """\
You are the CMO AI for Blue Everest / Panglao Prime Villas.

Based on the decisions made, produce concrete action briefs for each sub-agent.
Each brief should be immediately actionable.

Sub-agents available:
- content_agent: Creates ad copy, social posts, email sequences
- ads_agent: Adjusts Meta/Google campaign settings, budgets, targeting
- lead_agent: Updates lead scoring rules, triggers nurture sequences
- analytics_agent: Sets up new tracking, creates reports

Output valid JSON with keys:
briefs (list of {agent, priority (1-5), action, details (object), deadline_hours}),
summary (string for CEO dashboard).
"""


def observe(state: CMOState) -> CMOState:
    """Step 1: Gather and summarize data from metrics, leads, campaigns."""
    context_parts = [f"CEO Query: {state['query']}"]

    if state.get("metrics"):
        context_parts.append(f"Raw Metrics:\n{json.dumps(state['metrics'], indent=2)}")
    else:
        context_parts.append("Raw Metrics: No metrics data provided. Analyze based on available information only.")

    if state.get("leads_summary"):
        context_parts.append(f"Leads Summary:\n{json.dumps(state['leads_summary'], indent=2)}")
    else:
        context_parts.append("Leads Summary: No lead data provided.")

    if state.get("campaign_status"):
        context_parts.append(f"Campaign Status:\n{json.dumps(state['campaign_status'], indent=2)}")
    else:
        context_parts.append("Campaign Status: No campaign status provided.")

    response = _cmo_llm.invoke([
        SystemMessage(content=OBSERVE_SYSTEM),
        HumanMessage(content="\n\n".join(context_parts)),
    ])

    return {**state, "cmo_analysis": response.content}


def orient(state: CMOState) -> CMOState:
    """Step 2: Apply strategic frameworks to the observation."""
    response = _cmo_llm.invoke([
        SystemMessage(content=ORIENT_SYSTEM),
        HumanMessage(content=(
            f"CEO Query: {state['query']}\n\n"
            f"Observation Report:\n{state['cmo_analysis']}"
        )),
    ])

    return {**state, "cmo_analysis": response.content}


def decide(state: CMOState) -> CMOState:
    """Step 3: Make Bet/Hold/Kill decisions per campaign/channel."""
    response = _cmo_llm.invoke([
        SystemMessage(content=DECIDE_SYSTEM),
        HumanMessage(content=(
            f"CEO Query: {state['query']}\n\n"
            f"Orientation Analysis:\n{state['cmo_analysis']}"
        )),
    ])

    content = response.content
    escalations: list[str] = []

    # Parse escalations from the response
    try:
        parsed = json.loads(content)
        escalations = parsed.get("escalations", [])
    except (json.JSONDecodeError, TypeError):
        pass

    return {
        **state,
        "cmo_analysis": content,
        "escalations": escalations,
    }


def act(state: CMOState) -> CMOState:
    """Step 4: Issue concrete briefs to sub-agents."""
    response = _cmo_llm.invoke([
        SystemMessage(content=ACT_SYSTEM),
        HumanMessage(content=(
            f"CEO Query: {state['query']}\n\n"
            f"Decisions Made:\n{state['cmo_analysis']}"
        )),
    ])

    content = response.content
    briefs: list[dict] = []
    summary = ""

    try:
        parsed = json.loads(content)
        briefs = parsed.get("briefs", [])
        summary = parsed.get("summary", "")
    except (json.JSONDecodeError, TypeError):
        summary = content

    return {
        **state,
        "agent_briefs": briefs,
        "final_output": {
            "briefs": briefs,
            "summary": summary,
            "escalations": state.get("escalations", []),
            "full_analysis": content,
        },
    }


def should_escalate(state: CMOState) -> Literal["escalate", "complete"]:
    """Conditional edge: if there are escalations, stop before acting and surface them."""
    if state.get("escalations") and len(state["escalations"]) > 0:
        return "escalate"
    return "complete"


def _handle_escalation(state: CMOState) -> CMOState:
    """Terminal node for escalation - package the state for CEO review."""
    return {
        **state,
        "final_output": {
            "status": "escalation_required",
            "escalations": state.get("escalations", []),
            "analysis_so_far": state.get("cmo_analysis", ""),
            "message": (
                "The following items require CEO approval before the CMO "
                "can proceed to issue action briefs."
            ),
        },
    }


def build_cmo_graph():
    """Build and compile the CMO OODA loop graph."""
    graph = StateGraph(CMOState)

    graph.add_node("observe", observe)
    graph.add_node("orient", orient)
    graph.add_node("decide", decide)
    graph.add_node("act", act)
    graph.add_node("escalate", _handle_escalation)

    graph.set_entry_point("observe")
    graph.add_edge("observe", "orient")
    graph.add_edge("orient", "decide")
    graph.add_conditional_edges(
        "decide",
        should_escalate,
        {"escalate": "escalate", "complete": "act"},
    )
    graph.add_edge("act", END)
    graph.add_edge("escalate", END)

    return graph.compile()
