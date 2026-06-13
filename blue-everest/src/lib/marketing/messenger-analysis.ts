import { buildSalesOsResponse } from '@/lib/sales-os/blue-everest-agent';

export type CampaignLanguage = 'en' | 'he';

export type NormalizedMessage = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
};

export type MessengerConversationAnalysis = {
  language: CampaignLanguage;
  languageLabel: string;
  score: number;
  status: 'cold' | 'warm' | 'hot' | 'very_hot';
  funnelStage: 'new' | 'contacted' | 'qualified' | 'reservation_discussed';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  signals: string[];
  summary: string;
  nextBestAction: string;
  recommendedReply: string;
  missingData: string[];
};

const HEBREW_REGEX = /[\u0590-\u05FF]/;

const SIGNALS = [
  {
    key: 'pricing_interest',
    score: 18,
    en: ['price', 'cost', 'how much', 'payment', 'installment', 'reserve', 'reservation'],
    he: ['מחיר', 'עולה', 'כמה', 'תשלום', 'תשלומים', 'שריון', 'מקדמה'],
  },
  {
    key: 'villa_interest',
    score: 14,
    en: ['villa', 'unit', 'bedroom', 'pool', 'jacuzzi', 'tour'],
    he: ['וילה', 'יחידה', 'חדר', 'בריכה', 'ג׳קוזי', 'גקוזי', 'סיור'],
  },
  {
    key: 'investment_roi',
    score: 20,
    en: ['roi', 'income', 'return', 'airbnb', 'rental', 'yield', 'investment'],
    he: ['תשואה', 'הכנסה', 'השכרה', 'איירביאנבי', 'airbnb', 'השקעה'],
  },
  {
    key: 'legal_ownership',
    score: 16,
    en: ['ownership', 'foreign', 'title', 'leasehold', 'corporation', 'legal'],
    he: ['בעלות', 'זר', 'זרים', 'חוקי', 'חוקית', 'חברה', 'חכירה'],
  },
  {
    key: 'financing',
    score: 12,
    en: ['loan', 'bank', 'finance', 'financing', 'bdo', 'mortgage'],
    he: ['מימון', 'בנק', 'הלוואה', 'משכנתא'],
  },
  {
    key: 'call_request',
    score: 24,
    en: ['call', 'whatsapp', 'phone', 'schedule', 'meeting', 'talk'],
    he: ['שיחה', 'וואטסאפ', 'טלפון', 'פגישה', 'לדבר', 'לתאם'],
  },
  {
    key: 'high_intent',
    score: 35,
    en: ['buy', 'purchase', 'contract', 'available', 'book', 'send details'],
    he: ['לקנות', 'רכישה', 'חוזה', 'פנוי', 'זמין', 'לסגור', 'שלח פרטים'],
  },
];

function detectLanguage(text: string): CampaignLanguage {
  return HEBREW_REGEX.test(text) ? 'he' : 'en';
}

function includesAny(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word.toLowerCase()));
}

function statusFromScore(score: number): MessengerConversationAnalysis['status'] {
  if (score >= 100) return 'very_hot';
  if (score >= 65) return 'hot';
  if (score >= 25) return 'warm';
  return 'cold';
}

function urgencyFromStatus(status: MessengerConversationAnalysis['status']) {
  if (status === 'very_hot') return 'critical';
  if (status === 'hot') return 'high';
  if (status === 'warm') return 'medium';
  return 'low';
}

function stageFromSignals(signals: string[]): MessengerConversationAnalysis['funnelStage'] {
  if (signals.includes('high_intent')) return 'reservation_discussed';
  if (signals.includes('call_request') || signals.includes('pricing_interest')) return 'qualified';
  if (signals.length > 0) return 'contacted';
  return 'new';
}

function buildMissingData(hasContact: boolean, language: CampaignLanguage) {
  if (hasContact) return [];
  return language === 'he'
    ? ['מספר טלפון או וואטסאפ', 'תקציב', 'לוח זמנים', 'וילה מועדפת']
    : ['phone or WhatsApp number', 'budget', 'timeline', 'preferred villa'];
}

