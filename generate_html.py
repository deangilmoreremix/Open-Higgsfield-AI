#!/usr/bin/env python3
"""Generate HTML files for remaining core apps"""

import os

BASE_DIR = "/workspace/0c85e0dc-1244-40ab-8f84-e11668f857da/sessions/agent_b64f4b8e-d076-49a3-a9ae-6ff7715bbd4e/demo-videos"

# App configurations: (folder, title, feature1, feature2, feature3)
APS = [
    ("core-video", "Video Editor", "Timeline", "Effects", "Export"),
    ("core-storyboard", "Storyboard", "AI Generation", "Scene Cards", "Timeline"),
    ("core-edit", "Edit Tools", "Select", "Move", "Zoom"),
    ("core-character", "Character", "Create", "Edit", "Manage"),
]

HTML_TEMPLATE = '''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{
        margin: 0; width: 1920px; height: 1080px; overflow: hidden;
        background: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }}
      .header {{
        position: absolute; top: 0; left: 0; right: 0; height: 80px;
        background: #1a1a2e; border-bottom: 2px solid #2a2a4e;
        display: flex; align-items: center; padding: 0 40px;
      }}
      .content {{
        position: absolute; top: 80px; left: 0; right: 0; bottom: 0;
        padding: 40px; overflow-y: auto;
      }}
      .feature-box {{
        position: absolute; background: #1a1a2e; border: 2px solid #2a2a4e;
        border-radius: 12px; padding: 30px; color: #fff;
        font-size: 18px; font-weight: bold; opacity: 0;
      }}
      .feature-label {{
        position: absolute; color: #4a90e2; font-size: 28px; font-weight: bold; opacity: 0;
      }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="{app}" data-start="0" data-duration="15" data-width="1920" data-height="1080">
      <div class="clip" data-start="0" data-duration="15" data-track-index="0"
           style="position: absolute; top: 0; left: 0; right: 0; height: 80px; background: #1a1a2e; border-bottom: 2px solid #2a2a4e; display: flex; align-items: center; padding: 0 40px;">
        <div style="color: #fff; font-size: 32px; font-weight: bold;">{title}</div>
      </div>
      
      <div class="clip" data-start="0" data-duration="15" data-track-index="1"
           style="position: absolute; top: 80px; left: 0; right: 0; bottom: 0; padding: 40px; overflow-y: auto;">
        <div class="feature-box clip" data-start="3" data-duration="3" data-track-index="2"
             style="top: 100px; left: 100px; width: 300px;">{feature1}</div>
        <div class="feature-box clip" data-start="5" data-duration="3" data-track-index="3"
             style="top: 100px; left: 500px; width: 300px;">{feature2}</div>
        <div class="feature-box clip" data-start="7" data-duration="3" data-track-index="4"
             style="top: 100px; left: 900px; width: 300px;">{feature3}</div>
        
        <div class="clip" data-start="10" data-duration="5" data-track-index="5"
             style="position: absolute; top: 500px; left: 800px; color: #4a90e2; font-size: 36px; font-weight: bold; opacity: 0;">
          {title} - Complete
        </div>
      </div>
      
      <div class="feature-label clip" data-start="3" data-duration="2" data-track-index="10" id="label1" style="top: 200px; left: 100px;">{feature1}</div>
      <div class="feature-label clip" data-start="5" data-duration="2" data-track-index="11" id="label2" style="top: 200px; left: 100px;">{feature2}</div>
      <div class="feature-label clip" data-start="7" data-duration="2" data-track-index="12" id="label3" style="top: 200px; left: 100px;">{feature3}</div>
    </div>

    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      tl.to('[data-start="3"]', {{ opacity: 1, duration: 0.5 }}, 3);
      tl.to('#label1', {{ opacity: 1, duration: 0.5 }}, 3);
      tl.to('#label1', {{ opacity: 0, duration: 0.3 }}, 4.5);
      tl.to('[data-start="5"]', {{ opacity: 1, duration: 0.5 }}, 5);
      tl.to('#label2', {{ opacity: 1, duration: 0.5 }}, 5);
      tl.to('#label2', {{ opacity: 0, duration: 0.3 }}, 6.5);
      tl.to('[data-start="7"]', {{ opacity: 1, duration: 0.5 }}, 7);
      tl.to('#label3', {{ opacity: 1, duration: 0.5 }}, 7);
      tl.to('#label3', {{ opacity: 0, duration: 0.3 }}, 8.5);
      tl.to('[data-start="10"]', {{ opacity: 1, duration: 0.5 }}, 10);
      window.__timelines["{app}"] = tl;
    </script>
  </body>
</html>'''

for folder, title, f1, f2, f3 in APS:
    app = folder.replace("core-", "")
    html = HTML_TEMPLATE.format(
        app=app,
        title=title,
        feature1=f1,
        feature2=f2,
        feature3=f3
    )
    
    filepath = os.path.join(BASE_DIR, folder, "index.html")
    with open(filepath, 'w') as f:
        f.write(html)
    print(f"Created: {filepath}")

print("\nAll HTML files generated!")
