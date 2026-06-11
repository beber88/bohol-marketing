/**
 * Operational activation sweep for all marketing agents.
 *
 * This avoids live LLM calls when ANTHROPIC_API_KEY is missing. It verifies
 * registry presence, prompt availability, exam readiness, and deterministic
 * execution paths where available. Full live dispatch can be run after adding
 * ANTHROPIC_API_KEY and a local server.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvConfig } from "@next/env";
import { AGENT_SPECS } from "../../src/lib/agents/registry";
import { performanceAds } from "../../src/lib/agents/performance-ads";
import { brandGuard } from "../../src/lib/agents/brand-guard";

type Agent = keyof typeof AGENT_SPECS;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
loadEnvConfig(ROOT);
const EXAMS = path.join(ROOT, "tests", "agent-exams");
const RESULTS = path.join(EXAMS, "results");

const agents = Object.keys(AGENT_SPECS) as Agent[];

async function main() {
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const activation: Array<Record<string, unknown>> = [];

  for (const agent of agents) {
    const spec = AGENT_SPECS[agent];
    const promptPath = path.join(ROOT, "src", "prompts", spec.promptFile);
    const examPath = path.join(EXAMS, `exam-${agent}.json`);

    let status = "READY";
    let deterministicRun: unknown = null;

    if (!fs.existsSync(promptPath)) status = "READY_WITH_FALLBACK_PROMPT";
    if (!fs.existsSync(examPath)) status = "BLOCKED_MISSING_EXAM";

    if (agent === "brand_guard") {
      deterministicRun = brandGuard.validateContent(
        "Villa D: PHP 32,500,000. BDO Bank financing. WhatsApp (Marketing): +639542555553\nWhatsApp (Office): +639958565865",
        "en",
        "PH"
      );
    }

    if (agent === "performance_ads") {
      deterministicRun = await performanceAds.execute({
        context: {
          campaigns: [
            {
              campaignId: "activation-meta-1",
              campaignName: "Activation Meta High CTR",
              platform: "meta",
              status: "active",
              metrics: {
                impressions: 10000,
                clicks: 420,
                ctr: 4.2,
                cpc: 0.8,
                cpm: 3.2,
                cpl: 20,
                spend: 80,
                leads: 4,
                conversions: 4
              }
            }
          ],
          dailyBudget: 60,
          totalBudgetRemaining: 850
        }
      });
    }

    activation.push({
      agent,
      displayName: spec.displayName,
      status,
      liveLLMReady: hasAnthropic,
      prompt: fs.existsSync(promptPath),
      exam: fs.existsSync(examPath),
      deterministicRun,
      note: hasAnthropic
        ? "Ready for live dispatch."
        : "Operationally activated; live LLM dispatch requires ANTHROPIC_API_KEY."
    });
  }

  if (!fs.existsSync(RESULTS)) fs.mkdirSync(RESULTS, { recursive: true });
  const outFile = path.join(RESULTS, `agent-activation-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        allAgents: agents.length,
        liveLLMReady: hasAnthropic,
        activation
      },
      null,
      2
    ),
    "utf8"
  );

  console.log("AGENT ACTIVATION SWEEP");
  console.log(`Agents: ${agents.length}`);
  console.log(`Live LLM ready: ${hasAnthropic ? "YES" : "NO - ANTHROPIC_API_KEY missing"}`);
  for (const item of activation) {
    console.log(`${item.status} ${item.agent}`);
  }
  console.log(`Saved: ${path.relative(EXAMS, outFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
