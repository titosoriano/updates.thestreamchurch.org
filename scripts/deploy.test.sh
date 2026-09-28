#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
[ -f "$ROOT/scripts/deploy.sh" ] || { echo "deploy.sh missing" >&2; exit 1; }
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin" "$TMP/work/dist" "$TMP/live"
printf 'new build' > "$TMP/work/dist/index.html"
printf 'old live site' > "$TMP/live/marker.txt"
cat > "$TMP/bin/ssh" <<'SH'
#!/usr/bin/env bash
exit 0
SH
cat > "$TMP/bin/rsync" <<'SH'
#!/usr/bin/env bash
exit 42
SH
chmod +x "$TMP/bin/ssh" "$TMP/bin/rsync"
set +e
(
  cd "$TMP/work"
  PATH="$TMP/bin:$PATH" \
  SSH_HOST=test-host SSH_PORT=22 SSH_USER=test-user \
  DEPLOY_PATH="$TMP/live" RELEASES_PATH="$TMP/releases" \
  SSH_KEY_PATH="$TMP/key" \
  bash "$ROOT/scripts/deploy.sh"
)
code=$?
set -e
if [ "$code" -eq 0 ]; then
  echo "expected failed upload to return nonzero" >&2
  exit 1
fi
if [ "$(cat "$TMP/live/marker.txt")" != "old live site" ]; then
  echo "failed upload changed the live site" >&2
  exit 1
fi
echo "upload failure preserved existing live site"
