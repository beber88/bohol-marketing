// src/lib/knowledge/retriever.ts
// Semantic search over the Blue Everest knowledge base using pgvector.

import { generateEmbedding } from './ingest';
import { createSupabaseAdmin } from '@/lib/connectors/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  contentType: string;
  sourceFile: string;
  similarity: number;
  language: string;
  market?: string;
}

export interface SearchKnowledgeParams {
  query: string;
  limit?: number;
  contentType?: string;
  language?: string;
  market?: string;
  minSimilarity?: number;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * Search the knowledge base by semantic similarity.
 *
 * Requires a Supabase RPC function `match_kb_documents` created via migration:
 *
 * ```sql
 * CREATE OR REPLACE FUNCTION match_kb_documents(
 *   query_embedding vector(1536),
 *   match_count int DEFAULT 5,
 *   min_similarity float DEFAULT 0.5
 * )
 * RETURNS TABLE (
 *   id uuid,
 *   title text,
 *   content text,
 *   content_type text,
 *   source_file text,
 *   similarity float,
 *   language text,
 *   market text
 * )
 * LANGUAGE plpgsql
 * AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT
 *     kb.id,
 *     kb.title,
 *     kb.content,
 *     kb.content_type,
 *     kb.source_file,
 *     1 - (kb.embedding <=> query_embedding) AS similarity,
 *     kb.language,
 *     kb.market
 *   FROM kb_documents kb
 *   WHERE 1 - (kb.embedding <=> query_embedding) >= min_similarity
 *   ORDER BY kb.embedding <=> query_embedding
 *   LIMIT match_count;
 * END;
 * $$;
 * ```
 */
export async function searchKnowledge(
  params: SearchKnowledgeParams
): Promise<SearchResult[]> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new Error(
      '[knowledge] Supabase admin client unavailable. Check env vars.'
    );
  }

  const limit = params.limit ?? 5;
  const minSimilarity = params.minSimilarity ?? 0.5;

  // Generate embedding for the search query
  const queryEmbedding = await generateEmbedding(params.query);

  // Call the RPC function for vector similarity search
  const { data, error } = await supabase.rpc('match_kb_documents', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: limit,
    min_similarity: minSimilarity,
  });

  if (error) {
    // If the RPC function doesn't exist yet, fall back to a manual query approach
    console.warn(
      '[knowledge] RPC match_kb_documents failed, attempting manual search:',
      error.message
    );
    return manualSearch(queryEmbedding, params);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Apply optional filters (the RPC returns all matching rows)
  let results: SearchResult[] = data.map(
    (row: {
      id: string;
      title: string;
      content: string;
      content_type: string;
      source_file: string;
      similarity: number;
      language: string;
      market: string | null;
    }) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      contentType: row.content_type,
      sourceFile: row.source_file,
      similarity: row.similarity,
      language: row.language,
      market: row.market ?? undefined,
    })
  );

  // Post-filter by contentType, language, market if specified
  if (params.contentType) {
    results = results.filter((r) => r.contentType === params.contentType);
  }
  if (params.language) {
    results = results.filter((r) => r.language === params.language);
  }
  if (params.market) {
    results = results.filter((r) => r.market === params.market);
  }

  // Sort by similarity descending (should already be, but ensure)
  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, limit);
}

/**
 * Fallback manual search when the RPC function is not yet created.
 * Fetches all documents and computes cosine similarity in JavaScript.
 * Only suitable for small knowledge bases (< ~1000 chunks).
 */
async function manualSearch(
  queryEmbedding: number[],
  params: SearchKnowledgeParams
): Promise<SearchResult[]> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return [];

  const limit = params.limit ?? 5;
  const minSimilarity = params.minSimilarity ?? 0.5;

  let query = supabase
    .from('kb_documents')
    .select('id, title, content, content_type, source_file, language, market, embedding');

  if (params.contentType) {
    query = query.eq('content_type', params.contentType);
  }
  if (params.language) {
    query = query.eq('language', params.language);
  }
  if (params.market) {
    query = query.eq('market', params.market);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('[knowledge] Manual search failed:', error?.message);
    return [];
  }

  // Compute cosine similarity for each document
  const scored: SearchResult[] = [];

  for (const doc of data) {
    let docEmbedding: number[];
    try {
      docEmbedding =
        typeof doc.embedding === 'string'
          ? JSON.parse(doc.embedding)
          : doc.embedding;
    } catch {
      continue;
    }

    const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
    if (similarity >= minSimilarity) {
      scored.push({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        contentType: doc.content_type,
        sourceFile: doc.source_file,
        similarity,
        language: doc.language,
        market: doc.market ?? undefined,
      });
    }
  }

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, limit);
}

/**
 * Compute cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// ---------------------------------------------------------------------------
// RAG Context
// ---------------------------------------------------------------------------

/**
 * Get formatted context for a RAG query.
 * Searches the knowledge base and returns a formatted string suitable for
 * injection into an LLM system prompt or user message.
 *
 * @param query - The user's question or topic.
 * @param language - Language filter (e.g. 'en', 'he', 'tl').
 * @param maxTokens - Approximate maximum tokens for the context block.
 *                     Uses 4 chars per token as a rough estimate.
 */
export async function getRAGContext(
  query: string,
  language: string,
  maxTokens: number = 2000
): Promise<string> {
  const results = await searchKnowledge({
    query,
    limit: 5,
    language,
    minSimilarity: 0.4,
  });

  if (results.length === 0) {
    return '';
  }

  const maxChars = maxTokens * 4; // Rough estimate: 1 token ~ 4 chars
  let context = 'RELEVANT INFORMATION:\n';
  let currentLength = context.length;

  for (const result of results) {
    const block = `\n[Source: ${result.title}] (similarity: ${result.similarity.toFixed(2)})\n${result.content}\n`;

    if (currentLength + block.length > maxChars) {
      // Truncate the last block to fit
      const remaining = maxChars - currentLength;
      if (remaining > 100) {
        context += block.slice(0, remaining) + '...';
      }
      break;
    }

    context += block;
    currentLength += block.length;
  }

  return context;
}
