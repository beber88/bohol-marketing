// src/app/api/marketing/knowledge/route.ts
// Knowledge base CRUD - list and add knowledge entries

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const language = searchParams.get('language');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    let query = supabase
      .from('knowledge_base')
      .select('id, title, content_type, language, category, summary, created_at, updated_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (contentType) query = query.eq('content_type', contentType);
    if (language) query = query.eq('language', language);
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query;

    if (error) {
      console.error('[api/marketing/knowledge] GET error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ entries: data, total: count });
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
      category: body.category ?? null,
      summary: body.summary ?? null,
      source: body.source ?? 'manual',
      metadata: body.metadata ?? null,
      // Embedding will be null until the embedding pipeline processes it
      embedding: null,
      embedded_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(entry)
      .select('id, title, content_type, language, category, created_at')
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
