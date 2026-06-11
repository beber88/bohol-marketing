// src/app/api/marketing/community-agent/route.ts
// Community Agent API - handles comment replies and inbox responses

import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Hebrew detection
function detectLang(text: string): 'he' | 'en' {
  const heCount = (text.match(/[\u0590-\u05FF]/g) || []).length;
  return heCount > text.replace(/\s/g, '').length * 0.15 ? 'he' : 'en';
}

// Intent detection
type Intent = 'pricing' | 'roi' | 'legal' | 'tax' | 'comparison' | 'area' |
  'airbnb' | 'safety' | 'process' | 'visa' | 'currency' | 'infrastructure' |
  'demographics' | 'greeting' | 'general';

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/^(hi|hello|hey|shalom|שלום|תודה|thanks)/.test(t)) return 'greeting';
  if (/price|cost|כמה|מחיר|1[,.]5[35]|budget/.test(t)) return 'pricing';
  if (/roi|return|yield|תשואה|income|rental|הכנסה/.test(t)) return 'roi';
  if (/legal|own|deed|leasehold|חוקי|בעלות|corporation|חכירה/.test(t)) return 'legal';
  if (/tax|מס|capital gain|stamp|treaty|אמנת/.test(t)) return 'tax';
  if (/greece|יוון|thailand|תאילנד|cyprus|קפריסין|portugal|compare|השוואה/.test(t)) return 'comparison';
  if (/where|area|איפה|location|מיקום|cebu|manila|siargao|davao|clark/.test(t)) return 'area';
  if (/airbnb|occupancy|תפוסה|str|short.term|booking/.test(t)) return 'airbnb';
  if (/safe|risk|סיכון|בטוח|typhoon|dangerous/.test(t)) return 'safety';
  if (/how.*start|process|תהליך|איך מתחילים|step|שלב/.test(t)) return 'process';
  if (/visa|ויזה|srrv|live|לגור|residency/.test(t)) return 'visa';
  if (/peso|שער|currency|exchange|מטבע|העברה/.test(t)) return 'currency';
  if (/bridge|גשר|airport|שדה|marriott|infrastructure|תשתית/.test(t)) return 'infrastructure';
  if (/population|אוכלוסייה|median|age|demographic|young/.test(t)) return 'demographics';
  return 'general';
}

