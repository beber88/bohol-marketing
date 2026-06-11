# Issues - 2026-06-08 (Israel daily community post run)

Run: `panglao-israel-daily-10am-il` (15:00 PHT / 10:00 Israel time)
Outcome: **Did NOT publish.** Stopped and reported per the run rule ("if anything is ambiguous, stop and report rather than guessing").

## What was scheduled
- Calendar (`_queue/community-agent/calendar.md`, Week 2): **Sunday June 8 -> POST 4**, "מס נדל\"ן בפיליפינים" (tax guide, EDUCATE).
- Copy file: `_queue/community-agent/posts/post_04_tax_guide.md`.
- `simulation: false` (live).

## Why it was not published

1. **Brand Guard hold (active blocker).** `_status/campaign_state.json` carries an active MEDIUM blocker: posts **3-50 are held as drafts** because they "were authored before the current Israeli currency, CTA, legal ownership, and register rules," with next action "Revise and approve each draft through Brand Guard before returning it to the executable queue." POST 4 is inside this held range, so it is not in the executable queue.

2. **Currency rule contradiction (the decisive issue).**
   - The scheduled-task instructions and `CLAUDE.md` Rule 1 require **shekels only** for Israeli content (Villa D 1,535,000 ש"ח, etc.). POST 4 is written entirely in shekels.
   - But `campaign_state.json` `content_rules.israel` now sets `currency: PHP_ONLY`, `pricing_rule: php_only_all_markets`, with the explicit note: **"Do not show ILS, USD, or daily FX conversions in campaign copy."**
   - These two authoritative sources directly conflict. Publishing POST 4 as-is would breach the live PHP_ONLY rule; rewriting the copy to PHP would violate the golden rule "NEVER improvise copy." Either path is wrong, so the run stopped.

3. **No image mapping.** `_queue/community-agent/IMAGE_MAP.md` is **empty (0 bytes)**. There is no mapped image for POST 4, so an image could only be chosen by guessing.

4. **Sequence pointers out of sync.** `campaign_state.json` `community_agent` shows `posts_published: 2`, `next_post: 36`, `next_post_date: 2026-06-04`, while the calendar shows POST 36 already used on Jun 4 and POST 4 due Jun 8. The state pointer does not match the calendar.

## Recommended next actions (for human / Claude Code)
1. **Decide the IL currency rule** and make `CLAUDE.md` + the scheduled-task instructions + `campaign_state.json` agree (shekels-only vs PHP-only). This blocks every Hebrew post.
2. Run POST 4 (and the rest of 3-50) through **Brand Guard** and return approved posts to the executable queue.
3. **Populate `IMAGE_MAP.md`** so each post has a defined image.
4. Reconcile the `community_agent` `next_post` pointer and `posts_published` count with the calendar.

## Confirmations
- No Chrome/browser session was opened; nothing was posted to the Israeli group.
- **No action of any kind was taken on BluePrint Building Group.**
- Today's separate PH market run (`scheduled_ph_post.json`) published normally and is unaffected by this hold.
