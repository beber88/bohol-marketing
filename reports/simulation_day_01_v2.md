# SIMULATION DAY REPORT - Day 01
# Date: 2026-04-14
# Mode: SIMULATION (no real spend, no live campaigns)

---

## EXECUTIVE SUMMARY

- **Total simulated leads:** 8
- **Israeli leads:** 4
- **Filipino leads:** 4
- **HOT leads (score 71+):** 2
- **WARM leads (31-70):** 1
- **COLD leads (0-30):** 5
- **Average lead score:** 50.0
- **Simulated daily budget:** $80.0
- **Overall CPL:** $12.88

## FUNNEL MODEL (Realistic Day 1)

### Meta Israel ($45/day)
- Impressions: 4,999
- CTR: 2.08% -> Clicks: 103
- Click-to-lead: 8-12% -> Expected leads: 12
- CPL: $3.75

### Meta Philippines ($33/day)
- Impressions: 5,211
- CTR: 2.01% -> Clicks: 104
- Click-to-lead: 8-12% -> Expected leads: 9
- CPL: $3.67

### Google Search PH ($25/day)
- Clicks: 10
- CTR: 4.5%
- Click-to-lead: 10-15% -> Expected leads: 1
- CPL: $25.0

## EXPECTED KPIs

| Metric | Israel | Philippines | Target |
|---|---|---|---|
| CPL | $3.75 | $3.67 (Meta) / $25.0 (Google) | IL <$40, PH <$35 |
| CTR (Meta) | 2.08% | 2.01% | IL >2%, PH >1.5% |
| CTR (Google) | n/a | 4.5% | >3% |
| WA initiation | 12.5% of leads | 12.5% of leads | - |
| WA response (of initiators) | 0.0% | 0.0% | IL >50%, PH >45% |
| Email open (of form submitters) | 0.0% | 0.0% | >35% |
| Form submissions | 3 of 8 leads | - | - |

## PIPELINE DISTRIBUTION

| Stage | Count |
|---|---|
| Stage 1 | 6 |
| Stage 2 | 1 |
| Stage 3 | 1 |
| Stage 4 | 0 |
| Stage 5 | 0 |

## FX RATES (Simulation)

- Date: 2026-04-14
- PHP-ILS: 0.050746 (exchangerate-api.com)
- PHP-USD: 0.01663 (exchangerate-api.com)
- Villa D: PHP 28,000,000 = ILS 1,420,888 = USD 465,640
- Villa C: PHP 30,000,000 = ILS 1,522,380 = USD 498,900

---

## HOUR-BY-HOUR ACTIVITY LOG

### 00:00 PHT
**Activity:** Overnight: Google Search ads running (PH)
**Active campaigns:** GOOGLE_PH
**New leads this hour:** 0

### 01:00 PHT
**Activity:** Overnight: Google Search ads running (PH)
**Active campaigns:** GOOGLE_PH
**New leads this hour:** 0

### 02:00 PHT
**Activity:** Israel peak hours begin (20:00 IST = 02:00 PHT)
**Active campaigns:** META_IL_AWARENESS, META_IL_CONSIDERATION
**New leads this hour:** 1
- SIM-004 | Yossi Avraham | Israeli | Organic (primevilla.ph) | Score: 95 | HOT

### 03:00 PHT
**Activity:** Israel peak: Meta IL campaigns active
**Active campaigns:** META_IL_AWARENESS, META_IL_CONSIDERATION, META_IL_CONVERSION
**New leads this hour:** 0

### 04:00 PHT
**Activity:** Israel peak ends (23:00 IST). WhatsApp IL responses.
**Active campaigns:** META_IL_CONVERSION
**New leads this hour:** 1
- SIM-002 | Michal Levi | Israeli | WhatsApp Direct | Score: 20 | COLD

### 05:00 PHT
**Activity:** Low activity. Overnight monitoring.
**Active campaigns:** None
**New leads this hour:** 0

### 06:00 PHT
**Activity:** Low activity. Email queue processing.
**Active campaigns:** None
**New leads this hour:** 0

### 07:00 PHT
**Activity:** Low activity. Pre-work check.
**Active campaigns:** None
**New leads this hour:** 0

### 08:00 PHT
**Activity:** Morning: Daily ops checklist. Review overnight leads.
**Active campaigns:** None
**New leads this hour:** 0

