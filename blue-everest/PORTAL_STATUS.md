# Portal Distribution OS - סיכום מצב

**תאריך**: 15 יוני 2026
**פרויקט**: Blue Everest - Panglao Prime Villas
**דשבורד**: https://blue-everest.com/dashboard (סיסמה: BlueEverest2026!)

---

## מה נבנה (5 commits, 56 קבצים, 9,094 שורות קוד)

### 1. Backend - Portal Distribution OS
- **6 טבלאות חדשות** ב-Supabase: properties, portals, portal_listings, partners, partner_referrals, portal_distribution_logs
- **2 סוכני AI חדשים**: Portal Distribution Manager (מתאים מודעות לפורטלים), Partnership Manager (ניהול שותפויות)
- **8 connectors**: Lamudi (XML), ListGlobally (API), JamesEdition (API), Properstar (XML), LinkedIn, YouTube, Playwright Engine, QR Generator
- **15 הגדרות פורטלים** עם field mappings, image specs, description limits, לינקים ישירים
- **Portal Analyzer** שמדרג התאמת נכס לפורטל (כמו group-analyzer ב-FB Auto Poster)
- **19 API routes** חדשים (CRUD + adapt + submit + distribute SSE + webhooks)
- **8 Inngest crons** (XML feed push, freshness check, metrics sync, LinkedIn posting, OFW engagement, weekly performance, commission calc)
- **Landing page** לכל מקור פורטל עם WhatsApp CTAs

### 2. Frontend - דשבורד פורטלים
- **5 sections חדשים** בדשבורד תחת "PORTALS":
  - **סקירת פורטלים** - KPIs, צינור פרסום, מה לעשות עכשיו, גרף Recharts
  - **ניהול פורטלים** - 15 כרטיסי פורטלים, בדיקת חיבור, לינקים ישירים (פתח פורטל / צור חשבון / דשבורד)
  - **מודעות** - 18 מודעות מותאמות עם תמונות, העתק תוכן, פתח דף פרסום, הפצה SSE
  - **שותפי הפצה** - CRUD, QR codes, הצעות AI, מעקב הפניות
  - **אנליטיקס** - גרפים Recharts, ניתוח עלויות, ביצועי מודעות
- **דו-לשוני** - כל הסקשנים מגיבים לכפתור EN/HE
- **RTL** מלא בעברית

### 3. נתונים חיים בדאטאבייס
- **2 נכסים**: Villa C (PHP 35M) + Villa D (PHP 32.5M)
- **15 פורטלים** עם כל ההגדרות + לינקים ישירים
- **18 מודעות מותאמות** - כל וילה הותאמה לכל פורטל ע"י הסוכן
- **15 עברו Brand Guard**, 2 ממתינות לבדיקה

---

## מה עובד עכשיו

| יכולת | סטטוס | פירוט |
|--------|--------|-------|
| דשבורד דו-לשוני | **עובד** | EN/HE toggle, RTL |
| נתוני נכסים | **עובד** | 2 וילות עם מחירים, תמונות, תיאורים ב-3 שפות |
| התאמת מודעות AI | **עובד** | Portal Distribution Manager מתאים לכל פורטל |
| Brand Guard | **עובד** | בדיקת תוכן אוטומטית לפני פרסום |
| העתק תוכן | **עובד** | כפתור copy-to-clipboard לכל מודעה |
| לינקים ישירים | **עובד** | כל פורטל + כל מודעה עם לינק לדף הפרסום |
| הפצה SSE | **עובד** | streaming בזמן אמת כמו FB Auto Poster |
| QR לשותפים | **עובד** | יצירת QR עם tracking URL |
| הצעות AI לשותפים | **עובד** | Partnership Manager מייצר הצעות שותפות |
| Webhook לידים | **עובד** | `/api/marketing/webhooks/portal-lead` מקבל לידים מפורטלים |
| Lead Scoring | **עובד** | CRM Lead Scorer מדרג לידים מפורטלים אוטומטית |
| Financial Analyst | **עובד** | עוקב אחרי עלויות AI + פורטלים |

---

## מה חסר - משימות לביצוע

### עדיפות 1: חיבור פורטלים (דורש פתיחת חשבונות)

| # | פורטל | מה צריך | לינק הרשמה | עלות | עדיפות |
|---|--------|---------|-------------|------|--------|
| 1 | **Lamudi Philippines** | LAMUDI_FEED_URL + LAMUDI_API_KEY | lamudi.com.ph/agent/register | חינם | **קריטי** - הפורטל הכי גדול בפיליפינים |
| 2 | **ListGlobally** | LISTGLOBALLY_API_KEY + LISTGLOBALLY_AGENT_ID | listglobally.com/signup | $49/מודעה | **קריטי** - מפיץ ל-100+ פורטלים בעולם |
| 3 | **JamesEdition** | JAMESEDITION_API_KEY + JAMESEDITION_DEALER_ID | jamesedition.com/dealers/signup | $99/מודעה | **גבוה** - פורטל יוקרה בינלאומי |
| 4 | **Properstar** | PROPERSTAR_FEED_URL + PROPERSTAR_AGENCY_ID | properstar.com/agents/register | חינם | **גבוה** - אגרגטור גלובלי |
| 5 | **LinkedIn** | LINKEDIN_ACCESS_TOKEN + LINKEDIN_PERSON_URN | linkedin.com/developers | חינם | **גבוה** - קהל עסקי |
| 6 | **YouTube** | YOUTUBE_ACCESS_TOKEN + YOUTUBE_CHANNEL_ID | console.cloud.google.com | חינם | **בינוני** - סרטוני נכסים |

