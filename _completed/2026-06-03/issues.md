# Issues - 2026-06-03 (panglao-ph-daily-8am run)

No platform blocks. PH daily page post published successfully.

## DATA INTEGRITY FLAG (not blocking, needs Claude Code action)
The approved PH copy file `assets/ads/v3_post_copy/ALL_POST_COPY_V3.json` lists outdated villa prices:
- v3 copy: Villa D PHP 28,000,000 | Villa C PHP 30,000,000
- Authoritative (CLAUDE.md + _status/campaign_state.json): Villa C PHP 35,000,000 | Villa D PHP 32,500,000

Most PH post variants in the v3 file therefore carry a stale price. For today's run I deliberately
selected the only price-free PH variant (image_posts[5], "PHP 395,000/month" income angle) so nothing
incorrect was published. Future price-bearing PH posts will publish wrong prices unless the v3 copy file
is regenerated to match current pricing. Recommend Claude Code update ALL_POST_COPY_V3.json (and the
PH ad-copy .txt files under assets/ads/, which also show PHP 28M and a single WhatsApp number) before the
next price-bearing PH post is scheduled.
