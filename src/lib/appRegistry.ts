export type AppCategory = 'Core' | 'Video' | 'Image' | 'Audio' | 'Social' | 'Marketing' | 'Imported' | 'Tools';

export interface AppEntry {
  id: string;
  name: string;
  route: string;
  category: AppCategory;
  description: string;
  thumbnail?: string;
  icon: string;
  tooltip: string;
  component?: () => Promise<{ default: React.ComponentType }>;
  protectedDesign?: boolean;
}

export const appRegistry: AppEntry[] = [
  // Core apps
  {
    id: 'apps',
    name: 'Apps',
    route: '/apps',
    category: 'Core',
    description: 'Browse and launch all available AI creative tools and applications',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    tooltip: 'Apps — Browse and launch all available AI creative tools and applications',
  },
  {
    id: 'studio',
    name: 'Studio',
    route: '/studio',
    category: 'Core',
    description: 'Open Generative AI creative studio dashboard',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    tooltip: 'Studio — Open Generative AI creative studio dashboard',
  },
  {
    id: 'assistant',
    name: 'Assistant',
    route: '/assistant',
    category: 'Core',
    description: 'Chat with AI assistants to brainstorm and get creative help',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    tooltip: 'Assistant — Chat with AI assistants to brainstorm and get creative help',
  },
  {
    id: 'workflows',
    name: 'Workflows',
    route: '/workflows',
    category: 'Core',
    description: 'Create and manage automated multi-step AI workflows',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/><line x1="5" y1="19" x2="19" y2="19"/></svg>',
    tooltip: 'Workflows — Create and manage automated multi-step AI workflows',
  },
  {
    id: 'agents',
    name: 'Agents',
    route: '/agents',
    category: 'Core',
    description: 'Create and manage AI agents for creative tasks',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4"/><path d="M8 14a6 6 0 0 0-6 6h20a6 6 0 0 0-6-6H8z"/><path d="M9 9h.01M15 9h.01"/></svg>',
    tooltip: 'Agents — Create and manage AI agents for creative tasks',
  },
  {
    id: 'explore',
    name: 'Explore',
    route: '/explore',
    category: 'Core',
    description: 'Discover trending creations, inspiration, and community showcases',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    tooltip: 'Explore — Discover trending creations, inspiration, and community showcases',
  },
  {
    id: 'library',
    name: 'Library',
    route: '/library',
    category: 'Core',
    description: 'Access your media library of uploaded and generated assets',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    tooltip: 'Library — Access your media library of uploaded and generated assets',
  },
  {
    id: 'community',
    name: 'Community',
    route: '/community',
    category: 'Core',
    description: 'Connect with other creators, share work, and collaborate',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    tooltip: 'Community — Connect with other creators, share work, and collaborate',
  },
  {
    id: 'chat',
    name: 'Chat',
    route: '/chat',
    category: 'Core',
    description: 'Chat with AI assistants to brainstorm ideas and get creative help',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    tooltip: 'Chat — Chat with AI assistants to brainstorm ideas and get creative help',
  },
  {
    id: 'templates',
    name: 'Templates',
    route: '/templates',
    category: 'Core',
    description: 'Browse and use pre-built project templates to jumpstart your work',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
    tooltip: 'Templates — Browse and use pre-built project templates to jumpstart your work',
  },

  // Video apps
  {
    id: 'video',
    name: 'Video',
    route: '/video',
    category: 'Video',
    description: 'Create, edit, and produce AI-generated or imported video content',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    tooltip: 'Video — Create, edit, and produce AI-generated or imported video content',
  },
  {
    id: 'cinema',
    name: 'Cinema',
    route: '/cinema',
    category: 'Video',
    description: 'Access cinematic film templates and movie-style production tools',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
    tooltip: 'Cinema — Access cinematic film templates and movie-style production tools',
  },
  {
    id: 'headshots',
    name: 'Headshots',
    route: '/headshots',
    category: 'Video',
    description: 'Generate professional AI headshots from your photos',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a4 4 0 110 8 4 4 0 010-8z"/><path d="M4 21v-1a8 8 0 0116 0v1"/><rect x="16" y="14" width="6" height="6" rx="1"/></svg>',
    tooltip: 'Headshots — Generate professional AI headshots from your photos',
  },
  {
    id: 'ai-headshot',
    name: 'AI Headshot',
    route: '/ai-headshot',
    category: 'Video',
    description: 'Create studio-quality portrait photos using advanced AI models',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11v2"/><path d="M8 14c1 1 4 1 8 0"/></svg>',
    tooltip: 'AI Headshot — Create studio-quality portrait photos using advanced AI models',
  },
  {
    id: 'character',
    name: 'Character',
    route: '/character',
    category: 'Video',
    description: 'Design and manage AI characters for your creative projects',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    tooltip: 'Character — Design and manage AI characters for your creative projects',
  },
  {
    id: 'ai-vfx',
    name: 'AI-VFX',
    route: '/ai-vfx',
    category: 'Video',
    description: 'Add AI-generated visual effects and compositing to your media',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
    tooltip: 'AI-VFX — Add AI-generated visual effects and compositing to your media',
  },
  {
    id: 'influencer',
    name: 'Influencer',
    route: '/influencer',
    category: 'Video',
    description: 'Create influencer-style content and social media campaigns',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6v12a3 3 0 103 3V6a3 3 0 10-3 3z"/></svg>',
    tooltip: 'Influencer — Create influencer-style content and social media campaigns',
  },
  {
    id: 'storyboard',
    name: 'Storyboard',
    route: '/storyboard',
    category: 'Video',
    description: 'Plan and visualize your video scenes with AI-assisted storyboarding',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="6" height="8" rx="1"/><rect x="9" y="3" width="6" height="8" rx="1"/><rect x="16" y="3" width="6" height="8" rx="1"/><rect x="2" y="13" width="6" height="8" rx="1"/><rect x="9" y="13" width="6" height="8" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg>',
    tooltip: 'Storyboard — Plan and visualize your video scenes with AI-assisted storyboarding',
  },
  {
    id: 'effects',
    name: 'Effects',
    route: '/effects',
    category: 'Video',
    description: 'Browse and apply creative visual effects and filters to your projects',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    tooltip: 'Effects — Browse and apply creative visual effects and filters to your projects',
  },
  {
    id: 'vfx',
    name: 'VFX',
    route: '/vfx',
    category: 'Video',
    description: 'Access professional visual effects tools for video and image compositing',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    tooltip: 'VFX — Access professional visual effects tools for video and image compositing',
  },
  {
    id: 'edit',
    name: 'Edit',
    route: '/edit',
    category: 'Video',
    description: 'Open the editor to modify and refine your media assets and projects',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    tooltip: 'Edit — Open the editor to modify and refine your media assets and projects',
  },
  {
    id: 'render',
    name: 'Render',
    route: '/render',
    category: 'Video',
    description: 'Export and render your final projects in various formats and qualities',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/><line x1="19" y1="3" x2="19" y2="21"/></svg>',
    tooltip: 'Render — Export and render your final projects in various formats and qualities',
  },
  {
    id: 'video-agent',
    name: 'Video Agent',
    route: '/video-agent',
    category: 'Video',
    description: 'Use AI to automatically generate and edit video content',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/><path d="M8 15h8"/><path d="M12 2v2"/></svg>',
    tooltip: 'Video Agent — Use AI to automatically generate and edit video content',
  },
  {
    id: 'video-outreach',
    name: 'Outreach',
    route: '/video-outreach',
    category: 'Video',
    description: 'Create and manage video outreach campaigns for audience engagement',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4L2 12l7 3 3 7 10-18z"/><path d="M22 4L9 15"/></svg>',
    tooltip: 'Outreach — Create and manage video outreach campaigns for audience engagement',
  },
  {
    id: 'director',
    name: 'Director',
    route: '/director',
    category: 'Video',
    description: 'Access director-mode tools for cinematic scene composition and planning',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l4-4h4l4 4"/><path d="M2 6h20v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>',
    tooltip: 'Director — Access director-mode tools for cinematic scene composition and planning',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    route: '/timeline',
    category: 'Video',
    description: 'Open the multi-track timeline editor for arranging and sequencing media',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/><circle cx="6" cy="6" r="1.5" fill="currentColor"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="18" r="1.5" fill="currentColor"/></svg>',
    tooltip: 'Timeline — Open the multi-track timeline editor for arranging and sequencing media',
  },
  {
    id: 'runway-motion',
    name: 'Motion',
    route: '/runway-motion',
    category: 'Video',
    description: 'Generate motion graphics and animated content from images and video',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/><path d="M12 13l1.5 2.5"/></svg>',
    tooltip: 'Motion — Generate motion graphics and animated content from images and video',
  },
  {
    id: 'tiktok-carousel',
    name: 'TikTok',
    route: '/tiktok-carousel',
    category: 'Video',
    description: 'Create short-form vertical videos optimized for TikTok and Reels',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="6" y="6" width="12" height="12" rx="1"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="15" cy="15" r="1"/></svg>',
    tooltip: 'TikTok — Create short-form vertical videos optimized for TikTok and Reels',
  },
  {
    id: 'advanced-dubbing',
    name: 'Dubbing',
    route: '/advanced-dubbing',
    category: 'Video',
    description: 'Add AI-generated voiceovers and dubbed audio in multiple languages',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M9 9l12-2"/><path d="M9 13l12-2"/></svg>',
    tooltip: 'Dubbing — Add AI-generated voiceovers and dubbed audio in multiple languages',
  },
  {
    id: 'commercial',
    name: 'Commercial',
    route: '/commercial',
    category: 'Video',
    description: 'Create professional commercial and advertisement content with AI',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
    tooltip: 'Commercial — Create professional commercial and advertisement content with AI',
  },

  // Image apps
  {
    id: 'image',
    name: 'Image',
    route: '/image',
    category: 'Image',
    description: 'Generate, edit, and enhance images using AI-powered tools',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    tooltip: 'Image — Generate, edit, and enhance images using AI-powered tools',
  },
  {
    id: 'upscale',
    name: 'Upscale',
    route: '/upscale',
    category: 'Image',
    description: 'Increase image and video resolution using AI super-resolution',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
    tooltip: 'Upscale — Increase image and video resolution using AI super-resolution',
  },

  // Audio apps
  {
    id: 'audio',
    name: 'Audio',
    route: '/audio',
    category: 'Audio',
    description: 'Add, edit, and mix audio tracks, music, and sound effects',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    tooltip: 'Audio — Add, edit, and mix audio tracks, music, and sound effects',
  },
  {
    id: 'avatar',
    name: 'Avatar',
    route: '/avatar',
    category: 'Audio',
    description: 'Create and customize AI-powered digital avatars and personas',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11v2"/><path d="M8 14c1 1 4 1 8 0"/></svg>',
    tooltip: 'Avatar — Create and customize AI-powered digital avatars and personas',
  },

  // Tools apps
  {
    id: 'training',
    name: 'Training',
    route: '/training',
    category: 'Tools',
    description: 'Train custom AI models on your own data and style preferences',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    tooltip: 'Training — Train custom AI models on your own data and style preferences',
  },
  {
    id: 'videotools',
    name: 'Video Tools',
    route: '/videotools',
    category: 'Tools',
    description: 'Access specialized utilities for video processing and enhancement',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg>',
    tooltip: 'Video Tools — Access specialized utilities for video processing and enhancement',
  },

  // Marketing apps
  {
    id: 'marketing-studio',
    name: 'Marketing',
    route: '/marketing-studio',
    category: 'Marketing',
    description: 'Create marketing materials, ads, and promotional content with AI',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18v14H3z"/><path d="M7 9h10"/><path d="M7 13h6"/></svg>',
    tooltip: 'Marketing — Create marketing materials, ads, and promotional content with AI',
  },
  {
    id: 'ai-workflow',
    name: 'AI Workflow',
    route: '/ai-workflow',
    category: 'Marketing',
    description: 'Build and run AI-powered multi-step workflows',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/><line x1="5" y1="19" x2="19" y2="19"/></svg>',
    tooltip: 'AI Workflow — Build and run AI-powered multi-step workflows',
  },
  {
    id: 'design-agent',
    name: 'Design Agent',
    route: '/design-agent',
    category: 'Marketing',
    description: 'AI design assistant for layouts and creative projects',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2z"/><path d="M5 15l.54 1.63L7 17.17l-1.46.37L5 19.17l-.54-1.63L3 17.17l1.46-.37L5 15z"/><path d="M19 11l.54 1.63L21 13.17l-1.46.37L19 15.17l-.54-1.63L17 13.17l1.46-.37L19 11z"/></svg>',
    tooltip: 'Design Agent — AI design assistant for layouts and creative projects',
  },
  {
    id: 'pomelli-studio',
    name: 'Pomelli',
    route: '/pomelli-studio',
    category: 'Marketing',
    description: 'Full AI marketing studio for brand DNA, campaigns, photo studio, and animation',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18v14H3z"/><path d="M7 9h10"/><path d="M7 13h6"/></svg>',
    tooltip: 'Pomelli Studio — Full AI marketing studio for brand DNA, campaigns, photo studio, and animation',
  },
  {
    id: 'assist',
    name: 'Assist',
    route: '/assist',
    category: 'Marketing',
    description: 'Get AI-powered suggestions and automated help for your creative tasks',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2z"/><path d="M5 15l.54 1.63L7 17.17l-1.46.37L5 19.17l-.54-1.63L3 17.17l1.46-.37L5 15z"/><path d="M19 11l.54 1.63L21 13.17l-1.46.37L19 15.17l-.54-1.63L17 13.17l1.46-.37L19 11z"/></svg>',
    tooltip: 'Assist — Get AI-powered suggestions and automated help for your creative tasks',
  },

  // Imported apps
  {
    id: 'remix-go',
    name: 'Remix Go',
    route: '/remix-go',
    category: 'Imported',
    description: 'Quickly remix and iterate on existing projects and templates',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3V9z"/><circle cx="16" cy="14" r="2"/></svg>',
    tooltip: 'Remix Go — Quickly remix and iterate on existing projects and templates',
  },

  // Commits (version history)
  {
    id: 'commits',
    name: 'Commits (0)',
    route: '/commits',
    category: 'Core',
    description: 'View version history and saved snapshots of your project',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/><path d="M8 3v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3"/><path d="M14 9h-4"/><path d="M14 12h-2"/><path d="M14 15h-4"/></svg>',
    tooltip: 'Commits — View version history and saved snapshots of your project',
  },

  // Bottom items (special navigation)
  {
    id: 'documentation',
    name: 'Docs',
    route: '/documentation',
    category: 'Core',
    description: 'View implementation plan and documentation',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
    tooltip: 'Documentation — View implementation plan and documentation',
  },
  {
    id: 'settings',
    name: 'Settings',
    route: '/settings',
    category: 'Core',
    description: 'Configure application preferences, account, and workspace options',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    tooltip: 'Settings — Configure application preferences, account, and workspace options',
  },
];

