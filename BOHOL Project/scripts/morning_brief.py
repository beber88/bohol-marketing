#!/usr/bin/env python3
"""
morning_brief.py - Generate the human-readable director brief

Reads campaign state, yesterday's results, and FX rates to produce
a concise daily brief that can be read in 60 seconds.

Usage:
    python3 scripts/morning_brief.py              # brief for today
    python3 scripts/morning_brief.py --date 2026-04-16
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
STATUS_DIR = PROJECT_ROOT / "_status"
COMPLETED_DIR = PROJECT_ROOT / "_completed"
REPORTS_DIR = PROJECT_ROOT / "reports"
CONFIG_DIR = PROJECT_ROOT / "config"
QUEUE_DIR = PROJECT_ROOT / "_queue"
STATE_FILE = STATUS_DIR / "campaign_state.json"
FX_FILE = CONFIG_DIR / "fx_today.json"

# Phase descriptions for the daily plan
PHASE_PLANS = {
    "PRE_LAUNCH": "Finalize platform setup, creative assets, and tracking. No spend yet.",
    "SETUP": "Launch initial campaigns. Set up pixels, verify tracking, start low-budget tests on Meta and Google. Begin email welcome sequences.",
    "AWARENESS": "Scale awareness campaigns. Broad targeting on Meta (Israel + PH). Google Search on high-intent keywords. First email sequences firing. WhatsApp opt-in collection.",
    "CONSIDERATION": "Retarget engaged audiences. Prospectus downloads, virtual tour pushes. Nurture sequences active. WhatsApp follow-ups on warm leads. Refine ad creative based on data.",
    "CONVERSION": "Push for conversions. Reservation offers, urgency messaging, call scheduling. Hot leads get personal outreach. Scale best-performing campaigns. Kill underperformers.",
    "CLOSE_PUSH": "Final push. Limited-time reservation pricing. Direct calls to all warm+ leads. WhatsApp blast to engaged list. Testimonial and social proof heavy.",
    "FINAL": "Last 48 hours. All-in on highest performers. Final call attempts. Wrap-up reporting.",
}


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
    """Load JSON file, return None if missing."""
    if not path.exists():
        return None
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return None


def load_text(path):
    """Load text file, return None if missing."""
    if not path.exists():
        return None
    try:
        with open(path, "r") as f:
            return f.read()
    except IOError:
        return None


def get_yesterday(date_str):
    """Return the previous date string."""
    today = datetime.strptime(date_str, "%Y-%m-%d")
    yesterday = today - timedelta(days=1)
    return yesterday.strftime("%Y-%m-%d")


def build_platform_status(platforms):
    """Build a compact platform status section."""
    if not platforms:
        return []
    lines = []
    for name, info in platforms.items():
        status = info.get("status", "unknown") if isinstance(info, dict) else str(info)
        label = name.replace("_", " ").title()
        if status == "active":
            marker = "[LIVE]"
        elif status in ("not_setup", "not_deployed"):
            marker = "[NOT SETUP]"
        else:
            marker = f"[{status.upper()}]"
        lines.append(f"  {marker} {label}")
    return lines


def build_brief(date_str, state, yesterday_report, yesterday_results, fx):
    """Build the director brief as a list of lines."""
    day = state.get("campaign_day", 0)
    phase = state.get("phase", "PRE_LAUNCH")
    budget = state.get("total_budget", 2400)
    spent = state.get("spent_to_date", 0)
    remaining = budget - spent
    days_left = max(30 - day, 1)
    daily_pace = remaining / days_left
    yesterday_str = get_yesterday(date_str)

    lines = []

    # Header
    lines.append(f"# Director Brief - {date_str}")
    lines.append(f"**Day {day} of 30 | {phase} | Panglao Prime Villas**")
    lines.append("")

    # Budget status
    lines.append("## Budget")
    lines.append(f"- Spent to date: ${spent:.2f} of ${budget:.2f}")
    lines.append(f"- Remaining: ${remaining:.2f} ({days_left} days left)")
    lines.append(f"- Target daily pace: ${daily_pace:.2f}/day")
    if fx:
        lines.append(f"- FX: 1 PHP = {fx.get('php_to_usd', 0):.5f} USD | {fx.get('php_to_ils', 0):.5f} ILS")
    lines.append("")

    # Yesterday's highlights
    if yesterday_results or yesterday_report:
        lines.append("## Yesterday's Highlights")
        if yesterday_results:
            ads = yesterday_results.get("ads_metrics.json") or {}
            meta = ads.get("meta_ads", {})
            google = ads.get("google_ads", {})
            total_spend = meta.get("spend", 0) + google.get("spend", 0)
            total_clicks = meta.get("clicks", 0) + google.get("clicks", 0)
            total_conv = meta.get("conversions", 0) + google.get("conversions", 0)

            if total_spend > 0:
                lines.append(f"- Ad spend: ${total_spend:.2f} | {total_clicks} clicks | {total_conv} conversions")

            email = yesterday_results.get("email_metrics.json") or {}
            if email.get("open_rate"):
                lines.append(f"- Email open rate: {email['open_rate']:.1f}%")

            wa = yesterday_results.get("whatsapp_metrics.json") or {}
            if wa.get("response_rate"):
                lines.append(f"- WhatsApp response rate: {wa['response_rate']:.1f}%")

            leads_data = yesterday_results.get("lead_updates.json") or {}
            if leads_data.get("total_new"):
                lines.append(f"- New leads: {leads_data['total_new']} (qualified: {leads_data.get('qualified', 0)})")

            issues = yesterday_results.get("issues.md")
            if issues:
                # Show first line of issues as alert
                first_line = issues.strip().split("\n")[0]
                lines.append(f"- Issue flagged: {first_line}")
        elif yesterday_report:
            lines.append("- See full report in reports/")
        lines.append("")
    else:
        lines.append("## Yesterday")
        lines.append("- No data yet (campaign just started or first day).")
        lines.append("")

    # Today's plan
    lines.append("## Today's Plan")
    plan_text = PHASE_PLANS.get(phase, "Execute current phase tasks.")
    lines.append(f"- Phase focus: {plan_text}")
    lines.append("")

    # Alerts
    alerts = []
    if spent > (day / 30) * budget * 1.15 and day > 0:
        alerts.append("OVERSPEND: Spending pace is >15% ahead of schedule.")
    if spent < (day / 30) * budget * 0.7 and day > 3:
        alerts.append("UNDERSPEND: Spending pace is significantly behind. Risk of not deploying full budget.")
    if remaining < 0:
        alerts.append("BUDGET EXCEEDED: Total spend has passed the $2,400 budget.")

    platforms = state.get("platforms", {})
    not_setup = [k.replace("_", " ").title() for k, v in platforms.items()
                 if isinstance(v, dict) and v.get("status") in ("not_setup", "not_deployed")]
    if not_setup and day >= 3:
        alerts.append(f"PLATFORMS NOT READY: {', '.join(not_setup)}")

    if alerts:
        lines.append("## Alerts")
        for a in alerts:
            lines.append(f"- {a}")
        lines.append("")

    # Platform status
    platform_lines = build_platform_status(platforms)
    if platform_lines:
        lines.append("## Platform Status")
        lines.extend(platform_lines)
        lines.append("")

    lines.append("---")
    lines.append(f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*")

    return lines


def load_yesterday_results(yesterday_str):
    """Load all result files from yesterday's completed directory."""
    day_dir = COMPLETED_DIR / yesterday_str
    if not day_dir.exists():
        return None

    results = {}
    file_names = [
        "ads_metrics.json",
        "email_metrics.json",
        "whatsapp_metrics.json",
        "lead_updates.json",
        "content_results.json",
    ]
    for fname in file_names:
        fpath = day_dir / fname
        data = load_json(fpath)
        if data:
            results[fname] = data

    issues = load_text(day_dir / "issues.md")
    if issues:
        results["issues.md"] = issues

    return results if results else None


