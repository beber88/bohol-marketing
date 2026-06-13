import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { sendMessengerMessage } from '@/lib/connectors/meta-graph';
import { buildSalesOsResponse } from '@/lib/sales-os/blue-everest-agent';
import { SITE_CONFIG } from '@/lib/config';
import { hasServerEnv } from '@/lib/server-env';

export const dynamic = 'force-dynamic';

type LeadRow = Record<string, unknown>;
type ConversationMessage = { role: string; content: string; timestamp?: string };

function normalizePhone(value: unknown) {
  return String(value ?? '').replace(/[^\d+]/g, '');
}

function inferMarket(lead: LeadRow): 'IL' | 'PH' | 'INTL' {
  const raw = (lead.raw_data as Record<string, unknown> | null) ?? {};
  const phone = normalizePhone(lead.whatsapp ?? lead.phone);
  const language = String(lead.preferred_language ?? '').toLowerCase();
  const nationality = String(lead.nationality ?? '').toLowerCase();
  if (raw.market === 'IL' || language === 'he' || phone.startsWith('+972') || nationality.includes('israel')) return 'IL';
  if (raw.market === 'PH' || phone.startsWith('+63') || nationality.includes('philippines')) return 'PH';
  return 'INTL';
}

function getMessages(lead: LeadRow): ConversationMessage[] {
  const raw = (lead.raw_data as Record<string, unknown> | null) ?? {};
  const conversations = raw.conversations;
  if (!Array.isArray(conversations)) return [];
  return conversations
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        role: String(row.role ?? 'user'),
        content: String(row.content ?? ''),
        timestamp: String(row.timestamp ?? lead.created_at ?? new Date().toISOString()),
      };
    });
}

function buildScript(lead: LeadRow, market: 'IL' | 'PH' | 'INTL') {
  const name = String(lead.full_name ?? '').trim() || 'there';
  const raw = (lead.raw_data as Record<string, unknown> | null) ?? {};
  const messages = getMessages(lead);
  const latestMessage = [...messages].reverse().find((message) => message.role === 'user')?.content;
  const response = buildSalesOsResponse({
    message:
      latestMessage ??
      (market === 'IL'
        ? 'הלקוח התעניין בפרויקט ורוצה המשך טיפול'
        : 'The lead asked about the project and needs follow-up'),
    history: messages
      .filter((message) => message.content)
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
        timestamp: message.timestamp,
      })),
    preferredLanguage:
      market === 'IL' || lead.preferred_language === 'he' || raw.language === 'he' ? 'he' : 'en',
    leadName: name === 'there' ? null : name,
    channel: inferChannel(lead.source) === 'facebook_dm' ? 'facebook_dm' : 'crm',
  });

  return response.reply;
}

function waLink(phone: unknown, text: string) {
  const normalized = normalizePhone(phone);
  if (!normalized || normalized.length < 8) return SITE_CONFIG.whatsappLinks.marketing;
  return `https://wa.me/${normalized.replace(/^\+/, '')}?text=${encodeURIComponent(text)}`;
}

function inferChannel(source: unknown) {
  if (source === 'meta_messenger') return 'facebook_dm';
  if (source === 'meta_comment') return 'facebook_comment';
  if (source === 'chatbot') return 'website_chat';
  if (source === 'facebook') return 'facebook';
  return 'whatsapp';
}

