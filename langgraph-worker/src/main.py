"""
FastAPI server exposing LangGraph workflows as HTTP endpoints
for the Blue Everest AI Marketing Department.
"""

from __future__ import annotations

import logging
import time
import traceback
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from src.graph.cmo_graph import build_cmo_graph
from src.graph.content_pipeline import build_content_pipeline
from src.graph.council import build_council_graph
from src.graph.lead_pipeline import build_lead_pipeline

logger = logging.getLogger("blue-everest-langgraph")
logging.basicConfig(level=logging.INFO)


# ---------------------------------------------------------------------------
# Graph singletons - compiled once at startup
# ---------------------------------------------------------------------------
_graphs: dict[str, Any] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Compile all graphs once at startup."""
    logger.info("Compiling LangGraph workflows...")
    _graphs["cmo"] = build_cmo_graph()
    _graphs["content"] = build_content_pipeline()
    _graphs["council"] = build_council_graph()
    _graphs["lead"] = build_lead_pipeline()
    logger.info("All graphs compiled successfully.")
    yield
    _graphs.clear()


app = FastAPI(
    title="Blue Everest LangGraph Worker",
    description=(
        "Multi-agent orchestration service for Blue Everest Asset Group "
        "marketing workflows. Provides CMO analysis, content generation "
        "with brand guard, multi-model council deliberation, and lead "
        "qualification pipelines."
    ),
    version="0.1.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class CMORequest(BaseModel):
    query: str = Field(..., description="The CEO's question or analysis request")
    metrics: dict | None = Field(None, description="Raw metrics data from ad platforms")
    leads_summary: dict | None = Field(None, description="Lead pipeline summary")
    campaign_status: dict | None = Field(None, description="Active campaign statuses")


class CMOResponse(BaseModel):
    final_output: dict | None
    escalations: list[str]
    elapsed_ms: int


class ContentRequest(BaseModel):
    brief: dict = Field(
        ...,
        description="Content brief with keys: type, market, channel, objective, tone, key_messages",
        examples=[{
            "type": "facebook_ad",
            "market": "israel",
            "channel": "facebook",
            "objective": "lead_generation",
            "tone": "professional",
            "key_messages": ["17-25% ROI", "verified Airbnb income"],
            "villa": "D",
        }],
    )


class ContentResponse(BaseModel):
    final_content: dict | None
    approved: bool
    revision_rounds: int
    elapsed_ms: int


class CouncilRequest(BaseModel):
    query: str = Field(..., description="The question for the council to deliberate")
    system_prompt: str | None = Field(
        None,
        description="Optional system prompt override for council members",
    )


class CouncilResponse(BaseModel):
    synthesis: str | None
    responses: list[dict]
    peer_reviews: list[dict]
    rankings: dict | None
    total_cost: float
    elapsed_ms: int


class LeadRequest(BaseModel):
    lead_data: dict = Field(
        ...,
        description="Lead information",
        examples=[{
            "name": "David Cohen",
            "email": "david@example.com",
            "phone": "+972501234567",
            "source": "facebook_ad",
            "country": "Israel",
            "budget": 1500000,
            "budget_currency": "ILS",
            "villa_interest": "Villa D",
            "message": "Interested in investment property, looking at 17% ROI",
            "timeline": "within 3 months",
        }],
    )


class LeadResponse(BaseModel):
    score: int
    status: str
    route: str | None
    nurture_sequence: str | None
    actions_taken: list[str]
    elapsed_ms: int


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.post("/cmo/analyze", response_model=CMOResponse)
async def cmo_analyze(req: CMORequest):
    """
    Run the CMO OODA loop: Observe -> Orient -> Decide -> Act.
    Returns strategic analysis, decisions, and sub-agent briefs.
    If escalations are detected, the loop stops before Act and returns
    items requiring CEO approval.
    """
    start = time.time()
    try:
        result = _graphs["cmo"].invoke({
            "query": req.query,
            "metrics": req.metrics,
            "leads_summary": req.leads_summary,
            "campaign_status": req.campaign_status,
            "cmo_analysis": None,
            "agent_briefs": None,
            "escalations": [],
            "final_output": None,
        })
        elapsed = int((time.time() - start) * 1000)
        return CMOResponse(
            final_output=result.get("final_output"),
            escalations=result.get("escalations", []),
            elapsed_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"CMO analysis failed: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"CMO analysis failed: {e!s}")


@app.post("/content/generate", response_model=ContentResponse)
async def content_generate(req: ContentRequest):
    """
    Generate marketing content through the content pipeline:
    Draft -> Brand Guard -> Revise (if needed) -> Approve/Reject.
    Content is checked against Blue Everest brand rules including
    forbidden words, required CTAs, currency rules, and market-specific
    requirements.
    """
    start = time.time()
    try:
        result = _graphs["content"].invoke({
            "brief": req.brief,
            "draft": None,
            "brand_guard_result": None,
            "revision_count": 0,
            "final_content": None,
            "approved": False,
        })
        elapsed = int((time.time() - start) * 1000)
        final = result.get("final_content") or {}
        return ContentResponse(
            final_content=result.get("final_content"),
            approved=result.get("approved", False),
            revision_rounds=final.get("revision_rounds", result.get("revision_count", 0)),
            elapsed_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"Content generation failed: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Content generation failed: {e!s}")


@app.post("/council/deliberate", response_model=CouncilResponse)
async def council_deliberate(req: CouncilRequest):
    """
    Run a full council deliberation: 3 models produce independent opinions,
    then anonymously peer-review each other, and a chairman synthesizes
    the final answer using aggregate rankings.
    """
    start = time.time()
    try:
        result = _graphs["council"].invoke({
            "query": req.query,
            "system_prompt": req.system_prompt,
            "responses": [],
            "peer_reviews": [],
            "rankings": None,
            "synthesis": None,
            "total_cost": 0.0,
        })
        elapsed = int((time.time() - start) * 1000)
        return CouncilResponse(
            synthesis=result.get("synthesis"),
            responses=result.get("responses", []),
            peer_reviews=result.get("peer_reviews", []),
            rankings=result.get("rankings"),
            total_cost=result.get("total_cost", 0.0),
            elapsed_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"Council deliberation failed: {e}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Council deliberation failed: {e!s}",
        )


@app.post("/lead/qualify", response_model=LeadResponse)
async def lead_qualify(req: LeadRequest):
    """
    Qualify an incoming lead: score based on budget/intent/timeline/source,
    route to sales or nurture, and trigger the appropriate follow-up sequence.
    """
    start = time.time()
    try:
        result = _graphs["lead"].invoke({
            "lead_data": req.lead_data,
            "score": 0,
            "status": "new",
            "route": None,
            "nurture_sequence": None,
            "actions_taken": [],
        })
        elapsed = int((time.time() - start) * 1000)
        return LeadResponse(
            score=result.get("score", 0),
            status=result.get("status", "unknown"),
            route=result.get("route"),
            nurture_sequence=result.get("nurture_sequence"),
            actions_taken=result.get("actions_taken", []),
            elapsed_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"Lead qualification failed: {e}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Lead qualification failed: {e!s}",
        )


@app.get("/health")
async def health():
    """Health check endpoint."""
    graphs_loaded = list(_graphs.keys())
    return {
        "status": "ok",
        "graphs_loaded": graphs_loaded,
        "graphs_count": len(graphs_loaded),
    }
