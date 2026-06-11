// Content validation engine for Panglao Prime Villas campaigns.
// Enforces CLAUDE.md content rules before publishing.

const FORBIDDEN_WORDS = [
  'amazing', 'incredible', 'dream home', 'once in a lifetime',
  'מדהים', 'בית חלומות', 'פעם בחיים', 'מטורף',
];

const OWNERSHIP_TERMS = [
  'Deed of Assignment', 'Leasehold', 'Domestic Corporation',
  'deed of assignment', 'leasehold', 'domestic corporation',
  'שטר המחאה', 'חכירה', 'תאגיד מקומי',
  'בעלות משפטית', 'פתרונות בעלות', 'פתרון משפטי',
  '3 פתרונות', 'שלושה פתרונות',
];

const WHATSAPP_MARKETING = '+639542555553';
const WHATSAPP_OFFICE    = '+639958565865';

function validateContent(content, market) {
  const errors = [];
  const warnings = [];
  const lower = (content || '').toLowerCase();

  // Rule: Every post must contain at least one number
  if (!/\d/.test(content)) {
    errors.push({ rule: 'has_number', message: 'הפוסט חייב להכיל לפחות מספר אחד' });
  }

  // Rule: Both WhatsApp numbers required
  if (!content.includes(WHATSAPP_MARKETING)) {
    errors.push({ rule: 'whatsapp_marketing', message: `חסר מספר WhatsApp שיווק: ${WHATSAPP_MARKETING}` });
  }
  if (!content.includes(WHATSAPP_OFFICE)) {
    errors.push({ rule: 'whatsapp_office', message: `חסר מספר WhatsApp משרד: ${WHATSAPP_OFFICE}` });
  }

  // Rule: Forbidden words
  for (const word of FORBIDDEN_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      errors.push({ rule: 'forbidden_word', message: `מילה/ביטוי אסור: "${word}"` });
    }
  }

  // Market-specific rules
  if (market === 'israeli') {
    const hasOwnership = OWNERSHIP_TERMS.some(t => content.includes(t));
    if (!hasOwnership) {
      warnings.push({ rule: 'ownership_solutions', message: 'מומלץ לאזכר פתרונות בעלות (Deed of Assignment / Leasehold / Domestic Corporation)' });
    }
  }

  if (market === 'filipino') {
    const hasBanking = lower.includes('bank') || lower.includes('financing') || lower.includes('loan')
      || lower.includes('מימון') || lower.includes('ליווי בנקאי') || lower.includes('בנק');
    if (!hasBanking) {
      warnings.push({ rule: 'local_banking', message: 'מומלץ לאזכר אפשרות ליווי בנקאי מקומי למתאימים' });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateContent, FORBIDDEN_WORDS, OWNERSHIP_TERMS };
