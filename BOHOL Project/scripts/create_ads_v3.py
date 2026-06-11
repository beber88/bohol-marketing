#!/usr/bin/env python3
"""
Ad Creative Generator v3 - Clean Property Images
Philosophy: Let the property speak. Minimal text on image.
All marketing copy goes in the Facebook/Instagram post body.

Image = 90%+ property render + small logo watermark + optional subtle price bar
"""

from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
from pathlib import Path

# === PATHS ===
PROJECT = Path("/Users/admin/Downloads/Bohol Marketing")
BOHOL = PROJECT / "BOHOL Project"
EXTERIOR = BOHOL / "EXTERIOR - D5" / "LATEST RENDERS - EXTERIOR"
EXTERIOR_ORIG = BOHOL / "EXTERIOR - D5"
INTERIOR = BOHOL / "INTERIOR D5"
FONTS = BOHOL / "assets" / "fonts"
OUTPUT = BOHOL / "assets" / "ad_creatives" / "v3_clean"
OUTPUT.mkdir(parents=True, exist_ok=True)
LOGO_PATH = PROJECT / "LOGO.PNG"

# === BRAND COLORS ===
CHARCOAL = (18, 18, 18)
WHITE = (255, 255, 255)
GOLD = (189, 165, 127)
GOLD_DARK = (154, 133, 99)


# === HELPERS ===
def load_font(name, size):
    paths = {
        "display": FONTS / "PlayfairDisplay-Bold.ttf",
        "body": FONTS / "PlusJakartaSans-Bold.ttf",
    }
    try:
        return ImageFont.truetype(str(paths.get(name, paths["body"])), size)
    except Exception:
        return ImageFont.load_default()


def crop_cover(img, target_w, target_h):
    """Center-crop image to target aspect ratio, then resize."""
    src_w, src_h = img.size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h

    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        offset = (src_w - new_w) // 2
        img = img.crop((offset, 0, offset + new_w, src_h))
    else:
        new_h = int(src_w / target_ratio)
        offset = (src_h - new_h) // 2
        img = img.crop((0, offset, src_w, offset + new_h))

    return img.resize((target_w, target_h), Image.LANCZOS)


def warm_grade(img):
    """Apply subtle warm golden-hour color grading."""
    # Slight warmth
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(1.08)
    # Slight contrast boost
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.05)
    # Slight brightness
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(1.02)
    return img


def add_logo_watermark(img, logo_size=80, margin=20, opacity=0.55):
    """Add small semi-transparent logo watermark at bottom-right."""
    if not LOGO_PATH.exists():
        print("  WARNING: LOGO.PNG not found, skipping watermark")
        return img

    logo = Image.open(LOGO_PATH).convert("RGBA")
    # Resize logo maintaining aspect ratio
    ratio = logo_size / max(logo.size)
    new_size = (int(logo.width * ratio), int(logo.height * ratio))
    logo = logo.resize(new_size, Image.LANCZOS)

    # Apply opacity
    alpha = logo.split()[3]
    alpha = alpha.point(lambda p: int(p * opacity))
    logo.putalpha(alpha)

    # Position: bottom-right with margin
    img_rgba = img.convert("RGBA")
    x = img.width - logo.width - margin
    y = img.height - logo.height - margin
    img_rgba.paste(logo, (x, y), logo)

    return img_rgba.convert("RGB")


def add_subtle_price_bar(img, text, bar_height_pct=0.07):
    """Add a subtle semi-transparent bar at bottom with one line of text."""
    w, h = img.size
    bar_h = int(h * bar_height_pct)

    img_rgba = img.convert("RGBA")

    # Create semi-transparent dark overlay
    overlay = Image.new("RGBA", (w, bar_h), (18, 18, 18, 140))
    img_rgba.paste(overlay, (0, h - bar_h), overlay)

    # Add text centered in the bar
    draw = ImageDraw.Draw(img_rgba)
    font_size = max(16, int(bar_h * 0.42))
    font = load_font("display", font_size)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (w - tw) // 2
    ty = h - bar_h + (bar_h - th) // 2
    draw.text((tx, ty), text, fill=WHITE, font=font)

    return img_rgba.convert("RGB")


def find_image(name):
    """Find image in enhanced or original folders."""
    enhanced = EXTERIOR / name
    if enhanced.exists():
        return enhanced
    orig_name = name.replace(" ENHANCED", "_AI").replace(" ENHANCED", "")
    orig = EXTERIOR_ORIG / orig_name
    if orig.exists():
        return orig
    return None


def generate_clean_ad(source_path, output_name, target_w, target_h, bar_text=None):
    """Generate a clean ad image from a property render.

    1. Full-bleed property render
    2. Subtle warm color grading
    3. Optional one-line price bar at bottom (max 7% height)
    4. Small logo watermark
    """
    if not source_path or not Path(source_path).exists():
        print(f"  SKIP: Source not found for {output_name}")
        return False

    # Load and crop to target dimensions
    img = Image.open(source_path).convert("RGB")
    img = crop_cover(img, target_w, target_h)

    # Apply warm color grading
    img = warm_grade(img)

    # Add subtle price/tagline bar if specified
    if bar_text:
        img = add_subtle_price_bar(img, bar_text)

    # Add logo watermark
    logo_size = 70 if target_w <= 1080 else 80
    img = add_logo_watermark(img, logo_size=logo_size)

    # Save
    img.save(OUTPUT / output_name, "JPEG", quality=95)
    print(f"  OK: {output_name}")
    return True


# ====================================================================
# CREATIVE DEFINITIONS
# ====================================================================

