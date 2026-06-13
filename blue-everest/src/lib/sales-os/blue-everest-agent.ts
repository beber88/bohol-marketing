export type SalesOsLanguage = 'he' | 'en';
export type SalesOsChannel = 'website_chat' | 'facebook_dm' | 'facebook_comment' | 'whatsapp' | 'email' | 'crm';
export type SalesOsIntent =
  | 'greeting'
  | 'pricing'
  | 'roi'
  | 'location'
  | 'specs'
  | 'legal'
  | 'financing'
  | 'payment'
  | 'availability'
  | 'service'
  | 'objection'
  | 'handoff'
  | 'general';

export type SalesOsMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
};

export type SalesOsProperty = {
  projectId: string;
  projectName: string;
  developer: string;
  market: 'IL' | 'PH' | 'INTL';
  status: 'active' | 'sold_out' | 'coming_soon';
  location: string;
  availableUnits: Array<{
    name: string;
    pricePHP?: string;
    priceILS?: string;
    bedrooms?: number;
    floorArea?: string;
    lotArea?: string;
  }>;
  proofPoints: string[];
  ownershipSolutions: string[];
  financingNotes: string[];
  cta: {
    marketingWhatsapp: string;
    officeWhatsapp: string;
  };
};

export type SalesOsResponse = {
  language: SalesOsLanguage;
  intent: SalesOsIntent;
  reply: string;
  nextBestAction: string;
  crmSummary: string;
  leadSignals: string[];
  confidence: number;
  shouldEscalate: boolean;
};

const HEBREW_REGEX = /[\u0590-\u05FF]/;

export const PANGALAO_PRIME_VILLAS: SalesOsProperty = {
  projectId: 'panglao-prime-villas',
  projectName: 'Panglao Prime Villas',
  developer: 'Blue Everest Asset Group Holding Inc.',
  market: 'INTL',
  status: 'active',
  location: 'Bingag, Panglao Island, Bohol, Philippines, 60 seconds walk to Panglao Beach',
  availableUnits: [
    {
      name: 'Villa D',
      pricePHP: 'PHP 32,500,000',
      priceILS: '1,535,000 ש"ח',
      bedrooms: 4,
      floorArea: '263.78 sqm',
      lotArea: '182.03 sqm',
    },
    {
      name: 'Villa C',
      pricePHP: 'PHP 35,000,000',
      priceILS: '1,650,000 ש"ח',
      bedrooms: 4,
      floorArea: '263.78 sqm',
      lotArea: '192.85 sqm',
    },
  ],
  proofPoints: [
    'PHP 395,000 verified monthly Airbnb income model',
    '17-25% gross annual ROI',
    '65% occupancy model',
    '136.9% projected 5-year cumulative ROI',
    'Bohol tourism reached 1,427,362 arrivals in 2025',
    'BDO Bank financing available for eligible Filipino buyers',
  ],
  ownershipSolutions: [
    'Deed of Assignment',
    'Leasehold 25+25',
    'Domestic Corporation',
  ],
  financingNotes: [
    'BDO Bank financing may be available for eligible Filipino buyers',
    'International buyers use payment schedule and legal ownership structure review',
  ],
  cta: {
    marketingWhatsapp: '+639542555553',
    officeWhatsapp: '+639958565865',
  },
};

const AGENT_PROFILE = {
  name: 'David',
  role: 'Blue Everest senior sales and customer care agent',
  promise:
    'Human, precise, warm, legally careful and commercially sharp real estate guidance across every customer channel.',
  principles: [
    'Never invent facts, prices, legal promises, financing approval or availability.',
    'Use one full language per lead. Hebrew lead gets Hebrew only. English lead gets English only.',
    'Ask one useful question at the end unless the lead needs direct handoff.',
    'Move every conversation toward a clear next step: qualify, educate, schedule, reserve or escalate.',
    'Keep the CRM updated with status, urgency, next action and missing data.',
    'After a project sells out, switch to waitlist and next-property matching instead of dead-ending the lead.',
  ],
};

function detectLanguage(text: string, fallback?: string | null): SalesOsLanguage {
  if (fallback === 'he' || fallback === 'en') return fallback;
  return HEBREW_REGEX.test(text) ? 'he' : 'en';
}

