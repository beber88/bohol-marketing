#!/usr/bin/env python3
"""
Real Estate Investor Lead Scoring Engine - Panglao Prime Villas.

Scores Facebook group posts for real estate investor intent.
Used by fb_group_scanner.py. Can also be run standalone to re-score
existing leads in data/investor_leads.json.

Usage (standalone):
    # Re-score all leads
    python3 scripts/fb_lead_scorer.py

    # Score a single text string
    python3 scripts/fb_lead_scorer.py --text "Looking to invest in a villa in Bohol"
"""

import argparse
import json
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
LEADS_PATH = DATA_DIR / "investor_leads.json"


# ============================================
# Keyword Packs
# ============================================

INVESTOR_KEYWORDS_EN = [
    # Direct investment intent
    "invest in philippines", "buy property philippines",
    "villa for sale", "property for sale bohol", "property for sale panglao",
    "real estate investment", "property investment",
    "buy villa", "buy land philippines", "purchase property",
    "looking to invest", "want to invest", "want to buy property",
    "interested in buying", "where to invest", "investment opportunity",
    "looking for investment",
    # ROI / Income
    "roi", "return on investment", "passive income",
    "rental income", "airbnb investment", "airbnb income",
    "short term rental", "vacation rental investment",
    "rental yield", "cash flow property", "income property",
    # Location specific
    "bohol investment", "panglao property", "panglao villa",
    "panglao real estate", "bohol real estate", "visayas property",
    "cebu investment", "philippines property",
    # Property type
    "luxury villa", "beachfront property", "beach house",
    "resort investment", "hotel investment", "tourism investment",
    # Foreign buyer
    "foreign ownership", "foreigner buy property", "can foreigner buy",
    "property for foreigners", "expat property",
    "retirement philippines", "retire in philippines", "srrv visa",
    # Legal / Ownership
    "deed of assignment", "leasehold", "domestic corporation",
    "property ownership foreigner", "condominium act",
    # Financing
    "property financing", "bank financing property",
    "bdo financing", "mortgage philippines", "payment terms property",
    # Comparison / Research
    "better than boracay", "compare bohol",
    "property prices bohol", "property prices panglao",
    "appreciation rate", "capital appreciation",
]

INVESTOR_KEYWORDS_HE = [
    "השקעה בפיליפינים", "נדל\"ן פיליפינים", "וילה למכירה",
    "השקעת נדל\"ן", "הכנסה פסיבית", "תשואה שנתית",
    "בוהול", "פנגלאו", "קנייה בחו\"ל", "נכס בחו\"ל",
    "השקעה באסיה", "נדל\"ן באסיה", "להשקיע בפיליפינים",
    "וילה בפיליפינים", "מחפש השקעה", "תשואה על השקעה",
    "airbnb השקעה", "שכירות לטווח קצר", "נכס מניב",
    "השקעת נדל\"ן בחו\"ל", "עסקת נדל\"ן",
]

INVESTOR_KEYWORDS_TL = [
    "invest sa pilipinas", "bili ng lupa", "bili ng bahay",
    "property investment", "passive income", "airbnb",
    "negosyo sa bohol", "negosyo sa panglao", "villa for sale",
    "buy and sell property", "lupa for sale bohol",
    "real estate investment", "kita sa rental", "investment property",
]

ALL_INVESTOR_KEYWORDS = list(set(
    INVESTOR_KEYWORDS_EN + INVESTOR_KEYWORDS_HE + INVESTOR_KEYWORDS_TL
))


# ============================================
# Scoring Patterns
# ============================================