CREATIVES = [
    # --- WEEK 1: AWARENESS ---
    # ID 1: IL Awareness - Aerial
    {
        "source": "AERIAL 3 ENHANCED.png",
        "output": "v3_IL_01_FB_AWARENESS_AERIAL.jpg",
        "size": (1200, 1200),
        "bar_text": "1,450,000 ILS  -  Private Villa in Panglao",
    },
    # ID 2: PH Awareness - Aerial
    {
        "source": "AERIAL 3 ENHANCED.png",
        "output": "v3_PH_01_FB_AWARENESS_AERIAL.jpg",
        "size": (1200, 1200),
        "bar_text": "From PHP 28,000,000  -  Panglao Prime Villas",
    },
    # ID 3: IL Awareness - Rear
    {
        "source": "REAR 2 ENHANCED.png",
        "output": "v3_IL_02_FB_AWARENESS_REAR.jpg",
        "size": (1200, 1200),
        "bar_text": "1,450,000 ILS  -  4 Bedrooms, Pool, Sea View",
    },
    # ID 4: PH Awareness - Rear
    {
        "source": "REAR 2 ENHANCED.png",
        "output": "v3_PH_02_FB_AWARENESS_REAR.jpg",
        "size": (1200, 1200),
        "bar_text": "PHP 28,000,000  -  Your Villa in Panglao",
    },
    # ID 5: IL Story - Rooftop
    {
        "source": "TOP ENHANCED.png",
        "output": "v3_IL_04_STORY_ROOFTOP.jpg",
        "size": (1080, 1920),
        "bar_text": "1,450,000 ILS  -  2 Villas Only",
    },
    # ID 6: PH Story - Rooftop
    {
        "source": "TOP ENHANCED.png",
        "output": "v3_PH_04_STORY_ROOFTOP.jpg",
        "size": (1080, 1920),
        "bar_text": "PHP 395,000/month  -  Verified Airbnb",
    },
    # ID 7: Both - Pillar Panglao is Next
    {
        "source": "AERIAL 3 ENHANCED.png",
        "output": "v3_BOTH_PILLAR_01_PANGLAO_IS_NEXT.jpg",
        "size": (1200, 1200),
        "bar_text": "Panglao Prime Villas  -  Invest Where the World Is Discovering",
    },
    # ID 8: IL Story - Rear
    {
        "source": "REAR 1 ENHANCED.png",
        "output": "v3_IL_05_STORY_REAR.jpg",
        "size": (1080, 1920),
        "bar_text": "23,700 ILS/month  -  Verified Income",
    },

    # --- WEEK 2: CONSIDERATION ---
    # ID 11: IL Consideration - Interior
    {
        "source_interior": "GROUND FLOOR INTERIORS/LIVING 1.png",
        "output": "v3_IL_03_FB_CONSIDERATION_INTERIOR.jpg",
        "size": (1200, 1200),
        "bar_text": "1,450,000 ILS  -  2 Units Only",
    },
    # ID 12: PH Consideration - Pool
    {
        "source": "PD3 ENHANCED.png",
        "output": "v3_PH_03_FB_CONSIDERATION_POOL.jpg",
        "size": (1200, 1200),
        "bar_text": "PHP 395,000/month  -  Your Villa Earns While You Sleep",
    },
    # ID 13: Both - Pillar Price Advantage
    {
        "source": "REAR 1 ENHANCED.png",
        "output": "v3_BOTH_PILLAR_04_PRICE_ADVANTAGE.jpg",
        "size": (1200, 1200),
        "bar_text": "Panglao vs Boracay  -  Same Paradise, Half the Price",
    },
    # ID 14: Both - Pillar P25B Township
    {
        "source": "REAR 2 ENHANCED.png",
        "output": "v3_BOTH_PILLAR_02_P25B_TOWNSHIP.jpg",
        "size": (1200, 1200),
        "bar_text": "Next to a P25 Billion Resort Township",
    },
    # ID 15: Both Story - Infrastructure
    {
        "source": "TOP ENHANCED.png",
        "output": "v3_BOTH_PILLAR_05_INFRASTRUCTURE.jpg",
        "size": (1080, 1920),
        "bar_text": "2.22M Passengers  -  Airport Over Capacity",
    },
    # ID 20: Both - Pillar Brand Gravity
    {
        "source": "PD3 ENHANCED.png",
        "output": "v3_BOTH_PILLAR_03_BRAND_GRAVITY.jpg",
        "size": (1200, 1200),
        "bar_text": "Between JW Marriott and Accor MGallery",
    },
    # ID 24: PH Story - Pool
    {
        "source": "PD3 ENHANCED.png",
        "output": "v3_PH_05_STORY_POOL.jpg",
        "size": (1080, 1920),
        "bar_text": "PHP 28,000,000  -  BDO Financing Available",
    },
]


def main():
    print("=" * 60)
    print("PANGLAO PRIME VILLAS - Ad Generator v3 (Clean Images)")
    print("Property renders only. Marketing text in post copy.")
    print("=" * 60)

    success = 0
    total = len(CREATIVES)

    for spec in CREATIVES:
        # Resolve source path
        if "source_interior" in spec:
            source_path = INTERIOR / spec["source_interior"]
        else:
            source_path = find_image(spec["source"])

        w, h = spec["size"]
        ok = generate_clean_ad(source_path, spec["output"], w, h, spec.get("bar_text"))
        if ok:
            success += 1

    print(f"\n{'=' * 60}")
    print(f"DONE! {success}/{total} v3 clean creatives generated")
    print(f"Output: {OUTPUT}")
    print(f"Philosophy: 90%+ property render, minimal text")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
