# Issues - 2026-06-06

## IL daily community post (panglao-israel-daily-10am-il): HELD, not posted

No Israeli Facebook group post was published today. This was a deliberate hold, not a failure. Four reasons, any one sufficient:

1. **Shabbat (primary).** 2026-06-06 is Saturday. The community-agent calendar rule is absolute: never post Friday, Saturday (Shabbat), or Jewish holidays. The Israeli group is a Hebrew Israeli audience.

2. **No calendar entry today.** The schedule is Sunday-Thursday only. Next IL slot: Sunday 2026-06-08, POST 4 (tax guide).

3. **Brand Guard hold on posts 3-50.** campaign_state.json carries an open MEDIUM blocker: Hebrew community posts 3-50 are held as drafts because they predate the current Israeli currency, CTA, legal-ownership, and register rules. The fallback "post next unpublished in sequence" would land on POST 4, which is inside this held range, so the fallback is blocked too.

4. **Currency rule conflict (needs human decision).** CLAUDE.md requires shekels-only Israeli content (Villa D 1,535,000 ILS, Villa C 1,650,000 ILS, reservation 9,999 ILS). campaign_state.json sets `pricing_rule: php_only_all_markets` with the same villas priced in PHP. These directly contradict each other. No priced Israeli post should go out until this is resolved.

### Action needed before the next IL run (Sun Jun 8)
- Resolve the shekel vs PHP currency rule for Israeli content (update CLAUDE.md or campaign_state.json so they agree).
- Clear posts 3-50 through Brand Guard review and return approved posts to the executable queue.
- Note: `_queue/community-agent/IMAGE_MAP.md` referenced by the task does not exist in the project; image mapping is unavailable for these posts.

No action was taken on Blueprint Building Group. No browser write actions were taken.
