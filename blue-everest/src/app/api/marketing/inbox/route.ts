import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export const dynamic = 'force-dynamic';

type ActivityRow = {
  id: string;
  lead_id: string | null;
  activity_type: string;
  description: string | null;
  channel: string | null;
  metadata: Record<string, unknown> | null;
  performed_by: string | null;
  created_at: string;
};

const INBOUND_TYPES = new Set([
  'meta_dm_received',
  'meta_dm_postback',
  'meta_comment_received',
  'whatsapp_received',
  'chat_message_received',
  'lead_created',
]);

const OUTBOUND_TYPES = new Set([
  'meta_dm_sent',
  'meta_comment_replied',
  'facebook_sales_followup_sent',
  'whatsapp_sent',
  'sales_followup_logged',
  'chat_response_sent',
]);

function normalizeChannel(row: ActivityRow) {
  if (row.channel === 'meta_messenger') return 'facebook_dm';
  if (row.channel === 'meta_page') return 'facebook_comment';
  if (row.channel === 'whatsapp') return 'whatsapp';
  if (row.channel === 'chatbot' || row.channel === 'website_chat') return 'website_chat';
  if (row.channel === 'sales_queue') return 'sales_queue';
  if (row.activity_type.startsWith('meta_')) return 'facebook';
  return row.channel ?? 'system';
}

function inferDirection(activityType: string) {
  if (INBOUND_TYPES.has(activityType) || activityType.endsWith('_received')) return 'inbound';
  if (OUTBOUND_TYPES.has(activityType) || activityType.endsWith('_sent') || activityType.endsWith('_replied')) return 'outbound';
  return 'system';
}

function textFromActivity(row: ActivityRow) {
  const metadata = row.metadata ?? {};
  const candidates = [
    metadata.text,
    metadata.message,
    metadata.reply_text,
    metadata.postback_payload,
    row.description,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim().slice(0, 500);
    }
  }

  return row.activity_type.replaceAll('_', ' ');
}

function increment(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

export async function GET(request: Request) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 80), 200);

  const { data, error } = await supabase
    .from('lead_activities')
    .select('id, lead_id, activity_type, description, channel, metadata, performed_by, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = ((data ?? []) as ActivityRow[]).map((row) => {
    const channel = normalizeChannel(row);
    const direction = inferDirection(row.activity_type);
    return {
      id: row.id,
      leadId: row.lead_id,
      channel,
      direction,
      type: row.activity_type,
      text: textFromActivity(row),
      performedBy: row.performed_by,
      createdAt: row.created_at,
      needsHumanReview:
        direction === 'inbound' &&
        (channel === 'facebook_dm' || channel === 'facebook_comment' || channel === 'website_chat'),
    };
  });

  const byChannel: Record<string, number> = {};
  const byDirection: Record<string, number> = {};
  const latestOutboundByLead = new Map<string, string>();
  const latestInboundByLead = new Map<string, { at: string; channel: string }>();

  for (const row of rows) {
    increment(byChannel, row.channel);
    increment(byDirection, row.direction);

    if (!row.leadId) continue;
    if (row.direction === 'outbound' && !latestOutboundByLead.has(row.leadId)) {
      latestOutboundByLead.set(row.leadId, row.createdAt);
    }
    if (row.direction === 'inbound' && !latestInboundByLead.has(row.leadId)) {
      latestInboundByLead.set(row.leadId, { at: row.createdAt, channel: row.channel });
    }
  }

  let openThreads = 0;
  const openByChannel: Record<string, number> = {};

  latestInboundByLead.forEach((inbound, leadId) => {
    const outboundAt = latestOutboundByLead.get(leadId);
    if (!outboundAt || new Date(inbound.at).getTime() > new Date(outboundAt).getTime()) {
      openThreads += 1;
      increment(openByChannel, inbound.channel);
    }
  });

  return Response.json({
    items: rows,
    total: rows.length,
    summary: {
      byChannel,
      byDirection,
      openThreads,
      openByChannel,
      facebookReadyInCode: true,
      watiRequiredForFacebook: false,
      blockers: [
        'If Facebook events are not arriving, verify the Meta webhook subscription, app mode and required Page Messaging permissions.',
        'WATI is optional for WhatsApp automation only. Website chat and Facebook Messenger can work without WATI.',
      ],
    },
  });
}