function detectIntent(text: string): SalesOsIntent {
  const lower = text.toLowerCase();
  if (/^(hi|hello|hey|shalom|שלום|היי|בוקר טוב|ערב טוב)/.test(lower)) return 'greeting';
  if (/price|cost|how much|כמה|מחיר|עולה|pricing|תקציב/.test(lower)) return 'pricing';
  if (/roi|return|income|yield|airbnb|rental|תשואה|הכנסה|השכרה|רווח/.test(lower)) return 'roi';
  if (/where|location|beach|airport|מיקום|איפה|חוף|שדה/.test(lower)) return 'location';
  if (/spec|bedroom|pool|sqm|floor|jacuzzi|מפרט|חדרים|בריכה|שטח|גקוזי|ג׳קוזי/.test(lower)) return 'specs';
  if (/legal|ownership|foreign|lease|deed|corp|בעלות|חוקי|משפט|חכירה|תאגיד/.test(lower)) return 'legal';
  if (/finance|financing|loan|bdo|mortgage|מימון|הלוואה|משכנתא/.test(lower)) return 'financing';
  if (/payment|installment|reservation|deposit|תשלום|מקדמה|שריון|הזמנה/.test(lower)) return 'payment';
  if (/available|left|sold|unit|נותר|נשאר|זמין|נמכר/.test(lower)) return 'availability';
  if (/problem|issue|support|help|service|בעיה|שירות|עזרה|תמיכה/.test(lower)) return 'service';
  if (/expensive|far|risk|think|later|יקר|רחוק|סיכון|אחשוב|לא בטוח/.test(lower)) return 'objection';
  if (/call|talk|whatsapp|meeting|schedule|שיחה|לדבר|פגישה|וואטסאפ/.test(lower)) return 'handoff';
  return 'general';
}

function leadSignalsFor(intent: SalesOsIntent) {
  const map: Record<SalesOsIntent, string[]> = {
    greeting: [],
    pricing: ['pricing_interest'],
    roi: ['roi_interest'],
    location: ['location_interest'],
    specs: ['villa_interest'],
    legal: ['legal_question'],
    financing: ['financing_question'],
    payment: ['payment_interest'],
    availability: ['availability_interest'],
    service: ['service_need'],
    objection: ['objection_raised'],
    handoff: ['contact_request'],
    general: [],
  };
  return map[intent];
}

function unitLine(unit: SalesOsProperty['availableUnits'][number], language: SalesOsLanguage) {
  const price = language === 'he' ? unit.priceILS : unit.pricePHP;
  return language === 'he'
    ? `${unit.name}: ${price}, ${unit.bedrooms ?? 4} חדרי שינה, ${unit.floorArea ?? '263.78 sqm'}`
    : `${unit.name}: ${price}, ${unit.bedrooms ?? 4} bedrooms, ${unit.floorArea ?? '263.78 sqm'}`;
}

function complianceFooter(property: SalesOsProperty, language: SalesOsLanguage) {
  if (language === 'he') {
    return `WhatsApp שיווק: ${property.cta.marketingWhatsapp} | WhatsApp משרד: ${property.cta.officeWhatsapp}`;
  }
  return `WhatsApp Marketing: ${property.cta.marketingWhatsapp} | WhatsApp Office: ${property.cta.officeWhatsapp}`;
}

