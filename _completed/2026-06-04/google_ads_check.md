# Google Ads Check - 2026-06-04

## Status

Google Ads is not verified live.

Meta is verified live and spending. Google Ads currently has a clean import file, but there is no proof that the campaigns were imported into Google Ads Editor, posted to Google Ads, enabled, approved, or delivering traffic.

## Import File QA

- File checked: `blue-everest/scripts/google-ads-import.csv`
- Rows: 18
- Columns: 21
- Campaigns: `PPV - Israel Search`, `PPV - Philippines Search`
- Campaign status in CSV: `Paused`
- Daily budget total in file: 22 account-currency units per day
- Validation result: PASS
- Issues found: 0

The file has no Korea campaign, no old `primevilla.ph` URLs, no shekel or dollar copy, no forbidden currency references in the ad text, and no headline/description/path length violations.

## Current Blockers

1. Google Ads API credentials are not configured in production or locally, so live status cannot be verified by API.
2. Browser access to `https://ads.google.com/aw/overview?ocid=4031838704` redirects to the Google sign-in screen, so the Google Ads UI error cannot be inspected until an authenticated session is available.
3. Historical project notes mention possible Google Ads advertiser verification pending for customer `4031838704`.
4. The CSV campaigns are intentionally `Paused`, so importing the file alone will not start spend until the campaigns are enabled and posted.

## Most Likely Causes Of The Visible Google Ads Error

1. Advertiser verification pending.
2. Billing or payment profile not active.
3. Google Ads Editor is still using an older CSV/import attempt.
4. Campaigns imported but not posted via `Post Changes`.
5. Campaigns posted but still paused.
6. Ad or asset disapproval inside the Google Ads UI.

## Required Next Step

Inspect the exact Google Ads error text or screenshot from the account UI. If the error is advertiser verification or billing, it must be resolved in the Google Ads account before the campaigns can run. If the error is an import error, use the corrected CSV at `blue-everest/scripts/google-ads-import.csv`.

No spend or live Google Ads change was made during this check.

## Browser Check

Attempted to open Google Ads customer `4031838704`.

Result before login: redirected to Google sign-in with the title `Google Ads - כניסה לחשבון` and the prompt `המשך אל Google Ads`.

After the user logged in, the account opened successfully.

## Live Google Ads Findings

- Account opened: `Panglao Prime Villas - Google Ads`
- Customer/account context in URL: `__c=4031838704`
- UI account currency: PHP
- Date range checked: May 5 - June 3, 2026
- Clicks: 0
- Impressions: 0
- Cost: PHP 0.00
- Conversions: 0.00

The active campaigns in the account are not the corrected CSV campaigns. The account currently shows:

1. `Panglao PV - Philippines Brand`, Active, PHP 9.00/day, Search, 0 clicks, 0 impressions, status issue: no ad groups.
2. `Panglao PV - Korea Brand`, Active, PHP 10.00/day, Search, 0 clicks, 0 impressions, status issue: no ad groups.
3. `Panglao PV - Israel Brand`, Active, PHP 13.00/day, Search, 0 clicks, 0 impressions, status issue: no ad groups.

Google Ads account diagnostics show all three as not eligible with: `Campaign has no ad groups`.

The corrected campaign names from `blue-everest/scripts/google-ads-import.csv` are not present in the live campaign table:

- `PPV - Israel Search`: not present.
- `PPV - Philippines Search`: not present.

## Upload History

Opened Tools > Bulk actions > Uploads.

Findings:

- There is a pending preview from June 2, 2026 at 12:42:50 with `1 valid change` and `0 errors`.
- That pending change is only: add campaign `Test Campaign`.
- It is not related to Panglao Prime Villas and should not be approved as a campaign fix.
- Previous uploads on June 2 show errors and one successful upload with 3 changes, which likely created the current empty Brand campaigns.

## UI Issue

The red Google Ads UI error (`Something went wrong, reload Google Ads`) was resolved by pressing Reload. It was not the delivery blocker.

Google Ads also displays an ad blocker warning: `Google Ads can't work when you're using an ad blocker.` This can interfere with UI work but is separate from the zero-delivery campaign structure problem.

## Current Root Cause

Google Ads is not continuing on schedule because the live account has active Search campaigns with no ad groups, no keywords, and no ads. Therefore they are not eligible to serve and cannot generate impressions, clicks, or leads.

There is also a forbidden Korea campaign present in the live account.

## Required Fix

1. Do not approve the pending `Test Campaign` upload.
2. Pause or remove `Panglao PV - Korea Brand`.
3. Replace or repair the live Google Ads structure with only the approved IL and PH Search campaigns.
4. Because the account currency is PHP, set Google budgets in PHP, not USD.
5. Add ad groups, keywords, and responsive search ads from the approved PHP-only campaign file.
6. Verify impressions after approval/review.

## Repair Executed

After the user approved the live Google Ads upload on 2026-06-04, the account was repaired in the browser.

Applied changes:

- `google-ads-repair-upload.csv`: 19 changes applied successfully, 5 campaign-level rows failed. The successful changes added the IL/PH ad groups and keywords.
- `google-ads-repair-upload-v4.csv`: 2 changes applied successfully, 0 errors. This added the two responsive search ads.
- `Panglao PV - Korea Brand`: paused manually because Korea is outside approved campaign scope.

Verified live state after repair:

- `IL - Investment Keywords`: active and eligible under `Panglao PV - Israel Brand`.
- `PH - Buyer Intent`: active and eligible under `Panglao PV - Philippines Brand`.
- `PH - Investment Intent`: active and eligible under `Panglao PV - Philippines Brand`.
- Two responsive search ads are active but pending Google review.
- Several Hebrew keywords show low search volume. Some PH keywords are eligible.
- Korea campaign is paused.
- Current live Google Ads budget after pausing Korea: PHP 22/day total.

Remaining Google Ads risks:

- Ads will not serve until Google review completes.
- Current IL/PH budget is extremely low for lead generation.
- Budget increases require explicit approval because they change live spend.
- The old pending June 2 `Test Campaign` preview is still unrelated and should not be approved.