// Knowledge base for quick responses
const KB = {
  pricing: {
    he: 'וילה D: 1,535,000 ש"ח. וילה C: 1,650,000 ש"ח. הזמנה: 9,999 ש"ח. הכנסה חודשית: PHP 395,000 מאומת מ-Airbnb. ספקטרום מחירים בפיליפינים: מ-PHP 900/מ"ר (קרקע חקלאית) עד PHP 550,000/מ"ר (BGC מנילה). וילת יוקרה בפנגלאו עולה כמו דירת 3 חדרים בחיפה.',
    en: 'Villa D: PHP 32,500,000. Villa C: PHP 35,000,000. Reservation: PHP 200,000. Monthly income: PHP 395,000 verified Airbnb. Price spectrum: from PHP 900/sqm (agricultural) to PHP 550,000/sqm (BGC Manila). A Panglao luxury villa costs the same as a Haifa 3BR apartment.'
  },
  roi: {
    he: 'תשואה באזורי נופש: 8%-16%. הוילות שלנו: ROI שנתי 17%-25%, תפוסה 65%, הכנסה חודשית PHP 395,000. מס רווחי הון בפיליפינים: 6% בלבד (לעומת 25% בישראל). לפי הנתונים המאומתים, לא הבטחה.',
    en: 'Resort area yields: 8%-16%. Our villas: annual ROI 17%-25%, 65% occupancy, PHP 395,000/month income. Capital gains tax: 6% (vs 25% in Israel). Based on verified market data, not promises.'
  },
  legal: {
    he: '3 מסלולים לישראלים: (1) Deed of Assignment, בעלות מלאה על המבנה, מהירה ופשוטה. (2) חכירה 99 שנים (חוק RA 12252 חדש מספטמבר 2025), רישום רשמי. (3) חברה מקומית 60/40, בעלות מלאה כולל קרקע. יש אמנת מס ישראל-פיליפינים מ-1997. כדאי להתייעץ עם עו"ד פיליפיני.',
    en: '3 paths for foreign investors: (1) Deed of Assignment, full building ownership, fast and simple. (2) 99-year Leasehold (new RA 12252 law, Sep 2025), registered at Registry of Deeds. (3) Domestic Corporation 60/40, full ownership including land. Israel-PH tax treaty since 1997. Consult a Philippine attorney.'
  },
  tax: {
    he: 'מס רווחי הון: 6% (לעומת 25% בישראל). מס בולים: 1.5%. מס העברה: 0.5%-0.75%. עלויות עסקה כוללות: 13%-15%. אמנת מס ישראל-פיליפינים (1997) מונעת כפל מס. לזרים שלא תושבים: 25% על הכנסות שכירות ברוטו.',
    en: 'Capital gains tax: 6% (vs 25% in Israel). Documentary stamp: 1.5%. Transfer tax: 0.5%-0.75%. Total round-trip costs: 13%-15%. Israel-PH tax treaty (1997) prevents double taxation. Non-resident foreigners: 25% flat on gross rental income.'
  },
  comparison: {
    he: 'פיליפינים vs יוון: תשואה 8%-16% לעומת 4%-6%. מס 6% לעומת 15%. גיל חציוני 26.1 לעומת 45. צמיחה 5.5%-6.4% לעומת 2%. יוון קרובה יותר וב-EU, אבל התשואה בפיליפינים גבוהה פי 2-3. זה לא החלפה, זה פיזור.',
    en: 'PH vs Greece: yields 8%-16% vs 4%-6%. Tax 6% vs 15%. Median age 26.1 vs 45. GDP growth 5.5%-6.4% vs 2%. Greece is closer and in the EU, but PH returns are 2-3x higher. It is not a replacement, it is diversification.'
  },
  area: {
    he: 'תלוי ביעד שלכם. תזרים עכשיו: פנגלאו/סבו (6-16%). עליית ערך לטווח ארוך: סיארגאו/אל נידו. יציבות עירונית: מנילה BGC (4-6%). מחירים: מנילה PHP 230-550K/מ"ר, סבו PHP 130-230K, פנגלאו PHP 27.5-49K, בורקאי PHP 55-70K.',
    en: 'Depends on your goals. Cash flow now: Panglao/Cebu (6-16%). Long-term appreciation: Siargao/El Nido. Urban stability: Manila BGC (4-6%). Prices: Manila PHP 230-550K/sqm, Cebu PHP 130-230K, Panglao PHP 27.5-49K, Boracay PHP 55-70K.'
  },
  airbnb: {
    he: 'המספרים האמיתיים: פנגלאו ממוצע 41%-52% תפוסה, ADR PHP 2,481-2,900. וילות יוקרה: 70%+ תפוסה, ADR PHP 6,000-8,400. הכנסה ממוצעת: PHP 350-420K/שנה. וילות יוקרה: 7 ספרות. סיארגאו מספר 1 ארצי: 71% תפוסה. אין חוק Airbnb ארצי כרגע.',
    en: 'Real numbers: Panglao average 41%-52% occupancy, ADR PHP 2,481-2,900. Luxury villas: 70%+ occupancy, ADR PHP 6,000-8,400. Average revenue: PHP 350-420K/year. Luxury villas: 7-figure PHP. Siargao #1 nationally: 71% occupancy. No national Airbnb law currently.'
  },
  safety: {
    he: 'בוהול היא אחת הפרובינציות הבטוחות ביותר בפיליפינים. פנגלאו באזור מופחת טייפונים, לא בחגורה הראשית. תקני בנייה כוללים עמידות לטייפונים (DPWH). סיכונים אמיתיים: מרחק (8-12 שעות טיסה), רגולציה זרה, מטבע. אבל התשואה מפצה.',
    en: 'Bohol is one of the safest provinces in the Philippines. Panglao is in a typhoon-reduced zone, not the main belt. Building standards include typhoon resistance (DPWH). Real risks: distance (8-12hr flight), foreign regulation, currency. But the returns compensate.'
  },
  process: {
    he: '12 שלבים, 60-90 יום: (1) שיחת ייעוץ בוואטסאפ/זום בעברית, (2) בחירת נכס, (3) LOI + מקדמה, (4) בחירת מבנה בעלות, (5) בדיקת נאותות, (6) חוזה ע"י עו"ד פיליפיני, (7) KYC דיגיטלי, (8) חתימה דיגיטלית, (9) העברה בנקאית, (10) רישום, (11) מסירה + ניהול, (12) הכנסה ראשונה תוך 30-60 יום.',
    en: '12 steps, 60-90 days: (1) WhatsApp/Zoom consultation, (2) property selection, (3) LOI + deposit, (4) ownership structure, (5) due diligence, (6) contract by PH attorney, (7) digital KYC, (8) digital signing, (9) wire transfer, (10) registration, (11) handover + management, (12) first Airbnb income in 30-60 days.'
  },
  visa: {
    he: 'כניסה לפיליפינים: 30 יום ללא ויזה לישראלים. שהייה ארוכה: SRRV (ויזת פנסיונר מיוחדת), מגיל 40, פיקדון $10K-$50K (ILS 35K-180K). תושבות קבע, כניסות מרובות, אין צורך באישור יציאה. עיבוד: 30-60 יום.',
    en: 'Entry: 30-day visa-free for Israelis. Long-term: SRRV (Special Resident Retiree Visa), from age 40, deposit $10K-$50K. Permanent residency, multiple entry, no exit clearance. Processing: 30-60 days through PRA.'
  },
  currency: {
    he: 'הפזו ב-PHP 62 לדולר, נחלש 20% מאז 2019. זה אומר כוח קנייה גבוה יותר לישראלים. העברות OFW ($35.63 מיליארד) יוצרות רצפה למטבע. אסטרטגיה: קנו בפזו כשהוא חלש, שמרו הכנסות שכירות בפזו, המירו בשער נוח.',
    en: 'Peso at PHP 62/USD, weakened 20% since 2019. Greater purchasing power for foreign buyers. OFW remittances ($35.63B) create a currency floor. Strategy: buy in pesos when weak, keep rental income in PHP, convert when favorable.'
  },
  infrastructure: {
    he: 'גשר טאגבילראן-פנגלאו: PHP 7.15 מיליארד, מימון צרפתי, 4 נתיבים, בבנייה. JW Marriott: 7 הקטאר, 80 חדרים + 70 branded residences, 2026-2028. Panglao Shores: PHP 25 מיליארד, עיר נופש שלמה. שדה תעופה: הרחבה ל-3.9 מיליון עד 2030. תקדים CCLEX: עליית ערך 30%.',
    en: 'Tagbilaran-Panglao Bridge: PHP 7.15B, French-funded, 4 lanes, under construction. JW Marriott: 7 hectares, 80 rooms + 70 branded residences, 2026-2028. Panglao Shores: PHP 25B resort township. Airport: expansion to 3.9M by 2030. CCLEX precedent: 30% value boost.'
  },
  demographics: {
    he: 'גיל חציוני 26.1 (לעומת ישראל 30, יוון 45, יפן 49). אוכלוסייה 116.79 מיליון, צומחת ל-130+ מיליון עד 2035. BPO 1.9 מיליון עובדים. OFW $35.63 מיליארד, 60% לנדל"ן. מעמד ביניים גדל ב-2.5 מיליון משקי בית בשנה. נדל"ן עוקב אחר דמוגרפיה.',
    en: 'Median age 26.1 (vs Israel 30, Greece 45, Japan 49). Population 116.79M growing to 130M+ by 2035. BPO 1.9M workers. OFW $35.63B, 60% to real estate. Middle class growing 2.5M households/year. Real estate follows demographics.'
  },
  greeting: {
    he: 'שלום! אנחנו Blue Everest, פעילים בשוק הנדל"ן הפיליפיני. שמחים לענות על כל שאלה. מה מעניין אתכם? WhatsApp: +639542555553',
    en: 'Hello! We are Blue Everest, active in the Philippine real estate market. Happy to answer any question. What interests you? WhatsApp: +639542555553'
  },
  general: {
    he: 'שאלה מעניינת. שוק הנדל"ן הפיליפיני שווה $94.4 מיליארד וצומח. נשמח לפרט. לשיחה אישית: WhatsApp +639542555553 (שיווק) או +639958565865 (משרד).',
    en: 'Interesting question. The Philippine real estate market is worth $94.4B and growing. Happy to elaborate. For a personal conversation: WhatsApp +639542555553 (Marketing) or +639958565865 (Office).'
  },
};

