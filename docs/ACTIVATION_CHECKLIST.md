# ACTIVATION CHECKLIST - Panglao Prime Villas Meta Ads

Created: 2026-05-22
Status: SIMULATION - NOT LIVE

---

## BEFORE GOING LIVE - YOU MUST DO THESE (Manual Actions)

### BLOCKER 1: Link Facebook Page to Ad Account
**Priority: CRITICAL - without this, no ads can be created**

1. Go to https://business.facebook.com/settings/
2. Select business: "Blue Everest Asset Group"
3. Click "Ad Accounts" in left menu
4. Find ad account "Blue Everest - Panglao Prime Villas" (ID: 2015125296073673)
5. Click on it, then click "Add Pages"
6. Search for "Blue Everest Asset Group" page (ID: 1091251924067685)
7. Link it

**Verify:** After linking, the page should appear when you go to Ads Manager > create new ad > select page.

---

### BLOCKER 2: Install Meta Pixel on primevilla.ph
**Priority: CRITICAL - without this, no tracking or retargeting**

Send this to your website developer (full code already in `_completed/2026-04-18/developer_message.md`):

Pixel ID: `1599211187973958`

The developer needs to add the pixel base code to the `<head>` of every page on primevilla.ph, plus:
- `fbq('track', 'Lead')` on form submission
- `fbq('track', 'Contact')` on WhatsApp button click

**Verify:** Go to Meta Events Manager > select pixel > Test Events > open primevilla.ph > you should see PageView events.

---

### BLOCKER 3: Install GA4 on primevilla.ph
**Priority: HIGH - without this, no Google Analytics**

GA4 ID: `G-04NZJT2C4V`

Developer adds the gtag.js code to `<head>` (code in developer_message.md).

**Verify:** Go to Google Analytics > Real-time > open primevilla.ph > you should see 1 active user.

---

### BLOCKER 4: Upload Creatives to Meta Ads Manager
**Priority: CRITICAL - without this, no ads can run**

1. Go to Meta Ads Manager > Ad Account: "Blue Everest - Panglao Prime Villas"
2. Go to "Media" or create a new campaign to access the upload dialog
3. Upload these images from the project folder:

| # | File | Purpose |
|---|------|---------|
| 1 | EXTERIOR - D5/LATEST RENDERS - EXTERIOR/AERIAL 1_AI ENHANCED.png | IL-1 + PH-1 Awareness |
| 2 | EXTERIOR - D5/LATEST RENDERS - EXTERIOR/REAR 1_AI ENHANCED.png | IL-1 + PH-1 Awareness |
| 3 | EXTERIOR - D5/LATEST RENDERS - EXTERIOR/FRONT 3_AI ENHANCED.png | Pillar posts |
| 4 | INTERIOR D5/Ground Floor/Living Room 1.png | Consideration |

4. Upload these videos:

| # | File | Size | Purpose |
|---|------|------|---------|
| 1 | video/20260416 BLUEEVEREST 1 Villas Bohol 2.mp4 | ~70MB | Main villa walkthrough |
| 2 | video/20260416 BLUEEVEREST 2 Villas Bohol 2.mp4 | ~93MB | Second villa showcase |
| 3 | video/VIDEO-2026-04-27-02-29-12.mp4 | ~25MB | ROI video |
| 4 | video/VIDEO-2026-04-22-18-09-24.mp4 | ~44MB | IL market consideration |
| 5 | video/VIDEO-2026-04-22-18-09-41.mp4 | ~39MB | Conversion video |

---

## AFTER BLOCKERS RESOLVED - Campaign Creation Steps

Once all 4 blockers are resolved, tell Claude Code "blockers resolved, create campaigns" and the following will be created automatically via Meta API:

### Campaign IL-1: Israel Awareness (PAUSED)
- Objective: Traffic or Awareness
- Special Ad Category: HOUSING
- Daily budget: PHP 1,200 (~$20)
- Targeting: Israel, Hebrew, Real estate + Investment interests
- Age: 18-65+ (HOUSING restriction)
- Placements: FB Feed, IG Feed, IG Reels
- 2 ad sets (A/B test), 2-3 ads each
- Copy: Hebrew from ALL_POST_COPY_V3.json (campaign_ids 1, 3, 5)

### Campaign PH-1: Philippines Awareness (PAUSED)
- Objective: Traffic or Awareness
- Special Ad Category: HOUSING
- Daily budget: PHP 850 (~$15)
- Targeting: Philippines (Metro Manila, Cebu, Davao), English, Real estate interests
- Age: 18-65+ (HOUSING restriction)
- Placements: FB Feed, IG Feed, IG Reels
- 2 ad sets (A/B test), 2-3 ads each
- Copy: English from ALL_POST_COPY_V3.json (campaign_ids 2, 4, 6)

### Total daily spend when active: PHP 2,050 (~$35 for Awareness only)

---

## GO LIVE SEQUENCE

When you say "go live":

1. Claude Code activates IL-1 campaign via API
2. Claude Code activates PH-1 campaign via API
3. Campaign state updated: simulation=false, phase=AWARENESS_LAUNCH
4. Ads enter Meta review (24-48 hours)
5. First impressions start after approval
6. Monitor first 72 hours closely

---

## DAY 1-3 MONITORING (After Go Live)

Check daily at 8:00 AM PHT:
- [ ] Are all ads approved by Meta? (check Ads Manager for "Active" status)
- [ ] Any ads rejected? (common: HOUSING policy issues, image text ratio)
- [ ] Impressions started?
- [ ] Any clicks to primevilla.ph?
- [ ] Pixel firing? (check Events Manager)
- [ ] Any WhatsApp messages received?
- [ ] Budget pacing on track?

### Kill Criteria (from 30_DAY_PLAN.md)
- CPM above $18: Kill immediately
- CTR below 0.8%: Kill immediately
- No leads after $100 spent on any ad set: Kill and restructure

### Scale Criteria
- CTR above 3%: Double budget
- CPL below $30: Double budget

---

## PHASE 2 CAMPAIGNS (Day 8+, after pixel data)

After 7 days of awareness, create:
- IL-2 Consideration (retarget website visitors): $15/day
- PH-2 Consideration (retarget website visitors): $10/day
- Custom audiences from pixel data
- Lookalike audiences from converters

---

## KEY IDs REFERENCE

| Item | ID |
|------|-----|
| Ad Account | 2015125296073673 |
| Business | 1091269377399273 |
| Facebook Page | 1091251924067685 |
| Meta Pixel | 1599211187973958 |
| GA4 | G-04NZJT2C4V |
| Website | primevilla.ph |
| WhatsApp Marketing | +639542555553 |
| WhatsApp Office | +639958565865 |

---

## FILES UPDATED IN THIS SESSION (2026-05-22)

| File | What Changed |
|------|-------------|
| config/fx_today.json | FX rates updated to 22/05/2026 (ILS rate dropped 7%) |
| assets/ads/v3_post_copy/ALL_POST_COPY_V3.json | All Hebrew copy: PHP primary, ILS at daily FX with date |
| _status/campaign_state.json | Correct ad account ID, page ID, pixel status, blockers list |
| docs/ORGANIC_CONTENT_CALENDAR.md | NEW - 10 organic posts for 3 weeks |
| docs/ACTIVATION_CHECKLIST.md | NEW - this file |
