#!/usr/bin/env python3
"""
upload_media_to_meta.py

Uploads all Panglao Prime Villas images and videos to the Meta Ad Account
Media Library via the Marketing Graph API.

Safety:
- Uploads to /adimages and /advideos only. Does NOT create ads, ad sets,
  or campaigns. Does NOT change PAUSED -> ACTIVE on anything.
- Respects simulation flag in _status/campaign_state.json: if simulation
  is true and --force is not passed, script will skip the upload and just
  print what it would do.

Usage:
    export META_ACCESS_TOKEN="EAA..."
    python3 upload_media_to_meta.py [--force]

Outputs a mapping JSON at _completed/<today>/media_upload_map.json with
the image_hash / video_id returned by Facebook for every file.
"""
import os
import sys
import json
import time
import argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    import requests
except ImportError:
    print("requests not installed. Install with: pip3 install requests --break-system-packages", file=sys.stderr)
    sys.exit(1)

# Resolve project root: real macOS path first, then sandbox mount fallback.
_CANDIDATE_ROOTS = [
    Path("/Users/admin/Downloads/Bohol Marketing"),
    Path("/sessions/beautiful-festive-hypatia/mnt/Bohol Marketing"),
    Path(__file__).resolve().parent.parent,
]
PROJECT_ROOT = next((p for p in _CANDIDATE_ROOTS if p.exists()), _CANDIDATE_ROOTS[0])
AD_ACCOUNT_ID = "2015125296073673"
GRAPH_VERSION = "v21.0"
GRAPH_BASE = f"https://graph.facebook.com/{GRAPH_VERSION}"

# Fixed lists per campaign_state.json:
VIDEO_DIR = PROJECT_ROOT / "video"
EXTERIOR_ENHANCED_DIR = PROJECT_ROOT / "EXTERIOR - D5" / "LATEST RENDERS - EXTERIOR"
EXTERIOR_AI_DIR = PROJECT_ROOT / "BOHOL Project" / "EXTERIOR - D5"
INTERIOR_DIR = PROJECT_ROOT / "INTERIOR D5"

PHT = timezone(timedelta(hours=8))
TODAY = datetime.now(PHT).strftime("%Y-%m-%d")
RESULTS_DIR = PROJECT_ROOT / "_completed" / TODAY
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

CAMPAIGN_STATE_PATH = PROJECT_ROOT / "_status" / "campaign_state.json"


def log(msg: str):
    print(f"[{datetime.now(PHT).strftime('%H:%M:%S')}] {msg}", flush=True)


def load_state():
    with open(CAMPAIGN_STATE_PATH) as f:
        return json.load(f)


def collect_files():
    """Collect all media files to upload, deduplicated by basename."""
    videos = []
    images = []

    if VIDEO_DIR.exists():
        for p in sorted(VIDEO_DIR.glob("*.mp4")):
            if not p.name.startswith("."):
                videos.append(p)

    seen_basenames = set()
    for d in [EXTERIOR_ENHANCED_DIR, EXTERIOR_AI_DIR]:
        if d.exists():
            for p in sorted(d.glob("*.png")):
                if p.name.startswith("."):
                    continue
                key = p.name.lower()
                if key in seen_basenames:
                    continue
                seen_basenames.add(key)
                images.append(p)
            for p in sorted(d.glob("*.PNG")):
                if p.name.startswith("."):
                    continue
                key = p.name.lower()
                if key in seen_basenames:
                    continue
                seen_basenames.add(key)
                images.append(p)

    if INTERIOR_DIR.exists():
        for ext in ("png", "PNG", "jpg", "jpeg"):
            for p in sorted(INTERIOR_DIR.rglob(f"*.{ext}")):
                if p.name.startswith("."):
                    continue
                key = p.name.lower()
                if key in seen_basenames:
                    continue
                seen_basenames.add(key)
                images.append(p)

    return videos, images


