# GO-LIVE CHECKLIST - Panglao Prime Villas Campaign

Complete these steps IN ORDER. Do not skip to the next section until all items in the current section are checked.

---

## Phase 1: API Keys (5 minutes per key)

- [ ] **Brevo API Key**
  1. Go to https://app.brevo.com → Settings → SMTP & API → API Keys
  2. Click "Generate a new API key"
  3. Copy the key
  4. Open `/Users/admin/Downloads/Bohol Marketing/blue-everest/.env.local`
  5. Paste after `BREVO_API_KEY=`
  6. Run: `cd blue-everest && npx tsx scripts/setup-brevo.ts`
  7. Verify: templates created in Brevo dashboard

- [ ] **WATI API Key**
  1. Go to https://app.wati.io → Settings → API Keys
  2. Copy the API key
  3. Paste into `.env.local` after `WATI_API_KEY=`
  4. Run: `cd blue-everest && npx tsx scripts/setup-wati.ts`
  5. Verify: templates visible in WATI dashboard

- [ ] **Meta Access Token**
  1. Go to https://developers.facebook.com
  2. Select your app (or create one)
  3. Go to Tools → Graph API Explorer
  4. Select permissions: `ads_management`, `pages_manage_posts`, `pages_read_engagement`
  5. Click "Generate Access Token"
  6. Paste into `.env.local` after `META_ACCESS_TOKEN=`
  7. Note: this token expires in ~1 hour. For long-lived token, exchange it via the API.

## Phase 2: Platform Setup (30 minutes total)

- [ ] **Upload Videos to Meta Ads Manager**
  Follow: `scripts/meta-video-upload-guide.md`
  - Download 6 videos from Google Drive
  - Upload to Ads Manager → Media Library
  - Verify all 6 appear with correct names

- [ ] **Create Google Ads Campaigns**
  Follow: `npx tsx scripts/setup-google-ads.ts` (prints the guide)
  - Campaign 1: PPV - Israel Search ($13/day)
  - Campaign 2: PPV - Philippines Search ($9/day)
  - Campaign 3: PPV - Korea Search ($10/day)
  - Set all to PAUSED initially

- [ ] **Join Facebook Groups (Tier 1 - 8 groups)**
  Follow: `BOHOL Project/_queue/2026-05-25/tasks_group_joins.json`
  - Open each Tier 1 group URL
  - Click Join (paste join template for private groups)
  - Check posting rules after joining

## Phase 3: Verification (15 minutes)

- [ ] **Meta Pixel firing**
  - Open https://primevilla.ph in a browser
  - Open Meta Events Manager (business.facebook.com/events_manager2)
  - Verify PageView event fires

- [ ] **Google Analytics tracking**
  - Open https://primevilla.ph
  - Open GA4 Real-Time report (analytics.google.com)
  - Verify your visit appears

- [ ] **Chat with David**
  - Go to https://blue-everest.com/chat
  - Ask "How much is Villa D?"
  - Verify David responds naturally (not JSON, not robotic)
  - Ask in Hebrew "כמה עולה וילה D?"
  - Verify Hebrew response with ILS pricing

- [ ] **WhatsApp links work**
  - Click WhatsApp Marketing button on primevilla.ph
  - Click WhatsApp Office button
  - Verify both open WhatsApp

- [ ] **Dashboard loads**
  - Go to https://blue-everest.com/dashboard
  - Check all sections load without errors
  - Verify Publishing Calendar shows posts
  - Verify Agent Reports show activity

## Phase 4: GO LIVE

- [ ] **Turn off simulation mode**
  - Open `BOHOL Project/_status/campaign_state.json`
  - Change `"simulation": true` to `"simulation": false`
  - Change `"phase": "PRE_LAUNCH"` to `"phase": "AWARENESS"`
  - Set `"campaign_day": 1`
  - Set `"start_date": "2026-MM-DD"` (today's date)
  - Set `"go_live_date": "2026-MM-DD"` (today's date)

- [ ] **Enable Google Ads campaigns**
  - Go to ads.google.com
  - Enable all 3 campaigns (change from Paused to Enabled)

- [ ] **Publish first organic post**
  - Go to facebook.com/BlueEverestGroup
  - Post the Day 1 content (AI_PH_TOURISM or AI_IL_GROUP_TOURISM)
  - Post to first joined Facebook groups

- [ ] **Send first WhatsApp broadcast**
  - Go to app.wati.io
  - Create broadcast to existing contacts
  - Use welcome template

## Phase 5: Monitor (Day 1)

- [ ] At 12:00 PHT: Check Meta Ads delivery status
- [ ] At 15:00 PHT: Check Google Ads impressions
- [ ] At 18:00 PHT: Check for any new leads in dashboard
- [ ] At 21:00 PHT: Review Day 1 metrics in dashboard → Agent Reports

---

## Emergency Contacts

- Meta Ads issues: business.facebook.com/help
- Google Ads issues: ads.google.com/help
- Technical issues: Open Claude Code in the blue-everest project
- WhatsApp Marketing: +639542555553
- WhatsApp Office: +639958565865