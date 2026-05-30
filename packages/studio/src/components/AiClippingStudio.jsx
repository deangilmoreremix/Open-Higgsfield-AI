"use client";

import { useState, useEffect } from 'react';
import { uploadFile, generateVideo, securityService } from '../../src/lib/muapi.js';
import { securityService as secService } from '../../src/lib/services/SecurityService';

export default function AiClippingStudio() {
  const [videoFile, setVideoFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [duration, setDuration] = useState(15);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    secService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
    });
  }, []);

  const handleUpload = async (file) => {
    if (!file || !apiKey) return;
    
    setIsUploading(true);
    try {
      const url = await uploadFile(apiKey, file);
      setVideoFile(url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setIsUploading(false);
  };

  const handleGenerate = async () => {
    if (!videoFile || !apiKey) return;
    
    setIsGenerating(true);
    setResult(null);
    
    try {
      // For AI clipping, we use a video model that can extend/cut clips
      const video = await generateVideo(apiKey, {
        model: 'seedance-2-vip-omni-reference',
        prompt: prompt || 'Create a viral short from this video',
        video_url: videoFile,
        aspect_ratio: aspectRatio,
        duration: duration
      });
      
      if (video.url) {
        setResult(video.url);
      }
    } catch (err) {
      console.error('Video clipping failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#030303] text-white p-6">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">AI Clipping Studio</h1>
        <p className="text-white/60 mb-6">Transform long videos into viral-ready vertical shorts</p>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center">
            {videoFile ? (
              <video src={videoFile} controls className="max-w-full max-h-40 mx-auto rounded-lg" />
            ) : (
              <div>
                <svg className="w-12 h-12 mx-auto mb-2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M3 15l4 4 8-8" />
                  <path d="M15 15l4-4 4 4" />
                </svg>
                <p className="text-sm text-white/60 mb-2">Upload your long video</p>
                <p className="text-xs text-white/40">AI will analyze and create viral clips</p>
              </div>
            )}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              className="hidden"
              id="video-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="video-upload"
              className="mt-4 inline-block px-4 py-2 bg-primary text-black rounded-lg font-medium cursor-pointer hover:opacity-90"
            >
              {isUploading ? 'Uploading...' : videoFile ? 'Replace Video' : 'Upload Video'}
            </label>
          </div>
          
          <div>
            <label className="text-xs text-white/40 block mb-2">Editing Instructions (optional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Cut to most engaging moments, add captions, make it viral..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-20 resize-none"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/40 block mb-2">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
              >
                <option value="9:16">9:16 (Shorts)</option>
                <option value="16:9">16:9 (YouTube)</option>
                <option value="1:1">1:1 (Square)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-2">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
              >
                <option value="15">15s</option>
                <option value="30">30s</option>
                <option value="60">60s</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!videoFile || isGenerating || !apiKey}
            className="w-full py-3 bg-primary text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? 'Generating Clip...' : 'Create Viral Clip'}
          </button>
          
          {result && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Generated Clip</h3>
              <video src={result} controls className="w-full rounded-lg" />
              <a
                href={result}
                download="viral-clip.mp4"
                className="mt-2 inline-block px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
              >
                Download Clip
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}