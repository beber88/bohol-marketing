import type { SupabaseClient } from '@supabase/supabase-js';
import { hasMetaPageToken } from '@/lib/connectors/meta-graph';
import { whatsappCloudStatus } from '@/lib/connectors/whatsapp-cloud';
import { buildSalesOsResponse, type SalesOsChannel, type SalesOsMessage } from '@/lib/sales-os/blue-everest-agent';
import { hasServerEnv } from '@/lib/server-env';

export type ConversationChannel = 'website_chat' | 'facebook_dm' | 'facebook_comment' | 'whatsapp' | 'email' | 'crm';
export type ConversationStatus = 'open' | 'waiting_human' | 'agent_ready' | 'follow_up' | 'closed';

export type ConversationThread = {
  id: string;
  leadId: string | null;
  sessionId: string | null;
  channel: ConversationChannel;
  status: ConversationStatus;
  agentMode: 'auto' | 'human_takeover';
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  clientOrigin: string | null;
  language: 'he' | 'en';
  leadScore: number;
  leadStatus: string;
  funnelStage: string | null;
  villaInterest: string | null;
  assignedTo: string | null;
  lastMessageAt: string;
  unread: boolean;
  messages: SalesOsMessage[];
  summary: string;
  nextBestAction: string;
  suggestedReply: string;
  signals: string[];
  canSendLive: boolean;
  provider: 'meta_messenger' | 'whatsapp_cloud' | 'website_chat' | 'log_only';
  blockers: string[];
};

type LeadRow = Record<string, unknown>;
type ConversationRow = Record<string, unknown>;
type ActivityRow = Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizePhone(value: unknown) {
  return String(value ?? '').replace(/[^\d+]/g, '');
}

export function normalizeConversationChannel(source: unknown, metadata?: Record<string, unknown>): ConversationChannel {
  const raw = String(metadata?.channel ?? source ?? '').toLowerCase();
  if (raw.includes('messenger') || raw === 'facebook_dm' || raw === 'meta_messenger') return 'facebook_dm';
  if (raw.includes('comment')) return 'facebook_comment';
  if (raw.includes('whatsapp') || raw.includes('wati')) return 'whatsapp';
  if (raw.includes('email')) return 'email';
  if (raw.includes('chat') || raw.includes('website')) return 'website_chat';
  return 'crm';
}

export function providerForChannel(channel: ConversationChannel) {
  if (channel === 'facebook_dm') return 'meta_messenger' as const;
  if (channel === 'whatsapp') return 'whatsapp_cloud' as const;
  if (channel === 'website_chat') return 'website_chat' as const;
  return 'log_only' as const;
}

export function providerStatus() {
  const whatsApp = whatsappCloudStatus();
  return {
    metaMessenger: {
      configured: hasMetaPageToken(),
      requiredEnv: ['META_PAGE_ACCESS_TOKEN', 'META_WEBHOOK_VERIFY_TOKEN'],
    },
    whatsAppCloud: {
      ...whatsApp,
      configured: whatsApp.configured,
      requiredEnv: ['WHATSAPP_CLOUD_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_WEBHOOK_VERIFY_TOKEN'],
    },
    supabaseServiceRoleConfigured: hasServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
    watiRequired: false,
  };
}

function rawMessages(value: unknown): SalesOsMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        role: row.role === 'assistant' ? 'assistant' : 'user',
        content: String(row.content ?? row.text ?? row.message ?? '').trim(),
        timestamp: asString(row.timestamp) ?? asString(row.created_at) ?? undefined,
      } satisfies SalesOsMessage;
    })
    .filter((message) => message.content);
}

function activityToMessage(activity: ActivityRow): SalesOsMessage | null {
  const metadata = asRecord(activity.metadata);
  const type = String(activity.activity_type ?? '');
  const content = asString(metadata.text) ?? asString(metadata.message) ?? asString(activity.description);
  if (!content) return null;
  const inbound = type.endsWith('_received') || type.includes('postback') || type.includes('candidate');
  return {
    role: inbound ? 'user' : 'assistant',
    content,
    timestamp: asString(activity.created_at) ?? undefined,
  };
}

function inferLanguage(lead: LeadRow, messages: SalesOsMessage[]): 'he' | 'en' {
  const preferred = lead.preferred_language;
  if (preferred === 'he' || preferred === 'en') return preferred;
  const text = messages.map((message) => message.content).join('\n');
  return /[\u0590-\u05FF]/.test(text) ? 'he' : 'en';
}

function inferUnread(messages: SalesOsMessage[]) {
  const latest = messages[messages.length - 1];
  return latest?.role === 'user';
}

function inferStatus(lead: LeadRow, messages: SalesOsMessage[], agentMode: 'auto' | 'human_takeover'): ConversationStatus {
  if (agentMode === 'human_takeover') return 'waiting_human';
  const rawStatus = String(lead.lead_status ?? '');
  if (rawStatus === 'closed_won' || rawStatus === 'closed_lost') return 'closed';
  if (inferUnread(messages)) return 'agent_ready';
  if (lead.next_followup_at) return 'follow_up';
  return 'open';
}

function channelCanSend(channel: ConversationChannel, lead: LeadRow) {
  const raw = asRecord(lead.raw_data);
  if (channel === 'facebook_dm') return Boolean(asString(raw.meta_psid) && hasMetaPageToken());
  if (channel === 'whatsapp') return Boolean((asString(lead.whatsapp) || asString(lead.phone)) && whatsappCloudStatus().configured);
  if (channel === 'website_chat') return true;
  return false;
}

