#!/usr/bin/env python3
"""
generate_daily_tasks.py
-----------------------
Generates the daily task queue for the Cowork agent.

Reads campaign state and FX data, then produces phase-appropriate
task files under _queue/YYYY-MM-DD/.

Usage:
    python3 scripts/generate_daily_tasks.py          # uses campaign_state.json day
    python3 scripts/generate_daily_tasks.py --day 5   # override to day 5
"""

import argparse
import json
import os
import re
from datetime import datetime, date
from pathlib import Path

# ---------------------------------------------------------------------------
# Project root detection (one level up from scripts/)
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

# ---------------------------------------------------------------------------
# Phase mapping
# ---------------------------------------------------------------------------
PHASE_MAP = {
    0: "PRE_LAUNCH",
    (1, 3): "SETUP",
    (4, 7): "AWARENESS",
    (8, 14): "CONSIDERATION",
    (15, 21): "CONVERSION",
    (22, 28): "CLOSE_PUSH",
    (29, 30): "FINAL",
}


def get_phase(day: int) -> str:
    if day == 0:
        return "PRE_LAUNCH"
    for key, phase in PHASE_MAP.items():
        if isinstance(key, tuple) and key[0] <= day <= key[1]:
            return phase
    return "FINAL"


# ---------------------------------------------------------------------------
# Hooks library (sourced from MASTER-HOOKS.md)
# ---------------------------------------------------------------------------
HOOKS = {
    "roi": [
        "This villa earned PHP 4,740,000 last year. Exposed concrete, rooftop jacuzzi, 60 seconds from the beach.",
        "PHP 395,000 every month. 17-25% annual ROI. One villa in Panglao.",
        "136.9% return in 5 years. Not crypto. Not stocks. A concrete villa in Bohol.",
    ],
    "lifestyle": [
        "Imagine waking up to this. Now imagine collecting PHP 395,000 every month while you are not even there.",
        "4 bedrooms. Rooftop jacuzzi. 60 seconds to the beach. And it pays for itself.",
    ],
    "growth": [
        "1.43 million tourists visited Bohol in 2025. JW Marriott is building next door. Panglao is the #1 tourism investment destination in the Philippines.",
        "Bohol airport handled 2.22 million passengers in 2025 - exceeding its 2M design capacity. 12 daily flights from Manila. Direct flights from Korea.",
        "Bohol GDP grew 6.6% in 2024. Tourism drives 74% of the economy. A third bridge to Panglao is now funded by France. This island is just getting started.",
        "Panglao: Skyscanner's #8 Trending Destination for 2025. 77% surge in flight searches. JW Marriott, Accor MGallery, and a P25-billion resort township under construction.",
        "Panglao beachfront: P27,500-49,000/sqm. Boracay beachfront: P70,000+/sqm. Same island lifestyle, half the price. The gap is closing fast.",
        "A P25-billion resort township. JW Marriott. 188-room MGallery. A third bridge funded by France. 2.22M airport passengers. This is not a sleepy island anymore.",
        "535,803 tourists in 2022. 1,427,362 in 2025. That is 166% growth in 3 years. We are not building on hope. We are building on a proven trend.",
        "When JW Marriott and Accor move in, it is no longer a small island. It is a Destination Brand. Our villas sit in the Marriott-Mithi-South Palms triangle.",
        "Luxury villas in Panglao earn ADR of P12,000-20,000 with 70%+ occupancy. This villa is not just a lifestyle asset. It is a cash flow machine.",
        "SM is building a mega mall in Bohol, opening 2028. SM does not build where there is no market. This province is now Tier-1.",
        "Panglao is becoming a Live + Work + Invest destination. Co-working, medical center, international school - not just a beach holiday. Your villa serves all three markets.",
        "Enter between Proof of Concept (already happened) and Full Pricing (not yet). Tourism record. Airport over capacity. Bridge funded. Marriott building. This is where smart money enters.",
        "Bohol airport: 2.22M passengers today, planned capacity nearly 4M by 2030. Aboitiz InfraCapital committed to a 30-year modernization program. The infrastructure is being built for the next decade.",
    ],
    "scarcity": [
        "Villa A: Sold. Villa B: Sold. Villa C and D: Your last chance.",
        "2 villas remain at this price. After these, no more beachfront at PHP 28M.",
    ],
    "hebrew": [
        "ישראלים כבר השקיעו בפנגלאו. אנחנו מלווים אותם מהיום הראשון עד מסירת המפתח.",
        "וילה בבוהול - 1,450,000 ש\"ח. פחות מדירת 3 חדרים בתל אביב.",
        "1.43 מיליון תיירים ביקרו בבוהול ב-2025. מלון JW Marriott נבנה ממש לידנו. פנגלאו היא יעד ההשקעה מספר 1 בפיליפינים.",
        "שדה התעופה של בוהול טיפל ב-2.22 מיליון נוסעים ב-2025. 12 טיסות ביום ממנילה. שעה ורבע בלבד. הגשר השלישי לפנגלאו כבר מאושר ומתוקצב.",
        "הכלכלה של בוהול צמחה ב-6.6% ב-2024. תיירות מהווה 74% מהתמ\"ג. JW Marriott, Accor MGallery ועיר נופש ב-25 מיליארד פסו - הכל בבנייה עכשיו.",
        "Skyscanner דירג את פנגלאו במקום ה-8 ביעדים הטרנדיים בעולם ל-2025. היעד היחיד מהפיליפינים ברשימה. חיפושי טיסות קפצו ב-77%.",
        "מחיר למ\"ר בפנגלאו: 27,500-49,000 פסו. בבורקאי: 70,000+ פסו. אותו לייפסטייל, חצי מהמחיר. הפער נסגר במהירות.",
        "עיר נופש חדשה ב-25 מיליארד פסו. JW Marriott. MGallery של Accor. גשר שלישי ממומן ע\"י צרפת. 2.22 מיליון נוסעים בשדה התעופה. פנגלאו כבר לא אי שקט.",
        "535,803 תיירים ב-2022. 1,427,362 ב-2025. זה 166% צמיחה ב-3 שנים. אנחנו לא בונים על תקווה - אנחנו בונים על מגמה מוכחת.",
        "כש-JW Marriott ו-Accor נכנסים, זה כבר לא אי קטן. זה מותג יעד. הווילות שלנו יושבות במשולש Marriott-Mithi-South Palms.",
        "וילות יוקרה בפנגלאו מרוויחות 12,000-20,000 פסו ללילה עם תפוסה של 70%+. הווילה הזו לא רק נכס לייפסטייל - היא מכונה לייצור תזרים.",
        "SM בונה קניון ענק בבוהול, פתיחה ב-2028. SM לא בונה איפה שאין שוק. הפרובינציה הזו כבר ברמת Tier-1.",
        "פנגלאו הופכת ליעד Live + Work + Invest. קו-וורקינג, מרכז רפואי, בית ספר בינלאומי. הווילה שלכם משרתת שלושה שווקים.",
        "נכנסים בין הוכחת הקונספט (שכבר קרתה) לבין התמחור המלא (שעדיין לא הגיע). תיירות בשיא. שדה תעופה מעל קיבולת. גשר ממומן. Marriott בבנייה. כאן נכנס כסף חכם.",
        "Aboitiz InfraCapital - חברת תשתיות ענקית עם אופק 30 שנה בשדה התעופה. גשר שלישי ממומן ע\"י צרפת. עיר נופש ב-25 מיליארד. SM בדרך. כל התשתיות בו-זמנית.",
        "שדה תעופה בוהול: 2.22 מיליון נוסעים היום, קיבולת מתוכננת של כמעט 4 מיליון עד 2030. Aboitiz מחויבת לתוכנית מודרניזציה ל-30 שנה. התשתית נבנית לעשור הבא.",
        "דירה בתל אביב: 5-6 מיליון שקל, תשואה 2%. וילת יוקרה בפנגלאו: 1,450,000 שקל, תשואה 10-15%. אותו הון, פי 5 תשואה.",
        "12,742 ישראלים ביקרו בפיליפינים ב-2023. יש אמנת מס בין ישראל לפיליפינים מ-1997. חוק חדש מאפשר חכירה עד 99 שנה. המסגרת המשפטית ברורה ומוסדרת.",
        "יוקר המחיה בישראל גבוה פי 3 מהפיליפינים. ההכנסה מהשכרת הווילה מממנת רמת חיים גבוהה מאוד. המספרים עובדים לטובתכם.",
        "בוהול היא הגיאופארק הראשון של UNESCO בפיליפינים. 1 מתוך 195 בעולם. Chocolate Hills, שונית מחסום כפולה - היחידה בדרום-מזרח אסיה. אי עם DNA ייחודי.",
        "באלי מקבלת 16.4 מיליון תיירים בשנה. פנגלאו - 1.4 מיליון. 10 שנים מאחור על עקומת הצמיחה. אותו DNA של חופים, תרבות וצלילה. מחיר כניסה נמוך בהרבה.",
    ],
}

