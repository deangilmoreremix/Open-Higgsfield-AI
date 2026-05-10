#!/usr/bin/env python3
"""
Batch generate HyperFrames videos for all applications
"""
import os
import subprocess
import json

# All applications to create videos for
APPLICATIONS = {
    # Core apps
    'core-library': {'duration': 20, 'features': ['Search', 'Filters', 'Grid View']},
    'core-settings': {'duration': 15, 'features': ['Inspector Panel', 'Parameters', 'Real-time Preview']},
    'core-explore': {'duration': 15, 'features': ['Discover', 'Browse', 'Trending']},
    'core-image': {'duration': 20, 'features': ['Filters', 'Crop Tool', 'Adjustments']},
    'core-video': {'duration': 20, 'features': ['Timeline', 'Effects', 'Export']},
    'core-storyboard': {'duration': 20, 'features': ['AI Generation', 'Scene Cards', 'Timeline']},
    'core-edit': {'duration': 15, 'features': ['Select', 'Move', 'Zoom']},
    'core-character': {'duration': 15, 'features': ['Create', 'Edit', 'Manage']},
    
    # Extended apps
    'ext-effects': {'duration': 15, 'features': ['Browse', 'Preview', 'Apply']},
    'ext-cinema': {'duration': 15, 'features': ['Movie Tools', 'Projects', 'Export']},
    'ext-influencer': {'duration': 15, 'features': ['Social Media', 'Templates', 'Analytics']},
    'ext-apps': {'duration': 15, 'features': ['Browse', 'Install', 'Manage']},
    'ext-templates': {'duration': 20, 'features': ['Text-to-Image', 'Image-to-Video', 'AI Powered']},
    'ext-assist': {'duration': 15, 'features': ['AI Help', 'Suggestions', 'Automation']},
    'ext-community': {'duration': 15, 'features': ['Share', 'Collaborate', 'Learn']},
    'ext-avatar': {'duration': 15, 'features': ['Create', 'Customize', 'Animate']},
    'ext-audio': {'duration': 20, 'features': ['Mixer', 'Effects', 'Levels']},
}

def generate_html(app_name, config):
    """Generate a simple HyperFrames HTML composition"""
    duration = config['duration']
    features = config['features']
    title = app_name.replace('-', ' ').title()
    
    # Create feature boxes HTML
    feature_boxes = ''
    for i, feature in enumerate(features):
        start_time = 3 + i * 2
        track_index = 10 + i
        feature_boxes += f'''
      <div class="clip feature-box" data-start="{start_time}" data-duration="3" data-track-index="{track_index}" id="box{i}" style="top: 400px; left: {100 + i * 300}px; width: 250px; opacity: 0;">
        {feature}
      </div>'''
    
    html = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{
        margin: 0;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        background: #0a0a0a;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }}
      .header {{
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 80px;
        background: #1a1a2e;
        border-bottom: 2px solid #2a2a4e;
        display: flex;
        align-items: center;
        padding: 0 40px;
      }}
      .title {{
        color: #fff;
        font-size: 48px;
        font-weight: bold;
        opacity: 0;
      }}
      .subtitle {{
        color: #aaa;
        font-size: 24px;
        opacity: 0;
      }}
      .feature-box {{
        position: absolute;
        background: #1a1a2e;
        border: 2px solid #2a2a4e;
        border-radius: 12px;
        padding: 30px;
        color: #fff;
        font-size: 18px;
        font-weight: bold;
      }}
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="{app_name}"
      data-start="0"
      data-duration="{duration}"
      data-width="1920"
      data-height="1080"
    >
      <div class="clip" data-start="0" data-duration="{duration}" data-track-index="0" style="position: absolute; top: 0; left: 0; right: 0; height: 80px; background: #1a1a2e; border-bottom: 2px solid #2a2a4e; display: flex; align-items: center; padding: 0 40px;">
        <div style="color: #fff; font-size: 32px; font-weight: bold;">{title}</div>
      </div>
      
      <div class="clip" data-start="0.5" data-duration="{duration-1}" data-track-index="1" style="position: absolute; top: 200px; left: 100px;">
        <div class="title" id="main-title">{title}</div>
        <div class="subtitle" id="subtitle">Application Demo</div>
      </div>
      {feature_boxes}
      
      <div class="clip" data-start="{duration-5}" data-duration="5" data-track-index="20" id="complete" style="position: absolute; top: 600px; left: 800px; color: #4a90e2; font-size: 36px; font-weight: bold; opacity: 0;">
        {title} - Demo Complete
      </div>
    </div>

    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      
      tl.to('#main-title', {{ opacity: 1, duration: 0.5 }}, 0.5);
      tl.to('#subtitle', {{ opacity: 1, duration: 0.5 }}, 1);
      
      tl.to('#box0', {{ opacity: 1, duration: 0.5 }}, 3);
      tl.to('#box1', {{ opacity: 1, duration: 0.5 }}, 5);
      tl.to('#box2', {{ opacity: 1, duration: 0.5 }}, 7);
      
      tl.to('#complete', {{ opacity: 1, duration: 0.5 }}, {duration-5});
      
      window.__timelines["{app_name}"] = tl;
    </script>
  </body>
</html>'''
    
    return html

def main():
    base_dir = 'demo-videos'
    
    for app_name, config in APPLICATIONS.items():
        print(f"Processing: {app_name}")
        
        # Create directory
        app_dir = os.path.join(base_dir, app_name)
        os.makedirs(app_dir, exist_ok=True)
        
        # Generate HTML
        html_content = generate_html(app_name, config)
        html_path = os.path.join(app_dir, 'index.html')
        with open(html_path, 'w') as f:
            f.write(html_content)
        
        # Initialize hyperframes project (to get package.json)
        subprocess.run(
            ['npx', 'hyperframes', 'init', app_name, '--yes'],
            cwd=base_dir,
            capture_output=True
        )
        
        print(f"  Created: {html_path}")
    
    print("\nAll compositions generated!")

if __name__ == '__main__':
    main()