// Lead qualification
function qualifyLead(messages: ChatMessage[]): { score: number; status: string; signals: string[] } {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();
  const signals: string[] = [];
  let score = 10;

  if (/price|cost|כמה|מחיר|budget/.test(allText)) { score += 15; signals.push('asked_about_price'); }
  if (/villa [cd]|1[,.]5[35]|1[,.]65/.test(allText)) { score += 10; signals.push('specific_villa'); }
  if (/roi|return|yield|תשואה|invest|rental/.test(allText)) { score += 20; signals.push('roi_interest'); }
  if (/reserv|book|להזמין|שריינו/.test(allText)) { score += 30; signals.push('reservation_intent'); }
  if (/payment|financ|loan|תשלום/.test(allText)) { score += 20; signals.push('financing_question'); }
  if (/ownership|deed|legal|משפטי|בעלות/.test(allText)) { score += 15; signals.push('legal_question'); }
  if (/visit|fly|see.*villa|לבקר|לטוס/.test(allText)) { score += 25; signals.push('visit_intent'); }

  const userMsgs = messages.filter(m => m.role === 'user').length;
  if (userMsgs >= 5) { score += 15; signals.push('highly_engaged'); }

  const status = score >= 81 ? 'very_hot' : score >= 61 ? 'hot' : score >= 31 ? 'warm' : 'cold';
  return { score: Math.min(score, 100), status, signals };
}