PHASE_HOOK_MAP = {
    "AWARENESS": ["roi", "lifestyle", "growth"],
    "CONSIDERATION": ["growth", "roi"],
    "CONVERSION": ["scarcity", "growth"],
    "CLOSE_PUSH": ["scarcity"],
    "FINAL": ["scarcity"],
}



# ---------------------------------------------------------------------------
# Image catalogue - CURATED best images for marketing
# ---------------------------------------------------------------------------

# RULE: Single image posts MUST show: pool, all 4 villas aerial, or rooftop.
# No single-villa front shots. No interior-only for single image posts.
# Interior images used only in carousel/multi-image posts.
CURATED_IMAGES = [
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/PD1 ENHANCED.png",      # POOL: loungers + glass walls + tropical
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/AERIAL 1 ENHANCED.png", # ALL 4 VILLAS: aerial + Marriott + ocean
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/RD2 ENHANCED.png",      # ROOFTOP: jacuzzi + palm panorama (HERO)
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/PD3 ENHANCED.png",      # POOL: deck + BBQ + tropical garden
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/AERIAL 2 ENHANCED.png", # ALL 4 VILLAS: golden hour + ocean
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/RD1 ENHANCED.png",      # ROOFTOP: dining table + palm view
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/PD2 ENHANCED.png",      # POOL: outdoor shower + palms
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/AERIAL 3 ENHANCED.png", # ALL 4 VILLAS: alternate angle
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/PD1 ENHANCED.png",      # POOL: repeat best pool shot
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/RD2 ENHANCED.png",      # ROOFTOP: repeat hero rooftop
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/AERIAL 1 ENHANCED.png", # ALL 4 VILLAS: repeat best aerial
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/PD3 ENHANCED.png",      # POOL: repeat BBQ deck
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/AERIAL 2 ENHANCED.png", # ALL 4 VILLAS: repeat golden hour
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/RD1 ENHANCED.png",      # ROOFTOP: repeat dining
    "EXTERIOR - D5/LATEST RENDERS - EXTERIOR/PD2 ENHANCED.png",      # POOL: repeat shower
]

# Videos for specific campaign days
VIDEOS = [
    "20260416 BLUEEVEREST 1 Villas Bohol.mp4",
    "20260416 BLUEEVEREST 2 Villas Bohol.mp4",
]

def collect_images() -> dict:
    """Return curated image lists + all available for count."""
    exterior_dir = PROJECT_ROOT / "EXTERIOR - D5"
    interior_dir = PROJECT_ROOT / "INTERIOR D5"
    all_ext = []
    all_int = []
    if exterior_dir.exists():
        for f in sorted(exterior_dir.rglob("*.png")):
            all_ext.append(str(f.relative_to(PROJECT_ROOT)))
    if interior_dir.exists():
        for f in sorted(interior_dir.rglob("*.png")):
            all_int.append(str(f.relative_to(PROJECT_ROOT)))
    return {"exterior": all_ext, "interior": all_int}


def pick_image(images: dict, day: int) -> str:
    """Pick from curated best images, cycling through them."""
    if not CURATED_IMAGES:
        all_imgs = images["exterior"] + images["interior"]
        return all_imgs[day % len(all_imgs)] if all_imgs else "assets/placeholder.png"
    return CURATED_IMAGES[day % len(CURATED_IMAGES)]


def pick_video(day: int) -> str:
    """Return a video path for video-specific days, or empty string."""
    if not VIDEOS:
        return ""
    return VIDEOS[day % len(VIDEOS)]


def pick_hook(phase: str, day: int) -> dict:
    """Pick an English hook and optionally a Hebrew hook based on phase and day."""
    categories = PHASE_HOOK_MAP.get(phase, ["roi"])
    # Flatten available hooks for phase
    pool = []
    for cat in categories:
        pool.extend(HOOKS[cat])
    hook_en = pool[day % len(pool)] if pool else ""
    hook_he = HOOKS["hebrew"][day % len(HOOKS["hebrew"])]
    return {"en": hook_en, "he": hook_he}


# ---------------------------------------------------------------------------
# File readers
# ---------------------------------------------------------------------------

def read_campaign_state() -> dict:
    path = PROJECT_ROOT / "_status" / "campaign_state.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def read_fx() -> dict:
    path = PROJECT_ROOT / "config" / "fx_today.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Budget helpers
# ---------------------------------------------------------------------------
DAILY_BUDGET_MAP = {
    "PRE_LAUNCH": 0,
    "SETUP": 0,
    "AWARENESS": 50,
    "CONSIDERATION": 80,
    "CONVERSION": 120,
    "CLOSE_PUSH": 150,
    "FINAL": 200,
}


# ---------------------------------------------------------------------------
# Task ID generator
# ---------------------------------------------------------------------------
_task_counter = 0


def task_id(prefix: str) -> str:
    global _task_counter
    _task_counter += 1
    return f"{prefix}-{_task_counter:04d}"


# ---------------------------------------------------------------------------
# Task generators per category
# ---------------------------------------------------------------------------

