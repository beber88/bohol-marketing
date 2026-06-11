// src/app/api/marketing/leads/webhook/route.ts
// Webhook endpoint for Meta Lead Ads - receives lead data from Facebook

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { quickScore } from '@/lib/agents/crm-lead-scorer';
import type { LeadData } from '@/lib/agents/crm-lead-scorer';
import { getOrCreatePanglaoProjectId } from '@/lib/marketing/project';

interface MetaFieldData {
  name?: string;
  values?: string[];
  value?: string;
}

interface MetaLeadDetails {
  field_data?: MetaFieldData[];
  created_time?: string;
  ad_id?: string;
  form_id?: string;
}

async function fetchMetaLeadDetails(leadId: string): Promise<MetaLeadDetails | null> {
  const token =
    process.env.META_ACCESS_TOKEN ||
    process.env.META_PAGE_ACCESS_TOKEN ||
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) return null;

  const url = new URL(`https://graph.facebook.com/v20.0/${leadId}`);
  url.searchParams.set('fields', 'field_data,created_time,ad_id,form_id');
  url.searchParams.set('access_token', token);

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    console.error('[api/marketing/leads/webhook] Failed to fetch Meta lead details:', response.status);
    return null;
  }

  return (await response.json()) as MetaLeadDetails;
}