STRONG_INTENT_PHRASES = [
    # English - active buyer signals
    "looking to invest", "want to invest", "want to buy property",
    "interested in buying", "planning to invest", "ready to invest",
    "looking for investment property", "where to invest in philippines",
    "how to buy property in philippines", "can foreigner buy",
    "looking to buy villa", "looking for villa",
    "interested in bohol", "interested in panglao",
    "looking for passive income", "want passive income",
    "airbnb investment opportunity", "investment opportunity philippines",
    "how much is a villa", "villa price",
    "property prices in bohol", "property prices in panglao",
    # Hebrew
    "מחפש השקעה", "רוצה להשקיע", "מתעניין בנדל\"ן",
    "כמה עולה וילה", "מחפש נכס", "איפה כדאי להשקיע",
    "השקעה בבוהול", "השקעה בפנגלאו",
    # Tagalog
    "gusto mag invest", "gusto bumili ng lupa",
    "magkano ang villa", "interested po sa property",
]

LOCATION_PATTERNS = [
    re.compile(r"\bbohol\b", re.I),
    re.compile(r"\bpanglao\b", re.I),
    re.compile(r"\balona\s*beach\b", re.I),
    re.compile(r"\btagbilaran\b", re.I),
    re.compile(r"\bdauis\b", re.I),
    re.compile(r"\bphilippines\b", re.I),
    re.compile(r"\bpilipinas\b", re.I),
    re.compile(r"\bcebu\b", re.I),
    re.compile(r"\bvisayas\b", re.I),
    re.compile(r"\bmanila\b", re.I),
    re.compile(r"\bboracay\b", re.I),
    re.compile(r"\bpalawan\b", re.I),
    re.compile(r"\bsiargao\b", re.I),
    re.compile(r"\bsoutheast\s*asia\b", re.I),
    re.compile(r"פיליפינים"),
    re.compile(r"בוהול"),
    re.compile(r"פנגלאו"),
]

BOHOL_PANGLAO_PATTERNS = [
    re.compile(r"\bbohol\b", re.I),
    re.compile(r"\bpanglao\b", re.I),
    re.compile(r"\balona\b", re.I),
    re.compile(r"\btagbilaran\b", re.I),
    re.compile(r"\bdauis\b", re.I),
    re.compile(r"בוהול"),
    re.compile(r"פנגלאו"),
]

BUDGET_PATTERNS = [
    re.compile(r"php\s*[\d,.]*\s*m(?:illion)?", re.I),
    re.compile(r"₱\s*[\d,.]*\s*m(?:illion)?", re.I),
    re.compile(r"\b\d{2,3}\s*million\b", re.I),
    re.compile(r"usd\s*[\d,.]+\s*(?:k|thousand|million)", re.I),
    re.compile(r"\$\s*[\d,.]+\s*(?:k|thousand|million)", re.I),
    re.compile(r"₪\s*[\d,.]+"),
    re.compile(r'ש"ח\s*[\d,.]+'),
    re.compile(r'[\d,.]+\s*ש"ח'),
    re.compile(r"[\d,.]+\s*שקל"),
    re.compile(r"\bbudget\s*(?:of|is|around|approximately)?\s*[\d,.]+", re.I),
    re.compile(r"\binvestment\s*(?:of|around|approximately)?\s*[\d,.]+", re.I),
]

FOREIGN_BUYER_PATTERNS = [
    re.compile(r"\bforeigner\b", re.I),
    re.compile(r"\bforeign\s*(?:buyer|investor|owner|national)\b", re.I),
    re.compile(r"\bexpat\b", re.I),
    re.compile(r"\bisraeli\s*(?:investor|buyer)?\b", re.I),
    re.compile(r"\bchinese\s*(?:investor|buyer)?\b", re.I),
    re.compile(r"\bkorean\s*(?:investor|buyer)?\b", re.I),
    re.compile(r"\beuropean\s*(?:investor|buyer)?\b", re.I),
    re.compile(r"\bamerican\s*(?:investor|buyer)?\b", re.I),
    re.compile(r"\baustralian\s*(?:investor|buyer)?\b", re.I),
    re.compile(r"\bretire\s*(?:in|to)\s*philippines\b", re.I),
    re.compile(r"\bsrrv\b", re.I),
    re.compile(r"ישראלי"),
    re.compile(r"משקיע"),
]

