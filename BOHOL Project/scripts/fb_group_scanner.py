#!/usr/bin/env python3
"""
Facebook Group Post Scanner - Panglao Prime Villas Campaign.

Scans posts from joined Facebook groups listed in the registry,
scores them for real estate investor intent, and saves qualifying
leads to data/investor_leads.json.

This is a STANDALONE scanner for the Bohol Marketing campaign.
It does NOT connect to any external codebase or database.

Usage:
    # Scan all joined groups
    python3 scripts/fb_group_scanner.py

    # Scan a specific group by ID
    python3 scripts/fb_group_scanner.py --group investment.ph.il

    # Dry run (show what would be scanned)
    python3 scripts/fb_group_scanner.py --dry-run

    # Specify cookie file
    python3 scripts/fb_group_scanner.py --cookie-file /path/to/cookies.json

Requirements:
    pip install playwright
    playwright install chromium
"""

import argparse
import json
import os
import random
import re
import sys
import hashlib
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
REGISTRY_PATH = DATA_DIR / "facebook_groups_registry.json"
LEADS_PATH = DATA_DIR / "investor_leads.json"

# Scanner settings
HOURS_LOOKBACK = 72
SCROLL_ITERATIONS = 5
POST_TEXT_MAX_LENGTH = 2000
DELAY_BETWEEN_GROUPS_MIN = 8
DELAY_BETWEEN_GROUPS_MAX = 20
SCORE_THRESHOLD = 30


# ============================================
# Cookie Management
# ============================================

def load_cookies(cookie_file=None):
    """Load Facebook session cookies from file."""
    paths_to_try = []
    if cookie_file:
        paths_to_try.append(Path(cookie_file))
    env_path = os.environ.get("FB_COOKIE_FILE")
    if env_path:
        paths_to_try.append(Path(env_path))
    paths_to_try.append(DATA_DIR / "fb_cookies.json")

    for path in paths_to_try:
        if path.exists():
            print(f"[OK] Loading cookies from: {path}")
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)

    print("[ERROR] No cookie file found.")
    print("  --cookie-file /path/to/cookies.json")
    print(f"  Or place at: {DATA_DIR / 'fb_cookies.json'}")
    sys.exit(1)


# ============================================
# Registry
# ============================================

def load_registry():
    if not REGISTRY_PATH.exists():
        print(f"[ERROR] Registry not found: {REGISTRY_PATH}")
        sys.exit(1)
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_scannable_groups(registry, group_filter=None):
    """Get groups that are joined and active for monitoring."""
    groups = []
    for g in registry.get("groups", []):
        if g.get("join_status") != "joined":
            continue
        if not g.get("is_active_for_monitoring"):
            continue
        if group_filter and g.get("group_id") != group_filter:
            continue
        groups.append(g)
    return groups


# ============================================
# Leads Storage
# ============================================

def load_leads():
    """Load existing leads file."""
    if LEADS_PATH.exists():
        with open(LEADS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"version": "1.0", "last_scan": None, "leads": []}


def save_leads(leads_data):
    """Save leads file."""
    leads_data["last_scan"] = datetime.now(timezone.utc).isoformat()
    with open(LEADS_PATH, "w", encoding="utf-8") as f:
        json.dump(leads_data, f, indent=2, ensure_ascii=False)


def post_hash(group_id, text):
    """Create a dedup hash for a post."""
    key = f"{group_id}:{text[:200]}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:16]


def is_duplicate(leads_data, hash_val):
    """Check if a lead already exists."""
    return any(l.get("hash") == hash_val for l in leads_data.get("leads", []))


# ============================================
# Time Parsing
# ============================================

def parse_relative_time(time_text):
    """Parse relative time text from Facebook posts."""
    if not time_text:
        return None
    lower = time_text.lower().strip()

    m = re.search(r"(\d+)\s*m(?:in(?:ute)?s?)?\s*(?:ago)?", lower)
    if m:
        return datetime.now(timezone.utc) - timedelta(minutes=int(m.group(1)))

    m = re.search(r"(\d+)\s*h(?:(?:ou)?rs?)?\s*(?:ago)?", lower)
    if m:
        return datetime.now(timezone.utc) - timedelta(hours=int(m.group(1)))

    m = re.search(r"(\d+)\s*d(?:ays?)?\s*(?:ago)?", lower)
    if m:
        return datetime.now(timezone.utc) - timedelta(days=int(m.group(1)))

    if "yesterday" in lower:
        return datetime.now(timezone.utc) - timedelta(days=1)

    if "just now" in lower or lower == "now":
        return datetime.now(timezone.utc)

    return None


