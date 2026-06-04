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
