#!/bin/bash

# Quick batch video generator using templates
# Creates basic demo videos for all remaining applications

BASE_DIR="demo-videos"
APPS=(
    "settings:Inspector Panel,Parameters,Real-time Preview"
    "explore:Discover,Browse,Trending"
    "image:Filters,Crop Tool,Adjustments"
    "video:Timeline,Effects,Export"
    "storyboard:AI Generation,Scene Cards,Timeline"
    "edit:Select,Move,Zoom"
    "character:Create,Edit,Manage"
    "effects:Browse,Preview,Apply"
    "cinema:Movie Tools,Projects,Export"
    "influencer:Social Media,Templates,Analytics"
    "apps:Browse,Install,Manage"
    "templates:Text-to-Image,Image-to-Video,AI Powered"
    "assist:AI Help,Suggestions,Automation"
    "community:Share,Collaborate,Learn"
    "avatar:Create,Customize,Animate"
    "audio:Mixer,Effects,Levels"
)

for APP_INFO in "${APPS[@]}"; do
    APP_NAME=$(echo "$APP_INFO" | cut -d: -f1)
    FEATURES=$(echo "$APP_INFO" | cut -d: -f2)
    
    echo "=========================================="
    echo "Creating video for: $APP_NAME"
    echo "Features: $FEATURES"
    echo "=========================================="
    
    # Create directory
    mkdir -p "$BASE_DIR/core-$APP_NAME"
    
    # Create HTML file
    cat > "$BASE_DIR/core-$APP_NAME/index.html" <<HTMLEOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        margin: 0; width: 1920px; height: 1080px; overflow: hidden;
        background: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      .header {
        position: absolute; top: 0; left: 0; right: 0; height: 80px;
        background: #1a1a2e; border-bottom: 2px solid #2a2a4e;
        display: flex; align-items: center; padding: 0 40px;
      }
      .title {
        color: #fff; font-size: 48px; font-weight: bold; opacity: 0;
      }
      .feature-box {
        position: absolute; background: #1a1a2e; border: 2px solid #2a2a4e;
        border-radius: 12px; padding: 30px; color: #fff; font-size: 18px; font-weight: bold; opacity: 0;
      }
      .complete {
        position: absolute; color: #4a90e2; font-size: 36px; font-weight: bold; opacity: 0;
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="$APP_NAME" data-start="0" data-duration="15" data-width="1920" data-height="1080">
      <div class="clip" data-start="0" data-duration="15" data-track-index="0"
           style="position: absolute; top: 0; left: 0; right: 0; height: 80px; background: #1a1a2e; border-bottom: 2px solid #2a2a4e; display: flex; align-items: center; padding: 0 40px;">
        <div style="color: #fff; font-size: 32px; font-weight: bold;">$APP_NAME</div>
      </div>
      
      <div class="clip" data-start="0.5" data-duration="14" data-track-index="1"
           style="position: absolute; top: 200px; left: 100px;">
        <div class="title" id="title-$APP_NAME">$APP_NAME</div>
      </div>
      
      <div class="feature-box clip" data-start="3" data-duration="3" data-track-index="2"
           style="top: 400px; left: 100px; width: 300px;">$(echo $FEATURES | cut -d, -f1)</div>
      <div class="feature-box clip" data-start="5" data-duration="3" data-track-index="3"
           style="top: 400px; left: 500px; width: 300px;">$(echo $FEATURES | cut -d, -f2)</div>
      <div class="feature-box clip" data-start="7" data-duration="3" data-track-index="4"
           style="top: 400px; left: 900px; width: 300px;">$(echo $FEATURES | cut -d, -f3)</div>
      
      <div class="complete clip" data-start="10" data-duration="5" data-track-index="5"
           style="top: 600px; left: 800px;">$APP_NAME - Complete</div>
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.to('#title-$APP_NAME', { opacity: 1, duration: 0.5 }, 0.5);
      tl.to('#title-$APP_NAME', { opacity: 0, duration: 0.3 }, 2);
      tl.to('[data-start="3"]', { opacity: 1, duration: 0.5 }, 3);
      tl.to('[data-start="5"]', { opacity: 1, duration: 0.5 }, 5);
      tl.to('[data-start="7"]', { opacity: 1, duration: 0.5 }, 7);
      tl.to('[data-start="10"]', { opacity: 1, duration: 0.5 }, 10);
      window.__timelines["$APP_NAME"] = tl;
    </script>
  </body>
</html>
HTMLEOF

    echo "  HTML created for $APP_NAME"
    
    # Initialize hyperframes project
    (cd "$BASE_DIR/core-$APP_NAME" && npm init -y > /dev/null 2>&1 && npm install hyperframes --save-dev > /dev/null 2>&1)
    
    # Render
    echo "  Rendering $APP_NAME video..."
    (cd "$BASE_DIR/core-$APP_NAME" && npx hyperframes render 2>&1 | grep -E "(completed|error)" | tail -1)
    
    echo "  Completed: $APP_NAME"
    echo ""
done

echo "=========================================="
echo "All core videos generated!"
echo "=========================================="