def is_within_lookback(post_date):
    """Check if post is within the lookback window."""
    if not post_date:
        return True
    cutoff = datetime.now(timezone.utc) - timedelta(hours=HOURS_LOOKBACK)
    return post_date >= cutoff


# ============================================
# Post Extraction
# ============================================

async def extract_posts_from_group(page, group_name):
    """Extract posts from a loaded Facebook group page."""
    # Scroll to load posts
    for _ in range(SCROLL_ITERATIONS * 2):
        await page.evaluate("window.scrollBy(0, window.innerHeight * 0.8)")
        pause = random.uniform(2.0, 3.5)
        await page.wait_for_timeout(int(pause * 1000))

    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(random.randint(1000, 2000))
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    await page.wait_for_timeout(random.randint(2000, 3000))

    # Extract posts via in-page evaluation
    raw_posts = await page.evaluate("""
        () => {
            const results = [];
            const articles = document.querySelectorAll('[role="article"]');
            for (const article of articles) {
                const text = article.textContent?.trim() || '';
                if (text.length < 30) continue;

                const authorEl = article.querySelector('strong a, h2 a, h3 a');
                const authorName = authorEl?.textContent?.trim() || 'Unknown';
                const authorHref = authorEl?.href || '';

                const timeLink = article.querySelector('a[href*="/posts/"], a[href*="permalink"]');
                const postHref = timeLink?.href || '';

                const timeEl = article.querySelector('abbr');
                const timeText = timeEl?.textContent?.trim() || '';

                results.push({
                    text: text.substring(0, 2000),
                    authorName,
                    authorHref,
                    postHref,
                    timeText
                });
            }
            return results;
        }
    """)

    posts = []
    for raw in raw_posts:
        text = raw.get("text", "").strip()
        if not text or len(text) < 20:
            continue

        posted_at = parse_relative_time(raw.get("timeText", ""))
        if not is_within_lookback(posted_at):
            continue

        author_href = raw.get("authorHref", "")
        if author_href and not author_href.startswith("http"):
            author_href = f"https://www.facebook.com{author_href}"

        post_href = raw.get("postHref", "")
        if post_href and not post_href.startswith("http"):
            post_href = f"https://www.facebook.com{post_href}"

        posts.append({
            "text": text[:POST_TEXT_MAX_LENGTH],
            "author_name": raw.get("authorName", "Unknown"),
            "author_url": author_href,
            "post_url": post_href,
            "posted_at": posted_at.isoformat() if posted_at else None,
            "group_name": group_name,
        })

    return posts


# ============================================
# Scoring (imported from fb_lead_scorer)
# ============================================

# Import the scoring module from the same scripts directory
sys.path.insert(0, str(Path(__file__).parent))
from fb_lead_scorer import score_post, classify_intent, detect_investor_origin, detect_property_interest, detect_budget, detect_timeline, get_matched_keywords


# ============================================
# Main Scanner
# ============================================

