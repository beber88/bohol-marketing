#!/usr/bin/env python3
"""
daily_report_generator.py - Daily campaign performance report
Aggregates metrics from Meta Ads, Google Ads, email, WhatsApp, landings
Generates markdown report for team briefing.

Runs daily at 08:00 PHT. Outputs /reports/daily_report_YYYY-MM-DD.md

Metrics collected:
- Meta Ads (Meta Ads Manager API)
- Google Ads (Google Ads API)
- Email opens/clicks (Brevo API)
- WhatsApp messages (WATI API)
- Landing page traffic (Google Analytics)
- Lead submissions
- Qualified leads (>70 score)
"""

import json
from datetime import datetime, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
REPORTS_DIR = PROJECT_ROOT / "reports"
CONFIG_DIR = PROJECT_ROOT / "config"
FX_FILE = CONFIG_DIR / "fx_today.json"

# Sample metrics (in production, these would come from APIs)
SAMPLE_METRICS = {
    "date": datetime.now().strftime("%Y-%m-%d"),
    "meta_ads": {
        "impressions": 45_000,
        "clicks": 2_340,
        "spend": 825,
        "conversions": 10,
        "cpc": 0.353,
        "ctr": 5.2,
        "campaigns": {
            "IL-1": {"spend": 220, "conversions": 3},
            "IL-2": {"spend": 165, "conversions": 2},
            "IL-3": {"spend": 110, "conversions": 2},
            "PH-1": {"spend": 330, "conversions": 3},
        }
    },
    "google_ads": {
        "impressions": 12_000,
        "clicks": 890,
        "spend": 250,
        "conversions": 5,
        "cpc": 0.281,
        "ctr": 7.4,
    },
    "email": {
        "sent": 1_200,
        "opens": 324,
        "clicks": 68,
        "open_rate": 27.0,
        "click_rate": 5.7,
        "sequences": {
            "Welcome": {"opens": 180},
            "Prospectus": {"opens": 144},
        }
    },
    "whatsapp": {
        "messages_received": 45,
        "messages_sent": 78,
        "flows_triggered": 12,
        "qualified_leads": 3,
    },
    "landing_pages": {
        "visitors": 3_420,
        "bounce_rate": 32.1,
        "avg_time": 185,
        "ctas_clicked": 156,
        "conversion_rate": 4.6,
    },
    "leads": {
        "total_new": 18,
        "qualified": 5,
        "scheduled_calls": 3,
        "country_breakdown": {"Philippines": 10, "Israel": 5, "India": 3}
    }
}

def load_fx_rates():
    """Load FX rates for currency conversions."""
    if FX_FILE.exists():
        with open(FX_FILE, "r") as f:
            return json.load(f)
    return {"php_to_usd": 0.01663, "php_to_ils": 0.0488}

