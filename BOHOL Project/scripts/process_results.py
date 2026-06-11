#!/usr/bin/env python3
"""
process_results.py - End-of-day processor

Reads Cowork's completed results from _completed/YYYY-MM-DD/,
aggregates metrics, runs lead scoring, generates optimization
decisions, updates campaign state, and writes the daily report.

Usage:
    python3 scripts/process_results.py              # process today
    python3 scripts/process_results.py --date 2026-04-16
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
COMPLETED_DIR = PROJECT_ROOT / "_completed"
STATUS_DIR = PROJECT_ROOT / "_status"
QUEUE_DIR = PROJECT_ROOT / "_queue"
REPORTS_DIR = PROJECT_ROOT / "reports"
STATE_FILE = STATUS_DIR / "campaign_state.json"

# Phase definitions by day number
PHASES = [
    (1, 3, "SETUP"),
    (4, 7, "AWARENESS"),
    (8, 14, "CONSIDERATION"),
    (15, 21, "CONVERSION"),
    (22, 28, "CLOSE_PUSH"),
    (29, 30, "FINAL"),
]


def get_phase(day):
    """Return phase name for a given campaign day."""
    for start, end, name in PHASES:
        if start <= day <= end:
            return name
    if day < 1:
        return "PRE_LAUNCH"
    return "FINAL"


def parse_date_arg():
    """Parse --date argument or default to today."""
    target = datetime.now().strftime("%Y-%m-%d")
    args = sys.argv[1:]
    if "--date" in args:
        idx = args.index("--date")
        if idx + 1 < len(args):
            target = args[idx + 1]
    return target


def load_json(path):
    """Load a JSON file, return None if missing or invalid."""
    if not path.exists():
        return None
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return None


def load_text(path):
    """Load a text file, return None if missing."""
    if not path.exists():
        return None
    try:
        with open(path, "r") as f:
            return f.read()
    except IOError:
        return None


def load_campaign_state():
    """Load current campaign state."""
    state = load_json(STATE_FILE)
    if state is None:
        state = {
            "campaign_day": 0,
            "phase": "PRE_LAUNCH",
            "simulation": True,
            "go_live_date": None,
            "start_date": None,
            "total_days": 30,
            "total_budget": 2400,
            "spent_to_date": 0,
            "active_campaigns": [],
            "platforms": {},
            "last_updated": datetime.now().isoformat(),
        }
    return state


def save_campaign_state(state):
    """Save updated campaign state."""
    STATUS_DIR.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def aggregate_metrics(ads, email, whatsapp, leads, content):
    """Aggregate all source metrics into a single summary dict."""
    summary = {
        "total_ad_spend": 0,
        "total_impressions": 0,
        "total_clicks": 0,
        "total_conversions": 0,
        "new_leads": 0,
        "qualified_leads": 0,
        "campaigns": {},
        "email": {},
        "whatsapp": {},
        "content": {},
    }

    if ads:
        for platform in ["meta_ads", "google_ads"]:
            pdata = ads.get(platform, {})
            summary["total_ad_spend"] += pdata.get("spend", 0)
            summary["total_impressions"] += pdata.get("impressions", 0)
            summary["total_clicks"] += pdata.get("clicks", 0)
            summary["total_conversions"] += pdata.get("conversions", 0)

            # Per-campaign details
            for cname, cdata in pdata.get("campaigns", {}).items():
                summary["campaigns"][cname] = {
                    "platform": platform,
                    "spend": cdata.get("spend", 0),
                    "impressions": cdata.get("impressions", 0),
                    "clicks": cdata.get("clicks", 0),
                    "conversions": cdata.get("conversions", 0),
                    "cpm": cdata.get("cpm", 0),
                    "ctr": cdata.get("ctr", 0),
                    "cpl": cdata.get("cpl", 0),
                }

    if email:
        summary["email"] = {
            "sent": email.get("sent", 0),
            "opens": email.get("opens", 0),
            "clicks": email.get("clicks", 0),
            "open_rate": email.get("open_rate", 0),
            "click_rate": email.get("click_rate", 0),
        }

    if whatsapp:
        summary["whatsapp"] = {
            "messages_sent": whatsapp.get("messages_sent", 0),
            "messages_received": whatsapp.get("messages_received", 0),
            "response_rate": whatsapp.get("response_rate", 0),
            "flows_triggered": whatsapp.get("flows_triggered", 0),
        }

    if leads:
        summary["new_leads"] = leads.get("total_new", 0)
        summary["qualified_leads"] = leads.get("qualified", 0)

    if content:
        summary["content"] = content

    return summary


def run_lead_scoring(leads_data):
    """Import and run lead scorer on new leads if available."""
    scored = []
    if not leads_data or not leads_data.get("leads"):
        return scored

    # Import lead_scorer from same scripts directory
    scripts_dir = Path(__file__).resolve().parent
    sys.path.insert(0, str(scripts_dir))
    try:
        from lead_scorer import calculate_lead_score, categorize_lead
        for lead in leads_data["leads"]:
            score, metadata = calculate_lead_score(lead)
            category = categorize_lead(score)
            scored.append({
                "lead_id": lead.get("id", "unknown"),
                "name": lead.get("name", "Unknown"),
                "score": score,
                "category": category,
                "breakdown": metadata,
            })
            print(f"  [{category}] {lead.get('name', 'Unknown')}: {score} pts")
    except ImportError:
        print("  [WARN] lead_scorer.py not importable, skipping scoring")
    except Exception as e:
        print(f"  [WARN] Lead scoring error: {e}")

    return scored


def generate_optimizations(summary):
    """Generate optimization recommendations based on thresholds."""
    optimizations = {
        "kill": [],
        "scale": [],
        "revise": [],
        "notes": [],
    }

    # Ad campaign thresholds
    for cname, cdata in summary.get("campaigns", {}).items():
        cpm = cdata.get("cpm", 0)
        ctr = cdata.get("ctr", 0)
        cpl = cdata.get("cpl", 0)
        spend = cdata.get("spend", 0)

        if cpm > 18:
            optimizations["kill"].append({
                "campaign": cname,
                "reason": f"CPM ${cpm:.2f} exceeds $18 threshold",
                "action": "KILL",
            })
        if ctr > 0 and ctr < 0.8:
            optimizations["kill"].append({
                "campaign": cname,
                "reason": f"CTR {ctr:.2f}% below 0.8% threshold",
                "action": "KILL",
            })
        if ctr > 3:
            optimizations["scale"].append({
                "campaign": cname,
                "reason": f"CTR {ctr:.2f}% above 3% - double budget",
                "action": "SCALE_2X",
            })
        if cpl > 0 and cpl < 30:
            optimizations["scale"].append({
                "campaign": cname,
                "reason": f"CPL ${cpl:.2f} below $30 - scale up",
                "action": "SCALE_2X",
            })

    # Email threshold
    email_open = summary.get("email", {}).get("open_rate", 0)
    if email_open > 0 and email_open < 25:
        optimizations["revise"].append({
            "channel": "email",
            "reason": f"Open rate {email_open:.1f}% below 25% threshold",
            "action": "CHANGE_SUBJECT_LINES",
        })

    # WhatsApp threshold
    wa_response = summary.get("whatsapp", {}).get("response_rate", 0)
    if wa_response > 0 and wa_response < 45:
        optimizations["revise"].append({
            "channel": "whatsapp",
            "reason": f"Response rate {wa_response:.1f}% below 45% threshold",
            "action": "REVISE_MESSAGES",
        })

    return optimizations


def update_campaign_state(state, summary, date_str):
    """Update campaign state with today's results."""
    state["campaign_day"] = state.get("campaign_day", 0) + 1
    state["phase"] = get_phase(state["campaign_day"])
    state["spent_to_date"] = state.get("spent_to_date", 0) + summary.get("total_ad_spend", 0)
    state["last_updated"] = datetime.now().isoformat()

    # Update active campaigns from today's data
    active = list(summary.get("campaigns", {}).keys())
    if active:
        state["active_campaigns"] = active

    return state


