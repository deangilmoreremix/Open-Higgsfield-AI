// Scrolling App Strip - 33 apps + 60+ features
// Re-adds the original larger two-row app-strip plus a third row
// of smaller feature chips sourced from landing page feature data.

const FEATURE_CATEGORIES = {
  'Core Platform': [
    '33 AI Creative Apps Access',
    '60+ AI Features & Tools',
    '200+ AI Models Library',
    'Professional Timeline Editor',
    '4K/8K Export Quality',
    'No Watermarks on Exports',
    'Cloud Storage (50GB)',
    'Priority GPU Rendering'
  ],
  'Generation Tools': [
    'Text-to-Image Generation',
    'Image-to-Image Generation',
    'Text-to-Video Creation',
    'Image-to-Video Transformation',
    'Video-to-Video Editing',
    'AI Prompt Enhancement',
    'Cinematic Prompt Rewriting',
    'Multi-Model Generation',
    'Aspect Ratio Selection',
    'Style Preset Selection'
  ],
  'Cinema & Visual': [
    'Cinematic Camera Presets',
    'Lens Style Controls',
    'Focal Length Controls',
    'Aperture Controls',
    'Shot Type Selection',
    'Lighting Mood Controls',
    'Scene Composition Guidance',
    'Camera Movement Prompts',
    'Film-Style Visual Direction',
    'Director-Style Scene Planning'
  ],
  'Character & Avatar': [
    'Consistent Character Creation',
    'AI Avatar Generation',
    'Talking Avatar Creation',
    'AI Influencer Content',
    'Character Transformation',
    'Fashion-Style Creator Shots',
    'Profile Image Generation',
    'Persona-Based Visual Content',
    'Brand Mascot Creation',
    'Virtual Spokesperson Content'
  ],
  'VFX & Effects': [
    'Explosion Effects',
    'Fire Effects',
    'Lightning Effects',
    'Tornado Effects',
    'Disintegration Effects',
    'Energy Effects',
    'Action Scene Effects',
    'Motion Effects',
    'Style Transfer Effects',
    'Cinematic Transformation Effects'
  ],
  'Editing & Export': [
    'AI Video Editing Assistance',
    'Timeline Editing',
    'Scene Arrangement',
    'Clip Organization',
    'Asset Previewing',
    'Render Management',
    'AI Upscaling',
    'Video Enhancement',
    'Image Enhancement',
    'Output Export Workflow'
  ],
  'Business & Agency': [
    'Product Commercial Generation',
    'Ecommerce Ad Creative',
    'Local Business Promo Creation',
    'Social Media Video Creation',
    'TikTok Content Generation',
    'YouTube Thumbnail Creation',
    'Campaign Storyboard Creation',
    'Client Asset Library',
    'Agency Service Packaging',
    'Client-Ready Content Packages'
  ],
  'Automation & AI': [
    'AI Video Agents',
    'Creative Workflow Automation',
    'AI Assistant Chat',
    'MCP-Ready Controls',
    'CLI Workflow Control',
    'Template-Based Generation',
    'Repeatable Client Workflows',
    'Custom Workflow Builder',
    'API Access',
    'Webhook Integrations'
  ]
};

