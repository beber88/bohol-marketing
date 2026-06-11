# Panglao Prime Villas - Agent Directory

Blue Everest Asset Group Marketing System - 12 Agents

## Agent Map

| # | Agent | Model | Role | Reports To |
|---|-------|-------|------|------------|
| 01 | [CMO Orchestrator](01-cmo-orchestrator/AGENT.md) | Claude Sonnet 4 | Strategic command, task decomposition, budget allocation | Bar (CEO) |
| 02 | [Content Strategist](02-content-strategist/AGENT.md) | Claude Sonnet 4 | Content calendar planning, pillar rotation, funnel balance | CMO |
| 03 | [Brand Guard](03-brand-guard/AGENT.md) | Claude Haiku 4.5 | Content validation against 12 rules before publishing | All agents |
| 04 | [Copywriter](04-copywriter/AGENT.md) | Claude Sonnet 4 | Ad copy, posts, headlines, long-form in 3 languages | Content Strategist |
| 05 | [Performance Ads Manager](05-performance-ads-manager/AGENT.md) | Claude Haiku 4.5 | Meta/Google campaign configs, targeting, A/B tests | CMO |
| 06 | [Email Nurture](06-email-nurture/AGENT.md) | Claude Haiku 4.5 | Lifecycle email sequences via Brevo | CMO |
| 07 | [WhatsApp Agent](07-whatsapp-agent/AGENT.md) | Claude Haiku 4.5 | Template messages, flows, broadcasts via WATI | CMO |
| 08 | [CRM Lead Scorer](08-crm-lead-scorer/AGENT.md) | Claude Sonnet 4 | Lead scoring, status routing, decay management | Sales Agent |
| 09 | [Analytics Reporter](09-analytics-reporter/AGENT.md) | Claude Haiku 4.5 | Cross-platform metrics, trends, pacing alerts | CMO |
| 10 | [Sales Agent (David)](10-sales-agent/AGENT.md) | Claude Sonnet 4 | Live investor conversations, qualification, objection handling | Bar (CEO) |
| 11 | [Community Agent](11-community-agent/AGENT.md) | Claude Sonnet 4 | Israeli Facebook group engagement, 50-post campaign | CMO (independent ops) |
| 12 | [Execution Agent](12-execution-agent/AGENT.md) | Human (Cowork) | Browser-based task execution across all platforms | All agents |

## Agent Flow

```
Bar (CEO)
  |
  v
CMO Orchestrator ---> Content Strategist ---> Copywriter
  |                                              |
  |---> Performance Ads Manager                  |
  |---> Email Nurture Agent                      v
  |---> WhatsApp Agent                      Brand Guard (validates all content)
  |---> Analytics Reporter                       |
  |                                              v
  |                                    Task Queue (_queue/)
  |                                              |
  |                                              v
  |                                    Execution Agent (human)
  |                                              |
  |                                              v
  |                                    Platforms (Meta, Google, Brevo, WATI)
  |                                              |
  |                                              v
  |---> CRM Lead Scorer <--- Lead data flows back
  |---> Sales Agent (David) <--- Hot leads
  |
  +---> Community Agent (independent, Israeli FB group only)
```

## Shared Rules

All content-producing agents (02, 04, 05, 06, 07, 10, 11) must comply with the 12 SHARED_RULES embedded in each AGENT.md file. Brand Guard (03) validates compliance.

## Project Data (Current)

- Villa C: PHP 35,000,000 (1,650,000 ILS)
- Villa D: PHP 32,500,000 (1,535,000 ILS)
- Reservation: PHP 200,000 (9,999 ILS)
- Monthly income: PHP 395,000 (verified Airbnb)
- Annual ROI: 17-25%
- Budget: $900 / 15 days ($60/day average)
- WhatsApp Marketing: +639542555553
- WhatsApp Office: +639958565865
