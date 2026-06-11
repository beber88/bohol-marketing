#!/usr/bin/env python3
"""
Nano Banana 2 (Gemini 3.1 Flash) - Ad Creative Generator
Panglao Prime Villas Marketing Campaign

Generates professional ad creatives for Meta (Facebook/Instagram) and Google Ads
using Google's Nano Banana 2 AI image generation model.

Usage:
    export GEMINI_API_KEY="your-api-key-here"
    python3 nano_banana_ad_generator.py --market IL --funnel awareness --count 3
    python3 nano_banana_ad_generator.py --market PH --funnel all --count 2
    python3 nano_banana_ad_generator.py --generate-all
"""

import os
import sys
import json
import base64
import argparse
import datetime
from pathlib import Path

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("ERROR: google-genai not installed. Run: pip3 install google-genai")
    sys.exit(1)

# ============ CONFIGURATION ============

PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "assets" / "ad_creatives"
REFERENCE_IMAGES_DIR = PROJECT_ROOT / "EXTERIOR - D5"
INTERIOR_IMAGES_DIR = PROJECT_ROOT / "INTERIOR D5"

MODEL = "gemini-3.1-flash-image-preview"

# Ad dimensions per placement
PLACEMENTS = {
    "facebook_feed": {"aspect_ratio": "4:5", "size": "2K", "label": "FB Feed"},
    "facebook_story": {"aspect_ratio": "9:16", "size": "2K", "label": "FB/IG Story"},
    "instagram_feed": {"aspect_ratio": "1:1", "size": "2K", "label": "IG Feed"},
    "instagram_reels": {"aspect_ratio": "9:16", "size": "2K", "label": "IG Reels"},
    "google_display": {"aspect_ratio": "16:9", "size": "2K", "label": "Google Display"},
    "facebook_carousel": {"aspect_ratio": "1:1", "size": "1K", "label": "FB Carousel"},
}

# ============ PROMPT TEMPLATES ============
# Based on Facebook Ad Library research: winning patterns for luxury real estate

