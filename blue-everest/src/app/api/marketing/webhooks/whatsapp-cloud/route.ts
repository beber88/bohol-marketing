import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import {
  normalizeWhatsAppPhone,
  sendWhatsAppCloudText,
  whatsappCloudStatus,
} from '@/lib/connectors/whatsapp-cloud';
import { buildSalesOsResponse } from '@/lib/sales-os/blue-everest-agent';
import { getOrCreatePanglaoProjectId } from '@/lib/marketing/project';
import type { SupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type WhatsAppMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
};

function verifyToken() {
  return (
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ??
    process.env.META_WEBHOOK_VERIFY_TOKEN ??
    null
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === verifyToken()) {
    return new Response(challenge ?? '', { status: 200 });
  }

  return Response.json({
    ok: true,
    purpose: 'WhatsApp Cloud API webhook for Blue Everest Sales OS.',
    configured: whatsappCloudStatus(),
  });
}

function extractText(message: WhatsAppMessage) {
  return (
    message.text?.body ??
    message.button?.text ??
    message.interactive?.button_reply?.title ??
    message.interactive?.list_reply?.title ??
    ''
  ).trim();
}

async function findOrCreateLead(params: {
  supabase: SupabaseClient;
  phone: string;
  name?: string | null;
  messageText: string;
}) {
  const normalized = normalizeWhatsAppPhone(params.phone);
  const { data: existing } = await params.supabase
    .from('leads')
    .select('*')
    .or(`phone.eq.${normalized},whatsapp.eq.${normalized}`)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (existing?.[0]) return existing[0] as Record<string, unknown>;

  const projectId = await getOrCreatePanglaoProjectId(params.supabase);
  const salesOs = buildSalesOsResponse({
    message: params.messageText,
    channel: 'whatsapp',
    leadName: params.name ?? null,
  });

  const { data: lead, error } = await params.supabase
    .from('leads')
    .insert({
      project_id: projectId,
      source: 'whatsapp_cloud',
      full_name: params.name ?? null,
      phone: normalized,
      whatsapp: normalized,
      preferred_language: salesOs.language,
      lead_score: salesOs.shouldEscalate ? 75 : 35,
      lead_status: salesOs.shouldEscalate ? 'hot' : 'warm',
      funnel_stage: salesOs.shouldEscalate ? 'qualified' : 'contacted',
      raw_data: {
        whatsapp_phone: normalized,
        sales_os: {
          intent: salesOs.intent,
          next_best_action: salesOs.nextBestAction,
          crm_summary: salesOs.crmSummary,
          confidence: salesOs.confidence,
          should_escalate: salesOs.shouldEscalate,
        },
        conversations: [],
      },
      first_contact_at: new Date().toISOString(),
      last_contact_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return lead as Record<string, unknown>;
}

async function processMessage(
  supabase: SupabaseClient,
  message: WhatsAppMessage,
  contactName?: string | null
) {
  const from = message.from;
  const text = extractText(message);
  if (!from || !text) return { skipped: true };

  const lead = await findOrCreateLead({
    supabase,
    phone: from,
    name: contactName,
    messageText: text,
  });

  const raw = (lead.raw_data as Record<string, unknown> | null) ?? {};
  const existingConversation = Array.isArray(raw.conversations) ? raw.conversations : [];
  const history = existingConversation
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        role: row.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: String(row.content ?? ''),
        timestamp: typeof row.timestamp === 'string' ? row.timestamp : undefined,
      };
    });

  const salesOs = buildSalesOsResponse({
    message: text,
    history,
    channel: 'whatsapp',
    preferredLanguage: lead.preferred_language === 'he' ? 'he' : lead.preferred_language === 'en' ? 'en' : null,
    leadName: String(lead.full_name ?? contactName ?? '').trim() || null,
  });

  const now = new Date().toISOString();
  const updatedConversation = [
    ...history,
    { role: 'user' as const, content: text, timestamp: message.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : now },
    { role: 'assistant' as const, content: salesOs.reply, timestamp: now },
  ];

  const sendResult = await sendWhatsAppCloudText(from, salesOs.reply);

  await supabase.from('lead_activities').insert([
    {
      lead_id: lead.id,
      activity_type: 'whatsapp_cloud_received',
      description: text.slice(0, 1000),
      channel: 'whatsapp',
      metadata: {
        message_id: message.id ?? null,
        sender_phone: from,
        text,
        sales_os_intent: salesOs.intent,
      },
      created_at: now,
    },
    {
      lead_id: lead.id,
      activity_type: 'whatsapp_cloud_reply_sent',
      description: salesOs.reply.slice(0, 1000),
      channel: 'whatsapp',
      metadata: {
        live_send: sendResult.ok,
        send_status: sendResult.status,
        send_error: sendResult.error ?? null,
        sales_os: {
          intent: salesOs.intent,
          next_best_action: salesOs.nextBestAction,
          crm_summary: salesOs.crmSummary,
          confidence: salesOs.confidence,
          should_escalate: salesOs.shouldEscalate,
        },
      },
      performed_by: 'sales_os_david',
      created_at: now,
    },
  ]);

  await supabase
    .from('leads')
    .update({
      full_name: lead.full_name ?? contactName ?? null,
      preferred_language: salesOs.language,
      lead_score: Math.max(Number(lead.lead_score ?? 0), salesOs.shouldEscalate ? 75 : 35),
      lead_status: salesOs.shouldEscalate ? 'hot' : String(lead.lead_status ?? 'warm'),
      funnel_stage: salesOs.shouldEscalate ? 'qualified' : String(lead.funnel_stage ?? 'contacted'),
      last_contact_at: now,
      raw_data: {
        ...raw,
        conversations: updatedConversation,
        whatsapp_phone: normalizeWhatsAppPhone(from),
        sales_os: {
          intent: salesOs.intent,
          next_best_action: salesOs.nextBestAction,
          crm_summary: salesOs.crmSummary,
          confidence: salesOs.confidence,
          should_escalate: salesOs.shouldEscalate,
        },
      },
      notes: salesOs.crmSummary,
      updated_at: now,
    })
    .eq('id', lead.id);

  return {
    leadId: lead.id,
    language: salesOs.language,
    intent: salesOs.intent,
    sent: sendResult.ok,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ received: true, error: 'Supabase not configured' });

    const entries = Array.isArray(body.entry) ? body.entry : [];
    const processed: unknown[] = [];

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change.value ?? {};
        const contacts = Array.isArray(value.contacts) ? value.contacts : [];
        const messages = Array.isArray(value.messages) ? value.messages : [];
        for (const message of messages as WhatsAppMessage[]) {
          const contact = contacts.find((item: Record<string, unknown>) => item.wa_id === message.from);
          const profile = contact?.profile as Record<string, unknown> | undefined;
          processed.push(await processMessage(supabase, message, profile?.name as string | undefined));
        }
      }
    }

    return Response.json({ received: true, processed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[whatsapp-cloud webhook] error:', message);
    return Response.json({ received: true, error: message });
  }
}
