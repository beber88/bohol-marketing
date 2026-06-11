# Issues - 2026-06-04

## Scheduled Israel-market daily post (panglao-israel-daily-10am-il): HELD, NOT PUBLISHED

Today's calendar entry (Wed Jun 4) is POST 36 (AMA / CONNECT). The post was NOT published to the Israeli Facebook group. Reasons:

1. Held-draft blocker. campaign_state.json lists an open blocker: "Future Hebrew community posts need Brand Guard review - community posts 3-50 are held as drafts." Post 36 falls in 3-50 and has not been approved back into the executable queue.

2. Currency rule violation in post_36_ama.md (Hebrew copy):
   - Line 19: "94.4 מיליארד דולר" (USD reference).
   - Line 44: "PHP 5,000,000 (כ-250,000 ש\"ח)" (PHP plus an ILS conversion).
   This fails the Israeli currency rule under either active policy.

3. Unresolved policy conflict. CLAUDE.md says Israeli content must use fixed shekels only (Villa D 1,535,000 ש"ח, Villa C 1,650,000 ש"ח, reservation 9,999 ש"ח). _status/campaign_state.json says pricing_rule = "php_only_all_markets" and israel currency = "PHP_ONLY" (Villa D PHP 32,500,000, reservation PHP 200,000). These contradict. The intended currency policy for Israeli community posts must be confirmed.

### Needed to unblock
- Confirm the correct Israeli-market currency policy (shekels-only per CLAUDE.md, or PHP-only per campaign_state.json) and align both files.
- Run post 36 (and the other held drafts 3-50) through Brand Guard, fixing the currency lines to match the confirmed policy.
- Once approved, return the post to the executable queue for the next scheduled run.

No browser/Facebook action was taken. No action was taken on Blueprint Building Group.
