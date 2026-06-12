// src/app/api/marketing/knowledge/search/route.ts
// Semantic search over knowledge base using pgvector similarity

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { PROJECT_KNOWLEDGE_ENTRIES } from '@/lib/knowledge/project-library';

function localSearch(query: string, limit: number, filters: { contentType?: string | null; language?: string | null; category?: string | null }) {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9\u0590-\u05FF]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
  return PROJECT_KNOWLEDGE_ENTRIES
    .filter((entry) => !filters.contentType || entry.content_type === filters.contentType)
    .filter((entry) => !filters.language || entry.language === filters.language)
    .filter((entry) => !filters.category || entry.category === filters.category)
    .map((entry, index) => ({
      id: `local-${index + 1}`,
      title: entry.title,
      content: entry.content,
      content_type: entry.content_type,
      language: entry.language,
      category: entry.category,
      summary: entry.summary,
      metadata: { source: entry.source, category: entry.category, summary: entry.summary, fallback: true },
      score: tokens.reduce((sum, token) => (
        [entry.title, entry.summary, entry.content].join(' ').toLowerCase().includes(token) ? sum + 1 : sum
      ), 0),
    }))
    .filter((entry) => entry.score > 0 || tokens.length === 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      const body = await request.json();
      const results = localSearch(String(body.query ?? ''), body.limit ?? 10, {
        contentType: body.contentType ?? null,
        language: body.language ?? null,
        category: body.category ?? null,
      });
      return Response.json({ results, searchType: 'local_fallback', query: body.query ?? '' });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.query || typeof body.query !== 'string') {
      return Response.json(
        { error: 'Missing required field: query (search text)' },
        { status: 400 }
      );
    }

    const searchQuery = body.query.trim();
    const limit = body.limit ?? 10;
    const contentType = body.contentType ?? null;
    const language = body.language ?? null;
    const category = body.category ?? null;

    // Step 1: Generate embedding for the query
    // Uses the Anthropic or OpenAI embedding API via a Supabase edge function
    // or a direct API call. For now, try the Supabase RPC approach first.
    let queryEmbedding: number[] | null = null;

    try {
      queryEmbedding = await generateQueryEmbedding(searchQuery);
    } catch (embeddingErr) {
      console.warn(
        '[api/marketing/knowledge/search] Embedding generation failed, falling back to text search:',
        embeddingErr instanceof Error ? embeddingErr.message : 'Unknown error'
      );
    }

    // Step 2: Search using vector similarity if embedding is available
    if (queryEmbedding) {
      // Use Supabase RPC to call match_knowledge function (pgvector cosine similarity)
      const rpcParams: Record<string, unknown> = {
        query_embedding: queryEmbedding,
        match_count: limit,
      };
      if (contentType) rpcParams.filter_content_type = contentType;
      if (language) rpcParams.filter_language = language;
      if (category) rpcParams.filter_category = category;

      const { data: vectorResults, error: vectorError } = await supabase.rpc(
        'match_knowledge',
        rpcParams
      );

      if (!vectorError && vectorResults) {
        return Response.json({
          results: vectorResults,
          searchType: 'vector',
          query: searchQuery,
        });
      }

      // If RPC fails (function may not exist yet), fall through to text search
      console.warn(
        '[api/marketing/knowledge/search] Vector search RPC failed:',
        vectorError?.message ?? 'No results'
      );
    }

    // Step 3: Fallback - text search using Postgres full-text search
    let textQuery = supabase
      .from('knowledge_base')
      .select(
        'id, title, content, content_type, language, metadata, created_at'
      )
      .or(
        `content.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (contentType) textQuery = textQuery.eq('content_type', contentType);
    if (language) textQuery = textQuery.eq('language', language);

    const { data: textResults, error: textError } = await textQuery;

    if (textError) {
      console.error(
        '[api/marketing/knowledge/search] Text search error:',
        textError.message
      );
      return Response.json({ error: textError.message }, { status: 500 });
    }

    const results = (textResults ?? [])
      .map((entry) => {
        const metadata = (entry.metadata ?? {}) as Record<string, unknown>;
        return { ...entry, category: metadata.category ?? null, summary: metadata.summary ?? null };
      })
      .filter((entry) => !category || entry.category === category);

    if (results.length === 0) {
      const fallback = localSearch(searchQuery, limit, { contentType, language, category });
      return Response.json({ results: fallback, searchType: 'local_fallback', query: searchQuery });
    }

    return Response.json({
      results,
      searchType: 'text_fallback',
      query: searchQuery,
      note: 'Vector search unavailable. Using text-based fallback. Ensure embeddings are generated and match_knowledge RPC function exists.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/knowledge/search] POST exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Generate an embedding vector for the search query.
 * Uses OpenAI's text-embedding-3-small model via the openai package.
 * Falls back to returning null if the API key is not configured.
 */
async function generateQueryEmbedding(
  text: string
): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured for embedding generation');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenAI embedding API error: ${response.status} ${errorBody}`
    );
  }

  const result = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };

  if (result.data && result.data.length > 0) {
    return result.data[0].embedding;
  }

  return null;
}
