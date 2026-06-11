# Issues - 2026-06-09 Scheduled PH Daily Post

## BLOCKED: Cannot disambiguate connected Chrome browser (no user present)

The scheduled PH daily Facebook post could NOT be published.

### What happened
- Campaign state checked: `simulation: false` (publish mode), so a real post was intended.
- Content was selected and validated (see below).
- `list_connected_browsers` returned THREE connected Chrome extensions:
  1. "Blue Everest" (deviceId 2935dc6d-141f-4c19-83ce-33e219d2bf40)
  2. "BLUE EVEREST" (deviceId 6627a787-3526-45d1-837a-083e2cb7cfe0)
  3. "פייסבוק" (deviceId 97c7d8e5-f744-4905-a49f-ab898970182a)
- Selecting a browser when multiple are connected requires explicit user choice. This was an unattended scheduled run, so no selection could be obtained.

### Why I did not guess
- Publishing to a Facebook Page is a public, irreversible action.
- I could not verify which browser session is logged in as the Blue Everest page admin (Bar Gvili) versus any other account.
- CLAUDE.md rule 6 is absolute: never take any action on or near Blueprint Building Group. Guessing the wrong session risks violating this.

### Action needed from a human
- Re-run the task when only the correct Blue Everest browser is connected, OR be present to select the browser, OR reduce to a single connected Chrome extension logged in as Bar Gvili.

### Content that was ready to post (option c, JW Marriott corridor)
- Image: blue-everest/public/images/ai-generated/pool-night.jpg
- Rotation rationale: 6/07 and 6/08 used option (b) rooftop-sunset; 6/06 used option (a); 6/05 used option (c). Chose (c) to vary copy/image and avoid spam patterns.
- Copy is stored in scheduled_ph_post.json (status: NOT_PUBLISHED).

---

# Issues - 2026-06-09 Scheduled IL (Hebrew) Community Post

## HELD: Did not publish (rule-based hold, consistent with Jun 4-8)

The scheduled Israel-market Hebrew group post was NOT published. This is a rules decision, independent of platform/browser availability, so no Chrome session was opened.

### Blockers (all still open as of campaign_state.json last_updated 2026-06-09T10:00)
1. BRAND GUARD HOLD: campaign_state.json blocker "Future Hebrew community posts need Brand Guard review" holds posts 3-50 as drafts, out of the executable queue. No Jun 9 calendar entry exists, so the fallback "next unpublished in sequence" lands inside this held range.
2. CURRENCY CONFLICT: CLAUDE.md/task require shekels-only for Israeli content; campaign_state.json sets pricing_rule "php_only_all_markets" and israel currency "PHP_ONLY". Direct contradiction; copy may not be edited ("NEVER improvise copy").
3. MISSING IMAGE_MAP: _queue/community-agent/IMAGE_MAP.md does not exist, so no mapped image can be selected.

### Action needed from a human / Claude Code
- Resolve the shekel-vs-PHP currency rule (align CLAUDE.md, the task file, and campaign_state.json).
- Run posts 3-50 through Brand Guard and return approved drafts to the queue.
- (Re)create IMAGE_MAP.md.
- Reconcile community_agent next_post pointer (state shows 36 / 2026-06-04) with the calendar.

No action of any kind was taken on or near Blueprint Building Group.
