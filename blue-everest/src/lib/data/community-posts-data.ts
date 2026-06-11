export type CommunityCategory = "EDUCATE" | "SHOWCASE" | "CONNECT" | "CONVERT";
export type CommunityPostStatus = "draft" | "ready" | "published";

export interface CommunityPost {
  id: number;
  title: string;
  titleEn: string;
  category: CommunityCategory;
  scheduled: string;
  status: CommunityPostStatus;
  hebrewCopy: string;
  englishCopy: string;
  image: string;
  reactions: number;
  comments: number;
  shares: number;
  notes: string;
}

const COMMUNITY_POST_SOURCE: CommunityPost[] = [
  {
    id: 1,
    title: "מדריך המשקיע הישראלי לנדל\"ן בפיליפינים - 2026",
    titleEn: "Israeli Investor's Guide to Philippine Real Estate 2026",
    category: "EDUCATE",
    scheduled: "2026-05-29",
    status: "published",
    hebrewCopy: `מדריך המשקיע הישראלי לנדל"ן בפיליפינים - 2026

הפיליפינים הפכו ליעד מרכזי למשקיעי נדל"ן מישראל, ולא במקרה. שוק בשווי 94.4 מיליארד דולר, אוכלוסייה של 116.79 מיליון תושבים עם גיל חציוני של 26.1 בלבד, וצמיחת תמ"ג של 5.5%-6.4% - המספרים מדברים בעד עצמם.

הנה מה שכל משקיע ישראלי צריך לדעת לפני שהוא נכנס לשוק:

📊 תשואות
- באזורי מגורים עירוניים (מנילה, סבו): תשואת שכירות ממוצעת של 5.2%
- באזורי נופש (בוהול, פלוואן, סיארגאו): תשואה של 8%-16%
- לשם השוואה: תשואת שכירות ממוצעת בישראל עומדת על 2.5%-3.5%

💰 מחיר כניסה
- וילה יוקרתית בבוהול עולה כמו דירת 3 חדרים בחיפה
- וילת נופש מניבה בפנגלאו: החל מ-1,535,000 ש"ח
- הזמנת מקום (reservation): 9,999 ש"ח בלבד

🏛️ בעלות חוקית - 3 פתרונות לישראלים
1. Deed of Assignment - הדרך הנפוצה ביותר, מהירה ויעילה
2. Leasehold 25+25 שנים (או 99 שנים לפי חוק RA 12252 החדש)
3. Domestic Corporation (60/40) - חברה פיליפינית עם שותף מקומי

⚖️ מיסוי
- אמנת מס ישראל-פיליפינים (1997) מונעת כפל מס
- מס רווחי הון: 6% בלבד (לעומת 25% בישראל)
- עלויות עסקה כוללות: 13%-15%

✈️ נגישות
- 12,742 ישראלים ביקרו בפיליפינים ב-2023
- טיסות דרך בנגקוק, הונג קונג או דובאי (8-12 שעות)
- אין צורך בוויזה לשהייה של עד 30 יום

📈 למה עכשיו?
- הפזו הפיליפיני נחלש ב-20% מול הדולר - כוח קנייה גבוה יותר לישראלים
- חוק ה-Leasehold החדש (99 שנים) נכנס לתוקף בספטמבר 2025
- ענף ה-BPO (מיקור חוץ) צומח ל-40 מיליארד דולר
- העברות OFW (עובדים פיליפינים בחו"ל): 35.63 מיליארד דולר בשנה - מנוע צריכה פנימי

המדריך הזה הוא התחלה. לכל סיטואציה יש פרטים ספציפיים.

שמרו את הפוסט הזה 📌 - תודו לעצמכם כשתתחילו לבדוק השקעות.

📲 שאלות? דברו איתנו:
WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Israeli Investor's Guide to Philippine Real Estate - 2026

The Philippines has become a key destination for Israeli real estate investors, and not by accident. A market worth $94.4 billion, a population of 116.79 million with a median age of just 26.1, and GDP growth of 5.5%-6.4% - the numbers speak for themselves.

Here is what every Israeli investor needs to know before entering the market:

Returns
- Urban residential areas (Manila, Cebu): average rental yield of 5.2%
- Resort areas (Bohol, Palawan, Siargao): yields of 8%-16%
- For comparison: average rental yield in Israel stands at 2.5%-3.5%

Entry Price
- A luxury villa in Bohol costs the same as a 3-bedroom apartment in Haifa
- Income-producing resort villa in Panglao: starting at 1,535,000 NIS
- Reservation deposit: only 9,999 NIS

Legal Ownership - 3 Solutions for Israelis
1. Deed of Assignment - the most popular path, fast and efficient
2. Leasehold 25+25 years (or 99 years under the new RA 12252 law)
3. Domestic Corporation (60/40) - a Philippine company with a local partner

Taxation
- Israel-Philippines tax treaty (1997) prevents double taxation
- Capital gains tax: only 6% (compared to 25% in Israel)
- Total transaction costs: 13%-15%

Accessibility
- 12,742 Israelis visited the Philippines in 2023
- Flights via Bangkok, Hong Kong, or Dubai (8-12 hours)
- No visa required for stays up to 30 days

Why Now?
- The Philippine peso weakened 20% against the dollar - greater purchasing power for Israelis
- New 99-year Leasehold law (RA 12252) took effect September 2025
- BPO sector growing to $40 billion
- OFW remittances: $35.63 billion annually - a powerful domestic consumption engine

This guide is a starting point. Each situation has specific details.

Save this post - you will thank yourself when you start exploring investments.

Questions? Talk to us:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/01_ph_investment_guide.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 2,
    title: "3 דרכים חוקיות לישראלים להחזיק נכס בפיליפינים 🏠",
    titleEn: "3 Legal Ownership Paths for Israelis",
    category: "EDUCATE",
    scheduled: "2026-06-02",
    status: "ready",
    hebrewCopy: `3 דרכים חוקיות לישראלים להחזיק נכס בפיליפינים 🏠

"אבל זרים לא יכולים לקנות קרקע בפיליפינים" - נכון, אבל לא סוף הסיפור. יש 3 מסלולים חוקיים ומוכרים שישראלים משתמשים בהם כבר שנים. הנה הפירוט:

מסלול 1: Deed of Assignment (הסבת זכויות)
הדרך הנפוצה ביותר. בעל הקרקע הפיליפיני חותם על שטר הסבה המעביר את כל הזכויות הכלכליות אליכם - שימוש, השכרה, מכירה, הורשה.

יתרונות:
- מהיר ופשוט
- עלויות נמוכות
- שליטה מלאה בנכס
- ניתן לביצוע מרחוק עם נוטריון

חסרונות:
- הטאבו (Title) נשאר על שם הפיליפיני
- דורש אמון בשותף המקומי או עו"ד מפקח
- לא כל בנק מכיר את המבנה הזה למשכנתא

מסלול 2: Leasehold (חכירה)
חוק RA 12252 (ספטמבר 2025) שינה את הכללים: חכירה לזרים עלתה מ-50 שנים ל-99 שנים. זו קפיצה משמעותית שמשנה את חישוב התשואה לחלוטין.

יתרונות:
- 99 שנים - למעשה בעלות לדור אחד ומעלה
- מוכר על ידי בנקים ומוסדות
- רישום רשמי ב-Registry of Deeds
- בטוח משפטית, מבוסס על חוק פיליפיני

חסרונות:
- אינה בעלות מלאה (leasehold ולא freehold)
- חוק RA 12252 חדש, הפרקטיקה עוד מתגבשת
- עלות רישום ומיסוי מעט גבוהים יותר מ-Deed of Assignment

מסלול 3: Domestic Corporation (חברה מקומית 60/40)
מקימים חברה פיליפינית: 60% בעלות פיליפינית, 40% בעלות ישראלית. החברה רוכשת את הקרקע והנכס.

יתרונות:
- בעלות מלאה על הקרקע (דרך החברה)
- מבנה עסקי מוכר ושקוף
- מאפשר הרחבה לנכסים נוספים
- מתאים למשקיעים עם תיק גדול

חסרונות:
- דורש שותף פיליפיני שמחזיק ב-60%
- עלויות הקמה ותחזוקה של חברה (5,000-15,000 ש"ח לשנה)
- Anti-Dummy Act - הפרה של יחס 60/40 היא עבירה פלילית
- דיווח שנתי ל-SEC ול-BIR

מה עוד חשוב לדעת:
- אמנת המס ישראל-פיליפינים (1997) חלה על כל 3 המסלולים
- Condo Act - זרים יכולים להחזיק ב-40% מיחידות בבניין (קונדו) ישירות, ללא מבנה מיוחד
- הליך ה-KYC (הכרת הלקוח) ניתן לביצוע דיגיטלית מישראל
- עו"ד מקומי מומלץ בכל מסלול

איזה מבנה מתאים לכם? כתבו בתגובות את הסיטואציה שלכם ונעזור לכוון

לייעוץ אישי:
WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `3 Legal Ways for Israelis to Own Property in the Philippines

"But foreigners cannot buy land in the Philippines" - true, but that is not the end of the story. There are 3 legal, well-established paths that Israelis have been using for years. Here is the breakdown:

Path 1: Deed of Assignment (Rights Transfer)
The most popular method. The Filipino landowner signs an assignment deed transferring all economic rights to you - use, rental, sale, and inheritance.

Pros:
- Fast and simple
- Low costs
- Full control of the property
- Can be done remotely with a notary

Cons:
- The title remains under the Filipino's name
- Requires trust in the local partner or a supervising attorney
- Not all banks recognize this structure for mortgages

Path 2: Leasehold
RA 12252 (September 2025) changed the rules: foreign leasehold terms increased from 50 years to 99 years. This is a significant leap that completely changes the yield calculation.

Pros:
- 99 years - effectively ownership for a generation and beyond
- Recognized by banks and institutions
- Official registration at the Registry of Deeds
- Legally secure, based on Philippine law

Cons:
- Not full ownership (leasehold, not freehold)
- RA 12252 is new, practices are still being established
- Registration and tax costs slightly higher than Deed of Assignment

Path 3: Domestic Corporation (60/40 Company)
You establish a Philippine company: 60% Filipino-owned, 40% Israeli-owned. The company purchases the land and property.

Pros:
- Full ownership of the land (through the company)
- Recognized and transparent business structure
- Allows expansion to additional properties
- Suitable for investors with a large portfolio

Cons:
- Requires a Filipino partner holding 60%
- Company setup and maintenance costs (5,000-15,000 NIS per year)
- Anti-Dummy Act - violating the 60/40 ratio is a criminal offense
- Annual reporting to SEC and BIR

What else is important to know:
- The Israel-Philippines tax treaty (1997) applies to all 3 paths
- Condo Act - foreigners can directly own up to 40% of units in a building (condo), no special structure needed
- KYC (Know Your Customer) can be completed digitally from Israel
- A local attorney is recommended for any path

Which structure fits your situation? Write in the comments and we will help point you in the right direction.

For personal consultation:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/03_legal_ownership.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 3,
    title: "למה פיליפינים ולא יוון? 10 מספרים שיגרמו לכם לחשוב מחדש 🔢",
    titleEn: "Philippines vs Greece: 10 Numbers That Will Make You Reconsider",
    category: "EDUCATE",
    scheduled: "2026-06-05",
    status: "ready",
    hebrewCopy: `למה משקיעים ישראלים מעבירים את המוקד מיוון לפנגלאו? המספרים מדברים בעד עצמם

יוון הייתה היעד המועדף של ישראלים לנדל"ן בחו"ל. אבל כשבוחנים את הנתונים לעומק, התמונה משתנה.

השוואה מעניינת:
🇬🇷 יוון: תשואת שכירות 4-6%
🇵🇭 פנגלאו: תשואת שכירות 17-25%, וילת יוקרה 263.78 מ"ר מ-PHP 32,500,000

מה שמעניין במיוחד:
• צמיחת תמ"ג פיליפינים: 5.5-6.4% לעומת 2% ביוון
• מס רווחי הון: 6% בפיליפינים לעומת 15% ביוון
• אוכלוסייה צעירה (גיל חציוני 26.1) מול 45 ביוון

הבעיה בפיליפינים? בעלות זרה מוגבלת. הפתרון? שלוש דרכים חוקיות:
1. Deed of Assignment
2. Leasehold 25+25 או 99 שנים
3. Domestic Corporation (60/40)

כל פתרון עם יתרונות וחסרונות משלו.

מה דעתכם? האם המספרים מצדיקים את המעבר מהמוכר (יוון) לחדש (פיליפינים)?

לפרטים נוספים על הפתרונות המשפטיים ותחזית התשואות:
WhatsApp: +639542555553 (Marketing) או +639958565865 (Office)
הזמנה: PHP 200,000`,
    englishCopy: `Why Philippines and Not Greece? 10 Numbers That Will Make You Reconsider

Greece is the classic destination for Israelis looking for overseas real estate. But when you compare the numbers, the picture is more complex than you might think.

Here are 10 comparisons worth knowing:

1. Rental Yield
Greece: 4%-6%
Philippines: 8%-16% (resort areas)

2. Minimum Entry Price
Greece: Golden Visa from EUR 250,000 (approx. 960,000 NIS)
Philippines: No minimum. Luxury villa from 1,535,000 NIS

3. Median Population Age
Greece: 45
Philippines: 26.1
(Younger population = growing housing demand, expanding labor market)

4. GDP Growth
Greece: 2%
Philippines: 5.5%-6.4%

5. Capital Gains Tax on Real Estate
Greece: 15%
Philippines: 6%

6. Average Property Price
Athens: from EUR 100,000 (384,000 NIS)
Panglao, Bohol: luxury villa - 1,535,000 NIS (263.78 sqm, 4 bedrooms, private pool)

7. Internal Economic Engine
Greece: tourism and EU
Philippines: OFW $35.63 billion/year + BPO $40 billion

8. Tourism
Greece: 33 million tourists (2023)
Philippines: 5.45 million - with much greater growth potential

9. Foreign Leasehold Law
Greece: foreigners buy directly (EU)
Philippines: 99-year leasehold (new), Deed of Assignment, or Domestic Corporation 60/40

10. Distance from Israel
Greece: 2-hour flight
Philippines: 8-12 hours (with stopover)`,
    image: "/images/community-agent/02_ph_vs_greece.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 4,
    title: "מס נדל\"ן בפיליפינים - מה ישראלים צריכים לדעת 📋",
    titleEn: "Philippine Real Estate Tax Guide for Israelis",
    category: "EDUCATE",
    scheduled: "2026-06-08",
    status: "ready",
    hebrewCopy: `מס נדל"ן בפיליפינים - מה ישראלים צריכים לדעת 📋

המיסוי הוא מה שהופך השקעה מ"נשמע טוב" ל"משתלם באמת". הנה הפירוט המלא של מיסוי נדל"ן בפיליפינים, עם השוואה לישראל.

מיסי רכישה (עלויות כניסה)

Documentary Stamp Tax (מס בולים): 1.5% משווי הנכס
Transfer Tax (מס העברה): 0.5%-0.75% (משתנה לפי אזור)
Registration Fee: לפי טבלה, בדרך כלל 0.25%-0.5%
עלות סה"כ ברכישה: כ-3%-4% משווי הנכס

דוגמה: על וילה ב-1,535,000 ש"ח, עלויות הרכישה יעמדו על כ-46,000-61,000 ש"ח.

מס שנתי על הנכס

Real Property Tax (ארנונה): 1%-2% מהשומה הממשלתית (assessed value)
שימו לב: השומה הממשלתית בפיליפינים נמוכה משמעותית משווי השוק, לרוב 30%-50% בלבד. כך שבפועל, הארנונה נמוכה מאוד.

מס על הכנסה משכירות

לתושב חוץ (Non-Resident Alien): 25% מס קבוע על הכנסה ברוטו
זה נשמע גבוה, אבל:
- אמנת המס ישראל-פיליפינים (1997) מאפשרת קיזוז כנגד מס ישראלי
- אין כפל מס - מה ששולם בפיליפינים מוכר בישראל
- ישנן דרכים חוקיות להפחתת בסיס המס (הוצאות, פחת)

מס רווחי הון (Capital Gains Tax)

פיליפינים: 6% על שווי המכירה או השומה הממשלתית - הגבוה מביניהם
ישראל: 25% על הרווח הריאלי

זו אחת ההשוואות המשמעותיות ביותר. מס רווחי הון של 6% הוא מהנמוכים בעולם.

מע"מ (VAT)

12% מע"מ חל על עסקאות נדל"ן מעל PHP 3,199,200 (כ-208,000 ש"ח)
בדרך כלל המוכר נושא את המע"מ, אך יש לוודא בחוזה.

טבלת השוואה: פיליפינים מול ישראל

רווחי הון: פיליפינים 6% | ישראל 25%
מס רכישה (כולל): פיליפינים 3%-4% | ישראל 8%-10%
ארנונה שנתית: פיליפינים 1%-2% (על שומה ממשלתית) | ישראל 0.2%-1% (על שווי שוק)
מס הכנסה משכירות (זרים): פיליפינים 25% ברוטו | ישראל 15%-47% (מדרגות)
עלויות עסקה מלאות (round-trip): פיליפינים 13%-15% | ישראל 18%-22%

רישום ב-BIR

כל רוכש נדל"ן בפיליפינים חייב ברישום ב-BIR (Bureau of Internal Revenue), המקביל לרשות המיסים. התהליך כולל:
- קבלת TIN (Tax Identification Number) לזרים
- דיווח שנתי על הכנסות מנדל"ן
- ניתן לנהל באמצעות רו"ח מקומי

3 דרכי בעלות - כולן כפופות לאותם חוקי מס:
- Deed of Assignment
- Leasehold (עד 99 שנים לפי חוק RA 12252)
- Domestic Corporation 60/40

ההבדל: ב-Domestic Corporation, המס חל על החברה ולא על הפרט, מה שעשוי להיות יעיל יותר בתיקים גדולים.

שאלות על תרחיש ספציפי? כתבו בתגובות ונעזור לפרט

לייעוץ:
WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Philippine Real Estate Tax - What Israelis Need to Know

Taxation is what turns an investment from "sounds good" to "actually profitable." Here is the complete breakdown of Philippine real estate taxation, with a comparison to Israel.

Purchase Taxes (Entry Costs)

Documentary Stamp Tax: 1.5% of property value
Transfer Tax: 0.5%-0.75% (varies by municipality)
Registration Fee: per schedule, typically 0.25%-0.5%
Total purchase cost: approximately 3%-4% of property value

Example: on a villa at 1,535,000 NIS, purchase costs would be approximately 46,000-61,000 NIS.

Annual Property Tax

Real Property Tax: 1%-2% of government assessed value
Note: government assessed values in the Philippines are significantly lower than market value, typically only 30%-50%. In practice, property tax is very low.

Tax on Rental Income

For Non-Resident Aliens: 25% flat tax on gross income
This sounds high, but:
- The Israel-Philippines tax treaty (1997) allows offset against Israeli tax
- No double taxation - amounts paid in the Philippines are credited in Israel
- There are legal ways to reduce the tax base (expenses, depreciation)

Capital Gains Tax

Philippines: 6% on sale price or government assessed value, whichever is higher
Israel: 25% on real capital gains

This is one of the most significant comparisons. A 6% capital gains tax is among the lowest in the world.

VAT (Value Added Tax)

12% VAT applies to real estate transactions above PHP 3,199,200 (approx. 208,000 NIS)
Usually the seller bears the VAT, but this should be verified in the contract.

Comparison Table: Philippines vs Israel

Capital Gains: Philippines 6% | Israel 25%
Purchase Tax (total): Philippines 3%-4% | Israel 8%-10%
Annual Property Tax: Philippines 1%-2% (on assessed value) | Israel 0.2%-1% (on market value)
Rental Income Tax (foreigners): Philippines 25% gross | Israel 15%-47% (brackets)
Full Transaction Costs (round-trip): Philippines 13%-15% | Israel 18%-22%

BIR Registration

Every property buyer in the Philippines must register with the BIR (Bureau of Internal Revenue), the equivalent of the Israel Tax Authority. The process includes:
- Obtaining a TIN (Tax Identification Number) for foreigners
- Annual reporting of real estate income
- Can be managed through a local accountant

3 ownership paths - all subject to the same tax laws:
- Deed of Assignment
- Leasehold (up to 99 years under RA 12252)
- Domestic Corporation 60/40

The difference: with a Domestic Corporation, tax applies to the company rather than the individual, which may be more efficient for large portfolios.

Questions about a specific scenario? Drop them in the comments and we will help elaborate.

For consultation:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/03_legal_ownership.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 5,
    title: "שוק הנדל\"ן הפיליפיני 2026 - מה קורה עכשיו 📈",
    titleEn: "Philippine Real Estate Market Update 2026",
    category: "EDUCATE",
    scheduled: "2026-06-12",
    status: "ready",
    hebrewCopy: `שוק הנדל"ן הפיליפיני 2026 - מה קורה עכשיו 📈

עדכון שוק למשקיעים ישראלים, מבוסס על נתונים ממקורות רשמיים.

תמונת מאקרו

שוק הנדל"ן הפיליפיני מוערך ב-94.4 מיליארד דולר, עם צפי לצמיחה ל-135.9 מיליארד דולר עד 2034 (CAGR של 4.2%). לא בועה, אלא צמיחה מתמשכת המונעת על ידי דמוגרפיה, עיור, וזרימות הון חוזרות.

3 מנועי הצמיחה:
- OFW (עובדים פיליפינים בחו"ל): 35.63 מיליארד דולר בשנה שזורמים חזרה למדינה
- BPO (מיקור חוץ): ענף בשווי 40 מיליארד דולר שמעסיק 1.6 מיליון עובדים
- השקעות זרות ישירות (FDI): 8.93 מיליארד דולר, עלייה של 42%

מחירים לפי אזור

מנילה (BGC, מקאטי):
- PHP 230,000-450,000 למ"ר (כ-14,500-28,400 ש"ח)
- שוק של קונים, היצע עולה על ביקוש
- תשואת שכירות: 5%-6%
- מתאים למשקיעים שמחפשים סחירות ונזילות

סבו:
- PHP 130,000-230,000 למ"ר (כ-8,200-14,500 ש"ח)
- תשואת שכירות: 6%-8%
- צמיחה יציבה, ענף IT-BPO מקומי חזק
- מחירים עדיין 40%-50% מתחת למנילה

בוהול (פנגלאו):
- שוק נופש, מחירים מגוונים
- תשואת Airbnb: 8%-16%
- וילת יוקרה (4 חדרי שינה, בריכה, 263.78 מ"ר): 1,535,000 ש"ח
- ביקוש תיירותי עולה, שדה תעופה בינלאומי חדש פעיל

מה השתנה ב-2025-2026

1. חוק RA 12252 (ספטמבר 2025): חכירה לזרים עלתה ל-99 שנים, מ-50 שנים. זו הרפורמה המשמעותית ביותר לזרים בעשור האחרון.

2. הפזו נחלש: PHP 62 לדולר, ירידה של כ-20%. לישראלים זה אומר כוח קנייה גבוה יותר - אותו נכס עולה פחות בשקלים מאשר לפני שנתיים.

3. FDI קפץ ב-42%: 8.93 מיליארד דולר, סימן לאמון בינלאומי בשוק.

4. בניית תשתיות: תוכנית "Build Better More" - נמלי תעופה, כבישים, רכבות. בוהול קיבלה שדה תעופה בינלאומי חדש (Panglao International Airport) שכבר פעיל.

מה זה אומר למשקיעים ישראלים

הזדמנות: השילוב של מטבע חלש, חוק חכירה חדש, ותשואות גבוהות יוצר חלון כניסה נוח. אבל "חלון" לא אומר "עכשיו או לעולם לא", אלא שהתנאים הנוכחיים מיטיבים עם קונים.

סיכון: רגולציה פיליפינית מורכבת, שוק לא תמיד שקוף, מרחק גיאוגרפי. לכן 3 מבני הבעלות (Deed of Assignment, Leasehold 99 שנים, Domestic Corporation 60/40) הם קריטיים - ובחירת המבנה הנכון דורשת ייעוץ מקצועי.

אמנת המס ישראל-פיליפינים (1997) מספקת רשת ביטחון מיסויית, אבל כל תרחיש דורש בחינה פרטנית.

יש שאלה לגבי אזור ספציפי או סוג נכס? כתבו בתגובות ונפרט

לשיחה אישית:
WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Philippine Real Estate Market 2026 - What Is Happening Now

Market update for Israeli investors, based on data from official sources.

Macro Picture

The Philippine real estate market is valued at $94.4 billion, with projected growth to $135.9 billion by 2034 (CAGR of 4.2%). Not a bubble, but sustained growth driven by demographics, urbanization, and returning capital flows.

3 growth engines:
- OFW (Overseas Filipino Workers): $35.63 billion per year flowing back into the country
- BPO (Business Process Outsourcing): a $40 billion industry employing 1.6 million workers
- Foreign Direct Investment (FDI): $8.93 billion, up 42%

Prices by Area

Manila (BGC, Makati):
- PHP 230,000-450,000 per sqm (approx. 14,500-28,400 NIS)
- Buyer's market, supply exceeds demand
- Rental yield: 5%-6%
- Suitable for investors seeking liquidity and tradability

Cebu:
- PHP 130,000-230,000 per sqm (approx. 8,200-14,500 NIS)
- Rental yield: 6%-8%
- Stable growth, strong local IT-BPO sector
- Prices still 40%-50% below Manila

Bohol (Panglao):
- Resort market, diverse pricing
- Airbnb yield: 8%-16%
- Luxury villa (4 bedrooms, pool, 263.78 sqm): 1,535,000 NIS
- Rising tourist demand, new international airport operational

What Changed in 2025-2026

1. RA 12252 (September 2025): foreign leasehold increased to 99 years, from 50. This is the most significant reform for foreigners in the past decade.

2. Peso weakened: PHP 62 per dollar, a decline of approximately 20%. For Israelis, this means greater purchasing power - the same property costs less in shekels than it did two years ago.

3. FDI jumped 42%: $8.93 billion, a signal of international market confidence.

4. Infrastructure build-out: the "Build Better More" program - airports, roads, railways. Bohol received a new international airport (Panglao International Airport) already in operation.

What This Means for Israeli Investors

Opportunity: the combination of a weak currency, new leasehold law, and high yields creates a favorable entry window. But "window" does not mean "now or never" - it means current conditions favor buyers.

Risk: Philippine regulation is complex, the market is not always transparent, and there is geographic distance. This is why the 3 ownership structures (Deed of Assignment, 99-year Leasehold, Domestic Corporation 60/40) are critical - and choosing the right structure requires professional guidance.

The Israel-Philippines tax treaty (1997) provides a tax safety net, but each scenario requires individual examination.

Have a question about a specific area or property type? Write in the comments and we will elaborate.

For a personal conversation:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/01_ph_investment_guide.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 6,
    title: "Airbnb בפיליפינים - המספרים האמיתיים (לא מה שמוכרים לכם)",
    titleEn: "Airbnb בפיליפינים - המספרים האמיתיים",
    category: "EDUCATE",
    scheduled: "2026-06-15",
    status: "ready",
    hebrewCopy: `Airbnb בפיליפינים - המספרים האמיתיים (לא מה שמוכרים לכם)

בואו נדבר תכלס. יש הרבה "מומחי נדל"ן" שמציגים מספרים מנופחים כדי למכור וילות בפיליפינים. אני מעדיף להראות לכם את התמונה המלאה, עם הנתונים כמו שהם.

המספרים הארציים (ממוצע):
- הכנסה שנתית ממוצעת מ-Airbnb: PHP 350,000-420,000
- תפוסה ממוצעת: 41-52%
- מחיר לילה ממוצע (ADR): PHP 2,481-2,900

עכשיו, הנה מה שחשוב להבין: הממוצע כולל סטודיו בן 25 מ"ר במנילה ליד דירה של סטודנטים. זה לא אותו מוצר כמו וילת פרימיום.

המספרים של וילות יוקרה (Top 10%):
- ADR: PHP 6,000-8,400+
- תפוסה: 70%+ (ה-Top 10% מגיעים ל-73%+)
- הכנסה שנתית: 7 ספרות בפזו

השוואה בין אזורים:
- סיארגאו: מקום 1 ארצי, תפוסה 71%, הכנסה שנתית ממוצעת PHP 640,000
- בורקאי: תפוסה 80%+ בעונת שיא
- פנגלאו (בוהול): 934-1,230 נכסים רשומים, תפוסה 41-52%, ADR PHP 2,481-2,900

עונתיות - זה המפתח:
עונת שיא: דצמבר עד מאי. בחודשים האלה התפוסה ב-Top 10% מגיעה ל-85%+. בעונה הנמוכה (יוני-נובמבר) התפוסה יורדת, אבל וילות יוקרה עם ניהול מקצועי שומרות על 55-65%.

מה מפריד בין הממוצע ל-Top 10%?
1. מיקום - חוף מול פנים הארץ (הפרש של פי 10 במחיר ללילה)
2. ניהול מקצועי - מנהל נכס מקומי שעונה תוך 60 שניות
3. רמת גימור - וילה עם 4 חדרי שינה ובריכה מול דירה בסיסית
4. אסטרטגיית תמחור דינמית
5. דירוג Superhost

נקודה חשובה: אין עדיין רגולציה ארצית על Airbnb בפיליפינים. זה חרב פיפיות, גם הזדמנות וגם סיכון לשינויים עתידיים.

השורה התחתונה: המספרים הממוצעים לא רלוונטיים אם אתם משקיעים בנכס יוקרה עם ניהול נכון. אבל אל תיקחו את המספרים של ה-Top 10% ותניחו שזה מה שתקבלו בלי לעשות שיעורי בית.

מי מכם כבר מפעיל Airbnb בפיליפינים? מה התפוסה שלכם בפועל? שתפו בתגובות.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Airbnb in the Philippines - The Real Numbers (Not What They're Selling You)

Let's talk straight. There are plenty of "real estate experts" throwing inflated numbers to sell villas. I prefer showing you the full picture, data as it is.

National averages:
- Average annual Airbnb income: PHP 350,000-420,000
- Average occupancy: 41-52%
- Average daily rate (ADR): PHP 2,481-2,900

Important context: the average includes a 25 sqm studio in Manila next to student housing. That is not the same product as a premium villa.

Luxury villa numbers (Top 10%):
- ADR: PHP 6,000-8,400+
- Occupancy: 70%+ (Top 10% reach 73%+)
- Annual income: 7 figures in pesos

Regional comparison:
- Siargao: #1 nationally, 71% occupancy, average annual income PHP 640,000
- Boracay: 80%+ occupancy in peak season
- Panglao (Bohol): 934-1,230 listed properties, 41-52% occupancy, ADR PHP 2,481-2,900

Seasonality is key:
Peak season runs December to May. Top 10% properties hit 85%+ occupancy during peak. Low season (June-November) sees lower numbers, but luxury villas with professional management maintain 55-65%.

What separates average from Top 10%?
1. Location - beachfront vs interior (10x difference in nightly rate)
2. Professional management - a local property manager who responds within 60 seconds
3. Build quality - a 4-bedroom villa with pool vs a basic apartment
4. Dynamic pricing strategy
5. Superhost rating

Important note: there is no national Airbnb regulation in the Philippines yet. This is a double-edged sword, both an opportunity and a risk of future changes.

Bottom line: average numbers are irrelevant if you invest in a luxury property with proper management. But do not take Top 10% numbers and assume that is what you will get without doing your homework.

Who here already runs an Airbnb in the Philippines? What is your actual occupancy? Share in the comments.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/04_panglao_aerial.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 7,
    title: "10 טעויות שישראלים עושים כשהם משקיעים בנדל\"ן בפיליפינים (ואיך להימנע מהן)",
    titleEn: "10 טעויות שישראלים עושים כשהם משקיעים בנדל\"ן בחו\"ל",
    category: "EDUCATE",
    scheduled: "2026-06-19",
    status: "ready",
    hebrewCopy: `10 טעויות שישראלים עושים כשהם משקיעים בנדל"ן בפיליפינים (ואיך להימנע מהן)

אחרי ליווי של עשרות משקיעים ישראלים, אלה הטעויות שחוזרות שוב ושוב. קראו עד הסוף, כי טעות מספר 2 יכולה לשלוח אתכם לכלא.

1. לא מבינים את חוקי הבעלות
זרים לא יכולים להחזיק קרקע בפיליפינים. נקודה. אבל יש 3 פתרונות חוקיים: Deed of Assignment, Leasehold (עכשיו 99 שנה לפי החוק החדש), או Domestic Corporation (60% פיליפינית, 40% זרה). מי שלא מבין את ההבדל בין השלושה, משקיע בעיוורון.
מה לעשות: לבחור עורך דין מקומי שמתמחה בעסקאות זרים, לפני שמתחילים לחפש נכס.

2. שימוש ב-Nominee (איש קש)
זו לא רק טעות, זו עבירה פלילית. חוק ה-Anti-Dummy Law קובע עונש מאסר. כן, גם אם "כולם עושים את זה." אם ה-Nominee מחליט שהנכס שלו, אין לכם שום הגנה משפטית.
מה לעשות: להשתמש בפתרונות חוקיים בלבד. אין קיצורי דרך.

3. לא מחשבים 13-15% עלויות עסקה הלוך-חזור
מס העברה, מס רכישה, רישום, עמלות תיווך, מס רווחי הון. ביחד זה 13-15% מערך הנכס. משקיעים שמחשבים תשואה בלי לקחת את זה בחשבון מרמים את עצמם.
מה לעשות: לבנות מודל פיננסי שכולל את כל העלויות, כולל Exit.

4. ציפיות תשואה לא מציאותיות
מישהו הבטיח לכם 25% תשואה מובטחת? הממוצע הארצי ב-Airbnb הוא PHP 350,000-420,000 בשנה. כן, וילות יוקרה מגיעות ל-17-25%, אבל זה דורש ניהול מקצועי, מיקום מעולה, ורמת גימור גבוהה.
מה לעשות: לדרוש נתוני Airbnb אמיתיים (AirDNA, Airbtics) ולא מצגת שיווקית.

5. לא בודקים את הטאבו (LRA)
Land Registration Authority הוא המקור היחיד לאימות בעלות. נכסים עם בעיות ברישום יכולים להפוך לסיוט. בפיליפינים יש עדיין נכסים עם Tax Declaration בלבד, בלי Title.
מה לעשות: לדרוש Certified True Copy של ה-Title מה-LRA לפני כל תשלום.

6. התעלמות מסיכון מטבע
הפזו נסחר ב-PHP 62 לדולר. תנודות של 5-10% בשנה הן נורמליות. אם ההכנסה שלכם בפזו והמשכנתא שלכם בשקלים, אתם חשופים.
מה לעשות: לבנות אסטרטגיית גידור, לשקול להשאיר הכנסות בפזו ולהמיר בעיתוי נכון.

7. מיקום לא נכון
הפרש של פי 10 במחיר ללילה בין וילה על חוף הים לבין נכס בפנים הארץ. וילה מהממת בכפר 15 דקות מהחוף תניב חצי מוילה בינונית על קו המים.
מה לעשות: לבדוק ביצועי Airbnb של נכסים דומים באותו רחוב, לא באותו עיר.

8. לא נרשמים ב-BIR
Bureau of Internal Revenue דורש רישום של כל הכנסה משכירות. משקיעים שלא נרשמים חוסכים בטווח הקצר אבל מסתכנים בקנסות ובבעיות בעת מכירה.
מה לעשות: לפתוח TIN ולהירשם ב-BIR עם רואה חשבון מקומי מיום הרכישה.

9. הערכת יתר של תפוסת Airbnb
הממוצע הארצי הוא 41-52%. לא 80%. גם באזורי תיירות חזקים, העונה הנמוכה (יוני-נובמבר) מורידה את הממוצע השנתי. Top 10% מגיעים ל-73%+, אבל זה דורש עבודה.
מה לעשות: לחשב תשואה על בסיס 55% תפוסה, ולהפתיע כלפי מעלה.

10. בלי מנהל נכס מקומי
ניהול מרחוק מישראל? בהצלחה. אורח ש-check-in שלו ב-2 בלילה צריך מישהו שעונה תוך 60 שניות. בלי מנהל מקומי, הדירוג שלכם יורד ואיתו ההכנסה.
מה לעשות: למצוא מנהל נכס עם ניסיון מוכח ב-Airbnb באזור שלכם, לפני שאתם קונים.

שמרו את הפוסט הזה. הוא ישווה לכם הרבה כסף.

יש לכם שאלה על אחת מהנקודות? כתבו בתגובות.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `10 Mistakes Israelis Make When Investing in Philippine Real Estate (And How to Avoid Them)

After working with dozens of Israeli investors, these are the mistakes that keep coming back. Read to the end, because mistake number 2 can land you in prison.

1. Not understanding ownership laws
Foreigners cannot own land in the Philippines. Period. But there are 3 legal solutions: Deed of Assignment, Leasehold (now 99 years under the new law), or Domestic Corporation (60% Filipino, 40% foreign). If you do not understand the difference, you are investing blind.
Fix: Hire a local lawyer specializing in foreign transactions before you start looking.

2. Using a Nominee (straw man)
This is not just a mistake, it is a criminal offense. The Anti-Dummy Law carries prison time. Yes, even if "everyone does it." If your Nominee decides the property is theirs, you have zero legal protection.
Fix: Use legal ownership structures only. No shortcuts.

3. Not factoring 13-15% round-trip transaction costs
Transfer tax, documentary stamp tax, registration fees, broker commissions, capital gains tax. Together that is 13-15% of property value. Investors who calculate returns without this are fooling themselves.
Fix: Build a financial model that includes all costs, including exit.

4. Wrong yield expectations
Someone promised you fixed 25% returns? The national Airbnb average is PHP 350,000-420,000 per year. Yes, luxury villas can reach 17-25%, but that requires professional management, prime location, and high build quality.
Fix: Demand real Airbnb data (AirDNA, Airbtics), not a marketing presentation.

5. No title verification (LRA)
The Land Registration Authority is the only source for ownership verification. Properties with registration issues can become a nightmare. The Philippines still has properties with only a Tax Declaration, no Title.
Fix: Require a Certified True Copy of the Title from LRA before any payment.

6. Currency risk ignored
The peso trades at PHP 62 per dollar. Fluctuations of 5-10% per year are normal. If your income is in pesos and your mortgage is in shekels, you are exposed.
Fix: Build a hedging strategy, consider keeping income in pesos and converting at the right time.

7. Wrong location
There is a 10x difference in nightly rate between a beachfront villa and an interior property. A beautiful villa in a village 15 minutes from the beach will earn half of an average villa on the waterfront.
Fix: Check Airbnb performance of comparable properties on the same street, not the same city.

8. No BIR registration
The Bureau of Internal Revenue requires registration of all rental income. Investors who skip registration save short-term but risk penalties and problems when selling.
Fix: Open a TIN and register with BIR through a local accountant from day one.

9. Overestimating Airbnb occupancy
The national average is 41-52%. Not 80%. Even in strong tourism areas, the low season (June-November) pulls down the annual average. Top 10% reach 73%+, but that takes work.
Fix: Calculate returns based on 55% occupancy, and be pleasantly surprised.

10. No local property manager
Managing remotely from Israel? Good luck. A guest checking in at 2 AM needs someone who responds within 60 seconds. Without a local manager, your rating drops and your income drops with it.
Fix: Find a property manager with proven Airbnb experience in your area before you buy.

Save this post. It will save you a lot of money.

Have a question about any of these points? Write in the comments.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/03_legal_ownership.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 8,
    title: "הפזו הפיליפיני - למה המטבע עובד לטובתכם ב-2026",
    titleEn: "הפזו הפיליפיני - למה המטבע עובד לטובתכם ב-2026",
    category: "EDUCATE",
    scheduled: "2026-06-22",
    status: "ready",
    hebrewCopy: `הפזו הפיליפיני - למה המטבע עובד לטובתכם ב-2026

רוב המשקיעים הישראלים שמסתכלים על פיליפינים שואלים על תשואה, מיקום, ניהול. כמעט אף אחד לא שואל על המטבע. וזו טעות, כי הפזו הוא חלק מרכזי מהתמונה.

הנתון המרכזי:
הפזו נסחר היום ב-PHP 62 לדולר. זה כ-20% חלש יותר ממה שהיה ב-2019. במילים פשוטות: השקלים שלכם קונים היום יותר נדל"ן פיליפיני מאשר לפני 7 שנים.

למה הפזו לא קורס?
שלוש מילים: OFW Remittances. עובדים פיליפינים בחו"ל שלחו 35.63 מיליארד דולר הביתה ב-2025. זה רצפה מובנית למטבע. ה-BSP (הבנק המרכזי) מנהל מדיניות ריבית שמרנית שמונעת תנודות קיצוניות.

ההזדמנות הכפולה:
כשהפזו חלש, השקלים שלכם קונים יותר. כשהוא מתחזק (וזה הכיוון לטווח ארוך עם צמיחה של 6%+ בשנה), הכנסות השכירות שלכם שוות יותר בשקלים. זה עובד לטובתכם בשני הכיוונים.

השוואה לאסיה:
הפזו יציב יחסית למטבעות אסיאתיים אחרים. הבאהט התאילנדי, הרופיה האינדונזית, והדונג הוייטנאמי כולם חוו תנודות חדות יותר ב-5 שנים האחרונות.

אסטרטגיית גידור פרקטית:
1. קנו בפזו כשהוא חלש (כמו עכשיו)
2. השאירו הכנסות שכירות בחשבון פזו מקומי
3. המירו לשקלים רק כשהשער לטובתכם
4. אל תנסו לתזמן את השוק, פשוט אל תהיו חייבים להמיר בנקודה ספציפית

איך פותחים חשבון בנק?
BDO (Banco de Oro, הבנק הגדול בפיליפינים) פותח חשבונות לזרים. זה מאפשר לקבל הכנסות שכירות ישירות, לשלם הוצאות מקומיות, ולבחור מתי להמיר.

העברות כספים:
שיקלו להשתמש ב-Wise (לשעבר TransferWise) להעברות. העמלות נמוכות משמעותית מהעברה בנקאית רגילה. העברה בנקאית ישירה עדיין אפשרית, אבל בדקו את העמלות מראש, ההפרש יכול להגיע ל-2-3%.

מספר חשוב:
על השקעה של 1,535,000 ש"ח (וילה בבוהול לדוגמה), הפרש של 2% בעמלות העברה שווה כ-30,700 ש"ח. זה כסף שנשאר בכיס שלכם.

הבעלות עצמה:
גם אם אתם מחזיקים חשבון מקומי, חשוב לזכור שיש 3 מבני בעלות חוקיים לזרים: Deed of Assignment, Leasehold 99 שנה (לפי החוק החדש), או Domestic Corporation. כל אחד מהם משפיע אחרת על תזרים המזומנים ועל המיסוי.

יש לכם שאלות על העברות כספים או פתיחת חשבון? שתפו בתגובות.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `The Philippine Peso - Why the Currency Works in Your Favor in 2026

Most Israeli investors looking at the Philippines ask about yields, location, management. Almost nobody asks about the currency. That is a mistake, because the peso is a central part of the picture.

The key number:
The peso trades at PHP 62 per dollar today. That is roughly 20% weaker than it was in 2019. In simple terms: your shekels buy more Philippine real estate today than they did 7 years ago.

Why the peso is not collapsing:
Three words: OFW Remittances. Filipino workers abroad sent $35.63 billion home in 2025. That is a built-in floor for the currency. The BSP (central bank) manages a conservative interest rate policy that prevents extreme volatility.

The double opportunity:
When the peso is weak, your shekels buy more. When it strengthens (and that is the long-term direction with 6%+ annual GDP growth), your rental income is worth more in shekels. It works in your favor both ways.

Comparison to Asia:
The peso is relatively stable compared to other Asian currencies. The Thai baht, Indonesian rupiah, and Vietnamese dong all experienced sharper swings over the last 5 years.

Practical hedging strategy:
1. Buy in pesos when it is weak (like now)
2. Keep rental income in a local peso account
3. Convert to shekels only when the rate favors you
4. Do not try to time the market, just avoid being forced to convert at a specific point

How to open a bank account:
BDO (Banco de Oro, the largest bank in the Philippines) opens accounts for foreigners. This allows you to receive rental income directly, pay local expenses, and choose when to convert.

Money transfers:
Consider using Wise (formerly TransferWise) for transfers. Fees are significantly lower than standard bank wires. Direct bank transfer is still possible, but check fees in advance, the difference can reach 2-3%.

Important number:
On an investment of PHP 32,500,000 (a Bohol villa as an example), a 2% difference in transfer fees equals roughly 30,700 ILS. That is money staying in your pocket.

Ownership structures:
Even with a local bank account, remember there are 3 legal ownership structures for foreigners: Deed of Assignment, 99-year Leasehold (under the new law), or Domestic Corporation. Each one affects cash flow and taxation differently.

Have questions about money transfers or opening an account? Share in the comments.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/01_ph_investment_guide.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 9,
    title: "חוק הליסינג החדש 99 שנה - מהפכה שקטה בנדל\"ן הפיליפיני",
    titleEn: "חוק הליסינג החדש 99 שנה - מהפכה שקטה בנדל\"ן הפיליפיני",
    category: "EDUCATE",
    scheduled: "2026-06-29",
    status: "ready",
    hebrewCopy: `חוק הליסינג החדש 99 שנה - מהפכה שקטה בנדל"ן הפיליפיני

החוק הזה נחתם לפני 8 חודשים ורוב המשקיעים הישראלים עדיין לא יודעים עליו. זה הזמן לשנות את זה.

מה קרה?
בספטמבר 2025 נחתם Republic Act 12252. במשפט אחד: חוזי חכירה (Leasehold) לזרים בפיליפינים הוארכו מ-50 שנה (25+25) ל-99 שנה. מגורים ומסחר.

למה זה משנה הכל?
עד עכשיו, המגבלה של 50 שנה הייתה אחד החסמים המרכזיים למשקיעים זרים. 50 שנה נשמע הרבה, אבל כשאתם בונים תיק נכסים שמיועד לעבור לילדים, 50 שנה לא מספיק. 99 שנה זה משהו אחר לגמרי.

השוואה אזורית:
- תאילנד: מקסימום 60 שנה (30+30)
- אינדונזיה (באלי): 25-30 שנה בפועל
- פיליפינים (חדש): 99 שנה
- וייטנאם: 50 שנה

פיליפינים הפכו למובילה באסיה מבחינת אורך חכירה לזרים.

איך זה משפיע על 3 מבני הבעלות?

1. Deed of Assignment
לא משתנה ישירות, זה מבנה שמבוסס על הסכם ולא על חכירה. עדיין פתרון תקף, עדיין הפתרון המהיר ביותר לביצוע עסקה.

2. Leasehold (חכירה)
זה השינוי הגדול. במקום 25+25 שנה, עכשיו 99 שנה. ניתן להוריש, ניתן להעביר, ניתן להשתמש כביטחון. זה הופך את ה-Leasehold מפתרון זמני לפתרון ארוך טווח אמיתי.

3. Domestic Corporation
לא משתנה ישירות, אבל החוק החדש מפחית את הצורך ב-Corporation רק לצורך בעלות. חברה עדיין עדיפה למי שמנהל מספר נכסים או רוצה הגנה משפטית נוספת.

מה אומרים המומחים?
עורכי דין מקומיים שעובדים עם זרים מדווחים על עלייה של 40%+ בפניות מאז החוק נחתם. המודעות רק מתחילה.

מספרים שחשוב לדעת:
- PHP 27,500-49,000 למ"ר בפנגלאו (בוהול), אחד האזורים עם הצמיחה המהירה ביותר
- וילות יוקרה בבוהול עם תשואת Airbnb של 17-25%
- עלויות עסקה: 13-15% הלוך-חזור (חשוב לחשב מראש)

הסיכון שנותר:
החוק חדש. עדיין אין פסיקה רבה שמפרשת את הסעיפים. חשוב לעבוד עם עורך דין שמכיר את החוק החדש ולא מסתמך על תקדימים ישנים.

השורה התחתונה:
RA 12252 הוא אחד השינויים המשמעותיים ביותר בנדל"ן הפיליפיני בעשור האחרון. 99 שנה זה לא חכירה, זה כמעט בעלות. ומי שנכנס עכשיו, לפני שהשוק מתמחר את השינוי במלואו, נהנה מהיתרון.

שמעתם על החוק הזה לפני הפוסט? כתבו כן או לא בתגובות.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `The New 99-Year Lease Law - A Quiet Revolution in Philippine Real Estate

This law was signed 8 months ago and most Israeli investors still do not know about it. Time to change that.

What happened?
In September 2025, Republic Act 12252 was signed. In one sentence: leasehold agreements for foreigners in the Philippines were extended from 50 years (25+25) to 99 years. Residential and commercial.

Why this changes everything:
Until now, the 50-year limit was one of the main barriers for foreign investors. 50 years sounds like a lot, but when you are building a property portfolio meant to pass to your children, 50 years is not enough. 99 years is a completely different proposition.

Regional comparison:
- Thailand: maximum 60 years (30+30)
- Indonesia (Bali): 25-30 years in practice
- Philippines (new): 99 years
- Vietnam: 50 years

The Philippines is now the leader in Asia for foreign leasehold duration.

How this affects the 3 ownership structures:

1. Deed of Assignment
No direct change, this structure is based on an agreement, not a lease. Still a valid solution, still the fastest path to closing a transaction.

2. Leasehold
This is the big change. Instead of 25+25 years, now 99 years. Inheritable, transferable, usable as collateral. This transforms Leasehold from a temporary solution into a genuine long-term option.

3. Domestic Corporation
No direct change, but the new law reduces the need for a Corporation solely for ownership purposes. A corporation is still preferable for those managing multiple properties or seeking additional legal protection.

What experts are saying:
Local lawyers working with foreigners report a 40%+ increase in inquiries since the law was signed. Awareness is only beginning.

Numbers to know:
- PHP 27,500-49,000 per sqm in Panglao (Bohol), one of the fastest-appreciating areas
- Luxury villas in Bohol with Airbnb yields of 17-25%
- Transaction costs: 13-15% round-trip (important to factor in advance)

Remaining risk:
The law is new. There is limited case law interpreting its provisions. It is essential to work with a lawyer who understands the new law and is not relying on old precedents.

Bottom line:
RA 12252 is one of the most significant changes in Philippine real estate in the past decade. 99 years is not a lease, it is practically ownership. And those who enter now, before the market fully prices in the change, benefit from the advantage.

Did you know about this law before this post? Write yes or no in the comments.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/03_legal_ownership.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 10,
    title: "מנילה עד פלאוון - מפת ההשקעות המלאה של פיליפינים 2026",
    titleEn: "מנילה עד פלאוון - מפת ההשקעות המלאה של פיליפינים 2026",
    category: "EDUCATE",
    scheduled: "2026-07-02",
    status: "ready",
    hebrewCopy: `מנילה עד פלאוון - מפת ההשקעות המלאה של פיליפינים 2026

פיליפינים זה לא מקום אחד. זה 7,641 איים עם שווקי נדל"ן שונים לחלוטין. הנה הסקירה המלאה, אזור אחרי אזור, עם מספרים אמיתיים.

1. מנילה (BGC, Makati)
- מחיר למ"ר: PHP 230,000-550,000
- תשואה: 4-6%
- פרופיל: שוק בוגר, קונדו בעיקר, ביקוש מ-BPO וקורפורייט. נזילות גבוהה, פוטנציאל עליית ערך נמוך. מתאים למי שרוצה יציבות ולא הרפתקאה.
- סיכון: בינוני-נמוך

2. סבו (Cebu City, Mactan)
- מחיר למ"ר: PHP 130,000-230,000
- תשואה: 6-8%
- פרופיל: מרכז BPO שני בגודלו, נמל תעופה בינלאומי, תיירות גדלה. שילוב של עירוני ותיירותי.
- סיכון: בינוני

3. בוהול / פנגלאו
- מחיר למ"ר: PHP 27,500-49,000
- תשואה: 17-25% (וילות יוקרה עם ניהול מקצועי)
- פרופיל: תיירות בצמיחה מהירה, נמל תעופה בינלאומי חדש, מחירי כניסה נמוכים יחסית. הפער בין המחיר הנוכחי לפוטנציאל הוא מהגדולים בארץ. וילה ב-263.78 מ"ר עם 4 חדרי שינה, הכנסה חודשית של PHP 395,000 מ-Airbnb.
- סיכון: בינוני (תשתיות עדיין בפיתוח)

4. בורקאי
- מחיר למ"ר: PHP 55,000-70,000
- תשואה: 8-12%
- פרופיל: שוק בוגר, תפוסת Airbnb 80%+ בעונת שיא. מוגבל בשטח בניה אחרי הרגולציה של 2018. אין הרבה מלאי חדש.
- סיכון: בינוני (רגולציה סביבתית מחמירה)

5. קלארק (Clark, Pampanga)
- מחיר למ"ר: PHP 50,000-120,000
- תשואה: 5-7%
- פרופיל: מרכז תעופה ולוגיסטיקה, אזור כלכלי חופשי, פיתוח תשתיות מסיבי. לא תיירותי, אבל צמיחה תעשייתית יציבה.
- סיכון: בינוני-נמוך

6. דבאו (Davao)
- צמיחה: 7.9% (מהגבוהות ארצית)
- פרופיל: שוק מתעורר, עלויות נמוכות, מרכז חקלאי ותעשייתי. עדיין מתחת לרדאר של רוב המשקיעים הזרים. מזכיר את סבו לפני 10 שנים.
- סיכון: בינוני-גבוה (מרחק, פחות תשתית תיירותית)

7. סיארגאו
- מחיר למ"ר: PHP 15,000-40,000
- תשואה: מקום 1 ארצי ב-Airbnb, תפוסה 71%, הכנסה שנתית ממוצעת PHP 640,000
- פרופיל: גלישה ותיירות חוויתית. מחירי כניסה הנמוכים ביותר. צמיחה מהירה אבל תשתיות מוגבלות. חשמל ומים לא תמיד יציבים.
- סיכון: גבוה (תשתיות, נגישות, טייפונים)

8. פלאוון (El Nido, Puerto Princesa)
- מחיר למ"ר: PHP 3,000-75,000 (טווח ענק)
- פרופיל: נופים מהיפים בעולם, תיירות בצמיחה, אבל בלי נמל תעופה בינלאומי ישיר (עד 2027). הטווח הרחב במחירים מעיד על שוק לא בשל. יש הזדמנויות, אבל גם סיכון גבוה.
- סיכון: גבוה (תשתיות, נגישות, שוק לא בשל)

9. אילואילו (Iloilo)
- מחיר למ"ר: PHP 60,000-120,000
- פרופיל: מכונה "העיר הגדלה הכי מהר בויסאיאס." BPO גדל, אוניברסיטאות, מרכז רפואי. שוק פנימי חזק. לא תיירותי, אבל יציב.
- סיכון: בינוני

מה חשוב לזכור:
- בעלות לזרים: 3 פתרונות חוקיים בכל האזורים - Deed of Assignment, Leasehold 99 שנה (לפי RA 12252 החדש), או Domestic Corporation
- עלויות עסקה: 13-15% הלוך-חזור בכל מקום
- ניהול מקומי: הכרחי בכל אזור, אין חריגים

איזה אזור מעניין אתכם? כתבו בתגובות ואעשה צלילה עמוקה.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Manila to Palawan - The Complete Philippine Investment Map 2026

The Philippines is not one place. It is 7,641 islands with completely different real estate markets. Here is the full overview, area by area, with real numbers.

1. Manila (BGC, Makati)
- Price per sqm: PHP 230,000-550,000
- Yield: 4-6%
- Profile: Mature market, mostly condos, demand from BPO and corporate. High liquidity, low appreciation potential. Suits those who want stability, not adventure.
- Risk: Medium-low

2. Cebu (Cebu City, Mactan)
- Price per sqm: PHP 130,000-230,000
- Yield: 6-8%
- Profile: Second-largest BPO hub, international airport, growing tourism. Mix of urban and tourist.
- Risk: Medium

3. Bohol / Panglao
- Price per sqm: PHP 27,500-49,000
- Yield: 17-25% (luxury villas with professional management)
- Profile: Fast-growing tourism, new international airport, relatively low entry prices. The gap between current price and potential is among the largest in the country. A villa of 263.78 sqm with 4 bedrooms generating monthly Airbnb income of PHP 395,000.
- Risk: Medium (infrastructure still developing)

4. Boracay
- Price per sqm: PHP 55,000-70,000
- Yield: 8-12%
- Profile: Mature market, Airbnb occupancy 80%+ in peak season. Limited new building after 2018 regulation. Not much new inventory.
- Risk: Medium (tightening environmental regulation)

5. Clark (Pampanga)
- Price per sqm: PHP 50,000-120,000
- Yield: 5-7%
- Profile: Aviation and logistics hub, free economic zone, massive infrastructure development. Not tourist-driven, but stable industrial growth.
- Risk: Medium-low

6. Davao
- Growth: 7.9% (among the highest nationally)
- Profile: Emerging market, low costs, agricultural and industrial center. Still under the radar of most foreign investors. Reminds of Cebu 10 years ago.
- Risk: Medium-high (distance, less tourist infrastructure)

7. Siargao
- Price per sqm: PHP 15,000-40,000
- Yield: #1 nationally on Airbnb, 71% occupancy, average annual income PHP 640,000
- Profile: Surfing and experiential tourism. Lowest entry prices. Fast growth but limited infrastructure. Electricity and water not always stable.
- Risk: High (infrastructure, accessibility, typhoons)

8. Palawan (El Nido, Puerto Princesa)
- Price per sqm: PHP 3,000-75,000 (massive range)
- Profile: Some of the most beautiful scenery in the world, growing tourism, but no direct international airport (until 2027). The wide price range indicates an immature market. Opportunities exist, but so does high risk.
- Risk: High (infrastructure, accessibility, immature market)

9. Iloilo
- Price per sqm: PHP 60,000-120,000
- Profile: Called "the fastest-growing city in the Visayas." Growing BPO, universities, medical center. Strong domestic market. Not tourist-driven, but stable.
- Risk: Medium

What to remember:
- Foreign ownership: 3 legal solutions in all areas - Deed of Assignment, 99-year Leasehold (under new RA 12252), or Domestic Corporation
- Transaction costs: 13-15% round-trip everywhere
- Local management: essential in every area, no exceptions

Which area interests you? Write in the comments and I will do a deep dive.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/01_ph_investment_guide.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 11,
    title: "למה גיל חציוני 26 שנה הוא הסטטיסטיקה החשובה ביותר בנדל\"ן",
    titleEn: "Demographics: Why Median Age 26 Matters Most",
    category: "EDUCATE",
    scheduled: "2026-07-06",
    status: "ready",
    hebrewCopy: `למה גיל חציוני 26 שנה הוא הסטטיסטיקה החשובה ביותר בנדל"ן

כשמנתחים שוק נדל"ן, רוב המשקיעים מסתכלים על מחירים, תשואות, וריביות. אבל יש מספר אחד שקובע הכל לטווח ארוך: הגיל החציוני של האוכלוסייה.

הפיליפינים: 26.1 שנים.
ישראל: 30.
יוון: 45.
יפן: 49.

הנה מה שהמספר הזה אומר למשקיע נדל"ן:

אוכלוסייה צעירה = ביקוש גדל. 116.79 מיליון תושבים היום, תחזית של מעל 130 מיליון עד 2035. כל אחד מהם צריך מקום לגור, לעבוד, ולבלות. זה לא תיאוריה - זה דמוגרפיה.

תעשיית ה-BPO (מיקור חוץ עסקי) מעסיקה 1.9 מיליון עובדים ומייצרת 40 מיליארד דולר בשנה. העובדים האלה צעירים, מרוויחים היטב יחסית לשוק המקומי, וצריכים דיור איכותי. הם המנוע של ביקוש לשכירות בערים ובאזורי טכנולוגיה.

עובדים פיליפינים בחו"ל (OFW) שולחים הביתה 35.63 מיליארד דולר בשנה. 60% מהכסף הזה הולך לנדל"ן - קניית דירות למשפחות, בניית בתים, השקעות. זה זרם כסף קבוע ויציב שנכנס ישירות לשוק הנדל"ן.

שיעור העיור עומד על 48% ועולה. לשם השוואה, ישראל ב-92%. כשמדינה עוברת מ-48% ל-70% עיור, המחירים בערים ובאזורי תיירות עולים בצורה משמעותית. הפיליפינים נמצאים בדיוק בנקודה הזו של האצה.

מעמד הביניים גדל ב-2.5 מיליון משקי בית בשנה. אלה משפחות שעוברות משכירות לבעלות, מדירות קטנות לגדולות, מכפרים לערים. כל מעבר כזה מייצר עסקת נדל"ן.

עכשיו השוו את זה ליפן (גיל חציוני 49) - שם האוכלוסייה מצטמצמת, ערים שלמות מתרוקנות, ומחירי נדל"ן באזורים רבים יורדים כבר עשור. או ליוון (45) - שם הביקוש מונע בעיקר על ידי תיירים וזרים, לא על ידי אוכלוסייה מקומית גדלה.

הפיליפינים הן הפוך מזה. אוכלוסייה צעירה, גדלה, מתעיירת, עם כוח קנייה עולה ותמיכה של מיליארדי דולרים מעובדים בחו"ל.

נדל"ן הולך אחרי דמוגרפיה. תמיד. בלי יוצא מן הכלל.

השאלה היחידה היא: איפה אתם רוצים להיות כשהגל הזה מגיע לשיא?

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Why Median Age 26 Is the Most Important Real Estate Statistic

When analyzing a real estate market, most investors look at prices, yields, and interest rates. But there is one number that determines everything long-term: the median age of the population.

Philippines: 26.1 years.
Israel: 30.
Greece: 45.
Japan: 49.

Here is what this number tells a real estate investor:

A young population means growing demand. 116.79 million residents today, projected to exceed 130 million by 2035. Every one of them needs a place to live, work, and spend leisure time. This is not theory - this is demographics.

The BPO (Business Process Outsourcing) industry employs 1.9 million workers and generates $40 billion annually. These workers are young, earn well relative to the local market, and need quality housing. They are the engine of rental demand in cities and tech zones.

Overseas Filipino Workers (OFW) send home $35.63 billion per year. 60% of that money goes to real estate - buying apartments for families, building homes, investments. This is a steady, stable cash flow entering the real estate market directly.

The urbanization rate stands at 48% and rising. For comparison, Israel is at 92%. When a country transitions from 48% to 70% urbanization, prices in cities and tourism areas rise significantly. The Philippines is at exactly that acceleration point.

The middle class is growing by 2.5 million households per year. These are families moving from renting to owning, from small apartments to larger ones, from villages to cities. Every such transition generates a real estate transaction.

Now compare this to Japan (median age 49) - where the population is shrinking, entire cities are emptying, and property prices in many areas have been declining for a decade. Or Greece (45) - where demand is driven mainly by tourists and foreigners, not a growing local population.

The Philippines is the opposite. A young, growing, urbanizing population with rising purchasing power and billions in support from overseas workers.

Real estate follows demographics. Always. Without exception.

The only question is: where do you want to be when this wave peaks?

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/01_ph_investment_guide.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 12,
    title: "סטארלינק, BPO, ועבודה מרחוק - מה שמשנה מחירי נדל\"ן בפיליפינים",
    titleEn: "Starlink, BPO, and Remote Work: Digital Infrastructure Play",
    category: "EDUCATE",
    scheduled: "2026-07-10",
    status: "ready",
    hebrewCopy: `סטארלינק, BPO, ועבודה מרחוק - מה שמשנה מחירי נדל"ן בפיליפינים

יש כלל פשוט בנדל"ן: תשתית דיגיטלית הולכת לפני מחירים. כשאינטרנט מהיר מגיע לאזור, עובדים מרוחקים מגיעים אחריו, ומחירים זזים.

הפיליפינים הן השוק השישי בגודלו בעולם של סטארלינק. לא סתם מדינה ברשימה - השוק השישי. זה אומר שאילון מאסק ראה את הביקוש, את הפער בתשתיות, ואת הפוטנציאל.

מה קורה כשסטארלינק מגיע לאזור כפרי או תיירותי בפיליפינים?

בוהול, סיארגאו, פלאוואן - איים שהיו מוגבלים לאינטרנט איטי ולא יציב - פתאום מקבלים חיבור של 100-200 Mbps. זה לא שיפור, זה מהפכה. וילה בבוהול עם סטארלינק יכולה לשמש כמשרד מרוחק, כבסיס לנוודים דיגיטליים, או כיחידת Airbnb פרימיום עם אינטרנט מהיר מובטח.

תעשיית ה-BPO - 1.9 מיליון עובדים, 40 מיליארד דולר בשנה - מתרחבת מעבר למנילה. Cebu IT Park הפך למוקד טכנולוגי שמעלה מחירי נדל"ן באזור. שטחי קואורקינג מתרבים בכל אי משמעותי. כשחברות BPO פותחות סניפים מחוץ לבירה, הן מביאות איתן אלפי עובדים עם משכורות טובות שצריכים דיור.

העבודה מרחוק שינתה את המשוואה לחלוטין. עובד BPO שהרוויח 40,000-80,000 פזו בחודש במנילה יכול עכשיו לעבוד מבוהול או מסיארגאו, לשלם שכירות נמוכה יותר, וליהנות מאיכות חיים גבוהה. התוצאה: ביקוש לדיור איכותי באזורים שלפני 5 שנים היו רק יעדי תיירות.

נוודים דיגיטליים מחו"ל מצטרפים לתמונה. פיליפינים מציעות ויזת שהייה נוחה, עלויות מחיה נמוכות, ועכשיו - אינטרנט ברמה מערבית הודות לסטארלינק. בוהול ופלאוואן הופכות לחלופות אמיתיות לבאלי ולצ'יאנג מאי.

הנוסחה ברורה:

סטארלינק + BPO מבוזר + עבודה מרחוק = ביקוש חדש לנדל"ן באזורים שלא היו על המפה לפני 3 שנים.

האזורים שסטארלינק הגיע אליהם - שם המחירים זזים הלאה. בוהול כבר שם. פנגלאו כבר שם. השאלה היא לא אם, אלא כמה מהר.

המספרים מדברים: 40 מיליארד דולר בתעשייה, 1.9 מיליון עובדים, אינטרנט לוויני ב-200 Mbps, ושוק נדל"ן שמתחיל להגיב.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Starlink, BPO, and Remote Work - What Is Changing Real Estate Prices in the Philippines

There is a simple rule in real estate: digital infrastructure precedes prices. When fast internet reaches an area, remote workers follow, and prices move.

The Philippines is Starlink's 6th largest global market. Not just a country on the list - the 6th largest market. This means Elon Musk saw the demand, the infrastructure gap, and the potential.

What happens when Starlink reaches a rural or tourism area in the Philippines?

Bohol, Siargao, Palawan - islands that were limited to slow, unreliable internet - suddenly receive 100-200 Mbps connections. This is not an improvement, it is a revolution. A villa in Bohol with Starlink can serve as a remote office, a base for digital nomads, or a premium Airbnb unit with reliable fast internet.

The BPO industry - 1.9 million workers, $40 billion per year - is expanding beyond Manila. Cebu IT Park has become a tech hub that drives up real estate prices in the surrounding area. Coworking spaces are multiplying on every significant island. When BPO companies open branches outside the capital, they bring thousands of well-paid workers who need housing.

Remote work has changed the equation entirely. A BPO worker earning PHP 40,000-80,000 per month in Manila can now work from Bohol or Siargao, pay lower rent, and enjoy a higher quality of life. The result: demand for quality housing in areas that 5 years ago were purely tourist destinations.

International digital nomads are joining the picture. The Philippines offers convenient stay visas, low cost of living, and now - Western-grade internet thanks to Starlink. Bohol and Palawan are becoming real alternatives to Bali and Chiang Mai.

The formula is clear:

Starlink + distributed BPO + remote work = new real estate demand in areas that were not on the map 3 years ago.

The areas where Starlink arrived - that is where prices move next. Bohol is already there. Panglao is already there. The question is not if, but how fast.

The numbers speak: $40 billion industry, 1.9 million workers, 200 Mbps satellite internet, and a real estate market starting to respond.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/04_panglao_aerial.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 13,
    title: "אסכן מחירי הנדל\"ן בפיליפינים - מ-900 פזו למ\"ר עד 550,000",
    titleEn: "Price Spectrum: PHP 900/sqm to 550,000/sqm",
    category: "EDUCATE",
    scheduled: "2026-07-13",
    status: "ready",
    hebrewCopy: `אסכן מחירי הנדל"ן בפיליפינים - מ-900 פזו למ"ר עד 550,000

אחד הדברים שמפתיעים משקיעים ישראליים בפיליפינים הוא טווח המחירים. מ-900 פזו למטר רבוע ועד 550,000 פזו - הכל באותה מדינה. הנה הסולם המלא, מלמטה למעלה.

קרקע חקלאית (אזורים כפריים): 900-4,950 פזו למ"ר
זה מחיר של קרקע חקלאית באזורים מרוחקים. לא מתאים למגורים או לתיירות בדרך כלל, אבל משקיעים שמבינים את כיוון הפיתוח קונים כאן שנים לפני שהאזור מתפתח.

מגורים פרובינציאליים (ערי שוק קטנות): 5,000-15,000 פזו למ"ר
ערים קטנות מחוץ למטרופולינים. מתאים למגורים מקומיים, פחות למשקיעים זרים.

בוהול - חוף, לפי שומת BIR: 27,500-49,000 פזו למ"ר
פנגלאו וסביבותיה. חופים, קרבה לאטרקציות, אזור תיירות מתפתח. זה הטווח של שומת מס (BIR Zonal Value) - המחירים בשוק הפתוח יכולים להיות גבוהים יותר.

בורקאי: 55,000-70,000+ פזו למ"ר
האי הכי מפותח תיירותית בפיליפינים. מחירים גבוהים אבל השוק בוגר, צפוי פחות עלייה חדה.

סבו (אזורי עסקים ומגורים): 130,000-230,000 פזו למ"ר
עיר שנייה בגודלה. מרכז BPO, IT Park, ביקוש יציב מעובדים מקצועיים.

מקאטי (מרכז עסקים, מנילה): 300,000-450,000 פזו למ"ר
ה-CBD הראשי של הפיליפינים. משרדים, מגורי יוקרה, שגרירויות.

BGC - Bonifacio Global City: 450,000-550,000 פזו למ"ר
האזור היקר ביותר בפיליפינים. מגדלי יוקרה, שגרירויות, מטה של חברות בינלאומיות.

עכשיו, השוואה שמשנה פרספקטיבה:

תל אביב: 60,000-145,000 שקל למ"ר, שזה בערך 1,300,000-3,100,000 פזו למ"ר.

תל אביב יקרה פי 10-25 מהאזור היקר ביותר בפיליפינים.

מה זה אומר למשקיע ישראלי? שגם BGC, האזור היקר ביותר, עדיין זול בסדר גודל ביחס למה שאנחנו רגילים אליו. ושבוהול, עם מחירי 27,500-49,000 פזו למ"ר, אנחנו מדברים על רמת מחיר שפשוט לא קיימת יותר בישראל.

כל משקיע מוצא את נקודת הכניסה שלו. השאלה היא לא אם יש הזדמנות, אלא באיזה שלב של סולם המחירים אתם רוצים להיכנס.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `The Philippine Real Estate Price Spectrum - From PHP 900/sqm to 550,000

One thing that surprises Israeli investors about the Philippines is the price range. From PHP 900 per square meter to PHP 550,000 - all in the same country. Here is the full ladder, bottom to top.

Agricultural land (rural areas): PHP 900-4,950/sqm
This is the price of farmland in remote regions. Not typically suitable for residential or tourism use, but investors who understand development trajectories buy here years before an area develops.

Provincial residential (small market towns): PHP 5,000-15,000/sqm
Small towns outside metropolitan areas. Suitable for local housing, less so for foreign investors.

Bohol - beachfront, per BIR assessment: PHP 27,500-49,000/sqm
Panglao and surroundings. Beaches, proximity to attractions, developing tourism zone. This is the BIR Zonal Value range - open market prices can be higher.

Boracay: PHP 55,000-70,000+/sqm
The most tourism-developed island in the Philippines. High prices but a mature market, less likely to see sharp increases.

Cebu (business and residential zones): PHP 130,000-230,000/sqm
Second largest city. BPO center, IT Park, steady demand from professional workers.

Makati (central business district, Manila): PHP 300,000-450,000/sqm
The primary CBD of the Philippines. Offices, luxury residences, embassies.

BGC - Bonifacio Global City: PHP 450,000-550,000/sqm
The most expensive area in the Philippines. Luxury towers, embassies, headquarters of international companies.

Now, a comparison that changes perspective:

Tel Aviv: ILS 60,000-145,000/sqm, which is approximately PHP 1,300,000-3,100,000/sqm.

Tel Aviv is 10-25 times more expensive than the most expensive area in the Philippines.

What does this mean for an Israeli investor? That even BGC, the most expensive zone, is still an order of magnitude cheaper than what we are accustomed to. And in Bohol, at PHP 27,500-49,000/sqm, we are talking about a price level that simply no longer exists in Israel.

Every investor finds their entry point. The question is not whether opportunity exists, but at which rung of the price ladder you want to enter.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/04_panglao_aerial.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 14,
    title: "הפיליפינים נגד תאילנד - השוואה למשקיעים ישראליים",
    titleEn: "Philippines vs Thailand for Israeli Investors",
    category: "EDUCATE",
    scheduled: "2026-07-20",
    status: "ready",
    hebrewCopy: `הפיליפינים נגד תאילנד - השוואה למשקיעים ישראליים

תאילנד היא היעד הראשון שישראלים חושבים עליו כשמדברים על השקעות נדל"ן בדרום מזרח אסיה. זה מובן - תאילנד מוכרת, מוכרת, ויש שם קהילה ישראלית גדולה. אבל כשבוחנים את המספרים, התמונה מורכבת יותר.

בעלות על נכס:
פיליפינים - בעלות מלאה על דירות (condo freehold), עד 40% מהבניין. חלופה: חכירה ל-99 שנה (25+25+25+24) על קרקע. שלוש דרכים חוקיות לבעלות: Deed of Assignment, חכירה 25+25, או תאגיד מקומי (Domestic Corporation).
תאילנד - בעלות מלאה על דירות עד 49% מהבניין. חכירה מוגבלת ל-30+30 שנה (60 סה"כ). אין אפשרות חוקית לבעלות ישירה על קרקע.

דמוגרפיה:
פיליפינים - גיל חציוני 26.1, אוכלוסייה גדלה.
תאילנד - גיל חציוני 40, אוכלוסייה מתחילה להזדקן.

צמיחת GDP:
פיליפינים - 5.5%-6.4% (תחזית).
תאילנד - 2.8%-3.5%.

מיסוי רווחי הון:
פיליפינים - 6% מס רווחי הון קבוע.
תאילנד - 15%-35% (מדרגות, תלוי בסוג הנכס ותקופת החזקה).

Airbnb ושכירות קצרת טווח:
פיליפינים - רגולציה מינימלית. אין הגבלות משמעותיות על השכרה קצרת טווח.
תאילנד - רגולציה מחמירה. חוק מלונאות דורש רישיון לשכירות מתחת ל-30 יום. אכיפה לא אחידה אבל הסיכון המשפטי קיים.

מחירי כניסה:
פיליפינים - נמוכים יותר באופן משמעותי. אפשר להיכנס לשוק בתקציב שלא מאפשר כלום בתאילנד.

אנגלית:
פיליפינים - המדינה השנייה באסיה בשליטה באנגלית. כל החוזים, מסמכים משפטיים, ושירות לקוחות באנגלית.
תאילנד - אנגלית מוגבלת מחוץ לאזורי תיירות. חוזים בתאית דורשים תרגום מוסמך.

תיירות:
תאילנד - 40 מיליון תיירים בשנה. שוק בוגר ורווי.
פיליפינים - 6.48 מיליון תיירים. שוק בצמיחה עם פוטנציאל עצום לעלייה.

אז מה עדיף?

בואו נהיה כנים. תאילנד היא שוק יותר מבוסס, עם תשתיות תיירות מפותחות, קהילה ישראלית גדולה, ומותג חזק. אם אתם רוצים שוק מוכר עם פחות אי-ודאות, תאילנד מציעה את זה.

אבל אם אתם מחפשים יסודות כלכליים חזקים יותר - דמוגרפיה צעירה, צמיחת GDP כפולה, מיסוי נמוך, גמישות ב-Airbnb, ומחירי כניסה נמוכים - הפיליפינים מנצחות בכל קטגוריה.

תאילנד של לפני 10 שנים. הפיליפינים של היום.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Philippines vs Thailand - A Comparison for Israeli Investors

Thailand is the first destination Israelis think of when discussing real estate investments in Southeast Asia. That is understandable - Thailand is familiar, well-known, and has a large Israeli community. But when you examine the numbers, the picture is more complex.

Property ownership:
Philippines - full condo freehold ownership, up to 40% of the building. Alternative: 99-year lease (25+25+25+24) on land. Three legal ownership paths: Deed of Assignment, 25+25 leasehold, or Domestic Corporation.
Thailand - full condo freehold ownership up to 49% of the building. Lease limited to 30+30 years (60 total). No legal path to direct land ownership.

Demographics:
Philippines - median age 26.1, growing population.
Thailand - median age 40, population beginning to age.

GDP growth:
Philippines - 5.5%-6.4% (forecast).
Thailand - 2.8%-3.5%.

Capital gains tax:
Philippines - flat 6% capital gains tax.
Thailand - 15%-35% (progressive, depending on property type and holding period).

Airbnb and short-term rentals:
Philippines - minimal regulation. No significant restrictions on short-term rentals.
Thailand - strict regulation. Hotel Act requires licensing for rentals under 30 days. Enforcement is inconsistent but the legal risk exists.

Entry prices:
Philippines - significantly lower. You can enter the market at a budget that buys nothing in Thailand.

English:
Philippines - the second-highest English proficiency in Asia. All contracts, legal documents, and customer service in English.
Thailand - limited English outside tourist zones. Thai-language contracts require certified translation.

Tourism:
Thailand - 40 million tourists per year. A mature, saturated market.
Philippines - 6.48 million tourists. A growing market with enormous upside potential.

So which is better?

Let us be honest. Thailand is a more established market with developed tourism infrastructure, a large Israeli community, and a strong brand. If you want a familiar market with less uncertainty, Thailand offers that.

But if you are looking for stronger economic fundamentals - young demographics, double the GDP growth, lower taxation, Airbnb flexibility, and lower entry prices - the Philippines wins in every category.

Thailand 10 years ago. Philippines now.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/02_ph_vs_greece.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 15,
    title: "מה זה BIR Zonal Value ולמה זה חשוב לכם",
    titleEn: "Understanding BIR Zonal Values",
    category: "EDUCATE",
    scheduled: "2026-07-24",
    status: "ready",
    hebrewCopy: `מה זה BIR Zonal Value ולמה זה חשוב לכם

אם אתם שוקלים לקנות נדל"ן בפיליפינים, יש מושג אחד שאתם חייבים להכיר: BIR Zonal Value. זה אחד הכלים החשובים ביותר להבנת שוק הנדל"ן, ורוב המשקיעים הזרים לא מכירים אותו.

מה זה BIR?

BIR - Bureau of Internal Revenue - הוא רשות המיסים הפיליפינית. כמו רשות המיסים בישראל. ה-BIR קובע ערכי מינימום לנדל"ן בכל אזור במדינה. הערכים האלה נקראים Zonal Values.

מה זה Zonal Value בפועל?

זו השומה הממשלתית - הערכת שווי מינימלית שה-BIR קובע לכל אזור (zone) בכל ברנגאי (שכונה/כפר). כל עסקת נדל"ן חייבת להתבסס על המחיר הגבוה מבין שניים: מחיר העסקה בפועל, או ה-Zonal Value. אם קניתם נכס ב-20,000 פזו למ"ר אבל ה-Zonal Value הוא 27,500, המס יחושב לפי 27,500.

בעברית פשוטה: זה כמו השומה (שומת מקרקעין) בישראל. הממשלה קובעת מחיר רצפה, ואתם משלמים מס לפי הגבוה מבין השומה למחיר בפועל.

איך זה עובד בפנגלאו, בוהול?

חוף - Beachfront: 27,500-49,000 פזו למ"ר (לפי שומת BIR)
פנים האי - Interior: 900-4,950 פזו למ"ר

ההבדל בין חוף לפנים האי הוא פי 10-50. זה משקף את ההערכה של ה-BIR לגבי ערך הקרקע, ונותן לכם מדד אובייקטיבי.

למה זה חשוב למשקיע?

1. חישוב מס רווחי הון: מס רווחי הון בפיליפינים הוא 6% קבוע. הבסיס לחישוב הוא המחיר הגבוה מבין: מחיר העסקה בפועל, שומת BIR, או הערכת שמאי עירוני (Fair Market Value). הכרת ה-Zonal Value מראש מאפשרת לכם לתכנן את עלויות המס בצורה מדויקת.

2. זיהוי עסקאות טובות: כשמחיר השוק הפתוח גבוה משמעותית מה-Zonal Value, זה סימן חיובי - אומר שהשוק מזהה ערך שהממשלה עוד לא עדכנה. כשמחיר העסקה קרוב ל-Zonal Value או מתחתיו, כדאי לבדוק למה.

3. תחזית עליות: שומות BIR מתעדכנות כל 3-5 שנים. העדכון הבא צפוי בקרוב. כשהשומה עולה, רצפת המחירים עולה, ועסקאות מתחת לערך החדש כבר לא אפשריות. משקיעים שנכנסים לפני העדכון נהנים מהפער.

4. השוואה בין אזורים: Zonal Values מאפשרים להשוות אזורים בצורה אובייקטיבית. אם אזור A שווה 27,500 פזו ואזור B שווה 49,000 פזו, יש הבדל מהותי שמבוסס על הערכה ממשלתית, לא על שיווק של יזם.

איך בודקים Zonal Value?

1. לשכת BIR מקומית - כל לשכה מחזיקה את טבלת הערכים לאזור שלה.
2. אתר BIR - חלק מהנתונים זמינים אונליין.
3. עורך דין נדל"ן מקומי - יכול לספק את הנתונים המדויקים לפי ברנגאי ולפי סוג קרקע (חקלאית, מגורים, מסחרית).

הפירוט הוא לפי ברנגאי - כל כפר או שכונה בפנגלאו יכולה להיות בערך שונה.

שורה תחתונה: לפני שאתם סוגרים עסקה, דעו מה ה-Zonal Value של הנכס. זה לא רק עניין של מס - זה כלי להבנת השוק.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `What Is BIR Zonal Value and Why It Matters to You

If you are considering buying real estate in the Philippines, there is one concept you must know: BIR Zonal Value. It is one of the most important tools for understanding the real estate market, and most foreign investors are unfamiliar with it.

What is BIR?

BIR - Bureau of Internal Revenue - is the Philippine tax authority. Like the Tax Authority in Israel. The BIR sets minimum real estate values for every area in the country. These values are called Zonal Values.

What is Zonal Value in practice?

It is the government assessment - the minimum valuation that BIR sets for each zone in every barangay (neighborhood/village). Every real estate transaction must be based on the higher of two figures: the actual transaction price, or the Zonal Value. If you bought a property at PHP 20,000/sqm but the Zonal Value is PHP 27,500, the tax will be calculated based on PHP 27,500.

In simple terms: it is like the Shomah (property assessment) in Israel. The government sets a floor price, and you pay tax based on whichever is higher - the assessment or the actual price.

How does it work in Panglao, Bohol?

Beachfront: PHP 27,500-49,000/sqm (per BIR assessment)
Interior: PHP 900-4,950/sqm

The difference between beachfront and interior is 10-50 times. This reflects the BIR's assessment of land value and provides an objective benchmark.

Why does this matter to an investor?

1. Capital gains tax calculation: Capital gains tax in the Philippines is a flat 6%. The basis for calculation is the highest of: the actual transaction price, BIR Zonal Value, or the municipal Fair Market Value assessment. Knowing the Zonal Value in advance allows you to plan tax costs precisely.

2. Identifying good deals: When the open market price is significantly higher than the Zonal Value, that is a positive sign - it means the market recognizes value that the government has not yet updated. When the transaction price is close to or below the Zonal Value, it is worth investigating why.

3. Forecasting increases: BIR assessments are updated every 3-5 years. The next update is expected soon. When the assessment rises, the price floor rises, and transactions below the new value are no longer possible. Investors who enter before the update benefit from the gap.

4. Comparing areas: Zonal Values allow objective comparison between zones. If Zone A is valued at PHP 27,500 and Zone B at PHP 49,000, there is a fundamental difference based on government assessment, not a developer's marketing.

How to check Zonal Value?

1. Local BIR office - every office maintains the value table for its area.
2. BIR website - some data is available online.
3. Local real estate lawyer - can provide exact data by barangay and by land classification (agricultural, residential, commercial).

The breakdown is by barangay - each village or neighborhood in Panglao can have a different value.

Bottom line: before you close a deal, know the Zonal Value of the property. This is not just about tax - it is a tool for understanding the market.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/03_legal_ownership.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 16,
    title: "השקעות נדל\"ן לישראלים - פיליפינים vs קפריסין vs פורטוגל",
    titleEn: "PH vs Cyprus vs Portugal for Israeli Investors",
    category: "EDUCATE",
    scheduled: "2026-07-27",
    status: "ready",
    hebrewCopy: `השקעות נדל"ן לישראלים - פיליפינים vs קפריסין vs פורטוגל

רוב המשקיעים הישראלים שמחפשים נדל"ן בחו"ל מסתכלים על שלוש מדינות: קפריסין, פורטוגל והפיליפינים. כל אחת מציעה משהו אחר. הנה השוואה מבוססת נתונים, בלי דעות קדומות.

📊 תשואת שכירות שנתית
- קפריסין: 3%-5%
- פורטוגל: 4%-6%
- פיליפינים: 8%-16%
הפער מדבר בעד עצמו.

💰 מחיר כניסה מינימלי
- קפריסין: מ-200,000 אירו (כ-780,000 ש"ח)
- פורטוגל: מ-250,000 אירו (כ-975,000 ש"ח), ובמסגרת Golden Visa המינימום הוא 500,000 אירו
- פיליפינים: מ-PHP 5,000,000 (כ-83,000 דולר, כ-305,000 ש"ח), ללא סף מינימלי רשמי

💳 Golden Visa ותושבות
- קפריסין: תוכנית ה-Golden Visa הושעתה. גישה לאיחוד האירופי עדיין קיימת כתושב, אבל הדרך התארכה משמעותית.
- פורטוגל: Golden Visa עדיין פעילה, אבל השתנתה - השקעה מינימלית של 500,000 אירו, ומחירי הנדל"ן הכפילו את עצמם מאז 2018.
- פיליפינים: אין צורך ב-Golden Visa. 3 מסלולי בעלות חוקיים (Deed of Assignment, חכירה 25+25, תאגיד מקומי 60/40). ויזת SRRV מאפשרת תושבות קבועה מפיקדון של 10,000-50,000 דולר.

📈 שלב בשוק
- קפריסין: שוק בוגר, מחירים כבר גבוהים, צמיחה מתונה.
- פורטוגל: שוק רווי, מחירים הכפילו את עצמם תוך 6 שנים, התשואות יורדות.
- פיליפינים: שוק לפני פריצה. צמיחת תמ"ג של 5.5%-6.4%, אוכלוסייה צעירה, תשתיות בבנייה. מס רווחי הון: 6% בלבד.

✈️ מרחק ונגישות
- קפריסין: 2 שעות טיסה מישראל. הכי קרוב.
- פורטוגל: 5 שעות טיסה. נוח יחסית.
- פיליפינים: 12 שעות טיסה (דרך בנגקוק או דובאי). יותר רחוק, אבל הליך KYC ורכישה מרחוק זמין לחלוטין.

🤝 קהילה ישראלית
- קפריסין: קהילה גדולה ומבוססת, הרבה ישראלים כבר שם.
- פורטוגל: קהילה צומחת, בעיקר בליסבון ובאלגרבה.
- פיליפינים: קהילה מתפתחת, עם יחסים דיפלומטיים חמים ואמנת מס משנת 1997.

🏛️ מיסוי
- לישראל יש אמנת מס עם כל שלוש המדינות, מה שמונע כפל מס.
- מס רווחי הון: קפריסין 20%, פורטוגל 28%, פיליפינים 6%.

השורה התחתונה: קפריסין ופורטוגל הם שווקים בוגרים עם תשואות שכבר נשחקו. הפיליפינים הם השוק שבו התשואות עדיין לא עברו ארביטראז'. הכסף החכם נע לאן שהתשואות עדיין אמיתיות.

שאלות על השוואה ספציפית? דברו איתנו:
📲 WhatsApp (שיווק): +639542555553
📲 WhatsApp (משרד): +639958565865`,
    englishCopy: `Real Estate Investment for Israelis - Philippines vs Cyprus vs Portugal

Most Israeli investors looking at overseas real estate consider three countries: Cyprus, Portugal, and the Philippines. Each offers something different. Here is a data-driven comparison, no assumptions.

Annual rental yield:
- Cyprus: 3%-5%
- Portugal: 4%-6%
- Philippines: 8%-16%
The gap speaks for itself.

Minimum entry price:
- Cyprus: from EUR 200,000 (approx. ILS 780,000)
- Portugal: from EUR 250,000 (approx. ILS 975,000), Golden Visa minimum EUR 500,000
- Philippines: from PHP 5,000,000 (approx. $83,000, approx. ILS 305,000), no official minimum threshold

Golden Visa and residency:
- Cyprus: Golden Visa program suspended. EU access still available as a resident, but the process has become significantly longer.
- Portugal: Golden Visa still active but changed - minimum EUR 500,000 investment, real estate prices doubled since 2018.
- Philippines: No Golden Visa needed. 3 legal ownership paths (Deed of Assignment, Leasehold 25+25, Domestic Corporation 60/40). SRRV visa enables permanent residency from a $10,000-$50,000 deposit.

Market stage:
- Cyprus: Mature market, prices already high, moderate growth.
- Portugal: Saturating market, prices doubled in 6 years, yields declining.
- Philippines: Pre-boom market. GDP growth 5.5%-6.4%, young population, infrastructure under construction. Capital gains tax: only 6%.

Distance and accessibility:
- Cyprus: 2-hour flight from Israel. Closest option.
- Portugal: 5-hour flight. Relatively convenient.
- Philippines: 12-hour flight (via Bangkok or Dubai). Further away, but remote KYC and purchase process fully available.

Israeli community:
- Cyprus: Large, established community, many Israelis already there.
- Portugal: Growing community, mainly in Lisbon and Algarve.
- Philippines: Emerging community, with warm diplomatic relations and a tax treaty since 1997.

Taxation:
- Israel has tax treaties with all three countries, preventing double taxation.
- Capital gains tax: Cyprus 20%, Portugal 28%, Philippines 6%.

Bottom line: Cyprus and Portugal are mature markets where yields have already been arbitraged down. The Philippines is the market where returns are still real. Smart money moves to where returns have not been arbitraged away.

Questions about a specific comparison? Talk to us:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/02_ph_vs_greece.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 17,
    title: "Build Build Build - תוכנית התשתיות שמשנה את פני הפיליפינים",
    titleEn: "Build Build Build Infrastructure Program",
    category: "EDUCATE",
    scheduled: "2026-08-03",
    status: "ready",
    hebrewCopy: `Build Build Build - תוכנית התשתיות שמשנה את פני הפיליפינים

בישראל, כשרכבת חדשה נפתחת, מחירי הנדל"ן באזור קופצים ב-15%-30%. זה חוק ברזל בנדל"ן: תשתית מובילה ערך.

בפיליפינים, זה קורה עכשיו, בקנה מידה של 209 פרויקטים בתקציב כולל של 10.6 טריליון פזו.

🏗️ הפרויקטים שמשנים את התמונה

שדה תעופה בינלאומי חדש בבולקאן (New Manila International Airport)
- השקעה: 15 מיליארד דולר
- קיבולת: 100 מיליון נוסעים בשנה
- שלב ראשון: 2028
- המשמעות: מנילה מקבלת שדה תעופה ברמה של סינגפור

גשר CCLEX בסבו
- כבר נפתח ופעיל
- ערכי נדל"ן באזור עלו ב-30% מאז ההשקה
- דוגמה חיה לאפקט התשתיות

רכבת תחתית מטרו מנילה
- 36 ק"מ, 17 תחנות
- צפי השלמה: 2029
- הפרויקט הגדול ביותר בתולדות מנילה

רכבת מינדנאו
- קו רכבת ראשון לאי השני בגודלו בפיליפינים
- פותח אזורים שלמים לפיתוח

🌴 מה קורה בבוהול?

הרחבת שדה התעופה של בוהול
- קיבולת תגדל ל-3.9 מיליון נוסעים בשנה עד 2030
- יותר טיסות ישירות, יותר תיירים, יותר ביקוש לנכסים

גשר טגבילראן-פנגלאו
- תקציב: 7.15 מיליארד פזו
- מימון צרפתי
- יחבר את העיר הראשית לאי הנופש, ויקצר זמני נסיעה משמעותית
- אפקט צפוי: עלייה של 20%-40% בערכי נדל"ן באזור הגשר

💰 מודל PPP (שותפות ציבורית-פרטית)
סך הפרויקטים במודל PPP: 2.81 טריליון פזו. המשמעות: ההשקעה הפרטית מאמינה בתשואה. זה לא רק כסף ממשלתי, זה כסף של משקיעים שעשו חישוב.

📊 למה זה חשוב למשקיע ישראלי?

בישראל, פרויקט רכבת קלה אחד מעלה מחירי דירות ב-15%-30%. בפיליפינים, 209 פרויקטים רצים במקביל. האזורים שעדיין לא התייקרו הם האזורים שבהם התשתית עדיין בבנייה.

בוהול היום נראה כמו חיפה לפני קו הכרמלית. התשתית בדרך, המחירים עדיין נמוכים.

שאלות על אזורים ספציפיים שמושפעים מפרויקטי תשתית? דברו איתנו:
📲 WhatsApp (שיווק): +639542555553
📲 WhatsApp (משרד): +639958565865`,
    englishCopy: `Build Build Build - The Infrastructure Program Changing the Philippines

In Israel, when a new train line opens, real estate prices in the area jump 15%-30%. This is an iron rule in real estate: infrastructure drives value.

In the Philippines, this is happening right now, at the scale of 209 projects with a total budget of PHP 10.6 trillion.

Key projects reshaping the landscape:

New Bulacan International Airport (New Manila International Airport)
- Investment: $15 billion
- Capacity: 100 million passengers per year
- Phase 1: 2028
- Significance: Manila gets a Singapore-class airport

CCLEX Bridge in Cebu
- Already open and operational
- Property values in the area rose 30% since launch
- A live example of the infrastructure effect

Metro Manila Subway
- 36 km, 17 stations
- Expected completion: 2029
- The largest project in Manila's history

Mindanao Railway
- First railway for the second-largest island in the Philippines
- Opens entire regions to development

What is happening in Bohol?

Bohol Airport expansion
- Capacity growing to 3.9 million passengers per year by 2030
- More direct flights, more tourists, more demand for properties

Tagbilaran-Panglao Bridge
- Budget: PHP 7.15 billion
- French-funded
- Will connect the main city to the resort island, significantly reducing travel times
- Expected effect: 20%-40% increase in property values near the bridge area

PPP model (Public-Private Partnership)
Total PPP projects: PHP 2.81 trillion. The significance: private investment believes in the returns. This is not just government money - this is money from investors who did the math.

Why this matters for Israeli investors:

In Israel, a single light rail project raises apartment prices by 15%-30%. In the Philippines, 209 projects are running simultaneously. The areas that have not yet appreciated are the areas where infrastructure is still under construction.

Bohol today looks like Haifa before the Carmelit line. The infrastructure is coming, prices are still low.

Questions about specific areas affected by infrastructure projects? Talk to us:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/07_bridge_infrastructure.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 18,
    title: "OFW - הכוח הנסתר שמניע את שוק הנדל\"ן הפיליפיני",
    titleEn: "OFW Remittances: The Hidden Engine of Philippine Real Estate",
    category: "EDUCATE",
    scheduled: "2026-08-07",
    status: "ready",
    hebrewCopy: `OFW - הכוח הנסתר שמניע את שוק הנדל"ן הפיליפיני

יש מנגנון כלכלי אחד שמבדיל את הפיליפינים מכל שוק נדל"ן אחר בעולם. הוא לא מופיע בכותרות, אבל הוא הסיבה שמחירי הנדל"ן בפיליפינים מעולם לא קרסו באמת, גם לא ב-2008, גם לא בקורונה.

המנגנון הזה נקרא OFW: Overseas Filipino Workers.

📊 המספרים

- יותר מ-10 מיליון פיליפינים עובדים בחו"ל (מכל אוכלוסייה של 116 מיליון)
- ב-2025 הם שלחו הביתה שיא של 35.63 מיליארד דולר בהעברות כספיות
- העברות OFW מהוות 8%-10% מהתמ"ג הפיליפיני
- הסכום הזה גדל ב-3%-5% בשנה, באופן עקבי, גם בתקופות משבר

💰 לאן הולך הכסף?

60% מההעברות זורמים לנדל"ן. 60%.

זה אומר 21 מיליארד דולר בשנה שנכנסים ישירות לשוק הנדל"ן הפיליפיני. כל שנה. בלי הפסקה.

בשביל הקשר: תקציב הדיור הלאומי של ישראל הוא כ-4 מיליארד ש"ח (כמיליארד דולר). ה-OFW מזרימים פי 21 מזה לנדל"ן פיליפיני, כל שנה.

🏠 מה זה עושה לשוק?

1. רצפת מחירים: ה-21 מיליארד דולר בשנה יוצרים רצפה למחירי נדל"ן. גם כשהכלכלה מאטה, ההעברות ממשיכות לזרום. זו הסיבה שהפיליפינים לא חוו קריסת מחירים ב-2008 כמו ספרד, יוון או ארה"ב.

2. ביקוש מתמיד: ה-OFW הם הקונים העיקריים באזורים פרובינציאליים. הם קונים בתים למשפחותיהם, נכסים להשקעה, ומגרשים לפרישה. הביקוש הזה לא תלוי בתיירות או בכלכלה המקומית.

3. יציבות: בזמן שמדינות אחרות חוות מחזורי בום ומפולת, הפיליפינים חוות צמיחה מתמדת. לא דרמטית, אבל עקבית. 3%-5% עלייה שנתית, שנה אחרי שנה.

🌴 בוהול ו-OFW

לבוהול יש ריכוז גבוה של OFW, בעיקר עובדים ימיים (seafarers) ועובדי בריאות. המשמעות: ביקוש מקומי חזק לנדל"ן, גם ללא תלות בתיירות.

כשעובד ימי מבוהול חוסך 10 שנים בחו"ל ורוצה לבנות בית לפרישה, הוא קונה בבוהול. הביקוש הזה אמיתי, מתמשך, ולא תלוי בעונת התיירות.

📈 למה זה חשוב למשקיע ישראלי?

אין מדינה אחרת בעולם שיש לה מנגנון כזה. 21 מיליארד דולר בשנה לנדל"ן, שגדל ב-3%-5% בשנה, ולא תלוי בתיירות, בריבית, או בפוליטיקה מקומית.

זו לא תחזית. זה דפוס של עשרות שנים שממשיך להתחזק.

כשאתם שוקלים לאן לשים את הכסף, שווה לשאול: לאיזה שוק יש רצפת ביקוש מובנית של 21 מיליארד דולר בשנה?

📲 שאלות? דברו איתנו:
WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `OFW - The Hidden Force Driving Philippine Real Estate

There is one economic mechanism that sets the Philippines apart from every other real estate market in the world. It does not make headlines, but it is the reason Philippine real estate prices have never truly crashed - not in 2008, not during COVID.

That mechanism is called OFW: Overseas Filipino Workers.

The numbers:
- More than 10 million Filipinos work abroad (from a total population of 116 million)
- In 2025 they sent home a record $35.63 billion in remittances
- OFW remittances account for 8%-10% of Philippine GDP
- This amount grows 3%-5% annually, consistently, even during crisis periods

Where does the money go?

60% of remittances flow into real estate. 60%.

That means $21 billion per year entering the Philippine real estate market directly. Every year. Without pause.

For context: Israel's national housing budget is about ILS 4 billion (roughly $1 billion). OFWs channel 21 times that amount into Philippine real estate, every year.

What this does to the market:

1. Price floor: The $21 billion per year creates a floor for real estate prices. Even when the economy slows, remittances keep flowing. This is why the Philippines did not experience price crashes in 2008 like Spain, Greece, or the US.

2. Constant demand: OFWs are the primary buyers in provincial areas. They buy homes for their families, investment properties, and land for retirement. This demand is independent of tourism or the local economy.

3. Stability: While other countries experience boom-and-bust cycles, the Philippines experiences steady growth. Not dramatic, but consistent. 3%-5% annual appreciation, year after year.

Bohol and OFW:
Bohol has a high concentration of OFWs, mainly seafarers and healthcare workers. The result: strong local demand for real estate, even without relying on tourism.

When a seafarer from Bohol saves for 10 years abroad and wants to build a retirement home, they buy in Bohol. That demand is real, ongoing, and not seasonal.

Why this matters for Israeli investors:

No other country in the world has a mechanism like this. $21 billion per year into real estate, growing 3%-5% annually, independent of tourism, interest rates, or local politics.

This is not a forecast. This is a pattern of decades that continues to strengthen.

When you consider where to put your money, it is worth asking: which market has a built-in demand floor of $21 billion per year?

Questions? Talk to us:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/01_ph_investment_guide.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 19,
    title: "ויזת SRRV - איך לגור בפיליפינים כמשקיע ישראלי",
    titleEn: "SRRV Visa Guide for Israeli Investors",
    category: "EDUCATE",
    scheduled: "2026-08-10",
    status: "ready",
    hebrewCopy: `ויזת SRRV - איך לגור בפיליפינים כמשקיע ישראלי

אחת השאלות הנפוצות ביותר שאנחנו מקבלים: "אם אני קונה נכס בפיליפינים, אני יכול גם לגור שם?"

התשובה: כן. ויש מסלול ספציפי לזה, הרבה יותר פשוט ממה שרוב האנשים חושבים.

🏛️ מה זה SRRV?

Special Resident Retiree's Visa - ויזת תושבות קבועה שמנוהלת על ידי ה-PRA (Philippine Retirement Authority). למרות השם "Retiree", גיל הכניסה הורד ל-40 (היה 50). זו לא ויזת פנסיונרים בלבד, זו ויזת משקיעים.

📋 שני מסלולים עיקריים

SRRV Smile (גיל 35-49)
- פיקדון: 20,000 דולר (כ-70,000 ש"ח)
- הפיקדון נשאר בחשבון נאמנות בפיליפינים
- לא ניתן להשקעה בנדל"ן, אבל מוחזר בעת עזיבה
- מתאים למי שרוצה תושבות בלי לקשור את הפיקדון לנכס

SRRV Classic (גיל 50+)
- פיקדון: 10,000 דולר עם פנסיה (כ-36,000 ש"ח), או 50,000 דולר ללא פנסיה (כ-180,000 ש"ח)
- הפיקדון ניתן להמרה להשקעה בנדל"ן (קונדו בלבד)
- מתאים למי שרוצה לשלב תושבות עם השקעה

📊 מה אתם מקבלים?

- תושבות קבועה (Permanent Resident) בפיליפינים
- כניסות ויציאות ללא הגבלה (Multiple Entry)
- פטור מויזת יציאה (Exit Clearance)
- אפשרות לפתוח חשבון בנק מקומי
- גישה למערכת הבריאות המקומית
- אפשרות לעבוד עם היתר עבודה נפרד (AEP)

⏱️ תהליך ולוחות זמנים

שלב 1: הגשת בקשה מקוונת דרך ה-PRA
שלב 2: הפקדת הפיקדון בבנק מורשה בפיליפינים
שלב 3: בדיקת רקע (NBI Clearance)
שלב 4: בדיקה רפואית (Medical Exam)
שלב 5: אישור סופי וקבלת ויזה

זמן עיבוד: 30-60 ימים מרגע הגשת כל המסמכים.

🇮🇱 מה חשוב לישראלים?

- יחסים דיפלומטיים חמים בין ישראל לפיליפינים
- כניסה ללא ויזה לשהייה של עד 30 יום (לפני הגשת SRRV)
- אמנת מס ישראל-פיליפינים מ-1997 מונעת כפל מס
- אין חובה לגור בפיליפינים באופן קבוע, הויזה תקפה גם אם אתם מגיעים פעם בשנה

💰 השורה התחתונה

בשביל פיקדון של 70,000-180,000 ש"ח אתם מקבלים תושבות קבועה במדינה שבה הכסף שלכם שווה פי 3 מבישראל. אפשר לגור, להשקיע, או פשוט להחזיק אופציה פתוחה לעתיד.

לשם השוואה: תושבות בפורטוגל דורשת השקעה מינימלית של 500,000 אירו. בקפריסין, התוכנית הושעתה. בפיליפינים, 20,000 דולר ו-60 ימים.

⚠️ הערה חשובה: SRRV מאפשרת תושבות, לא בעלות על קרקע. בעלות חוקית על נכסים לזרים מתאפשרת דרך 3 מסלולים נפרדים (Deed of Assignment, חכירה 25+25, תאגיד מקומי).

רוצים לדעת מה המסלול המתאים לכם? דברו איתנו:
📲 WhatsApp (שיווק): +639542555553
📲 WhatsApp (משרד): +639958565865`,
    englishCopy: `SRRV Visa - How to Live in the Philippines as an Israeli Investor

One of the most common questions we receive: "If I buy property in the Philippines, can I also live there?"

The answer: yes. And there is a specific pathway for that, much simpler than most people think.

What is SRRV?

Special Resident Retiree's Visa - a permanent residency visa managed by the PRA (Philippine Retirement Authority). Despite the name "Retiree," the entry age was lowered to 40 (previously 50). This is not just a retiree visa - it is an investor visa.

Two main tracks:

SRRV Smile (age 35-49)
- Deposit: $20,000 (approx. ILS 70,000)
- Deposit remains in a trust account in the Philippines
- Cannot be converted to real estate investment, but returned upon departure
- Suitable for those who want residency without tying the deposit to property

SRRV Classic (age 50+)
- Deposit: $10,000 with pension (approx. ILS 36,000), or $50,000 without pension (approx. ILS 180,000)
- Deposit can be converted to real estate investment (condo only)
- Suitable for those who want to combine residency with investment

What you get:
- Permanent Resident status in the Philippines
- Unlimited entries and exits (Multiple Entry)
- Exemption from Exit Clearance
- Ability to open a local bank account
- Access to local healthcare system
- Option to work with a separate work permit (AEP)

Process and timeline:
Step 1: Submit online application through PRA
Step 2: Deposit funds in an authorized Philippine bank
Step 3: Background check (NBI Clearance)
Step 4: Medical examination
Step 5: Final approval and visa issuance

Processing time: 30-60 days from submission of all documents.

What matters for Israelis:
- Warm diplomatic relations between Israel and the Philippines
- Visa-free entry for stays up to 30 days (before applying for SRRV)
- Israel-Philippines Tax Treaty from 1997 prevents double taxation
- No requirement to live in the Philippines permanently - the visa remains valid even if you visit once a year

Bottom line:
For a deposit of ILS 70,000-180,000 you get permanent residency in a country where your money goes 3 times further than in Israel. You can live, invest, or simply hold an open option for the future.

For comparison: residency in Portugal requires a minimum investment of EUR 500,000. In Cyprus, the program was suspended. In the Philippines: $20,000 and 60 days.

Important note: SRRV provides residency, not land ownership. Legal property ownership for foreigners is available through 3 separate paths (Deed of Assignment, Leasehold 25+25, Domestic Corporation).

Want to know which track suits you? Talk to us:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/04_panglao_aerial.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 20,
    title: "מדריך הבדיקת נאותות - 15 בדיקות לפני שאתם קונים נכס בפיליפינים",
    titleEn: "Due Diligence Checklist: 15 Checks Before Buying Property in the Philippines",
    category: "EDUCATE",
    scheduled: "2026-08-17",
    status: "ready",
    hebrewCopy: `מדריך הבדיקת נאותות - 15 בדיקות לפני שאתם קונים נכס בפיליפינים

בישראל, כשאתם קונים דירה, עורך הדין שלכם בודק נסח טאבו ושעבודים. בפיליפינים, התהליך שונה, ויש דברים שמשקיעים זרים מפספסים. הרשימה הזו תחסוך לכם כאבי ראש.

15 בדיקות שחייבים לבצע:

1. אימות בעלות ב-LRA (Land Registration Authority)
- בדקו שה-Title רשום ותקף ב-LRA
- ודאו שאין Title כפול (בעיה ידועה באזורים מסוימים)
- עלות: PHP 500-1,000

2. בדיקת שעבודים ועיקולים (Liens and Encumbrances)
- בקשו Certified True Copy של ה-Title
- בדקו שאין שעבוד בנקאי, עיקול, או הערת אזהרה
- כל מה שרשום על ה-Title מחייב

3. מיסי ארנונה (Real Property Tax)
- בקשו אישור שכל מיסי הארנונה שולמו (Tax Clearance)
- חוב ארנונה יכול להוביל למכירה כפויה של הנכס
- בדקו ב-Treasurer's Office של העירייה

4. סיווג ייעוד קרקע (Zoning Classification)
- ודאו שהקרקע מסווגת למגורים, מסחרי, או תיירות, בהתאם לשימוש המתוכנן
- קרקע חקלאית (Agricultural) דורשת המרה (DAR Conversion) לפני בנייה
- בדקו ב-Municipal Planning Office

5. תאימות סביבתית (Environmental Compliance)
- פרויקטים מעל גודל מסוים דורשים ECC (Environmental Compliance Certificate)
- אזורי חוף דורשים בדיקת Easement Zone (3 מטר מינימום מקו המים)
- חשוב במיוחד בבוהול ופנגלאו

6. רישיון יזם (Developer DHSUD License)
- כל יזם שמוכר יחידות Off-Plan חייב רישיון מ-DHSUD
- בקשו את מספר הרישיון ובדקו באתר DHSUD
- ללא רישיון, המכירה לא חוקית

7. תנאי הגבלה (Deed of Restrictions)
- מסמך שמגדיר מה מותר ומה אסור בנכס
- גובה בנייה מקסימלי, שימושים מותרים, חובות תחזוקה
- קראו לפני שאתם חותמים, לא אחרי

8. ביקור פיזי מול Title
- האם גבולות הנכס בשטח תואמים את מה שרשום ב-Title?
- שכרו Geodetic Engineer לביצוע Relocation Survey
- עלות: PHP 15,000-30,000, שווה כל אגורה

9. בדיקת מתיישבים לא רשמיים (Informal Settlers)
- בפיליפינים, פינוי מתיישבים הוא תהליך ארוך ומורכב
- בדקו פיזית את הנכס ואת הסביבה הקרובה
- שאלו שכנים ובדקו ב-Barangay

10. אישור ברנגאי (Barangay Clearance)
- ה-Barangay הוא יחידת השלטון המקומי הקטנה ביותר
- אישור שהנכס לא במחלוקת מקומית
- בדקו גם אם יש תוכניות פיתוח שעלולות להשפיע

11. גישה לכביש (Road Access)
- ודאו שיש גישה חוקית לכביש ציבורי (Right of Way)
- נכס ללא גישה לכביש מאבד 30%-50% מערכו
- בדקו אם הגישה היא דרך קרקע פרטית

12. מפות הצפה וסיכונים (Flood and Hazard Maps)
- בדקו ב-DOST Project NOAH ובמפות MGB
- אזורי הצפה גבוהים פוגעים בערך הנכס ובביטוח
- חשוב במיוחד באזורים נמוכים ליד חוף

13. היתרי בנייה (Building Permits)
- ודאו שכל המבנים הקיימים נבנו עם היתר
- מבנה ללא היתר יכול להיות מושא לצו הריסה
- בדקו ב-Municipal Engineering Office

14. כללי ועד בית (HOA Rules)
- אם הנכס בפרויקט מגורים, בדקו את תקנון ה-HOA
- דמי ניהול חודשיים, מגבלות על השכרה לטווח קצר, כללי שיפוץ
- HOA שאוסרת Airbnb תפגע בתשואה שלכם

15. שמאות עצמאית (Independent Appraisal)
- הזמינו שמאי מוסמך שלא קשור ליזם
- השוו לעסקאות דומות באזור (Comparable Sales)
- עלות: PHP 5,000-15,000

📌 שמרו את הרשימה הזו. הדפיסו אותה. או עבדו עם צוות שעושה את כל 15 הבדיקות באופן אוטומטי.

📲 שאלות על תהליך הבדיקה? דברו איתנו:
WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Due Diligence Checklist - 15 Checks Before Buying Property in the Philippines

In Israel, when you buy an apartment, your lawyer checks the Tabu registry and liens. In the Philippines, the process is different, and there are things foreign investors miss. This list will save you headaches.

15 checks you must perform:

1. Title verification at LRA (Land Registration Authority)
Confirm the Title is registered and valid at the LRA. Check for duplicate titles (a known issue in some areas). Cost: PHP 500-1,000.

2. Liens and encumbrances
Request a Certified True Copy of the Title. Verify no bank mortgages, court attachments, or adverse claims exist. Everything annotated on the Title is binding.

3. Real property tax clearance
Request proof that all property taxes are paid (Tax Clearance). Unpaid taxes can lead to forced sale. Check at the municipal Treasurer's Office.

4. Zoning classification
Confirm the land is zoned residential, commercial, or tourism, matching your intended use. Agricultural land requires DAR Conversion before construction. Check at Municipal Planning Office.

5. Environmental compliance
Projects above a certain size require an ECC (Environmental Compliance Certificate). Coastal areas require Easement Zone verification (3-meter minimum from waterline). Especially important in Bohol and Panglao.

6. Developer DHSUD license
Any developer selling off-plan units must hold a DHSUD license. Request the license number and verify on the DHSUD website. Without a license, the sale is not legal.

7. Deed of Restrictions
Document defining what is permitted and prohibited on the property. Maximum building height, allowed uses, maintenance obligations. Read before signing, not after.

8. Physical inspection vs Title
Do the property boundaries on the ground match what is recorded in the Title? Hire a Geodetic Engineer for a Relocation Survey. Cost: PHP 15,000-30,000 - worth every peso.

9. Informal settlers check
In the Philippines, eviction of informal settlers is a long, complex process. Physically inspect the property and immediate surroundings. Ask neighbors and check at the Barangay.

10. Barangay Clearance
The Barangay is the smallest local government unit. Confirms the property is not in local dispute. Also check if there are development plans that may affect the area.

11. Road access (Right of Way)
Confirm legal access to a public road exists. Property without road access loses 30%-50% of its value. Check whether access runs through private land.

12. Flood and hazard maps
Check at DOST Project NOAH and MGB hazard maps. High flood zones affect property value and insurance. Especially important in low-lying areas near the coast.

13. Building permits
Confirm all existing structures were built with proper permits. Structures without permits can be subject to demolition orders. Check at Municipal Engineering Office.

14. HOA rules
If the property is in a residential development, review the HOA charter. Monthly management fees, short-term rental restrictions, renovation rules. An HOA that prohibits Airbnb will impact your yield.

15. Independent appraisal
Commission a licensed appraiser not affiliated with the developer. Compare to similar transactions in the area (Comparable Sales). Cost: PHP 5,000-15,000.

Save this list. Print it. Or work with a team that does all 15 checks automatically.

Questions about the due diligence process? Talk to us:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/03_legal_ownership.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 21,
    title: "בוהול - האי שהעולם רק מגלה (ואנחנו כבר שם)",
    titleEn: "Bohol Deep Dive - Investment Thesis",
    category: "SHOWCASE",
    scheduled: "2026-06-10",
    status: "ready",
    hebrewCopy: `בוהול - האי שהעולם רק מגלה (ואנחנו כבר שם)

רוב המשקיעים מגיעים לפיליפינים ומסתכלים על מנילה, סבו, בורקאי. ואז שומעים על בוהול ושואלים: "למה לא ידעתי על זה קודם?"

הנה התשובה הקצרה: כי בוהול עדיין בשלב שלפני פיצוץ המחירים. אבל החלון הזה נסגר.

הנתונים מדברים:

1.43 מיליון תיירים ב-2025, עלייה של 166% מאז 2022. זה לא צמיחה - זה שינוי קטגוריה. Skyscanner דירג את בוהול במקום ה-8 ביעדים הטרנדיים בעולם. לא באסיה - בעולם.

שדה התעופה של פנגלאו קלט 2.22 מיליון נוסעים, מעל הקיבולת המתוכננת של 2 מיליון. הממשלה כבר אישרה תוכנית הרחבה ל-3.9 מיליון. כשנמל תעופה נבנה מעבר לקיבולת, זה אומר שהביקוש עקף את כל התחזיות.

הכלכלה: תמ"ג של 6.6%-8.8% ב-2024. תיירות מהווה 70%-74% מהתמ"ג המקומי. זה אומר שכל שקל שנכנס לתיירות מזין את כל השרשרת: נדל"ן, בנייה, תשתיות, שירותים.

מה מניע את הצמיחה:

טיסות ישירות מקוריאה (השוק התיירותי הגדול ביותר). 12 טיסות ביום ממנילה. אתר מורשת עולמית של UNESCO (Geopark). גשר צרפתי בהשקעת P7.15 מיליארד שמחבר את טגבילרן לפנגלאו. Panglao Shores, פרויקט של P25 מיליארד שכולל מלונות, מרכז כנסים וקו חוף של קילומטר.

אבל הנקודה החשובה ביותר היא זו: בוהול היום היא לא יעד תיירותי - היא תזת השקעה.

כשממשלה, בנקים פיתוח בינלאומיים, רשתות מלונות גלובליות ותשתיות תחבורה כולם מתכנסים לנקודה אחת על המפה, זה לא מקרה. זה תבנית. ראינו את זה בבורקאי, ראינו את זה בבאלי, ראינו את זה בפוקט.

ההבדל: בבוהול, המחירים עדיין לפני ההתאמה.

מי שנכנס עכשיו קונה במחירי 2024-2025. מי שמחכה שנתיים קונה במחירי "JW Marriott כבר פתוח."

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865

שלוש אפשרויות בעלות חוקיות: Deed of Assignment, חכירה 25+25, תאגיד מקומי.`,
    englishCopy: `Bohol: The Island the World Is Just Discovering (We Are Already There)

Most investors arrive in the Philippines and look at Manila, Cebu, Boracay. Then they hear about Bohol and ask: "Why didn't I know about this sooner?"

The short answer: because Bohol is still in the phase before the price explosion. But that window is closing.

The numbers speak clearly:

1.43 million tourists in 2025, up 166% since 2022. Skyscanner ranked Bohol #8 in trending destinations globally. Not in Asia - globally.

Panglao airport handled 2.22 million passengers, exceeding its designed capacity of 2 million. The government has already approved expansion to 3.9 million. When an airport is built beyond capacity, demand has outpaced every forecast.

The economy: GDP growth of 6.6%-8.8% in 2024. Tourism accounts for 70%-74% of local GDP. Every peso entering tourism feeds the entire chain: real estate, construction, infrastructure, services.

What is driving the growth: direct flights from Korea (the largest tourist market), 12 daily flights from Manila, UNESCO Geopark designation, a French-funded P7.15 billion bridge connecting Tagbilaran to Panglao, and Panglao Shores, a P25 billion development with hotels, a convention center, and 1km of beachfront.

The critical point: Bohol today is not a tourism destination. It is an investment thesis.

When government, international development banks, global hotel chains, and transport infrastructure all converge on a single point on the map, that is not coincidence. That is a pattern. We saw it in Boracay, Bali, and Phuket.

The difference: in Bohol, prices have not yet adjusted.

Those who enter now buy at 2024-2025 prices. Those who wait two years buy at "JW Marriott is already open" prices.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/04_panglao_aerial.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 22,
    title: "פנגלאו 2026 - מהאי השקט לעיר נופש בינלאומית",
    titleEn: "Panglao's Transformation",
    category: "SHOWCASE",
    scheduled: "2026-06-16",
    status: "ready",
    hebrewCopy: `פנגלאו 2026 - מהאי השקט לעיר נופש בינלאומית

יש רגע מדויק שבו אי קטן מפסיק להיות "יעד נחמד" ומתחיל להיות עיר נופש בינלאומית. פנגלאו נמצאת בדיוק ברגע הזה.

מה קורה שם עכשיו, בו-זמנית:

JW Marriott Panglao: 7 הקטאר, 80 חדרי מלון ו-70 יחידות מגורים ממותגות (branded residences). שלב ראשון 2026-2028. מריוט לא נכנסים לאי קטן בפיליפינים בלי שעשו ניתוח כדאיות של שנתיים. הם עשו - והחליטו להיכנס.

MGallery by Accor: 188 חדרים, המלון הראשון של הרשת בפיליפינים. כש-Accor בוחרים את הנכס הראשון שלהם במדינה, זה אומר שהם מאמינים שפנגלאו תהיה הדגל של הפיליפינים לתיירות יוקרה.

Panglao Shores: P25 מיליארד. 50-57.7 הקטאר. אזור כלכלי תיירותי (TEZ) באישור TIEZA. 6 מלונות ומעלה, מעל 1,000 יחידות, מרכז כנסים, קילומטר של קו חוף. זה לא פרויקט - זה עיר קטנה.

Aboitiz InfraCapital: PPP ל-30 שנה להרחבת שדה התעופה ל-3.9 מיליון נוסעים. הקיבולת הנוכחית (2 מיליון) כבר נפרצה.

ועכשיו הנקודה שמעניינת משקיעים:

מחירי קרקע לפי BIR (רשות המסים): PHP 27,500-49,000 למ"ר. לשם השוואה, בורקאי: PHP 55,000-70,000 למ"ר. פנגלאו זולה ב-40%-60% מבורקאי, עם תשתיות חדשות יותר ומלונות יוקרה שבורקאי אין לה.

עלייה של 77% בחיפושי טיסות לפנגלאו. Skyscanner מדרג את בוהול במקום 8 בעולם ביעדים טרנדיים.

מה זה אומר בפועל: מי שקונה היום, קונה לפני שכל הפרויקטים האלה מגיעים לאכלוס. ברגע ש-JW Marriott פותח, ברגע ש-Panglao Shores מתחיל לפעול, המחירים מתיישרים עם הסטנדרט הבינלאומי.

ההיסטוריה חוזרת על עצמה: בורקאי 2010, בוהול 2026.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865

שלוש אפשרויות בעלות חוקיות: Deed of Assignment, חכירה 25+25, תאגיד מקומי.`,
    englishCopy: `Panglao 2026: From Quiet Island to International Resort City

There is an exact moment when a small island stops being a "nice destination" and becomes an international resort city. Panglao is at that moment right now.

What is happening there simultaneously:

JW Marriott Panglao: 7 hectares, 80 hotel rooms and 70 branded residences. Phase one 2026-2028. Marriott does not enter a small Philippine island without a two-year feasibility analysis. They did the analysis and decided to enter.

MGallery by Accor: 188 rooms, the chain's first hotel in the Philippines. When Accor chooses their first property in a country, it means they believe Panglao will be the Philippines' flagship for luxury tourism.

Panglao Shores: P25 billion. 50-57.7 hectares. Tourism Economic Zone (TEZ) approved by TIEZA. 6+ hotels, over 1,000 units, convention center, 1km of beachfront. This is not a project - it is a small city.

Aboitiz InfraCapital: 30-year PPP for airport expansion to 3.9 million passengers. Current capacity (2 million) has already been exceeded.

The point that matters to investors:

BIR zonal land values: PHP 27,500-49,000 per sqm. For comparison, Boracay: PHP 55,000-70,000 per sqm. Panglao is 40%-60% cheaper than Boracay, with newer infrastructure and luxury hotels Boracay does not have.

A 77% surge in flight searches to Panglao. Skyscanner ranks Bohol #8 globally in trending destinations.

What this means in practice: those who buy today buy before all these projects reach occupancy. The moment JW Marriott opens, the moment Panglao Shores begins operating, prices align with international standards.

History repeats: Boracay 2010, Bohol 2026.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/04_panglao_aerial.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 23,
    title: "סבו - המרכז הכלכלי של ויסאיאס והזדמנות הנדל\"ן",
    titleEn: "Cebu Investment Profile",
    category: "SHOWCASE",
    scheduled: "2026-06-24",
    status: "ready",
    hebrewCopy: `סבו - המרכז הכלכלי של ויסאיאס והזדמנות הנדל"ן

אם מנילה היא ניו יורק של הפיליפינים, סבו היא חיפה: עיר נמל עם תעשיית טכנולוגיה צומחת, אוכלוסייה של מעל 3 מיליון, ושוק נדל"ן שמתחיל לקבל תשומת לב בינלאומית.

המספרים:

סבו היא המטרופולין השני בגודלו בפיליפינים. IT Park סבו הוא מרכז BPO מוביל, עם מחירי קרקע של PHP 150,000-200,000 למ"ר באזורים המרכזיים. שדה התעופה של מקטן קולט מעל 12 מיליון נוסעים בשנה, עם טיסות ישירות לקוריאה, יפן, סינגפור, הונג קונג ודובאי.

מה שינה את המשחק: גשר CCLEX.

ה-Cebu-Cordova Link Expressway נפתח ב-2022 וחיבר את סבו למקטן בדרך חדשה. התוצאה: עליית ערכים של 30% באזורים שהגשר חיבר. תבנית מוכרת, כמו שראינו בכל עיר שבנתה גשר או מנהרה חדשה.

תשואות: 6%-8% שכירות שנתית. עליית ערך של 3%-7% בשנה. שילוב של השניים נותן למשקיע פיליפיני או זר תשואה כוללת של 9%-15% לפני מיסוי.

האזורים החמים:

SRP (South Road Properties): פרויקט waterfront ענק שהופך שטח תעשייתי לאזור מגורים ומסחר. Ayala, Megaworld, Robinsons Land - כל הגדולים נמצאים שם.

IT Park ומנדאואה: מרכז ה-BPO שמושך עובדי טכנולוגיה עם כוח קנייה גבוה.

מקטן: קרבה לשדה התעופה ולחופים, עם Lapu-Lapu City שהופכת למוקד תיירותי.

למה זה רלוונטי למשקיע בבוהול:

סבו ובוהול מרוחקות שעתיים במעבורת או 20 דקות בטיסה. הן לא מתחרות - הן משלימות. סבו היא המרכז העסקי, בוהול היא יעד הנופש. משקיע חכם רואה את שתיהן כמערכת אחת.

הקשר הישיר: תיירים שנוחתים בסבו נוסעים לבוהול ליום או יומיים. ככל שסבו גדלה, בוהול נהנית.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865

שלוש אפשרויות בעלות חוקיות: Deed of Assignment, חכירה 25+25, תאגיד מקומי.`,
    englishCopy: `Cebu: The Economic Center of the Visayas and a Real Estate Opportunity

If Manila is the New York of the Philippines, Cebu is its Haifa: a port city with a growing technology industry, a population of over 3 million, and a real estate market beginning to attract international attention.

The numbers:

Cebu is the second-largest metropolitan area in the Philippines. Cebu IT Park is a leading BPO hub, with land prices of PHP 150,000-200,000 per sqm in central areas. Mactan airport handles over 12 million passengers annually, with direct flights to Korea, Japan, Singapore, Hong Kong, and Dubai.

The game-changer: the CCLEX bridge.

The Cebu-Cordova Link Expressway opened in 2022 and connected Cebu to Mactan via a new route. The result: a 30% increase in property values in the areas the bridge connected. A familiar pattern, seen in every city that builds a new bridge or tunnel.

Yields: 6%-8% annual rental. Value appreciation of 3%-7% per year. The combination gives an investor a total return of 9%-15% before tax.

The hot zones:

SRP (South Road Properties): a massive waterfront project transforming industrial land into residential and commercial zones. Ayala, Megaworld, Robinsons Land - all the major developers are present.

IT Park and Mandaue: the BPO center attracting tech workers with high purchasing power.

Mactan: proximity to the airport and beaches, with Lapu-Lapu City becoming a tourism hub.

Why this matters for Bohol investors:

Cebu and Bohol are 2 hours by ferry or 20 minutes by flight. They do not compete - they complement each other. Cebu is the business center, Bohol is the resort destination. A smart investor views both as one system.

The direct connection: tourists landing in Cebu travel to Bohol for a day or two. As Cebu grows, Bohol benefits.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/07_bridge_infrastructure.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 24,
    title: "סיארגאו - מספר 1 בתשואת Airbnb בפיליפינים",
    titleEn: "Siargao #1 Airbnb in Philippines",
    category: "SHOWCASE",
    scheduled: "2026-06-30",
    status: "ready",
    hebrewCopy: `סיארגאו - מספר 1 בתשואת Airbnb בפיליפינים

יש אי אחד בפיליפינים שמייצר את התשואות הגבוהות ביותר ב-Airbnb במדינה כולה. הוא לא במנילה, לא בסבו ולא בבורקאי. הוא בקצה המזרחי, ושמו סיארגאו.

המספרים:

71% תפוסה שנתית - הגבוהה ביותר בפיליפינים. PHP 640,000 הכנסה שנתית ממוצעת ליחידה. מחירי קרקע: PHP 15,000-40,000 למ"ר. טופ 1% מכל יעדי ה-Airbnb בארץ.

למה דווקא סיארגאו:

זו בירת הגלישה של הפיליפינים. Siargao Cup הוא תחרות בינלאומית שמושכת גולשים מכל העולם. אבל הגלישה היא רק נקודת הכניסה - מה שמחזיק את התפוסה ב-71% זה השילוב של חופים, טבע, אוכל ותרבות שגורמים לתיירים להישאר 5-7 לילות במקום 2-3.

מה שקורה עכשיו:

שדה התעופה בהרחבה. הטיסות מסבו ומנילה הולכות ומתרבות. עדיין אין רשתות מלונות גדולות - מה שאומר שהשוק עדיין פתוח ליזמים פרטיים.

ובואו נדבר על סיכונים, כי משקיע רציני צריך לדעת:

מרוחק: הגישה רק באוויר, אין מעבורת מהירה מסבו. טייפונים: האי בקצה המזרחי, חשוף יותר. שדה תעופה קטן: מגביל את הצמיחה עד שההרחבה תסתיים. תשתיות בסיסיות: חשמל, מים ואינטרנט לא ברמה של סבו או בוהול.

ההשוואה הנכונה: סיארגאו היום היא איפה שבורקאי הייתה לפני 15 שנה. שם גם קנו קרקע ב-PHP 15,000, והיום אותה קרקע שווה PHP 55,000-70,000.

השאלה היא לא "האם סיארגאו תצמח" אלא "מתי". והתשובה, בהתחשב בנתוני התפוסה של 71%, היא שזה כבר קורה.

למשקיע שמחפש סיכון גבוה יותר עם פוטנציאל תשואה גבוה יותר, סיארגאו שווה בדיקה. למשקיע שמחפש מודל מוכח עם תשתיות קיימות, בוהול ופנגלאו נמצאות שלב אחד קדימה.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865

שלוש אפשרויות בעלות חוקיות: Deed of Assignment, חכירה 25+25, תאגיד מקומי.`,
    englishCopy: `Siargao: #1 in Airbnb Yield Across the Philippines

There is one island in the Philippines generating the highest Airbnb returns in the entire country. It is not in Manila, not in Cebu, and not in Boracay. It sits on the far eastern edge, and its name is Siargao.

The numbers:

71% annual occupancy - the highest in the Philippines. PHP 640,000 average annual revenue per unit. Land prices: PHP 15,000-40,000 per sqm. Top 1% of all Airbnb destinations nationally.

Why Siargao:

It is the surfing capital of the Philippines. The Siargao Cup is an international competition drawing surfers worldwide. But surfing is only the entry point. What maintains 71% occupancy is the combination of beaches, nature, food, and culture that keeps tourists staying 5-7 nights instead of 2-3.

What is happening now:

The airport is expanding. Flights from Cebu and Manila are increasing. No major hotel chains have entered yet, meaning the market remains open to private investors.

The risks, because a serious investor needs to know:

Remote: access by air only, no fast ferry from Cebu. Typhoons: the island sits on the eastern edge, more exposed. Small airport: limits growth until expansion completes. Basic infrastructure: electricity, water, and internet are not at Cebu or Bohol standards.

The right comparison: Siargao today is where Boracay was 15 years ago. Land there was also purchased at PHP 15,000, and today that same land is worth PHP 55,000-70,000.

The question is not "will Siargao grow" but "when." Given 71% occupancy data, it is already happening.

For investors seeking higher risk with higher return potential, Siargao is worth examining. For investors seeking a proven model with existing infrastructure, Bohol and Panglao are one step ahead.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/04_panglao_aerial.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 25,
    title: "קלארק - שדה התעופה החדש שמשנה את מפת הנדל\"ן",
    titleEn: "Clark Airport Reshaping Property",
    category: "SHOWCASE",
    scheduled: "2026-07-08",
    status: "ready",
    hebrewCopy: `קלארק - שדה התעופה החדש שמשנה את מפת הנדל"ן

יש כלל אחד שמשקיעי נדל"ן ברחבי העולם מכירים: כל שדה תעופה גדול יוצר בום נדל"ני ברדיוס של 30 ק"מ. ראינו את זה בדובאי, בבנגקוק, באיסטנבול. עכשיו זה קורה בקלארק, פיליפינים.

New Clark International Airport רשם צמיחה של 14% בתנועת הנוסעים. אבל שדה התעופה הוא רק חלק מהתמונה.

Clark Global City: 177 הקטאר של עיר חדשה מאפס. תוכננה כמרכז עסקי, מגורי ומסחרי. Filinvest ו-Megaworld כבר משקיעים. זה לא שכונה חדשה - זה BGR (מחוז עסקים חדש) בקנה מידה שלא ראינו בפיליפינים מאז BGC במנילה.

מחירי קרקע: PHP 50,000-120,000 למ"ר. לשם השוואה, BGC Taguig היום: PHP 500,000+ למ"ר. הפער הזה הוא ההזדמנות.

מה עושה את קלארק מיוחד:

Clark Freeport Zone: הטבות מס שלא קיימות בשום מקום אחר בפיליפינים. חברות שנרשמות באזור החופשי נהנות מתמריצי מס משמעותיים. UPS ו-FedEx כבר מרחיבים את הפעילות שם, מה שאומר שהלוגיסטיקה הבינלאומית רואה בקלארק את ה-hub הבא.

הבסיס לשעבר של חיל האוויר האמריקני מספק תשתית שלא צריך לבנות מאפס: כבישים, מערכות ניקוז, חיבורי חשמל ומים ברמה צבאית.

רכבת מהירה ממנילה: מתוכננת לקצר את הנסיעה לשעה וחצי. כשהיא תושלם, קלארק תהפוך ללוויין של מנילה - כמו שנתניה היא לוויין של תל אביב.

למשקיע ישראלי:

קלארק מציעה מודל שונה מבוהול. בוהול היא תיירות ונופש. קלארק היא תעשייה, לוגיסטיקה ומגורים עירוניים. שני המודלים עובדים, השאלה היא מה מתאים לפרופיל הסיכון שלכם.

בוהול: תשואות שכירות גבוהות (Airbnb), עליית ערך מונעת תיירות.
קלארק: עליית ערך מונעת תשתיות, תשואות שכירות יציבות (מגורים/מסחרי).

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865

שלוש אפשרויות בעלות חוקיות: Deed of Assignment, חכירה 25+25, תאגיד מקומי.`,
    englishCopy: `Clark: The New Airport Reshaping the Property Map

There is one rule real estate investors worldwide recognize: every major airport creates a property boom within a 30km radius. We saw it in Dubai, Bangkok, Istanbul. Now it is happening in Clark, Philippines.

New Clark International Airport recorded 14% growth in passenger traffic. But the airport is only part of the picture.

Clark Global City: 177 hectares of a new city from scratch. Planned as a business, residential, and commercial center. Filinvest and Megaworld are already investing. This is not a new neighborhood - it is a new CBD at a scale not seen in the Philippines since BGC in Manila.

Land prices: PHP 50,000-120,000 per sqm. For comparison, BGC Taguig today: PHP 500,000+ per sqm. That gap is the opportunity.

What makes Clark special:

Clark Freeport Zone: tax incentives that exist nowhere else in the Philippines. Companies registered in the free zone enjoy significant tax benefits. UPS and FedEx are already expanding operations there, signaling that international logistics sees Clark as the next hub.

The former US Air Force base provides infrastructure that does not need building from scratch: roads, drainage, military-grade power and water connections.

A high-speed rail from Manila is planned to reduce travel time to 1.5 hours. Once completed, Clark becomes a satellite of Manila.

For investors:

Clark offers a different model from Bohol. Bohol is tourism and leisure. Clark is industry, logistics, and urban residential. Both models work. The question is which fits your risk profile.

Bohol: high rental yields (Airbnb), tourism-driven appreciation.
Clark: infrastructure-driven appreciation, stable rental yields (residential/commercial).

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/07_bridge_infrastructure.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 26,
    title: "עלויות בנייה בפיליפינים - כמה עולה לבנות וילה",
    titleEn: "Construction Costs in Philippines",
    category: "SHOWCASE",
    scheduled: "2026-07-14",
    status: "ready",
    hebrewCopy: `עלויות בנייה בפיליפינים - כמה עולה לבנות וילה

אחת השאלות הכי נפוצות שאנחנו מקבלים: "כמה עולה לבנות בפיליפינים?" התשובה הקצרה: פחות בהרבה ממה שאתם חושבים.

הנתונים, לפי רמת גימור:

בנייה בסיסית: PHP 15,000-25,000 למ"ר. מתאים למבנים פשוטים, שכירות ארוכת טווח.

בנייה בינונית: PHP 25,000-50,000 למ"ר. גימור טוב, מטבח מלא, חדרי אמבטיה ברמה סבירה. מתאים ל-Airbnb סטנדרטי.

בנייה יוקרתית: PHP 50,000-100,000 למ"ר. שווה ערך ל-$830-$1,650 למ"ר. אבן טבעית, עץ טרופי, בריכה, נוף. זו הרמה שמייצרת תשואות Airbnb גבוהות.

עכשיו בואו נשווה לישראל:

בנייה בישראל: ILS 8,000-15,000 למ"ר ($2,200-$4,100). בנייה יוקרתית בפיליפינים: $830-$1,650 למ"ר. הפיליפינים זולות פי 5-6 מישראל באותה רמת גימור.

מה זה אומר בפועל:

אותה וילה שעולה ILS 5,000,000 לבנות בישראל (בלי קרקע), עולה ILS 800,000-1,500,000 בפיליפינים. ובפיליפינים, הוילה הזו מייצרת הכנסה מ-Airbnb.

עלויות עבודה: PHP 500-800 ליום לעובד בנייה מקצועי. זמן בנייה לוילה יוקרתית: 8-14 חודשים, תלוי בגודל ובמורכבות.

מי בונה:

הקבלנים הגדולים בפיליפינים: Ayala Land, Megaworld, SM Prime, Robinsons Land. לפרויקטים פרטיים, יש קבלנים מקומיים מנוסים עם ניסיון בבנייה לשוק הבינלאומי.

מה חשוב לדעת:

איכות הפיקוח קריטית. הפער בין קבלן טוב לקבלן גרוע בפיליפינים גדול יותר מאשר בישראל. לכן, עבודה עם חברת פיתוח שמנהלת את הבנייה מקצה לקצה היא בדרך כלל הדרך הבטוחה יותר.

חומרי בנייה מקומיים באיכות גבוהה: הפיליפינים מייצרות צמנט, פלדה, אריחים, ועץ טרופי ברמה גבוהה. חומרים מיובאים (מברזים איטלקיים, חלונות אירופיים) מעלים את העלות ב-20%-40%.

היתרי בנייה: תהליך שלוקח 2-4 חודשים בממוצע, תלוי ברשות המקומית.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865

שלוש אפשרויות בעלות חוקיות: Deed of Assignment, חכירה 25+25, תאגיד מקומי.`,
    englishCopy: `Construction Costs in the Philippines: How Much Does It Cost to Build a Villa

One of the most common questions we receive: "How much does it cost to build in the Philippines?" The short answer: far less than you think.

The data, by finish level:

Basic construction: PHP 15,000-25,000 per sqm. Suitable for simple structures, long-term rental.

Mid-range construction: PHP 25,000-50,000 per sqm. Good finishes, full kitchen, decent bathrooms. Suitable for standard Airbnb.

Luxury construction: PHP 50,000-100,000 per sqm. Equivalent to $830-$1,650 per sqm. Natural stone, tropical hardwood, pool, views. This is the level that generates high Airbnb returns.

Comparison to Israel:

Construction in Israel: ILS 8,000-15,000 per sqm ($2,200-$4,100). Luxury construction in the Philippines: $830-$1,650 per sqm. The Philippines is 5-6 times cheaper than Israel at the same finish level.

What this means in practice:

The same villa costing ILS 5,000,000 to build in Israel (excluding land) costs ILS 800,000-1,500,000 in the Philippines. And in the Philippines, that villa generates Airbnb income.

Labor costs: PHP 500-800 per day for a skilled construction worker. Build time for a luxury villa: 8-14 months, depending on size and complexity.

Who builds:

Major developers in the Philippines: Ayala Land, Megaworld, SM Prime, Robinsons Land. For private projects, experienced local contractors with international-standard building experience are available.

What matters:

Supervision quality is critical. The gap between a good contractor and a poor one in the Philippines is larger than in Israel. Working with a development company that manages construction end-to-end is typically the safer path.

High-quality local building materials: the Philippines produces cement, steel, tiles, and tropical hardwood at high standards. Imported materials (Italian fixtures, European windows) add 20%-40% to cost.

Building permits: a process taking 2-4 months on average, depending on the local authority.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/05_luxury_villa_pool.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 27,
    title: "הגשר של צרפת - P7.15 מיליארד שמשנים את פנגלאו",
    titleEn: "French-Funded Bridge Impact",
    category: "SHOWCASE",
    scheduled: "2026-07-22",
    status: "ready",
    hebrewCopy: `הגשר של צרפת - P7.15 מיליארד שמשנים את פנגלאו

כשצרפת משקיעה P7.15 מיליארד בגשר לאי קטן, הם עשו את החישובים. ממשלות לא בונות תשתיות בסכומים כאלה על סמך תחושת בטן.

Tagbilaran-Panglao Offshore Bridge: הפרויקט שמשנה את כל התמונה.

מה זה: גשר חדש בארבעה נתיבים שיחבר את טגבילרן (עיר הבירה של בוהול) לפנגלאו. הגשר הנוכחי: שני נתיבים, צר, צוואר בקבוק בשעות השיא. הגשר החדש: ארבעה נתיבים, מתוכנן לתנועה כפולה עד משולשת.

מימון: ממשלת צרפת, דרך AFD (Agence Francaise de Developpement). כשסוכנות פיתוח צרפתית מממנת פרויקט תשתיות בפיליפינים, זה סימן שהפרויקט עבר בדיקת כדאיות ברמה בינלאומית.

סטטוס: בבנייה.

מה זה אומר למשקיע:

יש לנו תקדים ברור: גשר CCLEX בסבו. נפתח ב-2022, חיבר את סבו למקטן בדרך חדשה. התוצאה: עליית ערכי נדל"ן של 30% באזורים שהגשר שירת. לא 30% בעשר שנים - 30% בתוך שנתיים-שלוש מהפתיחה.

תבנית זו חוזרת על עצמה בכל העולם. כל גשר חדש יוצר:

(1) מסדרון פיתוח חדש: קרקע שהייתה "מרוחקת מדי" הופכת לנגישה. הערך קופץ.

(2) זמני נסיעה קצרים יותר: זמן הנסיעה מטגבילרן לפנגלאו יקוצר, מה שהופך את פנגלאו לנגישה יותר לכל מי שנוחת בנמל או בעיר.

(3) פיתוח מסחרי לאורך הציר: חנויות, מסעדות, שירותים - כל מה שנבנה לאורך כביש חדש.

(4) עליית ערך קרקע בשני הצדדים: לא רק בפנגלאו, גם בטגבילרן.

הנקודה המרכזית: הגשר הנוכחי הוא צוואר בקבוק. הוא מגביל את הגדילה של פנגלאו. ברגע שהגשר החדש ייפתח, הפקק הזה ייפתח, והביקוש שנצבר ישתחרר.

מי שקונה לפני שהגשר נפתח, קונה לפני שהשוק מתמחר את ההשפעה. מי שמחכה, קונה אחרי שהמחירים כבר ספגו את ה-30%.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865

שלוש אפשרויות בעלות חוקיות: Deed of Assignment, חכירה 25+25, תאגיד מקומי.`,
    englishCopy: `The French Bridge: P7.15 Billion Changing Panglao

When France invests P7.15 billion in a bridge to a small island, they have run the numbers. Governments do not build infrastructure at this scale on intuition.

Tagbilaran-Panglao Offshore Bridge: the project changing the entire picture.

What it is: a new four-lane bridge connecting Tagbilaran (Bohol's capital) to Panglao. The current bridge: two lanes, narrow, a bottleneck during peak hours. The new bridge: four lanes, designed for double to triple the traffic volume.

Funding: the French government, through AFD (Agence Francaise de Developpement). When a French development agency funds an infrastructure project in the Philippines, it signals the project has passed international-level feasibility review.

Status: under construction.

What this means for investors:

There is a clear precedent: the CCLEX bridge in Cebu. Opened in 2022, it connected Cebu to Mactan via a new route. The result: a 30% increase in real estate values in the areas the bridge served. Not 30% over ten years - 30% within two to three years of opening.

This pattern repeats globally. Every new bridge creates:

(1) A new development corridor: land that was "too remote" becomes accessible. Values jump.

(2) Shorter travel times: travel time from Tagbilaran to Panglao will decrease, making Panglao more accessible to everyone arriving by port or city center.

(3) Commercial development along the axis: shops, restaurants, services, everything that builds along a new road.

(4) Land value increases on both sides: not only in Panglao, also in Tagbilaran.

The central point: the current bridge is a bottleneck. It limits Panglao's growth. The moment the new bridge opens, that constraint releases and pent-up demand flows through.

Those who buy before the bridge opens buy before the market prices in the impact. Those who wait buy after prices have already absorbed the 30%.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/07_bridge_infrastructure.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 28,
    title: "JW Marriott, Accor, Panglao Shores - P25 מיליארד בהשקעות מלונאיות",
    titleEn: "Luxury Hotel Wave",
    category: "SHOWCASE",
    scheduled: "2026-07-28",
    status: "ready",
    hebrewCopy: `JW Marriott, Accor, Panglao Shores - P25 מיליארד בהשקעות מלונאיות

יש דרך פשוטה לדעת אם אזור עומד לעבור שינוי מהותי בערכי הנדל"ן: תסתכלו לאן רשתות המלונות הגדולות בעולם הולכות.

בפנגלאו, הן הולכות הכל בבת אחת.

JW Marriott Panglao:

7 הקטאר. 80 חדרי מלון. 70 יחידות מגורים ממותגות (branded residences). שלבי פיתוח 2026-2028. מריוט היא אחת מ-3 רשתות המלונות הגדולות בעולם. הם לא משקיעים מאות מיליונים על סמך ניחוש. יש להם צוותי ניתוח שיושבים שנתיים על נתונים לפני שהם נכנסים לשוק.

Branded residences (יחידות ממותגות) הן סיפור בפני עצמו: נכסים שנושאים את המותג של מריוט, מנוהלים על ידי הרשת, ומקבלים פרמיית מחיר של 25%-50% מעל נכסים דומים ללא מיתוג. זה לא שיווק - זה נתון שחוזר על עצמו בכל שוק שבו branded residences נכנסו.

MGallery by Accor:

188 חדרים. המלון הראשון של רשת Accor בפיליפינים. כש-Accor בוחרים את הכניסה הראשונה שלהם למדינה של 115 מיליון איש, והם בוחרים פנגלאו ולא מנילה או סבו, זה אומר שהם רואים את פנגלאו כעתיד התיירות היוקרתית בפיליפינים.

Panglao Shores:

P25 מיליארד. 50-57.7 הקטאר. אזור כלכלי תיירותי (TEZ) באישור TIEZA. 6 מלונות ומעלה. מעל 1,000 יחידות. מרכז כנסים. קילומטר של קו חוף. 8,000-10,000 משרות עבודה.

זה לא פרויקט מלונאי. זו עיר נופש שלמה, בקנה מידה שלא ראינו בפיליפינים מחוץ לבורקאי.

מה זה אומר למשקיע פרטי:

כשרשתות בינלאומיות נכנסות, הן מביאות איתן: (1) תיירים עם כוח קנייה גבוה יותר, (2) תשתיות ברמה בינלאומית, (3) ביקוש לשירותים, מסעדות, ופעילויות סביב המלונות, (4) עליית ערך קרקע בכל האזור.

נכס שנמצא ברדיוס של 5-10 ק"מ ממלון JW Marriott לא יישאר באותו מחיר אחרי שהמלון ייפתח. זה לא תיאוריה - זה מה שקרה בכל מקום שמריוט נכנס אליו.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865

שלוש אפשרויות בעלות חוקיות: Deed of Assignment, חכירה 25+25, תאגיד מקומי.`,
    englishCopy: `JW Marriott, Accor, Panglao Shores: P25 Billion in Hotel Investments

There is a simple way to know if an area is about to undergo a fundamental shift in property values: look where the world's largest hotel chains are going.

In Panglao, they are all going at once.

JW Marriott Panglao:

7 hectares. 80 hotel rooms. 70 branded residences. Development phases 2026-2028. Marriott is one of the 3 largest hotel chains globally. They do not invest hundreds of millions on a hunch. Their analysis teams spend two years on data before entering a market.

Branded residences are a story of their own: properties carrying the Marriott brand, managed by the chain, commanding a 25%-50% price premium over comparable unbranded properties. This is not marketing - it is a figure that repeats in every market where branded residences have entered.

MGallery by Accor:

188 rooms. The first Accor hotel in the Philippines. When Accor chooses their first entry point in a country of 115 million people, and they choose Panglao over Manila or Cebu, it means they see Panglao as the future of luxury tourism in the Philippines.

Panglao Shores:

P25 billion. 50-57.7 hectares. Tourism Economic Zone (TEZ) approved by TIEZA. 6+ hotels. Over 1,000 units. Convention center. 1km of beachfront. 8,000-10,000 jobs.

This is not a hotel project. It is an entire resort city, at a scale not seen in the Philippines outside of Boracay.

What this means for private investors:

When international chains enter, they bring: (1) tourists with higher spending power, (2) international-standard infrastructure, (3) demand for services, restaurants, and activities surrounding the hotels, (4) land value appreciation across the entire area.

A property within a 5-10km radius of a JW Marriott will not remain at the same price after the hotel opens. This is not theory - it is what happened everywhere Marriott entered.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/06_jw_marriott_resort.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 29,
    title: "חיי היומיום בפנגלאו - עלויות, איכות חיים, ותרבות",
    titleEn: "Daily Life in Panglao",
    category: "SHOWCASE",
    scheduled: "2026-08-05",
    status: "ready",
    hebrewCopy: `חיי היומיום בפנגלאו - עלויות, איכות חיים, ותרבות

כשמדברים על השקעה בנדל"ן בחו"ל, רוב האנשים חושבים על מספרים: תשואה, מחירי קרקע, תיירים. אבל יש שאלה שלא מספיק משקיעים שואלים - איך באמת חיים שם? בואו נדבר על החיים בפנגלאו, בוהול.

עלות מחיה חודשית: PHP 50,000-80,000 (כ-3,200-5,100 ש"ח). זה כולל דירה, אוכל, תחבורה, בילויים, וחשבונות. לפי Numbeo, ישראל יקרה ב-259% מהפיליפינים. מה שעולה לכם על דירת 2 חדרים ברמת גן - מאפשר לכם לחיות כמו מלכים בפנגלאו.

אוכל ומסעדות: שוקי פירות ים טריים במחירים שלא תאמינו. ארוחת דגים טרייה ל-2 - PHP 400-600 (25-38 ש"ח). מסעדות בינלאומיות - איטלקיות, יפניות, קוריאניות - פזורות לאורך חוף אלונה ומעבר לו. הקהילה הבינלאומית הגדלה מביאה איתה מגוון קולינרי שלא היה קיים לפני 5 שנים.

בטיחות: בוהול נחשבת לאחת הפרובינציות הבטוחות ביותר בפיליפינים. שיעורי פשיעה נמוכים, קהילה מקומית חמה ומקבלת, ותחושת ביטחון שמרגישים ברחוב.

אקלים: 27-32 מעלות כל השנה. פנגלאו נמצאת באזור מופחת טייפונים - מוגנת יחסית בזכות מיקומה הגיאוגרפי. אין חורף, אין חימום, אין מעיל.

רפואה: המערכת הרפואית המקומית משתפרת, עם בתי חולים חדשים בטאגבילראן. לטיפולים מתקדמים, סבו נמצאת במרחק 20 דקות טיסה בלבד, עם בתי חולים ברמה בינלאומית.

אינטרנט וקישוריות: Starlink זמין ופועל. סיבים אופטיים בהרחבה. עובדים מרחוק? זה אפשרי ב-2025.

תחבורה: השכרת אופנוע - PHP 300 ליום (19 ש"ח). גראב (Grab) זמין. נהג פרטי לחודש שלם עולה פחות ממונית בתל אביב לשדה התעופה.

קהילה בינלאומית: הקהילה הזרה בפנגלאו גדלה בקצב מהיר. אירופאים, קוריאנים, אמריקאים, ועכשיו גם ישראלים. יש ספורט ימי, צלילות, גלישה, וחיי לילה נעימים בלי ההמולה של בליי או סבו סיטי.

השורה התחתונה: פנגלאו היא לא רק נכס להשקעה. היא אופציה לאיכות חיים שלא תמצאו במחיר הזה בשום מקום אחר. משקיעים חכמים קונים נכס שגם מייצר תשואה וגם נותן להם בסיס חיים אלטרנטיבי.

שאלות על החיים בפנגלאו? דברו איתנו:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    englishCopy: `Daily Life in Panglao - Costs, Quality of Life, and Culture

When people talk about overseas real estate investment, the focus is always on numbers: ROI, land prices, tourist arrivals. But there is a question not enough investors ask - what is daily life actually like there?

Monthly living costs in Panglao: PHP 50,000-80,000 (roughly $870-$1,400). That covers housing, food, transport, entertainment, and utilities. According to Numbeo, Israel is 259% more expensive than the Philippines. What you spend on a 2BR apartment in Ramat Gan lets you live like royalty in Panglao.

Food: Fresh seafood markets at prices that seem unreal. A fresh fish dinner for two costs PHP 400-600. International restaurants - Italian, Japanese, Korean - line Alona Beach and beyond. The growing expat community has brought culinary diversity that did not exist 5 years ago.

Safety: Bohol ranks among the safest provinces in the Philippines. Low crime rates, a warm and welcoming local community.

Climate: 27-32C year-round. Panglao sits in a reduced typhoon zone, geographically protected. No winter, no heating bills, no coats.

Healthcare: Local medical facilities are improving, with new hospitals in Tagbilaran. For advanced care, Cebu is a 20-minute flight away with internationally accredited hospitals.

Internet: Starlink is available and operational. Fiber is expanding. Remote work is fully viable in 2025.

Transport: Motorbike rental runs PHP 300/day ($5). Grab is available. A private driver for a full month costs less than a Tel Aviv airport taxi ride.

Community: The international expat community in Panglao is growing rapidly - Europeans, Koreans, Americans, and now Israelis. Water sports, diving, surfing, and relaxed nightlife without the chaos of Boracay or Cebu City.

The bottom line: Panglao is not just an investment asset. It is a quality-of-life option at a price point you will not find anywhere else.

Questions about living in Panglao? Talk to us:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/exterior/hero-aerial.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 30,
    title: "תיירות בבוהול - 1.43 מיליון תיירים ומי מהם ישכרו את הווילה שלכם",
    titleEn: "Tourism Breakdown - Who Rents Your Villa?",
    category: "SHOWCASE",
    scheduled: "2026-08-06",
    status: "ready",
    hebrewCopy: `תיירות בבוהול - 1.43 מיליון תיירים ומי מהם ישכרו את הווילה שלכם

בואו נדבר על המספר שמשנה את כל התמונה: 1,427,362 תיירים ביקרו בבוהול ב-2025. לא תחזית, לא הערכה - נתון רשמי. עכשיו השאלה החשובה: מי הם, ולמה זה רלוונטי למי שמחזיק וילה בפנגלאו?

פילוח התיירות:
- תיירות מקומית (פיליפינית): 59% - כ-841,000 מבקרים. פיליפינים אוהבים חופשות משפחתיות, חגים ארוכים, ואירועי חברה. הם מזמינים וילות שלמות, לא חדרים בודדים. קבוצה של 6-10 אנשים ששוכרים וילה ל-3-4 לילות - זה הדפוס הנפוץ.
- תיירות בינלאומית: 41% - כ-586,000 זרים. והנתון הקריטי: צמיחה של 14.75% משנה לשנה. זו לא סטגנציה, זה תאוצה.

השווקים המובילים בתיירות הבינלאומית:
קוריאה (טיסות ישירות מסאול ופוסאן דרך Jin Air, Jeju Air, Air Busan), סין (חזרה חזקה פוסט-קוביד), ארה"ב, טייוואן, ואירופה. הקוריאנים לבד מהווים נתח משמעותי, וטיסות ישירות חדשות ממשיכות להתווסף.

דפוסי ביקוש:
- שיא (דצמבר-מאי): תפוסה 80%+. חג המולד 2025: 62,240 תיירים ב-2 שבועות בלבד.
- כתף (יוני-נובמבר): תפוסה 40-50%. עדיין רווחי, ובדרך כלל מושלם לתחזוקה ושדרוגים.

הוצאה ממוצעת לתייר: PHP 16,900 לביקור. שהייה ממוצעת: 4 לילות. זה אומר שכל תייר שמגיע לבוהול מוציא כמעט 1,100 ש"ח.

למה זה חשוב למשקיע וילה?
כי השילוב של 59% מקומיים (יציבות, לא תלויים בטיסות בינלאומיות) ו-41% זרים (הוצאה גבוהה יותר, עונתיות שונה) יוצר תמהיל שמפחית סיכון. אתם לא תלויים בשוק אחד. כשקוריאנים לא באים, פיליפינים באים. כשזה עונת גשמים, מחירים נמוכים יותר אבל ביקוש פנימי עדיין קיים.

1.43 מיליון תיירים ב-2025. 586,000 זרים עם צמיחה של 14.75%. שדה תעופה שכבר עובד מעל הקיבולת. קווים אוויריים חדשים מתווספים. זה לא תיאוריה - זה תנועה אמיתית שמייצרת הכנסות אמיתיות.

רוצים לדעת כמה הוילות שלנו מייצרות מהתיירות הזו?
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    englishCopy: `Tourism in Bohol - 1.43 Million Tourists and Who Will Rent Your Villa

The number that changes the picture: 1,427,362 tourists visited Bohol in 2025. Not a forecast, not an estimate - an official figure. Now the important question: who are they, and why does this matter to villa owners in Panglao?

Tourism breakdown:
- Domestic (Filipino) tourists: 59%, approximately 841,000 visitors. Filipinos favor family vacations, long holiday weekends, and corporate events. They book entire villas, not single rooms. Groups of 6-10 renting a villa for 3-4 nights is the common pattern.
- International tourists: 41%, approximately 586,000 foreigners. The critical data point: growing at 14.75% year-over-year. This is acceleration, not stagnation.

Top international source markets: Korea (direct flights from Seoul and Busan via Jin Air, Jeju Air, Air Busan), China (strong post-COVID recovery), USA, Taiwan, and Europe. Koreans alone represent a significant share, with new direct routes still being added.

Demand patterns:
- Peak season (December-May): 80%+ occupancy. Christmas 2025: 62,240 tourists in just 2 weeks.
- Shoulder season (June-November): 40-50% occupancy. Still profitable, and typically ideal for maintenance and upgrades.

Average spend per visitor: PHP 16,900 per visit. Average stay: 4 nights.

Why this matters for villa investors: The mix of 59% domestic (stability, not dependent on international flights) and 41% foreign (higher spending, different seasonality) creates a risk-reducing blend. You are not dependent on a single market.

1.43 million tourists in 2025. 586,000 foreigners growing at 14.75%. An airport already operating over capacity. New airline routes being added. This is real traffic generating real revenue.

Want to know how much our villas earn from this tourism flow?
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/04_panglao_aerial.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 31,
    title: "הנמל בפנגלאו - 2.22 מיליון נוסעים דרך שדה תעופה שתוכנן ל-2 מיליון",
    titleEn: "Airport Over Capacity",
    category: "SHOWCASE",
    scheduled: "2026-08-12",
    status: "ready",
    hebrewCopy: `הנמל בפנגלאו - 2.22 מיליון נוסעים דרך שדה תעופה שתוכנן ל-2 מיליון

יש אינדיקטור אחד שמשקיעי נדל"ן מנוסים מחפשים לפני כל דבר אחר: קיבולת תחבורה. כששדה תעופה עובד מעל הקיבולת שלו, זה לא בעיה - זה אות קניה.

שדה התעופה הבינלאומי של בוהול-פנגלאו (TAG) תוכנן לקיבולת של 2 מיליון נוסעים בשנה. ב-2025, עברו דרכו 2.22 מיליון נוסעים. 111% מהקיבולת המתוכננת. הוא כבר בין 10 שדות התעופה העמוסים ביותר בפיליפינים.

מה פועל שם היום:
- 12 טיסות יומיות מ/אל מנילה, משך טיסה 1.25 שעות
- טיסות ישירות מקוריאה: Jin Air, Jeju Air, Air Busan
- טיסות מקומיות לסבו, קלארק, דאבאו
- קווים חדשים ליפן, סין, וטייוואן צפויים להתווסף

נתון ייחודי: זהו שדה התעופה האקולוגי הראשון בפיליפינים. אנרגיה סולארית, מערכת מיחזור מי גשמים, עיצוב ירוק. זה לא סתם פרט טכני - זה מאותת על רמת התכנון וההשקעה שנכנסה למקום הזה.

עכשיו המהלך הגדול: Aboitiz InfraCapital (אחת מקבוצות התשתיות הגדולות בפיליפינים) חתמה על חוזה PPP (שותפות ציבורית-פרטית) ל-30 שנה להרחבת שדה התעופה. היעד: קיבולת של 3.9 מיליון נוסעים עד 2030. כמעט כפול ממה שיש היום.

מה זה אומר בפועל? יותר נוסעים, יותר קווים, יותר תיירות, יותר ביקוש לשכירות קצרת-טווח. כשנמל התעופה מכפיל קיבולת, מחירי הנדל"ן סביבו עולים. זה לא תיאוריה - זה דפוס שחוזר על עצמו בכל מקום בעולם.

ההשוואה הפשוטה: בניתם מלון ליד שדה תעופה שתוכנן ל-2 מיליון ועובר 2.22 מיליון, כשהפתרון הוא הרחבה ל-3.9 מיליון. הנוסעים כבר כאן. ההרחבה בדרך. מחירי הנדל"ן עדיין לא הגיבו במלואם.

שדה תעופה ב-111% קיבולת = אות הקניה החזק ביותר בנדל"ן.

רוצים לראות את הוילות שלנו, 15 דקות משדה התעופה?
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    englishCopy: `Panglao Airport - 2.22 Million Passengers Through a Terminal Designed for 2 Million

There is one indicator experienced real estate investors look for before anything else: transport capacity. When an airport operates above its design capacity, that is not a problem - it is a buy signal.

Bohol-Panglao International Airport (TAG) was designed for 2 million passengers per year. In 2025, it processed 2.22 million passengers. That is 111% of designed capacity. It already ranks among the top 10 busiest airports in the Philippines.

Current operations:
- 12 daily flights to/from Manila, flight time 1.25 hours
- Direct flights from Korea: Jin Air, Jeju Air, Air Busan
- Domestic routes to Cebu, Clark, Davao
- New routes to Japan, China, and Taiwan expected to be added

A unique distinction: this is the first eco-airport in the Philippines. Solar power, rainwater harvesting, green design. This signals the level of planning and investment behind this location.

The major development: Aboitiz InfraCapital (one of the largest infrastructure groups in the Philippines) has signed a 30-year PPP (Public-Private Partnership) to expand the airport. Target capacity: 3.9 million passengers by 2030. Nearly double the current throughput.

What this means in practice: more passengers, more routes, more tourism, more demand for short-term rentals. When an airport doubles its capacity, surrounding real estate prices rise. This is not theory - it is a pattern that repeats in every market globally.

The simple comparison: you have an airport designed for 2 million, already serving 2.22 million, with expansion to 3.9 million underway. The passengers are already here. The expansion is coming. Real estate prices have not fully responded yet.

Airport at 111% capacity = the strongest buy signal in real estate.

Want to see our villas, 15 minutes from the airport?
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/07_bridge_infrastructure.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 32,
    title: "בורקאי vs פנגלאו - למה אנחנו בוחרים את פנגלאו",
    titleEn: "Boracay vs Panglao",
    category: "SHOWCASE",
    scheduled: "2026-08-13",
    status: "ready",
    hebrewCopy: `בורקאי vs פנגלאו - למה אנחנו בוחרים את פנגלאו

כל משקיע שמסתכל על נדל"ן תיירותי בפיליפינים שואל את אותה שאלה: למה לא בורקאי? הרי בורקאי היא המותג המוכר ביותר. אז בואו נשים את שתי האפשרויות על השולחן, מספרים מול מספרים.

מחירי קרקע:
- בורקאי: PHP 55,000-70,000 למ"ר
- פנגלאו: PHP 27,500-49,000 למ"ר
- הפרש: פנגלאו זולה ב-40-60% מבורקאי

תפוסה:
- בורקאי: 80%+ - מרשים, אבל זה שוק בוגר. הצמיחה השולית כבר מוגבלת.
- פנגלאו: במגמת עלייה חדה, עם תיירות בינלאומית שצומחת 14.75% בשנה.

סיכון רגולטורי:
ב-2018, הנשיא דוטרטה סגר את בורקאי ל-6 חודשים. סגירה מלאה. בתי מלון ריקים, הזמנות מבוטלות, משקיעים תקועים. הסיבה: פגיעה סביבתית חמורה. זה לא תיאוריה - זה קרה. ומי שמחזיק נכס בבורקאי חי עם הידיעה שזה יכול לקרות שוב.

שטח ופוטנציאל:
- בורקאי: 1,032 הקטארים בלבד. אין לאן לגדול. כל שטח זמין כבר מפותח או מוגן.
- פנגלאו: פרויקט Panglao Shores בשווי PHP 25 מיליארד (TEZ - אזור כלכלי תיירותי) בתכנון. Geopark של UNESCO מבטיח אקו-תיירות ברמה גבוהה. שטח להתרחבות קיים.

Airbnb:
שתי הנקודות חזקות ב-Airbnb. בורקאי עם מחירים גבוהים יותר ללילה, פנגלאו עם עלויות כניסה נמוכות בהרבה ותשואה יחסית גבוהה על ההשקעה.

השורה התחתונה:
בורקאי היא כמו דירה ברמת אביב. יקרה, יציבה, מוכחת - אבל הרווח הגדול כבר קרה. פנגלאו היא כמו שכונה חדשה שפתאום מקבלת רכבת קלה. המחירים עוד לא הגיבו לתשתיות שבדרך.

פנגלאו היא המקום שבו בורקאי הייתה לפני 10-15 שנים, בחלק קטן מהמחיר.

זה לא אומר שבורקאי גרועה. זה אומר שמי שמחפש תשואה על השקעה חדשה, לא שימור ערך של נכס קיים - פנגלאו היא הבחירה הלוגית.

שאלות? נדבר על הנתונים:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    englishCopy: `Boracay vs Panglao - Why We Choose Panglao

Every investor looking at Philippine tourism real estate asks the same question: why not Boracay? It is the most recognized brand in Philippine tourism. So let us put both options on the table, numbers against numbers.

Land prices:
- Boracay: PHP 55,000-70,000 per sqm
- Panglao: PHP 27,500-49,000 per sqm
- Difference: Panglao is 40-60% cheaper than Boracay

Occupancy:
- Boracay: 80%+ - impressive, but this is a mature market. Marginal growth is already limited.
- Panglao: On a sharp upward trend, with international tourism growing at 14.75% annually.

Regulatory risk:
In 2018, President Duterte shut down Boracay for 6 months. A complete closure. Empty hotels, cancelled bookings, stranded investors. The reason: severe environmental damage. This is not theory - it happened. Anyone holding property in Boracay lives with the knowledge it could happen again.

Area and potential:
- Boracay: only 1,032 hectares. No room to grow. Every available plot is already developed or protected.
- Panglao: The PHP 25 billion Panglao Shores project (TEZ - Tourism Enterprise Zone) is in planning. UNESCO Geopark status ensures high-quality eco-tourism. Room for expansion exists.

Airbnb:
Both locations perform well on Airbnb. Boracay commands higher nightly rates, but Panglao offers much lower entry costs and relatively higher ROI on investment.

The bottom line:
Boracay is like a premium apartment in an established neighborhood. Expensive, stable, proven - but the big gains already happened. Panglao is like a neighborhood that just got approved for a new transit line. Prices have not yet responded to the infrastructure on the way.

Panglao is where Boracay was 10-15 years ago, at a fraction of the price.

Questions? Let us talk about the data:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/04_panglao_aerial.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 33,
    title: "נדל\"ן בדאבאו - העיר הדרומית שצומחת ב-7.9%",
    titleEn: "Davao Growing 7.9%",
    category: "SHOWCASE",
    scheduled: "2026-08-19",
    status: "ready",
    hebrewCopy: `נדל"ן בדאבאו - העיר הדרומית שצומחת ב-7.9%

כשמדברים על נדל"ן בפיליפינים, רוב הישראלים חושבים מיד על מנילה, סבו, או בורקאי. אבל יש עיר שצומחת בשקט, בקצב שעוקף את כולם: דאבאו.

המספרים:
- צמיחת GDP: 7.9% - הגבוהה ביותר בפיליפינים
- תיירות: PHP 35 מיליארד בפעילות תיירותית
- גודל: העיר השלישית בגודלה בפיליפינים
- שדה תעופה: 4 מיליון+ נוסעים בשנה
- מחירי נדל"ן: 50% מתחת למנילה

דאבאו ידועה כעיר הבטוחה ביותר מבין הערים הגדולות בפיליפינים. סדר ציבורי מחמיר, רמת פשיעה נמוכה, ומנהיגות עירונית שמתמקדת בפיתוח ארוך-טווח. זה לא סתם תדמית - זו סביבה שמושכת משקיעים.

מה מניע את הצמיחה:
1. BPO (מיקור חוץ): חברות טכנולוגיה ושירותים פותחות משרדים בדאבאו. כוח אדם איכותי, עלויות נמוכות ממנילה, ואיכות חיים גבוהה לעובדים.
2. חקלאות ויצוא: דאבאו היא בירת הבננות והאננס של הפיליפינים. בסיס כלכלי מגוון שלא תלוי רק בתיירות.
3. השקעות יפניות וקוריאניות: קבוצות השקעה מיפן וקוריאה כבר פועלות באזור, בעיקר בתשתיות ובתעשייה.
4. גשר סאמאל (Samal Bridge): פרויקט תשתית מתוכנן שיחבר את דאבאו לאי סאמאל - אחד מיעדי התיירות העולים באזור. כשהגשר ייבנה, מחירי הנדל"ן בסאמאל צפויים לעלות משמעותית.

למה לא דאבאו בשבילנו (כרגע)?
אנחנו ב-Blue Everest מתמקדים בפנגלאו, ויש לזה סיבה: דאבאו היא סיפור של צמיחה עירונית, פנגלאו היא סיפור של תשואה על שכירות קצרת-טווח. שני המסלולים לגיטימיים, אבל הפרופיל שונה.

עם זאת, אם אתם מחפשים נדל"ן מסחרי או דירות להשכרה ארוכת-טווח, דאבאו שווה בדיקה. מחירים 50% מתחת למנילה, צמיחה של 7.9%, ובסיס כלכלי מגוון.

בזמן שכולם מסתכלים על מנילה וסבו, דאבאו בשקט הופכת למוקד הצמיחה הבא.

שאלות על נדל"ן בפיליפינים? בכל אזור? דברו איתנו:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    englishCopy: `Davao Real Estate - The Southern City Growing at 7.9%

When Israelis think about Philippine real estate, the first names are always Manila, Cebu, or Boracay. But there is a city growing quietly, at a pace that outstrips them all: Davao.

The numbers:
- GDP growth: 7.9% - the highest in the Philippines
- Tourism: PHP 35 billion in tourism activity
- Size: Third largest city in the Philippines
- Airport: 4 million+ passengers annually
- Real estate prices: 50% below Manila

Davao is recognized as the safest major city in the Philippines. Strict public order, low crime rates, and municipal leadership focused on long-term development. This is not branding - it is an environment that attracts investors.

What is driving the growth:
1. BPO (outsourcing): Technology and services companies are opening offices in Davao. Quality workforce, lower costs than Manila, high quality of life for employees.
2. Agriculture and exports: Davao is the banana and pineapple capital of the Philippines. A diversified economic base not dependent solely on tourism.
3. Japanese and Korean investment: Investment groups from Japan and Korea are already active in the region, primarily in infrastructure and industry.
4. Samal Bridge: A planned infrastructure project connecting Davao to Samal Island, one of the rising tourism destinations in the region. When built, Samal real estate prices are expected to rise significantly.

Why not Davao for us (for now)?
At Blue Everest, we focus on Panglao, and there is a reason: Davao is an urban growth story, Panglao is a short-term rental yield story. Both paths are legitimate, but the profiles differ.

That said, if you are looking for commercial real estate or long-term rental apartments, Davao is worth investigating. Prices 50% below Manila, 7.9% growth, and a diversified economic base.

While everyone watches Manila and Cebu, Davao quietly becomes the next growth center.

Questions about Philippine real estate? Any region? Talk to us:
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/07_bridge_infrastructure.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 34,
    title: "El Nido ופלאוון - הסיכון הגבוה עם הפוטנציאל הגבוה",
    titleEn: "El Nido & Palawan - High Risk, High Reward",
    category: "SHOWCASE",
    scheduled: "2026-08-20",
    status: "ready",
    hebrewCopy: `El Nido ופלאוון - הסיכון הגבוה עם הפוטנציאל הגבוה

יש מקומות שמשקיעים אוהבים לדבר עליהם בארוחות ערב: "יש לי קרקע באל נידו." זה נשמע מרשים. אבל בואו נסתכל על מה שבאמת קורה שם, בלי רגש ובלי הייפ.

מחירי קרקע: PHP 3,000-75,000 למ"ר. כן, קראתם נכון. טווח של פי 25 בין השטח הזול ביותר לשטח הכי מבוקש. זה אומר דבר אחד: השוק עדיין לא מתומחר. אין תשתית תמחור אחידה, אין שקיפות מלאה, ויש פערי מידע עצומים בין קונים מקומיים לזרים.

תשתיות - הבעיה המרכזית:
- אין שדה תעופה מסחרי. יש מסלול קטן (airstrip) שמשרת מטוסונים. כדי להגיע מ-El Nido למנילה בטיסה סדירה, צריך לטוס דרך Puerto Princesa - עוד 5-6 שעות נסיעה ביבשה.
- חשמל לא אמין. הפסקות חשמל שכיחות, במיוחד בעונת השיא.
- תשתיות מים, ביוב, וכבישים עדיין ברמה בסיסית באזורים רבים.

מה כן עובד:
- תיירות צומחת, בעיקר מאירופה וקוריאה. El Nido נחשב לאחד מ-10 היעדים היפים בעולם - שם עולמי חזק.
- UNESCO Underground River באזור פלאוון מושך מיליוני מבקרים.
- עניין משמעותי מצד משקיעים זרים, בעיקר ברכישת קרקע לפיתוח עתידי.
- הגבלות סביבתיות מחמירות (El Nido הוא אזור מוגן) שמונעות בנייה מסיבית ושומרות על ערך הנכס לטווח ארוך.

התחזית הריאלית:
כששדה תעופה מסחרי ייבנה באל נידו, מחירי הקרקע צפויים לעלות פי 3-5. זה לא שאלה של "אם" אלא של "מתי" - וה"מתי" הזה יכול להיות 5-10 שנים.

למי זה מתאים:
אם יש לכם הון פנוי שלא צריך לייצר תזרים מזומנים ב-3-5 השנים הקרובות, El Nido היא הימור פוטנציאלי מעניין. אם אתם צריכים תזרים עכשיו, תחפשו במקום אחר.

ההשוואה הישירה: פנגלאו כבר היום מייצרת PHP 395,000 בחודש מ-Airbnb. ל-El Nido אין את התשתית לייצר הכנסה יציבה ברמה הזו - עדיין.

הימור של 5-10 שנים. צריכים תזרים עכשיו? תסתכלו במקום אחר. יכולים לחכות? התשואות יכולות להיות יוצאות דופן.

שאלות על פלאוון, פנגלאו, או כל אזור אחר?
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    englishCopy: `El Nido and Palawan - The High Risk with the High Potential

Some places investors love to mention at dinner parties: "I own land in El Nido." It sounds impressive. But let us look at what is actually happening there, without emotion and without hype.

Land prices: PHP 3,000-75,000 per sqm. Yes, you read that correctly. A range of 25x between the cheapest and most sought-after plots. This means one thing: the market is not yet properly priced. There is no uniform pricing infrastructure, no full transparency, and massive information gaps between local and foreign buyers.

Infrastructure - the core problem:
- No commercial airport. There is a small airstrip serving prop planes. To fly from El Nido to Manila on a regular flight, you need to go through Puerto Princesa - another 5-6 hours by road.
- Unreliable electricity. Power outages are common, especially during peak season.
- Water, sewage, and road infrastructure remains basic in many areas.

What does work:
- Tourism is growing, primarily from Europe and Korea. El Nido ranks among the 10 most beautiful destinations in the world - a strong global brand.
- UNESCO Underground River in Palawan attracts millions of visitors.
- Significant interest from foreign investors, mainly in land acquisition for future development.
- Strict environmental restrictions (El Nido is a protected zone) prevent massive construction and preserve long-term property value.

The realistic forecast:
When a commercial airport is built in El Nido, land prices are expected to appreciate 3-5x. This is not a question of "if" but "when" - and that "when" could be 5-10 years.

Who this suits:
If you have capital that does not need to generate cash flow in the next 3-5 years, El Nido is an interesting potential bet. If you need cash flow now, look elsewhere.

The direct comparison: Panglao already generates PHP 395,000 per month from Airbnb today. El Nido does not have the infrastructure to generate stable income at that level - yet.

A 5-10 year bet. Need cash flow now? Look elsewhere. Can wait? The returns could be exceptional.

Questions about Palawan, Panglao, or any other region?
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/04_panglao_aerial.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 35,
    title: "5 פרויקטי תשתית שישנו את מחירי הנדל\"ן ב-2026-2030",
    titleEn: "5 Infrastructure Projects Moving Prices 2026-2030",
    category: "SHOWCASE",
    scheduled: "2026-08-24",
    status: "ready",
    hebrewCopy: `5 פרויקטי תשתית שישנו את מחירי הנדל"ן ב-2026-2030

בנדל"ן, כלל אחד חוזר על עצמו בכל שוק בעולם: קנו לפני התשתית, מכרו אחרי. גשר, שדה תעופה, רכבת, כביש - כשהם נבנים, מחירי הנכסים סביבם עולים. זה לא תיאוריה. יש לנו הוכחה טרייה מהפיליפינים עצמן: CCLEX (גשר סבו-קורדובה) הביא לעליית מחירים של 30% באזור קורדובה תוך שנתיים מהפתיחה.

עכשיו, 5 פרויקטים שהולכים לשנות את המפה:

1. שדה התעופה החדש של מנילה (בולאקאן)
תקציב: $15 מיליארד. קיבולת: 100 מיליון נוסעים. צפוי לפעול מ-2028. זה ייהפוך את NAIA העמוס מדי למשני, ויפתח את כל לוזון הצפונית לנגישות בינלאומית חדשה. מחירי קרקע בבולאקאן ובפמפנגה כבר מגיבים.

2. הרחבת שדה התעופה של בוהול-פנגלאו
קיבולת נוכחית: 2 מיליון (בפועל 2.22 מיליון ב-2025). יעד: 3.9 מיליון עד 2030. Aboitiz InfraCapital, חוזה PPP ל-30 שנה. קווים חדשים ליפן, סין, טייוואן צפויים. זה ישפיע ישירות על כל נכס בפנגלאו.

3. הרכבת התחתית של מטרו מנילה
36 ק"מ, 17 תחנות, צפויה ב-2029. הפרויקט הגדול ביותר בתחבורה ציבורית בפיליפינים. ישנה את דפוסי המגורים, העבודה, וההשקעה בכל מטרו מנילה. שכונות שהיום "רחוקות" יהפכו ל-15 דקות מהמרכז.

4. גשר טאגבילראן-פנגלאו
תקציב: PHP 7.15 מיליארד. מימון צרפתי. גשר חדש שיחבר את טאגבילראן (עיר הבירה של בוהול) לפנגלאו, ויחליף את הגשר הישן והצר הנוכחי. שיפור משמעותי בנגישות, בטיחות, וזמני נסיעה. ישפיע ישירות על ערך הנכסים בפנגלאו.

5. Panglao Shores - אזור כלכלי תיירותי
תקציב: PHP 25 מיליארד. TEZ (Tourism Enterprise Zone) שיכלול מלונות, מסחר, בידור, ושטחי מגורים. זה הפרויקט שיהפוך את פנגלאו מיעד תיירותי נחמד ליעד ברמה בינלאומית.

סך ההשקעות המשולבות: מעל $20 מיליארד. בכל אחד מהפרויקטים האלה, הדפוס זהה: מי שקונה לפני, נהנה מעליית הערך. מי שקונה אחרי, משלם פרמיה.

קנו לפני התשתית, מכרו אחרי. זה הכלל שעובד בכל מקום בעולם, והפיליפינים ב-2026-2030 הולכות לתת לו הוכחה נוספת.

רוצים לדבר על הנכסים שלנו בפנגלאו, לפני שהתשתיות משנות את המחירים?
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    englishCopy: `5 Infrastructure Projects That Will Move Real Estate Prices in 2026-2030

In real estate, one rule repeats across every market in the world: buy before infrastructure, sell after. A bridge, an airport, a railway, a highway - when they are built, surrounding property values rise. This is not theory. We have fresh proof from the Philippines itself: CCLEX (the Cebu-Cordova bridge) drove a 30% price increase in the Cordova area within two years of opening.

Now, 5 projects about to change the map:

1. New Manila Airport (Bulacan)
Budget: $15 billion. Capacity: 100 million passengers. Expected to operate from 2028. This will turn the overcrowded NAIA into a secondary facility and open all of northern Luzon to new international access. Land prices in Bulacan and Pampanga are already responding.

2. Bohol-Panglao Airport Expansion
Current capacity: 2 million (actual 2.22 million in 2025). Target: 3.9 million by 2030. Aboitiz InfraCapital, 30-year PPP contract. New routes to Japan, China, Taiwan expected. This will directly impact every property in Panglao.

3. Metro Manila Subway
36 km, 17 stations, expected by 2029. The largest public transport project in Philippine history. It will reshape living, working, and investment patterns across Metro Manila. Neighborhoods currently considered "far" will become 15 minutes from downtown.

4. Tagbilaran-Panglao Bridge
Budget: PHP 7.15 billion. French-funded. A new bridge connecting Tagbilaran (Bohol's capital city) to Panglao, replacing the current old and narrow bridge. Significant improvement in accessibility, safety, and travel times. Direct impact on Panglao property values.

5. Panglao Shores - Tourism Enterprise Zone
Budget: PHP 25 billion. A TEZ (Tourism Enterprise Zone) that will include hotels, commercial areas, entertainment, and residential zones. This is the project that will transform Panglao from a pleasant tourist destination into an internationally competitive one.

Combined investment: over $20 billion. In each of these projects, the pattern is identical: those who buy before benefit from appreciation. Those who buy after pay a premium.

Buy before infrastructure, sell after. This is the rule that works everywhere in the world, and the Philippines in 2026-2030 will provide another proof point.

Want to discuss our properties in Panglao, before infrastructure changes the prices?
WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/06_jw_marriott_resort.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 36,
    title: "שאלו אותי כל דבר - נדל\"ן בפיליפינים 🇵🇭",
    titleEn: "AMA - Ask Me Anything about PH Real Estate",
    category: "CONNECT",
    scheduled: "2026-06-04",
    status: "ready",
    hebrewCopy: `שאלות ותשובות: השקעות נדל"ן בפיליפינים

אנחנו מזמינים אתכם לשאול את השאלות החשובות לפני השקעה בנדל"ן בפיליפינים.

מה כדאי לבדוק?

• שלוש דרכי בעלות חוקיות לישראלים: Deed of Assignment, Leasehold 25+25, Domestic Corporation
• כיצד בוחנים תחזית תשואה של 17-25% בשנה
• מה חשוב לדעת על מיסוי, ניהול הנכס והבדלים בין אזורים
• אילו מסמכים ובדיקות נדרשים לפני קבלת החלטה

יש לכם שאלה על התהליך, על הסיכונים או על התאמת ההשקעה לפרופיל שלכם?

כתבו בתגובות או פנו אלינו ישירות:
WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Ask Me Anything - Real Estate in the Philippines 🇵🇭

We have been active in the Philippine real estate market for years.
Today we are opening the floor: ask us anything.

Legal structures? Taxes? Recommended areas? Realistic returns? Risks? Hidden costs?
No question is too basic and no question is too complex.

The Philippine real estate market is valued at $94.4 billion, with consistent year-over-year growth. But big numbers do not mean much without understanding what happens on the ground.

That is exactly why we are here.

What we can answer:
- Legal ownership structures (3 different paths for Israelis)
- Taxation in the Philippines and Israel, including the tax treaty
- Areas: Manila, Cebu, Bohol, Boracay, Davao
- Short-term and long-term rental yields
- Management, maintenance, and insurance costs
- Remote purchase process
- Money transfers from Israel to the Philippines
- Investor visas and immigration

Every answer is based on direct experience, not theory.

One good question can save you months of research.
Write in the comments, we answer everything.

📌 3 common questions we have already answered:

1) Can an Israeli own property in the Philippines?
Yes. There are 3 paths: Deed of Assignment, 25+25 year leasehold, or a Philippine Domestic Corporation. Each path suits a different investor profile.

2) What is the minimum investment?
You can start from PHP 5,000,000 (approximately ILS 250,000) for a condo in Cebu or land in developing areas.

3) Do I need to fly to the Philippines?
Not required. The KYC process is digital, signing is remote, and management is through a local property management company. You can close a deal without leaving Israel.

Have a question? Now is the time.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/exterior/rear-1.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 37,
    title: "סקר: מה מונע מכם להשקיע בנדל\"ן בפיליפינים? 🇵🇭",
    titleEn: "Poll - What Stops You from Investing?",
    category: "CONNECT",
    scheduled: "2026-06-11",
    status: "ready",
    hebrewCopy: `סקר: מה מונע מכם להשקיע בנדל"ן בפיליפינים? 🇵🇭

אנחנו רוצים לשמוע אתכם, לא רק לדבר אליכם.

הרבה ישראלים מתעניינים בנדל"ן בפיליפינים, קוראים, שואלים, משווים. אבל בין עניין לפעולה יש פער. אנחנו רוצים להבין מה עומד באמצע.

עובדה אחת שכדאי לדעת לפני שמצביעים: מס רווח הון בפיליפינים עומד על 6% בלבד, לעומת עד 25% בישראל. זה לא הכל, אבל זו נקודת התחלה שמשנה את החישוב.

בחרו את התשובה שהכי מתארת אתכם:

1️⃣ לא מבין את האפשרויות המשפטיות
הבעלות, הרישום, החוזים - לא ברור לי מה מותר ומה לא כשמדובר בזרים.

2️⃣ רחוק מדי, לא מכיר את השוק
פיליפינים נשמע רחוק, אין לי מושג מה קורה שם ביום יום.

3️⃣ סיכון מטבע מדאיג אותי
הפזו הפיליפיני, שער החליפין, תנודתיות - זה מרתיע.

4️⃣ כבר מושקע במקום אחר
יש לי נכסים ביוון, פורטוגל, דובאי, או בישראל ואני לא מחפש כרגע.

5️⃣ תקציב - מחפש נקודת כניסה נמוכה יותר
רוצה להשקיע אבל לא בטוח שיש לי מספיק הון לנכס בפיליפינים.

6️⃣ צריך עוד מידע ונתונים
לא שוללים, אבל רוצים לראות עוד מספרים, ניתוחים, תיקי עבודה.

7️⃣ שום דבר - מתכנן להשקיע
כבר בתהליך בדיקה או מוכן לפעול.

הצביעו בתגובות עם המספר שלכם (1-7).

אנחנו מתחייבים: הנושא שיקבל הכי הרבה קולות יקבל פוסט מפורט ומעמיק תוך 48 שעות. עם נתונים, מקורות, ותשובות ממשיות.

אם יש סיבה שלא ברשימה, כתבו אותה. כל תגובה עוזרת לנו להבין מה באמת חשוב לכם.

זה לא סקר שנעלם. זה כלי שעוזר לנו לתת לכם בדיוק את המידע שאתם צריכים.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Poll: What Stops You from Investing in Philippine Real Estate? 🇵🇭

We want to hear from you, not just talk at you.

Many Israelis are interested in Philippine real estate: reading, asking, comparing. But between interest and action there is a gap. We want to understand what stands in the middle.

One fact worth knowing before you vote: capital gains tax in the Philippines is only 6%, compared to up to 25% in Israel. That is not everything, but it is a starting point that changes the calculation.

Choose the answer that best describes you:

1️⃣ Do not understand the legal options
Ownership, registration, contracts - I am not clear on what is allowed for foreigners.

2️⃣ Too far, do not know the market
The Philippines sounds far away, I have no idea what happens there day to day.

3️⃣ Currency risk concerns me
The Philippine peso, exchange rate, volatility - it is discouraging.

4️⃣ Already invested elsewhere
I have properties in Greece, Portugal, Dubai, or Israel and I am not looking right now.

5️⃣ Budget - looking for a lower entry point
I want to invest but not sure I have enough capital for a property in the Philippines.

6️⃣ Need more data and information
Not ruling it out, but I want to see more numbers, analyses, case studies.

7️⃣ Nothing - planning to invest
Already in due diligence or ready to act.

Vote in comments with your number (1-7).

Our commitment: the topic that gets the most votes will receive a detailed, in-depth post within 48 hours. With data, sources, and real answers.

If there is a reason not on the list, write it. Every comment helps us understand what truly matters to you.

This is not a poll that disappears. It is a tool that helps us give you exactly the information you need.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/exterior/rear-1.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 38,
    title: "5 מיתוסים על נדל\"ן בפיליפינים שישראלים מאמינים בהם 🇵🇭",
    titleEn: "5 Myths Israelis Believe About PH Real Estate",
    category: "CONNECT",
    scheduled: "2026-06-18",
    status: "ready",
    hebrewCopy: `5 מיתוסים על נדל"ן בפיליפינים שישראלים מאמינים בהם 🇵🇭

בואו נדבר בגילוי לב. יש דברים שכמעט כל ישראלי שמתעניין בפיליפינים חושב שהוא יודע, אבל הם פשוט לא מדויקים. בדקנו, חקרנו, ופעלנו בשוק הזה בפועל. הנה מה שמצאנו.

מיתוס 1: "זרים לא יכולים להחזיק נכס בפיליפינים"
שקר.
יש 3 מסלולים חוקיים לבעלות: Deed of Assignment עם שותף מקומי, חכירה לטווח ארוך (Leasehold) ל-25+25 שנים (סה"כ 50 שנה), או הקמת חברה פיליפינית מקומית (Domestic Corporation) ב-60/40. כל מסלול מתועד, רשום, ומוכר בחוק הפיליפיני. עורכי דין מקומיים מלווים את התהליך מא' עד ת'.
מקור: Republic Act 7042, Foreign Investments Act

מיתוס 2: "רחוק מדי לנהל"
שקר.
חברות ניהול נכסים מקצועיות פועלות בכל אזורי התיירות: בוהול, סבו, בורקאי, מנילה. תהליך ה-KYC (הכרת הלקוח) דיגיטלי לחלוטין. חתימה על חוזים מרחוק. דוחות חודשיים ישירות לאימייל. ישראלים מנהלים נכסים בפיליפינים מתל אביב, ללא ביקור פיזי שנים.

מיתוס 3: "פיליפינים זה מסוכן"
שקר.
בוהול מדורגת כאחת הפרובינציות הבטוחות ביותר בפיליפינים. שיעור הפשיעה בפנגלאו נמוך משמעותית מערים גדולות. התיירות בבוהול צמחה ב-136.9% בין 2022 ל-2024, מה שמעיד על ביטחון תיירים ומשקיעים כאחד.
מקור: Philippine Statistics Authority, Bohol Provincial Government

מיתוס 4: "תשואות Airbnb טובות מדי מכדי להיות אמיתיות"
חלקית נכון.
נכסים בודדים בשיווק אגרסיבי מציגים מספרים גבוהים. אבל הממוצע הריאלי לנכס יוקרתי בפנגלאו עם ניהול מקצועי נע בין 8% ל-16% תשואה שנתית, תלוי בעונתיות, תפוסה, ורמת הנכס. זה עדיין גבוה משמעותית מרוב שוקי הנדל"ן, אבל זה לא 25% שמישהו הבטיח לכם בוואטסאפ.

מיתוס 5: "צריך לטוס לפיליפינים כדי לקנות"
שקר.
התהליך כולו אפשרי מישראל: KYC דיגיטלי, חתימה מרחוק, העברת כספים דרך Wise או בנק, ליווי משפטי בזום. מומלץ לבקר? כן. חובה? לא. עסקאות נסגרות מרחוק באופן שוטף.

עכשיו בכנות: באיזה מיתוס האמנתם?
כתבו בתגובות. אין בושה, כולנו התחלנו מאותו מקום.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `5 Myths Israelis Believe About Philippine Real Estate 🇵🇭

Let us be honest. There are things that almost every Israeli interested in the Philippines thinks they know, but they are simply not accurate. We researched, investigated, and operated in this market firsthand. Here is what we found.

Myth 1: "Foreigners cannot own property in the Philippines"
False.
There are 3 legal ownership paths: Deed of Assignment with a local partner, long-term Leasehold for 25+25 years (50 years total), or establishing a Philippine Domestic Corporation at 60/40. Each path is documented, registered, and recognized under Philippine law. Local attorneys guide the process from start to finish.
Source: Republic Act 7042, Foreign Investments Act

Myth 2: "Too far to manage"
False.
Professional property management companies operate in all tourist areas: Bohol, Cebu, Boracay, Manila. The KYC (Know Your Customer) process is fully digital. Contracts are signed remotely. Monthly reports go directly to your email. Israelis manage properties in the Philippines from Tel Aviv, without a physical visit for years.

Myth 3: "The Philippines is dangerous"
False.
Bohol is ranked among the safest provinces in the Philippines. The crime rate in Panglao is significantly lower than major cities. Tourism in Bohol grew by 136.9% between 2022 and 2024, indicating confidence from both tourists and investors.
Source: Philippine Statistics Authority, Bohol Provincial Government

Myth 4: "Airbnb returns are too good to be true"
Partially true.
Individual properties with aggressive marketing show high numbers. But the realistic average for a luxury property in Panglao with professional management ranges between 8% and 16% annual yield, depending on seasonality, occupancy, and property level. That is still significantly higher than most real estate markets, but it is not the 25% someone promised you on WhatsApp.

Myth 5: "You need to fly to the Philippines to buy"
False.
The entire process is possible from Israel: digital KYC, remote signing, money transfer via Wise or bank, legal guidance over Zoom. Recommended to visit? Yes. Required? No. Deals close remotely on a regular basis.

Now honestly: which myth did you believe?
Write in the comments. No shame, we all started from the same place.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/exterior/front-3.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 39,
    title: "שאלה לקהילה: מי כבר השקיע בנדל\"ן בדרום מזרח אסיה? 🌏",
    titleEn: "Who Has Invested in SE Asia?",
    category: "CONNECT",
    scheduled: "2026-06-25",
    status: "ready",
    hebrewCopy: `שאלה לקהילה: מי כבר השקיע בנדל"ן בדרום מזרח אסיה? 🌏

הקבוצה הזו מלאה באנשים שכבר עשו את הצעד, או שהם בדיוק באמצע תהליך חשיבה.

היום אנחנו רוצים לשמוע מכם ישירות.

תאילנד, באלי, וייטנאם, פיליפינים, קמבודיה, מלזיה - מי שכבר נכנס לשוק הנדל"ן באחת מהמדינות האלה, אנחנו רוצים לשמוע:

- באיזו מדינה ואזור השקעתם?
- מה עבד? תשואה, ניהול, תהליך רכישה.
- מה הפתיע אתכם? לטוב או לרע.
- מה הייתם עושים אחרת אם הייתם מתחילים מחדש?

הנתונים מדברים: מספר התיירים הישראלים שביקרו בפיליפינים הגיע ל-12,742 ב-2023, עם יעד של 35,000 עד 2026. זו לא רק תיירות - זה ביטוי לעניין הגובר בשוק הזה.

אבל מספרים זה דבר אחד. ניסיון אישי זה דבר אחר.

מי שרכש קונדו בבנגקוק, שמע על הניסיון שלכם.
מי שבנה וילה בבאלי, ספרו מה עבר עליכם.
מי שקנה קרקע בסיארגאו או בסבו, אנחנו רוצים לדעת.

ולמי שעדיין בשלב מחקר: זו ההזדמנות שלכם ללמוד מאנשים שכבר שם. לא מתיווך, לא ממאמרים - מאנשים אמיתיים עם ניסיון אמיתי.

כמה נקודות שכדאי לחשוב עליהן כשמשתפים:
- כמה שילמתם (טווח, לא סכום מדויק)
- תשואה שנתית בפועל
- תהליך משפטי - חלק או מורכב
- ניהול מרחוק - עובד או בעייתי
- האם הייתם חוזרים על ההשקעה

אנחנו לא טוענים ששוק אחד עדיף על אחר. כל שוק יש לו יתרונות וחסרונות. אבל הדרך הטובה ביותר ללמוד היא מניסיון של אחרים.

כל תגובה תורמת. גם אם זה שורה אחת.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Question for the Community: Who Has Already Invested in SE Asian Real Estate? 🌏

This group is full of people who have already taken the step, or who are right in the middle of thinking about it.

Today we want to hear directly from you.

Thailand, Bali, Vietnam, Philippines, Cambodia, Malaysia - anyone who has entered the real estate market in any of these countries, we want to hear:

- Which country and area did you invest in?
- What worked? Yield, management, purchase process.
- What surprised you? For better or worse.
- What would you do differently if starting over?

The data speaks: Israeli visitors to the Philippines reached 12,742 in 2023, with a target of 35,000 by 2026. This is not just tourism - it is an expression of growing interest in this market.

But numbers are one thing. Personal experience is another.

If you bought a condo in Bangkok, we want to hear about your experience.
If you built a villa in Bali, tell us what you went through.
If you purchased land in Siargao or Cebu, we want to know.

And for those still in the research phase: this is your opportunity to learn from people who are already there. Not from brokers, not from articles - from real people with real experience.

Some points worth considering when sharing:
- How much you paid (range, not exact amount)
- Actual annual yield
- Legal process - smooth or complicated
- Remote management - working or problematic
- Would you repeat the investment

We do not claim one market is better than another. Every market has its advantages and disadvantages. But the best way to learn is from others' experience.

Every comment contributes. Even if it is just one line.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/exterior/rear-1.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 40,
    title: "המחשבון: כמה שקלים צריך כדי להתחיל להשקיע בפיליפינים? 🇵🇭💰",
    titleEn: "How Many Shekels to Start Investing?",
    category: "CONNECT",
    scheduled: "2026-07-03",
    status: "ready",
    hebrewCopy: `המחשבון: כמה שקלים צריך כדי להתחיל להשקיע בפיליפינים? 🇵🇭💰

זו השאלה הנפוצה ביותר שאנחנו מקבלים.
היום אנחנו שוברים אותה לחלוטין, בשקלים, עם כל העלויות הנלוות.

הנה הטווחים לפי סוג נכס:

🔹 קרקע בפנים האי, בוהול
החל מ-15,000 ש"ח
קרקע חקלאית או מגרש באזורים פנימיים. מתאים למי שמחפש החזקה לטווח ארוך עם עלייה בערך הקרקע.

🔹 בית בפרובינציה
החל מ-250,000 ש"ח
בית פשוט באזור כפרי. לא נכס תיירותי, אבל מתאים למגורים או השכרה ארוכת טווח לשוק המקומי.

🔹 קונדו בסבו
החל מ-400,000 ש"ח
דירה בעיר השנייה בגודלה בפיליפינים. שוק שכירות יציב, קרבה לנמל תעופה בינלאומי, ביקוש קבוע מאקספטים ומקומיים.

🔹 וילת יוקרה בפנגלאו, בוהול
החל מ-1,300,000 ש"ח
נכס תיירותי ברמה גבוהה. תשואות שכירות לטווח קצר (Airbnb) בין 8% ל-16% שנתי. ניהול מקצועי, ביקוש גבוה בעונה.

🔹 נכס חוף בבורקאי
החל מ-2,500,000 ש"ח
הקטגוריה הגבוהה ביותר. נכסי פרימיום בעמדה ראשונה לים. תשואה ומחיר מקסימליים.

עכשיו, מה שרוב האנשים שוכחים - עלויות נלוות:

📋 עלויות עסקה: 13-15% מעל מחיר הנכס
כולל: מס העברה (Transfer Tax), מס בולים (Documentary Stamp Tax), רישום, שכר עורך דין, ודיו דיליג'נס.

📋 ניהול נכס: 15-25% מהכנסות השכירות
חברת ניהול מטפלת בתפוסה, אורחים, תחזוקה, ניקיון, ודיווח.

📋 ריהוט: PHP 500,000 עד PHP 2,000,000
תלוי ברמת הנכס. וילת יוקרה דורשת ריהוט ברמה של מלון. קונדו פחות.

חישוב מהיר לדוגמה:
וילה בפנגלאו ב-1,300,000 ש"ח + 15% עלויות עסקה (195,000 ש"ח) + ריהוט (כ-100,000 ש"ח) = כ-1,595,000 ש"ח הכל כלול.

עכשיו התור שלכם:
ספרו לנו בתגובות מה התקציב שלכם ואנחנו נגיד לכם מה ריאלי.
בלי לחץ, בלי התחייבות - רק תשובה ישרה.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `The Calculator: How Many Shekels to Start Investing in the Philippines? 🇵🇭💰

This is the most common question we receive.
Today we are breaking it down completely, in shekels, with all associated costs.

Here are the ranges by property type:

🔹 Interior land, Bohol
Starting from ILS 15,000
Agricultural land or plots in inland areas. Suitable for long-term hold with land value appreciation.

🔹 Provincial house
Starting from ILS 250,000
Simple house in a rural area. Not a tourism property, but suitable for living or long-term rental to the local market.

🔹 Cebu condo
Starting from ILS 400,000
Apartment in the second largest city in the Philippines. Stable rental market, proximity to international airport, consistent demand from expats and locals.

🔹 Luxury villa in Panglao, Bohol
Starting from ILS 1,300,000
High-end tourism property. Short-term rental yields (Airbnb) between 8% and 16% annually. Professional management, high seasonal demand.

🔹 Boracay beachfront property
Starting from ILS 2,500,000
The highest category. Premium properties in first-line ocean positions. Maximum yield and price.

Now, what most people forget - associated costs:

📋 Transaction costs: 13-15% on top of property price
Including: Transfer Tax, Documentary Stamp Tax, registration, attorney fees, and due diligence.

📋 Property management: 15-25% of rental income
Management company handles occupancy, guests, maintenance, cleaning, and reporting.

📋 Furniture: PHP 500,000 to PHP 2,000,000
Depends on property level. A luxury villa requires hotel-grade furnishing. A condo requires less.

Quick example calculation:
Panglao villa at ILS 1,300,000 + 15% transaction costs (ILS 195,000) + furniture (approximately ILS 100,000) = approximately ILS 1,595,000 all-in.

Now it is your turn:
Tell us your budget in the comments and we will tell you what is realistic.
No pressure, no commitment - just a straight answer.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/exterior/rear-1.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 41,
    title: "מה עדיף - דירה במרכז מנילה או וילה בפנגלאו? 🏙️🏝️",
    titleEn: "Manila Condo vs Panglao Villa",
    category: "CONNECT",
    scheduled: "2026-07-09",
    status: "ready",
    hebrewCopy: `מה עדיף - דירה במרכז מנילה או וילה בפנגלאו? 🏙️🏝️

זו שאלה שעולה כמעט בכל שיחה.
אין תשובה אחת נכונה, אבל יש הבדלים ברורים שכדאי להבין לפני שמחליטים.

📊 קונדו במנילה (BGC, Makati, Ortigas):

מחיר: PHP 5,000,000 עד PHP 15,000,000
תשואה: 4-6% שנתי, שכירות ארוכת טווח
ניהול: קל יחסית, שוק שכירות יציב של אקספטים, BPO, ועובדי תאגידים
נזילות: גבוהה - קל למכור ולהשכיר
סיכון: נמוך יחסית
עלייה בערך: מתונה, 3-5% שנתי
יתרון מרכזי: יציבות. הכנסה חודשית קבועה עם מעט תחזוקה.

📊 וילה בפנגלאו, בוהול:

מחיר: PHP 15,000,000 עד PHP 35,000,000
תשואה: 8-16% שנתי, שכירות לטווח קצר (Airbnb)
ניהול: דורש חברת ניהול מקצועית, תלוי בעונתיות
נזילות: נמוכה יותר - שוק קטן יותר, זמן מכירה ארוך יותר
סיכון: בינוני - תלוי בתפוסה ובעונה
עלייה בערך: גבוהה, 8-12% שנתי באזורי תיירות מתפתחים
יתרון מרכזי: תשואה. פוטנציאל הכנסה גבוה משמעותית, במיוחד בעונת השיא.

📊 השוואת סיכון:

קונדו מנילה: סיכון נמוך, תשואה נמוכה-בינונית. כמו אג"ח של נדל"ן.
וילה בפנגלאו: סיכון בינוני-גבוה, תשואה בינונית-גבוהה. כמו מניית צמיחה בנדל"ן.

📊 למי מתאים מה:

קונדו מנילה: משקיע שמחפש הכנסה פסיבית יציבה, לא רוצה לנהל באופן אקטיבי, מעדיף ביטחון על תשואה.
וילה בפנגלאו: משקיע שמוכן לניהול דרך חברה מקצועית, מחפש תשואה גבוהה, מבין שיש עונתיות ומוכן לתנודתיות.

📊 האם אפשר גם וגם?

כן. חלק מהמשקיעים מפזרים: קונדו במנילה להכנסה יציבה + נכס תיירותי בבוהול לתשואה גבוהה. הפיזור מקטין סיכון ומאזן תזרים.

עכשיו אנחנו רוצים לשמוע אתכם.
הצביעו בתגובות:

🏙️ מנילה - ולמה?
🏝️ פנגלאו - ולמה?
⚖️ גם וגם - ולמה?

כל תשובה מעניינת. אין תשובה לא נכונה.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `What is Better - A Condo in Central Manila or a Villa in Panglao? 🏙️🏝️

This question comes up in almost every conversation.
There is no single right answer, but there are clear differences worth understanding before deciding.

📊 Manila Condo (BGC, Makati, Ortigas):

Price: PHP 5,000,000 to PHP 15,000,000
Yield: 4-6% annually, long-term rental
Management: Relatively easy, stable rental market of expats, BPO, and corporate workers
Liquidity: High - easy to sell and rent
Risk: Relatively low
Appreciation: Moderate, 3-5% annually
Key advantage: Stability. Steady monthly income with little maintenance.

📊 Villa in Panglao, Bohol:

Price: PHP 15,000,000 to PHP 35,000,000
Yield: 8-16% annually, short-term rental (Airbnb)
Management: Requires professional management company, depends on seasonality
Liquidity: Lower - smaller market, longer selling time
Risk: Medium - depends on occupancy and season
Appreciation: High, 8-12% annually in developing tourism areas
Key advantage: Yield. Significantly higher income potential, especially during peak season.

📊 Risk Comparison:

Manila condo: Low risk, low-medium yield. Like a real estate bond.
Panglao villa: Medium-high risk, medium-high yield. Like a growth stock in real estate.

📊 Who suits what:

Manila condo: Investor seeking stable passive income, does not want to manage actively, prefers security over yield.
Panglao villa: Investor willing to manage through a professional company, seeking high yields, understands seasonality and accepts volatility.

📊 Can you do both?

Yes. Some investors diversify: Manila condo for stable income + tourism property in Bohol for high yield. Diversification reduces risk and balances cash flow.

Now we want to hear from you.
Vote in comments:

🏙️ Manila - and why?
🏝️ Panglao - and why?
⚖️ Both - and why?

Every answer is interesting. There is no wrong answer.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/exterior/hero-aerial.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 42,
    title: "Q&A: התשובות ל-10 השאלות הנפוצות ביותר על נדל\"ן בפיליפינים 🇵🇭",
    titleEn: "Top 10 FAQ - Philippine Real Estate",
    category: "CONNECT",
    scheduled: "2026-07-16",
    status: "ready",
    hebrewCopy: `Q&A: התשובות ל-10 השאלות הנפוצות ביותר על נדל"ן בפיליפינים 🇵🇭

ריכזנו את 10 השאלות שחוזרות שוב ושוב בקבוצה, בפרטי, ובשיחות.
הנה התשובות, קצר וממוקד, עם מספרים.

1️⃣ האם ישראלי יכול להחזיק נכס בפיליפינים?
כן. יש 3 מסלולים חוקיים: Deed of Assignment עם שותף מקומי, חכירה (Leasehold) ל-25+25 שנים, או הקמת חברה פיליפינית מקומית (Domestic Corporation) ב-60/40. כל מסלול מוסדר בחוק.

2️⃣ מה ההשקעה המינימלית?
אפשר להתחיל מ-PHP 5,000,000, שזה כ-250,000 ש"ח. קונדו בסבו או קרקע באזורים מתפתחים.

3️⃣ צריך לטוס לפיליפינים?
לא חובה. תהליך ה-KYC דיגיטלי לחלוטין, חתימה מרחוק, ליווי משפטי בזום. עסקאות נסגרות מישראל באופן שוטף. מומלץ לבקר, אבל זה לא תנאי.

4️⃣ מה המיסוי?
מס רווח הון: 6% בפיליפינים. בישראל, יש אמנת מס ישראל-פיליפינים (Israel-Philippines Tax Treaty) שמונעת כפל מס. מס הכנסה על שכירות: מדורג, 0-35% תלוי בסכום. עם תכנון מס נכון, הנטל נמוך משמעותית מהשקעה באירופה.

5️⃣ Airbnb חוקי בפיליפינים?
כן. אין חוק לאומי שאוסר שכירות לטווח קצר. רגולציה מקומית משתנה לפי אזור. בבוהול ובפנגלאו, Airbnb פעיל ומבוסס, עם אלפי רישומים פעילים.

6️⃣ איך מעבירים כסף מישראל?
Wise (לשעבר TransferWise) הוא הנפוץ ביותר - עמלות נמוכות, שער שוק. העברה בנקאית ישירה אפשרית גם כן. BDO, הבנק הגדול ביותר בפיליפינים, מקבל העברות בינלאומיות.

7️⃣ מה עם ויזה?
כניסה חופשית ל-30 יום ללא ויזה. הארכה עד 36 חודשים דרך משרד ההגירה. למשקיעים לטווח ארוך: SRRV (Special Resident Retiree's Visa) או SIRV (Special Investor's Resident Visa) עם הפקדה החל מ-$75,000.

8️⃣ בטוח?
בוהול מדורגת כאחת הפרובינציות הבטוחות ביותר בפיליפינים. פנגלאו הוא אי תיירותי קטן עם שיטור קהילתי. שיעור הפשיעה נמוך בהשוואה לערים הגדולות. התיירות צמחה ב-136.9% בשנתיים האחרונות - תיירים ומשקיעים מצביעים ברגליים.

9️⃣ מה עם טייפונים?
פיליפינים נמצאת באזור טייפונים, אבל בוהול ממוקמת באזור מוגן יחסית (Reduced Typhoon Zone). מבנים חדשים נבנים לפי תקן עמידות רוח ורעידות אדמה. ביטוח נכס זמין ומומלץ.

🔟 יש מימון?
BDO Bank מציע מימון לנכסי נדל"ן, כולל לקונים זרים בתנאים מסוימים. רוב המשקיעים הישראלים רוכשים במזומן. תנאי מימון: ריבית 7-9% שנתי, מקדמה 20-30%, תקופה עד 15 שנה.

שמרו את הפוסט הזה. 📌
תחזרו אליו כשתצטרכו תשובות.

ואם יש שאלה שלא ברשימה, כתבו בתגובות ונוסיף אותה.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Q&A: Answers to the 10 Most Common Questions About Philippine Real Estate 🇵🇭

We compiled the 10 questions that come up again and again in the group, in private messages, and in conversations.
Here are the answers, short and focused, with numbers.

1️⃣ Can an Israeli own property in the Philippines?
Yes. There are 3 legal paths: Deed of Assignment with a local partner, Leasehold for 25+25 years, or establishing a Philippine Domestic Corporation at 60/40. Each path is regulated by law.

2️⃣ What is the minimum investment?
You can start from PHP 5,000,000, which is approximately ILS 250,000. A condo in Cebu or land in developing areas.

3️⃣ Do I need to fly to the Philippines?
Not required. The KYC process is fully digital, signing is remote, legal guidance over Zoom. Deals close from Israel regularly. Visiting is recommended but not a condition.

4️⃣ What about taxes?
Capital gains tax: 6% in the Philippines. In Israel, the Israel-Philippines Tax Treaty prevents double taxation. Income tax on rent: graduated, 0-35% depending on amount. With proper tax planning, the burden is significantly lower than investing in Europe.

5️⃣ Is Airbnb legal in the Philippines?
Yes. There is no national law prohibiting short-term rentals. Local regulation varies by area. In Bohol and Panglao, Airbnb is active and established, with thousands of active listings.

6️⃣ How do I transfer money from Israel?
Wise (formerly TransferWise) is the most common - low fees, market rate. Direct bank transfer is also possible. BDO, the largest bank in the Philippines, accepts international transfers.

7️⃣ What about a visa?
Free entry for 30 days without a visa. Extension up to 36 months through the immigration office. For long-term investors: SRRV (Special Resident Retiree's Visa) or SIRV (Special Investor's Resident Visa) with a deposit starting from $75,000.

8️⃣ Is it safe?
Bohol is ranked among the safest provinces in the Philippines. Panglao is a small tourism island with community policing. Crime rate is low compared to major cities. Tourism grew 136.9% in the past two years - tourists and investors vote with their feet.

9️⃣ What about typhoons?
The Philippines is in a typhoon zone, but Bohol is located in a relatively protected area (Reduced Typhoon Zone). New structures are built to wind and earthquake resistance standards. Property insurance is available and recommended.

🔟 Is financing available?
BDO Bank offers financing for real estate properties, including for foreign buyers under certain conditions. Most Israeli investors purchase with cash. Financing terms: 7-9% annual interest, 20-30% down payment, term up to 15 years.

Bookmark this post. 📌
Come back to it when you need answers.

And if there is a question not on the list, write it in the comments and we will add it.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/exterior/front-3.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 43,
    title: "דיון: האם 2026 הוא הזמן הנכון להיכנס לשוק הפיליפיני?",
    titleEn: "Is 2026 the Right Time?",
    category: "CONNECT",
    scheduled: "2026-07-23",
    status: "ready",
    hebrewCopy: `דיון: האם 2026 הוא הזמן הנכון להיכנס לשוק הפיליפיני?

שאלה שעולה כמעט בכל שיחה. אז בואו נפרוש את הנתונים ונדון בזה בגלוי.

הצד השורי (Bull Case):

1. הפזו חלש היסטורית. שער של 1 ש"ח = 15.5-16 פזו הופך כל רכישה לזולה יותר ב-20-30% לעומת 2019. חלון כניסה נוח.

2. אנחנו לפני הגל, לא אחריו. רשתות JW Marriott ו-Accor MGallery בונות עכשיו בפנגלאו. כשהם יפתחו ב-2026-2028, מחירי הנדל"ן באזור צפויים לקפוץ 25-50%. מי שנכנס היום קונה במחירי טרום בום.

3. חוק חכירה 99 שנים. הפיליפינים אישרו הארכת חכירה ל-99 שנים לזרים, מה שנותן ביטחון משפטי שלא היה קיים לפני 3 שנים.

4. צמיחה כלכלית: 5.5-6.4% תוצר גולמי צפוי ל-2026. אחד השיעורים הגבוהים באסיאן.

5. תיירות שוברת שיאות: 1.43 מיליון תיירים הגיעו לבוהול ב-2024, עלייה של 136.9% לעומת 2022.

הצד הדובי (Bear Case):

1. סיכון מיתון עולמי. אם ארה"ב או אירופה נכנסות למיתון, התיירות יכולה להאט.

2. אינפלציה בפיליפינים הייתה 6-7% ב-2023. היא ירדה ל-3.5-4% ב-2025, אבל עדיין גבוהה מיעדי הבנק המרכזי.

3. מרחק גיאוגרפי. ניהול נכס מישראל דורש שותף מקומי אמין או חברת ניהול מקצועית.

4. אי ודאות רגולטורית. חקיקה יכולה להשתנות, גם אם המגמה חיובית.

הנתונים על השולחן. עכשיו התור שלכם.

מה הקריאה שלכם? שורי או דובי על הפיליפינים 2026?

מי שכבר משקיע שם, מה הניסיון בשטח? מי שבוחן, מה מעכב אתכם?

דיון פתוח. אין תשובות נכונות או לא נכונות, יש ניתוח.`,
    englishCopy: `Discussion: Is 2026 the right time to enter the Philippine market?

A question that comes up in almost every conversation. Let's lay out the data and discuss openly.

The Bull Case:

1. The Peso is historically weak. A rate of 1 ILS = 15.5-16 PHP makes every purchase 20-30% cheaper than in 2019. A comfortable entry window.

2. We are before the wave, not after it. JW Marriott and Accor MGallery are building in Panglao right now. When they open in 2026-2028, property prices in the area are expected to jump 25-50%. Those who enter today buy at pre-boom prices.

3. The 99-year lease law. The Philippines approved extending leases to 99 years for foreigners, providing legal security that didn't exist 3 years ago.

4. Economic growth: 5.5-6.4% GDP expected for 2026. One of the highest rates in ASEAN.

5. Tourism breaking records: 1.43 million tourists arrived in Bohol in 2024, an increase of 136.9% compared to 2022.

The Bear Case:

1. Global recession risk. If the US or Europe enters recession, tourism could slow.

2. Philippine inflation was 6-7% in 2023. It dropped to 3.5-4% in 2025, but remains above central bank targets.

3. Geographic distance. Managing property from Israel requires a reliable local partner or professional management company.

4. Regulatory uncertainty. Legislation can change, even if the trend is positive.

The data is on the table. Now it's your turn.

What's your read? Bull or bear on Philippines 2026?

Those already investing there - what's the experience on the ground? Those exploring - what's holding you back?

Open discussion. No right or wrong answers, just analysis.`,
    image: "/images/exterior/rear-1.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 44,
    title: "סיפור: איך נראה תהליך רכישת נכס בפיליפינים מישראל - שלב אחרי שלב",
    titleEn: "Purchase Process Step by Step from Israel",
    category: "CONNECT",
    scheduled: "2026-07-30",
    status: "ready",
    hebrewCopy: `סיפור: איך נראה תהליך רכישת נכס בפיליפינים מישראל - שלב אחרי שלב

אחד הדברים שמרתיעים משקיעים ישראלים מנדל"ן בפיליפינים הוא חוסר הבהירות. איך זה בכלל עובד? צריך לטוס? צריך עורך דין שם? כמה זמן לוקח?

אז הנה התהליך המלא, שלב אחרי שלב. 60-90 יום מהשיחה הראשונה ועד רישום הנכס.

שלב 1: שיחת ייעוץ ראשונית
וואטסאפ או זום, בעברית. סקירה של השוק, האזור, סוגי הנכסים, מבני בעלות. בלי מחויבות. 30-45 דקות.

שלב 2: בחירת נכס ובדיקת נתונים
מצגת מפורטת עם תמונות, מיקום, נתוני תשואה, תחזיות תפוסה. השוואה בין נכסים לפי פרמטרים מדידים.

שלב 3: מכתב כוונות (LOI) ומקדמת הזמנה
פורמלי אבל לא מחייב. מקדמה קטנה שמחזיקה את הנכס בזמן שמתקדמים בתהליך.

שלב 4: בחירת מבנה בעלות
3 אפשרויות: Deed of Assignment (הסבת זכויות), Leasehold 25+25 או 99 שנים (חכירה ארוכת טווח), או Domestic Corporation (חברה פיליפינית מקומית). כל אפשרות מתאימה לפרופיל שונה של משקיע.

שלב 5: בדיקת נאותות (Due Diligence)
אימות בעלות, בדיקת שעבודים, אישורי בנייה, רישום ב-Registry of Deeds. נעשה ע"י עורך דין פיליפיני מוסמך.

שלב 6: ניסוח חוזה
עורך דין פיליפיני מנסח את החוזה בהתאם למבנה שנבחר. ניתן לבקש חוות דעת מעורך דין ישראלי במקביל.

שלב 7: KYC דיגיטלי
תהליך הכר את הלקוח מתבצע דיגיטלית. דרכון, אישור כתובת, הצהרת מקור כספים.

שלב 8: חתימה על חוזה
דיגיטלית או באמצעות ייפוי כוח (POA). לא חייבים לטוס לפיליפינים לשם כך.

שלב 9: העברה בנקאית
העברה ישירה לחשבון נאמנות (Escrow) של עורך הדין. לא לחשבון פרטי, לעולם לא.

שלב 10: רישום ב-Registry of Deeds
עורך הדין משלים את הרישום הרשמי. תהליך של 2-4 שבועות.

שלב 11: מסירה והקמת ניהול
מסירת מפתחות (פיזית או מרחוק), חיבור לחברת ניהול, הגדרת Airbnb ופלטפורמות נוספות.

שלב 12: הכנסה ראשונה תוך 30-60 יום
מרגע המסירה, הנכס מתחיל לייצר הכנסה. 30-60 יום עד ההכנסה הראשונה מ-Airbnb.

זה כל התהליך. 12 שלבים, 60-90 יום, רוב התהליך מרחוק.

שאלות? כתבו בתגובות. דיברנו עם עשרות משקיעים ישראלים שעברו את זה, ונשמח לשתף עוד.`,
    englishCopy: `Story: What the purchase process looks like from Israel - step by step

One of the things that deters Israeli investors from Philippine real estate is lack of clarity. How does it actually work? Do you need to fly there? Need a lawyer there? How long does it take?

Here is the full process, step by step. 60-90 days from first call to property registration.

Step 1: Initial consultation call
WhatsApp or Zoom, in Hebrew. Market overview, area, property types, ownership structures. No commitment. 30-45 minutes.

Step 2: Property selection and data review
Detailed presentation with photos, location, yield data, occupancy projections. Property comparison by measurable parameters.

Step 3: Letter of Intent (LOI) and reservation deposit
Formal but non-binding. A small deposit that holds the property while the process advances.

Step 4: Ownership structure selection
3 options: Deed of Assignment (rights transfer), Leasehold 25+25 or 99 years (long-term lease), or Domestic Corporation (local Philippine company). Each option suits a different investor profile.

Step 5: Due diligence
Ownership verification, lien checks, building permits, Registry of Deeds confirmation. Performed by a licensed Philippine attorney.

Step 6: Contract drafting
A Philippine attorney drafts the contract according to the chosen structure. An Israeli attorney's opinion can be requested in parallel.

Step 7: Digital KYC
Know Your Customer process conducted digitally. Passport, address verification, source of funds declaration.

Step 8: Contract signing
Digital or via Power of Attorney (POA). No need to fly to the Philippines for this.

Step 9: Bank wire transfer
Direct transfer to the attorney's Escrow account. Never to a private account.

Step 10: Registry of Deeds registration
The attorney completes the official registration. A 2-4 week process.

Step 11: Handover and management setup
Key handover (physical or remote), connection to management company, Airbnb and other platform setup.

Step 12: First income within 30-60 days
From the moment of handover, the property starts generating income. 30-60 days until first Airbnb income.

That is the entire process. 12 steps, 60-90 days, most of the process done remotely.

Questions? Write in the comments. We have spoken with dozens of Israeli investors who went through this and are happy to share more.`,
    image: "/images/exterior/front-3.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 45,
    title: "דיון פתוח: מה הייתם רוצים שנכתוב עליו?",
    titleEn: "What Do You Want Us to Cover?",
    category: "CONNECT",
    scheduled: "2026-08-21",
    status: "ready",
    hebrewCopy: `דיון פתוח: מה הייתם רוצים שנכתוב עליו?

בשבועות האחרונים שיתפנו כאן ניתוחים מעמיקים על שוק הנדל"ן הפיליפיני. כיסינו יותר מ-10 תחומי השקעה, 3 מבני בעלות שונים, ומסגרות מיסוי של 6 מדינות.

דיברנו על תשואות, תפוסה, מיקומים, תהליכי רכישה, השוואות לשווקים אחרים, חקיקה, מיסוי, וניהול נכסים מרחוק.

עכשיו אנחנו רוצים לשמוע מכם.

מה השאלות שעדיין לא ענינו עליהן?

אולי יש תחום ספציפי שרציתם שנעמיק בו:

- ניהול נכסים בפרקטיקה: עלויות, בעיות, פתרונות?
- מיסוי ישראלי על הכנסות מחו"ל: איך מדווחים, מה מותר לקזז?
- ביטוח נכסים בפיליפינים: מה מכסה טייפון, רעידת אדמה?
- פיננסינג: אפשרויות מימון לזרים?
- יציאה (Exit): איך מוכרים נכס בפיליפינים, כמה זמן לוקח?
- שוק ההשכרות לטווח ארוך מול קצר?
- אזורים חדשים שעוד לא כיסינו?
- סוגיות ויזה ושהייה ארוכה?

או אולי יש נתון שהייתם רוצים לראות: סטטיסטיקה, השוואה, מודל כלכלי ספציפי?

הקהילה הזו היא מקום לשיתוף ידע, לא לשיווק חד כיווני. אנחנו כאן כדי לתת ערך, ואנחנו רוצים שהערך הזה יהיה רלוונטי לכם.

כתבו בתגובות:
1. מה הנושא שהכי מעניין אתכם?
2. מה השאלה שעדיין לא קיבלה תשובה?
3. איזה ניתוח הייתם רוצים לראות?

הפוסטים הבאים שלנו ייבנו על סמך התגובות שלכם.

תודה לכל מי שקורא, מגיב, ושואל. זה מה שהופך את הקהילה הזו למקום ייחודי.`,
    englishCopy: `Open discussion: What would you like us to write about?

In recent weeks we have shared in-depth analyses about the Philippine real estate market here. We have covered more than 10 investment areas, 3 different ownership structures, and tax frameworks across 6 countries.

We discussed yields, occupancy, locations, purchase processes, comparisons to other markets, legislation, taxation, and remote property management.

Now we want to hear from you.

What questions have we not yet answered?

Perhaps there is a specific area you wanted us to go deeper into:

- Property management in practice: costs, problems, solutions?
- Israeli taxation on foreign income: how to report, what can be deducted?
- Property insurance in the Philippines: what covers typhoon, earthquake?
- Financing: funding options for foreigners?
- Exit strategy: how to sell property in the Philippines, how long does it take?
- Short-term vs long-term rental market?
- New areas we haven't covered yet?
- Visa and long-term stay issues?

Or perhaps there is data you would like to see: statistics, comparisons, a specific economic model?

This community is a place for knowledge sharing, not one-way marketing. We are here to provide value, and we want that value to be relevant to you.

Write in the comments:
1. What topic interests you most?
2. What question still hasn't received an answer?
3. What analysis would you like to see?

Our next posts will be built based on your comments.

Thank you to everyone who reads, comments, and asks. That is what makes this community a unique place.`,
    image: "/images/exterior/rear-1.webp",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 46,
    title: "וילה בפנגלאו - המספרים שמאחורי ההשקעה שלנו",
    titleEn: "Our Villa Investment Numbers",
    category: "CONVERT",
    scheduled: "2026-06-26",
    status: "ready",
    hebrewCopy: `וילה בפנגלאו - המספרים שמאחורי ההשקעה שלנו

אנחנו לא הולכים לספר לכם מה לעשות. אנחנו הולכים להציג מספרים. אתם תחליטו.

הנכסים:

וילה D: 1,535,000 ש"ח
וילה C: 1,650,000 ש"ח

שטח: 263.78 מ"ר לכל וילה. 4 חדרי שינה, בריכה פרטית, ג'קוזי על הגג.

המיקום:

60 שניות הליכה מהחוף. בין JW Marriott (7 דונם, בבנייה) לבין Mithi Resort. במסדרון המלונאי הפרימיום של פנגלאו.

ההכנסה:

PHP 395,000 לחודש - מאומת ב-Airbnb (נתוני תפוסה ותמחור אמיתיים, לא תחזית).
תשואה שנתית: 17-25%.
תפוסה: 65%.
מחיר ממוצע ללילה (ADR): PHP 14,000.

הבעלות:

3 פתרונות משפטיים לבעלות זרה:
1. Deed of Assignment - הסבת זכויות מלאה.
2. Leasehold 25+25 או 99 שנים - חכירה ארוכת טווח רשומה.
3. Domestic Corporation - חברה פיליפינית עם שליטה מלאה של המשקיע.

כל מבנה נבדק ע"י עורכי דין פיליפינים מוסמכים ומותאם לפרופיל המשקיע.

ההזמנה:

מקדמת הזמנה: 9,999 ש"ח. מחזיקה את הנכס בזמן שלב הבדיקות.

מה לא כלול כאן:

לא כלולות עלויות ניהול (15-20%), מיסוי מקומי, ביטוח, ועלויות תחזוקה שוטפת. כל אלה מפורטים בחוברת ההשקעה המלאה.

אנחנו לא מנסים לשכנע אף אחד. המספרים מדברים בעד עצמם. מי שרוצה את התמונה המלאה - כולל נתוני תפוסה היסטוריים, השוואות לנכסים דומים באזור, ותחזיות לאחר פתיחת המלונות - מוזמן לפנות.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `A villa in Panglao - the numbers behind our investment

We are not going to tell you what to do. We are going to present numbers. You decide.

The properties:

Villa D: PHP 32,500,000
Villa C: PHP 35,000,000

Area: 263.78 sqm per villa. 4 bedrooms, private pool, rooftop jacuzzi.

The location:

60 seconds walk from the beach. Between JW Marriott (7 hectares, under construction) and Mithi Resort. In Panglao's premium hotel corridor.

The income:

PHP 395,000 per month - verified on Airbnb (real occupancy and pricing data, not a forecast).
Annual ROI: 17-25%.
Occupancy: 65%.
Average Daily Rate (ADR): PHP 14,000.

The ownership:

3 legal solutions for foreign ownership:
1. Deed of Assignment - full rights transfer.
2. Leasehold 25+25 or 99 years - registered long-term lease.
3. Domestic Corporation - Philippine company with full investor control.

Each structure is reviewed by licensed Philippine attorneys and tailored to the investor's profile.

The reservation:

Reservation deposit: PHP 200,000. Holds the property during the due diligence phase.

What is not included here:

Management costs (15-20%), local taxation, insurance, and ongoing maintenance costs are not included. All are detailed in the full investment brochure.

We are not trying to convince anyone. The numbers speak for themselves. Those who want the full picture - including historical occupancy data, comparisons to similar properties in the area, and post-hotel-opening projections - are welcome to reach out.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/05_luxury_villa_pool.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 47,
    title: "למה בחרנו פנגלאו ולא בורקאי או סיארגאו - הנתונים",
    titleEn: "Why We Chose Panglao - The Data",
    category: "CONVERT",
    scheduled: "2026-07-17",
    status: "ready",
    hebrewCopy: `למה בחרנו פנגלאו ולא בורקאי או סיארגאו - הנתונים

כשהתחלנו לחקור את שוק הנדל"ן הפיליפיני, בדקנו הכל. בורקאי, סיארגאו, סבו, פלאוואן, מנילה. כל יעד, כל אזור. בנינו מודל כלכלי, השוונו פרמטרים, בדקנו נתונים. המספרים הצביעו על פנגלאו.

הנה למה:

עלות כניסה:
פנגלאו: P27,500-49,000 למ"ר.
בורקאי: P55,000-70,000 למ"ר.
ההפרש: 40-60% זול יותר בפנגלאו. על אותו מוצר, אותה איכות חוף, אותו פרופיל תיירים.

השקעות מלונאיות נכנסות:
P25 מיליארד (כ-1.8 מיליארד ש"ח) בהשקעות מלונאיות מתוכננות ובבנייה. JW Marriott, Accor MGallery, Dusit Thani. כשרשתות בינלאומיות משקיעות מיליארדים, הן עשו את ה-Due Diligence שלהן. הן מהמרות על פנגלאו.

תיירות:
1.43 מיליון תיירים ב-2024. עלייה של 136.9% לעומת 2022. בוהול היא יעד UNESCO לאקו-תיירות, מה שמגביל בנייה המונית ושומר על ערכי הנכסים.

תשתיות:
שדה התעופה הבינלאומי מורחב. טיסות ישירות מסין, קוריאה, יפן. טיסה פנימית מנילה: 90 דקות.

הכנסה מאומתת:
PHP 395,000 לחודש. לא תחזית, לא "פוטנציאל", אלא נתוני Airbnb אמיתיים ומאומתים.

ולידציית הרשתות:
כשנכנס JW Marriott לשכונה, מחירי הנדל"ן באזור עולים 25-50% תוך 3-5 שנים. זה קרה בכל שוק שמריוט נכנסה אליו. פנגלאו הבאה בתור.

עשינו את המחקר. בנינו את המודל. המספרים הצביעו על פנגלאו.

הנכסים שלנו:
וילה D: 1,535,000 ש"ח
וילה C: 1,650,000 ש"ח
מקדמת הזמנה: 9,999 ש"ח

3 פתרונות בעלות משפטיים:
1. Deed of Assignment
2. Leasehold 25+25 או 99 שנים
3. Domestic Corporation

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Why we chose Panglao and not Boracay or Siargao - the data

When we started researching the Philippine real estate market, we examined everything. Boracay, Siargao, Cebu, Palawan, Manila. Every destination, every area. We built an economic model, compared parameters, checked the data. The numbers pointed to Panglao.

Here is why:

Entry cost:
Panglao: P27,500-49,000 per sqm.
Boracay: P55,000-70,000 per sqm.
The difference: 40-60% cheaper in Panglao. For the same product, same beach quality, same tourist profile.

Incoming hotel investments:
P25 billion (approximately 1.8 billion ILS) in planned and under-construction hotel investments. JW Marriott, Accor MGallery, Dusit Thani. When international chains invest billions, they have done their due diligence. They are betting on Panglao.

Tourism:
1.43 million tourists in 2024. An increase of 136.9% compared to 2022. Bohol is a UNESCO eco-tourism destination, which limits mass construction and preserves property values.

Infrastructure:
The international airport is being expanded. Direct flights from China, Korea, Japan. Domestic flight from Manila: 90 minutes.

Verified income:
PHP 395,000 per month. Not a forecast, not "potential" - real, verified Airbnb data.

Chain validation:
When JW Marriott enters a neighborhood, property prices in the area rise 25-50% within 3-5 years. This has happened in every market Marriott entered. Panglao is next in line.

We did the research. We built the model. The numbers pointed to Panglao.

Our properties:
Villa D: PHP 32,500,000
Villa C: PHP 35,000,000
Reservation deposit: PHP 200,000

3 legal ownership solutions:
1. Deed of Assignment
2. Leasehold 25+25 or 99 years
3. Domestic Corporation

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/05_luxury_villa_pool.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 48,
    title: "השכונה שלנו - JW Marriott, Accor MGallery, ופנגלאו פריים וילאס",
    titleEn: "Our Neighborhood",
    category: "CONVERT",
    scheduled: "2026-07-31",
    status: "ready",
    hebrewCopy: `השכונה שלנו - JW Marriott, Accor MGallery, ופנגלאו פריים וילאס

בנדל"ן, המיקום הוא הכל. אז בואו נדבר על השכונה.

JW Marriott Panglao:
7 דונם (הקטאר) של פיתוח ברמת יוקרה. בבנייה פעילה, צפוי לפתוח ב-2026-2028. JW Marriott הוא המותג הגבוה ביותר בקבוצת Marriott International. כשהם בוחרים מיקום, הם משקיעים מאות מיליוני פזו בלי להסס. הם עשו את כל הבדיקות. הם בטוחים שפנגלאו היא היעד הבא.

Accor MGallery:
188 חדרים, הראשון מסוגו בפיליפינים. MGallery הוא מותג בוטיק יוקרה של קבוצת Accor. העובדה שהם בחרו את פנגלאו לנכס הראשון שלהם בפיליפינים מדברת בעד עצמה.

ובאמצע: Panglao Prime Villas.

2 וילות נותרו במסדרון הזה. רק 2.

60 שניות הליכה מהחוף. 263.78 מ"ר. 4 חדרי שינה. בריכה פרטית. ג'קוזי על הגג.

מה המשמעות של שכנות למלונות ממותגים?

Branded Residences (נכסים ליד מלונות ממותגים) נמכרים בפרמיה של 25-50% על פני נכסים דומים ללא מותג. זה לא תיאוריה, זה נתון עולמי מתועד של Knight Frank ו-Savills.

הנקודה: הוילות שלנו לא ממותגות. הן לא נושאות את השם Marriott או Accor. ובדיוק בגלל זה הן מתומחרות מתחת לפרמיה. אתם מקבלים את אותה שכונה, אותו חוף, אותה תשתית תיירותית, במחיר של נכס לא ממותג.

וילה D: 1,535,000 ש"ח
וילה C: 1,650,000 ש"ח
מקדמת הזמנה: 9,999 ש"ח

הכנסה חודשית מאומתת: PHP 395,000.
תשואה שנתית: 17-25%.

3 פתרונות בעלות משפטיים:
1. Deed of Assignment - הסבת זכויות
2. Leasehold 25+25 או 99 שנים - חכירה ארוכת טווח
3. Domestic Corporation - חברה מקומית

כשהמלונות ייפתחו, המסדרון הזה ישתנה. המחירים של היום הם מחירי הכניסה.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `Our neighborhood - JW Marriott, Accor MGallery, and Panglao Prime Villas

In real estate, location is everything. So let us talk about the neighborhood.

JW Marriott Panglao:
7 hectares of luxury-grade development. Under active construction, expected to open 2026-2028. JW Marriott is the highest brand in the Marriott International group. When they choose a location, they invest hundreds of millions of Pesos without hesitation. They did all the checks. They are confident that Panglao is the next destination.

Accor MGallery:
188 rooms, the first of its kind in the Philippines. MGallery is a luxury boutique brand of the Accor group. The fact that they chose Panglao for their first Philippine property speaks for itself.

And in the middle: Panglao Prime Villas.

2 villas remaining in this corridor. Only 2.

60 seconds walk from the beach. 263.78 sqm. 4 bedrooms. Private pool. Rooftop jacuzzi.

What does proximity to branded hotels mean?

Branded Residences (properties near branded hotels) sell at a 25-50% premium over similar unbranded properties. This is not theory - it is a documented global data point from Knight Frank and Savills.

The point: our villas are not branded. They do not carry the Marriott or Accor name. And precisely because of that, they are priced below the premium. You get the same neighborhood, same beach, same tourism infrastructure, at the price of an unbranded property.

Villa D: PHP 32,500,000
Villa C: PHP 35,000,000
Reservation deposit: PHP 200,000

Verified monthly income: PHP 395,000.
Annual ROI: 17-25%.

3 legal ownership solutions:
1. Deed of Assignment - rights transfer
2. Leasehold 25+25 or 99 years - long-term lease
3. Domestic Corporation - local company

When the hotels open, this corridor will change. Today's prices are the entry prices.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/06_jw_marriott_resort.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 49,
    title: "65% תפוסה, PHP 395,000 לחודש - מה עושים עם ההכנסה",
    titleEn: "What Do You Do With the Income?",
    category: "CONVERT",
    scheduled: "2026-08-14",
    status: "ready",
    hebrewCopy: `65% תפוסה, PHP 395,000 לחודש - מה עושים עם ההכנסה

אחת השאלות שחוזרות: "בסדר, הוילה מרוויחה. אבל מה עושים עם הכסף בפועל?"

בואו נפרק את המספרים ואת האסטרטגיות.

הנתונים הבסיסיים:

הכנסה חודשית ברוטו: PHP 395,000.
הכנסה שנתית ברוטו: PHP 4,740,000 (כ-223,000 ש"ח).
תפוסה ממוצעת: 65%.
מחיר ממוצע ללילה (ADR): PHP 14,000.

3 אסטרטגיות ניהול:

אסטרטגיה 1: השכרה לטווח קצר מלאה (Full STR)
הוילה פועלת 12 חודשים ב-Airbnb, Booking, Agoda.
הכנסה מקסימלית. תפוסה 65% ממוצעת, עם שיאים של 85-90% בעונה הגבוהה (דצמבר-מאי).
מתאים למי שמחפש תשואה מקסימלית ולא מתכנן שימוש אישי.

אסטרטגיה 2: מודל היברידי (8 חודשי STR + 4 חודשים אישיים)
8 חודשים בהשכרה לטווח קצר, 4 חודשים לשימוש אישי או משפחתי.
הכנסה מוערכת: PHP 3.2-3.5 מיליון לשנה.
מתאים למי שרוצה גם תשואה וגם וילה לחופשות.

אסטרטגיה 3: השכרה לטווח ארוך (Long-term Lease)
חוזה שנתי עם שוכר קבוע. הכנסה נמוכה יותר (PHP 150,000-200,000 לחודש) אבל אפס ניהול.
מתאים למי שמעדיף פסיביות מוחלטת.

עלויות ניהול:

חברת ניהול מקצועית: 15-20% מההכנסה ברוטו.
כולל: שיווק בפלטפורמות, ניקיון, תחזוקה, צ'ק-אין/אאוט, דיווח חודשי.

הכנסה נטו (אסטרטגיה 1):
ברוטו: PHP 4,740,000
ניהול (20%): PHP 948,000-
תחזוקה ומיסוי מקומי: כ-PHP 100,000-
נטו: PHP 3,692,000 - PHP 4,000,000 לשנה (כ-174,000-188,000 ש"ח).

הנכסים:
וילה D: 1,535,000 ש"ח
וילה C: 1,650,000 ש"ח
מקדמת הזמנה: 9,999 ש"ח

3 פתרונות בעלות:
1. Deed of Assignment
2. Leasehold 25+25 או 99 שנים
3. Domestic Corporation

רוצים את המודל הכלכלי המלא? כולל תרחישי תפוסה שונים, השפעת עונתיות, ותחזית לאחר פתיחת Marriott ו-MGallery?

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`,
    englishCopy: `65% occupancy, PHP 395,000 per month - what do you do with the income

One of the recurring questions: "Fine, the villa earns. But what do you actually do with the money?"

Let us break down the numbers and strategies.

The baseline data:

Gross monthly income: PHP 395,000.
Gross annual income: PHP 4,740,000 (approximately 223,000 ILS).
Average occupancy: 65%.
Average Daily Rate (ADR): PHP 14,000.

3 management strategies:

Strategy 1: Full short-term rental (Full STR)
The villa operates 12 months on Airbnb, Booking, Agoda.
Maximum income. 65% average occupancy, with peaks of 85-90% in high season (December-May).
Suitable for those seeking maximum yield with no personal use planned.

Strategy 2: Hybrid model (8 months STR + 4 months personal)
8 months in short-term rental, 4 months for personal or family use.
Estimated income: PHP 3.2-3.5 million per year.
Suitable for those who want both yield and a villa for vacations.

Strategy 3: Long-term lease
Annual contract with a fixed tenant. Lower income (PHP 150,000-200,000 per month) but zero management.
Suitable for those who prefer absolute passivity.

Management costs:

Professional management company: 15-20% of gross income.
Includes: platform marketing, cleaning, maintenance, check-in/out, monthly reporting.

Net income (Strategy 1):
Gross: PHP 4,740,000
Management (20%): PHP 948,000-
Maintenance and local taxes: approximately PHP 100,000-
Net: PHP 3,692,000 - PHP 4,000,000 per year (approximately 174,000-188,000 ILS).

The properties:
Villa D: PHP 32,500,000
Villa C: PHP 35,000,000
Reservation deposit: PHP 200,000

3 ownership solutions:
1. Deed of Assignment
2. Leasehold 25+25 or 99 years
3. Domestic Corporation

Want the full economic model? Including different occupancy scenarios, seasonality impact, and post-Marriott and MGallery opening projections?

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    image: "/images/community-agent/05_luxury_villa_pool.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
  {
    id: 50,
    title: "2 וילות נותרו. השאלה היא לא אם, אלא מתי.",
    titleEn: "2 Villas Remaining - Closing Post",
    category: "CONVERT",
    scheduled: "2026-08-28",
    status: "ready",
    hebrewCopy: `2 וילות נותרו. השאלה היא לא אם, אלא מתי.

במשך חודשים שיתפנו כאן הכל. נתוני שוק, מסגרת משפטית, יתרונות מיסוי, תשתיות, ניתוחי אזור, השוואות ליעדים אחרים. לא ניסינו למכור. ניסינו לחנך.

הנה מה שכיסינו, בקצרה:

השוק: 1.43 מיליון תיירים הגיעו לבוהול ב-2024. צמיחת תיירות של 136.9%. תעשייה שוברת שיאים בכל רבעון.

התשתיות: P25 מיליארד בהשקעות מלונאיות. JW Marriott, Accor MGallery, Dusit Thani. שדה תעופה בינלאומי מורחב. טיסות ישירות מאסיה.

המסגרת המשפטית: חוק חכירה 99 שנים לזרים. 3 מבני בעלות מוכרים ובדוקים.

המיסוי: 6% מס רווחי הון. ללא מס ירושה על נכסים עד PHP 10 מיליון. אמנות מס עם ישראל.

הכלכלה: 5.5-6.4% צמיחת תוצר. פזו חלש היסטורית, חלון כניסה נוח.

ועכשיו, הנכסים עצמם:

וילה D: 1,535,000 ש"ח
263.78 מ"ר, 4 חדרי שינה, בריכה, ג'קוזי גג.

וילה C: 1,650,000 ש"ח
263.78 מ"ר, 4 חדרי שינה, בריכה, ג'קוזי גג.

הכנסה חודשית מאומתת: PHP 395,000 (Airbnb, נתוני תפוסה אמיתיים).
תשואה שנתית: 17-25%.
תפוסה: 65%.
60 שניות מהחוף.
מקדמת הזמנה: 9,999 ש"ח.

3 פתרונות בעלות משפטיים:
1. Deed of Assignment - הסבת זכויות מלאה.
2. Leasehold 25+25 או 99 שנים - חכירה ארוכת טווח רשומה.
3. Domestic Corporation - חברה פיליפינית בשליטת המשקיע.

לא ניסינו למכור. ניסינו לתת כלים לקבלת החלטה מושכלת.

49 פוסטים של נתונים, ניתוחים, ותשובות לשאלות. הכל פתוח, הכל מתועד, הכל ניתן לאימות.

2 וילות נותרו. מי שעשה את המחקר יודע למה. מי שצריך עוד מידע, אנחנו כאן.

האתר: primevilla.ph

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865

לא מכירה, לא לחץ. השאלה היא לא אם פנגלאו תצמח, היא תצמח. השאלה היא אם תהיו חלק מזה, ומתי.`,
    englishCopy: `2 villas remaining. The question is not if, but when.

For months we shared everything here. Market data, legal framework, tax advantages, infrastructure, area analyses, comparisons to other destinations. We did not try to sell. We tried to educate.

Here is what we covered, briefly:

The market: 1.43 million tourists arrived in Bohol in 2024. Tourism growth of 136.9%. An industry breaking records every quarter.

Infrastructure: P25 billion in hotel investments. JW Marriott, Accor MGallery, Dusit Thani. Expanded international airport. Direct flights from Asia.

Legal framework: 99-year lease law for foreigners. 3 recognized and tested ownership structures.

Taxation: 6% capital gains tax. No inheritance tax on properties up to PHP 10 million. Tax treaties with Israel.

Economy: 5.5-6.4% GDP growth. Historically weak Peso, a comfortable entry window.

And now, the properties themselves:

Villa D: PHP 32,500,000
263.78 sqm, 4 bedrooms, pool, rooftop jacuzzi.

Villa C: PHP 35,000,000
263.78 sqm, 4 bedrooms, pool, rooftop jacuzzi.

Verified monthly income: PHP 395,000 (Airbnb, real occupancy data).
Annual ROI: 17-25%.
Occupancy: 65%.
60 seconds from the beach.
Reservation deposit: PHP 200,000.

3 legal ownership solutions:
1. Deed of Assignment - full rights transfer.
2. Leasehold 25+25 or 99 years - registered long-term lease.
3. Domestic Corporation - Philippine company under investor control.

We did not try to sell. We tried to provide tools for making an informed decision.

49 posts of data, analyses, and answers to questions. Everything open, everything documented, everything verifiable.

2 villas remaining. Those who did the research know why. Those who need more information, we are here.

Website: primevilla.ph

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865

No selling, no pressure. The question is not whether Panglao will grow - it will grow. The question is whether you will be part of it, and when.`,
    image: "/images/community-agent/05_luxury_villa_pool.jpg",
    reactions: 0,
    comments: 0,
    shares: 0,
    notes: "",
  },
];

// Posts 3-50 were authored before the current Israeli-market rules.
// Keep them out of the executable queue until each copy unit passes Brand Guard.
export const COMMUNITY_POSTS: CommunityPost[] = COMMUNITY_POST_SOURCE.map((post) =>
  post.id >= 3 && post.id !== 36 && post.status === "ready"
    ? { ...post, status: "draft", notes: `${post.notes} BLOCKED: Requires Brand Guard revision.`.trim() }
    : post
);