const APPS = [
  { name: 'Image', icon: '🖼️', color: 'cyan' },
  { name: 'Video', icon: '🎬', color: 'purple' },
  { name: 'Cinema Studio', icon: '🎥', color: 'cyan' },
  { name: 'Character', icon: '🧑', color: 'emerald' },
  { name: 'AI-VFX', icon: '✨', color: 'pink' },
  { name: 'Influencer', icon: '🌟', color: 'yellow' },
  { name: 'Storyboard', icon: '📋', color: 'purple' },
  { name: 'Effects', icon: '🎭', color: 'cyan' },
  { name: 'VFX', icon: '💥', color: 'pink' },
  { name: 'Edit', icon: '✂️', color: 'emerald' },
  { name: 'Upscale', icon: '🔍', color: 'cyan' },
  { name: 'Audio', icon: '🎵', color: 'purple' },
  { name: 'Avatar', icon: '👤', color: 'yellow' },
  { name: 'Training', icon: '🏋️', color: 'emerald' },
  { name: 'Video Tools', icon: '🔧', color: 'cyan' },
  { name: 'Render', icon: '🚀', color: 'pink' },
  { name: 'Video Agent', icon: '🤖', color: 'purple' },
  { name: 'Director', icon: '🎬', color: 'cyan' },
  { name: 'Timeline', icon: '⏱️', color: 'emerald' },
  { name: 'Motion', icon: '🎪', color: 'pink' },
  { name: 'TikTok', icon: '📱', color: 'yellow' },
  { name: 'Dubbing', icon: '🎙️', color: 'purple' },
  { name: 'Chat', icon: '💬', color: 'cyan' },
  { name: 'Commercial', icon: '💼', color: 'emerald' },
  { name: 'Templates', icon: '📁', color: 'pink' },
  { name: 'Explore', icon: '🔍', color: 'yellow' },
  { name: 'Library', icon: '📚', color: 'cyan' },
  { name: 'Community', icon: '👥', color: 'purple' },
  { name: 'Assist', icon: '🧠', color: 'emerald' },
  { name: 'Lip Sync', icon: '🎭', color: 'pink' },
  { name: 'Workflows', icon: '⚙️', color: 'cyan' },
  { name: 'Agents', icon: '🤖', color: 'yellow' },
  { name: 'MCP & CLI', icon: '💻', color: 'purple' }
];

const ALL_FEATURES = Object.entries(FEATURE_CATEGORIES).flatMap(([category, features]) =>
  features.map((feature) => ({ name: feature, color: 'cyan' }))
);