function normalizeMetaCreatedTime(createdTime: unknown): string {
  if (typeof createdTime === 'number') {
    return new Date(createdTime * 1000).toISOString();
  }

  if (typeof createdTime === 'string' && createdTime.trim()) {
    const trimmed = createdTime.trim();
    if (/^\d+$/.test(trimmed)) return new Date(parseInt(trimmed, 10) * 1000).toISOString();

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  return new Date().toISOString();
}

/**
 * GET: Meta webhook verification challenge.
 * Facebook sends a GET request with hub.mode, hub.verify_token, and hub.challenge
 * to verify ownership of the webhook URL.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

    if (!verifyToken) {
      console.error(
        '[api/marketing/leads/webhook] META_WEBHOOK_VERIFY_TOKEN not configured'
      );
      return Response.json(
        { error: 'Webhook verify token not configured' },
        { status: 503 }
      );
    }

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[api/marketing/leads/webhook] Webhook verified successfully');
      // Meta expects the challenge value as plain text response
      return new Response(challenge ?? '', { status: 200 });
    }

    console.warn('[api/marketing/leads/webhook] Verification failed', {
      mode,
      tokenMatch: token === verifyToken,
    });
    return Response.json({ error: 'Verification failed' }, { status: 403 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/leads/webhook] GET exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * POST: Receive lead data from Meta Lead Ads webhook.
 * Facebook sends lead form submissions as webhook events.
 */
export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const projectId = await getOrCreatePanglaoProjectId(supabase);
    if (!projectId) {
      console.error('[api/marketing/leads/webhook] Project not configured');
      return Response.json({ received: true, error: 'Project not configured' });
    }

    // Meta webhook payload structure: { object, entry[] }
    if (body.object !== 'page' && body.object !== 'lead') {
      console.warn(
        '[api/marketing/leads/webhook] Unexpected webhook object:',
        body.object
      );
      return Response.json({ received: true });
    }

    const entries = Array.isArray(body.entry) ? body.entry : [];
    const processedLeads: string[] = [];

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];

      for (const change of changes) {
        if (change.field !== 'leadgen') continue;

        const leadgenData = change.value;
        if (!leadgenData) continue;

        // Extract lead data from Meta's format
        const leadId = leadgenData.leadgen_id ?? leadgenData.lead_id;
        const initialFieldData = Array.isArray(leadgenData.field_data) ? leadgenData.field_data : [];
        const fetchedLead = leadId && initialFieldData.length === 0
          ? await fetchMetaLeadDetails(String(leadId))
          : null;
        const effectiveLeadData = fetchedLead ? { ...leadgenData, ...fetchedLead } : leadgenData;

        const formId = effectiveLeadData.form_id;
        const pageId = leadgenData.page_id;
        const adId = effectiveLeadData.ad_id;
        const adGroupId = leadgenData.adgroup_id;
        const createdTime = effectiveLeadData.created_time ?? leadgenData.created_time;
        const createdAt = normalizeMetaCreatedTime(createdTime);

        // Field data from Meta comes as { name, values[] }
        const fieldData = Array.isArray(effectiveLeadData.field_data)
          ? effectiveLeadData.field_data
          : [];

        if (leadId) {
          const { data: duplicateLead } = await supabase
            .from('leads')
            .select('id')
            .eq('source', 'meta_lead_ad')
            .contains('raw_data', { meta_lead_id: String(leadId) })
            .maybeSingle();

          if (duplicateLead?.id) {
            processedLeads.push(duplicateLead.id);
            continue;
          }
        }

        const fields: Record<string, string> = {};
        for (const field of fieldData) {
          const name = (field.name ?? '').toLowerCase().replace(/\s+/g, '_');
          const value = Array.isArray(field.values)
            ? field.values[0]
            : field.value ?? '';
          fields[name] = value;
        }

        // Map Meta fields to our lead structure
        const fullName =
          fields.full_name ??
          [fields.first_name, fields.last_name].filter(Boolean).join(' ') ??
          null;
        const email = fields.email ?? null;
        const phone = fields.phone_number ?? fields.phone ?? null;

        // Score the lead
        const leadData: LeadData = {
          fullName: fullName ?? undefined,
          email: email ?? undefined,
          phone: phone ?? undefined,
          nationality: fields.country ?? fields.nationality ?? undefined,
          source: 'meta_lead_ad',
          purpose: fields.purpose ?? fields.intent ?? undefined,
          budgetConfirmed: fields.budget ?? undefined,
          villaInterest: fields.villa_interest ?? fields.villa ?? undefined,
          activities: [
            {
              type: 'meta_lead_form_submitted',
              channel: 'meta',
              timestamp: createdAt,
              metadata: { formId, adId, adGroupId },
            },
          ],
        };

        const scoring = quickScore(leadData);

        // Insert into leads table
        const lead = {
          project_id: projectId,
          full_name: fullName,
          email,
          phone,
          whatsapp: phone, // Meta leads often use same number for WhatsApp
          nationality: fields.country ?? fields.nationality ?? null,
          source: 'meta_lead_ad',
          campaign_id: null, // Will be linked later if campaign tracking is set up
          purpose: fields.purpose ?? null,
          budget_confirmed: fields.budget ?? null,
          villa_interest: fields.villa_interest ?? fields.villa ?? null,
          lead_score: scoring.score,
          lead_status: scoring.status,
          funnel_stage: scoring.status === 'hot' ? 'qualified' : 'new',
          raw_data: {
            market: determineMarket(fields),
            meta_lead_id: leadId ? String(leadId) : null,
            meta_form_id: formId,
            meta_page_id: pageId,
            meta_ad_id: adId,
            meta_adgroup_id: adGroupId,
            fields,
            urgency: scoring.urgency,
            next_action: scoring.nextAction,
            recommended_sequence: scoring.recommendedSequence,
            scoring_signals: scoring.signals,
            top_signals: scoring.topSignals,
            scoring_notes: scoring.notes,
          },
          created_at: createdAt,
          updated_at: new Date().toISOString(),
        };

        const { data: insertedLead, error: insertError } = await supabase
          .from('leads')
          .insert(lead)
          .select('id')
          .single();

        if (insertError) {
          console.error(
            '[api/marketing/leads/webhook] Insert error:',
            insertError.message
          );
          continue;
        }

        // Log the lead activity
        if (insertedLead) {
          processedLeads.push(insertedLead.id);
          try {
            await supabase.from('lead_activities').insert({
              lead_id: insertedLead.id,
              activity_type: 'meta_lead_form_submitted',
              channel: 'meta',
              metadata: {
                meta_lead_id: leadId,
                meta_form_id: formId,
                meta_ad_id: adId,
                scoring,
              },
              created_at: new Date().toISOString(),
            });
          } catch {
            console.warn(
              '[api/marketing/leads/webhook] Failed to log lead activity'
            );
          }
        }
      }
    }

    console.log(
      `[api/marketing/leads/webhook] Processed ${processedLeads.length} leads`
    );
    return Response.json({
      received: true,
      processed: processedLeads.length,
      leadIds: processedLeads,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/leads/webhook] POST exception:', message);
    // Always return 200 to Meta to avoid webhook deactivation
    return Response.json({ received: true, error: message });
  }
}

/**
 * Determine the market based on lead field data.
 */
function determineMarket(
  fields: Record<string, string>
): 'IL' | 'PH' | 'INTL' {
  const country = (fields.country ?? fields.nationality ?? '').toLowerCase();
  if (country.includes('israel') || country.includes('il')) return 'IL';
  if (country.includes('philippines') || country.includes('ph')) return 'PH';
  return 'INTL';
}
