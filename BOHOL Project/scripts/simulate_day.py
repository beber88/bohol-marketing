#!/usr/bin/env python3
"""
simulate_day.py - Simulate a full marketing day for Panglao Prime Villas.
Generates 8-15 leads, hourly activity blocks, and expected KPIs.
Output: /reports/simulation_day_01.md

Usage:
  python3 simulate_day.py
"""

import json
import random
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

# --- Config ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent
FX_FILE = PROJECT_ROOT / "config" / "fx_today.json"
REPORTS_DIR = PROJECT_ROOT / "reports"
SIMULATION = True  # Global simulation flag

# Seed for reproducibility (v2: different seed from v1 to show variance)
random.seed(2026)

# Timezone
PHT = timezone(timedelta(hours=8))
IST = timezone(timedelta(hours=3))  # Israel Standard Time (UTC+3 summer)

# --- FX Data ---
def load_fx():
    with open(FX_FILE, "r") as f:
        return json.load(f)

# --- Lead Generation Data ---
ISRAELI_NAMES = [
    ("דניאל כהן", "Daniel Cohen", "M", "Tel Aviv"),
    ("מיכל לוי", "Michal Levi", "F", "Herzliya"),
    ("אלון שמעוני", "Alon Shimoni", "M", "Ra'anana"),
    ("רונית ברק", "Ronit Barak", "F", "Netanya"),
    ("יוסי אברהם", "Yossi Avraham", "M", "Jerusalem"),
    ("נועה גולדשטיין", "Noa Goldstein", "F", "Haifa"),
    ("עמית דרור", "Amit Dror", "M", "Rehovot"),
    ("שירה כץ", "Shira Katz", "F", "Ramat Gan"),
]

FILIPINO_NAMES = [
    ("Marco Reyes", "M", "BGC, Makati"),
    ("Patricia Santos", "F", "Alabang"),
    ("Roberto Cruz", "M", "Makati CBD"),
    ("Maria Gonzales", "F", "Ortigas"),
    ("James Tan", "M", "Cebu City"),
    ("Angela Lim", "F", "BGC, Taguig"),
    ("Carlos Villanueva", "M", "San Juan"),
    ("Grace Hernandez", "F", "Quezon City"),
]

LEAD_SOURCES = {
    "IL": ["Meta Ad (Facebook IL)", "Meta Ad (Instagram IL)", "WhatsApp Direct", "Organic (primevilla.ph)"],
    "PH": ["Meta Ad (Facebook PH)", "Google Search", "Meta Ad (Instagram PH)", "WhatsApp Direct", "Organic (primevilla.ph)"],
}

PROFESSIONS_IL = ["Business Owner", "Real Estate Investor", "Tech CEO", "Attorney", "Physician", "Portfolio Manager"]
PROFESSIONS_PH = ["Business Owner", "C-Suite Executive", "OFW Returnee", "Real Estate Investor", "Physician", "Attorney"]

# Scoring rules from CRM-LEAD-SCORING.md
ACTIVITY_SCORES = {
    "visited_site": 10,
    "visited_site_2plus": 10,
    "time_on_site_2min": 10,
    "time_on_site_5min": 15,
    "clicked_roi_calc": 15,
    "downloaded_pdf": 20,
    "clicked_whatsapp_site": 30,
    "submitted_form": 40,
    "opened_email_1": 5,
    "clicked_email_1": 10,
    "whatsapp_first_msg": 30,
    "selected_investment_details": 20,
    "selected_schedule_call": 35,
    "asked_reservation_fee": 45,
    "country_priority": 10,
    "purpose_investment": 10,
    "budget_confirmed": 25,
}

