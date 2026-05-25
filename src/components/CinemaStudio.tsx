import React, { useState, useEffect, useRef, useCallback } from 'react';
import { muapi } from '../lib/muapi.js';
import { CameraControls } from './CameraControls.js';
import { buildNanoBananaPrompt, CAMERA_MAP, LENS_MAP, FOCAL_PERSPECTIVE, APERTURE_EFFECT } from '../lib/promptUtils.js';
import { AuthModal } from './AuthModal.js';
import { sendToHandoff, createHandoffPayload } from '../lib/handoff.ts';

interface GenerationEntry {
    url: string;
    timestamp: number;
    settings: {
        prompt: string;
        camera: string;
        lens: string;
        focal: number;
        aperture: string;
        aspect_ratio: string;
        resolution?: string;
    };
}

const CinemaStudio: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const resultImgRef = useRef<HTMLImageElement>(null);
    const canvasControlsRef = useRef<HTMLDivElement>(null);
    const sendToDropdownRef = useRef<HTMLDivElement>(null);
    const generateBtnRef = useRef<HTMLButtonElement>(null);
    const overlayBackdropRef = useRef<HTMLDivElement>(null);
    const overlayContentRef = useRef<HTMLDivElement>(null);
    const historyListRef = useRef<HTMLDivElement>(null);
    const heroSectionRef = useRef<HTMLDivElement>(null);
    const promptBarWrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const cameraBuilderPanelRef = useRef<HTMLDivElement>(null);
    const builderCameraRef = useRef<HTMLSelectElement>(null);
    const builderLensRef = useRef<HTMLSelectElement>(null);
    const builderFocalRef = useRef<HTMLSelectElement>(null);
    const builderApertureRef = useRef<HTMLSelectElement>(null);
    const builderPreviewRef = useRef<HTMLDivElement>(null);
    const arBtnRef = useRef<HTMLButtonElement>(null);
    const resBtnRef = useRef<HTMLButtonElement>(null);
    const summaryTitleRef = useRef<HTMLSpanElement>(null);
    const summaryValueRef = useRef<HTMLSpanElement>(null);
    const cameraBuilderBtnRef = useRef<HTMLButtonElement>(null);

    const [currentSettings, setCurrentSettings] = useState({
        prompt: '',
        aspect_ratio: '16:9',
        camera: Object.keys(CAMERA_MAP)[0],
        lens: Object.keys(LENS_MAP)[0],
        focal: 35,
        aperture: 'f/1.4'
    });

    const [resolution, setResolution] = useState('2K');
    const [showCameraBuilder, setShowCameraBuilder] = useState(false);
    const [generationHistory, setGenerationHistory] = useState<GenerationEntry[]>([]);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('cinema_history') || '[]');
            if (saved.length > 0) {
                setGenerationHistory(saved);
            }
        } catch (e) { }
    }, []);

    const formatSummaryValue = () => {
        return `${currentSettings.lens}, ${currentSettings.focal}mm, ${currentSettings.aperture}`;
    };

    const updateSummaryCard = useCallback(() => {
        if (summaryTitleRef.current) summaryTitleRef.current.textContent = currentSettings.camera;
        if (summaryValueRef.current) summaryValueRef.current.textContent = formatSummaryValue();
    }, [currentSettings]);

    const updateArBtn = () => {
        if (arBtnRef.current) {
            arBtnRef.current.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="2" ry="2"/></svg> ${currentSettings.aspect_ratio}`;
        }
    };

    const updateResBtn = (val: string) => {
        if (resBtnRef.current) {
            resBtnRef.current.dataset.value = val || '2K';
            resBtnRef.current.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> ${resBtnRef.current.dataset.value}`;
        }
    };

    const openOverlay = () => {
        if (overlayBackdropRef.current && overlayContentRef.current) {
            overlayBackdropRef.current.classList.remove('opacity-0', 'pointer-events-none');
            overlayContentRef.current.classList.remove('scale-95');
            overlayContentRef.current.classList.add('scale-100');
        }
    };

    const closeOverlay = () => {
        if (overlayBackdropRef.current && overlayContentRef.current) {
            overlayBackdropRef.current.classList.add('opacity-0', 'pointer-events-none');
            overlayContentRef.current.classList.add('scale-95');
            overlayContentRef.current.classList.remove('scale-100');
        }
    };

    const handleOverlayClose = () => {
        closeOverlay();
    };

    const handleOverlayBackdropClick = (e: React.MouseEvent) => {
        if (e.target === overlayBackdropRef.current) {
            closeOverlay();
        }
    };

    const handleCameraStateChange = (state: { camera: string; lens: string; focal: number; aperture: string }) => {
        setCurrentSettings(prev => ({
            ...prev,
            camera: state.camera,
            lens: state.lens,
            focal: state.focal,
            aperture: state.aperture
        }));
        updateSummaryCard();
    };

    const updateBuilderPreview = () => {
        const camera = builderCameraRef.current?.value || currentSettings.camera;
        const lens = builderLensRef.current?.value || currentSettings.lens;
        const focal = parseInt(builderFocalRef.current?.value || String(currentSettings.focal));
        const aperture = builderApertureRef.current?.value || currentSettings.aperture;

        const preview = buildNanoBananaPrompt('', camera, lens, focal, aperture);
        if (builderPreviewRef.current) {
            builderPreviewRef.current.textContent = preview || 'Select camera settings to see preview...';
        }
    };

    const handleApplyBuilder = () => {
        const camera = builderCameraRef.current?.value || currentSettings.camera;
        const lens = builderLensRef.current?.value || currentSettings.lens;
        const focal = parseInt(builderFocalRef.current?.value || String(currentSettings.focal));
        const aperture = builderApertureRef.current?.value || currentSettings.aperture;

        setCurrentSettings(prev => ({
            ...prev,
            camera,
            lens,
            focal,
            aperture
        }));
        updateSummaryCard();
        setShowCameraBuilder(false);
        if (cameraBuilderPanelRef.current) {
            cameraBuilderPanelRef.current.style.display = 'none';
        }
    };

    const showCanvas = (url: string) => {
        setCurrentImageUrl(url);
        if (resultImgRef.current) resultImgRef.current.src = url;

        if (heroSectionRef.current) heroSectionRef.current.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        if (promptBarWrapperRef.current) promptBarWrapperRef.current.classList.add('opacity-0', 'pointer-events-none', 'translate-y-20');

        if (canvasRef.current) {
            canvasRef.current.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10', 'scale-95');
            canvasRef.current.classList.add('opacity-100', 'translate-y-0', 'scale-100');
        }
        if (canvasControlsRef.current) {
            canvasControlsRef.current.classList.remove('opacity-0');
            canvasControlsRef.current.classList.add('opacity-100');
        }
    };

    const resetToPrompt = () => {
        if (canvasRef.current) {
            canvasRef.current.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10', 'scale-95');
            canvasRef.current.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
        }

        if (heroSectionRef.current) heroSectionRef.current.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        if (promptBarWrapperRef.current) promptBarWrapperRef.current.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-20');

        if (textareaRef.current) {
            textareaRef.current.value = '';
            textareaRef.current.focus();
        }
    };

    const addToHistory = (entry: GenerationEntry) => {
        setGenerationHistory(prev => {
            const updated = [entry, ...prev].slice(0, 50);
            localStorage.setItem('cinema_history', JSON.stringify(updated));
            return updated;
        });
    };

    const renderHistory = () => {
        if (!historyListRef.current) return;
        historyListRef.current.innerHTML = '';

        generationHistory.forEach((entry, idx) => {
            const thumb = document.createElement('div');
            thumb.className = `relative group/thumb cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 aspect-square ${idx === 0 ? 'border-[#d9ff00] shadow-glow-sm' : 'border-white/10 hover:border-white/30'}`;

            thumb.innerHTML = `
                <img src="${entry.url}" class="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity">
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                    <span class="text-[8px] font-bold text-white uppercase">Load</span>
                </div>
            `;

            thumb.onclick = () => loadHistoryItem(entry, thumb);
            historyListRef.current.appendChild(thumb);
        });
    };

    const loadHistoryItem = (entry: GenerationEntry, thumbElement: HTMLDivElement) => {
        if (entry.settings) {
            setCurrentSettings(prev => ({
                ...prev,
                camera: entry.settings.camera,
                lens: entry.settings.lens,
                focal: entry.settings.focal,
                aperture: entry.settings.aperture,
                aspect_ratio: entry.settings.aspect_ratio,
                prompt: entry.settings.prompt || ''
            }));
            if (textareaRef.current) textareaRef.current.value = entry.settings.prompt || '';
            updateSummaryCard();
            updateArBtn();
            if (entry.settings.resolution) updateResBtn(entry.settings.resolution);
        }

        showCanvas(entry.url);

        if (thumbElement && historyListRef.current) {
            historyListRef.current.querySelectorAll('div').forEach(t => {
                t.classList.remove('border-[#d9ff00]', 'shadow-glow-sm');
                t.classList.add('border-white/10');
            });
            thumbElement.classList.remove('border-white/10');
            thumbElement.classList.add('border-[#d9ff00]', 'shadow-glow-sm');
        }
    };

    useEffect(() => {
        renderHistory();
    }, [generationHistory]);

    const downloadImage = async () => {
        if (!resultImgRef.current?.src) return;
        try {
            const response = await fetch(resultImgRef.current.src);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `cinema-shot-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            window.open(resultImgRef.current.src, '_blank');
        }
    };

    const handleSendTo = (target: string) => {
        if (resultImgRef.current?.src) {
            const payload = createHandoffPayload(
                `cin_${Date.now()}`,
                'image',
                'cinema-studio',
                currentSettings.prompt || 'Generated cinema shot',
                resultImgRef.current.src,
                resultImgRef.current.src,
                { camera: currentSettings.camera, lens: currentSettings.lens, focal: currentSettings.focal, aperture: currentSettings.aperture, aspectRatio: currentSettings.aspect_ratio }
            );
            sendToHandoff(target, payload);
            if (sendToDropdownRef.current) {
                sendToDropdownRef.current.classList.add('hidden');
                sendToDropdownRef.current.classList.remove('flex');
            }
        }
    };

    const handleRegenerate = () => {
        resetToPrompt();
        setTimeout(() => {
            generateBtnRef.current?.click();
        }, 300);
    };

    const handleNewPrompt = () => {
        resetToPrompt();
    };

    const handleGenerate = async () => {
        const basePrompt = textareaRef.current?.value.trim() || '';
        if (!basePrompt) return;

        const apiKey = localStorage.getItem('muapi_key');
        if (!apiKey) {
            AuthModal(() => handleGenerate());
            return;
        }

        setIsGenerating(true);
        if (generateBtnRef.current) {
            generateBtnRef.current.disabled = true;
            generateBtnRef.current.innerHTML = 'SHOOTING...';
        }

        const finalPrompt = buildNanoBananaPrompt(
            basePrompt,
            currentSettings.camera,
            currentSettings.lens,
            currentSettings.focal,
            currentSettings.aperture
        );

        try {
            const res = await muapi.generateImage({
                model: 'nano-banana-pro',
                prompt: finalPrompt,
                aspect_ratio: currentSettings.aspect_ratio,
                resolution: (resBtnRef.current?.dataset.value || '2k').toLowerCase(),
                negative_prompt: 'blurry, low quality, distortion, bad composition'
            });

            if (res && res.url) {
                const entry: GenerationEntry = {
                    url: res.url,
                    timestamp: Date.now(),
                    settings: {
                        prompt: basePrompt,
                        ...currentSettings,
                        resolution: resBtnRef.current?.dataset.value
                    }
                };
                addToHistory(entry);
                showCanvas(res.url);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
            if (generateBtnRef.current) {
                generateBtnRef.current.disabled = false;
                generateBtnRef.current.innerHTML = 'GENERATE ✨';
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden"
        >
            {/* Hero Section */}
            <div
                ref={heroSectionRef}
                className="flex flex-col items-center justify-center text-center px-4 animate-fade-in-up"
            >
                <div className="mb-4 text-xs font-bold text-white/40 tracking-[0.2em] uppercase">Cinema Studio 2.0</div>
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tight leading-tight mb-2">
                    What would you shoot<br />with infinite budget?
                </h1>
            </div>

            {/* Overlay Backdrop */}
            <div
                ref={overlayBackdropRef}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center"
                onClick={handleOverlayBackdropClick}
            >
                <div
                    ref={overlayContent}
                    className="w-full max-w-4xl bg-[#141414] border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl transform scale-95 transition-transform duration-300 flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full">All</button>
                        </div>
                        <button id="close-overlay-btn" className="text-white/50 hover:text-white transition-colors" onClick={handleOverlayClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>

                    {/* Camera Controls */}
                    <CameraControls onStateChange={handleCameraStateChange} />
                </div>
            </div>

            {/* Floating Prompt Bar */}
            <div
                ref={promptBarWrapperRef}
                className="absolute bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl z-30"
            >
                <div className="bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-4 flex justify-between shadow-3xl items-end relative">
                    {/* LEFT COLUMN */}
                    <div className="flex-1 flex flex-col gap-3 min-h-[80px] justify-between py-1 px-1">
                        {/* Textarea */}
                        <textarea
                            ref={textareaRef}
                            placeholder="Describe your scene - use @ to add characters & props"
                            className="flex-1 bg-transparent border-none text-white text-lg font-medium placeholder:text-white/20 focus:outline-none resize-none h-[28px] leading-relaxed overflow-hidden"
                            rows={1}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = target.scrollHeight + 'px';
                            }}
                        />

                        {/* Settings Toolbar */}
                        <div className="flex items-center gap-3">
                            {/* Aspect Ratio Button */}
                            <button
                                ref={arBtnRef}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg border border-white/5"
                                onClick={() => {
                                    const items = ['16:9', '21:9', '9:16', '1:1', '4:5'];
                                    const existing = document.querySelectorAll('.custom-dropdown');
                                    existing.forEach(el => el.remove());

                                    const rect = arBtnRef.current?.getBoundingClientRect();
                                    if (!rect) return;

                                    const menu = document.createElement('div');
                                    menu.className = 'custom-dropdown fixed bg-[#1a1a1a] border border-white/10 rounded-xl py-1 shadow-2xl z-50 flex flex-col min-w-[100px] animate-fade-in';
                                    menu.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
                                    menu.style.left = rect.left + 'px';

                                    items.forEach(item => {
                                        const btn = document.createElement('button');
                                        btn.className = `px-3 py-2 text-xs font-bold text-left hover:bg-white/10 transition-colors ${item === currentSettings.aspect_ratio ? 'text-primary' : 'text-white'}`;
                                        btn.textContent = item;
                                        btn.onclick = (e) => {
                                            e.stopPropagation();
                                            setCurrentSettings(prev => ({ ...prev, aspect_ratio: item }));
                                            updateArBtn();
                                            menu.remove();
                                        };
                                        menu.appendChild(btn);
                                    });

                                    const closeHandler = (e: Event) => {
                                        if (!menu.contains(e.target as Node) && e.target !== arBtnRef.current) {
                                            menu.remove();
                                            document.removeEventListener('click', closeHandler);
                                        }
                                    };
                                    setTimeout(() => document.addEventListener('click', closeHandler), 0);
                                    document.body.appendChild(menu);
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="2" ry="2"/></svg>
                                {currentSettings.aspect_ratio}
                            </button>

                            {/* Resolution Button */}
                            <button
                                ref={resBtnRef}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg border border-white/5"
                                data-value="2K"
                                onClick={() => {
                                    const items = ['1K', '2K', '4K'];
                                    const existing = document.querySelectorAll('.custom-dropdown');
                                    existing.forEach(el => el.remove());

                                    const rect = resBtnRef.current?.getBoundingClientRect();
                                    if (!rect) return;

                                    const menu = document.createElement('div');
                                    menu.className = 'custom-dropdown fixed bg-[#1a1a1a] border border-white/10 rounded-xl py-1 shadow-2xl z-50 flex flex-col min-w-[100px] animate-fade-in';
                                    menu.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
                                    menu.style.left = rect.left + 'px';

                                    items.forEach(item => {
                                        const btn = document.createElement('button');
                                        btn.className = `px-3 py-2 text-xs font-bold text-left hover:bg-white/10 transition-colors ${item === resolution ? 'text-primary' : 'text-white'}`;
                                        btn.textContent = item;
                                        btn.onclick = (e) => {
                                            e.stopPropagation();
                                            setResolution(item);
                                            updateResBtn(item);
                                            menu.remove();
                                        };
                                        menu.appendChild(btn);
                                    });

                                    const closeHandler = (e: Event) => {
                                        if (!menu.contains(e.target as Node) && e.target !== resBtnRef.current) {
                                            menu.remove();
                                            document.removeEventListener('click', closeHandler);
                                        }
                                    };
                                    setTimeout(() => document.addEventListener('click', closeHandler), 0);
                                    document.body.appendChild(menu);
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                                {resolution}
                            </button>

                            {/* Camera Builder Toggle */}
                            <button
                                ref={cameraBuilderBtnRef}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg border border-white/5"
                                data-tooltip="Quick camera builder"
                                onClick={() => {
                                    setShowCameraBuilder(!showCameraBuilder);
                                    if (cameraBuilderPanelRef.current) {
                                        cameraBuilderPanelRef.current.style.display = showCameraBuilder ? 'none' : 'block';
                                    }
                                    if (showCameraBuilder) updateBuilderPreview();
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
                                Builder
                            </button>
                        </div>
                    </div>

                    {/* RIGHT GROUP */}
                    <div className="flex items-center gap-2 h-full self-end mb-1">
                        {/* Summary Card */}
                        <button
                            className="flex flex-col items-start justify-center px-4 py-2 bg-[#2a2a2a] rounded-xl border border-white/5 hover:border-white/20 transition-colors text-left flex-1 min-w-[100px] md:min-w-[140px] max-w-[240px] h-[56px] relative group overflow-hidden"
                            data-tooltip="Open camera settings"
                            onClick={openOverlay}
                        >
                            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-glow-sm"></div>
                            <span ref={summaryTitleRef} className="text-[10px] font-bold text-white uppercase truncate w-full tracking-wide">{currentSettings.camera}</span>
                            <span ref={summaryValueRef} className="text-[10px] font-medium text-white/60 truncate w-full">{formatSummaryValue()}</span>
                        </button>

                        {/* Generate Button */}
                        <button
                            ref={generateBtnRef}
                            className="h-[56px] px-8 bg-[#d9ff00] text-black rounded-xl font-black text-xs uppercase hover:bg-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            data-tooltip="Generate cinema shot"
                            onClick={handleGenerate}
                        >
                            GENERATE ✨
                        </button>
                    </div>
                </div>
            </div>

            {/* Camera Builder Panel */}
            <div
                ref={cameraBuilderPanelRef}
                className="absolute bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl z-20"
                style={{ display: 'none' }}
            >
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-white">Camera Builder</h4>
                        <button
                            id="close-builder-btn"
                            className="text-white/40 hover:text-white transition-colors"
                            onClick={() => {
                                setShowCameraBuilder(false);
                                if (cameraBuilderPanelRef.current) {
                                    cameraBuilderPanelRef.current.style.display = 'none';
                                }
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-muted uppercase">Camera</label>
                            <select
                                ref={builderCameraRef}
                                id="builder-camera"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                                onChange={updateBuilderPreview}
                            >
                                {Object.keys(CAMERA_MAP).map(c => (
                                    <option key={c} value={c} selected={c === currentSettings.camera}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-muted uppercase">Lens</label>
                            <select
                                ref={builderLensRef}
                                id="builder-lens"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                                onChange={updateBuilderPreview}
                            >
                                {Object.keys(LENS_MAP).map(l => (
                                    <option key={l} value={l} selected={l === currentSettings.lens}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-muted uppercase">Focal</label>
                            <select
                                ref={builderFocalRef}
                                id="builder-focal"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                                onChange={updateBuilderPreview}
                            >
                                {Object.keys(FOCAL_PERSPECTIVE).map(f => (
                                    <option key={f} value={f} selected={f === String(currentSettings.focal)}>{f}mm</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-muted uppercase">Aperture</label>
                            <select
                                ref={builderApertureRef}
                                id="builder-aperture"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                                onChange={updateBuilderPreview}
                            >
                                {Object.keys(APERTURE_EFFECT).map(a => (
                                    <option key={a} value={a} selected={a === currentSettings.aperture}>{a}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-muted uppercase">Preview</label>
                        <div
                            ref={builderPreviewRef}
                            id="builder-preview"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs min-h-[40px]"
                        />
                        <button
                            id="apply-builder-btn"
                            className="px-4 py-2 bg-primary text-black rounded-lg text-xs font-bold hover:shadow-glow transition-all"
                            onClick={handleApplyBuilder}
                        >
                            Use This Setup
                        </button>
                    </div>
                </div>
            </div>

            {/* History Sidebar */}
            <div className="fixed right-0 top-0 h-full w-20 md:w-24 bg-black/60 backdrop-blur-xl border-l border-white/5 z-50 flex flex-col items-center py-4 gap-3 overflow-y-auto transition-all duration-500">
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2">History</div>
                <div ref={historyListRef} className="flex flex-col gap-2 w-full px-2" />
            </div>

            {/* Canvas */}
            <div
                ref={canvasRef}
                className="absolute inset-0 flex flex-col items-center justify-center p-4 min-[800px]:p-16 z-30 opacity-0 pointer-events-none transition-all duration-1000 translate-y-10 scale-95 bg-black/90 backdrop-blur-3xl"
            >
                <div className="relative group max-w-full max-h-[70vh] flex items-center justify-center">
                    <img
                        ref={resultImgRef}
                        className="max-h-[60vh] max-w-[90vw] rounded-2xl shadow-2xl border border-white/10 object-contain"
                        alt="Generated cinema shot"
                    />
                </div>
                <div ref={canvasControlsRef} className="mt-8 flex gap-3 opacity-0 transition-opacity delay-500 duration-500 justify-center" style={{ position: 'relative' }}>
                    <button
                        className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border border-white/5 backdrop-blur-lg text-white hover:border-white/20"
                        onClick={handleRegenerate}
                    >
                        ↻ Regenerate
                    </button>
                    <button
                        className="bg-[#d9ff00] text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide hover:bg-white transition-colors shadow-glow-sm hover:scale-105 active:scale-95"
                        onClick={downloadImage}
                    >
                        ↓ Download
                    </button>
                    <button
                        className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border border-white/5 backdrop-blur-lg text-white hover:border-white/20"
                        onClick={handleNewPrompt}
                    >
                        + New Shot
                    </button>
                    <button
                        className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border border-white/5 backdrop-blur-lg text-white hover:border-white/20"
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

export default CinemaStudio;