**ברגע שתיתן API key של כל פורטל - המערכת מפרסמת אוטומטית.**

### עדיפות 2: פרסום ידני (אפשר להתחיל היום)

| # | פורטל | מה לעשות | לינק |
|---|--------|---------|------|
| 1 | **Dot Property** | פתח חשבון agent, העתק תוכן מהדשבורד, הדבק | dotproperty.com.ph/en/register |
| 2 | **FazWaz** | פתח חשבון agent, העתק תוכן, הדבק | fazwaz.com.ph/agent/register |
| 3 | **Carousell** | פתח חשבון, פרסם כ-listing | carousell.ph/register |
| 4 | **Real.ph** | פתח חשבון, פרסם | real.ph/register |
| 5 | **Mansion Global** | שלח מודעה לעורך | mansionglobal.com/listing |
| 6 | **LuxuryEstate** | פתח חשבון agent | luxuryestate.com/agents/register |

**לכל אחד מהם - המודעה המותאמת כבר מוכנה בדשבורד. רק להעתיק ולהדביק.**

### עדיפות 3: שותפויות (דורש פעולה שלך)

| # | משימה | פירוט |
|---|--------|-------|
| 1 | **הוסף 5 מלונות/ריזורטים בבוהול** | דרך הדשבורד > שותפי הפצה > הוסף שותף |
| 2 | **צור QR לכל שותף** | כפתור "צור QR" בדשבורד |
| 3 | **שלח הצעות שותפות** | כפתור "צור הצעת שותפות (AI)" |
| 4 | **הוסף ברוקרים מקומיים** | PRC-licensed brokers באזור בוהול |
| 5 | **הוסף קהילות OFW** | ב-Dubai, Singapore, USA, Canada |

### עדיפות 4: שיפורים טכניים

| # | משימה | פירוט |
|---|--------|-------|
| 1 | **Playwright worker** | deploy worker ל-Railway לאוטומציית פורטלים ללא API |
| 2 | **Google Ads keywords** | הגדרת קמפיין search ads: "luxury villa bohol", "panglao property" |
| 3 | **LinkedIn Ads** | קמפיין ממוקד CEOs, investors, expats |
| 4 | **Video content** | סרטוני נכסים ל-YouTube/TikTok/Reels |
| 5 | **Sotheby's/Christie's** | מציאת partner agent מקומי בפיליפינים |
| 6 | **OFW targeting** | Google Ads geo-targeting: Dubai, Singapore, Hong Kong, etc. |

---

## ארכיטקטורה

```
דשבורד (blue-everest.com/dashboard)
  ├── סקירת פורטלים (KPIs + pipeline + Recharts)
  ├── ניהול פורטלים (15 פורטלים + test connection + links)
  ├── מודעות (18 מותאמות + images + copy + SSE distribute)
  ├── שותפי הפצה (CRUD + QR + AI proposals)
  └── אנליטיקס (charts + tables + cost analysis)
        │
        ▼
Backend APIs (/api/marketing/portal-*)
  ├── properties/ (CRUD)
  ├── portals/ (CRUD + test-connection)
  ├── portal-listings/ (CRUD + adapt + submit + refresh + distribute SSE)
  ├── partners/ (CRUD + proposal + qr)
  ├── partner-referrals/ (CRUD)
  ├── distribution/ (overview + performance)
  └── webhooks/portal-lead (inbound leads)
        │
        ▼
AI Agents
  ├── Portal Distribution Manager (Sonnet) - מתאים מודעות לפורטלים
  ├── Partnership Manager (Haiku) - מנהל שותפויות
  ├── Brand Guard - מאשר תוכן לפני פרסום
  ├── CRM Lead Scorer - מדרג לידים
  └── Financial Analyst - עוקב עלויות
        │
        ▼
Connectors (8 חיבורים)
  ├── Lamudi (XML feed)
  ├── ListGlobally (REST API → 100+ portals)
  ├── JamesEdition (REST API)
  ├── Properstar (XML feed)
  ├── LinkedIn (Marketing API)
  ├── YouTube (Data API v3)
  ├── Playwright Engine (FazWaz, Dot Property)
  └── QR Generator
        │
        ▼
Inngest Crons (8 משימות מתוזמנות)
  ├── 06:00 - XML feed push (Lamudi, Properstar)
  ├── 07:00 - Freshness check (רענון מודעות)
  ├── 12:00 - Metrics sync (צפיות, פניות)
  ├── 10:00 Mon/Wed/Fri - LinkedIn posting
  ├── 14:00 Tue/Thu - OFW engagement
  ├── 09:00 Monday - Weekly performance report
  ├── 08:00 Monday - Partner commissions
  └── Event: Brand guard on adapted listings
```

---

## הצעד הבא

**הדבר הכי משפיע שאפשר לעשות עכשיו:**

1. **פתח חשבון ב-Lamudi** (חינם, 5 דקות) → תן לי את ה-API key → המערכת מפרסמת אוטומטית את שתי הוילות ב-Lamudi תוך שניות

2. **פתח חשבון ב-ListGlobally** ($49/מודעה) → תן לי את ה-API key → המודעות מופצות ל-100+ פורטלים ברחבי העולם אוטומטית

3. **היכנס לדשבורד → מודעות → לחץ "העתק תוכן"** על כל מודעה → **הדבק ב-4 פורטלים ידניים** (Dot Property, FazWaz, Carousell, Real.ph) → זה לוקח 15 דקות ומכסה את כל הפורטלים הפיליפיניים
