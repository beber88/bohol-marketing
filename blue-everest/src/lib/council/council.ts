// src/lib/council/council.ts
// Multi-model council for strategic marketing decisions.
// Runs multiple LLMs in parallel, collects their responses, and synthesizes
// a final answer using a chairman model.

import Anthropic from '@anthropic-ai/sdk';
import { AVAILABLE_MODELS, getModelCost } from './models';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CouncilModelSpec {
  id: string;
  provider: 'anthropic' | 'openrouter';
  name: string;
}

export interface CouncilConfig {
  models: CouncilModelSpec[];
  chairmanModel: string;
  maxTokensPerResponse: number;
}

export const DEFAULT_COUNCIL_CONFIG: CouncilConfig = {
  models: [
    {
      id: 'claude-sonnet-4-20250514',
      provider: 'anthropic',
      name: 'Claude Sonnet',
    },
    {
      id: 'openai/gpt-4o',
      provider: 'openrouter',
      name: 'GPT-4o',
    },
  ],
  chairmanModel: 'claude-sonnet-4-20250514',
  maxTokensPerResponse: 2000,
};

export interface ModelResponse {
  model: string;
  modelName: string;
  response: string;
  tokensUsed: number;
  costUsd: number;
}

export interface DeliberationResult {
  query: string;
  responses: ModelResponse[];
  synthesis: string;
  totalCost: number;
  duration: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const CHAIRMAN_SYSTEM_PROMPT = `You are the Chairman of a multi-model AI council. You have received responses from multiple AI models to the same query. Your job is to:

1. Analyze each model's response for quality, accuracy, and relevance.
2. Identify the strongest ideas and approaches across all responses.
3. Synthesize the best elements into a single, superior final answer.
4. If models disagree, use your judgment to pick the stronger position and explain why.
5. The final synthesis should be better than any individual response.

Do NOT simply concatenate the responses. Produce a cohesive, authoritative final answer.`;

/**
 * Call an Anthropic model directly using the SDK.
 */
async function callAnthropic(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens: number
): Promise<{ content: string; tokensIn: number; tokensOut: number }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      '[council] ANTHROPIC_API_KEY is not set. Cannot call Anthropic models.'
    );
  }

  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: maxTokens,
    temperature: 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlocks = response.content.filter(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );
  const content = textBlocks.map((b) => b.text).join('\n');

  return {
    content,
    tokensIn: response.usage.input_tokens,
    tokensOut: response.usage.output_tokens,
  };
}

/**
 * Call a model via OpenRouter's OpenAI-compatible API.
 */
async function callOpenRouter(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens: number
): Promise<{ content: string; tokensIn: number; tokensOut: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      '[council] OPENROUTER_API_KEY is not set. Cannot call OpenRouter models.'
    );
  }

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://blue-everest.com',
        'X-Title': 'Blue Everest Marketing Council',
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `[council] OpenRouter error ${response.status} for model ${modelId}: ${errorBody}`
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number };
  };

  const content = data.choices?.[0]?.message?.content || '';
  const tokensIn = data.usage?.prompt_tokens ?? 0;
  const tokensOut = data.usage?.completion_tokens ?? 0;

  return { content, tokensIn, tokensOut };
}

/**
 * Call a single model (dispatches to the correct provider).
 */
