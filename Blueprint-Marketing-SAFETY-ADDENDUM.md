# BLUEPRINT MARKETING AUTOMATION
## SAFETY ADDENDUM & FULL FACEBOOK INTEGRATION GUARANTEE
### Read BEFORE executing the main spec

---

## CRITICAL: NON-DESTRUCTIVE PRINCIPLES

**Claude Code MUST follow these rules. No exceptions.**

### Rule 1: NEVER overwrite existing infrastructure

Before creating anything, run pre-flight checks to detect what already exists:

```bash
# Check 1: Existing Supabase projects
# Bar already has Supabase projects for Maintenance OS, Blueprint Finance, AI-PMS
# Ask Bar: which Supabase project to use? Options:
# A) Create a brand new Supabase project for marketing
# B) Add tables to existing Blueprint project under a 'marketing' schema
# 
# DEFAULT: Option A (new isolated project) unless Bar instructs otherwise

# Check 2: Existing Vercel projects
vercel projects list
# Look for: blueprint-*, maintenance-os, ai-pms-app
# DO NOT deploy to any existing project. Create new one: blueprint-marketing

# Check 3: Existing domains
# Check Vercel domain settings BEFORE assigning marketing.blueprint-ph.com
# If subdomain already exists, ask Bar before changing

# Check 4: Existing Facebook integrations
# If a Meta App already exists with the name "Blueprint*", READ-ONLY first
# Show Bar what exists before creating new
```

### Rule 2: Database isolation

If using existing Supabase project (NOT recommended), wrap everything in a schema:

```sql
-- Create isolated schema
CREATE SCHEMA IF NOT EXISTS marketing;

-- All tables go in marketing schema, NOT public
CREATE TABLE marketing.campaigns (...);
CREATE TABLE marketing.leads (...);
-- etc.

-- This way existing tables in 'public' schema are untouchable
```

**Preferred approach:** Create a NEW Supabase project entirely. Cost is negligible, isolation is total.

### Rule 3: Vercel project must be NEW

```bash
# Wrong: vercel link to existing project
# Right: vercel (creates new project)

# When prompted "Link to existing project?": choose NO
# Project name: blueprint-marketing
# Framework: Next.js
```

### Rule 4: Facebook - Read first, write second

The system must FIRST inventory what exists on Facebook, THEN add new things alongside. Never modify existing.

Create this pre-flight script as Phase 0:

```typescript
// src/scripts/preflight-check.ts
import { meta } from '@/lib/meta/client';

async function preflightCheck() {
  console.log('\n=== BLUEPRINT MARKETING - PRE-FLIGHT CHECK ===\n');
  
  // 1. Verify Meta API connection
  const me = await fetch(
    `https://graph.facebook.com/v22.0/me?access_token=${process.env.META_ACCESS_TOKEN}`
  ).then(r => r.json());
  console.log('Meta Connection:', me.name || 'FAILED');
  
  // 2. List existing ad accounts
  const adAccounts = await meta.request(`/me/adaccounts`, {
    params: { fields: 'id,name,account_status,currency,timezone_name' }
  });
  console.log('\nAd Accounts found:');
  console.table(adAccounts.data);
  
  // 3. List existing campaigns (READ ONLY - do not touch)
  const existingCampaigns = await meta.listCampaigns();
  console.log(`\nExisting Campaigns: ${existingCampaigns.data?.length || 0}`);
  if (existingCampaigns.data?.length > 0) {
    console.log('IMPORTANT: These campaigns already exist. We will NOT modify them.');
    console.table(existingCampaigns.data.map((c: any) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      objective: c.objective
    })));
  }
  
  // 4. List existing pages
  const pages = await meta.request('/me/accounts', {
    params: { fields: 'id,name,access_token,instagram_business_account' }
  });
  console.log('\nManaged Pages:');
  pages.data?.forEach((p: any) => console.log(`  - ${p.name} (${p.id})`));
  
  // 5. Check for existing Lead Ad forms
  const pageId = process.env.META_PAGE_ID;
  const leadForms = await meta.request(`/${pageId}/leadgen_forms`, {
    params: { fields: 'id,name,status,leads_count,created_time' }
  });
  console.log('\nExisting Lead Forms:');
  console.table(leadForms.data || []);
  
  // 6. Check existing webhooks
  const subscriptions = await meta.request(`/${process.env.META_APP_ID}/subscriptions`, {
    params: { fields: 'object,callback_url,fields,active' }
  });
  console.log('\nExisting Webhooks:');
  console.table(subscriptions.data || []);
  if (subscriptions.data?.length > 0) {
    console.log('WARNING: Webhooks already exist. We will ADD a new subscription, not replace.');
  }
  
  console.log('\n=== PRE-FLIGHT COMPLETE ===');
  console.log('Review the output above. If anything is unexpected, STOP and consult Bar.');
}

