import { COMMUNITY_POSTS } from "@/lib/data/community-posts-data";
import { quickValidate } from "@/lib/agents/brand-guard";

type AuditRow = {
  id: number;
  title: string;
  scheduled: string;
  status: string;
  passed: boolean;
  violations: Array<{
    rule: string;
    severity: string;
    description: string;
    location?: string;
  }>;
};

const includeAll = process.argv.includes("--all");
const targetDateArg = process.argv.find((arg) => arg.startsWith("--date="));
const targetDate =
  targetDateArg?.split("=")[1] ?? process.env.QA_DATE ?? new Date().toISOString().slice(0, 10);

const rows: AuditRow[] = COMMUNITY_POSTS
  .filter((post) => includeAll || (post.status === "ready" && post.scheduled >= targetDate))
  .map((post) => {
    const result = quickValidate(post.hebrewCopy, "he", "IL");
    return {
      id: post.id,
      title: post.title,
      scheduled: post.scheduled,
      status: post.status,
      passed: result.passed && result.violations.length === 0,
      violations: result.violations.map((violation) => ({
        rule: violation.rule,
        severity: violation.severity,
        description: violation.description,
        location: violation.location,
      })),
    };
  });

const failed = rows.filter((row) => !row.passed);

console.log(
  JSON.stringify(
    {
      audited_at: new Date().toISOString(),
      target_date: targetDate,
      scope: includeAll ? "all_posts" : "ready_posts_from_target_date",
      total: rows.length,
      passed: rows.length - failed.length,
      failed: failed.length,
      failures: failed,
    },
    null,
    2
  )
);

if (failed.length > 0) {
  process.exitCode = 1;
}

