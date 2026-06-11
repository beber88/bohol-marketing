# Blue Everest Marketing Agent System - Technical Architecture

## How to Replicate This System for a New Project

This document explains exactly how the AI marketing agent system works, so you can duplicate it for any real estate (or other) marketing project.

---

## 1. System Overview

The system is a **10-agent AI marketing team** that runs inside a Next.js app. Each agent is specialized in one domain (copy, ads, email, etc.) and orchestrated by a CMO agent that delegates tasks.

```
                    ┌─────────────────┐
                    │  CMO Orchestrator │  ← receives queries/cron triggers
                    └────────┬────────┘
                             │ delegates briefs to:
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────┴─────┐   ┌───────┴──────┐   ┌──────┴──────┐
    │ Copywriter │   │ Performance  │   │ Email       │
    │            │   │ Ads Manager  │   │ Nurture     │
    └────────────┘   └──────────────┘   └─────────────┘
    ┌────────────┐   ┌──────────────┐   ┌─────────────┐
    │ Content    │   │ WhatsApp     │   │ CRM Lead    │
    │ Strategist │   │ Agent        │   │ Scorer      │
    └────────────┘   └──────────────┘   └─────────────┘
    ┌────────────┐   ┌──────────────┐   ┌─────────────┐
    │ Analytics  │   │ Brand Guard  │   │ David Sales │
    │ Reporter   │   │              │   │ Chatbot     │
    └────────────┘   └──────────────┘   └─────────────┘
```

---

## 2. Tech Stack (Required)

| Component | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | Full-stack web app |
| UI | Tailwind CSS + shadcn/ui | Dashboard & marketing pages |
| LLM Provider | Anthropic (Claude) | All agent intelligence |
| Multi-model | OpenRouter | Council mode (multiple LLMs) |
| Database | Supabase (Postgres) | Leads, campaigns, agent logs |
| Background Jobs | Inngest | Scheduled agent cron runs |
| Email | Brevo | Email sequences & automation |
| WhatsApp | WATI (WhatsApp Business) | WhatsApp flows & broadcasts |
| Ads | Meta Marketing API + Google Ads API | Campaign management |

---

## 3. The Agent Framework (How Every Agent Works)

### 3.1 BaseAgent (the foundation)

**File:** `src/lib/agents/base-agent.ts`

Every agent inherits from `BaseAgent`. It provides 4 core capabilities:

```typescript
abstract class BaseAgent {
  // 1. Call Claude via Anthropic SDK
  protected async callLLM(
    systemPrompt: string,    // The agent's personality & rules
    userMessage: string,     // The specific task/query
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<{ content: string; tokensInput: number; tokensOutput: number; costUsd: number }>

  // 2. Load a prompt template from src/prompts/
  protected async loadPrompt(filename: string): Promise<string>

  // 3. Log every run for observability (console in dev, Supabase in prod)
  protected async logRun(input: AgentInput, output: AgentOutput): Promise<void>

  // 4. Parse JSON from LLM responses (handles code blocks, raw JSON)
  protected parseJSON<T>(text: string): T | null
}
```

**How callLLM works:**
1. Picks the model based on `modelTier` (sonnet for strategic agents, haiku for fast agents)
2. Sends system prompt + user message to Anthropic Messages API
3. Calculates cost from token usage
4. Returns the response text + metadata

**Cost tracking:** Built into every call. Pricing is hardcoded:
- Claude Sonnet: $3/M input, $15/M output
- Claude Haiku: $0.8/M input, $4/M output

### 3.2 Agent Types (interface)

```typescript
interface AgentInput {
  briefId?: string;           // Reference to a campaign brief
  query?: string;             // Direct text query
  context?: Record<string, unknown>;  // Metrics, leads, campaign state
  trigger?: string;           // What triggered this run (cron, manual, webhook)
  parentRunId?: string;       // For tracing delegation chains
}

interface AgentOutput {
  success: boolean;
  data?: unknown;             // Agent-specific structured output
  error?: string;
  agentName: AgentName;
  runId: string;              // UUID for this run
  tokensUsed: { input: number; output: number };
  costUsd: number;
  duration: number;           // ms
}
```