def write_daily_report(date_str, summary, optimizations, state, issues_text, scored_leads):
    """Write the daily report markdown file."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report_path = REPORTS_DIR / f"daily_report_{date_str}.md"

    day = state.get("campaign_day", 0)
    phase = state.get("phase", "UNKNOWN")
    budget = state.get("total_budget", 2400)
    spent = state.get("spent_to_date", 0)
    remaining = budget - spent

    lines = []
    lines.append(f"# Daily Report - {date_str}")
    lines.append(f"**Day {day} of 30 | Phase: {phase}**")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Budget
    lines.append("## Budget")
    lines.append(f"- Spent today: ${summary.get('total_ad_spend', 0):.2f}")
    lines.append(f"- Spent to date: ${spent:.2f}")
    lines.append(f"- Remaining: ${remaining:.2f}")
    days_left = max(30 - day, 1)
    lines.append(f"- Daily pace needed: ${remaining / days_left:.2f}/day")
    lines.append("")

    # Ad performance
    lines.append("## Ad Performance")
    lines.append(f"- Impressions: {summary.get('total_impressions', 0):,}")
    lines.append(f"- Clicks: {summary.get('total_clicks', 0):,}")
    lines.append(f"- Conversions: {summary.get('total_conversions', 0)}")
    if summary.get("total_clicks", 0) > 0:
        cpc = summary["total_ad_spend"] / summary["total_clicks"]
        lines.append(f"- Avg CPC: ${cpc:.3f}")
    lines.append("")

    # Per-campaign breakdown
    if summary.get("campaigns"):
        lines.append("### By Campaign")
        for cname, cdata in summary["campaigns"].items():
            lines.append(
                f"- **{cname}**: ${cdata.get('spend', 0):.0f} spend | "
                f"{cdata.get('clicks', 0)} clicks | "
                f"{cdata.get('conversions', 0)} conv | "
                f"CTR {cdata.get('ctr', 0):.2f}%"
            )
        lines.append("")

    # Email
    email = summary.get("email", {})
    if email.get("sent", 0) > 0:
        lines.append("## Email")
        lines.append(f"- Sent: {email['sent']:,}")
        lines.append(f"- Opens: {email.get('opens', 0):,} ({email.get('open_rate', 0):.1f}%)")
        lines.append(f"- Clicks: {email.get('clicks', 0)} ({email.get('click_rate', 0):.1f}%)")
        lines.append("")

    # WhatsApp
    wa = summary.get("whatsapp", {})
    if wa.get("messages_sent", 0) > 0:
        lines.append("## WhatsApp")
        lines.append(f"- Sent: {wa['messages_sent']}")
        lines.append(f"- Received: {wa.get('messages_received', 0)}")
        lines.append(f"- Response rate: {wa.get('response_rate', 0):.1f}%")
        lines.append("")

    # Leads
    if summary.get("new_leads", 0) > 0:
        lines.append("## Leads")
        lines.append(f"- New leads: {summary['new_leads']}")
        lines.append(f"- Qualified (70+): {summary.get('qualified_leads', 0)}")
        lines.append("")

    # Scored leads
    if scored_leads:
        lines.append("### Lead Scores")
        for sl in scored_leads:
            lines.append(f"- [{sl['category']}] {sl['name']}: {sl['score']} pts")
        lines.append("")

    # Optimizations
    has_opts = any(optimizations.get(k) for k in ["kill", "scale", "revise"])
    if has_opts:
        lines.append("## Optimization Decisions")
        for item in optimizations.get("kill", []):
            lines.append(f"- KILL **{item['campaign']}**: {item['reason']}")
        for item in optimizations.get("scale", []):
            lines.append(f"- SCALE **{item['campaign']}**: {item['reason']}")
        for item in optimizations.get("revise", []):
            lines.append(f"- REVISE **{item['channel']}**: {item['reason']}")
        lines.append("")

    # Issues
    if issues_text:
        lines.append("## Issues")
        lines.append(issues_text.strip())
        lines.append("")

    lines.append("---")
    lines.append(f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*")

    with open(report_path, "w") as f:
        f.write("\n".join(lines) + "\n")

    return report_path


def write_next_day_optimizations(date_str, optimizations):
    """Write optimizations.json for the next day's queue."""
    today = datetime.strptime(date_str, "%Y-%m-%d")
    tomorrow = today + timedelta(days=1)
    tomorrow_str = tomorrow.strftime("%Y-%m-%d")

    queue_dir = QUEUE_DIR / tomorrow_str
    queue_dir.mkdir(parents=True, exist_ok=True)

    opt_path = queue_dir / "optimizations.json"
    payload = {
        "generated_from": date_str,
        "target_date": tomorrow_str,
        "generated_at": datetime.now().isoformat(),
        "optimizations": optimizations,
    }

    with open(opt_path, "w") as f:
        json.dump(payload, f, indent=2)

    return opt_path


