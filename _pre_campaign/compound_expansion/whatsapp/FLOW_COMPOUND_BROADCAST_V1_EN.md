# WhatsApp Broadcast - English (PH + International)
# Platform: WATI
# Audience: All existing leads (English segment)
# Timing: Send when renders arrive and Bar approves
# Note: Must be approved as WATI template message first

---

## Template Name: compound_expansion_en_v1

## Header
Panglao Prime Villas - Compound Update

## Body

Hi {{1}}, important update from Panglao Prime Villas.

Following Phase 1 demand, we are expanding the compound: 4 new luxury villas joining the project.

Phase 1 results:
- 2 villas sold
- PHP 395,000/month verified per villa
- 17-25% annual ROI
- 65% occupancy rate

Phase 2: 4 new villas (E, F, G, H). Same specs: 4 bedrooms, 263.78 sqm, private pool, rooftop jacuzzi.

Total compound: 8 luxury villas between JW Marriott and Mithi Resort, 60 seconds from Panglao Beach.

Existing contacts get first access to Phase 2 pricing.
BDO Bank financing available.

Reply PHASE2 for full details.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865

## Footer
Blue Everest Asset Group Holding Inc.

## Buttons
- Quick Reply: "PHASE2"
- Quick Reply: "Call me"

---

## WATI Configuration
- Template category: MARKETING
- Language: English
- Variables: {{1}} = contact first name
- Send time: 10:00 AM PHT (for PH leads) / 10:00 AM recipient timezone
- Exclude: contacts tagged "unsubscribed", "do_not_contact"
- Follow-up: If reply "PHASE2", trigger FLOW_COMPOUND_03_PHASE2_INFO
- Follow-up: If reply "Call me", alert sales team with HOT priority
