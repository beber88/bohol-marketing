import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { listConversationThreads, providerStatus } from '@/lib/marketing/conversations-os';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 80), 1), 200);
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const query = searchParams.get('q')?.trim().toLowerCase();

    const allThreads = await listConversationThreads(supabase, limit);
    const threads = allThreads.filter((thread) => {
      if (channel && channel !== 'all' && thread.channel !== channel) return false;
      if (status && status !== 'all' && thread.status !== status) return false;
      if (query) {
        const haystack = [
          thread.clientName,
          thread.clientPhone,
          thread.clientEmail,
          thread.summary,
          thread.messages[thread.messages.length - 1]?.content,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    return Response.json({
      threads,
      total: threads.length,
      summary: {
        total: allThreads.length,
        unread: allThreads.filter((thread) => thread.unread).length,
        hot: allThreads.filter((thread) => ['hot', 'very_hot'].includes(thread.leadStatus)).length,
        readyForAgent: allThreads.filter((thread) => thread.status === 'agent_ready').length,
        byChannel: allThreads.reduce<Record<string, number>>((acc, thread) => {
          acc[thread.channel] = (acc[thread.channel] ?? 0) + 1;
          return acc;
        }, {}),
      },
      providers: providerStatus(),
      policy: {
        watiRequired: false,
        outboundDefault: 'human_approval_required',
        liveSendRequiresApprovedRequest: true,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/conversations] GET error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
