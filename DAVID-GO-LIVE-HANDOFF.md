# דיוויד GO LIVE - מסמך הפעלה והשלמה

תאריך: 7 ביוני 2026
מטרה: להעלות את סוכן המכירות David למסנג'ר כך שינהל שיחות אמיתיות עם לקוחות.

---

## 1. סטטוס מאומת (מה שכבר עובד)

- David בנוי, מאומן, ופרוס חי ב-Vercel. ה-API שלו פעיל: `/api/marketing/chat`.
- האתר על דומיינים יציבים: `blue-everest.com` ו-`blue-everest.vercel.app`.
- ה-webhook של מסנג'ר מחובר ומאומת:
  - Callback URL: `https://blue-everest.com/api/marketing/webhooks/meta`
  - Verify token: מוגדר (זהה ל-`META_WEBHOOK_VERIFY_TOKEN` ב-Vercel).
  - שדות מנויים (Page): messages פעיל, feed פעיל.
- ב-Meta Business Suite פעילה תגובה אוטומטית ראשונית (Auto reply) עם תשואה 17-25% ושני מספרי הוואטסאפ. זה נותן מענה מיידי לכל פנייה ראשונה גם עכשיו.
- כל 11 תיאורי ההרשאות ב-App Review מולאו (Describe) ונשמרו.

---

## 2. החסם היחיד שנשאר

מטא כותבת במפורש במסך ה-Webhooks:

> "No production data, including from app admins, developers or testers, will be delivered unless the app has been published."

כלומר: כל עוד האפליקציה לא Published (Live), אף הודעה אמיתית מהמסנג'ר לא תגיע ל-David. הצנרת מוכנה, אבל מטא לא תזרים הודעות עד הפרסום.

כדי לפרסם צריך לסיים את אישור ה-App Review של pages_messaging. זה הצוואר בקבוק היחיד.

---

## 3. למה אני לא יכול לסיים את זה לבד

שלושה דברים בתהליך הם שלך בלבד, מסיבות אבטחה ואחריות, ולא אבצע אותם במקומך:

1. אימות זהות/עסק (Verification): כולל העלאת מסמכי זהות או מסמכי חברה.
2. סימון הצהרות "I agree to comply with allowed usage" וההגשה הסופית (Submit): אלה הצהרות משפטיות שאתה מאשר בשמך.
3. הקלטת הסרטונים (Screencast): דורש הקלטת מסך אמיתית מהמערכת שלך.

מטא עצמה כותבת באותו מסך: תשובות לא מדויקות עלולות לגרום לאובדן גישה לפלטפורמה. לכן נכון שאתה תאשר, לא אני.

---

## 4. מה שנשאר לך לעשות, לפי הסדר

### שלב א: להשלים את ה-Allowed usage
בכל אחת מההרשאות (ads_management, Marketing API, pages_messaging, pages_read_user_content, pages_manage_metadata, pages_manage_ads, pages_manage_posts, pages_show_list, business_management, ads_read, pages_read_engagement):
- התיאור (Describe) כבר מולא. ✅
- סמן את התיבה "If approved, I agree that any data... will be used in accordance with the allowed usage".
- העלה screencast (ראה שלב ג).

### שלב ב: Data handling
מלא את שאלון ה-Data handling (איך האפליקציה אוספת, משתמשת, שומרת ומשתפת נתונים). מומלץ להיוועץ בגורם משפטי. אם תרצה, אני אכין טיוטת תשובות שתעבור עליהן ותאשר.

### שלב ג: הקלטת הסרטונים
ראה תסריט מלא בסעיף 5.

### שלב ד: Verification
לחץ "Go to verification" והשלם את אימות העסק/הזהות עם המסמכים הנדרשים.

### שלב ה: Submit for review
כשכל הצעדים ירוקים, כפתור "Submit for review" ייפתח. לחץ עליו.