async function callModel(
  spec: CouncilModelSpec,
  systemPrompt: string,
  userMessage: string,
  maxTokens: number
): Promise<ModelResponse> {
  const startTime = Date.now();

  try {
    let result: { content: string; tokensIn: number; tokensOut: number };

    if (spec.provider === 'anthropic') {
      result = await callAnthropic(spec.id, systemPrompt, userMessage, maxTokens);
    } else {
      result = await callOpenRouter(spec.id, systemPrompt, userMessage, maxTokens);
    }

    const cost = getModelCost(spec.id, result.tokensIn, result.tokensOut);

    console.log(
      `[council] ${spec.name} responded in ${Date.now() - startTime}ms ` +
        `(${result.tokensIn}+${result.tokensOut} tokens, $${cost.toFixed(5)})`
    );

    return {
      model: spec.id,
      modelName: spec.name,
      response: result.content,
      tokensUsed: result.tokensIn + result.tokensOut,
      costUsd: cost,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : String(err);
    console.error(
      `[council] ${spec.name} (${spec.id}) failed: ${errorMessage}`
    );

    return {
      model: spec.id,
      modelName: spec.name,
      response: `[ERROR] Model ${spec.name} failed to respond: ${errorMessage}`,
      tokensUsed: 0,
      costUsd: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// Main council function
// ---------------------------------------------------------------------------

/**
 * Run a multi-model council deliberation.
 *
 * 1. Sends the query to all configured models in parallel.
 * 2. Collects all responses.
 * 3. Sends all responses to the chairman model for synthesis.
 * 4. Returns the synthesis along with all individual responses and cost data.
 */
export async function runCouncil(params: {
  query: string;
  systemPrompt?: string;
  config?: Partial<CouncilConfig>;
}): Promise<DeliberationResult> {
  const startTime = Date.now();

  // Merge provided config with defaults
  const config: CouncilConfig = {
    ...DEFAULT_COUNCIL_CONFIG,
    ...params.config,
    models: params.config?.models ?? DEFAULT_COUNCIL_CONFIG.models,
  };

  const systemPrompt =
    params.systemPrompt ||
    'You are a senior marketing strategist. Provide a thorough, actionable response.';

  console.log(
    `[council] Starting deliberation with ${config.models.length} models: ` +
      config.models.map((m) => m.name).join(', ')
  );

  // Stage 1: Call all models in parallel
  const responsePromises = config.models.map((model) =>
    callModel(model, systemPrompt, params.query, config.maxTokensPerResponse)
  );

  const responses = await Promise.all(responsePromises);

  // Filter out complete failures (keep error responses for the chairman to see)
  const validResponses = responses.filter(
    (r) => !r.response.startsWith('[ERROR]')
  );

  if (validResponses.length === 0) {
    console.error(
      '[council] All models failed. Returning error result.'
    );
    return {
      query: params.query,
      responses,
      synthesis:
        'All council models failed to respond. Please check API keys and try again.',
      totalCost: 0,
      duration: Date.now() - startTime,
    };
  }

  // Stage 2: Chairman synthesis
  const chairmanInput = buildChairmanInput(
    params.query,
    validResponses
  );

  // Determine chairman model provider
  const chairmanModelId = config.chairmanModel;
  const chairmanConfig = AVAILABLE_MODELS[chairmanModelId];
  const chairmanProvider = chairmanConfig?.provider ?? 'anthropic';

  const chairmanSpec: CouncilModelSpec = {
    id: chairmanModelId,
    provider: chairmanProvider,
    name: chairmanConfig?.displayName ?? 'Chairman',
  };

  console.log(
    `[council] Chairman synthesis by ${chairmanSpec.name}...`
  );

  const chairmanResponse = await callModel(
    chairmanSpec,
    CHAIRMAN_SYSTEM_PROMPT,
    chairmanInput,
    config.maxTokensPerResponse * 2 // Chairman gets more room
  );

  // Compute total cost
  const totalCost =
    responses.reduce((sum, r) => sum + r.costUsd, 0) +
    chairmanResponse.costUsd;

  const duration = Date.now() - startTime;

  console.log(
    `[council] Deliberation complete in ${duration}ms. ` +
      `Total cost: $${totalCost.toFixed(5)}. ` +
      `${validResponses.length}/${config.models.length} models responded.`
  );

  return {
    query: params.query,
    responses,
    synthesis: chairmanResponse.response,
    totalCost,
    duration,
  };
}

/**
 * Build the chairman's input message from individual model responses.
 */
function buildChairmanInput(
  originalQuery: string,
  responses: ModelResponse[]
): string {
  const responseBlocks = responses
    .map((r, i) => {
      const label = String.fromCharCode(65 + i); // A, B, C, D...
      return `--- Response ${label} (${r.modelName}) ---\n${r.response}\n`;
    })
    .join('\n');

  return `ORIGINAL QUERY:
${originalQuery}

COUNCIL RESPONSES:
${responseBlocks}

Please synthesize the best elements from all responses into a single, superior final answer. Identify the strongest ideas, resolve any disagreements, and produce a cohesive, authoritative response.`;
}
