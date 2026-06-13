import type {
  Campaign, FunnelStage, DailySpend, PlatformInfo,
  DriveAsset, ActionItem, KpiTarget, CalendarPost,
} from "./dashboard-types";
import { SITE_CONFIG } from "@/lib/config";

export const CAMPAIGNS: Campaign[] = [
  {
    id: "IL-1", name: "Israel - Investment Awareness", market: "IL",
    channel: "Meta Ads (FB+IG)", status: "active",
    objective: "Traffic / Awareness", specialCategory: "HOUSING",
    dailyBudgetUsd: 20, totalBudgetUsd: 140,
    targeting: "Israel, Hebrew, 18-65+", placements: "FB Feed, IG Feed, IG Reels",
    schedule: "Sun-Thu, 20:00-23:00 Israel",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "Hebrew copy, 3 legal ownership solutions, ILS only",
  },
  {
    id: "IL-2", name: "Israel - FB Group Organic", market: "IL",
    channel: "FB Group", status: "active",
    objective: "Organic Reach", dailyBudgetUsd: 0, totalBudgetUsd: 0,
    targeting: "investment.ph.il group members", placements: "FB Group",
    schedule: "2x/week, 8PM ISR",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "Free organic posts",
  },
  {
    id: "IL-3", name: "Israel - Retargeting", market: "IL",
    channel: "Meta Ads", status: "phase2",
    objective: "Conversions", dailyBudgetUsd: 10, totalBudgetUsd: 80,
    targeting: "Website visitors + video viewers", placements: "FB Feed, IG Feed",
    schedule: "Day 8+, after pixel data",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "Retarget website visitors + video viewers, WhatsApp CTA",
  },
  {
    id: "PH-1", name: "Philippines - BDO Financing", market: "PH",
    channel: "Meta Ads (FB+IG)", status: "active",
    objective: "Traffic / Awareness", specialCategory: "HOUSING",
    dailyBudgetUsd: 15, totalBudgetUsd: 105,
    targeting: "Philippines (Manila, Cebu, Davao), English, 18-65+",
    placements: "FB Feed, IG Feed, IG Reels",
    schedule: "Tue-Thu priority, 19:00-23:00 PHT",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "English/Tagalog, BDO financing, PHP only",
  },
  {
    id: "PH-2", name: "Philippines - Marketplace", market: "PH",
    channel: "FB Marketplace", status: "planned",
    objective: "Organic Listings", dailyBudgetUsd: 0, totalBudgetUsd: 0,
    targeting: "Bohol, Cebu, Manila property seekers", placements: "FB Marketplace",
    schedule: "Ongoing",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "Free property listings",
  },
  {
    id: "PH-3", name: "Philippines - Google Search", market: "PH",
    channel: "Google Ads", status: "active",
    objective: "Search Traffic", dailyBudgetUsd: 8, totalBudgetUsd: 64,
    targeting: "Philippines, investment intent keywords", placements: "Google Search",
    schedule: "Day 8+",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "Keywords: bohol villa, panglao investment",
  },
  {
    id: "WA-1", name: "WhatsApp Nurture", market: "BOTH",
    channel: "WATI", status: "not_setup",
    objective: "Lead Nurture", dailyBudgetUsd: 0, totalBudgetUsd: 0,
    targeting: "All leads", placements: "WhatsApp",
    schedule: "Automated",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "Automated follow-up sequence",
  },
  {
    id: "EM-1", name: "Email Drip Sequence", market: "BOTH",
    channel: "Brevo", status: "active",
    objective: "Lead Nurture", dailyBudgetUsd: 0, totalBudgetUsd: 0,
    targeting: "All leads", placements: "Email",
    schedule: "5-email drip",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "5-email nurture sequence",
  },
  {
    id: "INTL-1", name: "Global - Investment Awareness", market: "BOTH",
    channel: "Meta Ads (FB+IG)", status: "planned",
    objective: "Traffic / Awareness",
    dailyBudgetUsd: 10, totalBudgetUsd: 70,
    targeting: "SG, HK, KR, US, UK, DE, UAE, age 30-62, English, Interests: Real estate, Airbnb, Investment",
    placements: "FB Feed, IG Feed, IG Reels",
    schedule: "Mon-Fri, optimized by timezone",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "English copy, USD pricing, global investor targeting",
  },
  {
    id: "INTL-2", name: "Global - FB Groups Organic", market: "BOTH",
    channel: "FB Groups", status: "planned",
    objective: "Organic Reach",
    dailyBudgetUsd: 0, totalBudgetUsd: 0,
    targeting: "Airbnb Investing, STR Investors, RE Philippines, Expat groups",
    placements: "FB Groups",
    schedule: "3x/week",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "Free organic posts in global investor groups",
  },
  {
    id: "INTL-3", name: "Global - Google Search", market: "BOTH",
    channel: "Google Ads", status: "phase2",
    objective: "Search Traffic",
    dailyBudgetUsd: 10, totalBudgetUsd: 70,
    targeting: "Global, English, investment intent keywords",
    placements: "Google Search",
    schedule: "Always on",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "Keywords: villa investment Philippines, Panglao real estate, Bohol property ROI",
  },
  {
    id: "ASIA-1", name: "Korea - Tourism to Investment", market: "BOTH",
    channel: "Meta Ads + Google", status: "active",
    objective: "Traffic / Awareness",
    dailyBudgetUsd: 8, totalBudgetUsd: 56,
    targeting: "South Korea, age 35-55, interests: Philippines travel, Bohol, Real estate, Airbnb",
    placements: "FB Feed, IG Feed",
    schedule: "Tue-Sat, 19:00-23:00 KST",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "Korean tourists are 42% of Bohol foreign visitors. Convert tourists to investors.",
  },
  {
    id: "ASIA-2", name: "Singapore/HK - Property Investor", market: "BOTH",
    channel: "Meta Ads + LinkedIn", status: "phase2",
    objective: "Lead Generation",
    dailyBudgetUsd: 8, totalBudgetUsd: 56,
    targeting: "Singapore, Hong Kong, age 35-60, interests: Property investment, Southeast Asia, Luxury travel",
    placements: "FB Feed, LinkedIn",
    schedule: "Mon-Fri, 12:00-14:00 + 20:00-22:00 SGT/HKT",
    impressions: 0, clicks: 0, leads: 0, spend: 0, ctr: 0, cpc: 0, cpl: 0,
    notes: "Compare to SG/HK condo prices. USD pricing.",
  },
];

