import type { SupabaseClient } from '@supabase/supabase-js';

export type ProjectKnowledgeEntry = {
  title: string;
  content: string;
  content_type: string;
  language: 'en' | 'he' | 'tl';
  category: string;
  summary: string;
  source: string;
};

export const PROJECT_KNOWLEDGE_ENTRIES: ProjectKnowledgeEntry[] = [
  {
    title: 'Panglao Prime Villas Project Identity',
    content_type: 'project_brief',
    language: 'en',
    category: 'core',
    source: 'codex_project_library',
    summary: 'Core project facts, developer identity, villas, prices, income and markets.',
    content: [
      'Project: Panglao Prime Villas, luxury investment villas in Bingag, Panglao Island, Bohol, Philippines.',
      'Developer: Blue Everest Asset Group Holding Inc.',
      'Available units: Villa C and Villa D. Villa A and Villa B are sold.',
      'Villa C price: PHP 35,000,000. Villa D price: PHP 32,500,000.',
      'Israeli market fixed prices: Villa C 1,650,000 ש"ח, Villa D 1,535,000 ש"ח, reservation 9,999 ש"ח.',
      'Verified Airbnb monthly income: PHP 395,000. Annual ROI message: 17-25%.',
      'Villas: 263.78 sqm, 4 bedrooms, private pool, rooftop jacuzzi, 3 stories.',
      'WhatsApp Marketing: +639542555553. WhatsApp Office: +639958565865.',
    ].join('\n'),
  },
  {
    title: 'Israeli Market Compliance Rules',
    content_type: 'brand_guideline',
    language: 'he',
    category: 'compliance',
    source: 'codex_project_library',
    summary: 'Mandatory Israeli-market currency, legal and CTA rules.',
    content: [
      'תוכן לשוק הישראלי משתמש בשקלים בלבד למחירי וילות ודמי הזמנה.',
      'Villa D: 1,535,000 ש"ח. Villa C: 1,650,000 ש"ח. Reservation: 9,999 ש"ח.',
      'אין להשתמש ב-PHP, USD, דולר, פזו או המרות מטבע במחירי הווילות בתוכן ישראלי.',
      'חובה להזכיר את שלושת פתרונות הבעלות: Deed of Assignment, Leasehold 25+25, Domestic Corporation.',
      'חובה לכלול את שני מספרי ה-WhatsApp: +639542555553 וגם +639958565865.',
      'סגנון: רשמי, חם, מקצועי, עמית לעמית. ללא סלנג.',
    ].join('\n'),
  },
  {
    title: 'Philippines Market Compliance Rules',
    content_type: 'brand_guideline',
    language: 'en',
    category: 'compliance',
    source: 'codex_project_library',
    summary: 'Mandatory Filipino-market pricing, financing and CTA rules.',
    content: [
      'Filipino-market content uses PHP with commas as the primary currency.',
      'Villa C: PHP 35,000,000. Villa D: PHP 32,500,000. Reservation: PHP 200,000.',
      'Mention BDO Bank financing for eligible Filipino buyers.',
      'Include both WhatsApp numbers in every publishable post: +639542555553 and +639958565865.',
      'Do not use ILS or shekel prices in Filipino-market content.',
    ].join('\n'),
  },
  {
    title: 'Sales Agent Call Framework',
    content_type: 'sales_playbook',
    language: 'en',
    category: 'sales',
    source: 'codex_project_library',
    summary: 'How David the sales agent should qualify and move leads to a real call.',
    content: [
      'The sales agent must qualify: budget, timeline, villa interest, buyer country, investment purpose, contact method and ownership questions.',
      'Hot signals: asks to reserve, asks for contract, asks payment process, gives phone/email, says budget is ready, asks for call or viewing.',
      'Warm signals: asks price, ROI, ownership, BDO financing, property management or compares Panglao with another market.',
      'If hot or warm, prepare a human handoff and a WhatsApp follow-up. Do not pretend a live call happened unless WATI or human operator actually sent it.',
      'For Israeli leads, use fixed shekel villa prices and mention legal ownership options.',
      'For Filipino leads, use PHP pricing and mention BDO Bank financing.',
    ].join('\n'),
  },
  {
    title: 'Daily Marketing Operating Calendar',
    content_type: 'operations',
    language: 'en',
    category: 'workday',
    source: 'codex_project_library',
    summary: 'Daily work cycle expected from the campaign agents.',
    content: [
      '08:00 PHT: morning startup, read campaign state, collect metrics, identify blockers.',
      '10:00 PHT: content posting or content preparation according to the queue and Brand Guard rules.',
      '13:00 PHT: lead check, score new leads, prepare sales handoff for hot leads.',
      '17:00 PHT: optimization, performance analysis, budget and campaign recommendations.',
      '21:00 PHT: evening wrap, final metrics, heartbeat, issues and next actions.',
      'No live spending, publishing or direct lead contact should happen unless the task is approved and the integration is configured.',
    ].join('\n'),
  },
  {
    title: 'Current Critical Blockers',
    content_type: 'operations',
    language: 'en',
    category: 'blockers',
    source: 'codex_project_library',
    summary: 'Known blockers that prevent full automation.',
    content: [
      'WATI is not fully set up, so WhatsApp automation can prepare drafts and handoff links but cannot reliably send live sales conversations.',
      'Meta App has been in Development mode, so public webhook events may not arrive until App Review and permissions are approved.',
      'The campaign generated many clicks but very few persisted leads, so lead capture, retargeting and form conversion must be watched daily.',
      'Facebook group publishing is manual-only. Agents can prepare compliant posts and mark due tasks, but should not claim a group post was published automatically.',
    ].join('\n'),
  },
  {
    title: 'Community Agent Backlog',
    content_type: 'content_plan',
    language: 'he',
    category: 'community',
    source: 'codex_project_library',
    summary: 'Israeli community agent backlog and publication posture.',
    content: [
      'Community agent target group: נדל"ן והשקעות בפיליפינים | Philippines Real Estate & Investments.',
      'Only one community post was previously published. Multiple posts were missed because of prior Brand Guard/currency conflicts.',
      'Backlog should be recovered with compliant Hebrew posts, fixed shekel prices and all three legal ownership solutions.',
      'Publishing is manual or mark-only unless a verified Facebook group posting path exists.',
    ].join('\n'),
  },
  {
    title: 'Performance Diagnosis Pattern',
    content_type: 'analytics_rule',
    language: 'en',
    category: 'performance',
    source: 'codex_project_library',
    summary: 'How agents should diagnose clicks with zero qualified leads.',
    content: [
      'If impressions and clicks are present but leads are zero, do not say the campaign is healthy.',
      'Diagnose landing page conversion, form persistence, pixel Lead event, offer mismatch, audience quality and retargeting gaps.',
      'Recommended actions: verify form submit end-to-end, create retargeting audience, produce conversion-stage content, and inspect comments/messages.',
      'Performance Ads can recommend but must not spend or change budget without approval.',
    ].join('\n'),
  },
  {
    title: 'Website And Dashboard Truth Rule',
    content_type: 'dashboard_rule',
    language: 'en',
    category: 'dashboard',
    source: 'codex_project_library',
    summary: 'Dashboard must show real data or explicit blockers, never fake activity.',
    content: [
      'Dashboards must use live Supabase, Meta, content and agent_runs data where possible.',
      'If an integration is not connected, show blocked/not configured, not active.',
      'Mock conversations, mock leads or fake handoffs must not be auto-created in production.',
      'Every automated agent action should leave an agent_run or lead_activity record.',
    ].join('\n'),
  },
  {
    title: 'Creative Recovery Instructions',
    content_type: 'content_plan',
    language: 'en',
    category: 'creative',
    source: 'codex_project_library',
    summary: 'What agents should create during recovery mode.',
    content: [
      'Create publish-ready posts for Israeli and Filipino markets, but keep them in review until Brand Guard passes.',
      'Israeli recovery angle: legal clarity, fixed shekel entry price, 3 ownership paths, professional WhatsApp consultation.',
      'Filipino recovery angle: BDO financing, PHP 395,000 verified Airbnb income, Villa C/D availability, Panglao tourism growth.',
      'Avoid forbidden words: amazing, incredible, dream home, once in a lifetime, guaranteed, risk-free.',
    ].join('\n'),
  },
];

