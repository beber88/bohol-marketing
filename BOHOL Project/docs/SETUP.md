# PANGLAO PRIME VILLAS - PLATFORM SETUP GUIDE

Complete deployment checklist for all campaign platforms.
Source files: VILLA-MARKETING-SKILL.md, CRM-LEAD-SCORING.md, WHATSAPP-FLOWS.md, EMAIL-SEQUENCE.md, META-GOOGLE-ADS.md, CAMPAIGN-ISRAEL.md, CAMPAIGN-PHILIPPINES.md.

---

## 1. META ADS MANAGER

### 1.1 Pixel and Tracking

- Install Meta Pixel on primevilla.ph
- Configure standard events: PageView, ViewContent, Lead, Contact
- Create Custom Conversions:
  - "WhatsApp Click" (URL contains wa.me)
  - "Form Submit" (thank you page view)
  - "ROI Calculator Used" (URL contains #investment)
- Verify pixel fires on all pages before launching ads

### 1.2 Campaign Structure - ISRAEL

**Campaign IL-1: Awareness**
- Objective: Traffic / Brand Awareness
- Budget: $20/day
- Audience:
  - Geo: Israel
  - Age: 35-62
  - Language: Hebrew
  - Interests: Real estate investment, Airbnb host, Business owners, Luxury travel, Philippines travel, Investment portfolio
  - Behaviors: Frequent international travelers, Small business owners, Engaged shoppers
- Placements: Facebook Feed, Instagram Feed, Instagram Reels
- Schedule: Sunday-Thursday only, 20:00-23:00 Israel time
- Ad sets: 2 (A/B test hooks), 2 ads per set
- Ads: A1 (Israeli angle), A2 (price/value angle), A3 (Reel)

**Campaign IL-2: Consideration (Retargeting)**
- Objective: Lead Generation
- Budget: $15/day
- Audience: Website visitors + ad engagers + 1% Lookalike from primevilla.ph visitors (Israel)
- Ads: B1 (Social Proof + Legal), B2 (Carousel 5 cards)

**Campaign IL-3: Conversion (WhatsApp)**
- Objective: Messages (WhatsApp)
- Budget: $10/day
- Audience: HOT retarget - visited primevilla.ph 2+ minutes, did not convert
- Ads: C1 (Urgency + WhatsApp CTA)

**Israel Total Meta Budget: $45/day**

### 1.3 Campaign Structure - PHILIPPINES

**Campaign PH-1: Awareness**
- Objective: Reach / Brand Awareness
- Budget: $15/day
- Audience:
  - Geo: Metro Manila (BGC, Makati, Alabang, Ortigas, San Juan), Cebu City, Davao
  - Age: 38-58 (primary Manila), 35-55 (secondary Cebu)
  - Job titles: CEO, President, Managing Director, Business Owner, Entrepreneur
  - Interests: Real estate Philippines, Investment properties, Bohol travel
  - Behaviors: Frequent domestic travelers, Luxury travel intent, High net worth signals
- Placements: Facebook Feed (primary for 38+ professionals), Instagram Feed, Instagram Reels
- Schedule: Tuesday-Thursday priority, 7pm-11pm PHT
- Ads: 1A English (Status), 1A Tagalog variant, 1B (Reel Script)

**Campaign PH-2: Consideration**
- Objective: Conversions / Leads
- Budget: $10/day
- Audience: Website visitors + Lookalike from site traffic (PH)
- Ads: 2A (Investment Comparison), 2B (Carousel 5 cards)

**Campaign PH-3: Conversion**
- Objective: Messages / Lead Generation
- Budget: $8/day
- Audience: HOT retarget - PH visitors 2+ min, no form submit
- Ads: 3A (Scarcity English), 3B (Tagalog Urgency)

**Philippines Total Meta Budget: $33/day**

**Note:** Israel $45 + Philippines $33 = $78/day. Remaining $2/day kept as buffer or added to best performer.

### 1.4 Ad Testing Rules (from META-GOOGLE-ADS.md)

| Rule | Threshold |
|---|---|
| Minimum test duration | 3 days per variation |
| Minimum impressions before decision | 1,000 |
| Kill ad if CPM above | $18 |
| Kill ad if CTR below | 0.8% |
| Scale ad if CTR above | 3% (double budget) |
| Never change simultaneously | Image + copy (isolate variables) |

### 1.5 Hook Testing Protocol (from MASTER-HOOKS.md)

- Run each hook 3 days minimum before judging
- Kill hook if CPM above $15 or CTR below 1.5%
- Scale hook if CTR above 3% or CPL below $30
- Always test 2 hooks per ad set simultaneously (A/B)

---

## 2. GOOGLE ADS

### 2.1 Account Setup

- Create Google Ads account linked to primevilla.ph
- Install Google Tag on primevilla.ph
- Configure conversions: Form Submit, WhatsApp Click, Phone Call
- Set up Google Analytics 4 integration
- Budget: $25/day (Philippines market only)

### 2.2 Ad Groups

**Ad Group 1 - Direct Buyer Intent**
- Keywords: buy villa Bohol, villa for sale Panglao, luxury villa Bohol Philippines, beachfront villa Philippines, beachfront property Bohol
- RSA: 10 headlines + 4 descriptions (see META-GOOGLE-ADS.md)
- Bid strategy: Maximize conversions

**Ad Group 2 - Investment Intent**
- Keywords: property investment Philippines ROI, Airbnb investment Philippines, real estate Bohol 2025, best property investment Philippines, Philippines villa rental income
- RSA: 10 headlines + 4 descriptions (see META-GOOGLE-ADS.md)

**Ad Group 3 - Competitor / Alternative**
- Keywords: Boracay property investment, Siargao villa for sale, Phuket vs Philippines investment, SEA beach property
- RSA: 10 headlines + 4 descriptions (see META-GOOGLE-ADS.md)

### 2.3 Extensions

**Sitelinks:**
1. "Download Investment Report" - primevilla.ph/#reserve
2. "View Floor Plans" - primevilla.ph/#villas
3. "ROI Calculator" - primevilla.ph/#investment
4. "WhatsApp Us Now" - wa.me/+639542555553

**Callout Extensions:**
- Only 2 Villas Remaining
- PHP 200,000 Reserves Your Villa
- BDO Bank Financing Available
- Foreign Buyer Legal Support

**Structured Snippets:**
- Type: Amenities
- Values: Private Pool, Rooftop Jacuzzi, 4 Bedrooms, Outdoor Kitchen, Sea View, Airbnb Management

**Philippines-specific Sitelinks (additional):**
1. "BDO Financing Details" - primevilla.ph/#investment
2. "View Floor Plans" - primevilla.ph/#villas
3. "ROI Calculator" - primevilla.ph/#investment
4. "WhatsApp Now" - wa.me/+639542555553

**Philippines Callout Extensions:**
- BDO Bank Financing Available
- PHP 200,000 Reservation Fee
- Professional Airbnb Management
- Only 2 Villas Remaining

---

## 3. WATI.io (WhatsApp Automation)

### 3.1 Account Setup

Source: WHATSAPP-FLOWS.md

- [ ] Create WATI account and connect +639542555553
- [ ] Upload team member profiles (sales agents)
- [ ] Set business hours: Mon-Sat 9am-6pm PHT (UTC+8)
- [ ] Set away message for off-hours: auto-reply with "we'll respond by 9am"

### 3.2 Upload Materials

- [ ] Upload PDF: investment package (from primevilla.ph)
- [ ] Upload PDF: floor plans (separate PDF per villa)
- [ ] Upload PDF: legal alternatives guide

### 3.3 Configure Flows

**Flow 1 - Inbound Welcome (default):**
Trigger: Any new message. Delay: immediate (within 30 seconds).
Menu: 5 options (Investment, Specs, Pricing, Foreign Buyers, Schedule Call).
Full response content for each option in WHATSAPP-FLOWS.md.

**Flow 2 - Follow-up 3 Hours:**
Trigger: Lead sent first message, received welcome, no reply for 3 hours.
Send once only. Asks investment vs personal use vs both.

**Flow 3 - Follow-up 24 Hours:**
Trigger: No reply for 24 hours. Send once only.
Inventory update + YES/LATER response options.

**Flow 4 - HOT Lead Escalation:**
Trigger: User asks about reservation fee, payment timeline, "how do I reserve", sends passport/ID, or requests contract.
Action: Immediately notify sales agent via separate WhatsApp message.

**Flow 5 - Broadcast to Warm List:**
Use: Leads who went cold (7+ days no response).
Schedule: Tuesday or Thursday, 10am-12pm recipient's local time.
Two versions: English (investment angle) and Hebrew (Israeli market).

### 3.4 Integration

- [ ] Connect WATI to HubSpot via Zapier or native integration
- [ ] Create HOT LEAD tag and escalation alert
- [ ] Test all flows end-to-end before going live

---

## 4. BREVO (Email Automation)

### 4.1 Account Setup

Source: EMAIL-SEQUENCE.md

- Create Brevo account
- Verify sending domain for info@blueprint-ph.com
- Set From name: "Panglao Prime Villas"
- Set Reply-to: info@blueprint-ph.com

### 4.2 Email Sequence Configuration

- Trigger: Form submission on primevilla.ph OR WhatsApp opt-in
- Duration: 5 days
- Send time: 9:00 AM recipient's local time

| Email | Timing | Focus |
|---|---|---|
| Email 1 | Immediate | Full overview + investment package |
| Email 2 | Day 2 (24h after Email 1) | ROI data + 5-year math |
| Email 3 | Day 3 | Lifestyle + ownership experience |
| Email 4 | Day 4 | Urgency + inventory update |
| Email 5 | Day 5 | Soft close + call offer |

### 4.3 Stop Conditions

Pause sequence immediately if:
- Lead clicks "Book a Call" (Calendly) - assign to sales, tag HOT
- Lead replies to any email - assign to sales agent within 1 hour
- Lead submits form again - merge contact, update status
- Lead sends WhatsApp message - tag ACTIVE, pause email

### 4.4 Branch Conditions

- Email 2 opened AND ROI link clicked: send Email 3 at Day 2.5 (accelerate)
- Email 1 not opened after 4 hours: resend with alternate subject line
- Email 4 opened 3+ times: alert sales agent immediately (HOT signal)

### 4.5 Auto Tags

| Condition | Tag |
|---|---|
| Form submitted | SOURCE=website |
| Opened all 5 emails | ENGAGED |
| Clicked WhatsApp 2+ times | WHATSAPP-INTENT |
| Downloaded PDF | DOWNLOADED |
| Opened Email 4 multiple times | HOT-URGENCY |

### 4.6 A/B Testing

Each email has 2-3 subject line options. Configure A/B test on subject lines for Email 1 first:
- A: "Your Panglao villa package is here"
- B: "PHP 395,000/month - here's how it works"
- C: "Welcome to Panglao Prime Villas - full details inside"

Winner criteria: Open rate after 4 hours, then apply to full list.

---

## 5. HUBSPOT CRM

### 5.1 Custom Contact Properties

Source: CRM-LEAD-SCORING.md

Create in Settings > Properties > Contact Properties:

| Property Name | Type | Options |
|---|---|---|
| Villa Interest | Dropdown | Villa C, Villa D, Both, Undecided |
| Purpose | Dropdown | Investment, Personal Use, Both |
| Budget Confirmed | Dropdown | Yes - PHP 32.5M, Yes - PHP 35M, Yes - Either, Not confirmed |
| Lead Source | Dropdown | Meta Ad, Google Ad, WhatsApp Direct, Referral, Organic Search, Email |
| Lead Score | Number | Auto-calculated |
| Lead Status | Dropdown | Cold, Warm, Hot, Reserved, Closed, Lost |
| Nationality | Dropdown | Israeli, Filipino, American, UAE-based, Singaporean, European, Other |
| Preferred Language | Dropdown | English, Hebrew, Filipino, Other |
| Sales Agent Assigned | Dropdown | [Agent names] |
| Last Contact Date | Date | Auto-updated |
| Follow-up Date | Date | Set manually |
| WhatsApp Active | Checkbox | True/False |
| PDF Downloaded | Checkbox | True/False |
| Call Completed | Checkbox | True/False |
| Calendly Link Clicked | Checkbox | True/False |
| Reservation Fee Discussed | Checkbox | True/False |

### 5.2 Lead Scoring Rules

**Status Thresholds:**

| Score | Status | Action |
|---|---|---|
| 0-30 | COLD | Automated email sequence only. No manual contact. |
| 31-70 | WARM | Sales agent reviews profile. Optional personal WhatsApp. |
| 71-120 | HOT | Sales agent contacts within 2 hours. Priority. |
| 121+ | VERY HOT | Sales agent calls immediately. All hands on deck. |

Full scoring point values in CRM-LEAD-SCORING.md (website, email, WhatsApp, and profile scoring categories).

### 5.3 Pipeline

Pipeline Name: "Panglao Prime Villas - 30 Day Close"

| Stage | Name | Probability |
|---|---|---|
| 1 | New Lead | 5% |
| 2 | Contacted | 15% |
| 3 | Qualified | 30% |
| 4 | Proposal Sent | 50% |
| 5 | Reservation Discussed | 70% |
| 6 | Agreement Signed | 85% |
| 7 | Reservation Fee Received | 95% |
| 8 | Closed - Won | 100% |
| 9 | Closed - Lost | 0% |

### 5.4 Automated Workflows

**Workflow 1 - New Lead Welcome:**
Trigger: Contact created (form submission).
Actions: Enroll in Brevo email sequence (Zapier), create deal stage 1, assign agent (round robin), internal notification, set 24h follow-up task.

**Workflow 2 - HOT Lead Alert:**
Trigger: Lead score reaches 71.
Actions: Change status to HOT, WhatsApp alert to agent, email alert with full profile, urgent task "Contact within 2 hours", stop automated email, add HOT tag.

**Workflow 3 - No Activity Warning:**
Trigger: Score 30+, no activity 7 days.
Actions: Change status to "At Risk", send re-engagement email (Email 4 variation), notify agent.

**Workflow 4 - Post-Call:**
Trigger: Call Completed = True.
Actions: Move to stage 3 or 4, auto follow-up email (1 hour after), 48h reminder task.

---

## 6. ZAPIER CONNECTIONS

Source: CRM-LEAD-SCORING.md

### Zap 1: Website Form to HubSpot
- Trigger: New form submission on primevilla.ph
- Action 1: Create/update HubSpot contact with all form fields
- Action 2: Enroll contact in Brevo email sequence
- Action 3: Send WhatsApp notification to sales agent

### Zap 2: WATI to HubSpot
- Trigger: New WhatsApp conversation in WATI
- Action 1: Create/update HubSpot contact
- Action 2: Add WhatsApp number to contact
- Action 3: Tag as "WhatsApp Source"
- Action 4: Add 30 points to lead score

### Zap 3: HubSpot HOT Lead to WhatsApp
- Trigger: Lead score exceeds 71
- Action: Send WhatsApp message to sales agent with HOT LEAD ALERT template

### Zap 4: Calendly to HubSpot
- Trigger: New Calendly booking
- Action 1: Update HubSpot contact to pipeline stage 4
- Action 2: Add 35 points to score
- Action 3: Tag "Call Scheduled"
- Action 4: Send confirmation email to lead

---

## 7. PRE-LAUNCH CHECKLIST

### Technical
- [ ] Meta Pixel firing on all primevilla.ph pages
- [ ] Google Tag installed and conversions tracking
- [ ] WhatsApp button on primevilla.ph links to wa.me/+639542555553
- [ ] Form submission triggers Zapier to HubSpot + Brevo
- [ ] All WATI flows tested end-to-end
- [ ] Brevo emails rendering correctly (desktop + mobile)
- [ ] Hebrew emails render RTL correctly
- [ ] All PDFs uploaded to WATI (investment package, floor plans, legal guide)

### Content
- [ ] All ad copy files in /assets/ads/ match source files
- [ ] WhatsApp flows in /assets/whatsapp/ match WHATSAPP-FLOWS.md
- [ ] Email templates in /assets/email/ match EMAIL-SEQUENCE.md
- [ ] Landing page copy in /assets/landing/ ready
- [ ] No forbidden words in any asset (amazing, incredible, dream home, once in a lifetime)
- [ ] Every asset includes at least one specific number from VILLA-MARKETING-SKILL.md
- [ ] Every Israeli asset mentions 3 legal solutions
- [ ] Every Filipino asset mentions BDO Bank financing

### Operations
- [ ] Sales agents briefed on HOT LEAD protocol (contact within 2 hours)
- [ ] Calendly booking page created and linked
- [ ] Morning dashboard routine documented (see DAILY_OPS.md)
- [ ] HubSpot pipeline visible to all team members
- [ ] Brevo and WATI access shared with team

---

## 8. BUDGET SUMMARY

| Platform | Market | Daily | 30-Day |
|---|---|---|---|
| Meta Ads - Israel | IL | $45 | $1,350 |
| Meta Ads - Philippines | PH | $33 | $990 |
| Google Search Ads | PH | $25 | $750 |
| Buffer / Scaling | Both | $2 | $60 |
| **Total** | | **$80** | **$2,400** |

---

## 9. KPI TARGETS

### Israel Campaign

| Metric | Target |
|---|---|
| Cost per lead | Below $40 |
| CTR | Above 2% |
| WhatsApp response rate | Above 50% |
| Cost per WhatsApp conversation | Below $20 |
| Hebrew email open rate | Above 40% |

### Philippines Campaign

| Metric | Target |
|---|---|
| Cost per lead | Below PHP 2,000 ($35) |
| CTR (Feed) | Above 1.5% |
| WhatsApp response rate | Above 45% |
| Cost per call | Below PHP 5,000 |
| Google Search CPL | Below PHP 3,000 |

### Overall Weekly Targets (from CRM-LEAD-SCORING.md)

| Metric | Target |
|---|---|
| New leads per week | 20+ |
| Cost per lead | Under PHP 1,500 |
| HOT leads per week | 5+ |
| Calls booked per week | 3+ |
| Reservation discussions per week | 2+ |
| Email open rate | 35%+ |
| WhatsApp response rate | 40%+ |
