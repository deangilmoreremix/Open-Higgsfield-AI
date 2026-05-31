"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { generateI2I, uploadFile } from "../muapi.js";

// Headshot presets
const HEADSHOT_PRESETS = [
  { id: 'professional', name: 'Professional', prompt: 'professional headshot, crisp white shirt, confident smile, studio lighting, photorealistic' },
  { id: 'creative', name: 'Creative', prompt: 'creative professional headshot, artistic background, modern style, high quality' },
  { id: 'linkedin', name: 'LinkedIn', prompt: 'LinkedIn profile photo, professional, approachable, business attire, head and shoulders' },
  { id: 'executive', name: 'Executive', prompt: 'executive portrait, suit and tie, boardroom setting, authoritative, photorealistic' },
  { id: 'casual', name: 'Casual', prompt: 'casual professional headshot, relaxed pose, natural lighting, friendly expression' },
];

// Download helper
async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}

export default function HeadshotStudio({ apiKey, onGenerationComplete }) {
  const [selectedPreset, setSelectedPreset] = useState(HEADSHOT_PRESETS[0]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadedImageName, setUploadedImageName] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);
  const [history, setHistory] = useState([]);
  const [prompt, setPrompt] = useState("");

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Load persisted state
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hg_headshot_studio_persistent");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.uploadedImageUrl) setUploadedImageUrl(data.uploadedImageUrl);
        if (data.uploadedImageName) setUploadedImageName(data.uploadedImageName);
        if (data.history) setHistory(data.history);
        if (data.selectedPreset) {
          const preset = HEADSHOT_PRESETS.find(p => p.id === data.selectedPreset);
          if (preset) setSelectedPreset(preset);
        }
      }
    } catch (err) {
      console.warn("Failed to load HeadshotStudio persistence:", err);
    }
  }, []);

  // Save persisted state
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("hg_headshot_studio_persistent", JSON.stringify({
          uploadedImageUrl,
          uploadedImageName,
          history,
          selectedPreset: selectedPreset?.id,
        }));
      } catch (err) {
        console.warn("Failed to save HeadshotStudio persistence:", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [uploadedImageUrl, uploadedImageName, history, selectedPreset]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image exceeds 10MB limit.");
      return;
    }

    try {
      const url = await uploadFile(apiKey, file);
      setUploadedImageUrl(url);
      setUploadedImageName(file.name);
    } catch (err) {
      alert(`Image upload failed: ${err.message}`);
    }
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!uploadedImageUrl) {
      alert("Please upload a source photo first.");
      return;
    }

    setGenerating(true);
    setGenerateError(null);

    try {
      const result = await generateI2I(apiKey, {
        prompt: prompt || selectedPreset.prompt,
        image_url: uploadedImageUrl,
        strength: 0.7,
        aspect_ratio: "3:4"
      });

      if (!result?.url) throw new Error("No image URL returned by API");

      const entry = {
        id: result.id || Date.now().toString(),
        url: result.url,
        prompt: prompt || selectedPreset.prompt,
        preset: selectedPreset.id,
        timestamp: new Date().toISOString(),
      };
      setHistory(prev => [entry, ...prev].slice(0, 30));

      if (onGenerationComplete) {
        onGenerationComplete({ url: result.url, prompt: prompt || selectedPreset.prompt, type: "image" });
      }
    } catch (err) {
      console.error("[HeadshotStudio] Generation failed:", err);
      setGenerateError(err.message?.slice(0, 80) || "Generation failed");
      setTimeout(() => setGenerateError(null), 4000);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-app-bg relative overflow-hidden">
      
      {/* Gallery */}
      <div className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto custom-scrollbar pb-40 lg:pb-32 px-2">
        {history.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full pt-4 animate-fade-in-up">
            {history.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="relative group rounded-lg overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col"
              >
                <img
                  src={entry.url}
                  alt={entry.prompt?.substring(0, 30) || "Generated headshot"}
                  className="w-full aspect-[3/4] object-cover bg-black/40 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setFullscreenUrl(entry.url)}
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    title="Fullscreen"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenUrl(entry.url);
                    }}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-black transition-all border border-white/10"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    title="Download"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(entry.url, `headshot-${entry.id || idx}.jpg`);
                    }}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-black transition-all border border-white/10"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </button>
                </div>
                <div className="p-3 bg-black/80 backdrop-blur-sm border-t border-white/5 flex-1 flex flex-col justify-between gap-2">
                  <p className="text-white/70 text-xs line-clamp-3 leading-relaxed" title={entry.prompt}>
                    {entry.prompt || "No prompt provided"}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                      {HEADSHOT_PRESETS.find(p => p.id === entry.preset)?.name || "Custom"}
                    </span>
                    <span className="text-[10px] text-white/40">3:4</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in-up transition-all duration-700 min-h-[50vh]">
            <div className="mb-12 relative group">
              <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-1000" />
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white/[0.02] rounded-[2rem] flex items-center justify-center border border-white/[0.05] overflow-hidden backdrop-blur-sm">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 relative z-10 transition-transform duration-500 group-hover:scale-110">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-primary opacity-80"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="absolute top-4 right-4 text-[10px] text-primary/40 animate-pulse">✨</div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 text-center px-4">
              <span className="text-white/40 font-medium">START CREATING WITH</span><br />
              <span className="text-white">HEADSHOT STUDIO</span>
            </h1>
            <p className="text-white/40 text-sm md:text-base font-medium tracking-wide text-center max-w-lg leading-relaxed">
              Upload a photo and generate professional headshots in multiple styles
            </p>
          </div>
        )}
      </div>

      {/* Prompt Bar */}
      <div className="absolute bottom-4 w-full max-w-[95%] lg:max-w-4xl z-40 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-md border border-white/10 p-4 flex flex-col gap-2 shadow-2xl">
          <div className="flex items-center gap-2 px-1">
            {/* Image upload button */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                title={uploadedImageUrl ? "Change photo" : "Upload source photo"}
                onClick={() => fileInputRef.current?.click()}
                className={`w-10 h-10 shrink-0 rounded-full border transition-all flex items-center justify-center relative overflow-hidden ${uploadedImageUrl ? "border-primary/60 bg-primary/5" : "bg-white/5 border-white/[0.03] hover:bg-white/10 hover:border-primary/40"} group`}
              >
                {uploadedImageUrl ? (
                  <img src={uploadedImageUrl} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white/40 group-hover:text-primary transition-colors"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={selectedPreset.prompt}
                rows={1}
                className="w-full bg-transparent border-none text-white text-sm placeholder:text-white/20 focus:outline-none resize-none pt-1 leading-relaxed min-h-[40px] max-h-[150px] md:max-h-[250px] overflow-y-auto custom-scrollbar"
              />
            </div>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.03]">
            {HEADSHOT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedPreset.id === preset.id
                    ? "bg-primary text-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Generate button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !uploadedImageUrl}
              className="px-6 py-2.5 bg-primary text-black rounded-xl font-bold text-sm hover:bg-white transition-all disabled:opacity-50"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                "Generate Headshot"
              )}
            </button>
          </div>

          {/* Error */}
          {generateError && (
            <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded px-3 py-2 border border-red-500/20">
              {generateError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}