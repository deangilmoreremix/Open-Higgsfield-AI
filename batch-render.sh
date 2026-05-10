#!/bin/bash

# Batch render all demo videos
echo "=========================================="
echo "Starting batch render of all demo videos"
echo "=========================================="

BASE_DIR="demo-videos"

# Array of all video directories to render
VIDEOS=(
    "core-explore"
    "core-image"
    "core-video"
    "core-storyboard"
    "core-edit"
    "core-character"
    "ext-effects"
    "ext-cinema"
    "ext-influencer"
    "ext-apps"
    "ext-templates"
    "ext-assist"
    "ext-community"
    "ext-avatar"
    "ext-audio"
    "apps-ai-storyboarder"
    "apps-ai-vfx"
    "apps-director"
    "apps-remix-go"
    "apps-sendspark"
    "apps-vimax"
    "mod-rendiv"
    "mod-ltx-desktop"
    "mod-cinegen"
    "mod-chatvideo"
)

echo "Will render ${#VIDEOS[@]} videos..."

# Render each video
for VIDEO in "${VIDEOS[@]}"; do
    echo ""
    echo "=========================================="
    echo "Rendering: $VIDEO"
    echo "=========================================="

    VIDEO_DIR="$BASE_DIR/$VIDEO"

    if [ ! -d "$VIDEO_DIR" ]; then
        echo "❌ Directory not found: $VIDEO_DIR"
        continue
    fi

    echo "📁 Processing: $VIDEO_DIR"

    # Create renders directory if it doesn't exist
    mkdir -p "$VIDEO_DIR/renders"

    # Change to directory and render
    cd "$VIDEO_DIR"
    echo "🎬 Starting render for $VIDEO..."

    # Run render with timeout
    timeout 300 npx hyperframes render 2>&1 | grep -E "(completed|Rendering|error|Error)" | tail -3

    # Check if render was successful
    if ls renders/*.mp4 >/dev/null 2>&1; then
        FILE_SIZE=$(ls -lh renders/*.mp4 | awk '{print $5}')
        echo "✅ $VIDEO: Rendered successfully ($FILE_SIZE)"
    else
        echo "❌ $VIDEO: Render failed or no MP4 found"
    fi

    # Go back to base directory
    cd - >/dev/null
done

echo ""
echo "=========================================="
echo "Batch render complete!"
echo "=========================================="

# Final verification
echo ""
echo "=== FINAL VERIFICATION ==="
TOTAL_VIDEOS=$(find "$BASE_DIR" -name "*.mp4" -type f | wc -l)
echo "Total MP4 files found: $TOTAL_VIDEOS"

if [ "$TOTAL_VIDEOS" -ge 28 ]; then
    echo "✅ SUCCESS: All 28 videos rendered!"
else
    echo "⚠️  WARNING: Only $TOTAL_VIDEOS videos found (expected 28+)"
fi

# Show file sizes
echo ""
echo "=== VIDEO FILE SIZES ==="
find "$BASE_DIR" -name "*.mp4" -type f -exec ls -lh {} \; | sort -k5 -h | tail -10

echo ""
echo "=========================================="
echo "Demo videos are ready in: $BASE_DIR"
echo "=========================================="