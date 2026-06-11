# Facebook Auto-Responses: Panglao Prime Villas
## Blue Everest Asset Group

> Last updated: 2026-06-05
> Markets: Israel (Hebrew) + Philippines (English)
> Page: https://www.facebook.com/BlueEverestGroup

---

## SYSTEM STATUS: AI-POWERED AUTO-RESPONSES ACTIVE

The webhook at `/api/marketing/webhooks/meta` now handles ALL Facebook interactions automatically:

1. **Every message or comment = automatic lead** in Supabase (even cold leads)
2. **AI-powered contextual responses** via the sales chatbot agent (not just keyword matching)
3. **Language auto-detection** (Hebrew/English) with market-specific pricing and rules
4. **Lead scoring updated live** as new signals are detected in conversations
5. **Full audit trail** - every inbound message, outbound reply, and signal logged to `lead_activities`
6. **Private follow-up messages** sent automatically to commenters via Messenger

### Files changed:
- `src/app/api/marketing/webhooks/meta/route.ts` - enhanced webhook handler
- `src/lib/connectors/meta-graph.ts` - new Meta API connector (send messages, reply to comments)

### Prerequisite:
- `META_WEBHOOK_VERIFY_TOKEN` must be set in Vercel env vars
- Meta webhook subscription must be configured for: `messages`, `messaging_postbacks`, `feed`

The templates below serve as **reference/fallback** content. The live system uses the sales chatbot AI agent which has full property knowledge and generates contextual responses per conversation.

---

# PART A: MESSENGER AUTO-REPLIES (Reference Templates)

---

## A1. Instant Reply (הודעה ראשונה / Welcome)
**Trigger:** Any first message to the page

### Hebrew (IL)
```
שלום! תודה שפנית אלינו.

אני מ-Blue Everest Asset Group, ואני כאן לענות על כל שאלה לגבי הווילות הפרטיות שלנו בפנגלאו, בוהול.

כמה פרטים מהירים:
- וילה פרטית מ-1,535,000 ₪
- הכנסה חודשית מאומתת: PHP 395,000
- תשואה שנתית: 17-25%
- 3 פתרונות בעלות משפטיים לישראלים

איך אוכל לעזור?

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865
```

### English (PH)
```
Hi! Thank you for reaching out to Blue Everest Asset Group.

I'm here to help you with any questions about our private luxury villas in Panglao, Bohol.

Quick highlights:
- Private villa from PHP 32,500,000
- Verified monthly income: PHP 395,000
- Annual ROI: 17-25%
- BDO Bank financing available for qualified buyers

How can I help you today?

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865
```

---

## A2. Price Inquiry (שאלת מחיר)
**Trigger keywords:** price, cost, how much, כמה, מחיר, עלות, budget

### Hebrew (IL)
```
תודה על השאלה! יש לנו 2 וילות זמינות:

Villa D: 1,535,000 ₪
- 263.78 מ"ר, 4 חדרי שינה
- 60 שניות מחוף פנגלאו

Villa C: 1,650,000 ₪
- 4 חדרי שינה, בריכה פרטית
- ניהול מלא כלול

שריון: 9,999 ₪ בלבד

שתי הווילות מניבות הכנסה חודשית מאומתת של PHP 395,000 דרך Airbnb.

3 פתרונות בעלות חוקיים: Deed of Assignment, חכירה 25+25, או תאגיד מקומי.

רוצה לקבל חוברת מפורטת?

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865
```

### English (PH)
```
Thank you for asking! We have 2 villas available:

Villa D: PHP 32,500,000
- 263.78 sqm, 4 bedrooms
- 60 seconds from Panglao Beach

Villa C: PHP 35,000,000
- 4 bedrooms, private pool
- Full professional management included

Reservation deposit: PHP 200,000

Both villas generate a verified monthly income of PHP 395,000 through Airbnb.

BDO Bank financing available for qualified Filipino buyers.

Would you like to receive our detailed prospectus?

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865
```

---

## A3. Investment / ROI Inquiry (שאלת השקעה)
**Trigger keywords:** ROI, return, income, rental, invest, תשואה, הכנסה, השקעה, הכנסה פסיבית

### Hebrew (IL)
```
שאלה מצוינת. הנה המספרים:

- הכנסה חודשית מאומתת: PHP 395,000 (Airbnb)
- תשואה שנתית: 17-25%
- תפוסה ממוצעת: 65% (הממוצע באזור: 49%)
- ניהול מקצועי מלא כלול
- וילה פרטית מ-1,535,000 ₪

בוהול היא יעד תיירות מוביל בפיליפינים עם עלייה של 136.9% בתיירות הבינלאומית.

3 דרכים חוקיות לבעלות: Deed of Assignment, חכירה 25+25 שנה, או הקמת תאגיד פיליפיני.

נשמח לשלוח דוח רווחיות מפורט. כתוב לנו בוואטסאפ:

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865
```

### English (PH)
```
Great question! Here are the numbers:

- Verified monthly income: PHP 395,000 (Airbnb)
- Annual ROI: 17-25%
- Average occupancy: 65% (area average: 49%)
- Full professional management included
- Private villa from PHP 32,500,000

Bohol is a top tourism destination in the Philippines with 136.9% growth in international arrivals.

BDO Bank financing available for qualified buyers.

We can send you a detailed profitability report. Reach us on WhatsApp:

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865
```

---

## A4. Location Inquiry (שאלת מיקום)
**Trigger keywords:** where, location, address, map, איפה, מיקום, כתובת

### Hebrew (IL)
```
הווילות ממוקמות בפנגלאו, בוהול, פיליפינים.

- 60 שניות הליכה מחוף פנגלאו (Panglao Beach)
- בין JW Marriott לבין Mithi Resort
- 263.78 מ"ר שטח בנוי
- 4 חדרי שינה, בריכה פרטית

בוהול נגישה בטיסה ישירה ממנילה (1.5 שעות) ובקרוב טיסות בינלאומיות ישירות.

מ-1,535,000 ₪ בלבד.

נשמח לתאם סיור וירטואלי או ביקור באתר. צרו קשר:

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865
```

### English (PH)
```
The villas are located in Panglao, Bohol, Philippines.

- 60 seconds walk from Panglao Beach
- Between JW Marriott and Mithi Resort
- 263.78 sqm floor area
- 4 bedrooms, private pool

Bohol is accessible via direct flight from Manila (1.5 hours), with new international flights coming soon.

Starting at PHP 32,500,000. BDO Bank financing available.

We'd be happy to arrange a virtual tour or site visit. Contact us:

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865
```

---

## A5. Legal Ownership (בעלות משפטית, Israel only)
**Trigger keywords:** בעלות, חוקי, משפטי, חוזה, ownership, legal, foreigner

### Hebrew (IL)
```
שאלה חשובה. ישראלים יכולים לרכוש בעלות בפיליפינים ב-3 דרכים חוקיות:

1. Deed of Assignment: הסכם הקצאה רשום, הכי נפוץ בקרב משקיעים זרים.

2. חכירה 25+25 שנה (Leasehold): חכירה ארוכת טווח, ניתנת לחידוש ולהעברה.

3. תאגיד מקומי (Domestic Corporation): הקמת חברה פיליפינית עם 60% בעלות מקומית, שליטה מלאה לבעלים.

כל 3 האפשרויות נבדקו משפטית ומבטיחות הגנה מלאה.

וילה פרטית מ-1,535,000 ₪, הכנסה חודשית PHP 395,000.

לייעוץ אישי:
WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865
```

---

## A6. Financing (מימון)
**Trigger keywords:** מימון, הלוואה, משכנתא, financing, loan, BDO, bank, payment

### Hebrew (IL)
```
אנחנו מציעים מספר אפשרויות תשלום:

- שריון: 9,999 ₪ בלבד
- אפשרות מימון ישירות מישראל (בנק לאומי, הפועלים, דיסקונט)
- תנאי תשלום גמישים בהתאמה אישית
- מחיר כולל מ-1,535,000 ₪

הכנסה חודשית מאומתת: PHP 395,000 (Airbnb).
3 מסלולי בעלות חוקיים: Deed of Assignment, חכירה 25+25, תאגיד מקומי.

פרטי המימון המלאים נמסרים בפגישת ייעוץ אישית. צרו קשר:

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865
```

### English (PH)
```
Great news: BDO Bank financing is available for qualified Filipino buyers.

Key details:
- Reservation: PHP 200,000
- Villa D: PHP 32,500,000
- Villa C: PHP 35,000,000
- Verified monthly income: PHP 395,000

Financing terms and eligibility are discussed during your consultation call. Our team will guide you through the full process.

Contact us for more details:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865
```

---

## A7. Reservation / How to Buy (שריון / איך קונים)
**Trigger keywords:** reserve, buy, purchase, book, שריון, לקנות, הזמנה, רכישה

