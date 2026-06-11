# Compound Expansion Email Drip Sequence
# Platform: Brevo
# Purpose: Announce compound expansion and nurture leads toward reservation

---

## Sequence A: Expansion Announcement (Existing Leads)

### Trigger
Manual send to all existing leads when renders are ready and Bar approves.

### Audience
- All leads in Brevo (both IL and PH segments)
- Segment by language: Hebrew for IL leads, English for PH/International

### Flow

```
Email 001: ANNOUNCEMENT
  |
  +-- Wait 2 days
  |
  +-- Did they open Email 001?
       |
       YES --> Email 002: PHASE2_DETAILS
       |         |
       |         +-- Wait 2 days
       |         |
       |         +-- Email 003: EARLY_ACCESS
       |                |
       |                +-- Wait 3 days
       |                |
       |                +-- Did they click any CTA?
       |                     |
       |                     YES --> Tag "compound_hot", alert sales
       |                     NO  --> Email 004: COMPOUND_ADVANTAGE
       |                               |
       |                               +-- Wait 4 days
       |                               |
       |                               +-- Email 005: URGENCY_CLOSE
       |                                     |
       |                                     +-- END SEQUENCE
       |
       NO --> Wait 3 days --> Resend Email 001 with alternate subject line
              |
              +-- Did they open?
                   YES --> Continue from Email 002
                   NO  --> Tag "compound_cold", END SEQUENCE
```

### Alternate Subject Lines (for resend)

**English:**
- Original: "Panglao Prime Villas is expanding: 4 new villas added to the compound"
- Resend: "Did you see this? Panglao Prime Villas now has 8 luxury villas"

**Hebrew:**
- Original: "פנגלאו פריים וילאס מתרחב: 4 וילות חדשות מצטרפות לקומפלקס"
- Resend: "ראית את זה? פנגלאו פריים וילאס עכשיו עם 8 וילות יוקרה"

---

## Sequence B: New Lead Welcome (Compound Era)

### Trigger
New lead submits form on blue-everest.com or WhatsApp inquiry captured in CRM.

### Flow

```
Immediate: Welcome email (compound version of existing Email 1)
  |
  +-- Wait 1 day
  |
  +-- Email: ROI + Compound Economics (compound version of existing Email 2)
  |
  +-- Wait 2 days
  |
  +-- Email: Lifestyle as Compound Resident (compound version of Email 3)
  |
  +-- Wait 3 days
  |
  +-- Email: Phase 2 Availability / Urgency (compound version of Email 4)
  |
  +-- Wait 4 days
  |
  +-- Email: Soft Close (compound version of Email 5)
  |
  +-- END SEQUENCE
```

### Key Changes from Original Sequence
1. "2 villas remaining" becomes "8-villa compound, 6 available"
2. Add compound economics in Email 2 (shared management, Airbnb ranking)
3. Email 3 adds community/neighborhood angle
4. Email 4 uses "Phase 1 demand" as urgency proof
5. All emails updated with compound messaging

---

## Brevo Configuration

### Lists
- `compound_all_leads` - All leads for compound campaign
- `compound_il` - Israeli segment (Hebrew emails)
- `compound_ph` - Philippine segment (English emails)
- `compound_hot` - Leads who clicked CTA (priority for sales)
- `compound_cold` - Leads who did not open after 2 sends

### Automation Rules
- Stop sequence if: lead replies to any email, lead books a call, lead status changes to "reserved"
- Do not send: more than 1 email per 2 days to any contact
- Send time: IL segment at 10:00 Israel time, PH segment at 10:00 PHT
- Exclude: leads tagged "unsubscribed" or "do_not_email"

### Tracking
- UTM parameters on all links: utm_source=brevo, utm_medium=email, utm_campaign=compound_expansion
- Track: opens, clicks, replies, WhatsApp CTA clicks
- Report metrics to: `_completed/YYYY-MM-DD/email_metrics.json`

---

## Content Rules Reminder
- IL emails: ILS only for prices, 3 legal solutions, both WhatsApp numbers
- PH emails: PHP only, BDO financing mention, both WhatsApp numbers
- Every email: at least one specific number, no forbidden words, no em/en dashes
