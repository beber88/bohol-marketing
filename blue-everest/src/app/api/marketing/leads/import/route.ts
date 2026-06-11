// POST /api/marketing/leads/import
// Bulk import leads from JSON array — for importing WhatsApp contacts, FB messages, CSV data

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { quickScore } from '@/lib/agents/crm-lead-scorer';
import type { LeadData } from '@/lib/agents/crm-lead-scorer';
import { getOrCreatePanglaoProjectId } from '@/lib/marketing/project';

interface ImportLead {
  full_name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  nationality?: string;
  source?: string;
  villa_interest?: string;
  purpose?: string;
  notes?: string;
  market?: string;
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { leads: importLeads } = body as { leads: ImportLead[] };
    const projectId = await getOrCreatePanglaoProjectId(supabase);
    if (!projectId) {
      return Response.json(
        { error: 'Project not configured. Could not resolve Panglao Prime Villas project_id.' },
        { status: 503 }
      );
    }

    if (!Array.isArray(importLeads) || importLeads.length === 0) {
      return Response.json({ error: 'Provide a "leads" array with at least one entry' }, { status: 400 });
    }

    if (importLeads.length > 200) {
      return Response.json({ error: 'Maximum 200 leads per import' }, { status: 400 });
    }

    const results: Array<{ success: boolean; id?: string; name?: string; error?: string }> = [];

    for (const importLead of importLeads) {
      try {
        const hasRealName = importLead.full_name && importLead.full_name.length >= 2 && !importLead.full_name.startsWith('Lead from');
        const hasRealEmail = importLead.email && importLead.email.includes('@') && importLead.email.length > 5;
        const hasRealPhone = importLead.phone && importLead.phone.replace(/[\s\-\(\)]/g, '').length >= 8 && !importLead.phone.includes('****');

        if (!hasRealName) {
          results.push({ success: false, name: importLead.full_name, error: 'Real name required (not placeholder)' });
          continue;
        }
        if (!hasRealEmail && !hasRealPhone) {
          results.push({ success: false, name: importLead.full_name, error: 'Need real email or phone (8+ digits, not masked)' });
          continue;
        }

        const leadData: LeadData = {
          fullName: importLead.full_name ?? undefined,
          email: importLead.email ?? undefined,
          phone: importLead.phone ?? undefined,
          whatsapp: importLead.whatsapp ?? undefined,
          nationality: importLead.nationality ?? undefined,
          source: importLead.source ?? undefined,
          purpose: importLead.purpose ?? undefined,
          villaInterest: importLead.villa_interest ?? undefined,
          activities: [],
        };

        const scoring = quickScore(leadData);

        const lead = {
          project_id: projectId,
          full_name: importLead.full_name ?? null,
          email: importLead.email ?? null,
          phone: importLead.phone ?? null,
          whatsapp: importLead.whatsapp ?? null,
          nationality: importLead.nationality ?? null,
          source: importLead.source ?? 'manual_import',
          villa_interest: importLead.villa_interest ?? null,
          purpose: importLead.purpose ?? null,
          lead_score: scoring.score,
          lead_status: scoring.status,
          funnel_stage: scoring.status === 'hot' ? 'qualified' : 'new',
          notes: importLead.notes ?? null,
          raw_data: {
            market: importLead.market ?? 'INTL',
            urgency: scoring.urgency,
            next_action: scoring.nextAction,
            recommended_sequence: scoring.recommendedSequence,
            scoring_signals: scoring.signals,
            top_signals: scoring.topSignals,
            imported_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase.from('leads').insert(lead).select('id, full_name').single();

        if (error) {
          results.push({ success: false, name: importLead.full_name, error: error.message });
        } else {
          results.push({ success: true, id: data.id, name: data.full_name });
        }
      } catch (e) {
        results.push({ success: false, name: importLead.full_name, error: String(e) });
      }
    }

    const imported = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return Response.json({ imported, failed, total: importLeads.length, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
