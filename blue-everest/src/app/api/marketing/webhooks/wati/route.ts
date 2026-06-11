// src/app/api/marketing/webhooks/wati/route.ts
// WATI webhook handler - process inbound WhatsApp messages

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { quickScore } from '@/lib/agents/crm-lead-scorer';
import type { LeadData } from '@/lib/agents/crm-lead-scorer';

/**
 * POST: Process inbound WATI webhook events.
 * WATI sends WhatsApp message events including:
 * - Inbound messages from leads/contacts
 * - Message status updates (sent, delivered, read)
 * - Template message responses
 * - Flow completions
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = createSupabaseAdmin();
    if (!supabase) {
      console.warn(
        '[api/marketing/webhooks/wati] Database not configured, logging only'
      );
      console.log(
        '[api/marketing/webhooks/wati] Received event:',
        JSON.stringify(body).slice(0, 500)
      );
      return Response.json({ received: true });
    }

    // WATI webhook payload varies by event type
    // Common fields: whatsappNumber (or waId), text, type, timestamp
    const eventType = detectEventType(body);

    switch (eventType) {
      case 'inbound_message':
        await handleInboundMessage(body, supabase);
        break;

      case 'status_update':
        await handleStatusUpdate(body, supabase);
        break;

      case 'flow_completion':
        await handleFlowCompletion(body, supabase);
        break;

      case 'template_response':
        await handleTemplateResponse(body, supabase);
        break;

      default:
        // Log unrecognized events for debugging
        await supabase.from('lead_activities').insert({
          activity_type: 'wati_unknown_event',
          channel: 'whatsapp',
          metadata: {
            raw_payload: JSON.stringify(body).slice(0, 5000),
            detected_type: eventType,
          },
          created_at: new Date().toISOString(),
        });
        break;
    }

    return Response.json({ received: true, eventType });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/webhooks/wati] POST exception:', message);
    // Always return 200 to prevent webhook deactivation
    return Response.json({ received: true, error: message });
  }
}

// ---------------------------------------------------------------------------
// Event type detection
// ---------------------------------------------------------------------------

function detectEventType(
  body: Record<string, unknown>
): 'inbound_message' | 'status_update' | 'flow_completion' | 'template_response' | 'unknown' {
  // WATI payload structure detection
  if (body.eventType) {
    const et = (body.eventType as string).toLowerCase();
    if (et.includes('message') && et.includes('received')) return 'inbound_message';
    if (et.includes('status')) return 'status_update';
    if (et.includes('flow')) return 'flow_completion';
    if (et.includes('template')) return 'template_response';
  }

  // Fallback: check for message content indicators
  if (body.text || body.message || body.listReply || body.buttonReply) {
    return 'inbound_message';
  }
  if (body.statusString || body.status) {
    return 'status_update';
  }

  return 'unknown';
}

// ---------------------------------------------------------------------------
// Inbound message handler
// ---------------------------------------------------------------------------

async function handleInboundMessage(
  body: Record<string, unknown>,
  supabase: NonNullable<ReturnType<typeof createSupabaseAdmin>>
) {
  const senderPhone =
    (body.waId as string) ??
    (body.whatsappNumber as string) ??
    (body.senderPhone as string) ??
    null;
  const senderName =
    (body.senderName as string) ??
    (body.pushName as string) ??
    (body.contactName as string) ??
    null;
  const listReplyTitle =
    body.listReply && typeof body.listReply === 'object'
      ? ((body.listReply as Record<string, unknown>).title as string) ?? null
      : null;
  const buttonReplyTitle =
    body.buttonReply && typeof body.buttonReply === 'object'
      ? ((body.buttonReply as Record<string, unknown>).title as string) ?? null
      : null;
  const messageText =
    (body.text as string) ??
    (body.message as string) ??
    listReplyTitle ??
    buttonReplyTitle ??
    null;
  const messageType = (body.type as string) ?? 'text';
  const timestamp =
    (body.timestamp as string) ?? new Date().toISOString();

  // Classify the message intent
  const classification = classifyMessage(messageText ?? '');

  // Log the activity
  try {
    await supabase.from('lead_activities').insert({
      activity_type: 'whatsapp_received',
      channel: 'whatsapp',
      metadata: {
        sender_phone: senderPhone,
        sender_name: senderName,
        message_text: messageText?.slice(0, 2000),
        message_type: messageType,
        classification,
        wati_message_id: body.id ?? body.messageId ?? null,
        timestamp,
      },
      created_at: new Date().toISOString(),
    });
  } catch {
    console.warn(
      '[api/marketing/webhooks/wati] Failed to log inbound message activity'
    );
  }

  // Check if this sender is an existing lead
  if (senderPhone) {
    const normalizedPhone = normalizePhoneNumber(senderPhone);

    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, score, status, full_name')
      .or(`phone.eq.${normalizedPhone},whatsapp.eq.${normalizedPhone}`)
      .limit(1)
      .single();

    if (existingLead) {
      // Update existing lead with new activity
      const leadData: LeadData = {
        fullName: (existingLead as Record<string, unknown>).full_name as string | undefined,
        phone: normalizedPhone,
        activities: [
          {
            type: 'whatsapp_reply',
            channel: 'whatsapp',
            timestamp: new Date().toISOString(),
            metadata: { text: messageText?.slice(0, 500), classification },
          },
        ],
      };

      const scoring = quickScore(leadData);

      // Update lead score if it increased
      const currentScore = (existingLead as Record<string, unknown>).score as number;
      if (scoring.score > currentScore) {
        try {
          await supabase
            .from('leads')
            .update({
              score: scoring.score,
              status: scoring.status,
              urgency: scoring.urgency,
              next_action: scoring.nextAction,
              updated_at: new Date().toISOString(),
            })
            .eq('id', (existingLead as Record<string, unknown>).id);
        } catch {
          console.warn(
            '[api/marketing/webhooks/wati] Failed to update lead score'
          );
        }
      }
    } else {
      // Create a new lead from WhatsApp contact
      const leadData: LeadData = {
        fullName: senderName ?? undefined,
        phone: normalizedPhone,
        whatsapp: normalizedPhone,
        source: 'whatsapp_inbound',
        activities: [
          {
            type: 'whatsapp_sent',
            channel: 'whatsapp',
            timestamp: new Date().toISOString(),
            metadata: { text: messageText?.slice(0, 500), classification },
          },
        ],
      };

      const scoring = quickScore(leadData);

      try {
        await supabase.from('leads').insert({
          full_name: senderName,
          phone: normalizedPhone,
          whatsapp: normalizedPhone,
          source: 'whatsapp_inbound',
          market: 'INTL',
          score: scoring.score,
          status: scoring.status,
          urgency: scoring.urgency,
          next_action: scoring.nextAction,
          recommended_sequence: scoring.recommendedSequence,
          scoring_signals: scoring.signals,
          top_signals: scoring.topSignals,
          scoring_notes: scoring.notes,
          raw_data: {
            first_message: messageText?.slice(0, 1000),
            classification,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch {
        console.warn(
          '[api/marketing/webhooks/wati] Failed to create lead from WhatsApp'
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Status update handler
// ---------------------------------------------------------------------------

async function handleStatusUpdate(
  body: Record<string, unknown>,
  supabase: NonNullable<ReturnType<typeof createSupabaseAdmin>>
) {
  try {
    await supabase.from('lead_activities').insert({
      activity_type: 'whatsapp_status_update',
      channel: 'whatsapp',
      metadata: {
        status: body.statusString ?? body.status,
        message_id: body.id ?? body.messageId,
        phone: body.waId ?? body.whatsappNumber,
        timestamp: body.timestamp ?? new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });
  } catch {
    console.warn(
      '[api/marketing/webhooks/wati] Failed to log status update'
    );
  }
}

// ---------------------------------------------------------------------------
// Flow completion handler
// ---------------------------------------------------------------------------

async function handleFlowCompletion(
  body: Record<string, unknown>,
  supabase: NonNullable<ReturnType<typeof createSupabaseAdmin>>
) {
  try {
    await supabase.from('lead_activities').insert({
      activity_type: 'whatsapp_flow_completed',
      channel: 'whatsapp',
      metadata: {
        flow_name: body.flowName ?? body.flow_name,
        phone: body.waId ?? body.whatsappNumber,
        responses: body.responses ?? body.flowResponses,
        timestamp: body.timestamp ?? new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });
  } catch {
    console.warn(
      '[api/marketing/webhooks/wati] Failed to log flow completion'
    );
  }
}

// ---------------------------------------------------------------------------
// Template response handler
// ---------------------------------------------------------------------------

async function handleTemplateResponse(
  body: Record<string, unknown>,
  supabase: NonNullable<ReturnType<typeof createSupabaseAdmin>>
) {
  try {
    await supabase.from('lead_activities').insert({
      activity_type: 'whatsapp_template_response',
      channel: 'whatsapp',
      metadata: {
        template_name: body.templateName ?? body.template_name,
        phone: body.waId ?? body.whatsappNumber,
        button_text: body.buttonText ?? body.button_text,
        timestamp: body.timestamp ?? new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });
  } catch {
    console.warn(
      '[api/marketing/webhooks/wati] Failed to log template response'
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Classify inbound WhatsApp message intent.
 */