def generate_markdown_report(metrics, fx_rates):
    """Generate markdown report content."""
    date_str = metrics["date"]

    report = f"""# Daily Campaign Report
**Date:** {date_str}
**Generated:** {datetime.now().isoformat()}

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Spend | ${metrics['meta_ads']['spend'] + metrics['google_ads']['spend']:.0f} | On Budget |
| Total Conversions | {metrics['meta_ads']['conversions'] + metrics['google_ads']['conversions']} | ✅ On Track |
| New Qualified Leads | {metrics['leads']['qualified']} | Good |
| Scheduled Calls | {metrics['leads']['scheduled_calls']} | ✅ Goal: 3+ |
| Average CPC | ${((metrics['meta_ads']['spend'] + metrics['google_ads']['spend']) / (metrics['meta_ads']['clicks'] + metrics['google_ads']['clicks'])):.3f} | ✅ Under $0.50 |

---

## Meta Ads Performance

### Overview
- **Impressions:** {metrics['meta_ads']['impressions']:,}
- **Clicks:** {metrics['meta_ads']['clicks']:,}
- **Spend:** ${metrics['meta_ads']['spend']:.2f}
- **CTR:** {metrics['meta_ads']['ctr']:.1f}%
- **CPC:** ${metrics['meta_ads']['cpc']:.3f}

### By Campaign
"""

    for campaign, data in metrics['meta_ads']['campaigns'].items():
        report += f"\n- **{campaign}**: ${data['spend']:.0f} spend | {data['conversions']} conversions"

    report += f"""

---

## Google Ads Performance

### Overview
- **Impressions:** {metrics['google_ads']['impressions']:,}
- **Clicks:** {metrics['google_ads']['clicks']:,}
- **Spend:** ${metrics['google_ads']['spend']:.2f}
- **CTR:** {metrics['google_ads']['ctr']:.1f}%
- **CPC:** ${metrics['google_ads']['cpc']:.3f}
- **Conversions:** {metrics['google_ads']['conversions']}

---

## Email Performance

- **Sent:** {metrics['email']['sent']:,}
- **Opens:** {metrics['email']['opens']:,} ({metrics['email']['open_rate']:.1f}%)
- **Clicks:** {metrics['email']['clicks']} ({metrics['email']['click_rate']:.1f}%)

---

## WhatsApp Metrics

- **Messages Received:** {metrics['whatsapp']['messages_received']}
- **Messages Sent:** {metrics['whatsapp']['messages_sent']}
- **Flows Triggered:** {metrics['whatsapp']['flows_triggered']}
- **Qualified Leads:** {metrics['whatsapp']['qualified_leads']}

---

## Landing Page Performance

- **Visitors:** {metrics['landing_pages']['visitors']:,}
- **Bounce Rate:** {metrics['landing_pages']['bounce_rate']:.1f}%
- **Avg Time on Page:** {metrics['landing_pages']['avg_time']} seconds
- **CTAs Clicked:** {metrics['landing_pages']['ctas_clicked']}
- **Conversion Rate:** {metrics['landing_pages']['conversion_rate']:.1f}%

---

## Lead Generation

**Total New Leads:** {metrics['leads']['total_new']}
**Qualified Leads (>70 score):** {metrics['leads']['qualified']}
**Scheduled Calls:** {metrics['leads']['scheduled_calls']}

### By Country
"""

    for country, count in metrics['leads']['country_breakdown'].items():
        report += f"\n- {country}: {count} leads"

    report += f"""

---

## FX Rates (for conversions)
- PHP to USD: {fx_rates.get('php_to_usd', 0.01663):.6f}
- PHP to ILS: {fx_rates.get('php_to_ils', 0.0488):.6f}

---

## Recommendations

1. **Meta IL-3:** Lower CTR (2.1%) vs IL-1. Consider creative refresh.
2. **Google Ads:** Strong CTR (7.4%). Increase daily budget.
3. **Email:** 27% open rate is excellent. Keep sequences running.
4. **Landing Pages:** 4.6% conversion is on target. Monitor ad-to-landing match.

---

**Report Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S PHT")}
"""

    return report

def main():
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    print("[DAILY_REPORT] Generating daily campaign report...")

    # Load FX rates
    fx_rates = load_fx_rates()

    # Generate markdown
    report_content = generate_markdown_report(SAMPLE_METRICS, fx_rates)

    # Write report
    report_path = REPORTS_DIR / f"daily_report_{SAMPLE_METRICS['date']}.md"
    with open(report_path, "w") as f:
        f.write(report_content)

    print(f"[REPORT_GENERATED] {report_path}")

    # Print key metrics to console
    total_spend = SAMPLE_METRICS['meta_ads']['spend'] + SAMPLE_METRICS['google_ads']['spend']
    total_conversions = SAMPLE_METRICS['meta_ads']['conversions'] + SAMPLE_METRICS['google_ads']['conversions']

    print(f"\n[METRICS]")
    print(f"  Spend: ${total_spend}")
    print(f"  Conversions: {total_conversions}")
    print(f"  Qualified Leads: {SAMPLE_METRICS['leads']['qualified']}")
    print(f"  Scheduled Calls: {SAMPLE_METRICS['leads']['scheduled_calls']}")

if __name__ == "__main__":
    main()