PROMPT_TEMPLATES = {
    "IL": {
        "awareness": [
            {
                "name": "lifestyle_aerial",
                "prompt": (
                    "Create a luxury real estate advertisement image for Israeli investors. "
                    "Show an aerial view of a stunning 4-bedroom villa in a tropical paradise setting "
                    "with a private pool, rooftop jacuzzi, and lush palm trees. "
                    "The villa should be situated near a pristine white sand beach, visible in the background. "
                    "Golden hour lighting with warm tones. Professional real estate photography style. "
                    "Clean, modern architecture with premium finishes. "
                    "The image should evoke exclusivity and high-end lifestyle. "
                    "No text overlays - clean image only. "
                    "Style: cinematic drone photography, golden hour, luxury resort atmosphere."
                ),
                "reference_image": "AERIAL_AI.png",
            },
            {
                "name": "comparison_telaviv",
                "prompt": (
                    "Create a split-screen comparison advertisement image. "
                    "Left side: a small, cramped 3-room apartment in a dense urban city (Tel Aviv style), "
                    "gray concrete building, tiny balcony, crowded street below. "
                    "Right side: a spacious luxury villa in a tropical setting with private pool, "
                    "palm trees, ocean view, rooftop terrace with jacuzzi. "
                    "The contrast should be dramatic - urban cramped vs tropical luxury. "
                    "Both should look photorealistic. Professional ad photography style. "
                    "No text overlays. Clean images only."
                ),
                "reference_image": None,
            },
            {
                "name": "income_lifestyle",
                "prompt": (
                    "Create a luxury lifestyle advertisement image showing a couple relaxing "
                    "on a rooftop terrace of a modern tropical villa at sunset. "
                    "They overlook a private infinity pool with ocean view in the background. "
                    "Premium lounge furniture, champagne glasses on the table. "
                    "The atmosphere should convey: this is not just a vacation, this is an investment. "
                    "Warm golden light, professional real estate marketing photography. "
                    "Tropical Bohol Philippines setting with palm trees and crystal clear water. "
                    "No text. Clean luxury imagery."
                ),
                "reference_image": "REAR 1_AI.png",
            },
        ],
        "consideration": [
            {
                "name": "interior_luxury",
                "prompt": (
                    "Create a luxury villa interior advertisement image. "
                    "Show a spacious open-plan living room flowing into a modern kitchen, "
                    "with floor-to-ceiling windows revealing a tropical garden and pool outside. "
                    "Premium finishes: marble countertops, designer furniture, ambient lighting. "
                    "The style is modern tropical luxury - clean lines with warm natural materials. "
                    "Professional interior photography with perfect lighting. "
                    "No text overlays. This should look like a high-end real estate magazine photo."
                ),
                "reference_image": None,
            },
            {
                "name": "roi_visual",
                "prompt": (
                    "Create a professional real estate investment advertisement image. "
                    "Show a beautiful tropical villa exterior with a subtle visual overlay concept: "
                    "a rising graph or upward arrow motif integrated naturally into the scene "
                    "(perhaps formed by the architecture lines or landscape). "
                    "The villa has a private pool, modern architecture, tropical landscaping. "
                    "The overall feeling: luxury property that generates returns. "
                    "Professional photography, warm lighting, investment confidence. "
                    "No text overlays."
                ),
                "reference_image": "FRONT 1 AI.png",
            },
        ],
        "conversion": [
            {
                "name": "urgency_exclusive",
                "prompt": (
                    "Create a high-impact luxury real estate conversion ad image. "
                    "Show a stunning villa at golden hour with dramatic lighting. "
                    "The villa has a private pool reflecting the sunset, rooftop jacuzzi visible, "
                    "and the ocean in the background. "
                    "The mood should convey exclusivity and urgency - like this is the last chance "
                    "to own something truly special. "
                    "Cinematic composition, rich warm colors, dramatic sky. "
                    "Professional real estate photography at its absolute best. "
                    "No text overlays."
                ),
                "reference_image": "FRONT 2_AI.png",
            },
        ],
    },
    "PH": {
        "awareness": [
            {
                "name": "panglao_beach_villa",
                "prompt": (
                    "Create a luxury villa advertisement image for the Philippine market. "
                    "Show a modern 4-bedroom villa with private pool in Panglao, Bohol setting. "
                    "White sand beach visible nearby, crystal clear turquoise water. "
                    "The architecture is modern tropical with clean lines and premium finishes. "
                    "Filipino family-friendly atmosphere but clearly high-end investment property. "
                    "Bright, vibrant tropical colors, perfect weather, professional photography. "
                    "No text overlays."
                ),
                "reference_image": "FRONT 3_AI.png",
            },
            {
                "name": "airbnb_income",
                "prompt": (
                    "Create an advertisement image showing the concept of passive income "
                    "from a vacation rental property. Show a beautiful tropical villa exterior "
                    "with happy guests arriving (silhouettes or tasteful representation). "
                    "Luggage, a warm welcome atmosphere. The villa has a pool, modern design, "
                    "tropical landscaping. Convey: your property works for you while you relax. "
                    "Professional real estate marketing photography. Bright, aspirational. "
                    "No text overlays."
                ),
                "reference_image": "AERIAL 2_AI.png",
            },
            {
                "name": "bohol_tourism_growth",
                "prompt": (
                    "Create a vibrant advertisement image showcasing Bohol/Panglao as a booming "
                    "tourism destination. Show the iconic white sand beach with luxury developments "
                    "in the background. Include visual elements suggesting growth and opportunity: "
                    "new construction, modern architecture alongside natural beauty. "
                    "Crystal clear water, palm trees, tropical paradise with investment potential. "
                    "Professional tourism-meets-real-estate photography. "
                    "No text overlays."
                ),
                "reference_image": "AERIAL 3_AI.png",
            },
        ],
        "consideration": [
            {
                "name": "villa_walkthrough",
                "prompt": (
                    "Create a luxury villa showcase image - as if walking through the front entrance. "
                    "Modern tropical architecture, double-height ceiling, elegant foyer leading to "
                    "an open living space with pool view beyond. Premium materials visible: "
                    "marble floors, wooden accents, designer lighting. "
                    "The feeling of stepping into your dream investment property. "
                    "Professional architectural photography, perfect composition. "
                    "No text overlays."
                ),
                "reference_image": None,
            },
            {
                "name": "rooftop_jacuzzi_sunset",
                "prompt": (
                    "Create an advertisement image of a rooftop jacuzzi at sunset in a tropical setting. "
                    "The jacuzzi is on top of a modern luxury villa, overlooking palm trees and ocean. "
                    "Steam rising from the jacuzzi water, dramatic sunset sky in oranges and purples. "
                    "This is the ultimate lifestyle shot - conveying luxury living in Panglao, Bohol. "
                    "Professional real estate photography, magazine quality. "
                    "No text overlays."
                ),
                "reference_image": "TOP_AI.png",
            },
        ],
        "conversion": [
            {
                "name": "limited_units",
                "prompt": (
                    "Create a premium real estate conversion advertisement image. "
                    "Show two side-by-side luxury villas from an elevated angle, "
                    "each with their own private pool, in a tropical beachside setting. "
                    "The image should convey exclusivity - only these two properties exist. "
                    "Perfect golden hour lighting, lush landscaping, ocean visible. "
                    "Professional drone photography style, luxury development showcase. "
                    "No text overlays."
                ),
                "reference_image": "M1_AI.png",
            },
        ],
    },
}


