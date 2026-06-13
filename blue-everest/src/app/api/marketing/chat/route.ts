// src/app/api/marketing/chat/route.ts
// Sales chatbot - works with OR without Anthropic API key

import { randomUUID } from 'crypto';
import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { getOrCreatePanglaoProjectId } from '@/lib/marketing/project';
import { buildSalesOsResponse } from '@/lib/sales-os/blue-everest-agent';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Hebrew detection
const HEBREW_RE = /[\u0590-\u05FF]/;
function detectLang(text: string): 'he' | 'en' {
  const heCount = (text.match(/[\u0590-\u05FF]/g) || []).length;
  return heCount > text.replace(/\s/g, '').length * 0.15 ? 'he' : 'en';
}

// ===================================================================
// KNOWLEDGE BASE - all the data the chatbot needs
// ===================================================================
const KB = {
  villaC: { php: 'PHP 35,000,000', lot: '192.85 sqm' },
  villaD: { php: 'PHP 32,500,000', lot: '182.03 sqm' },
  specs: '263.78 sqm floor area, 4 bedrooms all en-suite, 3 stories + roof deck, private pool (15.08 sqm), rooftop jacuzzi (6.37 sqm), outdoor kitchen, Japanese spa bathroom, floor-to-ceiling glass, natural stone finishes',
  location: 'Bingag, Panglao Island, Bohol, Philippines. Between JW Marriott (under construction, opening 2026-2028) and Mithi Resort & Spa. 60 seconds walk to Panglao Beach. 8-12 minutes to Bohol-Panglao International Airport.',
  income: { monthly: 'PHP 395,000', monthlyIls: 'כ-7,054 ש"ח', annual: 'PHP 4,740,000', occupancy: '65%', marketAvg: '49%', grossYield: '~14.6% (Villa D) / ~13.5% (Villa C)', netYield: '~11% after management fees', roi5yr: '136.9% cumulative (rental + appreciation)', appreciation: '+80.9% over 5 years (projected)' },
  payment: { reservation: 'PHP 200,000', schedule: '25% down payment, 55% over 24 months, 20% at turnover', scheduleHe: '25% מקדמה, 55% לאורך 24 חודשים, 20% במסירה' },
  legal: [
    'Deed of Assignment (most popular) - full legal title to villa structure. Simple, fast, lower costs.',
    'Leasehold 25+25 years - 50 years full control. Live, rent, resell. No corporation needed.',
    'Domestic Corporation (60/40 Filipino-foreign) - indirect land ownership. Maximum security.',
  ],
  legalHe: [
    'Deed of Assignment - הסבת זכויות כלכליות במבנה הווילה, כולל שימוש, השכרה, מכירה והורשה.',
    'Leasehold 25+25 או 99 שנים לפי המסגרת החדשה - חכירה רשומה, ניתנת להעברה ולהורשה.',
    'Domestic Corporation 60/40 - תאגיד מקומי שמחזיק בקרקע ובמבנה לפי הדין הפיליפיני.',
  ],
  bdo: 'BDO Bank financing available for Filipino buyers - up to 70% LTV, 15-year terms, ~6% interest.',
  bdoHe: 'BDO Bank financing מיועד לרוכשים פיליפינים בלבד. לרוכשים ישראלים מוצגים מסלולי תשלום ומבני בעלות משפטיים.',
  tourism: '1.43 million tourists in 2025 (record high). +166% growth since 2022. Skyscanner #8 Trending Destination 2025. South Korea is 42% of foreign tourists.',
  infrastructure: 'Airport expanding to 4M passengers by 2030 (Aboitiz PPP). Third bridge PHP 7.15B funded by France. Panglao Shores PHP 25B tourism township under construction. JW Marriott 7-hectare resort opening 2026-2028. SM Bohol opening 2028.',
  infrastructureHe: 'שדה התעופה מתוכנן להתרחב ל-4M נוסעים עד 2030. גשר שלישי במימון צרפתי נמצא בפיתוח. Panglao Shores, מתחם תיירות גדול, נמצא בבנייה. JW Marriott צפוי להיפתח בשנים 2026-2028. SM Bohol מתוכנן ל-2028.',
  management: 'Professional Airbnb management handles everything: guests, cleaning, maintenance, pricing, reviews. You receive monthly reports + bank transfer. Block your dates when you want to visit. Fully passive investment.',
  whatsapp: { marketing: '+639542555553', office: '+639958565865' },
  comparisons: {
    boracay: 'Boracay: PHP 55-70K/sqm. Panglao: PHP 27-49K/sqm. 40-50% cheaper with similar fundamentals.',
    telAviv: 'השוואה לשוק הישראלי נבחנת לפי תשואה, מיסוי ונזילות. מחיר וילה D הוא PHP 32,500,000 ומחיר וילה C הוא PHP 35,000,000.',
    singapore: 'Compare asset size, yield, taxes, and liquidity. Panglao Prime Villas are priced at PHP 32,500,000 to PHP 35,000,000.',
    hongkong: 'Compare asset size, yield, taxes, and liquidity. Panglao Prime Villas are priced at PHP 32,500,000 to PHP 35,000,000.',
    korea: 'Compare asset size, yield, taxes, and liquidity. Panglao Prime Villas are priced at PHP 32,500,000 to PHP 35,000,000.',
    dubai: 'Compare asset size, yield, taxes, and liquidity. Panglao Prime Villas are priced at PHP 32,500,000 to PHP 35,000,000.',
    usa: 'Compare asset size, yield, taxes, and liquidity. Panglao Prime Villas are priced at PHP 32,500,000 to PHP 35,000,000.',
    manila: 'BGC 3BR condo: PHP 25-35M, 3-5% yield. Panglao villa: PHP 32.5M, ~14.6% gross yield. Same price, ~3x the rental return.',
  },
  fiveYearMath: 'PHP 32.5M investment, Year 5: cumulative rental PHP 23.7M + property value PHP 58.8M = total PHP 82.5M. Total gain: PHP 50M. ROI: 153.8%.',
  fiveYearMathHe: 'לפי מודל 5 שנים, וילה D במחיר PHP 32,500,000 מציגה תשואה מצטברת של 136.9%, בכפוף לביצועי שוק וניהול מקצועי.',
  virtualTour: 'https://kuula.co/share/collection/7HMGx?logo=1&info=0&logosize=96&fs=1&vr=0&initload=0&thumbs=1&margin=10',
};

