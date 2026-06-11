#!/usr/bin/env python3
"""
Validate marketing task copy against the Panglao Prime Villas campaign rules.

Importable:
    from validate_task import validate_copy
    result = validate_copy("your ad copy here", market="IL")

CLI:
    python3 validate_task.py "some copy text" --market IL
    python3 validate_task.py --file path/to/task.json
"""

import argparse
import json
import re
import sys


# ---------------------------------------------------------------------------
# Rule definitions
# ---------------------------------------------------------------------------

FORBIDDEN_WORDS_EN = [
    "amazing",
    "incredible",
    "dream home",
    "once in a lifetime",
]

FORBIDDEN_WORDS_HE = [
    "\u05de\u05d3\u05d4\u05d9\u05dd",        # מדהים
    "\u05d1\u05dc\u05ea\u05d9 \u05e0\u05e9\u05db\u05d7",  # בלתי נשכח
    "\u05d1\u05d9\u05ea \u05d4\u05d7\u05dc\u05d5\u05de\u05d5\u05ea",  # בית החלומות
    "\u05d4\u05d6\u05d3\u05de\u05e0\u05d5\u05ea \u05e9\u05dc \u05e4\u05e2\u05dd \u05d1\u05d7\u05d9\u05d9\u05dd",  # הזדמנות של פעם בחיים
]

FORBIDDEN_WORDS = FORBIDDEN_WORDS_EN + FORBIDDEN_WORDS_HE

FORBIDDEN_CHARS = {
    "\u2014": "em dash (\u2014)",
    "\u2013": "en dash (\u2013)",
    "\u05be": "Hebrew maqaf (\u05be)",
}

REQUIRED_NUMBERS = [
    "395,000",
    "395K",
    "4,740,000",
    "4.74M",
    "17-25%",
    "136.9%",
    "65%",
    "80.9%",
    "200,000",
    "200K",
    "60 seconds",
    "263.78",
    "4 bedrooms",
    "15.08",
    "28,000,000",
    "28M",
    "30,000,000",
    "30M",
]

IL_OWNERSHIP_TERMS = [
    "deed of assignment",
    "leasehold",
    "domestic corporation",
    "3 legal",
    "3 \u05de\u05e1\u05dc\u05d5\u05dc\u05d9\u05dd",  # 3 מסלולים
    "3 ownership",
]

CTA_PATTERNS = [
    r"\+?\d[\d\s\-()]{7,}",   # phone number
    r"(?i)whatsapp",
    r"wa\.me",
    r"(?i)primevilla",
    r"(?i)schedule",
    r"(?i)book",
    r"(?i)\bcall\b",
    r"https?://\S+",
]


# ---------------------------------------------------------------------------
# Core validation
# ---------------------------------------------------------------------------

def validate_copy(text: str, market: str = "both") -> dict:
    """Validate a piece of marketing copy against campaign rules.

    Args:
        text: The ad / post copy to validate.
        market: One of "IL", "PH", or "both" (case-insensitive).

    Returns:
        dict with keys ``valid`` (bool), ``errors`` (list[str]),
        ``warnings`` (list[str]).
    """
    errors: list[str] = []
    warnings: list[str] = []
    market = market.upper()

    if not text or not text.strip():
        return {"valid": False, "errors": ["Copy is empty."], "warnings": []}

    text_lower = text.lower()

    # --- Forbidden words ---------------------------------------------------
    for word in FORBIDDEN_WORDS:
        if word.lower() in text_lower:
            errors.append(f'Forbidden word/phrase found: "{word}"')

    # --- Forbidden characters ----------------------------------------------
    for char, label in FORBIDDEN_CHARS.items():
        if char in text:
            errors.append(f"Forbidden character found: {label}")

    # --- Must contain a recognized number ----------------------------------
    if not any(n in text for n in REQUIRED_NUMBERS):
        errors.append(
            "Missing required number. Copy must include at least one of: "
            + ", ".join(REQUIRED_NUMBERS[:6])
            + " ... (see full list in script)"
        )

    # --- Israeli market rules ----------------------------------------------
    if market in ("IL", "BOTH"):
        found_ownership = any(
            term.lower() in text_lower for term in IL_OWNERSHIP_TERMS
        )
        if not found_ownership:
            errors.append(
                "Israeli content must mention one of: "
                + ", ".join(f'"{t}"' for t in IL_OWNERSHIP_TERMS)
            )

    # --- Filipino market rules ---------------------------------------------
    if market in ("PH", "BOTH"):
        if "bdo" not in text_lower:
            errors.append('Filipino content must mention "BDO".')

    # --- CTA check ---------------------------------------------------------
    has_cta = any(re.search(pat, text) for pat in CTA_PATTERNS)
    if not has_cta:
        errors.append(
            "No CTA found. Include a phone number, WhatsApp link, URL, "
            'or action word (schedule, book, call).'
        )

    # --- Soft warnings -----------------------------------------------------
    if len(text) < 50:
        warnings.append("Copy is very short (< 50 chars). Consider expanding.")
    if len(text) > 2000:
        warnings.append("Copy is very long (> 2000 chars). Consider trimming.")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }


# ---------------------------------------------------------------------------
# CLI helpers
# ---------------------------------------------------------------------------

def _print_result(label: str, result: dict) -> None:
    status = "PASS" if result["valid"] else "FAIL"
    print(f"\n{'=' * 60}")
    print(f"  {label}  [{status}]")
    print(f"{'=' * 60}")
    if result["errors"]:
        for err in result["errors"]:
            print(f"  ERROR   {err}")
    if result["warnings"]:
        for warn in result["warnings"]:
            print(f"  WARN    {warn}")
    if result["valid"] and not result["warnings"]:
        print("  All checks passed.")


def _validate_file(path: str) -> int:
    """Read a task JSON file and validate each task's copy field.

    Returns 0 if all tasks pass, 1 otherwise.
    """
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    tasks = []
    if isinstance(data, list):
        tasks = data
    elif isinstance(data, dict):
        # Support {"tasks": [...]} wrapper or a single task object
        if "tasks" in data:
            tasks = data["tasks"]
        else:
            tasks = [data]

    if not tasks:
        print("No tasks found in file.")
        return 1

    all_valid = True
    for idx, task in enumerate(tasks):
        copy = task.get("copy", "")
        market = task.get("market", "both")
        label = task.get("name") or task.get("id") or f"Task {idx + 1}"
        result = validate_copy(copy, market=market)
        _print_result(label, result)
        if not result["valid"]:
            all_valid = False

    return 0 if all_valid else 1


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate marketing copy against campaign rules."
    )
    parser.add_argument(
        "text",
        nargs="?",
        default=None,
        help="Inline copy text to validate.",
    )
    parser.add_argument(
        "--market",
        default="both",
        choices=["IL", "PH", "both"],
        type=str,
        help='Target market: IL, PH, or both (default: both).',
    )
    parser.add_argument(
        "--file",
        default=None,
        metavar="PATH",
        help="Path to a task JSON file to validate.",
    )

    args = parser.parse_args()

    if args.file:
        return _validate_file(args.file)

    if args.text is None:
        parser.print_help()
        return 2

    result = validate_copy(args.text, market=args.market)
    _print_result("Inline copy", result)
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
