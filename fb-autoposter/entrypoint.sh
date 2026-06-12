#!/bin/sh
echo "=== ENTRYPOINT ==="
echo "Checking data directory..."
ls -la /app/server/data/ 2>/dev/null || echo "data dir empty"
echo "Checking seed..."
ls -la /app/server/data-seed/ 2>/dev/null || echo "no seed"

DB_FILE="/app/server/data/fb-autoposter.db"
SEED_FILE="/app/server/data-seed/fb-autoposter.db"

should_restore_seed=0
if [ ! -f "$DB_FILE" ]; then
  should_restore_seed=1
elif [ -f "$SEED_FILE" ]; then
  default_counts=$(node - <<'NODE' 2>/dev/null
const Database = require('/app/server/node_modules/better-sqlite3');
const db = new Database('/app/server/data/fb-autoposter.db', { readonly: true, fileMustExist: true });
try {
  const groups = db.prepare("SELECT count(*) AS count FROM groups WHERE profile_id = 'default'").get().count;
  const campaigns = db.prepare("SELECT count(*) AS count FROM campaigns WHERE profile_id = 'default'").get().count;
  console.log(`${groups}:${campaigns}`);
} catch (_) {
  console.log('0:0');
} finally {
  db.close();
}
NODE
)
  if [ "${default_counts:-0:0}" = "0:0" ]; then
    should_restore_seed=1
    echo "Volume DB has no default profile data, restoring from seed"
  fi
fi

if [ "$should_restore_seed" = "1" ] && [ -f "$SEED_FILE" ]; then
  rm -f "${DB_FILE}-wal" "${DB_FILE}-shm"
  cp -f /app/server/data-seed/fb-autoposter.db /app/server/data/fb-autoposter.db
  rm -f "${DB_FILE}-wal" "${DB_FILE}-shm"
  echo "DB synced from deploy ($(wc -c < /app/server/data/fb-autoposter.db) bytes)"
elif [ -f "$DB_FILE" ]; then
  echo "DB already exists on volume ($(wc -c < "$DB_FILE") bytes)"
else
  echo "WARNING: No seed DB found"
fi

exec node server/src/index.js
# 1780984854
# 1780985714
# 1780986508
