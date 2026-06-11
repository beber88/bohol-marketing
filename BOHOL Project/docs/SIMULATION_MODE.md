# SIMULATION MODE - PANGLAO PRIME VILLAS

## Status: ACTIVE

## Dates
- Simulation start: 2026-04-14
- Simulation end: 2026-04-15 (24 hours)

## Global Flag
```
SIMULATION = True
```
All scripts must check this flag before any live action.

---

## RULES DURING SIMULATION

### FORBIDDEN (while SIMULATION = True):
- Publishing ads on Meta Ads Manager
- Publishing ads on Google Ads
- Sending emails via Brevo to real contacts
- Broadcasting via WATI to real WhatsApp numbers
- Creating real deals in HubSpot pipeline
- Spending any ad budget

### ALLOWED (while SIMULATION = True):
- Generating all asset files (ads, emails, WhatsApp flows, landing pages)
- Running simulate_day.py to produce simulated lead data
- Generating reports in /reports/
- Running fx_rates.py and refresh_assets.py
- Testing Zapier connections in test mode
- Reviewing and auditing all assets
- Updating HANDOFF_LOG.md

---

## ASSET TAGGING

Every asset created during simulation must include in its header:

```
[SIMULATION - NOT FOR LIVE DEPLOYMENT]
```

This tag is removed only after:
1. The campaign owner (Barr) reviews the simulation report
2. The campaign owner explicitly approves the budget
3. The campaign owner says to go live

---

## SIMULATION OUTPUTS

### simulate_day.py produces:
- /reports/simulation_day_01.md
- Contains: 24-hour block-by-block activity log
- 8-15 simulated leads (half Israeli, half Filipino)
- Each lead: full profile, score, status, simulated activity
- Expected KPIs: CPL, CTR, lead score distribution, pipeline movement
- Morning briefing format

### After simulation review:
- If approved: remove SIMULATION tags, set SIMULATION = False, proceed to Day 1 of 30_DAY_PLAN.md
- If changes needed: revise assets, re-run simulation
- Campaign owner has final say on go-live

---

## EXIT SIMULATION

To exit simulation mode:
1. Campaign owner reviews /reports/simulation_day_01.md
2. Campaign owner reviews all assets in /assets/
3. Campaign owner says "go live" or "approve"
4. Agent removes SIMULATION tags from all assets
5. Agent sets SIMULATION = False in this file
6. Day 1 of 30_DAY_PLAN.md begins
