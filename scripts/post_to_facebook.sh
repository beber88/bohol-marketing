#!/bin/bash
# Community Agent - Post to Facebook
# Usage: ./scripts/post_to_facebook.sh <post_number>
# Requires META_PAGE_ACCESS_TOKEN in .env.local with pages_manage_posts permission

set -e

POST_NUM="${1:?Usage: $0 <post_number>}"
PAGE_ID="1091251924067685"
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Load token
source "${BASE_DIR}/blue-everest/.env.local" 2>/dev/null
TOKEN="${META_PAGE_ACCESS_TOKEN:-${META_ACCESS_TOKEN}}"

if [ -z "$TOKEN" ]; then
  echo "ERROR: No META_PAGE_ACCESS_TOKEN found in .env.local"
  exit 1
fi

# Find post file
POST_FILE=$(ls "${BASE_DIR}/_queue/community-agent/posts/post_$(printf '%02d' $POST_NUM)"_*.md 2>/dev/null | head -1)
if [ -z "$POST_FILE" ]; then
  echo "ERROR: Post file not found for post #${POST_NUM}"
  exit 1
fi

echo "Publishing post #${POST_NUM} from: ${POST_FILE}"

# Extract Hebrew copy (between "## Hebrew Copy" and first "---")
HEBREW=$(sed -n '/^## Hebrew Copy/,/^---$/p' "$POST_FILE" | sed '1d;$d')

# Extract English copy (between "## English" and "## Sources" or "---")
ENGLISH=$(sed -n '/^## English/,/^## Sources\|^---$/p' "$POST_FILE" | sed '1d;$d')

# Combine
POST_TEXT="${HEBREW}

---

${ENGLISH}"

# Find image
IMAGE_DIR="${BASE_DIR}/_queue/community-agent/images"
# Map post to image based on IMAGE_MAP.md
case $POST_NUM in
  1|5|8|10|11|18) IMG="01_ph_investment_guide.jpg" ;;
  3|14|16) IMG="02_ph_vs_greece.jpg" ;;
  2|4|7|9|15|20) IMG="03_legal_ownership.jpg" ;;
  6|12|19|21|22|24|30|32|34) IMG="04_panglao_aerial.jpg" ;;
  26|46|47|49|50) IMG="05_luxury_villa_pool.jpg" ;;
  28|35|48) IMG="06_jw_marriott_resort.jpg" ;;
  17|23|25|27|31|33) IMG="07_bridge_infrastructure.jpg" ;;
  *) IMG="04_panglao_aerial.jpg" ;;
esac

IMAGE_PATH="${IMAGE_DIR}/${IMG}"

if [ ! -f "$IMAGE_PATH" ]; then
  echo "WARNING: Image not found at ${IMAGE_PATH}, posting text only"
  RESULT=$(curl -s -X POST "https://graph.facebook.com/v21.0/${PAGE_ID}/feed" \
    -d "access_token=${TOKEN}" \
    --data-urlencode "message=${POST_TEXT}")
else
  echo "Uploading with image: ${IMG}"
  RESULT=$(curl -s -X POST "https://graph.facebook.com/v21.0/${PAGE_ID}/photos" \
    -F "message=${POST_TEXT}" \
    -F "source=@${IMAGE_PATH}" \
    -F "access_token=${TOKEN}")
fi

echo "Response: ${RESULT}"

# Check for success
if echo "$RESULT" | grep -q '"id"'; then
  POST_ID=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
  echo "SUCCESS: Post published with ID: ${POST_ID}"

  # Update tracker
  python3 -c "
import json
tracker_path = '${BASE_DIR}/_status/community_agent_tracker.json'
with open(tracker_path) as f:
    data = json.load(f)
data['posts_published'] = data.get('posts_published', 0) + 1
data['status'] = 'ACTIVE'
for p in data.get('posts', []):
    if p['id'] == ${POST_NUM}:
        p['status'] = 'published'
        p['published_at'] = '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
        break
with open(tracker_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('Tracker updated')
" 2>/dev/null

  echo "DONE: Post #${POST_NUM} published successfully"
else
  echo "FAILED: ${RESULT}"
  # Save for manual posting
  MANUAL_FILE="${BASE_DIR}/_completed/community-agent/manual_post_${POST_NUM}_$(date +%Y-%m-%d).md"
  echo "# MANUAL POST NEEDED - Post #${POST_NUM}" > "$MANUAL_FILE"
  echo "# Copy the text below and post to https://www.facebook.com/BlueEverestGroup" >> "$MANUAL_FILE"
  echo "# Upload image: ${IMAGE_PATH}" >> "$MANUAL_FILE"
  echo "" >> "$MANUAL_FILE"
  echo "${POST_TEXT}" >> "$MANUAL_FILE"
  echo "Saved to: ${MANUAL_FILE}"
fi