### 3.3 Agent Registry

**File:** `src/lib/agents/registry.ts`

Every agent is registered with a spec:

```typescript
interface AgentSpec {
  name: AgentName;           // "cmo_orchestrator", "copywriter", etc.
  displayName: string;       // "CMO Orchestrator"
  description: string;       // What this agent does
  modelTier: 'sonnet' | 'haiku' | 'council';  // Which Claude model
  promptFile: string;        // "cmo-system.md" - file in src/prompts/
  defaultModel: string;      // "claude-sonnet-4-20250514"
}
```

**Model assignment strategy:**
- **Sonnet** (smart, more expensive): CMO, Content Strategist, Copywriter, CRM Scorer, Sales Chatbot
- **Haiku** (fast, cheap): Performance Ads, Email Nurture, WhatsApp, Analytics Reporter, Brand Guard

### 3.4 Creating a New Agent (step-by-step)

1. **Add to types.ts:** Add your agent name to the `AgentName` union type
2. **Create prompt file:** Write `src/prompts/your-agent-system.md` with the agent's personality, knowledge, and rules
3. **Register in registry.ts:** Add spec with name, model tier, and prompt file
4. **Create agent class:** Extend `BaseAgent`, implement `execute()`:

```typescript
class MyNewAgent extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.my_new_agent);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const runId = randomUUID();
    const start = Date.now();

    // 1. Load system prompt
    const systemPrompt = await this.loadPrompt(this.spec.promptFile);

    // 2. Build user message from input
    const userMessage = `...`;

    // 3. Call LLM
    const result = await this.callLLM(systemPrompt, userMessage, {
      maxTokens: 2048,
      temperature: 0.7,
    });

    // 4. Parse and return
    return {
      success: true,
      data: this.parseJSON(result.content),
      agentName: this.spec.name,
      runId,
      tokensUsed: { input: result.tokensInput, output: result.tokensOutput },
      costUsd: result.costUsd,
      duration: Date.now() - start,
    };
  }
}

export const myNewAgent = new MyNewAgent();
```

---

## 4. The 10 Agents - What Each Does

### 4.1 CMO Orchestrator (the brain)
**Model:** Sonnet | **Prompt:** `cmo-system.md`

Receives strategic queries ("launch a campaign for Q3") or daily cron triggers. Outputs:
- Summary of recommended actions
- Briefs for each specialist agent (with goal, channels, constraints, success metrics)
- Data requests
- Escalations
- Budget recommendations

**Key feature:** Section-based parsing - extracts CMO SUMMARY, AGENT BRIEFS, DATA NEEDED, ESCALATIONS from the LLM response even if formatting varies.

### 4.2 Content Strategist
**Model:** Sonnet | **Prompt:** `content-strategist-system.md`

Plans content calendars, defines pillars, generates briefs. Knows the 10 marketing pillars (tourism growth, airport expansion, bridge, etc.)

### 4.3 Copywriter
**Model:** Sonnet | **Prompt:** `copywriter-system.md`

Generates ad copy, social posts, headlines in English/Hebrew/Tagalog. Auto-validates through Brand Guard before returning.

### 4.4 Performance Ads Manager
**Model:** Haiku | **Prompt:** `performance-ads-system.md`

Generates Meta + Google ad configurations, targeting specs, budget splits. Knows kill/scale rules (CPM>$18 kill, CTR>3% scale).

### 4.5 Email Nurture
**Model:** Haiku | **Prompt:** `email-nurture-system.md`

Designs email sequences, generates templates, defines automation triggers. Handles Hebrew RTL, Shabbat scheduling.

