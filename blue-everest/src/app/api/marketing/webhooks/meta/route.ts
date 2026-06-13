// src/app/api/marketing/webhooks/meta/route.ts
// Meta webhook handler - receives all Facebook page events.
// Every interaction (message, comment, reaction) auto-creates a lead and
// triggers a contextual AI response via the sales chatbot agent.

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { quickScore } from '@/lib/agents/crm-lead-scorer';
import type { LeadData } from '@/lib/agents/crm-lead-scorer';
import { getOrCreatePanglaoProjectId } from '@/lib/marketing/project';
import {
  getUserProfile,
  sendMessengerMessage,
  replyToComment,
  sendPrivateReply,
} from '@/lib/connectors/meta-graph';
import {
  buildSalesOsResponse,
  type SalesOsChannel,
  type SalesOsMessage,
} from '@/lib/sales-os/blue-everest-agent';
import { getServerEnv } from '@/lib/server-env';
import type { SupabaseClient } from '@supabase/supabase-js';

// Our own page ID - do not reply to our own messages
const OWN_PAGE_ID = getServerEnv('META_PAGE_ID') || '1091251924067685';

type MetaChatResponse = {
  message: string;
  language: 'en' | 'he';
  sources: string[];
  leadSignals: string[];
  suggestHandoff: boolean;
  handoffReason?: string;
};

// -------------------------------------------------------------------------
// GET: Meta webhook verification
// -------------------------------------------------------------------------

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = getServerEnv('META_WEBHOOK_VERIFY_TOKEN');

    if (!verifyToken) {
      console.error(
        '[webhooks/meta] META_WEBHOOK_VERIFY_TOKEN not configured'
      );
      return Response.json(
        { error: 'Webhook verify token not configured' },
        { status: 503 }
      );
    }

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[webhooks/meta] Webhook verified successfully');
      return new Response(challenge ?? '', { status: 200 });
    }

    return Response.json({ error: 'Verification failed' }, { status: 403 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[webhooks/meta] GET exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

// -------------------------------------------------------------------------
// POST: Process all Meta webhook events
// -------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json({ received: true, error: 'No database' });
    }

    if (!body.object) {
      return Response.json({ received: true });
    }

    const projectId = await getOrCreatePanglaoProjectId(supabase);
    const entries = Array.isArray(body.entry) ? body.entry : [];
    const processedEvents: string[] = [];

    for (const entry of entries) {
      const pageId = entry.id as string;

      // --- Messaging events (Messenger DMs) ---
      if (Array.isArray(entry.messaging)) {
        for (const messagingEvent of entry.messaging) {
          await processMessagingEvent(
            messagingEvent,
            pageId,
            supabase,
            projectId
          );
          processedEvents.push('messaging');
        }
      }

      // --- Change events (comments, reactions, feed) ---
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          await processChangeEvent(
            change,
            pageId,
            entry.time,
            supabase,
            projectId
          );
          processedEvents.push(change.field ?? 'unknown');
        }
      }
    }

    console.log(
      `[webhooks/meta] Processed ${processedEvents.length} events: ${[...new Set(processedEvents)].join(', ')}`
    );

    // Always return 200 to prevent Meta from disabling the webhook
    return Response.json({
      received: true,
      processed: processedEvents.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[webhooks/meta] POST exception:', message);
    return Response.json({ received: true, error: message });
  }
}

// -------------------------------------------------------------------------
// Messenger message handler
// -------------------------------------------------------------------------

