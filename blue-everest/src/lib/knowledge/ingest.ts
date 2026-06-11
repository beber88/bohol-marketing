// src/lib/knowledge/ingest.ts
// Knowledge base ingestion: reads documents, chunks them, generates embeddings,
// and stores them in Supabase with pgvector for semantic search.

import OpenAI from 'openai';
import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { promises as fs } from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

/**
 * Chunk text into segments of approximately `maxChars` characters with overlap.
 * Splits on paragraph boundaries first, then on sentence boundaries if a single
 * paragraph exceeds `maxChars`.
 */
export function chunkText(
  text: string,
  maxChars: number = 2000,
  overlap: number = 200
): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Normalize whitespace
  const cleaned = text.replace(/\r\n/g, '\n').trim();

  // If the entire text fits in one chunk, return it directly
  if (cleaned.length <= maxChars) {
    return [cleaned];
  }

  // Split into paragraphs (double newline)
  const paragraphs = cleaned.split(/\n\n+/).filter((p) => p.trim().length > 0);

  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();

    // If adding this paragraph would exceed maxChars, finalize current chunk
    if (
      currentChunk.length > 0 &&
      currentChunk.length + trimmed.length + 2 > maxChars
    ) {
      chunks.push(currentChunk.trim());

      // Start new chunk with overlap from end of previous chunk
      if (overlap > 0 && currentChunk.length > overlap) {
        // Take the last `overlap` characters, breaking at a word boundary
        const overlapText = currentChunk.slice(-overlap);
        const wordBreak = overlapText.indexOf(' ');
        currentChunk =
          wordBreak > 0 ? overlapText.slice(wordBreak + 1) : overlapText;
      } else {
        currentChunk = '';
      }
    }

    // If a single paragraph is longer than maxChars, split it on sentences
    if (trimmed.length > maxChars) {
      // Finalize any accumulated text first
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      const sentences = splitIntoSentences(trimmed);
      let sentenceChunk = '';

      for (const sentence of sentences) {
        if (
          sentenceChunk.length > 0 &&
          sentenceChunk.length + sentence.length + 1 > maxChars
        ) {
          chunks.push(sentenceChunk.trim());
          // Overlap for sentence-level splits
          if (overlap > 0 && sentenceChunk.length > overlap) {
            const overlapText = sentenceChunk.slice(-overlap);
            const wordBreak = overlapText.indexOf(' ');
            sentenceChunk =
              wordBreak > 0 ? overlapText.slice(wordBreak + 1) : overlapText;
          } else {
            sentenceChunk = '';
          }
        }
        sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
      }

      if (sentenceChunk.trim().length > 0) {
        currentChunk = sentenceChunk;
      }
    } else {
      currentChunk +=
        (currentChunk.length > 0 ? '\n\n' : '') + trimmed;
    }
  }

  // Finalize last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Split text into sentences using common sentence-ending punctuation.
 */
function splitIntoSentences(text: string): string[] {
  // Split on period, exclamation, or question mark followed by a space and uppercase letter,
  // or followed by end of string. Keeps the delimiter with the preceding sentence.
  const raw = text.split(/(?<=[.!?])\s+(?=[A-Z\u0590-\u05FF])/);
  return raw.filter((s) => s.trim().length > 0);
}

// ---------------------------------------------------------------------------
// Embedding
// ---------------------------------------------------------------------------

/**
 * Generate a vector embedding for a text chunk using OpenAI text-embedding-3-small.
 * Returns a 1536-dimensional float array.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      '[knowledge] OPENAI_API_KEY is not set. Cannot generate embeddings.'
    );
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0].embedding;
}

// ---------------------------------------------------------------------------
// Ingestion
// ---------------------------------------------------------------------------

export interface IngestDocumentParams {
  title: string;
  content: string;
  contentType: string;
  sourceFile: string;
  language?: string;
  market?: string;
  projectId?: string;
}

/**
 * Ingest a single document: chunk it, embed each chunk, and store in Supabase.
 * Returns the number of chunks created.
 *
 * Expects a `kb_documents` table with columns:
 *   id (uuid, default gen_random_uuid()),
 *   title (text),
 *   content (text),
 *   content_type (text),
 *   source_file (text),
 *   language (text, default 'en'),
 *   market (text, nullable),
 *   project_id (text, nullable),
 *   chunk_index (int),
 *   total_chunks (int),
 *   embedding (vector(1536)),
 *   created_at (timestamptz, default now())
 */
