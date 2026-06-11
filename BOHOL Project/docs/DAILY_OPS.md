# DAILY_OPS.md - Daily Operations Runbook

**Panglao Prime Villas Marketing Campaign**  
**30-Day Execution Framework**  
**Last Updated: 2026-04-14**

---

## I. Morning Briefing (08:00 PHT)

### 1. Run Daily Report
```bash
python3 scripts/daily_report_generator.py
```
- Aggregates Meta Ads, Google Ads, email, WhatsApp metrics
- Generates `/reports/daily_report_YYYY-MM-DD.md`
- Review: impressions, clicks, conversions, spend efficiency
- **Alert threshold:** CPC > $0.50 or CTR < 4%

### 2. Check Overnight Leads
- Review HubSpot for new leads (unread messages)
- Run lead scorer on new submissions
- Prioritize HOT leads (score >70) for same-day calls
- Assign to sales team (Alex, Marcus, or Priya)

### 3. Review Campaign Health
| Campaign | Budget | Spend YTD | Status |
|----------|--------|-----------|--------|
| IL-1 (Awareness) | $55/day | On track | ✅ |
| IL-2 (Consideration) | $18/day | On track | ✅ |
| IL-3 (Conversion) | $15/day | On track | ✅ |
| PH-1 (Awareness) | $30/day | On track | ✅ |
| PH-2 (Consideration) | $12/day | On track | ✅ |
| PH-3 (Conversion) | $20/day | On track | ✅ |
| Google IL | $12/day | On track | ✅ |
| Google PH | $13/day | On track | ✅ |
| **Total** | **$175/day** | | |

