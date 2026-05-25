import React, { useState, useEffect, useRef, useCallback } from 'react';
import { muapi } from '../lib/muapi.js';
import { applyPixverseAdvancedEffect } from '../lib/muapiEnhanced.js';
import { AuthModal } from './AuthModal.js';
import { createUploadPicker } from './UploadPicker.js';
import { createFullscreenPreview } from './MediaPreview.js';
import { createInlineInstructions } from './InlineInstructions.js';
import { i2iModels, i2vModels } from '../lib/models.js';
import { PIXVERSE_ADVANCED_EFFECTS } from '../lib/muapiConfig.js';
import { createHeroSection } from '../lib/thumbnails.js';
import { securityService } from '../lib/services/SecurityService.js';
import { templates } from '../lib/templates.js';
import { navigate } from '../lib/router.js';
import { getPendingHandoff, clearPendingHandoff, sendToHandoff, createHandoffPayload } from '../lib/handoff.ts';

const EFFECT_TABS = [
  { id: 'image-effects', label: 'Image Effects', type: 'i2i', field: 'name' },
  { id: 'nano-banana-effects', label: 'Nano Banana', type: 'i2i', field: 'name' },
  { id: 'flux-kontext-effects', label: 'Kontext Effects', type: 'i2i', field: 'name' },
  { id: 'ai-video-effects', label: 'AI Video Effects', type: 'i2v', field: 'name' },
  { id: 'custom-ai-video-effects', label: 'Custom AI Effects', type: 'muapi-custom', field: 'prompt' },
  { id: 'motion-controls', label: 'Motion Controls', type: 'i2v', field: 'name' },
  { id: 'video-effects', label: 'Video FX v2', type: 'i2v', field: 'name' },
  { id: 'pixverse-advanced-effects', label: 'Pixverse Advanced', type: 'pixverse-advanced', field: 'name' },
  { id: 'templates', label: 'Templates', type: 'templates', field: 'template' },
];