def main():
    date_str = parse_date_arg()
    yesterday_str = get_yesterday(date_str)

    print(f"[MORNING_BRIEF] Generating brief for {date_str}")

    # Load inputs
    state = load_json(STATE_FILE)
    if state is None:
        state = {
            "campaign_day": 0,
            "phase": "PRE_LAUNCH",
            "total_budget": 2400,
            "spent_to_date": 0,
            "platforms": {},
        }
        print("[INFO] No campaign_state.json found, using defaults.")

    yesterday_report = load_text(REPORTS_DIR / f"daily_report_{yesterday_str}.md")
    yesterday_results = load_yesterday_results(yesterday_str)
    fx = load_json(FX_FILE)

    # Build brief
    brief_lines = build_brief(date_str, state, yesterday_report, yesterday_results, fx)
    brief_text = "\n".join(brief_lines) + "\n"

    # Enforce 50-line max by trimming if needed (keep header + budget + alerts)
    line_count = len([l for l in brief_lines if l.strip()])
    if line_count > 50:
        print(f"[WARN] Brief is {line_count} content lines, target is 50.")

    # Write to queue
    queue_dir = QUEUE_DIR / date_str
    queue_dir.mkdir(parents=True, exist_ok=True)
    brief_path = queue_dir / "director_brief.md"
    with open(brief_path, "w") as f:
        f.write(brief_text)

    print(f"[OUTPUT] {brief_path}")
    print()
    print(brief_text)


if __name__ == "__main__":
    main()
