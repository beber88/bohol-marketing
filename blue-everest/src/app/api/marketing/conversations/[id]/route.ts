import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { getConversationThread } from '@/lib/marketing/conversations-os';

export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const thread = await getConversationThread(supabase, id);
    if (!thread) return Response.json({ error: 'Conversation not found' }, { status: 404 });
    return Response.json({ thread });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/conversations/[id]] GET error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const thread = await getConversationThread(supabase, id);
    if (!thread?.leadId) return Response.json({ error: 'Conversation not found' }, { status: 404 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const allowed = ['lead_status', 'funnel_stage', 'assigned_to', 'next_followup_at', 'notes'];
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length > 1) {
      const { error } = await supabase.from('leads').update(updates).eq('id', thread.leadId);
      if (error) return Response.json({ error: error.message }, { status: 500 });
    }

    if (body.agentMode && thread.sessionId) {
      const metadata = {
        agent_mode: body.agentMode === 'human_takeover' ? 'human_takeover' : 'auto',
        taken_over_by: body.operator ?? 'dashboard',
        updated_from: 'conversations_os',
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from('conversations')
        .update({ metadata, last_message_at: new Date().toISOString() })
        .eq('session_id', thread.sessionId);
    }

    await supabase.from('lead_activities').insert({
      lead_id: thread.leadId,
      activity_type: 'conversation_status_updated',
      channel: thread.channel,
      description: 'Conversation updated from Blue Everest Conversations OS.',
      metadata: { updates, agent_mode: body.agentMode ?? null },
      performed_by: body.operator ?? 'dashboard',
      created_at: new Date().toISOString(),
    });

    const nextThread = await getConversationThread(supabase, id);
    return Response.json({ ok: true, thread: nextThread });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/conversations/[id]] PATCH error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
