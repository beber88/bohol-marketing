#!/usr/bin/env python3
"""
fx_rates.py - Daily FX Rate Fetcher for Panglao Prime Villas
Fetches PHP-ILS and PHP-USD rates and writes /config/fx_today.json.
Runs daily at 09:00 PHT (cron or manual).

Sources:
  - ILS: exchangerate-api.com (primary), hardcoded 0.0488 (fallback)
  - USD: exchangerate-api.com (primary), hardcoded 0.0175 (fallback)

Usage:
  python3 fx_rates.py
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
import ssl
from urllib.request import urlopen, Request
from urllib.error import URLError

# SSL context for environments with certificate issues
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

# --- Config ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONFIG_DIR = PROJECT_ROOT / "config"
FX_FILE = CONFIG_DIR / "fx_today.json"

# Villa prices (PHP) - source of truth from VILLA-MARKETING-SKILL.md
VILLA_C_PHP = 30_000_000
VILLA_D_PHP = 28_000_000
MONTHLY_INCOME_PHP = 395_000
ANNUAL_INCOME_PHP = 4_740_000
RESERVATION_PHP = 200_000

# Timezone: PHT = UTC+8
PHT = timezone(timedelta(hours=8))


def fetch_rates_from_api():
    """
    Fetch both PHP-ILS and PHP-USD from exchangerate-api.com in a single call.
    Uses the free open endpoint (no API key needed).
    Returns (php_to_ils, php_to_usd) or (None, None) on failure.
    """
    url = "https://open.er-api.com/v6/latest/PHP"
    headers = {"User-Agent": "PanglaoPrimeVillas-FX/1.0"}
    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=15, context=_ssl_ctx) as resp:
            data = json.loads(resp.read())
        if data.get("result") != "success":
            print(f"[WARN] API returned non-success: {data.get('result')}")
            return None, None

        rates = data.get("rates", {})
        ils_rate = rates.get("ILS")
        usd_rate = rates.get("USD")

        if ils_rate is None:
            print("[WARN] ILS rate not found in API response")
        if usd_rate is None:
            print("[WARN] USD rate not found in API response")

        return ils_rate, usd_rate
    except (URLError, json.JSONDecodeError, KeyError) as e:
        print(f"[WARN] ExchangeRate-API fetch failed: {e}")
        return None, None


def load_previous():
    """Load previous fx_today.json for fallback rates."""
    if FX_FILE.exists():
        with open(FX_FILE, "r") as f:
            return json.load(f)
    return None


def build_fx_data(php_to_ils, source_ils, php_to_usd, source_usd, date_str):
    """Build the full FX JSON structure with all derived values."""
    return {
        "date": date_str,
        "php_to_ils": round(php_to_ils, 6),
        "php_to_usd": round(php_to_usd, 6),
        "source_ils": source_ils,
        "source_usd": source_usd,
        "villa_c_php": VILLA_C_PHP,
        "villa_c_ils": round(VILLA_C_PHP * php_to_ils),
        "villa_c_usd": round(VILLA_C_PHP * php_to_usd),
        "villa_d_php": VILLA_D_PHP,
        "villa_d_ils": round(VILLA_D_PHP * php_to_ils),
        "villa_d_usd": round(VILLA_D_PHP * php_to_usd),
        "monthly_income_php": MONTHLY_INCOME_PHP,
        "monthly_income_ils": round(MONTHLY_INCOME_PHP * php_to_ils),
        "monthly_income_usd": round(MONTHLY_INCOME_PHP * php_to_usd),
        "annual_income_php": ANNUAL_INCOME_PHP,
        "annual_income_ils": round(ANNUAL_INCOME_PHP * php_to_ils),
        "annual_income_usd": round(ANNUAL_INCOME_PHP * php_to_usd),
        "reservation_php": RESERVATION_PHP,
        "reservation_ils": round(RESERVATION_PHP * php_to_ils),
        "reservation_usd": round(RESERVATION_PHP * php_to_usd),
    }


def main():
    now = datetime.now(PHT)
    date_str = now.strftime("%Y-%m-%d")
    previous = load_previous()

    print(f"[FX] Fetching rates for {date_str} ...")
    print("[FX] Source: exchangerate-api.com (single call for ILS + USD)")

    # Fetch both rates in one API call
    api_ils, api_usd = fetch_rates_from_api()

    # ILS rate
    if api_ils is not None:
        php_to_ils = api_ils
        source_ils = "exchangerate-api.com"
        print(f"[FX] ILS rate from API: {php_to_ils}")
    elif previous and "php_to_ils" in previous:
        php_to_ils = previous["php_to_ils"]
        source_ils = f"cached ({previous.get('date', '?')})"
        print(f"[FX] Using cached ILS rate: {php_to_ils}")
    else:
        php_to_ils = 0.0488
        source_ils = "hardcoded fallback (0.0488)"
        print("[FX] Using hardcoded ILS fallback: 0.0488")

    # USD rate
    if api_usd is not None:
        php_to_usd = api_usd
        source_usd = "exchangerate-api.com"
        print(f"[FX] USD rate from API: {php_to_usd}")
    elif previous and "php_to_usd" in previous:
        php_to_usd = previous["php_to_usd"]
        source_usd = f"cached ({previous.get('date', '?')})"
        print(f"[FX] Using cached USD rate: {php_to_usd}")
    else:
        php_to_usd = 0.0175
        source_usd = "hardcoded fallback (0.0175)"
        print("[FX] Using hardcoded USD fallback: 0.0175")

    # Build and write
    fx_data = build_fx_data(php_to_ils, source_ils, php_to_usd, source_usd, date_str)

    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(FX_FILE, "w") as f:
        json.dump(fx_data, f, indent=2, ensure_ascii=False)

    print(f"[FX] Written to {FX_FILE}")
    print(f"[FX] PHP-ILS: {php_to_ils:.6f} ({source_ils})")
    print(f"[FX] PHP-USD: {php_to_usd:.6f} ({source_usd})")
    print(f"[FX] Villa D: PHP {VILLA_D_PHP:,} = ILS {fx_data['villa_d_ils']:,} = USD {fx_data['villa_d_usd']:,}")
    print(f"[FX] Villa C: PHP {VILLA_C_PHP:,} = ILS {fx_data['villa_c_ils']:,} = USD {fx_data['villa_c_usd']:,}")

    return fx_data


if __name__ == "__main__":
    main()
