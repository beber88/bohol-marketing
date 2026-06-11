// src/app/api/marketing/knowledge/search/route.ts
// Semantic search over knowledge base using pgvector similarity

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

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
        'id, title, content, content_type, language, category, summary, created_at'
      )
      .or(
        `content.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (contentType) textQuery = textQuery.eq('content_type', contentType);
    if (language) textQuery = textQuery.eq('language', language);
    if (category) textQuery = textQuery.eq('category', category);

    const { data: textResults, error: textError } = await textQuery;

    if (textError) {
      console.error(
        '[api/marketing/knowledge/search] Text search error:',
        textError.message
      );
      return Response.json({ error: textError.message }, { status: 500 });
    }

    return Response.json({
      results: textResults,
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
