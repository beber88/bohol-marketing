// src/lib/council/models.ts
// Model configuration and cost calculations for the LLM council.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModelConfig {
  id: string;
  provider: 'anthropic' | 'openrouter';
  displayName: string;
  costPerMTokenInput: number;
  costPerMTokenOutput: number;
  maxTokens: number;
  strengths: string[];
}

// ---------------------------------------------------------------------------
// Available models
// ---------------------------------------------------------------------------

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  'claude-sonnet-4-20250514': {
    id: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
    displayName: 'Claude Sonnet 4',
    costPerMTokenInput: 3,
    costPerMTokenOutput: 15,
    maxTokens: 8192,
    strengths: ['strategy', 'nuance', 'copy', 'analysis'],
  },
  'claude-haiku-4-5-20251001': {
    id: 'claude-haiku-4-5-20251001',
    provider: 'anthropic',
    displayName: 'Claude Haiku 4.5',
    costPerMTokenInput: 0.8,
    costPerMTokenOutput: 4,
    maxTokens: 8192,
    strengths: ['speed', 'formatting', 'classification'],
  },
  'openai/gpt-4o': {
    id: 'openai/gpt-4o',
    provider: 'openrouter',
    displayName: 'GPT-4o',
    costPerMTokenInput: 2.5,
    costPerMTokenOutput: 10,
    maxTokens: 4096,
    strengths: ['structure', 'planning', 'data'],
  },
  'google/gemini-2.5-pro-preview': {
    id: 'google/gemini-2.5-pro-preview',
    provider: 'openrouter',
    displayName: 'Gemini 2.5 Pro',
    costPerMTokenInput: 2.5,
    costPerMTokenOutput: 15,
    maxTokens: 8192,
    strengths: ['multimodal', 'research', 'data-viz'],
  },
  'x-ai/grok-3': {
    id: 'x-ai/grok-3',
    provider: 'openrouter',
    displayName: 'Grok 3',
    costPerMTokenInput: 3,
    costPerMTokenOutput: 15,
    maxTokens: 8192,
    strengths: ['contrarian', 'cultural', 'creative'],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get model config by ID. Returns undefined if the model is not registered.
 */
export function getModel(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS[id];
}

/**
 * Calculate the USD cost of an LLM call for a given model and token counts.
 * Falls back to Claude Sonnet pricing for unknown models.
 */
export function getModelCost(
  id: string,
  tokensIn: number,
  tokensOut: number
): number {
  const model = AVAILABLE_MODELS[id];

  const inputRate = model?.costPerMTokenInput ?? 3;
  const outputRate = model?.costPerMTokenOutput ?? 15;

  return (
    (tokensIn / 1_000_000) * inputRate + (tokensOut / 1_000_000) * outputRate
  );
}
