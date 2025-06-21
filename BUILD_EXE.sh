#!/bin/bash
echo "Building Serqo Windows EXE..."

# Build web assets
echo "Building web assets..."
vite build
mkdir -p client/dist
cp -r dist/public/* client/dist/

# Create Electron package
echo "Creating Windows installer..."
npx electron-builder --win

echo "Windows installer created in dist/ folder"