def gen_content_tasks(day: int, phase: str, fx: dict, images: dict, today_str: str) -> list:
    """Generate content creation / posting tasks."""
    tasks = []
    # Determine market: even days = PH, odd days = IL
    market = "PH" if day % 2 == 0 else "IL"
    lang = "en" if market == "PH" else "he"

    image_path = pick_image(images, day)
    hooks = pick_hook(phase, day)
    hook_text = hooks["en"] if lang == "en" else hooks["he"]

    # Build copy incorporating hook + pricing data
    # IL market: FIXED ILS pricing (no FX recalculation), shekels only
    # PH market: PHP primary, USD secondary with rate date
    fx_date = fx.get("date", "2026-04-14")
    fx_date_display = "/".join(reversed(fx_date.split("-")))  # DD/MM/YYYY

    # Read fixed IL pricing from campaign_state
    state_path = PROJECT_ROOT / "_status" / "campaign_state.json"
    il_pricing = {"villa_d_ils": 1420888, "villa_c_ils": 1522380, "reservation_ils": 9999}
    if state_path.exists():
        state = json.loads(state_path.read_text())
        il_pricing.update(state.get("il_fixed_pricing", {}))

    WA_MARKETING = "+639542555553"
    WA_OFFICE = "+639958565865"

    if lang == "en":
        copy_text = (
            f"{hook_text}\n\n"
            f"Villa D: PHP {fx.get('villa_d_php', 28000000):,} "
            f"(approx. USD {fx.get('villa_d_usd', 0):,}, rate {fx_date_display})\n"
            f"Villa C: PHP {fx.get('villa_c_php', 30000000):,} "
            f"(approx. USD {fx.get('villa_c_usd', 0):,}, rate {fx_date_display})\n"
            f"Monthly rental income: PHP {fx.get('monthly_income_php', 395000):,}\n"
            f"BDO Bank financing available.\n\n"
            f"Reserve with PHP {fx.get('reservation_php', 200000):,} today.\n"
            f"WhatsApp: {WA_MARKETING}\n"
            f"Office: {WA_OFFICE}"
        )
    else:
        copy_text = (
            f"{hook_text}\n\n"
            f"Villa D: {il_pricing['villa_d_ils']:,} \u05e9\"\u05d7\n"
            f"Villa C: {il_pricing['villa_c_ils']:,} \u05e9\"\u05d7\n"
            f"3 \u05de\u05e1\u05dc\u05d5\u05dc\u05d9\u05dd \u05de\u05e9\u05e4\u05d8\u05d9\u05d9\u05dd \u05dc\u05d1\u05e2\u05dc\u05d5\u05ea \u05d6\u05e8\u05d9\u05dd.\n\n"
            f"\u05e9\u05e8\u05d9\u05d9\u05e0\u05d5 \u05d0\u05ea \u05d4\u05d5\u05d5\u05d9\u05dc\u05d4 \u05e9\u05dc\u05db\u05dd \u05d1-{il_pricing['reservation_ils']:,} \u05e9\"\u05d7 \u05d1\u05dc\u05d1\u05d3!\n"
            f"WhatsApp: {WA_MARKETING}\n"
            f"Office: {WA_OFFICE}"
        )

    # Daily Facebook post
    tasks.append({
        "id": task_id("CNT"),
        "priority": "HIGH",
        "type": "facebook_post",
        "status": "PENDING",
        "market": market,
        "description": f"Day {day} Facebook post ({market} market)",
        "instructions": (
            f"Publish to Facebook page. Market: {market}. "
            f"Use the provided image and copy. "
            f"Schedule for optimal engagement time."
        ),
        "copy": copy_text,
        "image_path": image_path,
        "scheduled_time": f"{today_str}T{'10:00' if market == 'PH' else '18:00'}:00+08:00",
        "hook_used": hook_text,
        "language": lang,
    })

    # Video post on days 5, 10, 15 (one per phase)
    if day in (5, 10, 15) and VIDEOS:
        video_path = pick_video(day)
        video_market = "IL" if day % 2 == 1 else "PH"
        video_lang = "he" if video_market == "IL" else "en"
        video_hook = hooks["he"] if video_lang == "he" else hooks["en"]
        if video_lang == "en":
            video_copy = (
                f"{video_hook}\n\n"
                f"Watch the full villa tour.\n"
                f"Villa D: PHP {fx.get('villa_d_php', 28000000):,}\n"
                f"Villa C: PHP {fx.get('villa_c_php', 30000000):,}\n"
                f"BDO Bank financing available.\n\n"
                f"WhatsApp: {WA_MARKETING}\n"
                f"Office: {WA_OFFICE}"
            )
        else:
            video_copy = (
                f"{video_hook}\n\n"
                f"צפו בסיור המלא בווילה.\n"
                f"Villa D: {il_pricing['villa_d_ils']:,} ש\"ח\n"
                f"Villa C: {il_pricing['villa_c_ils']:,} ש\"ח\n"
                f"3 מסלולים משפטיים לבעלות זרים.\n\n"
                f"שריינו את הווילה שלכם ב-{il_pricing['reservation_ils']:,} ש\"ח בלבד!\n"
                f"WhatsApp: {WA_MARKETING}\n"
                f"Office: {WA_OFFICE}"
            )
        tasks.append({
            "id": task_id("VID"),
            "priority": "HIGH",
            "type": "facebook_video",
            "status": "PENDING",
            "market": video_market,
            "description": f"Day {day} VIDEO post ({video_market} market)",
            "instructions": (
                f"Upload video to Facebook page. Market: {video_market}. "
                f"Use the provided video file and copy text as the post caption."
            ),
            "copy": video_copy,
            "video_path": video_path,
            "image_path": "",
            "scheduled_time": f"{today_str}T{'12:00' if video_market == 'PH' else '20:00'}:00+08:00",
            "hook_used": video_hook,
            "language": video_lang,
        })

    # Second post with alternate language (for dual-market days in later phases)
    if phase in ("CONSIDERATION", "CONVERSION", "CLOSE_PUSH", "FINAL"):
        alt_market = "IL" if market == "PH" else "PH"
        alt_lang = "he" if alt_market == "IL" else "en"
        alt_hook = hooks["he"] if alt_lang == "he" else hooks["en"]
        alt_image = pick_image(images, day + 1)

        if alt_lang == "en":
            alt_copy = (
                f"{alt_hook}\n\n"
                f"Villa D: PHP {fx.get('villa_d_php', 28000000):,} (approx. USD {fx.get('villa_d_usd', 0):,}, rate {fx_date_display})\n"
                f"Monthly rental income: PHP {fx.get('monthly_income_php', 395000):,}\n"
                f"BDO Bank financing available.\n\n"
                f"Reserve with PHP {fx.get('reservation_php', 200000):,} today.\n"
                f"WhatsApp: {WA_MARKETING}\n"
                f"Office: {WA_OFFICE}"
            )
        else:
            alt_copy = (
                f"{alt_hook}\n\n"
                f"Villa D: {il_pricing['villa_d_ils']:,} \u05e9\"\u05d7\n"
                f"Villa C: {il_pricing['villa_c_ils']:,} \u05e9\"\u05d7\n"
                f"3 \u05de\u05e1\u05dc\u05d5\u05dc\u05d9\u05dd \u05de\u05e9\u05e4\u05d8\u05d9\u05d9\u05dd \u05dc\u05d1\u05e2\u05dc\u05d5\u05ea \u05d6\u05e8\u05d9\u05dd.\n\n"
                f"\u05e9\u05e8\u05d9\u05d9\u05e0\u05d5 \u05d0\u05ea \u05d4\u05d5\u05d5\u05d9\u05dc\u05d4 \u05e9\u05dc\u05db\u05dd \u05d1-{il_pricing['reservation_ils']:,} \u05e9\"\u05d7 \u05d1\u05dc\u05d1\u05d3!\n"
                f"WhatsApp: {WA_MARKETING}\n"
                f"Office: {WA_OFFICE}"
            )

        tasks.append({
            "id": task_id("CNT"),
            "priority": "MEDIUM",
            "type": "facebook_post",
            "status": "PENDING",
            "market": alt_market,
            "description": f"Day {day} Facebook post ({alt_market} market, secondary)",
            "instructions": (
                f"Publish secondary post for {alt_market} market. "
                f"Schedule for alternate time slot."
            ),
            "copy": alt_copy,
            "image_path": alt_image,
            "scheduled_time": f"{today_str}T{'14:00' if alt_market == 'PH' else '20:00'}:00+08:00",
            "hook_used": alt_hook,
            "language": alt_lang,
        })

    # Educational/Value posts for Israeli Facebook Group (every day from day 4)
    if phase not in ("PRE_LAUNCH", "SETUP"):
        GROUP_EDU_POSTS = [
            # Day 4
            "למה פנגלאו? מדריך למשקיע הישראלי\n\nפנגלאו הוכרזה ע\"י Skyscanner כאחד מ-10 היעדים הטרנדיים בעולם ל-2025. היעד היחיד מהפיליפינים ברשימה.\n\nחיפושי טיסות קפצו ב-77% במחצית הראשונה של 2024.\n\nשדה התעופה טיפל ב-2.22 מיליון נוסעים ב-2025 - מעל הקיבולת התכנונית.\n\n12 טיסות ביום ממנילה. שעה ורבע בלבד. טיסות ישירות מקוריאה.\n\nהגשר השלישי לפנגלאו ממומן ע\"י ממשלת צרפת - P7.15 מיליארד.\n\nבפוסט הבא: השוואת תשואות ישראל מול פיליפינים.",
            # Day 5
            "השוואת תשואות: ישראל מול פיליפינים\n\nדירה בתל אביב:\n- מחיר: 5-6 מיליון שקל\n- תשואה שנתית: 2-3% ברוטו\n- תשואה נטו: 1-2%\n\nוילת יוקרה בפנגלאו:\n- מחיר: 1,450,000 שקל\n- תשואה שנתית: 10-15% ברוטו\n- ADR: 12,000-20,000 פסו ללילה\n- תפוסה: 70%+\n\nבמחיר של דירת 3 חדרים בחיפה אתה מקבל וילת יוקרה עם בריכה פרטית באי טרופי.\n\nמקור: Global Property Guide, AirDNA, Airbtics",
            # Day 6
            "JW Marriott נבנה בפנגלאו - מה זה אומר למשקיעים?\n\nAppleOne בונה את JW Marriott Panglao Island Resort & Residences על 7 הקטר בחזית ים.\n\n80 חדרי ריזורט + 70 יחידות residences ממותגות.\n\nבמקביל, South Palms Resort הופך ל-MGallery הראשון בפיליפינים (Accor) - 188 חדרים.\n\nכש-Marriott ו-Accor נכנסים, זה כבר לא אי קטן. זה מותג יעד.\n\nמשמעות למשקיע: עליית ערך נדל\"ן, ADR גבוה יותר, ביקוש בינלאומי יציב.\n\nמקור: AppleOne, Marriott Residences, Hospitality News PH",
            # Day 7
            "Panglao Shores - עיר נופש חדשה ב-25 מיליארד פסו\n\nAlturas Group בונה Township על 57.7 הקטר:\n- 6+ מלונות\n- 1,000+ יחידות מגורים\n- קונבנשן סנטר\n- קניון\n- Beach Club\n- מרכז רפואי\n- בית ספר\n\n1 ק\"מ חזית חוף לבנה. סטטוס Flagship TEZ של TIEZA.\n\nזה לא בניין בודד. זו עיר שלמה שנבנית מאפס.\n\nמי שנכנס לפני שה-Township חי - נכנס במחיר של היום עם ערך של מחר.\n\nמקור: TIEZA, PhilStar, Esquire Philippines",
            # Day 8
            "מסגרת משפטית: איך ישראלי מחזיק נכס בפיליפינים?\n\n3 מסלולים חוקיים:\n\n1. Domestic Corporation (60/40)\nחברה פיליפינית שבה הזר מחזיק עד 40% מהמניות. החברה מחזיקה את הקרקע.\n\n2. Leasehold (עד 99 שנה)\nחוק חדש (RA 12252, 2025) מאפשר חכירה עד 99 שנה. יציבות ארוכת טווח.\n\n3. בעלות על מבנה + חכירת קרקע\nהזר מחזיק את הווילה עצמה, הקרקע בחכירה ארוכה.\n\nחשוב: קיימת אמנת מס ישראל-פיליפינים (מ-1997) למניעת כפל מס.\n\nהמלצה: ליווי של עורך דין פיליפיני מנוסה בנדל\"ן זר.\n\nמקור: Reuters, OneAsia Legal, Expatmodo",
            # Day 9
            "מחירים: פנגלאו מול בורקאי מול סיארגאו\n\nמחיר למ\"ר חזית חוף:\n- פנגלאו: 27,500-49,000 פסו (BIR zonal)\n- בורקאי: 55,000-70,000+ פסו\n- סיארגאו: 25,746-39,600 פסו\n- אל נידו: 12,000-57,200 פסו\n\nפנגלאו עדיין מתומחרת מתחת לבורקאי, אבל עם כל מנועי הצמיחה:\n- Marriott + MGallery\n- שדה תעופה מעל קיבולת\n- גשר שלישי ממומן\n- Township ב-25 מיליארד\n\nהפער נסגר. מי שנכנס היום - נכנס לפני התמחור המלא.\n\nמקור: BIR Zonal Values 2025, OnePropertee, FazWaz",
            # Day 10
            "כלכלת בוהול: המחוז הצומח ביותר באזור\n\nנתונים:\n- צמיחת GDP: 6.6-8.8% ב-2024\n- תיירות = 70-74% מהתוצר\n- GDP: כ-182-198 מיליארד פסו\n- עוני ירד: מ-19.1% (2021) ל-14.8% (2023)\n\nבוהול הוכרזה כהכלכלה הצומחת ביותר ב-Central Visayas.\n\nזו לא רק השקעה ב\"אי יפה\". זו חשיפה לכלכלה אזורית צומחת עם תיירות כמנוע מרכזי.\n\nמקור: PSA, Manila Bulletin, FINEX",
            # Day 11
            "UNESCO Global Geopark - למה זה חשוב למשקיע?\n\nבוהול היא הגיאופארק הראשון של UNESCO בפיליפינים. 1 מתוך 195 בעולם.\n\nמה זה אומר:\n- הגנה על הנוף והטבע לדורות\n- שיווק בינלאומי מובנה (UNESCO = מותג עולמי)\n- תיירות איכותית ולא המונית\n- Chocolate Hills - תצורה גיאולוגית ייחודית\n- Danajon Reef - שונית מחסום כפולה, היחידה בדרום-מזרח אסיה\n\nלמשקיע: נכס בסביבה מוגנת ברמה עולמית שומר על ערכו לטווח ארוך.\n\nמקור: UNESCO, PPDO Bohol",
            # Day 12-15: repeat best performing with variations
            "Airbnb בפנגלאו - המספרים האמיתיים\n\nנתוני AirDNA/Airbtics 2025:\n- 934-1,230 נכסים פעילים\n- תפוסה ממוצעת: 41-52%\n- ADR ממוצע: 2,481-2,900 פסו\n\nווילות יוקרה (4+ חדרים, בריכה):\n- ADR: 12,000-20,000 פסו ללילה\n- תפוסה: 70%+\n- הכנסה שנתית פוטנציאלית: 7 ספרות פסו\n\nעונתיות: ינואר הכי חזק, ספטמבר הכי חלש.\n\nלהשוואה: דירה בת\"א מניבה 1-2% נטו. וילה בפנגלאו מניבה 10-15% ברוטו.\n\nמקור: AirDNA, Airbtics, AirROI",
            "שדה תעופה בוהול: מ-2 מיליון ל-4 מיליון עד 2030\n\nAboitiz InfraCapital לקחה את שדה התעופה לזיכיון 30 שנה.\n\nהמצב היום: 2.22 מיליון נוסעים ב-2025.\nהיעד: כמעט 4 מיליון עד 2030.\n\n12 טיסות ביום ממנילה. טיסות ישירות מקוריאה (Jin Air, Jeju Air, Air Busan).\n\nשדה תעופה שעובר קיבולת = אינדיקציה שהביקוש כבר כאן. ההרחבה = ערובה לצמיחה לעשור הבא.\n\nמקור: Daily Tribune, Aboitiz InfraCapital, Bohol Gov",
            "SM בונה קניון בבוהול - למה זה חשוב?\n\nSM Supermalls - הרשת הגדולה בפיליפינים - הודיעה על SM Bohol:\n- מגרש: 61,500 מ\"ר\n- 3 קומות\n- התחלת בנייה: נובמבר 2025\n- פתיחה מתוכננת: 2028\n\nSM לא בונה איפה שאין שוק. SM בונה איפה שיש Critical Mass של אוכלוסיה, תיירות וצריכה.\n\nבשילוב עם Island City Mall ו-Alturas Mall הקיימים, בוהול הופכת לכלכלת צריכה מפותחת - לא רק אי תיירותי.\n\nלמשקיע: De-risked province. שירותים עירוניים 15 דקות מהווילה.\n\nמקור: Facebook/BoholAffordableTours, SM Supermalls",
            "למה עכשיו? Timing של השקעה בפנגלאו\n\nמה כבר קרה (Proof of Concept):\n- תיירות בשיא: 1.43 מיליון\n- שדה תעופה מעל קיבולת: 2.22 מיליון נוסעים\n- גשר שלישי ממומן\n- Marriott + MGallery בבנייה\n- SM הכריז על קניון\n\nמה עוד לא קרה (Full Pricing):\n- Panglao Shores עדיין בשלבים ראשונים\n- SM עדיין לא פתוח\n- שדה התעופה עדיין לא הורחב\n- מחירים עדיין מתחת לבורקאי\n\nאתה נכנס בין הוכחת הקונספט לבין התמחור המלא. בדיוק איפה שכסף חכם נכנס.\n\nשאלות? WhatsApp: +639542555553",
        ]

        edu_idx = (day - 4) % len(GROUP_EDU_POSTS)
        edu_post = GROUP_EDU_POSTS[edu_idx]

        tasks.append({
            "id": task_id("EDU"),
            "priority": "MEDIUM",
            "type": "facebook_group_edu",
            "status": "PENDING",
            "market": "IL",
            "description": f"Day {day} educational post for Israeli FB group",
            "instructions": (
                "Post to Facebook group: נדל\"ן והשקעות בפיליפינים "
                "(https://www.facebook.com/groups/investment.ph.il/). "
                "This is an EDUCATIONAL post - value first, soft sell. "
                "Do NOT include images unless specified. Text-only knowledge post."
            ),
            "copy": edu_post,
            "image_path": "",
            "platform": "Facebook Group IL",
            "scheduled_time": f"{today_str}T11:00:00+02:00",
            "language": "he",
        })

    return tasks


