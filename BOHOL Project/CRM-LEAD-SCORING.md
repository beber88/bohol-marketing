# PANGLAO PRIME VILLAS - CRM & LEAD SCORING SYSTEM
# Platform: HubSpot Free
# Purpose: Track, score, and close 2 villa sales in 30 days

---

## CUSTOM CONTACT PROPERTIES

Create these in HubSpot: Settings > Properties > Contact Properties > Create Property

| Property Name | Type | Options |
|---|---|---|
| Villa Interest | Dropdown | Villa C, Villa D, Both, Undecided |
| Purpose | Dropdown | Investment, Personal Use, Both |
| Budget Confirmed | Dropdown | Yes - PHP 32.5M, Yes - PHP 35M, Yes - Either, Not confirmed |
| Lead Source | Dropdown | Meta Ad, Google Ad, WhatsApp Direct, Referral, Organic Search, Email |
| Lead Score | Number | Auto-calculated (see below) |
| Lead Status | Dropdown | Cold, Warm, Hot, Reserved, Closed, Lost |
| Nationality | Dropdown | Israeli, Filipino, American, UAE-based, Singaporean, European, Other |
| Preferred Language | Dropdown | English, Hebrew, Filipino, Other |
| Sales Agent Assigned | Dropdown | [Agent names] |
| Last Contact Date | Date | Auto-updated |
| Follow-up Date | Date | Set manually by agent |
| WhatsApp Active | Checkbox | True/False |
| PDF Downloaded | Checkbox | True/False |
| Call Completed | Checkbox | True/False |
| Calendly Link Clicked | Checkbox | True/False |
| Reservation Fee Discussed | Checkbox | True/False |

---

## LEAD SCORING SYSTEM

### Positive Score Rules

**Behavioral (Website):**
| Action | Points |
|---|---|
| Visited primevilla.ph | +10 |
| Visited 2+ times | +10 (additional) |
| Visited 3+ times | +10 (additional) |
| Time on site 2+ minutes | +10 |
| Time on site 5+ minutes | +15 |
| Clicked ROI calculator | +15 |
| Visited villa specs section | +10 |
| Downloaded PDF | +20 |
| Clicked WhatsApp button (site) | +30 |
| Submitted inquiry form | +40 |

**Behavioral (Email):**
| Action | Points |
|---|---|
| Opened Email 1 | +5 |
| Clicked link in Email 1 | +10 |
| Opened Email 2 | +5 |
| Clicked ROI link in Email 2 | +15 |
| Opened Email 4 (urgency) | +10 |
| Opened Email 4 twice | +15 (additional) |
| Replied to any email | +40 |
| Clicked Calendly link | +35 |

**Behavioral (WhatsApp):**
| Action | Points |
|---|---|
| Sent first WhatsApp message | +30 |
| Selected "Investment details" (Flow 1.1) | +20 |
| Selected "Schedule a call" (Flow 1.5) | +35 |
| Asked about reservation fee | +45 |
| Asked about payment timeline | +40 |
| Requested contract/agreement | +50 |
| Sent ID or passport document | +60 |

**Profile (Demographic):**
| Factor | Points |
|---|---|
| Country: Israel, UAE, Singapore, USA | +10 |
| Purpose: Investment | +10 |
| Purpose: Both | +5 |
| Budget: Confirmed PHP 32.5M or 30M | +25 |

### Negative Score Rules (decay)
| Factor | Points |
|---|---|
| No email open after 7 days | -10 |
| Unsubscribed from email | -50 |
| Replied "not interested" | -100 |
| No activity for 14 days | -20 |

---

## LEAD STATUS THRESHOLDS

| Score | Status | Action Required |
|---|---|---|
| 0-30 | COLD | Automated email sequence only. No manual contact. |
| 31-70 | WARM | Sales agent reviews profile. Optional personal WhatsApp. |
| 71-120 | HOT | Sales agent contacts within 2 hours. Priority. |
| 121+ | VERY HOT | Sales agent calls immediately. All hands on deck. |

---

## PIPELINE STAGES

Create this pipeline in HubSpot: Sales > Pipelines > Create Pipeline

**Pipeline Name:** "Panglao Prime Villas - 30 Day Close"

| Stage | Name | Probability | Action Required |
|---|---|---|---|
| 1 | New Lead | 5% | Auto-email sequence starts |
| 2 | Contacted | 15% | Sales agent made first contact |
| 3 | Qualified | 30% | Budget + timeline confirmed |
| 4 | Proposal Sent | 50% | Full investment PDF sent, call scheduled |
| 5 | Reservation Discussed | 70% | PHP 200K fee discussed, process explained |
| 6 | Agreement Signed | 85% | Reservation agreement sent |
| 7 | Reservation Fee Received | 95% | PHP 200,000 transfer confirmed |
| 8 | Closed - Won | 100% | Full purchase agreement signed |
| 9 | Closed - Lost | 0% | Note reason, set 6-month follow-up |