interface Tab {
  id: string;
  label: string;
  type: string;
  field: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

function getEffectsForModel(modelId: string): string[] {
  if (modelId === 'templates') {
    return getEffectsTemplates().map(t => t.id);
  }
  if (modelId === 'custom-ai-video-effects') return [];
  if (modelId === 'pixverse-advanced-effects') {
    return Object.keys(PIXVERSE_ADVANCED_EFFECTS);
  }
  const allModels = [...i2iModels, ...i2vModels];
  const model = allModels.find((m: any) => m.id === modelId);
  if (!model) return [];
  const nameField = (model as any).inputs?.name;
  if (nameField?.enum) return nameField.enum;
  return [];
}

function getEffectsTemplates(): Template[] {
  return templates.filter(template => {
    const effectsModels = [
      'ai-video-effects', 'motion-controls', 'image-effects',
      'flux-kontext-effects', 'video-effects', 'nano-banana-effects'
    ];
    return effectsModels.includes(template.model);
  });
}

const EffectsStudio: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<{ show: (url: string, opts?: any) => void } | null>(null);
  const effectsGridRef = useRef<HTMLDivElement>(null);
  const selectedBadgeRef = useRef<HTMLDivElement>(null);
  const effectsPanelRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const mobilePromptRef = useRef<HTMLInputElement>(null);
  const generateBtnRef = useRef<HTMLButtonElement>(null);
  const mobileGenBtnRef = useRef<HTMLButtonElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>(EFFECT_TABS[0]);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<'image' | 'video'>('image');
  const [isLoadingOutput, setIsLoadingOutput] = useState(false);
  const [outputError, setOutputError] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const fullscreen = createFullscreenPreview();
      fullscreenRef.current = fullscreen;
      containerRef.current.appendChild(fullscreen.element);
    }
  }, []);

  // Handle pending handoff from other apps (library, render, director)
  useEffect(() => {
    const pendingHandoff = getPendingHandoff('library');
    if (pendingHandoff && pendingHandoff.url) {
      console.log('[EffectsStudio] Received handoff from library:', pendingHandoff.url);
      setInputUrl(pendingHandoff.url);
      if (pendingHandoff.type === 'video') {
        setOutputType('video');
      }
      clearPendingHandoff('library');
    }
  }, []);

  const effectList = getEffectsForModel(activeTab.id);
  const filteredEffects = searchFilter
    ? effectList.filter(name => name.toLowerCase().includes(searchFilter.toLowerCase()))
    : effectList;

  const templatesList = getEffectsTemplates();
  const filteredTemplates = searchFilter
    ? templatesList.filter(template =>
        template.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        template.category.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : templatesList;

  const isTemplatesTab = activeTab.id === 'templates';

  const getEffectThumbnail = (effectName: string, tabId: string): string | null => {
    const slug = effectName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const effectIndexMap: Record<string, string> = {
      '360 rotation': '01', 'abandoned places': '02', 'angry': '03', 'animal documentary': '04',
      'assassin it': '05', 'baby it': '06', 'boxing': '07', 'bride it': '08', 'cakeify': '09',
      'cartoon jaw drop': '10', 'cats': '11', 'crush it': '12', 'crying': '13', 'cyberpunk 2077': '14',
      'deflate it': '15', 'disney princess it': '16', 'dogs': '17', 'eye close-up': '18',
      'fantasy landscapes': '19', 'film noir': '20', 'fire': '21', 'glamor': '22', 'goblin': '23',
      'gun reveal': '24', 'hug jesus': '25', 'hulk transformation': '26', 'inflate it': '27',
      'jungle it': '28', 'jumpscare': '29', 'kamehameha': '30', 'kiss cam': '31', 'kissing': '32',
      'lego': '33', 'laughing': '34', 'little planet': '35', 'live wallpaper': '36',
      'looping pixel art': '37', 'melt it': '38', 'mona lisa it': '39', 'museum it': '40',
      'muscle show off': '41', 'orc': '42', 'pixar': '43', 'pirate captain': '44', 'pov driving': '45',
      'princess it': '46', 'puppy it': '47', 'robotic face reveal': '48', 'samurai it': '49',
      'sharingan eyes': '50', 'skyrim fus-ro-dah': '51', 'snow white it': '52', 'squish it': '53',
      'steamboat willie': '54', 'super saiyan transformation': '55', 'tsunami': '56', 'ultra wide': '57',
      'vhs footage': '58', 'vip it': '59', 'warrior it': '60', 'wind blast': '61',
      'younger self selfie': '62', 'zen it': '63', 'zoom call': '64'
    };

    const index = effectIndexMap[slug] || effectIndexMap[effectName.toLowerCase()];

    if (tabId === 'ai-video-effects' && index) {
      return `/thumbnails/effects/ai-video/${index}-${slug}.webp.png`;
    }
    if (tabId === 'image-effects') {
      return `/thumbnails/effects/image-effects/${slug}.webp.png`;
    }
    if (tabId === 'nano-banana-effects') {
      return `/thumbnails/effects/nano-banana/${slug}.webp.png`;
    }
    if (tabId === 'flux-kontext-effects') {
      return `/thumbnails/effects/kontext-effects/${slug}.webp.png`;
    }
    if (tabId === 'motion-controls') {
      return `/thumbnails/effects/motion-controls/${slug}.webp.png`;
    }
    if (tabId === 'video-effects') {
      return `/thumbnails/effects/vfx/${slug}.webp.png`;
    }
    if (tabId === 'pixverse-advanced-effects') {
      return `/thumbnails/effects/pixverse-advanced/${slug}.webp.png`;
    }
    return null;
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedEffect(null);
    setSearchFilter('');
    if (selectedBadgeRef.current) {
      selectedBadgeRef.current.textContent = tab.id === 'templates' ? 'No template selected' : 'No effect selected';
      selectedBadgeRef.current.className = 'text-xs font-bold text-muted';
    }
  };

  const handleEffectSelect = (name: string, cardEl: HTMLDivElement) => {
    setSelectedEffect(name);
    if (selectedBadgeRef.current) {
      selectedBadgeRef.current.textContent = name;
      selectedBadgeRef.current.className = 'text-xs font-bold text-primary';
    }
    if (effectsGridRef.current) {
      effectsGridRef.current.querySelectorAll('[data-selected]').forEach(el => {
        el.removeAttribute('data-selected');
        el.classList.remove('border-primary/50', 'bg-primary/5');
        el.classList.add('border-white/5');
      });
      cardEl.setAttribute('data-selected', '1');
      cardEl.classList.remove('border-white/5');
      cardEl.classList.add('border-primary/50', 'bg-primary/5');
    }
  };

  const handleUpload = async (file: File) => {
    setInputUrl(URL.createObjectURL(file));
    try {
      const url = await muapi.uploadFile(file);
      setUploadedUrl(url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleClearUpload = () => {
    setInputUrl(null);
    setUploadedUrl(null);
  };

  const handleGenerate = async () => {
    if (activeTab.id === 'ai-video-effects' && !selectedEffect) return;
    if (activeTab.id === 'custom-ai-video-effects') {
      const customPrompt = promptInputRef.current?.value.trim() || mobilePromptRef.current?.value.trim();
      if (!customPrompt) return;
    } else if (activeTab.id === 'pixverse-advanced-effects' && !selectedEffect) return;
    else if (!selectedEffect && !isTemplatesTab) return;
    if (!uploadedUrl) return;

    const apiKey = await securityService.getDecryptedKey();
    if (!apiKey) {
      AuthModal(() => handleGenerate());
      return;
    }

    setIsGenerating(true);
    setIsLoadingOutput(true);
    setOutputError(null);
    if (generateBtnRef.current) {
      generateBtnRef.current.disabled = true;
      generateBtnRef.current.innerHTML = '<span class="animate-spin inline-block mr-2">&#9711;</span> Processing...';
    }
    if (mobileGenBtnRef.current) {
      mobileGenBtnRef.current.disabled = true;
      mobileGenBtnRef.current.textContent = 'Processing...';
    }

    const effectName = activeTab.id === 'custom-ai-video-effects' ? 'Custom Effect' : selectedEffect;

    try {
      let result;

      if (activeTab.id === 'ai-video-effects') {
        const prompt = promptInputRef.current?.value.trim() || mobilePromptRef.current?.value.trim();
        result = await muapi.generateVideoEffect({
          prompt: prompt || 'Apply effect',
          image_url: uploadedUrl,
          name: selectedEffect!,
          aspect_ratio: '16:9',
          resolution: '720p',
          quality: 'medium',
          duration: 5
        });
        setOutputType('video');
      } else if (activeTab.id === 'custom-ai-video-effects') {
        const customPrompt = promptInputRef.current?.value.trim() || mobilePromptRef.current?.value.trim();
        result = await muapi.generateVideoEffect({
          prompt: customPrompt,
          image_url: uploadedUrl,
          aspect_ratio: '16:9',
          resolution: '720p',
          quality: 'medium',
          duration: 5
        });
        setOutputType('video');
      } else if (activeTab.id === 'pixverse-advanced-effects') {
        const prompt = promptInputRef.current?.value.trim() || mobilePromptRef.current?.value.trim();
        result = await applyPixverseAdvancedEffect(
          { url: uploadedUrl! },
          selectedEffect!,
          {
            prompt: prompt || 'Apply advanced effect',
            aspectRatio: '16:9',
            resolution: '720p',
            quality: 'high',
            duration: 5,
            detailLevel: 'ultra',
            enhancementLevel: 'maximum'
          }
        );
        setOutputType('video');
      } else {
        const params: any = {
          model: activeTab.id,
          image_url: uploadedUrl,
          [activeTab.field]: selectedEffect,
        };
        const prompt = promptInputRef.current?.value.trim() || mobilePromptRef.current?.value.trim();
        if (prompt) params.prompt = prompt;

        if (activeTab.type === 'i2v') {
          params.resolution = '720p';
          params.duration = 5;
          result = await muapi.generateI2V(params);
          setOutputType('video');
        } else {
          result = await muapi.generateI2I(params);
          setOutputType('image');
        }
      }

      if (result?.url) {
        setOutputUrl(result.url);
        saveToHistory(result.url, outputType);
      } else {
        setOutputError('No output URL returned');
      }
    } catch (err: any) {
      setOutputError(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setIsLoadingOutput(false);
      if (generateBtnRef.current) {
        generateBtnRef.current.disabled = false;
        generateBtnRef.current.textContent = 'Apply Effect';
      }
      if (mobileGenBtnRef.current) {
        mobileGenBtnRef.current.disabled = false;
        mobileGenBtnRef.current.textContent = 'Apply Effect';
      }
    }
  };

  const saveToHistory = (url: string, type: string) => {
    try {
      const key = type === 'video' ? 'video_history' : 'muapi_history';
      const history = JSON.parse(localStorage.getItem(key) || '[]');

      let savedPrompt = selectedEffect;
      if (activeTab.id === 'custom-ai-video-effects') {
        savedPrompt = promptInputRef.current?.value.trim() || mobilePromptRef.current?.value.trim();
      }

      history.unshift({
        id: Date.now().toString(),
        url,
        prompt: savedPrompt,
        model: activeTab.id,
        type,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(history.slice(0, 100)));
    } catch (e) { }
  };

  const handleOutputClick = () => {
    if (outputUrl && fullscreenRef.current) {
      fullscreenRef.current.show(outputUrl, { type: outputType, model: activeTab.label });
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col bg-app-bg overflow-hidden relative"
    >
      {/* Top Bar */}
      <div className="px-4 md:px-8 pt-6 pb-4 shrink-0">
        <div className="h-64 md:h-80 lg:h-96 mb-4 relative">
          {(() => {
            const effectsBanner = createHeroSection('effects', 'h-full');
            if (effectsBanner) {
              const bannerText = document.createElement('div');
              bannerText.className = 'absolute bottom-0 left-0 right-0 p-4 z-10';

              const h1 = document.createElement('h1');
              h1.className = 'text-2xl md:text-3xl font-black text-white tracking-tight mb-1';
              h1.textContent = 'Effects Studio';

              const p = document.createElement('p');
              p.className = 'text-white/60 text-xs';
              p.textContent = 'Apply 350+ visual effects to your photos and videos';

              bannerText.appendChild(h1);
              bannerText.appendChild(p);
              effectsBanner.appendChild(bannerText);

              return effectsBanner;
            }
            return null;
          })()}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {EFFECT_TABS.map(tab => {
            const count = getEffectsForModel(tab.id).length;
            const isActive = activeTab.id === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${isActive ? 'bg-primary text-black' : 'bg-white/5 text-secondary hover:bg-white/10'}`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="mt-2 text-center text-white/30 text-sm flex flex-col gap-1">
          <p>🎬 Select an effect and upload media to transform it</p>
          <p className="text-xs text-white/20">Tip: Use the search to find effects quickly</p>
        </div>
      </div>

      {/* Body Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Effects Panel */}
        <div
          ref={effectsPanelRef}
          className="w-full md:w-[340px] lg:w-[400px] shrink-0 overflow-y-auto px-4 md:px-6 pb-6 md:border-r border-white/5"
          style={{ display: activeTab.id === 'custom-ai-video-effects' ? 'none' : 'block' }}
        >
          <input
            type="text"
            placeholder="Search effects..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors mb-3"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />

          <div ref={effectsGridRef} className="grid grid-cols-2 gap-2">
            {isTemplatesTab ? (
              filteredTemplates.length === 0 ? (
                <div className="col-span-2 text-xs text-muted py-6 text-center">
                  {searchFilter ? 'No templates match your search' : 'No effect templates available'}
                </div>
              ) : (
                filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`bg-white/[0.03] border rounded-xl p-2 cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all group overflow-hidden ${selectedEffect === template.id ? 'border-primary/50 bg-primary/5' : 'border-white/5'}`}
                    data-selected={selectedEffect === template.id ? '1' : undefined}
                    onClick={() => {
                      setSelectedEffect(template.id);
                      if (selectedBadgeRef.current) {
                        selectedBadgeRef.current.textContent = template.name;
                        selectedBadgeRef.current.className = 'text-xs font-bold text-primary';
                      }
                      navigate(`effects/template/${template.id}`);
                    }}
                  >
                    <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden bg-white/5">
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">{template.icon || '🎬'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] font-bold text-white group-hover:text-primary transition-colors truncate">{template.name}</div>
                      <div className="text-[9px] text-muted truncate">{template.category}</div>
                    </div>
                  </div>
                ))
              )
            ) : filteredEffects.length === 0 ? (
              <div className="col-span-2 text-xs text-muted py-6 text-center">
                {activeTab.id === 'custom-ai-video-effects' ? 'Free-form prompt mode - no templates required' : 'No effects match your search'}
              </div>
            ) : (
              filteredEffects.map(name => {
                const isVideo = activeTab.type === 'i2v' || activeTab.type === 'pixverse-advanced';
                const thumbnailUrl = getEffectThumbnail(name, activeTab.id);
                const displayName = activeTab.id === 'pixverse-advanced-effects'
                  ? PIXVERSE_ADVANCED_EFFECTS[name]?.name || name
                  : name;

                return (
                  <div
                    key={name}
                    className={`bg-white/[0.03] border rounded-xl p-2 cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all group overflow-hidden ${selectedEffect === name ? 'border-primary/50 bg-primary/5' : 'border-white/5'}`}
                    data-selected={selectedEffect === name ? '1' : undefined}
                    onClick={(e) => handleEffectSelect(name, e.currentTarget as HTMLDivElement)}
                  >
                    <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden bg-white/5">
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {isVideo ? (
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <polygon points="23 7 16 12 23 17 23 7" />
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isVideo ? 'bg-blue-400' : 'bg-primary'} shrink-0`} />
                      <div className="text-[10px] font-bold text-white group-hover:text-primary transition-colors truncate">{displayName}</div>
                    </div>
                    <div className="text-[9px] text-muted mt-0.5">{isVideo ? 'Video' : 'Image'}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Preview Panel - Desktop */}
        <div className="hidden md:flex flex-1 flex-col overflow-y-auto">
          <div className="p-4 lg:p-6 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-secondary uppercase tracking-wider">Preview</div>
              <div ref={selectedBadgeRef} className="text-xs font-bold text-muted">No effect selected</div>
            </div>

            <div className="flex gap-4 flex-1 min-h-0">
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Input</div>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center min-h-[200px]">
                  {inputUrl ? (
                    inputUrl.includes('.mp4') || inputUrl.includes('video') ? (
                      <video src={inputUrl} className="max-h-[40vh] object-contain" controls />
                    ) : (
                      <img src={inputUrl} className="max-h-[40vh] object-contain" alt="Input" />
                    )
                  ) : (
                    <span className="text-muted text-xs">No media uploaded</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    <span className="text-xs font-bold text-white">Upload</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                      }}
                    />
                  </label>
                  {inputUrl && (
                    <button onClick={handleClearUpload} className="text-xs text-muted hover:text-white">
                      Clear
                    </button>
                  )}
                  <span className="text-xs text-muted">Upload image or video</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3 min-w-0">
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Output</div>
                <div
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center min-h-[200px] cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={handleOutputClick}
                >
                  {isLoadingOutput ? (
                    <span className="animate-spin text-primary text-2xl">◌</span>
                  ) : outputError ? (
                    <span className="text-red-400 text-xs">{outputError}</span>
                  ) : outputUrl ? (
                    outputType === 'video' ? (
                      <video src={outputUrl} className="max-h-[40vh] object-contain" controls />
                    ) : (
                      <img src={outputUrl} className="max-h-[40vh] object-contain" alt="Output" />
                    )
                  ) : (
                    <span className="text-muted text-xs">Output will appear here</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={promptInputRef}
                type="text"
                placeholder={
                  activeTab.id === 'custom-ai-video-effects' ? 'Describe your desired video effect...' :
                  isTemplatesTab ? 'Templates handle their own prompts...' :
                  'Optional prompt...'
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                ref={generateBtnRef}
                className="bg-primary text-black px-6 py-2.5 rounded-xl font-black text-sm hover:shadow-glow transition-all whitespace-nowrap disabled:opacity-50"
                onClick={handleGenerate}
                disabled={isGenerating || !uploadedUrl}
              >
                Apply Effect
              </button>
              {outputUrl && (
                <div className="relative">
                  <button
                    onClick={() => {
                      const dropdown = document.getElementById('effects-send-dropdown');
                      if (dropdown) dropdown.classList.toggle('hidden');
                    }}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-bold text-sm transition-all"
                  >
                    Send to ▾
                  </button>
                  <div id="effects-send-dropdown" className="hidden absolute bottom-full mb-2 right-0 bg-black/90 border border-white/10 rounded-xl overflow-hidden z-50 min-w-[140px]">
                    <button
                      onClick={() => {
                        const payload = createHandoffPayload(`eff_${Date.now()}`, outputType, 'effects-studio', selectedEffect || 'Applied effect', outputUrl, outputUrl, { model: activeTab.id });
                        sendToHandoff('library', payload);
                        const dropdown = document.getElementById('effects-send-dropdown');
                        if (dropdown) dropdown.classList.add('hidden');
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors"
                    >
                      Library
                    </button>
                    <button
                      onClick={() => {
                        const payload = createHandoffPayload(`eff_${Date.now()}`, outputType, 'effects-studio', selectedEffect || 'Applied effect', outputUrl, outputUrl, { model: activeTab.id });
                        sendToHandoff('render', payload);
                        const dropdown = document.getElementById('effects-send-dropdown');
                        if (dropdown) dropdown.classList.add('hidden');
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors"
                    >
                      Render
                    </button>
                    <button
                      onClick={() => {
                        const payload = createHandoffPayload(`eff_${Date.now()}`, outputType, 'effects-studio', selectedEffect || 'Applied effect', outputUrl, outputUrl, { model: activeTab.id });
                        sendToHandoff('director', payload);
                        const dropdown = document.getElementById('effects-send-dropdown');
                        if (dropdown) dropdown.classList.add('hidden');
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors"
                    >
                      Director
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden px-4 pb-4 shrink-0 flex flex-col gap-3 border-t border-white/5 pt-3">
        <div className="flex gap-3">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center min-h-[100px]">
            {inputUrl ? (
              inputUrl.includes('.mp4') ? (
                <video src={inputUrl} className="max-h-[30vh] object-contain" controls />
              ) : (
                <img src={inputUrl} className="max-h-[30vh] object-contain" alt="Input" />
              )
            ) : (
              <span className="text-muted text-xs">No input</span>
            )}
          </div>
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center min-h-[100px]">
            {isLoadingOutput ? (
              <span className="animate-spin text-primary text-xl">◌</span>
            ) : outputUrl ? (
              outputType === 'video' ? (
                <video src={outputUrl} className="max-h-[30vh] object-contain" controls />
              ) : (
                <img src={outputUrl} className="max-h-[30vh] object-contain" alt="Output" />
              )
            ) : (
              <span className="text-muted text-xs">No output</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <span className="text-xs font-bold text-white">Upload</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>
          {inputUrl && (
            <button onClick={handleClearUpload} className="text-xs text-muted hover:text-white">
              Clear
            </button>
          )}
          <input
            ref={mobilePromptRef}
            type="text"
            placeholder={activeTab.id === 'custom-ai-video-effects' ? 'Describe your effect...' : 'Optional prompt...'}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder:text-muted focus:outline-none focus:border-primary/50"
          />
        </div>
        <button
          ref={mobileGenBtnRef}
          className="w-full bg-primary text-black py-3 rounded-xl font-black text-sm disabled:opacity-50"
          onClick={handleGenerate}
          disabled={isGenerating || !uploadedUrl}
        >
          Apply Effect
        </button>
      </div>
    </div>
  );
};

export default EffectsStudio;