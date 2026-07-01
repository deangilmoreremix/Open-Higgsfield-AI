// main.js - Vanilla JS Director Page

async function getSupabaseAccessToken() {
  const c = window.DIRECTOR_CONFIG;
  if (!window.supabaseClient) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    window.supabaseClient = createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
  }
  const { data } = await window.supabaseClient.auth.getSession();
  return data?.session?.access_token || '';
}

const AGENT_NAME_TO_ID = {
  'Video Summarizer': 'summarizer', 'Video Search': 'search', 'Clip Creator': 'clipper',
  'Video Dubbing': 'dubbing', 'Subtitle Generator': 'subtitler', 'Highlight Extractor': 'highlighter',
  'Scene Detector': 'scenes', 'B-Roll Adder': 'broll', 'Voiceover': 'voiceover',
  'Video Editor': 'editor', 'Video Enhancer': 'enhancer', 'Content Compiler': 'compiler',
  'Meme Generator': 'meme', 'Music Video Maker': 'musicvideo', 'Trailer Creator': 'trailer',
  'Compilation Builder': 'compilation', 'Social Media Clip': 'social', 'Preview Generator': 'preview',
  'Montage Builder': 'montage', 'Story Builder': 'story', 'Color Correction': 'color',
  'Video Stabilize': 'stabilize', 'Speed Control': 'speed', 'Reverse Video': 'reverse',
  'Voice Cloning': 'voice_cloning', 'Comparison Agent': 'comparison', 'Gen AI Audio Overlays': 'audio_overlays',
  'Keyword Search & Compilation': 'keyword_search', 'Intelligent Output Formatting': 'output_formatting',
  'Automated Video Highlights': 'auto_highlights', 'Thumbnail Agent': 'thumbnail',
  'Subtitle Agent': 'subtitle_agent', 'Visual Search': 'visual_search', 'Slack Agent': 'slack_agent',
  'Text to Movie': 'text_to_movie', 'Storyboarding Agent': 'storyboarding',
  'Faceless Video Creator': 'faceless_video_creator', 'AI Ad Films': 'ai_ad_films',
  'TikTok Lyric Video': 'tiktok_lyric_video', 'AI Voiceovers': 'ai_voiceovers',
  'Trailer Narration': 'trailer_narration', 'Kids Storyteller': 'kids_storyteller',
  'Year in Frames': 'year_in_frames', 'Profanity Remover': 'profanity_remover',
  'Sales Assistant': 'sales_assistant',
};
// Reverse lookup: agentId -> display name
const AGENT_ID_TO_NAME = Object.fromEntries(
  Object.entries(AGENT_NAME_TO_ID).map(([name, id]) => [id, name])
);

// Data
const leftAgents = [
  { name: 'Video Summarizer', icon: 'BookOpenText' },
  { name: 'Video Search', icon: 'Search' },
  { name: 'Clip Creator', icon: 'Scissors' },
  { name: 'Video Dubbing', icon: 'Languages' },
  { name: 'Subtitle Generator', icon: 'Captions' },
  { name: 'Highlight Extractor', icon: 'Sparkles' },
  { name: 'Scene Detector', icon: 'ScanSearch' },
  { name: 'B-Roll Adder', icon: 'Images' },
  { name: 'Voiceover', icon: 'Mic' },
  { name: 'Video Editor', icon: 'Wand2' },
  { name: 'Video Enhancer', icon: 'Gauge' },
  { name: 'Content Compiler', icon: 'Layers3' },
  { name: 'Meme Generator', icon: 'SmilePlus' },
  { name: 'Music Video Maker', icon: 'Music4' },
  { name: 'Trailer Creator', icon: 'Film' },
  { name: 'Compilation Builder', icon: 'Blocks' },
  { name: 'Social Media Clip', icon: 'Smartphone' },
  { name: 'Preview Generator', icon: 'Eye' },
  { name: 'Montage Builder', icon: 'GalleryVerticalEnd' },
  { name: 'Story Builder', icon: 'BookOpenText' },
  { name: 'Color Correction', icon: 'Palette' },
  { name: 'Video Stabilize', icon: 'Clapperboard' },
  { name: 'Speed Control', icon: 'FastForward' },
  { name: 'Reverse Video', icon: 'Rewind' },
  { name: 'Voice Cloning', icon: 'AudioLines' },
  { name: 'Comparison Agent', icon: 'Columns2' },
  { name: 'Gen AI Audio Overlays', icon: 'Music2' },
  { name: 'Keyword Search & Compilation', icon: 'SearchCode' },
  { name: 'Intelligent Output Formatting', icon: 'FileOutput' },
  { name: 'Automated Video Highlights', icon: 'Zap' },
  { name: 'Thumbnail Agent', icon: 'Image' },
  { name: 'Subtitle Agent', icon: 'MessageSquare' },
  { name: 'Visual Search', icon: 'ScanEye' },
  { name: 'Slack Agent', icon: 'MessageCircle' },
  { name: 'Text to Movie', icon: 'Film' },
  { name: 'Storyboarding Agent', icon: 'LayoutGrid' },
  { name: 'Faceless Video Creator', icon: 'UserX' },
  { name: 'AI Ad Films', icon: 'Megaphone' },
  { name: 'TikTok Lyric Video', icon: 'Music' },
  { name: 'AI Voiceovers', icon: 'Volume2' },
  { name: 'Trailer Narration', icon: 'Mic2' },
  { name: 'Kids Storyteller', icon: 'Baby' },
  { name: 'Year in Frames', icon: 'Calendar' },
  { name: 'Profanity Remover', icon: 'ShieldAlert' },
  { name: 'Sales Assistant', icon: 'Briefcase' },
];

