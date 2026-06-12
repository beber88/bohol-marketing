// src/app/api/marketing/knowledge/route.ts
// Knowledge base CRUD - list and add knowledge entries

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { PROJECT_KNOWLEDGE_ENTRIES } from '@/lib/knowledge/project-library';

function fallbackEntries(category?: string | null, language?: string | null, contentType?: string | null) {
  return PROJECT_KNOWLEDGE_ENTRIES
    .filter((entry) => !category || entry.category === category)
    .filter((entry) => !language || entry.language === language)
    .filter((entry) => !contentType || entry.content_type === contentType)
    .map((entry, index) => ({
      id: `local-${index + 1}`,
      title: entry.title,
      content_type: entry.content_type,
      language: entry.language,
      summary: entry.summary,
      category: entry.category,
      metadata: { source: entry.source, category: entry.category, summary: entry.summary, fallback: true },
      created_at: null,
      updated_at: null,
    }));
}

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      const entries = fallbackEntries(null, null, null);
      return Response.json({ entries, total: entries.length, source: 'local_fallback' });
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const language = searchParams.get('language');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    let query = supabase
      .from('knowledge_base')
      .select('id, title, content_type, language, metadata, created_at, updated_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (contentType) query = query.eq('content_type', contentType);
    if (language) query = query.eq('language', language);

    const { data, error, count } = await query;

    if (error) {
      console.error('[api/marketing/knowledge] GET error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const entries = (data ?? [])
      .map((entry) => {
        const metadata = (entry.metadata ?? {}) as Record<string, unknown>;
        return { ...entry, category: metadata.category ?? null, summary: metadata.summary ?? null };
      })
      .filter((entry) => !category || entry.category === category);

    if (entries.length === 0) {
      const fallback = fallbackEntries(category, language, contentType);
      return Response.json({ entries: fallback, total: fallback.length, source: 'local_fallback' });
    }

    return Response.json({ entries, total: category ? entries.length : count, source: 'supabase' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/knowledge] GET exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

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

    // Validate required fields
    if (!body.content || typeof body.content !== 'string') {
      return Response.json(
        { error: 'Missing required field: content (text content to store)' },
        { status: 400 }
      );
    }
    if (!body.content_type || typeof body.content_type !== 'string') {
      return Response.json(
        {
          error:
            'Missing required field: content_type (e.g., brand_guideline, property_spec, faq, market_data, case_study)',
        },
        { status: 400 }
      );
    }

    const entry = {
      title: body.title ?? null,
      content: body.content,
      content_type: body.content_type,
      language: body.language ?? 'en',
      metadata: {
        ...(body.metadata ?? {}),
        category: body.category ?? null,
        source: body.source ?? 'manual',
        summary: body.summary ?? null,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(entry)
      .select('id, title, content_type, language, metadata, created_at')
      .single();

    if (error) {
      console.error('[api/marketing/knowledge] POST error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(
      {
        entry: data,
        note: 'Entry created. Embedding will be generated asynchronously by the embedding pipeline.',
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/knowledge] POST exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
