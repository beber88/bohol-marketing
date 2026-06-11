#!/usr/bin/env python3
"""
lead_scorer.py - Automated lead qualification scoring
Scores leads based on engagement, investment amount, timeline, and fit.
Runs daily or on-demand. Outputs lead_scores.json.

Scoring criteria:
- Initial inquiry (5 pts)
- Email opens (2 pts each)
- Document downloads (3 pts each)
- Virtual tour viewed (10 pts)
- Site visit requested (15 pts)
- Financing qualified (10 pts)
- Investment timeline urgent (20 pts)
- Location match (Palestinian/Israeli: 5 pts, Philippine: 3 pts)
- Objections addressed (5 pts)
- Ready to close signal (30 pts)

Output: Leads scored 0-100+
- 70+: Hot lead → Sales focus
- 40-69: Warm lead → Nurture sequence
- <40: Cold lead → Email automation
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_FILE = DATA_DIR / "lead_scores.jsonl"

# Sample lead data (would come from HubSpot/CRM in production)
SAMPLE_LEADS = [
    {
        "id": "lead_001",
        "name": "Raj K.",
        "email": "raj@example.com",
        "country": "India",
        "events": [
            {"type": "email_open", "date": "2026-04-14", "subject": "Welcome"},
            {"type": "email_open", "date": "2026-04-14", "subject": "Prospectus"},
            {"type": "document_download", "date": "2026-04-14", "file": "prospectus"},
            {"type": "virtual_tour_view", "date": "2026-04-14", "duration": 1200},
            {"type": "site_visit_request", "date": "2026-04-15", "preferred_date": "2026-04-20"},
            {"type": "financing_inquiry", "date": "2026-04-15"},
        ],
        "last_contact": "2026-04-15",
        "investment_amount": 28000000,
        "timeline": "2026-04-30",  # ASAP - within 30 days
        "next_action": "Call scheduled"
    },
    {
        "id": "lead_002",
        "name": "Marcus C.",
        "email": "marcus@example.com",
        "country": "Philippines",
        "events": [
            {"type": "email_open", "date": "2026-04-14", "subject": "Welcome"},
        ],
        "last_contact": "2026-04-14",
        "investment_amount": None,
        "timeline": None,
        "next_action": None
    }
]

def calculate_lead_score(lead):
    """Calculate qualification score for a lead."""
    score = 0
    metadata = {}

    # Base: inquiry made
    score += 5
    metadata["inquiry"] = 5

    # Email engagement
    email_opens = sum(1 for e in lead["events"] if e["type"] == "email_open")
    email_score = min(email_opens * 2, 20)
    score += email_score
    metadata["email_opens"] = email_score

    # Document engagement
    doc_downloads = sum(1 for e in lead["events"] if e["type"] == "document_download")
    doc_score = doc_downloads * 3
    score += doc_score
    metadata["doc_downloads"] = doc_score

    # Virtual tour
    if any(e["type"] == "virtual_tour_view" for e in lead["events"]):
        score += 10
        metadata["virtual_tour"] = 10

    # Site visit interest
    if any(e["type"] == "site_visit_request" for e in lead["events"]):
        score += 15
        metadata["site_visit"] = 15

    # Financing inquiry
    if any(e["type"] == "financing_inquiry" for e in lead["events"]):
        score += 10
        metadata["financing"] = 10

    # Timeline urgency
    if lead["timeline"]:
        timeline_date = datetime.strptime(lead["timeline"], "%Y-%m-%d")
        days_until = (timeline_date - datetime.now()).days
        if days_until <= 30:
            score += 20
            metadata["urgency"] = 20

    # Geographic fit
    if lead["country"] in ["Israel", "Palestine", "India"]:
        score += 5
        metadata["geo_fit"] = 5
    elif lead["country"] == "Philippines":
        score += 3
        metadata["geo_fit"] = 3

    # Investment amount clarity
    if lead["investment_amount"]:
        score += 8
        metadata["investment_clarity"] = 8

    # Recency bonus
    last_contact = datetime.strptime(lead["last_contact"], "%Y-%m-%d")
    days_ago = (datetime.now() - last_contact).days
    if days_ago <= 2:
        score += 5
        metadata["recency"] = 5

    metadata["total_score"] = score
    metadata["calculated_at"] = datetime.now().isoformat()

    return score, metadata

def categorize_lead(score):
    """Categorize lead based on score."""
    if score >= 70:
        return "HOT"
    elif score >= 40:
        return "WARM"
    else:
        return "COLD"

def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("[LEAD_SCORER] Running lead scoring...")

    scored_leads = []

    for lead in SAMPLE_LEADS:
        score, metadata = calculate_lead_score(lead)
        category = categorize_lead(score)

        scored_lead = {
            "lead_id": lead["id"],
            "name": lead["name"],
            "email": lead["email"],
            "score": score,
            "category": category,
            "country": lead["country"],
            "investment_amount": lead["investment_amount"],
            "timeline": lead["timeline"],
            "last_contact": lead["last_contact"],
            "scoring_breakdown": metadata
        }

        scored_leads.append(scored_lead)

        print(f"[{category}] {lead['name']} ({lead['email']}): {score} pts")

    # Write output
    with open(OUTPUT_FILE, "w") as f:
        for lead in scored_leads:
            f.write(json.dumps(lead) + "\n")

    # Summary
    hot_count = sum(1 for l in scored_leads if l["category"] == "HOT")
    warm_count = sum(1 for l in scored_leads if l["category"] == "WARM")
    cold_count = sum(1 for l in scored_leads if l["category"] == "COLD")

    print(f"\n[SUMMARY] HOT: {hot_count} | WARM: {warm_count} | COLD: {cold_count}")
    print(f"[OUTPUT] Scores written to {OUTPUT_FILE}")

    return scored_leads

if __name__ == "__main__":
    main()
