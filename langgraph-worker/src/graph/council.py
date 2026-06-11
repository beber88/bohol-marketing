"""
Council Deliberation Graph - Multi-model parallel opinions -> Peer Review -> Synthesis

Inspired by Karpathy's llm-council pattern. Multiple models produce independent
answers, then review each other anonymously, and a chairman synthesizes the final
output using the ranked opinions.
"""

from __future__ import annotations

import asyncio
import json
import re
import time
from typing import TypedDict

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph

from src.config import ANTHROPIC_API_KEY, CMO_MODEL, OPENROUTER_API_KEY


class CouncilState(TypedDict):
    query: str
    system_prompt: str | None
    responses: list[dict]
    peer_reviews: list[dict]
    rankings: dict | None
    synthesis: str | None
    total_cost: float


# Council members - use Anthropic direct for Claude, OpenRouter for others
_COUNCIL_MEMBERS = [
    {
        "id": "claude-sonnet",
        "label": "Response A",
        "strengths": "nuanced copy, long-form, brand voice",
    },
    {
        "id": "gpt-4o",
        "label": "Response B",
        "strengths": "structured planning, data-driven, concise",
    },
    {
        "id": "gemini-2-flash",
        "label": "Response C",
        "strengths": "multimodal thinking, research synthesis, creative angles",
    },
]


def _get_model(member_id: str):
    """Return the appropriate LangChain model for a council member."""
    if member_id == "claude-sonnet":
        return ChatAnthropic(
            model=CMO_MODEL,
            api_key=ANTHROPIC_API_KEY,
            max_tokens=2000,
            temperature=0.7,
        )
    # Use OpenRouter for non-Anthropic models
    model_map = {
        "gpt-4o": "openai/gpt-4o",
        "gemini-2-flash": "google/gemini-2.0-flash-001",
    }
    openrouter_model = model_map.get(member_id, member_id)
    return ChatOpenAI(
        model=openrouter_model,
        api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        max_tokens=2000,
        temperature=0.7,
    )


def _chairman_model():
    """The chairman is always Claude Sonnet for synthesis quality."""
    return ChatAnthropic(
        model=CMO_MODEL,
        api_key=ANTHROPIC_API_KEY,
        max_tokens=4000,
        temperature=0.3,
    )


PEER_REVIEW_SYSTEM = """\
You are participating in an anonymous peer review of marketing strategy responses.
You will see multiple responses labeled Response A, Response B, Response C, etc.
You do NOT know which model or person wrote each response.

Evaluate each response on:
1. Strategic soundness - does the approach make business sense?
2. Specificity - are there concrete, actionable details?
3. Brand alignment - does it fit Blue Everest / Panglao Prime Villas?
4. Market awareness - does it show understanding of Philippine and Israeli markets?
5. Creativity - is the approach fresh and compelling?

Provide your evaluation in this exact format:

EVALUATION:
- Response A: <your critique>
- Response B: <your critique>
- Response C: <your critique>

FINAL RANKING:
1. <best response label>
2. <second best>
3. <third best>
"""

CHAIRMAN_SYSTEM = """\
You are the Chairman of the Blue Everest Marketing Council. You have received
multiple opinions from council members on a marketing question, along with
anonymous peer reviews and aggregate rankings.

Your job is to synthesize the best final answer by:
1. Taking the strongest elements from the highest-ranked responses
2. Incorporating valid criticisms from the peer reviews
3. Resolving any contradictions between responses
4. Adding your own strategic judgment where needed

The final output should be superior to any individual response. Be concrete,
actionable, and specific to Blue Everest / Panglao Prime Villas.

Output your synthesis directly as the final deliverable.
"""


def parse_ranking(text: str, expected_labels: list[str]) -> list[str] | None:
    """Parse a FINAL RANKING block from peer review text. Hardened parser."""
    block = re.split(r"FINAL RANKING:", text, flags=re.IGNORECASE)
    if len(block) < 2:
        return _fallback_parse(text, expected_labels)

    ranking_text = block[1]
    lines = [line.strip() for line in ranking_text.split("\n") if line.strip()]
    ordered: list[str] = []

    for line in lines:
        match = re.match(r"^\d+[\.\)]\s*(Response\s+[A-Z])", line, re.IGNORECASE)
        if match:
            label = re.sub(r"\s+", " ", match.group(1)).strip()
            # Normalize to "Response X"
            label = f"Response {label[-1].upper()}"
            ordered.append(label)
        if len(ordered) == len(expected_labels):
            break

    if len(ordered) != len(expected_labels):
        return _fallback_parse(text, expected_labels)

    return ordered


