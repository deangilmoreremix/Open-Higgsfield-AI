import { navigate } from '../lib/router.js';
import { showToast } from '../lib/loading.js';
import { createHeroSection } from '../lib/thumbnails.js';
import { getSupabaseUrl, isSupabaseConfigured } from '../lib/supabase.js';

const AI_TOOLS = [
    { id: 'scene-detection', name: 'Scene Detection', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5"/></svg>', thumbnail: '/thumbnails/videoagent/scene-detection.png', color: 'blue', description: 'Identify scene boundaries', category: 'understanding' },
    { id: 'clip-segmentation', name: 'Clip Segmentation', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="8" height="16" rx="1"/><rect x="14" y="4" width="8" height="16" rx="1"/><line x1="12" y1="4" x2="12" y2="20" stroke-dasharray="2 2"/></svg>', thumbnail: '/thumbnails/videoagent/clip-segmentation.png', color: 'purple', description: 'Split into clip segments', category: 'editing' },
    { id: 'highlight-detection', name: 'Highlight Detection', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', thumbnail: '/thumbnails/videoagent/highlight-detection.png', color: 'orange', description: 'Find key moments', category: 'understanding' },
    { id: 'cosyvoice', name: 'CosyVoice', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>', thumbnail: '/thumbnails/videoagent/cosyvoice.png', color: 'pink', description: 'Voice cloning & TTS', category: 'audio' },
    { id: 'fish-speech', name: 'Fish Speech', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M2 10c1.5-1 3-1.5 4.5-1s3 1.5 4.5 1 3-1.5 4.5-1 3 1 4.5 1"/></svg>', thumbnail: '/thumbnails/videoagent/fish-speech.png', color: 'cyan', description: 'Voice synthesis', category: 'audio' },
    { id: 'seed-vc', name: 'Seed-VC', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M21 3l-7 7"/><path d="M3 3l7 7"/><path d="M3 21l7-7"/><path d="M21 21l-7-7"/></svg>', thumbnail: '/thumbnails/videoagent/seed-vc.png', color: 'teal', description: 'Voice conversion', category: 'audio' },
    { id: 'whisper', name: 'Whisper', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', thumbnail: '/thumbnails/videoagent/whisper.png', color: 'green', description: 'Audio transcription', category: 'audio' },
    { id: 'imagebind', name: 'ImageBind', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>', thumbnail: '/thumbnails/videoagent/imagebind.png', color: 'indigo', description: 'Multimodal understanding', category: 'understanding' },
    { id: 'dubbing', name: 'Cross-lingual Dub', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>', thumbnail: '/thumbnails/videoagent/dubbing.png', color: 'yellow', description: 'Translate & dub video', category: 'translate' },
    { id: 'color-correct', name: 'Color Correction', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22c-4.97 0-9-2.69-9-6v-.01C3 12.2 7.03 8.6 12 8.6s9 3.6 9 7.39V16c0 3.31-4.03 6-9 6z"/></svg>', thumbnail: '/thumbnails/videoagent/color-correct.png', color: 'rose', description: 'Adjust colors & tones', category: 'enhance' },
    { id: 'upscale', name: 'Video Upscale', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>', thumbnail: '/thumbnails/videoagent/upscale.png', color: 'emerald', description: 'Enhance resolution', category: 'enhance' },
    { id: 'stabilize', name: 'Stabilize', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>', thumbnail: '/thumbnails/videoagent/stabilize.png', color: 'violet', description: 'Fix shaky footage', category: 'enhance' },
];

const USE_CASES = [
    { id: 'standup', name: 'Stand-up Comedy', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>', thumbnail: '/thumbnails/videoagent/standup.png', description: 'Transform video with comedy timing' },
    { id: 'commentary', name: 'Commentary', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', thumbnail: '/thumbnails/videoagent/commentary.png', description: 'Add AI commentary overlay' },
    { id: 'overview', name: 'Video Overview', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>', thumbnail: '/thumbnails/videoagent/overview.png', description: 'Generate summary overview' },
    { id: 'meme', name: 'Meme Generator', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10"/><path d="M7 12h4"/><path d="M7 16h6"/></svg>', thumbnail: '/thumbnails/videoagent/meme.png', description: 'Create meme videos' },
    { id: 'music-video', name: 'Music Video', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', thumbnail: '/thumbnails/videoagent/music-video.png', description: 'Set video to music' },
    { id: 'qa', name: 'Video Q&A', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', thumbnail: '/thumbnails/videoagent/qa.png', description: 'Interactive video Q&A' },
];

export function VideoAgentPage() {
    const container = document.createElement('div');
    container.className = 'w-full h-full bg-app-bg text-white font-sans';

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        body { background:#0b0b0c; }

        .card {
          background: rgba(17,17,17,0.9);
          backdrop-filter: blur(20px);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:1.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }

        .subtle-card {
          background: rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.05);
          border-radius:1rem;
          transition: all 0.25s ease;
        }

        .subtle-card:hover {
          border-color: rgba(139,92,246,0.3);
          transform: translateY(-2px);
        }

        .goal-btn {
          background: rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.08);
          padding:12px 14px;
          border-radius:12px;
          font-size:14px;
          text-align:left;
          transition: all 0.25s ease;
        }

        .goal-btn:hover {
          border-color: rgba(139,92,246,0.3);
          background: rgba(255,255,255,0.08);
          transform: translateY(-2px);
        }

        .primary-btn {
          background:#a855f7;
          color:black;
          font-weight:900;
          border-radius:12px;
          padding:10px 16px;
          transition: all 0.2s ease;
        }

        .primary-btn:hover {
          transform: scale(1.04);
          box-shadow: 0 0 20px rgba(168,85,247,0.6);
        }

        .ghost-btn {
          background: rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.88);
          border-radius: 12px;
          padding: 10px 14px;
          transition: all 0.2s ease;
        }

        .ghost-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(139,92,246,0.25);
        }

        .hero-banner {
          position: relative;
          overflow: hidden;
          min-height: 180px;
          background:
            radial-gradient(circle at 20% 20%, rgba(168,85,247,0.25), transparent 30%),
            radial-gradient(circle at 80% 30%, rgba(59,130,246,0.18), transparent 30%),
            linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
        }

        .hero-banner::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(17,17,17,0.95), rgba(17,17,17,0.25), transparent);
          pointer-events: none;
        }

        .status-pill {
          background: rgba(168,85,247,0.12);
          border: 1px solid rgba(168,85,247,0.25);
          color: #d8b4fe;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 700;
        }

        .timeline-track {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          min-height: 56px;
        }

        .timeline-block {
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(168,85,247,0.32), rgba(255,255,255,0.08));
          border: 1px solid rgba(168,85,247,0.22);
          color: rgba(255,255,255,0.92);
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .mini-label {
          color: rgba(255,255,255,0.42);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .chat-bubble-user {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 10px 12px;
        }

        .chat-bubble-agent {
          background: rgba(168,85,247,0.08);
          border: 1px solid rgba(168,85,247,0.16);
          border-radius: 14px;
          padding: 10px 12px;
        }

        .progress-bar {
          background: linear-gradient(90deg, #a855f7, #c084fc);
          box-shadow: 0 0 18px rgba(168,85,247,0.45);
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: 240px minmax(0, 1.7fr) 300px;
          gap: 1rem;
          align-items: start;
        }

        .preview-stage {
          position: relative;
          min-height: 620px;
          border-radius: 1.25rem;
          background:
            radial-gradient(circle at center, rgba(168,85,247,0.08), transparent 35%),
            #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .preview-stage video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          background: #000;
        }

        @media (max-width: 1535px) {
          .workspace-grid {
            grid-template-columns: 220px minmax(0, 1.55fr) 280px;
          }

          .preview-stage {
            min-height: 560px;
          }
        }

        @media (max-width: 1279px) {
          .workspace-grid {
            grid-template-columns: 1fr;
          }

          .preview-stage {
            min-height: 480px;
          }
        }
    `;
    container.appendChild(style);

    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('videoId') || '';
    const videoUrl = urlParams.get('videoUrl') || '';

    let jobs = [];
    let currentProgress = 0;
    
    container.innerHTML = `
<div class="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">

  <!-- TOP BAR -->
  <div class="w-full flex items-center justify-between px-6 py-4 card">
    <div class="flex items-center gap-4">
      <div>
        <div class="font-black text-lg leading-none">VideoAgent</div>
        <div class="text-xs text-white/50 mt-1">Project: Summer Campaign Edit</div>
      </div>
      <span class="status-pill">AI READY</span>
    </div>
    <div class="flex items-center gap-3">
      <button class="ghost-btn">Version History</button>
      <button class="ghost-btn">Save</button>
      <button class="primary-btn">Export</button>
    </div>
  </div>

  <!-- HERO -->
  <div class="card hero-banner p-6 md:p-8 flex items-end">
    <div class="relative z-10 max-w-3xl">
      <div class="text-xs text-white/50 font-bold tracking-[0.25em] mb-3">AI VIDEO AGENT WORKSPACE</div>
      <h1 class="text-3xl md:text-5xl font-black tracking-tight mb-2">Edit, repurpose, and direct videos with AI.</h1>
      <p class="text-sm md:text-base text-white/65 max-w-2xl">Use Director-style planning, ArcReel-style job flow, and FireRed-style editing actions inside one cinematic workspace built in the Storyboard theme.</p>
      <div class="flex flex-wrap gap-3 mt-5">
        <button class="primary-btn" id="start-ai-plan">Start With AI Plan</button>
        <button class="ghost-btn">Open Existing Project</button>
      </div>
    </div>
  </div>

  <!-- FEATURES -->
  <div class="card p-4 md:p-6">
    <h2 class="text-xl font-black text-white mb-1">Agent Capabilities</h2>
    <p class="text-sm text-muted mb-6">Built like a premium storyboard app, but designed for AI-powered editing workflows.</p>
    <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="subtle-card p-4">
        <div class="text-3xl mb-3">🎬</div>
        <div class="font-black mb-1">Goal-Based Editing</div>
        <div class="text-sm text-white/55">Tell the agent what outcome you want instead of manually chaining tools together.</div>
      </div>
      <div class="subtle-card p-4">
        <div class="text-3xl mb-3">🧠</div>
        <div class="font-black mb-1">AI Planning</div>
        <div class="text-sm text-white/55">The agent builds a task plan for highlights, shorts, captions, dubbing, and quality improvements.</div>
      </div>
      <div class="subtle-card p-4">
        <div class="text-3xl mb-3">📝</div>
        <div class="font-black mb-1">Timeline + Outputs</div>
        <div class="text-sm text-white/55">Review scenes, generated clips, captions, and timeline changes from one unified workspace.</div>
      </div>
      <div class="subtle-card p-4">
        <div class="text-3xl mb-3">✨</div>
        <div class="font-black mb-1">Premium Workflow UX</div>
        <div class="text-sm text-white/55">Storyboard-style cards, polished interaction states, and a cinematic editing environment.</div>
      </div>
    </div>
  </div>

  <!-- QUICK ACTIONS -->
  <div class="card p-4 md:p-6">
    <h2 class="text-xl font-black text-white mb-1">Quick Actions</h2>
    <p class="text-sm text-white/50 mb-6">Launch the agent with common editing goals.</p>
    <div class="flex flex-wrap gap-3" id="quick-actions">
      <button class="goal-btn" data-prompt="Create highlights from this video">Create Highlights</button>
      <button class="goal-btn" data-prompt="Make 3 short vertical clips">Make Shorts</button>
      <button class="goal-btn" data-prompt="Add captions to this video">Add Captions</button>
      <button class="goal-btn" data-prompt="Dub this video into Spanish">Dub Video</button>
      <button class="goal-btn" data-prompt="Improve video quality and pacing">Improve Quality</button>
      <button class="goal-btn" data-prompt="Build a trailer cut from this video">Build Trailer</button>
    </div>
  </div>

  <!-- EXAMPLE OUTPUTS -->
  <div class="card p-4 md:p-6">
    <h2 class="text-xl font-black text-white mb-1">Example Outputs</h2>
    <p class="text-sm text-white/50 mb-6">Preview the kinds of transformations the agent can create.</p>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="subtle-card p-4 cursor-pointer">
        <div class="mb-3"><span class="status-pill">HIGHLIGHTS</span></div>
        <div class="text-white/80 text-sm">Three high-energy clips pulled from the strongest moments in your source video.</div>
      </div>
      <div class="subtle-card p-4 cursor-pointer">
        <div class="mb-3"><span class="status-pill">CAPTIONS</span></div>
        <div class="text-white/80 text-sm">Clean branded captions generated from transcript timing and scene pacing.</div>
      </div>
      <div class="subtle-card p-4 cursor-pointer">
        <div class="mb-3"><span class="status-pill">SHORTS</span></div>
        <div class="text-white/80 text-sm">Vertical edits with tighter pacing, stronger hooks, and mobile-first framing.</div>
      </div>
    </div>
  </div>

  <!-- MAIN WORKSPACE -->
  <div class="workspace-grid">

    <!-- LEFT: GOALS + JOBS -->
    <div class="space-y-4">
      <div class="card p-4 flex flex-col gap-3">
        <div class="mini-label mb-1">AGENT GOALS</div>
        <button class="goal-btn">🎬 Create Highlights</button>
        <button class="goal-btn">📱 Make Shorts</button>
        <button class="goal-btn">📝 Add Captions</button>
        <button class="goal-btn">🌍 Dub Video</button>
        <button class="goal-btn">✨ Improve Quality</button>
      </div>

      <div class="card p-4">
        <div class="mini-label mb-3">JOB CENTER</div>
        <div class="space-y-3" id="job-list">
          <div class="subtle-card p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="text-sm font-bold">Current Session</div>
              <div class="text-xs text-white/45">Idle</div>
            </div>
            <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div id="job-progress" class="progress-bar h-full w-0 rounded-full"></div>
            </div>
            <div class="text-xs text-white/45 mt-2" id="job-status-text">Waiting for a goal...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CENTER -->
    <div class="space-y-4">
      <div class="card p-4 md:p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="mini-label mb-1">VIDEO PREVIEW</div>
            <div class="text-sm text-white/55">Source video, generated cuts, and scene-aware review.</div>
          </div>
          <div class="flex gap-2">
            <button class="ghost-btn">Original</button>
            <button class="primary-btn">AI Version</button>
          </div>
        </div>
        <div class="preview-stage">
          <video id="video" controls aria-label="Video preview player"></video>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="text-center px-6">
              <div class="text-6xl mb-4 opacity-70">▶</div>
              <div class="text-base text-white/55 font-medium">Preview the current working cut here</div>
              <div class="text-sm text-white/35 mt-2">Large native HTML5 video stage — not an iframe</div>
            </div>
          </div>
        </div>
        <div class="grid md:grid-cols-3 gap-3 mt-4">
          <div class="subtle-card p-3">
            <div class="mini-label mb-2">SOURCE</div>
            <div class="text-sm">Summer-Campaign-Full.mp4</div>
            <div class="text-xs text-white/45 mt-1">03:42 • 1080p • 16:9</div>
          </div>
          <div class="subtle-card p-3">
            <div class="mini-label mb-2">SCENES</div>
            <div class="text-sm">12 detected scenes</div>
            <div class="text-xs text-white/45 mt-1">Hook, demo, proof, CTA</div>
          </div>
          <div class="subtle-card p-3">
            <div class="mini-label mb-2">ACTIVE OUTPUT</div>
            <div class="text-sm">AI Short v2</div>
            <div class="text-xs text-white/45 mt-1">Captioned vertical export</div>
          </div>
        </div>
      </div>

      <div class="card p-4 md:p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="mini-label mb-1">TIMELINE</div>
            <div class="text-sm text-white/55">Scene structure, captions, and AI-generated edits.</div>
          </div>
          <div class="text-xs text-white/40">00:00 — 03:42</div>
        </div>

        <div class="space-y-3">
          <div>
            <div class="mini-label mb-2">VIDEO TRACK</div>
            <div class="timeline-track p-3 flex items-center gap-2 overflow-x-auto">
              <div class="timeline-block" style="width: 80px">Hook</div>
              <div class="timeline-block" style="width: 100px">Demo</div>
              <div class="timeline-block" style="width: 90px">Social Proof</div>
              <div class="timeline-block" style="width: 110px">Offer</div>
              <div class="timeline-block" style="width: 82px">CTA</div>
            </div>
          </div>

          <div>
            <div class="mini-label mb-2">CAPTION TRACK</div>
            <div class="timeline-track p-3 flex items-center gap-2 overflow-x-auto">
              <div class="timeline-block" style="width: 70px">Cap 1</div>
              <div class="timeline-block" style="width: 90px">Cap 2</div>
              <div class="timeline-block" style="width: 85px">Cap 3</div>
              <div class="timeline-block" style="width: 75px">Cap 4</div>
              <div class="timeline-block" style="width: 100px">Cap 5</div>
            </div>
          </div>

          <div>
            <div class="mini-label mb-2">AI SUGGESTIONS</div>
            <div class="timeline-track p-3 flex items-center gap-2 overflow-x-auto">
              <div class="timeline-block" style="width: 120px">Tighten Intro</div>
              <div class="timeline-block" style="width: 135px">Boost Hook</div>
              <div class="timeline-block" style="width: 145px">Shorten Pause</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="space-y-4">
      <div class="card flex flex-col min-h-[620px]">
        <div class="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div class="mini-label mb-1">AI AGENT</div>
            <div class="text-sm text-white/55">Chat with the editing agent and review its plan.</div>
          </div>
          <span class="status-pill">LIVE</span>
        </div>

        <div class="px-4 pt-4 grid grid-cols-3 gap-2">
          <button class="ghost-btn text-xs">Chat</button>
          <button class="ghost-btn text-xs">Outputs</button>
          <button class="ghost-btn text-xs">Inspector</button>
        </div>

        <div id="chat" class="flex-1 overflow-y-auto p-4 space-y-3">
          <div class="chat-bubble-agent text-sm text-white/80">I can plan edits, create shorts, add captions, improve pacing, and help you build new video versions.</div>
          <div class="chat-bubble-agent text-sm text-white/80">Try: "Make 3 short clips from the strongest moments."</div>
        </div>

        <div class="p-4 border-t border-white/10 space-y-3">
          <div class="subtle-card p-3">
            <div class="mini-label mb-2">CURRENT PLAN</div>
            <div id="plan-preview" class="text-sm text-white/65">No active plan yet.</div>
          </div>
          <input id="input" placeholder="Tell the agent what to do..." class="w-full bg-black/50 px-3 py-3 rounded-xl border border-white/10 focus:border-purple-500 outline-none" />
        </div>
      </div>
    </div>

  </div>

</div>
`;

    // Add JavaScript functionality
    const script = document.createElement('script');
    script.textContent = `
function parseIntent(input) {
  const normalized = input.toLowerCase();
  if (normalized.includes('highlight')) return 'highlights';
  if (normalized.includes('short')) return 'shorts';
  if (normalized.includes('caption')) return 'captions';
  if (normalized.includes('dub')) return 'dub';
  if (normalized.includes('quality') || normalized.includes('improve')) return 'enhance';
  return 'unknown';
}

function planTasks(intent) {
  const plans = {
    highlights: ['scene-detect', 'score-moments', 'cut-clips', 'export'],
    shorts: ['detect-hooks', 'resize-vertical', 'caption', 'export'],
    captions: ['transcribe', 'generate-captions', 'overlay'],
    dub: ['transcribe', 'translate', 'tts', 'replace-audio'],
    enhance: ['analyze-quality', 'improve-pacing', 'color-balance', 'export']
  };
  return plans[intent] || ['analyze-video', 'build-plan'];
}

let jobs = [];
let currentProgress = 0;

async function runTasks(tasks) {
  const progressBar = document.getElementById('job-progress');
  const statusText = document.getElementById('job-status-text');
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    log('Running: ' + t, 'agent');
    statusText.textContent = 'Running ' + t + '...';
    currentProgress = Math.round(((i + 1) / tasks.length) * 100);
    progressBar.style.width = currentProgress + '%';
    await new Promise(r => setTimeout(r, 700));
  }
  statusText.textContent = 'Plan completed.';
  log('✅ Done', 'agent');
}

function createJob(tasks) {
  const job = { id: Date.now(), tasks, status: 'running' };
  jobs.push(job);
  executeJob(job);
}

async function executeJob(job) {
  await runTasks(job.tasks);
  job.status = 'done';
}

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const planPreview = document.getElementById('plan-preview');

input.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const val = input.value.trim();
    if (!val) return;
    input.value = '';

    log(val, 'user');
    const intent = parseIntent(val);
    const tasks = planTasks(intent);
    const planText = tasks.join(' → ');
    log('Plan: ' + planText, 'agent');
    planPreview.textContent = planText;
    createJob(tasks);
  }
});

function log(text, type = 'agent') {
  const el = document.createElement('div');
  el.className = type === 'user' ? 'chat-bubble-user text-sm text-white/85' : 'chat-bubble-agent text-sm text-white/80';
  el.textContent = type === 'user' ? 'You: ' + text : 'Agent: ' + text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

document.querySelectorAll('#quick-actions [data-prompt]').forEach(btn => {
  btn.addEventListener('click', () => {
    input.value = btn.dataset.prompt;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  });
});

// Handle start AI plan button
document.getElementById('start-ai-plan').addEventListener('click', () => {
  log('Starting AI planning session...', 'agent');
  planPreview.textContent = 'Analyzing video → Building plan → Ready for execution';
});
    `;
    container.appendChild(script);

    return container;
}
            const usecaseId = btn.dataset.usecase;
            const usecase = USE_CASES.find(u => u.id === usecaseId);
            runUseCase(usecase);
        };
    });
    
    // Full pipeline button
    container.querySelector('#run-full-pipeline').onclick = async () => {
        await runFullPipeline();
    };
    
    // Cancel processing
    container.querySelector('#cancel-processing').onclick = () => {
        container.querySelector('#processing-modal').classList.add('hidden');
        isProcessing = false;
        showToast('Processing cancelled', 'info');
    };
    
    const runTool = async (tool) => {
        if (isProcessing) {
            showToast('Already processing', 'error');
            return;
        }
        
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            showToast('Backend not configured. Using offline mode.', 'info');
            await simulateToolProcessing(tool);
            return;
        }
        
        // Validate video is loaded
        if (!videoId && !videoUrl) {
            showToast('Please load a video first', 'error');
            return;
        }
        
        isProcessing = true;
        addToQueue(tool.name, 'pending');
        
        const modal = container.querySelector('#processing-modal');
        const nameEl = container.querySelector('#processing-name');
        const stepsEl = container.querySelector('#processing-steps');
        const progressBar = container.querySelector('#modal-progress-bar');
        const percentEl = container.querySelector('#processing-percent');
        
        nameEl.textContent = tool.description;
        modal.classList.remove('hidden');
        
        try {
            // Call the videoagent API
            const supabaseUrl = getSupabaseUrl();
            const response = await fetch(`${supabaseUrl}/functions/v1/videoagent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'process-tool',
                    tool: tool.id,
                    toolName: tool.name,
                    videoId: videoId,
                    videoUrl: videoUrl,
                    settings: {
                        quality: container.querySelector('select')?.value || '1080p',
                        format: container.querySelectorAll('select')[1]?.value || 'MP4'
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const result = await response.json();
            
            // If we get a jobId, poll for completion
            if (result.jobId) {
                await pollToolJob(result.jobId, tool, stepsEl, progressBar, percentEl, abortController.signal);
            } else if (result.status === 'completed') {
                // Direct completion
                updateProgress(stepsEl, progressBar, percentEl, 100);
                await new Promise(r => setTimeout(r, 500));
            } else {
                // Fallback to simulation if no proper response
                throw new Error('Invalid response');
            }
            
            modal.classList.add('hidden');
            isProcessing = false;
            updateQueueItem(tool.name, 'complete');
            showResults(tool);
            showToast(`${tool.name} completed!`, 'success');
            
        } catch (error) {
            console.error('[VideoAgent] Tool error:', error);
            showToast('Processing failed. Using offline mode.', 'error');
            modal.classList.add('hidden');
            
            // Fallback to simulation
            await simulateToolProcessing(tool);
        }
    };
    
    const runUseCase = async (usecase) => {
        if (isProcessing) {
            showToast('Already processing', 'error');
            return;
        }
        
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            showToast('Backend not configured. Using offline mode.', 'info');
            await simulateUseCaseProcessing(usecase);
            return;
        }
        
        // Validate video is loaded
        if (!videoId && !videoUrl) {
            showToast('Please load a video first', 'error');
            return;
        }
        
        isProcessing = true;
        addToQueue(usecase.name, 'pending');
        
        const modal = container.querySelector('#processing-modal');
        const nameEl = container.querySelector('#processing-name');
        const stepsEl = container.querySelector('#processing-steps');
        const progressBar = container.querySelector('#modal-progress-bar');
        const percentEl = container.querySelector('#processing-percent');
        
        nameEl.textContent = usecase.description;
        modal.classList.remove('hidden');
        
        try {
            const supabaseUrl = getSupabaseUrl();
            const response = await fetch(`${supabaseUrl}/functions/v1/videoagent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'process-usecase',
                    usecase: usecase.id,
                    usecaseName: usecase.name,
                    videoId: videoId,
                    videoUrl: videoUrl
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.jobId) {
                await pollToolJob(result.jobId, { name: usecase.name }, stepsEl, progressBar, percentEl, abortController.signal);
            } else if (result.status === 'completed') {
                updateProgress(stepsEl, progressBar, percentEl, 100);
                await new Promise(r => setTimeout(r, 500));
            } else {
                throw new Error('Invalid response');
            }
            
            modal.classList.add('hidden');
            isProcessing = false;
            updateQueueItem(usecase.name, 'complete');
            showResults({ name: usecase.name, icon: usecase.icon });
            showToast(`${usecase.name} completed!`, 'success');
            
        } catch (error) {
            console.error('[VideoAgent] UseCase error:', error);
            showToast('Processing failed. Using offline mode.', 'error');
            modal.classList.add('hidden');
            await simulateUseCaseProcessing(usecase);
        }
    };
    
    const runFullPipeline = async () => {
        if (isProcessing) {
            showToast('Already processing', 'error');
            return;
        }
        
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            showToast('Backend not configured. Using offline mode.', 'info');
            await simulateFullPipeline();
            return;
        }
        
        // Validate video is loaded
        if (!videoId && !videoUrl) {
            showToast('Please load a video first', 'error');
            return;
        }
        
        isProcessing = true;
        
        const modal = container.querySelector('#processing-modal');
        const nameEl = container.querySelector('#processing-name');
        const stepsEl = container.querySelector('#processing-steps');
        const progressBar = container.querySelector('#modal-progress-bar');
        const percentEl = container.querySelector('#processing-percent');
        
        nameEl.textContent = 'Running full AI processing pipeline';
        modal.classList.remove('hidden');
        
        try {
            const supabaseUrl = getSupabaseUrl();
            const response = await fetch(`${supabaseUrl}/functions/v1/videoagent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'full-pipeline',
                    videoId: videoId,
                    videoUrl: videoUrl,
                    settings: {
                        quality: '1080p',
                        format: 'MP4'
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.jobId) {
                await pollPipelineJob(result.jobId, stepsEl, progressBar, percentEl, abortController.signal);
            } else if (result.status === 'completed') {
                updateProgress(stepsEl, progressBar, percentEl, 100);
                await new Promise(r => setTimeout(r, 500));
            } else {
                throw new Error('Invalid response');
            }
            
            modal.classList.add('hidden');
            isProcessing = false;
            showToast('Full pipeline completed!', 'success');
            
        } catch (error) {
            console.error('[VideoAgent] Pipeline error:', error);
            showToast('Pipeline failed. Using offline mode.', 'error');
            modal.classList.add('hidden');
            await simulateFullPipeline();
        }
    };
    
    const addToQueue = (name, status) => {
        processingQueue.push({ name, status, id: Date.now() });
        renderQueue();
    };
    
    const updateQueueItem = (name, status) => {
        const item = processingQueue.find(q => q.name === name);
        if (item) item.status = status;
        renderQueue();
    };
    
    const renderQueue = () => {
        const queueEl = container.querySelector('#queue-list');
        
        if (processingQueue.length === 0) {
            queueEl.innerHTML = '<div class="text-sm text-muted italic p-2">No jobs in queue</div>';
            return;
        }
        
        queueEl.innerHTML = processingQueue.map(item => `
            <div class="flex items-center gap-2 p-2 bg-white/5 rounded-xl">
                ${item.status === 'complete' ? `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-primary">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                ` : item.status === 'running' ? `
                    <div class="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full"></div>
                ` : `
                    <span class="w-3 h-3 rounded-full bg-muted"></span>
                `}
                <span class="text-xs text-white flex-1">${item.name}</span>
            </div>
        `).join('');
    };
    
    const showResults = (tool) => {
        const resultsPanel = container.querySelector('#results-panel');
        const resultsContent = container.querySelector('#results-content');
        
        resultsPanel.classList.remove('hidden');
        
        const resultEl = document.createElement('div');
        resultEl.className = 'p-3 bg-white/5 rounded-xl flex items-center gap-3';
        resultEl.innerHTML = `
            <div class="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">${tool.icon || '✓'}</span>
            </div>
            <div class="flex-1">
                <div class="text-sm text-white font-bold">${tool.name}</div>
                <div class="text-xs text-secondary">Completed successfully</div>
            </div>
            <button class="p-2 hover:bg-white/10 rounded-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-secondary">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
            </button>
        `;
        
        resultsContent.insertBefore(resultEl, resultsContent.firstChild);
    };
    
    const getToolSteps = (toolId) => {
        const stepsMap = {
            'scene-detection': ['Analyzing video frames...', 'Detecting scene changes...', 'Labeling scenes...', 'Generating scene map...'],
            'clip-segmentation': ['Identifying segment boundaries...', 'Creating clip markers...', 'Optimizing cut points...', 'Finalizing segments...'],
            'highlight-detection': ['Analyzing content...', 'Scoring moments...', 'Ranking highlights...', 'Extracting clips...'],
            'cosyvoice': ['Loading voice model...', 'Processing audio...', 'Generating voice...', 'Finalizing output...'],
            'fish-speech': ['Synthesizing speech...', 'Applying voice characteristics...', 'Optimizing audio...', 'Complete!'],
            'seed-vc': ['Analyzing source voice...', 'Processing conversion...', 'Applying target voice...', 'Done!'],
            'whisper': ['Extracting audio...', 'Transcribing speech...', 'Formatting text...', 'Complete!'],
            'imagebind': ['Binding modalities...', 'Analyzing content...', 'Generating insights...', 'Complete!'],
            'dubbing': ['Translating content...', 'Synthesizing speech...', 'Syncing to video...', 'Complete!'],
            'color-correct': ['Analyzing color palette...', 'Applying corrections...', 'Balancing tones...', 'Final render...'],
            'upscale': ['Analyzing frames...', 'Enhancing resolution...', 'Applying AI scaling...', 'Complete!'],
            'stabilize': ['Analyzing motion...', 'Computing vectors...', 'Applying stabilization...', 'Done!'],
        };
        return stepsMap[toolId] || ['Processing...', 'Finalizing...'];
    };
    
    const getUseCaseSteps = (usecaseId) => {
        const stepsMap = {
            'standup': ['Analyzing content...', 'Detecting pacing...', 'Adding comedy timing...', 'Optimizing delivery...'],
            'commentary': ['Analyzing video...', 'Generating commentary...', 'Syncing overlay...', 'Complete!'],
            'overview': ['Summarizing content...', 'Generating chapters...', 'Creating overview...', 'Done!'],
            'meme': ['Analyzing frames...', 'Generating captions...', 'Applying effects...', 'Complete!'],
            'music-video': ['Analyzing audio...', 'Syncing to beat...', 'Adding effects...', 'Done!'],
            'qa': ['Analyzing content...', 'Generating questions...', 'Creating interaction...', 'Complete!'],
        };
        return stepsMap[usecaseId] || ['Processing...', 'Finalizing...'];
    };
    
    // ==========================================
    // API HELPER FUNCTIONS (need container access)
    // ==========================================
    
    function getModalElements() {
        return {
            modal: container.querySelector('#processing-modal'),
            nameEl: container.querySelector('#processing-name'),
            stepsEl: container.querySelector('#processing-steps'),
            progressBar: container.querySelector('#modal-progress-bar'),
            percentEl: container.querySelector('#processing-percent'),
            queueList: container.querySelector('#queue-list'),
            resultsPanel: container.querySelector('#results-panel'),
            resultsContent: container.querySelector('#results-content')
        };
    }
    
    // Poll for tool/job completion
    async function pollToolJob(jobId, tool, stepsEl, progressBar, percentEl, abortSignal) {
        const supabaseUrl = getSupabaseUrl();
        const maxAttempts = 60;
        const steps = getToolSteps(tool.id || '');

        for (let i = 0; i < maxAttempts; i++) {
            if (abortSignal?.aborted) return;
            try {
                if (abortSignal?.aborted) return;
                const response = await fetch(`${supabaseUrl}/functions/v1/videoagent?jobId=${jobId}`);
                const result = await response.json();
                
                if (result.status === 'completed') {
                    updateProgress(stepsEl, progressBar, percentEl, 100);
                    return;
                } else if (result.status === 'failed') {
                    throw new Error(result.error || 'Job failed');
                } else if (result.currentStep) {
                    const stepIndex = Math.min(result.currentStep - 1, steps.length - 1);
                    updateStepsDisplay(stepsEl, steps, stepIndex);
                    const percent = Math.round(((stepIndex + 1) / steps.length) * 100);
                    updateProgress(stepsEl, progressBar, percentEl, percent);
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error('[VideoAgent] Poll error:', error);
                throw error;
            }
        }
        
        throw new Error('Job timed out');
    }
    
    // Poll for pipeline completion
    async function pollPipelineJob(jobId, stepsEl, progressBar, percentEl, abortSignal) {
        const supabaseUrl = getSupabaseUrl();
        const maxAttempts = 120;
        const pipelineSteps = [
            { name: 'Scene Detection', steps: ['Analyzing frames...', 'Identifying boundaries...', 'Labeling scenes...'] },
            { name: 'Clip Segmentation', steps: ['Splitting video...', 'Creating segments...', 'Optimizing cuts...'] },
            { name: 'Highlight Detection', steps: ['Finding key moments...', 'Scoring highlights...', 'Ranking clips...'] },
            { name: 'Transcription', steps: ['Audio extraction...', 'Whisper transcription...', 'Text formatting...'] },
            { name: 'Color Correction', steps: ['Analyzing colors...', 'Balancing tones...', 'Applying LUTs...'] },
            { name: 'Final Export', steps: ['Merging outputs...', 'Encoding video...', 'Finalizing...'] }
        ];
        
        let totalSteps = pipelineSteps.reduce((sum, j) => sum + j.steps.length, 0);
        
        for (let i = 0; i < maxAttempts; i++) {
            if (abortSignal?.aborted) return;
            try {
                if (abortSignal?.aborted) return;
                const response = await fetch(`${supabaseUrl}/functions/v1/videoagent?jobId=${jobId}`);
                const result = await response.json();
                
                if (result.status === 'completed') {
                    updateProgress(stepsEl, progressBar, percentEl, 100);
                    return;
                } else if (result.status === 'failed') {
                    throw new Error(result.error || 'Job failed');
                } else if (result.currentStep) {
                    const stepIndex = Math.min(result.currentStep - 1, totalSteps - 1);
                    const percent = Math.round(((stepIndex + 1) / totalSteps) * 100);
                    updateProgress(stepsEl, progressBar, percentEl, percent);
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error('[VideoAgent] Pipeline poll error:', error);
                throw error;
            }
        }
        
        throw new Error('Pipeline job timed out');
    }
    
    // Update progress bar and percentage
    function updateProgress(stepsEl, progressBar, percentEl, percent) {
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (percentEl) percentEl.textContent = `${percent}%`;
    }
    
    // Update steps display during polling
    function updateStepsDisplay(stepsEl, steps, currentIndex) {
        if (!stepsEl) return;
        stepsEl.innerHTML = steps.map((s, idx) => `
            <div class="flex items-center gap-2 text-sm ${idx <= currentIndex ? 'text-white' : 'text-muted'}">
                <span class="w-1.5 h-1.5 rounded-full ${idx < currentIndex ? 'bg-primary' : idx === currentIndex ? 'bg-primary animate-pulse' : 'bg-muted'}"></span>
                ${s}
            </div>
        `).join('');
    }
    
    // Fallback simulation for tool processing
    async function simulateToolProcessing(tool) {
        const m = getModalElements();
        isProcessing = true;
        addToQueue(tool.name, 'pending');
        
        m.nameEl.textContent = tool.description;
        m.modal.classList.remove('hidden');
        
        const steps = getToolSteps(tool.id);
        
        for (let i = 0; i < steps.length; i++) {
            m.stepsEl.innerHTML = steps.map((s, idx) => `
                <div class="flex items-center gap-2 text-sm ${idx <= i ? 'text-white' : 'text-muted'}">
                    <span class="w-1.5 h-1.5 rounded-full ${idx < i ? 'bg-primary' : idx === i ? 'bg-primary animate-pulse' : 'bg-muted'}"></span>
                    ${s}
                </div>
            `).join('');
            
            const percent = Math.round(((i + 1) / steps.length) * 100);
            m.progressBar.style.width = `${percent}%`;
            m.percentEl.textContent = `${percent}%`;
            
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        }
        
        m.modal.classList.add('hidden');
        isProcessing = false;
        updateQueueItem(tool.name, 'complete');
        showResults(tool);
        showToast(`${tool.name} completed!`, 'success');
    }
    
    // Fallback simulation for use case processing
    async function simulateUseCaseProcessing(usecase) {
        const m = getModalElements();
        isProcessing = true;
        addToQueue(usecase.name, 'pending');
        
        m.nameEl.textContent = usecase.description;
        m.modal.classList.remove('hidden');
        
        const steps = getUseCaseSteps(usecase.id);
        
        for (let i = 0; i < steps.length; i++) {
            m.stepsEl.innerHTML = steps.map((s, idx) => `
                <div class="flex items-center gap-2 text-sm ${idx <= i ? 'text-white' : 'text-muted'}">
                    <span class="w-1.5 h-1.5 rounded-full ${idx < i ? 'bg-primary' : idx === i ? 'bg-primary animate-pulse' : 'bg-muted'}"></span>
                    ${s}
                </div>
            `).join('');
            
            const percent = Math.round(((i + 1) / steps.length) * 100);
            m.progressBar.style.width = `${percent}%`;
            m.percentEl.textContent = `${percent}%`;
            
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
        }
        
        m.modal.classList.add('hidden');
        isProcessing = false;
        updateQueueItem(usecase.name, 'complete');
        showResults({ name: usecase.name, icon: usecase.icon });
        showToast(`${usecase.name} completed!`, 'success');
    }
    
    // Fallback simulation for full pipeline
    async function simulateFullPipeline() {
        const m = getModalElements();
        isProcessing = true;
        
        m.nameEl.textContent = 'Running full AI processing pipeline (offline mode)';
        m.modal.classList.remove('hidden');
        
        const jobs = [
            { name: 'Scene Detection', steps: ['Analyzing frames...', 'Identifying boundaries...', 'Labeling scenes...'] },
            { name: 'Clip Segmentation', steps: ['Splitting video...', 'Creating segments...', 'Optimizing cuts...'] },
            { name: 'Highlight Detection', steps: ['Finding key moments...', 'Scoring highlights...', 'Ranking clips...'] },
            { name: 'Transcription', steps: ['Audio extraction...', 'Whisper transcription...', 'Text formatting...'] },
            { name: 'Color Correction', steps: ['Analyzing colors...', 'Balancing tones...', 'Applying LUTs...'] },
            { name: 'Final Export', steps: ['Merging outputs...', 'Encoding video...', 'Finalizing...'] }
        ];
        
        let totalSteps = jobs.reduce((sum, j) => sum + j.steps.length, 0);
        let completedSteps = 0;
        
        for (const job of jobs) {
            addToQueue(job.name, 'running');
            
            for (const step of job.steps) {
                m.stepsEl.innerHTML = `
                    <div class="text-sm text-white font-bold mb-2">${job.name}</div>
                    ${job.steps.map((s, idx) => `
                        <div class="flex items-center gap-2 text-sm ${s === step ? 'text-white' : 'text-muted'}">
                            <span class="w-1.5 h-1.5 rounded-full ${s === step ? 'bg-primary animate-pulse' : 'bg-green-500'}"></span>
                            ${s}
                        </div>
                    `).join('')}
                `;
                
                const percent = Math.round(((completedSteps + 1) / totalSteps) * 100);
                m.progressBar.style.width = `${percent}%`;
                m.percentEl.textContent = `${percent}%`;
                
                await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
                completedSteps++;
            }
            
            updateQueueItem(job.name, 'complete');
        }
        
        m.modal.classList.add('hidden');
        isProcessing = false;
        showToast('Full pipeline completed!', 'success');
    }

    // Cleanup function to abort ongoing operations
    container.cleanup = () => {
        abortController.abort();
    };

    return container;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