async def run_scan(groups, cookies, leads_data, dry_run=False):
    """Scan Facebook groups for investor leads."""
    from playwright.async_api import async_playwright

    total_posts = 0
    new_leads = 0

    if dry_run:
        print("\n[DRY RUN] Would scan these groups:")
        for g in groups:
            print(f"  {g['name']} ({g['url']})")
        return 0

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
            ],
        )

        context = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            ),
            locale="en-US",
        )
        await context.add_cookies(cookies)

        for idx, group in enumerate(groups):
            group_id = group["group_id"]
            group_name = group["name"]
            group_url = group["url"]

            print(f"\n[{idx+1}/{len(groups)}] Scanning: {group_name}")

            page = await context.new_page()
            try:
                await page.goto(group_url, wait_until="networkidle", timeout=45000)
                await page.wait_for_timeout(random.randint(4000, 7000))

                # Check for login wall
                current_url = page.url
                if "/login" in current_url or "/checkpoint" in current_url:
                    print("  [WARN] Blocked or logged out. Skipping.")
                    await page.close()
                    continue

                # Wait for feed
                await page.wait_for_selector(
                    '[role="article"], [role="feed"]', timeout=15000
                ).catch_(lambda _: None) if hasattr(page, 'catch_') else None
                try:
                    await page.wait_for_selector('[role="article"], [role="feed"]', timeout=15000)
                except Exception:
                    pass

                # Extract posts
                posts = await extract_posts_from_group(page, group_name)
                total_posts += len(posts)

                # Score each post
                group_leads = 0
                for post in posts:
                    score = score_post(post["text"])
                    if score < SCORE_THRESHOLD:
                        continue

                    h = post_hash(group_id, post["text"])
                    if is_duplicate(leads_data, h):
                        continue

                    intent = classify_intent(score)
                    origin = detect_investor_origin(post["text"])
                    prop_interest = detect_property_interest(post["text"])
                    budget = detect_budget(post["text"])
                    timeline = detect_timeline(post["text"])
                    keywords = get_matched_keywords(post["text"])

                    lead = {
                        "hash": h,
                        "discovered_at": datetime.now(timezone.utc).isoformat(),
                        "group_id": group_id,
                        "group_name": group_name,
                        "post_url": post["post_url"],
                        "post_text": post["text"][:500],
                        "author_name": post["author_name"],
                        "author_url": post["author_url"],
                        "posted_at": post["posted_at"],
                        "score": score,
                        "intent_class": intent,
                        "investor_origin": origin,
                        "property_interest": prop_interest,
                        "budget_hint": budget,
                        "timeline": timeline,
                        "matched_keywords": keywords,
                        "status": "new",
                        "notes": None,
                    }

                    leads_data["leads"].append(lead)
                    group_leads += 1
                    new_leads += 1

                print(f"  {len(posts)} posts checked, {group_leads} new leads found (score >= {SCORE_THRESHOLD})")

            except Exception as e:
                print(f"  [ERROR] {e}")
            finally:
                await page.close()

            # Polite delay between groups
            if idx < len(groups) - 1:
                delay = random.uniform(DELAY_BETWEEN_GROUPS_MIN, DELAY_BETWEEN_GROUPS_MAX)
                print(f"  Waiting {delay:.0f}s...")
                import asyncio
                await asyncio.sleep(delay)

        await browser.close()

    return new_leads


async def main():
    parser = argparse.ArgumentParser(
        description="Scan Facebook groups for investor leads - Panglao Prime Villas"
    )
    parser.add_argument("--group", type=str, default=None, help="Scan only this group ID")
    parser.add_argument("--dry-run", action="store_true", help="Show groups without scanning")
    parser.add_argument("--cookie-file", type=str, default=None, help="Path to cookie JSON")
    args = parser.parse_args()

    print("=" * 60)
    print("Facebook Group Scanner - Panglao Prime Villas")
    print("=" * 60)

    registry = load_registry()
    groups = get_scannable_groups(registry, args.group)

    if not groups:
        print("\n[INFO] No scannable groups found.")
        print("  Groups need join_status='joined' AND is_active_for_monitoring=true")
        return

    print(f"\n{len(groups)} groups to scan")

    leads_data = load_leads()
    existing_count = len(leads_data.get("leads", []))
    print(f"Existing leads: {existing_count}")

    if not args.dry_run:
        cookies = load_cookies(args.cookie_file)

    new_leads = await run_scan(groups, cookies, leads_data, dry_run=args.dry_run)

    if not args.dry_run:
        save_leads(leads_data)
        print(f"\n{'=' * 60}")
        print(f"Scan complete: {new_leads} new leads found")
        print(f"Total leads in file: {len(leads_data['leads'])}")

        # Summary by intent class
        hot = sum(1 for l in leads_data["leads"] if l.get("intent_class") == "Hot Investor Lead")
        warm = sum(1 for l in leads_data["leads"] if l.get("intent_class") == "Warm Investor Lead")
        monitor = sum(1 for l in leads_data["leads"] if l.get("intent_class") == "Monitor")
        print(f"  Hot: {hot} | Warm: {warm} | Monitor: {monitor}")
        print(f"{'=' * 60}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
