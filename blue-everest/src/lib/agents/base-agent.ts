// src/lib/agents/base-agent.ts
// Abstract base class for all marketing AI agents

import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import path from 'path';
import type { AgentInput, AgentOutput, AgentSpec } from './types';
import { getModelId } from './registry';

/** Per-million-token pricing by model prefix */
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4': { input: 3.0, output: 15.0 },
  'claude-haiku-4': { input: 0.8, output: 4.0 },
};

function matchPricing(model: string): { input: number; output: number } {
  for (const [prefix, rates] of Object.entries(PRICING)) {
    if (model.startsWith(prefix)) return rates;
  }
  // Conservative fallback: assume sonnet pricing
  return { input: 3.0, output: 15.0 };
}

export abstract class BaseAgent {
  protected anthropic: Anthropic;
  protected spec: AgentSpec;

  constructor(spec: AgentSpec) {
    this.spec = spec;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn(
        `[${spec.name}] ANTHROPIC_API_KEY not set. LLM calls will fail at runtime.`
      );
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey ?? '',
    });
  }

  /**
   * Each agent subclass must implement its own execution logic.
   */
  abstract execute(input: AgentInput): Promise<AgentOutput>;

  /**
   * Make a single LLM call via the Anthropic Messages API.
   */
  protected async callLLM(
    systemPrompt: string,
    userMessage: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<{
    content: string;
    tokensInput: number;
    tokensOutput: number;
    costUsd: number;
  }> {
    const model =
      this.spec.modelTier === 'council'
        ? 'claude-sonnet-4-20250514'
        : getModelId(this.spec.modelTier);

    const maxTokens = options?.maxTokens ?? 2048;
    const temperature = options?.temperature ?? 0.7;

    const response = await this.anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Extract text from the response content blocks
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    const content = textBlocks.map((b) => b.text).join('\n');

    const tokensInput = response.usage.input_tokens;
    const tokensOutput = response.usage.output_tokens;

    const rates = matchPricing(model);
    const costUsd =
      (tokensInput / 1_000_000) * rates.input +
      (tokensOutput / 1_000_000) * rates.output;

    return { content, tokensInput, tokensOutput, costUsd };
  }

  /**
   * Load a prompt template from the src/prompts/ directory.
   * Returns an empty string (with a warning) if the file does not exist.
   */
  protected async loadPrompt(filename: string): Promise<string> {
    const promptPath = path.resolve(
      process.cwd(),
      'src',
      'prompts',
      filename
    );

    try {
      const content = await fs.readFile(promptPath, 'utf-8');
      return content;
    } catch {
      console.warn(
        `[${this.spec.name}] Prompt file not found: ${promptPath}. Using empty system prompt.`
      );
      return '';
    }
  }

  /**
   * Log an agent run for observability.
   * In development: console output.
   * In production: would write to the agent_runs table via Supabase.
   */
  protected async logRun(
    input: AgentInput,
    output: AgentOutput
  ): Promise<void> {
    // Always log to console
    console.log(
      `[agent:${output.agentName}] run=${output.runId} ` +
        `success=${output.success} ` +
        `tokens=${output.tokensUsed.input}/${output.tokensUsed.output} ` +
        `cost=$${output.costUsd.toFixed(5)} ` +
        `duration=${output.duration}ms`
    );
    if (output.error) {
      console.error(`[agent:${output.agentName}] error: ${output.error}`);
    }

    // Always persist to Supabase (not just production)
    try {
      const { createSupabaseAdmin } = await import(
        '@/lib/connectors/supabase'
      );
      const supabase = createSupabaseAdmin();
      if (supabase) {
        const now = new Date().toISOString();
        await supabase.from('agent_runs').insert({
          agent_id: output.agentName,
          status: output.success ? 'complete' : 'failed',
          input: { query: (input.query ?? '').slice(0, 500), trigger: input.trigger },
          output: {
            summary: typeof output.data === 'string' ? output.data.slice(0, 500) : JSON.stringify(output.data ?? '').slice(0, 500),
            error: output.error ?? null,
          },
          triggered_by: input.trigger ?? 'manual',
          total_cost_usd: output.costUsd,
          total_tokens: output.tokensUsed.input + output.tokensUsed.output,
          latency_ms: output.duration,
          started_at: now,
          completed_at: now,
          created_at: now,
        });
      }
    } catch {
      console.error(
        `[agent:${output.agentName}] Failed to persist run log to Supabase`
      );
    }
  }

  /**
   * Parse JSON from an LLM response.
   * Handles ```json code blocks and raw JSON objects/arrays.
   * Returns null if parsing fails.
   */
  protected parseJSON<T>(text: string): T | null {
    // Try extracting from a fenced code block first
    const fencedMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (fencedMatch) {
      try {
        return JSON.parse(fencedMatch[1].trim()) as T;
      } catch {
        // Fall through to other strategies
      }
    }

    // Try finding the first { or [ and matching to the end
    const objectStart = text.indexOf('{');
    const arrayStart = text.indexOf('[');

    let startIndex = -1;
    let endChar: string;

    if (objectStart === -1 && arrayStart === -1) {
      return null;
    } else if (objectStart === -1) {
      startIndex = arrayStart;
      endChar = ']';
    } else if (arrayStart === -1) {
      startIndex = objectStart;
      endChar = '}';
    } else {
      // Use whichever comes first
      if (objectStart < arrayStart) {
        startIndex = objectStart;
        endChar = '}';
      } else {
        startIndex = arrayStart;
        endChar = ']';
      }
    }

    // Find the matching closing bracket from the end of the string
    const lastEnd = text.lastIndexOf(endChar);
    if (lastEnd <= startIndex) {
      return null;
    }

    const candidate = text.slice(startIndex, lastEnd + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch {
      return null;
    }
  }
}