preflightCheck();
```

**This script must run BEFORE any database changes or campaign creation.**

### Rule 5: Existing content stays untouched

The marketing system must:

- **READ** existing campaigns into our database for visibility
- **NOT pause, modify, or delete** any existing campaign without explicit user action in dashboard
- **NOT change** any existing creative, audience, or budget
- **NOT unsubscribe** from any existing webhooks
- **NOT modify** existing Facebook page settings, About info, or categories

### Rule 6: Mark imported vs created

Add a column to track what we created vs what was already there:

```sql
ALTER TABLE campaigns ADD COLUMN imported_from_meta BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN created_by_system BOOLEAN DEFAULT FALSE;

-- When importing existing campaigns from Meta
INSERT INTO campaigns (..., imported_from_meta) VALUES (..., TRUE);

-- When creating new through our system
INSERT INTO campaigns (..., created_by_system) VALUES (..., TRUE);
```

The dashboard will visually distinguish:
- **Grey badge:** "Imported - read only" (don't modify)
- **Gold badge:** "Created by Blueprint Marketing" (full control)

---

## FULL FACEBOOK INTEGRATION - WHAT IT CONNECTS TO

After setup, the system has automatic access to ALL of these:

### A. Facebook Pages
- Read posts, comments, messages
- Publish new posts (manual or scheduled)
- Read engagement metrics
- Reply to messages via Messenger API (Phase 2 extension)

### B. Instagram Business
- Read posts, stories, reels
- Publish to feed/stories/reels
- Read insights per post
- Manage comments and DMs (Phase 2 extension)

### C. Meta Ads Manager
- Read all ad accounts assigned to system user
- View all existing campaigns, ad sets, ads (read-only by default)
- Create new campaigns, ad sets, creatives, ads (always start PAUSED)
- Manage budgets, schedules, targeting
- Pause/activate campaigns from dashboard
- Get real-time insights (impressions, reach, clicks, spend, CPL, CTR)

### D. Lead Ads
- Receive every new lead via webhook in real-time
- Import historical leads from existing forms
- Auto-respond to new leads via email
- Sync leads to CRM (Supabase)
- Track lead source attribution (which ad, which campaign)

### E. Custom Audiences
- Read existing custom audiences
- Create new audiences from leads database
- Create Lookalike Audiences (people similar to existing clients)
- Sync website visitors via Pixel
- Upload customer lists (HNWI database)

### F. Meta Pixel
- Track website conversions (form submissions, page views)
- Build retargeting audiences automatically
- Optimize ad delivery for conversions
- Standard events: ViewContent, Lead, Contact, Schedule
- Custom events: SiteVisitScheduled, ProposalRequested

### G. Insights & Analytics
- Page insights (followers, reach, engagement)
- Ad insights (per campaign, per ad, per audience)
- Audience insights (demographics, interests, behaviors)
- Attribution analysis (which ads convert)
- Cohort analysis (leads by week, by source)

### H. Messenger (Phase 2)
- Receive messages from Facebook page
- Auto-respond with menu/options
- Hand off to human agent
- Track conversation history per lead

### I. WhatsApp Business (Phase 3)
- Send messages from approved templates
- Receive customer messages
- Sync conversations to CRM

---

## INTEGRATION FLOW (How it all connects)

```
╔══════════════════════════════════════════════════════════════╗
║  EXISTING BLUEPRINT INFRASTRUCTURE (UNTOUCHED)              ║
║  - Maintenance OS                                            ║
║  - Blueprint Finance                                         ║
║  - AI-PMS                                                    ║
║  - blueprint-ph.com (main website)                          ║
╚══════════════════════════════════════════════════════════════╝
                              ▲
                              │ Optional integration
                              │ (read-only API calls)
                              │
╔══════════════════════════════════════════════════════════════╗
║  NEW: BLUEPRINT MARKETING AUTOMATION                        ║
║  Domain: marketing.blueprint-ph.com                          ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │  Next.js Dashboard                                      │ ║
║  │  - Campaigns management                                 │ ║
║  │  - Lead kanban CRM                                      │ ║
║  │  - Performance reports                                  │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                       ▲              ▼                      ║
║  ┌──────────────────────┐  ┌────────────────────────────┐  ║
║  │  Supabase (NEW)      │  │  API Routes                │  ║
║  │  - campaigns         │◄─┤  - /api/campaigns          │  ║
║  │  - leads             │  │  - /api/ads/create-full    │  ║
║  │  - ad_creatives      │  │  - /api/webhooks/meta      │  ║
║  │  - email_sends       │  │  - /api/cron/followups     │  ║
║  └──────────────────────┘  └────────────┬───────────────┘  ║
╚════════════════════════════════════════════│════════════════╝
                                             │
                              ┌──────────────┴──────────────┐
                              ▼                             ▼
                ┌─────────────────────┐         ┌─────────────────────┐
                │  Meta APIs           │         │  Email & Calendar    │
                │  - Marketing API     │         │  - Resend (email)    │
                │  - Pages API         │         │  - Google Calendar   │
                │  - Instagram API     │         │  - Gmail (drafts)    │
                │  - Webhooks          │         └─────────────────────┘
                │  - Lead Ads          │
                └─────────────────────┘
                          ▲
                          │ (existing Meta assets - READ FIRST)
                          │
              ┌───────────┴──────────────┐
              │  EXISTING META ACCOUNT    │
              │  - BluePrint FB Page      │
              │  - @ph.blueprint IG       │
              │  - Ad accounts            │
              │  - Existing campaigns     │
              │  - Existing audiences     │
              └──────────────────────────┘