export async function seedProjectKnowledge(supabase: SupabaseClient) {
  const results: Array<{ title: string; action: 'inserted' | 'updated' | 'failed'; error?: string }> = [];
  const now = new Date().toISOString();

  for (const entry of PROJECT_KNOWLEDGE_ENTRIES) {
    const { data: existing, error: lookupError } = await supabase
      .from('knowledge_base')
      .select('id')
      .eq('title', entry.title)
      .maybeSingle();

    if (lookupError) {
      results.push({ title: entry.title, action: 'failed', error: lookupError.message });
      continue;
    }

    const payload = {
      title: entry.title,
      content: entry.content,
      content_type: entry.content_type,
      language: entry.language,
      metadata: { seeded_by: 'agent_training', seeded_at: now, source: entry.source, category: entry.category, summary: entry.summary },
      updated_at: now,
    };

    if (existing?.id) {
      const { error } = await supabase
        .from('knowledge_base')
        .update(payload)
        .eq('id', existing.id);
      results.push({ title: entry.title, action: error ? 'failed' : 'updated', error: error?.message });
    } else {
      const { error } = await supabase
        .from('knowledge_base')
        .insert({ ...payload, created_at: now });
      results.push({ title: entry.title, action: error ? 'failed' : 'inserted', error: error?.message });
    }
  }

  return results;
}
