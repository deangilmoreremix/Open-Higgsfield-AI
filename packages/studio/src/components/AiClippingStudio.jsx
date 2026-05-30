"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { uploadFile, processV2V } from "../muapi.js";
import { v2vModels } from "../models.js";

const CheckSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AiClipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 19.3a2 2 0 0 0 2.6-2.6L7 5.6A2 2 0 0 0 5.6 7l7.1 11.7z" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 0-18" />
  </svg>
);

// Use v2vModels that have videoField (video-to-video operations)
const CLIPPING_MODELS = v2vModels.map(m => ({
  id: m.id,
  name: m.name,
  description: m.description || (m.hasPrompt ? "Video processing with prompt guidance" : "Video processing tool"),
  hasPrompt: m.hasPrompt || false,
  hasImage: !!m.imageField
}));

// Default to watermark remover if available, or first model
const DEFAULT_MODEL = v2vModels[0]?.id || "video-watermark-remover";

// Duration presets
const PRESET_DURATIONS = [5, 10, 15, 30, 60];

export default function AiClippingStudio({ apiKey, onGenerationComplete }) {
  const PERSIST_KEY = "hg_ai_clipping_studio_persistent";

  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [selectedModelName, setSelectedModelName] = useState(
    CLIPPING_MODELS.find(m => m.id === DEFAULT_MODEL)?.name || "Video Tool"
  );
  const [targetDuration, setTargetDuration] = useState(5);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [uploadedVideoName, setUploadedVideoName] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [history, setHistory] = useState([]);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);

  const videoFileInputRef = useRef(null);
  const imageFileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null); // 'model' | 'duration' | null

  // Model selection
  const handleModelSelect = useCallback((m) => {
    setSelectedModel(m.id);
    setSelectedModelName(m.name);
    setPrompt(""); // Clear prompt when model changes
    setUploadedImageUrl(null); // Clear image when model changes
  }, []);

  // Persistence: Load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSIST_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.prompt !== undefined) setPrompt(data.prompt);
        if (data.selectedModel) setSelectedModel(data.selectedModel);
        if (data.selectedModelName) setSelectedModelName(data.selectedModelName);
        if (data.targetDuration) setTargetDuration(data.targetDuration);
        if (data.history) setHistory(data.history);
      }
    } catch (err) {
      console.warn("Failed to load AiClippingStudio persistence:", err);
    }
  }, []);

  // Persistence: Save
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const state = { prompt, selectedModel, selectedModelName, targetDuration, history };
        localStorage.setItem(PERSIST_KEY, JSON.stringify(state));
      } catch (err) {
        console.warn("Failed to save AiClippingStudio persistence:", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [prompt, selectedModel, selectedModelName, targetDuration, history]);

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
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  };

  // Video upload
  const handleVideoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      alert("Video exceeds 100MB limit.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const url = await uploadFile(apiKey, file, (pct) => setUploadProgress(pct));
      setUploadedVideoUrl(url);
      setUploadedVideoName(file.name);
    } catch (err) {
      console.error("[AiClippingStudio] Video upload failed:", err);
      alert(`Video upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    }
  };

  const clearVideoUpload = () => {
    setUploadedVideoUrl(null);
    setUploadedVideoName(null);
  };

  // Generate clipped video
  const handleGenerate = useCallback(async () => {
    if (!uploadedVideoUrl) {
      alert("Please upload a video first.");
      return;
    }

    const currentModel = CLIPPING_MODELS.find(m => m.id === selectedModel);
    if (currentModel?.hasPrompt && !prompt.trim()) {
      alert("Please enter a prompt describing the clip you want.");
      return;
    }

    setGenerating(true);
    setGenerateError(null);

    try {
      const params = {
        model: selectedModel,
        video_url: uploadedVideoUrl,
        duration: targetDuration
      };
      if (prompt.trim()) params.prompt = prompt.trim();

      const result = await processV2V(apiKey, params);

      if (result?.url) {
        const entry = {
          id: Date.now(),
          url: result.url,
          prompt: prompt.trim(),
          model: selectedModel,
          duration: targetDuration,
          timestamp: new Date().toISOString()
        };
        setHistory(prev => [entry, ...prev].slice(0, 30));
        setFullscreenUrl(result.url);
        if (onGenerationComplete) {
          onGenerationComplete({ url: result.url, model: selectedModel, prompt: prompt.trim(), type: "video" });
        }
      }
    } catch (err) {
      console.error("[AiClippingStudio] Generation failed:", err);
      setGenerateError(err.message?.slice(0, 80) || "Generation failed");
      setTimeout(() => setGenerateError(null), 4000);
    } finally {
      setGenerating(false);
    }
  }, [apiKey, uploadedVideoUrl, prompt, selectedModel, targetDuration, onGenerationComplete]);

  // Download video
  const downloadVideo = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `clip-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

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
                <video
                  src={entry.url}
                  className="w-full aspect-video object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setFullscreenUrl(entry.url)}
                  muted
                  loop
                  onMouseOver={(e) => e.target.play()}
                  onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                />

                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenUrl(entry.url);
                    }}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-black transition-all border border-white/10"
                    title="Fullscreen"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadVideo(entry.url);
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
                    {entry.prompt || "Auto-generated clip"}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                      {entry.model?.replace("-", " ")}
                    </span>
                    <span className="text-[10px] text-white/40">{entry.duration}s clip</span>
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
                  <AiClipIcon className="text-primary opacity-80" />
                </div>
                <div className="absolute top-4 right-4 text-[10px] text-primary/40 animate-pulse">✂️</div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 text-center px-4">
              <span className="text-white/40 font-medium uppercase tracking-widest">START CREATING WITH</span>
              <br />
              <span className="text-white uppercase tracking-tight">AI CLIPPING STUDIO</span>
            </h1>
            <p className="text-white/40 text-sm md:text-base font-medium tracking-wide text-center max-w-lg leading-relaxed px-6">
              Upload videos and let AI extract the best moments automatically
            </p>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-4 w-full max-w-[95%] lg:max-w-4xl z-40 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-md border border-white/10 p-4 flex flex-col gap-2 shadow-2xl">
          {/* Top row: controls + upload */}
          <div className="flex items-center gap-2 px-1">
            {/* Video upload button */}
            <div className="relative">
              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoFileChange}
              />
              <button
                type="button"
                title={uploadedVideoUrl ? "Clear video" : "Upload video for clipping"}
                onClick={() => (uploadedVideoUrl ? clearVideoUpload() : videoFileInputRef.current?.click())}
                className={`w-10 h-10 shrink-0 rounded-full border transition-all flex items-center justify-center relative overflow-hidden ${
                  uploadedVideoUrl ? "border-primary/60 bg-primary/5" : "bg-white/5 border-white/[0.03] hover:bg-white/10 hover:border-primary/40"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center w-full h-full absolute inset-0 bg-black/80 z-20 backdrop-blur-[2px]">
                    <svg className="w-8 h-8 -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        className="text-white/10"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        strokeDasharray={88}
                        strokeDashoffset={88 - (88 * uploadProgress) / 100}
                        className="text-primary transition-all duration-300"
                      />
                    </svg>
                    <span className="absolute text-[9px] font-black text-primary leading-none">
                      {uploadProgress}%
                    </span>
                  </div>
                ) : uploadedVideoUrl ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    <polyline points="18 7 11 14 7 10" stroke="#22d3ee" strokeWidth="2" />
                  </svg>
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
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                )}
              </button>
            </div>

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
                  <span className="text-[8px] font-black text-primary uppercase">C</span>
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
                  <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 px-1">Clipping Models</div>
                  <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {CLIPPING_MODELS.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => { handleModelSelect(m); setOpenDropdown(null); }}
                        className={`flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all border border-transparent hover:border-white/5 ${
                          selectedModel === m.id ? "bg-white/5 border-white/5" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-white">{m.name}</span>
                          <span className="text-[9px] text-white/40">{m.description}</span>
                        </div>
                        {selectedModel === m.id && <CheckSvg />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Duration selector */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === "duration" ? null : "duration"); }}
                className={`px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] rounded-md border transition-all text-xs font-bold ${
                  openDropdown === "duration" ? "border-primary/50 text-primary" : "border-white/[0.03] text-white/70"
                }`}
              >
                {targetDuration}s
              </button>

              {openDropdown === "duration" && (
                <div
                  ref={dropdownRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-[calc(100%+12px)] left-0 z-50 bg-[#0a0a0a] rounded-lg p-1 shadow-3xl border border-white/10 min-w-[80px] animate-fade-in-up"
                >
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 px-2 pt-2">Duration</div>
                  {PRESET_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setTargetDuration(d); setOpenDropdown(null); }}
                      className={`w-full text-left px-3 py-2 rounded text-xs font-bold transition-all flex items-center justify-between ${
                        targetDuration === d ? "bg-primary text-black" : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{d}s</span>
                      {targetDuration === d && <CheckSvg />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !uploadedVideoUrl}
              className="bg-primary text-black px-6 py-2 rounded-md font-bold text-sm hover:bg-[#e5ff33] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 disabled:grayscale ml-auto"
            >
              {generating ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <span>Generate Clip</span>
              )}
            </button>
          </div>

          {/* Prompt input (for models that support it) */}
          {CLIPPING_MODELS.find(m => m.id === selectedModel)?.hasPrompt && (
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handlePromptInput}
              placeholder="Describe the clip you want (e.g., 'action highlights', 'funny moments')..."
              rows={1}
              className="w-full bg-transparent border-none text-white text-sm placeholder:text-white/20 focus:outline-none resize-none pt-1 leading-relaxed min-h-[40px] max-h-[100px] overflow-y-auto custom-scrollbar font-medium"
            />
          )}

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
          <div className="bg-[#111] rounded-lg p-6 shadow-4xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <video src={fullscreenUrl} controls autoPlay className="w-full max-h-[60vh] rounded-lg shadow-inner mb-4" />
            <button
              onClick={() => downloadVideo(fullscreenUrl)}
              className="w-full bg-primary text-black py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-all"
            >
              Download Clip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}