TIMELINE_PATTERNS = [
    re.compile(r"\bthis\s*year\b", re.I),
    re.compile(r"\bthis\s*quarter\b", re.I),
    re.compile(r"\bthis\s*month\b", re.I),
    re.compile(r"\bready\s*to\s*(?:buy|invest|purchase)\b", re.I),
    re.compile(r"\bplanning\s*to\s*(?:buy|invest|visit)\b", re.I),
    re.compile(r"\bsite\s*visit\b", re.I),
    re.compile(r"\bviewing\b", re.I),
    re.compile(r"\btripping\b", re.I),
    re.compile(r"\basap\b", re.I),
    re.compile(r"\bsoon\b", re.I),
]

CONTACT_PATTERNS = [
    re.compile(r"09\d{9}"),
    re.compile(r"\+639\d{9}"),
    re.compile(r"\+972\d{8,9}"),
    re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"),
    re.compile(r"\bmessage\s*me\b", re.I),
    re.compile(r"\bpm\s*me\b", re.I),
    re.compile(r"\bdm\s*me\b", re.I),
    re.compile(r"\bwhatsapp\b", re.I),
    re.compile(r"\bviber\b", re.I),
    re.compile(r"\btelegram\b", re.I),
    re.compile(r"\bwechat\b", re.I),
    re.compile(r"\bkakaotalk\b", re.I),
]

NOISE_PATTERNS = [
    # Hiring / jobs
    re.compile(r"\bhiring\s*(?:now)?\b", re.I),
    re.compile(r"\bjob\s*opening\b", re.I),
    re.compile(r"\bwe\s*are\s*hiring\b", re.I),
    re.compile(r"\bnow\s*hiring\b", re.I),
    re.compile(r"\bapply\s*now\b", re.I),
    re.compile(r"\bjoin\s*our\s*team\b", re.I),
    re.compile(r"\bsend\s*(?:your\s*)?resume\b", re.I),
    re.compile(r"\bsend\s*(?:your\s*)?cv\b", re.I),
    # MLM / scams
    re.compile(r"\bmlm\b", re.I),
    re.compile(r"\bnetwork\s*marketing\b", re.I),
    re.compile(r"\bpyramid\b", re.I),
    re.compile(r"\bguaranteed\s*returns\b", re.I),
    # Lending
    re.compile(r"\blending\b", re.I),
    re.compile(r"\bpersonal\s*loan\b", re.I),
    re.compile(r"\bsalary\s*loan\b", re.I),
    re.compile(r"\bcash\s*loan\b", re.I),
    # Seminars
    re.compile(r"\bseminar\b", re.I),
    re.compile(r"\bwebinar\b", re.I),
    re.compile(r"\bfree\s*course\b", re.I),
    re.compile(r"\benroll\s*now\b", re.I),
]

BROKER_PATTERNS = [
    re.compile(r"\b(?:selling|for\s*sale)\s*(?:my|our)\s*(?:property|villa|house|condo|lot)\b", re.I),
    re.compile(r"\baccredited\s*broker\b", re.I),
    re.compile(r"\breal\s*estate\s*broker\b", re.I),
    re.compile(r"\bpre-?selling\b", re.I),
    re.compile(r"\bready\s*for\s*occupancy\b", re.I),
    re.compile(r"\brfo\b", re.I),
]


# ============================================
# Scoring Function
# ============================================

def score_post(text):
    """Score a post for real estate investor intent (0-100)."""
    if not text:
        return 0
    lower = text.lower()
    score = 0

    # +30: Strong investment intent phrases
    if any(phrase.lower() in lower for phrase in STRONG_INTENT_PHRASES):
        score += 30

    # +15: Multiple investor keywords
    kw_count = sum(1 for kw in ALL_INVESTOR_KEYWORDS if kw.lower() in lower)
    if kw_count >= 3:
        score += 15
    elif kw_count >= 1:
        score += 8

    # +20: Philippines location mentioned
    if any(p.search(text) for p in LOCATION_PATTERNS):
        score += 20

    # +10 BONUS: Bohol/Panglao specifically
    if any(p.search(text) for p in BOHOL_PANGLAO_PATTERNS):
        score += 10

    # +15: Budget/financial signals
    if any(p.search(text) for p in BUDGET_PATTERNS):
        score += 15

    # +15: Foreign buyer signals
    if any(p.search(text) for p in FOREIGN_BUYER_PATTERNS):
        score += 15

    # +10: Timeline signals
    if any(p.search(text) for p in TIMELINE_PATTERNS):
        score += 10

    # +10: Contact info present
    if any(p.search(text) for p in CONTACT_PATTERNS):
        score += 10

    # -20: Noise
    if any(p.search(text) for p in NOISE_PATTERNS):
        score -= 20

    # -10: Broker/competitor selling their own property
    if any(p.search(text) for p in BROKER_PATTERNS):
        score -= 10

    return max(0, min(100, score))


