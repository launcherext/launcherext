#!/bin/bash

# Launch Ext - Test Script
# Builds and tests the extension locally

set -e

echo "🧪 Launch Ext - Test Build"
echo "=========================="

# Clean and build
echo "🔨 Building..."
rm -rf dist
npm run build

echo "✅ Build complete!"
echo ""
echo "📍 Load the extension:"
echo "1. Open Chrome: chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select: $(pwd)/dist"
echo ""
echo "🧪 Test checklist:"
echo "  [ ] Extension loads without errors"
echo "  [ ] Popup opens and renders correctly"
echo "  [ ] Wallet connection works"
echo "  [ ] Banner generation works"
echo "  [ ] Token launch works (testnet first!)"
echo "  [ ] Dashboard displays correctly"
echo "  [ ] History tab shows launches"
echo ""
echo "💡 Open Chrome DevTools to see console logs"
echo "   Right-click extension icon → Inspect Popup"