def gen_ad_tasks(day: int, phase: str, fx: dict, today_str: str) -> list:
    """Generate ad management tasks."""
    tasks = []
    ad_dir = PROJECT_ROOT / "assets" / "ads"

    if phase == "PRE_LAUNCH":
        return tasks

    if phase == "SETUP":
        tasks.append({
            "id": task_id("ADS"),
            "priority": "HIGH",
            "type": "ad_setup",
            "status": "PENDING",
            "description": "Upload ad creatives to Meta Ads Manager",
            "instructions": (
                "Upload all 13 ad copy files from assets/ads/ to Meta Ads Manager. "
                "Create ad sets for IL and PH audiences. Do not publish yet."
            ),
            "ad_files": [str(f.relative_to(PROJECT_ROOT)) for f in sorted(ad_dir.glob("*.txt"))] if ad_dir.exists() else [],
        })
        return tasks

    # Active phases: determine which ads to run
    market = "PH" if day % 2 == 0 else "IL"
    prefix_map = {
        "AWARENESS": "AWARENESS",
        "CONSIDERATION": "CONSIDERATION",
        "CONVERSION": "CONVERSION",
        "CLOSE_PUSH": "CONVERSION",
        "FINAL": "CONVERSION",
    }
    ad_type = prefix_map.get(phase, "AWARENESS")
    market_code = "PH" if market == "PH" else "IL"

    # Find matching ad files
    pattern = f"META_{market_code}_{ad_type}*"
    matching = []
    if ad_dir.exists():
        matching = [str(f.relative_to(PROJECT_ROOT)) for f in sorted(ad_dir.glob(pattern + ".txt"))]

    daily_budget = DAILY_BUDGET_MAP.get(phase, 50)

    tasks.append({
        "id": task_id("ADS"),
        "priority": "HIGH",
        "type": "ad_management",
        "status": "PENDING",
        "description": f"Day {day} ad management - {ad_type} phase ({market_code})",
        "instructions": (
            f"Ensure {ad_type} ads are active for {market_code} market. "
            f"Daily budget: USD {daily_budget}. "
            f"Monitor CTR and CPC. Pause underperformers (CTR < 1%)."
        ),
        "ad_files": matching,
        "daily_budget_usd": daily_budget,
        "market": market_code,
    })

    # Google Ads task (from CONSIDERATION onward)
    if phase in ("CONSIDERATION", "CONVERSION", "CLOSE_PUSH", "FINAL"):
        google_file = f"GOOGLE_{market_code}_SEARCH_ADS.txt"
        google_path = ad_dir / google_file
        tasks.append({
            "id": task_id("ADS"),
            "priority": "MEDIUM",
            "type": "google_ads",
            "status": "PENDING",
            "description": f"Day {day} Google Search Ads ({market_code})",
            "instructions": (
                f"Review and optimize Google Search Ads for {market_code}. "
                f"Check keyword bids and quality scores."
            ),
            "ad_file": str(google_path.relative_to(PROJECT_ROOT)) if google_path.exists() else google_file,
            "market": market_code,
        })

    # Retargeting tasks (CONSIDERATION+)
    if phase in ("CONSIDERATION", "CONVERSION", "CLOSE_PUSH", "FINAL"):
        tasks.append({
            "id": task_id("ADS"),
            "priority": "HIGH",
            "type": "retargeting",
            "status": "PENDING",
            "description": f"Day {day} retargeting audience update",
            "instructions": (
                "Update retargeting audiences based on website visitors and "
                "Facebook engagement from the past 7 days. "
                "Create lookalike audiences if retargeting pool > 500."
            ),
        })

    return tasks


