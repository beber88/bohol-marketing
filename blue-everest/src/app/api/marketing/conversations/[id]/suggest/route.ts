import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { getConversationThread } from '@/lib/marketing/conversations-os';
import { buildSalesOsResponse } from '@/lib/sales-os/blue-everest-agent';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const thread = await getConversationThread(supabase, id);
    if (!thread) return Response.json({ error: 'Conversation not found' }, { status: 404 });

    const latestUser = [...thread.messages].reverse().find((message) => message.role === 'user');
    const prompt = String(body.message ?? latestUser?.content ?? '').trim();
    const response = buildSalesOsResponse({
      message: prompt || (thread.language === 'he' ? 'הכן תשובת המשך ללקוח' : 'Prepare a follow-up reply for this lead'),
      history: thread.messages,
      channel: thread.channel === 'facebook_dm'
        ? 'facebook_dm'
        : thread.channel === 'whatsapp'
          ? 'whatsapp'
          : thread.channel === 'website_chat'
            ? 'website_chat'
            : 'crm',
      preferredLanguage: thread.language,
      leadName: thread.clientName,
    });

    return Response.json({
      suggestion: {
        message: response.reply,
        language: response.language,
        intent: response.intent,
        nextBestAction: response.nextBestAction,
        crmSummary: response.crmSummary,
        leadSignals: response.leadSignals,
        shouldEscalate: response.shouldEscalate,
        confidence: response.confidence,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/conversations/[id]/suggest] POST error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
