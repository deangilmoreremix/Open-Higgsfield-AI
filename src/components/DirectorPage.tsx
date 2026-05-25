import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createHeroSection } from "../lib/thumbnails.js";
import { navigate } from '../lib/router.js';
import { escapeHtml } from '../lib/security.js';
import { directorRuntime } from '../lib/directorAgentRuntime.js';
import { supabase } from '../lib/hybrid-supabase.js';
import { VideoUpload } from './common/Upload.js';
import { getPendingHandoff, clearPendingHandoff } from '../lib/handoff.ts';

const DIRECTOR_AGENTS = [
    { id: 'summarizer', name: 'Video Summarizer', icon: '📝', description: 'Summarize video content', category: 'analysis' },
    { id: 'search', name: 'Video Search', icon: '🔍', description: 'Search and index media library', category: 'search' },
    { id: 'clipper', name: 'Clip Creator', icon: '✂️', description: 'Extract and create clips', category: 'extract' },
    { id: 'dubbing', name: 'Video Dubbing', icon: '🎤', description: 'Translate and dub audio/video', category: 'translate' },
    { id: 'subtitler', name: 'Subtitle Generator', icon: '💬', description: 'Add subtitles in any language', category: 'accessibility' },
    { id: 'highlighter', name: 'Highlight Extractor', icon: '⚡', description: 'Find key moments automatically', category: 'extract' },
    { id: 'scenes', name: 'Scene Detector', icon: '🎬', description: 'Identify scene boundaries', category: 'analysis' },
    { id: 'broll', name: 'B-Roll Adder', icon: '🎞️', description: 'Add overlay footage', category: 'enhance' },
    { id: 'voiceover', name: 'Voiceover', icon: '🎙️', description: 'Add AI voiceover', category: 'audio' },
    { id: 'editor', name: 'Video Editor', icon: '✏️', description: 'Edit and enhance video', category: 'edit' },
    { id: 'enhancer', name: 'Video Enhancer', icon: '✨', description: 'Quality enhancement', category: 'enhance' },
    { id: 'compiler', name: 'Content Compiler', icon: '📚', description: 'Compile multiple videos', category: 'create' },
    { id: 'meme', name: 'Meme Generator', icon: '😂', description: 'Create meme videos', category: 'create' },
    { id: 'musicvideo', name: 'Music Video Maker', icon: '🎵', description: 'Generate music videos', category: 'create' },
    { id: 'trailer', name: 'Trailer Creator', icon: '🎥', description: 'Make video trailers', category: 'create' },
    { id: 'compilation', name: 'Compilation Builder', icon: '📋', description: 'Build compilations', category: 'create' },
    { id: 'social', name: 'Social Media Clip', icon: '📱', description: 'Create social media clips', category: 'social' },
    { id: 'preview', name: 'Preview Generator', icon: '👁️', description: 'Generate video previews', category: 'create' },
    { id: 'montage', name: 'Montage Builder', icon: '🎞️', description: 'Create video montages', category: 'create' },
    { id: 'story', name: 'Story Builder', icon: '📖', description: 'Build narratives from clips', category: 'create' },
    { id: 'color', name: 'Color Correction', icon: '🎨', description: 'Adjust colors and tones', category: 'enhance' },
    { id: 'stabilize', name: 'Video Stabilize', icon: '🪄', description: 'Stabilize shaky footage', category: 'enhance' },
    { id: 'speed', name: 'Speed Control', icon: '⏱️', description: 'Adjust video speed', category: 'edit' },
    { id: 'reverse', name: 'Reverse Video', icon: '🔄', description: 'Play video backwards', category: 'edit' },
];