### 09:00 PHT
**Activity:** Morning: fx_rates.py runs. FX update. Sales agent briefing.
**Active campaigns:** GOOGLE_PH
**New leads this hour:** 3
- SIM-001 | Michal Levi | Israeli | Organic (primevilla.ph) | Score: 115 | HOT
- SIM-003 | Noa Goldstein | Israeli | Organic (primevilla.ph) | Score: 20 | COLD
- SIM-008 | James Tan | Filipino | Google Search | Score: 70 | WARM

### 10:00 PHT
**Activity:** Morning: WhatsApp broadcast window (warm leads).
**Active campaigns:** GOOGLE_PH, WATI_BROADCAST
**New leads this hour:** 1
- SIM-005 | Grace Hernandez | Filipino | WhatsApp Direct | Score: 20 | COLD

### 11:00 PHT
**Activity:** Midday: Google Search PH active. WhatsApp responses.
**Active campaigns:** GOOGLE_PH
**New leads this hour:** 0

### 12:00 PHT
**Activity:** Midday: Brevo email sequence triggers for new leads.
**Active campaigns:** GOOGLE_PH, BREVO
**New leads this hour:** 0

### 13:00 PHT
**Activity:** Afternoon: Sales agent follow-ups. Pipeline review.
**Active campaigns:** GOOGLE_PH
**New leads this hour:** 0

### 14:00 PHT
**Activity:** Afternoon: Sales calls with qualified leads.
**Active campaigns:** GOOGLE_PH
**New leads this hour:** 0

### 15:00 PHT
**Activity:** Afternoon: Content review. Asset optimization.
**Active campaigns:** GOOGLE_PH
**New leads this hour:** 0

### 16:00 PHT
**Activity:** Late afternoon: Google PH performance check.
**Active campaigns:** GOOGLE_PH
**New leads this hour:** 0

### 17:00 PHT
**Activity:** Evening: Prepare for PH peak hours.
**Active campaigns:** GOOGLE_PH
**New leads this hour:** 0

### 18:00 PHT
**Activity:** PH peak begins (6pm). Meta PH ads ramp up.
**Active campaigns:** META_PH_AWARENESS, GOOGLE_PH
**New leads this hour:** 1
- SIM-006 | James Tan | Filipino | Meta Ad (Facebook PH) | Score: 30 | COLD

### 19:00 PHT
**Activity:** PH peak: Meta PH campaigns fully active.
**Active campaigns:** META_PH_AWARENESS, META_PH_CONSIDERATION, GOOGLE_PH
**New leads this hour:** 1
- SIM-007 | Grace Hernandez | Filipino | WhatsApp Direct | Score: 30 | COLD

### 20:00 PHT
**Activity:** PH peak: Highest engagement window.
**Active campaigns:** META_PH_AWARENESS, META_PH_CONSIDERATION, META_PH_CONVERSION, GOOGLE_PH
**New leads this hour:** 0

### 21:00 PHT
**Activity:** PH peak: WhatsApp PH inquiries spike.
**Active campaigns:** META_PH_CONSIDERATION, META_PH_CONVERSION, GOOGLE_PH
**New leads this hour:** 0

### 22:00 PHT
**Activity:** PH peak ends. Last WhatsApp responses.
**Active campaigns:** META_PH_CONVERSION
**New leads this hour:** 0

### 23:00 PHT
**Activity:** End of day. Prepare overnight summary.
**Active campaigns:** None
**New leads this hour:** 0

---

## FULL LEAD PROFILES

### SIM-004 - Yossi Avraham
**Hebrew name:** יוסי אברהם
**Nationality:** Israeli | **City:** Jerusalem
**Profession:** Attorney
**Language:** Hebrew
**Source:** Organic (primevilla.ph)
**Villa interest:** Villa C | **Purpose:** Both
**Lead score:** 95 | **Status:** HOT
**Pipeline stage:** 2 - Contacted

**Activity chain:**
- Visited primevilla.ph
- Time on site: 2+ minutes
- Time on site: 5+ minutes
- Visited site 2+ times
- Submitted inquiry form

**Recommended action:** Sales agent contacts within 2 hours. Priority.

### SIM-002 - Michal Levi
**Hebrew name:** מיכל לוי
**Nationality:** Israeli | **City:** Herzliya
**Profession:** Portfolio Manager
**Language:** Hebrew
**Source:** WhatsApp Direct
**Villa interest:** Villa C | **Purpose:** Both
**Lead score:** 20 | **Status:** COLD
**Pipeline stage:** 1 - New Lead

**Activity chain:**
- Visited primevilla.ph

