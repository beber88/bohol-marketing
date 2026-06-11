"""
Lead Qualification Pipeline - Score -> Route -> Nurture/Alert

Scores incoming leads based on their data, determines routing (hot lead
to sales, warm lead to nurture sequence, cold lead to monitoring), and
triggers the appropriate follow-up action.
"""

from __future__ import annotations

import json
from typing import Literal, TypedDict

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from src.config import ANTHROPIC_API_KEY, HAIKU_MODEL


class LeadState(TypedDict):
    lead_data: dict
    score: int
    status: str
    route: str | None
    nurture_sequence: str | None
    actions_taken: list[str]


_lead_llm = ChatAnthropic(
    model=HAIKU_MODEL,
    api_key=ANTHROPIC_API_KEY,
    max_tokens=1024,
    temperature=0.0,
)

SCORING_SYSTEM = """\
You are a lead scoring engine for Blue Everest Asset Group Holding Inc.,
selling Panglao Prime Villas luxury investment properties in Bohol, Philippines.

Score the lead from 0 to 100 based on these weighted criteria:

BUDGET FIT (0-30 points):
- Budget >= PHP 28M or >= 1,450,000 ILS: 30 points
- Budget >= PHP 15M or >= 750,000 ILS: 20 points
- Budget >= PHP 5M or >= 250,000 ILS: 10 points
- No budget info or budget < PHP 5M: 0 points

INTENT SIGNALS (0-25 points):
- Mentions reservation, contract, or payment: 25 points
- Asks about specific villa (C or D): 20 points
- Asks about ROI, rental income, or Airbnb: 15 points
- General inquiry about Bohol real estate: 10 points
- Vague interest: 5 points

TIMELINE (0-20 points):
- Ready to buy within 30 days: 20 points
- Within 3 months: 15 points
- Within 6 months: 10 points
- Exploring / no timeline: 5 points

SOURCE QUALITY (0-15 points):
- Direct referral: 15 points
- Facebook ad (targeted): 12 points
- Website form: 10 points
- WhatsApp inquiry: 10 points
- Facebook group post: 8 points
- Cold outreach: 3 points

MARKET BONUS (0-10 points):
- Israeli investor (proven market fit): 10 points
- Filipino with existing investment portfolio: 8 points
- OFW (overseas Filipino worker): 5 points
- Other: 2 points

Output valid JSON:
{
  "score": <0-100>,
  "breakdown": {
    "budget_fit": <0-30>,
    "intent_signals": <0-25>,
    "timeline": <0-20>,
    "source_quality": <0-15>,
    "market_bonus": <0-10>
  },
  "reasoning": "<brief explanation>"
}
"""

NURTURE_SYSTEM = """\
You are a lead nurture strategist for Blue Everest Asset Group Holding Inc.,
Panglao Prime Villas.

Based on the lead's profile and score, recommend the optimal nurture sequence.

Available sequences:
1. "hot_followup" - Immediate sales call + villa walkthrough video + reservation offer
2. "warm_education" - 5-email drip: market overview, ROI breakdown, villa tour,
   legal ownership guide, booking meeting CTA
3. "investor_nurture" - Weekly investment insights, quarterly market reports,
   new project announcements
4. "reactivation" - Monthly highlight email with updated pricing and availability
5. "disqualified" - No nurture, mark as unqualified

For the recommended sequence, also provide:
- Personalization notes (what to emphasize based on lead profile)
- Preferred channel (WhatsApp, email, or both)
- Timing recommendation (when to start, frequency)

Output valid JSON:
{
  "sequence": "<sequence_id>",
  "channel": "whatsapp" | "email" | "both",
  "personalization": "<notes>",
  "timing": "<recommendation>",
  "first_message_summary": "<what the first touchpoint should say>"
}
"""


def score_lead(state: LeadState) -> LeadState:
    """Score the lead based on their data using the scoring rubric."""
    lead_data = state["lead_data"]
    lead_json = json.dumps(lead_data, indent=2, ensure_ascii=False)

    response = _lead_llm.invoke([
        SystemMessage(content=SCORING_SYSTEM),
        HumanMessage(content=f"Score this lead:\n\n{lead_json}"),
    ])

    score = 0
    status = "new"

    try:
        text = response.content.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        parsed = json.loads(text)
        score = int(parsed.get("score", 0))
    except (json.JSONDecodeError, TypeError, ValueError):
        # If parsing fails, attempt to extract a number
        import re
        numbers = re.findall(r'"score"\s*:\s*(\d+)', response.content)
        if numbers:
            score = int(numbers[0])

    # Determine status based on score
    if score >= 70:
        status = "hot"
    elif score >= 40:
        status = "warm"
    elif score >= 20:
        status = "cold"
    else:
        status = "unqualified"

    return {
        **state,
        "score": score,
        "status": status,
        "actions_taken": [f"scored: {score} ({status})"],
    }