export async function ingestDocument(
  params: IngestDocumentParams
): Promise<{ chunksCreated: number }> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new Error(
      '[knowledge] Supabase admin client unavailable. Check env vars.'
    );
  }

  const chunks = chunkText(params.content);
  if (chunks.length === 0) {
    console.warn(
      `[knowledge] Document "${params.title}" produced no chunks. Skipping.`
    );
    return { chunksCreated: 0 };
  }

  console.log(
    `[knowledge] Ingesting "${params.title}": ${chunks.length} chunks`
  );

  // Delete existing chunks for this source file to allow re-ingestion
  await supabase
    .from('kb_documents')
    .delete()
    .eq('source_file', params.sourceFile);

  // Generate embeddings and insert chunks
  let inserted = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await generateEmbedding(chunk);

    const { error } = await supabase.from('kb_documents').insert({
      title: params.title,
      content: chunk,
      content_type: params.contentType,
      source_file: params.sourceFile,
      language: params.language ?? 'en',
      market: params.market ?? null,
      project_id: params.projectId ?? null,
      chunk_index: i,
      total_chunks: chunks.length,
      embedding: JSON.stringify(embedding),
    });

    if (error) {
      console.error(
        `[knowledge] Failed to insert chunk ${i} of "${params.title}":`,
        error.message
      );
    } else {
      inserted++;
    }
  }

  console.log(
    `[knowledge] Ingested "${params.title}": ${inserted}/${chunks.length} chunks stored`
  );
  return { chunksCreated: inserted };
}

/**
 * Ingest all text files from a directory.
 * Supports .txt, .md, and .html files. Each file becomes one document.
 */
export async function ingestFromDirectory(
  dirPath: string,
  contentType: string
): Promise<{ totalChunks: number; files: string[] }> {
  const resolvedDir = path.resolve(dirPath);
  let entries: string[];

  try {
    entries = await fs.readdir(resolvedDir);
  } catch (err) {
    throw new Error(
      `[knowledge] Cannot read directory "${resolvedDir}": ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const supportedExtensions = new Set(['.txt', '.md', '.html', '.json']);
  const textFiles = entries.filter((entry) =>
    supportedExtensions.has(path.extname(entry).toLowerCase())
  );

  if (textFiles.length === 0) {
    console.warn(
      `[knowledge] No supported files found in "${resolvedDir}"`
    );
    return { totalChunks: 0, files: [] };
  }

  let totalChunks = 0;
  const processedFiles: string[] = [];

  for (const file of textFiles) {
    const filePath = path.join(resolvedDir, file);
    const content = await fs.readFile(filePath, 'utf-8');

    // Derive title from filename (remove extension, replace dashes/underscores)
    const title = path
      .basename(file, path.extname(file))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const result = await ingestDocument({
      title,
      content,
      contentType,
      sourceFile: filePath,
    });

    totalChunks += result.chunksCreated;
    processedFiles.push(file);
  }

  console.log(
    `[knowledge] Directory ingestion complete: ${totalChunks} chunks from ${processedFiles.length} files`
  );
  return { totalChunks, files: processedFiles };
}

/**
 * Re-embed all existing documents in the knowledge base.
 * Useful when switching embedding models or dimensions.
 */
export async function reembedAll(): Promise<{ updated: number }> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new Error(
      '[knowledge] Supabase admin client unavailable. Check env vars.'
    );
  }

  // Fetch all documents without pagination limit
  const { data: docs, error } = await supabase
    .from('kb_documents')
    .select('id, content')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(
      `[knowledge] Failed to fetch documents for re-embedding: ${error.message}`
    );
  }

  if (!docs || docs.length === 0) {
    console.log('[knowledge] No documents to re-embed');
    return { updated: 0 };
  }

  console.log(
    `[knowledge] Re-embedding ${docs.length} document chunks...`
  );

  let updated = 0;
  for (const doc of docs) {
    const embedding = await generateEmbedding(doc.content);

    const { error: updateError } = await supabase
      .from('kb_documents')
      .update({ embedding: JSON.stringify(embedding) })
      .eq('id', doc.id);

    if (updateError) {
      console.error(
        `[knowledge] Failed to re-embed doc ${doc.id}:`,
        updateError.message
      );
    } else {
      updated++;
    }
  }

  console.log(
    `[knowledge] Re-embedding complete: ${updated}/${docs.length} updated`
  );
  return { updated };
}