const AGENT_CATEGORIES: Record<string, { name: string; color: string }> = {
    analysis: { name: 'Analysis', color: 'blue' },
    search: { name: 'Search', color: 'cyan' },
    extract: { name: 'Extract', color: 'purple' },
    translate: { name: 'Translate', color: 'pink' },
    accessibility: { name: 'Accessibility', color: 'orange' },
    enhance: { name: 'Enhance', color: 'green' },
    audio: { name: 'Audio', color: 'red' },
    edit: { name: 'Edit', color: 'yellow' },
    create: { name: 'Create', color: 'teal' },
    social: { name: 'Social', color: 'indigo' },
};

interface Agent {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
}

interface ChatMessage {
    text: string;
    isUser: boolean;
    agents: string[];
    isAction: boolean;
}

interface Frame {
    id: number;
    shot?: string;
    prompt?: string;
    narration?: string;
    generated?: boolean;
}

const DirectorPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const commandInputRef = useRef<HTMLInputElement>(null);
    const chatMessagesRef = useRef<HTMLDivElement>(null);
    const activeAgentsRef = useRef<HTMLDivElement>(null);
    const actionHistoryRef = useRef<HTMLDivElement>(null);
    const storyboardFramesRef = useRef<HTMLDivElement>(null);
    const processingStatusRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressPercentRef = useRef<HTMLSpanElement>(null);
    const processingTitleRef = useRef<HTMLSpanElement>(null);
    const processingStepsRef = useRef<HTMLDivElement>(null);

    const [videoUrl, setVideoUrl] = useState('');
    const [activeTab, setActiveTab] = useState<'agents' | 'storyboard'>('agents');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const [directorRuntimeInstance, setDirectorRuntimeInstance] = useState<any>(null);
    const [frames, setFrames] = useState<Frame[]>([]);
    const [preset, setPreset] = useState('cinematic-story');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('videoId') || '';
        let urlVideoUrl = urlParams.get('videoUrl') || '';

        const pending = getPendingHandoff('director');
        if (pending && pending.url && !urlVideoUrl) {
            urlVideoUrl = pending.url;
        }

        setVideoUrl(urlVideoUrl);

        const initializeDirectorRuntime = async () => {
            try {
                const instance = new directorRuntime.constructor();
                await instance.initialize();
                setDirectorRuntimeInstance(instance);
            } catch (error) {
                console.error('[DirectorPage] Failed to initialize director runtime:', error);
            }
        };

        initializeDirectorRuntime();
    }, []);

    const addMessage = (text: string, isUser = false, agents: string[] = [], isAction = false) => {
        setChatHistory(prev => [...prev, { text, isUser, agents, isAction }]);
    };

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const updateActiveAgents = () => {
        // Active agents are updated via state
    };

    const addToHistory = (command: string, agents: string[]) => {
        // History is managed via state
    };

    const handleBack = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('videoId') || '';
        navigate('render', { videoId, videoUrl });
    };

    const handleClearChat = () => {
        setChatHistory([{
            text: 'Chat cleared. How can I help you with your video?',
            isUser: false,
            agents: [],
            isAction: false
        }]);
    };

    const handleCategoryFilter = (category: string) => {
        setCategoryFilter(category);
    };

    const getFilteredAgents = () => {
        if (!categoryFilter) return DIRECTOR_AGENTS;
        return DIRECTOR_AGENTS.filter(agent => agent.category === categoryFilter);
    };

    const handleAgentClick = (agent: Agent) => {
        processCommand(`Use ${agent.name} to ${agent.description.toLowerCase()}`);
    };

    const handleActionClick = (action: string) => {
        const actionTexts: Record<string, string> = {
            summarize: 'Summarize this video',
            highlights: 'Extract the best highlights from this video',
            scenes: 'Detect all scenes in this video',
            subtitles: 'Add subtitles to this video',
            dubbing: 'Dub this video to Spanish',
            broll: 'Add relevant B-roll footage',
            voiceover: 'Add voiceover narration',
            shorts: 'Create short clips for social media',
            color: 'Apply color correction to this video',
            stabilize: 'Stabilize this video'
        };
        processCommand(actionTexts[action] || action);
    };

    const handleSendCommand = () => {
        if (commandInputRef.current?.value) {
            processCommand(commandInputRef.current.value);
        }
    };

    const handleCommandKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendCommand();
        }
    };

    const processCommand = async (command: string) => {
        if (!command.trim() || isProcessing) return;

        setIsProcessing(true);
        addMessage(command, true);
        if (commandInputRef.current) commandInputRef.current.value = '';

        try {
            const statusEl = processingStatusRef.current;
            if (statusEl) statusEl.classList.remove('hidden');

            const actionMapping: Record<string, string> = {
                'highlight': 'highlight-detection',
                'clip': 'clip-segmentation',
                'short': 'create-shorts',
                'scene': 'scene-detection',
                'auto-edit': 'auto-edit',
                'edit': 'auto-edit'
            };

            let action = 'auto-edit';
            const cmd = command.toLowerCase();
            for (const [key, val] of Object.entries(actionMapping)) {
                if (cmd.includes(key)) {
                    action = val;
                    break;
                }
            }

            const agentMapping: Record<string, string[]> = {
                'highlight-detection': ['Highlight Extractor'],
                'clip-segmentation': ['Clip Creator'],
                'create-shorts': ['Highlight Extractor', 'Clip Creator'],
                'scene-detection': ['Scene Detector'],
                'auto-edit': ['Video Editor', 'Reasoning Engine']
            };
            const activatedAgents = agentMapping[action] || ['Video Editor'];

            setActiveAgents(new Set(activatedAgents.map(a => a.toLowerCase().replace(/ /g, '_'))));

            if (processingTitleRef.current) {
                processingTitleRef.current.textContent = activatedAgents.join(', ');
            }

            const { data, error } = await supabase.functions.invoke('videoagent', {
                body: {
                    action,
                    videoId: '',
                    videoUrl: videoUrl || '',
                    options: { command }
                }
            });

            if (error) {
                throw new Error(`Processing failed: ${error.message}`);
            }

            if (processingStepsRef.current) {
                processingStepsRef.current.innerHTML = `
                    <div class="flex items-center gap-2 text-primary">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        Initializing...
                    </div>
                `;
            }

            if (progressBarRef.current) progressBarRef.current.style.width = '50%';
            if (progressPercentRef.current) progressPercentRef.current.textContent = '50%';

            await new Promise(r => setTimeout(r, 1000));

            if (progressBarRef.current) progressBarRef.current.style.width = '100%';
            if (progressPercentRef.current) progressPercentRef.current.textContent = '100%';

            setTimeout(() => {
                if (processingStatusRef.current) processingStatusRef.current.classList.add('hidden');
                if (progressBarRef.current) progressBarRef.current.style.width = '0%';
                if (progressPercentRef.current) progressPercentRef.current.textContent = '0%';
            }, 1000);

            setTimeout(() => {
                setActiveAgents(new Set());
            }, 2000);

            const successMessage = `Processing completed successfully! Your video has been processed with ${activatedAgents.join(', ')}.`;
            addMessage(successMessage, false, activatedAgents, true);

            const historyEl = actionHistoryRef.current;
            if (historyEl) {
                const actionEl = document.createElement('div');
                actionEl.className = 'p-2 bg-white/5 rounded-lg text-xs text-white flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors';
                actionEl.innerHTML = `
                    <span class="text-primary">✓</span>
                    <span class="flex-1 truncate">${escapeHtml(command.slice(0, 25))}${command.length > 25 ? '...' : ''}</span>
                    <span class="text-secondary ml-auto">${activatedAgents.slice(0, 2).join(', ')}</span>
                `;
                actionEl.onclick = () => {
                    if (commandInputRef.current) {
                        commandInputRef.current.value = command;
                        commandInputRef.current.focus();
                    }
                };
                historyEl.insertBefore(actionEl, historyEl.firstChild);

                while (historyEl.children.length > 10) {
                    historyEl.removeChild(historyEl.lastChild);
                }
            }

        } catch (error: any) {
            console.error('Processing error:', error);

            if (processingStatusRef.current) processingStatusRef.current.classList.remove('hidden');
            if (processingTitleRef.current) processingTitleRef.current.textContent = 'Processing Failed';
            if (processingStepsRef.current) {
                processingStepsRef.current.innerHTML = `
                    <div class="flex items-center gap-2 text-red-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        Error: ${error.message}
                    </div>
                `;
            }

            setTimeout(() => {
                if (processingStatusRef.current) processingStatusRef.current.classList.add('hidden');
            }, 5000);

            addMessage(`Sorry, processing failed: ${error.message}`, false, [], false);
        }

        setIsProcessing(false);
    };

    const handleExport = async (format: string) => {
        try {
            const { error } = await supabase.functions.invoke('videoagent', {
                body: {
                    action: 'auto-edit',
                    videoUrl: videoUrl,
                    options: {
                        exportFormat: format,
                        command: `Export video as ${format.toUpperCase()}`
                    }
                }
            });

            if (error) throw error;
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleAddFrame = () => {
        if (!directorRuntimeInstance) return;
        directorRuntimeInstance.addFrame();
        updateStoryboardFrames();
    };

    const handleGenerateAllFrames = async () => {
        if (!directorRuntimeInstance) return;
        try {
            await directorRuntimeInstance.generateAllFrames();
            updateStoryboardFrames();
        } catch (error) {
            console.error('Batch frame generation failed:', error);
        }
    };

    const updateStoryboardFrames = () => {
        if (!directorRuntimeInstance) return;
        const newFrames = directorRuntimeInstance.getFrames();
        setFrames([...newFrames]);
    };

    const handleGenerateFrame = async (frameId: number) => {
        if (!directorRuntimeInstance) return;
        try {
            await directorRuntimeInstance.generateFrame(frameId);
            updateStoryboardFrames();
        } catch (error) {
            console.error('Frame generation failed:', error);
        }
    };

    const handleRemoveFrame = (frameId: number) => {
        if (!directorRuntimeInstance) return;
        directorRuntimeInstance.removeFrame(frameId);
        updateStoryboardFrames();
    };

    const handleVideoUpload = (file: File) => {
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
    };

    const filteredAgents = getFilteredAgents();
    const activeAgentsList = Array.from(activeAgents);
    const categories = Object.entries(AGENT_CATEGORIES);

    return (
        <div ref={containerRef} className="w-full h-full flex flex-col overflow-hidden bg-app-bg">
            {/* Hero Banner */}
            <div className="h-64 md:h-80 lg:h-96 mb-4 relative">
                {(() => {
                    const heroBanner = createHeroSection('director', 'h-full');
                    if (heroBanner) {
                        const bannerText = document.createElement('div');
                        bannerText.className = 'absolute bottom-0 left-0 right-0 p-4 z-10';

                        const h1 = document.createElement('h1');
                        h1.className = 'text-2xl md:text-3xl font-black text-white tracking-tight mb-1';
                        h1.textContent = 'Director Studio';

                        const p = document.createElement('p');
                        p.className = 'text-white/60 text-xs';
                        p.textContent = 'AI-powered video direction and timeline management';

                        bannerText.appendChild(h1);
                        bannerText.appendChild(p);
                        heroBanner.appendChild(bannerText);

                        return heroBanner;
                    }
                    return null;
                })()}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/50">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white">DIRECTOR</h1>
                            <p className="text-xs text-secondary">AI Agentic Editor • {DIRECTOR_AGENTS.length} Agents</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleClearChat} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-secondary text-sm rounded-lg transition-colors">
                        Clear Chat
                    </button>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                        REASONING ENGINE
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Agents & Storyboard Panel */}
                <div className="w-80 border-r border-white/5 overflow-hidden bg-black/30 flex flex-col">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('agents')}
                            className={`flex-1 py-3 px-4 text-sm font-bold ${activeTab === 'agents' ? 'text-white bg-primary/10 border-b-2 border-primary' : 'text-secondary hover:text-white transition-colors'}`}
                        >
                            AGENTS
                        </button>
                        <button
                            onClick={() => setActiveTab('storyboard')}
                            className={`flex-1 py-3 px-4 text-sm font-bold ${activeTab === 'storyboard' ? 'text-white bg-primary/10 border-b-2 border-primary' : 'text-secondary hover:text-white transition-colors'}`}
                        >
                            STORYBOARD
                        </button>
                    </div>

                    {activeTab === 'agents' ? (
                        <div className="flex-1 overflow-auto">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">AI AGENTS</h3>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => handleCategoryFilter(e.target.value)}
                                        className="bg-white/5 text-xs text-secondary rounded px-2 py-1 border border-white/10"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(([key, val]) => (
                                            <option key={key} value={key}>{val.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {filteredAgents.map(agent => (
                                        <button
                                            key={agent.id}
                                            onClick={() => handleAgentClick(agent)}
                                            className="agent-btn p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
                                            data-agent={agent.id}
                                            data-category={agent.category}
                                        >
                                            <div className="text-lg mb-1">{agent.icon}</div>
                                            <div className="font-bold text-white text-xs leading-tight">{agent.name}</div>
                                            <div className="text-[10px] text-secondary truncate">{agent.description}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* Active Agents */}
                                <div className="mt-6">
                                    <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        ACTIVE AGENTS
                                    </h4>
                                    <div ref={activeAgentsRef} className="space-y-2 max-h-48 overflow-auto">
                                        {activeAgentsList.length === 0 ? (
                                            <div className="text-xs text-secondary italic p-2">No agents running</div>
                                        ) : (
                                            activeAgentsList.map(agentId => {
                                                const agent = DIRECTOR_AGENTS.find(a => a.id === agentId);
                                                return (
                                                    <div key={agentId} className="p-2 bg-white/5 rounded-lg flex items-center gap-2">
                                                        <span className="text-lg">{agent?.icon || '🤖'}</span>
                                                        <span className="text-xs text-white flex-1">{escapeHtml(agent?.name || agentId)}</span>
                                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Recent History */}
                                <div className="mt-6">
                                    <h4 className="font-bold text-white text-sm mb-3">RECENT ACTIONS</h4>
                                    <div ref={actionHistoryRef} className="space-y-2 max-h-40 overflow-auto">
                                        <div className="text-xs text-secondary italic p-2">No actions yet</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto">
                            <div className="p-4">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">STORYBOARD</h3>
                                        <select
                                            value={preset}
                                            onChange={(e) => {
                                                setPreset(e.target.value);
                                                if (directorRuntimeInstance) {
                                                    directorRuntimeInstance.setPreset(e.target.value);
                                                    updateStoryboardFrames();
                                                }
                                            }}
                                            className="bg-white/5 text-xs text-secondary rounded px-2 py-1 border border-white/10"
                                        >
                                            <option value="cinematic-story">Cinematic Story</option>
                                            <option value="commercial-ad">Commercial Ad</option>
                                            <option value="documentary-flow">Documentary Flow</option>
                                            <option value="social-shorts">Social Shorts</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 mb-3">
                                        <button onClick={handleAddFrame} className="flex-1 px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-colors">
                                            + ADD FRAME
                                        </button>
                                        <button onClick={handleGenerateAllFrames} className="flex-1 px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/80 transition-colors">
                                            GENERATE ALL
                                        </button>
                                    </div>
                                </div>

                                <div ref={storyboardFramesRef} className="space-y-2 max-h-96 overflow-auto">
                                    {frames.length === 0 ? (
                                        <div className="text-xs text-secondary italic p-2">No frames yet. Add a frame to start.</div>
                                    ) : (
                                        frames.map(frame => (
                                            <div key={frame.id} className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors" data-frame-id={frame.id}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-primary">FRAME {frame.id}</span>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleGenerateFrame(frame.id)}
                                                            className="generate-frame-btn px-2 py-1 bg-primary/20 text-primary text-xs rounded hover:bg-primary/30"
                                                        >
                                                            {frame.generated ? '✓' : 'Generate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveFrame(frame.id)}
                                                            className="remove-frame-btn px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-secondary mb-1">{frame.shot}</div>
                                                <div className="text-xs text-white leading-tight mb-2">{frame.prompt || 'No prompt set'}</div>
                                                <div className="text-xs text-secondary">{frame.narration || 'No narration'}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Center: Video + Chat */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Video Preview */}
                    <div className="p-4 border-b border-white/5">
                        <div className="bg-black rounded-2xl overflow-hidden">
                            <div className="aspect-video flex items-center justify-center bg-black/80 relative">
                                {videoUrl ? (
                                    <video
                                        id="director-video"
                                        className="max-w-full max-h-full"
                                        controls
                                        src={videoUrl}
                                    >
                                        Your browser does not support video playback.
                                    </video>
                                ) : (
                                    <div id="upload-placeholder" className="text-center p-8">
                                        <VideoUpload
                                            placeholder="Upload a video to start directing"
                                            maxSize={2000}
                                            onUpload={handleVideoUpload}
                                            onError={(errors) => errors.forEach(error => console.log(error, 'error'))}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Interface */}
                    <div className="flex-1 flex flex-col overflow-hidden p-4">
                        <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            AI CHAT
                            <span className="ml-auto text-xs text-secondary font-normal">Powered by VideoDB</span>
                        </h3>

                        {/* Chat Messages */}
                        <div ref={chatMessagesRef} className="flex-1 overflow-auto space-y-3 mb-4 min-h-[180px] max-h-[280px]">
                            {chatHistory.length === 0 ? (
                                <div className="chat-message flex gap-3">
                                    <div className="w-8 h-8 bg-primary/20 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">AI</div>
                                    <div className="bg-white/10 rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
                                        <p className="text-sm text-white">Hello! I'm Director, your AI video assistant with {DIRECTOR_AGENTS.length}+ specialized agents.</p>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-white/5 p-2 rounded">
                                                <span className="text-primary font-bold">🎬</span> Scene Detection
                                            </div>
                                            <div className="bg-white/5 p-2 rounded">
                                                <span className="text-primary font-bold">⚡</span> Highlights
                                            </div>
                                            <div className="bg-white/5 p-2 rounded">
                                                <span className="text-primary font-bold">💬</span> Subtitles
                                            </div>
                                            <div className="bg-white/5 p-2 rounded">
                                                <span className="text-primary font-bold">🎤</span> Dubbing
                                            </div>
                                        </div>
                                        <p className="text-xs text-primary mt-3">Select an agent or type a command below.</p>
                                    </div>
                                </div>
                            ) : (
                                chatHistory.map((msg, idx) => (
                                    <div key={idx} className="chat-message flex gap-3">
                                        {msg.isUser ? (
                                            <>
                                                <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 flex items-center justify-center text-black text-xs font-bold">YOU</div>
                                                <div className="bg-primary/20 rounded-2xl rounded-tr-sm p-3 max-w-[85%]">
                                                    <p className="text-sm text-white">{escapeHtml(msg.text)}</p>
                                                </div>
                                            </>
                                        ) : msg.isAction ? (
                                            <>
                                                <div className="w-8 h-8 bg-primary/20 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">✓</div>
                                                <div className="bg-green-500/20 rounded-2xl rounded-tr-sm p-3 max-w-[85%]">
                                                    <p className="text-sm text-white">{escapeHtml(msg.text)}</p>
                                                    {msg.agents.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-white/10">
                                                            <p className="text-xs text-secondary">Agents activated:</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {msg.agents.map((a, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{a}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-8 h-8 bg-primary/20 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">AI</div>
                                                <div className="bg-white/10 rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
                                                    <p className="text-sm text-white">{escapeHtml(msg.text)}</p>
                                                    {msg.agents.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-white/10">
                                                            <p className="text-xs text-secondary">Agents activated:</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {msg.agents.map((a, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{a}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Command Input */}
                        <div className="flex gap-3">
                            <input
                                ref={commandInputRef}
                                type="text"
                                placeholder="Type your command (e.g., 'Create a short clip of the best moment')"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-primary/50"
                                onKeyDown={handleCommandKeyDown}
                            />
                            <button
                                onClick={handleSendCommand}
                                className="px-6 py-3 bg-primary text-black text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                                Send
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Tools Panel */}
                <div className="w-80 border-l border-white/5 p-4 overflow-auto bg-black/30">
                    {/* Processing Status */}
                    <div ref={processingStatusRef} className="hidden mb-6">
                        <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            PROCESSING
                        </h4>
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="mb-3">
                                <span ref={processingTitleRef} className="text-sm text-white font-bold">Processing...</span>
                            </div>
                            <div ref={processingStepsRef} className="space-y-1 text-xs">
                            </div>
                            <div className="mt-3 pt-3 border-t border-white/10">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-secondary">Progress</span>
                                    <span ref={progressPercentRef} className="text-primary font-bold">0%</span>
                                </div>
                                <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div ref={progressBarRef} className="h-full bg-primary transition-all duration-300" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">QUICK ACTIONS</h3>
                    <div className="space-y-2">
                        {[
                            { action: 'summarize', icon: '📝', title: 'Summarize', desc: 'Generate video summary' },
                            { action: 'highlights', icon: '⚡', title: 'Extract Highlights', desc: 'Find best moments' },
                            { action: 'scenes', icon: '🎬', title: 'Detect Scenes', desc: 'Identify boundaries' },
                            { action: 'subtitles', icon: '💬', title: 'Add Subtitles', desc: 'Auto-generate captions' },
                            { action: 'dubbing', icon: '🎤', title: 'Dub Video', desc: 'Translate audio' },
                            { action: 'broll', icon: '🎞️', title: 'Add B-Roll', desc: 'Overlay footage' },
                            { action: 'voiceover', icon: '🎙️', title: 'Voiceover', desc: 'Add AI narration' },
                            { action: 'shorts', icon: '📱', title: 'Create Shorts', desc: 'TikTok/Reels/Shorts' },
                            { action: 'color', icon: '🎨', title: 'Color Correction', desc: 'Adjust colors' },
                            { action: 'stabilize', icon: '🪄', title: 'Stabilize', desc: 'Fix shaky footage' },
                        ].map(item => (
                            <button
                                key={item.action}
                                onClick={() => handleActionClick(item.action)}
                                className="action-btn w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer"
                                data-action={item.action}
                            >
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">{item.icon}</div>
                                <div>
                                    <div className="font-bold text-white text-sm">{item.title}</div>
                                    <div className="text-xs text-secondary">{item.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Video Timeline Preview */}
                    <div className="mt-6">
                        <h4 className="font-bold text-white text-sm mb-3">TIMELINE PREVIEW</h4>
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="h-16 bg-black/30 rounded relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-secondary">No timeline data</div>
                            </div>
                            <div className="flex justify-between text-xs text-secondary mt-2">
                                <span>0:00</span>
                                <span>--:--</span>
                            </div>
                        </div>
                    </div>

                    {/* Export Options */}
                    <div className="mt-6">
                        <h4 className="font-bold text-white text-sm mb-3">EXPORT</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {['mp4', 'webm', 'gif'].map(format => (
                                <button
                                    key={format}
                                    onClick={() => handleExport(format)}
                                    className="export-btn p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-center text-secondary hover:text-white transition-colors cursor-pointer"
                                    data-format={format}
                                >
                                    {format.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectorPage;