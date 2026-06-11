# COWORK TASK — עדכון אימייל בכל הפלטפורמות החיצוניות

**תאריך:** 2026-04-16
**עדיפות:** דחוף — לבצע לפני שליחת כל קמפיין
**אימייל חדש:** `ceo@blue-everest.com`

---

## מה כבר בוצע (בקבצים — לא צריך לגעת)

כל הקבצים במערכת כבר עודכנו:
- 21 email templates
- 4 landing pages (3 HE + 1 EN)
- Google Shopping feed
- WhatsApp CRM handoff flow
- Owner Dashboard
- סה"כ 18 קבצים — 0 הפניות ישנות נשארו

--

## מה צריך לעדכן בפלטפורמות (הכל ידני)

### 1. Brevo (Email Marketing)
- [ ] Settings → Senders & IPs → Senders
- [ ] הוסף sender חדש: `ceo@blue-everest.com`
- [ ] בצע verification (אימות דומיין / אימות אימייל)
- [ ] עדכן את כל ה-Automations שה-sender הוא האימייל החדש
- [ ] מחק את ה-sender הישן (`hello@primevilla.ph`) אחרי שהכל עובד

### 2. WATI (WhatsApp Business)
- [ ] Settings → Profile → Business Email → שנה ל-`ceo@blue-everest.com`
- [ ] Settings → Notifications → עדכן אימייל לקבלת התראות
- [ ] בדוק שה-Template Messages שולחים התראות לאימייל החדש

### 3. Meta Business Manager (Facebook/Instagram Ads)
- [ ] Business Settings → Business Info → Contact Email → `ceo@blue-everest.com`
- [ ] Ad Account Settings → Notifications → עדכן אימייל
- [ ] Facebook Page → Settings → Page Info → Email → `ceo@blue-everest.com`
- [ ] Instagram Business Profile → Edit Profile → Contact → Email

### 4. Google Ads
- [ ] Account Settings → Preferences → Contact Email → `ceo@blue-everest.com`
- [ ] Billing → Payment Account → Contact Info → עדכן
- [ ] Google Merchant Center (Shopping) → Settings → Contact → `ceo@blue-everest.com`

### 5. Google Analytics
- [ ] Admin → Account Settings → Contact Email
- [ ] בדוק שדוחות יומיים/שבועיים נשלחים לאימייל החדש

### 6. Domain / DNS (אם רלוונטי)
- [ ] הגדר SPF record עבור `blue-everest.com` כדי ש-Brevo יוכל לשלוח מהדומיין
- [ ] הגדר DKIM record עבור `blue-everest.com`
- [ ] בדוק שאין DMARC שחוסם שליחה

### 7. Google Sheets (CRM)
- [ ] שתף את הגיליון עם `ceo@blue-everest.com`
- [ ] בדוק שיש הרשאות עריכה

### 8. אתר (primevilla.ph)
- [ ] עדכן את הטופס באתר — שכתובת ה"Reply-To" היא `ceo@blue-everest.com`
- [ ] עדכן footer באתר אם יש שם אימייל מוצג
- [ ] בדוק contact page

---

## בדיקה אחרי עדכון

- [ ] שלח test email מ-Brevo — בדוק שהשולח מוצג כ-`ceo@blue-everest.com`
- [ ] שלח הודעת WhatsApp דרך WATI — בדוק שההתראה מגיעה לאימייל החדש
- [ ] מלא טופס באתר — בדוק שההודעה מגיעה לגוגל שיטס ושהתשובה חוזרת מהאימייל החדש
- [ ] בדוק ב-spam folder — אם אימיילים נופלים לספאם, כנראה חסר SPF/DKIM

---

**חשוב:** האימייל הישן `hello@primevilla.ph` לא צריך להיות פעיל יותר בשום מקום. אם מישהו שולח אליו, זה צריך לעשות forward ל-`ceo@blue-everest.com` או להחזיר הודעה שהכתובת השתנתה.