def get_client():
    """Initialize Gemini client with API key."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("\nERROR: GEMINI_API_KEY not set.")
        print("Get your free API key at: https://aistudio.google.com/apikey")
        print("Then run: export GEMINI_API_KEY='your-key-here'\n")
        sys.exit(1)
    return genai.Client(api_key=api_key)


def load_reference_image(image_name):
    """Load a reference image from the property images directory."""
    if not image_name:
        return None

    # Try exterior first, then interior
    for base_dir in [REFERENCE_IMAGES_DIR, INTERIOR_IMAGES_DIR]:
        img_path = base_dir / image_name
        if img_path.exists():
            print(f"  Loading reference: {img_path.name}")
            with open(img_path, "rb") as f:
                return f.read()

    # Try subdirectories
    for base_dir in [REFERENCE_IMAGES_DIR, INTERIOR_IMAGES_DIR]:
        for subdir in base_dir.iterdir():
            if subdir.is_dir():
                img_path = subdir / image_name
                if img_path.exists():
                    print(f"  Loading reference: {img_path.name}")
                    with open(img_path, "rb") as f:
                        return f.read()

    print(f"  Warning: Reference image '{image_name}' not found, generating without it")
    return None


def generate_creative(client, prompt_data, placement, market, funnel):
    """Generate a single ad creative using Nano Banana 2."""
    placement_config = PLACEMENTS[placement]
    creative_name = prompt_data["name"]

    print(f"\n  Generating: {creative_name} [{placement_config['label']}]")

    # Build content parts
    parts = []

    # Add reference image if specified
    ref_data = load_reference_image(prompt_data.get("reference_image"))
    if ref_data:
        parts.append(
            types.Part(
                inline_data=types.Blob(
                    mime_type="image/png",
                    data=base64.b64encode(ref_data).decode("utf-8"),
                )
            )
        )
        enhanced_prompt = (
            f"Using the attached property image as reference for the villa's style and architecture, "
            f"{prompt_data['prompt']} "
            f"Output aspect ratio: {placement_config['aspect_ratio']}. "
            f"Resolution: high quality, suitable for {placement_config['label']} advertising."
        )
    else:
        enhanced_prompt = (
            f"{prompt_data['prompt']} "
            f"Output aspect ratio: {placement_config['aspect_ratio']}. "
            f"Resolution: high quality, suitable for {placement_config['label']} advertising."
        )

    parts.append(types.Part(text=enhanced_prompt))

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=types.Content(parts=parts),
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio=placement_config["aspect_ratio"],
                    image_size=placement_config["size"],
                ),
            ),
        )

        # Process response
        for part in response.candidates[0].content.parts:
            if hasattr(part, "inline_data") and part.inline_data:
                # Save image
                output_subdir = OUTPUT_DIR / market / funnel / placement
                output_subdir.mkdir(parents=True, exist_ok=True)

                timestamp = datetime.datetime.now().strftime("%H%M%S")
                filename = f"{creative_name}_{timestamp}.png"
                filepath = output_subdir / filename

                img_bytes = base64.b64decode(part.inline_data.data)
                with open(filepath, "wb") as f:
                    f.write(img_bytes)

                size_kb = len(img_bytes) / 1024
                print(f"  Saved: {filepath.relative_to(PROJECT_ROOT)} ({size_kb:.0f} KB)")
                return str(filepath)

            elif hasattr(part, "text") and part.text:
                print(f"  Model note: {part.text[:100]}")

        print("  Warning: No image in response")
        return None

    except Exception as e:
        print(f"  Error generating {creative_name}: {e}")
        return None


def generate_for_market_funnel(client, market, funnel, placements_list, count=1):
    """Generate creatives for a specific market and funnel stage."""
    templates = PROMPT_TEMPLATES.get(market, {}).get(funnel, [])
    if not templates:
        print(f"No templates for {market}/{funnel}")
        return []

    results = []
    for template in templates[:count]:
        for placement in placements_list:
            result = generate_creative(client, template, placement, market, funnel)
            if result:
                results.append(
                    {
                        "market": market,
                        "funnel": funnel,
                        "placement": placement,
                        "creative_name": template["name"],
                        "file_path": result,
                        "generated_at": datetime.datetime.now().isoformat(),
                    }
                )
    return results


def generate_all(client):
    """Generate complete creative set for both markets and all funnels."""
    print("\n" + "=" * 60)
    print("GENERATING COMPLETE AD CREATIVE SET")
    print("Panglao Prime Villas - Nano Banana 2")
    print("=" * 60)

    all_results = []

    # Key placements per funnel
    funnel_placements = {
        "awareness": ["facebook_feed", "instagram_feed", "instagram_reels"],
        "consideration": ["facebook_feed", "instagram_feed", "facebook_story"],
        "conversion": ["facebook_feed", "instagram_reels"],
    }

    for market in ["IL", "PH"]:
        print(f"\n{'=' * 40}")
        print(f"MARKET: {'Israel (Hebrew)' if market == 'IL' else 'Philippines (English/Tagalog)'}")
        print(f"{'=' * 40}")

        for funnel, placements_list in funnel_placements.items():
            print(f"\n--- {funnel.upper()} ---")
            results = generate_for_market_funnel(
                client, market, funnel, placements_list, count=3
            )
            all_results.extend(results)

    # Save manifest
    manifest_path = OUTPUT_DIR / "creative_manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(
            {
                "generated_at": datetime.datetime.now().isoformat(),
                "model": MODEL,
                "total_creatives": len(all_results),
                "creatives": all_results,
            },
            f,
            indent=2,
        )

    print(f"\n{'=' * 60}")
    print(f"DONE: {len(all_results)} creatives generated")
    print(f"Manifest: {manifest_path.relative_to(PROJECT_ROOT)}")
    print(f"Output: {OUTPUT_DIR.relative_to(PROJECT_ROOT)}/")
    print(f"{'=' * 60}\n")

    return all_results


def main():
    parser = argparse.ArgumentParser(
        description="Nano Banana 2 Ad Creative Generator for Panglao Prime Villas"
    )
    parser.add_argument(
        "--market",
        choices=["IL", "PH"],
        help="Target market (IL=Israel, PH=Philippines)",
    )
    parser.add_argument(
        "--funnel",
        choices=["awareness", "consideration", "conversion", "all"],
        default="all",
        help="Funnel stage",
    )
    parser.add_argument(
        "--placement",
        choices=list(PLACEMENTS.keys()),
        default=None,
        help="Ad placement (default: all relevant placements)",
    )
    parser.add_argument(
        "--count", type=int, default=2, help="Number of creatives per template"
    )
    parser.add_argument(
        "--generate-all",
        action="store_true",
        help="Generate complete creative set for all markets/funnels",
    )
    parser.add_argument(
        "--list-templates",
        action="store_true",
        help="List all available prompt templates",
    )

    args = parser.parse_args()

    if args.list_templates:
        print("\nAvailable Ad Creative Templates:")
        print("=" * 50)
        for market, funnels in PROMPT_TEMPLATES.items():
            for funnel, templates in funnels.items():
                for t in templates:
                    ref = t.get("reference_image", "none")
                    print(f"  [{market}] {funnel:15s} | {t['name']:25s} | ref: {ref}")
        print()
        return

    client = get_client()

    if args.generate_all:
        generate_all(client)
        return

    if not args.market:
        print("Error: --market required (or use --generate-all)")
        parser.print_help()
        return

    # Determine placements
    if args.placement:
        placements_list = [args.placement]
    else:
        placements_list = ["facebook_feed", "instagram_feed"]

    # Determine funnels
    if args.funnel == "all":
        funnels = ["awareness", "consideration", "conversion"]
    else:
        funnels = [args.funnel]

    for funnel in funnels:
        print(f"\n--- {args.market} / {funnel.upper()} ---")
        generate_for_market_funnel(client, args.market, funnel, placements_list, args.count)


if __name__ == "__main__":
    main()