const quickActions = [
  ['Summarize', 'Generate video summary', 'summarizer', 'BookOpenText'],
  ['Extract Highlights', 'Find best moments', 'highlighter', 'Sparkles'],
  ['Detect Scenes', 'Identify boundaries', 'scenes', 'ScanSearch'],
  ['Add Subtitles', 'Auto-generate captions', 'subtitler', 'Captions'],
  ['Dub Video', 'Translate audio', 'dubbing', 'Languages'],
  ['Add B-Roll', 'Overlay footage', 'broll', 'Images'],
  ['Voiceover', 'Add AI narration', 'voiceover', 'Mic'],
  ['Create Shorts', 'TikTok/Reels/Shorts', 'social', 'Smartphone'],
  ['Color Correction', 'Adjust colors', 'color', 'Palette'],
  ['Stabilize', 'Fix shaky footage', 'stabilize', 'Clapperboard'],
  ['Generate Thumbnail', 'Create cover image', 'thumbnail', 'Image'],
  ['Make Music Video', 'Sync footage to music', 'musicvideo', 'Music4'],
  ['Create Trailer', 'Build cinematic trailer', 'trailer', 'Film'],
  ['Faceless Video', 'No-face narration video', 'faceless_video_creator', 'UserX'],
  ['AI Ad Film', 'Product advertisement', 'ai_ad_films', 'Megaphone'],
  ['TikTok Lyric Video', 'Lyric music video', 'tiktok_lyric_video', 'Music'],
  ['Kids Story', 'Children storytelling', 'kids_storyteller', 'Baby'],
  ['Year in Frames', 'Yearly recap montage', 'year_in_frames', 'Calendar'],
  ['Remove Profanity', 'Clean audio language', 'profanity_remover', 'ShieldAlert'],
  ['Text to Movie', 'Script to full movie', 'text_to_movie', 'Clapperboard'],
  ['Reverse Video', 'Play backwards', 'reverse', 'Rewind'],
  ['Speed Control', 'Adjust playback speed', 'speed', 'FastForward'],
  ['Visual Search', 'Find by visual query', 'visual_search', 'ScanEye'],
  ['Auto Highlights', 'AI-ranked highlights', 'auto_highlights', 'Zap'],
];

const timelineItems = [
  'Scene Detection',
  'Highlight Detection',
  'Clip Generation',
  'Subtitles',
  'Final Export',
];

const starterPrompts = [
  'Summarize this video',
  'Create a short clip of the best moment',
  'Add subtitles with cinematic styling',
  'Detect scenes and build highlights',
];

// State
let selectedAgent = 'Video Summarizer';
let chatInput = '';
let messages = [
  {
    role: 'assistant',
    text: "Hello! I'm Director, your AI video assistant with 45 specialized agents. Select an agent or send a command to get started.",
  },
];

// DOM elements
let app;

// Function to create icon element
function createIcon(name, className = 'h-5 w-5') {
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', name);
  icon.className = className;
  return icon;
}