def gen_email_tasks(day: int, phase: str, fx: dict, today_str: str) -> list:
    """Generate email sequence tasks."""
    tasks = []

    if phase in ("PRE_LAUNCH", "SETUP", "AWARENESS"):
        return tasks

    # Email tasks from CONSIDERATION onward
    sequence_map = {
        "CONSIDERATION": {
            "subject_en": "Panglao Prime Villas - Your Investment Breakdown",
            "subject_he": "\u05e4\u05e0\u05d2\u05dc\u05d0\u05d5 \u05e4\u05e8\u05d9\u05d9\u05dd \u05d5\u05d9\u05dc\u05d5\u05ea - \u05e4\u05d9\u05e8\u05d5\u05d8 \u05d4\u05d4\u05e9\u05e7\u05e2\u05d4",
            "type": "nurture",
        },
        "CONVERSION": {
            "subject_en": "Last 2 Villas Available - Schedule Your Virtual Tour",
            "subject_he": "2 \u05d5\u05d9\u05dc\u05d5\u05ea \u05d0\u05d7\u05e8\u05d5\u05e0\u05d5\u05ea - \u05e7\u05d1\u05e2\u05d5 \u05e1\u05d9\u05d5\u05e8 \u05d5\u05d9\u05e8\u05d8\u05d5\u05d0\u05dc\u05d9",
            "type": "conversion",
        },
        "CLOSE_PUSH": {
            "subject_en": "Final Opportunity: Panglao Prime Villas Closing Soon",
            "subject_he": "\u05d4\u05d6\u05d3\u05de\u05e0\u05d5\u05ea \u05d0\u05d7\u05e8\u05d5\u05e0\u05d4: \u05e4\u05e0\u05d2\u05dc\u05d0\u05d5 \u05e4\u05e8\u05d9\u05d9\u05dd \u05d5\u05d9\u05dc\u05d5\u05ea",
            "type": "urgency",
        },
        "FINAL": {
            "subject_en": "48 Hours Left: Reserve Your Villa Now",
            "subject_he": "48 \u05e9\u05e2\u05d5\u05ea \u05d0\u05d7\u05e8\u05d5\u05e0\u05d5\u05ea: \u05d4\u05d6\u05de\u05d9\u05e0\u05d5 \u05e2\u05db\u05e9\u05d9\u05d5",
            "type": "final_push",
        },
    }

    seq = sequence_map.get(phase)
    if not seq:
        return tasks

    # Send to PH list
    tasks.append({
        "id": task_id("EML"),
        "priority": "HIGH",
        "type": f"email_{seq['type']}",
        "status": "PENDING",
        "market": "PH",
        "description": f"Day {day} email - {seq['type']} (PH)",
        "instructions": (
            f"Send {seq['type']} email to PH lead list via Brevo. "
            f"Subject: {seq['subject_en']}. "
            f"Include villa pricing from FX data and CTA to reservation form. "
            f"ATTACH PDF: PANGLAO PRIME VILLAS MARKETING 030326.pdf"
        ),
        "subject": seq["subject_en"],
        "language": "en",
        "villa_d_price": f"PHP {fx.get('villa_d_php', 28000000):,}",
        "villa_c_price": f"PHP {fx.get('villa_c_php', 30000000):,}",
    })

    # Send to IL list
    tasks.append({
        "id": task_id("EML"),
        "priority": "HIGH",
        "type": f"email_{seq['type']}",
        "status": "PENDING",
        "market": "IL",
        "description": f"Day {day} email - {seq['type']} (IL)",
        "instructions": (
            f"Send {seq['type']} email to IL lead list via Brevo. "
            f"Subject: {seq['subject_he']}. "
            f"Include villa pricing in ILS and CTA to WhatsApp. "
            f"ATTACH PDF: PANGLAO PRIME VILLAS MARKETING 030326.pdf"
        ),
        "subject": seq["subject_he"],
        "language": "he",
        "villa_d_price": f"\u20aa{fx.get('villa_d_ils', 0):,}",
        "villa_c_price": f"\u20aa{fx.get('villa_c_ils', 0):,}",
    })

    return tasks


