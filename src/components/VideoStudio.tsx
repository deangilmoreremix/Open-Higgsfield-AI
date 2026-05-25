import React, { useState, useEffect, useRef, useCallback } from 'react';
import { muapi } from '../lib/muapi.js';
import { t2vModels, getAspectRatiosForVideoModel, getDurationsForModel, getResolutionsForVideoModel, i2vModels, getAspectRatiosForI2VModel, getDurationsForI2VModel, getResolutionsForI2VModel, v2vModels, getModesForModel } from '../lib/models.js';
import { AuthModal } from './AuthModal.js';
import { createUploadPicker } from './UploadPicker.js';
import { savePendingJob, removePendingJob, getPendingJobs } from '../lib/pendingJobs.js';
import { localAI, isLocalAIAvailable } from '../lib/localInferenceClient.js';
import { isWan2gpModelId, getLocalModelById, localT2VModels, localI2VModels } from '../lib/localModels.js';
import { sendToHandoff, createHandoffPayload } from '../lib/handoff.ts';

const adaptLocalToVideoEntry = (m: any) => ({
    id: m.id,
    name: m.name,
    provider: 'wan2gp',
    inputs: {
        prompt: { type: 'string', name: 'prompt', title: 'Prompt' },
        aspect_ratio: { type: 'string', name: 'aspect_ratio', enum: m.aspectRatios || ['16:9', '1:1', '9:16'], default: (m.aspectRatios || ['16:9'])[0] },
    },
});

interface GenerationEntry {
    id: string;
    url: string;
    prompt?: string;
    model?: string;
    aspect_ratio?: string;
    duration?: number;
    timestamp: string;
}