### Hebrew (IL)
```
התהליך פשוט ומלווה:

שלב 1: שיחת ייעוץ ובדיקת נאותות (ימים 1-3)
שלב 2: שריון הנכס: 9,999 ₪ בלבד (יום 3)
שלב 3: בחירת מסלול בעלות: Deed of Assignment, חכירה 25+25, או תאגיד
שלב 4: חתימת חוזה (ימים 7-14)
שלב 5: העברת בעלות (ימים 14-28)
שלב 6: קבלת מפתחות והכנסה ראשונה (יום 30)

מחיר וילה מ-1,535,000 ₪. הכנסה חודשית: PHP 395,000.

סוכן מכירות מוקצה ילווה אותך בכל שלב. בואו נתחיל:

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865
```

### English (PH)
```
The process is straightforward:

Step 1: Consultation and due diligence (Days 1-3)
Step 2: Property reservation: PHP 200,000 deposit (Day 3)
Step 3: Financing application with BDO Bank (Days 4-7)
Step 4: Contract signing (Days 7-14)
Step 5: Title transfer (Days 14-28)
Step 6: Handover and first income (Day 30)

Villa D: PHP 32,500,000. Verified monthly income: PHP 395,000.

A dedicated agent will guide you through every step. Let's get started:

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865
```

---

## A8. Site Visit / Virtual Tour (ביקור באתר)
**Trigger keywords:** visit, tour, see, viewing, ביקור, לראות, סיור

### Hebrew (IL)
```
נשמח לארגן לך סיור!

אפשרות 1: סיור וירטואלי (30 דקות)
- דרך Zoom או שיחת וידאו בוואטסאפ
- ניתן לתאם להיום או למחר

אפשרות 2: ביקור פיזי באתר
- תיאום תוך 3-5 ימים
- כולל איסוף משדה התעופה ולינה

הווילות ממוקמות 60 שניות מחוף פנגלאו, מ-1,535,000 ₪.

מתי נוח לך?

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865
```

### English (PH)
```
We'd love to show you the property!

Option 1: Virtual Tour (30 minutes)
- Via Zoom or WhatsApp video call
- Available today or tomorrow

Option 2: In-Person Site Visit
- Arranged within 3-5 days
- Includes airport pickup and accommodation

The villas are located 60 seconds from Panglao Beach. Starting at PHP 32,500,000.

When works best for you?

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865
```

---

## A9. Away / After Hours Message
**Trigger:** Outside business hours (before 8AM or after 9PM PHT)

### Hebrew (IL)
```
תודה שפנית אלינו! כרגע אנחנו מחוץ לשעות הפעילות.

נחזור אליך ביום העבודה הבא, בד"כ תוך 4-6 שעות.

בינתיים, כמה עובדות:
- וילה פרטית בפנגלאו מ-1,535,000 ₪
- הכנסה חודשית: PHP 395,000
- תשואה: 17-25%

לתגובה מהירה יותר, שלחו הודעה בוואטסאפ:
WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865
```

### English (PH)
```
Thank you for reaching out! We're currently outside business hours.

We'll get back to you on the next business day, usually within 4-6 hours.

In the meantime, here are some quick facts:
- Private villa in Panglao from PHP 32,500,000
- Monthly income: PHP 395,000
- Annual ROI: 17-25%

For a faster response, message us on WhatsApp:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865
```

---

# PART B: COMMENT AUTO-REPLIES (על פוסטים ומודעות)

---

## B1. General Interest Comment
**Trigger keywords:** interested, info, details, tell me more, מעוניין, מעניין, פרטים, ספרו לי

### Hebrew (IL)
```
היי! תודה על ההתעניינות.
וילה פרטית בפנגלאו, בוהול מ-1,535,000 ₪ בלבד, עם הכנסה חודשית מאומתת של PHP 395,000.
שלחנו לך הודעה פרטית עם כל הפרטים!
או כתבו לנו ישירות:
WhatsApp: +639542555553 / +639958565865
```

### English (PH)
```
Hi! Thanks for your interest.
A private villa in Panglao, Bohol starts at PHP 32,500,000, with a verified monthly income of PHP 395,000.
We just sent you a private message with all the details!
Or reach us directly:
WhatsApp: +639542555553 / +639958565865
```

---

## B2. Price Question in Comments
**Trigger keywords:** how much, price, cost, magkano, כמה עולה, מחיר

### Hebrew (IL)
```
Villa D: 1,535,000 ₪
Villa C: 1,650,000 ₪
שריון: 9,999 ₪ בלבד.
הכנסה חודשית מאומתת: PHP 395,000, תשואה 17-25%.
שלחנו לך פרטים מלאים בהודעה פרטית!
WhatsApp: +639542555553 / +639958565865
```