def gen_whatsapp_tasks(day: int, phase: str, fx: dict, today_str: str) -> list:
    """Generate WhatsApp broadcast tasks on specific days."""
    tasks = []

    # WhatsApp broadcasts on days: 10, 14, 17, 21, 25, 28, 30
    broadcast_days = {10, 14, 17, 21, 25, 28, 30}
    if day not in broadcast_days:
        return tasks

    hooks = pick_hook(phase, day)

    tasks.append({
        "id": task_id("WA"),
        "priority": "HIGH",
        "type": "whatsapp_broadcast",
        "status": "PENDING",
        "description": f"Day {day} WhatsApp broadcast",
        "instructions": (
            "Send WhatsApp broadcast via WATI to all warm leads. "
            "Include personalized villa pricing and virtual tour link. "
            "Segment: leads who clicked ads or opened emails in last 7 days."
        ),
        "message_en": (
            f"{hooks['en']}\n\n"
            f"Villa D: PHP {fx.get('villa_d_php', 28000000):,} | Villa C: PHP {fx.get('villa_c_php', 30000000):,}\n"
            f"Reserve with just PHP {fx.get('reservation_php', 200000):,}.\n"
            f"Reply YES for a virtual tour."
        ),
        "message_he": (
            f"{hooks['he']}\n\n"
            f"Villa D: \u20aa{fx.get('villa_d_ils', 0):,} | Villa C: \u20aa{fx.get('villa_c_ils', 0):,}\n"
            f"\u05d4\u05d6\u05de\u05e0\u05d5 \u05e2\u05dd \u20aa{fx.get('reservation_ils', 0):,} \u05d1\u05dc\u05d1\u05d3.\n"
            f"\u05d4\u05e9\u05d9\u05d1\u05d5 \u05db\u05df \u05dc\u05e1\u05d9\u05d5\u05e8 \u05d5\u05d9\u05e8\u05d8\u05d5\u05d0\u05dc\u05d9."
        ),
    })

    # Follow-up task
    tasks.append({
        "id": task_id("WA"),
        "priority": "MEDIUM",
        "type": "whatsapp_followup",
        "status": "PENDING",
        "description": f"Day {day} WhatsApp follow-up with responders",
        "instructions": (
            "Follow up with leads who replied to the broadcast. "
            "Send virtual tour link and offer to schedule a call with sales team."
        ),
        "scheduled_time": f"{today_str}T16:00:00+08:00",
    })

    return tasks