# Campaign activities per hour block
CAMPAIGN_SCHEDULE = {
    # PHT hours
    0: {"activity": "Overnight: Google Search ads running (PH)", "campaigns": ["GOOGLE_PH"]},
    1: {"activity": "Overnight: Google Search ads running (PH)", "campaigns": ["GOOGLE_PH"]},
    2: {"activity": "Israel peak hours begin (20:00 IST = 02:00 PHT)", "campaigns": ["META_IL_AWARENESS", "META_IL_CONSIDERATION"]},
    3: {"activity": "Israel peak: Meta IL campaigns active", "campaigns": ["META_IL_AWARENESS", "META_IL_CONSIDERATION", "META_IL_CONVERSION"]},
    4: {"activity": "Israel peak ends (23:00 IST). WhatsApp IL responses.", "campaigns": ["META_IL_CONVERSION"]},
    5: {"activity": "Low activity. Overnight monitoring.", "campaigns": []},
    6: {"activity": "Low activity. Email queue processing.", "campaigns": []},
    7: {"activity": "Low activity. Pre-work check.", "campaigns": []},
    8: {"activity": "Morning: Daily ops checklist. Review overnight leads.", "campaigns": []},
    9: {"activity": "Morning: fx_rates.py runs. FX update. Sales agent briefing.", "campaigns": ["GOOGLE_PH"]},
    10: {"activity": "Morning: WhatsApp broadcast window (warm leads).", "campaigns": ["GOOGLE_PH", "WATI_BROADCAST"]},
    11: {"activity": "Midday: Google Search PH active. WhatsApp responses.", "campaigns": ["GOOGLE_PH"]},
    12: {"activity": "Midday: Brevo email sequence triggers for new leads.", "campaigns": ["GOOGLE_PH", "BREVO"]},
    13: {"activity": "Afternoon: Sales agent follow-ups. Pipeline review.", "campaigns": ["GOOGLE_PH"]},
    14: {"activity": "Afternoon: Sales calls with qualified leads.", "campaigns": ["GOOGLE_PH"]},
    15: {"activity": "Afternoon: Content review. Asset optimization.", "campaigns": ["GOOGLE_PH"]},
    16: {"activity": "Late afternoon: Google PH performance check.", "campaigns": ["GOOGLE_PH"]},
    17: {"activity": "Evening: Prepare for PH peak hours.", "campaigns": ["GOOGLE_PH"]},
    18: {"activity": "PH peak begins (6pm). Meta PH ads ramp up.", "campaigns": ["META_PH_AWARENESS", "GOOGLE_PH"]},
    19: {"activity": "PH peak: Meta PH campaigns fully active.", "campaigns": ["META_PH_AWARENESS", "META_PH_CONSIDERATION", "GOOGLE_PH"]},
    20: {"activity": "PH peak: Highest engagement window.", "campaigns": ["META_PH_AWARENESS", "META_PH_CONSIDERATION", "META_PH_CONVERSION", "GOOGLE_PH"]},
    21: {"activity": "PH peak: WhatsApp PH inquiries spike.", "campaigns": ["META_PH_CONSIDERATION", "META_PH_CONVERSION", "GOOGLE_PH"]},
    22: {"activity": "PH peak ends. Last WhatsApp responses.", "campaigns": ["META_PH_CONVERSION"]},
    23: {"activity": "End of day. Prepare overnight summary.", "campaigns": []},
}