export const FUNNEL_STAGES: FunnelStage[] = [
  { label: "Website Visits", il: 0, ph: 0, total: 0 },
  { label: "Form Submissions", il: 0, ph: 0, total: 0 },
  { label: "WhatsApp Conversations", il: 0, ph: 0, total: 0 },
  { label: "Qualified Leads", il: 0, ph: 0, total: 0 },
  { label: "Site Visits Booked", il: 0, ph: 0, total: 0 },
  { label: "Reservations", il: 0, ph: 0, total: 0 },
  { label: "Contracts Signed", il: 0, ph: 0, total: 0 },
];

export const DAILY_SPEND: DailySpend[] = Array.from({ length: 15 }, (_, i) => ({
  day: i + 1,
  date: "",
  metaIl: 0,
  metaPh: 0,
  google: 0,
  other: 0,
  total: 0,
  cumulative: 0,
}));

export const BUDGET = {
  totalUsd: 900,
  dailyAvgUsd: 60,
  daysPlanned: 15,
  spentUsd: 171.30,
  remainingUsd: 728.70,
  phase1: { days: 7, dailyUsd: 35, totalUsd: 245 },
  phase2: { days: 8, dailyUsd: 78, totalUsd: 624 },
  estimatedTotalUsd: 869,
  bufferUsd: 31,
};