def _fallback_parse(text: str, expected_labels: list[str]) -> list[str] | None:
    """Fallback: find Response X mentions in order, take first N unique."""
    seen: set[str] = set()
    out: list[str] = []
    for match in re.finditer(r"Response\s+([A-Z])", text, re.IGNORECASE):
        key = f"Response {match.group(1).upper()}"
        if key not in seen:
            seen.add(key)
            out.append(key)
        if len(out) == len(expected_labels):
            break
    return out if len(out) == len(expected_labels) else None


def _compute_aggregate_rankings(
    reviews: list[dict], labels: list[str]
) -> dict[str, dict]:
    """Compute average rank position and vote counts across all reviewers."""
    rank_sums: dict[str, float] = {label: 0.0 for label in labels}
    rank_counts: dict[str, int] = {label: 0 for label in labels}
    first_votes: dict[str, int] = {label: 0 for label in labels}
    last_votes: dict[str, int] = {label: 0 for label in labels}

    for review in reviews:
        ranking = review.get("ranking")
        if not ranking:
            continue
        for position, label in enumerate(ranking):
            if label in rank_sums:
                rank_sums[label] += position + 1  # 1-indexed
                rank_counts[label] += 1
                if position == 0:
                    first_votes[label] += 1
                if position == len(ranking) - 1:
                    last_votes[label] += 1

    result: dict[str, dict] = {}
    for label in labels:
        count = rank_counts[label]
        result[label] = {
            "avg_rank": round(rank_sums[label] / count, 2) if count > 0 else 0,
            "votes_first": first_votes[label],
            "votes_last": last_votes[label],
        }

    return result


def gather_opinions(state: CouncilState) -> CouncilState:
    """Stage 1: Each council member produces an independent response."""
    query = state["query"]
    system_prompt = state.get("system_prompt") or (
        "You are a marketing strategy advisor for Blue Everest Asset Group "
        "Holding Inc., working on the Panglao Prime Villas luxury investment "
        "property campaign in Bohol, Philippines. Provide specific, actionable "
        "advice grounded in the Philippine and Israeli real estate markets."
    )

    responses: list[dict] = []
    total_cost = 0.0

    for member in _COUNCIL_MEMBERS:
        model = _get_model(member["id"])
        start = time.time()

        try:
            result = model.invoke([
                SystemMessage(content=(
                    f"{system_prompt}\n\n"
                    f"Your particular strengths: {member['strengths']}. "
                    "Lean into these strengths in your response."
                )),
                HumanMessage(content=query),
            ])
            latency_ms = int((time.time() - start) * 1000)

            response_text = result.content
            # Estimate cost (rough: $3/M input, $15/M output for Sonnet-class)
            tokens_in = len(query) // 4 + len(system_prompt) // 4
            tokens_out = len(response_text) // 4
            cost = (tokens_in * 3 + tokens_out * 15) / 1_000_000

            responses.append({
                "model_id": member["id"],
                "label": member["label"],
                "response": response_text,
                "tokens_in": tokens_in,
                "tokens_out": tokens_out,
                "cost_usd": round(cost, 4),
                "latency_ms": latency_ms,
                "stage": "first_opinion",
            })
            total_cost += cost

        except Exception as e:
            responses.append({
                "model_id": member["id"],
                "label": member["label"],
                "response": f"[ERROR] Model {member['id']} failed: {e!s}",
                "tokens_in": 0,
                "tokens_out": 0,
                "cost_usd": 0,
                "latency_ms": int((time.time() - start) * 1000),
                "stage": "first_opinion",
                "error": str(e),
            })

    return {
        **state,
        "responses": responses,
        "total_cost": total_cost,
    }