```

---

## SAFE EXECUTION CHECKLIST

Before running ANY phase from the main spec, Claude Code must confirm:

### Phase 0 Pre-checks

- [ ] Run `vercel projects list` and show output to Bar
- [ ] Run Supabase project list and show existing projects
- [ ] Run preflight-check.ts script to inventory existing Meta assets
- [ ] Get explicit Bar approval to proceed
- [ ] Document what exists in `EXISTING_ASSETS.md` (commit to repo)

### During each Phase

- [ ] Confirm no existing files are being overwritten
- [ ] Confirm all new code is in new files
- [ ] Database changes are additive only (no DROP, no ALTER on existing tables)
- [ ] Vercel deploys to new project only
- [ ] All Meta API writes go to NEW objects (new campaigns, new ads, never modify existing)

### Rollback Plan

If anything goes wrong:

```bash
# 1. Disable webhook subscription
curl -X DELETE "https://graph.facebook.com/v22.0/{APP_ID}/subscriptions?object=page&access_token={TOKEN}"

# 2. Pause all campaigns created by the system
# Run script that filters by created_by_system=true and pauses them

# 3. The system can be turned off without affecting anything else
# - blueprint-ph.com still works
# - Existing campaigns still run
# - Existing Facebook page still works
# - No data loss anywhere else
```

---

## QUESTIONS CLAUDE CODE MUST ASK BAR FIRST

Before writing any code, Claude Code must explicitly ask:

1. **Supabase:** "Do you want me to create a new Supabase project for marketing, or use an existing one? If existing, which one?"

2. **Vercel:** "Confirm you want a new Vercel project called 'blueprint-marketing' on domain marketing.blueprint-ph.com - or different name/domain?"

3. **Meta App:** "Do you have an existing Meta App for Blueprint, or should we create a new one? (Recommend new app specifically for this automation system)"

4. **Existing Campaigns:** "Should I import your existing Facebook campaigns into the dashboard as read-only? (Recommended for visibility, won't modify them)"

5. **Page Posting:** "Should the system have permission to publish to your Facebook page automatically, or always require manual approval first? (Recommend manual approval for first month)"

6. **Budget Caps:** "What's the maximum daily budget the system can set per campaign without your approval? (Recommend PHP 1,000 as safety ceiling)"

7. **Auto-Email:** "Should new leads get auto-response emails immediately, or queued for your review first? (Recommend immediate for response time, but configurable)"

---

## EXPLICIT WHAT WE WILL **NOT** DO

To be 100% clear, the system will NEVER:

1. **Delete** anything (campaigns, ads, leads, audiences) - only soft archive
2. **Modify existing campaigns** without explicit dashboard action by Bar
3. **Spend money** without Bar setting the budget first
4. **Send emails** to leads collected before this system was built (unless explicitly imported)
5. **Touch any other Blueprint system** (Maintenance OS, AI-PMS, Finance)
6. **Change the blueprint-ph.com main website**
7. **Share data** with any third party beyond Meta/Resend/Google (explicit list)
8. **Auto-launch campaigns** - everything starts PAUSED
9. **Override existing webhook subscriptions** - we add ours, leave others
10. **Modify Facebook Page settings, About info, or business details**

---

## SUCCESS CRITERIA

The integration is correctly done when:

1. ✅ All existing Blueprint systems still work exactly as before
2. ✅ All existing Facebook campaigns still run unchanged
3. ✅ Bar can see existing campaigns + new ones in the dashboard
4. ✅ New leads from Facebook Lead Ads flow into Supabase within 5 seconds
5. ✅ Auto-response emails arrive within 60 seconds
6. ✅ Bar can launch a NEW ad from the dashboard in under 3 minutes
7. ✅ Pausing any campaign from the dashboard pauses it in Meta within 30 seconds
8. ✅ Real-time spend tracking works
9. ✅ The system can be turned off without breaking anything else

---

## FINAL INSTRUCTION FOR CLAUDE CODE

Read this addendum FIRST. Confirm understanding by listing back to Bar:
1. What you understand about non-destructive principles
2. The 7 questions you'll ask before starting
3. The 10 things you will NEVER do

Only after Bar approves your understanding, proceed to the main spec Phase 0 (pre-flight check), then await Bar's go-ahead for each subsequent phase.

**Treat Blueprint's existing systems like sacred infrastructure. Build alongside, never on top.**