def generate_lead(market, lead_id, fx):
    """Generate a single simulated lead with full profile and activity."""
    if market == "IL":
        name_data = random.choice(ISRAELI_NAMES)
        name_heb, name_eng, gender, city = name_data
        profession = random.choice(PROFESSIONS_IL)
        source = random.choice(LEAD_SOURCES["IL"])
        lang = "Hebrew"
        nationality = "Israeli"
    else:
        name_data = random.choice(FILIPINO_NAMES)
        name_eng, gender, city = name_data
        name_heb = None
        profession = random.choice(PROFESSIONS_PH)
        source = random.choice(LEAD_SOURCES["PH"])
        lang = "English"
        nationality = "Filipino"

    villa_interest = random.choice(["Villa C", "Villa D", "Both", "Undecided"])
    purpose = random.choice(["Investment", "Personal Use", "Both"])

    # Generate activity chain with REALISTIC probabilities
    # Day 1 leads: most are cold/warm, few are hot, very few are very hot
    activities = []
    score = 0

    # Everyone visits the site (that's how they became a lead)
    activities.append("Visited primevilla.ph")
    score += ACTIVITY_SCORES["visited_site"]

    # Country bonus for priority countries
    score += ACTIVITY_SCORES["country_priority"]

    # Time on site: most bounce quickly on Day 1
    if random.random() < 0.40:
        activities.append("Time on site: 2+ minutes")
        score += ACTIVITY_SCORES["time_on_site_2min"]

        # Only those who stayed 2+ min might stay 5+
        if random.random() < 0.25:
            activities.append("Time on site: 5+ minutes")
            score += ACTIVITY_SCORES["time_on_site_5min"]

    # Repeat visits: unlikely on Day 1 (no retargeting pool yet)
    if random.random() < 0.10:
        activities.append("Visited site 2+ times")
        score += ACTIVITY_SCORES["visited_site_2plus"]

    # ROI calculator: niche action, low probability Day 1
    if random.random() < 0.12:
        activities.append("Clicked ROI calculator")
        score += ACTIVITY_SCORES["clicked_roi_calc"]

    # PDF download: requires intent
    if random.random() < 0.15:
        activities.append("Downloaded investment PDF")
        score += ACTIVITY_SCORES["downloaded_pdf"]

    # Form submission: 8-12% of clicks convert to leads via form
    # But leads already exist, so this is whether they submitted the full form
    if random.random() < 0.20:
        activities.append("Submitted inquiry form")
        score += ACTIVITY_SCORES["submitted_form"]

    # WhatsApp: realistic 25-35% of leads initiate WA on Day 1
    if random.random() < 0.30:
        activities.append("Sent first WhatsApp message")
        score += ACTIVITY_SCORES["whatsapp_first_msg"]

        # Of those who message, 40-55% engage with the flow (WA response rate)
        if random.random() < 0.45:
            activities.append("Selected: Investment details (Flow 1.1)")
            score += ACTIVITY_SCORES["selected_investment_details"]

        # Schedule call: very few on Day 1
        if random.random() < 0.08:
            activities.append("Selected: Schedule a call (Flow 1.5)")
            score += ACTIVITY_SCORES["selected_schedule_call"]

        # Reservation fee question: extremely rare Day 1
        if random.random() < 0.03:
            activities.append("Asked about reservation fee")
            score += ACTIVITY_SCORES["asked_reservation_fee"]

    # Email: only if form was submitted (Brevo triggers on form)
    if "Submitted inquiry form" in activities and random.random() < 0.35:
        activities.append("Opened Email 1")
        score += ACTIVITY_SCORES["opened_email_1"]

        if random.random() < 0.30:
            activities.append("Clicked link in Email 1")
            score += ACTIVITY_SCORES["clicked_email_1"]

    # Purpose bonus
    if purpose == "Investment":
        score += ACTIVITY_SCORES["purpose_investment"]

    # Budget confirmed: almost never on Day 1
    if random.random() < 0.03:
        activities.append("Budget confirmed")
        score += ACTIVITY_SCORES["budget_confirmed"]

    # Determine status
    if score <= 30:
        status = "COLD"
    elif score <= 70:
        status = "WARM"
    elif score <= 120:
        status = "HOT"
    else:
        status = "VERY HOT"

    # Determine pipeline stage
    if status == "COLD":
        stage = "1 - New Lead"
    elif status == "WARM":
        stage = random.choice(["1 - New Lead", "2 - Contacted"])
    elif status == "HOT":
        stage = random.choice(["2 - Contacted", "3 - Qualified", "4 - Proposal Sent"])
    else:
        stage = random.choice(["4 - Proposal Sent", "5 - Reservation Discussed"])

    # Recommended action
    if status == "COLD":
        action = "Automated email sequence only. No manual contact."
    elif status == "WARM":
        action = "Sales agent reviews profile. Optional personal WhatsApp."
    elif status == "HOT":
        action = "Sales agent contacts within 2 hours. Priority."
    else:
        action = "Sales agent calls immediately. All hands on deck."

    # Arrival hour (PHT)
    if market == "IL":
        arrival_hour = random.choice([2, 3, 4, 9, 10])  # Israel peak = PHT 2-4am, or morning
    else:
        arrival_hour = random.choice([9, 10, 11, 18, 19, 20, 21])  # PH business + peak

    return {
        "id": f"SIM-{lead_id:03d}",
        "name": name_eng,
        "name_heb": name_heb,
        "gender": gender,
        "city": city,
        "nationality": nationality,
        "language": lang,
        "profession": profession,
        "source": source,
        "villa_interest": villa_interest,
        "purpose": purpose,
        "score": score,
        "status": status,
        "stage": stage,
        "activities": activities,
        "action": action,
        "arrival_hour": arrival_hour,
    }