async function processMessagingEvent(
  event: Record<string, unknown>,
  pageId: string,
  supabase: SupabaseClient,
  projectId: string | null
) {
  const sender = event.sender as Record<string, unknown> | undefined;
  const senderId = sender?.id as string | undefined;
  const message = event.message as Record<string, unknown> | undefined;
  const postback = event.postback as Record<string, unknown> | undefined;

  if (!senderId) return;

  // Ignore our own page's messages (echo)
  if (senderId === pageId || senderId === OWN_PAGE_ID) return;

  // Ignore delivery/read receipts
  if (event.delivery || event.read) return;

  const messageText =
    (message?.text as string) ??
    (postback?.title as string) ??
    (postback?.payload as string) ??
    null;

  try {
    // 1. Find or create lead
    const lead = await findOrCreateLead(supabase, {
      metaId: senderId,
      idField: 'meta_psid',
      source: 'meta_messenger',
      projectId,
      pageId,
    });

    // 2. Log the inbound activity
    await supabase.from('lead_activities').insert({
      lead_id: lead?.id ?? null,
      activity_type: message
        ? 'meta_dm_received'
        : 'meta_dm_postback',
      channel: 'meta_messenger',
      metadata: {
        page_id: pageId,
        sender_id: senderId,
        message_id: message?.mid ?? null,
        text: messageText?.slice(0, 2000) ?? null,
        attachments: message?.attachments ?? null,
        postback_payload: postback?.payload ?? null,
      },
      created_at: new Date().toISOString(),
    });

    // 3. Generate AI response if there's text
    if (messageText && lead) {
      const conversationHistory = await loadConversationHistory(
        supabase,
        lead.id
      );

      const chatResponse = await generateAIResponse(
        messageText,
        conversationHistory
      );

      if (chatResponse) {
        // 4. Send response via Messenger
        const sent = await sendMessengerMessage(senderId, chatResponse.message);

        // 5. Log the outbound activity
        await supabase.from('lead_activities').insert({
          lead_id: lead.id,
          activity_type: 'meta_dm_sent',
          channel: 'meta_messenger',
          metadata: {
            page_id: pageId,
            recipient_id: senderId,
            text: chatResponse.message.slice(0, 2000),
            language: chatResponse.language,
            sources: chatResponse.sources,
            lead_signals: chatResponse.leadSignals,
            suggest_handoff: chatResponse.suggestHandoff,
            handoff_reason: chatResponse.handoffReason ?? null,
            sent_successfully: sent,
          },
          created_at: new Date().toISOString(),
        });

        // 6. Update lead score based on new signals
        if (chatResponse.leadSignals.length > 0) {
          await updateLeadFromSignals(
            supabase,
            lead.id,
            chatResponse.leadSignals,
            chatResponse.suggestHandoff
          );
        }
      }
    }
  } catch (err) {
    console.warn(
      '[webhooks/meta] processMessagingEvent error:',
      err instanceof Error ? err.message : err
    );
  }
}

// -------------------------------------------------------------------------
// Feed / comment handler
// -------------------------------------------------------------------------