// ===================================================================
// INTENT MATCHING
// ===================================================================
type Intent = 'pricing' | 'roi' | 'location' | 'specs' | 'legal' | 'payment' | 'management' | 'comparison' | 'tourism' | 'infrastructure' | 'reservation' | 'bdo' | 'greeting' | 'general';

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/^(hi|hello|hey|shalom|שלום|היי|בוקר טוב|ערב טוב|מה נשמע)/.test(t)) return 'greeting';
  if (/price|cost|how much|כמה|מחיר|עולה|תקציב|pricing/.test(t)) return 'pricing';
  if (/roi|return|income|yield|earn|תשואה|הכנסה|רווח|rental|airbnb|revenue/.test(t)) return 'roi';
  if (/where|location|beach|map|מיקום|איפה|חוף|marriott|mithi/.test(t)) return 'location';
  if (/spec|bedroom|pool|floor|area|sqm|jacuzzi|מפרט|חדרים|בריכה|שטח/.test(t)) return 'specs';
  if (/legal|own|foreign|deed|lease|corp|בעלות|משפט|חוקי|זר/.test(t)) return 'legal';
  if (/pay|install|down|schedule|תשלום|מקדמה/.test(t)) return 'payment';
  if (/manag|passive|rent|who.*handle|ניהול|פסיבי|מי מנהל/.test(t)) return 'management';
  if (/compar|vs|better|boracay|singapore|hong kong|korea|dubai|miami|tel aviv|phuket|bali|השווא|לעומת|מול/.test(t)) return 'comparison';
  if (/tour|visit|airport|flight|תייר|שדה תעופה|טיסות|growth/.test(t)) return 'tourism';
  if (/infra|bridge|develop|marriott|panglao shores|construction|תשתית|גשר|בנייה|פיתוח/.test(t)) return 'infrastructure';
  if (/reserv|book|buy|secure|want|interested|להזמין|לקנות|רוצה|מעוניין|שריין/.test(t)) return 'reservation';
  if (/bdo|financ|loan|mortgage|מימון|הלוואה|משכנתא/.test(t)) return 'bdo';
  return 'general';
}

