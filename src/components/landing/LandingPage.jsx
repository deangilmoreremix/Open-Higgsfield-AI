// AI Video Agency Studio Landing Page
// Optimized with lazy loading for sections

const ALL_APPS = [
  { id: 'image', title: 'Image', description: 'Generate high-quality AI images for ads, thumbnails, product visuals, social media, websites, and client campaigns.', icon: '🖼️', link: '/image' },
  { id: 'video', title: 'Video', description: 'Create text-to-video, image-to-video, video-to-video, and cinematic motion content for social, ads, and branded campaigns.', icon: '🎬', link: '/video' },
  { id: 'cinema', title: 'Cinema Studio', description: 'Direct AI-generated scenes using cinematic camera language, lenses, moods, lighting, motion, shot types, and visual styles.', icon: '🎬', link: '/cinema' },
  { id: 'character', title: 'Character', description: 'Create consistent AI characters, branded personas, story characters, spokespersons, creators, and campaign personalities.', icon: '🧑', link: '/character' },
  { id: 'ai-vfx', title: 'AI-VFX', description: 'Generate advanced AI visual effects such as explosions, lightning, fire, energy effects, disintegration, destruction, and cinematic transformations.', icon: '✨', link: '/ai-vfx' },
  { id: 'influencer', title: 'Influencer', description: 'Create AI influencer visuals, social content concepts, creator-style campaigns, fashion shots, lifestyle scenes, and branded posts.', icon: '🌟', link: '/influencer' },
  { id: 'storyboard', title: 'Storyboard', description: 'Plan campaigns, commercials, short films, social videos, and client projects using AI-assisted scene and shot planning.', icon: '📋', link: '/storyboard' },
  { id: 'effects', title: 'Effects', description: 'Apply creative effects, transformations, motion styles, cinematic treatments, and stylized visual looks.', icon: '🎭', link: '/effects' },
  { id: 'vfx', title: 'VFX', description: 'Create high-impact visual effects for trailers, ads, social videos, fantasy scenes, action sequences, and cinematic content.', icon: '💥', link: '/vfx' },
  { id: 'edit', title: 'Edit', description: 'Edit, revise, enhance, repurpose, and improve visual assets so users can move from raw AI output to polished delivery.', icon: '✂️', link: '/edit' },
  { id: 'upscale', title: 'Upscale', description: 'Improve image and video quality with AI upscaling for sharper, cleaner, more professional-looking assets.', icon: '🔍', link: '/upscale' },
  { id: 'audio', title: 'Audio', description: 'Generate, enhance, transform, or prepare audio assets for videos, voiceovers, ads, explainers, and AI content.', icon: '🎵', link: '/audio' },
  { id: 'avatar', title: 'Avatar', description: 'Create AI avatar-based content, virtual presenters, branded spokespersons, personality-driven videos, and talking visuals.', icon: '👤', link: '/avatar' },
  { id: 'training', title: 'Training', description: 'Teach users how to use the platform, create sellable assets, package services, and build an AI video agency.', icon: '🏋️', link: '/training' },
  { id: 'videotools', title: 'Video Tools', description: 'Access utility tools for enhancing, converting, modifying, preparing, and improving video assets.', icon: '🔧', link: '/videotools' },
  { id: 'render', title: 'Render', description: 'Preview, organize, export, and prepare final outputs for download, editing, delivery, or client presentation.', icon: '🚀', link: '/render' },
  { id: 'video-agent', title: 'Video Agent', description: 'Use AI agents to assist with video creation, editing decisions, creative direction, workflow steps, and content generation.', icon: '🤖', link: '/video-agent' },
  { id: 'director', title: 'Director', description: 'Turn prompts, concepts, scripts, and creative ideas into directed cinematic scenes and structured video plans.', icon: '🎬', link: '/director' },
  { id: 'timeline', title: 'Timeline', description: 'Arrange scenes, assets, clips, shots, captions, audio, and creative elements inside a structured video timeline.', icon: '⏱️', link: '/timeline' },
  { id: 'motion', title: 'Motion', description: 'Generate camera movement, scene motion, product motion, character motion, and cinematic animation effects.', icon: '🎪', link: '/runway-motion' },
  { id: 'tiktok', title: 'TikTok', description: 'Create TikTok-style videos, hooks, short-form content, viral concepts, creator clips, and social-ready vertical assets.', icon: '📱', link: '/tiktok-carousel' },
  { id: 'dubbing', title: 'Dubbing', description: 'Translate, localize, and dub video content for different languages, audiences, campaigns, and global delivery.', icon: '🎙️', link: '/advanced-dubbing' },
  { id: 'commercial', title: 'Commercial', description: 'Create product commercials, brand ads, local business promos, ecommerce videos, launch videos, and agency-ready ad concepts.', icon: '💼', link: '/commercial' },
  { id: 'templates', title: 'Templates', description: 'Start faster with prebuilt creative templates for ads, thumbnails, products, social posts, cinematic shots, VFX, and more.', icon: '📁', link: '/templates' },
  { id: 'explore', title: 'Explore', description: 'Browse creative ideas, examples, presets, templates, use cases, visual styles, and production inspiration.', icon: '🔍', link: '/explore' },
  { id: 'library', title: 'Library', description: 'Store, organize, reuse, and manage generated assets, projects, videos, images, templates, and campaign materials.', icon: '📚', link: '/library' },
  { id: 'community', title: 'Community', description: 'Showcase examples, discover creative workflows, highlight user creations, and build a community around AI video creation.', icon: '👥', link: '/community' },
  { id: 'assist', title: 'Assist', description: 'Use guided AI help for prompts, workflows, studio selection, creative improvement, and project completion.', icon: '🧠', link: '/assist' },
  { id: 'mcp-cli', title: 'MCP & CLI', description: 'Control advanced workflows, connect tools, automate tasks, and extend the platform with agent-ready command and integration support.', icon: '💻', link: '/mcp-cli' },
];

