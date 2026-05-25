import React, { useState, useEffect, useRef, useCallback } from 'react';
import { muapi } from '../lib/muapi.js';
import {
    t2iModels, getAspectRatiosForModel, getResolutionsForModel, getQualityFieldForModel,
    i2iModels, getAspectRatiosForI2IModel, getResolutionsForI2IModel, getQualityFieldForI2IModel,
    getMaxImagesForI2IModel
} from '../lib/models.js';
import { localAI, isLocalAIAvailable } from '../lib/localInferenceClient.js';
import { LOCAL_MODEL_CATALOG, getLocalModelById } from '../lib/localModels.js';
import { ENHANCE_TAGS, QUICK_PROMPTS } from '../lib/promptUtils.js';
import { AuthModal } from './AuthModal.js';
import { createUploadPicker } from './UploadPicker.js';
import { savePendingJob, removePendingJob, getPendingJobs } from '../lib/pendingJobs.js';
import { sendToHandoff, createHandoffPayload } from '../lib/handoff.ts';

const STYLE_PRESETS = ['None', 'Photorealistic', 'Anime', 'Cinematic', 'Oil Painting', 'Watercolor', 'Digital Art', 'Concept Art', 'Cyberpunk'];

interface GenerationEntry {
    id: string;
    url: string;
    prompt?: string;
    model?: string;
    aspect_ratio?: string;
    seed?: number;
    timestamp: string;
}

interface PendingJob {
    requestId: string;
    studioType: string;
    historyMeta: GenerationEntry;
    maxAttempts: number;
    interval: number;
    submittedAt: number;
}