def gen_reporting_tasks(day: int, phase: str, state: dict, today_str: str) -> list:
    """Generate daily reporting/metric collection tasks."""
    tasks = []
    platforms = state.get("platforms", {})

    # Always collect metrics from active platforms
    active_platforms = [
        name for name, info in platforms.items()
        if info.get("status") == "active"
    ]

    tasks.append({
        "id": task_id("RPT"),
        "priority": "MEDIUM",
        "type": "metric_collection",
        "status": "PENDING",
        "description": f"Day {day} metric collection",
        "instructions": (
            "Collect metrics from all active platforms: "
            f"{', '.join(active_platforms) if active_platforms else 'none active yet'}. "
            "Record: impressions, clicks, CTR, CPC, leads generated, spend."
        ),
        "active_platforms": active_platforms,
    })

    # Daily report generation
    tasks.append({
        "id": task_id("RPT"),
        "priority": "MEDIUM",
        "type": "daily_report",
        "status": "PENDING",
        "description": f"Day {day} daily report",
        "instructions": (
            "Generate daily report using scripts/daily_report_generator.py. "
            "Review metrics against KPIs. Flag any anomalies."
        ),
        "scheduled_time": f"{today_str}T21:00:00+08:00",
    })

    return tasks


def gen_lead_tasks(day: int, phase: str, today_str: str) -> list:
    """Generate lead management tasks (always)."""
    tasks = []

    tasks.append({
        "id": task_id("LED"),
        "priority": "HIGH",
        "type": "lead_check",
        "status": "PENDING",
        "description": f"Day {day} lead inbox check",
        "instructions": (
            "Check all lead sources: Facebook lead forms, website contact form, "
            "WhatsApp inquiries, email replies. "
            "Score each lead using scripts/lead_scorer.py. "
            "Respond to hot leads within 1 hour."
        ),
        "scheduled_time": f"{today_str}T09:00:00+08:00",
    })

    tasks.append({
        "id": task_id("LED"),
        "priority": "MEDIUM",
        "type": "lead_check",
        "status": "PENDING",
        "description": f"Day {day} afternoon lead check",
        "instructions": (
            "Second lead check of the day. Follow up on morning leads. "
            "Update CRM with new lead scores and notes."
        ),
        "scheduled_time": f"{today_str}T15:00:00+08:00",
    })

    # From CONVERSION onward, add dedicated follow-up task
    if phase in ("CONVERSION", "CLOSE_PUSH", "FINAL"):
        tasks.append({
            "id": task_id("LED"),
            "priority": "HIGH",
            "type": "lead_followup",
            "status": "PENDING",
            "description": f"Day {day} warm lead follow-up calls",
            "instructions": (
                "Call all warm/hot leads from the past 48 hours who have not "
                "yet scheduled a virtual tour or made a reservation. "
                "Offer to answer questions and schedule a call with the sales director."
            ),
            "scheduled_time": f"{today_str}T11:00:00+08:00",
        })

    return tasks


def gen_setup_tasks(day: int, phase: str, state: dict) -> list:
    """Generate PRE_LAUNCH and SETUP phase tasks."""
    tasks = []

    if phase == "PRE_LAUNCH":
        checklist = [
            ("Create/verify Meta Business Suite access", "HIGH"),
            ("Set up Meta Ads Manager and pixel", "HIGH"),
            ("Create Google Ads account and conversion tracking", "HIGH"),
            ("Set up Brevo account and import lead lists", "HIGH"),
            ("Set up WATI WhatsApp Business API", "MEDIUM"),
            ("Configure HubSpot CRM pipeline", "MEDIUM"),
            ("Upload all 13 ad creatives to shared drive", "HIGH"),
            ("Upload property images to asset library", "MEDIUM"),
            ("Verify Facebook page (Blue Everest Asset Group) is active", "HIGH"),
            ("Create UTM tracking spreadsheet", "MEDIUM"),
        ]
        for desc, priority in checklist:
            tasks.append({
                "id": task_id("SET"),
                "priority": priority,
                "type": "setup_checklist",
                "status": "PENDING",
                "description": desc,
                "instructions": f"Complete setup task: {desc}",
            })

    elif phase == "SETUP":
        if day == 1:
            tasks.extend([
                {
                    "id": task_id("SET"),
                    "priority": "HIGH",
                    "type": "platform_infrastructure",
                    "status": "PENDING",
                    "description": "Configure Meta ad campaigns structure",
                    "instructions": (
                        "Create campaign structure in Meta Ads Manager:\n"
                        "- Campaign 1: IL Awareness\n"
                        "- Campaign 2: PH Awareness\n"
                        "- Campaign 3: IL Retargeting\n"
                        "- Campaign 4: PH Retargeting\n"
                        "Upload all creatives but keep campaigns paused."
                    ),
                },
                {
                    "id": task_id("SET"),
                    "priority": "HIGH",
                    "type": "content_upload",
                    "status": "PENDING",
                    "description": "Upload all ad creatives and images to platforms",
                    "instructions": (
                        "Upload all 13 ad copy files from assets/ads/ and "
                        "property images from EXTERIOR - D5/ and INTERIOR D5/ "
                        "to Meta Ads Manager creative library."
                    ),
                },
            ])
        if day == 2:
            tasks.extend([
                {
                    "id": task_id("SET"),
                    "priority": "HIGH",
                    "type": "platform_infrastructure",
                    "status": "PENDING",
                    "description": "Configure Google Ads campaigns",
                    "instructions": (
                        "Set up Google Search campaigns for IL and PH markets. "
                        "Upload keyword lists and ad copy from assets/ads/GOOGLE_*.txt."
                    ),
                },
                {
                    "id": task_id("SET"),
                    "priority": "HIGH",
                    "type": "email_setup",
                    "status": "PENDING",
                    "description": "Configure Brevo email sequences",
                    "instructions": (
                        "Set up automated email sequences in Brevo based on "
                        "EMAIL-SEQUENCE.md. Create templates for nurture, "
                        "conversion, and urgency sequences."
                    ),
                },
            ])
        if day == 3:
            tasks.extend([
                {
                    "id": task_id("SET"),
                    "priority": "HIGH",
                    "type": "qa_check",
                    "status": "PENDING",
                    "description": "QA all platform setups",
                    "instructions": (
                        "Run full QA check on all platforms:\n"
                        "- Meta pixel fires correctly\n"
                        "- Google conversion tracking works\n"
                        "- Email templates render in both EN and HE\n"
                        "- WhatsApp templates approved\n"
                        "- UTM parameters correct on all links"
                    ),
                },
                {
                    "id": task_id("SET"),
                    "priority": "MEDIUM",
                    "type": "qa_check",
                    "status": "PENDING",
                    "description": "Test lead capture flow end-to-end",
                    "instructions": (
                        "Submit test leads through every channel (Facebook form, "
                        "website, WhatsApp, email reply). Verify they appear in "
                        "HubSpot CRM with correct scoring."
                    ),
                },
            ])

    return tasks


# ---------------------------------------------------------------------------
# Director brief generation
# ---------------------------------------------------------------------------