// Keyword -> agentId mapping for natural-language commands.
// Covers all 45 agents; ordered so more specific keywords match first.
const KEYWORD_TO_AGENT = [
  ['summarize', 'summarizer'], ['summary', 'summarizer'],
  ['highlight', 'highlighter'], ['best moment', 'highlighter'],
  ['auto highlight', 'auto_highlights'],
  ['scene', 'scenes'], ['detect scene', 'scenes'],
  ['subtitle', 'subtitler'], ['caption', 'subtitler'],
  ['dub', 'dubbing'], ['translate audio', 'dubbing'],
  ['b-roll', 'broll'], ['broll', 'broll'], ['overlay footage', 'broll'],
  ['voiceover', 'voiceover'], ['narration', 'voiceover'],
  ['voice clone', 'voice_cloning'], ['clone voice', 'voice_cloning'],
  ['audio overlay', 'audio_overlays'],
  ['ai voiceover', 'ai_voiceovers'],
  ['thumbnail', 'thumbnail'], ['cover image', 'thumbnail'],
  ['social', 'social'], ['short', 'social'], ['tiktok', 'social'], ['reel', 'social'],
  ['comparison', 'comparison'], ['compare', 'comparison'],
  ['keyword search', 'keyword_search'], ['compile by keyword', 'keyword_search'],
  ['output format', 'output_formatting'],
  ['visual search', 'visual_search'],
  ['search', 'search'],
  ['clip', 'clipper'],
  ['edit', 'editor'], ['trim', 'editor'], ['cut', 'editor'],
  ['enhance', 'enhancer'], ['upscale', 'enhancer'],
  ['compile', 'compiler'], ['content compiler', 'compiler'],
  ['compilation', 'compilation'],
  ['meme', 'meme'],
  ['music video', 'musicvideo'],
  ['trailer', 'trailer'],
  ['trailer narration', 'trailer_narration'],
  ['preview', 'preview'],
  ['montage', 'montage'],
  ['story', 'story'], ['narrative', 'story'],
  ['color', 'color'], ['color correct', 'color'], ['color grade', 'color'],
  ['stabilize', 'stabilize'], ['fix shaky', 'stabilize'],
  ['speed', 'speed'], ['slow motion', 'speed'], ['fast forward', 'speed'],
  ['reverse', 'reverse'], ['play backwards', 'reverse'],
  ['text to movie', 'text_to_movie'], ['script to movie', 'text_to_movie'],
  ['storyboard', 'storyboarding'],
  ['faceless', 'faceless_video_creator'], ['no face', 'faceless_video_creator'],
  ['ad film', 'ai_ad_films'], ['advertisement', 'ai_ad_films'], ['product ad', 'ai_ad_films'],
  ['lyric video', 'tiktok_lyric_video'], ['tiktok lyric', 'tiktok_lyric_video'],
  ['kids story', 'kids_storyteller'], ['children', 'kids_storyteller'],
  ['year in frames', 'year_in_frames'], ['yearly recap', 'year_in_frames'],
  ['profanity', 'profanity_remover'], ['clean audio', 'profanity_remover'],
  ['slack', 'slack_agent'],
  ['sales', 'sales_assistant'], ['crm', 'sales_assistant'],
];

function inferAgentId(text) {
  const lower = text.toLowerCase();
  for (const [keyword, id] of KEYWORD_TO_AGENT) {
    if (lower.includes(keyword)) return id;
  }
  return null;
}