function detectComparisonTarget(text: string): string | null {
  const t = text.toLowerCase();
  if (/singapore|סינגפור/.test(t)) return 'singapore';
  if (/hong kong|הונג קונג/.test(t)) return 'hongkong';
  if (/korea|קוריאה/.test(t)) return 'korea';
  if (/dubai|uae|דובאי|אמירויות/.test(t)) return 'dubai';
  if (/miami|usa|america|ארה"ב|אמריקה|מיאמי/.test(t)) return 'usa';
  if (/tel aviv|תל אביב|ישראל|israel/.test(t)) return 'telAviv';
  if (/boracay|בורקאי/.test(t)) return 'boracay';
  if (/bgc|manila|מנילה/.test(t)) return 'manila';
  return null;
}

// ===================================================================
// RESPONSE BUILDER
// ===================================================================
function buildResponse(message: string, history: ChatMessage[], lang: 'he' | 'en'): string {
  const intent = detectIntent(message);

  if (lang === 'he') return buildHebrewResponse(intent, message);
  return buildEnglishResponse(intent, message);
}

function buildHebrewResponse(intent: Intent, message: string): string {
  const wa = `WhatsApp: ${KB.whatsapp.marketing} (שיווק) / ${KB.whatsapp.office} (משרד)`;

  switch (intent) {
    case 'greeting':
      return `שלום! אני היועץ של Panglao Prime Villas.\n\nיש לנו 2 וילות יוקרה אחרונות בפנגלאו, בוהול, פיליפינים:\n- וילה C: ${KB.villaC.php}\n- וילה D: ${KB.villaD.php}\n- דמי הזמנה: ${KB.payment.reservation}\n\nהכנסה חודשית מאומתת: ${KB.income.monthly}.\nתשואת שכירות ברוטו: כ-14.6%.\n\nעל מה תרצה לשמוע?\n\n${wa}`;

    case 'pricing':
      return `מחירי הווילות:\n\nוילה C (מגרש ${KB.villaC.lot}): ${KB.villaC.php}\nוילה D (מגרש ${KB.villaD.lot}): ${KB.villaD.php}\n\nדמי הזמנה: ${KB.payment.reservation} בלבד.\n\nלהשוואה: פחות מדירת 3 חדרים בחיפה, עם הכנסה חודשית מאומתת של ${KB.income.monthly} מ-Airbnb.\n\nתנאי תשלום: ${KB.payment.scheduleHe}.\n\nרוצה לשמוע על התשואה או על המבנים המשפטיים לרוכשים ישראלים?\n\n${wa}`;

    case 'roi':
      return `נתוני תשואה מאומתים:\n\n- הכנסה חודשית: ${KB.income.monthly}\n- הכנסה שנתית ברוטו: ${KB.income.annual}\n- תפוסה: ${KB.income.occupancy} (מול ממוצע שוק ${KB.income.marketAvg})\n- תשואה שנתית: ${KB.income.grossYield}\n- עליית ערך ב-5 שנים: ${KB.income.appreciation}\n- תשואה מצטברת 5 שנים: ${KB.income.roi5yr}\n\n${KB.fiveYearMathHe}\n\nהנתונים מבוססים על ביצועי Airbnb מאומתים של נכסים דומים בפנגלאו.\n\nרוצה לדבר על המספרים עם הצוות שלנו? ${wa}`;

    case 'legal':
      return `3 מסלולים משפטיים לרוכשים ישראלים:\n\n1. ${KB.legalHe[0]}\n2. ${KB.legalHe[1]}\n3. ${KB.legalHe[2]}\n\nחשוב: יש הסכם מס כפל בין ישראל לפיליפינים מ-1997.\n\nכל התהליך יכול להתבצע מרחוק: אימות KYC דיגיטלי, ללא צורך בנסיעה.\n\nרוצה לדבר עם הצוות המשפטי שלנו? ${wa}`;

    case 'location':
      return `מיקום פרימיום:\n\n${KB.location}\n\n- בין JW Marriott (ריזורט 7 הקטר, בבנייה) לבין Mithi Resort & Spa\n- 60 שניות הליכה לחוף הים\n- 8-12 דקות משדה התעופה הבינלאומי\n- אזור מוגבה, ללא סיכון הצפות\n\nתיירות: ${KB.tourism}\n\nרוצה לראות סיור וירטואלי? ${KB.virtualTour}\n\n${wa}`;

    case 'specs':
      return `מפרט הווילה:\n\n${KB.specs}\n\nקומת קרקע: סלון, פינת אוכל, מטבח עם גישה לבריכה, חדר עוזרת\nקומה 2: חדר שינה 1 (17.3 מ"ר) + חדר אורחים (24.77 מ"ר), מרפסת\nקומה 3: חדר שינה ראשי (25.57 מ"ר) + חדר שינה 2, מרפסת\nגג: טרקלין, מטבח חוץ, ג'קוזי (6.37 מ"ר), אזור פתוח (31.49 מ"ר), נוף לים\n\nשטח כולל: 263.78 מ"ר לכל וילה.\n\nרוצה לראות את התוכניות? ${wa}`;

    case 'comparison': {
      const target = detectComparisonTarget(message);
      if (target === 'telAviv' || !target) {
        return `השוואה לשוק הישראלי:\n\n${KB.comparisons.telAviv}\n\nתשואת שכירות בישראל: 1-2% נטו.\nתשואת וילה בפנגלאו: כ-14.6% ברוטו (כ-11% נטו אחרי דמי ניהול).\n\nעלות המחיה בפיליפינים נמוכה ב-259% מישראל. המשכורת הישראלית קונה פי 3 שם.\n\nחברות ישראליות כבר פועלות בפיליפינים: Amdocs (1,000+ עובדים), LR Group.\n\nרוצה לשמוע עוד? ${wa}`;
      }
      return `השוואה לשווקים בינלאומיים תלויה במדינה, במיסוי ובמבנה הבעלות.\n\nבמסגרת הישראלית, המחירים הרלוונטיים הם וילה D: ${KB.villaD.php}, וילה C: ${KB.villaC.php}, ודמי הזמנה: ${KB.payment.reservation}.\n\n3 מסלולים משפטיים זמינים: Deed of Assignment, Leasehold 25+25 או 99 שנים, Domestic Corporation 60/40.\n\nלהשוואה מלאה ומותאמת אישית, דברו איתנו:\n${wa}`;
    }

    case 'reservation':
      return `מצוין שאתה מעוניין!\n\nתהליך ההזמנה:\n1. בחירת וילה (C או D)\n2. חתימה על הסכם הזמנה\n3. העברת ${KB.payment.reservation} דמי הזמנה\n4. אימות KYC (דרכון + הוכחת מקורות)\n5. הסכם רכישה סופי\n6. תשלום לפי ${KB.payment.scheduleHe}\n\nשלבים 1-4 יכולים להתבצע מרחוק לגמרי.\n\nוילה A ו-B כבר נמכרו. נותרו 2 בלבד.\n\nדברו איתנו עכשיו: ${wa}`;

    case 'payment':
      return `תנאי תשלום:\n\n- דמי הזמנה: ${KB.payment.reservation}\n- ${KB.payment.scheduleHe}\n\nוילה D: ${KB.villaD.php}\nוילה C: ${KB.villaC.php}\n\n3 מסלולים משפטיים זמינים - Deed of Assignment, Leasehold 25+25 או 99 שנים, Domestic Corporation 60/40.\n\nהסכם מס כפל ישראל-פיליפינים פעיל מ-1997.\n\nרוצה פרטים נוספים? ${wa}`;

    case 'management':
      return `ניהול הנכס:\n\n${KB.management}\n\nעמלת ניהול: 20-25% מההכנסה ברוטו.\nהכנסה נטו אחרי ניהול: 12-18% תשואה שנתית.\n\nזו השקעה פסיבית לחלוטין - אתה לא מנהל כלום.\n\nרוצה לשמוע עוד? ${wa}`;

    case 'tourism':
      return `נתוני תיירות בוהול:\n\n${KB.tourism}\n\n- 2019: 1,581,904 תיירים (שיא טרום קורונה)\n- 2020: 177,341 (-88.8% קורונה)\n- 2022: 535,803 (+198% התאוששות)\n- 2023: 1,012,854 (חציית מיליון!)\n- 2024: 1,369,945 (+35.2%)\n- 2025: 1,427,362 (שיא כל הזמנים)\n\nUNESCO Global Geopark - הראשון והיחיד בפיליפינים.\n\n${wa}`;

    case 'infrastructure':
      return `תשתיות בפיתוח:\n\n${KB.infrastructureHe}\n\n- שדה תעופה: 2.22M נוסעים, מתרחב ל-4M עד 2030\n- גשר שלישי: מימון צרפתי, גישות כבר הושלמו\n- Panglao Shores: 57 הקטר, 6+ מלונות, 1,000+ יחידות דיור\n- JW Marriott: 7 הקטר, 80 חדרים + 70 דירות ממותגות\n\nכשהתשתיות מושלמות, המחירים בדרך כלל עוקבים.\n\n${wa}`;

    case 'bdo':
      return `מימון BDO מיועד לרוכשים פיליפינים:\n\n${KB.bdoHe}\n\nלרוכשים ישראלים: תשלום ב-3 שלבים - ${KB.payment.scheduleHe}.\nדמי הזמנה: ${KB.payment.reservation} בלבד.\n\n${wa}`;

    default:
      return `תודה על הפנייה! אני כאן לענות על כל שאלה.\n\nהנה מה שכדאי לדעת:\n- 2 וילות יוקרה אחרונות בפנגלאו, בוהול\n- מחיר: ${KB.villaD.php} (וילה D) / ${KB.villaC.php} (וילה C)\n- הכנסה: ${KB.income.monthly} לחודש מ-Airbnb מאומת\n- תשואת שכירות ברוטו: כ-14.6%\n- 3 מסלולים משפטיים לרוכשים זרים\n\nעל מה תרצה לשמוע יותר? מחיר, תשואה, מיקום, משפטי, או השוואה לנדל"ן בישראל?\n\n${wa}`;
  }
}

function buildEnglishResponse(intent: Intent, message: string): string {
  const wa = `WhatsApp: ${KB.whatsapp.marketing} (Marketing) / ${KB.whatsapp.office} (Office)`;

  switch (intent) {
    case 'greeting':
      return `Welcome! I'm the investment consultant for Panglao Prime Villas.\n\nWe have 2 remaining luxury villas in Panglao, Bohol, Philippines:\n- Villa C: ${KB.villaC.php}\n- Villa D: ${KB.villaD.php}\n\nVerified monthly Airbnb income: ${KB.income.monthly}.\nAnnual ROI: ${KB.income.grossYield}.\n\nWhat would you like to know about?\n\n${wa}`;

    case 'pricing':
      return `Villa Pricing:\n\n**Villa C** (lot: ${KB.villaC.lot}): ${KB.villaC.php}\n**Villa D** (lot: ${KB.villaD.lot}): ${KB.villaD.php}\n\nReservation fee: ${KB.payment.reservation}\n\nPayment terms: ${KB.payment.schedule}\n\n${KB.bdo}\n\nBoth villas include: ${KB.specs}\n\nVillas A and B are already SOLD. 2 remaining.\n\nWould you like to discuss ROI or payment options? ${wa}`;

    case 'roi':
      return `Verified Investment Returns:\n\n- Monthly income: ${KB.income.monthly} (verified Airbnb data)\n- Annual gross: ${KB.income.annual}\n- Occupancy: ${KB.income.occupancy} (vs ${KB.income.marketAvg} market average - 33% better)\n- Annual ROI: ${KB.income.grossYield} gross\n- 5-year appreciation: ${KB.income.appreciation}\n- 5-year cumulative ROI: ${KB.income.roi5yr}\n\n${KB.fiveYearMath}\n\nData source: Airbtics + AirROI + BSP 2025.\n\nWant to discuss the numbers with our team? ${wa}`;

    case 'legal':
      return `Legal Ownership Options for Foreign Buyers:\n\n1. **Deed of Assignment** (most popular): ${KB.legal[0]}\n2. **Leasehold 25+25**: ${KB.legal[1]}\n3. **Domestic Corporation**: ${KB.legal[2]}\n\nThe process is designed for remote review with digital KYC, subject to final legal checks and client documentation.\n\nWant to speak with our legal team? ${wa}`;

    case 'location':
      return `Premium Location:\n\n${KB.location}\n\nThe villa is positioned between two 5-star resort anchors in the premium resort zone of Panglao.\n\nTourism: ${KB.tourism}\n\nTake a virtual tour: ${KB.virtualTour}\n\n${wa}`;

    case 'specs':
      return `Villa Specifications:\n\n${KB.specs}\n\nGround floor: Living room, dining, kitchen with pool access, maid's quarter\n2nd floor: Bedroom 1 (17.3 sqm) + Guest room (24.77 sqm), private balcony\n3rd floor: Master bedroom (25.57 sqm) + Bedroom 2, private balcony\nRoof deck: Outdoor lounge, kitchen, jacuzzi (6.37 sqm), dining, 31.49 sqm open area, full sea view\n\nTotal floor area: 263.78 sqm per villa.\n\nWant to see the architectural plans? ${wa}`;

    case 'comparison': {
      const target = detectComparisonTarget(message);
      if (target && KB.comparisons[target as keyof typeof KB.comparisons]) {
        const comp = KB.comparisons[target as keyof typeof KB.comparisons];
        return `${comp}\n\nPanglao is currently where Bali was 10 years ago on the tourism growth curve - 1.4M visitors vs Bali's 16.4M. That means significant appreciation runway ahead.\n\nWant a personalized comparison for your market? ${wa}`;
      }
      return `Panglao vs Other Markets:\n\n- ${KB.comparisons.boracay}\n- ${KB.comparisons.singapore}\n- ${KB.comparisons.usa}\n- ${KB.comparisons.dubai}\n\nPanglao is at the sweet spot: proven demand, but not yet fully priced. The infrastructure (airport expansion, JW Marriott, PHP 25B township) is being built NOW.\n\nWhich market would you like to compare in detail? ${wa}`;
    }

    case 'reservation':
      return `Great that you're interested!\n\nReservation Process:\n1. Choose your villa (C or D)\n2. Sign reservation agreement\n3. Transfer ${KB.payment.reservation} reservation fee\n4. KYC verification (passport + proof of funds)\n5. Final purchase agreement\n6. Payment: ${KB.payment.schedule}\n\nSteps 1-4 can be done completely remotely.\n\nVilla A and B are SOLD. Only 2 remain.\n\nLet's talk: ${wa}`;

    case 'payment':
      return `Payment Structure:\n\n- Reservation: ${KB.payment.reservation}\n- ${KB.payment.schedule}\n\nVilla D: ${KB.villaD.php}\nVilla C: ${KB.villaC.php}\n\n${KB.bdo}\n\nFor foreign buyers: 3 legal ownership structures available.\n\nNeed details? ${wa}`;

    case 'management':
      return `Property Management:\n\n${KB.management}\n\nManagement fee: 20-25% of gross rental income.\nNet annual ROI after management: 12-18%.\n\nThis is a fully passive investment - you don't manage anything.\n\n${wa}`;

    case 'tourism':
      return `Bohol Tourism Data:\n\n${KB.tourism}\n\nYear-by-year arrivals:\n- 2019: 1,581,904 (pre-pandemic peak)\n- 2020: 177,341 (-88.8% pandemic)\n- 2022: 535,803 (+198% recovery)\n- 2023: 1,012,854 (crossed 1M!)\n- 2024: 1,369,945 (+35.2%)\n- 2025: 1,427,362 (all-time record)\n\nUNESCO Global Geopark - Philippines' first and only.\nBest Tourism Province 2025-2027.\n\n${wa}`;

    case 'infrastructure':
      return `Infrastructure Development:\n\n${KB.infrastructure}\n\n- Airport: 2.22M passengers (exceeding 2M capacity), expanding to 4M by 2030\n- Third Bridge: PHP 7.15B, French government financing, approach roads completed\n- Panglao Shores: PHP 25B, 57 hectares, 6+ hotels, 1,000+ residential units\n- JW Marriott: 7-hectare oceanfront, 80 rooms + 70 branded residences\n\nHistorical precedent: new bridges cause 20-40% land appreciation within 5 years.\n\n${wa}`;

    case 'bdo':
      return `BDO Bank Financing:\n\n${KB.bdo}\n\nFor international buyers: flexible payment terms - ${KB.payment.schedule}.\nReservation fee: ${KB.payment.reservation} only.\n\n${wa}`;

    default:
      return `Thank you for reaching out!\n\nHere's what you should know about Panglao Prime Villas:\n- 2 remaining luxury villas in Panglao, Bohol\n- Price: ${KB.villaD.php} to ${KB.villaC.php}\n- Income: ${KB.income.monthly}/month verified Airbnb\n- ROI: ${KB.income.grossYield} annually\n- 3 legal ownership structures for foreign buyers\n\nWhat would you like to know more about? Pricing, ROI, location, legal structures, or comparisons to other markets?\n\n${wa}`;
  }
}

// ===================================================================
// LEAD QUALIFICATION (same as before)
// ===================================================================
function analyzeConversation(history: ChatMessage[], latestReply: string) {
  const allText = [...history.map(m => m.content), latestReply].join(' ').toLowerCase();
  const signals: string[] = [];
  let score = 10;

  if (/budget|afford|price|cost|how much|כמה|מחיר/i.test(allText)) { score += 15; signals.push('asked_about_price'); }
  if (/32\.?5.*million|35.*million|php\s*3[25]|1[,.]5[3]|1[,.]6[5]/i.test(allText)) { score += 10; signals.push('discussed_specific_price'); }
  if (/invest|roi|return|income|yield|rental|תשואה|הכנסה/i.test(allText)) { score += 20; signals.push('investment_interest'); }
  if (/395|17.*25%|airbnb/i.test(allText)) { score += 10; signals.push('discussed_roi_details'); }
  if (/reserv|book|schedule|visit|viewing|להזמין|לשריין/i.test(allText)) { score += 30; signals.push('booking_intent'); }
  if (/whatsapp|call|contact|meet|וואטסאפ|תתקשר/i.test(allText)) { score += 15; signals.push('contact_intent'); }
  if (/payment|financ|loan|bdo|installment|תשלום|מימון/i.test(allText)) { score += 20; signals.push('financing_interest'); }
  if (/ownership|deed|leasehold|corporation|legal|בעלות|משפטי/i.test(allText)) { score += 15; signals.push('ownership_inquiry'); }
  if (/when|timeline|ready|soon|this year|מתי/i.test(allText)) { score += 10; signals.push('timeline_discussed'); }

  const msgCount = history.filter(m => m.role === 'user').length;
  if (msgCount >= 5) { score += 15; signals.push('highly_engaged'); }
  else if (msgCount >= 3) { score += 5; signals.push('engaged'); }

  score = Math.min(score, 100);
  const status = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';
  return { score, status, signals };
}

function buildSalesHandoff(params: {
  sessionId: string;
  language: 'he' | 'en';
  qualification: { score: number; status: string; signals: string[] };
  contactInfo: { email: string | null; phone: string | null; name: string | null };
  history: ChatMessage[];
}) {
  const recentUserMessages = params.history
    .filter((message) => message.role === 'user')
    .slice(-3)
    .map((message) => message.content.replace(/\s+/g, ' ').slice(0, 160));

  const alertText = [
    `HOT/WARM lead from Panglao Prime Villas chat`,
    `Status: ${params.qualification.status}`,
    `Score: ${params.qualification.score}`,
    `Language: ${params.language}`,
    `Session: ${params.sessionId}`,
    `Name: ${params.contactInfo.name ?? 'not provided'}`,
    `Phone: ${params.contactInfo.phone ?? 'not provided'}`,
    `Email: ${params.contactInfo.email ?? 'not provided'}`,
    `Signals: ${params.qualification.signals.join(', ') || 'none'}`,
    `Recent messages: ${recentUserMessages.join(' | ') || 'none'}`,
    `Next action: schedule a real call with a Blue Everest sales agent.`,
  ].join('\n');

  return {
    required: params.qualification.status === 'hot' || params.qualification.status === 'warm',
    priority: params.qualification.status === 'hot' ? 'high' : params.qualification.status === 'warm' ? 'medium' : 'low',
    alertText,
    whatsapp: {
      marketing: `https://wa.me/639542555553?text=${encodeURIComponent(alertText)}`,
      office: `https://wa.me/639958565865?text=${encodeURIComponent(alertText)}`,
    },
  };
}

// ===================================================================
// CONTACT INFO EXTRACTION
// ===================================================================
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}(?:[-.\s]?\d{1,4})?/;
const NAME_RE = /(?:(?:my name is|i'm|i am|call me|אני|שמי|קוראים לי)\s+)([A-Za-z\u0590-\u05FF\u0400-\u04FF\uAC00-\uD7AF]{2,}(?:\s+[A-Za-z\u0590-\u05FF\u0400-\u04FF\uAC00-\uD7AF]{2,})?)/i;

function extractContactInfo(allMessages: string[]): { email: string | null; phone: string | null; name: string | null } {
  const userText = allMessages.join(' ');

  // Extract email
  const emailMatch = userText.match(EMAIL_RE);
  const email = emailMatch ? emailMatch[0].toLowerCase() : null;

  // Extract phone - only from messages that look like they're providing a phone number
  let phone: string | null = null;
  for (const msg of allMessages) {
    // Skip messages that are just chatbot keywords
    if (msg.length < 6) continue;
    const phoneMatch = msg.match(PHONE_RE);
    if (phoneMatch) {
      const candidate = phoneMatch[0].replace(/[-.\s()]/g, '');
      // Must be at least 7 digits to be a real phone number
      if (candidate.replace(/\D/g, '').length >= 7) {
        phone = phoneMatch[0].trim();
        break;
      }
    }
  }

  // Extract name
  const nameMatch = userText.match(NAME_RE);
  const name = nameMatch ? nameMatch[1].trim() : null;

  return { email, phone, name };
}

// Contact collection prompt - appended when score >= 40 and no contact info yet
function buildContactPrompt(lang: 'he' | 'en', hasName: boolean, hasPhone: boolean, hasEmail: boolean): string {
  if (hasPhone && hasEmail) return '';

  if (lang === 'he') {
    if (!hasPhone && !hasEmail) {
      return '\n\nאם תרצה שנחזור אליך עם מידע נוסף, השאר מספר טלפון או אימייל ונציג יצור קשר תוך שעות.';
    }
    if (!hasPhone) return '\n\nהשאר מספר טלפון ונציג ייצור קשר ישירות.';
    return '\n\nהשאר אימייל ונשלח לך חומרים נוספים.';
  }

  if (!hasPhone && !hasEmail) {
    return '\n\nIf you\'d like us to follow up, leave your phone number or email and our team will reach out within hours.';
  }
  if (!hasPhone) return '\n\nLeave your phone number and our team will contact you directly.';
  return '\n\nLeave your email and we\'ll send you additional materials.';
}

// ===================================================================
// MAIN HANDLER
// ===================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.message || typeof body.message !== 'string') {
      return Response.json({ error: 'Missing required field: message' }, { status: 400 });
    }

    const userMessage = body.message.trim();
    const sessionId = body.sessionId ?? randomUUID();
    const conversationHistory: ChatMessage[] = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];
    const lang = detectLang(userMessage);

    // Check if this conversation is in human takeover mode
    const supabaseCheck = createSupabaseAdmin();
    if (supabaseCheck) {
      const { data: convo } = await supabaseCheck
        .from('conversations')
        .select('metadata')
        .eq('session_id', sessionId)
        .maybeSingle();

      const takeoverMetadata = (convo?.metadata ?? {}) as Record<string, unknown>;
      if (takeoverMetadata.agent_mode === 'human_takeover') {
        // AI is paused - just save the user message, don't generate a reply
        const now = new Date().toISOString();
        const fullHistory = [...conversationHistory, { role: 'user' as const, content: userMessage }];
        await supabaseCheck
          .from('conversations')
          .update({
            messages: fullHistory.map(m => ({ role: m.role, content: m.content, timestamp: now })),
            last_message_at: now,
            metadata: {
              ...takeoverMetadata,
              last_user_message_at: now,
            },
          })
          .eq('session_id', sessionId);

        return Response.json({
          reply: null,
          sessionId,
          language: lang,
          agentMode: 'human_takeover',
          takenOverBy: takeoverMetadata.taken_over_by,
          waitingForHuman: true,
        });
      }
    }

    // -- Extract contact info from all user messages --
    const allUserMessages = [
      ...conversationHistory.filter(m => m.role === 'user').map(m => m.content),
      userMessage,
    ];
    const contactInfo = extractContactInfo(allUserMessages);

    const salesOs = buildSalesOsResponse({
      message: userMessage,
      history: conversationHistory,
      channel: 'website_chat',
      preferredLanguage: lang,
      leadName: contactInfo.name,
    });

    let reply = salesOs.reply;

    const qualification = analyzeConversation(
      [...conversationHistory, { role: 'user', content: userMessage }],
      reply
    );

    // -- Append contact collection prompt if score >= 40 and missing contact --
    if (qualification.score >= 40) {
      const contactPrompt = buildContactPrompt(lang, !!contactInfo.name, !!contactInfo.phone, !!contactInfo.email);
      if (contactPrompt) {
        reply += contactPrompt;
      }
    }

    // -- Persist conversation and lead to Supabase --
    const now = new Date().toISOString();
    const fullHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: reply },
    ];

    try {
      const supabase = createSupabaseAdmin();
        if (!supabase) {
          throw new Error('Supabase not configured. Skipping DB persistence.');
        }
        const projectId = await getOrCreatePanglaoProjectId(supabase);
        if (!projectId) {
          throw new Error('Panglao project_id unavailable. Skipping DB persistence.');
        }

        // 1. Upsert conversation record by session_id
        const { data: existingConvo } = await supabase
          .from('conversations')
          .select('id, lead_id, metadata')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (existingConvo) {
          // Update existing conversation
          await supabase
            .from('conversations')
            .update({
              messages: fullHistory.map((m, i) => ({
                role: m.role,
                content: m.content,
                timestamp: i === fullHistory.length - 2
                  ? now // user message
                  : i === fullHistory.length - 1
                  ? now // assistant reply
                  : undefined,
              })),
              lead_signals: qualification.signals,
              language: lang,
              last_message_at: now,
              metadata: {
                ...((existingConvo.metadata ?? {}) as Record<string, unknown>),
                channel: 'chatbot',
                lead_score: qualification.score,
                lead_status: qualification.status,
                signals: qualification.signals,
                sales_os: {
                  intent: salesOs.intent,
                  next_best_action: salesOs.nextBestAction,
                  crm_summary: salesOs.crmSummary,
                  confidence: salesOs.confidence,
                  should_escalate: salesOs.shouldEscalate,
                },
                last_message_at: now,
              },
            })
            .eq('id', existingConvo.id);

          // Update linked lead if exists
          if (existingConvo.lead_id) {
            const leadUpdate: Record<string, unknown> = {
              lead_score: qualification.score,
              lead_status: qualification.status,
              funnel_stage: qualification.status === 'hot' ? 'qualified' : 'new',
              raw_data: {
                chatbot_session_id: sessionId,
                conversations: fullHistory,
                last_message_at: now,
                signals: qualification.signals,
                sales_os: {
                  intent: salesOs.intent,
                  next_best_action: salesOs.nextBestAction,
                  crm_summary: salesOs.crmSummary,
                  confidence: salesOs.confidence,
                  should_escalate: salesOs.shouldEscalate,
                },
              },
              last_contact_at: now,
              updated_at: now,
            };
            // Save extracted contact info
            if (contactInfo.name) leadUpdate.full_name = contactInfo.name;
            if (contactInfo.email) leadUpdate.email = contactInfo.email;
            if (contactInfo.phone) { leadUpdate.phone = contactInfo.phone; leadUpdate.whatsapp = contactInfo.phone; }
            await supabase.from('leads').update(leadUpdate).eq('id', existingConvo.lead_id);
          }
        } else {
          // Only create a new conversation+lead if score >= 20
          // (visitor asked at least one substantive question)
          if (qualification.score >= 20) {
            // Create lead first
            const { data: newLead } = await supabase
              .from('leads')
              .insert({
                project_id: projectId,
                source: 'chatbot',
                full_name: contactInfo.name ?? null,
                email: contactInfo.email ?? null,
                phone: contactInfo.phone ?? null,
                whatsapp: contactInfo.phone ?? null,
                lead_score: qualification.score,
                lead_status: qualification.status,
                funnel_stage: qualification.status === 'hot' ? 'qualified' : 'new',
                preferred_language: lang,
                raw_data: {
                  chatbot_session_id: sessionId,
                  conversations: fullHistory,
                  last_message_at: now,
                  signals: qualification.signals,
                  sales_os: {
                    intent: salesOs.intent,
                    next_best_action: salesOs.nextBestAction,
                    crm_summary: salesOs.crmSummary,
                    confidence: salesOs.confidence,
                    should_escalate: salesOs.shouldEscalate,
                  },
                },
                first_contact_at: now,
                last_contact_at: now,
                created_at: now,
                updated_at: now,
              })
              .select('id')
              .single();

            // Create conversation linked to lead
            await supabase.from('conversations').insert({
              lead_id: newLead?.id ?? null,
              session_id: sessionId,
              messages: fullHistory.map(m => ({
                role: m.role,
                content: m.content,
                timestamp: now,
              })),
              language: lang,
              source: 'website',
              lead_signals: qualification.signals,
              started_at: now,
              last_message_at: now,
              metadata: {
                channel: 'chatbot',
                lead_score: qualification.score,
                lead_status: qualification.status,
                signals: qualification.signals,
                sales_os: {
                  intent: salesOs.intent,
                  next_best_action: salesOs.nextBestAction,
                  crm_summary: salesOs.crmSummary,
                  confidence: salesOs.confidence,
                  should_escalate: salesOs.shouldEscalate,
                },
              },
            });

            // Log HOT lead alert
            if (qualification.status === 'hot' && newLead?.id) {
              await supabase.from('lead_activities').insert({
                lead_id: newLead.id,
                activity_type: 'hot_lead_detected',
                description: `HOT lead from chatbot (score ${qualification.score}). Signals: ${qualification.signals.join(', ')}`,
                channel: 'chatbot',
                metadata: {
                  score: qualification.score,
                  signals: qualification.signals,
                  session_id: sessionId,
                  conversation_preview: fullHistory.slice(-4).map(m => `${m.role}: ${m.content.slice(0, 100)}`),
                },
                performed_by: 'system',
                created_at: now,
              });
            }
          } else {
            // Low-score: still save the conversation but without a lead
            await supabase.from('conversations').insert({
              session_id: sessionId,
              messages: fullHistory.map(m => ({
                role: m.role,
                content: m.content,
                timestamp: now,
              })),
              language: lang,
              source: 'website',
              lead_signals: qualification.signals,
              started_at: now,
              last_message_at: now,
              metadata: {
                channel: 'chatbot',
                lead_score: qualification.score,
                lead_status: qualification.status,
                signals: qualification.signals,
                sales_os: {
                  intent: salesOs.intent,
                  next_best_action: salesOs.nextBestAction,
                  crm_summary: salesOs.crmSummary,
                  confidence: salesOs.confidence,
                  should_escalate: salesOs.shouldEscalate,
                },
              },
            });
          }
        }

        // If an existing conversation just became HOT, log the alert
        if (existingConvo?.lead_id && qualification.status === 'hot') {
          const { data: prevLead } = await supabase
            .from('leads')
            .select('lead_status')
            .eq('id', existingConvo.lead_id)
            .single();

          if (prevLead && prevLead.lead_status !== 'hot') {
            await supabase.from('lead_activities').insert({
              lead_id: existingConvo.lead_id,
              activity_type: 'hot_lead_detected',
              description: `Lead upgraded to HOT (score ${qualification.score}). Signals: ${qualification.signals.join(', ')}`,
              channel: 'chatbot',
              metadata: {
                score: qualification.score,
                signals: qualification.signals,
                session_id: sessionId,
              },
              performed_by: 'system',
              created_at: now,
            });
          }
        }
      // Log chatbot as an agent run so it shows in the dashboard
      const supabaseForLog = createSupabaseAdmin();
      if (supabaseForLog) {
        await supabaseForLog.from('agent_runs').insert({
          agent_id: 'sales_chatbot',
          status: 'complete',
          input: { message: userMessage.slice(0, 200), session_id: sessionId },
          output: { summary: `${lang === 'he' ? 'Hebrew' : 'English'} visitor, score ${qualification.score} (${qualification.status}). Contact: ${contactInfo.email || contactInfo.phone || 'none yet'}`, reply_preview: reply.slice(0, 200) },
          triggered_by: 'visitor_message',
          total_cost_usd: 0,
          total_tokens: 0,
          latency_ms: 0,
          started_at: now,
          completed_at: now,
          created_at: now,
        });
        // fire-and-forget, errors handled by outer catch
      }
    } catch (dbErr) {
      console.error('[chat] DB persistence error:', dbErr);
    }

    const salesHandoff = buildSalesHandoff({
      sessionId,
      language: lang,
      qualification,
      contactInfo,
      history: fullHistory,
    });

    return Response.json({
      reply,
      sessionId,
      language: lang,
      salesOs: {
        intent: salesOs.intent,
        nextBestAction: salesOs.nextBestAction,
        crmSummary: salesOs.crmSummary,
        leadSignals: salesOs.leadSignals,
        shouldEscalate: salesOs.shouldEscalate,
      },
      leadQualification: qualification,
      salesHandoff,
      suggestedActions: qualification.status === 'hot'
        ? ['Connect to sales via WhatsApp', 'Send reservation form', 'Schedule real sales call']
        : qualification.status === 'warm'
        ? ['Send property brochure', 'Offer consultation', 'Prepare manual WhatsApp handoff']
        : ['Continue conversation'],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[chat] POST error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