def gen_director_brief(day: int, phase: str, state: dict, fx: dict,
                       task_counts: dict, today_str: str) -> str:
    """Generate the director_brief.md content."""
    total_budget = state.get("total_budget", 2400)
    spent = state.get("spent_to_date", 0)
    remaining = total_budget - spent
    daily_budget = DAILY_BUDGET_MAP.get(phase, 0)

    # Determine focus areas
    focus_areas = {
        "PRE_LAUNCH": [
            "Complete all platform account setups",
            "Verify team access to all tools",
            "Review and approve all ad creatives",
        ],
        "SETUP": [
            "Upload all creatives to ad platforms",
            "Configure tracking pixels and UTMs",
            "QA all automated sequences",
        ],
        "AWARENESS": [
            "Monitor initial ad performance (CTR target: >2%)",
            "Publish daily organic posts to build reach",
            "Begin building retargeting audiences",
        ],
        "CONSIDERATION": [
            "Activate retargeting campaigns",
            "Launch email nurture sequences",
            "Monitor cost per lead (target: <USD 15)",
        ],
        "CONVERSION": [
            "Push for reservations and virtual tour bookings",
            "Increase ad spend on high-performing creatives",
            "Personal follow-up with all warm leads",
        ],
        "CLOSE_PUSH": [
            "Deploy urgency messaging across all channels",
            "Reallocate budget to best-performing channels",
            "Daily follow-up calls with hot leads",
        ],
        "FINAL": [
            "Final push across all channels",
            "Last-chance messaging and countdown",
            "Close remaining warm leads",
        ],
    }

    activities = []
    for category, count in task_counts.items():
        if count > 0:
            activities.append(f"- {category}: {count} task(s)")

    brief = f"""# Director Brief - Day {day}
**Date:** {today_str}
**Phase:** {phase}
**Campaign Day:** {day} of 30

---

## Budget Status
| Item | Amount |
|------|--------|
| Total Budget | USD {total_budget:,} |
| Spent to Date | USD {spent:,} |
| Remaining | USD {remaining:,} |
| Today's Planned Spend | USD {daily_budget} |
| Burn Rate | {(spent / max(day, 1)):.0f} USD/day |

---

## Today's Planned Activities
{chr(10).join(activities) if activities else '- No tasks generated'}

---

## Key Focus Areas
"""
    for focus in focus_areas.get(phase, ["Execute daily tasks"]):
        brief += f"- {focus}\n"

    brief += f"""
---

## Platform Status
"""
    platforms = state.get("platforms", {})
    for name, info in platforms.items():
        status = info.get("status", "unknown")
        brief += f"- **{name}**: {status}\n"

    brief += f"""
---

## FX Snapshot
- PHP/ILS: {fx.get('php_to_ils', 0):.6f}
- PHP/USD: {fx.get('php_to_usd', 0):.6f}
- Villa D: PHP {fx.get('villa_d_php', 0):,} = USD {fx.get('villa_d_usd', 0):,} = ILS {fx.get('villa_d_ils', 0):,}
- Villa C: PHP {fx.get('villa_c_php', 0):,} = USD {fx.get('villa_c_usd', 0):,} = ILS {fx.get('villa_c_ils', 0):,}

---
*Generated by generate_daily_tasks.py at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""
    return brief


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Generate daily task queue for Cowork agent")
    parser.add_argument("--day", type=int, default=None, help="Override campaign day (for testing)")
    args = parser.parse_args()

    # Read state files
    state = read_campaign_state()
    fx = read_fx()
    images = collect_images()

    # Determine campaign day
    day = args.day if args.day is not None else state.get("campaign_day", 0)
    phase = get_phase(day)
    today_str = date.today().isoformat()

    print(f"=== Generating Daily Tasks ===")
    print(f"Campaign Day: {day}")
    print(f"Phase: {phase}")
    print(f"Date: {today_str}")
    print(f"Images available: {len(images['exterior'])} exterior, {len(images['interior'])} interior")
    print()

    # Create output directory
    queue_dir = PROJECT_ROOT / "_queue" / today_str
    queue_dir.mkdir(parents=True, exist_ok=True)

    # Reset task counter
    global _task_counter
    _task_counter = 0

    # Generate all task categories
    task_counts = {}

    # Setup tasks (PRE_LAUNCH and SETUP only)
    setup_tasks = gen_setup_tasks(day, phase, state)
    if setup_tasks:
        with open(queue_dir / "tasks_setup.json", "w", encoding="utf-8") as f:
            json.dump(setup_tasks, f, indent=2, ensure_ascii=False)
        task_counts["Setup"] = len(setup_tasks)
        print(f"  Setup tasks: {len(setup_tasks)}")

    # Content tasks (from AWARENESS onward, but also SETUP for template prep)
    content_tasks = []
    if phase not in ("PRE_LAUNCH", "SETUP"):
        content_tasks = gen_content_tasks(day, phase, fx, images, today_str)
    if content_tasks:
        with open(queue_dir / "tasks_content.json", "w", encoding="utf-8") as f:
            json.dump(content_tasks, f, indent=2, ensure_ascii=False)
        task_counts["Content"] = len(content_tasks)
        print(f"  Content tasks: {len(content_tasks)}")

    # Ad tasks
    ad_tasks = gen_ad_tasks(day, phase, fx, today_str)
    if ad_tasks:
        with open(queue_dir / "tasks_ads.json", "w", encoding="utf-8") as f:
            json.dump(ad_tasks, f, indent=2, ensure_ascii=False)
        task_counts["Ads"] = len(ad_tasks)
        print(f"  Ad tasks: {len(ad_tasks)}")

    # Email tasks
    email_tasks = gen_email_tasks(day, phase, fx, today_str)
    if email_tasks:
        with open(queue_dir / "tasks_email.json", "w", encoding="utf-8") as f:
            json.dump(email_tasks, f, indent=2, ensure_ascii=False)
        task_counts["Email"] = len(email_tasks)
        print(f"  Email tasks: {len(email_tasks)}")

    # WhatsApp tasks
    wa_tasks = gen_whatsapp_tasks(day, phase, fx, today_str)
    if wa_tasks:
        with open(queue_dir / "tasks_whatsapp.json", "w", encoding="utf-8") as f:
            json.dump(wa_tasks, f, indent=2, ensure_ascii=False)
        task_counts["WhatsApp"] = len(wa_tasks)
        print(f"  WhatsApp tasks: {len(wa_tasks)}")

    # Lead tasks (always)
    lead_tasks = gen_lead_tasks(day, phase, today_str)
    if lead_tasks:
        with open(queue_dir / "tasks_leads.json", "w", encoding="utf-8") as f:
            json.dump(lead_tasks, f, indent=2, ensure_ascii=False)
        task_counts["Leads"] = len(lead_tasks)
        print(f"  Lead tasks: {len(lead_tasks)}")

    # Reporting tasks (always)
    reporting_tasks = gen_reporting_tasks(day, phase, state, today_str)
    if reporting_tasks:
        with open(queue_dir / "tasks_reporting.json", "w", encoding="utf-8") as f:
            json.dump(reporting_tasks, f, indent=2, ensure_ascii=False)
        task_counts["Reporting"] = len(reporting_tasks)
        print(f"  Reporting tasks: {len(reporting_tasks)}")

    # Director brief
    brief = gen_director_brief(day, phase, state, fx, task_counts, today_str)
    with open(queue_dir / "director_brief.md", "w", encoding="utf-8") as f:
        f.write(brief)
    print(f"  Director brief: generated")

    total = sum(task_counts.values())
    print(f"\nTotal tasks generated: {total}")
    print(f"Output directory: {queue_dir}")
    print("Done.")


if __name__ == "__main__":
    main()