**Recommended action:** Automated email sequence only. No manual contact.

### SIM-001 - Michal Levi
**Hebrew name:** מיכל לוי
**Nationality:** Israeli | **City:** Herzliya
**Profession:** Real Estate Investor
**Language:** Hebrew
**Source:** Organic (primevilla.ph)
**Villa interest:** Undecided | **Purpose:** Both
**Lead score:** 115 | **Status:** HOT
**Pipeline stage:** 3 - Qualified

**Activity chain:**
- Visited primevilla.ph
- Visited site 2+ times
- Clicked ROI calculator
- Submitted inquiry form
- Sent first WhatsApp message

**Recommended action:** Sales agent contacts within 2 hours. Priority.

### SIM-003 - Noa Goldstein
**Hebrew name:** נועה גולדשטיין
**Nationality:** Israeli | **City:** Haifa
**Profession:** Attorney
**Language:** Hebrew
**Source:** Organic (primevilla.ph)
**Villa interest:** Villa C | **Purpose:** Personal Use
**Lead score:** 20 | **Status:** COLD
**Pipeline stage:** 1 - New Lead

**Activity chain:**
- Visited primevilla.ph

**Recommended action:** Automated email sequence only. No manual contact.

### SIM-008 - James Tan
**Nationality:** Filipino | **City:** Cebu City
**Profession:** Real Estate Investor
**Language:** English
**Source:** Google Search
**Villa interest:** Undecided | **Purpose:** Both
**Lead score:** 70 | **Status:** WARM
**Pipeline stage:** 1 - New Lead

**Activity chain:**
- Visited primevilla.ph
- Visited site 2+ times
- Submitted inquiry form

**Recommended action:** Sales agent reviews profile. Optional personal WhatsApp.

### SIM-005 - Grace Hernandez
**Nationality:** Filipino | **City:** Quezon City
**Profession:** Attorney
**Language:** English
**Source:** WhatsApp Direct
**Villa interest:** Both | **Purpose:** Both
**Lead score:** 20 | **Status:** COLD
**Pipeline stage:** 1 - New Lead

**Activity chain:**
- Visited primevilla.ph

**Recommended action:** Automated email sequence only. No manual contact.

### SIM-006 - James Tan
**Nationality:** Filipino | **City:** Cebu City
**Profession:** OFW Returnee
**Language:** English
**Source:** Meta Ad (Facebook PH)
**Villa interest:** Villa C | **Purpose:** Investment
**Lead score:** 30 | **Status:** COLD
**Pipeline stage:** 1 - New Lead

**Activity chain:**
- Visited primevilla.ph

**Recommended action:** Automated email sequence only. No manual contact.

### SIM-007 - Grace Hernandez
**Nationality:** Filipino | **City:** Quezon City
**Profession:** Physician
**Language:** English
**Source:** WhatsApp Direct
**Villa interest:** Undecided | **Purpose:** Both
**Lead score:** 30 | **Status:** COLD
**Pipeline stage:** 1 - New Lead

**Activity chain:**
- Visited primevilla.ph
- Visited site 2+ times

**Recommended action:** Automated email sequence only. No manual contact.

---

## OPTIMIZATION RECOMMENDATIONS

1. **2 HOT lead(s) detected.** Sales agent must contact within 2 hours of go-live.
   - SIM-004 Yossi Avraham (Israeli, score 95): Sales agent contacts within 2 hours. Priority.
   - SIM-001 Michal Levi (Israeli, score 115): Sales agent contacts within 2 hours. Priority.

2. **WhatsApp engagement:** 12.5% of leads initiated WhatsApp. Of those, 0.0% engaged with the flow. Below target (<45%). Review WhatsApp CTA placement and welcome flow.

3. **Email engagement:** 0.0% of form submitters (3) opened Email 1. Below target (<35%). Test alternate subject lines.

4. **Israel CTR at 2.08%.** On target (>2%). Monitor for 3 days before scaling.

5. **Philippines CTR at 2.01%.** On target (>1.5%). Continue current creative.

6. **Budget pacing:** $80/day simulated. On track for $2,400/30 days.

---

## NEXT STEPS

1. Campaign owner reviews this simulation report
2. Campaign owner reviews all assets in /assets/ads/
3. Campaign owner approves budget and go-live date
4. Upon approval: remove SIMULATION tags, begin Day 1 of 30_DAY_PLAN.md

---
*Generated by simulate_day.py | SIMULATION MODE | Not real data*