---

## AUTOMATED WORKFLOWS

### Workflow 1 - New Lead Welcome
Trigger: Contact created (form submission)
Actions:
1. Enroll in Brevo email sequence (via Zapier)
2. Create deal in pipeline stage 1
3. Assign to available sales agent (round robin)
4. Send internal notification to agent: "New lead - [Name] from [Country]"
5. Set follow-up task: "Review lead in 24 hours"

### Workflow 2 - HOT Lead Alert
Trigger: Lead score reaches 71
Actions:
1. Change Lead Status to HOT
2. Send WhatsApp to sales agent: [HOT LEAD ALERT template]
3. Send email to sales agent with full lead profile
4. Create urgent task: "Contact within 2 hours"
5. Stop automated email sequence
6. Add HOT tag to contact

### Workflow 3 - No Activity Warning
Trigger: Lead score 30+, no activity for 7 days
Actions:
1. Change status to "At Risk"
2. Send re-engagement email (Email 4 variation)
3. Notify agent: "Lead going cold - [Name]"

### Workflow 4 - Post-Call
Trigger: "Call Completed" property = True
Actions:
1. Move to pipeline stage 3 (Qualified) or 4 (Proposal Sent)
2. Send follow-up email automatically (1 hour after call)
3. Set reminder task for agent: "Follow up in 48 hours"

---

## DAILY AGENT REPORT (Check Every Morning, 8am PHT)

### Morning Dashboard - What to Check

1. HOT leads (score 71+): How many? Did you contact within 2 hours yesterday?
2. Pipeline stage 5+ (Reservation Discussed): Where is each? What's the next action?
3. New leads from last 24 hours: Source? Score? Any immediate follow-up needed?
4. Scheduled calls today: Confirmed? Materials ready?
5. WhatsApp unread messages: Any replied after hours?

### Weekly KPIs (Check Every Friday)

| Metric | Target | Current |
|---|---|---|
| New leads this week | 20+ | |
| Cost per lead | Under PHP 1,500 | |
| HOT leads this week | 5+ | |
| Calls booked | 3+ | |
| Reservation discussions | 2+ | |
| Emails: Open rate | 35%+ | |
| WhatsApp: Response rate | 40%+ | |

---

## ZAPIER CONNECTIONS (Automation Links)

### Zap 1: Website Form to HubSpot
Trigger: New form submission on primevilla.ph
Action: Create/update HubSpot contact with all form fields
Action: Enroll contact in Brevo email sequence
Action: Send WhatsApp notification to sales agent

### Zap 2: WATI to HubSpot
Trigger: New WhatsApp conversation in WATI
Action: Create/update HubSpot contact
Action: Add WhatsApp number to contact
Action: Tag as "WhatsApp Source"
Action: Add 30 points to lead score

### Zap 3: HubSpot HOT Lead to WhatsApp
Trigger: Lead score in HubSpot exceeds 71
Action: Send WhatsApp message to sales agent WhatsApp number
Message: [HOT LEAD ALERT template]

### Zap 4: Calendly to HubSpot
Trigger: New Calendly booking
Action: Update HubSpot contact to pipeline stage 4
Action: Add 35 points to score
Action: Tag "Call Scheduled"
Action: Send confirmation email to lead

---

## CONTACT ENRICHMENT

When a new lead comes in, research manually or via Apollo.io:
- LinkedIn profile (confirms professional background)
- Company and role (helps qualify investment capacity)
- Other properties owned (if visible)
- Nationality confirmed (for legal structure recommendation)

Add notes to HubSpot contact within 2 hours of lead creation.

---

## CLOSING SCRIPT (Phone/Video Call)

**Opening (2 min):**
"Thank you for taking the time. I have everything ready - the floor plans, the Airbnb data, and the legal options. Before I walk you through everything, can I ask - what's the main thing you want to understand before you can make a decision today?"

**Listen. Note the objection.**

**Middle (8 min):**
Address their specific concern first.
Then walk through:
1. The specific villa they're interested in (C or D)
2. The income projection for their situation
3. The legal structure that fits their profile
4. The payment timeline mapped to their cash flow

**Close (5 min):**
"Based on everything we've discussed, does this make sense for your situation?"

If YES: "The next step is simple. A PHP 200,000 reservation fee secures your villa and freezes the price while we prepare the agreement. I can send the reservation form to your email right now - it takes about 10 minutes to review. Shall I send it?"

If MAYBE: "What's the one thing that would make this a clear yes for you?"

If NO: "I appreciate your honesty. What would have to change for this to work for you in the future?" (Set 90-day follow-up)

---

## LOST LEAD FOLLOW-UP (30/60/90 Days)

For every lost lead, set:
- 30-day follow-up: "Checking in - are you still considering property investment in SEA?"
- 60-day follow-up: "Market update from Panglao - tourism numbers are up again"
- 90-day follow-up: Final check - "We're starting a new project in Panglao. Would you like early access?"
