"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { generateAudio, uploadFile } from "../muapi.js";
import { audioModels } from "../models.js";

const CheckSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function AudioStudio({ apiKey, onGenerationComplete }) {
  const PERSIST_KEY = "hg_audio_studio_persistent";

  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(audioModels[0]?.id || "music-1");
  const [selectedModelName, setSelectedModelName] = useState(audioModels[0]?.name || "Music Generator");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [duration, setDuration] = useState("30");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [history, setHistory] = useState([]);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);

  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null); // 'model' | 'style' | null

  // Persistence: Load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSIST_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.prompt !== undefined) setPrompt(data.prompt);
        if (data.selectedModel) setSelectedModel(data.selectedModel);
        if (data.selectedModelName) setSelectedModelName(data.selectedModelName);
        if (data.selectedStyle !== undefined) setSelectedStyle(data.selectedStyle);
        if (data.duration) setDuration(data.duration);
        if (data.history) setHistory(data.history);
      }
    } catch (err) {
      console.warn("Failed to load AudioStudio persistence:", err);
    }
  }, []);

  // Persistence: Save
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const state = { prompt, selectedModel, selectedModelName, selectedStyle, duration, history };
        localStorage.setItem(PERSIST_KEY, JSON.stringify(state));
      } catch (err) {
        console.warn("Failed to save AudioStudio persistence:", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [prompt, selectedModel, selectedModelName, selectedStyle, duration, history]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [openDropdown]);

  // Textarea auto-resize
  const handlePromptInput = (e) => {
    setPrompt(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  // Generate audio
  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      alert("API key is required. Please set your MuAPI key.");
      return;
    }

    if (!prompt.trim()) {
      alert("Please enter a prompt to generate audio.");
      return;
    }

    setGenerating(true);
    setGenerateError(null);

    try {
      const params = {
        model: selectedModel,
        prompt: prompt.trim(),
        duration: parseInt(duration),
        apiKey
      };
      if (selectedStyle) params.style = selectedStyle;

      const result = await generateAudio(params);

      if (result?.url) {
        const entry = {
          id: Date.now(),
          url: result.url,
          prompt: prompt.trim(),
          model: selectedModel,
          style: selectedStyle,
          duration: duration,
          timestamp: new Date().toISOString()
        };
        setHistory(prev => [entry, ...prev].slice(0, 30));
        setFullscreenUrl(result.url);
        if (onGenerationComplete) {
          onGenerationComplete({ url: result.url, model: selectedModel, prompt: prompt.trim(), type: "audio" });
        }
      }
    } catch (err) {
      console.error("[AudioStudio] Generation failed:", err);
      setGenerateError(err.message?.slice(0, 80) || "Generation failed");
      setTimeout(() => setGenerateError(null), 4000);
    } finally {
      setGenerating(false);
    }
  }, [apiKey, prompt, selectedModel, selectedStyle, duration, onGenerationComplete]);

  // Download audio
  const downloadAudio = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `audio-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  // Model selection
  const handleModelSelect = useCallback((m) => {
    setSelectedModel(m.id);
    setSelectedModelName(m.name);
    // Reset style if new model doesn't support styles
    if (!m.supportsStyles) {
      setSelectedStyle("");
    }
  }, []);

  // Styles list
  const STYLES = ["pop", "rock", "electronic", "classical", "jazz", "hip-hop", "ambient"];
  const currentModel = audioModels.find(m => m.id === selectedModel);
  const showStyle = currentModel?.supportsStyles;

  // Render
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-app-bg relative p-4 md:p-6 overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto custom-scrollbar pb-40 lg:pb-32 px-2">
        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pt-4 animate-fade-in-up">
            {history.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="relative group rounded-lg overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col"
              >
                <div className="w-full aspect-square bg-black/40 flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                    <path d="M12 1v12l3-3M2 12a10 10 0 0020 0c0-5.52-4.48-10-10-10S2 6.48 2 12z" />
                    <path d="M22 12a10 10 0 00-20 0" />
                  </svg>
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadAudio(entry.url);
                    }}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-black transition-all border border-white/10"
                    title="Download"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </button>
                </div>

                {/* Prompt & Details */}
                <div className="p-3 bg-black/80 backdrop-blur-sm border-t border-white/5 flex-1 flex flex-col justify-between gap-2">
                  <p className="text-white/70 text-xs line-clamp-3 leading-relaxed" title={entry.prompt}>
                    {entry.prompt || "No prompt provided"}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                      {entry.model?.replace("-", " ")}
                    </span>
                    <span className="text-[10px] text-white/40">{entry.duration}s</span>
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
                    <path d="M12 1v12l3-3M2 12a10 10 0 0020 0c0-5.52-4.48-10-10-10S2 6.48 2 12z" />
                    <path d="M22 12a10 10 0 00-20 0" />
                  </svg>
                </div>
                <div className="absolute top-4 right-4 text-[10px] text-primary/40 animate-pulse">🎵</div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 text-center px-4">
              <span className="text-white/40 font-medium uppercase tracking-widest">START CREATING WITH</span>
              <br />
              <span className="text-white uppercase tracking-tight">AUDIO STUDIO</span>
            </h1>
            <p className="text-white/40 text-sm md:text-base font-medium tracking-wide text-center max-w-lg leading-relaxed px-6">
              Generate music and speech with AI from text prompts
            </p>
          </div>
        )}
      </div>

      {/* Bottom Prompt Bar */}
      <div className="absolute bottom-4 w-full max-w-[95%] lg:max-w-4xl z-40 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-md border border-white/10 p-4 flex flex-col gap-2 shadow-2xl">
          {/* Top row: controls + textarea */}
          <div className="flex items-center gap-2">
            {/* Model button */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === "model" ? null : "model"); }}
                className={`flex items-center gap-2 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] rounded-md transition-all group whitespace-nowrap ${
                  openDropdown === "model" ? "border-primary/50" : "border-white/[0.03]"
                }`}
              >
                <div className="w-4 h-4 bg-primary/10 rounded flex items-center justify-center border border-primary/20">
                  <span className="text-[8px] font-black text-primary uppercase">A</span>
                </div>
                <span className="text-xs font-semibold text-white/70 group-hover:text-primary transition-colors">
                  {selectedModelName}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-50 group-hover:opacity-100 transition-opacity">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {openDropdown === "model" && (
                <div
                  ref={dropdownRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-[calc(100%+12px)] left-0 z-50 bg-[#0a0a0a] rounded-lg p-3 shadow-4xl border border-white/10 w-80 animate-fade-in-up"
                >
                  <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 px-1">Audio Models</div>
                  <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {audioModels.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => { handleModelSelect(m); setOpenDropdown(null); }}
                        className={`flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all border border-transparent hover:border-white/5 ${
                          selectedModel === m.id ? "bg-white/5 border-white/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center font-bold text-xs shadow-inner uppercase">
                            {m.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-white">{m.name}</span>
                        </div>
                        {selectedModel === m.id && <CheckSvg />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Style button (for music models) */}
            {showStyle && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === "style" ? null : "style"); }}
                  className={`flex items-center gap-2 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] rounded-md transition-all group whitespace-nowrap ${
                    openDropdown === "style" ? "border-primary/50" : "border-white/[0.03]"
                  }`}
                >
                  <div className="w-4 h-4 bg-purple-500/10 rounded flex items-center justify-center border border-white/10">
                    <span className="text-[8px] font-black text-purple-400 uppercase">S</span>
                  </div>
                  <span className="text-xs font-semibold text-white/70 group-hover:text-primary transition-colors">
                    {selectedStyle || "Style"}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-50 group-hover:opacity-100 transition-opacity">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {openDropdown === "style" && (
                  <div
                    ref={dropdownRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-[calc(100%+12px)] left-0 z-50 bg-[#0a0a0a] rounded-lg p-3 shadow-4xl border border-white/10 w-60 animate-fade-in-up"
                  >
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 px-1">Style</div>
                    <div className="flex flex-col gap-1">
                      {STYLES.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setSelectedStyle(s); setOpenDropdown(null); }}
                          className={`w-full text-left px-3 py-2 rounded text-xs font-bold transition-all flex items-center justify-between capitalize ${
                            selectedStyle === s ? "bg-primary text-black" : "text-white/60 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span>{s}</span>
                          {selectedStyle === s && <CheckSvg />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Duration selector */}
            <div className="flex items-center gap-1 bg-white/[0.03] rounded-md p-1 border border-white/[0.03]">
              {["15", "30", "60", "120"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    duration === d ? "bg-primary text-black" : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptInput}
                placeholder="Describe the music or speech you want to generate..."
                rows={1}
                className="w-full bg-transparent border-none text-white text-sm placeholder:text-white/20 focus:outline-none resize-none pt-1 leading-relaxed min-h-[40px] max-h-[150px] overflow-y-auto custom-scrollbar font-medium"
              />
            </div>
          </div>

          {/* Error message */}
          {generateError && (
            <div className="text-xs text-red-400 bg-red-500/10 rounded px-3 py-2 border border-red-500/20">
              {generateError}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Preview */}
      {fullscreenUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
          onClick={() => setFullscreenUrl(null)}
        >
          <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10 transition-colors shadow-2xl">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="bg-[#111] rounded-lg p-6 shadow-4xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <audio src={fullscreenUrl} controls autoPlay className="w-full mb-4" />
            <button
              onClick={() => downloadAudio(fullscreenUrl)}
              className="w-full bg-primary text-black py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-all"
            >
              Download Audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}