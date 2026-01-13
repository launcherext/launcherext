#!/bin/bash

# Launch Ext - Release Build Script
# Builds and packages the extension for Chrome Web Store submission

set -e  # Exit on error

echo "🚀 Launch Ext - Building for Release"
echo "===================================="

# Check if version is provided
if [ -z "$1" ]; then
    echo "❌ Error: Version number required"
    echo "Usage: ./scripts/build-release.sh 1.0.0"
    exit 1
fi

VERSION=$1
echo "📦 Version: $VERSION"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -f launch-ext-v*.zip

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build the extension
echo "🔨 Building extension..."
npm run build

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build complete!"

# Update version in manifest
echo "📝 Updating version in manifest..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" extension/manifest.json
else
    # Linux
    sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" extension/manifest.json
fi

# Copy updated manifest to dist
cp extension/manifest.json dist/manifest.json

# Create ZIP package
echo "📦 Creating ZIP package..."
cd dist
zip -r ../launch-ext-v$VERSION.zip .
cd ..

echo "✅ Package created: launch-ext-v$VERSION.zip"

# Verify ZIP contents
echo "📋 ZIP contents:"
unzip -l launch-ext-v$VERSION.zip | head -20

echo ""
echo "✅ Release build complete!"
echo ""
echo "Next steps:"
echo "1. Test the extension by loading dist/ as unpacked extension"
echo "2. Upload launch-ext-v$VERSION.zip to Chrome Web Store"
echo "3. Fill in store listing details"
echo "4. Submit for review"
echo ""
echo "🎉 Good luck with your release!"