// Extended routes not in sidebar but needed for full routing
export const extendedRoutes: AppEntry[] = [
  {
    id: 'mcp-cli',
    name: 'MCP & CLI',
    route: '/mcp-cli',
    category: 'Tools',
    description: 'Command-line interface for Model Context Protocol',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    tooltip: 'MCP & CLI — Command-line interface for Model Context Protocol',
  },
  {
    id: 'text-to-image',
    name: 'Text to Image',
    route: '/text-to-image',
    category: 'Image',
    description: 'Generate images from text prompts',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    tooltip: 'Text to Image — Generate images from text prompts',
  },
  {
    id: 'image-to-image',
    name: 'Image to Image',
    route: '/image-to-image',
    category: 'Image',
    description: 'Transform images using AI models',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    tooltip: 'Image to Image — Transform images using AI models',
  },
  {
    id: 'text-to-video',
    name: 'Text to Video',
    route: '/text-to-video',
    category: 'Video',
    description: 'Generate videos from text prompts',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    tooltip: 'Text to Video — Generate videos from text prompts',
  },
  {
    id: 'image-to-video',
    name: 'Image to Video',
    route: '/image-to-video',
    category: 'Video',
    description: 'Animate images into videos',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    tooltip: 'Image to Video — Animate images into videos',
  },
  {
    id: 'video-to-video',
    name: 'Video to Video',
    route: '/video-to-video',
    category: 'Video',
    description: 'Transform and enhance videos using AI',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    tooltip: 'Video to Video — Transform and enhance videos using AI',
  },
  {
    id: 'video-watermark',
    name: 'Video Watermark',
    route: '/video-watermark',
    category: 'Video',
    description: 'Add watermarks to videos',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    tooltip: 'Video Watermark — Add watermarks to videos',
  },
  {
    id: 'storyboard-page',
    name: 'Storyboard Page',
    route: '/storyboard-page',
    category: 'Video',
    description: 'Storyboard page view',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="6" height="8" rx="1"/><rect x="9" y="3" width="6" height="8" rx="1"/><rect x="16" y="3" width="6" height="8" rx="1"/></svg>',
    tooltip: 'Storyboard Page — Storyboard page view',
  },
  {
    id: 'character-page',
    name: 'Character Page',
    route: '/character-page',
    category: 'Video',
    description: 'Character page view',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    tooltip: 'Character Page — Character page view',
  },
  {
    id: 'effects-page',
    name: 'Effects Page',
    route: '/effects-page',
    category: 'Video',
    description: 'Effects page view',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    tooltip: 'Effects Page — Effects page view',
  },
  {
    id: 'cinema-page',
    name: 'Cinema Page',
    route: '/cinema-page',
    category: 'Video',
    description: 'Cinema page view',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/></svg>',
    tooltip: 'Cinema Page — Cinema page view',
  },
  {
    id: 'influencer-page',
    name: 'Influencer Page',
    route: '/influencer-page',
    category: 'Video',
    description: 'Influencer page view',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6v12a3 3 0 103 3V6a3 3 0 10-3 3z"/></svg>',
    tooltip: 'Influencer Page — Influencer page view',
  },
  {
    id: 'commercial-page',
    name: 'Commercial Page',
    route: '/commercial-page',
    category: 'Video',
    description: 'Commercial page view',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
    tooltip: 'Commercial Page — Commercial page view',
  },
  {
    id: 'upscale-page',
    name: 'Upscale Page',
    route: '/upscale-page',
    category: 'Image',
    description: 'Upscale page view',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/></svg>',
    tooltip: 'Upscale Page — Upscale page view',
  },
  {
    id: 'ai-video-outreach',
    name: 'AI Video Outreach',
    route: '/ai-video-outreach',
    category: 'Video',
    description: 'AI-powered video outreach campaigns',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4L2 12l7 3 3 7 10-18z"/></svg>',
    tooltip: 'AI Video Outreach — AI-powered video outreach campaigns',
  },
  {
    id: 'headshots-generate',
    name: 'Headshots Generate',
    route: '/headshots-generate',
    category: 'Video',
    description: 'Generate headshots',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a4 4 0 110 8 4 4 0 010-8z"/></svg>',
    tooltip: 'Headshots Generate — Generate headshots',
  },
  {
    id: 'headshots-history',
    name: 'Headshots History',
    route: '/headshots-history',
    category: 'Video',
    description: 'View headshot generation history',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/></svg>',
    tooltip: 'Headshots History — View headshot generation history',
  },
  {
    id: 'personalizer',
    name: 'Personalizer',
    route: '/personalizer',
    category: 'Marketing',
    description: 'Personalize content for different audiences',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4"/></svg>',
    tooltip: 'Personalizer — Personalize content for different audiences',
  },
  {
    id: 'workflow-studio',
    name: 'Workflow Studio',
    route: '/workflow-studio',
    category: 'Core',
    description: 'Advanced workflow creation and management',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/></svg>',
    tooltip: 'Workflow Studio — Advanced workflow creation and management',
  },
  {
    id: 'agents/create',
    name: 'Create Agent',
    route: '/agents/create',
    category: 'Core',
    description: 'Create a new AI agent',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    tooltip: 'Create Agent — Create a new AI agent',
  },
  {
    id: 'agents/edit',
    name: 'Edit Agent',
    route: '/agents/edit',
    category: 'Core',
    description: 'Edit an existing AI agent',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    tooltip: 'Edit Agent — Edit an existing AI agent',
  },
  {
    id: 'landing',
    name: 'Landing',
    route: '/landing',
    category: 'Core',
    description: 'Landing page',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
    tooltip: 'Landing Page',
  },
  {
    id: 'signin',
    name: 'Sign In',
    route: '/signin',
    category: 'Core',
    description: 'Sign in page',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>',
    tooltip: 'Sign In — Sign in to your account',
  },
];

// Combined registry for all navigation items
export const allApps: AppEntry[] = [...appRegistry, ...extendedRoutes];

// Helper functions
export function getAppById(id: string): AppEntry | undefined {
  return allApps.find(app => app.id === id);
}

export function getAppsByCategory(category: AppCategory): AppEntry[] {
  return allApps.filter(app => app.category === category);
}

export function getMainNavApps(): AppEntry[] {
  return appRegistry.filter(app => !['documentation', 'settings'].includes(app.id));
}

export function getBottomNavApps(): AppEntry[] {
  return appRegistry.filter(app => ['documentation', 'settings'].includes(app.id));
}

// Get route path for an app (handles special routes like template/:id)
export function getRoutePath(id: string, params?: Record<string, string>): string {
  const app = getAppById(id);
  if (!app) return `/${id}`;
  
  if (params && id.startsWith('effects/template/')) {
    return `/effects/template/${params.templateId}`;
  }
  if (params && id.startsWith('template/')) {
    return `/template/${params.templateId}`;
  }
  
  return app.route;
}

// Categories list
export const categories: AppCategory[] = ['Core', 'Video', 'Image', 'Audio', 'Social', 'Marketing', 'Imported', 'Tools'];