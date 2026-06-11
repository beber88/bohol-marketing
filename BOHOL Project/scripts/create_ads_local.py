#!/usr/bin/env python3
"""
Local Ad Creative Generator - Panglao Prime Villas
Uses REAL property renders + brand identity to create ad creatives locally.
No external API needed.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

PROJECT = Path("/Users/admin/Downloads/Bohol Marketing/BOHOL Project")
EXTERIOR = PROJECT / "EXTERIOR - D5" / "LATEST RENDERS - EXTERIOR"
INTERIOR = PROJECT / "INTERIOR D5"
FONTS = PROJECT / "assets" / "fonts"
OUTPUT = PROJECT / "assets" / "ad_creatives"
OUTPUT.mkdir(parents=True, exist_ok=True)

# Brand colors
CREAM = (249, 247, 243)
GOLD = (189, 165, 127)
GOLD_LIGHT = (213, 192, 156)
TEAL = (85, 142, 164)
CHARCOAL = (18, 18, 18)
WHITE = (255, 255, 255)
CARD_BG = (253, 251, 248)
BORDER = (238, 230, 214)

# Font loading
def font(name, size):
    paths = {
        "heading": FONTS / "PlayfairDisplay-Bold.ttf",
        "body": FONTS / "PlusJakartaSans-Bold.ttf",
        "hebrew": FONTS / "NotoSansHebrew-Bold.ttf",
    }
    try:
        return ImageFont.truetype(str(paths.get(name, paths["body"])), size)
    except:
        return ImageFont.load_default()


def gold_gradient_bar(draw, x, y, w, h):
    """Draw a horizontal gold gradient bar."""
    for i in range(w):
        ratio = i / w
        r = int(224 + (189 - 224) * ratio)
        g = int(207 + (165 - 207) * ratio)
        b = int(178 + (127 - 178) * ratio)
        draw.line([(x + i, y), (x + i, y + h)], fill=(r, g, b))


def pill_button(draw, x, y, w, h, text, font_obj, fill=GOLD, text_color=WHITE):
    """Draw a pill-shaped button with text."""
    # Outer glow
    draw.rounded_rectangle([x - 3, y - 3, x + w + 3, y + h + 3], radius=h // 2 + 3,
                           fill=(*fill, 40))
    # Button
    draw.rounded_rectangle([x, y, x + w, y + h], radius=h // 2, fill=fill)
    # Border
    draw.rounded_rectangle([x + 1, y + 1, x + w - 1, y + h - 1], radius=h // 2 - 1,
                           outline=WHITE, width=1)
    # Text centered
    bbox = draw.textbbox((0, 0), text, font=font_obj)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((x + (w - tw) // 2, y + (h - th) // 2 - 2), text, fill=text_color, font=font_obj)


def glassmorphism_overlay(img, x, y, w, h, alpha=180):
    """Create a frosted glass effect overlay on an image."""
    overlay = img.crop((x, y, x + w, y + h))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=15))
    # Add white tint
    white_layer = Image.new("RGBA", (w, h), (255, 255, 255, alpha))
    overlay = overlay.convert("RGBA")
    overlay = Image.alpha_composite(overlay, white_layer)
    img.paste(overlay.convert("RGB"), (x, y))
    # Border
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([x, y, x + w, y + h], radius=16, outline=WHITE, width=2)
    return draw


def stat_box(draw, x, y, w, h, value, label, value_font, label_font):
    """Draw a stat box with gold accent."""
    draw.rounded_rectangle([x, y, x + w, y + h], radius=12, fill=CARD_BG, outline=BORDER, width=1)
    # Gold top accent line
    draw.line([(x + 8, y + 1), (x + w - 8, y + 1)], fill=GOLD, width=2)
    # Value
    bbox = draw.textbbox((0, 0), value, font=value_font)
    tw = bbox[2] - bbox[0]
    draw.text((x + (w - tw) // 2, y + 12), value, fill=CHARCOAL, font=value_font)
    # Label
    bbox = draw.textbbox((0, 0), label, font=label_font)
    tw = bbox[2] - bbox[0]
    draw.text((x + (w - tw) // 2, y + h - 28), label, fill=GOLD, font=label_font)


def teal_badge(draw, x, y, text, font_obj):
    """Draw a teal badge."""
    bbox = draw.textbbox((0, 0), text, font=font_obj)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad_x, pad_y = 16, 8
    draw.rounded_rectangle([x, y, x + tw + pad_x * 2, y + th + pad_y * 2],
                           radius=(th + pad_y * 2) // 2, fill=TEAL)
    draw.text((x + pad_x, y + pad_y), text, fill=WHITE, font=font_obj)
    return tw + pad_x * 2


# ============================================================
# AD TEMPLATES
# ============================================================

def create_il_awareness_fb(img_path, output_name):
    """Israeli market - Facebook awareness ad with aerial villa."""
    W, H = 1200, 1200
    canvas = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(canvas)

    # Load and place property image (top 55%)
    img_h = int(H * 0.55)
    prop_img = Image.open(img_path).convert("RGB")
    prop_img = prop_img.resize((W, img_h), Image.LANCZOS)
    canvas.paste(prop_img, (0, 0))

    # Dark gradient overlay at bottom of image for text readability
    for i in range(150):
        alpha = int(200 * (i / 150))
        draw.line([(0, img_h - 150 + i), (W, img_h - 150 + i)],
                  fill=(18, 18, 18, alpha) if alpha < 255 else CHARCOAL)

    # 3-metric header bar at top
    gold_gradient_bar(draw, 0, 0, W, 48)
    hdr_font = font("body", 18)
    header_text = "17-25% ROI  |  65% Occupancy  |  PHP 395,000/month"
    bbox = draw.textbbox((0, 0), header_text, font=hdr_font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, 13), header_text, fill=WHITE, font=hdr_font)

    # Teal badge on image
    badge_font = font("body", 16)
    teal_badge(draw, 24, 64, "Panglao, Bohol, Philippines", badge_font)

    # Price overlay on image (glassmorphism)
    glassmorphism_overlay(canvas, 24, img_h - 130, W - 48, 110)
    draw = ImageDraw.Draw(canvas)
    price_font = font("hebrew", 36)
    sub_font = font("hebrew", 18)
    # Hebrew RTL - right aligned
    draw.text((W - 48, img_h - 120), "1,450,000 ש\"ח - וילה פרטית", fill=CHARCOAL,
              font=price_font, anchor="ra")
    draw.text((W - 48, img_h - 72), "פחות מדירת 3 חדרים בתל אביב", fill=GOLD,
              font=sub_font, anchor="ra")

    # Content section below image
    content_y = img_h + 16

    # Hebrew headline
    hl_font = font("hebrew", 24)
    draw.text((W - 36, content_y), ".ישראלים משקיעים בפיליפינים. אנחנו מלווים", fill=CHARCOAL,
              font=hl_font, anchor="ra")

    # Feature row
    content_y += 46
    feat_font = font("body", 16)
    features = "4 Bedrooms  |  Private Pool  |  Rooftop Jacuzzi  |  60 Sec to Beach"
    bbox = draw.textbbox((0, 0), features, font=feat_font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, content_y), features, fill=CHARCOAL, font=feat_font)

    # 3 stat boxes
    content_y += 40
    box_w = (W - 96) // 3
    stat_val_font = font("heading", 22)
    stat_lbl_font = font("body", 12)
    stats = [("17-25%", "Annual ROI"), ("65%", "Occupancy"), ("23,700 ש\"ח", "Monthly")]
    for i, (val, lbl) in enumerate(stats):
        stat_box(draw, 24 + i * (box_w + 12), content_y, box_w, 70, val, lbl,
                 stat_val_font, stat_lbl_font)

    # Legal structures line
    content_y += 86
    legal_font = font("hebrew", 14)
    draw.text((W - 36, content_y), "Deed of Assignment | Leasehold 25+25 | תאגיד פיליפיני :3 מסלולים משפטיים",
              fill=TEAL, font=legal_font, anchor="ra")

    # CTA button
    content_y += 32
    btn_font = font("body", 16)
    pill_button(draw, (W - 300) // 2, content_y, 300, 44, "Learn More", btn_font)

    # Footer
    content_y += 60
    footer_font = font("body", 13)
    draw.text((W // 2, content_y), "WhatsApp: +639542555553 | +639958565865",
              fill=GOLD, font=footer_font, anchor="ma")
    draw.text((W // 2, content_y + 22), "Blue Everest Asset Group  |  primevilla.ph",
              fill=CHARCOAL, font=footer_font, anchor="ma")

    canvas.save(OUTPUT / output_name, quality=95)
    print(f"  Created: {output_name}")
    return OUTPUT / output_name


def create_ph_awareness_fb(img_path, output_name):
    """Philippine market - Facebook awareness ad."""
    W, H = 1200, 1200
    canvas = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(canvas)

    # Property image top 55%
    img_h = int(H * 0.55)
    prop_img = Image.open(img_path).convert("RGB")
    prop_img = prop_img.resize((W, img_h), Image.LANCZOS)
    canvas.paste(prop_img, (0, 0))

    # Gradient overlay
    for i in range(150):
        alpha = int(200 * (i / 150))
        draw.line([(0, img_h - 150 + i), (W, img_h - 150 + i)],
                  fill=(18, 18, 18, alpha) if alpha < 255 else CHARCOAL)

    # 3-metric gold header
    gold_gradient_bar(draw, 0, 0, W, 48)
    hdr_font = font("body", 18)
    header_text = "17-25% ROI  |  65% Occupancy  |  PHP 395,000/month"
    bbox = draw.textbbox((0, 0), header_text, font=hdr_font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, 13), header_text, fill=WHITE, font=hdr_font)

    # Badge
    badge_font = font("body", 16)
    teal_badge(draw, 24, 64, "Only 2 Villas Remaining", badge_font)

    # Price glassmorphism overlay
    glassmorphism_overlay(canvas, 24, img_h - 130, W - 48, 110)
    draw = ImageDraw.Draw(canvas)
    price_font = font("heading", 38)
    sub_font = font("body", 18)
    draw.text((36, img_h - 122), "PHP 395,000/Month", fill=CHARCOAL, font=price_font)
    draw.text((36, img_h - 74), "Your Villa Works While You Sleep", fill=GOLD, font=sub_font)

    # Content below image
    content_y = img_h + 16
    hl_font = font("heading", 24)
    draw.text((36, content_y), "Stop Renting. Start Owning.", fill=CHARCOAL, font=hl_font)

    content_y += 40
    body_font = font("body", 16)
    draw.text((36, content_y), "Villa D: PHP 28,000,000  |  Villa C: PHP 30,000,000", fill=CHARCOAL, font=body_font)

    content_y += 28
    feat_font = font("body", 15)
    draw.text((36, content_y), "4 Bedrooms  |  Private Pool  |  Rooftop Jacuzzi  |  60 Sec to Beach",
              fill=CHARCOAL, font=feat_font)

    # Stat boxes
    content_y += 36
    box_w = (W - 96) // 3
    stat_val_font = font("heading", 22)
    stat_lbl_font = font("body", 12)
    stats = [("17-25%", "Annual ROI"), ("65%", "Occupancy"), ("PHP 14K", "Per Night")]
    for i, (val, lbl) in enumerate(stats):
        stat_box(draw, 24 + i * (box_w + 12), content_y, box_w, 70, val, lbl,
                 stat_val_font, stat_lbl_font)

    # BDO badge
    content_y += 86
    teal_badge(draw, 36, content_y, "BDO Bank Financing Available", badge_font)

    # CTA
    content_y += 40
    btn_font = font("body", 16)
    pill_button(draw, (W - 300) // 2, content_y, 300, 44, "Learn More", btn_font)

    # Footer
    content_y += 60
    footer_font = font("body", 13)
    draw.text((W // 2, content_y), "WhatsApp: +639542555553 | +639958565865",
              fill=GOLD, font=footer_font, anchor="ma")
    draw.text((W // 2, content_y + 22), "Blue Everest Asset Group  |  primevilla.ph",
              fill=CHARCOAL, font=footer_font, anchor="ma")

    canvas.save(OUTPUT / output_name, quality=95)
    print(f"  Created: {output_name}")
    return OUTPUT / output_name


def create_story_ad(img_path, output_name, market="IL"):
    """Vertical story ad (1080x1920) for both markets."""
    W, H = 1080, 1920
    canvas = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(canvas)

    # Full bleed image top 50%
    img_h = H // 2
    prop_img = Image.open(img_path).convert("RGB")
    # Crop to portrait ratio
    src_w, src_h = prop_img.size
    target_ratio = W / img_h
    src_ratio = src_w / src_h
    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        offset = (src_w - new_w) // 2
        prop_img = prop_img.crop((offset, 0, offset + new_w, src_h))
    else:
        new_h = int(src_w / target_ratio)
        prop_img = prop_img.crop((0, 0, src_w, new_h))
    prop_img = prop_img.resize((W, img_h), Image.LANCZOS)
    canvas.paste(prop_img, (0, 0))

    # Glassmorphism card on image
    card_y = img_h - 200
    glassmorphism_overlay(canvas, 40, card_y, W - 80, 170, alpha=160)
    draw = ImageDraw.Draw(canvas)

    if market == "IL":
        price_font = font("hebrew", 44)
        sub_font = font("hebrew", 22)
        draw.text((W - 60, card_y + 20), "1,450,000 ש\"ח", fill=CHARCOAL,
                  font=price_font, anchor="ra")
        draw.text((W - 60, card_y + 80), "וילה פרטית בפנגלאו", fill=GOLD,
                  font=sub_font, anchor="ra")
        draw.text((W - 60, card_y + 115), "2 יחידות בלבד", fill=TEAL,
                  font=font("hebrew", 18), anchor="ra")
    else:
        price_font = font("heading", 44)
        sub_font = font("body", 22)
        draw.text((60, card_y + 20), "PHP 395,000/Month", fill=CHARCOAL, font=price_font)
        draw.text((60, card_y + 80), "Verified Airbnb Income", fill=GOLD, font=sub_font)
        draw.text((60, card_y + 115), "Only 2 Villas Left", fill=TEAL, font=font("body", 18))

    # Content section
    content_y = img_h + 30

    # 3 stat boxes
    box_w = (W - 100) // 3
    stat_val = font("heading", 28)
    stat_lbl = font("body", 13)
    if market == "IL":
        stats = [("17-25%", "ROI"), ("65%", "תפוסה"), ("23,700₪", "לחודש")]
    else:
        stats = [("17-25%", "Annual ROI"), ("65%", "Occupancy"), ("PHP 14K", "Per Night")]
    for i, (val, lbl) in enumerate(stats):
        stat_box(draw, 30 + i * (box_w + 10), content_y, box_w, 85, val, lbl, stat_val, stat_lbl)

    # Features
    content_y += 110
    feat_font = font("body", 20)
    draw.text((W // 2, content_y), "4 Bedrooms  |  Private Pool  |  Rooftop Jacuzzi",
              fill=CHARCOAL, font=feat_font, anchor="ma")
    content_y += 32
    draw.text((W // 2, content_y), "60 Seconds to Panglao Beach",
              fill=CHARCOAL, font=feat_font, anchor="ma")

    # Market-specific
    content_y += 50
    if market == "IL":
        legal = font("hebrew", 16)
        draw.text((W // 2, content_y), "Deed of Assignment | Leasehold 25+25 | תאגיד :3 מסלולים",
                  fill=TEAL, font=legal, anchor="ma")
    else:
        teal_badge(draw, (W - 320) // 2, content_y, "BDO Bank Financing Available", font("body", 18))

    # CTA button
    content_y += 60
    pill_button(draw, (W - 400) // 2, content_y, 400, 56,
                "WhatsApp Now" if market == "PH" else "לפרטים נוספים",
                font("body" if market == "PH" else "hebrew", 20))

    # WhatsApp numbers
    content_y += 76
    wa_font = font("body", 18)
    draw.text((W // 2, content_y), "+639542555553  |  +639958565865",
              fill=GOLD, font=wa_font, anchor="ma")

    # Brand footer
    content_y += 36
    brand_font = font("body", 16)
    draw.text((W // 2, content_y), "Blue Everest Asset Group  |  primevilla.ph",
              fill=CHARCOAL, font=brand_font, anchor="ma")

    canvas.save(OUTPUT / output_name, quality=95)
    print(f"  Created: {output_name}")
    return OUTPUT / output_name


def create_comparison_ad(output_name):
    """Tel Aviv vs Bohol comparison ad (Instagram square)."""
    W, H = 1080, 1080
    canvas = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(canvas)

    half = W // 2

    # Left: Load an exterior image and darken it (representing cramped TLV)
    left_img = Image.new("RGB", (half, H), (120, 120, 130))
    draw_left = ImageDraw.Draw(left_img)
    # Simulate urban feel with rectangles
    for y_pos in range(0, H, 80):
        for x_pos in range(0, half, 60):
            draw_left.rectangle([x_pos + 5, y_pos + 5, x_pos + 55, y_pos + 70],
                                fill=(100 + (y_pos % 30), 100 + (x_pos % 20), 105))
            # Windows
            for wy in range(y_pos + 15, y_pos + 60, 20):
                draw_left.rectangle([x_pos + 12, wy, x_pos + 25, wy + 12],
                                    fill=(180, 200, 220))
                draw_left.rectangle([x_pos + 32, wy, x_pos + 45, wy + 12],
                                    fill=(180, 200, 220))
    canvas.paste(left_img, (0, 0))

    # Right: Real villa image
    villa_path = EXTERIOR / "FRONT 4 ENHANCED.png"
    if villa_path.exists():
        right_img = Image.open(villa_path).convert("RGB")
        # Crop to right half dimensions
        src_w, src_h = right_img.size
        ratio = half / (H * 0.8)
        if src_w / src_h > ratio:
            new_w = int(src_h * (half / H))
            offset = (src_w - new_w) // 2
            right_img = right_img.crop((offset, 0, offset + new_w, src_h))
        right_img = right_img.resize((half, H), Image.LANCZOS)
        canvas.paste(right_img, (half, 0))

    # Gold divider line
    draw.line([(half, 0), (half, H)], fill=GOLD, width=4)

    # Labels
    label_font = font("hebrew", 20)
    # Left label (TLV)
    draw.rounded_rectangle([20, H - 100, half - 20, H - 55], radius=20,
                           fill=(0, 0, 0, 180))
    draw.text((half // 2, H - 90), "דירת 3 חדרים בתל אביב", fill=WHITE,
              font=label_font, anchor="ma")
    # Right label (Bohol)
    draw.rounded_rectangle([half + 20, H - 100, W - 20, H - 55], radius=20,
                           fill=(*GOLD, 220))
    draw.text((half + half // 2, H - 90), "וילה פרטית בפנגלאו", fill=WHITE,
              font=label_font, anchor="ma")

    # Center price overlay
    center_w = 400
    glassmorphism_overlay(canvas, (W - center_w) // 2, 40, center_w, 120, alpha=200)
    draw = ImageDraw.Draw(canvas)
    draw.text((W // 2, 55), ".אותו מחיר", fill=GOLD,
              font=font("hebrew", 24), anchor="ma")
    draw.text((W // 2, 95), "1,450,000 ש\"ח", fill=CHARCOAL,
              font=font("heading", 38), anchor="ma")

    # Bottom stats bar
    gold_gradient_bar(draw, 0, H - 48, W, 48)
    draw.text((W // 2, H - 38), "23,700 ש\"ח לחודש  |  17-25% תשואה  |  4 חדרי שינה",
              fill=WHITE, font=font("body", 16), anchor="ma")

    canvas.save(OUTPUT / output_name, quality=95)
    print(f"  Created: {output_name}")


# ============================================================
# MAIN
# ============================================================

def main():
    print("=" * 60)
    print("PANGLAO PRIME VILLAS - LOCAL AD GENERATOR")
    print("Using REAL property renders + brand identity")
    print("=" * 60)

    # Image mapping
    images = {
        "aerial": EXTERIOR / "AERIAL 3 ENHANCED.png",
        "front": EXTERIOR / "FRONT 4 ENHANCED.png",
        "top": EXTERIOR / "TOP ENHANCED.png",
        "rear": EXTERIOR / "REAR 1 ENHANCED.png",
        "pool": EXTERIOR / "PD3 ENHANCED.png",
        "living": INTERIOR / "GROUND FLOOR INTERIORS" / "LIVING 1.png",
        "foyer": INTERIOR / "GROUND FLOOR INTERIORS" / "FOYER 2.png",
        "master": INTERIOR / "3RD FLOOR INTERIORS" / "MASTER'S 1.png",
    }

    # Verify images exist
    print("\nChecking property images...")
    for name, path in images.items():
        exists = "OK" if path.exists() else "MISSING"
        print(f"  {name}: {exists} - {path.name}")

    missing = [n for n, p in images.items() if not p.exists()]
    if missing:
        # Try non-enhanced versions
        print(f"\nSome enhanced missing, trying originals...")
        fallbacks = {
            "aerial": PROJECT / "EXTERIOR - D5" / "AERIAL 3_AI.png",
            "front": PROJECT / "EXTERIOR - D5" / "FRONT 4_AI.png",
            "top": PROJECT / "EXTERIOR - D5" / "TOP_AI.png",
            "rear": PROJECT / "EXTERIOR - D5" / "REAR 1_AI.png",
            "pool": PROJECT / "EXTERIOR - D5" / "PD3_AI.png",
        }
        for name in missing:
            if name in fallbacks and fallbacks[name].exists():
                images[name] = fallbacks[name]
                print(f"  {name}: Using fallback {fallbacks[name].name}")

    print(f"\n--- Generating Israeli Market Ads ---")
    if images["aerial"].exists():
        create_il_awareness_fb(images["aerial"], "IL_FB_AWARENESS_AERIAL.jpg")
    if images["front"].exists():
        create_il_awareness_fb(images["front"], "IL_FB_AWARENESS_FRONT.jpg")
    if images["top"].exists():
        create_story_ad(images["top"], "IL_STORY_AWARENESS_ROOFTOP.jpg", market="IL")
    if images["rear"].exists():
        create_story_ad(images["rear"], "IL_STORY_CONVERSION_REAR.jpg", market="IL")

    # Comparison ad
    create_comparison_ad("IL_IG_COMPARISON_TLV_VS_BOHOL.jpg")

    print(f"\n--- Generating Philippine Market Ads ---")
    if images["aerial"].exists():
        create_ph_awareness_fb(images["aerial"], "PH_FB_AWARENESS_AERIAL.jpg")
    if images["front"].exists():
        create_ph_awareness_fb(images["front"], "PH_FB_AWARENESS_FRONT.jpg")
    if images["top"].exists():
        create_story_ad(images["top"], "PH_STORY_AWARENESS_ROOFTOP.jpg", market="PH")
    if images["rear"].exists():
        create_story_ad(images["rear"], "PH_STORY_CONVERSION_REAR.jpg", market="PH")

    print(f"\n{'=' * 60}")
    print(f"ALL DONE! Creatives saved to: {OUTPUT}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