def compute_kpis(leads, fx):
    """
    Compute expected KPIs using a realistic funnel model.

    Funnel: Budget -> Impressions -> Clicks (CTR) -> Leads (conv rate)
    Realistic Day 1 assumptions:
    - Meta CPM: $8-12 (niche luxury real estate)
    - Meta CTR: 1.5-2.5% (source: CAMPAIGN-ISRAEL.md target >2%, CAMPAIGN-PHILIPPINES.md >1.5%)
    - Click-to-lead conversion: 8-12%
    - Google Search CTR: 3-5% (high-intent keywords)
    - Google click-to-lead: 10-15%
    - WhatsApp response rate: 40-55% (of leads who initiated WA)
    - Email open rate: 30-40% (Day 1, first email only)
    """
    total_leads = len(leads)
    il_leads = [l for l in leads if l["nationality"] == "Israeli"]
    ph_leads = [l for l in leads if l["nationality"] == "Filipino"]

    hot_leads = [l for l in leads if l["status"] in ("HOT", "VERY HOT")]
    warm_leads = [l for l in leads if l["status"] == "WARM"]
    cold_leads = [l for l in leads if l["status"] == "COLD"]

    # Budget allocation
    meta_il_budget = 45.0
    meta_ph_budget = 33.0
    google_budget = 25.0
    daily_budget = meta_il_budget + meta_ph_budget + google_budget  # $103 total but capped at $80

    # Realistic funnel: Meta Israel
    il_cpm = random.uniform(9, 12)  # Cost per 1000 impressions
    il_impressions = int((meta_il_budget / il_cpm) * 1000)
    il_ctr = round(random.uniform(1.5, 2.5), 2)
    il_clicks = int(il_impressions * il_ctr / 100)
    il_conv_rate = random.uniform(0.08, 0.12)
    il_expected_leads = max(1, int(il_clicks * il_conv_rate))
    il_cpl = round(meta_il_budget / max(il_expected_leads, 1), 2)

    # Realistic funnel: Meta Philippines
    ph_cpm = random.uniform(6, 10)  # PH CPM typically lower
    ph_impressions = int((meta_ph_budget / ph_cpm) * 1000)
    ph_ctr = round(random.uniform(1.3, 2.2), 2)
    ph_clicks = int(ph_impressions * ph_ctr / 100)
    ph_conv_rate = random.uniform(0.08, 0.12)
    ph_meta_leads = max(1, int(ph_clicks * ph_conv_rate))
    ph_meta_cpl = round(meta_ph_budget / max(ph_meta_leads, 1), 2)

    # Realistic funnel: Google Search PH
    google_cpc = random.uniform(1.5, 3.0)  # Cost per click for PH real estate
    google_clicks = int(google_budget / google_cpc)
    google_ctr = round(random.uniform(3.0, 5.0), 2)
    google_conv_rate = random.uniform(0.10, 0.15)
    google_leads = max(0, int(google_clicks * google_conv_rate))
    google_cpl = round(google_budget / max(google_leads, 1), 2)

    # Overall CPL
    total_spend = meta_il_budget + meta_ph_budget + google_budget
    overall_cpl = round(total_spend / max(total_leads, 1), 2)

    # WhatsApp response rate: of leads who sent WA message, how many engaged with flow
    wa_initiators = [l for l in leads if any("Sent first WhatsApp" in a for a in l["activities"])]
    wa_engaged = [l for l in wa_initiators if any("Selected:" in a for a in l["activities"])]
    wa_response_rate = round(len(wa_engaged) / max(len(wa_initiators), 1) * 100, 1)
    wa_initiation_rate = round(len(wa_initiators) / max(total_leads, 1) * 100, 1)

    # Email open rate: only for leads who got Email 1 (form submitters)
    form_submitters = [l for l in leads if any("Submitted inquiry form" in a for a in l["activities"])]
    email_opens = [l for l in leads if any("Opened Email 1" in a for a in l["activities"])]
    email_open_rate = round(len(email_opens) / max(len(form_submitters), 1) * 100, 1) if form_submitters else 0.0

    # Score distribution
    scores = [l["score"] for l in leads]
    avg_score = round(sum(scores) / max(len(scores), 1), 1)

    return {
        "total_leads": total_leads,
        "il_leads": len(il_leads),
        "ph_leads": len(ph_leads),
        "hot_leads": len(hot_leads),
        "warm_leads": len(warm_leads),
        "cold_leads": len(cold_leads),
        "daily_budget_usd": 80.0,  # Actual daily cap
        "meta_il_budget": meta_il_budget,
        "meta_ph_budget": meta_ph_budget,
        "google_budget": google_budget,
        # Funnel metrics
        "il_impressions": il_impressions,
        "il_clicks": il_clicks,
        "il_ctr_pct": il_ctr,
        "il_cpl_usd": il_cpl,
        "il_expected_leads": il_expected_leads,
        "ph_impressions": ph_impressions,
        "ph_clicks": ph_clicks,
        "ph_ctr_pct": ph_ctr,
        "ph_meta_cpl_usd": ph_meta_cpl,
        "ph_meta_leads": ph_meta_leads,
        "google_clicks": google_clicks,
        "google_ctr_pct": google_ctr,
        "google_cpl_usd": google_cpl,
        "google_leads": google_leads,
        "overall_cpl_usd": overall_cpl,
        # Engagement
        "wa_initiation_rate_pct": wa_initiation_rate,
        "wa_response_rate_pct": wa_response_rate,
        "email_open_rate_pct": email_open_rate,
        "form_submitters": len(form_submitters),
        "avg_score": avg_score,
        "pipeline_stages": {
            "stage_1": len([l for l in leads if "1 -" in l["stage"]]),
            "stage_2": len([l for l in leads if "2 -" in l["stage"]]),
            "stage_3": len([l for l in leads if "3 -" in l["stage"]]),
            "stage_4": len([l for l in leads if "4 -" in l["stage"]]),
            "stage_5": len([l for l in leads if "5 -" in l["stage"]]),
        },
    }


