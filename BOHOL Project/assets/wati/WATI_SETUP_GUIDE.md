# WATI Setup Guide — Panglao Prime Villas

## שלב 1: Template Messages (הודעות תבנית)

### מה זה?
הודעות תבנית הן הודעות שצריכות אישור של Meta לפני שאפשר לשלוח אותן ללקוחות. הן חובה עבור כל הודעה ראשונה ללקוח.

### איך מעלים:
1. היכנסו ל-WATI Dashboard → **Broadcast** → **Template Messages**
2. לחצו **Create Template** או **Import CSV**
3. אם אתם מייבאים — השתמשו בקובץ `WATI_TEMPLATE_MESSAGES.csv`
4. אם ביד — העתיקו כל תבנית מהקובץ

### תבניות שצריך ליצור:

| שם | שפה | סוג | שימוש |
|----|------|-----|-------|
| ppv_welcome | EN | MARKETING | הודעת פתיחה באנגלית |
| ppv_welcome_he | HE | MARKETING | הודעת פתיחה בעברית |
| ppv_investment_overview | EN | MARKETING | פרטי השקעה |
| ppv_site_visit | EN | UTILITY | תיאום ביקור |
| ppv_financing | EN | UTILITY | אפשרויות מימון |
| ppv_financing_he | HE | UTILITY | מימון בעברית |
| ppv_follow_up | EN | MARKETING | פולואפ אחרי 48 שעות |
| ppv_follow_up_he | HE | MARKETING | פולואפ בעברית |
| ppv_urgency | EN | MARKETING | דחיפות/FOMO |
| ppv_closing | EN | UTILITY | תהליך רכישה |
| ppv_vip_fasttrack | EN | MARKETING | VIP מהיר |

**חשוב:** אישור Meta לוקח 24-48 שעות. תתחילו עם זה קודם.

---

## שלב 2: Keyword Automations (אוטומציות)

### מה זה?
כשמישהו שולח מילה מסוימת, WATI שולח תשובה אוטומטית.

### איך מגדירים:
1. WATI Dashboard → **Automation** → **Keyword Action**
2. לכל שורה ב-`WATI_KEYWORD_AUTOMATIONS.csv`:
   - **Keyword**: המילה שמפעילה
   - **Action**: שלח Template Message
   - **Template**: שם התבנית
   - **Assign to**: הצוות שמקבל את הליד

### אוטומציות לפי עדיפות:

**עדיפות גבוהה (הגדירו קודם):**
- Initial Inquiry EN/HE — כל ליד חדש מקבל תשובה מיידית
- Investment Questions — כל שאלת מחיר/תשואה

**עדיפות בינונית:**
- Site Visit Request — תיאום ביקורים
- Financing Questions — שאלות מימון

**עדיפות נמוכה (הגדירו אחרי):**
- Follow Up 48h — אוטומטי, דורש הגדרת זמן
- VIP / Closing — ידני, לא אוטומטי

---

## שלב 3: Flow Builder (בונה הזרמים)

### מה זה?
Flow Builder הוא הכלי של WATI לבנות שיחות אוטומטיות מורכבות (כמו chatbot).

### איך בונים:
1. WATI Dashboard → **Automation** → **Flow Builder**
2. לחצו **Create New Flow**
3. בנו את הזרם לפי ה-JSON files ב-`/assets/whatsapp/`

### הזרמים לפי סדר בנייה:

| # | זרם | קובץ מקור | עדיפות |
|---|------|-----------|--------|
| 1 | Initial Inquiry | FLOW_01_INITIAL_INQUIRY.json | קריטי |
| 2 | Israel Specific | FLOW_02_ISRAEL_SPECIFIC.json | קריטי |
| 3 | FAQ | FLOW_03_FAQ_DETAILED.json | גבוה |
| 4 | Site Visit | FLOW_04_SITE_VISIT_SCHEDULER.json | גבוה |
| 5 | Financing | FLOW_05_FINANCING_QUALIFICATION.json | גבוה |
| 6 | Objection Handling | FLOW_06_OBJECTION_HANDLING.json | בינוני |
| 7 | Comparison | FLOW_07_COMPARISON_ALTERNATIVES.json | בינוני |
| 8 | Closing | FLOW_08_CLOSING_PROCESS.json | בינוני |
| 9 | PH Cultural | FLOW_09_PHILIPPINES_CULTURAL_NUANCES.json | בינוני |
| 10 | Follow Up | FLOW_10_FOLLOW_UP_ENGAGEMENT.json | גבוה |
| 11 | VIP | FLOW_11_VIP_FASTTRACK.json | בינוני |
| 12 | CRM Handoff | FLOW_12_CRM_HANDOFF_TO_SALES.json | גבוה |

### איך לבנות כל זרם:
1. פתחו את קובץ ה-JSON המתאים
2. ב-Flow Builder, הוסיפו node לכל `node` ב-JSON
3. חברו את ה-nodes לפי `target` בכפתורים
4. הגדירו `capture_fields` כ-Contact Attributes ב-WATI

---

## שלב 4: Contact Attributes (שדות קשר)

### הגדירו את השדות הבאים:
1. WATI Dashboard → **Team** → **Contact Attributes**
2. הוסיפו:

| שם שדה | סוג | שימוש |
|---------|------|-------|
| country | Text | מדינת מגורים |
| timeline | Text | ASAP / 30 days / Exploring |
| budget | Text | Cash / Finance / Exploring |
| language | Text | en / he |
| lead_score | Number | ציון ליד (0-100) |
| lead_status | Text | cold / warm / hot / vip |
| city_il | Text | עיר בישראל |
| investment_amount | Number | סכום השקעה |

---

## שלב 5: Tags (תגיות)

### הגדירו תגיות:
- `new_lead` — ליד חדש
- `new_lead_il` — ליד ישראלי
- `investment_interest` — מעוניין בהשקעה
- `site_visit_request` — מבקש ביקור
- `financing_interest` — מעוניין במימון
- `hot_lead` — ליד חם
- `vip_lead` — VIP
- `closing` — בתהליך סגירה
- `follow_up` — דורש פולואפ

---

## בדיקה

אחרי שהכל מוגדר:
1. שלחו הודעת "hello" מטלפון אישי — בדקו שהאוטומציה עובדת
2. שלחו "שלום" — בדקו שהגרסה העברית עובדת
3. נסו כל כפתור בזרם הראשון
4. בדקו שהלידים מופיעים ב-WATI Contacts עם התגיות הנכונות