def main():
    date_str = parse_date_arg()
    print(f"[PROCESS_RESULTS] Processing results for {date_str}")

    # Check if completed results exist for this date
    day_dir = COMPLETED_DIR / date_str
    if not day_dir.exists():
        print(f"[INFO] No completed results found at {day_dir}")
        print(f"[INFO] Cowork has not run yet for {date_str}. Nothing to process.")
        sys.exit(0)

    # Load all result files
    print("[LOAD] Reading completed results...")
    ads = load_json(day_dir / "ads_metrics.json")
    email = load_json(day_dir / "email_metrics.json")
    whatsapp = load_json(day_dir / "whatsapp_metrics.json")
    leads = load_json(day_dir / "lead_updates.json")
    content = load_json(day_dir / "content_results.json")
    issues_text = load_text(day_dir / "issues.md")

    found = []
    if ads:
        found.append("ads_metrics")
    if email:
        found.append("email_metrics")
    if whatsapp:
        found.append("whatsapp_metrics")
    if leads:
        found.append("lead_updates")
    if content:
        found.append("content_results")
    if issues_text:
        found.append("issues")

    if not found:
        print(f"[WARN] Directory {day_dir} exists but contains no readable result files.")
        print("[INFO] Nothing to aggregate.")
        sys.exit(0)

    print(f"[LOAD] Found: {', '.join(found)}")

    # Aggregate metrics
    print("[AGGREGATE] Building daily summary...")
    summary = aggregate_metrics(ads, email, whatsapp, leads, content)
    print(f"  Ad spend: ${summary['total_ad_spend']:.2f}")
    print(f"  Impressions: {summary['total_impressions']:,}")
    print(f"  Clicks: {summary['total_clicks']:,}")
    print(f"  New leads: {summary['new_leads']}")

    # Lead scoring
    scored_leads = []
    if leads and leads.get("leads"):
        print("[SCORING] Running lead scorer on new leads...")
        scored_leads = run_lead_scoring(leads)
    else:
        print("[SCORING] No new lead data to score.")

    # Optimization decisions
    print("[OPTIMIZE] Evaluating thresholds...")
    optimizations = generate_optimizations(summary)
    kill_count = len(optimizations.get("kill", []))
    scale_count = len(optimizations.get("scale", []))
    revise_count = len(optimizations.get("revise", []))
    print(f"  Kill: {kill_count} | Scale: {scale_count} | Revise: {revise_count}")

    # Update campaign state
    print("[STATE] Updating campaign state...")
    state = load_campaign_state()
    state = update_campaign_state(state, summary, date_str)
    save_campaign_state(state)
    print(f"  Day {state['campaign_day']} | Phase: {state['phase']} | Spent: ${state['spent_to_date']:.2f}")

    # Write daily report
    print("[REPORT] Writing daily report...")
    report_path = write_daily_report(date_str, summary, optimizations, state, issues_text, scored_leads)
    print(f"  {report_path}")

    # Write next-day optimizations
    print("[QUEUE] Writing next-day optimizations...")
    opt_path = write_next_day_optimizations(date_str, optimizations)
    print(f"  {opt_path}")

    print(f"\n[DONE] Processing complete for {date_str}.")


if __name__ == "__main__":
    main()
