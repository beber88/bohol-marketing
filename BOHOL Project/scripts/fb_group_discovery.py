#!/usr/bin/env python3
"""
Facebook Group Discovery Script for Panglao Prime Villas Campaign.

Searches Facebook for relevant groups using Playwright browser automation.
Discovered groups are appended to data/facebook_groups_registry.json.

Usage:
    # Run with default settings (5 queries from highest priority segment)
    python3 scripts/fb_group_discovery.py

    # Run a specific segment
    python3 scripts/fb_group_discovery.py --segment israeli_investors

    # Run a specific number of queries
    python3 scripts/fb_group_discovery.py --max-queries 3

    # Dry run (print queries but don't execute)
    python3 scripts/fb_group_discovery.py --dry-run

    # Use a specific cookie file
    python3 scripts/fb_group_discovery.py --cookie-file /path/to/cookies.json

Requirements:
    pip install playwright
    playwright install chromium

Safety:
    - Max 5 queries per session (Facebook rate limiting)
    - 15-30 second delays between queries
    - Use a separate Facebook account for discovery (not the posting account)
    - Spread discovery across multiple days
"""

import argparse
import json
import os
import random
import re
import sys
import time
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
REGISTRY_PATH = DATA_DIR / "facebook_groups_registry.json"
QUERIES_PATH = DATA_DIR / "fb_discovery_search_queries.json"

# Limits
MAX_QUERIES_PER_SESSION = 5
DELAY_MIN_SECONDS = 15
DELAY_MAX_SECONDS = 30
SCROLL_ITERATIONS = 5
SCROLL_PAUSE_MIN = 2.0
SCROLL_PAUSE_MAX = 4.0


def load_registry():
    """Load the group registry JSON file."""
    if not REGISTRY_PATH.exists():
        print(f"[ERROR] Registry file not found: {REGISTRY_PATH}")
        sys.exit(1)
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_registry(registry):
    """Save the group registry JSON file."""
    registry["last_updated"] = datetime.now(timezone.utc).isoformat()
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)
    print(f"[OK] Registry saved with {len(registry['groups'])} groups")