function buildResponse(message: string, history: ChatMessage[], lang: 'he' | 'en', mode: 'comment' | 'inbox'): string {
  const intent = detectIntent(message);
  const data = KB[intent] || KB.general;
  const base = data[lang];

  if (mode === 'comment') {
    // Short response for comments
    const lines = base.split('. ').slice(0, 3).join('. ') + '.';
    return lines;
  }

  // Inbox: fuller response with CTA
  const qual = qualifyLead(history);
  let response = base;

  if (qual.status === 'very_hot') {
    const cta = lang === 'he'
      ? '\n\nבוא נדבר ישירות. WhatsApp: +639542555553'
      : '\n\nLet\'s talk directly. WhatsApp: +639542555553';
    response += cta;
  } else if (qual.status === 'hot') {
    const cta = lang === 'he'
      ? '\n\nנשמח לשלוח חבילת השקעה מפורטת. WhatsApp: +639542555553'
      : '\n\nHappy to send a detailed investment package. WhatsApp: +639542555553';
    response += cta;
  }

  return response;
}

// Load system prompt
function getSystemPrompt(): string {
  try {
    return readFileSync(join(process.cwd(), 'src/prompts/community-agent-system.md'), 'utf-8');
  } catch {
    return '';
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { message, history = [], mode = 'comment', sessionId } = body as {
    message: string;
    history: ChatMessage[];
    mode: 'comment' | 'inbox';
    sessionId?: string;
  };

  const lang = detectLang(message);
  const intent = detectIntent(message);
  const sid = sessionId || randomUUID();

  // Try LLM path first
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let reply: string;

  if (apiKey) {
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey });

      const systemPrompt = getSystemPrompt();
      const modeInstructions = mode === 'comment'
        ? 'This is a Facebook COMMENT reply. Keep it short: 2-4 sentences max. Include one specific number. Natural flowing text, no formatting.'
        : 'This is a Facebook INBOX/DM reply. Be more detailed: 4-8 sentences. Qualify the lead. Include relevant data. End with appropriate CTA based on engagement level.';

      const messages = [
        ...history.slice(-15).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: message },
      ];

      const llmResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: mode === 'comment' ? 300 : 800,
        temperature: 0.5,
        system: `${systemPrompt}\n\n---\nMODE: ${modeInstructions}\nDetected language: ${lang}\nDetected intent: ${intent}`,
        messages,
      });

      reply = (llmResponse.content[0] as { text: string }).text;
    } catch {
      reply = buildResponse(message, history, lang, mode);
    }
  } else {
    reply = buildResponse(message, history, lang, mode);
  }

  const qualification = qualifyLead([...history, { role: 'user', content: message }]);

  return Response.json({
    reply,
    sessionId: sid,
    language: lang,
    intent,
    mode,
    leadQualification: qualification,
    consultedAgents: [],
    suggestedActions: qualification.score >= 60
      ? ['Connect via WhatsApp', 'Send investment package']
      : ['Continue educating', 'Share relevant post'],
  });
}

export async function GET() {
  return Response.json({
    agent: 'community-agent',
    status: 'active',
    capabilities: ['comment_reply', 'inbox_reply', 'lead_qualification'],
    intents: ['pricing', 'roi', 'legal', 'tax', 'comparison', 'area', 'airbnb', 'safety', 'process', 'visa', 'currency', 'infrastructure', 'demographics', 'greeting', 'general'],
    languages: ['he', 'en'],
  });
}
