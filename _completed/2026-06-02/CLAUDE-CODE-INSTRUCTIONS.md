# Claude Code: Google Ads setup + budget reconciliation (2026-06-02)

Prepared by the execution agent. These are instructions for Claude Code (strategy/content/state owner). The execution agent did NOT modify `scripts/`, `config/`, `docs/`, or `_status/campaign_state.json`, per CLAUDE.md Rule 5. Please apply the changes below.

## Context

User pasted a task to import `scripts/google-ads-import.csv` into Google Ads Editor and Post Changes live. The execution agent held it because, with `simulation: false` and `phase: LIVE`, Posting as written would have:

1. Spent on dead landing pages: every Final URL pointed to `primevilla.ph`, which is not deployed. Live site is `blue-everest.com`.
2. Breached the $900 cap: Korea ($10/day) plus IL ($13) plus PH ($9) on top of Meta.
3. Added Korea, a market outside the approved IL + PH scope (CLAUDE.md project identity), including an unverified "42% of Bohol tourists are Korean" claim.
4. Broken Rule 1 (Israeli content shows shekels only): Hebrew ads contained "395,000 פזו" and "PHP 395,000".
5. Thrown red errors in Editor: PH Headline 1 was 32 chars (limit 30), PH descriptions were 116 and 101 chars (limit 90). The original CSV was also ragged (keyword rows had 19 columns, ad rows 20).

User decisions (collected 2026-06-02): fix CSV and import PAUSED; drop Korea for now; reconcile budget under the cap and hand Claude Code precise instructions.

## Corrected file

`_completed/2026-06-02/google-ads-import-FIXED.csv` (validated, ready for Editor import).
Changes vs original: Korea removed; all URLs repointed to `blue-everest.com`; Hebrew copy stripped of PHP and given indirect legal-ownership reference ("בעלות חוקית מוסדרת") for Rule 6; PH copy trimmed to Google limits; all rows normalized to 21 columns; `Campaign Status = Paused` added.

### Action 1: replace canonical CSV
Copy `_completed/2026-06-02/google-ads-import-FIXED.csv` over `scripts/google-ads-import.csv` (Claude Code's domain to edit).

## Budget reconciliation

FX from campaign_state: PHP to USD = 0.016234. Window = 15 days. Cap = $900.

| Channel | Daily | 15-day |
|---|---|---|
| Meta IL-1 (1,200 PHP/day) | $19.48 | $292.21 |
| Meta PH-1 (850 PHP/day) | $13.80 | $207.04 |
| Meta subtotal (2,050 PHP/day) | $33.28 | $499.25 |
| Google IL Search | $13.00 | $195.00 |
| Google PH Search | $9.00 | $135.00 |
| Google subtotal | $22.00 | $330.00 |
| Combined | $55.28 | $829.25 |

Result: $829.25 over 15 days, $70.75 under the $900 cap. Dropping Korea is the budget adjustment. No further reduction is needed. The $70.75 headroom should stay as reserve, not be auto-allocated.

### Action 2: update `_status/campaign_state.json`
Replace `"google_ads": { "status": "not_setup" }` with:

```json
"google_ads": {
  "status": "ready_paused",
  "import_source": "scripts/google-ads-import.csv",
  "import_method": "Google Ads Editor CSV import",
  "imported_state": "PAUSED",
  "currency": "USD",
  "daily_budget_usd_total": 22,
  "campaigns": [
    {"name": "PPV - Israel Search", "market": "IL", "status": "PAUSED", "daily_budget_usd": 13, "networks": "Google Search", "locations": ["Israel"], "languages": ["Hebrew", "English"], "bidding": "Maximize Conversions", "ad_groups": ["IL - Investment Keywords"], "keywords": 8, "final_url": "https://blue-everest.com/panglao-prime-villas/he"},
    {"name": "PPV - Philippines Search", "market": "PH", "status": "PAUSED", "daily_budget_usd": 9, "networks": "Google Search", "locations": ["Philippines:Manila", "Philippines:Cebu", "Philippines:Davao"], "languages": ["English"], "bidding": "Maximize Conversions", "ad_groups": ["PH - Buyer Intent", "PH - Investment Intent"], "keywords": 8, "final_urls": ["https://blue-everest.com/panglao-prime-villas", "https://blue-everest.com/panglao-prime-villas/investment"]}
  ],
  "removed_campaigns": [
    {"name": "PPV - Korea Search", "reason": "Outside approved market scope (IL + PH only). Re-add only with explicit approval and verification of the '42% Korean tourists' claim."}
  ]
}
```

Also add a top-level reconciliation block:

```json
"budget_tracking": {
  "cap_usd": 900,
  "window_days": 15,
  "fx_php_to_usd": 0.016234,
  "meta_daily_usd": 33.28,
  "meta_15d_usd": 499.25,
  "google_daily_usd": 22,
  "google_15d_usd": 330,
  "combined_daily_usd": 55.28,
  "combined_15d_usd": 829.25,
  "headroom_usd": 70.75,
  "within_cap": true,
  "note": "Headroom held as reserve, not auto-allocated."
}
```

## Items that still need a decision or content work (Claude Code's domain)

1. Rule 4 (both WhatsApp numbers in every post): not feasible inside Google Search headline/description limits. Recommend adding a Call asset (+639542555553) plus Sitelink assets, including one to `/panglao-prime-villas/ownership`. Both numbers are present on the landing page (verified live).
2. Rule 6 (three ownership structures): the IL ad references ownership indirectly only. Full Deed of Assignment / Leasehold 25+25 / Domestic Corporation detail is on `/panglao-prime-villas/ownership`. A Sitelink to that page covers it.
3. Landing page vs ad currency: the live `/he` page itself shows "PHP 395,000/month". The ads are now shekel-only per Rule 1, but the page is not. If strict Rule 1 should extend to the IL landing page, that is a site change in `blue-everest/` (Claude Code's domain).
4. Korea: parked. If reinstated later, verify the 42% claim and re-check the cap (would add $10/day = $150 over 15 days, pushing combined to ~$979, over cap).

## What the execution agent did NOT do

Did not run Google Ads Editor or Post Changes. `google_ads` was `not_setup`; the account likely needs login plus billing before any Post will succeed, and the user asked to import PAUSED for review first. The execution agent can drive the Editor import (PAUSED, no Post) via computer control once the user confirms Editor is installed, open, and signed into the correct Google Ads account.
