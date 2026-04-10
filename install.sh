#!/usr/bin/env bash
# Install OSSInsight skill for Claude Code
# Creates symlink from this repo's skill/ dir into ~/.claude/skills/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_SRC="$SCRIPT_DIR/skill/ossinsight"
SKILL_DST="$HOME/.claude/skills/ossinsight"

echo "=== OSSInsight Skill Installer ==="
echo ""

# Check dependencies
for cmd in node npm curl jq; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is required but not found. Please install it first."
    exit 1
  fi
done

# Install npm dependencies
echo "[1/3] Installing npm dependencies..."
cd "$SCRIPT_DIR"
npm install --silent 2>/dev/null
echo "  Done."

# Build TypeScript
echo "[2/3] Building TypeScript..."
npx tsc 2>/dev/null
echo "  Done."

# Create skill symlink
echo "[3/3] Installing Claude Code skill..."
mkdir -p "$HOME/.claude/skills"

if [ -L "$SKILL_DST" ]; then
  echo "  Removing existing symlink..."
  rm "$SKILL_DST"
elif [ -d "$SKILL_DST" ]; then
  echo "  WARNING: $SKILL_DST exists as a directory. Backing up to ${SKILL_DST}.bak"
  mv "$SKILL_DST" "${SKILL_DST}.bak"
fi

ln -s "$SKILL_SRC" "$SKILL_DST"
echo "  Symlinked: $SKILL_DST -> $SKILL_SRC"

echo ""
echo "Installation complete!"
echo ""
echo "Usage in Claude Code:"
echo "  /ossinsight trending Python repos this week"
echo "  /ossinsight analyze facebook/react"
echo "  /ossinsight compare react vs vue"
echo ""
echo "Standalone CLI usage:"
echo "  cd $SCRIPT_DIR"
echo "  npx tsx src/index.ts trending -l Python"
echo "  npx tsx src/index.ts repo facebook/react"
echo "  npx tsx src/index.ts compare facebook/react vuejs/vue"
