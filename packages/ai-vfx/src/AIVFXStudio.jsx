"use client";

import React, { useState } from 'react';
import { muapiAdapter } from 'shared-adapters';

const VFX_CATEGORIES = {
  'AI Effects': {
    effects: [
      { name: 'Kiss Me AI', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Kiss_Me_AI.webp' },
      { name: 'Kiss', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Kiss.webp' },
      { name: 'Venom', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Venom.webp' },
      { name: 'Hulk', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Hulk_.webp' },
      { name: 'Muscle Surge', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Muscle_Surge.webp' },
      { name: 'The Tiger Touch', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/The_Tiger_Touch.webp' },
      { name: 'Anything, Robot', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Anything_Robot.webp' },
      { name: 'Warmth of Jesus', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Warmth_of_Jesus.webp' },
      { name: 'Holy Wings', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Holy_Wings.webp' },
      { name: 'Microwave', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Microwave.webp' },
    ],
    icon: '⭐'
  },
  'Motion Controls': {
    effects: [
      { name: '360 Orbit', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/360+Orbit.webp', trigger_word: '0rb4it 360 degree orbit', input_type: 'i2v' },
      { name: 'Hero Run', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Action+Run.webp', trigger_word: '4ct3ion Action Run', input_type: 'i2v' },
      { name: 'Arc Shot', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Arc.webp', trigger_word: '34Ar2c arc the camera moves in a smooth curve around', input_type: 'i2v' },
    ],
    icon: '🎬'
  },
  'VFX': {
    effects: [
      { name: 'Levitate', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Levitation.webp', trigger_word: 'lev1tate2_it0 levitate effect', input_type: 'i2v' },
      { name: 'Disintegration', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Disintegration.webp', trigger_word: 'd1s1nt34gration disintegration effect', input_type: 'i2v' },
      { name: 'Flying', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Flying.webp', trigger_word: 'f1y1ng smooth gliding flight', input_type: 'i2v' },
    ],
    icon: '⭐'
  },
  'Pika Effects': {
    effects: [
      { name: 'Explode', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Explode.webp' },
      { name: 'Melt', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Melt.webp' },
      { name: 'Dissolve', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Dissolve.webp' },
    ],
    icon: '⚡'
  }
};

export default function AIVFXStudio({ apiKey: propApiKey }) {
  const [activeCategory, setActiveCategory] = useState('AI Effects');
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [aspect, setAspect] = useState('9:16');
  const [duration, setDuration] = useState(5);
  const [quality, setQuality] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const currentEffects = VFX_CATEGORIES[activeCategory]?.effects || [];

  const handleSelectEffect = (effect) => {
    setSelectedEffect(effect);
    setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedPreview(url);
    setImageUrl(''); // prefer uploaded for now
  };

  const handleGenerate = async () => {
    const key = propApiKey || (typeof window !== 'undefined' ? localStorage.getItem('muapi_key') : null);
    if (!key) {
      setError('Please set your MuAPI key in Settings or pass it as prop');
      return;
    }
    if (!selectedEffect) {
      setError('Please select an effect first');
      return;
    }
    const finalImage = imageUrl || uploadedPreview;
    if (!finalImage) {
      setError('Please provide an image URL or upload a file');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        prompt: prompt || `Apply ${selectedEffect.name} effect`,
        image_url: finalImage,
        name: selectedEffect.name,
        aspect_ratio: aspect,
        quality,
        duration,
      };

      const res = await muapiAdapter.generateVideoEffect(key, payload);
      setResult(res);
    } catch (e) {
      setError(e.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-2">AI-VFX Studio</h1>
        <p className="text-white/60 mb-8">Apply professional AI visual effects</p>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.keys(VFX_CATEGORIES).map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSelectedEffect(null); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === cat ? 'bg-[#d9ff00] text-black' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {VFX_CATEGORIES[cat].icon} {cat}
            </button>
          ))}
        </div>

        {/* Effects Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
          {currentEffects.map((effect, idx) => {
            const isSelected = selectedEffect?.name === effect.name;
            return (
              <div
                key={idx}
                onClick={() => handleSelectEffect(effect)}
                className={`relative aspect-square rounded-2xl overflow-hidden border cursor-pointer transition ${isSelected ? 'border-[#d9ff00] ring-2 ring-[#d9ff00]/30' : 'border-white/10 hover:border-white/30'}`}
              >
                <img src={effect.effect || effect.url} alt={effect.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 text-sm font-medium">{effect.name}</div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="max-w-2xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Optional prompt..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3"
            />

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Image URL or upload below"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3"
              />
              <label className="cursor-pointer px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 flex items-center">
                Upload
                <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {uploadedPreview && (
              <div className="text-xs text-white/50">Uploaded preview ready</div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <select value={aspect} onChange={e => setAspect(e.target.value)} className="bg-black border border-white/10 rounded-xl px-3 py-2">
                <option value="9:16">9:16</option>
                <option value="16:9">16:9</option>
                <option value="1:1">1:1</option>
              </select>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="bg-black border border-white/10 rounded-xl px-3 py-2">
                <option value={3}>3s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
              </select>
              <select value={quality} onChange={e => setQuality(e.target.value)} className="bg-black border border-white/10 rounded-xl px-3 py-2">
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedEffect}
              className="w-full py-4 rounded-2xl bg-[#d9ff00] text-black font-black text-lg disabled:opacity-50 hover:bg-white transition"
            >
              {isGenerating ? 'Generating VFX...' : 'Generate VFX'}
            </button>

            {error && <div className="text-red-400 text-sm">{error}</div>}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
              <div className="font-medium mb-3">Result</div>
              {result.url && <video src={result.url} controls className="w-full rounded-lg" />}
              <a href={result.url} download className="mt-4 inline-block text-[#d9ff00]">Download</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}