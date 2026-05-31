# Complete Open-Generative-AI Apps - Production Ready Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Make Open-Pomelli and Videco AI Platform 100% production ready with all features from upstream repositories.

**Architecture:** Add server-side API endpoints, implement missing UI components, integrate Supabase for persistence.

---

## Missing Features to Complete

### Open-Pomelli Production Features
1. **Server API `/api/analyze-website`** - Playwright scraper
2. **Editable DNA panel** - Chips, color pickers, persistence
3. **Campaign Generator** - Goal picker, concept generation
4. **Platform Creatives** - 8 format generator (Instagram, LinkedIn, etc.)
5. **Canvas Editor** - 9-position grid overlay

### Videco Production Features
1. **Analytics API** - View tracking, metrics endpoints
2. **Supabase schema** - Tables for videos, templates
3. **Enhanced templates** - Categories, preview thumbnails

---

## File Structure

```
app/api/analyze-website/
  route.js           # NEW: Playwright scraper endpoint

app/api/pomelli/
  campaign/
    route.js         # NEW: Campaign generation endpoint
  creative/
    route.js         # NEW: Platform creative endpoint

src/apps/open-pomelli/
  components/
    DnaPanel.jsx     # NEW: Editable DNA chips
    CampaignPicker.jsx  # NEW: Goal selector
    CreativeGrid.jsx    # NEW: 8 format outputs
    CanvasEditor.jsx    # NEW: Overlay editor

src/apps/videco/
  services/
    videcoService.js # NEW: Analytics helpers
  components/
    AnalyticsChart.jsx  # NEW: Metrics display
```

---

## Task 1: Server-side Website Analyzer API

**Files:**
- Create: `app/api/analyze-website/route.js`

- [ ] **Step 1: Create Playwright-based website scraper endpoint**

```js
// app/api/analyze-website/route.js
import { chromium } from 'playwright';

export async function POST(request) {
  const { url } = await request.json();
  
  if (!url) {
    return Response.json({ error: 'URL required' }, { status: 400 });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Extract page info
    const title = await page.title();
    const html = await page.content();
    
    // Take screenshot
    const screenshotBuffer = await page.screenshot({ fullPage: false });
    const base64Screenshot = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
    
    // Extract colors from CSS
    const colors = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const colorSet = new Set();
      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.color && style.color !== 'rgb(0, 0, 0)') colorSet.add(style.color);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colorSet.add(style.backgroundColor);
        }
      });
      return Array.from(colorSet).slice(0, 10);
    });

    return Response.json({
      url,
      title,
      colors,
      html,
      screenshotUrl: base64Screenshot
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 2: Install Playwright dependency if needed**

```bash
npm install playwright --save-dev
```

- [ ] **Step 3: Commit**

```bash
git add app/api/analyze-website/route.js
git commit -m "feat: add Playwright website scraper API endpoint"
```

---

## Task 2: Editable DNA Panel Component

**Files:**
- Create: `src/apps/open-pomelli/components/DnaPanel.jsx`

- [ ] **Step 1: Create editable DNA panel with chips and color pickers**

```jsx
// src/apps/open-pomelli/components/DnaPanel.jsx
"use client";

import { useState } from "react";

const TONE_CHIPS = ['professional', 'casual', 'playful', 'serious', 'innovative', 'trustworthy', 'bold', 'minimal'];
const PERSONALITY_CHIPS = ['modern', 'classic', 'luxury', 'accessible', 'edgy', 'friendly', 'authoritative', 'approachable'];