def peer_review(state: CouncilState) -> CouncilState:
    """Stage 2: Each member reviews the others' responses anonymously."""
    responses = state.get("responses", [])
    labels = [r["label"] for r in responses]

    # Build the anonymized response block
    anon_block = "\n\n---\n\n".join(
        f"## {r['label']}\n\n{r['response']}" for r in responses
    )

    reviews: list[dict] = []
    total_cost = state.get("total_cost", 0.0)

    for member in _COUNCIL_MEMBERS:
        # Each reviewer sees all responses but does not know which is theirs
        model = _get_model(member["id"])
        start = time.time()

        try:
            result = model.invoke([
                SystemMessage(content=PEER_REVIEW_SYSTEM),
                HumanMessage(content=(
                    f"Original question: {state['query']}\n\n"
                    f"Responses to review:\n\n{anon_block}"
                )),
            ])
            latency_ms = int((time.time() - start) * 1000)

            review_text = result.content
            ranking = parse_ranking(review_text, labels)

            tokens_in = len(anon_block) // 4
            tokens_out = len(review_text) // 4
            cost = (tokens_in * 3 + tokens_out * 15) / 1_000_000

            reviews.append({
                "reviewer_id": member["id"],
                "review": review_text,
                "ranking": ranking,
                "tokens_in": tokens_in,
                "tokens_out": tokens_out,
                "cost_usd": round(cost, 4),
                "latency_ms": latency_ms,
                "stage": "peer_review",
            })
            total_cost += cost

        except Exception as e:
            reviews.append({
                "reviewer_id": member["id"],
                "review": f"[ERROR] Reviewer {member['id']} failed: {e!s}",
                "ranking": None,
                "cost_usd": 0,
                "latency_ms": int((time.time() - start) * 1000),
                "stage": "peer_review",
                "error": str(e),
            })

    # Compute aggregate rankings
    aggregate = _compute_aggregate_rankings(reviews, labels)

    return {
        **state,
        "peer_reviews": reviews,
        "rankings": aggregate,
        "total_cost": total_cost,
    }


def synthesize(state: CouncilState) -> CouncilState:
    """Stage 3: Chairman synthesizes the best final answer."""
    responses = state.get("responses", [])
    reviews = state.get("peer_reviews", [])
    rankings = state.get("rankings", {})

    # Build context for the chairman
    opinions_block = "\n\n---\n\n".join(
        f"## {r.get('label', r['model_id'])} (Model: {r['model_id']})\n\n{r['response']}"
        for r in responses
    )

    reviews_block = "\n\n---\n\n".join(
        f"## Review by {rev['reviewer_id']}\n\n{rev['review']}"
        for rev in reviews
    )

    rankings_block = "\n".join(
        f"- {label}: avg rank {data['avg_rank']}, "
        f"first-place votes: {data['votes_first']}, "
        f"last-place votes: {data['votes_last']}"
        for label, data in rankings.items()
    ) if rankings else "No rankings available."

    chairman = _chairman_model()
    start = time.time()

    result = chairman.invoke([
        SystemMessage(content=CHAIRMAN_SYSTEM),
        HumanMessage(content=(
            f"ORIGINAL QUERY:\n{state['query']}\n\n"
            f"COUNCIL OPINIONS:\n{opinions_block}\n\n"
            f"AGGREGATE RANKINGS:\n{rankings_block}\n\n"
            f"PEER REVIEWS:\n{reviews_block}"
        )),
    ])

    latency_ms = int((time.time() - start) * 1000)
    synthesis_text = result.content

    tokens_out = len(synthesis_text) // 4
    cost = tokens_out * 15 / 1_000_000
    total_cost = state.get("total_cost", 0.0) + cost

    return {
        **state,
        "synthesis": synthesis_text,
        "total_cost": round(total_cost, 4),
    }


def build_council_graph():
    """Build and compile the council deliberation graph."""
    graph = StateGraph(CouncilState)

    graph.add_node("opinions", gather_opinions)
    graph.add_node("review", peer_review)
    graph.add_node("synthesize", synthesize)

    graph.set_entry_point("opinions")
    graph.add_edge("opinions", "review")
    graph.add_edge("review", "synthesize")
    graph.add_edge("synthesize", END)

    return graph.compile()
