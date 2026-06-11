// Smart Group Analyzer - analyzes a group's name, about text, and metadata
// to determine what content is appropriate for it.

const GROUP_PROFILES = {
  // Israeli groups - Hebrew content only
  IL_OVERSEAS_RE: {
    id: 'il_overseas_re',
    label: 'Israeli Overseas RE Investors',
    language: 'hebrew',
    description: 'Israelis looking to invest in real estate abroad',
    matchPatterns: [/נדל.*חו"ל/i, /השקעות.*נדל.*חו"ל/i, /נדל.*יוון/i, /נדל.*קפריסין/i, /נדל.*פורטוגל/i, /נדל.*דובאי/i, /נדל.*תאילנד/i, /נדל.*פיליפינ/i, /overseas.*real estate/i],
    bestPosts: ['IL-01', 'IL-02', 'IL-03', 'IL-07', 'IL-08'],
    postReason: {
      'IL-01': 'Compares Israeli yields to Panglao - directly relevant to overseas investors',
      'IL-02': 'Airport growth story appeals to investors looking for emerging markets abroad',
      'IL-03': 'Exit strategy - key concern for overseas investors',
      'IL-07': 'Bohol vs Phuket comparison - they already think about overseas destinations',
      'IL-08': 'Reservation process - conversion for serious leads',
    },
  },
  IL_DOMESTIC_RE: {
    id: 'il_domestic_re',
    label: 'Israeli Domestic RE Investors',
    language: 'hebrew',
    description: 'Israeli real estate investors (domestic focus) who might diversify abroad',
    matchPatterns: [/נדל.*מניב/i, /נדל.*להשקעה/i, /דירות.*להשקעה/i, /נדל.*מסחרי/i, /מתווכ/i, /נדל.*ישראל/i, /השקעות.*נדל/i],
    bestPosts: ['IL-01', 'IL-04', 'IL-06', 'IL-10'],
    postReason: {
      'IL-01': 'Reality check comparing Israeli yields to Panglao - eye-opener for domestic investors',
      'IL-04': 'Detailed income math - speaks their language of numbers',
      'IL-06': 'Tax treaty - practical advantage they can understand',
      'IL-10': 'Monthly breakdown - the detail level RE investors expect',
    },
  },
  IL_ENTREPRENEURS: {
    id: 'il_entrepreneurs',
    label: 'Israeli Entrepreneurs & Business',
    language: 'hebrew',
    description: 'Israeli business owners, entrepreneurs, startup people with capital',
    matchPatterns: [/יזמ/i, /סטארט.*אפ/i, /startup/i, /עסק/i, /entrepreneur/i, /משקיע.*יזמ/i],
    bestPosts: ['IL-09', 'IL-04', 'IL-05'],
    postReason: {
      'IL-09': 'Investor profiles - social proof from people like them',
      'IL-04': 'Income math - entrepreneurs appreciate detailed ROI calculations',
      'IL-05': '5 mistakes - practical business intelligence they value',
    },
  },
  IL_FINANCE: {
    id: 'il_finance',
    label: 'Israeli Finance & Investment',
    language: 'hebrew',
    description: 'Financial communities, money management, investment discussions',
    matchPatterns: [/כסף/i, /פיננס/i, /finance/i, /money/i, /שוק.*הון/i, /השקעות/i, /מניות/i],
    bestPosts: ['IL-04', 'IL-06', 'IL-10'],
    postReason: {
      'IL-04': 'Detailed financial analysis - their language',
      'IL-06': 'Tax treaty deep dive - tax efficiency matters to this audience',
      'IL-10': 'Monthly income data - portfolio income perspective',
    },
  },
  IL_AIRBNB: {
    id: 'il_airbnb',
    label: 'Israeli Airbnb/Hosting',
    language: 'hebrew',
    description: 'Airbnb hosts and short-term rental operators in Israel',
    matchPatterns: [/airbnb/i, /host/i, /אירוח/i, /נופש/i, /VRBO/i, /booking/i],
    bestPosts: ['IL-01', 'IL-10', 'IL-04'],
    postReason: {
      'IL-01': 'Airbnb reality check - they understand the Airbnb model',
      'IL-10': 'Monthly income breakdown - they know seasonality',
      'IL-04': 'Income math with expenses - they know operating costs',
    },
  },
  IL_PHILIPPINES: {
    id: 'il_philippines',
    label: 'Israeli-Philippines Community',
    language: 'hebrew',
    description: 'Israelis connected to the Philippines',
    matchPatterns: [/פיליפינ/i, /philippines.*israel/i, /ישראל.*פיליפינ/i],
    bestPosts: ['IL-01', 'IL-02', 'IL-08', 'IL-05'],
    postReason: {
      'IL-01': 'They already know Philippines - give them the investment angle',
      'IL-02': 'Airport and tourism data - validates what they see on the ground',
      'IL-08': 'Reservation - they are closest to buying',
      'IL-05': '5 mistakes - practical for people already considering PH',
    },
  },

  // Filipino groups - English content only
  PH_INVESTORS: {
    id: 'ph_investors',
    label: 'Filipino RE Investors',
    language: 'english',
    description: 'Filipino investors looking for real estate opportunities',
    matchPatterns: [/real estate.*invest.*philippines/i, /property.*invest.*ph/i, /invest.*real estate.*ph/i, /philippine.*real estate.*invest/i],
    bestPosts: ['PH-01', 'PH-06', 'PH-08'],
    postReason: {
      'PH-01': 'Passive income angle - what PHP 32.5M can generate',
      'PH-06': 'Panglao vs Boracay - they understand both markets',
      'PH-08': 'Real data approach builds trust with savvy investors',
    },
  },
  PH_OFW: {
    id: 'ph_ofw',
    label: 'OFW Investment',
    language: 'english',
    description: 'Overseas Filipino Workers looking to invest back home',
    matchPatterns: [/ofw/i, /overseas.*filipino/i, /filipino.*abroad/i],
    bestPosts: ['PH-04', 'PH-01', 'PH-07'],
    postReason: {
      'PH-04': 'Specifically written for OFWs - speaks to their sacrifice and goals',
      'PH-01': 'Passive income - salary replacement angle',
      'PH-07': '6-step process - transparency for remote buyers',
    },
  },
  PH_LUXURY: {
    id: 'ph_luxury',
    label: 'Filipino Luxury/Lifestyle',
    language: 'english',
    description: 'Luxury property, beachfront, resort lifestyle groups',
    matchPatterns: [/luxury.*real estate/i, /beachfront/i, /resort.*property/i, /villa.*philippines/i, /premium.*property/i],
    bestPosts: ['PH-03', 'PH-05', 'PH-02'],
    postReason: {
      'PH-03': 'Own dont rent - status and lifestyle angle',
      'PH-05': 'Retirement villa - aspirational lifestyle',
      'PH-02': 'Tourism boom - validates luxury market potential',
    },
  },
  PH_BOHOL: {
    id: 'ph_bohol',
    label: 'Bohol/Visayas Local',
    language: 'english',
    description: 'Groups specifically about Bohol, Panglao, Visayas real estate',
    matchPatterns: [/bohol/i, /panglao/i, /visayas/i, /cebu.*property/i],
    bestPosts: ['PH-02', 'PH-06', 'PH-01'],
    postReason: {
      'PH-02': 'Tourism boom data - local pride and validation',
      'PH-06': 'Panglao vs Boracay - positions their area positively',
      'PH-01': 'Income potential - relevant to local investors',
    },
  },
  PH_GENERAL: {
    id: 'ph_general',
    label: 'Filipino General RE/Business',
    language: 'english',
    description: 'General Philippine real estate or business groups',
    matchPatterns: [/philippines.*property/i, /philippine.*real estate/i, /filipino.*entrepreneur/i, /business.*philippines/i, /property.*sale.*philippines/i],
    bestPosts: ['PH-01', 'PH-07', 'PH-02'],
    postReason: {
      'PH-01': 'Lead with income potential',
      'PH-07': 'Transparent buying process builds trust',
      'PH-02': 'Tourism data provides market context',
    },
  },

  // International groups - English content only
  INT_KOREAN: {
    id: 'int_korean',
    label: 'Korean Community/Investment',
    language: 'english',
    description: 'Korean expat or investment groups related to Philippines/Asia',
    matchPatterns: [/[\uAC00-\uD7AF]/i, /korean/i, /한인/i, /부동산/i, /필리핀/i],
    bestPosts: ['KR-01', 'KR-02', 'KR-04'],
    postReason: {
      'KR-01': 'Korean-Bohol connection - Koreans are #1 tourists',
      'KR-02': 'Seoul yield comparison - speaks their context',
      'KR-04': 'Jeju vs Panglao - island they know vs island opportunity',
    },
  },
  INT_HK: {
    id: 'int_hk',
    label: 'Hong Kong Investors',
    language: 'english',
    description: 'Hong Kong property and investment groups',
    matchPatterns: [/hong kong/i, /hk.*invest/i, /hk.*property/i],
    bestPosts: ['HK-01', 'HK-02', 'HK-03'],
    postReason: {
      'HK-01': '3 hours flight, yield comparison to HK',
      'HK-02': 'HKD 4.1M nano-flat vs villa comparison',
      'HK-03': 'Weekend villa lifestyle',
    },
  },
  INT_SINGAPORE: {
    id: 'int_singapore',
    label: 'Singapore Investors',
    language: 'english',
    description: 'Singapore property and investment groups',
    matchPatterns: [/singapore/i, /sg.*invest/i, /sg.*property/i, /asean.*invest/i],
    bestPosts: ['SG-01', 'SG-02', 'SG-03'],
    postReason: {
      'SG-01': 'No ABSD, yield comparison to SG',
      'SG-02': 'ASEAN diversification thesis',
      'SG-03': 'Retirement lifestyle angle',
    },
  },
  INT_GLOBAL_RE: {
    id: 'int_global_re',
    label: 'Global RE Investors',
    language: 'english',
    description: 'International real estate investor communities',
    matchPatterns: [/international.*real estate/i, /global.*invest/i, /overseas.*property/i, /worldwide.*invest/i, /real estate.*invest/i],
    bestPosts: ['APAC-01', 'APAC-02', 'PH-01'],
    postReason: {
      'APAC-01': 'SEA comparison - positions Panglao in global context',
      'APAC-02': 'Yield data across destinations - data-driven',
      'PH-01': 'Income potential - universal investor language',
    },
  },

  // Jewish diaspora
  JD_JEWISH: {
    id: 'jd_jewish',
    label: 'Jewish Diaspora Investors',
    language: 'english',
    description: 'Jewish community and investor groups worldwide',
    matchPatterns: [/jewish.*invest/i, /israeli.*expat/i, /israeli.*abroad/i, /jewish.*real estate/i],
    bestPosts: ['JD-01', 'JD-02', 'JD-04'],
    postReason: {
      'JD-01': 'Why Jewish investors are looking at PH',
      'JD-02': 'Portfolio gap - diversification argument',
      'JD-04': 'Tel Aviv price comparison - resonates with Israeli-origin',
    },
  },
};