def determine_route(state: LeadState) -> LeadState:
    """Determine where to route the lead based on score and status."""
    score = state.get("score", 0)
    status = state.get("status", "new")
    lead_data = state.get("lead_data", {})

    # Routing logic
    if score >= 70:
        route = "sales_alert"
    elif score >= 40:
        route = "nurture"
    elif score >= 20:
        route = "monitor"
    else:
        route = "archive"

    # Override: if lead explicitly mentions reservation/contract, always alert sales
    lead_text = json.dumps(lead_data).lower()
    if any(kw in lead_text for kw in ["reservation", "contract", "ready to buy", "payment"]):
        route = "sales_alert"

    # Override: if budget exceeds PHP 20M, always alert sales
    budget = lead_data.get("budget", 0)
    if isinstance(budget, (int, float)) and budget >= 20_000_000:
        route = "sales_alert"

    actions = list(state.get("actions_taken", []))
    actions.append(f"routed: {route}")

    return {
        **state,
        "route": route,
        "actions_taken": actions,
    }


def trigger_nurture(state: LeadState) -> LeadState:
    """Select and configure the appropriate nurture sequence."""
    lead_data = state.get("lead_data", {})
    score = state.get("score", 0)
    route = state.get("route", "monitor")
    lead_json = json.dumps(lead_data, indent=2, ensure_ascii=False)

    response = _lead_llm.invoke([
        SystemMessage(content=NURTURE_SYSTEM),
        HumanMessage(content=(
            f"Lead profile:\n{lead_json}\n\n"
            f"Lead score: {score}\n"
            f"Route: {route}\n\n"
            "Recommend the optimal nurture sequence for this lead."
        )),
    ])

    nurture_sequence = None
    try:
        text = response.content.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        parsed = json.loads(text)
        nurture_sequence = parsed.get("sequence", "warm_education")
    except (json.JSONDecodeError, TypeError):
        # Default based on route
        if route == "sales_alert":
            nurture_sequence = "hot_followup"
        elif route == "nurture":
            nurture_sequence = "warm_education"
        elif route == "monitor":
            nurture_sequence = "investor_nurture"
        else:
            nurture_sequence = "disqualified"

    actions = list(state.get("actions_taken", []))
    actions.append(f"nurture_assigned: {nurture_sequence}")

    return {
        **state,
        "nurture_sequence": nurture_sequence,
        "actions_taken": actions,
    }


def alert_sales(state: LeadState) -> LeadState:
    """Prepare a sales alert for hot leads."""
    lead_data = state.get("lead_data", {})
    score = state.get("score", 0)
    name = lead_data.get("name", "Unknown")
    phone = lead_data.get("phone", "N/A")
    email = lead_data.get("email", "N/A")
    source = lead_data.get("source", "unknown")
    budget = lead_data.get("budget", "not specified")

    actions = list(state.get("actions_taken", []))
    actions.append(
        f"sales_alert_prepared: {name} (score={score}, source={source}, "
        f"budget={budget}, phone={phone}, email={email})"
    )

    return {
        **state,
        "nurture_sequence": "hot_followup",
        "actions_taken": actions,
    }


def monitor_lead(state: LeadState) -> LeadState:
    """Place the lead in monitoring/passive tracking."""
    actions = list(state.get("actions_taken", []))
    actions.append("placed_in_monitoring: will check again in 7 days")

    return {
        **state,
        "nurture_sequence": "investor_nurture",
        "actions_taken": actions,
    }


def should_alert(state: LeadState) -> Literal["alert_sales", "nurture", "monitor"]:
    """Conditional edge: determine next step based on route."""
    route = state.get("route", "monitor")

    if route == "sales_alert":
        return "alert_sales"
    elif route in ("nurture", "archive"):
        return "nurture"
    else:
        return "monitor"


def build_lead_pipeline():
    """Build and compile the lead qualification pipeline graph."""
    graph = StateGraph(LeadState)

    graph.add_node("score", score_lead)
    graph.add_node("route", determine_route)
    graph.add_node("alert_sales", alert_sales)
    graph.add_node("nurture", trigger_nurture)
    graph.add_node("monitor", monitor_lead)

    graph.set_entry_point("score")
    graph.add_edge("score", "route")
    graph.add_conditional_edges(
        "route",
        should_alert,
        {
            "alert_sales": "alert_sales",
            "nurture": "nurture",
            "monitor": "monitor",
        },
    )
    graph.add_edge("alert_sales", END)
    graph.add_edge("nurture", END)
    graph.add_edge("monitor", END)

    return graph.compile()
