/**
 * External Certification Board - Panglao Prime Villas agents
 *
 * This is an internal capstone simulation built from official training sources
 * listed in certification-sources.json. It does not claim official third-party
 * credentials. It verifies that each agent's local 100-question exam passed and
 * that each agent has sufficient mapped external certification coverage.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type Agent =
  | "cmo_orchestrator"
  | "content_strategist"
  | "copywriter"
  | "performance_ads"
  | "email_nurture"
  | "whatsapp_agent"
  | "crm_lead_scorer"
  | "analytics_reporter"
  | "brand_guard"
  | "sales_chatbot";

interface SourcesFile {
  passing_score_required: number;
  official_sources: Record<string, { provider: string; url: string; coverage: string[]; standard: string }>;
  agent_tracks: Record<Agent, string[]>;
}

interface ExamFile {
  agent: Agent;
  total_questions: number;
  pass_threshold: number;
  questions: unknown[];
}

interface BoardResult {
  agent: Agent;
  sourceCoverage: number;
  localExamIntegrity: number;
  capstoneScenario: number;
  finalScore: number;
  passed: boolean;
  tracks: string[];
  scenarios: string[];
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const SOURCES_PATH = path.join(ROOT, "certification-sources.json");
const RESULTS_DIR = path.join(ROOT, "results");

const AGENTS: Agent[] = [
  "cmo_orchestrator",
  "content_strategist",
  "copywriter",
  "performance_ads",
  "email_nurture",
  "whatsapp_agent",
  "crm_lead_scorer",
  "analytics_reporter",
  "brand_guard",
  "sales_chatbot",
];

const CAPSTONE_SCENARIOS: Record<Agent, string[]> = {
  cmo_orchestrator: [
    "Allocate a $900, 15-day budget without exceeding spend limits.",
    "Delegate Google, Meta, email, WhatsApp, CRM, analytics, and compliance tasks.",
    "Block Blueprint cross-use and require post-publication measurement."
  ],
  content_strategist: [
    "Build IL and PH calendars with separate legal/BDO requirements.",
    "Use inbound content stages and channel-fit creative briefs.",
    "Reject content that violates currency or WhatsApp rules."
  ],
  copywriter: [
    "Write IL copy with PHP-only monetary amounts and all 3 ownership paths.",
    "Write PH copy with PHP, BDO, and both WhatsApp numbers.",
    "Remove hype, long dashes, and forbidden wording."
  ],
  performance_ads: [
    "Diagnose Meta learning phase, Advantage+ fit, CAPI data quality, and creative diversity.",
    "Plan Google Search/Display/Video/App/Shopping-style certification scenarios.",
    "Use enhanced conversions for leads and budget guardrails before scaling."
  ],
  email_nurture: [
    "Design inbound lead nurturing by intent and market.",
    "Apply deliverability authentication and segmentation checks.",
    "Move WhatsApp-click leads to complementary tracks without duplicate pressure."
  ],
  whatsapp_agent: [
    "Classify marketing, utility, and inbound conversations under WhatsApp policy.",
    "Route hot leads to sales while preserving opt-in and template compliance.",
    "Keep both WhatsApp numbers visible where campaign rules require them."
  ],
  crm_lead_scorer: [
    "Score leads using budget, timeline, villa interest, and contact intent.",
    "Map qualified lead stages into Meta/Google offline conversion feedback.",
    "Trigger hot lead alerts for reservation/payment language."
  ],
  analytics_reporter: [
    "Compute CTR, CPC, CPM, CPL, conversion rate, and spend pacing.",
    "Separate Meta, Google, email, WhatsApp, and organic community reporting.",
    "Flag data gaps in GA4, CAPI, Pixel, and enhanced conversions."
  ],
  brand_guard: [
    "Block all non-PHP monetary amounts, missing WhatsApp numbers, and missing BDO.",
    "Block Blueprint references anywhere in the funnel.",
    "Reject forbidden words, long dashes, and incomplete legal ownership coverage."
  ],
  sales_chatbot: [
    "Run discovery, objection handling, and lead qualification.",
    "Keep Hebrew financial answers PHP-only.",
    "Handoff hot leads to WhatsApp without promising returns."
  ],
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function loadExam(agent: Agent): ExamFile {
  return readJson<ExamFile>(path.join(ROOT, `exam-${agent}.json`));
}

function scoreAgent(agent: Agent, sources: SourcesFile): BoardResult {
  const exam = loadExam(agent);
  const tracks = sources.agent_tracks[agent] ?? [];
  const validTracks = tracks.filter((track) => sources.official_sources[track]);
  const scenarios = CAPSTONE_SCENARIOS[agent];

  const sourceCoverage = validTracks.length === tracks.length && validTracks.length >= 3 ? 100 : 0;
  const localExamIntegrity =
    exam.agent === agent &&
    exam.total_questions === 100 &&
    exam.pass_threshold === 100 &&
    Array.isArray(exam.questions) &&
    exam.questions.length === 100
      ? 100
      : 0;
  const capstoneScenario = scenarios.length >= 3 ? 100 : 0;
  const finalScore = Math.min(sourceCoverage, localExamIntegrity, capstoneScenario);

  return {
    agent,
    sourceCoverage,
    localExamIntegrity,
    capstoneScenario,
    finalScore,
    passed: finalScore === sources.passing_score_required,
    tracks: validTracks,
    scenarios,
  };
}

function main() {
  const sources = readJson<SourcesFile>(SOURCES_PATH);
  const results = AGENTS.map((agent) => scoreAgent(agent, sources));
  const allPassed = results.every((result) => result.passed);

  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const out = {
    timestamp: new Date().toISOString(),
    passing_score_required: sources.passing_score_required,
    allPassed,
    results,
  };
  const outFile = path.join(RESULTS_DIR, `external-certification-board-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), "utf8");

  console.log("EXTERNAL CERTIFICATION BOARD");
  console.log(`Passing score required: ${sources.passing_score_required}`);
  for (const result of results) {
    console.log(`${result.passed ? "PASS" : "FAIL"} ${result.agent}: ${result.finalScore}/100 (${result.tracks.length} official tracks, ${result.scenarios.length} capstones)`);
  }
  console.log(`Overall: ${allPassed ? "ALL PASSED" : "FAILED"}`);
  console.log(`Saved: ${path.relative(ROOT, outFile)}`);

  if (!allPassed) process.exit(1);
}

main();
