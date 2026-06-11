// src/app/api/marketing/chat/takeover/route.ts
// CEO takeover controls: take control of a conversation, send messages as human, return to agent

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

function getConversationMetadata(convo: { metadata?: unknown } | null | undefined): Record<string, unknown> {
  return (convo?.metadata && typeof convo.metadata === 'object' ? convo.metadata : {}) as Record<string, unknown>;
}

/**
 * GET: Fetch a conversation's current state including agent_mode
 * Query params: sessionId
 */
export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return Response.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('id, session_id, messages, metadata, language, last_message_at')
      .eq('session_id', sessionId)
      .single();

    if (error || !data) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const metadata = getConversationMetadata(data);
    return Response.json({
      conversation: {
        ...data,
        agent_mode: metadata.agent_mode ?? 'auto',
        taken_over_by: metadata.taken_over_by ?? null,
        taken_over_at: metadata.taken_over_at ?? null,
        lead_score: metadata.lead_score ?? null,
        lead_status: metadata.lead_status ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * POST: Take over or return control, or send a message as the human
 * Body: { sessionId, action: 'takeover' | 'return_to_agent' | 'send_message', message?: string, operator?: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { sessionId, action, message, operator } = body as {
      sessionId: string;
      action: 'takeover' | 'return_to_agent' | 'send_message';
      message?: string;
      operator?: string;
    };

    if (!sessionId || !action) {
      return Response.json({ error: 'sessionId and action are required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Get current conversation
    const { data: convo, error: fetchError } = await supabase
      .from('conversations')
      .select('id, lead_id, messages, metadata')
      .eq('session_id', sessionId)
      .single();

    if (fetchError || !convo) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const metadata = getConversationMetadata(convo);

    if (action === 'takeover') {
      // CEO takes control
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          metadata: {
            ...metadata,
            agent_mode: 'human_takeover',
            taken_over_by: operator || 'CEO',
            taken_over_at: now,
          },
          last_message_at: now,
        })
        .eq('id', convo.id);

      if (updateError) {
        return Response.json({ error: updateError.message }, { status: 500 });
      }

      // Log the takeover event
      if (convo.lead_id) {
        await supabase.from('lead_activities').insert({
          lead_id: convo.lead_id,
          activity_type: 'human_takeover',
          description: `${operator || 'CEO'} took control of conversation (was score ${metadata.lead_score ?? 'unknown'}, ${metadata.lead_status ?? 'unknown'})`,
          channel: 'chatbot',
          metadata: { session_id: sessionId, operator: operator || 'CEO' },
          performed_by: operator || 'CEO',
          created_at: now,
        });
      }

      return Response.json({
        success: true,
        action: 'takeover',
        agentMode: 'human_takeover',
        operator: operator || 'CEO',
      });
    }

    if (action === 'return_to_agent') {
      // Return control to AI agent
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          metadata: {
            ...metadata,
            agent_mode: 'auto',
            returned_to_agent_at: now,
          },
          last_message_at: now,
        })
        .eq('id', convo.id);

      if (updateError) {
        return Response.json({ error: updateError.message }, { status: 500 });
      }

      // Log the return event
      if (convo.lead_id) {
        await supabase.from('lead_activities').insert({
          lead_id: convo.lead_id,
          activity_type: 'returned_to_agent',
          description: `${operator || 'CEO'} returned control to AI agent David`,
          channel: 'chatbot',
          metadata: { session_id: sessionId, operator: operator || 'CEO' },
          performed_by: operator || 'CEO',
          created_at: now,
        });
      }

      return Response.json({
        success: true,
        action: 'return_to_agent',
        agentMode: 'auto',
      });
    }

    if (action === 'send_message') {
      if (!message || typeof message !== 'string') {
        return Response.json({ error: 'message is required for send_message action' }, { status: 400 });
      }

      // Ensure we're in takeover mode
      const sendMetadata = getConversationMetadata(convo);
      const isHumanTakeover = sendMetadata.agent_mode === 'human_takeover';
      if (!isHumanTakeover) {
        // Auto-takeover if sending a message
        await supabase
          .from('conversations')
          .update({
            metadata: {
              ...sendMetadata,
              agent_mode: 'human_takeover',
              taken_over_by: operator || 'CEO',
              taken_over_at: now,
            },
          })
          .eq('id', convo.id);
      }

      // Append the human message to the conversation
      const currentMessages = Array.isArray(convo.messages) ? convo.messages : [];
      const updatedMessages = [
        ...currentMessages,
        {
          role: 'assistant',
          content: message.trim(),
          timestamp: now,
          sentBy: operator || 'CEO',
          isHuman: true,
        },
      ];

      const { error: msgError } = await supabase
        .from('conversations')
        .update({
          messages: updatedMessages,
          last_message_at: now,
          metadata: {
            ...sendMetadata,
            agent_mode: 'human_takeover',
            taken_over_by: operator || 'CEO',
            last_human_message_at: now,
          },
        })
        .eq('id', convo.id);

      if (msgError) {
        return Response.json({ error: msgError.message }, { status: 500 });
      }

      // Also update the lead's raw_data with the latest conversation
      if (convo.lead_id) {
        await supabase
          .from('leads')
          .update({
            raw_data: {
              chatbot_session_id: sessionId,
              conversations: updatedMessages,
              last_message_at: now,
              signals: [],
              human_operator: operator || 'CEO',
            },
            last_contact_at: now,
            updated_at: now,
          })
          .eq('id', convo.lead_id);
      }

      return Response.json({
        success: true,
        action: 'send_message',
        messageCount: updatedMessages.length,
        agentMode: 'human_takeover',
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