const ImageStudio: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const modelBtnLabelRef = useRef<HTMLSpanElement>(null);
    const arBtnLabelRef = useRef<HTMLSpanElement>(null);
    const qualityBtnLabelRef = useRef<HTMLSpanElement>(null);
    const qualityBtnRef = useRef<HTMLButtonElement>(null);
    const advancedBtnLabelRef = useRef<HTMLSpanElement>(null);
    const toolsBtnLabelRef = useRef<HTMLSpanElement>(null);
    const advancedPanelRef = useRef<HTMLDivElement>(null);
    const toolsPanelRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const historySidebarRef = useRef<HTMLDivElement>(null);
    const historyListRef = useRef<HTMLDivElement>(null);
    const resultImgRef = useRef<HTMLImageElement>(null);
    const canvasControlsRef = useRef<HTMLDivElement>(null);
    const generatedImagesGridRef = useRef<HTMLDivElement>(null);
    const variationsContainerRef = useRef<HTMLDivElement>(null);
    const errorMsgRef = useRef<HTMLDivElement>(null);
    const localProgressWrapRef = useRef<HTMLDivElement>(null);
    const localProgressFillRef = useRef<HTMLDivElement>(null);
    const localProgressPctRef = useRef<HTMLSpanElement>(null);
    const generateBtnRef = useRef<HTMLButtonElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const promptWrapperRef = useRef<HTMLDivElement>(null);
    const sendToDropdownRef = useRef<HTMLDivElement>(null);
    const inpaintingToolsRef = useRef<HTMLDivElement>(null);

    const defaultModel = t2iModels[0];
    const [selectedModel, setSelectedModel] = useState(defaultModel.id);
    const [selectedModelName, setSelectedModelName] = useState(defaultModel.name);
    const [selectedAr, setSelectedAr] = useState(defaultModel.inputs?.aspect_ratio?.default || '1:1');
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
    const [imageMode, setImageMode] = useState(false);
    const [useLocalModel, setUseLocalModel] = useState(false);
    const [selectedLocalModel, setSelectedLocalModel] = useState(LOCAL_MODEL_CATALOG.filter(m => m.type !== 'video')[0]?.id || null);
    const [negativePrompt, setNegativePrompt] = useState('');
    const [guidanceScale, setGuidanceScale] = useState(7.5);
    const [steps, setSteps] = useState(25);
    const [seed, setSeed] = useState(-1);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('None');
    const [batchCount, setBatchCount] = useState(1);
    const [customWidth, setCustomWidth] = useState(0);
    const [customHeight, setCustomHeight] = useState(0);
    const [referenceStrength, setReferenceStrength] = useState(50);
    const [selectedLora, setSelectedLora] = useState('');
    const [loraWeight, setLoraWeight] = useState(1.0);
    const [showToolsPanel, setShowToolsPanel] = useState(false);
    const [generationHistory, setGenerationHistory] = useState<GenerationEntry[]>([]);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [localProgress, setLocalProgress] = useState(0);
    const [localProgressStatus, setLocalProgressStatus] = useState('');
    const [showLocalProgress, setShowLocalProgress] = useState(false);
    const [enhanceSelectedTags, setEnhanceSelectedTags] = useState<Set<string>>(new Set());
    const [basePromptInput, setBasePromptInput] = useState('');
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [dropdownFilter, setDropdownFilter] = useState('');

    const LOCAL_IMAGE_MODELS = LOCAL_MODEL_CATALOG.filter(m => m.type !== 'video');

    const getCurrentModels = () => imageMode ? i2iModels : t2iModels;
    const getCurrentAspectRatios = (id: string) => imageMode ? getAspectRatiosForI2IModel(id) : getAspectRatiosForModel(id);
    const getCurrentResolutions = (id: string) => imageMode ? getResolutionsForI2IModel(id) : getResolutionsForModel(id);
    const getCurrentQualityField = (id: string) => imageMode ? getQualityFieldForI2IModel(id) : getQualityFieldForModel(id);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('muapi_history') || '[]');
            if (saved.length > 0) {
                setGenerationHistory(saved);
                historySidebarRef.current?.classList.remove('translate-x-full', 'opacity-0');
                historySidebarRef.current?.classList.add('translate-x-0', 'opacity-100');
            }
        } catch (e) { }
    }, []);

    useEffect(() => {
        const pending = getPendingJobs('image');
        if (!pending.length) return;

        const apiKey = localStorage.getItem('muapi_key');
        if (!apiKey) return;

        const banner = document.createElement('div');
        banner.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-[#111] border border-white/10 text-white text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3';
        banner.innerHTML = `<span class="animate-spin text-primary">◌</span> <span class="banner-text">Resuming ${pending.length} pending generation${pending.length > 1 ? 's' : ''}…</span>`;
        document.body.appendChild(banner);

        let remaining = pending.length;
        pending.forEach(async (job: PendingJob) => {
            const elapsedAttempts = Math.floor((Date.now() - job.submittedAt) / job.interval);
            const attemptsLeft = Math.max(1, job.maxAttempts - elapsedAttempts);
            try {
                const result = await muapi.pollForResult(job.requestId, apiKey, attemptsLeft, job.interval);
                const url = result.outputs?.[0] || result.url || result.output?.url;
                if (url) {
                    const entry: GenerationEntry = {
                        id: job.requestId,
                        url,
                        ...job.historyMeta,
                        timestamp: new Date().toISOString()
                    };
                    setGenerationHistory(prev => {
                        const updated = [entry, ...prev].slice(0, 50);
                        localStorage.setItem('muapi_history', JSON.stringify(updated));
                        return updated;
                    });
                }
            } catch (e) {
                console.warn('[ImageStudio] Pending job failed on resume:', job.requestId, e.message);
            } finally {
                removePendingJob(job.requestId);
                remaining--;
                if (remaining === 0) banner.remove();
                else banner.querySelector('.banner-text')!.textContent = `Resuming ${remaining} pending generation${remaining > 1 ? 's' : ''}…`;
            }
        });
    }, []);

    const closeDropdown = useCallback(() => {
        setDropdownOpen(null);
    }, []);

    const showDropdown = useCallback((type: string, anchorBtn: HTMLElement) => {
        if (!containerRef.current || !dropdownRef.current) return;

        setDropdownOpen(type);
        dropdownRef.current.innerHTML = '';
        dropdownRef.current.classList.remove('opacity-0', 'pointer-events-none');
        dropdownRef.current.classList.add('opacity-100', 'pointer-events-auto');

        if (type === 'model') {
            dropdownRef.current.classList.add('w-[calc(100vw-3rem)]', 'max-w-xs');
            dropdownRef.current.classList.remove('max-w-[240px]', 'max-w-[200px]');
            dropdownRef.current.innerHTML = `
                <div class="flex flex-col h-full max-h-[70vh]">
                    <div class="px-2 pb-3 mb-2 border-b border-white/5 shrink-0">
                        <div class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 border border-white/5 focus-within:border-primary/50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-muted"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                            <input type="text" id="model-search" placeholder="Search models..." class="bg-transparent border-none text-xs text-white focus:ring-0 w-full p-0">
                        </div>
                    </div>
                    <div class="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 py-2 shrink-0">Available models</div>
                    <div id="model-list-container" class="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1 pb-2"></div>
                </div>
            `;
            const list = dropdownRef.current.querySelector('#model-list-container')!;

            const renderModels = (filter = '') => {
                list.innerHTML = '';

                if (useLocalModel) {
                    const filtered = LOCAL_IMAGE_MODELS.filter(m =>
                        m.name.toLowerCase().includes(filter.toLowerCase()) ||
                        m.id.toLowerCase().includes(filter.toLowerCase())
                    );
                    if (filtered.length === 0) {
                        list.innerHTML = `<div class="text-xs text-muted text-center py-4">No local models match</div>`;
                        return;
                    }
                    filtered.forEach(m => {
                        const item = document.createElement('div');
                        item.className = `flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-white/5 ${selectedLocalModel === m.id ? 'bg-white/5 border-white/5' : ''}`;
                        item.innerHTML = `
                            <div class="flex items-center gap-3.5">
                                <div class="w-10 h-10 ${m.featured ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-400'} border border-white/5 rounded-xl flex items-center justify-center font-black text-sm shadow-inner uppercase">${m.featured ? '⚡' : m.name.charAt(0)}</div>
                                <div class="flex flex-col gap-0.5">
                                    <div class="flex items-center gap-1.5">
                                        <span class="text-xs font-bold text-white tracking-tight">${m.name}</span>
                                        ${m.featured ? '<span class="text-[9px] font-black px-1 py-0.5 rounded bg-primary/20 text-primary">FEATURED</span>' : ''}
                                    </div>
                                    <span class="text-[10px] text-muted">${m.type.toUpperCase()} · ${m.family}</span>
                                </div>
                            </div>
                            ${selectedLocalModel === m.id ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                        `;
                        item.onclick = (e) => {
                            e.stopPropagation();
                            setSelectedLocalModel(m.id);
                            if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = m.name;
                            setSelectedAr(m.aspectRatios[0]);
                            if (arBtnLabelRef.current) arBtnLabelRef.current.textContent = m.aspectRatios[0];
                            if (qualityBtnRef.current) qualityBtnRef.current.style.display = 'none';
                            closeDropdown();
                        };
                        list.appendChild(item);
                    });
                    return;
                }

                const filtered = getCurrentModels().filter(m => m.name.toLowerCase().includes(filter.toLowerCase()) || m.id.toLowerCase().includes(filter.toLowerCase()));

                filtered.forEach(m => {
                    const item = document.createElement('div');
                    item.className = `flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-white/5 ${selectedModel === m.id ? 'bg-white/5 border-white/5' : ''}`;
                    item.innerHTML = `
                        <div class="flex items-center gap-3.5">
                             <div class="w-10 h-10 ${m.family === 'kontext' ? 'bg-blue-500/10 text-blue-400' : m.family === 'effects' ? 'bg-purple-500/10 text-purple-400' : 'bg-primary/10 text-primary'} border border-white/5 rounded-xl flex items-center justify-center font-black text-sm shadow-inner uppercase">${m.name.charAt(0)}</div>
                             <div class="flex flex-col gap-0.5">
                                <span class="text-xs font-bold text-white tracking-tight">${m.name}</span>
                             </div>
                        </div>
                        ${selectedModel === m.id ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    `;
                    item.onclick = (e) => {
                        e.stopPropagation();
                        setSelectedModel(m.id);
                        setSelectedModelName(m.name);
                        const availableArs = getCurrentAspectRatios(m.id);
                        setSelectedAr(availableArs[0]);
                        if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = m.name;
                        if (arBtnLabelRef.current) arBtnLabelRef.current.textContent = availableArs[0];

                        const validResolutions = getCurrentResolutions(m.id);
                        if (qualityBtnRef.current) qualityBtnRef.current.style.display = validResolutions.length > 0 ? 'flex' : 'none';
                        if (validResolutions.length > 0 && qualityBtnLabelRef.current) qualityBtnLabelRef.current.textContent = validResolutions[0];

                        if (imageMode && window.picker) {
                            window.picker.setMaxImages(getMaxImagesForI2IModel(m.id));
                        }

                        closeDropdown();
                    };
                    list.appendChild(item);
                });
            };

            renderModels();

            const searchInput = dropdownRef.current.querySelector('#model-search') as HTMLInputElement;
            searchInput.onclick = (e) => e.stopPropagation();
            searchInput.oninput = (e) => renderModels((e.target as HTMLInputElement).value);

        } else if (type === 'ar') {
            dropdownRef.current.classList.add('max-w-[240px]');
            dropdownRef.current.innerHTML = `<div class="text-[10px] font-bold text-muted uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-2">Aspect Ratio</div>`;
            const list = document.createElement('div');
            list.className = 'flex flex-col gap-1';

            const availableArs = getCurrentAspectRatios(selectedModel);
            availableArs.forEach(r => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group';
                item.setAttribute('data-testid', `ratio-${r.replace(':', '-')}`);
                item.innerHTML = `
                    <div class="flex items-center gap-4">
                        <div class="w-6 h-6 border-2 border-white/20 rounded-md shadow-inner flex items-center justify-center group-hover:border-primary/50 transition-colors">
                             <div class="w-3 h-3 bg-white/10 rounded-sm"></div>
                        </div>
                        <span class="text-xs font-bold text-white opacity-80 group-hover:opacity-100 transition-opacity">${r}</span>
                    </div>
                     ${selectedAr === r ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                `;
                item.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedAr(r);
                    if (arBtnLabelRef.current) arBtnLabelRef.current.textContent = r;
                    closeDropdown();
                };
                list.appendChild(item);
            });
            dropdownRef.current.appendChild(list);
        } else if (type === 'quality') {
            dropdownRef.current.classList.add('max-w-[200px]');
            dropdownRef.current.innerHTML = `<div class="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-2">Resolution</div>`;
            const list = document.createElement('div');
            list.className = 'flex flex-col gap-1';

            const options = getCurrentResolutions(selectedModel);
            const currentQualityLabel = qualityBtnLabelRef.current?.textContent || '';

            options.forEach(opt => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group';
                item.innerHTML = `
                    <span class="text-xs font-bold text-white opacity-80 group-hover:opacity-100">${opt}</span>
                     ${currentQualityLabel === opt ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                `;
                item.onclick = (e) => {
                    e.stopPropagation();
                    if (qualityBtnLabelRef.current) qualityBtnLabelRef.current.textContent = opt;
                    closeDropdown();
                };
                list.appendChild(item);
            });
            dropdownRef.current.appendChild(list);
        }

        const btnRect = anchorBtn.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        if (window.innerWidth < 768) {
            dropdownRef.current.style.left = '50%';
            dropdownRef.current.style.transform = 'translateX(-50%) translate(0, 8px)';
        } else {
            dropdownRef.current.style.left = `${btnRect.left - containerRect.left}px`;
            dropdownRef.current.style.transform = 'translate(0, 8px)';
        }
        dropdownRef.current.style.bottom = `${containerRect.bottom - btnRect.top + 8}px`;
    }, [useLocalModel, selectedModel, selectedAr, selectedLocalModel, imageMode, closeDropdown]);

    const handleModelBtnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (dropdownOpen === 'model') {
            closeDropdown();
        } else {
            const modelBtn = e.currentTarget as HTMLElement;
            showDropdown('model', modelBtn);
        }
    }, [dropdownOpen, closeDropdown, showDropdown]);

    const handleArBtnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (dropdownOpen === 'ar') {
            closeDropdown();
        } else {
            const arBtn = e.currentTarget as HTMLElement;
            showDropdown('ar', arBtn);
        }
    }, [dropdownOpen, closeDropdown, showDropdown]);

    const handleQualityBtnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (dropdownOpen === 'quality') {
            closeDropdown();
        } else {
            const qualityBtn = e.currentTarget as HTMLElement;
            showDropdown('quality', qualityBtn);
        }
    }, [dropdownOpen, closeDropdown, showDropdown]);

    useEffect(() => {
        const handleWindowClick = () => closeDropdown();
        window.addEventListener('click', handleWindowClick);
        return () => window.removeEventListener('click', handleWindowClick);
    }, [closeDropdown]);

    const showImageInCanvas = useCallback((imageUrl: string) => {
        setCurrentImageUrl(imageUrl);

        if (heroRef.current) heroRef.current.classList.add('hidden');
        if (promptWrapperRef.current) promptWrapperRef.current.classList.add('hidden');

        if (resultImgRef.current) {
            resultImgRef.current.src = imageUrl;
        }
        if (canvasControlsRef.current) {
            canvasControlsRef.current.classList.remove('opacity-0');
            canvasControlsRef.current.classList.add('opacity-100');
        }

        if (batchCount > 1 && generatedImagesGridRef.current) {
            generatedImagesGridRef.current.classList.remove('hidden');
            generatedImagesGridRef.current.innerHTML = '';
            for (let i = 0; i < batchCount; i++) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'rounded-lg border border-white/10 object-cover';
                img.setAttribute('data-testid', 'generated-image');
                generatedImagesGridRef.current.appendChild(img);
            }
        } else if (generatedImagesGridRef.current) {
            generatedImagesGridRef.current.classList.add('hidden');
        }
    }, [batchCount]);

    const addToHistory = useCallback((entry: GenerationEntry) => {
        setGenerationHistory(prev => {
            const updated = [entry, ...prev].slice(0, 50);
            localStorage.setItem('muapi_history', JSON.stringify(updated));
            return updated;
        });

        if (historySidebarRef.current) {
            historySidebarRef.current.classList.remove('translate-x-full', 'opacity-0');
            historySidebarRef.current.classList.add('translate-x-0', 'opacity-100');
        }
    }, []);

    const renderHistory = useCallback(() => {
        if (!historyListRef.current) return;
        historyListRef.current.innerHTML = '';

        generationHistory.forEach((entry, idx) => {
            const thumb = document.createElement('div');
            thumb.className = `relative group/thumb cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${idx === 0 ? 'border-primary shadow-glow' : 'border-white/10 hover:border-white/30'}`;

            thumb.innerHTML = `
                <img src="${entry.url}" alt="${entry.prompt?.substring(0, 30) || 'Generated'}" class="w-full aspect-square object-cover">
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button class="hist-download p-1.5 bg-primary rounded-lg text-black hover:scale-110 transition-transform" title="Download">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    </button>
                </div>
            `;

            thumb.onclick = (e) => {
                const target = e.target as HTMLElement;
                if (target.closest('.hist-download')) {
                    downloadImage(entry.url, `muapi-${entry.id || idx}.jpg`);
                    return;
                }
                showImageInCanvas(entry.url);
                if (historyListRef.current) {
                    historyListRef.current.querySelectorAll('div').forEach(t => {
                        t.classList.remove('border-primary', 'shadow-glow');
                        t.classList.add('border-white/10');
                    });
                }
                thumb.classList.remove('border-white/10');
                thumb.classList.add('border-primary', 'shadow-glow');
            };

            historyListRef.current.appendChild(thumb);
        });
    }, [generationHistory, showImageInCanvas]);

    useEffect(() => {
        renderHistory();
    }, [generationHistory, renderHistory]);

    const downloadImage = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    const showVariations = (imageUrl: string) => {
        if (!variationsContainerRef.current) return;
        variationsContainerRef.current.classList.remove('hidden');
        variationsContainerRef.current.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'w-24 h-24 rounded-lg border border-white/10 object-cover';
            img.setAttribute('data-testid', 'variation-image');
            variationsContainerRef.current.appendChild(img);
        }
    };

    const handleGenerate = async () => {
        const prompt = textareaRef.current?.value.trim() || '';

        if (imageMode && uploadedImageUrls.length === 0) {
            return;
        }
        if (!imageMode && !prompt) {
            return;
        }

        if (useLocalModel) {
            const lm = getLocalModelById(selectedLocalModel);
            if (!lm) return;

            if (heroRef.current) heroRef.current.classList.add('opacity-0', 'scale-95', '-translate-y-10', 'pointer-events-none');
            if (generateBtnRef.current) {
                generateBtnRef.current.disabled = true;
                generateBtnRef.current.innerHTML = `<span class="animate-spin inline-block mr-2 text-black">◌</span> Generating...`;
            }
            setShowLocalProgress(true);

            const unsub = localAI.onProgress(({ progress, status }) => {
                const pct = Math.round((progress ?? 0) * 100);
                if (localProgressFillRef.current) localProgressFillRef.current.style.width = `${pct}%`;
                if (localProgressPctRef.current) localProgressPctRef.current.textContent = status === 'starting' ? 'Starting...' : `${pct}%`;
                if (generateBtnRef.current) generateBtnRef.current.innerHTML = `<span class="animate-spin inline-block mr-2 text-black">◌</span> ${status === 'starting' ? '...' : pct + '%'}`;
            });

            let hadError = false;
            try {
                const res = await localAI.generate({
                    model: selectedLocalModel,
                    prompt,
                    negative_prompt: negativePrompt || undefined,
                    aspect_ratio: selectedAr,
                    steps,
                    guidance_scale: guidanceScale,
                    seed,
                });
                unsub();
                setShowLocalProgress(false);

                if (!res?.url) throw new Error('No output returned from local generation');
                if (res.mediaType === 'video') {
                    throw new Error('This model produces video — use the Video studio instead.');
                }
                const entry: GenerationEntry = {
                    id: Date.now().toString(),
                    url: res.url,
                    prompt,
                    model: `local:${selectedLocalModel}`,
                    aspect_ratio: selectedAr,
                    seed: res.seed,
                    timestamp: new Date().toISOString()
                };
                addToHistory(entry);
                showImageInCanvas(res.url);
            } catch (e: any) {
                hadError = true;
                unsub();
                setShowLocalProgress(false);
                if (heroRef.current) heroRef.current.classList.remove('opacity-0', 'scale-95', '-translate-y-10', 'pointer-events-none');
                if (generateBtnRef.current) generateBtnRef.current.innerHTML = `Error: ${e.message.slice(0, 120)}`;
                setErrorMessage(e.message);
                setShowError(true);
                setTimeout(() => {
                    if (generateBtnRef.current) generateBtnRef.current.innerHTML = `Generate ✨`;
                    setShowError(false);
                }, 6000);
            }
            return;
        }

        const apiKey = localStorage.getItem('muapi_key');
        if (!apiKey) {
            AuthModal(() => handleGenerate());
            return;
        }

        if (heroRef.current) heroRef.current.classList.add('opacity-0', 'scale-95', '-translate-y-10', 'pointer-events-none');
        if (generateBtnRef.current) {
            generateBtnRef.current.disabled = true;
            generateBtnRef.current.innerHTML = `<span class="animate-spin inline-block mr-2 text-black">◌</span> Generating...`;
        }

        let hadError = false;
        let capturedRequestId: string | null = null;
        const historyMeta: GenerationEntry = { id: '', url: '', prompt, model: selectedModel, aspect_ratio: selectedAr, timestamp: new Date().toISOString() };

        try {
            let res;
            const qualityLabel = qualityBtnLabelRef.current?.textContent;
            if (imageMode) {
                const genParams: any = {
                    model: selectedModel,
                    images_list: uploadedImageUrls,
                    image_url: uploadedImageUrls[0],
                    aspect_ratio: selectedAr,
                    onRequestId: (rid: string) => {
                        capturedRequestId = rid;
                        savePendingJob({ requestId: rid, studioType: 'image', historyMeta, maxAttempts: 60, interval: 2000, submittedAt: Date.now() });
                    }
                };
                if (prompt) genParams.prompt = prompt;
                const qualityField = getCurrentQualityField(selectedModel);
                if (qualityField && qualityLabel) genParams[qualityField] = qualityLabel;
                res = await muapi.generateI2I(genParams);
            } else {
                const genParams: any = {
                    model: selectedModel,
                    prompt,
                    aspect_ratio: selectedAr,
                    onRequestId: (rid: string) => {
                        capturedRequestId = rid;
                        savePendingJob({ requestId: rid, studioType: 'image', historyMeta, maxAttempts: 60, interval: 2000, submittedAt: Date.now() });
                    }
                };
                const qualityField = getCurrentQualityField(selectedModel);
                if (qualityField && qualityLabel) genParams[qualityField] = qualityLabel;
                res = await muapi.generateImage(genParams);
            }

            if (res && res.url) {
                if (capturedRequestId) removePendingJob(capturedRequestId);
                const entry: GenerationEntry = {
                    id: res.id || capturedRequestId || Date.now().toString(),
                    url: res.url,
                    prompt,
                    model: selectedModel,
                    aspect_ratio: selectedAr,
                    timestamp: new Date().toISOString()
                };
                addToHistory(entry);
                showImageInCanvas(res.url);
            } else {
                throw new Error('No image URL returned by API');
            }
        } catch (e: any) {
            hadError = true;
            if (capturedRequestId) removePendingJob(capturedRequestId);
            if (heroRef.current) heroRef.current.classList.remove('opacity-0', 'scale-95', '-translate-y-10', 'pointer-events-none');
            if (generateBtnRef.current) generateBtnRef.current.innerHTML = `Error: ${e.message.slice(0, 60)}`;
            setErrorMessage(e.message);
            setShowError(true);
            setTimeout(() => {
                if (generateBtnRef.current) generateBtnRef.current.innerHTML = `Generate ✨`;
                setShowError(false);
            }, 4000);
        }
    };

    const handleRegenerate = () => {
        if (generateBtnRef.current) generateBtnRef.current.click();
    };

    const handleDownload = () => {
        if (resultImgRef.current?.src) {
            const entry = generationHistory.find(e => e.url === resultImgRef.current?.src);
            downloadImage(resultImgRef.current.src, `muapi-${entry?.id || 'image'}.jpg`);
        }
    };

    const handleNewPrompt = () => {
        if (canvasControlsRef.current) {
            canvasControlsRef.current.classList.add('opacity-0');
            canvasControlsRef.current.classList.remove('opacity-100');
        }
        if (heroRef.current) heroRef.current.classList.remove('hidden', 'opacity-0', 'scale-95', '-translate-y-10', 'pointer-events-none');
        if (promptWrapperRef.current) promptWrapperRef.current.classList.remove('hidden', 'opacity-40');
        if (textareaRef.current) textareaRef.current.value = '';
        if (window.picker) window.picker.reset();
        setUploadedImageUrls([]);
        setImageMode(false);
        setSelectedModel(t2iModels[0].id);
        setSelectedModelName(t2iModels[0].name);
        setSelectedAr(getAspectRatiosForModel(t2iModels[0].id)[0]);
        if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = t2iModels[0].name;
        if (arBtnLabelRef.current) arBtnLabelRef.current.textContent = getAspectRatiosForModel(t2iModels[0].id)[0];
        const resetResolutions = getResolutionsForModel(t2iModels[0].id);
        if (qualityBtnRef.current) qualityBtnRef.current.style.display = resetResolutions.length > 0 ? 'flex' : 'none';
        if (resetResolutions.length > 0 && qualityBtnLabelRef.current) qualityBtnLabelRef.current.textContent = resetResolutions[0];
        if (textareaRef.current) textareaRef.current.placeholder = 'Describe the image you want to create';
        if (textareaRef.current) textareaRef.current.focus();
    };

    const handleSendTo = (target: string) => {
        if (resultImgRef.current?.src && textareaRef.current) {
            const payload = createHandoffPayload(
                `img_${Date.now()}`,
                'image',
                'image-studio',
                textareaRef.current.value || 'Generated image',
                resultImgRef.current.src,
                resultImgRef.current.src,
                { model: selectedModel, aspectRatio: selectedAr }
            );
            sendToHandoff(target, payload);
            if (sendToDropdownRef.current) sendToDropdownRef.current.classList.add('hidden');
        }
    };

    const handleLocalCancel = () => {
        localAI.cancelGeneration();
        setShowLocalProgress(false);
        if (generateBtnRef.current) {
            generateBtnRef.current.disabled = false;
            generateBtnRef.current.innerHTML = `Generate ✨`;
        }
    };

    const updateEnhancedPrompt = () => {
        const base = basePromptInput.trim();
        const tags = Array.from(enhanceSelectedTags).join(', ');
        const enhanced = [base, tags].filter(p => p).join(', ');
        setEnhancedPrompt(enhanced || 'Your enhanced prompt will appear here...');
    };

    const copyEnhancedPrompt = () => {
        if (enhancedPrompt && enhancedPrompt !== 'Your enhanced prompt will appear here...') {
            navigator.clipboard.writeText(enhancedPrompt);
            const btn = document.getElementById('copy-enhanced-btn');
            if (btn) {
                btn.textContent = 'Copied!';
                setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
            }
        }
    };

    const useEnhancedPrompt = () => {
        if (enhancedPrompt && enhancedPrompt !== 'Your enhanced prompt will appear here...' && textareaRef.current) {
            textareaRef.current.value = enhancedPrompt;
            textareaRef.current.style.height = 'auto';
            const maxHeight = window.innerWidth < 768 ? 150 : 250;
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
            setShowToolsPanel(false);
            if (toolsPanelRef.current) toolsPanelRef.current.classList.add('hidden');
        }
    };

    const handleQuickStarter = (prompt: string) => {
        if (textareaRef.current) {
            textareaRef.current.value = prompt;
            textareaRef.current.style.height = 'auto';
            const maxHeight = window.innerWidth < 768 ? 150 : 250;
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
        }
        setShowToolsPanel(false);
        if (toolsPanelRef.current) toolsPanelRef.current.classList.add('hidden');
    };

    const toggleAdvanced = () => {
        setShowAdvanced(!showAdvanced);
        if (advancedPanelRef.current) {
            advancedPanelRef.current.classList.toggle('hidden', !showAdvanced);
        }
        if (advancedBtnLabelRef.current) {
            advancedBtnLabelRef.current.textContent = showAdvanced ? 'Less' : 'Advanced';
        }
    };

    const toggleTools = () => {
        setShowToolsPanel(!showToolsPanel);
        if (toolsPanelRef.current) {
            toolsPanelRef.current.classList.toggle('hidden', !showToolsPanel);
        }
        if (!showAdvanced && toolsPanelRef.current) {
            setShowAdvanced(true);
            advancedPanelRef.current?.classList.remove('hidden');
        }
        if (toolsBtnLabelRef.current) {
            toolsBtnLabelRef.current.textContent = showToolsPanel ? 'Tools' : 'Tools';
        }
    };

    const handleStylePreset = (style: string) => {
        setSelectedStyle(style);
    };

    const handleRandomizeSeed = () => {
        const newSeed = Math.floor(Math.random() * 999999999);
        setSeed(newSeed);
    };

    const handleTagToggle = (tag: string) => {
        setEnhanceSelectedTags(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tag)) {
                newSet.delete(tag);
            } else {
                newSet.add(tag);
            }
            return newSet;
        });
    };

    const handleImageUploadSelect = ({ url, urls }: { url: string; urls: string[] }) => {
        setUploadedImageUrls(urls || [url]);
        if (!imageMode) {
            setImageMode(true);
            setSelectedModel(i2iModels[0].id);
            setSelectedModelName(i2iModels[0].name);
            setSelectedAr(getAspectRatiosForI2IModel(i2iModels[0].id)[0]);
            if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = i2iModels[0].name;
            if (arBtnLabelRef.current) arBtnLabelRef.current.textContent = getAspectRatiosForI2IModel(i2iModels[0].id)[0];
            const validResolutions = getResolutionsForI2IModel(i2iModels[0].id);
            if (qualityBtnRef.current) qualityBtnRef.current.style.display = validResolutions.length > 0 ? 'flex' : 'none';
            if (validResolutions.length > 0 && qualityBtnLabelRef.current) qualityBtnLabelRef.current.textContent = validResolutions[0];
            if (window.picker) window.picker.setMaxImages(getMaxImagesForI2IModel(i2iModels[0].id));
        }
        if (textareaRef.current) {
            textareaRef.current.placeholder = uploadedImageUrls.length > 1
                ? `${(urls || [url]).length} images selected — describe the transformation (optional)`
                : 'Describe how to transform this image (optional)';
        }
    };

    const handleImageUploadClear = () => {
        setUploadedImageUrls([]);
        setImageMode(false);
        setSelectedModel(t2iModels[0].id);
        setSelectedModelName(t2iModels[0].name);
        setSelectedAr(getAspectRatiosForModel(t2iModels[0].id)[0]);
        if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = t2iModels[0].name;
        if (arBtnLabelRef.current) arBtnLabelRef.current.textContent = getAspectRatiosForModel(t2iModels[0].id)[0];
        const t2iResolutions = getResolutionsForModel(t2iModels[0].id);
        if (qualityBtnRef.current) qualityBtnRef.current.style.display = t2iResolutions.length > 0 ? 'flex' : 'none';
        if (t2iResolutions.length > 0 && qualityBtnLabelRef.current) qualityBtnLabelRef.current.textContent = t2iResolutions[0];
        if (window.picker) window.picker.setMaxImages(1);
        if (textareaRef.current) textareaRef.current.placeholder = 'Describe the image you want to create';
    };

    const initResolutions = getResolutionsForModel(defaultModel.id);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col items-center overflow-hidden bg-app-bg relative p-4 md:p-6"
            data-testid="image-studio"
        >
            {/* Hero Section */}
            <div
                ref={heroRef}
                className="flex flex-col items-center mb-10 md:mb-20 animate-fade-in-up transition-all duration-700"
            >
                <div className="mb-10 relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-1000"></div>
                    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-teal-900/40 rounded-3xl flex items-center justify-center border border-white/5 overflow-hidden">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" className="text-primary opacity-20 absolute -right-4 -bottom-4">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        </svg>
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-glow relative z-10">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" className="text-primary">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                        </div>
                        <div className="absolute top-4 right-4 text-primary animate-pulse">✨</div>
                    </div>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-7xl font-black text-white tracking-widest uppercase mb-4 selection:bg-primary selection:text-black text-center px-4">Image Studio</h1>
                <p className="text-secondary text-sm font-medium tracking-wide opacity-60">Transform images with AI — upscale, stylize, animate and more</p>
            </div>

            {/* Prompt Bar */}
            <div
                ref={promptWrapperRef}
                className="w-full max-w-4xl relative z-40 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
            >
                <div className="w-full bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-5 flex flex-col gap-3 md:gap-5 shadow-3xl">
                    {/* Top Row */}
                    <div className="flex items-start gap-5 px-2">
                        {/* Upload Picker Button */}
                        <button
                            id="upload-picker-btn"
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="text-secondary">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                            </svg>
                            <span className="text-xs font-bold text-white">Upload</span>
                        </button>

                        <textarea
                            ref={textareaRef}
                            placeholder="Describe the image you want to create"
                            className="flex-1 bg-transparent border-none text-white text-base md:text-xl placeholder:text-muted focus:outline-none resize-none pt-2.5 leading-relaxed min-h-[40px] max-h-[150px] md:max-h-[250px] overflow-y-auto custom-scrollbar"
                            rows={1}
                            data-testid="prompt-input"
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                const maxHeight = window.innerWidth < 768 ? 150 : 250;
                                target.style.height = Math.min(target.scrollHeight, maxHeight) + 'px';
                            }}
                        />
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-2 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5 md:gap-2.5 relative overflow-x-auto no-scrollbar pb-1 md:pb-0">
                            {/* Local / API Toggle */}
                            {isLocalAIAvailable() && (
                                <button
                                    id="local-toggle-btn"
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all border text-xs font-bold whitespace-nowrap ${useLocalModel ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}
                                    onClick={() => {
                                        setUseLocalModel(!useLocalModel);
                                        if (!useLocalModel && modelBtnLabelRef.current) {
                                            const lm = getLocalModelById(selectedLocalModel);
                                            if (lm) modelBtnLabelRef.current.textContent = lm.name;
                                        } else {
                                            if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = selectedModelName;
                                        }
                                    }}
                                >
                                    {useLocalModel ? '⚡ Local' : '☁ API'}
                                </button>
                            )}

                            {/* Model Button */}
                            <button
                                id="model-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Select AI generation model"
                                onClick={handleModelBtnClick}
                            >
                                <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center shadow-lg shadow-primary/20">
                                    <span className="text-[10px] font-black text-black">G</span>
                                </div>
                                <span id="model-btn-label" ref={modelBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">{selectedModelName}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* AR Button */}
                            <button
                                id="ar-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Change aspect ratio"
                                data-testid="aspect-ratio-select"
                                onClick={handleArBtnClick}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                                <span id="ar-btn-label" ref={arBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">{selectedAr}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* Quality Button */}
                            <button
                                id="quality-btn"
                                ref={qualityBtnRef}
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Set output quality"
                                style={{ display: initResolutions.length > 0 ? 'flex' : 'none' }}
                                onClick={handleQualityBtnClick}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><path d="M6 2L3 6v15a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/></svg>
                                <span id="quality-btn-label" ref={qualityBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">{initResolutions[0] || '720p'}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* Style Button */}
                            <button
                                id="style-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Select style preset"
                                data-testid="style-select"
                                onClick={toggleAdvanced}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                                <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">{selectedStyle}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* Tools Button */}
                            <button
                                id="tools-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Quick starters & prompt enhancer"
                                onClick={toggleTools}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
                                <span id="tools-btn-label" ref={toolsBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">Tools</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* Advanced Button */}
                            <button
                                id="advanced-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Show advanced options"
                                data-testid="advanced-settings-btn"
                                onClick={toggleAdvanced}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 001.82-.33 1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-1.82.33A1.65 1.65 0 0019.4 9a1.65 1.65 0 00-1.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                                <span id="advanced-btn-label" ref={advancedBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">Advanced</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>
                        </div>

                        <button
                            ref={generateBtnRef}
                            id="generate-btn"
                            className="bg-primary text-black px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-[1.5rem] font-black text-sm md:text-base hover:shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto shadow-lg"
                            data-tooltip="Generate AI image from prompt"
                            data-testid="generate-btn"
                            onClick={handleGenerate}
                        >
                            Generate ✨
                        </button>
                    </div>
                </div>
            </div>

            {/* Inline Instructions */}
            <div className="w-full max-w-4xl text-center text-white/30 text-sm flex flex-col items-center gap-2 py-2 mt-8">
                <p>🖼️ Enter a prompt above and click <span className="text-primary font-semibold">Generate</span> to create your image.</p>
                <p className="text-xs text-white/20">Tip: Be descriptive — include style, lighting, mood, and subject for best results.</p>
            </div>

            {/* Local Progress */}
            <div
                ref={localProgressWrapRef}
                id="local-progress-wrap"
                className={`w-full max-w-4xl mt-4 ${showLocalProgress ? 'flex' : 'hidden'} flex-col gap-2`}
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/60">Generating locally...</span>
                    <span id="local-progress-pct" ref={localProgressPctRef} className="text-xs font-bold text-primary">{localProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div id="local-progress-fill" ref={localProgressFillRef} className="h-full bg-primary transition-all duration-200" style={{ width: `${localProgress}%` }}></div>
                </div>
                <div className="flex justify-center items-center">
                    <button id="local-cancel-btn" className="text-xs text-red-400 hover:text-red-300 transition-colors" onClick={handleLocalCancel}>Cancel</button>
                </div>
            </div>

            {/* Tools Panel */}
            <div
                ref={toolsPanelRef}
                id="tools-panel"
                className={`w-full max-w-4xl mt-6 animate-fade-in-up ${showToolsPanel ? '' : 'hidden'}`}
            >
                <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <h3 className="text-sm font-bold text-white">Quick Tools</h3>
                        <button id="close-tools-btn" className="text-white/40 hover:text-white transition-colors" onClick={toggleTools}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Quick Starters */}
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Quick Starters</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {QUICK_PROMPTS.map(q => (
                                    <button
                                        key={q.prompt}
                                        className="quick-starter-btn px-3 py-2 rounded-lg text-xs font-bold bg-white/5 text-secondary hover:bg-white/10 hover:text-primary transition-all text-left border border-white/5 hover:border-primary/30"
                                        data-prompt={q.prompt}
                                        onClick={() => handleQuickStarter(q.prompt)}
                                    >
                                        {q.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prompt Enhancer */}
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Prompt Enhancer</h4>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    id="base-prompt-input"
                                    placeholder="Enter base prompt..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                                    value={basePromptInput}
                                    onChange={(e) => {
                                        setBasePromptInput(e.target.value);
                                        setTimeout(updateEnhancedPrompt, 0);
                                    }}
                                />

                                <div>
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 block">Enhancement Tags</label>
                                    <div id="enhance-tags-area" className="flex flex-wrap gap-1.5">
                                        {Object.entries(ENHANCE_TAGS).map(([category, tags]) =>
                                            tags.map(tag => (
                                                <button
                                                    key={tag}
                                                    className={`enhance-tag-btn px-2 py-1 rounded-full text-[10px] font-bold transition-all ${enhanceSelectedTags.has(tag) ? 'bg-primary text-black' : 'bg-white/5 text-secondary hover:bg-white/10'}`}
                                                    data-tag={tag}
                                                    onClick={() => {
                                                        handleTagToggle(tag);
                                                        setTimeout(updateEnhancedPrompt, 0);
                                                    }}
                                                >
                                                    {tag}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Enhanced Prompt</label>
                                    <div id="enhanced-prompt-display" className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs min-h-[40px] ${!enhancedPrompt ? 'text-muted' : ''}`}>
                                        {enhancedPrompt || 'Your enhanced prompt will appear here...'}
                                    </div>
                                    <div className="flex gap-2">
                                        <button id="copy-enhanced-btn" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-secondary hover:bg-white/10 transition-all" onClick={copyEnhancedPrompt}>
                                            Copy
                                        </button>
                                        <button id="use-enhanced-btn" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-black hover:shadow-glow transition-all" onClick={useEnhancedPrompt}>
                                            Use in Generator
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Panel */}
            <div
                ref={advancedPanelRef}
                id="advanced-panel"
                className={`w-full max-w-4xl mt-6 animate-fade-in-up ${showAdvanced ? '' : 'hidden'}`}
                data-testid="advanced-panel"
            >
                <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <h3 className="text-sm font-bold text-white">Advanced Options</h3>
                        <button id="close-adv-btn" className="text-white/40 hover:text-white transition-colors" onClick={toggleAdvanced}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>

                    {/* Style Presets */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">Style Preset</label>
                        <div className="flex gap-2 flex-wrap">
                            {STYLE_PRESETS.map(s => (
                                <button
                                    key={s}
                                    className={`style-preset-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedStyle === s ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-secondary hover:bg-white/10'}`}
                                    data-style={s}
                                    data-testid={`style-${s.toLowerCase().replace(/\s+/g, '-')}${s === 'Photorealistic' ? ' style-realistic' : ''}`}
                                    onClick={() => handleStylePreset(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Negative Prompt */}
                    <div className="flex flex-col gap-2" id="negative-prompt-section">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Negative Prompt</label>
                            <button id="negative-prompt-toggle" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors" data-testid="negative-prompt-toggle">Show</button>
                        </div>
                        <input
                            type="text"
                            id="negative-prompt-input"
                            placeholder="What to exclude from the image (e.g., blurry, distorted, watermark)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                            data-testid="negative-prompt-input"
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                        />
                    </div>

                    {/* Guidance Scale & Steps */}
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-secondary uppercase tracking-wider">Guidance Scale</label>
                                <span id="guidance-value" className="text-xs font-bold text-primary">{guidanceScale}</span>
                            </div>
                            <input
                                type="range"
                                id="guidance-slider"
                                min="1"
                                max="20"
                                step="0.5"
                                value={guidanceScale}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                data-testid="guidance-scale-input"
                                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-secondary uppercase tracking-wider">Steps</label>
                                <span id="steps-value" className="text-xs font-bold text-primary">{steps}</span>
                            </div>
                            <input
                                type="range"
                                id="steps-slider"
                                min="1"
                                max="50"
                                step="1"
                                value={steps}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                onChange={(e) => setSteps(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Seed */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Seed</label>
                            <button id="randomize-seed-btn" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors" onClick={handleRandomizeSeed}>Randomize</button>
                        </div>
                        <input
                            type="number"
                            id="seed-input"
                            placeholder="-1 for random"
                            value={seed}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                            data-testid="seed-input"
                            onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                        />
                    </div>

                    {/* Batch Count */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Batch Count</label>
                            <span id="batch-value" className="text-xs font-bold text-primary">{batchCount}</span>
                        </div>
                        <input
                            type="range"
                            id="batch-slider"
                            min="1"
                            max="4"
                            step="1"
                            value={batchCount}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            data-testid="batch-count-input"
                            onChange={(e) => setBatchCount(parseInt(e.target.value))}
                        />
                    </div>

                    {/* Width & Height */}
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[120px] flex flex-col gap-2">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Width</label>
                            <input
                                type="number"
                                id="width-input"
                                placeholder="Auto"
                                value={customWidth || ''}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                                onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="flex-1 min-w-[120px] flex flex-col gap-2">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Height</label>
                            <input
                                type="number"
                                id="height-input"
                                placeholder="Auto"
                                value={customHeight || ''}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                                onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    {/* Reference Strength */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Reference Strength</label>
                            <span id="reference-strength-value" className="text-xs font-bold text-primary">{referenceStrength}%</span>
                        </div>
                        <input
                            type="range"
                            id="reference-strength-slider"
                            min="0"
                            max="100"
                            step="5"
                            value={referenceStrength}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            onChange={(e) => setReferenceStrength(parseInt(e.target.value))}
                        />
                        <p className="text-xs text-muted">How much to preserve the reference image characteristics</p>
                    </div>

                    {/* LoRA Model */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">LoRA Model (Optional)</label>
                        <input
                            type="text"
                            id="lora-input"
                            placeholder="e.g., civitai:1642876@1864626"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                            value={selectedLora}
                            onChange={(e) => setSelectedLora(e.target.value.trim())}
                        />
                        <div className="flex items-center gap-2 mt-1">
                            <label className="text-xs font-bold text-secondary">LoRA Weight:</label>
                            <input
                                type="number"
                                id="lora-weight-input"
                                value={loraWeight}
                                min="0"
                                max="4"
                                step="0.1"
                                className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                onChange={(e) => setLoraWeight(parseFloat(e.target.value) || 1.0)}
                            />
                        </div>
                        <p className="text-xs text-muted">Enter a LoRA model ID from Civitai (format: civitai:id@version)</p>
                    </div>
                </div>
            </div>

            {/* Dropdown */}
            <div
                ref={dropdownRef}
                className="absolute bottom-[102%] left-2 z-50 transition-all opacity-0 pointer-events-none scale-95 origin-bottom-left glass rounded-3xl p-3 translate-y-2 max-w-xs shadow-4xl border border-white/10 flex flex-col"
            />

            {/* History Sidebar */}
            <div
                ref={historySidebarRef}
                id="history-sidebar"
                className="fixed right-0 top-0 h-full w-20 md:w-24 bg-black/60 backdrop-blur-xl border-l border-white/5 z-50 flex flex-col items-center py-4 gap-3 overflow-y-auto transition-all duration-500 translate-x-full opacity-0"
            >
                <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-2 rotate-0">History</div>
                <div ref={historyListRef} className="flex flex-col gap-2 w-full px-2" />
            </div>

            {/* Canvas */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 min-[800px]:p-16 z-10 opacity-0 pointer-events-none transition-all duration-1000 translate-y-10 scale-95">
                <div className="relative group">
                    <img
                        ref={resultImgRef}
                        className="max-h-[60vh] max-w-[80vw] rounded-3xl shadow-3xl border border-white/10 interactive-glow object-contain"
                        data-testid="generated-image"
                        alt="Generated"
                    />
                </div>
                <div ref={canvasControlsRef} className="mt-6 flex gap-3 opacity-0 transition-opacity delay-500 duration-500 justify-center" style={{ position: 'relative' }}>
                    <button
                        className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border border-white/5 backdrop-blur-lg text-white"
                        onClick={handleRegenerate}
                    >
                        ↻ Regenerate
                    </button>
                    <button
                        className="bg-primary text-black px-6 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-glow active:scale-95"
                        data-testid="save-image-btn"
                        onClick={handleDownload}
                    >
                        ↓ Download
                    </button>
                    <button
                        className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border border-white/5 backdrop-blur-lg text-white"
                        onClick={handleNewPrompt}
                    >
                        + New
                    </button>
                    <button
                        className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border border-white/5 backdrop-blur-lg text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            sendToDropdownRef.current?.classList.toggle('hidden');
                            sendToDropdownRef.current?.classList.toggle('flex');
                        }}
                    >
                        ↗ Send to
                    </button>
                    <div
                        ref={sendToDropdownRef}
                        className="absolute z-50 hidden flex-col bg-[#1a1a1a] border border-white/10 rounded-xl py-1 shadow-xl min-w-[160px]"
                        style={{ bottom: '100%', right: '0', marginBottom: '8px' }}
                    >
                        {[
                            { label: '📚 Library', target: 'library' },
                            { label: '🎬 Render', target: 'render' },
                            { label: '🎥 Director', target: 'director' },
                            { label: '⏱️ Timeline', target: 'timeline' },
                            { label: '🤖 Video Agent', target: 'videoAgent' },
                        ].map(opt => (
                            <button
                                key={opt.target}
                                className="px-4 py-2.5 text-xs text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                                onClick={() => handleSendTo(opt.target)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button
                        className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border border-white/5 backdrop-blur-lg text-white"
                        data-testid="create-variations-btn"
                        onClick={() => currentImageUrl && showVariations(currentImageUrl)}
                    >
                        ↻ Variations
                    </button>
                    <button
                        className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border border-white/5 backdrop-blur-lg text-white"
                        data-testid="inpainting-mode-btn"
                        onClick={() => inpaintingToolsRef.current?.classList.toggle('hidden')}
                    >
                        ✎ Inpaint
                    </button>
                </div>
            </div>

            {/* Inpainting Tools */}
            <div
                ref={inpaintingToolsRef}
                className="hidden mt-4 p-4 bg-white/5 border border-white/10 rounded-xl"
                data-testid="inpainting-tools"
            >
                <div className="text-xs text-muted text-center">Inpainting tools - Use brush to edit areas</div>
            </div>

            {/* Generated Images Grid */}
            <div
                ref={generatedImagesGridRef}
                className="hidden grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4"
                data-testid="generated-images-grid"
            />

            {/* Variation Images */}
            <div
                ref={variationsContainerRef}
                className="hidden flex gap-2 mt-4 overflow-x-auto"
                data-testid="variation-images"
            />

            {/* Error Message */}
            <div
                ref={errorMsgRef}
                className={`hidden text-red-400 text-sm mt-4 text-center ${showError ? '' : 'hidden'}`}
                data-testid="error-message"
            >
                {errorMessage}
            </div>

            {/* Click outside handler for send dropdown */}
            <div
                className="fixed inset-0 z-0"
                onClick={() => {
                    sendToDropdownRef.current?.classList.add('hidden');
                    sendToDropdownRef.current?.classList.remove('flex');
                }}
            />
        </div>
    );
};

export default ImageStudio;