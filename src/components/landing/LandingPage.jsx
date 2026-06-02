// AI Video Agency Studio Landing Page
// Optimized with lazy loading for sections

// All 33 AI Creative Apps
const ALL_APPS = [
  { id: 'image', title: 'Image', description: 'Generate high-quality AI images for ads, thumbnails, product visuals, social media, websites, and client campaigns.', link: '/image' },
  { id: 'video', title: 'Video', description: 'Create text-to-video, image-to-video, video-to-video, and cinematic motion content for social, ads, and branded campaigns.', link: '/video' },
  { id: 'cinema', title: 'Cinema Studio', description: 'Direct AI-generated scenes using cinematic camera language, lenses, moods, lighting, motion, shot types, and visual styles.', link: '/cinema' },
  { id: 'character', title: 'Character', description: 'Create consistent AI characters, branded personas, story characters, spokespersons, creators, and campaign personalities.', link: '/character' },
  { id: 'ai-vfx', title: 'AI-VFX', description: 'Generate advanced AI visual effects such as explosions, lightning, fire, energy effects, disintegration, destruction, and cinematic transformations.', link: '/ai-vfx' },
  { id: 'influencer', title: 'Influencer', description: 'Create AI influencer visuals, social content concepts, creator-style campaigns, fashion shots, lifestyle scenes, and branded posts.', link: '/influencer' },
  { id: 'storyboard', title: 'Storyboard', description: 'Plan campaigns, commercials, short films, social videos, and client projects using AI-assisted scene and shot planning.', link: '/storyboard' },
  { id: 'effects', title: 'Effects', description: 'Apply creative effects, transformations, motion styles, cinematic treatments, and stylized visual looks.', link: '/effects' },
  { id: 'vfx', title: 'VFX', description: 'Create high-impact visual effects for trailers, ads, social videos, fantasy scenes, action sequences, and cinematic content.', link: '/vfx' },
  { id: 'edit', title: 'Edit', description: 'Edit, revise, enhance, repurpose, and improve visual assets so users can move from raw AI output to polished delivery.', link: '/edit' },
  { id: 'upscale', title: 'Upscale', description: 'Improve image and video quality with AI upscaling for sharper, cleaner, more professional-looking assets.', link: '/upscale' },
  { id: 'audio', title: 'Audio', description: 'Generate, enhance, transform, or prepare audio assets for videos, voiceovers, ads, explainers, and AI content.', link: '/audio' },
  { id: 'avatar', title: 'Avatar', description: 'Create AI avatar-based content, virtual presenters, branded spokespersons, personality-driven videos, and talking visuals.', link: '/avatar' },
  { id: 'training', title: 'Training', description: 'Teach users how to use the platform, create sellable assets, package services, and build an AI video agency.', link: '/training' },
  { id: 'videotools', title: 'Video Tools', description: 'Access utility tools for enhancing, converting, modifying, preparing, and improving video assets.', link: '/videotools' },
  { id: 'render', title: 'Render', description: 'Preview, organize, export, and prepare final outputs for download, editing, delivery, or client presentation.', link: '/render' },
  { id: 'video-agent', title: 'Video Agent', description: 'Use AI agents to assist with video creation, editing decisions, creative direction, workflow steps, and content generation.', link: '/video-agent' },
  { id: 'director', title: 'Director', description: 'Turn prompts, concepts, scripts, and creative ideas into directed cinematic scenes and structured video plans.', link: '/director' },
  { id: 'timeline', title: 'Timeline', description: 'Arrange scenes, assets, clips, shots, captions, audio, and creative elements inside a structured video timeline.', link: '/timeline' },
  { id: 'runway-motion', title: 'Motion', description: 'Generate camera movement, scene motion, product motion, character motion, and cinematic animation effects.', link: '/runway-motion' },
  { id: 'tiktok-carousel', title: 'TikTok', description: 'Create TikTok-style videos, hooks, short-form content, viral concepts, creator clips, and social-ready vertical assets.', link: '/tiktok-carousel' },
  { id: 'advanced-dubbing', title: 'Dubbing', description: 'Translate, localize, and dub video content for different languages, audiences, campaigns, and global delivery.', link: '/advanced-dubbing' },
  { id: 'commercial', title: 'Commercial', description: 'Create product commercials, brand ads, local business promos, ecommerce videos, launch videos, and agency-ready ad concepts.', link: '/commercial' },
  { id: 'templates', title: 'Templates', description: 'Start faster with prebuilt creative templates for ads, thumbnails, products, social posts, cinematic shots, VFX, and more.', link: '/templates' },
  { id: 'explore', title: 'Explore', description: 'Browse creative ideas, examples, presets, templates, use cases, visual styles, and production inspiration.', link: '/explore' },
  { id: 'library', title: 'Library', description: 'Store, organize, reuse, and manage generated assets, projects, videos, images, templates, and campaign materials.', link: '/library' },
  { id: 'community', title: 'Community', description: 'Showcase examples, discover creative workflows, highlight user creations, and build a community around AI video creation.', link: '/community' },
  { id: 'assist', title: 'Assist', description: 'Use guided AI help for prompts, workflows, studio selection, creative improvement, and project completion.', link: '/assist' },
  { id: 'workflows', title: 'Workflows', description: 'Run repeatable AI creative workflows for generating, editing, enhancing, rendering, and packaging content faster.', link: '/workflows' },
  { id: 'agents', title: 'Agents', description: 'Use specialized AI agents for creative direction, editing, storyboarding, video creation, pitch improvement, and production planning.', link: '/agents' },
  { id: 'mcp-cli', title: 'MCP & CLI', description: 'Control advanced workflows, connect tools, automate tasks, and extend the platform with agent-ready command and integration support.', link: '/mcp-cli' }
];