export const PLATFORMS: PlatformInfo[] = [
  { name: "Meta Ad Account", id: "2015125296073673", status: "active", url: "https://business.facebook.com" },
  { name: "Meta Business", id: "1091269377399273", status: "active", url: "https://business.facebook.com" },
  { name: "Facebook Page", id: "1091251924067685", status: "active", url: "https://www.facebook.com/BlueEverestGroup" },
  { name: "Meta Pixel", id: "1599211187973958", status: "installed", url: "https://business.facebook.com/events_manager2", actionNeeded: "Verify events firing" },
  { name: "Google Analytics", id: "G-04NZJT2C4V", status: "installed", url: "https://analytics.google.com", actionNeeded: "Verify real-time data" },
  { name: "Website", id: "primevilla.ph", status: "active", url: "https://primevilla.ph" },
  { name: "WhatsApp Marketing", id: "+639542555553", status: "active", url: SITE_CONFIG.whatsappLinks.marketing },
  { name: "WhatsApp Office", id: "+639958565865", status: "active", url: SITE_CONFIG.whatsappLinks.office },
  { name: "360 Virtual Tour", id: "kuula.co/share/collection/7HMGx", status: "active", url: "https://kuula.co/share/collection/7HMGx?logo=1&info=0&logosize=96&fs=1&vr=0&initload=0&thumbs=1&margin=10" },
  { name: "Lead Sheet", id: "PRIMEVILLA LIVE SITE", status: "active", url: "https://docs.google.com/spreadsheets/d/1oVnbkLNM_DgOAd7EZQVxxaPD0TwNGqqsD7Ezmp0bXSo/edit" },
  { name: "Google Ads", id: "4031838704", status: "active", url: "https://ads.google.com" },
  { name: "Brevo (Email)", id: "10 templates + 5 lists", status: "active", url: "https://app.brevo.com" },
  { name: "WATI (WhatsApp)", id: "-", status: "not_setup", url: "https://app.wati.io", actionNeeded: "Create account + flows" },
];

export const DRIVE_ASSETS: DriveAsset[] = [
  { name: "Bohol Marketing", type: "Folder", url: "https://drive.google.com/drive/folders/1S0QqCJrH5JN7O4I5ogPbIRcrSaFqepG0" },
  { name: "Marketing Deck PDF", type: "PDF", size: "128 MB", url: "https://drive.google.com/file/d/1VjkUDB_xDaXJuJepiIqZd_T_r9g7WRwn/view" },
  { name: "Design Plans PDF", type: "PDF", size: "8.5 MB", url: "https://drive.google.com/file/d/1W8izh1PvoQeZ0LJBsdD7ITeB9gzOmaoM/view" },
  { name: "Exterior Photos", type: "Folder", size: "21 images", url: "https://drive.google.com/drive/folders/1YLTAXqUsoU0nzyYgtSIWvzoKdD1EaPGi" },
  { name: "Interior Photos", type: "Folder", size: "44 images", url: "https://drive.google.com/drive/folders/1FtN_Nhh-OmOhfr1RD6_WH7B3nxalcz-U" },
  { name: "Lead Tracker Sheet", type: "Sheet", url: "https://docs.google.com/spreadsheets/d/1oVnbkLNM_DgOAd7EZQVxxaPD0TwNGqqsD7Ezmp0bXSo/edit" },
];

export const BLOCKERS: ActionItem[] = [
  { title: "WATI API Key", titleHe: "מפתח WATI API", description: "Paste API key from app.wati.io into .env.local, then run: npx tsx scripts/setup-wati.ts", descriptionHe: "הדבק מפתח מ-app.wati.io ב-.env.local, אחר כך הרץ: npx tsx scripts/setup-wati.ts", type: "blocker" },
  { title: "Join 42 Facebook Groups", titleHe: "הצטרפות ל-42 קבוצות FB", description: "Tier 1 first (8 groups). Tasks at BOHOL Project/_queue/2026-05-25/tasks_group_joins.json", descriptionHe: "שכבה 1 קודם (8 קבוצות). משימות ב-tasks_group_joins.json", type: "blocker" },
  { title: "Turn Off Simulation", titleHe: "כיבוי סימולציה", description: "LAST STEP: set simulation=false in campaign_state.json after all above are done.", descriptionHe: "שלב אחרון: שנה simulation=false ב-campaign_state.json.", type: "blocker" },
];

