#!/usr/bin/env npx tsx
/**
 * WATI WhatsApp Setup Script - Panglao Prime Villas
 *
 * Creates template messages via WATI API.
 * Prints manual setup instructions for keyword automations and business hours.
 *
 * Usage: npx tsx scripts/setup-wati.ts
 *
 * Required env vars:
 *   WATI_API_KEY - from app.wati.io > Settings > API Keys
 *   WATI_BASE_URL - default: https://live-mt-server.wati.io
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const API_KEY = process.env.WATI_API_KEY;
const BASE_URL = (process.env.WATI_BASE_URL || "https://live-mt-server.wati.io").replace(/\/$/, "");

if (!API_KEY) {
  console.error("\n❌ WATI_API_KEY not found in .env.local");
  console.error("   1. Go to https://app.wati.io > Settings > API Keys");
  console.error("   2. Copy the key");
  console.error("   3. Paste into .env.local: WATI_API_KEY=your_key_here\n");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ── Templates to create ─────────────────────────────────────

const TEMPLATES = [
  {
    name: "welcome_en",
    category: "MARKETING",
    body: `Welcome to Blue Everest Asset Group! 🏠

We develop luxury investment villas in Panglao, Bohol, Philippines.

Reply with a number:
1 - Investment Details
2 - Villa Specifications
3 - Pricing & Payment Terms
4 - Legal Ownership Options
5 - Schedule a Tour

WhatsApp Marketing: +639542555553
WhatsApp Office: +639958565865`,
  },
  {
    name: "welcome_he",
    category: "MARKETING",
    body: `!ברוכים הבאים ל-Blue Everest Asset Group 🏠

אנחנו מפתחים וילות יוקרה להשקעה בפנגלאו, בוהול, פיליפינים.

:הקישו מספר
1 - פרטי השקעה
2 - מפרט הוילות
3 - תמחור ותנאי תשלום
4 - אפשרויות בעלות משפטית
5 - קביעת סיור

WhatsApp Marketing: +639542555553
WhatsApp Office: +639958565865`,
  },
  {
    name: "investment_details_en",
    category: "MARKETING",
    body: `Panglao Prime Villas - Investment Overview

Villa D: PHP 32,500,000 (~$528,000)
Villa C: PHP 35,000,000 (~$568,000)

Monthly Airbnb income: PHP 395,000 (verified)
Annual ROI: 17-25% gross
Occupancy: 65% (market avg: 49%)
5-year cumulative ROI: 136.9%

Location: Between JW Marriott and Mithi Resort, 60 seconds to beach.

Only 2 villas remaining.

Want more details? Reply SPECS, LEGAL, or TOUR.

WhatsApp: +639542555553 / +639958565865`,
  },
  {
    name: "investment_details_he",
    category: "MARKETING",
    body: `Panglao Prime Villas - סקירת השקעה

וילה D: 1,535,000 ש"ח
וילה C: 1,650,000 ש"ח

הכנסה חודשית מ-Airbnb: PHP 395,000 (מאומת)
ROI שנתי: 17-25%
תפוסה: 65%
ROI מצטבר 5 שנים: 136.9%

מיקום: בין JW Marriott ל-Mithi Resort, 60 שניות מהחוף.

נותרו 2 וילות בלבד.

3 מסלולים משפטיים: Deed of Assignment, Leasehold 25+25, תאגיד.

WhatsApp: +639542555553 / +639958565865`,
  },
  {
    name: "villa_specs_en",
    category: "MARKETING",
    body: `Villa Specifications:

Floor area: 263.78 sqm
Structure: 3 storeys + roof deck
Bedrooms: 4 (all en-suite with walk-in closets)
Pool: Private 15.08 sqm with deck
Roof: Jacuzzi (6.37 sqm) + outdoor kitchen + sea view
Master: Japanese spa bathroom
Materials: Natural stone, floor-to-ceiling glass

Ground: Living, dining, kitchen + pool access
2nd: 2 bedrooms + balcony
3rd: Master + bedroom + balcony
Roof: Lounge, kitchen, jacuzzi, dining

BDO Bank financing available for Filipino buyers.

WhatsApp: +639542555553 / +639958565865`,
  },
  {
    name: "pricing_en",
    category: "MARKETING",
    body: `Payment Terms:

Villa D: PHP 32,500,000 (lot: 182.03 sqm)
Villa C: PHP 35,000,000 (lot: 192.85 sqm)

Reservation: PHP 200,000
Payment schedule: 25% down / 55% over 24 months / 20% on turnover

BDO Financing (Filipino buyers):
- Up to 70% loan-to-value
- 15-year terms
- ~6% interest rate

Israeli buyers: 9,999 shekel reservation. 3 legal ownership paths available.

WhatsApp: +639542555553 / +639958565865`,
  },
  {
    name: "legal_en",
    category: "MARKETING",
    body: `Legal Ownership for Foreign Buyers:

1. Deed of Assignment (most popular)
   Full legal title to villa structure. Simple, fast, lower costs.

2. Leasehold 25+25
   50 years full control. Live, rent, resell.

3. Domestic Corporation (60/40)
   Maximum security. Can own land.

Israel-Philippines double tax treaty since 1997.
Entire process can be completed remotely (digital KYC).

We handle all legal work end-to-end.

WhatsApp: +639542555553 / +639958565865`,
  },
  {
    name: "legal_he",
    category: "MARKETING",
    body: `בעלות משפטית למשקיעים ישראלים:

1. Deed of Assignment (הכי פופולרי)
   בעלות מלאה על המבנה. פשוט ומהיר.

2. Leasehold 25+25
   שליטה מלאה ל-50 שנה.

3. תאגיד מקומי (60/40)
   ביטחון מקסימלי. בעלות על הקרקע.

הסכם מס כפל ישראל-פיליפינים מ-1997.
כל התהליך מרחוק - KYC דיגיטלי.

וילה D: 1,535,000 ש"ח | וילה C: 1,650,000 ש"ח

WhatsApp: +639542555553 / +639958565865`,
  },
  {
    name: "site_visit_en",
    category: "UTILITY",
    body: `Schedule a Villa Tour

Options:
A. Virtual tour via Zoom (30 min)
B. In-person site visit in Panglao
C. Video walkthrough on WhatsApp

For in-person: 12 daily flights from Manila (1.25 hrs). Airport 8-12 min from villa.

Reply A, B, or C to schedule.

WhatsApp: +639542555553 / +639958565865`,
  },
  {
    name: "hot_lead_alert",
    category: "UTILITY",
    body: `🔥 HOT LEAD ALERT

Lead score: {{1}} (threshold: 71+)
Name: {{2}}
Phone: {{3}}
Origin: {{4}}
Signals: {{5}}

ACTION REQUIRED: Contact within 2 hours.

Reply CLAIMED to assign to yourself.`,
  },
  {
    name: "reservation_followup_en",
    category: "UTILITY",
    body: `Hi! Following up on your interest in Panglao Prime Villas.

Reservation fee: PHP 200,000 (or 9,999 shekel for Israeli buyers).
This secures your chosen villa while we prepare the contract.

Villa D: PHP 32,500,000
Villa C: PHP 35,000,000

Would you like to proceed with the reservation? Our team can guide you through each step.

WhatsApp: +639542555553 / +639958565865`,
  },
  {
    name: "vip_fast_track_en",
    category: "UTILITY",
    body: `VIP Fast-Track Service

You've been flagged as a priority investor. Here's what happens next:

1. Personal call with our senior advisor (15 min)
2. Personalized ROI analysis based on your profile
3. Legal structure recommendation
4. Site visit scheduling (virtual or in-person)

Reply CALL to schedule your personal consultation now.

WhatsApp: +639542555553 / +639958565865`,
  },
];

// ── Main ─────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║       WATI WhatsApp Setup - Panglao Prime Villas       ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`\n  API: ${BASE_URL}`);
  console.log(`  Key: ${API_KEY?.slice(0, 8)}...${API_KEY?.slice(-4)}\n`);

  // Test connectivity
  console.log("  Testing API connection...");
  try {
    const res = await fetch(`${BASE_URL}/api/v1/getTemplates`, { headers });
    if (!res.ok) {
      console.error(`  ❌ API returned ${res.status}: ${await res.text()}`);
      process.exit(1);
    }
    console.log("  ✅ API connected\n");
  } catch (err) {
    console.error("  ❌ Cannot reach WATI API:", err);
    process.exit(1);
  }

  // Create templates
  console.log("  Creating templates...\n");
  let created = 0;
  let failed = 0;

  for (const tpl of TEMPLATES) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/addTemplate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: tpl.name,
          category: tpl.category,
          components: [{ type: "BODY", text: tpl.body }],
          language: tpl.name.endsWith("_he") ? "he" : "en",
        }),
      });

      if (res.ok) {
        console.log(`  ✅ ${tpl.name}`);
        created++;
      } else {
        const err = await res.text();
        if (err.includes("already exists") || err.includes("duplicate")) {
          console.log(`  ⏭  ${tpl.name} (already exists)`);
          created++;
        } else {
          console.log(`  ❌ ${tpl.name}: ${err.slice(0, 100)}`);
          failed++;
        }
      }
    } catch (err) {
      console.log(`  ❌ ${tpl.name}: ${err}`);
      failed++;
    }
  }

  console.log(`\n  Templates: ${created} created, ${failed} failed\n`);

  // Manual setup instructions
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  MANUAL SETUP REQUIRED (do these in WATI dashboard):");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log("  1. KEYWORD AUTOMATIONS (app.wati.io > Automation > Keywords):\n");
  console.log("     Keyword        → Send Template");
  console.log("     ─────────────────────────────────");
  console.log('     "1" or "details"   → investment_details_en');
  console.log('     "2" or "specs"     → villa_specs_en');
  console.log('     "3" or "price"     → pricing_en');
  console.log('     "legal"            → legal_en');
  console.log('     "visit" or "tour"  → site_visit_en');
  console.log('     "reserve" or "book"→ hot_lead_alert (to sales) + reservation_followup_en (to client)');

  console.log("\n  2. BUSINESS HOURS (app.wati.io > Settings > Business Hours):\n");
  console.log("     Mon-Sat: 9:00 AM - 6:00 PM (Asia/Manila / PHT)");
  console.log("     Sunday: Closed");

  console.log("\n  3. CONTACT ATTRIBUTES (app.wati.io > Settings > Contact Attributes):\n");
  console.log("     Add: nationality, villa_interest, lead_score, funnel_stage,");
  console.log("           budget_confirmed, language, conversation_id, source\n");

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  ✅ WATI setup complete. Review templates in WATI dashboard.");
  console.log("═══════════════════════════════════════════════════════════\n");
}

main().catch(console.error);
