#!/bin/bash
# Script to test Netlify Function locally
# Run this from the repo root

set -e

echo "🔨 Building app..."
cd apps/app

# Build the app
pnpm build

# Create netlify functions directory structure
echo "📦 Setting up Netlify Functions..."
mkdir -p netlify/functions/server
cp -r dist/server/* netlify/functions/server/

echo "✅ Build complete! Now run: netlify dev"
echo ""
echo "The function will be available at: http://localhost:8888/.netlify/functions/server"
echo "Or visit: http://localhost:8888/ (will redirect to the function)"

