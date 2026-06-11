#!/bin/sh
echo "=== ENTRYPOINT ==="
echo "Checking data directory..."
ls -la /app/server/data/ 2>/dev/null || echo "data dir empty"
echo "Checking seed..."
ls -la /app/server/data-seed/ 2>/dev/null || echo "no seed"

# Always copy seed DB to data (overwrites volume's empty DB)
if [ -f /app/server/data-seed/fb-autoposter.db ]; then
  cp -f /app/server/data-seed/fb-autoposter.db /app/server/data/fb-autoposter.db
  echo "DB synced from deploy ($(wc -c < /app/server/data/fb-autoposter.db) bytes)"
else
  echo "WARNING: No seed DB found"
fi

exec node server/src/index.js
# 1780984854
# 1780985714
# 1780986508