function buildSummary(language: CampaignLanguage, status: string, signals: string[], messageCount: number) {
  if (language === 'he') {
    const signalText = signals.length > 0 ? signals.map((s) => s.replaceAll('_', ' ')).join(', ') : 'אין עדיין איתותים חזקים';
    return `שיחה קיימת במסנג׳ר עם ${messageCount} הודעות. רמת ליד: ${status}. איתותים: ${signalText}.`;
  }

  const signalText = signals.length > 0 ? signals.map((s) => s.replaceAll('_', ' ')).join(', ') : 'no strong signals yet';
  return `Existing Messenger conversation with ${messageCount} messages. Lead level: ${status}. Signals: ${signalText}.`;
}

function buildNextAction(language: CampaignLanguage, signals: string[], missingData: string[]) {
  if (language === 'he') {
    if (signals.includes('high_intent') || signals.includes('call_request')) {
      return 'לתאם שיחת מכירה קצרה, לאסוף תקציב ולברר אם Villa C או Villa D מתאימה יותר.';
    }
    if (signals.includes('legal_ownership')) {
      return 'להסביר את 3 פתרונות הבעלות ולשאול מה מטרת הרכישה: השקעה, מגורים או שילוב.';
    }
    if (missingData.length > 0) {
      return `לאסוף פרטים חסרים: ${missingData.join(', ')}.`;
    }
    return 'להמשיך בשאלת מיון אחת ולכוון לשיחה או WhatsApp.';
  }

  if (signals.includes('high_intent') || signals.includes('call_request')) {
    return 'Schedule a short sales call, confirm budget and clarify whether Villa C or Villa D is the better fit.';
  }
  if (signals.includes('financing')) {
    return 'Explain BDO Bank financing and ask for budget, timeline and buyer profile.';
  }
  if (missingData.length > 0) {
    return `Collect missing data: ${missingData.join(', ')}.`;
  }
  return 'Ask one qualification question and move the conversation toward WhatsApp or a call.';
}

export function analyzeMessengerConversation(options: {
  messages: NormalizedMessage[];
  participantName?: string | null;
  hasContact: boolean;
}): MessengerConversationAnalysis {
  const userText = options.messages
    .filter((message) => message.role === 'user')
    .map((message) => message.content)
    .join('\n');
  const allText = options.messages.map((message) => message.content).join('\n');
  const language = detectLanguage(userText || allText);
  const signals: string[] = [];
  let score = options.messages.length > 0 ? 12 : 0;

  for (const signal of SIGNALS) {
    const words = language === 'he' ? signal.he : signal.en;
    if (includesAny(allText, words)) {
      signals.push(signal.key);
      score += signal.score;
    }
  }

  if (options.hasContact) score += 20;
  if (options.messages.length >= 4) score += 10;
  if (options.messages.length >= 8) score += 10;
  if (signals.includes('high_intent') && signals.includes('pricing_interest')) score += 20;

  const boundedScore = Math.min(score, 140);
  const status = statusFromScore(boundedScore);
  const missingData = buildMissingData(options.hasContact, language);
  const latestUserMessage =
    [...options.messages].reverse().find((message) => message.role === 'user')?.content ??
    (language === 'he' ? 'הלקוח פנה במסנג׳ר' : 'The customer contacted us on Messenger');
  const salesOs = buildSalesOsResponse({
    message: latestUserMessage,
    history: options.messages,
    preferredLanguage: language,
    leadName: options.participantName ?? null,
    channel: 'facebook_dm',
  });

  return {
    language,
    languageLabel: language === 'he' ? 'עברית' : 'English',
    score: boundedScore,
    status,
    funnelStage: stageFromSignals(signals),
    urgency: urgencyFromStatus(status),
    signals,
    summary: buildSummary(language, status, signals, options.messages.length),
    nextBestAction: salesOs.nextBestAction || buildNextAction(language, signals, missingData),
    recommendedReply: salesOs.reply,
    missingData,
  };
}
