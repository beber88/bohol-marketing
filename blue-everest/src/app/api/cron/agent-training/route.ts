import { brandGuard } from '@/lib/agents/brand-guard';
import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { seedProjectKnowledge } from '@/lib/knowledge/project-library';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const TRAINING_DRILLS = [
  {
    name: 'israeli_legal_post_guard',
    language: 'he' as const,
    market: 'IL' as const,
    content: [
      '3 דרכים חוקיות לרכישת וילה בפיליפינים כישראלים:',
      'Deed of Assignment, Leasehold 25+25, Domestic Corporation.',
      'וילה D: 1,535,000 ש"ח. וילה C: 1,650,000 ש"ח. הזמנה: 9,999 ש"ח.',
      'WhatsApp שיווק: +639542555553 | WhatsApp משרד: +639958565865',
    ].join('\n'),
  },
  {
    name: 'filipino_bdo_post_guard',
    language: 'en' as const,
    market: 'PH' as const,
    content: [
      'Villa D is PHP 32,500,000 and Villa C is PHP 35,000,000.',
      'Verified Airbnb income is PHP 395,000 per month, with BDO Bank financing available for eligible Filipino buyers.',
      'WhatsApp Marketing: +639542555553 | WhatsApp Office: +639958565865',
    ].join('\n'),
  },
];

export async function GET() {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return Response.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const startedAt = new Date().toISOString();
  const seeded = await seedProjectKnowledge(supabase);
  const drillResults = [];

  for (const drill of TRAINING_DRILLS) {
    const result = await brandGuard.execute({
      trigger: 'daily_cron',
      query: drill.content,
      context: {
        source: 'agent_training',
        language: drill.language,
        market: drill.market,
        skipLLM: true,
      },
    });
    drillResults.push({
      name: drill.name,
      passed: Boolean((result.data as { passed?: boolean } | undefined)?.passed),
      runId: result.runId,
      error: result.error ?? null,
    });
  }

  const salesPractice = [
    {
      scenario: 'Israeli investor asks about ownership and price',
      expected: 'Use fixed shekel prices, explain Deed of Assignment, Leasehold 25+25 and Domestic Corporation, collect phone/email for handoff.',
    },
    {
      scenario: 'Filipino buyer asks about Villa C financing',
      expected: 'Use PHP prices, mention BDO Bank financing, qualify budget/timeline and prepare handoff.',
    },
    {
      scenario: 'Website visitor asks for reservation',
      expected: 'Score hot, collect contact, create lead_activity and prepare WhatsApp follow-up.',
    },
  ];

  await supabase.from('agent_runs').insert({
    agent_id: 'agent_training',
    status: drillResults.every((drill) => drill.passed) && seeded.every((item) => item.action !== 'failed') ? 'complete' : 'partial',
    input: { trigger: 'agent_training', drills: TRAINING_DRILLS.map((drill) => drill.name) },
    output: {
      summary: `Seeded ${seeded.filter((item) => item.action !== 'failed').length}/${seeded.length} knowledge entries and ran ${drillResults.length} compliance drills.`,
      seeded,
      drillResults,
      salesPractice,
    },
    triggered_by: 'daily_cron',
    total_cost_usd: 0,
    total_tokens: 0,
    latency_ms: Date.now() - Date.parse(startedAt),
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    created_at: startedAt,
  });

  return Response.json({
    ran_at: startedAt,
    summary: {
      knowledge_total: seeded.length,
      knowledge_failed: seeded.filter((item) => item.action === 'failed').length,
      drills_total: drillResults.length,
      drills_passed: drillResults.filter((item) => item.passed).length,
    },
    seeded,
    drillResults,
    salesPractice,
  });
}