### 4.6 WhatsApp Agent
**Model:** Haiku | **Prompt:** `whatsapp-agent-system.md`

Manages WhatsApp flows via WATI. Classifies inbound messages (inquiry/reservation/pricing/legal/spam), suggests replies, routes leads.

### 4.7 CRM Lead Scorer
**Model:** Sonnet | **Prompt:** `lead-scorer-system.md`

Scores leads based on behavioral + demographic signals. Has a `quickScore()` function that works without LLM (rule-based) for speed, plus full LLM scoring for borderline cases (score 60-80).

### 4.8 Analytics Reporter
**Model:** Haiku | **Prompt:** `analytics-reporter-system.md`

Ingests metrics from Meta/Google/email, identifies trends, generates reports with recommendations.

### 4.9 Brand Guard
**Model:** Haiku | **Prompt:** `brand-guard-rules.md`

Validates ALL outbound content against brand rules. Has a `quickValidate()` function (no LLM needed) that checks: forbidden words, currency rules, CTA requirements, formatting rules, Blueprint separation. Returns pass/fail with violations list.

### 4.10 David - Sales Chatbot
**Model:** Sonnet | **Prompt:** `sales-agent-system.md`

RAG-powered chatbot for website/WhatsApp. Has complete property knowledge base hardcoded in the class. Detects language (Hebrew/English/Korean/Chinese/Arabic), qualifies leads via signal detection, suggests WhatsApp handoff when signal weight >= 4.

**Key feature:** Returns plain text (not JSON) - speaks like a real human sales agent named David.

---

## 5. The Council (Multi-Model Deliberation)

**File:** `src/lib/council/council.ts`

For strategic decisions, multiple LLMs deliberate in parallel:

```
Query → [Claude Sonnet] + [GPT-4o via OpenRouter] → Chairman Synthesis
```

**How it works:**
1. Same query sent to all models in parallel
2. Each model responds independently
3. Chairman model (Claude Sonnet) receives ALL responses
4. Chairman synthesizes the best elements into a single superior answer

**Cost:** ~2-3x a single model call (pays for quality on strategic decisions).

**When to use:** Weekly strategy reviews, campaign post-mortems, budget reallocation decisions. NOT for routine tasks (too expensive).

---

## 6. Connectors (External Services)

### Supabase (`src/lib/connectors/supabase.ts`)
Two clients:
- `createSupabaseClient()` - anon key, client-safe, respects RLS
- `createSupabaseAdmin()` - service role key, server-only, bypasses RLS

### Meta Ads (`src/lib/connectors/meta-ads.ts`)
Fetches campaign insights, creates audiences, manages ad sets via Meta Marketing API.

### Google Ads (`src/lib/connectors/google-ads.ts`)
Manages search campaigns, keywords, ad groups via Google Ads API.

### Brevo (`src/lib/connectors/brevo.ts`)
Sends transactional + marketing emails, manages contacts, triggers automations.

### WATI (`src/lib/connectors/wati.ts`)
Sends WhatsApp templates, triggers flows, manages broadcasts via WATI API.

---

## 7. Scheduling (Inngest)

**File:** `src/lib/inngest/marketing-functions.ts`

Automated daily routine:

| Time (PHT) | Function | What It Does |
|---|---|---|
| 06:00 | FX Rate Update | Check currency rates |
| 08:00 | Morning Routine | Collect metrics, check leads, generate CMO brief |
| 10:00 | Content Posting | Validate & publish scheduled content |
| 13:00 | Lead Check | Find unassigned HOT leads, alert sales |
| 17:00 | Optimization | Run Performance Ads analysis, recommend changes |
| 21:00 | Evening Wrap | Final snapshot, update heartbeat |
| Mon 09:00 | Weekly Review | Full analytics report + Council deliberation |