### שלב ו: Publish
אחרי אישור מטא, פרסם את האפליקציה (Publish). מרגע זה David יענה לכולם במסנג'ר.

---

## 5. תסריט הסרטונים (Screencast)

כללי: הקלטה קצרה (30-90 שניות) שמראה את הפעולה מקצה לקצה, מחשבון פייסבוק אמיתי עם תפקיד Tester. הקלטה במק: Cmd + Shift + 5.

הערה על ביצה ותרנגולת: הודעות אמיתיות מגיעות ל-David רק אחרי פרסום, אבל הפרסום דורש את הסרטון. הפתרון: בסרטון אפשר להשתמש בכפתור "Test" שבמסך ה-Webhooks (Page > messages > Test) כדי לשלוח אירוע בדיקה ולהראות את David מגיב, וגם להראות את שיחת David החיה בצ'אט של האתר (blue-everest.com) כהוכחה שהפיצ'ר עובד. כשנגיע לזה אני אעזור לבנות את ההדגמה המדויקת.

### סרטון 1 - הודעות ועמוד (pages_messaging, pages_read_user_content, pages_manage_metadata, pages_read_engagement, pages_show_list, pages_manage_posts)
1. כניסה לכלי ובחירת העמוד Blue Everest מתוך רשימת העמודים (pages_show_list).
2. שליחת הודעה לעמוד: "Hi, I am interested in your villas in Bohol".
3. הכלי מקבל את ההודעה דרך webhook ומציג אותה (pages_manage_metadata + pages_read_user_content).
4. David משיב אוטומטית במסנג'ר תוך שניות (pages_messaging).
5. פרסום פוסט קצר לעמוד מתוך הכלי (pages_manage_posts).
6. פתיחת מסך התובנות של העמוד (pages_read_engagement).

### סרטון 2 - פרסום (ads_management, Marketing API Access Tier, pages_manage_ads, ads_read, business_management)
1. Business Manager: הצגת קישור העמוד וחשבון המודעות לאפליקציה (business_management).
2. הכלי יוצר או עורך קמפיין בחשבון המודעות שלך (ads_management + Marketing API).
3. הצגת מודעה מקושרת לעמוד (pages_manage_ads).
4. פתיחת דוח ביצועים: חשיפות, קליקים, עלות (ads_read).

---

## 6. מסלול חלופי מהיר יותר (ManyChat) - אם לא רוצים לחכות לאישור

אישור מטא לוקח ימים ודורש אימות וסרטון. אם רוצים את David חי מהר יותר בלי הפרסום:
- ManyChat (אפליקציה מאושרת) מתחבר לעמוד ומקבל את הודעות המסנג'ר.
- מגדירים ב-ManyChat "External Request" שקורא ל-API החי של David: `https://blue-everest.com/api/marketing/chat`.
- ManyChat שולח חזרה ללקוח את התשובה ש-David ניסח.

יתרון: עוקף לגמרי את הפרסום ואת אישור מטא. חיסרון: תלות בצד שלישי ומנוי חודשי.
שים לב: הקמת ManyChat דורשת פתיחת חשבון וחיבור OAuth של העמוד, שהם פעולות שאתה צריך לבצע.

---

## 7. צ'קליסט env ב-Vercel (לוודא שמוגדרים)

- `META_WEBHOOK_VERIFY_TOKEN` (זהה לזה שבמסך ה-Webhooks)
- `META_PAGE_ACCESS_TOKEN` (כדי ש-David ישלח תשובות)
- `META_PAGE_ID` = 1091251924067685
- מפתחות Supabase
- מפתח ה-LLM (Anthropic/OpenAI) שמריץ את David

---

## 8. הצעד הבא המומלץ

ההמלצה שלי: סיים את שלב א (סימון ההצהרות) ושלב ד (Verification), ואז נתאם יחד את הקלטת הסרטונים ואת ההגשה. ברגע שהאפליקציה תפורסם, David חי ומדבר עם לקוחות אמיתיים.