export function ScrollingAppStrip() {
  const section = document.createElement('section');
  section.className = 'py-12 md:py-16 bg-gradient-to-b from-[#020205] via-[#050810] to-[#020205] border-y border-cyan-400/20 overflow-hidden relative';
  section.setAttribute('aria-label', '33 AI Creative Apps + 60+ features');
  section.setAttribute('data-testid', 'scrolling-app-strip');

  const appStrip = [...APPS, ...APPS, ...APPS];
  const featureStrip = [...ALL_FEATURES, ...ALL_FEATURES, ...ALL_FEATURES];
  const featureStripReversed = [...featureStrip].reverse();

  const appChip = (app) => `
    <div
      class="app-chip flex items-center gap-3 px-4 py-2 bg-white/[0.07] border border-white/15 rounded-full whitespace-nowrap cursor-pointer transition-all duration-300 group shadow-lg shadow-black/20"
      data-app="${app.name}"
    >
      <span class="w-2 h-2 rounded-full bg-${app.color}-400 shadow-lg"></span>
      <span class="text-sm font-semibold text-white">${app.name}</span>
      <span class="text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-200">${app.icon}</span>
    </div>
  `;

  const featureChip = (feature, index) => {
    const colorIndex = index % 6;
    const colors = ['cyan', 'purple', 'emerald', 'pink', 'yellow', 'indigo'];
    const color = colors[colorIndex];
    return `
      <div class="feature-chip flex items-center gap-3 px-4 py-2 bg-white/[0.07] border border-white/15 rounded-full whitespace-nowrap cursor-pointer transition-all duration-300 group shadow-lg shadow-black/20">
        <span class="w-2 h-2 rounded-full bg-${color}-400 shadow-lg"></span>
        <span class="text-sm font-semibold text-white">${feature.name}</span>
        <span class="text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-200">⚡</span>
      </div>
    `;
  };

  section.innerHTML = `
    <!-- Section Header -->
    <div class="container mx-auto max-w-7xl px-4 mb-8 relative z-10">
      <div class="text-center">
        <div class="inline-flex items-center gap-3 mb-3">
          <span class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50"></span>
          <span class="text-cyan-400 font-bold text-sm uppercase tracking-widest">Every App You Need</span>
          <span class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50"></span>
        </div>
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2">
          <span class="text-cyan-400 italic">33</span> AI Creative Apps
        </h2>
        <p class="text-base text-gray-400 max-w-2xl mx-auto">
          One platform. Every creative tool. Build anything from cinematic videos to AI agents.
        </p>
      </div>
    </div>

    <div class="relative">
      <!-- Gradient overlays -->
      <div class="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#020205] via-[#020205]/80 to-transparent z-20 pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#020205] via-[#020205]/80 to-transparent z-20 pointer-events-none"></div>

      <!-- Row 1: 33 app chips (forward) -->
      <div class="app-strip-wrapper overflow-hidden py-3">
        <div class="app-strip flex gap-4 animate-scroll will-change-transform">
          ${appStrip.map(appChip).join('')}
        </div>
      </div>

      <!-- Row 2: 33 app chips (reverse) -->
      <div class="app-strip-wrapper-reverse overflow-hidden py-3 mt-1">
        <div class="app-strip-reverse flex gap-4 animate-scroll-reverse will-change-transform">
          ${appStrip.slice().reverse().map(appChip).join('')}
        </div>
      </div>

      <!-- Row 3: 60+ features (forward, smaller pills) -->
      <div class="feature-strip-wrapper overflow-hidden py-3 mt-1 relative">
        <div class="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#020205] via-[#020205]/80 to-transparent z-20 pointer-events-none"></div>
        <div class="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#020205] via-[#020205]/80 to-transparent z-20 pointer-events-none"></div>
        <div class="feature-strip flex gap-4 animate-scroll-slow will-change-transform">
          ${featureStrip.map((feature, i) => featureChip(feature, i)).join('')}
        </div>
      </div>

      <!-- Row 4: 60+ features (reverse, smaller pills) -->
      <div class="feature-strip-wrapper-reverse overflow-hidden py-3 mt-1 relative">
        <div class="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#020205] via-[#020205]/80 to-transparent z-20 pointer-events-none"></div>
        <div class="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#020205] via-[#020205]/80 to-transparent z-20 pointer-events-none"></div>
        <div class="feature-strip-reverse flex gap-4 animate-scroll-reverse-slow will-change-transform">
          ${featureStripReversed.map((feature, i) => featureChip(feature, i)).join('')}
        </div>
      </div>
    </div>

    <style>
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(calc(-100% / 3)); }
      }
      @keyframes scroll-reverse {
        0% { transform: translateX(calc(-100% / 3)); }
        100% { transform: translateX(0); }
      }
      @keyframes scroll-slow {
        0% { transform: translateX(0); }
        100% { transform: translateX(calc(-100% / 3)); }
      }
      @keyframes scroll-reverse-slow {
        0% { transform: translateX(calc(-100% / 3)); }
        100% { transform: translateX(0); }
      }
      .animate-scroll {
        animation: scroll 60s linear infinite;
      }
      .animate-scroll-reverse {
        animation: scroll-reverse 70s linear infinite;
      }
      .animate-scroll-slow {
        animation: scroll-slow 90s linear infinite;
      }
      .animate-scroll-reverse-slow {
        animation: scroll-reverse-slow 100s linear infinite;
      }
      .app-chip:hover {
        background-color: rgba(34, 211, 238, 0.12);
        border-color: rgba(34, 211, 238, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(34, 211, 238, 0.2);
      }
      .feature-chip:hover {
        background-color: rgba(34, 211, 238, 0.1);
        border-color: rgba(34, 211, 238, 0.4);
        transform: translateY(-1px);
      }
      @media (prefers-reduced-motion: reduce) {
        .animate-scroll, .animate-scroll-reverse, .animate-scroll-slow, .animate-scroll-reverse-slow { animation: none; }
        .app-strip, .app-strip-reverse, .feature-strip, .feature-strip-reverse { flex-wrap: wrap; justify-content: center; }
        .app-chip:hover, .feature-chip:hover { transform: none; }
      }
    </style>
  `;

  // Add click interactions
  setTimeout(() => {
    section.querySelectorAll('.app-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const appName = chip.dataset.app;
        console.log(`Clicked on ${appName}`);
      });
    });
    section.querySelectorAll('.feature-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const featureName = chip.querySelector('span')?.textContent?.trim();
        console.log(`Clicked feature: ${featureName}`);
      });
    });
  }, 100);

  return section;
}
