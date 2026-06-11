# Issues - 2026-06-11

## Daily IL (Hebrew) community post NOT published (same browser disambiguation block)

The 15:00 PHT / 10:00 IL scheduled Israel-market post (POST 37, the engagement
poll "סקר: מה מונע מכם להשקיע?") could not be published for the SAME reason as
the PH run below: three Chrome extensions are connected with ambiguous
identities and no user was present to select the correct one:

- "Blue Everest" (2935dc6d-141f-4c19-83ce-33e219d2bf40) - the known-good admin device
- "BLUE EVEREST" (6627a787-3526-45d1-837a-083e2cb7cfe0) - "Permission denied by user" on 06-07
- "פייסבוק" (97c7d8e5-f744-4905-a49f-ab898970182a)

The browser MCP mandates explicit user browser selection and forbids
auto-picking. Auto-selecting risks posting to the wrong account, which could
violate CLAUDE.md Rule 6. Per the task spec ("stop and report rather than
guessing"), the run stopped without posting.

The post content is fully prepared and rule-checked in
_completed/2026-06-11/scheduled_il_post.json and only needs an attended run to
select the "Blue Everest" device and publish to the group
https://www.facebook.com/groups/investment.ph.il/ . Target image:
EXTERIOR - D5/LATEST RENDERS - EXTERIOR/REAR 1 ENHANCED.png

Fix is identical to the PH note: when a user is next present, either run the
post manually selecting "Blue Everest", or disconnect the two extra Chrome
extensions so only the correct admin browser remains connected.

---

## Daily PH Facebook post NOT published (browser disambiguation block)

The 08:00 PHT scheduled PH post could not be published because three Chrome
extensions are connected with ambiguous identities and no user was present to
select the correct one:

- "Blue Everest" (2935dc6d-141f-4c19-83ce-33e219d2bf40) - published successfully 06-03/04/05/08
- "BLUE EVEREST" (6627a787-3526-45d1-837a-083e2cb7cfe0) - "Permission denied by user" on 06-07
- "פייסבוק" (97c7d8e5-f744-4905-a49f-ab898970182a)

The browser MCP mandates explicit user browser selection and forbids
auto-picking. Auto-selecting risks posting to the wrong account, which could
violate CLAUDE.md Rule 6 (never touch Blueprint Building Group). Per the task
spec ("stop and report rather than guessing"), the run stopped without posting.

This is the THIRD consecutive blocked PH post (06-09, 06-10, 06-11). The post
content is fully prepared and rule-checked in scheduled_ph_post.json and only
needs an attended run to select the correct browser and publish.

### Recommended fix
When a user is next present, either (a) run the post manually selecting the
"Blue Everest" device, or (b) disconnect the two extra Chrome extensions
("BLUE EVEREST" and "פייסבוק") so only the correct Blue Everest admin browser
remains connected, which would let the unattended scheduled run publish without
ambiguity.

### Prepared post (rotation c, ready to publish)
- Image: blue-everest/public/images/ai-generated/pool-night.jpg
- Copy: image_posts[13] from ALL_POST_COPY_V3.json (verbatim, prices correct)