const VideoStudio: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const modelBtnLabelRef = useRef<HTMLSpanElement>(null);
    const arBtnLabelRef = useRef<HTMLSpanElement>(null);
    const durationBtnLabelRef = useRef<HTMLSpanElement>(null);
    const resolutionBtnLabelRef = useRef<HTMLSpanElement>(null);
    const qualityBtnLabelRef = useRef<HTMLSpanElement>(null);
    const modeBtnLabelRef = useRef<HTMLSpanElement>(null);
    const effectBtnLabelRef = useRef<HTMLSpanElement>(null);
    const advancedBtnLabelRef = useRef<HTMLSpanElement>(null);
    const advancedPanelRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const historySidebarRef = useRef<HTMLDivElement>(null);
    const historyListRef = useRef<HTMLDivElement>(null);
    const resultVideoRef = useRef<HTMLVideoElement>(null);
    const canvasControlsRef = useRef<HTMLDivElement>(null);
    const sendToDropdownRef = useRef<HTMLDivElement>(null);
    const extendBtnRef = useRef<HTMLButtonElement>(null);
    const generateBtnRef = useRef<HTMLButtonElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const promptWrapperRef = useRef<HTMLDivElement>(null);
    const videoFileInputRef = useRef<HTMLInputElement>(null);
    const extendBannerRef = useRef<HTMLDivElement>(null);

    const localT2V = isLocalAIAvailable() ? localT2VModels.map(adaptLocalToVideoEntry) : [];
    const localI2V = isLocalAIAvailable() ? localI2VModels.map(adaptLocalToVideoEntry) : [];
    const allT2V = [...t2vModels, ...localT2V];
    const allI2V = [...i2vModels, ...localI2V];

    const defaultModel = allT2V[0];

    const [selectedModel, setSelectedModel] = useState(defaultModel.id);
    const [selectedModelName, setSelectedModelName] = useState(defaultModel.name);
    const [selectedAr, setSelectedAr] = useState(defaultModel.inputs?.aspect_ratio?.default || '16:9');
    const [selectedDuration, setSelectedDuration] = useState(defaultModel.inputs?.duration?.default || 5);
    const [selectedResolution, setSelectedResolution] = useState(defaultModel.inputs?.resolution?.default || '');
    const [selectedQuality, setSelectedQuality] = useState(defaultModel.inputs?.quality?.default || '');
    const [selectedMode, setSelectedMode] = useState('');
    const [selectedEffectName, setSelectedEffectName] = useState('');
    const [lastGenerationId, setLastGenerationId] = useState<string | null>(null);
    const [lastGenerationModel, setLastGenerationModel] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [imageMode, setImageMode] = useState(false);
    const [v2vMode, setV2vMode] = useState(false);
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [negativePrompt, setNegativePrompt] = useState('');
    const [seed, setSeed] = useState(-1);
    const [guidanceScale, setGuidanceScale] = useState(7.5);
    const [generationHistory, setGenerationHistory] = useState<GenerationEntry[]>([]);
    const [currentVideoUrl, setCurrentVideoUrl] = useState('');
    const [videoUploadStatus, setVideoUploadStatus] = useState<'icon' | 'spinner' | 'ready'>('icon');
    const [videoFileName, setVideoFileName] = useState('');
    const [wanEffectType, setWanEffectType] = useState('');
    const [showProcessingIndicator, setShowProcessingIndicator] = useState(false);
    const [wanEffectError, setWanEffectError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const getCurrentModels = () => v2vMode ? v2vModels : (imageMode ? allI2V : allT2V);

    const getCurrentAspectRatios = (id: string) => {
        const local = getLocalModelById(id);
        if (local) return local.aspectRatios || ['16:9', '1:1', '9:16'];
        return imageMode ? getAspectRatiosForI2VModel(id) : getAspectRatiosForVideoModel(id);
    };

    const getCurrentDurations = (id: string) => {
        if (getLocalModelById(id)) return [];
        return imageMode ? getDurationsForI2VModel(id) : getDurationsForModel(id);
    };

    const getCurrentResolutions = (id: string) => {
        if (getLocalModelById(id)) return [];
        return imageMode ? getResolutionsForI2VModel(id) : getResolutionsForVideoModel(id);
    };

    const getCurrentModes = (id: string) => getModesForModel(id);
    const getCurrentModel = () => getCurrentModels().find((m: any) => m.id === selectedModel);
    const getQualitiesForModel = (id: string) => {
        const model = getCurrentModels().find((m: any) => m.id === id);
        return model?.inputs?.quality?.enum || [];
    };

    const getEffectNamesForModel = (id: string) => {
        const model = getCurrentModels().find((m: any) => m.id === id);
        return model?.inputs?.name?.enum || [];
    };

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('video_history') || '[]');
            if (saved.length > 0) {
                setGenerationHistory(saved);
                historySidebarRef.current?.classList.remove('translate-x-full', 'opacity-0');
                historySidebarRef.current?.classList.add('translate-x-0', 'opacity-100');
            }
        } catch (e) { }
    }, []);

    useEffect(() => {
        const pending = getPendingJobs('video');
        if (!pending.length) return;

        const apiKey = localStorage.getItem('muapi_key');
        if (!apiKey) return;

        const banner = document.createElement('div');
        banner.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-[#111] border border-white/10 text-white text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3';
        banner.innerHTML = `<span class="animate-spin text-primary">◌</span> <span class="banner-text">Resuming ${pending.length} pending generation${pending.length > 1 ? 's' : ''}…</span>`;
        document.body.appendChild(banner);

        let remaining = pending.length;
        pending.forEach(async (job: any) => {
            const elapsedAttempts = Math.floor((Date.now() - job.submittedAt) / job.interval);
            const attemptsLeft = Math.max(1, job.maxAttempts - elapsedAttempts);
            try {
                const result = await muapi.pollForResult(job.requestId, apiKey, attemptsLeft, job.interval);
                const url = result.outputs?.[0] || result.url || result.output?.url;
                if (url) {
                    const entry: GenerationEntry = { id: job.requestId, url, ...job.historyMeta, timestamp: new Date().toISOString() };
                    setGenerationHistory(prev => {
                        const updated = [entry, ...prev].slice(0, 30);
                        localStorage.setItem('video_history', JSON.stringify(updated));
                        return updated;
                    });
                }
            } catch (e) {
                console.warn('[VideoStudio] Pending job failed on resume:', job.requestId, e.message);
            } finally {
                removePendingJob(job.requestId);
                remaining--;
                if (remaining === 0) banner.remove();
                else banner.querySelector('.banner-text')!.textContent = `Resuming ${remaining} pending generation${remaining > 1 ? 's' : ''}…`;
            }
        });
    }, []);

    const updateControlsForModel = useCallback((modelId: string) => {
        const model = getCurrentModels().find((m: any) => m.id === modelId);

        if (v2vMode) {
            return;
        }

        const availableArs = getCurrentAspectRatios(modelId);
        if (availableArs.length > 0) {
            setSelectedAr(availableArs[0]);
            if (arBtnLabelRef.current) arBtnLabelRef.current.textContent = availableArs[0];
        }

        const durations = getCurrentDurations(modelId);
        if (durations.length > 0) {
            setSelectedDuration(durations[0]);
            if (durationBtnLabelRef.current) durationBtnLabelRef.current.textContent = `${durations[0]}s`;
        }

        const resolutions = getCurrentResolutions(modelId);
        if (resolutions.length > 0) {
            setSelectedResolution(resolutions[0]);
            if (resolutionBtnLabelRef.current) resolutionBtnLabelRef.current.textContent = resolutions[0];
        }

        const qualities = getQualitiesForModel(modelId);
        if (qualities.length > 0) {
            const defaultQuality = model?.inputs?.quality?.default || qualities[0];
            setSelectedQuality(defaultQuality);
            if (qualityBtnLabelRef.current) qualityBtnLabelRef.current.textContent = defaultQuality;
        } else {
            setSelectedQuality('');
        }

        const modes = getCurrentModes(modelId);
        if (modes.length > 0) {
            const defaultMode = model?.inputs?.mode?.default || modes[0];
            setSelectedMode(defaultMode);
            if (modeBtnLabelRef.current) modeBtnLabelRef.current.textContent = defaultMode;
        } else {
            setSelectedMode('');
        }

        const effectNames = getEffectNamesForModel(modelId);
        if (effectNames.length > 0) {
            const defaultEffect = model?.inputs?.name?.default || effectNames[0];
            setSelectedEffectName(defaultEffect);
            if (effectBtnLabelRef.current) effectBtnLabelRef.current.textContent = defaultEffect;
        } else {
            setSelectedEffectName('');
        }
    }, [v2vMode, getCurrentModels, getCurrentAspectRatios, getCurrentDurations, getCurrentResolutions, getQualitiesForModel, getCurrentModes, getEffectNamesForModel]);

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
                            <input type="text" id="v-model-search" placeholder="Search models..." class="bg-transparent border-none text-xs text-white focus:ring-0 w-full p-0">
                        </div>
                    </div>
                    <div class="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 py-2 shrink-0">Video models</div>
                    <div id="v-model-list-container" class="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1 pb-2"></div>
                </div>
            `;
            const list = dropdownRef.current.querySelector('#v-model-list-container')!;

            const makeModelItem = (m: any, isV2V = false) => {
                const item = document.createElement('div');
                item.className = `flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-white/5 ${selectedModel === m.id ? 'bg-white/5 border-white/5' : ''}`;
                const iconColor = isV2V ? 'bg-orange-500/10 text-orange-400' : m.id.includes('kling') ? 'bg-blue-500/10 text-blue-400' : m.id.includes('veo') ? 'bg-purple-500/10 text-purple-400' : m.id.includes('sora') ? 'bg-rose-500/10 text-rose-400' : 'bg-primary/10 text-primary';
                item.innerHTML = `
                    <div class="flex items-center gap-3.5">
                         <div class="w-10 h-10 ${iconColor} border border-white/5 rounded-xl flex items-center justify-center font-black text-sm shadow-inner uppercase">${m.name.charAt(0)}</div>
                         <div class="flex flex-col gap-0.5">
                            <span class="text-xs font-bold text-white tracking-tight">${m.name}</span>
                            ${isV2V ? '<span class="text-[9px] text-orange-400/70">Upload a video to use</span>' : ''}
                         </div>
                    </div>
                    ${selectedModel === m.id ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                `;
                item.onclick = (e) => {
                    e.stopPropagation();
                    if (isV2V) {
                        setV2vMode(true);
                        setImageMode(false);
                        setSelectedModel(m.id);
                        setSelectedModelName(m.name);
                        if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = m.name;
                        updateControlsForModel(m.id);
                        if (textareaRef.current) textareaRef.current.placeholder = 'Upload a video using the 🎥 button, then click Generate';
                        textareaRef.current.disabled = true;
                    } else {
                        if (v2vMode) {
                            setV2vMode(false);
                            setUploadedVideoUrl(null);
                            if (textareaRef.current) textareaRef.current.disabled = false;
                        }
                        setSelectedModel(m.id);
                        setSelectedModelName(m.name);
                        if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = m.name;
                        updateControlsForModel(m.id);
                        if (textareaRef.current) textareaRef.current.placeholder = imageMode ? 'Describe the motion or effect (optional)' : 'Describe the video you want to create';
                    }
                    closeDropdown();
                };
                return item;
            };

            const renderModels = (filter = '') => {
                list.innerHTML = '';
                const lf = filter.toLowerCase();

                const generationModels = imageMode ? allI2V : allT2V;
                const filteredMain = generationModels
                    .filter((m: any) => m.name.toLowerCase().includes(lf) || m.id.toLowerCase().includes(lf));
                filteredMain.forEach((m: any) => list.appendChild(makeModelItem(m, false)));

                const filteredV2V = v2vModels.filter((m: any) => m.name.toLowerCase().includes(lf) || m.id.toLowerCase().includes(lf));
                if (filteredV2V.length > 0) {
                    const sectionLabel = document.createElement('div');
                    sectionLabel.className = 'text-[10px] font-bold text-orange-400/70 uppercase tracking-widest px-3 py-2 mt-1 border-t border-white/5';
                    sectionLabel.textContent = 'Video Tools';
                    list.appendChild(sectionLabel);
                    filteredV2V.forEach((m: any) => list.appendChild(makeModelItem(m, true)));
                }
            };

            renderModels();

            const searchInput = dropdownRef.current.querySelector('#v-model-search') as HTMLInputElement;
            searchInput.onclick = (e) => e.stopPropagation();
            searchInput.oninput = (e) => renderModels((e.target as HTMLInputElement).value);

        } else if (type === 'ar') {
            dropdownRef.current.classList.add('max-w-[240px]');
            dropdownRef.current.innerHTML = `<div class="text-[10px] font-bold text-muted uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-2">Aspect Ratio</div>`;
            const list = document.createElement('div');
            list.className = 'flex flex-col gap-1';
            const availableArs = getCurrentAspectRatios(selectedModel);
            availableArs.forEach((r: string) => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group';
                item.setAttribute('data-testid', `video-ratio-${r.replace(':', '-')}`);
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

        } else if (type === 'duration') {
            dropdownRef.current.classList.add('max-w-[200px]');
            dropdownRef.current.innerHTML = `<div class="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-2">Duration</div>`;
            const list = document.createElement('div');
            list.className = 'flex flex-col gap-1';
            const durations = getCurrentDurations(selectedModel);
            durations.forEach((d: number) => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group';
                item.setAttribute('data-testid', `duration-${d}s`);
                item.innerHTML = `
                   <span class="text-xs font-bold text-white opacity-80 group-hover:opacity-100">${d}s</span>
                    ${selectedDuration === d ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                `;
                item.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedDuration(d);
                    if (durationBtnLabelRef.current) durationBtnLabelRef.current.textContent = `${d}s`;
                    closeDropdown();
                };
                list.appendChild(item);
            });
            dropdownRef.current.appendChild(list);

        } else if (type === 'quality') {
            dropdownRef.current.classList.add('max-w-[200px]');
            dropdownRef.current.innerHTML = `<div class="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-2">Quality</div>`;
            const list = document.createElement('div');
            list.className = 'flex flex-col gap-1';
            getQualitiesForModel(selectedModel).forEach((q: string) => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group';
                item.setAttribute('data-testid', `quality-${q.toLowerCase()}`);
                item.innerHTML = `
                   <span class="text-xs font-bold text-white opacity-80 group-hover:opacity-100 capitalize">${q}</span>
                   ${selectedQuality === q ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                `;
                item.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedQuality(q);
                    if (qualityBtnLabelRef.current) qualityBtnLabelRef.current.textContent = q;
                    closeDropdown();
                };
                list.appendChild(item);
            });
            dropdownRef.current.appendChild(list);

        } else if (type === 'resolution') {
            dropdownRef.current.classList.add('max-w-[200px]');
            dropdownRef.current.innerHTML = `<div class="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-2">Resolution</div>`;
            const list = document.createElement('div');
            list.className = 'flex flex-col gap-1';
            const resolutions = getCurrentResolutions(selectedModel);
            resolutions.forEach((r: string) => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group';
                item.innerHTML = `
                   <span class="text-xs font-bold text-white opacity-80 group-hover:opacity-100">${r}</span>
                    ${selectedResolution === r ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                `;
                item.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedResolution(r);
                    if (resolutionBtnLabelRef.current) resolutionBtnLabelRef.current.textContent = r;
                    closeDropdown();
                };
                list.appendChild(item);
            });
            dropdownRef.current.appendChild(list);

        } else if (type === 'mode') {
            dropdownRef.current.classList.add('max-w-[200px]');
            dropdownRef.current.innerHTML = `<div class="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-2">Mode</div>`;
            const list = document.createElement('div');
            list.className = 'flex flex-col gap-1';
            getCurrentModes(selectedModel).forEach((m: string) => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group';
                item.innerHTML = `
                   <span class="text-xs font-bold text-white opacity-80 group-hover:opacity-100 capitalize">${m}</span>
                   ${selectedMode === m ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                `;
                item.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedMode(m);
                    if (modeBtnLabelRef.current) modeBtnLabelRef.current.textContent = m;
                    closeDropdown();
                };
                list.appendChild(item);
            });
            dropdownRef.current.appendChild(list);

        } else if (type === 'effect') {
            dropdownRef.current.classList.add('max-w-[240px]');
            dropdownRef.current.classList.remove('max-w-[200px]');
            dropdownRef.current.innerHTML = `<div class="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-2">Effect Type</div>`;
            const list = document.createElement('div');
            list.className = 'flex flex-col gap-1 max-h-[50vh] overflow-y-auto custom-scrollbar';
            getEffectNamesForModel(selectedModel).forEach((e: string) => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group';
                item.innerHTML = `
                   <span class="text-xs font-bold text-white opacity-80 group-hover:opacity-100">${e}</span>
                   ${selectedEffectName === e ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                `;
                item.onclick = (ev) => {
                    ev.stopPropagation();
                    setSelectedEffectName(e);
                    if (effectBtnLabelRef.current) effectBtnLabelRef.current.textContent = e;
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
    }, [selectedModel, imageMode, v2vMode, getCurrentAspectRatios, getCurrentDurations, getCurrentResolutions, getQualitiesForModel, getCurrentModes, getEffectNamesForModel, closeDropdown]);

    const handleModelBtnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const modelBtn = e.currentTarget as HTMLElement;
        if (dropdownOpen === 'model') {
            closeDropdown();
        } else {
            showDropdown('model', modelBtn);
        }
    }, [dropdownOpen, closeDropdown, showDropdown]);

    const handleArBtnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const arBtn = e.currentTarget as HTMLElement;
        if (dropdownOpen === 'ar') {
            closeDropdown();
        } else {
            showDropdown('ar', arBtn);
        }
    }, [dropdownOpen, closeDropdown, showDropdown]);

    const handleDurationBtnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const durationBtn = e.currentTarget as HTMLElement;
        if (dropdownOpen === 'duration') {
            closeDropdown();
        } else {
            showDropdown('duration', durationBtn);
        }
    }, [dropdownOpen, closeDropdown, showDropdown]);

    const handleResolutionBtnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const resolutionBtn = e.currentTarget as HTMLElement;
        if (dropdownOpen === 'resolution') {
            closeDropdown();
        } else {
            showDropdown('resolution', resolutionBtn);
        }
    }, [dropdownOpen, closeDropdown, showDropdown]);

    const handleQualityBtnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const qualityBtn = e.currentTarget as HTMLElement;
        if (dropdownOpen === 'quality') {
            closeDropdown();
        } else {
            showDropdown('quality', qualityBtn);
        }
    }, [dropdownOpen, closeDropdown, showDropdown]);

    const handleModeBtnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const modeBtn = e.currentTarget as HTMLElement;
        if (dropdownOpen === 'mode') {
            closeDropdown();
        } else {
            showDropdown('mode', modeBtn);
        }
    }, [dropdownOpen, closeDropdown, showDropdown]);

    const handleEffectBtnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const effectBtn = e.currentTarget as HTMLElement;
        if (dropdownOpen === 'effect') {
            closeDropdown();
        } else {
            showDropdown('effect', effectBtn);
        }
    }, [dropdownOpen, closeDropdown, showDropdown]);

    useEffect(() => {
        const handleWindowClick = () => closeDropdown();
        window.addEventListener('click', handleWindowClick);
        return () => window.removeEventListener('click', handleWindowClick);
    }, [closeDropdown]);

    const showVideoInCanvas = useCallback((videoUrl: string, genModel?: string) => {
        setCurrentVideoUrl(videoUrl);

        if (heroRef.current) heroRef.current.classList.add('hidden');
        if (promptWrapperRef.current) promptWrapperRef.current.classList.add('hidden');

        if (resultVideoRef.current) {
            resultVideoRef.current.src = videoUrl;
        }

        const isSeedance2 = genModel && (genModel === 'seedance-v2.0-t2v' || genModel === 'seedance-v2.0-i2v');
        if (extendBtnRef.current) {
            extendBtnRef.current.classList.toggle('hidden', !isSeedance2);
        }
    }, []);

    const addToHistory = useCallback((entry: GenerationEntry) => {
        setGenerationHistory(prev => {
            const updated = [entry, ...prev].slice(0, 30);
            localStorage.setItem('video_history', JSON.stringify(updated));
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
                <video src="${entry.url}" preload="metadata" muted class="w-full aspect-square object-cover"></video>
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button class="hist-download p-1.5 bg-primary rounded-lg text-black hover:scale-110 transition-transform" title="Download">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    </button>
                </div>
            `;

            thumb.onclick = (e) => {
                const target = e.target as HTMLElement;
                if (target.closest('.hist-download')) {
                    downloadFile(entry.url, `video-${entry.id || idx}.mp4`);
                    return;
                }
                if (entry.model === 'seedance-v2.0-t2v' || entry.model === 'seedance-v2.0-i2v') {
                    setLastGenerationId(entry.id);
                    setLastGenerationModel(entry.model);
                } else {
                    setLastGenerationId(null);
                    setLastGenerationModel(null);
                }
                showVideoInCanvas(entry.url, entry.model);
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
    }, [generationHistory, showVideoInCanvas]);

    useEffect(() => {
        renderHistory();
    }, [generationHistory, renderHistory]);

    const downloadFile = async (url: string, filename: string) => {
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

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const apiKey = localStorage.getItem('muapi_key');
        if (!apiKey) {
            AuthModal(() => videoFileInputRef.current?.click());
            return;
        }

        setVideoUploadStatus('spinner');
        try {
            const url = await muapi.uploadFile(file);
            setUploadedVideoUrl(url);
            setVideoUploadStatus('ready');
            setVideoFileName(file.name);

            if (imageMode) {
                setImageMode(false);
                setUploadedImageUrl(null);
            }
            setV2vMode(true);
            setSelectedModel(v2vModels[0].id);
            setSelectedModelName(v2vModels[0].name);
            if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = v2vModels[0].name;
            updateControlsForModel(v2vModels[0].id);
            if (textareaRef.current) {
                textareaRef.current.placeholder = 'Video ready — click Generate to remove watermark';
                textareaRef.current.disabled = true;
            }
        } catch (err) {
            console.error('[VideoStudio] Video upload failed:', err);
            setVideoUploadStatus('icon');
        }
        if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    };

    const clearVideoUpload = () => {
        setUploadedVideoUrl(null);
        setV2vMode(false);
        setVideoUploadStatus('icon');
        setVideoFileName('');
        setSelectedModel(allT2V[0].id);
        setSelectedModelName(allT2V[0].name);
        if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = allT2V[0].name;
        updateControlsForModel(allT2V[0].id);
        if (textareaRef.current) {
            textareaRef.current.placeholder = 'Describe the video you want to create';
            textareaRef.current.disabled = false;
        }
    };

    const handleImageUploadSelect = ({ url }: { url: string; urls?: string[] }) => {
        setUploadedImageUrl(url);
        if (v2vMode) {
            setUploadedVideoUrl(null);
            setV2vMode(false);
            setVideoUploadStatus('icon');
        }
        if (!imageMode) {
            setImageMode(true);
            setSelectedModel(allI2V[0].id);
            setSelectedModelName(allI2V[0].name);
            if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = allI2V[0].name;
            updateControlsForModel(allI2V[0].id);
        }
        if (textareaRef.current) {
            textareaRef.current.placeholder = 'Describe the motion or effect (optional)';
            textareaRef.current.disabled = false;
        }
    };

    const handleImageUploadClear = () => {
        setUploadedImageUrl(null);
        setImageMode(false);
        setSelectedModel(allT2V[0].id);
        setSelectedModelName(allT2V[0].name);
        if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = allT2V[0].name;
        updateControlsForModel(allT2V[0].id);
        if (textareaRef.current) {
            textareaRef.current.placeholder = 'Describe the video you want to create';
            textareaRef.current.disabled = false;
        }
    };

    const applySelectedWanEffect = async () => {
        if (!wanEffectType) return;

        const currentVideo = resultVideoRef.current?.src;
        if (!currentVideo) return;

        if (generateBtnRef.current) {
            generateBtnRef.current.disabled = true;
            generateBtnRef.current.textContent = 'Applying Effect...';
        }

        setShowProcessingIndicator(true);

        try {
            const result = await muapi.applyWanAIEffect(currentVideo, wanEffectType, {
                prompt: `Apply ${wanEffectType} style transformation`
            });

            if (result.success) {
                if (resultVideoRef.current) resultVideoRef.current.src = result.url;
            } else {
                setWanEffectError(result.error || 'Unknown error');
            }
        } catch (error: any) {
            setWanEffectError(error.message);
        } finally {
            if (generateBtnRef.current) {
                generateBtnRef.current.disabled = false;
                generateBtnRef.current.textContent = 'Generate ✨';
            }
            setShowProcessingIndicator(false);
        }
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

    const handleRandomizeSeed = () => {
        setSeed(Math.floor(Math.random() * 999999999));
    };

    const resetToPromptBar = () => {
        if (canvasControlsRef.current) {
            canvasControlsRef.current.classList.add('opacity-0');
            canvasControlsRef.current.classList.remove('opacity-100');
        }
        if (heroRef.current) heroRef.current.classList.remove('hidden', 'opacity-0', 'scale-95', '-translate-y-10', 'pointer-events-none');
        if (promptWrapperRef.current) promptWrapperRef.current.classList.remove('hidden', 'opacity-40');
    };

    const handleNewPrompt = () => {
        resetToPromptBar();
        if (textareaRef.current) textareaRef.current.value = '';
        setUploadedImageUrl(null);
        setImageMode(false);
        setUploadedVideoUrl(null);
        setV2vMode(false);
        setVideoUploadStatus('icon');
        setSelectedModel(allT2V[0].id);
        setSelectedModelName(allT2V[0].name);
        if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = allT2V[0].name;
        updateControlsForModel(allT2V[0].id);
        if (textareaRef.current) {
            textareaRef.current.placeholder = 'Describe the video you want to create';
            textareaRef.current.disabled = false;
            textareaRef.current.focus();
        }
    };

    const handleExtend = () => {
        if (!lastGenerationId) return;
        resetToPromptBar();
        if (textareaRef.current) textareaRef.current.value = '';
        setUploadedImageUrl(null);
        setImageMode(false);
        setSelectedModel('seedance-v2.0-extend');
        setSelectedModelName('Seedance 2.0 Extend');
        if (modelBtnLabelRef.current) modelBtnLabelRef.current.textContent = 'Seedance 2.0 Extend';
        updateControlsForModel('seedance-v2.0-extend');
        if (textareaRef.current) {
            textareaRef.current.placeholder = 'Optional: describe how to continue the video...';
            textareaRef.current.focus();
        }
    };

    const handleRegenerate = () => {
        if (generateBtnRef.current) generateBtnRef.current.click();
    };

    const handleDownload = () => {
        if (resultVideoRef.current?.src) {
            const entry = generationHistory.find(e => e.url === resultVideoRef.current?.src);
            downloadFile(resultVideoRef.current.src, `video-${entry?.id || 'clip'}.mp4`);
        }
    };

    const handleSendTo = (target: string) => {
        if (resultVideoRef.current?.src && textareaRef.current) {
            const payload = createHandoffPayload(
                `vid_${Date.now()}`,
                'video',
                'video-studio',
                textareaRef.current.value || 'Generated video',
                resultVideoRef.current.src,
                null,
                { model: selectedModel, aspectRatio: selectedAr }
            );
            sendToHandoff(target, payload);
            if (sendToDropdownRef.current) {
                sendToDropdownRef.current.classList.add('hidden');
                sendToDropdownRef.current.classList.remove('flex');
            }
        }
    };

    const handleGenerate = async () => {
        const prompt = textareaRef.current?.value.trim() || '';
        const model = getCurrentModel();
        const isExtendMode = (model as any)?.requiresRequestId;

        if (v2vMode && !uploadedVideoUrl) return;
        if (isExtendMode && !lastGenerationId) return;
        if (imageMode && !uploadedImageUrl) return;
        if (!imageMode && !v2vMode && !isExtendMode && !prompt) return;

        const isLocal = isWan2gpModelId(selectedModel);

        if (!isLocal) {
            const apiKey = localStorage.getItem('muapi_key');
            if (!apiKey) {
                AuthModal(() => handleGenerate());
                return;
            }
        }

        if (heroRef.current) heroRef.current.classList.add('opacity-0', 'scale-95', '-translate-y-10', 'pointer-events-none');
        if (generateBtnRef.current) {
            generateBtnRef.current.disabled = true;
            generateBtnRef.current.innerHTML = `<span class="animate-spin inline-block mr-2 text-black">◌</span> Generating...`;
        }

        let unsubscribeProgress: (() => void) | null = null;
        if (isLocal) {
            unsubscribeProgress = localAI.onProgress(({ status, progress }) => {
                const pct = typeof progress === 'number' ? Math.round(progress * 100) : null;
                if (generateBtnRef.current) generateBtnRef.current.innerHTML = `<span class="animate-spin inline-block mr-2 text-black">◌</span> ${status || 'Generating'}${pct != null ? ` ${pct}%` : '…'}`;
            });
        }

        let hadError = false;
        let capturedRequestId: string | null = null;
        const historyMeta: GenerationEntry = { id: '', url: '', prompt, model: selectedModel, aspect_ratio: selectedAr, duration: selectedDuration, timestamp: new Date().toISOString() };

        const onRequestId = (rid: string) => {
            capturedRequestId = rid;
            savePendingJob({ requestId: rid, studioType: 'video', historyMeta, maxAttempts: 900, interval: 2000, submittedAt: Date.now() });
        };

        try {
            if (isLocal) {
                const localParams: any = {
                    model: selectedModel,
                    prompt: prompt || '',
                    aspect_ratio: selectedAr,
                };
                if (imageMode && uploadedImageUrl) localParams.image = uploadedImageUrl;
                const res = await localAI.generate(localParams);
                console.log('[VideoStudio] Local response:', res);
                if (res && res.url) {
                    const genId = Date.now().toString();
                    setLastGenerationId(null);
                    setLastGenerationModel(null);
                    const entry: GenerationEntry = { id: genId, url: res.url, prompt, model: selectedModel, aspect_ratio: selectedAr, timestamp: new Date().toISOString() };
                    addToHistory(entry);
                    showVideoInCanvas(res.url, selectedModel);
                } else {
                    throw new Error('No video URL returned by Wan2GP');
                }
                if (generateBtnRef.current) {
                    generateBtnRef.current.disabled = false;
                    generateBtnRef.current.innerHTML = `Generate ✨`;
                }
                return;
            }

            if (v2vMode) {
                const res = await muapi.processV2V({ model: selectedModel, video_url: uploadedVideoUrl });
                if (res && res.url) {
                    if (capturedRequestId) removePendingJob(capturedRequestId);
                    const genId = res.id || capturedRequestId || Date.now().toString();
                    setLastGenerationId(null);
                    setLastGenerationModel(null);
                    const entry: GenerationEntry = { id: genId, url: res.url, prompt: '', model: selectedModel, timestamp: new Date().toISOString() };
                    addToHistory(entry);
                    showVideoInCanvas(res.url, selectedModel);
                } else {
                    throw new Error('No video URL returned by API');
                }
                if (generateBtnRef.current) {
                    generateBtnRef.current.disabled = false;
                    generateBtnRef.current.innerHTML = `Generate ✨`;
                }
                return;
            }

            if (imageMode) {
                const i2vParams: any = {
                    model: selectedModel,
                    image_url: uploadedImageUrl,
                    onRequestId,
                };
                i2vParams.prompt = prompt || '';
                i2vParams.aspect_ratio = selectedAr;
                const durations = getCurrentDurations(selectedModel);
                if (durations.length > 0) i2vParams.duration = selectedDuration;
                const resolutions = getCurrentResolutions(selectedModel);
                if (resolutions.length > 0) i2vParams.resolution = selectedResolution;
                if (selectedQuality) i2vParams.quality = selectedQuality;
                if (selectedMode) i2vParams.mode = selectedMode;
                if (selectedEffectName) i2vParams.name = selectedEffectName;

                const res = await muapi.generateI2V(i2vParams);

                if (res && res.url) {
                    if (capturedRequestId) removePendingJob(capturedRequestId);
                    const genId = res.id || capturedRequestId || Date.now().toString();
                    if (selectedModel === 'seedance-v2.0-i2v') {
                        setLastGenerationId(genId);
                        setLastGenerationModel(selectedModel);
                    } else {
                        setLastGenerationId(null);
                        setLastGenerationModel(null);
                    }
                    const entry: GenerationEntry = { id: genId, url: res.url, prompt, model: selectedModel, aspect_ratio: selectedAr, duration: selectedDuration, timestamp: new Date().toISOString() };
                    addToHistory(entry);
                    showVideoInCanvas(res.url, selectedModel);
                } else {
                    throw new Error('No video URL returned by API');
                }
                if (generateBtnRef.current) {
                    generateBtnRef.current.disabled = false;
                    generateBtnRef.current.innerHTML = `Generate ✨`;
                }
                return;
            }

            const params: any = { model: selectedModel };
            if (prompt) params.prompt = prompt;

            if (isExtendMode) {
                params.request_id = lastGenerationId;
            } else {
                params.aspect_ratio = selectedAr;
            }

            const durations = getCurrentDurations(selectedModel);
            if (durations.length > 0) params.duration = selectedDuration;

            const resolutions = getCurrentResolutions(selectedModel);
            if (resolutions.length > 0) params.resolution = selectedResolution;

            if (selectedQuality) params.quality = selectedQuality;
            if (selectedMode) params.mode = selectedMode;

            const res = await muapi.generateVideo(params);

            if (res && res.url) {
                if (capturedRequestId) removePendingJob(capturedRequestId);
                const genId = res.id || capturedRequestId || Date.now().toString();
                if (selectedModel === 'seedance-v2.0-t2v' || selectedModel === 'seedance-v2.0-i2v') {
                    setLastGenerationId(genId);
                    setLastGenerationModel(selectedModel);
                } else {
                    setLastGenerationId(null);
                    setLastGenerationModel(null);
                }

                const entry: GenerationEntry = {
                    id: genId,
                    url: res.url,
                    prompt,
                    model: selectedModel,
                    aspect_ratio: selectedAr,
                    duration: selectedDuration,
                    timestamp: new Date().toISOString()
                };
                addToHistory(entry);
                showVideoInCanvas(res.url, selectedModel);
            } else {
                throw new Error('No video URL returned by API');
            }
        } catch (e: any) {
            hadError = true;
            if (capturedRequestId) removePendingJob(capturedRequestId);
            if (heroRef.current) heroRef.current.classList.remove('opacity-0', 'scale-95', '-translate-y-10', 'pointer-events-none');
            if (generateBtnRef.current) generateBtnRef.current.innerHTML = `Error: ${e.message.slice(0, 60)}`;
            setTimeout(() => {
                if (generateBtnRef.current) generateBtnRef.current.innerHTML = `Generate ✨`;
            }, 4000);
        } finally {
            if (generateBtnRef.current) generateBtnRef.current.disabled = false;
            if (typeof unsubscribeProgress === 'function') unsubscribeProgress();
            if (!hadError && generateBtnRef.current) generateBtnRef.current.innerHTML = `Generate ✨`;
        }
    };

    const initDurations = getCurrentDurations(defaultModel.id);
    const initResolutions = getCurrentResolutions(defaultModel.id);
    const initModes = getModesForModel(defaultModel.id);
    const initEffectNames = getEffectNamesForModel(defaultModel.id);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col items-center overflow-hidden bg-app-bg relative p-4 md:p-6"
            data-testid="video-studio"
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
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-glow relative z-10">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" className="text-primary">
                                <polygon points="23 7 16 12 23 17 23 7"/>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                            </svg>
                        </div>
                        <div className="absolute top-4 right-4 text-primary animate-pulse">✨</div>
                    </div>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-7xl font-black text-white tracking-widest uppercase mb-4 selection:bg-primary selection:text-black text-center px-4">Video Studio</h1>
                <p className="text-secondary text-sm font-medium tracking-wide opacity-60">Animate images into stunning AI videos with motion effects</p>
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
                        {/* Image Upload Picker */}
                        <button
                            id="upload-picker-btn"
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="text-secondary">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                            </svg>
                            <span className="text-xs font-bold text-white">Upload</span>
                        </button>

                        {/* Video Upload Button */}
                        <button
                            type="button"
                            title="Upload video to remove watermark"
                            className="w-10 h-10 shrink-0 rounded-xl border transition-all flex items-center justify-center relative overflow-hidden mt-1.5 bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/40 group"
                            onClick={() => {
                                if (uploadedVideoUrl) {
                                    clearVideoUpload();
                                } else {
                                    videoFileInputRef.current?.click();
                                }
                            }}
                        >
                            <input
                                ref={videoFileInputRef}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                data-testid="reference-video-input"
                                onChange={handleVideoUpload}
                            />
                            {videoUploadStatus === 'icon' && (
                                <div className="flex items-center justify-center w-full h-full">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="text-muted group-hover:text-primary transition-colors">
                                        <polygon points="23 7 16 12 23 17 23 7"/>
                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                                    </svg>
                                </div>
                            )}
                            {videoUploadStatus === 'spinner' && (
                                <div className="hidden items-center justify-center w-full h-full">
                                    <span className="animate-spin text-primary text-sm">◌</span>
                                </div>
                            )}
                            {videoUploadStatus === 'ready' && (
                                <div className="hidden items-center justify-center w-full h-full">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="text-primary">
                                        <polygon points="23 7 16 12 23 17 23 7"/>
                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                                        <polyline points="7 10 10 13 15 8" stroke="#d9ff00" stroke-width="2.5"/>
                                    </svg>
                                </div>
                            )}
                        </button>

                        <textarea
                            ref={textareaRef}
                            placeholder="Describe the video you want to create"
                            className="flex-1 bg-transparent border-none text-white text-base md:text-xl placeholder:text-muted focus:outline-none resize-none pt-2.5 leading-relaxed min-h-[40px] max-h-[250px] md:max-h-[250px] overflow-y-auto custom-scrollbar"
                            rows={1}
                            data-testid="video-prompt-input"
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                const maxHeight = window.innerWidth < 768 ? 150 : 250;
                                target.style.height = Math.min(target.scrollHeight, maxHeight) + 'px';
                            }}
                        />
                    </div>

                    {/* Extend Banner */}
                    <div
                        ref={extendBannerRef}
                        className="hidden items-center gap-2 px-4 py-2 mx-2 mt-2 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        <span>Extending previous video generation — add an optional prompt to guide the continuation</span>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-2 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5 md:gap-2.5 relative overflow-x-auto no-scrollbar pb-1 md:pb-0">
                            {/* Model Button */}
                            <button
                                id="v-model-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Select AI video model"
                                onClick={handleModelBtnClick}
                            >
                                <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center shadow-lg shadow-primary/20">
                                    <span className="text-[10px] font-black text-black">V</span>
                                </div>
                                <span id="v-model-btn-label" ref={modelBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">{selectedModelName}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* AR Button */}
                            <button
                                id="v-ar-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Change aspect ratio"
                                data-testid="video-aspect-ratio-select"
                                onClick={handleArBtnClick}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                                <span id="v-ar-btn-label" ref={arBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">{selectedAr}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* Duration Button */}
                            <button
                                id="v-duration-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Set video duration"
                                data-testid="duration-select"
                                style={{ display: initDurations.length > 0 ? 'flex' : 'none' }}
                                onClick={handleDurationBtnClick}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                <span id="v-duration-btn-label" ref={durationBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">{selectedDuration}s</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* Resolution Button */}
                            <button
                                id="v-resolution-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Set output resolution"
                                style={{ display: initResolutions.length > 0 ? 'flex' : 'none' }}
                                onClick={handleResolutionBtnClick}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><path d="M6 2L3 6v15a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/></svg>
                                <span id="v-resolution-btn-label" ref={resolutionBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">{selectedResolution || '720p'}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* Quality Button */}
                            <button
                                id="v-quality-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Set output quality"
                                data-testid="quality-select"
                                style={{ display: 'none' }}
                                onClick={handleQualityBtnClick}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                <span id="v-quality-btn-label" ref={qualityBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">{selectedQuality || 'basic'}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* Mode Button */}
                            <button
                                id="v-mode-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                style={{ display: initModes.length > 0 ? 'flex' : 'none' }}
                                onClick={handleModeBtnClick}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                <span id="v-mode-btn-label" ref={modeBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">{selectedMode || 'normal'}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* Effect Button */}
                            <button
                                id="v-effect-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Select effect type"
                                style={{ display: initEffectNames.length > 0 ? 'flex' : 'none' }}
                                onClick={handleEffectBtnClick}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>
                                <span id="v-effect-btn-label" ref={effectBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">Effect</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            {/* Advanced Button */}
                            <button
                                id="v-advanced-btn"
                                className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 group whitespace-nowrap"
                                data-tooltip="Show advanced options"
                                data-testid="advanced-settings-btn"
                                onClick={toggleAdvanced}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="opacity-60 text-secondary"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 001.82-.33 1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-1.82.33A1.65 1.65 0 0019.4 9a1.65 1.65 0 00-1.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                                <span id="v-advanced-btn-label" ref={advancedBtnLabelRef} className="text-xs font-bold text-white group-hover:text-primary transition-colors">Advanced</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" className="opacity-20 group-hover:opacity-100 transition-opacity"><path d="M6 9l6 6 6-6"/></svg>
                            </button>
                        </div>

                        <button
                            ref={generateBtnRef}
                            id="generate-video-btn"
                            className="bg-primary text-black px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-[1.5rem] font-black text-sm md:text-base hover:shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto shadow-lg"
                            data-tooltip="Generate AI video from prompt"
                            data-testid="generate-video-btn"
                            onClick={handleGenerate}
                        >
                            Generate ✨
                        </button>
                    </div>
                </div>
            </div>

            {/* Inline Instructions */}
            <div className="w-full max-w-4xl text-center text-white/30 text-sm flex flex-col items-center gap-2 py-2 mt-8">
                <p>🎬 Enter a prompt above and click <span className="text-primary font-semibold">Generate</span> to create your video.</p>
                <p className="text-xs text-white/20">Tip: Be descriptive — include subject, motion, and style for best results.</p>
            </div>

            {/* Wan AI Effects Section */}
            <div className="w-full mt-6 animate-fade-in-up">
                <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-white">Wan AI Effects</h3>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium">Experimental</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <select
                            id="wan-ai-effect"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                            value={wanEffectType}
                            onChange={(e) => setWanEffectType(e.target.value)}
                        >
                            <option value="">Select an effect...</option>
                            <option value="dreamy">💭 Dreamy Sequence - Surreal Animation</option>
                            <option value="cyberpunk">🤖 Cyberpunk City - Sci-Fi Environment</option>
                            <option value="fantasy">🧙 Fantasy World - Magical Realm</option>
                            <option value="horror">👻 Horror Atmosphere - Spooky Effects</option>
                            <option value="romantic">💕 Romantic Scene - Emotional Lighting</option>
                            <option value="action">💥 Action Sequence - Dynamic Movement</option>
                            <option value="documentary">📹 Documentary Style - Realistic Footage</option>
                            <option value="music-video">🎵 Music Video - Rhythmic Editing</option>
                            <option value="vintage">📽️ Vintage Film - Classic Cinema</option>
                            <option value="futuristic">🚀 Futuristic Tech - Advanced Gadgets</option>
                            <option value="nature">🌿 Nature Documentary - Wildlife Focus</option>
                            <option value="sports">⚽ Sports Highlight - Athletic Action</option>
                            <option value="cooking">👨‍🍳 Cooking Show - Culinary Process</option>
                            <option value="travel">✈️ Travel Vlog - Location Exploration</option>
                            <option value="tutorial">📚 Tutorial Video - Educational Content</option>
                            <option value="interview">🎤 Interview Format - Conversational Style</option>
                            <option value="product-demo">📱 Product Demo - Feature Showcase</option>
                            <option value="fashion">👗 Fashion Show - Style Presentation</option>
                            <option value="wedding">💒 Wedding Video - Ceremonial Moments</option>
                            <option value="birthday">🎂 Birthday Party - Celebration Events</option>
                            <option value="graduation">🎓 Graduation - Milestone Celebration</option>
                            <option value="concert">🎶 Concert Performance - Live Music</option>
                            <option value="comedy">🤣 Comedy Sketch - Humorous Content</option>
                            <option value="drama">🎭 Dramatic Scene - Emotional Storytelling</option>
                            <option value="thriller">🔪 Thriller Sequence - Suspense Building</option>
                            <option value="mystery">🕵️ Mystery Plot - Intrigue Development</option>
                            <option value="western">🤠 Western Saga - Frontier Adventure</option>
                            <option value="superhero">🦸 Superhero Action - Heroic Feats</option>
                            <option value="disney">🐭 Disney Magic - Animated Fantasy</option>
                            <option value="pixar">🎨 Pixar Quality - Animated Storytelling</option>
                            <option value="dreamworks">🐲 DreamWorks Style - Animated Adventure</option>
                            <option value="marvel">⚡ Marvel Universe - Superhero Spectacle</option>
                            <option value="dc">🦇 DC Universe - Comic Book Action</option>
                            <option value="star-wars">⭐ Star Wars - Galactic Adventure</option>
                            <option value="harry-potter">⚡ Harry Potter - Wizarding World</option>
                            <option value="lord-rings">💍 Lord of the Rings - Epic Fantasy</option>
                            <option value="star-trek">🖖 Star Trek - Space Exploration</option>
                            <option value="matrix">💊 Matrix Reality - Cyberpunk Philosophy</option>
                            <option value="inception">🌀 Inception Dreams - Mind-Bending Concepts</option>
                            <option value="interstellar">🌌 Interstellar Space - Cosmic Wonder</option>
                            <option value="gravity">🌍 Gravity Effects - Zero Gravity Physics</option>
                            <option value="blade-runner">🌆 Blade Runner - Neo-Noir Futurism</option>
                            <option value="ghost-shell">🤖 Ghost in the Shell - Cybernetic Themes</option>
                            <option value="akira">🏍️ Akira Chaos - Post-Apocalyptic Anarchy</option>
                            <option value="neon-genesis">🌃 Neon Genesis - Cyberpunk Evolution</option>
                            <option value="serial-experiments">🎭 Serial Experiments - Surreal Psychology</option>
                            <option value="paprika">💭 Paprika Dreams - Lucid Dream Worlds</option>
                            <option value="perfect-blue">💙 Perfect Blue - Identity Crisis</option>
                            <option value="tokyo-godfathers">👨‍👩‍👧 Tokyo Godfathers - Urban Redemption</option>
                            <option value="grave-of-fireflies">🔥 Grave of the Fireflies - War's Innocence</option>
                            <option value="princess-mononoke">🌿 Princess Mononoke - Nature's Spirit</option>
                            <option value="my-neighbor-totoro">🐾 My Neighbor Totoro - Childhood Wonder</option>
                            <option value="spirited-away">🏮 Spirited Away - Magical Journey</option>
                            <option value="howl-moving-castle">🏰 Howl's Moving Castle - Wizard's Domain</option>
                            <option value="castle-in-sky">🎈 Castle in the Sky - Floating Kingdoms</option>
                            <option value="nausicaa">🌪️ Nausicaä - Post-Apocalyptic Hope</option>
                            <option value="vhs">📼 VHS Footage - Retro Video</option>
                            <option value="samurai">⚔️ Samurai It - Character Animation</option>
                            <option value="film-noir">🎭 Film Noir - Cinematic Style</option>
                            <option value="animal">🐾 Animal Transformation</option>
                            <option value="rotation">🔄 Rotation Effect</option>
                        </select>
                        <button
                            id="apply-wan-effect"
                            className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded text-sm font-medium transition-colors disabled:opacity-50 text-white"
                            onClick={applySelectedWanEffect}
                        >
                            Apply Wan AI Effect
                        </button>
                    </div>
                </div>
            </div>

            {/* Advanced Panel */}
            <div
                ref={advancedPanelRef}
                id="v-advanced-panel"
                className={`w-full mt-6 animate-fade-in-up ${showAdvanced ? '' : 'hidden'}`}
                data-testid="advanced-panel"
            >
                <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <h3 className="text-sm font-bold text-white">Advanced Options</h3>
                        <button id="v-close-adv-btn" className="text-white/40 hover:text-white transition-colors" onClick={toggleAdvanced}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>

                    {/* Negative Prompt */}
                    <div className="flex flex-col gap-2" id="v-negative-prompt-section">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Negative Prompt</label>
                            <button id="v-negative-prompt-toggle" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors" data-testid="negative-prompt-toggle">Show</button>
                        </div>
                        <input
                            type="text"
                            id="v-negative-prompt-input"
                            placeholder="What to exclude from the video (e.g., blurry, distorted, watermark)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                            data-testid="negative-prompt-input"
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                        />
                    </div>

                    {/* Seed */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Seed</label>
                            <button id="v-randomize-seed-btn" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors" onClick={handleRandomizeSeed}>Randomize</button>
                        </div>
                        <input
                            type="number"
                            id="v-seed-input"
                            placeholder="-1 for random"
                            value={seed}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                            data-testid="seed-input"
                            onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                        />
                    </div>

                    {/* Guidance Scale */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Guidance Scale</label>
                            <span id="v-guidance-value" className="text-xs font-bold text-primary">{guidanceScale}</span>
                        </div>
                        <input
                            type="range"
                            id="v-guidance-slider"
                            min="1"
                            max="20"
                            step="0.5"
                            value={guidanceScale}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            data-testid="guidance-scale-input"
                            onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                        />
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
                id="video-history-sidebar"
                className="fixed right-0 top-0 h-full w-20 md:w-24 bg-black/60 backdrop-blur-xl border-l border-white/5 z-50 flex flex-col items-center py-4 gap-3 overflow-y-auto transition-all duration-500 translate-x-full opacity-0"
            >
                <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-2">History</div>
                <div ref={historyListRef} className="flex flex-col gap-2 w-full px-2" />
            </div>

            {/* Canvas */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 min-[800px]:p-16 z-10 opacity-0 pointer-events-none transition-all duration-1000 translate-y-10 scale-95">
                <div className="relative group">
                    <video
                        ref={resultVideoRef}
                        className="max-h-[60vh] max-w-[80vw] rounded-3xl shadow-3xl border border-white/10 interactive-glow object-contain"
                        data-testid="generated-video"
                        controls
                        loop
                        autoPlay
                        muted
                        playsInline
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
                        ref={extendBtnRef}
                        className="hidden bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border border-primary/30 text-primary backdrop-blur-lg"
                        title="Extend this video using Seedance 2.0 Extend"
                        onClick={handleExtend}
                    >
                        ↗ Extend
                    </button>
                    <button
                        className="bg-primary text-black px-6 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-glow active:scale-95"
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
                </div>
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

export default VideoStudio;