export const COMPLETED_ITEMS: ActionItem[] = [
  { title: "Meta Pixel Installed", titleHe: "Meta Pixel הותקן", description: "Pixel ID: 1599211187973958 installed in layout.tsx. Fires PageView on every page.", descriptionHe: "Pixel ID: 1599211187973958 הותקן ב-layout.tsx. שולח PageView בכל עמוד.", type: "completed" },
  { title: "GA4 Installed", titleHe: "GA4 הותקן", description: "GA4 ID: G-04NZJT2C4V installed in layout.tsx. Tracking all pages.", descriptionHe: "GA4 ID: G-04NZJT2C4V הותקן ב-layout.tsx. עוקב אחרי כל העמודים.", type: "completed" },
  { title: "Facebook Page Linked to Ad Account", titleHe: "דף פייסבוק חובר לחשבון מודעות", description: "Blue Everest Asset Group page linked to Ad Account 2015125296073673", descriptionHe: "דף Blue Everest Asset Group חובר לחשבון מודעות 2015125296073673", type: "completed" },
  { title: "AI Marketing System Built", titleHe: "מערכת שיווק AI נבנתה", description: "10 AI agents, 14 API routes, 12 Inngest functions, sales chatbot, global targeting (IL+PH+SG+HK+KR+US+EU+UAE)", descriptionHe: "10 סוכני AI, 14 נתיבי API, 12 פונקציות Inngest, צ'אטבוט מכירות, כיוון גלובלי", type: "completed" },
  { title: "Ad Account Verified", titleHe: "חשבון מודעות מאומת", description: "ID: 2015125296073673, Active, Payment connected, Currency: PHP", descriptionHe: "ID: 2015125296073673, פעיל, תשלום מחובר, מטבע: PHP", type: "completed" },
  { title: "Facebook Page Found", titleHe: "דף פייסבוק נמצא", description: "Blue Everest Asset Group, ID: 1091251924067685", descriptionHe: "Blue Everest Asset Group, ID: 1091251924067685", type: "completed" },
  { title: "FX Rates Updated (May 22, 2026)", titleHe: "שערי מט\"ח עודכנו (22 במאי 2026)", description: "PHP-ILS: 0.047202 | Villa D: ~PHP 32,500,000 | Villa C: ~PHP 35,000,000", descriptionHe: "PHP-ILS: 0.047202 | וילה D: ~PHP 32,500,000 | וילה C: ~PHP 35,000,000", type: "completed" },
  { title: "All 16 Ad Copies Updated", titleHe: "כל 16 הקופי עודכנו", description: "PHP primary, ILS at daily FX rate. Hebrew + English ready.", descriptionHe: "PHP ראשי, ש\"ח לפי שער יומי. עברית + אנגלית מוכנים.", type: "completed" },
  { title: "Organic Content Calendar Created", titleHe: "לוח תוכן אורגני נוצר", description: "10 posts for 3 weeks: FB Page + Israeli Group", descriptionHe: "10 פוסטים ל-3 שבועות: דף FB + קבוצת ישראל", type: "completed" },
  { title: "Website Verified", titleHe: "אתר מאומת", description: "primevilla.ph loads, form works, both WhatsApp numbers present", descriptionHe: "primevilla.ph עולה, טופס עובד, שני מספרי WhatsApp קיימים", type: "completed" },
  { title: "Google Drive Connected", titleHe: "Google Drive מחובר", description: "All assets synced. Master Dashboard created in Drive.", descriptionHe: "כל הנכסים מסונכרנים. דשבורד ראשי נוצר ב-Drive.", type: "completed" },
  { title: "Meta API Connected", titleHe: "Meta API מחובר", description: "Page token active for Blue Everest Asset Group (ID: 1091251924067685). Can publish posts via API.", descriptionHe: "טוקן דף פעיל ל-Blue Everest Asset Group. אפשר לפרסם פוסטים דרך API.", type: "completed" },
  { title: "Google Ads Conversion Tracking", titleHe: "מעקב המרות Google Ads", description: "AW-18095957436 installed in layout.tsx + conversion event on all lead forms. Sitelinks + negative keywords configured.", descriptionHe: "AW-18095957436 מותקן + אירוע המרה בכל טפסי לידים. Sitelinks + מילות שלילה מוגדרים.", type: "completed" },
  { title: "Brevo Email System Active", titleHe: "מערכת אימייל Brevo פעילה", description: "10 templates (5 EN + 5 HE) + 5 contact lists created via API. Sender: ceo@blue-everest.com", descriptionHe: "10 תבניות (5 אנגלית + 5 עברית) + 5 רשימות אנשי קשר נוצרו. שולח: ceo@blue-everest.com", type: "completed" },
];

