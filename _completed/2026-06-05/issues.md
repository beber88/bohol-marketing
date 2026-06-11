# Issues - 2026-06-05 (Scheduled Israel-market Hebrew post)

## RESULT: NOT PUBLISHED - blocked by content/state conflict (held draft + currency rule change)

### What was scheduled
- Calendar (`_queue/community-agent/calendar.md`) maps Thu Jun 5 -> POST 3
  ("למה פיליפינים ולא יוון? 10 מספרים", file `posts/post_03_ph_vs_greece.md`).

### Why it was not published
Golden rule (CLAUDE.md): ALWAYS check `_status/campaign_state.json` before any live
action. Doing so revealed a direct, unresolved conflict:

1. CURRENCY CONFLICT
   - POST 3 prices the villa in shekels: "1,535,000 ש\"ח" (also 960,000 / 384,000 NIS refs).
   - Current campaign_state.json (last_updated 2026-06-04) sets:
       pricing_rule: "php_only_all_markets"
       content_rules.israel.currency: "PHP_ONLY" (villa_d "PHP 32,500,000", reservation "PHP 200,000")
       pricing_note: "All campaign-facing property prices and monetary claims use PHP only.
                      Do not show ILS, USD, or daily FX conversions in campaign copy."
   - The task brief / older CLAUDE.md still describe shekel-only Israeli pricing.
     These two sources contradict each other. The state file is the more recent
     authority and is the one CLAUDE.md tells the execution agent to check before acting.

2. POST IS A HELD DRAFT (not in executable queue)
   - campaign_state.json blocker (severity MEDIUM):
       "Community posts 3-50 are held as drafts because they were authored before the
        current Israeli currency, CTA, legal ownership, and register rules."
       next_action: "Revise and approve each draft through Brand Guard before returning
        it to the executable queue."
   - POST 3 falls squarely in the held range (3-50) and uses the superseded shekel pricing.

Because simulation is false, publishing POST 3 would push non-compliant pricing live to
the Israeli Facebook group. The task brief instructs: "If a platform block appears or
anything is ambiguous, stop and report rather than guessing." This is that case.

### What is needed to unblock (human / Claude Code)
- Confirm the authoritative Israeli pricing rule: shekels (per task brief / old CLAUDE.md)
  OR PHP-only (per current campaign_state.json). These cannot both be true.
- Run POST 3 (and the other held drafts 3-50) through Brand Guard review and return the
  approved version to the executable queue.
- Once a compliant, approved POST 3 exists, re-run this scheduled task to publish.

### Note on Chrome
Chrome connection was not exercised because the content-level block above stops the run
before any posting step. No browser action was taken. No action taken on any other page.
NO action taken on BluePrint Building Group.