def classify_intent(score):
    """Classify lead by score."""
    if score >= 75:
        return "Hot Investor Lead"
    if score >= 55:
        return "Warm Investor Lead"
    if score >= 35:
        return "Monitor"
    return "Noise"


# ============================================
# Extraction Helpers
# ============================================

def detect_investor_origin(text):
    """Detect investor nationality/origin."""
    origins = [
        (re.compile(r"\bisrael\b|ישראל", re.I), "Israel"),
        (re.compile(r"\bchinese\b|中国|华人", re.I), "China"),
        (re.compile(r"\bkorean?\b|한국|한인", re.I), "Korea"),
        (re.compile(r"\bjapan(?:ese)?\b", re.I), "Japan"),
        (re.compile(r"\bamerican?\b|\busa\b", re.I), "USA"),
        (re.compile(r"\baustralian?\b", re.I), "Australia"),
        (re.compile(r"\bbrit(?:ish|ain)?\b|\buk\b", re.I), "UK"),
        (re.compile(r"\bgerman(?:y)?\b", re.I), "Germany"),
        (re.compile(r"\bcanad(?:ian|a)\b", re.I), "Canada"),
        (re.compile(r"\bfilipino\b|\bpinoy\b|\bpinay\b", re.I), "Philippines"),
        (re.compile(r"\bofw\b", re.I), "Philippines (OFW)"),
        (re.compile(r"\bsingapore(?:an)?\b", re.I), "Singapore"),
        (re.compile(r"\bhong\s*kong\b", re.I), "Hong Kong"),
        (re.compile(r"\btaiwan(?:ese)?\b", re.I), "Taiwan"),
        (re.compile(r"\bindia(?:n)?\b", re.I), "India"),
        (re.compile(r"\brussian?\b|\brussia\b", re.I), "Russia"),
    ]
    for pattern, label in origins:
        if pattern.search(text):
            return label
    return None


def detect_property_interest(text):
    """Detect property type interest."""
    types = [
        (re.compile(r"\bvilla\b", re.I), "Villa"),
        (re.compile(r"\bcondo(?:minium)?\b", re.I), "Condominium"),
        (re.compile(r"\bhouse\s*(?:and|&)\s*lot\b", re.I), "House & Lot"),
        (re.compile(r"\blot\s*only\b|\braw\s*land\b", re.I), "Land"),
        (re.compile(r"\bresort\b", re.I), "Resort"),
        (re.compile(r"\bhotel\b", re.I), "Hotel"),
        (re.compile(r"\bcommercial\b", re.I), "Commercial"),
        (re.compile(r"\bbeachfront\b", re.I), "Beachfront"),
        (re.compile(r"\bfarm(?:land)?\b", re.I), "Farm"),
        (re.compile(r"\bapartment\b", re.I), "Apartment"),
    ]
    for pattern, label in types:
        if pattern.search(text):
            return label
    return None