function blockersFor(channel: ConversationChannel, lead: LeadRow) {
  const blockers: string[] = [];
  const raw = asRecord(lead.raw_data);
  if (channel === 'facebook_dm') {
    if (!asString(raw.meta_psid)) blockers.push('Missing Facebook PSID for live Messenger send.');
    if (!hasMetaPageToken()) blockers.push('META_PAGE_ACCESS_TOKEN is not configured.');
  }
  if (channel === 'whatsapp') {
    if (!asString(lead.whatsapp) && !asString(lead.phone)) blockers.push('Missing WhatsApp phone number.');
    if (!whatsappCloudStatus().configured) blockers.push('WhatsApp Cloud API is not configured. WATI is not required.');
  }
  if (channel === 'facebook_comment') blockers.push('Public comments need a separate approved reply action.');
  if (channel === 'email') blockers.push('Email sending is not connected to this live inbox yet.');
  return blockers;
}

function salesOsChannel(channel: ConversationChannel): SalesOsChannel {
  if (channel === 'facebook_dm') return 'facebook_dm';
  if (channel === 'facebook_comment') return 'facebook_comment';
  if (channel === 'whatsapp') return 'whatsapp';
  if (channel === 'email') return 'email';
  if (channel === 'website_chat') return 'website_chat';
  return 'crm';
}

function buildThread(params: {
  id: string;
  lead: LeadRow;
  messages: SalesOsMessage[];
  channel: ConversationChannel;
  sessionId?: string | null;
  metadata?: Record<string, unknown>;
}): ConversationThread {
  const { lead, channel, metadata = {} } = params;
  const messages = params.messages;
  const language = inferLanguage(lead, messages);
  const latestUser = [...messages].reverse().find((message) => message.role === 'user');
  const salesOs = buildSalesOsResponse({
    message: latestUser?.content ?? (language === 'he' ? 'לקוח צריך המשך טיפול' : 'Lead needs follow-up'),
    history: messages,
    channel: salesOsChannel(channel),
    preferredLanguage: language,
    leadName: asString(lead.full_name),
  });
  const agentMode = metadata.agent_mode === 'human_takeover' ? 'human_takeover' : 'auto';
  const lastMessageAt =
    messages[messages.length - 1]?.timestamp ??
    asString(lead.last_contact_at) ??
    asString(lead.updated_at) ??
    asString(lead.created_at) ??
    new Date().toISOString();
  const blockers = blockersFor(channel, lead);
  const signals = [
    ...new Set([
      ...salesOs.leadSignals,
      ...((asRecord(lead.raw_data).signals as string[] | undefined) ?? []),
      ...((asRecord(lead.raw_data).detected_signals as string[] | undefined) ?? []),
    ]),
  ];

  return {
    id: params.id,
    leadId: asString(lead.id),
    sessionId: params.sessionId ?? asString(asRecord(lead.raw_data).chatbot_session_id),
    channel,
    status: inferStatus(lead, messages, agentMode),
    agentMode,
    clientName: asString(lead.full_name),
    clientPhone: asString(lead.whatsapp) ?? asString(lead.phone),
    clientEmail: asString(lead.email),
    clientOrigin: asString(lead.nationality),
    language,
    leadScore: Number(lead.lead_score ?? 0),
    leadStatus: String(lead.lead_status ?? 'cold'),
    funnelStage: asString(lead.funnel_stage),
    villaInterest: asString(lead.villa_interest),
    assignedTo: asString(lead.assigned_to),
    lastMessageAt,
    unread: inferUnread(messages),
    messages,
    summary: asString(lead.notes) ?? salesOs.crmSummary,
    nextBestAction: salesOs.nextBestAction,
    suggestedReply: salesOs.reply,
    signals,
    canSendLive: channelCanSend(channel, lead),
    provider: providerForChannel(channel),
    blockers,
  };
}

export async function listConversationThreads(supabase: SupabaseClient, limit = 80) {
  const { data: leadRows, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .order('last_contact_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (leadsError) throw leadsError;

  const { data: convoRows } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(limit);

  const byLead = new Map<string, ConversationRow>();
  for (const convo of (convoRows ?? []) as ConversationRow[]) {
    const leadId = asString(convo.lead_id);
    if (leadId && !byLead.has(leadId)) byLead.set(leadId, convo);
  }

  const threads = ((leadRows ?? []) as LeadRow[])
    .map((lead) => {
      const raw = asRecord(lead.raw_data);
      const convo = byLead.get(String(lead.id));
      const metadata = asRecord(convo?.metadata);
      const messages =
        rawMessages(convo?.messages).length > 0
          ? rawMessages(convo?.messages)
          : rawMessages(raw.conversations);
      const channel = normalizeConversationChannel(lead.source, metadata);
      return buildThread({
        id: asString(convo?.id) ?? String(lead.id),
        lead,
        messages,
        channel,
        sessionId: asString(convo?.session_id),
        metadata,
      });
    })
    .filter((thread) => thread.messages.length > 0 || thread.leadScore > 0);

  return threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export async function getConversationThread(supabase: SupabaseClient, id: string) {
  const threads = await listConversationThreads(supabase, 200);
  let thread = threads.find((item) => item.id === id || item.leadId === id || item.sessionId === id);
  if (thread) return thread;

  const { data: lead } = await supabase.from('leads').select('*').eq('id', id).maybeSingle();
  if (!lead) return null;

  const { data: activities } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: true })
    .limit(100);

  const messages = ((activities ?? []) as ActivityRow[]).map(activityToMessage).filter(Boolean) as SalesOsMessage[];
  thread = buildThread({
    id: String(lead.id),
    lead: lead as LeadRow,
    messages,
    channel: normalizeConversationChannel((lead as LeadRow).source),
  });

  return thread;
}
