"use client";

import { useState, useEffect } from 'react';
import { generateAudio, securityService } from '../../src/lib/muapi.js';
import { securityService as secService } from '../../src/lib/services/SecurityService';

export default function AudioStudio() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(30);
  const [model, setModel] = useState('default');
  const [style, setStyle] = useState('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    secService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
    });
  }, []);

  const handleGenerate = async () => {
    if (!prompt || !apiKey) return;
    
    setIsGenerating(true);
    setResult(null);
    
    try {
      const audio = await generateAudio({
        apiKey,
        prompt,
        duration,
        model: model !== 'default' ? model : undefined,
        style: style !== 'default' ? style : undefined
      });
      
      if (audio.url) {
        setResult(audio.url);
      }
    } catch (err) {
      console.error('Audio generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#030303] text-white p-6">
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">Audio Studio</h1>
        <p className="text-white/60 mb-6">Generate audio from text prompts with AI</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 block mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the audio you want to generate..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-24 resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 block mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min="5"
                max="60"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-2">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
              >
                <option value="default">Default</option>
                <option value="music">Music</option>
                <option value="ambient">Ambient</option>
                <option value="voice">Voice</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!prompt || isGenerating || !apiKey}
            className="w-full py-3 bg-primary text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Audio'}
          </button>
          
          {result && (
            <div className="mt-6">
              <audio src={result} controls className="w-full" />
              <a
                href={result}
                download="generated-audio.mp3"
                className="mt-2 inline-block px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
              >
                Download Audio
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}