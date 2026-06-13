import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { sendMessengerMessage } from '@/lib/connectors/meta-graph';
import { sendWhatsAppCloudText } from '@/lib/connectors/whatsapp-cloud';
import { wati } from '@/lib/connectors/wati';
import { getConversationThread } from '@/lib/marketing/conversations-os';

export const dynamic = 'force-dynamic';

function rawData(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const message = String(body.message ?? '').trim();
    const approved = body.approved === true;
    const operator = String(body.operator ?? 'dashboard');

    if (!message) return Response.json({ error: 'message is required' }, { status: 400 });
    if (!approved) {
      return Response.json(
        { error: 'Human approval is required before outbound messages are sent or logged.' },
        { status: 409 }
      );
    }

    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const thread = await getConversationThread(supabase, id);
    if (!thread?.leadId) return Response.json({ error: 'Conversation not found' }, { status: 404 });

    const { data: lead } = await supabase
      .from('leads')
      .select('id, phone, whatsapp, raw_data')
      .eq('id', thread.leadId)
      .maybeSingle();

    const raw = rawData(lead?.raw_data);
    let liveSend = false;
    let providerStatus: unknown = null;
    let activityType = 'conversation_reply_logged';
    let provider = 'log_only';

    if (thread.channel === 'facebook_dm' && typeof raw.meta_psid === 'string') {
      provider = 'meta_messenger';
      liveSend = await sendMessengerMessage(raw.meta_psid, message);
      providerStatus = { ok: liveSend };
      activityType = liveSend ? 'meta_dm_sent' : 'meta_dm_send_failed';
    } else if (thread.channel === 'whatsapp') {
      const phone = String(lead?.whatsapp ?? lead?.phone ?? '');
      const cloudResult = await sendWhatsAppCloudText(phone, message);
      if (cloudResult.ok) {
        provider = 'whatsapp_cloud';
        liveSend = true;
        providerStatus = cloudResult;
        activityType = 'whatsapp_cloud_reply_sent';
      } else {
        provider = 'wati';
        try {
          const watiResult = await wati.sendTextMessage(phone, message);
          liveSend = Boolean(watiResult.result);
          providerStatus = {
            ok: liveSend,
            cloudFallbackReason: cloudResult.error ?? cloudResult.status,
            wati: watiResult,
          };
          activityType = liveSend ? 'wati_reply_sent' : 'wati_reply_logged';
        } catch (err) {
          liveSend = false;
          providerStatus = {
            ok: false,
            cloudFallbackReason: cloudResult.error ?? cloudResult.status,
            watiError: err instanceof Error ? err.message : 'Unknown WATI error',
          };
          activityType = 'whatsapp_reply_logged';
        }
      }
    } else if (thread.channel === 'website_chat') {
      provider = 'website_chat';
      activityType = 'website_chat_human_reply_logged';
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from('lead_activities').insert({
      lead_id: thread.leadId,
      activity_type: activityType,
      description: message.slice(0, 1000),
      channel: thread.channel,
      metadata: {
        source: 'blue_everest_conversations_os',
        provider,
        live_send: liveSend,
        provider_status: providerStatus,
        human_approved: true,
      },
      performed_by: operator,
      created_at: now,
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const nextConversation = [
      ...thread.messages,
      { role: 'assistant' as const, content: message, timestamp: now },
    ];

    await supabase
      .from('leads')
      .update({
        raw_data: {
          ...raw,
          conversations: nextConversation,
          last_conversations_os_reply_at: now,
        },
        last_contact_at: now,
        updated_at: now,
      })
      .eq('id', thread.leadId);

    if (thread.sessionId) {
      await supabase
        .from('conversations')
        .update({
          messages: nextConversation,
          last_message_at: now,
          metadata: {
            agent_mode: 'human_takeover',
            taken_over_by: operator,
            last_human_message_at: now,
          },
        })
        .eq('session_id', thread.sessionId);
    }

    return Response.json({
      ok: true,
      liveSend,
      provider,
      providerStatus,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/conversations/[id]/send] POST error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