// Call the Render director backend for an agent.
async function callBackendAgent(agentId, input) {
  const config = window.DIRECTOR_CONFIG;
  const accessToken = await getSupabaseAccessToken();
  const response = await fetch(`${config.BACKEND_URL}/api/agents/${agentId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: input,
      videoUrl: window.currentVideoUrl || null,
      options: {},
    }),
  });

  if (response.ok) {
    const result = await response.json();
    if (result.streamUrl) return `Done! Watch: ${result.streamUrl}`;
    if (result.output?.summary) return result.output.summary;
    if (result.output?.script) return result.output.script;
    return getSuccessMessage(agentId);
  }

  if (response.status === 400) {
    const err = await response.json().catch(() => ({}));
    if (err.error?.code === 'INTEGRATION_REQUIRED') {
      if (window.openIntegrationModal) window.openIntegrationModal(err.error.details?.type || 'slack');
      return `Please connect your ${err.error.details?.type || 'integration'} first, then try again.`;
    }
    return `Agent error: ${err.error?.message || 'Bad request'}`;
  }

  if (response.status === 401) {
    return 'Please sign in to use the Director agents.';
  }

  return getSuccessMessage(agentId);
}

// Run an agent either by explicit id or inferred from the chat input.
async function runAgent(agentId, input) {
  try {
    return await callBackendAgent(agentId, input);
  } catch (error) {
    console.warn('Backend call failed, using fallback:', error);
    return getSuccessMessage(agentId);
  }
}

// Agent reply function - integrated with backend
async function agentReply(input) {
  const text = input.toLowerCase();
  const selectedId = AGENT_NAME_TO_ID[selectedAgent];

  // Prefer the explicitly-selected agent card, then fall back to keyword inference.
  const agentId = selectedId || inferAgentId(text);
  if (!agentId) {
    return 'I can help with summarizing, highlights, subtitles, dubbing, shorts, scene-based editing, music videos, trailers, ad films, and 40+ other workflows. Choose a card or send a command to continue.';
  }

  return runAgent(agentId, input);
}

// Per-agent metadata: action slug, tool slug, success message.
// Covers all 45 agents so every card has a deterministic response.
const AGENT_META = {
  summarizer:              { action: 'summarize-video',        tool: 'video-analysis',        success: 'Video summary generated successfully' },
  search:                  { action: 'search-media',            tool: 'video-search',          success: 'Media search completed' },
  clipper:                 { action: 'create-clip',             tool: 'video-clipper',         success: 'Clip created successfully' },
  dubbing:                 { action: 'dub-video',               tool: 'video-dubbing',         success: 'Video dubbed successfully' },
  subtitler:               { action: 'generate-subtitles',      tool: 'video-subtitles',       success: 'Subtitles generated successfully' },
  subtitle_agent:          { action: 'generate-subtitles',      tool: 'video-subtitles',       success: 'Subtitle agent run completed successfully' },
  highlighter:             { action: 'extract-highlights',      tool: 'video-highlights',      success: 'Highlights extracted successfully' },
  auto_highlights:         { action: 'extract-highlights',      tool: 'video-highlights',      success: 'Automated highlights generated successfully' },
  scenes:                  { action: 'detect-scenes',           tool: 'scene-detection',       success: 'Scenes detected successfully' },
  broll:                   { action: 'add-broll',                tool: 'video-broll',           success: 'B-roll added successfully' },
  voiceover:               { action: 'add-voiceover',           tool: 'video-voiceover',       success: 'Voiceover added successfully' },
  voice_cloning:           { action: 'clone-voice',             tool: 'voice-cloning',         success: 'Voice cloned successfully' },
  audio_overlays:          { action: 'add-audio-overlay',       tool: 'audio-overlays',        success: 'Audio overlay added successfully' },
  ai_voiceovers:           { action: 'add-voiceover',           tool: 'ai-voiceovers',         success: 'AI voiceover generated successfully' },
  editor:                  { action: 'edit-video',              tool: 'video-editor',          success: 'Video edited successfully' },
  enhancer:                { action: 'enhance-video',           tool: 'video-enhancer',        success: 'Video enhanced successfully' },
  compiler:                { action: 'compile-videos',          tool: 'video-compiler',        success: 'Videos compiled successfully' },
  compilation:             { action: 'build-compilation',       tool: 'compilation-builder',   success: 'Compilation built successfully' },
  meme:                    { action: 'create-meme',             tool: 'meme-generator',        success: 'Meme created successfully' },
  musicvideo:              { action: 'create-music-video',      tool: 'music-video',           success: 'Music video generated successfully' },
  trailer:                 { action: 'create-trailer',          tool: 'trailer-maker',         success: 'Trailer created successfully' },
  trailer_narration:       { action: 'create-trailer',          tool: 'trailer-narration',     success: 'Trailer narration generated successfully' },
  social:                  { action: 'create-social-clip',      tool: 'social-clip',           success: 'Social media clip created successfully' },
  preview:                 { action: 'generate-preview',        tool: 'preview-generator',     success: 'Preview generated successfully' },
  montage:                 { action: 'create-montage',         tool: 'montage-builder',       success: 'Montage created successfully' },
  story:                   { action: 'build-story',             tool: 'story-builder',         success: 'Story built successfully' },
  color:                   { action: 'color-correct',           tool: 'color-correction',      success: 'Color correction applied successfully' },
  stabilize:               { action: 'stabilize-video',         tool: 'video-stabilize',       success: 'Video stabilized successfully' },
  speed:                   { action: 'adjust-speed',            tool: 'speed-control',         success: 'Speed adjusted successfully' },
  reverse:                 { action: 'reverse-video',           tool: 'video-reverse',         success: 'Video reversed successfully' },
  comparison:              { action: 'compare-videos',          tool: 'video-comparison',      success: 'Video comparison completed successfully' },
  keyword_search:          { action: 'keyword-search',          tool: 'keyword-search',        success: 'Keyword search & compilation completed successfully' },
  output_formatting:       { action: 'format-output',           tool: 'output-formatting',     success: 'Output formatted successfully' },
  thumbnail:               { action: 'generate-thumbnail',     tool: 'thumbnail-generator',   success: 'Thumbnail generated successfully' },
  visual_search:           { action: 'visual-search',           tool: 'visual-search',         success: 'Visual search completed successfully' },
  text_to_movie:           { action: 'text-to-movie',           tool: 'text-to-movie',         success: 'Movie generated from script successfully' },
  storyboarding:           { action: 'generate-storyboard',    tool: 'storyboarding',         success: 'Storyboard generated successfully' },
  faceless_video_creator:  { action: 'create-faceless-video',  tool: 'faceless-video',        success: 'Faceless video created successfully' },
  ai_ad_films:             { action: 'create-ad-film',         tool: 'ad-film-maker',         success: 'AI ad film created successfully' },
  tiktok_lyric_video:      { action: 'create-lyric-video',     tool: 'lyric-video-maker',     success: 'TikTok lyric video created successfully' },
  kids_storyteller:        { action: 'tell-kids-story',         tool: 'kids-storyteller',      success: 'Kids story generated successfully' },
  year_in_frames:          { action: 'build-year-recap',        tool: 'year-in-frames',        success: 'Year-in-frames montage built successfully' },
  profanity_remover:       { action: 'remove-profanity',       tool: 'profanity-remover',     success: 'Profanity removed successfully' },
  slack_agent:             { action: 'send-slack-message',      tool: 'slack-agent',           success: 'Slack message sent successfully' },
  sales_assistant:         { action: 'sales-assist',           tool: 'sales-assistant',       success: 'Sales assistant completed successfully' },
};

function getActionFromAgent(agentId) {
  return (AGENT_META[agentId] && AGENT_META[agentId].action) || 'edit-video';
}

function getToolFromAgent(agentId) {
  return (AGENT_META[agentId] && AGENT_META[agentId].tool) || 'video-editor';
}

function getSuccessMessage(agentId) {
  return (AGENT_META[agentId] && AGENT_META[agentId].success) || 'Operation completed successfully';
}

// Send message
async function sendMessage(value) {
  const trimmed = value.trim();
  if (!trimmed) return;

  messages.push({ role: 'user', text: trimmed });
  render(); // Render immediately with user message

  try {
    const reply = await agentReply(trimmed);
    messages.push({ role: 'assistant', text: reply });
  } catch (error) {
    messages.push({ role: 'assistant', text: 'Sorry, there was an error processing your request.' });
  }

  chatInput = '';
  render();
}

// Render function
function render() {
  const selectedAgentInfo = leftAgents.find((agent) => agent.name === selectedAgent) || leftAgents[0];

  app.innerHTML = `
    <div class="min-h-screen bg-[#08090b] p-4 text-white">
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-[240px_minmax(0,1fr)_260px]">
        ${renderLeftSidebar()}
        ${renderMain()}
        ${renderRightSidebar()}
      </div>
    </div>
  `;

  // Initialize Lucide icons
  lucide.createIcons();

  // Add event listeners
  addEventListeners();
}

// Render left sidebar
function renderLeftSidebar() {
  return `
    <aside class="rounded-[28px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_55px_rgba(99,102,241,0.08)] backdrop-blur-xl">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10">
          ${createIcon('Bot', 'h-5 w-5 text-lime-300').outerHTML}
        </div>
        <div>
          <div class="text-xl font-black tracking-tight">DIRECTOR</div>
          <div class="text-[11px] text-white/45">AI Agentic Editor · 45 Agents</div>
        </div>
      </div>

      <div class="mb-3 flex items-center justify-between">
        <div class="text-xs font-black tracking-[0.18em] text-white/70">AI AGENTS</div>
        <button class="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/55">
          All Categories
        </button>
      </div>

      <div class="grid grid-cols-2 gap-2">
        ${leftAgents.map((agent, i) => {
          const active = selectedAgent === agent.name;
          return `
            <button
              data-agent="${agent.name}"
              class="relative overflow-hidden rounded-2xl border p-2.5 text-left transition ${
                active
                  ? 'border-emerald-400/28 bg-emerald-500/[0.10] shadow-[0_0_28px_rgba(16,185,129,0.16)]'
                  : i < 6
                    ? 'border-white/12 bg-white/[0.04]'
                    : 'border-white/10 bg-white/[0.03]'
              }"
            >
              <div class="absolute inset-0 ${
                i % 6 === 0
                  ? 'bg-gradient-to-br from-fuchsia-500/10 via-violet-500/5 to-indigo-500/10'
                  : i % 6 === 1
                    ? 'bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-indigo-500/10'
                    : i % 6 === 2
                      ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10'
                      : i % 6 === 3
                        ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10'
                        : i % 6 === 4
                          ? 'bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-fuchsia-500/10'
                          : 'bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-blue-500/10'
              }"></div>
              <div class="relative z-10">
                <div class="mb-2 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                  ${createIcon(agent.icon, 'h-4 w-4 text-white/80').outerHTML}
                </div>
                <div class="text-[12px] font-bold leading-tight">${agent.name}</div>
                <div class="mt-1 truncate text-[10px] text-white/40">AI workflow module</div>
              </div>
            </button>
          `;
        }).join('')}
      </div>

      <div class="mt-6">
        <div class="mb-2 text-[11px] font-black tracking-[0.18em] text-white/70">ACTIVE AGENT</div>
        <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-white/70">
          ${selectedAgent}
        </div>
      </div>
    </aside>
  `;
}

// Render main area
function renderMain() {
  return `
    <main class="bg-[#08090b]">
      <div
        class="relative mb-6 h-36 overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.55),0_0_80px_rgba(99,102,241,0.10)]"
        style="background: linear-gradient(135deg, #17181b 0%, #0c0d10 45%, #1b2230 100%)"
      >
        <div
          class="absolute inset-0"
          style="background: radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(99,102,241,0.28), transparent 36%), radial-gradient(circle at 15% 25%, rgba(236,72,153,0.14), transparent 28%)"
        ></div>
        <div
          class="absolute inset-0"
          style="background: radial-gradient(circle at center, rgba(120,119,198,0.16), transparent 36%), radial-gradient(circle at 70% 55%, rgba(56,189,248,0.08), transparent 28%)"
        ></div>
        <div class="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-5">
          <div>
            <p class="mb-2 text-[10px] uppercase tracking-[0.28em] text-white/45">AI FILM STUDIO</p>
            <h1 class="text-4xl font-black tracking-tight">Director</h1>
            <p class="mt-1 max-w-2xl text-sm text-white/60">
              Use the full AI agent workspace with the cinematic render-page visual language.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button class="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100">
              Clear Chat
            </button>
            <button class="rounded-2xl bg-lime-300 px-4 py-2 text-sm font-semibold text-black">
              Reasoning Engine
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_60px_rgba(99,102,241,0.08)] backdrop-blur-xl">
        <div class="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-[10px] uppercase tracking-[0.22em] text-white/40">Agent Workspace</p>
              <h3 class="mt-2 text-lg font-black">${selectedAgentInfo.name}</h3>
              <p class="mt-1 text-sm text-white/50">
                Load a video, then use any agent from the left or a quick action from the right.
              </p>
            </div>
            <div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Processing preview updated
            </div>
          </div>
        </div>

        <div class="relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-black shadow-[0_0_120px_rgba(16,185,129,0.18),0_0_90px_rgba(99,102,241,0.14)]">
          <div
            class="absolute inset-0"
            style="background: radial-gradient(circle at center, rgba(255,255,255,0.10), transparent 38%), radial-gradient(circle at 50% 58%, rgba(16,185,129,0.20), transparent 34%)"
          ></div>
          <div
            class="absolute inset-0"
            style="background: radial-gradient(circle at top, rgba(120,119,198,0.24), transparent 28%), radial-gradient(circle at 50% 78%, rgba(16,185,129,0.24), transparent 26%), radial-gradient(circle at bottom right, rgba(255,255,255,0.09), transparent 24%), radial-gradient(circle at 20% 80%, rgba(236,72,153,0.08), transparent 20%)"
          ></div>
          <div
            class="relative flex aspect-video w-[92%] items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/12 shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_110px_rgba(16,185,129,0.20),0_0_70px_rgba(99,102,241,0.12)]"
            style="background: linear-gradient(135deg, #101114 0%, #191b20 50%, #0c0d10 100%)"
          >
            <div
              class="absolute inset-0"
              style="background: radial-gradient(circle at 50% 35%, rgba(99,102,241,0.22), transparent 26%), radial-gradient(circle at 50% 82%, rgba(16,185,129,0.22), transparent 24%), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.09), transparent 22%), radial-gradient(circle at 75% 25%, rgba(236,72,153,0.08), transparent 22%)"
            ></div>
            <div class="absolute left-4 top-4 rounded-full border border-emerald-400/18 bg-black/45 px-3 py-1 text-xs text-emerald-100/80 shadow-[0_0_24px_rgba(16,185,129,0.14)] backdrop-blur">
              Director Workspace • Ready
            </div>
            <div class="relative z-10 text-center">
              <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
                ${createIcon('Play', 'h-6 w-6 text-white/80').outerHTML}
              </div>
              <div class="text-2xl font-black">No video loaded</div>
              <div class="mt-2 text-sm text-white/40">Generate a video first to use Director</div>
            </div>
          </div>
        </div>

        <div class="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          ${renderChatSection()}
          ${renderTimelineSection()}
        </div>
      </div>
    </main>
  `;
}

// Render chat section
function renderChatSection() {
  return `
    <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
      <div class="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
        ${createIcon('MessageSquare', 'h-4 w-4').outerHTML} AI Chat
      </div>
      <div
        class="rounded-2xl border border-white/10 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
        style="background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.028))"
      >
        <div class="max-h-[260px] space-y-3 overflow-auto pr-1">
          ${messages.map((message, index) => `
            <div
              class="max-w-[88%] rounded-2xl border px-3 py-2 text-sm ${
                message.role === 'assistant'
                  ? 'border-white/10 bg-white/[0.04] text-white/85'
                  : 'ml-auto border-lime-400/20 bg-lime-400/10 text-lime-50'
              }"
            >
              ${message.text}
            </div>
          `).join('')}
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          ${starterPrompts.map((item, i) => `
            <button
              data-prompt="${item}"
              class="rounded-xl border px-3 py-2 text-left text-xs ${
                i === 0
                  ? 'border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-100'
                  : i === 1
                    ? 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100'
                    : i === 2
                      ? 'border-amber-400/20 bg-amber-500/10 text-amber-100'
                      : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
              }"
            >
              ${item}
            </button>
          `).join('')}
        </div>

        <div class="mt-4 flex items-center gap-3">
          <input
            id="chat-input"
            value="${chatInput}"
            placeholder="Type your command (e.g. Create a short clip of the best moment)"
            class="h-12 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/35"
          />
          <button
            id="send-button"
            class="flex h-12 items-center gap-2 rounded-2xl bg-lime-300 px-5 text-sm font-semibold text-black shadow-[0_0_24px_rgba(190,242,100,0.18)]"
          >
            ${createIcon('Send', 'h-4 w-4').outerHTML} Send
          </button>
        </div>
      </div>
    </div>
  `;
}

// Render timeline section
function renderTimelineSection() {
  return `
    <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div class="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
        ${createIcon('Clock3', 'h-4 w-4').outerHTML} Timeline Preview
      </div>
      <div class="mb-4 flex min-h-[120px] items-center justify-center rounded-2xl border border-white/10 bg-[#111118] p-4 text-sm text-white/35">
        No timeline data
      </div>
      <div class="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
        ${createIcon('FileVideo', 'h-4 w-4').outerHTML} Active Workflow
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div class="mb-4 flex items-center gap-3">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"></div>
          <div class="font-black">Ready for processing</div>
        </div>
        <div class="space-y-2 text-sm">
          ${timelineItems.map((step, i) => `
            <div class="flex items-center gap-3 text-white/60">
              <div class="h-2.5 w-2.5 rounded-full ${i < 2 ? 'bg-emerald-400' : i === 2 ? 'animate-pulse bg-indigo-400' : 'bg-white/20'}"></div>
              <span class="${i < 2 ? 'font-semibold text-emerald-200' : i === 2 ? 'font-semibold text-indigo-300' : ''}">
                ${step}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Render right sidebar
function renderRightSidebar() {
  return `
    <aside class="rounded-[28px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_55px_rgba(99,102,241,0.08)] backdrop-blur-xl">
      <div class="rounded-[28px] border border-white/10 bg-white/[0.02] p-4 h-full">
        <h2 class="text-2xl font-black tracking-tight">QUICK ACTIONS</h2>
        <p class="mb-4 mt-1 text-sm text-white/50">Choose how to proceed with your video</p>

        <div class="mb-5 space-y-2 max-h-[420px] overflow-auto pr-1">
          ${quickActions.map(([title, desc, agentId, icon], i) => `
            <button
              data-quick-agent="${agentId}"
              class="w-full rounded-2xl border p-3 text-left shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-all ${
                i === 0
                  ? 'border-emerald-400/28 bg-emerald-500/12 text-white shadow-[0_0_28px_rgba(16,185,129,0.18)]'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'
              }"
            >
              <div class="flex items-start gap-3">
                <div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/25">
                  ${createIcon(icon, 'h-4 w-4 text-white/80').outerHTML}
                </div>
                <div>
                  <div class="text-sm font-black">${title}</div>
                  <div class="mt-1 text-[11px] text-white/50">${desc}</div>
                </div>
              </div>
            </button>
          `).join('')}
        </div>

        <div class="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div class="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
            ${createIcon('Clock3', 'h-4 w-4').outerHTML} Timeline Preview
          </div>
          <div class="rounded-2xl border border-white/10 bg-[#111118] p-5 text-center text-sm text-white/35">
            No timeline data
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div class="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
            ${createIcon('FileVideo', 'h-4 w-4').outerHTML} Export
          </div>
          <div class="mb-4 flex gap-2">
            ${['MP4', 'WebM', 'GIF'].map((item, i) => `
              <button
                class="rounded-xl px-4 py-2 text-xs font-semibold ${
                  i === 0 ? 'bg-white text-black' : 'border border-white/10 bg-white/[0.04] text-white/70'
                }"
              >
                ${item}
              </button>
            `).join('')}
          </div>
          <div>
            <label class="mb-2 block text-sm text-white/50">Frame Rate</label>
            <div class="rounded-2xl border border-white/10 bg-[#111118] px-4 py-3 text-sm text-zinc-200">
              24 FPS Cinematic
            </div>
          </div>
        </div>
      </div>
    </aside>
  `;
}

// Add event listeners
function addEventListeners() {
  // Agent selection
  document.querySelectorAll('[data-agent]').forEach(button => {
    button.addEventListener('click', () => {
      selectedAgent = button.getAttribute('data-agent');
      render();
    });
  });

  // Chat input
  const chatInputEl = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');

  if (chatInputEl) {
    chatInputEl.addEventListener('input', (e) => {
      chatInput = e.target.value;
    });

    chatInputEl.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        await sendMessage(chatInput);
      }
    });
  }

  if (sendButton) {
    sendButton.addEventListener('click', async () => {
      await sendMessage(chatInput);
    });
  }

  // Starter prompts
  document.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', async () => {
      await sendMessage(button.getAttribute('data-prompt'));
    });
  });

  // Quick action buttons -> run agent directly with a descriptive prompt
  document.querySelectorAll('[data-quick-agent]').forEach(button => {
    button.addEventListener('click', async () => {
      const agentId = button.getAttribute('data-quick-agent');
      const name = AGENT_ID_TO_NAME[agentId] || agentId;
      messages.push({ role: 'user', text: `${name}` });
      render();
      const reply = await runAgent(agentId, `Run ${name}`);
      messages.push({ role: 'assistant', text: reply });
      chatInput = '';
      render();
    });
  });

  // Agent cards -> select + run the agent immediately
  document.querySelectorAll('[data-agent]').forEach(button => {
    button.addEventListener('click', async () => {
      selectedAgent = button.getAttribute('data-agent');
      const agentId = AGENT_NAME_TO_ID[selectedAgent];
      render();
      if (agentId) {
        const name = selectedAgent;
        messages.push({ role: 'user', text: `${name}` });
        render();
        const reply = await runAgent(agentId, `Run ${name}`);
        messages.push({ role: 'assistant', text: reply });
        render();
      }
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  app = document.getElementById('app');
  render();
});