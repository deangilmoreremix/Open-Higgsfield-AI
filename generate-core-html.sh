#!/bin/bash

# Generate HTML files for remaining core apps

generate_html() {
    local APP_NAME=$1
    local TITLE=$2
    local FIELDS=$3
    local COLOR=$4
    
    cat > "core-$APP_NAME/index.html" <<EOF
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
      .content {
        position: absolute; top: 80px; left: 0; right: 0; bottom: 0;
        padding: 40px; overflow-y: auto;
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
        <div style="color: #fff; font-size: 32px; font-weight: bold;">$TITLE</div>
      </div>
      
      <div class="clip" data-start="0" data-duration="15" data-track-index="1"
           style="position: absolute; top: 80px; left: 0; right: 0; bottom: 0; padding: 40px; overflow-y: auto;">
        <div class="feature-box clip" data-start="3" data-duration="3" data-track-index="2"
             style="top: 100px; left: 100px; width: 300px;">${FIELDS[0]}</div>
        <div class="feature-box clip" data-start="5" data-duration="3" data-track-index="3"
             style="top: 100px; left: 500px; width: 300px;">${FIELDS[1]}</div>
        <div class="feature-box clip" data-start="7" data-duration="3" data-track-index="4"
             style="top: 100px; left: 900px; width: 300px;">${FIELDS[2]}</div>
        
        <div class="complete clip" data-start="10" data-duration="5" data-track-index="5"
             style="top: 500px; left: 800px;">$TITLE - Complete</div>
      </div>
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.to('[data-start="3"]', { opacity: 1, duration: 0.5 }, 3);
      tl.to('[data-start="5"]', { opacity: 1, duration: 0.5 }, 5);
      tl.to('[data-start="7"]', { opacity: 1, duration: 0.5 }, 7);
      tl.to('[data-start="10"]', { opacity: 1, duration: 0.5 }, 10);
      window.__timelines["$APP_NAME"] = tl;
    </script>
  </body>
</html>
EOF
    
    echo "Created: core-$APP_NAME/index.html"
}

# Generate HTML for remaining core apps
generate_html "image" "Image Editor" "Filters Crop-Tool Adjustments" 
generate_html "video" "Video Editor" "Timeline Effects Export"
generate_html "storyboard" "Storyboard" "AI-Generation Scene-Cards Timeline"
generate_html "edit" "Edit Tools" "Select Move Zoom"
generate_html "character" "Character" "Create Edit Manage"

echo "All HTML files generated!"