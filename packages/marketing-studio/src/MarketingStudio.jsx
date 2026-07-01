import React, { useState, useEffect, useRef, useCallback } from "react";
import { generateMarketingStudioAd, uploadFile } from '../../../src/lib/muapi.js';

const SCROLLBAR_STYLE = `
.custom-scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 211, 238, 0.3);
}
`;

const CheckSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseSvg = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ProductIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 8l-2-2H5L3 8v10a2 2 0 002 2h14a2 2 0 002-2V8z" />
    <path d="M3 10h18" />
    <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);

const AvatarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const RefIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ASSETS = {
  avatar: [
    { id: "aa252283-8591-4d14-91a8-41ce54187992", name: "Priya", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Priya.webp" },
    { id: "ba6c9b18-f79c-4dab-9649-88a181d0a038", name: "Elena", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Elena.webp" },
    { id: "30e2cadd-987c-4a7a-81c3-094d4fb3a65e", name: "Kai", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Kai.webp" },
    { id: "fbed59e1-4b8d-4625-9140-ef2044e0be72", name: "Sora", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Sora.webp" },
    { id: "bcd9e6ee-c000-48e6-9f4b-a20fc2a674f7", name: "Minji", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Minji.webp" },
    { id: "1da384ed-3856-45e4-bf4c-a496c7aa95ff", name: "Margot", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Margot.webp" },
    { id: "b799c8f5-fb6e-4905-b33b-cdefac153ec3", name: "Niko", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Niko.webp" },
    { id: "b6971dd4-55fa-4e64-b318-392b16504284", name: "Jin", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Jin.webp" }
  ],
  ugc: [
    { id: 1, name: "UGC", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc.mp4" },
    { id: 2, name: "Tutorial", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc_how_to.mp4" },
    { id: 3, name: "Unboxing", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc_unboxing.mp4" },
    { id: 4, name: "Hyper Motion", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/hyper-motion-mini.mp4" },
    { id: 5, name: "Product Review", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/product_review.mp4" },
    { id: 6, name: "TV Spot", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/tv-spot-mini.mp4" }
  ]
};

const OPTIONS = {
  ratio: ["9:16", "3:4", "4:3", "16:9", "1:1"],
  res: ["720p", "1080p"],
  duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
};

function UploadSlot({ icon, url, progress, label, onUpload, onClear, multiple = false, images = [] }) {
  const inputRef = useRef(null);
  
  const handleClick = () => inputRef.current?.click();
  
  const handleUpload = (e) => onUpload(e);
  
  const handleClear = (e) => {
    e.stopPropagation();
    onClear();
  };
  
  return (
    <div className="relative group/slot flex items-center">
      <div
        onClick={handleClick}
        title={`Upload ${label}`}
        className={`relative w-10 h-10 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
          url ? 'border-primary/40 bg-primary/5' : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          multiple={multiple}
          onChange={handleUpload}
        />
        {progress > 0 && progress < 100 ? (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-10">
            <span className="text-[8px] font-black text-primary">{progress}%</span>
          </div>
        ) : url ? (
          <div className="w-full h-full rounded-full overflow-hidden border border-black/20">
            <img src={url} className="w-full h-full object-cover" alt={label} />
          </div>
        ) : (
          <div className="text-white/40 group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
        {url && !multiple && (
          <button
            onClick={handleClear}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity shadow-lg"
          >
            <CloseSvg />
          </button>
        )}
      </div>
    </div>
  );
}

function Dropdown({ isOpen, title, items, selectedId, onSelect, onClose, isVideo = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-[calc(100%+12px)] left-0 z-50 bg-[#0a0a0a] rounded p-4 shadow-4xl border border-white/10 w-[420px] animate-fade-in-up"
    >
      <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 px-1">{title}</div>
      <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={`relative rounded overflow-hidden border-2 transition-all group cursor-pointer ${
              selectedId === item.id || selectedId === item.url ? 'border-primary shadow-glow' : 'border-white/5 hover:border-white/20'
            }`}
          >
            {isVideo ? (
              <video src={item.url} autoPlay loop muted className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-all duration-500" />
            ) : (
              <img src={item.url} className="w-full aspect-square object-cover group-hover:scale-105 transition-all duration-500" alt={item.name} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-black text-white uppercase tracking-tight">{item.name}</span>
            </div>
            {(selectedId === item.id || selectedId === item.url) && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <CheckSvg />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleDropdown({ isOpen, title, options, selected, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-[calc(100%+12px)] left-0 z-50 bg-[#0a0a0a] rounded p-1 max-h-[200px] overflow-y-auto custom-scrollbar shadow-3xl border border-white/10 min-w-[140px] animate-fade-in-up"
    >
      <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 px-3 pt-2">{title}</div>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => { onSelect(opt); onClose(); }}
          className={`w-full text-left px-4 py-2 rounded text-xs font-bold transition-all flex items-center justify-between ${
            selected === opt ? 'bg-primary text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span>{opt}</span>
          {selected === opt && <CheckSvg />}
        </button>
      ))}
    </div>
  );
}

export default function MarketingStudio({ apiKey }) {
  const PERSIST_KEY = "hg_marketing_studio_persistent";
  
  const [prompt, setPrompt] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [avatarImage, setAvatarImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [params, setParams] = useState({
    ratio: "9:16",
    format: ASSETS.ugc[0].name,
    videoUrl: ASSETS.ugc[0].url,
    res: "1080p",
    duration: 5
  });
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ product: 0, avatar: 0, additional: 0 });
  const [fullscreenUrl, setFullscreenUrl] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PERSIST_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.prompt) setPrompt(data.prompt);
        if (data.history) setHistory(data.history);
      }
    } catch (e) {
      console.warn("Failed to load saved state:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify({ prompt, history }));
    } catch (e) {
      console.warn("Failed to save state:", e);
    }
  }, [prompt, history]);

  const downloadFile = useCallback(async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed:', e);
    }
  }, []);

  const handleUpload = async (e, target) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (target === 'additional') {
      for (const file of files) {
        if (additionalImages.length >= 6) break;
        try {
          setUploadProgress(prev => ({ ...prev, additional: 10 }));
          const url = await uploadFile(apiKey, file, (progress) => {
            setUploadProgress(prev => ({ ...prev, additional: progress }));
          });
          setAdditionalImages(prev => [...prev, url]);
          setUploadProgress(prev => ({ ...prev, additional: 0 }));
        } catch (error) {
          console.error('Upload failed:', error);
          setUploadProgress(prev => ({ ...prev, additional: 0 }));
        }
      }
    } else {
      const file = files[0];
      const targetKey = target === 'avatar' ? 'avatar' : 'product';
      try {
        setUploadProgress(prev => ({ ...prev, [targetKey]: 10 }));
        const url = await uploadFile(apiKey, file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [targetKey]: progress }));
        });
        if (target === 'avatar') {
          setAvatarImage(url);
        } else {
          setProductImage(url);
        }
        setUploadProgress(prev => ({ ...prev, [targetKey]: 0 }));
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadProgress(prev => ({ ...prev, [targetKey]: 0 }));
      }
    }
  };

  const handleClear = (target) => {
    if (target === 'product') setProductImage(null);
    if (target === 'avatar') setAvatarImage(null);
    if (target === 'additional') setAdditionalImages([]);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      alert('Please set VITE_MUAPI_API_KEY in your .env file');
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateMarketingStudioAd(apiKey, {
        prompt,
        images_list: [productImage, avatarImage, ...(additionalImages || [])].filter(Boolean),
        video_files: params.videoUrl ? [params.videoUrl] : [],
        aspect_ratio: params.ratio.replace(':', '_'),
        duration: params.duration
      });
      
      if (result?.output_url) {
        const newEntry = {
          id: Date.now(),
          url: result.output_url,
          prompt,
          format: params.format,
          createdAt: new Date().toISOString()
        };
        setHistory(prev => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Generation failed. Please check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextareaInput = (e) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleAdditionalClear = (idx) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <>
      <style>{SCROLLBAR_STYLE}</style>
      
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
                    <path d="M21 8l-2-2H5L3 8v10a2 2 0 002 2h14a2 2 0 002-2V8z" />
                    <path d="M3 10h18" />
                    <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                  </svg>
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2">MARKETING STUDIO</h2>
                <p className="text-xs text-white/40 max-w-xs">
                  Create AI-powered marketing videos with your product and avatar images
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.map((item) => (
                <div key={item.id} className="group relative aspect-[9/16] rounded overflow-hidden border border-white/5">
                  <video 
                    src={item.url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <button
                        onClick={() => downloadFile(item.url, `marketing-${item.id}.mp4`)}
                        className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7,10 12,15 17,10" />
                          <line x1="12" y1="15" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 text-[9px] font-bold text-primary uppercase px-2 py-0.5 rounded">
                    {item.format}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/5 p-3">
          <div className="flex items-end gap-2 mb-2 overflow-x-auto custom-scrollbar-thin">
            {additionalImages.map((url, idx) => (
              <div key={idx} className="relative w-10 h-10 rounded overflow-hidden border border-white/10 flex-shrink-0">
                <img src={url} className="w-full h-full object-cover" alt={`Reference ${idx + 1}`} />
                <button
                  onClick={() => handleAdditionalClear(idx)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <CloseSvg />
                </button>
              </div>
            ))}
          </div>
          
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={handleTextareaInput}
            placeholder="Describe your product or scene..."
            className="w-full min-h-[40px] max-h-[120px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-primary/50 mb-2"
            rows={1}
          />
          
          <div className="flex items-center gap-2 flex-wrap">
            <UploadSlot
              icon={<ProductIcon />}
              url={productImage}
              progress={uploadProgress.product}
              label="Product"
              onUpload={(e) => handleUpload(e, 'product')}
              onClear={() => handleClear('product')}
            />
            
            <UploadSlot
              icon={<AvatarIcon />}
              url={avatarImage}
              progress={uploadProgress.avatar}
              label="Avatar"
              onUpload={(e) => handleUpload(e, 'avatar')}
              onClear={() => handleClear('avatar')}
            />
            
            <UploadSlot
              icon={<RefIcon />}
              url={additionalImages.length > 0 ? additionalImages[0] : null}
              progress={uploadProgress.additional}
              label="References"
              onUpload={(e) => handleUpload(e, 'additional')}
              onClear={() => handleClear('additional')}
              multiple
              images={additionalImages}
            />
            
            <div className="relative">
              <button
                onClick={() => setDropdown(dropdown === 'format' ? null : 'format')}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs font-bold text-white/80 hover:bg-white/10 transition-colors"
              >
                {params.format}
              </button>
              <Dropdown
                isOpen={dropdown === 'format'}
                title="UGC Style"
                items={ASSETS.ugc}
                selectedId={params.videoUrl}
                onSelect={(item) => {
                  setParams(prev => ({ ...prev, format: item.name, videoUrl: item.url }));
                  setDropdown(null);
                }}
                onClose={() => setDropdown(null)}
                isVideo
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setDropdown(dropdown === 'avatar' ? null : 'avatar')}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs font-bold text-white/80 hover:bg-white/10 transition-colors"
              >
                Avatar
              </button>
              <Dropdown
                isOpen={dropdown === 'avatar'}
                title="Avatar Preset"
                items={ASSETS.avatar}
                selectedId={avatarImage}
                onSelect={(item) => {
                  setAvatarImage(item.url);
                  setDropdown(null);
                }}
                onClose={() => setDropdown(null)}
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setDropdown(dropdown === 'ratio' ? null : 'ratio')}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs font-bold text-white/80 hover:bg-white/10 transition-colors"
              >
                {params.ratio}
              </button>
              <SimpleDropdown
                isOpen={dropdown === 'ratio'}
                title="Aspect Ratio"
                options={OPTIONS.ratio}
                selected={params.ratio}
                onSelect={(val) => setParams(prev => ({ ...prev, ratio: val }))}
                onClose={() => setDropdown(null)}
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setDropdown(dropdown === 'res' ? null : 'res')}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs font-bold text-white/80 hover:bg-white/10 transition-colors"
              >
                {params.res}
              </button>
              <SimpleDropdown
                isOpen={dropdown === 'res'}
                title="Resolution"
                options={OPTIONS.res}
                selected={params.res}
                onSelect={(val) => setParams(prev => ({ ...prev, res: val }))}
                onClose={() => setDropdown(null)}
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setDropdown(dropdown === 'duration' ? null : 'duration')}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs font-bold text-white/80 hover:bg-white/10 transition-colors"
              >
                {params.duration}s
              </button>
              <SimpleDropdown
                isOpen={dropdown === 'duration'}
                title="Duration"
                options={OPTIONS.duration}
                selected={params.duration}
                onSelect={(val) => setParams(prev => ({ ...prev, duration: val }))}
                onClose={() => setDropdown(null)}
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !apiKey}
              className={`ml-auto px-6 py-1.5 rounded font-black text-xs uppercase tracking-widest transition-all ${
                isGenerating || !apiKey
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-primary text-black hover:bg-primary/90'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Launch'}
            </button>
          </div>
        </div>
      </div>

      {fullscreenUrl && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setFullscreenUrl(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <CloseSvg />
          </button>
          <video src={fullscreenUrl} className="max-w-full max-h-full" controls autoPlay />
        </div>
      )}
    </>
  );
}