export const KPI_TARGETS: KpiTarget[] = [
  { label: "Website Sessions", target: 500, actual: 0, unit: "/week" },
  { label: "Form Submissions", target: 10, actual: 0, unit: "/week" },
  { label: "WhatsApp Inquiries", target: 5, actual: 0, unit: "/week" },
  { label: "Ad Spend", target: 420, actual: 0, unit: "/week", prefix: "$" },
  { label: "CPL", target: 50, actual: 0, unit: "", prefix: "<$" },
  { label: "Qualified Leads", target: 3, actual: 0, unit: "/week" },
];

export const CONTENT_CALENDAR: CalendarPost[] = [
  { post: 1, day: "Day 1", time: "7PM PHT", platform: "FB Page", market: "PH", content: "Awareness - Aerial", media: "Image" },
  { post: 2, day: "Day 2", time: "8PM ISR", platform: "IL Group", market: "IL", content: "Awareness - Investor angle", media: "Image" },
  { post: 3, day: "Day 3", time: "7PM PHT", platform: "FB Page", market: "BOTH", content: "Panglao Is Next (Skyscanner)", media: "Image" },
  { post: 4, day: "Day 5", time: "7PM PHT", platform: "FB Page", market: "BOTH", content: "Panglao vs Boracay", media: "Image" },
  { post: 5, day: "Day 6", time: "8PM ISR", platform: "IL Group", market: "IL", content: "5-Star Neighborhood", media: "Image" },
  { post: 6, day: "Day 7", time: "7PM PHT", platform: "FB Page", market: "BOTH", content: "P25B Township", media: "Image" },
  { post: 7, day: "Day 8", time: "7PM PHT", platform: "FB Page", market: "BOTH", content: "Villa Walkthrough", media: "Video" },
  { post: 8, day: "Day 9", time: "8PM ISR", platform: "IL Group", market: "IL", content: "Tel Aviv Comparison", media: "Video" },
  { post: 9, day: "Day 10", time: "7PM PHT", platform: "FB Page", market: "BOTH", content: "ROI 136.9%", media: "Video" },
  { post: 10, day: "Day 12", time: "7PM PHT", platform: "FB Page", market: "BOTH", content: "Villa Showcase 2", media: "Video" },
];

export const CONTENT_RULES = [
  { id: "currency-il", title: "Currency - Israeli Market", description: 'ONLY shekels. Villa D: PHP 32,500,000 / Villa C: PHP 35,000,000 / Reservation: PHP 200,000' },
  { id: "currency-ph", title: "Currency - Filipino Market", description: "PHP primary with commas (PHP 32,500,000). USD secondary with \"approx.\" prefix. No ILS." },
  { id: "dashes", title: "No Long Dashes", description: "No em dash, en dash, or Hebrew maqaf. Use regular hyphen (-), colon (:), or comma (,) only." },
  { id: "numbers", title: "Every Post Has a Number", description: "Must include at least one: price, 395,000, 17-25%, 136.9%, 263.78 sqm, 4 bedrooms, etc." },
  { id: "whatsapp", title: "Both WhatsApp Numbers", description: "Every post MUST include: +639542555553 (Marketing) AND +639958565865 (Office)" },
  { id: "forbidden", title: "Forbidden Words", description: "NEVER use: amazing, incredible, dream home, once in a lifetime" },
  { id: "il-legal", title: "Israeli Content", description: "Must mention 3 legal ownership solutions: Deed of Assignment, Leasehold 25+25, Domestic Corporation" },
  { id: "ph-financing", title: "Filipino Content", description: "Must mention BDO Bank financing (subject to qualification and approval)" },
  { id: "hebrew-register", title: "Hebrew Register", description: "Formal but warm, peer-to-peer professional. No slang." },
  { id: "blueprint", title: "NEVER Touch Blueprint", description: "Blueprint Building Group is a SEPARATE business. Villa campaign operates ONLY through Blue Everest.", critical: true },
] as const;

