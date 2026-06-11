You are running the **feature planning pipeline** for the fb-autoposter project.
The feature to plan: **$ARGUMENTS**

Work through the 6 stages below **in order**. After each stage, print the output clearly, then **stop and wait for the user to type "המשך"** before moving to the next stage. If the user gives feedback instead of "המשך", incorporate it and re-present the stage.

---

## STAGE 0 — Researcher 🔍

Your job: gather all context needed so the rest of the pipeline works from facts, not assumptions.

Do ALL of the following before writing anything:
1. Read `/Users/rotemlevi/.claude/projects/-Users-rotemlevi-Desktop-fb-autoposter/memory/MEMORY.md` and all memory files it references
2. Search the codebase for files relevant to the requested feature (routes, components, DB schema, automation)
3. Read the relevant files in full

Then output a **Context Brief**:
```
## Context Brief
### Feature requested
[restate in one sentence what we're building]

### Relevant codebase
[bullet list: file paths + one-line description of what's relevant in each]

### Relevant DB tables / columns
[what exists today, what's missing]

### Relevant memories / business rules
[pull exact facts from memory files]

### Assumptions I'm making
[anything not explicitly stated — flag it]

### Questions / risks
[things that could affect the design]
```

---

## STAGE 1 — Product Manager 📋

Write a concise PRD. No fluff.

```
## PRD
### Problem
[1–2 sentences: what pain does this solve for the secretary / agents]

### Goals
[2–4 measurable outcomes]

### User Stories
- As a [role], I want to [action] so that [value]
[3–6 stories]

### Success Metrics
[how do we know it worked]

### Out of Scope
[explicit list of what we're NOT building now]

### Edge Cases
[list — be specific to this codebase and the 500+ groups / 20 agents reality]
```

---

## STAGE 2 — Brand & Storyteller ✍️

This UI is in **Hebrew RTL** for a **real estate agency secretary and agents**.
Tone: direct, professional, zero fluff. No English in the UI.

```
## Microcopy Guide
### Key labels & CTAs
[table: element → Hebrew text]

### Empty states
[what appears when there's no data]

### Error messages
[specific, actionable — not "שגיאה"]

### Success messages
[brief, confirm the action]

### Gender / plurality notes
[Hebrew morphology quirks for this specific copy]
```

---

## STAGE 3 — UX/UI Designer 🎨

Use ASCII wireframes. Match the existing design system:
- Tailwind, RTL, brand-* color tokens
- Cards with rounded-2xl, shadows, hover states
- Existing patterns: SSE banners, drawers, modals, tabs

```
## UX Design
### Flow
[step-by-step user journey, numbered]

### Wireframes
[ASCII for each screen / state — desktop first, then mobile breakpoint notes]

### States to design
[ ] Empty  [ ] Loading  [ ] Error  [ ] Success  [ ] Partial (some data missing)

### Responsive notes
[what collapses / stacks on mobile]

### Accessibility
[ARIA labels, keyboard nav, focus traps for modals/drawers]
```

---

## STAGE 4 — Architect 🏗️

Output an implementation plan that can be handed directly to an engineer (or to Claude for coding).

```
## Implementation Plan

### DB changes (database.js → runMigrations)
[exact SQL / migration code]

### Server changes
[for each file: what function to add/modify + pseudocode or real code]

### Client changes
[for each file: what component/hook to add/modify]

### API surface
[new endpoints: method, path, params, response shape]

### Order of implementation
1. [step]
2. [step]
...

### No-go zones
[what NOT to touch to avoid regressions]
```

---

## STAGE 5 — QA Reviewer 🔎

Read everything from stages 0–4 and look for problems. Be adversarial.

```
## QA Report

### Contradictions
[stage X says X, stage Y says Y — which is right?]

### Missing edge cases
[scenarios the PRD / design / architecture didn't cover]

### Regression risks
[existing features that could break — be specific: file:line]

### Security / data concerns
[SQL injection surface, unvalidated inputs, sensitive data exposure]

### Open questions for the user
[things only the business owner can answer]
```

---

## STAGE 6 — Final Plan

After the user approves the QA report, call the built-in `/plan` tool to create a formal implementation plan based on everything above.

Summarize the full plan in this format before calling /plan:
```
## Final Implementation Plan
[consolidated, actionable, no repetition from earlier stages]
```

Then invoke plan mode with the complete implementation spec.