async function processChangeEvent(
  change: Record<string, unknown>,
  pageId: string,
  time: number | undefined,
  supabase: SupabaseClient,
  projectId: string | null
) {
  const field = change.field as string;
  const value = change.value as Record<string, unknown>;

  if (!value) return;

  try {
    switch (field) {
      case 'feed': {
        const item = value.item as string; // 'comment', 'post', 'reaction', etc.
        const verb = value.verb as string; // 'add', 'edited', 'remove'
        const from = value.from as Record<string, string> | undefined;

        // Only process new comments (not our own)
        if (item === 'comment' && verb === 'add' && from?.id && from.id !== pageId && from.id !== OWN_PAGE_ID) {
          await processComment(supabase, {
            commentId: value.comment_id as string,
            postId: value.post_id as string,
            fromId: from.id,
            fromName: from.name ?? 'Facebook User',
            message: (value.message as string) ?? '',
            pageId,
            projectId,
            timestamp: time,
          });
        } else {
          // Log other feed events without lead creation
          await supabase.from('lead_activities').insert({
            activity_type: `meta_feed_${verb ?? 'update'}`,
            channel: 'meta_page',
            metadata: {
              page_id: pageId,
              post_id: value.post_id,
              item,
              message: (value.message as string)?.slice(0, 500),
              from,
              timestamp: time,
            },
            created_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'leadgen': {
        // Handled by the dedicated /api/marketing/leads/webhook route
        await supabase.from('lead_activities').insert({
          activity_type: 'meta_leadgen_event',
          channel: 'meta',
          metadata: {
            page_id: pageId,
            leadgen_id: value.leadgen_id,
            form_id: value.form_id,
            ad_id: value.ad_id,
            timestamp: time,
          },
          created_at: new Date().toISOString(),
        });
        break;
      }

      default: {
        await supabase.from('lead_activities').insert({
          activity_type: `meta_${field}_event`,
          channel: 'meta_page',
          metadata: {
            page_id: pageId,
            field,
            value: JSON.stringify(value).slice(0, 2000),
            timestamp: time,
          },
          created_at: new Date().toISOString(),
        });
        break;
      }
    }
  } catch (err) {
    console.warn(
      `[webhooks/meta] processChangeEvent(${field}) error:`,
      err instanceof Error ? err.message : err
    );
  }
}

// -------------------------------------------------------------------------
// Comment processing (creates lead + replies + private message)
// -------------------------------------------------------------------------

async function processComment(
  supabase: SupabaseClient,
  ctx: {
    commentId: string;
    postId: string;
    fromId: string;
    fromName: string;
    message: string;
    pageId: string;
    projectId: string | null;
    timestamp: number | undefined;
  }
) {
  // 1. Find or create lead
  const lead = await findOrCreateLead(supabase, {
    metaId: ctx.fromId,
    idField: 'meta_user_id',
    source: 'meta_comment',
    projectId: ctx.projectId,
    pageId: ctx.pageId,
    name: ctx.fromName,
  });

  // 2. Log the comment activity
  await supabase.from('lead_activities').insert({
    lead_id: lead?.id ?? null,
    activity_type: 'meta_comment_received',
    channel: 'meta_page',
    metadata: {
      page_id: ctx.pageId,
      post_id: ctx.postId,
      comment_id: ctx.commentId,
      from_id: ctx.fromId,
      from_name: ctx.fromName,
      text: ctx.message.slice(0, 2000),
      timestamp: ctx.timestamp,
    },
    created_at: new Date().toISOString(),
  });

  // 3. Generate AI response based on comment context
  if (ctx.message.trim() && lead) {
    const chatResponse = await generateAIResponse(ctx.message, [], 'facebook_comment');

    if (chatResponse) {
      // 4a. Reply to the comment publicly
      const commentReplied = await replyToComment(
        ctx.commentId,
        chatResponse.message
      );

      // 4b. Send a private message with more details
      const privateMessage = buildPrivateFollowup(
        ctx.fromName,
        chatResponse.language
      );
      const privateSent = await sendPrivateReply(
        ctx.commentId,
        privateMessage
      );

      // 5. Log the outbound activities
      await supabase.from('lead_activities').insert({
        lead_id: lead.id,
        activity_type: 'meta_comment_replied',
        channel: 'meta_page',
        metadata: {
          comment_id: ctx.commentId,
          post_id: ctx.postId,
          reply_text: chatResponse.message.slice(0, 2000),
          private_message_sent: privateSent,
          comment_replied: commentReplied,
          language: chatResponse.language,
          lead_signals: chatResponse.leadSignals,
          suggest_handoff: chatResponse.suggestHandoff,
        },
        created_at: new Date().toISOString(),
      });

      // 6. Update lead score
      if (chatResponse.leadSignals.length > 0) {
        await updateLeadFromSignals(
          supabase,
          lead.id,
          chatResponse.leadSignals,
          chatResponse.suggestHandoff
        );
      }
    }
  }
}

// -------------------------------------------------------------------------
// Lead management helpers
// -------------------------------------------------------------------------

interface FindOrCreateOptions {
  metaId: string;
  idField: 'meta_psid' | 'meta_user_id';
  source: string;
  projectId: string | null;
  pageId: string;
  name?: string;
}

async function findOrCreateLead(
  supabase: SupabaseClient,
  opts: FindOrCreateOptions
): Promise<{ id: string } | null> {
  // Try to find existing lead by Meta ID in raw_data
  const { data: existing } = await supabase
    .from('leads')
    .select('id')
    .contains('raw_data', { [opts.idField]: opts.metaId })
    .maybeSingle();

  if (existing?.id) return { id: existing.id as string };

  // Fetch profile from Meta if we don't have a name
  let fullName = opts.name;
  if (!fullName || fullName === 'Facebook User') {
    const profile = await getUserProfile(opts.metaId);
    if (profile) fullName = profile.name;
  }

  // Score the lead
  const leadData: LeadData = {
    fullName: fullName ?? undefined,
    source: opts.source,
    activities: [
      {
        type:
          opts.source === 'meta_messenger'
            ? 'meta_dm_received'
            : 'meta_comment_received',
        channel: opts.source,
        timestamp: new Date().toISOString(),
      },
    ],
  };
  const scoring = quickScore(leadData);

  // Insert new lead - minimal data (no email/phone yet, will be enriched)
  const { data: newLead, error } = await supabase
    .from('leads')
    .insert({
      project_id: opts.projectId,
      full_name: fullName ?? 'Facebook User',
      email: null,
      phone: null,
      source: opts.source,
      lead_score: scoring.score,
      lead_status: scoring.status,
      funnel_stage: 'new',
      raw_data: {
        [opts.idField]: opts.metaId,
        meta_page_id: opts.pageId,
        market: 'UNKNOWN',
        urgency: scoring.urgency,
        next_action: scoring.nextAction,
        recommended_sequence: scoring.recommendedSequence,
        scoring_signals: scoring.signals,
        top_signals: scoring.topSignals,
        scoring_notes: scoring.notes,
        needs_contact_info: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.warn('[webhooks/meta] Lead insert error:', error.message);
    return null;
  }

  if (newLead) {
    console.log(
      `[webhooks/meta] New lead created: ${newLead.id} (${opts.source}, ${fullName ?? 'unknown'})`
    );

    // Log the creation activity
    await supabase.from('lead_activities').insert({
      lead_id: newLead.id,
      activity_type: 'lead_created',
      channel: opts.source,
      metadata: {
        auto_captured: true,
        scoring,
        meta_id: opts.metaId,
      },
      created_at: new Date().toISOString(),
    });
  }

  return newLead ? { id: newLead.id as string } : null;
}

/**
 * Update lead score and funnel stage based on detected signals.
 */
async function updateLeadFromSignals(
  supabase: SupabaseClient,
  leadId: string,
  signals: string[],
  suggestHandoff: boolean
) {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // Escalate funnel stage if high-intent signals detected
  if (suggestHandoff) {
    updates.funnel_stage = 'qualified';
    updates.lead_status = 'hot';
  } else if (
    signals.includes('budget_mention') ||
    signals.includes('visit_intent') ||
    signals.includes('timeline_mention')
  ) {
    updates.funnel_stage = 'interested';
    updates.lead_status = 'warm';
  }

  // Re-score with the new signals
  const { data: currentLead } = await supabase
    .from('leads')
    .select('lead_score, raw_data')
    .eq('id', leadId)
    .single();

  if (currentLead) {
    const currentScore = (currentLead.lead_score as number) ?? 0;
    const rawData = (currentLead.raw_data as Record<string, unknown>) ?? {};

    // Add signal bonuses
    let bonus = 0;
    if (signals.includes('reservation_intent')) bonus += 60;
    if (signals.includes('contact_request')) bonus += 30;
    if (signals.includes('budget_mention')) bonus += 20;
    if (signals.includes('visit_intent')) bonus += 20;
    if (signals.includes('timeline_mention')) bonus += 15;
    if (signals.includes('roi_interest')) bonus += 10;
    if (signals.includes('legal_question')) bonus += 10;
    if (signals.includes('financing_question')) bonus += 10;

    if (bonus > 0) {
      const newScore = currentScore + bonus;
      updates.lead_score = newScore;

      // Update status based on new score
      if (newScore >= 121) updates.lead_status = 'very_hot';
      else if (newScore >= 71) updates.lead_status = 'hot';
      else if (newScore >= 31) updates.lead_status = 'warm';

      // Persist detected signals
      const existingSignals = (rawData.detected_signals as string[]) ?? [];
      updates.raw_data = {
        ...rawData,
        detected_signals: [...new Set([...existingSignals, ...signals])],
        last_signal_update: new Date().toISOString(),
        suggest_handoff: suggestHandoff,
      };
    }
  }

  if (Object.keys(updates).length > 1) {
    await supabase.from('leads').update(updates).eq('id', leadId);
  }
}

// -------------------------------------------------------------------------
// AI response generation
// -------------------------------------------------------------------------

/**
 * Use the sales chatbot agent to generate a contextual response.
 * Falls back gracefully if the LLM call fails.
 */
async function generateAIResponse(
  messageText: string,
  conversationHistory: SalesOsMessage[],
  channel: SalesOsChannel = 'facebook_dm'
): Promise<MetaChatResponse | null> {
  try {
    const salesOs = buildSalesOsResponse({
      message: messageText,
      history: conversationHistory,
      channel,
    });

    return {
      message: salesOs.reply,
      language: salesOs.language,
      sources: ['blue-everest-sales-os'],
      leadSignals: salesOs.leadSignals,
      suggestHandoff: salesOs.shouldEscalate,
      handoffReason: salesOs.nextBestAction,
    };
  } catch (err) {
    console.warn(
      '[webhooks/meta] Sales OS response error:',
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Load the last N messages from lead_activities to build conversation context.
 */
async function loadConversationHistory(
  supabase: SupabaseClient,
  leadId: string
): Promise<SalesOsMessage[]> {
  const { data: activities } = await supabase
    .from('lead_activities')
    .select('activity_type, metadata, created_at')
    .eq('lead_id', leadId)
    .in('activity_type', ['meta_dm_received', 'meta_dm_sent', 'meta_dm_postback'])
    .order('created_at', { ascending: true })
    .limit(20);

  if (!activities || activities.length === 0) return [];

  return activities.map((a) => {
    const meta = (a.metadata as Record<string, unknown>) ?? {};
    const isUser =
      a.activity_type === 'meta_dm_received' ||
      a.activity_type === 'meta_dm_postback';

    return {
      role: isUser ? 'user' : 'assistant',
      content: (meta.text as string) ?? '',
      timestamp: a.created_at as string,
    } as SalesOsMessage;
  });
}

// -------------------------------------------------------------------------
// Private follow-up message for comment replies
// -------------------------------------------------------------------------

function buildPrivateFollowup(name: string, language: 'en' | 'he'): string {
  const firstName = name.split(' ')[0] ?? name;

  if (language === 'he') {
    return `שלום ${firstName}! ראינו שהגבת על הפוסט שלנו.

וילה פרטית בפנגלאו, בוהול מ-1,535,000 ש"ח, עם מודל הכנסה חודשית מאומתת ותשואה של 17-25%.

3 פתרונות בעלות חוקיים לישראלים: Deed of Assignment, חכירה 25+25, תאגיד מקומי.

נשמח לשלוח חוברת מפורטת או לתאם שיחה.

WhatsApp (שיווק): +639542555553
WhatsApp (משרד): +639958565865`;
  }

  return `Hi ${firstName}! We noticed your comment on our post.

Private villa in Panglao, Bohol from PHP 32,500,000, with a verified monthly income of PHP 395,000 and 17-25% annual ROI.

BDO Bank financing available for qualified buyers.

We'd love to send you our detailed prospectus or schedule a call.

WhatsApp (Marketing): +639542555553
WhatsApp (Office): +639958565865`;
}