def upload_image(path: Path, token: str) -> dict:
    url = f"{GRAPH_BASE}/act_{AD_ACCOUNT_ID}/adimages"
    with open(path, "rb") as fp:
        files = {"filename": (path.name, fp)}
        params = {"access_token": token}
        r = requests.post(url, params=params, files=files, timeout=300)
    if r.status_code >= 400:
        return {"ok": False, "status": r.status_code, "error": r.text[:500], "file": path.name}
    data = r.json()
    # Response shape: {"images": {"<filename>": {"hash": "...", "url": "..."}}}
    images_block = data.get("images", {})
    if not images_block:
        return {"ok": False, "status": r.status_code, "error": "no images block", "file": path.name, "raw": data}
    first_key = next(iter(images_block.keys()))
    img = images_block[first_key]
    return {
        "ok": True,
        "file": path.name,
        "path": str(path),
        "hash": img.get("hash"),
        "url": img.get("url"),
        "fb_name": first_key,
    }


def upload_video(path: Path, token: str) -> dict:
    url = f"{GRAPH_BASE}/act_{AD_ACCOUNT_ID}/advideos"
    with open(path, "rb") as fp:
        files = {"source": (path.name, fp)}
        params = {"access_token": token, "name": path.stem}
        r = requests.post(url, params=params, files=files, timeout=900)
    if r.status_code >= 400:
        return {"ok": False, "status": r.status_code, "error": r.text[:500], "file": path.name}
    data = r.json()
    return {
        "ok": True,
        "file": path.name,
        "path": str(path),
        "video_id": data.get("id"),
        "raw": data,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Upload even if simulation=true in campaign_state.json")
    parser.add_argument("--videos-only", action="store_true")
    parser.add_argument("--images-only", action="store_true")
    parser.add_argument("--dry-run", action="store_true", help="List files only, do not upload")
    args = parser.parse_args()

    token = os.environ.get("META_ACCESS_TOKEN")
    if not token and not args.dry_run:
        log("ERROR: META_ACCESS_TOKEN env var not set.")
        sys.exit(2)

    state = load_state()
    sim = state.get("simulation", True)
    log(f"simulation={sim}, ad_account={AD_ACCOUNT_ID}, phase={state.get('phase')}")

    if sim and not args.force and not args.dry_run:
        log("simulation=true and --force not passed. Upload is a Library-only action (no money). Re-run with --force to proceed.")
        sys.exit(0)

    videos, images = collect_files()
    log(f"Found {len(videos)} videos, {len(images)} images to upload.")

    if args.dry_run:
        for v in videos:
            print(f"VIDEO  {v}")
        for i in images:
            print(f"IMAGE  {i}")
        return

    results = {
        "ad_account_id": AD_ACCOUNT_ID,
        "graph_version": GRAPH_VERSION,
        "started_at": datetime.now(PHT).isoformat(),
        "simulation_flag_at_run": sim,
        "videos": [],
        "images": [],
    }

    if not args.images_only:
        for i, v in enumerate(videos, 1):
            log(f"[{i}/{len(videos)}] uploading video: {v.name} ({v.stat().st_size/1024/1024:.1f} MB)")
            res = upload_video(v, token)
            results["videos"].append(res)
            if not res.get("ok"):
                log(f"  FAILED: {res.get('error')}")
            else:
                log(f"  OK: video_id={res.get('video_id')}")
            time.sleep(0.5)

    if not args.videos_only:
        for i, p in enumerate(images, 1):
            log(f"[{i}/{len(images)}] uploading image: {p.name}")
            res = upload_image(p, token)
            results["images"].append(res)
            if not res.get("ok"):
                log(f"  FAILED: {res.get('error')}")
            else:
                log(f"  OK: hash={res.get('hash')}")
            time.sleep(0.3)

    results["finished_at"] = datetime.now(PHT).isoformat()
    out_path = RESULTS_DIR / "media_upload_map.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    log(f"DONE. Results saved to {out_path}")
    log(f"Videos OK: {sum(1 for r in results['videos'] if r.get('ok'))}/{len(results['videos'])}")
    log(f"Images OK: {sum(1 for r in results['images'] if r.get('ok'))}/{len(results['images'])}")


if __name__ == "__main__":
    main()
