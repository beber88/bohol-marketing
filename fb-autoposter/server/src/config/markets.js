// Centralized market definitions for Panglao Prime Villas campaigns.
// Currency is PHP_ONLY for all markets per campaign_state.json pricing_rule.

const MARKETS = {
  israeli: {
    id: 'israeli',
    label: 'ישראלי',
    labelEn: 'Israeli',
    languages: ['hebrew'],
    whatsapp: ['+639542555553', '+639958565865'],
    contentRules: {
      requireOwnership: true,
      requireNumber: true,
      requireWhatsApp: true,
    },
  },
  filipino: {
    id: 'filipino',
    label: 'פיליפיני',
    labelEn: 'Filipino',
    languages: ['english', 'tagalog'],
    whatsapp: ['+639542555553', '+639958565865'],
    contentRules: {
      requireBDO: true,
      requireNumber: true,
      requireWhatsApp: true,
    },
  },
  international: {
    id: 'international',
    label: 'בינלאומי',
    labelEn: 'International',
    languages: ['english'],
    whatsapp: ['+639542555553', '+639958565865'],
    contentRules: {
      requireNumber: true,
      requireWhatsApp: true,
    },
  },
  jewish_diaspora: {
    id: 'jewish_diaspora',
    label: 'תפוצות',
    labelEn: 'Jewish Diaspora',
    languages: ['hebrew', 'english'],
    whatsapp: ['+639542555553', '+639958565865'],
    contentRules: {
      requireNumber: true,
      requireWhatsApp: true,
    },
  },
};

const GROUP_TYPES = {
  real_estate:      { label: 'נדל"ן',            labelEn: 'Real Estate' },
  investment:       { label: 'השקעות',            labelEn: 'Investment' },
  expat_community:  { label: 'קהילת אקספטים',     labelEn: 'Expat Community' },
  jewish_community: { label: 'קהילה יהודית',      labelEn: 'Jewish Community' },
  business:         { label: 'עסקים',             labelEn: 'Business' },
  lifestyle:        { label: 'לייפסטייל',          labelEn: 'Lifestyle' },
  tourism:          { label: 'תיירות',            labelEn: 'Tourism' },
};

const LANGUAGES = {
  hebrew:  { label: 'עברית',   labelEn: 'Hebrew' },
  english: { label: 'אנגלית',  labelEn: 'English' },
  tagalog: { label: 'טגלוג',   labelEn: 'Tagalog' },
  cebuano: { label: 'סבואנו',  labelEn: 'Cebuano' },
  mixed:   { label: 'מעורב',   labelEn: 'Mixed' },
};

const CAMPAIGN_TYPES = {
  awareness:    { label: 'מודעות',   labelEn: 'Awareness' },
  consideration:{ label: 'שיקול',    labelEn: 'Consideration' },
  conversion:   { label: 'המרה',     labelEn: 'Conversion' },
};

// Template variables – values sourced from campaign_state.json
const TEMPLATE_VARS = {
  villa_d_price:        'PHP 32,500,000',
  villa_c_price:        'PHP 35,000,000',
  reservation:          'PHP 200,000',
  monthly_income:       'PHP 395,000',
  roi_annual:           '17-25%',
  whatsapp_marketing:   '+639542555553',
  whatsapp_office:      '+639958565865',
  occupancy:            '65%',
  area_sqm:             '263.78',
  bedrooms:             '4',
  bathrooms:            '4',
  beach_distance:       '60 seconds',
};

function renderTemplate(template, vars = {}) {
  const merged = { ...TEMPLATE_VARS, ...vars };
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return merged[key] !== undefined ? merged[key] : match;
  });
}

module.exports = { MARKETS, GROUP_TYPES, LANGUAGES, CAMPAIGN_TYPES, TEMPLATE_VARS, renderTemplate };
