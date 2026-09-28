#!/usr/bin/env bash
set -euo pipefail

: "${SSH_HOST:?SSH_HOST is required}"
: "${SSH_PORT:?SSH_PORT is required}"
: "${SSH_USER:?SSH_USER is required}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
: "${RELEASES_PATH:?RELEASES_PATH is required}"

SSH_KEY_PATH=${SSH_KEY_PATH:-"$HOME/.ssh/deploy_key"}

case "$DEPLOY_PATH" in
  ""|"/") echo "Unsafe DEPLOY_PATH; refusing to deploy" >&2; exit 1 ;;
esac
case "$RELEASES_PATH" in
  ""|"/") echo "Unsafe RELEASES_PATH; refusing to deploy" >&2; exit 1 ;;
esac
if [ "$DEPLOY_PATH" = "$RELEASES_PATH" ]; then
  echo "DEPLOY_PATH and RELEASES_PATH must be different" >&2
  exit 1
fi
if [ ! -d dist ] || [ ! -f dist/index.html ]; then
  echo "dist/index.html is missing; refusing to deploy" >&2
  exit 1
fi

release_source=${GITHUB_SHA:-manual-$(date -u +%Y%m%dT%H%M%SZ)}
release_id=$(printf '%s' "$release_source" | tr -cd 'A-Za-z0-9._-' | cut -c1-64)
remote_release="$RELEASES_PATH/$release_id"
ssh_opts=(-i "$SSH_KEY_PATH" -p "$SSH_PORT" -o StrictHostKeyChecking=yes -o BatchMode=yes)
remote="$SSH_USER@$SSH_HOST"

printf 'Staging release %s\n' "$release_id"
ssh "${ssh_opts[@]}" "$remote" "mkdir -p '$remote_release' '$RELEASES_PATH'"
rsync -az --delete -e "ssh -i '$SSH_KEY_PATH' -p '$SSH_PORT' -o StrictHostKeyChecking=yes -o BatchMode=yes" dist/ "$remote:$remote_release/"
ssh "${ssh_opts[@]}" "$remote" "test -f '$remote_release/index.html'"

printf 'Activating release %s\n' "$release_id"
ssh "${ssh_opts[@]}" "$remote" bash -s -- "$DEPLOY_PATH" "$remote_release" "$RELEASES_PATH" <<'REMOTE'
set -euo pipefail
live=$1
release=$2
releases=$3
stamp=$(date -u +%Y%m%dT%H%M%SZ)
backup_new="$releases/.previous-new-$stamp"
previous="$releases/previous"

mkdir -p "$live" "$releases"

if [ -n "$(find "$live" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]; then
  rm -rf "$backup_new"
  mkdir -p "$backup_new"
  rsync -a --delete "$live/" "$backup_new/"
fi

if ! rsync -a --delete "$release/" "$live/"; then
  echo "Activation failed; restoring previous live content" >&2
  if [ -d "$backup_new" ]; then
    rsync -a --delete "$backup_new/" "$live/" || true
  fi
  exit 1
fi

if [ -d "$backup_new" ]; then
  rm -rf "$previous"
  mv "$backup_new" "$previous"
fi
REMOTE

printf 'Deployment complete: %s\n' "$release_id"