function classifyMessage(
  text: string
): 'inquiry' | 'reservation' | 'pricing' | 'viewing' | 'general' | 'spam' {
  const lower = text.toLowerCase();

  if (/reserv|book|deposit|down\s*payment|php\s*200|9,?999/i.test(lower)) {
    return 'reservation';
  }
  if (/price|cost|how much|\bphp\b|₱|budget|afford/i.test(lower)) {
    return 'pricing';
  }
  if (/visit|view|tour|see|come|fly|travel|panglao|bohol/i.test(lower)) {
    return 'viewing';
  }
  if (/interest|invest|roi|income|rental|villa|property/i.test(lower)) {
    return 'inquiry';
  }
  if (text.length < 3 || /^(hi|hello|hey|ok|yes|no)$/i.test(lower.trim())) {
    return 'general';
  }

  return 'general';
}

/**
 * Normalize phone number to E.164-like format.
 */
function normalizePhoneNumber(phone: string): string {
  // Remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-()]/g, '');

  // Ensure starts with +
  if (!cleaned.startsWith('+')) {
    // If starts with country code without +, add it
    if (cleaned.startsWith('63') && cleaned.length >= 12) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length >= 10) {
      // PH local format: 0917... -> +63917...
      cleaned = '+63' + cleaned.slice(1);
    } else {
      cleaned = '+' + cleaned;
    }
  }

  return cleaned;
}