def generate_report(leads, kpis, fx):
    """Generate the simulation day report as markdown."""
    now = datetime.now(PHT)
    date_str = now.strftime("%Y-%m-%d")

    lines = []
    lines.append("# SIMULATION DAY REPORT - Day 01")
    lines.append(f"# Date: {date_str}")
    lines.append("# Mode: SIMULATION (no real spend, no live campaigns)")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Summary
    lines.append("## EXECUTIVE SUMMARY")
    lines.append("")
    lines.append(f"- **Total simulated leads:** {kpis['total_leads']}")
    lines.append(f"- **Israeli leads:** {kpis['il_leads']}")
    lines.append(f"- **Filipino leads:** {kpis['ph_leads']}")
    lines.append(f"- **HOT leads (score 71+):** {kpis['hot_leads']}")
    lines.append(f"- **WARM leads (31-70):** {kpis['warm_leads']}")
    lines.append(f"- **COLD leads (0-30):** {kpis['cold_leads']}")
    lines.append(f"- **Average lead score:** {kpis['avg_score']}")
    lines.append(f"- **Simulated daily budget:** ${kpis['daily_budget_usd']}")
    lines.append(f"- **Overall CPL:** ${kpis['overall_cpl_usd']}")
    lines.append("")

    # Funnel model
    lines.append("## FUNNEL MODEL (Realistic Day 1)")
    lines.append("")
    lines.append("### Meta Israel ($45/day)")
    lines.append(f"- Impressions: {kpis['il_impressions']:,}")
    lines.append(f"- CTR: {kpis['il_ctr_pct']}% -> Clicks: {kpis['il_clicks']}")
    lines.append(f"- Click-to-lead: 8-12% -> Expected leads: {kpis['il_expected_leads']}")
    lines.append(f"- CPL: ${kpis['il_cpl_usd']}")
    lines.append("")
    lines.append("### Meta Philippines ($33/day)")
    lines.append(f"- Impressions: {kpis['ph_impressions']:,}")
    lines.append(f"- CTR: {kpis['ph_ctr_pct']}% -> Clicks: {kpis['ph_clicks']}")
    lines.append(f"- Click-to-lead: 8-12% -> Expected leads: {kpis['ph_meta_leads']}")
    lines.append(f"- CPL: ${kpis['ph_meta_cpl_usd']}")
    lines.append("")
    lines.append("### Google Search PH ($25/day)")
    lines.append(f"- Clicks: {kpis['google_clicks']}")
    lines.append(f"- CTR: {kpis['google_ctr_pct']}%")
    lines.append(f"- Click-to-lead: 10-15% -> Expected leads: {kpis['google_leads']}")
    lines.append(f"- CPL: ${kpis['google_cpl_usd']}")
    lines.append("")

    # KPIs
    lines.append("## EXPECTED KPIs")
    lines.append("")
    lines.append("| Metric | Israel | Philippines | Target |")
    lines.append("|---|---|---|---|")
    lines.append(f"| CPL | ${kpis['il_cpl_usd']} | ${kpis['ph_meta_cpl_usd']} (Meta) / ${kpis['google_cpl_usd']} (Google) | IL <$40, PH <$35 |")
    lines.append(f"| CTR (Meta) | {kpis['il_ctr_pct']}% | {kpis['ph_ctr_pct']}% | IL >2%, PH >1.5% |")
    lines.append(f"| CTR (Google) | n/a | {kpis['google_ctr_pct']}% | >3% |")
    lines.append(f"| WA initiation | {kpis['wa_initiation_rate_pct']}% of leads | {kpis['wa_initiation_rate_pct']}% of leads | - |")
    lines.append(f"| WA response (of initiators) | {kpis['wa_response_rate_pct']}% | {kpis['wa_response_rate_pct']}% | IL >50%, PH >45% |")
    lines.append(f"| Email open (of form submitters) | {kpis['email_open_rate_pct']}% | {kpis['email_open_rate_pct']}% | >35% |")
    lines.append(f"| Form submissions | {kpis['form_submitters']} of {kpis['total_leads']} leads | - | - |")
    lines.append("")

    # Pipeline
    lines.append("## PIPELINE DISTRIBUTION")
    lines.append("")
    lines.append("| Stage | Count |")
    lines.append("|---|---|")
    for stage, count in kpis["pipeline_stages"].items():
        stage_name = stage.replace("stage_", "Stage ")
        lines.append(f"| {stage_name} | {count} |")
    lines.append("")

    # FX rates used
    lines.append("## FX RATES (Simulation)")
    lines.append("")
    lines.append(f"- Date: {fx['date']}")
    lines.append(f"- PHP-ILS: {fx['php_to_ils']} ({fx['source_ils']})")
    lines.append(f"- PHP-USD: {fx['php_to_usd']} ({fx['source_usd']})")
    lines.append(f"- Villa D: PHP {fx['villa_d_php']:,} = ILS {fx['villa_d_ils']:,} = USD {fx['villa_d_usd']:,}")
    lines.append(f"- Villa C: PHP {fx['villa_c_php']:,} = ILS {fx['villa_c_ils']:,} = USD {fx['villa_c_usd']:,}")
    lines.append("")

    # Hour by hour
    lines.append("---")
    lines.append("")
    lines.append("## HOUR-BY-HOUR ACTIVITY LOG")
    lines.append("")

    for hour in range(24):
        sched = CAMPAIGN_SCHEDULE[hour]
        hour_leads = [l for l in leads if l["arrival_hour"] == hour]
        campaigns_str = ", ".join(sched["campaigns"]) if sched["campaigns"] else "None"

        lines.append(f"### {hour:02d}:00 PHT")
        lines.append(f"**Activity:** {sched['activity']}")
        lines.append(f"**Active campaigns:** {campaigns_str}")

        if hour_leads:
            lines.append(f"**New leads this hour:** {len(hour_leads)}")
            for lead in hour_leads:
                lines.append(f"- {lead['id']} | {lead['name']} | {lead['nationality']} | {lead['source']} | Score: {lead['score']} | {lead['status']}")
        else:
            lines.append("**New leads this hour:** 0")

        lines.append("")

    # Full lead profiles
    lines.append("---")
    lines.append("")
    lines.append("## FULL LEAD PROFILES")
    lines.append("")

    for lead in leads:
        lines.append(f"### {lead['id']} - {lead['name']}")
        if lead["name_heb"]:
            lines.append(f"**Hebrew name:** {lead['name_heb']}")
        lines.append(f"**Nationality:** {lead['nationality']} | **City:** {lead['city']}")
        lines.append(f"**Profession:** {lead['profession']}")
        lines.append(f"**Language:** {lead['language']}")
        lines.append(f"**Source:** {lead['source']}")
        lines.append(f"**Villa interest:** {lead['villa_interest']} | **Purpose:** {lead['purpose']}")
        lines.append(f"**Lead score:** {lead['score']} | **Status:** {lead['status']}")
        lines.append(f"**Pipeline stage:** {lead['stage']}")
        lines.append("")
        lines.append("**Activity chain:**")
        for act in lead["activities"]:
            lines.append(f"- {act}")
        lines.append("")
        lines.append(f"**Recommended action:** {lead['action']}")
        lines.append("")

    # Recommendations
    lines.append("---")
    lines.append("")
    lines.append("## OPTIMIZATION RECOMMENDATIONS")
    lines.append("")

    hot = [l for l in leads if l["status"] in ("HOT", "VERY HOT")]
    if hot:
        lines.append(f"1. **{len(hot)} HOT lead(s) detected.** Sales agent must contact within 2 hours of go-live.")
        for h in hot:
            lines.append(f"   - {h['id']} {h['name']} ({h['nationality']}, score {h['score']}): {h['action']}")
    else:
        lines.append("1. **No HOT leads in simulation.** This is expected on Day 1. HOT leads typically emerge by Day 5-7.")

    lines.append("")
    lines.append(f"2. **WhatsApp engagement:** {kpis['wa_initiation_rate_pct']}% of leads initiated WhatsApp. Of those, {kpis['wa_response_rate_pct']}% engaged with the flow. {'On target (>45%).' if kpis['wa_response_rate_pct'] >= 45 else 'Below target (<45%). Review WhatsApp CTA placement and welcome flow.'}")
    lines.append("")
    lines.append(f"3. **Email engagement:** {kpis['email_open_rate_pct']}% of form submitters ({kpis['form_submitters']}) opened Email 1. {'On target (>35%).' if kpis['email_open_rate_pct'] >= 35 else 'Below target (<35%). Test alternate subject lines.'}")
    lines.append("")

    if kpis["il_ctr_pct"] < 2.0:
        lines.append("4. **Israel CTR below 2% target.** Consider testing ROI-07 or ROI-08 hooks from MASTER-HOOKS.md.")
    else:
        lines.append(f"4. **Israel CTR at {kpis['il_ctr_pct']}%.** On target (>2%). Monitor for 3 days before scaling.")

    lines.append("")

    if kpis["ph_ctr_pct"] < 1.5:
        lines.append("5. **Philippines CTR below 1.5% target.** Test Tagalog variant or LIFE-03/SCAR-05 hooks.")
    else:
        lines.append(f"5. **Philippines CTR at {kpis['ph_ctr_pct']}%.** On target (>1.5%). Continue current creative.")

    lines.append("")
    lines.append("6. **Budget pacing:** $80/day simulated. On track for $2,400/30 days.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## NEXT STEPS")
    lines.append("")
    lines.append("1. Campaign owner reviews this simulation report")
    lines.append("2. Campaign owner reviews all assets in /assets/ads/")
    lines.append("3. Campaign owner approves budget and go-live date")
    lines.append("4. Upon approval: remove SIMULATION tags, begin Day 1 of 30_DAY_PLAN.md")
    lines.append("")
    lines.append("---")
    lines.append("*Generated by simulate_day.py | SIMULATION MODE | Not real data*")

    return "\n".join(lines)


