# Meta Webhook And Permissions Status - 2026-06-05

Collected at: 2026-06-05T18:52:50+08:00

## Production Webhook

- Callback URL: https://blue-everest.com/api/marketing/webhooks/meta
- Verify token: blueeverest_webhook_2026
- Verification test: PASS
- Test response: ok_2026

## Vercel Environment

- META_APP_ID: configured
- META_WEBHOOK_VERIFY_TOKEN: configured
- META_PAGE_ACCESS_TOKEN: configured, but missing required Messenger/webhook permissions
- META_ACCESS_TOKEN: configured, but expired
- META_APP_SECRET: missing locally

## Current Token Permission Check

META_ACCESS_TOKEN:
- Status: expired
- Graph API error: code 190, subcode 463
- Expired at: Thursday, 28-May-26 23:00:00 PDT

META_PAGE_ACCESS_TOKEN currently has:
- email
- pages_show_list
- ads_management
- ads_read
- business_management
- pages_read_engagement
- pages_manage_ads
- pages_manage_posts
- public_profile

Missing required permissions/features:
- pages_messaging
- pages_manage_metadata
- pages_read_user_content
- Page Public Content Access

## Page Webhook Subscription

Status: BLOCKED_BY_META_PERMISSIONS

Attempting to subscribe the Page to messages, messaging_postbacks, and feed fails because the current Page token lacks:
- pages_messaging, required for messages and messaging_postbacks
- pages_manage_metadata, required for feed subscription and subscribed_apps management

## Live Meta Metrics

Date preset: last_7d

- Impressions: 325,552
- Clicks: 10,587
- Spend: PHP 8,749.23
- Leads: 0
- CTR: 3.25%
- CPC: PHP 0.83

Campaign spend:
- IL-1 Awareness - Panglao Prime Villas: PHP 5,023.08, 2,101 clicks, 0 leads
- PH-1 Awareness - Panglao Prime Villas: PHP 3,486.51, 8,424 clicks, 0 leads
- Post: "Skyscanner #8 trending destination 2025 - only...": PHP 149.63, 29 clicks, 0 leads
- [6/4/2026] Promoting Blue Everest Asset Group: PHP 90.01, 33 clicks, 0 leads

## Required Manual Meta Developers Action

Meta Developers UI must be completed manually, or with browser control that has click/accessibility permission:

1. Open https://developers.facebook.com/apps/
2. Select app: Blue Everest Asset Group, App ID 1468125391191273
3. Request/approve:
   - pages_messaging
   - pages_manage_metadata
   - pages_read_user_content
   - Page Public Content Access
4. Add or configure Webhooks product:
   - Object: Page
   - Callback URL: https://blue-everest.com/api/marketing/webhooks/meta
   - Verify Token: blueeverest_webhook_2026
   - Fields: messages, messaging_postbacks, feed
5. Generate a new Page access token with the required permissions.
6. Update Vercel Production:
   - META_PAGE_ACCESS_TOKEN
   - META_ACCESS_TOKEN
7. Redeploy production and retest:
   - webhook verification
   - Page subscribed_apps
   - Messenger inbound event
   - feed/comment event

## Blocker

The code and production webhook are ready, but the automation cannot receive Messenger/feed events until Meta grants the missing permissions and a fresh token is installed.

## Update - 2026-06-05T18:53:11+08:00

Completed actions:

- Generated a real Page access token for Blue Everest Asset Group, Page ID 1091251924067685, from the existing valid long-lived user token.
- Verified the new token with Meta debug_token:
  - App: Blue Everest Asset Group
  - App ID: 1468125391191273
  - Token type: PAGE
  - Expiration: none, `expires_at: 0`
  - Valid: true
- Updated Vercel Production environment variables:
  - META_ACCESS_TOKEN
  - META_PAGE_ACCESS_TOKEN
- Confirmed META_WEBHOOK_VERIFY_TOKEN exists in Vercel Production.
- Redeployed production:
  - Deployment ID: dpl_2p1aoHpMwZEXBMgPiXdxbzuyBGwd
  - Aliased production domain: https://blue-everest.com
- Verified production webhook challenge:
  - URL: https://blue-everest.com/api/marketing/webhooks/meta
  - Result: PASS, HTTP 200
- Verified live Meta metrics endpoint after redeploy:
  - URL: https://blue-everest.com/api/marketing/metrics/meta
  - Result: PASS, HTTP 200
- Configured Meta Developers Webhooks dashboard:
  - Product/object: Page
  - Callback URL: https://blue-everest.com/api/marketing/webhooks/meta
  - Verify token: configured and saved
  - Subscribed fields:
    - feed
    - messages
    - messaging_postbacks

Remaining blocker:

- The installed Page token is valid and non-expiring, but still lacks:
  - pages_messaging
  - pages_manage_metadata
  - pages_read_user_content
- Graph API check of `/{page_id}/subscribed_apps` still fails with:
  - `(#200) Requires pages_manage_metadata permission to manage the object`
- Therefore, the Meta Dashboard field subscriptions are configured, but Page-level subscribed_apps management remains blocked until Meta grants or exposes `pages_manage_metadata` for this app/token.

## Update - 2026-06-05T19:21:35+08:00

Status: RESOLVED_FOR_BLUE_EVEREST_PAGE

Completed actions:

- Re-authorized the Meta app through OAuth for Bar Gvili.
- Selected only the Blue Everest Asset Group Page, Page ID 1091251924067685.
- Did not select or modify BluePrint Building Group.
- Selected only the Blue Everest Asset Group business portfolio, Business ID 1091269377399273.
- Confirmed the new user token includes:
  - pages_messaging
  - pages_manage_metadata
  - pages_read_user_content
  - pages_show_list
  - pages_read_engagement
  - pages_manage_posts
  - pages_manage_ads
  - ads_management
  - ads_read
  - business_management
- Generated a fresh Blue Everest Page access token.
- Verified Page token identity:
  - Page ID: 1091251924067685
  - Page name: Blue Everest Asset Group
- Subscribed the Blue Everest Page to the Meta app through Graph API:
  - feed
  - messages
  - messaging_postbacks
- Graph API returned `success: true` for Page subscription.
- Verified `/{page_id}/subscribed_apps` now returns app ID 1468125391191273 with subscribed fields:
  - feed
  - messages
  - messaging_postbacks
- Updated Vercel Production environment variables:
  - META_ACCESS_TOKEN
  - META_PAGE_ACCESS_TOKEN
- Redeployed Production:
  - Deployment ID: dpl_Cpg8zg1Nz3AFiDpoYDPSES2qnJsu
  - Production domain: https://blue-everest.com
- Verified production webhook challenge:
  - HTTP 200
  - Response: ok_2026
- Verified production Meta metrics endpoint:
  - HTTP 200
  - last_7d totals: 325,564 impressions, 10,589 clicks, PHP 8,749.45 spend, 0 leads
- Verified production webhook POST route:
  - HTTP 200
  - Response: `{"received":true,"processed":0}`

Remaining operational risk:

- Meta webhook connectivity is now active for the Blue Everest Page, but live lead automation still depends on production Supabase insert permissions for leads and activities.
- Vercel Production currently has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, but no SUPABASE_SERVICE_ROLE_KEY. The code falls back to the anon key, so the next real inbound event must confirm that RLS permits the required inserts.
- Current Meta campaign metrics still show 0 leads despite 10,589 clicks in the last 7 days, so the next operational check should be a real inbound Messenger/comment test and Supabase lead insert verification.
