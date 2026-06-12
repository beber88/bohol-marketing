import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { fetchPageConversations } from '@/lib/connectors/meta-graph';
import { getOrCreatePanglaoProjectId } from '@/lib/marketing/project';
import {
  analyzeMessengerConversation,
  type NormalizedMessage,
} from '@/lib/marketing/messenger-analysis';
import type { SupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const OWN_PAGE_ID = process.env.META_PAGE_ID ?? '1091251924067685';

type LeadRow = {
  id: string;
  raw_data?: Record<string, unknown> | null;
  lead_score?: number | null;
  first_contact_at?: string | null;
};

function pickVisitor(conversation: {
  participants: Array<{ id: string; name?: string; email?: string }>;
}) {
  return (
    conversation.participants.find((participant) => participant.id !== OWN_PAGE_ID) ??
    conversation.participants[0] ??
    null
  );
}

function normalizeMessages(
  conversation: Awaited<ReturnType<typeof fetchPageConversations>>['conversations'][number],
  visitorId: string
): NormalizedMessage[] {
  return conversation.messages
    .filter((message) => message.message?.trim())
    .map((message) => ({
      id: message.id,
      role: (message.from?.id === visitorId ? 'user' : 'assistant') as 'user' | 'assistant',
      content: message.message.trim(),
      timestamp: message.createdTime,
    }))
    .sort((a, b) => {
      const left = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const right = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return left - right;
    });
}

async function findLeadByPsid(supabase: SupabaseClient, psid: string): Promise<LeadRow | null> {
  const { data } = await supabase
    .from('leads')
    .select('id, raw_data, lead_score, first_contact_at')
    .contains('raw_data', { meta_psid: psid })
    .order('updated_at', { ascending: false })
    .limit(1);

  return ((data as LeadRow[] | null)?.[0] as LeadRow | undefined) ?? null;
}

async function activityExists(supabase: SupabaseClient, messageId: string) {
  const { data } = await supabase
    .from('lead_activities')
    .select('id')
    .contains('metadata', { message_id: messageId })
    .limit(1);

  return Boolean(data?.length);
}

async function insertMissingMessageActivities(
  supabase: SupabaseClient,
  leadId: string,
  messages: NormalizedMessage[],
  conversationId: string,
  visitorId: string
) {
  let inserted = 0;

  for (const message of messages) {
    if (!message.id || (await activityExists(supabase, message.id))) continue;

    const inbound = message.role === 'user';
    const { error } = await supabase.from('lead_activities').insert({
      lead_id: leadId,
      activity_type: inbound ? 'meta_dm_received' : 'meta_dm_sent',
      description: message.content.slice(0, 1000),
      channel: 'meta_messenger',
      metadata: {
        imported_from_messenger_sync: true,
        conversation_id: conversationId,
        message_id: message.id,
        sender_id: inbound ? visitorId : OWN_PAGE_ID,
        text: message.content.slice(0, 2000),
      },
      performed_by: inbound ? null : 'facebook_page',
      created_at: message.timestamp ?? new Date().toISOString(),
    });

    if (!error) inserted += 1;
  }

  return inserted;
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdmin();
  if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const limit = Math.min(Number(body.limit ?? 50), 100);
  const messageLimit = Math.min(Number(body.messageLimit ?? 50), 100);
  const after = typeof body.after === 'string' ? body.after : null;

  const projectId = await getOrCreatePanglaoProjectId(supabase);
  if (!projectId) {
    return Response.json({ error: 'Project not configured' }, { status: 503 });
  }

  const result = await fetchPageConversations({ limit, messageLimit, after });
  if (!result.tokenConfigured) {
    return Response.json(
      {
        ok: false,
        error: 'META_PAGE_ACCESS_TOKEN is not configured',
        imported: 0,
        updated: 0,
      },
      { status: 503 }
    );
  }

  let imported = 0;
  let updated = 0;
  let activitiesInserted = 0;
  const analyses: Array<Record<string, unknown>> = [];

  for (const conversation of result.conversations) {
    const visitor = pickVisitor(conversation);
    if (!visitor?.id) continue;

    const messages = normalizeMessages(conversation, visitor.id);
    if (messages.length === 0) continue;

    const existingLead = await findLeadByPsid(supabase, visitor.id);
    const analysis = analyzeMessengerConversation({
      messages,
      participantName: visitor.name,
      hasContact: Boolean(visitor.email),
    });

    const firstContactAt = messages[0]?.timestamp ?? conversation.updatedTime ?? new Date().toISOString();
    const lastContactAt =
      messages[messages.length - 1]?.timestamp ?? conversation.updatedTime ?? new Date().toISOString();

    const rawData = {
      ...(existingLead?.raw_data ?? {}),
      meta_psid: visitor.id,
      meta_conversation_id: conversation.id,
      messenger_synced_at: new Date().toISOString(),
      messenger_message_count: messages.length,
      conversations: messages,
      signals: analysis.signals,
      messenger_analysis: analysis,
      needs_contact_info: analysis.missingData.length > 0,
      language_policy: analysis.language === 'he'
        ? 'Hebrew only for this lead. Israeli-facing recommendations and replies must not use PHP or USD.'
        : 'English only for this lead. Use PHP and BDO financing where relevant.',
    };

    if (existingLead) {
      const nextScore = Math.max(existingLead.lead_score ?? 0, analysis.score);
      const { error } = await supabase
        .from('leads')
        .update({
          full_name: visitor.name ?? 'Facebook User',
          email: visitor.email ?? null,
          source: 'meta_messenger',
          preferred_language: analysis.language,
          lead_score: nextScore,
          lead_status: analysis.status,
          funnel_stage: analysis.funnelStage,
          first_contact_at: existingLead.first_contact_at ?? firstContactAt,
          last_contact_at: lastContactAt,
          next_followup_at: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
          raw_data: rawData,
          notes: `${analysis.summary}\n\n${analysis.nextBestAction}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLead.id);

      if (!error) {
        updated += 1;
        activitiesInserted += await insertMissingMessageActivities(
          supabase,
          existingLead.id,
          messages,
          conversation.id,
          visitor.id
        );
      }
    } else {
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          project_id: projectId,
          source: 'meta_messenger',
          full_name: visitor.name ?? 'Facebook User',
          email: visitor.email ?? null,
          preferred_language: analysis.language,
          lead_score: analysis.score,
          lead_status: analysis.status,
          funnel_stage: analysis.funnelStage,
          first_contact_at: firstContactAt,
          last_contact_at: lastContactAt,
          next_followup_at: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
          raw_data: rawData,
          notes: `${analysis.summary}\n\n${analysis.nextBestAction}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (!error && newLead?.id) {
        imported += 1;
        activitiesInserted += await insertMissingMessageActivities(
          supabase,
          newLead.id,
          messages,
          conversation.id,
          visitor.id
        );
      }
    }

    analyses.push({
      conversationId: conversation.id,
      participant: visitor.name ?? 'Facebook User',
      language: analysis.language,
      score: analysis.score,
      status: analysis.status,
      urgency: analysis.urgency,
      signals: analysis.signals,
      nextBestAction: analysis.nextBestAction,
    });
  }

  return Response.json({
    ok: true,
    imported,
    updated,
    activitiesInserted,
    conversationsRead: result.conversations.length,
    next: result.next,
    analyses,
  });
}

export async function GET() {
  return Response.json({
    ok: true,
    purpose: 'POST to sync existing Facebook Messenger conversations into the CRM.',
    readsExistingMessengerThreads: true,
    writesLiveMessages: false,
  });
}
