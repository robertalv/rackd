#!/bin/bash
# Netlify build script for the app
# This script ensures we're running from the repo root

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the repo root (two levels up from apps/app/)
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Change to repo root
cd "$REPO_ROOT"

echo "📦 Building from repo root: $REPO_ROOT"
echo "📁 Current directory: $(pwd)"
echo "📂 Script location: $SCRIPT_DIR"

# Verify we're in the right place (check for pnpm-workspace.yaml)
if [ ! -f "pnpm-workspace.yaml" ]; then
  echo "❌ Error: pnpm-workspace.yaml not found. Are we in the repo root?"
  echo "   Current directory: $(pwd)"
  exit 1
fi

# Run Convex deploy and build
echo "🚀 Starting build..."
npx convex deploy --cmd-url-env-var-name VITE_CONVEX_URL --cmd "pnpm --filter app build && mkdir -p apps/app/netlify/functions/server && cp -r apps/app/dist/server/* apps/app/netlify/functions/server/"

echo "✅ Build complete!"
echo "📦 Checking build output..."
ls -la apps/app/dist/client/ | head -5
ls -la apps/app/netlify/functions/server/ | head -5

