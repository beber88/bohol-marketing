# Issues - 2026-06-07 (panglao-ph-daily-8am scheduled run)

## BLOCKED: Browser automation permission denied - PH daily post NOT published

**Severity:** HIGH (daily PH post missed for 2026-06-07 unless re-run with a user present)

### What happened
- Autonomous scheduled run at ~08:07 PHT (Sun Jun 7, 2026).
- campaign_state.json confirmed `simulation: false` (publishing allowed).
- Two Chrome extensions connected: "BLUE EVEREST" (deviceId 6627a787-3526-45d1-837a-083e2cb7cfe0) and "פייסבוק" (deviceId 97c7d8e5-f744-4905-a49f-ab898970182a).
- With no user present to answer the mandatory multi-browser selection prompt, selected the "BLUE EVEREST" browser directly (name matches the required Blue Everest page-admin login, consistent with the 2026-06-03/04/05/06 runs). `select_browser` succeeded.
- Created a fresh MCP tab and `navigate` to https://www.facebook.com/BlueEverestGroup succeeded.
- Every subsequent interaction tool returned **"Permission denied by user"**:
  - `computer` (screenshot) - denied (tried twice)
  - `read_page` - denied
  - `get_page_text` - denied
- Because reads, screenshots, and clicks are all blocked, the post could not be composed, verified, or published.

### Why it stopped
Per the run instructions ("If the browser is not connected or not logged in, do not retry endlessly: stop and write a note to issues.md and to the run notification"), the run was halted after confirming the block is consistent across all interaction tools. No post was published. No action taken on any page.

### Likely cause / fix
- The Chrome extension is connected but is not granting interaction permission for an unattended/scheduled session (navigation allowed, interaction gated). A human likely needs to approve/keep the Claude in Chrome extension active, or the run needs to execute while a user is present to approve the permission prompts.
- Re-run `panglao-ph-daily-8am` manually with the BLUE EVEREST extension approved, OR publish the prepared post below by hand.

### Confirmations
- simulation flag verified false BEFORE any attempt.
- NO action taken on BluePrint Building Group.
- Only ONE page targeted (Blue Everest Asset Group). Nothing posted, shared, or sent.

### Prepared post for today (ready to publish - see scheduled_ph_post.json)
Rotation: 06-03 (a) -> 06-04 (b) -> 06-05 (c) -> 06-06 (a) -> today (b, tourism / 136.9%).
Image: blue-everest/public/images/ai-generated/rooftop-sunset-1.jpg

Copy (approved 136.9% PH variant, stale Villa price line removed per the documented 06-04 practice):

136.9% projected return over 5 years. Here's the villa making it happen.

Panglao Prime Villas - luxury investment between two 5-star resorts.
PHP 395,000/month verified income.
17-25% ROI | 65% occupancy | PHP 14,000 per night

BDO Bank financing available.
Reserve with PHP 200,000.

WhatsApp: +639542555553
Office: +639958565865
primevilla.ph

---

## HELD: IL Hebrew community post NOT published (panglao-israel-daily-10am-il)

**Severity:** MEDIUM (recurring hold, same as Jun 4, 5, 6 IL runs)

### Decision
Held POST 3 (post_03_ph_vs_greece). Did not publish. No browser action attempted. No action on Blueprint.

### Why
1. **Standing blocker still open** - campaign_state.json: "Future Hebrew community posts need Brand Guard review. Community posts 3-50 are held as drafts." POST 3 is in that range and not cleared into the executable queue.
2. **Currency rule conflict unresolved** - CLAUDE.md and the scheduled-task instructions require shekels only (Villa D 1,535,000, Villa C 1,650,000, reservation 9,999 ש"ח). campaign_state.json (updated 2026-06-04) requires the opposite: php_only_all_markets / PHP_ONLY, reservation PHP 200,000, no ILS/USD in IL content. POST 3 prices in shekels, so it satisfies CLAUDE.md but violates campaign_state.json. A single post cannot satisfy both. Needs human / Claude Code resolution.

### Context
- 2026-06-07 is Sunday, a valid Israeli posting day (not Shabbat). The hold is rule-based, not date-based.
- No calendar entry for Jun 7; next scheduled IL slot is Sunday Jun 8 (POST 4), which is also inside the held 3-50 range.
- Full determination in scheduled_il_post.json.

### Next action
Resolve the shekel-vs-PHP currency policy and run posts 3-50 through Brand Guard before Jun 8. If unresolved, the Jun 8 run will hold again.
