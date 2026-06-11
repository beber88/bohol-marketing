#!/usr/bin/env npx tsx
/**
 * Brevo Email Setup Script - Panglao Prime Villas
 *
 * Creates email templates and contact lists via Brevo API.
 *
 * Usage: npx tsx scripts/setup-brevo.ts
 *
 * Required: BREVO_API_KEY in .env.local
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const API_KEY = process.env.BREVO_API_KEY;
const BASE_URL = "https://api.brevo.com/v3";

if (!API_KEY) {
  console.error("\n❌ BREVO_API_KEY not found in .env.local");
  console.error("   1. Go to https://app.brevo.com > Settings > SMTP & API > API Keys");
  console.error("   2. Click 'Generate a new API key'");
  console.error("   3. Paste into .env.local: BREVO_API_KEY=your_key_here\n");
  process.exit(1);
}

const headers = {
  "api-key": API_KEY,
  "Content-Type": "application/json",
};

const SENDER = { name: "Blue Everest", email: "ceo@blue-everest.com" };

// ── Email Templates ─────────────────────────────────────────

function makeHtml(title: string, body: string, cta: string, ctaUrl: string, lang: "en" | "he" = "en"): string {
  const dir = lang === "he" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;margin-top:20px;">
<div style="background:linear-gradient(135deg,#89AACC,#4E85BF);padding:30px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:24px;">${title}</h1>
<p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Blue Everest Asset Group</p>
</div>
<div style="padding:30px;line-height:1.6;color:#333;font-size:15px;" dir="${dir}">
${body}
</div>
<div style="padding:20px 30px;text-align:center;">
<a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#89AACC,#4E85BF);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">${cta}</a>
</div>
<div style="padding:20px 30px;text-align:center;font-size:12px;color:#888;border-top:1px solid #eee;">
<p>WhatsApp Marketing: +639542555553 | Office: +639958565865</p>
<p>Blue Everest Asset Group Holding Inc. | blue-everest.com</p>
<p><a href="{{unsubscribe}}" style="color:#888;">Unsubscribe</a></p>
</div>
</div></body></html>`;
}

const TEMPLATES = [
  // English sequence
  {
    templateName: "PPV_EN_01_Welcome",
    subject: "Welcome - Your Panglao Investment Guide",
    htmlContent: makeHtml("Welcome to Blue Everest", `
<p>Thank you for your interest in Panglao Prime Villas.</p>
<p><strong>Quick overview:</strong></p>
<p>Villa D: PHP 32,500,000 | Villa C: PHP 35,000,000<br>
Monthly Airbnb income: PHP 395,000 (verified)<br>
Annual ROI: 17-25% gross<br>
Location: Between JW Marriott and Mithi Resort, 60 seconds to beach</p>
<p>263.78 sqm, 4 bedrooms, private pool, rooftop jacuzzi with sea view.</p>
<p>Only 2 villas remaining. BDO Bank financing available.</p>
<p>We'll send you detailed investment data over the next few days.</p>`, "View Villas", "https://primevilla.ph/panglao-prime-villas/villas"),
  },
  {
    templateName: "PPV_EN_02_Investment",
    subject: "PHP 395,000/month - Verified Income Data",
    htmlContent: makeHtml("Investment Performance", `
<p>Here are the verified numbers:</p>
<p><strong>Monthly income:</strong> PHP 395,000 average<br>
<strong>Peak season (Dec-Feb):</strong> PHP 400,000-450,000/month<br>
<strong>Occupancy:</strong> 65% (market average: 49%)<br>
<strong>Annual ROI:</strong> 17-25% gross<br>
<strong>5-year appreciation:</strong> +80.9%<br>
<strong>5-year cumulative ROI:</strong> 136.9%</p>
<p>Tourism in Bohol grew 166% since 2022. Airport expanding to 4M passengers. Third bridge (PHP 7.15B) under construction.</p>
<p>These are verified numbers from comparable Airbnb properties, not projections.</p>`, "Full Investment Report", "https://primevilla.ph/panglao-prime-villas/investment"),
  },
  {
    templateName: "PPV_EN_03_Comparison",
    subject: "Panglao vs BGC vs Boracay - The Numbers",
    htmlContent: makeHtml("How Panglao Compares", `
<p><strong>BGC 3BR condo:</strong> PHP 25-35M, yield 3-5%<br>
<strong>Panglao 4BR villa:</strong> PHP 32.5M, yield 17-25%</p>
<p>Same price. 5x the return. Beach lifestyle instead of traffic.</p>
<p><strong>Boracay:</strong> PHP 55-70K+/sqm (saturated, environmental issues)<br>
<strong>Panglao:</strong> PHP 27-49K/sqm (growing, UNESCO Geopark, JW Marriott coming)</p>
<p>Panglao is where Boracay was 10 years ago, with better infrastructure planning.</p>`, "Compare All Markets", "https://primevilla.ph/panglao-prime-villas/investment"),
  },
  {
    templateName: "PPV_EN_04_Urgency",
    subject: "2 Villas Remaining - Active Conversations",
    htmlContent: makeHtml("Time-Sensitive Update", `
<p>Villa A and Villa B are sold.</p>
<p>We have active conversations on both remaining villas. This isn't a sales tactic - it's reality.</p>
<p><strong>Villa D:</strong> PHP 32,500,000 (lot: 182.03 sqm)<br>
<strong>Villa C:</strong> PHP 35,000,000 (lot: 192.85 sqm)</p>
<p>Reservation fee: PHP 200,000. This secures your villa while we prepare the contract.</p>
<p>BDO Bank financing available for qualified Filipino buyers.</p>`, "Reserve Now", "https://primevilla.ph/panglao-prime-villas/book"),
  },
  {
    templateName: "PPV_EN_05_Legal",
    subject: "How Foreigners Own Property in the Philippines",
    htmlContent: makeHtml("Legal Ownership Guide", `
<p>3 proven legal structures:</p>
<p><strong>1. Deed of Assignment</strong> (most popular)<br>
Full legal title to villa structure. Simple, fast, lower costs.</p>
<p><strong>2. Leasehold 25+25</strong><br>
50 years of full control. Live, rent, resell.</p>
<p><strong>3. Domestic Corporation (60/40)</strong><br>
Can own land. Maximum legal security.</p>
<p>Israel-Philippines double tax treaty since 1997. Entire process can be completed remotely with digital KYC.</p>`, "Ownership Details", "https://primevilla.ph/panglao-prime-villas/ownership"),
  },
  // Hebrew sequence
  {
    templateName: "PPV_HE_01_Welcome",
    subject: "ברוכים הבאים - מדריך ההשקעה בפנגלאו",
    htmlContent: makeHtml("ברוכים הבאים ל-Blue Everest", `
<p>תודה על ההתעניינות ב-Panglao Prime Villas.</p>
<p><strong>סקירה מהירה:</strong></p>
<p>וילה D: 1,535,000 ש"ח | וילה C: 1,650,000 ש"ח<br>
הכנסה חודשית מ-Airbnb: PHP 395,000 (מאומת)<br>
ROI שנתי: 17-25%<br>
מיקום: בין JW Marriott ל-Mithi Resort, 60 שניות מהחוף</p>
<p>263.78 מ"ר, 4 חדרים, בריכה פרטית, ג'קוזי על הגג עם נוף לים.</p>
<p>נותרו 2 וילות בלבד.</p>
<p>3 מסלולים משפטיים: Deed of Assignment, Leasehold 25+25, תאגיד מקומי.</p>`, "צפה בוילות", "https://primevilla.ph/panglao-prime-villas/he", "he"),
  },
  {
    templateName: "PPV_HE_02_Investment",
    subject: "PHP 395,000 בחודש - נתונים מאומתים",
    htmlContent: makeHtml("ביצועי ההשקעה", `
<p>הנה המספרים המאומתים:</p>
<p><strong>הכנסה חודשית:</strong> PHP 395,000 בממוצע<br>
<strong>עונת שיא (דצ-פבר):</strong> כ-19,000-21,000 ש"ח<br>
<strong>תפוסה:</strong> 65% (ממוצע שוק: 49%)<br>
<strong>ROI שנתי:</strong> 17-25%<br>
<strong>עליית ערך 5 שנים:</strong> +80.9%<br>
<strong>ROI מצטבר 5 שנים:</strong> 136.9%</p>
<p>תיירות בבוהול עלתה 166% מאז 2022. נמל תעופה מתרחב ל-4M נוסעים. גשר שלישי (7.15 מיליארד פזו) בבנייה.</p>`, "דוח השקעה מלא", "https://primevilla.ph/panglao-prime-villas/investment", "he"),
  },
  {
    templateName: "PPV_HE_03_Comparison",
    subject: "פנגלאו מול תל אביב - השוואת מספרים",
    htmlContent: makeHtml("השוואת שווקים", `
<p><strong>דירת 3 חדרים בתל אביב:</strong> 3-5 מיליון ש"ח, תשואה 2-3%<br>
<strong>וילת 4 חדרים בפנגלאו:</strong> 1.535M ש"ח, תשואה 17-25%</p>
<p>שליש מהמחיר. פי 5 בתשואה.</p>
<p><strong>חיפה:</strong> 1.5-2.5M ש"ח לדירת 3 חדרים<br>
<strong>פנגלאו:</strong> 1.535M ש"ח לוילת יוקרה עם בריכה פרטית</p>
<p>ישראל יקרה ב-259% מהפיליפינים. הכנסה ישראלית קונה פי 3 בפיליפינים.</p>`, "השוואה מלאה", "https://primevilla.ph/panglao-prime-villas/investment", "he"),
  },
  {
    templateName: "PPV_HE_04_Urgency",
    subject: "2 וילות נותרו - שיחות פעילות",
    htmlContent: makeHtml("עדכון דחוף", `
<p>וילה A ו-B נמכרו.</p>
<p>יש לנו שיחות פעילות על שתי הוילות הנותרות.</p>
<p><strong>וילה D:</strong> 1,535,000 ש"ח<br>
<strong>וילה C:</strong> 1,650,000 ש"ח</p>
<p>דמי הזמנה: 9,999 ש"ח. זה שומר על הוילה שלך בזמן שאנחנו מכינים את החוזה.</p>
<p>ליווי משפטי מלא. עברית. מהתחלה עד הסוף.</p>`, "שריין מקום", "https://primevilla.ph/panglao-prime-villas/book", "he"),
  },
  {
    templateName: "PPV_HE_05_Legal",
    subject: "איך ישראלים רוכשים נדל\"ן בפיליפינים",
    htmlContent: makeHtml("מדריך בעלות משפטית", `
<p>3 מסלולים מוכחים:</p>
<p><strong>1. Deed of Assignment</strong> (הכי פופולרי)<br>
בעלות מלאה על המבנה. פשוט, מהיר, עלויות נמוכות.</p>
<p><strong>2. Leasehold 25+25</strong><br>
שליטה מלאה ל-50 שנה. גרים, משכירים, מוכרים.</p>
<p><strong>3. תאגיד מקומי (60/40)</strong><br>
בעלות על הקרקע. ביטחון מקסימלי.</p>
<p>הסכם מס כפל ישראל-פיליפינים מ-1997. כל התהליך מרחוק - KYC דיגיטלי.</p>
<p>משקיעים ישראלים כבר השלימו את התהליך מתל אביב בלי לבקר.</p>`, "פרטי בעלות", "https://primevilla.ph/panglao-prime-villas/ownership", "he"),
  },
];

// ── Contact Lists ────────────────────────────────────────────

const LISTS = [
  { name: "PPV - Israeli Investors", description: "Hebrew-speaking leads from Israel interested in Panglao Prime Villas" },
  { name: "PPV - Filipino Buyers", description: "English/Tagalog leads from Philippines interested in villa investment" },
  { name: "PPV - Korean Investors", description: "Korean-speaking leads from South Korea" },
  { name: "PPV - Global Investors", description: "International leads (SG, HK, US, EU, UAE, AU)" },
  { name: "PPV - All Leads", description: "Master list of all Panglao Prime Villas leads" },
];

// ── Main ─────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║       BREVO Email Setup - Panglao Prime Villas          ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`\n  Key: ${API_KEY?.slice(0, 8)}...${API_KEY?.slice(-4)}\n`);

  // Test connectivity
  console.log("  Testing API connection...");
  try {
    const res = await fetch(`${BASE_URL}/account`, { headers });
    if (!res.ok) {
      console.error(`  ❌ API returned ${res.status}: ${await res.text()}`);
      process.exit(1);
    }
    const account = await res.json() as { companyName?: string; email?: string };
    console.log(`  ✅ Connected as: ${account.companyName || account.email || "OK"}\n`);
  } catch (err) {
    console.error("  ❌ Cannot reach Brevo API:", err);
    process.exit(1);
  }

  // Create contact lists
  console.log("  Creating contact lists...\n");
  for (const list of LISTS) {
    try {
      const res = await fetch(`${BASE_URL}/contacts/lists`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: list.name, folderId: 1 }),
      });
      if (res.ok) {
        const data = await res.json() as { id: number };
        console.log(`  ✅ List: ${list.name} (ID: ${data.id})`);
      } else {
        const err = await res.text();
        if (err.includes("already exists") || err.includes("duplicate")) {
          console.log(`  ⏭  List: ${list.name} (already exists)`);
        } else {
          console.log(`  ❌ List: ${list.name}: ${err.slice(0, 80)}`);
        }
      }
    } catch (err) {
      console.log(`  ❌ List: ${list.name}: ${err}`);
    }
  }

  // Create email templates
  console.log("\n  Creating email templates...\n");
  let created = 0;
  let failed = 0;

  for (const tpl of TEMPLATES) {
    try {
      const res = await fetch(`${BASE_URL}/smtp/templates`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          templateName: tpl.templateName,
          subject: tpl.subject,
          htmlContent: tpl.htmlContent,
          sender: SENDER,
          isActive: true,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { id: number };
        console.log(`  ✅ ${tpl.templateName} (ID: ${data.id})`);
        created++;
      } else {
        const err = await res.text();
        if (err.includes("already exists") || err.includes("duplicate")) {
          console.log(`  ⏭  ${tpl.templateName} (already exists)`);
          created++;
        } else {
          console.log(`  ❌ ${tpl.templateName}: ${err.slice(0, 80)}`);
          failed++;
        }
      }
    } catch (err) {
      console.log(`  ❌ ${tpl.templateName}: ${err}`);
      failed++;
    }
  }

  console.log(`\n  Templates: ${created} created, ${failed} failed`);

  // Automation instructions
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  MANUAL SETUP (do in Brevo dashboard):");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("  1. AUTOMATION WORKFLOW (app.brevo.com > Automation > Workflows):\n");
  console.log("     Trigger: Contact added to 'PPV - All Leads' list");
  console.log("     Step 1: Send PPV_EN_01_Welcome (or PPV_HE_01 if nationality=Israel)");
  console.log("     Wait: 24 hours");
  console.log("     Step 2: Send PPV_EN_02_Investment (or PPV_HE_02)");
  console.log("     Wait: 48 hours");
  console.log("     Step 3: Send PPV_EN_03_Comparison (or PPV_HE_03)");
  console.log("     Wait: 72 hours");
  console.log("     Step 4: Send PPV_EN_04_Urgency (or PPV_HE_04)");
  console.log("     Wait: 96 hours");
  console.log("     Step 5: Send PPV_EN_05_Legal (or PPV_HE_05)");

  console.log("\n  2. SEND TIMES:");
  console.log("     Israel: Sun-Thu 20:00-22:00 IST");
  console.log("     Philippines: Tue-Thu 19:00-21:00 PHT");
  console.log("     Avoid: Friday evening - Saturday evening (Shabbat) for Israeli list");

  console.log("\n  3. VERIFY SENDER:");
  console.log("     Go to Settings > Senders > Add Sender");
  console.log("     Add: info@blue-everest.com");
  console.log("     Verify via email confirmation\n");

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  ✅ Brevo setup complete. Review templates in dashboard.");
  console.log("═══════════════════════════════════════════════════════════\n");
}

main().catch(console.error);