export default function DnaPanel({ dna, onChange }) {
  const [editingColor, setEditingColor] = useState(null);

  const toggleChip = (type, value) => {
    const current = dna[type] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...dna, [type]: updated });
  };

  const updateColor = (index, newColor) => {
    const colors = [...(dna.colors || [])];
    colors[index] = newColor;
    onChange({ ...dna, colors });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-primary uppercase mb-2">Brand Name</h3>
        <input
          type="text"
          value={dna.name || ''}
          onChange={(e) => onChange({ ...dna, name: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          placeholder="Brand name..."
        />
      </div>

      <div>
        <h3 className="text-xs font-bold text-primary uppercase mb-2">Primary Colors</h3>
        <div className="flex gap-2 flex-wrap">
          {(dna.colors || []).map((color, i) => (
            <div key={i} className="relative">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={() => setEditingColor(i)}
              />
              {editingColor === i && (
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(i, e.target.value)}
                  onBlur={() => setEditingColor(null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  autoFocus
                />
              )}
            </div>
          ))}
          <button
            onClick={() => onChange({ ...dna, colors: [...(dna.colors || []), '#cccccc'] })}
            className="w-12 h-12 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center text-white/60 hover:border-primary"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-primary uppercase mb-2">Tone</h3>
        <div className="flex flex-wrap gap-2">
          {TONE_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => toggleChip('tone', chip)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                dna.tone?.includes(chip)
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-primary uppercase mb-2">Personality</h3>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => toggleChip('personality', chip)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                dna.personality?.includes(chip)
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Integrate DnaPanel into PomelliStudio**

- [ ] **Step 3: Commit**

```bash
git add src/apps/open-pomelli/components/DnaPanel.jsx
git commit -m "feat: add editable DNA panel with chips and color pickers"
```

---

## Task 3: Campaign Generator Component

**Files:**
- Create: `src/apps/open-pomelli/components/CampaignPicker.jsx`

- [ ] **Step 1: Create campaign goal picker**

```jsx
// src/apps/open-pomelli/components/CampaignPicker.jsx
"use client";

import { useState } from "react";

const CAMPAIGN_GOALS = [
  { id: 'launch', name: 'Product Launch', desc: 'Announce new products to market' },
  { id: 'lead', name: 'Lead Generation', desc: 'Generate qualified leads' },
  { id: 'awareness', name: 'Brand Awareness', desc: 'Increase brand recognition' },
  { id: 'engagement', name: 'Engagement', desc: 'Boost social interaction' },
  { id: 'thought', name: 'Thought Leadership', desc: 'Establish expertise' },
  { id: 'sales', name: 'Sales', desc: 'Drive direct sales' },
];

export default function CampaignPicker({ brandDNA, onGenerate }) {
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customDirection, setCustomDirection] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/pomelli/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: selectedGoal,
          direction: customDirection,
          brandDNA
        })
      });
      const concepts = await response.json();
      onGenerate(concepts);
    } catch (err) {
      alert(`Failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Campaign Generator</h2>
      
      <div>
        <h3 className="text-xs font-bold text-primary uppercase mb-3">Goal</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CAMPAIGN_GOALS.map(goal => (
            <button
              key={goal.id}
              onClick={() => setSelectedGoal(goal.id)}
              className={`p-4 rounded-lg text-left border transition-all ${
                selectedGoal === goal.id
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="font-bold text-white">{goal.name}</div>
              <div className="text-white/40 text-xs mt-1">{goal.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <textarea
          value={customDirection}
          onChange={(e) => setCustomDirection(e.target.value)}
          placeholder="Optional: Add creative direction..."
          className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-white resize-none"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating || !selectedGoal || !brandDNA}
        className="w-full py-3 bg-primary text-black font-bold rounded-lg uppercase hover:bg-white disabled:opacity-50"
      >
        {generating ? 'Generating...' : 'Generate Campaign Concepts'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/apps/open-pomelli/components/CampaignPicker.jsx
git commit -m "feat: add campaign goal picker component"
```

---

## Task 4: Platform Creatives Generator

**Files:**
- Create: `src/apps/open-pomelli/components/CreativeGrid.jsx`

- [ ] **Step 1: Create 8 platform creative formats**

```jsx
// src/apps/open-pomelli/components/CreativeGrid.jsx
"use client";

import { useState } from "react";

const PLATFORM_CREATIVES = [
  { id: 'instagram-post', name: 'Instagram Post', ar: '1:1', size: '1080x1080' },
  { id: 'instagram-story', name: 'Instagram Story', ar: '9:16', size: '1080x1920' },
  { id: 'linkedin-post', name: 'LinkedIn Post', ar: '1.91:1', size: '1200x627' },
  { id: 'facebook-ad', name: 'Facebook Ad', ar: '1.91:1', size: '1200x630' },
  { id: 'x-post', name: 'X / Twitter', ar: '16:9', size: '1200x600' },
  { id: 'web-banner', name: 'Web Banner', ar: '2.39:1', size: '1200x504' },
  { id: 'email-header', name: 'Email Header', ar: '2.37:1', size: '600x253' },
  { id: 'youtube-thumb', name: 'YouTube Thumbnail', ar: '16:9', size: '1280x720' },
];

export default function CreativeGrid({ concept, brandDNA }) {
  const [generating, setGenerating] = useState(null);
  const [creativeHistory, setCreativeHistory] = useState({});

  const generateCreative = async (format) => {
    setGenerating(format.id);
    try {
      const response = await fetch('/api/pomelli/creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${concept.prompt}. Brand tone: ${brandDNA?.tone?.join(', ')}. Style: ${format.name}`,
          aspect_ratio: format.ar,
          brandDNA
        })
      });
      const result = await response.json();
      setCreativeHistory(prev => ({
        ...prev,
        [format.id]: result.url
      }));
    } catch (err) {
      alert(`Failed: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Creatives</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PLATFORM_CREATIVES.map(format => (
          <div key={format.id} className="space-y-2">
            <div className="aspect-video bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/40 text-xs">
              {format.name}
            </div>
            <button
              onClick={() => generateCreative(format)}
              disabled={generating === format.id}
              className="w-full py-2 bg-primary text-black text-xs font-bold rounded hover:bg-white disabled:opacity-50"
            >
              {generating === format.id ? 'Generating...' : 'Generate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/apps/open-pomelli/components/CreativeGrid.jsx
git commit -m "feat: add platform creatives generator for 8 formats"
```

---

## Task 5: Videco Analytics Integration

**Files:**
- Create: `src/apps/videco/services/videcoService.js`

- [ ] **Step 1: Create analytics service with Supabase integration**

```js
// src/apps/videco/services/videcoService.js
import { supabase } from '../../../lib/supabase-client.ts';

export const videcoService = {
  async trackVideoView(videoId, metadata = {}) {
    try {
      const { error } = await supabase.from('videco_video_views').insert({
        video_id: videoId,
        viewed_at: new Date().toISOString(),
        ...metadata
      });
      if (error) throw error;
    } catch (err) {
      // Silent fail - analytics shouldn't break UX
      console.warn('Analytics tracking failed:', err);
    }
  },

  async getVideoStats(videoId) {
    try {
      const { count, error } = await supabase
        .from('videco_video_views')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId);
      
      if (error) throw error;
      return { views: count || 0 };
    } catch (err) {
      return { views: 0 };
    }
  },

  async saveGeneratedVideo(videoData) {
    try {
      const { data, error } = await supabase.from('videco_videos').insert({
        ...videoData,
        created_at: new Date().toISOString()
      }).select().single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      return null;
    }
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/apps/videco/services/videcoService.js
git commit -m "feat: add videco analytics service with Supabase integration"
```

---

## Verification

After all tasks:
```bash
npm run build  # Verify no errors
npm run dev    # Test all apps load
```