def detect_budget(text):
    """Detect budget hint from post."""
    m = re.search(r"(?:₱|php)\s*([\d,.]+)\s*(million|m|k)?", text, re.I)
    if m:
        return f"PHP {m.group(1)}{' ' + m.group(2) if m.group(2) else ''}"

    m = re.search(r"(?:\$|usd)\s*([\d,.]+)\s*(million|m|k|thousand)?", text, re.I)
    if m:
        return f"USD {m.group(1)}{' ' + m.group(2) if m.group(2) else ''}"

    m = re.search(r'(?:₪|ש"ח|שקל)\s*([\d,.]+)', text)
    if m:
        return f"ILS {m.group(1)}"

    m = re.search(r'([\d,.]+)\s*(?:ש"ח|שקל)', text)
    if m:
        return f"ILS {m.group(1)}"

    if re.search(r"\bbudget\b", text, re.I):
        return "Budget mentioned"
    if re.search(r"\bhow\s*much\b", text, re.I):
        return "Asking for price"
    if re.search(r"\bmagkano\b", text, re.I):
        return "Asking for price (TL)"
    return None


def detect_timeline(text):
    """Detect timeline from post."""
    if re.search(r"\bready\s*to\s*(?:buy|invest|purchase)\b", text, re.I):
        return "Ready now"
    if re.search(r"\bthis\s*month\b", text, re.I):
        return "This month"
    if re.search(r"\bthis\s*quarter\b", text, re.I):
        return "This quarter"
    if re.search(r"\bthis\s*year\b", text, re.I):
        return "This year"
    if re.search(r"\bsite\s*visit\b|\btripping\b", text, re.I):
        return "Planning site visit"
    if re.search(r"\bsoon\b", text, re.I):
        return "Soon"
    if re.search(r"\bplanning\b", text, re.I):
        return "Planning"
    if re.search(r"\bresearch", text, re.I):
        return "Research phase"
    return None


def get_matched_keywords(text):
    """Get list of matched investor keywords."""
    lower = text.lower()
    return [kw for kw in ALL_INVESTOR_KEYWORDS if kw.lower() in lower]


# ============================================
# Standalone Mode
# ============================================

def rescore_leads():
    """Re-score all existing leads in investor_leads.json."""
    if not LEADS_PATH.exists():
        print(f"[INFO] No leads file at {LEADS_PATH}")
        return

    with open(LEADS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    leads = data.get("leads", [])
    print(f"Re-scoring {len(leads)} leads...")

    for lead in leads:
        text = lead.get("post_text", "")
        lead["score"] = score_post(text)
        lead["intent_class"] = classify_intent(lead["score"])
        lead["investor_origin"] = detect_investor_origin(text)
        lead["property_interest"] = detect_property_interest(text)
        lead["budget_hint"] = detect_budget(text)
        lead["timeline"] = detect_timeline(text)
        lead["matched_keywords"] = get_matched_keywords(text)

    with open(LEADS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    hot = sum(1 for l in leads if l.get("intent_class") == "Hot Investor Lead")
    warm = sum(1 for l in leads if l.get("intent_class") == "Warm Investor Lead")
    monitor = sum(1 for l in leads if l.get("intent_class") == "Monitor")
    noise = sum(1 for l in leads if l.get("intent_class") == "Noise")
    print(f"Results: Hot={hot} Warm={warm} Monitor={monitor} Noise={noise}")


def score_single(text):
    """Score a single text and print results."""
    score = score_post(text)
    intent = classify_intent(score)
    origin = detect_investor_origin(text)
    prop = detect_property_interest(text)
    budget = detect_budget(text)
    timeline = detect_timeline(text)
    keywords = get_matched_keywords(text)

    print(f"Score: {score}/100")
    print(f"Intent: {intent}")
    print(f"Origin: {origin or '-'}")
    print(f"Property: {prop or '-'}")
    print(f"Budget: {budget or '-'}")
    print(f"Timeline: {timeline or '-'}")
    print(f"Keywords: {', '.join(keywords[:10]) if keywords else '-'}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lead scoring engine for Panglao Prime Villas")
    parser.add_argument("--text", type=str, default=None, help="Score a single text")
    parser.add_argument("--rescore", action="store_true", help="Re-score all existing leads")
    args = parser.parse_args()

    if args.text:
        score_single(args.text)
    elif args.rescore:
        rescore_leads()
    else:
        # Default: re-score existing leads
        rescore_leads()