def load_queries():
    """Load the search queries catalog."""
    if not QUERIES_PATH.exists():
        print(f"[ERROR] Queries file not found: {QUERIES_PATH}")
        sys.exit(1)
    with open(QUERIES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_queries(queries_data):
    """Save the search queries catalog (to update status)."""
    with open(QUERIES_PATH, "w", encoding="utf-8") as f:
        json.dump(queries_data, f, indent=2, ensure_ascii=False)


def get_existing_urls(registry):
    """Get set of already-known group URLs for deduplication."""
    urls = set()
    for group in registry.get("groups", []):
        url = group.get("url", "").rstrip("/").lower()
        if url:
            urls.add(url)
    return urls


def normalize_group_url(url):
    """Normalize a Facebook group URL for dedup comparison."""
    if not url:
        return ""
    url = url.split("?")[0].rstrip("/").lower()
    # Remove trailing /about, /members, etc.
    for suffix in ["/about", "/members", "/media", "/files", "/events"]:
        if url.endswith(suffix):
            url = url[: -len(suffix)].rstrip("/")
    return url


def extract_group_id_from_url(url):
    """Extract group slug or numeric ID from a Facebook group URL."""
    match = re.search(r"facebook\.com/groups/([^/?]+)", url)
    return match.group(1) if match else None


def parse_member_count(text):
    """Parse member count from text like '12.5K members' or '1,234 members'."""
    if not text:
        return None
    text = text.strip().lower()

    # Try "12.5k members" pattern
    m = re.search(r"([\d,.]+)\s*k\s*member", text)
    if m:
        return int(float(m.group(1).replace(",", "")) * 1000)

    # Try "1.2m members" pattern
    m = re.search(r"([\d,.]+)\s*m\s*member", text)
    if m:
        return int(float(m.group(1).replace(",", "")) * 1_000_000)

    # Try plain number "1,234 members"
    m = re.search(r"([\d,]+)\s*member", text)
    if m:
        return int(m.group(1).replace(",", ""))

    return None


def detect_privacy(text):
    """Detect group privacy from badge text."""
    if not text:
        return "unknown"
    lower = text.lower()
    if "public" in lower:
        return "public"
    if "private" in lower or "closed" in lower:
        return "private"
    return "unknown"


def guess_market_segment(query_segment):
    """Map query segment key to market_segment value."""
    mapping = {
        "israeli_investors": "israeli_investors",
        "ph_investors": "ph_investors",
        "foreign_investors_chinese": "foreign_investors_chinese",
        "foreign_investors_korean": "foreign_investors_korean",
        "foreign_investors_european": "foreign_investors_european",
        "expats_ph": "expats_ph",
        "real_estate_global": "real_estate_global",
    }
    return mapping.get(query_segment, "real_estate_general_ph")


def guess_languages(segment):
    """Guess likely languages for a market segment."""
    lang_map = {
        "israeli_investors": ["he", "en"],
        "ph_investors": ["en", "tl"],
        "foreign_investors_chinese": ["zh", "en"],
        "foreign_investors_korean": ["ko", "en"],
        "foreign_investors_european": ["en"],
        "expats_ph": ["en"],
        "real_estate_global": ["en"],
    }
    return lang_map.get(segment, ["en"])


def load_cookies(cookie_file=None):
    """Load Facebook session cookies.

    Tries in order:
    1. --cookie-file argument
    2. FB_COOKIE_FILE environment variable
    3. data/fb_cookies.json in project
    """
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

    print("[ERROR] No cookie file found. Provide one via:")
    print("  --cookie-file /path/to/cookies.json")
    print("  FB_COOKIE_FILE=/path/to/cookies.json")
    print(f"  Or place cookies at: {DATA_DIR / 'fb_cookies.json'}")
    print()
    print("Cookie file format: JSON array of cookie objects with")
    print("  name, value, domain, path fields (export from browser).")
    sys.exit(1)


def pick_queries(queries_data, segment=None, max_queries=MAX_QUERIES_PER_SESSION):
    """Pick the next batch of un-run queries to execute."""
    selected = []

    # Priority order for segments
    priority_order = ["high", "medium", "low"]
    segments = queries_data.get("segments", {})

    # Filter to specific segment if requested
    if segment:
        if segment not in segments:
            print(f"[ERROR] Unknown segment: {segment}")
            print(f"  Available: {', '.join(segments.keys())}")
            sys.exit(1)
        segment_keys = [segment]
    else:
        # Sort segments by priority
        segment_keys = sorted(
            segments.keys(),
            key=lambda s: priority_order.index(segments[s].get("priority", "low"))
            if segments[s].get("priority", "low") in priority_order
            else 99,
        )

    for seg_key in segment_keys:
        seg = segments[seg_key]
        for q in seg.get("queries", []):
            if q.get("status") == "not_run":
                selected.append((seg_key, q))
            if len(selected) >= max_queries:
                break
        if len(selected) >= max_queries:
            break

    return selected


async def run_discovery(queries_to_run, cookies, registry, queries_data, dry_run=False):
    """Execute the Facebook group search discovery."""
    from playwright.async_api import async_playwright

    existing_urls = get_existing_urls(registry)
    new_groups_total = 0

    if dry_run:
        print("\n[DRY RUN] Would execute these queries:")
        for seg, q in queries_to_run:
            label = q.get("translation", q["query"])
            print(f"  [{seg}] {q['query']} ({label})")
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

        # Add cookies
        await context.add_cookies(cookies)

        for idx, (seg_key, query_obj) in enumerate(queries_to_run):
            query_text = query_obj["query"]
            encoded_query = urllib.parse.quote(query_text)
            search_url = f"https://www.facebook.com/search/groups/?q={encoded_query}"
            label = query_obj.get("translation", query_text)

            print(f"\n[{idx+1}/{len(queries_to_run)}] Searching: {query_text}")
            if label != query_text:
                print(f"  Translation: {label}")
            print(f"  Segment: {seg_key}")

            page = await context.new_page()

            try:
                # Navigate to search
                await page.goto(search_url, wait_until="networkidle", timeout=45000)
                await page.wait_for_timeout(random.randint(3000, 5000))

                # Check for login wall
                current_url = page.url
                if "/login" in current_url or "/checkpoint" in current_url:
                    print("  [WARN] Blocked or logged out. Stopping session.")
                    query_obj["status"] = "failed"
                    query_obj["last_run"] = datetime.now(timezone.utc).isoformat()
                    await page.close()
                    break

                # Scroll to load more results
                for scroll_i in range(SCROLL_ITERATIONS):
                    await page.evaluate("window.scrollBy(0, window.innerHeight * 0.8)")
                    pause = random.uniform(SCROLL_PAUSE_MIN, SCROLL_PAUSE_MAX)
                    await page.wait_for_timeout(int(pause * 1000))

                # Extract group results
                results = await page.evaluate("""
                    () => {
                        const groups = [];
                        // Facebook search results are rendered as links with group URLs
                        const links = document.querySelectorAll('a[href*="/groups/"]');
                        const seen = new Set();

                        for (const link of links) {
                            const href = link.href || '';
                            if (!href.includes('/groups/') || href.includes('/search/')) continue;

                            // Normalize URL
                            let groupUrl = href.split('?')[0].replace(/\\/+$/, '');
                            // Remove sub-pages
                            for (const suffix of ['/about', '/members', '/media', '/files', '/events']) {
                                if (groupUrl.endsWith(suffix)) {
                                    groupUrl = groupUrl.slice(0, -suffix.length).replace(/\\/+$/, '');
                                }
                            }

                            if (seen.has(groupUrl)) continue;
                            seen.add(groupUrl);

                            // Try to get the parent card container for metadata
                            const card = link.closest('[role="article"]')
                                       || link.closest('[data-testid]')
                                       || link.parentElement?.parentElement?.parentElement;

                            const cardText = card ? card.textContent || '' : '';
                            const linkText = link.textContent || '';

                            groups.push({
                                url: groupUrl,
                                name: linkText.trim().substring(0, 200),
                                cardText: cardText.substring(0, 500),
                            });
                        }
                        return groups;
                    }
                """)

                new_in_query = 0
                for result in results:
                    url = normalize_group_url(result.get("url", ""))
                    if not url or url in existing_urls:
                        continue

                    name = result.get("name", "").strip()
                    card_text = result.get("cardText", "")

                    # Skip navigation / non-group links
                    if not name or len(name) < 3:
                        continue

                    group_id = extract_group_id_from_url(url)
                    if not group_id:
                        continue

                    member_count = parse_member_count(card_text)
                    privacy = detect_privacy(card_text)

                    new_group = {
                        "group_id": group_id,
                        "name": name,
                        "url": url + "/",
                        "member_count": member_count,
                        "member_count_updated": datetime.now().strftime("%Y-%m-%d"),
                        "privacy": privacy,
                        "join_status": "not_joined",
                        "join_request_date": None,
                        "joined_date": None,
                        "market_segment": guess_market_segment(seg_key),
                        "languages": guess_languages(seg_key),
                        "relevance_score": 50,
                        "admin_posting_rules": {
                            "allows_links": None,
                            "allows_promotional": None,
                            "requires_admin_approval": None,
                            "posting_frequency_limit": None,
                            "notes": "Not yet verified - join group first"
                        },
                        "content_strategy": None,
                        "last_checked": datetime.now().strftime("%Y-%m-%d"),
                        "last_posted": None,
                        "btce_source_id": None,
                        "is_active_for_monitoring": False,
                        "is_active_for_posting": False,
                        "discovery_source": "search_scrape",
                        "description": f"Discovered via search: {query_text}",
                        "notes": f"Found in segment '{seg_key}'. Needs manual review before activation."
                    }

                    registry["groups"].append(new_group)
                    existing_urls.add(url)
                    new_in_query += 1

                new_groups_total += new_in_query

                # Update query status
                query_obj["status"] = "completed"
                query_obj["results_count"] = len(results)
                query_obj["last_run"] = datetime.now(timezone.utc).isoformat()

                print(f"  Found {len(results)} results, {new_in_query} new groups added")

            except Exception as e:
                print(f"  [ERROR] {e}")
                query_obj["status"] = "failed"
                query_obj["last_run"] = datetime.now(timezone.utc).isoformat()

            finally:
                await page.close()

            # Delay between queries (unless this is the last one)
            if idx < len(queries_to_run) - 1:
                delay = random.uniform(DELAY_MIN_SECONDS, DELAY_MAX_SECONDS)
                print(f"  Waiting {delay:.1f}s before next query...")
                await page.wait_for_timeout(int(delay * 1000)) if not page.is_closed() else time.sleep(delay)

        await browser.close()

    # Update registry discovery status
    registry["discovery_status"]["total_groups_discovered"] = len(registry["groups"])
    registry["discovery_status"]["last_discovery_run"] = datetime.now(timezone.utc).isoformat()

    # Count statuses
    joined = sum(1 for g in registry["groups"] if g.get("join_status") == "joined")
    pending = sum(1 for g in registry["groups"] if g.get("join_status") == "pending")
    rejected = sum(1 for g in registry["groups"] if g.get("join_status") == "rejected")
    registry["discovery_status"]["groups_joined"] = joined
    registry["discovery_status"]["groups_pending"] = pending
    registry["discovery_status"]["groups_rejected"] = rejected

    return new_groups_total


async def main():
    parser = argparse.ArgumentParser(
        description="Discover Facebook groups for Panglao Prime Villas campaign"
    )
    parser.add_argument(
        "--segment",
        type=str,
        default=None,
        help="Run queries only from this segment (e.g. israeli_investors, ph_investors)",
    )
    parser.add_argument(
        "--max-queries",
        type=int,
        default=MAX_QUERIES_PER_SESSION,
        help=f"Max queries per session (default: {MAX_QUERIES_PER_SESSION})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print queries without executing",
    )
    parser.add_argument(
        "--cookie-file",
        type=str,
        default=None,
        help="Path to Facebook cookie JSON file",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("Facebook Group Discovery - Panglao Prime Villas")
    print("=" * 60)

    # Load data
    registry = load_registry()
    queries_data = load_queries()

    print(f"Registry: {len(registry['groups'])} groups")

    # Pick queries
    queries_to_run = pick_queries(queries_data, args.segment, args.max_queries)

    if not queries_to_run:
        print("\n[INFO] No un-run queries available.")
        remaining = 0
        for seg in queries_data.get("segments", {}).values():
            for q in seg.get("queries", []):
                if q.get("status") == "not_run":
                    remaining += 1
        if remaining == 0:
            print("All queries have been executed. Reset status to 'not_run' to re-scan.")
        else:
            print(f"({remaining} queries remain in other segments)")
        return

    print(f"\nWill run {len(queries_to_run)} queries:")
    for seg, q in queries_to_run:
        label = q.get("translation", q["query"])
        print(f"  [{seg}] {q['query']}")
        if label != q["query"]:
            print(f"          -> {label}")

    if args.dry_run:
        print("\n[DRY RUN] No queries will be executed.")
        return

    # Load cookies
    cookies = load_cookies(args.cookie_file)

    # Run discovery
    new_count = await run_discovery(queries_to_run, cookies, registry, queries_data)

    # Save results
    save_registry(registry)
    save_queries(queries_data)

    print(f"\n{'=' * 60}")
    print(f"Discovery complete: {new_count} new groups found")
    print(f"Total groups in registry: {len(registry['groups'])}")
    print(f"{'=' * 60}")

    # Summary of remaining queries
    remaining = 0
    for seg in queries_data.get("segments", {}).values():
        for q in seg.get("queries", []):
            if q.get("status") == "not_run":
                remaining += 1
    if remaining > 0:
        sessions_needed = (remaining + MAX_QUERIES_PER_SESSION - 1) // MAX_QUERIES_PER_SESSION
        print(f"\n{remaining} queries remain ({sessions_needed} more sessions needed)")
        print("Run again tomorrow to continue discovery.")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