function buildHebrewReply(intent: SalesOsIntent, property: SalesOsProperty, leadName?: string) {
  const name = leadName ? ` ${leadName}` : '';
  const units = property.availableUnits.map((unit) => unitLine(unit, 'he')).join('\n');
  const footer = complianceFooter(property, 'he');
  const ownership = property.ownershipSolutions.join(', ');

  if (property.status === 'sold_out') {
    return `שלום${name}, תודה שפנית אל Blue Everest.\n\nהפרויקט ${property.projectName} נמכר במלואו. אני יכול לצרף אותך לרשימת עדכון לנכסים הבאים שלנו ולבדוק איזה פרופיל השקעה מתאים לך: תקציב, מדינה מועדפת ולוח זמנים.\n\nאיזה סוג נכס תרצה שנחפש עבורך?\n\n${footer}`;
  }

  switch (intent) {
    case 'pricing':
    case 'availability':
      return `שלום${name}, כרגע נותרו ב-${property.projectName}:\n\n${units}\n\nלרוכשים ישראלים יש 3 פתרונות בעלות: ${ownership}.\n\nכדי לכוון אותך נכון, האם המטרה היא הכנסה משכירות, שימוש עצמי או שילוב?\n\n${footer}`;
    case 'roi':
      return `שלום${name}, מבחינת השקעה, ${property.projectName} מבוסס על מודל הכנסה של PHP 395,000 לחודש, 17-25% תשואה שנתית ברוטו ו-65% תפוסה.\n\nלרוכשים ישראלים נציג את מסגרת המחירים בשקלים: Villa D ב-1,535,000 ש"ח ו-Villa C ב-1,650,000 ש"ח. קיימים 3 פתרונות בעלות: ${ownership}.\n\nרוצה שאכין לך השוואת תשואה מול נכס בישראל?\n\n${footer}`;
    case 'legal':
      return `שלום${name}, לרוכש זר יש 3 פתרונות בעלות מרכזיים בפרויקט:\n\n1. Deed of Assignment\n2. Leasehold 25+25\n3. Domestic Corporation\n\nהבחירה תלויה במטרה: הכנסה משכירות, שימוש עצמי, החזקה משפחתית או תיק נכסים רחב יותר.\n\nמה המטרה העיקרית שלך ברכישה?\n\n${footer}`;
    case 'handoff':
      return `שלום${name}, בשמחה. כדי שהשיחה תהיה יעילה, אבדוק איתך 3 דברים: תקציב, לוח זמנים, והאם מעניין אותך יותר Villa C או Villa D.\n\nאפשר לתאם שיחה קצרה היום או מחר?\n\n${footer}`;
    case 'service':
      return `שלום${name}, אני כאן לעזור. כתוב לי בבקשה מה בדיוק צריך לפתור: מידע על הווילה, תשלום, מסמכים, בעלות, מימון או תיאום שיחה.\n\nאני אכוון אותך לשלב הבא בצורה מסודרת.\n\n${footer}`;
    default:
      return `שלום${name}, כאן David מ-Blue Everest.\n\n${property.projectName} כולל כרגע 2 וילות זמינות:\n${units}\n\nהפרויקט נמצא ב-${property.location}. לרוכשים ישראלים יש 3 פתרונות בעלות: ${ownership}.\n\nעל מה תרצה לשמוע קודם: מחיר, תשואה, בעלות משפטית או תיאום שיחה?\n\n${footer}`;
  }
}

function buildEnglishReply(intent: SalesOsIntent, property: SalesOsProperty, leadName?: string) {
  const name = leadName ? ` ${leadName}` : '';
  const units = property.availableUnits.map((unit) => unitLine(unit, 'en')).join('\n');
  const footer = complianceFooter(property, 'en');

  if (property.status === 'sold_out') {
    return `Hi${name}, thanks for reaching Blue Everest.\n\n${property.projectName} is now sold out. I can add you to our next-property list and match you with future opportunities by budget, location and timeline.\n\nWhat type of property are you looking for next?\n\n${footer}`;
  }

  switch (intent) {
    case 'pricing':
    case 'availability':
      return `Hi${name}, here are the current available units at ${property.projectName}:\n\n${units}\n\nThe verified Airbnb income model is PHP 395,000 per month, and BDO Bank financing may be available for eligible Filipino buyers.\n\nAre you looking mainly for investment income, family use or both?\n\n${footer}`;
    case 'roi':
      return `Hi${name}, the investment case is built around PHP 395,000 verified monthly Airbnb income, 17-25% gross annual ROI, 65% occupancy and 136.9% projected 5-year cumulative ROI.\n\nCurrent units:\n${units}\n\nWould you like a simple ROI breakdown for Villa C versus Villa D?\n\n${footer}`;
    case 'financing':
      return `Hi${name}, for eligible Filipino buyers, BDO Bank financing may be available. The current villas are Villa D at PHP 32,500,000 and Villa C at PHP 35,000,000.\n\nTo check the right path, may I ask your target budget and purchase timeline?\n\n${footer}`;
    case 'legal':
      return `Hi${name}, foreign buyers usually review 3 legal paths: ${property.ownershipSolutions.join(', ')}.\n\nThe right option depends on whether the goal is rental income, personal use, family holding or a broader property portfolio.\n\nWhat is your main purpose for buying?\n\n${footer}`;
    case 'handoff':
      return `Hi${name}, happy to help. For a useful sales call, I would confirm 3 things first: budget, timeline and whether Villa C or Villa D is the better fit.\n\nWould you prefer a short call today or tomorrow?\n\n${footer}`;
    case 'service':
      return `Hi${name}, I can help. Please tell me what you need: villa details, payment steps, documents, ownership, financing or scheduling a call.\n\nI will guide you to the right next step.\n\n${footer}`;
    default:
      return `Hi${name}, this is David from Blue Everest.\n\n${property.projectName} currently has 2 available villas:\n${units}\n\nThe project is located in ${property.location}. Key numbers: PHP 395,000 monthly Airbnb income model, 17-25% gross ROI and 4 bedrooms per villa.\n\nWhat would you like to discuss first: price, ROI, ownership, financing or a call?\n\n${footer}`;
  }
}