def main():
    fx = load_fx()

    print("[SIM] Generating simulated marketing day...")
    print(f"[SIM] SIMULATION = {SIMULATION}")
    print(f"[SIM] FX date: {fx['date']}")

    # Realistic Day 1 lead count:
    # Meta IL $45/day at ~$10 CPM = ~4500 impressions, 2% CTR = 90 clicks, 10% conv = ~4-5 leads
    # Meta PH $33/day at ~$8 CPM = ~4125 impressions, 1.8% CTR = 74 clicks, 10% conv = ~3-4 leads
    # Google PH $25/day at ~$2 CPC = ~12 clicks, 12% conv = ~1-2 leads
    # Total expected: 8-11 leads on Day 1
    num_leads = random.randint(8, 11)
    num_il = random.randint(3, min(5, num_leads - 2))  # 3-5 Israeli
    num_ph = num_leads - num_il  # remainder Filipino

    leads = []
    lead_id = 1

    for _ in range(num_il):
        leads.append(generate_lead("IL", lead_id, fx))
        lead_id += 1

    for _ in range(num_ph):
        leads.append(generate_lead("PH", lead_id, fx))
        lead_id += 1

    # Sort by arrival hour
    leads.sort(key=lambda l: l["arrival_hour"])

    # Compute KPIs
    kpis = compute_kpis(leads, fx)

    # Generate report
    report = generate_report(leads, kpis, fx)

    # Write report
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report_file = REPORTS_DIR / "simulation_day_01_v2.md"
    with open(report_file, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"[SIM] Report written to {report_file}")
    print(f"[SIM] Total leads: {kpis['total_leads']} (IL: {kpis['il_leads']}, PH: {kpis['ph_leads']})")
    print(f"[SIM] HOT: {kpis['hot_leads']}, WARM: {kpis['warm_leads']}, COLD: {kpis['cold_leads']}")
    print(f"[SIM] Avg score: {kpis['avg_score']}")
    print(f"[SIM] CPL: ${kpis['overall_cpl_usd']}")


if __name__ == "__main__":
    main()
