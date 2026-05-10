#!/bin/bash

# Batch generate core application videos

APPS=("library" "settings" "explore" "image" "video" "storyboard" "edit" "character")

for APP in "${APPS[@]}"; do
  echo "Creating video for: $APP"
  
  # Initialize hyperframes project
  cd demo-videos
  npx hyperframes init "core-$APP" --yes 2>&1 | tail -3
  
  # Create a simple composition
  cat > "core-$APP/index.html" <<EOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        margin: 0;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        background: #0a0a0a;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      .header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: #1a1a2e;
        border-bottom: 2px solid #2a2a4e;
        display: flex;
        align-items: center;
        padding: 0 40px;
      }
      .title {
        color: #fff;
        font-size: 48px;
        font-weight: bold;
      }
      .subtitle {
        color: #aaa;
        font-size: 24px;
        margin-top: 20px;
      }
      .feature-box {
        position: absolute;
        background: #1a1a2e;
        border: 2px solid #2a2a4e;
        border-radius: 12px;
        padding: 30px;
        color: #fff;
      }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="$APP"
      data-start="0"
      data-duration="15"
      data-width="1920"
      data-height="1080"
    >
      <div class="clip" data-start="0" data-duration="15" data-track-index="0" style="position: absolute; top: 0; left: 0; right: 0; height: 80px; background: #1a1a2e; border-bottom: 2px solid #2a2a4e; display: flex; align-items: center; padding: 0 40px;">
        <div style="color: #fff; font-size: 32px; font-weight: bold;">$APP</div>
      </div>
      
      <div class="clip" data-start="0.5" data-duration="14" data-track-index="1" style="position: absolute; top: 200px; left: 100px;">
        <div class="title" id="main-title" style="opacity: 0;">$APP</div>
        <div class="subtitle" id="subtitle" style="opacity: 0;">Application Demo</div>
      </div>
      
      <div class="clip feature-box" data-start="3" data-duration="3" data-track-index="2" id="box1" style="top: 400px; left: 100px; width: 400px; opacity: 0;">
        Feature 1
      </div>
      
      <div class="clip feature-box" data-start="5" data-duration="3" data-track-index="3" id="box2" style="top: 400px; left: 560px; width: 400px; opacity: 0;">
        Feature 2
      </div>
      
      <div class="clip feature-box" data-start="7" data-duration="3" data-track-index="4" id="box3" style="top: 400px; left: 1020px; width: 400px; opacity: 0;">
        Feature 3
      </div>
      
      <div class="clip" data-start="10" data-duration="5" data-track-index="5" id="complete" style="position: absolute; top: 600px; left: 800px; color: #4a90e2; font-size: 36px; font-weight: bold; opacity: 0;">
        $APP - Demo Complete
      </div>
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      
      tl.to('#main-title', { opacity: 1, y: 0, duration: 0.5 }, 0.5);
      tl.to('#subtitle', { opacity: 1, y: 0, duration: 0.5 }, 1);
      
      tl.to('#box1', { opacity: 1, scale: 1, duration: 0.5 }, 3);
      tl.to('#box2', { opacity: 1, scale: 1, duration: 0.5 }, 5);
      tl.to('#box3', { opacity: 1, scale: 1, duration: 0.5 }, 7);
      
      tl.to('#complete', { opacity: 1, duration: 0.5 }, 10);
      
      window.__timelines["$APP"] = tl;
    </script>
  </body>
</html>
EOF
  
  # Render the video
  cd "core-$APP"
  npm run render 2>&1 | grep -E "(completed|error)" | tail -3
  cd ../..
  
  echo "Completed: $APP"
done

echo "All core videos generated!"