// Global animation styles flag
let globalStylesAdded = false;

// Add global animation styles
function addGlobalStyles() {
  if (globalStylesAdded) return;
  globalStylesAdded = true;
  
  const style = document.createElement('style');
  style.textContent = `
    /* Section entrance animations */
    .animate-in {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    .animate-in.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Staggered animation delay - will be overridden by inline style */
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
    
    /* Micro-interaction enhancements */
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
    
    /* Smooth scroll behavior */
    html {
      scroll-behavior: smooth;
    }
  `;
  document.head.appendChild(style);
}

// Section loader using Intersection Observer for lazy loading
function createLazySection(importFn, sectionId, props = {}, index = 0) {
  const placeholder = document.createElement('div');
  placeholder.id = `section-${sectionId}`;
  placeholder.className = 'min-h-[200px] flex items-center justify-center';
  placeholder.innerHTML = '<div class="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"></div>';
  
  // Use Intersection Observer to load when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        observer.unobserve(placeholder);
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
          // Add entrance animation class with stagger delay
          section.classList.add('animate-in');
          // Apply stagger delay based on index (0-based)
          const staggerIndex = Math.min(index, 10); // cap at 10 for predefined classes
          if (staggerIndex > 0) {
            section.classList.add(`stagger-${staggerIndex}`);
          }
          // Add enhanced button class for micro-interactions
          section.querySelectorAll('button').forEach(btn => {
            btn.classList.add('btn-enhanced');
          });
          placeholder.replaceWith(section);
          // Trigger animation after a slight delay to ensure layout is ready
          requestAnimationFrame(() => {
            section.classList.add('visible');
          });
        }).catch(err => {
          console.error(`Failed to load section ${sectionId}:`, err);
          placeholder.innerHTML = `<div class="text-red-400">Failed to load section</div>`;
        });
      }
    });
  }, { rootMargin: '200px' }); // Start loading earlier for better perception
  
  observer.observe(placeholder);
  return placeholder;
}

export default async function LandingPage() {
  // Add global animation styles
  addGlobalStyles();
  
  const container = document.createElement('div');
  container.className = 'landing-page min-h-screen bg-[#020205]';
  container.setAttribute('lang', document.documentElement.lang || 'en');
  container.setAttribute('dir', document.documentElement.dir || 'ltr');

  try {
    // Header - loaded immediately to appear first
    const { LandingHeader } = await import('./common/Header.jsx');
    const headerEl = LandingHeader();
    container.appendChild(headerEl);

    // Hero section - loaded immediately to appear above icon section
    const { HeroSection } = await import('./sections/HeroSection.jsx');
    const heroEl = HeroSection();
    // Add entrance animation for hero section
    heroEl.classList.add('animate-in');
    heroEl.classList.add('stagger-0'); // no delay for hero
    container.appendChild(heroEl);

    // Lazy-loaded sections with staggered indices
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

    // Append all sections
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