### English (PH)
```
Villa D: PHP 32,500,000
Villa C: PHP 35,000,000
Reservation: PHP 200,000
Verified monthly income: PHP 395,000. Annual ROI: 17-25%.
BDO Bank financing available.
We sent you full details in a private message!
WhatsApp: +639542555553 / +639958565865
```

---

## B3. "Send Info" / "DM Me" Comment
**Trigger keywords:** DM, PM, send info, message me, שלחו, פרטים בפרטי, הודעה

### Hebrew (IL)
```
שלחנו לך הודעה פרטית עכשיו!
וילה פרטית מ-1,535,000 ₪, הכנסה חודשית PHP 395,000.
אפשר גם דרך וואטסאפ: +639542555553 / +639958565865
```

### English (PH)
```
Just sent you a private message!
Private villa from PHP 32,500,000, monthly income PHP 395,000.
You can also reach us on WhatsApp: +639542555553 / +639958565865
```

---

## B4. Emoji-Only Reaction
**Trigger:** Comments that are only emojis or very short reactions

### Hebrew (IL)
```
תודה! רוצה לשמוע על וילה פרטית בפנגלאו מ-1,535,000 ₪ עם הכנסה חודשית של PHP 395,000?
שלחנו לך הודעה פרטית!
WhatsApp: +639542555553 / +639958565865
```

### English (PH)
```
Thanks! Want to learn about a private villa in Panglao from PHP 32,500,000 with a monthly income of PHP 395,000?
We sent you a private message!
WhatsApp: +639542555553 / +639958565865
```

---

## B5. Skepticism / "Is This Real?" Comment
**Trigger keywords:** scam, real, legit, fake, אמיתי, רציני, בלוף

### Hebrew (IL)
```
שאלה לגיטימית. Blue Everest Asset Group היא חברה רשומה בפיליפינים.
הכנסה חודשית של PHP 395,000 מאומתת דרך Airbnb עם תפוסה של 65%.
3 מסלולי בעלות חוקיים: Deed of Assignment, חכירה 25+25, תאגיד מקומי.
נשמח לשתף דוחות ומסמכים. כתבו לנו:
WhatsApp: +639542555553 / +639958565865
```

### English (PH)
```
Valid question. Blue Everest Asset Group is a registered Philippine company.
Monthly income of PHP 395,000 is verified through Airbnb with 65% occupancy.
BDO Bank financing available for qualified buyers.
We're happy to share reports and documentation. Reach us:
WhatsApp: +639542555553 / +639958565865
```

---

## B6. "I Want to Visit" Comment
**Trigger keywords:** visit, see, tour, ביקור, לראות, אבוא

### Hebrew (IL)
```
מעולה! אפשר סיור וירטואלי (30 דק') או ביקור פיזי.
הווילות 60 שניות מחוף פנגלאו, מ-1,535,000 ₪.
שלחנו לך הודעה פרטית לתיאום!
WhatsApp: +639542555553 / +639958565865
```

### English (PH)
```
We'd love to have you! We offer virtual tours (30 min) or in-person visits.
The villas are 60 seconds from Panglao Beach, starting at PHP 32,500,000.
We sent you a private message to schedule!
WhatsApp: +639542555553 / +639958565865
```

---

# PART C: SETUP INSTRUCTIONS

## Messenger Auto-Replies (Meta Business Suite)
1. Go to **business.facebook.com** > Blue Everest Asset Group > **Inbox**
2. Click the gear icon (Settings) > **Automations**
3. **Instant Reply**: Paste A1 content (select language based on user's FB language)
4. **Away Message**: Paste A9 content, set hours: before 8AM and after 9PM PHT
5. **Frequently Asked Questions**: Add A2-A8 as FAQ entries with their trigger keywords
6. For keyword-based auto-replies: Meta Business Suite > Inbox > Automations > **Custom Keywords**

## Comment Auto-Replies (Meta Business Suite)
1. Go to **business.facebook.com** > Blue Everest Asset Group > **Inbox**
2. Under **Comment Replies**, enable auto-replies
3. Add each B1-B6 template with the corresponding trigger keywords
4. Enable **"Also send a private reply"** for B1, B3, B4 to push leads into Messenger

## Testing Checklist
- [ ] Send a test message to the page from a personal account
- [ ] Verify Hebrew instant reply works
- [ ] Verify English instant reply works
- [ ] Test keyword triggers (send "מחיר", "price", "ROI", etc.)
- [ ] Verify away message appears outside business hours
- [ ] Comment on a post with "interested" and verify auto-reply
- [ ] Confirm all WhatsApp links are clickable on mobile
- [ ] Confirm all prices match current pricing