let globalStylesAdded = false;

function addGlobalStyles() {
  if (globalStylesAdded) return;
  globalStylesAdded = true;

  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    .animate-in.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .animate-in.stagger-1 { transition-delay: 0.1s; }
    .animate-in.stagger-2 { transition-delay: 0.2s; }
    .animate-in.stagger-3 { transition-delay: 0.3s; }
    .animate-in.stagger-4 { transition-delay: 0.4s; }
    .animate-in.stagger-5 { transition-delay: 0.5s; }
    .animate-in.stagger-6 { transition-delay: 0.6s; }
    .animate-in.stagger-7 { transition-delay: 0.7s; }
    .animate-in.stagger-8 { transition-delay: 0.8s; }
    .animate-in.stagger-9 { transition-delay: 0.9s; }
    .animate-in.stagger-10 { transition-delay: 1.0s; }
    .btn-enhanced {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .btn-enhanced::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%);
      transform: scale(0);
      transition: transform 0.5s ease;
    }
    .btn-enhanced:hover::after {
      transform: scale(1);
    }
    html {
      scroll-behavior: smooth;
    }
  `;
  document.head.appendChild(style);
}

function createLazySection(importFn, sectionId, props = {}, index = 0) {
  const placeholder = document.createElement('div');
  placeholder.id = `section-${sectionId}`;
  placeholder.className = 'min-h-[200px] flex items-center justify-center';
  placeholder.innerHTML = '<div class="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"></div>';

  const loadSection = () => {
    importFn().then(module => {
      let section;
      if (module.default) {
        section = props.apps ? module.default({ apps: props.apps }) : module.default(props);
      } else if (module.AppsGridSection) {
        section = module.AppsGridSection({ apps: ALL_APPS });
      } else {
        const fnName = Object.keys(module).find(k => k.includes('Section') || k.includes('Page'));
        section = fnName ? module[fnName](props) : module[Object.keys(module)[0]](props);
      }
      section.classList.add('animate-in');
      const staggerIndex = Math.min(index, 10);
      if (staggerIndex > 0) {
        section.classList.add(`stagger-${staggerIndex}`);
      }
      section.querySelectorAll('button').forEach(btn => {
        btn.classList.add('btn-enhanced');
      });
      placeholder.replaceWith(section);
      requestAnimationFrame(() => {
        section.classList.add('visible');
      });
    }).catch(err => {
      console.error(`Failed to load section ${sectionId}:`, err);
      placeholder.innerHTML = `<div class="text-red-400">Failed to load section</div>`;
    });
  };

  loadSection();
  return placeholder;
}

export default async function LandingPage() {
  addGlobalStyles();

  const container = document.createElement('div');
  container.className = 'landing-page min-h-screen bg-[#020205]';
  container.setAttribute('lang', document.documentElement.lang || 'en');
  container.setAttribute('dir', document.documentElement.dir || 'ltr');

try {
    const { LandingHeader } = await import('./common/Header.jsx');
    const headerEl = LandingHeader();
    container.appendChild(headerEl);

    const { Hero } = await import('./sections/Hero.jsx');
    const heroEl = Hero();
    heroEl.classList.add('animate-in');
    heroEl.classList.add('stagger-0');
    container.appendChild(heroEl);

    requestAnimationFrame(() => {
      heroEl.classList.add('visible');
    });

    const scrollingStrip = createLazySection(() => import('./sections/ScrollingAppStrip.jsx'), 'scrolling', {}, 0);
    const hookSection = createLazySection(() => import('./sections/HookSection.jsx'), 'hook', {}, 1);
    const sixEngines = createLazySection(() => import('./sections/SixEnginesSection.jsx'), 'engines', {}, 2);
    const appsGrid = createLazySection(() => import('./sections/AppsGridSection.jsx'), 'apps', { apps: ALL_APPS }, 3);
    const demos = createLazySection(() => import('./sections/DemosSection.jsx'), 'demos', {}, 4);
    const features = createLazySection(() => import('./sections/FeaturesSection.jsx'), 'features', {}, 5);
    const problem = createLazySection(() => import('./sections/ProblemSection.jsx'), 'problem', {}, 6);
    const workflow = createLazySection(() => import('./sections/WorkflowSection.jsx'), 'workflow', {}, 7);
    const comparison = createLazySection(() => import('./sections/ComparisonSection.jsx'), 'comparison', {}, 8);
    const valueStack = createLazySection(() => import('./sections/ValueStackSection.jsx'), 'value', {}, 9);
    const agency = createLazySection(() => import('./sections/AgencySection.jsx'), 'agency', {}, 10);
    const offer = createLazySection(() => import('./sections/OfferSection.jsx'), 'offer', {}, 11);
    const finalCTA = createLazySection(() => import('./sections/FinalCTASection.jsx'), 'cta', {}, 12);

    container.appendChild(scrollingStrip);
    container.appendChild(hookSection);
    container.appendChild(sixEngines);
    container.appendChild(appsGrid);
    container.appendChild(demos);
    container.appendChild(features);
    container.appendChild(problem);
    container.appendChild(workflow);
    container.appendChild(comparison);
    container.appendChild(valueStack);
    container.appendChild(agency);
    container.appendChild(offer);
    container.appendChild(finalCTA);

  } catch (error) {
    console.error('Error rendering landing page:', error);
    container.innerHTML = `
      <section class="relative py-32 px-4 text-center bg-[#020205] min-h-screen flex items-center justify-center">
        <div class="container mx-auto max-w-3xl">
          <h1 class="text-4xl md:text-6xl text-white mb-6">AI Video Agency Studio</h1>
          <p class="text-xl text-gray-400 mb-4">Something went wrong loading the page.</p>
          <button onclick="window.location.reload()" class="px-6 py-3 bg-cyan-400 text-black font-semibold rounded hover:bg-cyan-300 transition">
            Try Again
          </button>
        </div>
      </section>
    `;
  }

  return container;
}
