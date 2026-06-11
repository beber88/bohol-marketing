# SHARED RULES - PANGLAO PRIME VILLAS

Iron rules that apply to every asset produced by any agent (Claude Code or Cowork).
Violation of any rule = asset rejected. No exceptions.

Source of truth: VILLA-MARKETING-SKILL.md, CAMPAIGN-ISRAEL.md, CAMPAIGN-PHILIPPINES.md.

---

## RULE 1: CURRENCY FORMAT (MARKET-SPECIFIC)

Currency rules differ by target market:

**Israeli market (IL):** Shekels ONLY. No PHP, USD, or other currencies.
- Fixed monthly prices (do NOT recalculate from FX):
  - Villa D: 1,535,000 ש"ח
  - Villa C: 1,650,000 ש"ח
  - Reservation: 9,999 ש"ח
- Monthly rental income: PHP 395,000 (income stays in PHP across all markets)

**Filipino market (PH):** PHP ONLY with commas.
- Villa D: PHP 32,500,000
- Villa C: PHP 35,000,000
- Reservation: PHP 200,000
- No ILS in Filipino content.

**Global/INTL market:** PHP primary, USD secondary with "approx." prefix and rate date.

**In HTML artifacts:** read fx_today.json on load for non-fixed conversions.

---

## RULE 2: NO LONG DASHES OR HEBREW MAQAF

Forbidden characters:
- Em dash (—) Unicode U+2014
- En dash (–) Unicode U+2013
- Hebrew maqaf (־) Unicode U+05BE

Use instead: regular hyphen (-), colon (:), comma (,), or rephrase the sentence.

**Test:** Search every output file for these characters before marking READY.

---

## RULE 3: EVERY ASSET MUST INCLUDE A SPECIFIC NUMBER

Every single asset (ad, email, WhatsApp flow, landing page, artifact) must contain at least one specific number from VILLA-MARKETING-SKILL.md.

Valid numbers (non-exhaustive):
- PHP 395,000 (monthly income)
- PHP 4,740,000 (annual gross)
- 17-25% (annual ROI)
- 136.9% (5-year ROI)
- 65% (occupancy vs 49% market)
- 80.9% (5-year appreciation)
- PHP 200,000 (reservation fee)
- 60 seconds (beach distance)
- 263.78 sqm (floor area)
- 4 bedrooms
- 15.08 sqm (pool)
- PHP 32,500,000 / PHP 35,000,000 (villa prices)

An asset with zero specific numbers from the source files is rejected.

---

## RULE 4: SINGLE CTA PER ASSET

Every asset must end with exactly one clear call-to-action.
Never two CTAs. Never zero CTAs.

Default CTAs:
- Israeli market: WhatsApp +639542555553 or primevilla.ph
- Filipino market: WhatsApp +639542555553 or primevilla.ph
- Email: WhatsApp link (wa.me/+639542555553) or Calendly link

---

## RULE 5: FORBIDDEN WORDS

Never use in any asset, any language:
- amazing
- incredible
- dream home
- once in a lifetime

In Hebrew, this also applies to equivalent terms:
- מדהים (when used as empty superlative)
- בלתי נשכח
- בית החלומות
- הזדמנות של פעם בחיים

---

## RULE 6: THREE LEGAL SOLUTIONS FOR ISRAELIS

Every Israeli-targeted asset must mention or reference the 3 legal ownership options:
1. **Deed of Assignment** (most popular) - full title to structure
2. **Leasehold 25+25** - full control for 50 years
3. **Domestic Corporation** - 40% foreign, maximum security

If the asset is short (e.g., a headline), reference can be indirect: "3 מסלולים משפטיים" or "3 legal options for Israeli buyers."

Blue Everest handles all legal work end-to-end. Process can be completed remotely.

---

## RULE 7: BDO FINANCING FOR FILIPINOS

Every Filipino-targeted asset must mention BDO Bank financing.

Minimum mention: "BDO Bank financing available"
Full mention: "BDO Bank financing available for qualified buyers. Flexible mortgage terms through our BDO partnership."

If the asset is short (e.g., a headline), "BDO Financing Available" is sufficient.

---

## RULE 8: HEBREW REGISTER

All Hebrew content must use literary register (ספרותית), never slang.
- Formal but warm, peer-to-peer professional tone
- RTL rendering verified in all HTML output
- No slang, no chatspeak, no abbreviations (except standard: ש"ח, ת"א)

---

## RULE 9: MOBILE-FIRST FORMATTING

- Paragraphs: maximum 3 lines
- Scannable: use line breaks, bullet points, bold for key numbers
- No walls of text
- WhatsApp: use asterisks for bold (*bold*)
- Email: test on mobile viewport before marking READY

---

## RULE 10: FX METADATA BLOCK

Every ad copy file (.txt) and markdown asset (.md) in /assets/ must end with:

```
=== FX METADATA ===
FX date used: [date from fx_today.json]
PHP-ILS rate: [rate]
PHP-USD rate: [rate]
Auto-refresh: enabled
```

This block is auto-managed by refresh_assets.py. Do not manually edit it.

---

## RULE 11: FILE NAMING CONVENTION

Ad copy files: `PLATFORM_MARKET_FUNNEL_VARIANT.txt`
- Platform: META, GOOGLE
- Market: IL, PH, INTL
- Funnel: AWARENESS, CONSIDERATION, CONVERSION
- Variant: A1, A2, B1, etc.

Example: `META_IL_AWARENESS_A1.txt`

WhatsApp: `flow_name.json` + `flow_name.md`
Email: `email_MARKET_NN.html` + `email_MARKET_NN.txt`
Landing: `landing_SEGMENT.md`

---

## RULE 12: SIMULATION MODE

When SIMULATION = True (see /docs/SIMULATION_MODE.md):
- Every asset header must include: `[SIMULATION - NOT FOR LIVE DEPLOYMENT]`
- No real ad publishing, email sending, or WhatsApp broadcasting
- All outputs are for review and approval only
- Remove SIMULATION tags only after explicit approval from the campaign owner

---

## VALIDATION CHECKLIST

Before marking any asset as READY FOR AUDIT in HANDOFF_LOG.md, verify:

- [ ] Contains at least one specific number from VILLA-MARKETING-SKILL.md
- [ ] Has exactly one CTA
- [ ] No forbidden words
- [ ] No long dashes or Hebrew maqaf
- [ ] Israeli assets: 3 legal solutions mentioned
- [ ] Filipino assets: BDO financing mentioned
- [ ] Hebrew: literary register, RTL verified
- [ ] Mobile-first: paragraphs max 3 lines
- [ ] Currency: PHP primary, ILS/USD secondary with rate date
- [ ] FX METADATA block present (for .txt/.md in /assets/)
- [ ] File naming follows convention
- [ ] SIMULATION tag present (if in simulation mode)
