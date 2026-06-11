# Issues - 2026-06-10

## Scheduled PH daily post (panglao-ph-daily-8am): NOT PUBLISHED

**Blocker:** Browser disambiguation required, no user present (unattended run).

Three Chrome extension instances are connected:
- "פייסבוק" (deviceId 97c7d8e5-f744-4905-a49f-ab898970182a)
- "BLUE EVEREST" (deviceId 6627a787-3526-45d1-837a-083e2cb7cfe0)
- "Blue Everest" (deviceId 2935dc6d-141f-4c19-83ce-33e219d2bf40)

The system mandates explicit user selection among connected browsers before any
browser action and forbids the agent from picking one itself. With no user present
to answer, and with two similarly named "Blue Everest" devices plus a Facebook
device, selecting blindly risks posting to the wrong page/account. CLAUDE.md Rule 6
(never take any action on BluePrint Building Group / wrong account) makes a wrong
guess unacceptable, so the run halted rather than guessed.

This is the same block that stopped the 2026-06-09 run. The 2026-06-06 run was able
to proceed because device 2935dc6d ("Blue Everest") was treated as known-good, but
the safer policy is not to guess when selection is mandated and ambiguous.

**Prepared content (ready to publish once a browser is selected):**
- Market: PH, language EN, Facebook Page timeline (Blue Everest Asset Group)
- Rotation: option a (PHP 395,000 monthly income), paired with exterior/hero-aerial.jpg
- Copy (approved, verbatim from ALL_POST_COPY_V3.json image_posts[5]):
  PHP 395,000/month - verified Airbnb income.
  Only 2 villas left in Panglao.
  17-25% ROI | 65% occupancy
  BDO Bank financing available.

  WhatsApp: +639542555553
  Office: +639958565865
  primevilla.ph

**Next action for the human:** Re-run with a single Blue Everest page-admin Chrome
extension connected (or be present to pick the correct browser), then the post can
publish unchanged. Consider disconnecting the duplicate "BLUE EVEREST" / "פייסבוק"
extensions to remove the recurring ambiguity that has now blocked two runs.
