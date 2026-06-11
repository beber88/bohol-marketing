#!/usr/bin/env python3
"""
refresh_assets.py - Update FX values across all marketing assets.
Reads /config/fx_today.json and updates currency mentions in /assets/ files.
Run after fx_rates.py to keep all assets in sync.

Usage:
  python3 refresh_assets.py           # dry run (show changes)
  python3 refresh_assets.py --apply   # apply changes to files
"""

import json
import os
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
FX_FILE = PROJECT_ROOT / "config" / "fx_today.json"
ASSETS_DIR = PROJECT_ROOT / "assets"

# Regex patterns for currency values we need to update
# Matches patterns like: ILS 1,366,400 or ILS 1366400 or 1,364,892 שקל
PATTERNS = {
    "villa_d_ils": [
        # English: ILS followed by number with commas
        (r"ILS\s+[\d,]+(?=\s)", "ILS {val:,}"),
        # Hebrew: number followed by שקל
        (r"[\d,]+\s*שקל", "{val:,} שקל"),
        # Inline: ~X שקל or בערך X שקל
        (r"(?:כ-?|בערך\s+)[\d,]+\s*שקל", "כ-{val:,} שקל"),
        # Pattern: = ILS X or = X שקל
        (r"=\s*(?:ILS\s+)?[\d,]+(?:\s*שקל)?", "= ILS {val:,}"),
    ],
    "villa_c_ils": [
        # Villa C specific - contextual (near PHP 30M or Villa C)
    ],
    "villa_d_usd": [
        (r"\$\s*[\d,]+(?=\s|\.|\))", "${val:,}"),
        (r"USD\s+[\d,]+", "USD {val:,}"),
    ],
    "monthly_income_ils": [
        # Monthly ILS values near income context
    ],
    "monthly_income_usd": [],
}

# FX metadata block template
FX_METADATA_BLOCK = """
=== FX METADATA ===
FX date used: {date}
PHP-ILS rate: {php_to_ils}
PHP-USD rate: {php_to_usd}
Auto-refresh: enabled
"""


def load_fx():
    """Load current FX rates."""
    if not FX_FILE.exists():
        print(f"[ERROR] {FX_FILE} not found. Run fx_rates.py first.")
        sys.exit(1)
    with open(FX_FILE, "r") as f:
        return json.load(f)


def format_number(n):
    """Format number with commas: 1366400 -> 1,366,400"""
    return f"{n:,}"


def update_fx_metadata(content, fx):
    """Add or update the FX METADATA block at end of file."""
    block = FX_METADATA_BLOCK.format(
        date=fx["date"],
        php_to_ils=fx["php_to_ils"],
        php_to_usd=fx["php_to_usd"],
    ).strip()

    # Remove existing FX METADATA block if present
    content = re.sub(
        r"\n*=== FX METADATA ===.*?Auto-refresh: enabled",
        "",
        content,
        flags=re.DOTALL,
    )

    # Append new block
    content = content.rstrip() + "\n\n" + block + "\n"
    return content


def update_villa_d_ils(content, fx):
    """Update Villa D ILS values. Context-aware: only near PHP 28M or Villa D references."""
    val = format_number(fx["villa_d_ils"])

    # Pattern: PHP 28,000,000 = ... ILS/שקל number
    # Update "1,364,892 שקל" or similar near "28,000,000" or "28M"
    content = re.sub(
        r"(28[,.]?000[,.]?000.*?(?:=|בערך)\s*(?:כ-?)?)[\d,]{5,}(\s*שקל)",
        rf"\g<1>{val}\2",
        content,
    )
    content = re.sub(
        r"(28[,.]?000[,.]?000.*?(?:=|≈)\s*(?:ILS\s*)?)[\d,]{5,}",
        rf"\g<1>{val}",
        content,
    )

    # Pattern: ILS 1.36M or 1.36M שקל (rounded millions)
    ils_m = fx["villa_d_ils"] / 1_000_000
    content = re.sub(
        r"(ILS\s+)[\d.]+M",
        rf"\g<1>{ils_m:.2f}M",
        content,
    )

    return content


def update_villa_c_ils(content, fx):
    """Update Villa C ILS values near PHP 30M or Villa C references."""
    val = format_number(fx["villa_c_ils"])

    content = re.sub(
        r"(30[,.]?000[,.]?000.*?(?:=|בערך)\s*(?:כ-?)?)[\d,]{5,}(\s*שקל)",
        rf"\g<1>{val}\2",
        content,
    )

    return content


def update_monthly_ils(content, fx):
    """Update monthly income ILS values."""
    val = format_number(fx["monthly_income_ils"])
    # Near "395,000" and ILS/שקל context
    content = re.sub(
        r"(395[,.]?000.*?(?:=|בערך)\s*(?:כ-?)?)[\d,]{4,}(\s*שקל)",
        rf"\g<1>{val}\2",
        content,
    )
    return content


def process_file(filepath, fx, apply=False):
    """Process a single asset file."""
    with open(filepath, "r", encoding="utf-8") as f:
        original = f.read()

    content = original

    # Apply updates
    content = update_villa_d_ils(content, fx)
    content = update_villa_c_ils(content, fx)
    content = update_monthly_ils(content, fx)

    # Add/update FX metadata block (only for .txt and .md files in assets)
    ext = filepath.suffix.lower()
    if ext in (".txt", ".md"):
        content = update_fx_metadata(content, fx)

    if content != original:
        changes = sum(
            1
            for a, b in zip(original.splitlines(), content.splitlines())
            if a != b
        )
        print(f"  [CHANGED] {filepath.relative_to(PROJECT_ROOT)} ({changes} lines)")
        if apply:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"    -> Written")
        return True
    else:
        print(f"  [OK] {filepath.relative_to(PROJECT_ROOT)} (no changes needed)")
        return False


def main():
    apply = "--apply" in sys.argv
    fx = load_fx()

    print(f"[REFRESH] FX date: {fx['date']}")
    print(f"[REFRESH] PHP-ILS: {fx['php_to_ils']} | PHP-USD: {fx['php_to_usd']}")
    print(f"[REFRESH] Mode: {'APPLY' if apply else 'DRY RUN'}")
    print()

    if not ASSETS_DIR.exists():
        print(f"[WARN] {ASSETS_DIR} does not exist yet. No files to update.")
        return

    changed = 0
    total = 0

    for filepath in sorted(ASSETS_DIR.rglob("*")):
        if filepath.is_file() and filepath.suffix.lower() in (
            ".txt", ".md", ".html", ".json",
        ):
            total += 1
            if process_file(filepath, fx, apply):
                changed += 1

    print()
    print(f"[REFRESH] {total} files scanned, {changed} changed")
    if not apply and changed > 0:
        print("[REFRESH] Run with --apply to write changes to disk")


if __name__ == "__main__":
    main()