/**
 * Analyze a group and return its profile + best matching posts
 */
function analyzeGroup(group) {
  const name = group.name || '';
  const about = group.about_text || '';
  const combined = (name + ' ' + about).toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const [key, profile] of Object.entries(GROUP_PROFILES)) {
    let score = 0;
    for (const pattern of profile.matchPatterns) {
      if (pattern.test(name)) score += 10;
      if (about && pattern.test(about)) score += 5;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = profile;
    }
  }

  // HARD RULE: Hebrew posts ONLY for groups with Hebrew characters in name
  // If group name has no Hebrew, NEVER return a Hebrew profile
  const hasHebrew = /[\u0590-\u05FF]/.test(name);
  if (!hasHebrew && bestMatch && bestMatch.language === 'hebrew') {
    // Force English fallback
    bestMatch = GROUP_PROFILES.INT_GLOBAL_RE;
    bestScore = 1;
  }

  // Fallback: use market field if no pattern matched
  if (!bestMatch || bestScore === 0) {
    if (group.market === 'israeli' && hasHebrew) bestMatch = GROUP_PROFILES.IL_DOMESTIC_RE;
    else if (group.market === 'israeli' && !hasHebrew) bestMatch = GROUP_PROFILES.INT_GLOBAL_RE; // Israeli market but no Hebrew = use English
    else if (group.market === 'filipino') bestMatch = GROUP_PROFILES.PH_GENERAL;
    else if (group.market === 'international') bestMatch = GROUP_PROFILES.INT_GLOBAL_RE;
    else if (group.market === 'jewish_diaspora') bestMatch = GROUP_PROFILES.JD_JEWISH;
    else bestMatch = GROUP_PROFILES.INT_GLOBAL_RE; // Default to English
  }

  return {
    group_id: group.id,
    group_name: group.name,
    group_market: group.market,
    profile: bestMatch ? bestMatch.id : 'unknown',
    profile_label: bestMatch ? bestMatch.label : 'Unclassified',
    language: bestMatch ? bestMatch.language : 'english',
    recommended_posts: bestMatch ? bestMatch.bestPosts : [],
    post_reasons: bestMatch ? bestMatch.postReason : {},
    match_score: bestScore,
  };
}

/**
 * Generate a publish plan for a specific market
 * Returns array of { group, post, reason } ready for approval
 */
function generatePublishPlan(groups, market) {
  const plan = [];

  for (const group of groups) {
    const analysis = analyzeGroup(group);

    // Skip if language doesn't match market
    if (market === 'israeli' && analysis.language !== 'hebrew') continue;
    if (market === 'filipino' && analysis.language !== 'english') continue;
    if (market === 'international' && analysis.language !== 'english') continue;

    if (analysis.recommended_posts.length > 0) {
      const bestPost = analysis.recommended_posts[0];
      const reason = analysis.post_reasons[bestPost] || 'Best match for group profile';

      plan.push({
        group_id: group.id,
        group_name: group.name,
        group_members: group.members_count,
        group_score: group.publishing_score,
        profile: analysis.profile_label,
        post_id: bestPost,
        reason,
      });
    }
  }

  // Sort by publishing score
  plan.sort((a, b) => (b.group_score || 0) - (a.group_score || 0));

  return plan;
}

module.exports = { analyzeGroup, generatePublishPlan, GROUP_PROFILES };