export const VIDEOS = [
  { file: "20260416 BLUEEVEREST 1 Villas Bohol.mp4", size: "70 MB", date: "Apr 16", source: "Local + Drive", isNew: false },
  { file: "20260416 BLUEEVEREST 2 Villas Bohol.mp4", size: "93 MB", date: "Apr 16", source: "Local + Drive", isNew: false },
  { file: "VIDEO-2026-04-27-02-29-12.mp4", size: "25 MB", date: "Apr 27", source: "Local", isNew: false },
  { file: "VIDEO-2026-04-22-18-09-24.mp4", size: "44 MB", date: "Apr 22", source: "Local + Drive", isNew: false },
  { file: "VIDEO-2026-04-22-18-09-41.mp4", size: "39 MB", date: "Apr 22", source: "Local", isNew: false },
  { file: "20260503 BLUEEVEREST 3 Villas Bohol.mp4", size: "25 MB", date: "May 3", source: "Drive", isNew: true },
  { file: "20260503 BLUEEVEREST 4 Villas Bohol.mp4", size: "44 MB", date: "May 3", source: "Drive", isNew: true },
  { file: "20260503 BLUEEVEREST 5 Villas Bohol.mp4", size: "39 MB", date: "May 3", source: "Drive", isNew: true },
  { file: "20260503 BLUEEVEREST 6 Villas Bohol.mp4", size: "27 MB", date: "May 3", source: "Drive", isNew: true },
];

export const FX_RATES = {
  date: "Jun 8, 2026",
  phpIls: 0.047202,
  phpUsd: 0.016234,
  note: "Villa D: PHP 32,500,000. Villa C: PHP 35,000,000.",
  items: [
    { item: "Villa D", php: "PHP 32,500,000", ils: "~1,535,000", usd: "~$527,000" },
    { item: "Villa C", php: "PHP 35,000,000", ils: "~1,650,000", usd: "~$568,000" },
    { item: "Monthly Income", php: "PHP 395,000", ils: "Do not convert", usd: "Do not convert" },
    { item: "Reservation", php: "PHP 200,000", ils: "~9,440", usd: "~$3,250" },
  ],
};

export const PAYMENT_STRUCTURE = [
  { label: "Down Payment", pct: 20 },
  { label: "24 Monthly Installments", pct: 25 },
  { label: "Turnover Payment", pct: 55 },
];

export const OWNERSHIP_OPTIONS = [
  { name: "Deed of Assignment", description: "Direct ownership transfer", bestFor: "Simple and fast" },
  { name: "Leasehold 25+25", description: "50-year renewable lease", bestFor: "Full control, lower cost" },
  { name: "Domestic Corporation", description: "60/40 Filipino corporation", bestFor: "Full land ownership rights" },
];

export const BUSINESS_LINKS = [
  { type: "Website", name: "primevilla.ph", url: "https://primevilla.ph", status: "active" as const },
  { type: "Company", name: "blue-everest.com", url: "https://blue-everest.com", status: "active" as const },
  { type: "Facebook", name: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", status: "active" as const },
  { type: "FB Group", name: "Investment PH-IL", url: "https://www.facebook.com/groups/investment.ph.il/", status: "active" as const },
  { type: "WhatsApp", name: "+639542555553", url: SITE_CONFIG.whatsappLinks.marketing, status: "active" as const },
  { type: "WhatsApp", name: "+639958565865", url: SITE_CONFIG.whatsappLinks.office, status: "active" as const },
  { type: "360 Tour", name: "Kuula Collection", url: "https://kuula.co/share/collection/7HMGx?logo=1&info=0&logosize=96&fs=1&vr=0&initload=0&thumbs=1&margin=10", status: "active" as const },
  { type: "Email", name: "ceo@blue-everest.com", url: "mailto:ceo@blue-everest.com", status: "active" as const },
];
