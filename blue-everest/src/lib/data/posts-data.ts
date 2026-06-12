import type { Post } from "./dashboard-types";

export const POSTS: Post[] = [
  // -- Israeli Market ---------------------------------------------

  {
    id: "META_IL_AWARENESS_A1",
    market: "IL",
    phase: "awareness",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed, IG Reels",
    language: "he",
    image: "/images/exterior/hero-aerial.webp",
    primaryText: `ישראלים כבר משקיעים בפנגלאו, פיליפינים.
אנחנו מלווים אותם - מהשקל הראשון עד המפתח.

נכסים שכבר מכרנו לישראלים.
לקוחות מרוצים. ליווי מלא בעברית.

הסיבה שהם בחרו דווקא פנגלאו:
PHP 32,500,000פחות מדירת 3 חדרים בתל אביב.
הכנסה: PHP 395,000 לחודש - מאומת מאירביאנבי.
תשואת שכירות ברוטו: כ-14.6% (לפני דמי ניהול).

3 מסלולים משפטיים לרוכשים ישראליים:
- Deed of Assignment: בעלות מלאה על המבנה
- Leasehold 25+25: שליטה מלאה 50 שנה
- תאגיד פיליפיני: ביטחון מקסימלי

נותרו 2 וילות בלבד.`,
    headlines: [
      "ישראלים משקיעים בפיליפינים. אנחנו מלווים.",
      "PHP 32.5M. תשואת שכירות ברוטו כ-14.6%.",
      "2 וילות נותרו. ליווי ישראלי מלא.",
    ],
    cta: "למידע נוסף",
    targeting: "Israel, 35-62, Hebrew, Real estate investment",
    budget: "$7/day",
    status: "ready",
    calendarDate: "2026-06-02",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
      { platform: "Meta Ads", target: "IL Audience", type: "paid", budget: "$7/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  {
    id: "META_IL_AWARENESS_A2",
    market: "IL",
    phase: "awareness",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed, IG Reels",
    language: "he",
    image: "/images/exterior/front-1.webp",
    primaryText: `שאלנו ישראלים שרכשו וילה בפנגלאו מה הם היו עושים אחרת.

כולם אמרו: "היינו קונים מוקדם יותר."

PHP 32,500,000.פחות ממחיר דירת 3 חדרים בתל אביב.

מה מקבלים:
וילה פרטית 3 קומות + גג
4 חדרים, כולם עם חדר רחצה
בריכה פרטית (15.08 מ"ר)
ג'קוזי על הגג עם נוף לים
מטבח חיצוני
60 שניות מהחוף
בין JW Marriott למלון Mithi 5 כוכבים

והכנסה: PHP 395,000 לחודש בממוצע.

3 מסלולים משפטיים לישראלים:
Deed of Assignment, Leasehold 25+25, תאגיד פיליפיני.
Blue Everest מלווה משקיעים ישראליים בפיליפינים.
ליווי משפטי מלא. עברית. מהתחלה עד הסוף.`,
    headlines: [
      "מה שישראלים היו עושים אחרת",
      "PHP 32.5M. וילה פרטית. PHP 395K לחודש.",
      'ליווי ישראלי לרוכשי נדל"ן בפיליפינים',
    ],
    cta: "הורד מדריך",
    targeting: "Israel, 35-62, Hebrew",
    budget: "$7/day",
    status: "ready",
    calendarDate: "2026-06-04",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
      { platform: "Meta Ads", target: "IL Audience", type: "paid", budget: "$7/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  {
    id: "META_IL_AWARENESS_A3",
    market: "IL",
    phase: "awareness",
    platform: "Meta (IG Reels)",
    placement: "Instagram Reels",
    language: "he",
    image: "/images/exterior/panglao-rear.webp",
    primaryText: `PHP 32.5M. פחות מדירה בת"א.
הכנסה: PHP 395,000 לחודש מאירביאנבי.
ליווי ישראלי מלא - מהתחלה עד מסירת מפתח.
3 מסלולים: Deed of Assignment, Leasehold 25+25, תאגיד.
נותרו 2 וילות בלבד.
לפרטים: primevilla.ph או WhatsApp +639542555553`,
    headlines: [
      "PHP 32.5M. וילה פרטית בפנגלאו.",
      "ישראלים כבר השקיעו. 2 וילות נותרו.",
      "תשואת שכירות ברוטו כ-14.6%. ליווי ישראלי.",
    ],
    cta: "למידע נוסף",
    targeting: "Israel, 35-62, Hebrew",
    budget: "$6/day",
    status: "ready",
    calendarDate: "2026-06-09",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
      { platform: "Meta Ads", target: "IL Audience", type: "paid", budget: "$6/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  {
    id: "META_IL_CONSIDERATION_C1",
    market: "IL",
    phase: "consideration",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed, Stories",
    language: "he",
    image: "/images/interior/gf-living-1.webp",
    primaryText: `לא רק קנייה. השקעה בהנאה.

וילה פרטית בבוהול, בין שתי תחנות 5 כוכבים. 4 חדרים. בריכה פרטית. ג'קוזי על הגג. 60 שניות לחוף.

PHP 32,500,000

בעלי דירה שלנו הרוויחו.
PHP 395,000 בחודש. כ-14.6% תשואת שכירות ברוטו.

יש לנו 2 יחידות בלבד.
מימון קיים. בדיקת השקעה חינם.`,
    headlines: [
      "השקעה זקופה בבוהול",
      "PHP 395,000 בחודש. וילה בחוף.",
      "2 יחידות בלבד. בוהול פרים.",
    ],
    cta: "בדיקת השקעה",
    targeting: "Israel, Tel Aviv area, 40-65, High income",
    budget: "$11/day",
    status: "ready",
    calendarDate: "2026-06-11",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
      { platform: "Meta Ads", target: "IL Audience", type: "paid", budget: "$11/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  {
    id: "META_IL_CONSIDERATION_C2",
    market: "IL",
    phase: "consideration",
    platform: "Meta (Stories)",
    placement: "IG Stories, FB Stories",
    language: "he",
    image: "/images/exterior/rear-1.webp",
    primaryText: `לא יום חופש. יום כסף.

PHP 32.5M.
PHP 395,000 בחודש. מאומת.

דיווח השקעה →`,
    headlines: ["וילה שמרוויחה"],
    cta: "בקשת דיווח",
    targeting: "Israel, 45-60, Luxury property interest",
    budget: "$7/day",
    status: "ready",
    calendarDate: "2026-06-16",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
      { platform: "Meta Ads", target: "IL Audience", type: "paid", budget: "$7/day" },
    ],
  },

  {
    id: "META_IL_CONVERSION_Conv1",
    market: "IL",
    phase: "conversion",
    platform: "Meta (FB Feed)",
    placement: "Facebook Feed",
    language: "he",
    image: "/images/exterior/aerial-1.webp",
    primaryText: `הזמן חלף. הן כמעט סגורות.

2 יחידות בלבד.
PHP 32.5M
PHP 395,000 בחודש. כ-14.6% תשואת שכירות ברוטו.

בעלים בישראל כבר השקיעו.
בדוק את השקעתך בחינם.

Schedule: primevilla.ph או WhatsApp`,
    headlines: [
      "זמן מוגבל. 2 יחידות בלבד",
      "החלטה היום. הרווח מחר",
      "PHP 32.5M. ללא סיבוך",
    ],
    cta: "שריין מקום",
    targeting: "Website visitors (180d), Engagement audiences",
    budget: "$15/day",
    status: "ready",
    calendarDate: "2026-06-18",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
      { platform: "Meta Ads", target: "IL Audience", type: "paid", budget: "$15/day" },
    ],
  },

  // -- Philippine Market ------------------------------------------

  {
    id: "META_PH_AWARENESS_1A",
    market: "PH",
    phase: "awareness",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed, IG Reels",
    language: "en",
    image: "/images/exterior/hero-aerial.webp",
    primaryText: `Every time you book a villa in Bohol, you're making someone else rich.

What if that someone was you?

Panglao Prime Villas: 2 remaining luxury villas between JW Marriott and Mithi Resort.

Private pool. 4 bedrooms. Rooftop jacuzzi with full sea view.
60 seconds to Panglao Beach.

Your guests pay PHP 14,000 per night.
You collect PHP 395,000 every month.

From PHP 32,500,000. Reserve with PHP 200,000.
Financing options available for qualified buyers.`,
    headlines: [
      "Stop Renting. Start Owning.",
      "PHP 395K/Month. Your Panglao Villa.",
      "2 Luxury Villas Left in Panglao",
      "Maging May-ari, Hindi Bisita",
    ],
    cta: "Learn More",
    targeting: "Manila (BGC, Makati), Cebu, Davao, 38-58",
    budget: "$9/day",
    status: "ready",
    calendarDate: "2026-06-03",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Philippines", type: "free" },
      { platform: "Meta Ads", target: "PH Audience", type: "paid", budget: "$9/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  {
    id: "META_PH_AWARENESS_1B",
    market: "PH",
    phase: "awareness",
    platform: "Meta (IG Reels)",
    placement: "Instagram Reels",
    language: "tl",
    image: "/images/exterior/front-2.webp",
    primaryText: `Ngayon na ang tamang oras para mag-invest sa Panglao.
Tourism grew 166% since 2022. 1.43M visitors in 2025. Airport expanding to 4M passengers by 2030.
PHP 395,000/buwan average Airbnb income.
14.6% gross rental yield at 65% occupancy (market average: 49%).
2 villas na lang ang natitira.
Financing available para sa qualified buyers.
Link sa bio o WhatsApp namin: +639542555553`,
    headlines: [
      "PHP 395K/Buwan. Panglao Villa.",
      "2 Villas Na Lang. Mag-invest Na.",
      "Kumita Habang Wala Ka. Panglao Prime Villas.",
    ],
    cta: "Learn More",
    targeting: "Manila, Cebu, Davao, 35-58",
    budget: "$6/day",
    status: "ready",
    calendarDate: "2026-06-05",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Philippines", type: "free" },
      { platform: "Meta Ads", target: "PH Audience", type: "paid", budget: "$6/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  {
    id: "META_PH_CONSIDERATION_C1",
    market: "PH",
    phase: "consideration",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed",
    language: "tl",
    image: "/images/interior/gf-kitchen-1.webp",
    primaryText: `Sarili mong Airbnb, sarili mong kumita.

PHP 32,500,000 lang magsimula.
PHP 395,000 bawat buwan.

Dalawang malinaw na tagumpay na itinayo na ng Blue Everest.
Walang risk. May guarantee.

Investors mula BGC hanggang Makati - kumikita na ngayon.

Reserve ng PHP 200,000.`,
    headlines: [
      "Kumita Habang Natutulog",
      "PHP 395K/Buwan. Panglao Investment.",
      "Sarili Mong Airbnb Negosyo",
    ],
    cta: "Schedule Site Visit",
    targeting: "BGC, Makati, Cebu, Davao, 35-58, PHP 5M+ liquid",
    budget: "$12/day",
    status: "ready",
    calendarDate: "2026-06-10",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Philippines", type: "free" },
      { platform: "Meta Ads", target: "PH Audience", type: "paid", budget: "$12/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  {
    id: "META_PH_CONSIDERATION_C2",
    market: "PH",
    phase: "consideration",
    platform: "Meta (IG Reels)",
    placement: "Instagram Reels, FB Video",
    language: "tl",
    image: "/images/exterior/panglao-hero.webp",
    primaryText: `Ito ang bagong paraan mag-invest. Hindi dami ng trabaho - dami ng pera.
Blue Everest managed 2 villas already. 65% occupancy. ₱395K/month average.
Financing available.

Schedule your private tour: +639542555553`,
    headlines: ["Negosyong Zero-Effort"],
    cta: "Message Us",
    targeting: "Website visitors, Engagement audiences",
    budget: "$8/day",
    status: "ready",
    calendarDate: "2026-06-12",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Philippines", type: "free" },
      { platform: "Meta Ads", target: "PH Audience", type: "paid", budget: "$8/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  {
    id: "META_PH_CONVERSION_Conv1",
    market: "PH",
    phase: "conversion",
    platform: "Meta (FB+Reels)",
    placement: "FB Feed, IG Reels",
    language: "tl",
    image: "/images/exterior/aerial-2.webp",
    primaryText: `Ngayong linggo pa lang. Dalawang unit na.

PHP 32,500,000. PHP 395,000 bawat buwan.
Blue Everest Asset Group.

2 villas remaining.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`,
    headlines: [
      "Lahat Tapos Bukas",
      "2 Villas. Ngayong Linggo Pa.",
      "₱395K/Buwan. Ngayon Na.",
    ],
    cta: "Call Now",
    targeting: "Hot audiences, retargeting",
    budget: "$20/day",
    status: "ready",
    calendarDate: "2026-06-19",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Philippines", type: "free" },
      { platform: "Meta Ads", target: "PH Audience", type: "paid", budget: "$20/day" },
    ],
  },

  // -- Google Search ----------------------------------------------

  {
    id: "GOOGLE_IL_SEARCH",
    market: "IL",
    phase: "awareness",
    platform: "Google Search",
    placement: "Search Results",
    language: "he",
    image: "/images/exterior/front-3.webp",
    primaryText: `וילה השקעה בבוהול - PHP 32.5M
PHP 395K בחודש | תשואה ברוטו 14.6%
בדוק השקעה חינם

2 וילות בלבד בבוהול בין מלונות 5 כוכבים. הנכס יושב 60 שניות מחוף. מימון מישראל זמין. דיווח השקעה חינם. +639542555553`,
    headlines: [
      "וילה השקעה בבוהול - PHP 32.5M",
      "PHP 395K בחודש | תשואה ברוטו 14.6%",
      "בדוק השקעה חינם",
    ],
    cta: "בדוק השקעה",
    targeting: "Israel, Hebrew, investment keywords",
    budget: "$13/day",
    status: "ready",
    calendarDate: "2026-06-01",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
      { platform: "Google Ads", target: "IL Search", type: "paid", budget: "$13/day" },
    ],
  },

  {
    id: "GOOGLE_PH_SEARCH",
    market: "PH",
    phase: "awareness",
    platform: "Google Search",
    placement: "Search Results",
    language: "en",
    image: "/images/exterior/front-4.webp",
    primaryText: `Panglao Prime Villas - PHP 32.5M
PHP 395K Monthly Income | 14.6% Gross Yield
Only 2 Units Left - Reserve Today

Luxury 4-bedroom villas in Bohol between JW Marriott and Mithi Resort. 60 seconds to Panglao Beach. Verified Airbnb income: PHP 395,000/month. Schedule site visit: +639542555553`,
    headlines: [
      "Panglao Prime Villas - PHP 32.5M",
      "PHP 395K Monthly Income | 14.6% Gross Yield",
      "Only 2 Units Left - Reserve Today",
    ],
    cta: "Learn More",
    targeting: "Philippines, investment keywords",
    budget: "$9/day",
    status: "ready",
    calendarDate: "2026-06-01",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Philippines", type: "free" },
      { platform: "Google Ads", target: "PH Search", type: "paid", budget: "$9/day" },
    ],
  },

  // -- AI-Generated Content (by CMO + Copywriter agents) ------------

  {
    id: "AI_IL_GROUP_TOURISM",
    market: "IL",
    phase: "awareness",
    platform: "FB Group + Page + Marketplace",
    placement: "5 Israeli groups + Blue Everest page + IL Marketplace",
    language: "he",
    image: "/images/ai-generated/aerial-complex-1.webp",
    primaryText: `תיירות בבוהול צמחה ב-166% מאז 2022. איפה המשקיעים הישראלים?

מ-535,000 תיירים ב-2022 ל-1.43 מיליון ב-2025 - שיא כל הזמנים. ביקוש גובר לנכסי השכרה קצרת טווח.

המשקיעים הראשונים נכנסים עכשיו לפני שהמחירים עולים.

וילה D: 1,535,000 ש"ח
וילה C: 1,650,000 ש"ח
דמי הזמנה: 9,999 ש"ח

WhatsApp: +639542555553 / +639958565865`,
    cta: "לפרטים על וילות השקעה",
    status: "ready",
    scheduledDay: 1,
    scheduledTime: "20:00 ISR",
    calendarDate: "2026-06-01",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
    ],
  },

  {
    id: "AI_IL_GROUP_AIRPORT",
    market: "IL",
    phase: "awareness",
    platform: "FB Group + Page",
    placement: "5 Israeli groups + Blue Everest page",
    language: "he",
    image: "/images/ai-generated/aerial-complex-2.webp",
    primaryText: `נמל התעופה של פנגלאו מתרחב ל-2.22 מיליון נוסעים בשנה.

הרחבת נמל התעופה מגדילה ישירות את ערכי הנכסים ואת הביקוש להשכרה באזורים פרימיום. יעד: 4 מיליון נוסעים עד 2030.

12 טיסות יומיות ממנילה. טיסות ישירות מקוריאה.

וילה D: 1,535,000 ש"ח
וילה C: 1,650,000 ש"ח

WhatsApp: +639542555553 / +639958565865`,
    cta: "לפרטים נוספים",
    status: "ready",
    scheduledDay: 2,
    scheduledTime: "20:00 ISR",
    calendarDate: "2026-06-02",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
    ],
  },

  {
    id: "AI_IL_GROUP_BRIDGE",
    market: "IL",
    phase: "awareness",
    platform: "FB Group + Page",
    placement: "5 Israeli groups + Blue Everest page",
    language: "he",
    image: "/images/ai-generated/comparison-telaviv-1.webp",
    primaryText: `הגשר החדש של פנגלאו-טגבילארן ישנה הכל.

השקעת תשתית של 7.15 מיליארד פזו במימון צרפתי. גישות כבר הושלמו, מכרזים בקרוב.

היסטורית: גשרים חדשים גורמים לעליית ערך של 20-40% בנכסים בתוך 5 שנים.

וילה D: 1,535,000 ש"ח
דמי הזמנה: 9,999 ש"ח

WhatsApp: +639542555553 / +639958565865`,
    cta: "לפרטים על ההשפעה",
    status: "ready",
    scheduledDay: 4,
    scheduledTime: "20:00 ISR",
    calendarDate: "2026-06-04",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
    ],
  },

  {
    id: "AI_IL_GROUP_LEGAL",
    market: "IL",
    phase: "consideration",
    platform: "FB Group + Page + WhatsApp",
    placement: "5 Israeli groups + Blue Everest page + WhatsApp broadcast",
    language: "he",
    image: "/images/ai-generated/interior-living-1.webp",
    primaryText: `איך ישראלים רוכשים נדל"ן בפיליפינים באופן חוקי?

3 מסלולים משפטיים:
Deed of Assignment - בעלות מלאה על המבנה, פשוט ומהיר
Leasehold 25+25 - שליטה מלאה 50 שנה
תאגיד מקומי - ביטחון מקסימלי

הסכם מס כפל ישראל-פיליפינים מ-1997.
כל התהליך מרחוק - אימות KYC דיגיטלי.

וילה C: 1,650,000 ש"ח
וילה D: 1,535,000 ש"ח

WhatsApp: +639542555553 / +639958565865`,
    cta: "לייעוץ משפטי",
    status: "ready",
    scheduledDay: 3,
    scheduledTime: "20:00 ISR",
    calendarDate: "2026-06-03",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
    ],
  },

  {
    id: "AI_IL_GROUP_ROI",
    market: "IL",
    phase: "consideration",
    platform: "FB Group + Page + Marketplace",
    placement: "5 Israeli groups + Blue Everest page + IL Marketplace",
    language: "he",
    image: "/images/ai-generated/comparison-telaviv-2.webp",
    primaryText: `בזמן שהדירות בתל אביב נותנות 3-4% תשואה, וילה בפנגלאו מניבה כ-14.6% תשואת שכירות ברוטו.

וילה C ב-1,650,000 ש"ח מציגה הכנסה חודשית מאומתת של PHP 395,000 מ-Airbnb.
תפוסה: 65% (מול 49% ממוצע שוק).
תשואה מצטברת 5 שנים: 136.9%.

WhatsApp: +639542555553 / +639958565865`,
    cta: "חישוב תשואה אישי",
    status: "ready",
    scheduledDay: 6,
    scheduledTime: "20:00 ISR",
    calendarDate: "2026-06-06",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Israel", type: "free" },
    ],
  },

  {
    id: "AI_PH_TOURISM",
    market: "PH",
    phase: "awareness",
    platform: "FB Page + Groups + Marketplace",
    placement: "Blue Everest page + 15 PH RE groups + PH Marketplace + 3 Airbnb groups",
    language: "en",
    image: "/images/ai-generated/rooftop-sunset-1.webp",
    primaryText: `1.43M tourists visited Bohol in 2025 - an all-time record. Tourism grew 166% since 2022.

While other destinations struggle, Bohol is breaking records. Skyscanner #8 Trending Destination 2025.

Villa C: PHP 35,000,000
Villa D: PHP 32,500,000
Financing available for qualified buyers.

WhatsApp: +639542555553 / +639958565865`,
    cta: "Learn More",
    status: "ready",
    scheduledDay: 1,
    scheduledTime: "19:00 PHT",
    calendarDate: "2026-06-01",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Philippines", type: "free" },
    ],
  },

  {
    id: "AI_PH_INCOME",
    market: "PH",
    phase: "consideration",
    platform: "FB Page + Groups + Email",
    placement: "Blue Everest page + 15 PH groups + OFW groups + Brevo email",
    language: "en",
    image: "/images/ai-generated/interior-living-2.webp",
    primaryText: `PHP 395,000 monthly rental income - verified Airbnb data.

Premium villas achieve 65% occupancy vs 49% market average. That's 33% better performance.

Annual gross: PHP 4,740,000
Gross rental yield: ~14.6% (Villa D)

Villa D: PHP 32,500,000
Financing available for qualified buyers.

WhatsApp: +639542555553 / +639958565865`,
    cta: "Get Full Report",
    status: "ready",
    scheduledDay: 3,
    scheduledTime: "19:00 PHT",
    calendarDate: "2026-06-03",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Marketplace", target: "Philippines", type: "free" },
    ],
  },

  {
    id: "AI_INTL_MARRIOTT",
    market: "BOTH",
    phase: "awareness",
    platform: "IG + FB + LinkedIn + Groups",
    placement: "Blue Everest page + IG + LinkedIn + 7 Expat groups + 3 Airbnb groups + Bohol groups",
    language: "en",
    image: "/images/ai-generated/pool-night.webp",
    primaryText: `Walking distance to JW Marriott. 60 seconds to the beach.

Premium villa in Panglao's luxury corridor - between JW Marriott (opening 2026-2028) and Mithi Resort & Spa.

263.78 sqm, 4 bedrooms, private pool, rooftop jacuzzi.
PHP 32,500,000.

WhatsApp: +639542555553 / +639958565865`,
    cta: "Investment Details",
    status: "ready",
    scheduledDay: 2,
    scheduledTime: "18:00 PHT",
    calendarDate: "2026-06-02",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "CHINESE PROPERTY INVESTORS", url: "https://www.facebook.com/groups/chinesepropertyinternationalinvestors/", type: "organic", status: "pending_join" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  {
    id: "AI_INTL_BRIDGE",
    market: "BOTH",
    phase: "awareness",
    platform: "FB + LinkedIn + Groups",
    placement: "Blue Everest page + LinkedIn + 7 Expat groups + 4 Bohol groups + 3 Global RE groups",
    language: "en",
    image: "/images/ai-generated/underwater-diving.webp",
    primaryText: `France commits PHP 7.15 billion for the third Panglao-Tagbilaran bridge.

Infrastructure investment of this scale transforms property values. Historical precedent: new bridges cause 20-40% land appreciation within 5 years.

Villa at PHP 32,500,000 positioned in the direct path of development.

WhatsApp: +639542555553 / +639958565865`,
    cta: "Investment Analysis",
    status: "ready",
    scheduledDay: 4,
    scheduledTime: "18:00 PHT",
    calendarDate: "2026-06-04",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "CHINESE PROPERTY INVESTORS", url: "https://www.facebook.com/groups/chinesepropertyinternationalinvestors/", type: "organic", status: "pending_join" },
    ],
  },

  // -- Video Posts (Google Drive embed) ------------------------------

  {
    id: "VIDEO_OVERVIEW",
    market: "INTL",
    phase: "awareness",
    platform: "FB + IG + YouTube + Groups",
    placement: "Blue Everest page + IG Reels + YouTube + ALL 42 groups + LinkedIn",
    language: "en",
    image: "/images/ai-generated/rooftop-sunset-2.webp",
    driveVideoId: "1yEuBI36PmRm9uHQXwxR1nLGkEkfCW3RV",
    mediaType: "video",
    primaryText: `BLUEEVEREST 1 - Villa Overview

Full walkthrough of Panglao Prime Villas. 263.78 sqm luxury living.

WhatsApp: +639542555553 / +639958565865`,
    cta: "Watch Full Video",
    status: "ready",
    scheduledDay: 5,
    scheduledTime: "18:00 PHT",
    calendarDate: "2026-06-05",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "CHINESE PROPERTY INVESTORS", url: "https://www.facebook.com/groups/chinesepropertyinternationalinvestors/", type: "organic", status: "pending_join" },
      { platform: "YouTube", target: "Blue Everest YouTube", type: "organic" },
      { platform: "IG Reels", target: "Blue Everest IG", type: "free" },
      { platform: "TikTok", target: "Blue Everest TikTok", type: "free" },
    ],
  },

  {
    id: "VIDEO_TOUR",
    market: "INTL",
    phase: "consideration",
    platform: "FB Page + IG",
    placement: "FB Feed, IG Reels",
    language: "en",
    image: "/images/interior/gf-kitchen-1.webp",
    driveVideoId: "1JmciI7ev9XVwWCh3CnL0UN2Sbz_Y8bBZ",
    mediaType: "video",
    primaryText: `BLUEEVEREST 2 - Full Property Tour

Every room, every detail. Private pool, rooftop jacuzzi, Japanese spa bathroom.

PHP 32,500,000 - PHP 35,000,000.

WhatsApp: +639542555553 / +639958565865`,
    cta: "Watch Tour",
    status: "ready",
    scheduledDay: 7,
    scheduledTime: "18:00 PHT",
    calendarDate: "2026-06-07",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "CHINESE PROPERTY INVESTORS", url: "https://www.facebook.com/groups/chinesepropertyinternationalinvestors/", type: "organic", status: "pending_join" },
      { platform: "YouTube", target: "Blue Everest YouTube", type: "organic" },
      { platform: "IG Reels", target: "Blue Everest IG", type: "free" },
      { platform: "TikTok", target: "Blue Everest TikTok", type: "free" },
    ],
  },

  {
    id: "REEL_LOCATION",
    market: "INTL",
    phase: "awareness",
    platform: "IG Reels + FB Reels + TikTok",
    placement: "IG Reels, FB Reels, TikTok, YouTube Shorts",
    language: "en",
    image: "/images/exterior/aerial-1.webp",
    driveVideoId: "1c5opYji9O7yuESFhm6jdU9yDUy-zKy9F",
    mediaType: "reel",
    primaryText: `BLUEEVEREST 3 - Location & Beach

60 seconds from your villa to Panglao Beach. Between JW Marriott and Mithi Resort.

WhatsApp: +639542555553 / +639958565865`,
    cta: "See Location",
    status: "ready",
    scheduledDay: 3,
    scheduledTime: "18:00 PHT",
    calendarDate: "2026-06-03",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "CHINESE PROPERTY INVESTORS", url: "https://www.facebook.com/groups/chinesepropertyinternationalinvestors/", type: "organic", status: "pending_join" },
      { platform: "YouTube", target: "Blue Everest YouTube", type: "organic" },
      { platform: "IG Reels", target: "Blue Everest IG", type: "free" },
      { platform: "TikTok", target: "Blue Everest TikTok", type: "free" },
    ],
  },

  {
    id: "REEL_INTERIOR",
    market: "INTL",
    phase: "consideration",
    platform: "IG Reels + FB Reels",
    placement: "IG Reels, FB Reels",
    language: "en",
    image: "/images/interior/gf-dining-1.webp",
    driveVideoId: "12B5eik_L9eblyNXoXwDlZFcHOdlQgD4w",
    mediaType: "reel",
    primaryText: `BLUEEVEREST 4 - Interior Design

Japanese spa bathroom. Floor-to-ceiling glass. Natural stone finishes. 4 en-suite bedrooms.

WhatsApp: +639542555553 / +639958565865`,
    cta: "See Interior",
    status: "ready",
    scheduledDay: 8,
    scheduledTime: "18:00 PHT",
    calendarDate: "2026-06-08",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "CHINESE PROPERTY INVESTORS", url: "https://www.facebook.com/groups/chinesepropertyinternationalinvestors/", type: "organic", status: "pending_join" },
      { platform: "YouTube", target: "Blue Everest YouTube", type: "organic" },
      { platform: "IG Reels", target: "Blue Everest IG", type: "free" },
      { platform: "TikTok", target: "Blue Everest TikTok", type: "free" },
    ],
  },

  {
    id: "REEL_INVESTMENT",
    market: "INTL",
    phase: "consideration",
    platform: "IG Reels + FB Reels + LinkedIn",
    placement: "IG Reels, FB Reels, LinkedIn",
    language: "en",
    image: "/images/ai-generated/comparison-telaviv-1.webp",
    driveVideoId: "1HWfj9F0hrNWCmByyMfg3U_qcwqP_6Vmv",
    mediaType: "reel",
    primaryText: `BLUEEVEREST 5 - Investment Case

PHP 395,000/month verified Airbnb income. ~14.6% gross rental yield. 5-year cumulative: 136.9%.

WhatsApp: +639542555553 / +639958565865`,
    cta: "Investment Details",
    status: "ready",
    scheduledDay: 10,
    scheduledTime: "18:00 PHT",
    calendarDate: "2026-06-10",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "CHINESE PROPERTY INVESTORS", url: "https://www.facebook.com/groups/chinesepropertyinternationalinvestors/", type: "organic", status: "pending_join" },
      { platform: "YouTube", target: "Blue Everest YouTube", type: "organic" },
      { platform: "IG Reels", target: "Blue Everest IG", type: "free" },
      { platform: "TikTok", target: "Blue Everest TikTok", type: "free" },
    ],
  },

  {
    id: "VIDEO_LIFESTYLE",
    market: "INTL",
    phase: "awareness",
    platform: "IG Reels + TikTok + YouTube",
    placement: "IG Reels, TikTok, YouTube",
    language: "en",
    image: "/images/exterior/rear-3.webp",
    driveVideoId: "1PECl1vpzwCVZdqwHE3MoEUczAxgdAkyU",
    mediaType: "reel",
    primaryText: `BLUEEVEREST 6 - Lifestyle & Area

Panglao Island: UNESCO Geopark, world-class diving, 60 seconds to the beach.

PHP 32,500,000 for a luxury 4BR villa.

WhatsApp: +639542555553 / +639958565865`,
    cta: "See the Lifestyle",
    status: "ready",
    scheduledDay: 6,
    scheduledTime: "18:00 PHT",
    calendarDate: "2026-06-06",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "עסקים בפיליפינים יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Jewish Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "BOHOL RE for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW RE Properties Investment", url: "https://www.facebook.com/groups/848276462199962/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Buy Sell Rent Invest RE PH", url: "https://www.facebook.com/groups/2669597893303292/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE PH Buy Sell Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PROPERTY FOR SALE IN PH", url: "https://www.facebook.com/groups/1473743926177925/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "PH RE Condo Lots House", url: "https://www.facebook.com/groups/421416569208434/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "The RE Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "RE Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Beachfront Luxury RE PH", url: "https://www.facebook.com/groups/1439777089708009/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "CHINESE PROPERTY INVESTORS", url: "https://www.facebook.com/groups/chinesepropertyinternationalinvestors/", type: "organic", status: "pending_join" },
      { platform: "YouTube", target: "Blue Everest YouTube", type: "organic" },
      { platform: "IG Reels", target: "Blue Everest IG", type: "free" },
      { platform: "TikTok", target: "Blue Everest TikTok", type: "free" },
    ],
  },

  // -- Korean Market (42% of Bohol foreign tourists) ---------------

  {
    id: "META_KR_AWARENESS",
    market: "KR",
    phase: "awareness",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed, IG Reels",
    language: "ko",
    image: "/images/exterior/hero-aerial.webp",
    primaryText: `팡라오 프라임 빌라 - 당신이 사랑하는 해변에서 60초 거리

보홀 외국인 관광객의 42%가 한국인입니다. 이제 방문만 하지 말고, 소유하세요.

빌라 D: PHP 32,500,000
빌라 C: PHP 35,000,000
월 임대 수익: PHP 395,000 (에어비앤비 검증)
연간 ROI: ~14.6%

진에어, 제주항공, 에어부산 직항. 4시간 이내.

WhatsApp: +639542555553 / +639958565865`,
    headlines: [
      "팡라오 빌라 - 한국인이 가장 사랑하는 해변",
      "월 395,000 페소 임대 수익. 검증된 데이터.",
      "보홀 관광객 42%가 한국인. 이제 투자하세요.",
    ],
    cta: "자세히 보기",
    targeting: "South Korea, 35-60, Travel + Investment interests",
    budget: "$10/day",
    status: "ready",
    calendarDate: "2026-06-08",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "Meta Ads", target: "KR Audience", type: "paid", budget: "$10/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  {
    id: "META_KR_CONVERSION",
    market: "KR",
    phase: "conversion",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed",
    language: "ko",
    image: "/images/interior/gf-kitchen-1.webp",
    primaryText: `강남 1BR 아파트: 15억원. 수익률: 2-3%.
팡라오 4BR 풀빌라: 7억원. 수익률: ~14.6%.

절반 가격, 10배 수익. 프라이빗 풀, 루프탑 자쿠지, 263.78㎡.
JW 매리어트 옆, 해변 60초.

2채만 남았습니다.

WhatsApp: +639542555553 / +639958565865`,
    headlines: [
      "강남 vs 팡라오: 절반 가격, 10배 수익",
      "2채 남음. 지금 상담하세요.",
    ],
    cta: "상담 예약",
    targeting: "South Korea, Seoul/Busan, 40-60, RE investors",
    budget: "$8/day",
    status: "ready",
    calendarDate: "2026-06-15",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "Meta Ads", target: "KR Audience", type: "paid", budget: "$8/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  // -- Chinese Market ----------------------------------------------

  {
    id: "META_CN_AWARENESS",
    market: "CN",
    phase: "awareness",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed",
    language: "zh",
    image: "/images/exterior/panglao-hero.webp",
    primaryText: `JW万豪选择了邦劳岛。雅高集团选择了邦劳岛。聪明的资金已经知道答案。

Panglao Prime Villas - 263.78平方米豪华别墅
私人泳池, 屋顶按摩浴缸, 4间卧室套房
距海滩60秒, 毗邻JW万豪酒店

联合国教科文组织全球地质公园
2025年游客量: 143万人次

WhatsApp: +639542555553 / +639958565865`,
    headlines: [
      "JW万豪的邻居 - 邦劳岛豪华别墅",
      "联合国教科文组织地质公园内的投资机会",
    ],
    cta: "了解详情",
    targeting: "China/HK/TW/SG diaspora, 35-60",
    budget: "$8/day",
    status: "ready",
    calendarDate: "2026-06-09",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "CHINESE PROPERTY INVESTORS", url: "https://www.facebook.com/groups/chinesepropertyinternationalinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "Meta Ads", target: "CN Audience", type: "paid", budget: "$8/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  // -- Singapore Market --------------------------------------------

  {
    id: "META_SG_AWARENESS",
    market: "SG",
    phase: "awareness",
    platform: "Meta (FB+IG) + LinkedIn",
    placement: "FB Feed, IG Feed, LinkedIn",
    language: "en",
    image: "/images/ai-generated/pool-night.webp",
    primaryText: `For less than a studio in Orchard Road, you own a 4-bedroom luxury villa generating ~14.6% gross annual returns.

Orchard Road 3BR: SGD 3-5M. Yield: 2-3%.
Panglao Villa: ~SGD 720K. Yield: ~14.6%.

263.78 sqm. Private pool. Rooftop jacuzzi. 60 seconds to beach. Next to JW Marriott.

Professional Airbnb management. Monthly bank transfer. Fully passive.

WhatsApp: +639542555553 / +639958565865`,
    headlines: [
      "Orchard Road studio price = Panglao luxury villa",
      "SGD 720K. ~14.6% gross yield. Fully managed.",
    ],
    cta: "Investment Report",
    targeting: "Singapore, 35-60, Property investors, HNW",
    budget: "$8/day",
    status: "ready",
    calendarDate: "2026-06-10",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "LinkedIn", target: "Blue Everest LinkedIn", type: "organic" },
      { platform: "Meta Ads", target: "SG Audience", type: "paid", budget: "$8/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  // -- Hong Kong Market --------------------------------------------

  {
    id: "META_HK_AWARENESS",
    market: "HK",
    phase: "awareness",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed",
    language: "en",
    image: "/images/exterior/front-1.webp",
    primaryText: `HK property prices buy you walls. This price buys you a villa, a pool, a rooftop jacuzzi, and PHP 395,000/month.

Mid-Levels 3BR: HKD 15-25M. Yield: under 2%.
Panglao 4BR Villa: ~HKD 4.1M. Yield: ~14.6%.

1/4 the price. 10x the yield. Between JW Marriott and Mithi Resort.

WhatsApp: +639542555553 / +639958565865`,
    headlines: [
      "1/4 HK price. 10x the yield.",
      "HKD 4.1M for luxury villa + PHP 395K/month income",
    ],
    cta: "Learn More",
    targeting: "Hong Kong, 35-60, Property investors",
    budget: "$8/day",
    status: "ready",
    calendarDate: "2026-06-11",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "LinkedIn", target: "Blue Everest LinkedIn", type: "organic" },
      { platform: "Meta Ads", target: "HK Audience", type: "paid", budget: "$8/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  // -- US Market ---------------------------------------------------

  {
    id: "META_US_AWARENESS",
    market: "US",
    phase: "awareness",
    platform: "Meta (FB+IG) + LinkedIn",
    placement: "FB Feed, IG Feed, LinkedIn",
    language: "en",
    image: "/images/ai-generated/rooftop-sunset-1.webp",
    primaryText: `You'd pay $1.5M for a vacation rental in Maui generating the same yield. This is PHP 32,500,000.

Panglao Prime Villas: 4BR luxury villa, private pool, rooftop jacuzzi. 60 seconds to beach.

Verified Airbnb income: PHP 395,000/month .
Gross rental yield: ~14.6% (Villa D) gross.
5-year total ROI projection: 136.9%.

Professional management. Monthly P&L report. Fully passive.

WhatsApp: +639542555553 / +639958565865`,
    headlines: [
      "PHP 32.5M. ~14.6% yield. Fully managed.",
      "60% cheaper than Hawaii. Better returns.",
    ],
    cta: "Get Analysis",
    targeting: "USA, 35-65, RE investors, BiggerPockets audience",
    budget: "$8/day",
    status: "ready",
    calendarDate: "2026-06-12",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "LinkedIn", target: "Blue Everest LinkedIn", type: "organic" },
      { platform: "Meta Ads", target: "US Audience", type: "paid", budget: "$8/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  // -- European Market (UK/DE/FR) ----------------------------------

  {
    id: "META_EU_AWARENESS",
    market: "EU",
    phase: "awareness",
    platform: "Meta (FB+IG) + LinkedIn",
    placement: "FB Feed, IG Feed, LinkedIn",
    language: "en",
    image: "/images/ai-generated/aerial-complex-1.webp",
    primaryText: `A Mediterranean resort villa at EUR 800K yields 4%. This Panglao villa at ~EUR 490K yields ~14.6% gross, next to JW Marriott, in a UNESCO Geopark.

Tourism: 1.43M visitors in 2025 (+166% since 2022). 30%+ annual growth vs 3-5% Mediterranean.

263.78 sqm. Private pool. Rooftop jacuzzi. Professional Airbnb management.

WhatsApp: +639542555553 / +639958565865`,
    headlines: [
      "EUR 490K. ~14.6% yield. UNESCO Geopark.",
      "Better than Algarve. Next to JW Marriott.",
    ],
    cta: "Investment Details",
    targeting: "UK/DE/FR/NL/CH, 35-65, RE investors, expats",
    budget: "$8/day",
    status: "ready",
    calendarDate: "2026-06-13",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "LinkedIn", target: "Blue Everest LinkedIn", type: "organic" },
      { platform: "Meta Ads", target: "EU Audience", type: "paid", budget: "$8/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  // -- UAE / Gulf Market -------------------------------------------

  {
    id: "META_UAE_AWARENESS",
    market: "UAE",
    phase: "awareness",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed",
    language: "en",
    image: "/images/exterior/front-2.webp",
    primaryText: `In Dubai, a studio costs the same as a full luxury villa in Panglao. PHP 32,500,000 gets you a 4-bedroom villa with private pool, rooftop jacuzzi, and PHP 395,000/month verified rental income.

No UAE tax on foreign rental income - 100% goes to your pocket.

263.78 sqm. Between JW Marriott and Mithi Resort. 60 seconds to beach.
Professional management. Monthly bank transfer.

WhatsApp: +639542555553 / +639958565865`,
    headlines: [
      "Dubai studio price = Panglao luxury villa",
      "PHP 32.5M. 4BR villa. PHP 395K/month. Tax-free.",
    ],
    cta: "Learn More",
    targeting: "UAE/Qatar/Bahrain, 30-60, Investors + OFW",
    budget: "$8/day",
    status: "ready",
    calendarDate: "2026-06-14",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "LinkedIn", target: "Blue Everest LinkedIn", type: "organic" },
      { platform: "Meta Ads", target: "UAE Audience", type: "paid", budget: "$8/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },

  // -- Australia Market --------------------------------------------

  {
    id: "META_AU_AWARENESS",
    market: "AU",
    phase: "awareness",
    platform: "Meta (FB+IG)",
    placement: "FB Feed, IG Feed",
    language: "en",
    image: "/images/exterior/aerial-2.webp",
    primaryText: `Sydney investors are paying $1.5M+ for apartments yielding 3%. Panglao offers ~14.6% gross at ~AUD 810K.

4BR luxury villa. Private pool. Rooftop jacuzzi. 60 seconds to beach.
Between JW Marriott and Mithi Resort.

PHP 395,000/month verified Airbnb income. Professional management. Fully passive.

Direct flights via Manila (4-5 hours total from Sydney).

WhatsApp: +639542555553 / +639958565865`,
    headlines: [
      "AUD 810K. ~14.6% yield. Panglao luxury villa.",
      "5x better than Sydney yields. Fully managed.",
    ],
    cta: "Get Report",
    targeting: "Australia, 35-65, Property investors",
    budget: "$6/day",
    status: "ready",
    calendarDate: "2026-06-16",
    distribution: [
      { platform: "FB Page", target: "Blue Everest Asset Group", url: "https://www.facebook.com/BlueEverestGroup", type: "free", status: "scheduled" },
      { platform: "FB Group", target: "Panglao Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats living in PH", url: "https://www.facebook.com/groups/1554771104828714/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "STR Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", type: "organic", status: "pending_join" },
      { platform: "FB Group", target: "Short Mid Term Rental", url: "https://www.facebook.com/groups/Vrolio/", type: "organic", status: "pending_join" },
      { platform: "LinkedIn", target: "Blue Everest LinkedIn", type: "organic" },
      { platform: "Meta Ads", target: "AU Audience", type: "paid", budget: "$6/day" },
      { platform: "IG Feed", target: "Blue Everest IG", type: "free" },
    ],
  },
];

// Auto-mark past posts as published based on calendar date
const today = new Date().toISOString().slice(0, 10);
for (const post of POSTS) {
  if (post.calendarDate && post.calendarDate < today && post.status === "ready") {
    (post as { status: string }).status = "published";
  }
}