function nextAction(intent: SalesOsIntent, language: SalesOsLanguage) {
  if (language === 'he') {
    if (intent === 'handoff') return 'לתאם שיחה קצרה ולהכין תקציר CRM לפני השיחה.';
    if (intent === 'pricing' || intent === 'availability') return 'לאסוף תקציב, לוח זמנים והעדפת Villa C או Villa D.';
    if (intent === 'legal') return 'להסביר 3 פתרונות בעלות ולתאם בדיקה משפטית אם יש רצינות.';
    if (intent === 'objection') return 'לענות נקודתית לחשש ואז לשאול שאלת מיון אחת.';
    return 'להמשיך לשאלת מיון אחת ולהעביר לשיחה אם יש כוונת רכישה.';
  }

  if (intent === 'handoff') return 'Schedule a short call and prepare CRM brief before the call.';
  if (intent === 'pricing' || intent === 'availability') return 'Collect budget, timeline and Villa C or Villa D preference.';
  if (intent === 'legal') return 'Explain 3 ownership paths and escalate to legal review if intent is strong.';
  if (intent === 'objection') return 'Answer the concern directly, then ask one qualification question.';
  return 'Continue with one qualification question and move to a call if intent is present.';
}

export function buildSalesOsResponse(input: {
  message: string;
  history?: SalesOsMessage[];
  channel?: SalesOsChannel;
  preferredLanguage?: SalesOsLanguage | null;
  leadName?: string | null;
  property?: SalesOsProperty;
}): SalesOsResponse {
  const property = input.property ?? PANGALAO_PRIME_VILLAS;
  const historyText = (input.history ?? []).map((message) => message.content).join('\n');
  const language = detectLanguage(`${historyText}\n${input.message}`, input.preferredLanguage);
  const intent = detectIntent(input.message);
  const reply =
    language === 'he'
      ? buildHebrewReply(intent, property, input.leadName ?? undefined)
      : buildEnglishReply(intent, property, input.leadName ?? undefined);
  const leadSignals = leadSignalsFor(intent);
  const shouldEscalate = intent === 'handoff' || intent === 'payment' || intent === 'availability' || leadSignals.includes('contact_request');

  return {
    language,
    intent,
    reply,
    nextBestAction: nextAction(intent, language),
    crmSummary:
      language === 'he'
        ? `${AGENT_PROFILE.name} זיהה כוונת ${intent}. יש לעדכן CRM, לשמור שפה אחידה ולפעול לפי השלב הבא.`
        : `${AGENT_PROFILE.name} detected ${intent} intent. Update CRM, keep language consistent and follow the next action.`,
    leadSignals,
    confidence: leadSignals.length > 0 ? 0.86 : 0.72,
    shouldEscalate,
  };
}

export function getSalesOsProfile() {
  return {
    agent: AGENT_PROFILE,
    defaultProperty: PANGALAO_PRIME_VILLAS,
    channels: ['website_chat', 'facebook_dm', 'facebook_comment', 'whatsapp', 'email', 'crm'],
    futureReady: {
      supportsNewProperties: true,
      soldOutBehavior: 'move lead to waitlist and match next property',
      languagePolicy: 'single full language per lead',
      crmPolicy: 'every reply includes next action, summary, signals and escalation flag',
    },
  };
}
