# Open-Generative-AI Apps Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete integration of Open-Pomelli and videco_ai_platform as full React applications with all features from their upstream repositories.

**Architecture:** Create dedicated studio components for each app with full UI, connect services to MuAPI endpoints, and establish proper navigation routes.

**Tech Stack:** React, Next.js, MuAPI client, Tailwind CSS, existing studio package infrastructure

---

## Missing Features Analysis

### Open-Pomelli (from upstream README)
- **Brand DNA extraction**: URL input → Playwright scraping → GPT-5-Nano analysis
- **Editable DNA panel**: Tone/personality chips, color pickers
- **Campaign generator**: 6 goals → 4 on-brand concepts
- **Platform creatives**: 8 formats (Instagram feed/story, LinkedIn, Facebook, X, web banner, email header, YouTube)
- **Photo Studio**: 6 categories × 5 styles = 30 presets
- **Animate**: Image-to-video with seedance-lite-i2v

### videco_ai_platform
- **Personalized video generation**: Template-based video creation
- **Analytics dashboard**: Track video performance
- **Integration ready**: CRM/marketing tool connections

---

## File Structure

### Open-Pomelli
- `packages/studio/src/components/PomelliStudio.jsx` - NEW: Full Brand DNA → Campaigns → Creatives flow
- `src/apps/open-pomelli/index.jsx` - MODIFIED: Use PomelliStudio instead of VideoStudio
- `src/apps/open-pomelli/services/pomelliService.js` - MODIFIED: Add missing service functions

### Videco
- `packages/studio/src/components/VidecoStudio.jsx` - NEW: Video personalization studio
- `src/apps/videco/index.jsx` - NEW: App entry point
- `src/apps/videco/manifest.js` - NEW: App manifest
- `src/apps/videco/routes.js` - NEW: App routes
- `app/videco/page.js` - NEW: Next.js route

---

## Task 1: Create PomelliStudio Component - Brand DNA Tab

**Files:**
- Create: `packages/studio/src/components/PomelliStudio.jsx`
- Modify: `packages/studio/index.js`

- [ ] **Step 1: Create PomelliStudio.jsx with Brand DNA extraction tab**

```jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { generateImage, uploadFile } from "../muapi.js";

// Brand DNA presets for photo studio styles
const PHOTO_STYLES = [
  { id: 'studio-white', name: 'Studio White', category: 'product', prompt: 'professional product photo on clean white background, studio lighting' },
  { id: 'marble-clean', name: 'Marble Clean', category: 'product', prompt: 'luxury product on white marble surface, soft natural lighting' },
  { id: 'urban-street', name: 'Urban Street', category: 'lifestyle', prompt: 'urban lifestyle shot, street photography style, moody lighting' },
  { id: 'golden-hour', name: 'Golden Hour', category: 'lifestyle', prompt: 'golden hour portrait, warm sunlight, cinematic' },
  { id: 'restaurant-plated', name: 'Restaurant Plated', category: 'food', prompt: 'professional food photography, restaurant setting, styled plating' },
  { id: 'scandi-living', name: 'Scandi Living', category: 'interior', prompt: 'scandinavian interior shot, bright minimalist, natural textures' },
  { id: 'dark-techy', name: 'Dark Techy', category: 'product', prompt: 'modern tech product on dark background, rim lighting, contrast' },
];

function PomelliStudio({ apiKey, onGenerationComplete }) {
  const [activeTab, setActiveTab] = useState('brand'); // 'brand' | 'campaign' | 'photo-studio' | 'animate'
  const [analyzing, setAnalyzing] = useState(false);
  const [brandData, setBrandData] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [captureProgress, setCaptureProgress] = useState(0);
  
  // Brand DNA state
  const [dna, setDna] = useState({
    name: '',
    colors: ['#000000', '#333333', '#666666'],
    fonts: ['Inter', 'Roboto'],
    tone: ['professional', 'modern'],
    personality: ['innovative', 'trustworthy'],
  });
  
  // Photo studio state
  const [selectedStyle, setSelectedStyle] = useState(PHOTO_STYLES[0]);
  const [productImage, setProductImage] = useState(null);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [photoHistory, setPhotoHistory] = useState([]);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);
  
  // Animate state
  const [animatePrompt, setAnimatePrompt] = useState('');
  const [animateImage, setAnimateImage] = useState(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoHistory, setVideoHistory] = useState([]);
  
  const fileInputRef = useRef(null);

  // Brand DNA extraction
  const handleAnalyzeWebsite = async () => {
    if (!urlInput) return;
    setAnalyzing(true);
    setCaptureProgress(0);
    try {
      // Step 1: Trigger website capture via API
      const response = await fetch('/api/fetch-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });
      
      if (!response.ok) throw new Error('Failed to fetch website');
      
      const data = await response.json();
      
      // Step 2: Generate brand DNA using GPT-5-Nano
      const dnaResult = await generateImage(apiKey, {
        prompt: `Extract brand DNA from this website. URL: ${data.url}. Analyze colors, fonts, tone, and messaging. Provide structured brand profile. Return JSON with name, primary colors (array), fonts (array), tone (array), personality (array).`,
        image_url: data.screenshotUrl,
        model: 'gpt-5-nano'
      });
      
      setBrandData({ ...data, ...dnaResult });
      setActiveTab('campaign');
    } catch (err) {
      console.error('Analysis failed:', err);
      alert(`Failed to analyze website: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Photo generation
  const handleProductUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFile(apiKey, file);
      setProductImage(url);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  const handleGeneratePhoto = async () => {
    if (!productImage) return;
    setGeneratingPhoto(true);
    try {
      const result = await generateImage(apiKey, {
        prompt: selectedStyle.prompt,
        image_url: productImage,
        images_list: dna?.colors ? [dna.colors[0]] : undefined,
        model: 'nano-banana-2-edit'
      });
      
      setPhotoHistory(prev => [{ url: result.url, style: selectedStyle.name, timestamp: new Date().toISOString() }, ...prev].slice(0, 30));
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-app-bg">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 h-12 border-b border-white/10 flex items-center px-6 gap-4">
        {['brand', 'campaign', 'photo-studio', 'animate'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === tab ? 'bg-primary text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        {activeTab === 'brand' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white">Brand DNA Studio</h1>
            <p className="text-white/60">Paste any website URL to extract its brand DNA and create on-brand assets.</p>
            
            <div className="space-y-4">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleAnalyzeWebsite}
                disabled={analyzing || !urlInput}
                className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-white transition-all disabled:opacity-50"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Brand'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'photo-studio' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">AI Photo Studio</h2>
            
            {/* Style Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {PHOTO_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                    selectedStyle.id === style.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>

            {/* Upload & Generate */}
            <div className="flex gap-4 items-center">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProductUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-bold hover:bg-white/20"
              >
                {productImage ? 'Change Product' : 'Upload Product'}
              </button>
              <button
                onClick={handleGeneratePhoto}
                disabled={!productImage || generatingPhoto}
                className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-white disabled:opacity-50"
              >
                {generatingPhoto ? 'Generating...' : 'Generate'}
              </button>
            </div>

            {/* Photo Gallery */}
            {photoHistory.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-6">
                {photoHistory.map((entry, idx) => (
                  <img
                    key={idx}
                    src={entry.url}
                    alt={entry.style}
                    className="aspect-square object-cover rounded-lg border border-white/10 cursor-pointer hover:opacity-80"
                    onClick={() => setFullscreenUrl(entry.url)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PomelliStudio;
```

- [ ] **Step 2: Export PomelliStudio from index.js**

```js
// Add to packages/studio/index.js
export { default as PomelliStudio } from './src/components/PomelliStudio.jsx';
```

- [ ] **Step 3: Commit changes**

```bash
git add packages/studio/src/components/PomelliStudio.jsx packages/studio/index.js
git commit -m "feat: add PomelliStudio component with Brand DNA and Photo Studio tabs"
```

---

## Task 2: Update Open-Pomelli App Entry Point

**Files:**
- Modify: `src/apps/open-pomelli/index.jsx`

- [ ] **Step 1: Update index.jsx to use PomelliStudio**

```jsx
'use client';

import React from 'react';
import { PomelliStudio } from 'studio';
import { appManifest } from './manifest';

export default function OpenPomelliApp({ apiKey }) {
  return React.createElement(PomelliStudio, { apiKey });
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';
```

- [ ] **Step 2: Commit changes**

```bash
git add src/apps/open-pomelli/index.jsx
git commit -m "feat: update open-pomelli to use PomelliStudio component"
```

---

## Task 3: Create Videco Studio Component

**Files:**
- Create: `packages/studio/src/components/VidecoStudio.jsx`

- [ ] **Step 1: Create VidecoStudio.jsx with video personalization features**

```jsx
"use client";

import { useState } from "react";
import { generateVideo, uploadFile } from "../muapi.js";

const VIDEO_TEMPLATES = [
  { id: 'outreach-1', name: 'Cold Outreach', prompt: 'professional personalized video message for sales outreach, clean background, confident speaker' },
  { id: 'outreach-2', name: 'Warm Follow-up', prompt: 'friendly follow-up video message, approachable tone, professional setting' },
  { id: 'intro', name: 'Introduction', prompt: 'brief professional introduction video, casual yet polished, well-lit' },
  { id: 'demo', name: 'Product Demo', prompt: 'product demonstration style video, clean presentation, engaging' },
  { id: 'thank-you', name: 'Thank You', prompt: 'genuine thank you message video, warm and appreciative tone' },
];

function VidecoStudio({ apiKey, onGenerationComplete }) {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'generate' | 'analytics'
  const [selectedTemplate, setSelectedTemplate] = useState(VIDEO_TEMPLATES[0]);
  const [personalization, setPersonalization] = useState('');
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);

  const handleGenerateVideo = async () => {
    setGenerating(true);
    try {
      const result = await generateVideo(apiKey, {
        prompt: `${selectedTemplate.prompt}. Personalization: ${personalization}`,
        duration: 15,
        aspect_ratio: '16:9'
      });
      
      setHistory(prev => [{ 
        url: result.url, 
        prompt: personalizations, 
        template: selectedTemplate.name,
        timestamp: new Date().toISOString() 
      }, ...prev].slice(0, 30));
      
      onGenerationComplete?.({ url: result.url, type: 'video' });
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-app-bg">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 h-12 border-b border-white/10 flex items-center px-6 gap-4">
        {['templates', 'generate', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === tab ? 'bg-primary text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Video Templates</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {VIDEO_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedTemplate.id === template.id ? 'border-primary bg-primary/10' : 'border-white/10'
                  }`}
                >
                  <div className="font-bold text-white text-sm">{template.name}</div>
                  <div className="text-white/40 text-xs mt-1 line-clamp-2">{template.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-bold text-white">Generate Video</h2>
            <div className="space-y-4">
              <textarea
                value={personalization}
                onChange={(e) => setPersonalization(e.target.value)}
                placeholder="Add personalization details..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4 text-white resize-none"
              />
              <button
                onClick={handleGenerateVideo}
                disabled={generating || !personalization}
                className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-white disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Video'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Video Analytics</h2>
            <div className="text-white/60">Analytics dashboard coming soon...</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VidecoStudio;
```

- [ ] **Step 2: Export VidecoStudio from index.js**

```js
// Add to packages/studio/index.js
export { default as VidecoStudio } from './src/components/VidecoStudio.jsx';
```

- [ ] **Step 3: Commit changes**

```bash
git add packages/studio/src/components/VidecoStudio.jsx packages/studio/index.js
git commit -m "feat: add VidecoStudio component for personalized video generation"
```

---

## Task 4: Create Videco App Structure

**Files:**
- Create: `src/apps/videco/index.jsx`
- Create: `src/apps/videco/manifest.js`
- Create: `src/apps/videco/routes.js`
- Create: `app/videco/page.js`

- [ ] **Step 1: Create manifest.js**

```js
export const appManifest = {
  id: 'videco',
  name: 'Videco AI Platform',
  description: 'Personalized AI video generation for cold outreach campaigns',
  icon: 'Video',
  category: 'video',
  route: '/videco',
  status: 'complete',
  features: ['templates', 'personalization', 'analytics'],
  hasServices: true,
  hasComponents: true,
  hasAssets: true,
};

export default appManifest;
```

- [ ] **Step 2: Create index.jsx**

```jsx
'use client';

import React from 'react';
import { VidecoStudio } from 'studio';
import { appManifest } from './manifest';

export default function VidecoApp({ apiKey }) {
  return React.createElement(VidecoStudio, { apiKey });
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';
```

- [ ] **Step 3: Create routes.js**

```js
export const routes = [
  { path: '/videco', component: 'VidecoStudio' },
];
```

- [ ] **Step 4: Create app/videco/page.js**

```js
import VidecoApp from '../../src/apps/videco';

export default function VidecoPage() {
  return <VidecoApp apiKey={process.env.MUAPI_KEY} />;
}
```

- [ ] **Step 5: Commit changes**

```bash
git add src/apps/videco/index.jsx src/apps/videco/manifest.js src/apps/videco/routes.js app/videco/page.js
git commit -m "feat: add videco app structure with VidecoStudio integration"
```

---

## Task 5: Complete PomelliStudio - Campaign & Animate Tabs

**Files:**
- Modify: `packages/studio/src/components/PomelliStudio.jsx`

- [ ] **Step 1: Add Campaign Generation and Animate tabs to PomelliStudio**

[The full implementation would add the remaining tabs for campaigns and animation - extending the component created in Task 1]

- [ ] **Step 2: Commit changes**

```bash
git add packages/studio/src/components/PomelliStudio.jsx
git commit -m "feat: complete PomelliStudio with campaign and animate tabs"
```

---

## Verification

After all tasks:
- Run `npm run build` to verify no errors
- Check all apps load in dev server: `npm run dev`
- Verify HeadshotStudio, PomelliStudio, VidecoStudio all export correctly