export async function GET(request: Request) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? 25);

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .in('lead_status', ['warm', 'hot', 'very_hot'])
    .order('lead_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const leads = (data ?? []).map((lead) => {
    const market = inferMarket(lead as LeadRow);
    const script = buildScript(lead as LeadRow, market);
    const phone = lead.whatsapp ?? lead.phone;
    const messages = getMessages(lead as LeadRow);
    const raw = (lead.raw_data as Record<string, unknown> | null) ?? {};
    const facebookPsid = typeof raw.meta_psid === 'string' ? raw.meta_psid : null;
    const channel = inferChannel(lead.source);
    const canContact = Boolean(waLink(phone, script) || lead.email || facebookPsid);
    return {
      id: lead.id,
      agent: channel.startsWith('facebook') ? 'facebook_sales_agent' : messages.length > 0 ? 'david_chatbot' : 'sales_followup_agent',
      agentLabel: channel.startsWith('facebook') ? 'Facebook Sales Agent' : messages.length > 0 ? 'David (Website Chat)' : 'Sales Follow-up Agent',
      clientName: lead.full_name,
      clientPhone: phone,
      clientOrigin: lead.nationality ?? market,
      language: lead.preferred_language ?? (market === 'IL' ? 'he' : 'en'),
      channel,
      messages,
      leadScore: lead.lead_score ?? 0,
      leadStatus: lead.lead_status ?? 'warm',
      signals: (raw.signals as string[] | undefined) ?? (raw.detected_signals as string[] | undefined) ?? [],
      handedOff: canContact && ['hot', 'very_hot'].includes(String(lead.lead_status)),
      handoffReason: canContact
        ? channel === 'facebook_dm'
          ? 'Facebook follow-up can be sent through the Meta Messenger API. WATI is not required.'
          : 'Follow-up script ready for human, email or WATI send.'
        : 'Missing phone/email/Facebook PSID, collect contact details first.',
      startedAt: lead.first_contact_at ?? lead.created_at,
      lastMessageAt: lead.last_contact_at ?? lead.updated_at ?? lead.created_at,
      summary: `${market} ${lead.lead_status} lead from ${lead.source}. Score ${lead.lead_score ?? 0}.`,
      followupScript: script,
      whatsappLink: waLink(phone, script),
      facebookContactReady: Boolean(facebookPsid),
      canContact,
    };
  });

  return Response.json({
    leads,
    total: leads.length,
    blockers: {
      watiConfigured: hasServerEnv('WATI_API_KEY'),
      note: hasServerEnv('WATI_API_KEY')
        ? 'WATI key is configured. Live sending still depends on approved templates and WATI account status.'
        : 'WATI is not configured, so this queue prepares scripts and WhatsApp links but does not auto-send.',
    },
  });
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

  const body = await request.json();
  const leadId = String(body.leadId ?? '');
  const message = String(body.message ?? '').trim();
  const channel = String(body.channel ?? '').trim();
  if (!leadId || !message) return Response.json({ error: 'leadId and message are required' }, { status: 400 });

  const { data: lead } = await supabase
    .from('leads')
    .select('id, source, raw_data')
    .eq('id', leadId)
    .maybeSingle();

  const raw = (lead?.raw_data as Record<string, unknown> | null) ?? {};
  const facebookPsid = typeof raw.meta_psid === 'string' ? raw.meta_psid : null;
  const shouldSendFacebook =
    facebookPsid && (channel === 'facebook_dm' || lead?.source === 'meta_messenger');

  let liveSend = false;
  let sendResult: boolean | null = null;

  if (shouldSendFacebook) {
    sendResult = await sendMessengerMessage(facebookPsid, message);
    liveSend = sendResult;
  }

  const { error } = await supabase.from('lead_activities').insert({
    lead_id: leadId,
    activity_type: shouldSendFacebook ? 'facebook_sales_followup_sent' : 'sales_followup_logged',
    description: message.slice(0, 1000),
    channel: shouldSendFacebook ? 'meta_messenger' : 'sales_queue',
    metadata: {
      source: 'dashboard_sales_activity',
      live_send: liveSend,
      send_result: sendResult,
      reason: shouldSendFacebook
        ? 'Sent through Meta Messenger API from the dashboard sales queue.'
        : 'Logged from dashboard. Live sending requires WATI, email integration or human WhatsApp action.',
    },
    performed_by: 'sales_agent',
    created_at: new Date().toISOString(),
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