### 4. Email Sequences Status
- **Active sequences:** Welcome (1000), Prospectus (800), Testimonial (650)
- Check Brevo: open rates (target >25%), click rates (target >5%)
- Pause underperforming variants, boost winners
- Review: [Brevo Dashboard](https://app.brevo.com/)

### 5. WhatsApp Monitoring
- Review overnight WATI messages
- Respond to HOT leads within 2 hours
- Check flow triggers (FLOW_01_INITIAL_INQUIRY should activate on keywords)
- Respond time SLA: <2 hours for HOT, <8 hours for WARM, <24h for COLD

---

## II. Mid-Day Optimization (13:00 PHT)

### 1. Lead Routing
- Check qualified leads from yesterday: call them today
- Route HOT leads (>70 score) directly to sales
- Nurture WARM leads (40-69) with email + WhatsApp
- Add COLD leads (<40) to automation sequences

### 2. Campaign Adjustments
**If CPC > $0.60:** Pause underperforming creative, reduce bid, increase bid on high-converting audiences
**If CTR < 4%:** Refresh creative, test new headlines, increase frequency cap
**If ROAS < 3:1:** Kill ad set, shift budget to winners
**If spending tracking < 90%:** Lower bids, increase daily budget

### 3. Check Payment Processing
- Confirm successful lead charges (if applicable)
- Monitor BDO financing applications
- Follow up on payment plan inquiries
- Log all financial transactions in CRM

### 4. Content Review
- Check landing pages for technical issues (links, forms, CTAs)
- Verify all landing page links point to correct resources
- Test forms on mobile devices
- Monitor bounce rates; target <30%

---

## III. Afternoon Push (17:00 PHT)

### 1. Lead Qualification Calls
- Sales team: Execute 3-5 scheduled calls
- Use lead_scorer.py output to tailor pitch
- Document all call outcomes in HubSpot
- Next action: schedule site visit or send docs

### 2. Email Campaign Check-in
- Send follow-up to non-open rates (2+ days no open)
- Review performance by audience segment
- Prepare tomorrow's nurture sequence
- Check: open rates, bounce rates, unsubscribes

### 3. WhatsApp Engagement
- Review all unresolved conversations
- Trigger appropriate flows based on lead intent
- Hand off READY-TO-CLOSE leads to sales team
- Send daily performance summary to Slack

### 4. Advertiser Reporting
- Compile daily metrics for stakeholders  
- Update budget tracker
- Note any anomalies or issues
- Communicate changes to team

---

## IV. Evening Wrap-Up (21:00 PHT)

### 1. FX Rate Update
```bash
python3 scripts/fx_rates.py
```
- Fetches PHP-ILS and PHP-USD rates
- Updates `/config/fx_today.json`
- Re-calculates all asset valuations in multiple currencies

### 2. Daily Report Review
- Read generated daily report
- Identify winners (campaigns, creatives, audiences)
- Flag issues for next-day resolution
- Archive report for weekly analysis

### 3. Tomorrow's Prep
- Review scheduled calls and events
- Prepare call scripts and talking points
- Load new email sequences if applicable
- Check weather (affects guest bookings/properties)

### 4. Lead Handoff Summary
- Count CLOSED (purchase), ACTIVE (in process), NURTURE (pipeline)
- Identify urgent follow-ups for tomorrow
- Brief sales team on overnight messages
- Update team Slack channel

---

## V. Weekly Tasks (Every Monday 09:00 PHT)

### 1. Campaign Performance Analysis
- Aggregate 7-day metrics
- Calculate: ROAS, CAC, LTV, conversion rate
- Compare vs. targets from META-GOOGLE-ADS.md
- Document winners/losers in spreadsheet

### 2. Budget Reallocation
- Kill campaigns performing <2:1 ROAS
- Double budget to campaigns >4:1 ROAS
- Reallocate freed budget to performers
- Document all changes in CRM

### 3. Creative Refresh
- Review ad fatigue (CTR decline >20%)
- Launch new creative variants
- Pause high-frequency/low-engagement ads
- Test new angles, messaging, demographics

### 4. Lead Quality Review
- Analyze lead-to-qualified conversion rate
- Check: average deal size, close rate, time-to-close
- Identify which sources bring best leads
- Adjust source allocation accordingly

### 5. Team Sync
- 15-min standup: wins, blockers, priorities
- Review week 1-4 targets vs. actuals
- Plan week ahead
- Celebrate converted leads

---

## VI. Bi-Weekly Tasks (Every Thursday 14:00 PHT)

### 1. Compliance Check
- Review SHARED_RULES.md for forbidden words usage
- Audit Hebrew messaging (no explicit religious references)
- Verify all CTAs point to correct phone/WhatsApp
- Check landing pages for typos/accuracy

### 2. Financial Reconciliation
- Match expenses vs. budgets in spreadsheet
- Review lead acquisition costs trending
- Forecast remaining budget vs. runway
- Alert if >15% over budget

### 3. Partner Communication
- Update Blue Everest stakeholders on progress
- Share lead pipeline and close forecasts
- Discuss any operational issues
- Review next 2-week priorities

---

## VII. Key Metrics Dashboard

### Daily Targets
| Metric | Target | Alert if |
|--------|--------|----------|
| Impressions | 60K+ | <45K |
| Clicks | 3,000+ | <2,000 |
| CTR | >5% | <4% |
| CPC | <$0.50 | >$0.60 |
| Conversions | 15+ | <8 |
| Leads | 20+ | <12 |
| Qualified Leads | 5+ | <2 |
| Email Opens | >25% | <18% |
| WhatsApp Response Rate | 80%+ | <60% |

### Weekly Targets (Cumulative)
| Metric | Target | Status |
|--------|--------|--------|
| ROAS (Meta & Google) | 3.5:1+ | Monitor |
| CAC | <$200 | Monitor |
| Leads Generated | 140+ | Track |
| Qualified Leads | 35+ | Track |
| Site Visits Scheduled | 10+ | Track |
| Sales Closed | 3+ (target: 6 villas in 30 days) | Critical |

---

## VIII. Tools & Access

### Platform Access
- **Meta Ads Manager:** [business.facebook.com](https://business.facebook.com)
- **Google Ads:** [ads.google.com](https://ads.google.com)
- **Brevo Email:** [app.brevo.com](https://app.brevo.com)
- **WATI WhatsApp:** [wati.io](https://wati.io)
- **HubSpot CRM:** [hubspot.com](https://hubspot.com)
- **Google Analytics:** [analytics.google.com](https://analytics.google.com)
- **Zoom (for calls):** [zoom.us](https://zoom.us)
- **Calendly (scheduling):** [primevilla.ph/schedule](https://primevilla.ph/schedule)

### Phone Numbers
- **Support Line:** +639542555553
- **Sales (Alex):** +63{sales_phone_1}
- **Sales (Marcus):** +63{sales_phone_2}
- **Admin:** +63{admin_phone}

### Escalation Contacts
- **Campaign Issues:** Alex (Sales Lead)
- **Technical Issues:** Marcus (Tech Lead)
- **Compliance/Legal:** Blue Everest HQ
- **Urgent (24/7):** +639542555553

---

## IX. Emergency Procedures

### If CPC Spikes Unexpectedly
1. Check bid strategy (manual vs. automatic)
2. Review competitor activity
3. Check audience size (too small = high CPC)
4. Pause high-CPC ads, increase winners
5. Report to team Slack

### If Leads Dry Up
1. Check if campaigns paused/deleted accidentally
2. Verify budgets still allocated
3. Check if website down or forms broken
4. Review targeting (too narrow?)
5. Increase daily budget 20-30%

### If High-Value Lead Doesn't Respond
1. WhatsApp +639542555553 within 2 hours
2. Follow up via email (FLOW_10_FOLLOW_UP_ENGAGEMENT)
3. Schedule meeting via Calendly
4. If no response in 48h → ABANDONED sequence

### If Server/Platform Down
1. Document downtime start/end time
2. Pause auto-billing (if possible)
3. Notify team immediately
4. Switch to backup messaging channel (WhatsApp)
5. Log incident for post-mortem

---

## X. Handoff & Scale Plan

### Days 1-3: Launch
- ✅ All systems online, teams briefed
- ✅ Initial campaigns running, budgets allocated
- ✅ Lead flows active, WhatsApp monitored
- ✅ Email sequences begin

### Days 4-7: Optimization
- Kill underperformers (<2:1 ROAS)
- Double budget to winners (>4:1 ROAS)
- Refresh creative (test new angles)
- First closings begin

### Days 8-14: Scale
- Expand audiences based on performance
- Increase daily budget by 20-30%
- Launch consideration campaigns
- Pipeline building (5-10 HOT leads)

### Days 15-21: Conversion Focus
- Activate CONVERSION campaigns (IL-3, PH-3)
- Heavy WhatsApp qualification
- 3-5 site visits scheduled
- Sales team in overdrive

### Days 22-28: Final Push
- All campaigns live at full budget
- Retargeting pools activated
- Urgency messaging (limited supply)
- 2-3 closings expected

### Days 29-30: Closeout
- Final push for uncommitted leads
- Last-minute urgency messaging
- Target: 6 villas sold (both units)
- Transition to long-term nurture

---

**Last Updated:** 2026-04-14  
**Next Review:** 2026-04-21  
**Owner:** Alex (Sales Lead)  
**Approver:** Blue Everest Leadership  