**Event-driven functions:**
- `marketing/meta.webhook` → Create lead, score it
- `marketing/wati.webhook` → Analyze WhatsApp message, route lead
- `marketing/content.generate` → Generate copy via Copywriter agent
- `marketing/brand.check` → Validate content via Brand Guard
- `marketing/lead.score` → Score a specific lead

---

## 8. API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/marketing/agents` | GET | List agent runs |
| `/api/marketing/agents/dispatch` | POST | Trigger an agent manually |
| `/api/marketing/campaigns` | GET/POST | Campaign CRUD |
| `/api/marketing/leads` | GET/POST | Lead management |
| `/api/marketing/leads/webhook` | POST | Inbound lead webhook |
| `/api/marketing/content` | GET/POST | Content pieces CRUD |
| `/api/marketing/content/generate` | POST | Generate content via Copywriter |
| `/api/marketing/metrics` | GET | Campaign metrics |
| `/api/marketing/knowledge` | GET/POST | Knowledge base management |
| `/api/marketing/knowledge/search` | POST | RAG search |
| `/api/marketing/brand-check` | POST | Validate content |
| `/api/marketing/chat` | POST | Sales chatbot conversation |
| `/api/marketing/webhooks/meta` | POST | Meta webhook receiver |
| `/api/marketing/webhooks/wati` | POST | WATI webhook receiver |

---

## 9. Environment Variables (.env.local)

```bash
# LLM (required)
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...        # For Council multi-model

# Database (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Background Jobs
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Email
RESEND_API_KEY=...    # or BREVO_API_KEY

# WhatsApp
WATI_API_KEY=...
WATI_BASE_URL=https://live-mt-server.wati.io

# Ads
META_ACCESS_TOKEN=...
META_AD_ACCOUNT_ID=act_...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
```

---

## 10. How to Clone for a New Project

### Step 1: Copy the framework (these files are project-agnostic)
```
src/lib/agents/base-agent.ts     # The foundation - never changes
src/lib/agents/types.ts          # Agent interfaces - never changes
src/lib/agents/registry.ts       # Register new agents here
src/lib/council/council.ts       # Multi-model council
src/lib/council/models.ts        # Model pricing table
src/lib/connectors/supabase.ts   # Database connector
src/lib/inngest/client.ts        # Inngest setup
```

### Step 2: Customize for your project
```
src/lib/agents/registry.ts       # Change agent names/descriptions
src/prompts/*.md                 # Write new prompts for YOUR product
src/lib/agents/*-agent.ts        # Customize each agent's execute() logic
src/lib/inngest/marketing-functions.ts  # Set YOUR cron schedule
src/lib/config.ts                # YOUR company info
```

### Step 3: The prompts are everything
The agent code is generic plumbing. **The prompts make the agents smart.** Each prompt file in `src/prompts/` contains:
- Agent identity and personality
- Complete product knowledge base
- Rules and constraints
- Output format expectations
- Market-specific instructions

When cloning for a new project, rewrite the prompts with your product data. The code stays the same.

### Step 4: Knowledge base
For David (sales chatbot), the property knowledge is in `PROPERTY_KB` object inside `sales-chatbot.ts`. For a new project, replace this object with your product data.

---

## 11. Cost Estimates

**Per day (10 agents, daily cron cycle):**
- Morning routine (CMO brief): ~$0.02
- Content validation (Brand Guard): ~$0.001 per check
- Lead scoring: ~$0.005 per lead (quick) / $0.02 (LLM)
- David chatbot: ~$0.01 per conversation
- Weekly Council: ~$0.10

**Monthly estimate:** $10-30 for moderate usage (100 leads, 50 conversations, daily crons).

---

## 12. Exam System

Each agent has a 100-question certification exam at `tests/agent-exams/exam-{agent_name}.json`. Pass threshold: 100/100. Run with:

```bash
npx tsx tests/agent-exams/run-exams.ts --dry-run  # Preview
npx tsx tests/agent-exams/run-exams.ts --live      # Test against live API
```
