import { NODE_TYPES } from './nodeDefinitions';

/**
 * Thumbnail resolver for the 60 Workflow presets (Option A — Clean separation).
 *
 * Strategy:
 * - Primary: /thumbnails/studios/workflow-builder.png (the official Workflows feature image)
 * - Secondary: /thumbnails/categories/*.webp (thematic grouping)
 * - Only borrow from the old /thumbnails/templates/*.webp in very specific, justified cases
 *   where the workflow is a direct implementation of that exact artistic style.
 *
 * Goal: Keep visual identity of the new node-based Workflows system distinct from
 * the old one-click Templates system.
 */
const getThumbnail = (templateId) => {
  /**
   * Thumbnail strategy for the 60 Workflow presets (following Option A):
   *
   * - Default to the official Workflows feature image (workflow-builder.png)
   * - Use category banners for thematic grouping (VFX, Portrait, Entertainment, etc.)
   * - Only reuse old template artwork in strong, direct cases (e.g. a "TikTok Video" workflow
   *   can legitimately show the TikTok thumbnail).
   *
   * This keeps the visual language of the new node-based Workflows feature distinct from
   * the legacy one-click Templates system.
   */

  const map = {
    // ============================================================
    // STRONGLY JUSTIFIED CASES — Direct artistic match to old template
    // Only keep these when the workflow preset is basically "do this exact effect"
    // ============================================================
    'tpl-tiktok-video': '/thumbnails/templates/tiktok-video.webp',
    'tpl-vhs-retro': '/thumbnails/templates/vhs-retro.webp',
    'tpl-film-noir': '/thumbnails/templates/film-noir.webp',
    'tpl-disney-pixar': '/thumbnails/templates/disney-pixar.webp',
    'tpl-squid-game': '/thumbnails/templates/squid-game.webp',
    'tpl-product-hero': '/thumbnails/templates/product-hero.webp',
    'tpl-thumbnail-gen': '/thumbnails/templates/youtube-thumbnail.webp',
    'tpl-short-form-ad': '/thumbnails/templates/short-form-ad.webp',
    'tpl-asmr-video': '/thumbnails/templates/asmr-video.webp',
    'tpl-unboxing-scene': '/thumbnails/templates/unboxing-scene.webp',
    'tpl-instagram-reel': '/thumbnails/templates/instagram-reel.webp',
    'tpl-matrix-shot': '/thumbnails/templates/matrix-shot.webp',
    'tpl-drone-fpv': '/thumbnails/templates/drone-fpv.webp',
    'tpl-dolly-zoom': '/thumbnails/templates/dolly-zoom.webp',
    'tpl-youtube-shorts': '/thumbnails/templates/tiktok-video.webp', // closest match

    // ============================================================
    // EVERYTHING ELSE → Use workflow-builder.png or category images
    // ============================================================

    // === Default workflow builder image (strong preference) ===
    'tpl-image-pipeline': '/thumbnails/studios/workflow-builder.png',
    'tpl-banner-creator': '/thumbnails/studios/workflow-builder.png',
    'tpl-video-pipeline': '/thumbnails/studios/workflow-builder.png',
    'tpl-social-video': '/thumbnails/studios/workflow-builder.png',
    'tpl-multi-stage': '/thumbnails/studios/workflow-builder.png',
    'tpl-prompt-enhance': '/thumbnails/studios/workflow-builder.png',
    'tpl-image-video-audio': '/thumbnails/studios/workflow-builder.png',
    'tpl-video-edit': '/thumbnails/studios/workflow-builder.png',
    'tpl-multi-video-edit': '/thumbnails/studios/workflow-builder.png',
    'tpl-car-chase': '/thumbnails/studios/workflow-builder.png',

    // === Category images for better thematic grouping ===
    'tpl-bullet-time': '/thumbnails/categories/camera.webp',
    'tpl-anime': '/thumbnails/categories/entertainment.webp',
    'tpl-cyberpunk': '/thumbnails/categories/entertainment.webp',
    'tpl-comic-book': '/thumbnails/categories/entertainment.webp',
    'tpl-gta': '/thumbnails/categories/entertainment.webp',
    'tpl-superhero-transform': '/thumbnails/categories/entertainment.webp',
    'tpl-movie-poster': '/thumbnails/categories/entertainment.webp',
    'tpl-lego-style': '/thumbnails/categories/entertainment.webp',
    'tpl-ghibli': '/thumbnails/categories/entertainment.webp',

    'tpl-electricity': '/thumbnails/categories/vfx.webp',
    'tpl-fire-breath': '/thumbnails/categories/vfx.webp',
    'tpl-building-explosion': '/thumbnails/categories/vfx.webp',
    'tpl-car-explosion': '/thumbnails/categories/vfx.webp',
    'tpl-disintegration': '/thumbnails/categories/vfx.webp',
    'tpl-tornado': '/thumbnails/categories/vfx.webp',

    'tpl-face-swap': '/thumbnails/categories/portrait.webp',
    'tpl-fashion-stride': '/thumbnails/categories/portrait.webp',
    'tpl-1920s-style': '/thumbnails/categories/portrait.webp',
    'tpl-1950s-style': '/thumbnails/categories/portrait.webp',
    'tpl-1970s-style': '/thumbnails/categories/portrait.webp',
    'tpl-1980s-style': '/thumbnails/categories/portrait.webp',
    'tpl-glamour-portrait': '/thumbnails/categories/portrait.webp',
    'tpl-age-progression': '/thumbnails/categories/portrait.webp',
    'tpl-gender-swap': '/thumbnails/categories/portrait.webp',
    'tpl-younger-self': '/thumbnails/categories/portrait.webp',
    'tpl-profile-picture': '/thumbnails/categories/portrait.webp',

    'tpl-billboard-ad': '/thumbnails/categories/commercial.webp',
    'tpl-product-photography': '/thumbnails/categories/commercial.webp',
    'tpl-product-placement': '/thumbnails/categories/commercial.webp',

    // Fallback for anything not explicitly mapped
    'tpl-3d-figurine': '/thumbnails/studios/workflow-builder.png',
    'tpl-action-figure': '/thumbnails/studios/workflow-builder.png',
    'tpl-glass-ball': '/thumbnails/studios/workflow-builder.png',
    'tpl-pixel-art': '/thumbnails/studios/workflow-builder.png',
    'tpl-magazine-cover': '/thumbnails/studios/workflow-builder.png',
    'tpl-story-cover': '/thumbnails/studios/workflow-builder.png',
  };

  // Ultimate fallback — always a real repo asset
  const fallback = '/thumbnails/studios/workflow-builder.png';

  return map[templateId] || fallback;
};

export const WORKFLOW_CATEGORIES = {
  IMAGE: 'image',
  VIDEO: 'video',
  TEXT: 'text',
  AUDIO: 'audio',
  MIXED: 'mixed',
  STYLE: 'style',
  SOCIAL: 'social',
  ENTERTAINMENT: 'entertainment',
  COMMERCIAL: 'commercial',
  VFX: 'vfx',
  PORTRAIT: 'portrait',
  DECADE: 'decade',
  CAMERA: 'camera',
};

const textToImageWorkflow = (id, name, description, category, textLabel = 'Prompt', imageLabel = 'Image Gen') => ({
  id,
  name,
  description,
  category,
  thumbnail: getThumbnail(id),
  nodes: [
    { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 100 }, data: { label: textLabel } },
    { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 350, y: 100 }, data: { label: imageLabel } },
  ],
  edges: [
    { source: 'text1', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'imageInput' },
  ],
});

const imageToVideoWorkflow = (id, name, description, category, imageLabel = 'Start Frame', videoLabel = 'Video Gen') => ({
  id,
  name,
  description,
  category,
  thumbnail: getThumbnail(id),
  nodes: [
    { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: imageLabel } },
    { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: videoLabel } },
  ],
  edges: [
    { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' },
  ],
});

const textToVideoWorkflow = (id, name, description, category) => ({
  id,
  name,
  description,
  category,
  thumbnail: getThumbnail(id),
  nodes: [
    { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 100 }, data: { label: 'Prompt' } },
    { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 350, y: 100 }, data: { label: 'Image Gen' } },
    { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 700, y: 100 }, data: { label: 'Video Gen' } },
  ],
  edges: [
    { source: 'text1', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'imageInput' },
    { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' },
  ],
});

const styleTransferWorkflow = (id, name, description, category, effectName) => ({
  id,
  name,
  description,
  category,
  thumbnail: getThumbnail(id),
  nodes: [
    { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Source' } },
    { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 220 }, data: { label: 'Description' } },
    { id: 'api1', type: NODE_TYPES.API, position: { x: 350, y: 100 }, data: { label: effectName, apiType: 'style-transfer' } },
    { id: 'image2', type: NODE_TYPES.IMAGE, position: { x: 700, y: 100 }, data: { label: 'Styled' } },
  ],
  edges: [
    { source: 'image1', target: 'api1', sourceHandle: 'imageOutput', targetHandle: 'apiInput' },
    { source: 'text1', target: 'api1', sourceHandle: 'textOutput', targetHandle: 'apiInput2' },
    { source: 'api1', target: 'image2', sourceHandle: 'apiOutput', targetHandle: 'imageInput' },
  ],
});

const portraitWorkflow = (id, name, description, category, effectName) => ({
  id,
  name,
  description,
  category,
  thumbnail: getThumbnail(id),
  nodes: [
    { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Portrait' } },
    { id: 'api1', type: NODE_TYPES.API, position: { x: 350, y: 100 }, data: { label: effectName, apiType: 'portrait-effect' } },
    { id: 'image2', type: NODE_TYPES.IMAGE, position: { x: 700, y: 100 }, data: { label: 'Result' } },
  ],
  edges: [
    { source: 'image1', target: 'api1', sourceHandle: 'imageOutput', targetHandle: 'apiInput' },
    { source: 'api1', target: 'image2', sourceHandle: 'apiOutput', targetHandle: 'imageInput' },
  ],
});

const vfxWorkflow = (id, name, description, category, effectName) => ({
  id,
  name,
  description,
  category,
  thumbnail: getThumbnail(id),
  nodes: [
    { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Source' } },
    { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 220 }, data: { label: 'Description' } },
    { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: effectName } },
  ],
  edges: [
    { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' },
    { source: 'text1', target: 'video1', sourceHandle: 'textOutput', targetHandle: 'videoInput' },
  ],
});

const videoEditWorkflow = (id, name, description, category, inputs = 2) => {
  const nodes = [];
  const edges = [];
  for (let i = 0; i < inputs; i++) {
    nodes.push({ id: `video${i + 1}`, type: NODE_TYPES.VIDEO, position: { x: 0, y: 100 + i * 150 }, data: { label: `Video ${i + 1}` } });
  }
  nodes.push({ id: 'concat1', type: NODE_TYPES.VID_CONCAT, position: { x: 350, y: 150 }, data: { label: 'Combine' } });
  for (let i = 0; i < inputs; i++) {
    edges.push({ source: `video${i + 1}`, target: 'concat1', sourceHandle: 'videoOutput', targetHandle: `videoInput${i}` });
  }
  return { id, name, description, category, thumbnail: getThumbnail(id), nodes, edges };
};

const socialMediaWorkflow = (id, name, description, category, aspectRatio = '9:16') => ({
  id,
  name,
  description,
  category,
  thumbnail: getThumbnail(id),
  nodes: [
    { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Source Image' } },
    { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 220 }, data: { label: 'Prompt' } },
    { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: 'Video Gen', aspectRatio } },
  ],
  edges: [
    { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' },
    { source: 'text1', target: 'video1', sourceHandle: 'textOutput', targetHandle: 'videoInput' },
  ],
});

export const workflowTemplates = [
  // Image (5)
  textToImageWorkflow('tpl-image-pipeline', 'Image Generation Pipeline', 'Generate images from text prompts using FLUX or SD models', WORKFLOW_CATEGORIES.IMAGE),
  textToImageWorkflow('tpl-banner-creator', 'Banner Creator', 'Wide cinematic banners for channels and pages', WORKFLOW_CATEGORIES.IMAGE, 'Banner Description', 'Banner Gen'),
  textToImageWorkflow('tpl-thumbnail-gen', 'YouTube Thumbnail Generator', 'Bold, eye-catching thumbnails that drive clicks', WORKFLOW_CATEGORIES.IMAGE, 'Thumbnail Description', 'Thumbnail Gen'),
  textToImageWorkflow('tpl-product-hero', 'Product Hero Shot', 'Studio-quality product photography', WORKFLOW_CATEGORIES.IMAGE, 'Product Description', 'Product Photo'),
  textToImageWorkflow('tpl-story-cover', 'Story Highlight Cover', 'Minimalist icon-style story covers', WORKFLOW_CATEGORIES.IMAGE, 'Icon Description', 'Icon Gen'),

  // Video (8)
  textToVideoWorkflow('tpl-video-pipeline', 'Video Generation Pipeline', 'Create videos from text and images', WORKFLOW_CATEGORIES.VIDEO),
  textToVideoWorkflow('tpl-social-video', 'Social Media Video', 'Vertical videos optimized for social feeds', WORKFLOW_CATEGORIES.VIDEO),
  textToVideoWorkflow('tpl-short-form-ad', 'Short-Form Ad Creator', 'Product promo videos for social feeds', WORKFLOW_CATEGORIES.VIDEO),
  imageToVideoWorkflow('tpl-vhs-retro', 'VHS Retro Style', 'Analog VHS tape effect with scan lines', WORKFLOW_CATEGORIES.VIDEO, 'Source', 'VHS Effect'),
  imageToVideoWorkflow('tpl-film-noir', 'Film Noir Style', 'Classic black & white detective cinema', WORKFLOW_CATEGORIES.VIDEO, 'Source', 'Film Noir'),
  imageToVideoWorkflow('tpl-bullet-time', 'Bullet Time Scene', 'Matrix-style freeze-frame rotation', WORKFLOW_CATEGORIES.VIDEO, 'Source', 'Bullet Time'),
  imageToVideoWorkflow('tpl-drone-fpv', 'Drone FPV Shot', 'First-person drone flythrough footage', WORKFLOW_CATEGORIES.VIDEO, 'Landscape', 'FPV Flight'),
  imageToVideoWorkflow('tpl-dolly-zoom', 'Dolly Zoom Effect', 'Hitchcock vertigo zoom effect', WORKFLOW_CATEGORIES.VIDEO, 'Source', 'Dolly Zoom'),

  // Mixed (3)
  { id: 'tpl-multi-stage', name: 'Multi-Stage Generation', description: 'Text to image to video chain', category: WORKFLOW_CATEGORIES.MIXED, thumbnail: getThumbnail('tpl-multi-stage'), nodes: [ { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 100 }, data: { label: 'Prompt' } }, { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 350, y: 100 }, data: { label: 'Image Gen' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 700, y: 100 }, data: { label: 'Video Gen' } } ], edges: [ { source: 'text1', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'imageInput' }, { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' } ] },
  { id: 'tpl-prompt-enhance', name: 'Prompt Enhancement', description: 'Enhance prompts with AI before generation', category: WORKFLOW_CATEGORIES.MIXED, thumbnail: getThumbnail('tpl-prompt-enhance'), nodes: [ { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 100 }, data: { label: 'Basic Prompt' } }, { id: 'text2', type: NODE_TYPES.TEXT, position: { x: 350, y: 100 }, data: { label: 'Enhanced' } }, { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 700, y: 100 }, data: { label: 'Image Gen' } } ], edges: [ { source: 'text1', target: 'text2', sourceHandle: 'textOutput', targetHandle: 'textInput' }, { source: 'text2', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'imageInput' } ] },
  { id: 'tpl-image-video-audio', name: 'Full Media Pipeline', description: 'Generate image, convert to video, add audio', category: WORKFLOW_CATEGORIES.MIXED, thumbnail: getThumbnail('tpl-image-video-audio'), nodes: [ { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 50 }, data: { label: 'Prompt' } }, { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 300, y: 50 }, data: { label: 'Image' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 600, y: 50 }, data: { label: 'Video' } }, { id: 'audio1', type: NODE_TYPES.AUDIO, position: { x: 600, y: 170 }, data: { label: 'Audio' } }, { id: 'concat1', type: NODE_TYPES.VID_CONCAT, position: { x: 900, y: 80 }, data: { label: 'Combine' } } ], edges: [ { source: 'text1', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'imageInput' }, { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' }, { source: 'video1', target: 'concat1', sourceHandle: 'videoOutput', targetHandle: 'videoInput' }, { source: 'audio1', target: 'concat1', sourceHandle: 'audioOutput', targetHandle: 'audioInput' } ] },

  // Video Editing (3)
  videoEditWorkflow('tpl-video-edit', 'Video Editing Pipeline', 'Combine multiple videos with audio', WORKFLOW_CATEGORIES.VIDEO, 2),
  videoEditWorkflow('tpl-multi-video-edit', 'Multi-Video Editor', 'Combine multiple videos together', WORKFLOW_CATEGORIES.VIDEO, 3),
  videoEditWorkflow('tpl-car-chase', 'Car Chase Scene', 'Action movie car chase footage', WORKFLOW_CATEGORIES.VIDEO, 1),

  // Style (8)
  styleTransferWorkflow('tpl-anime', 'Anime Converter', 'Transform any photo into anime style', WORKFLOW_CATEGORIES.STYLE, 'Anime Style'),
  styleTransferWorkflow('tpl-ghibli', 'Ghibli Style', 'Studio Ghibli-inspired transformation', WORKFLOW_CATEGORIES.STYLE, 'Ghibli Style'),
  styleTransferWorkflow('tpl-cyberpunk', 'Cyberpunk Style', 'Neon-soaked cyberpunk transformation', WORKFLOW_CATEGORIES.STYLE, 'Cyberpunk'),
  styleTransferWorkflow('tpl-comic-book', 'Comic Book Style', 'Turn photos into American comic art', WORKFLOW_CATEGORIES.STYLE, 'Comic Style'),
  styleTransferWorkflow('tpl-pixel-art', 'Pixel Art Creator', 'Retro 16-bit pixel art from photos', WORKFLOW_CATEGORIES.STYLE, 'Pixel Art'),
  styleTransferWorkflow('tpl-glass-ball', 'Glass Ball Effect', 'Scene captured inside a crystal glass ball', WORKFLOW_CATEGORIES.STYLE, 'Glass Ball'),
  styleTransferWorkflow('tpl-3d-figurine', '3D Figurine', 'Turn yourself into a collectible 3D figure', WORKFLOW_CATEGORIES.STYLE, '3D Figurine'),
  styleTransferWorkflow('tpl-gta', 'GTA Loading Screen', 'Rockstar Games satirical illustration style', WORKFLOW_CATEGORIES.STYLE, 'GTA Style'),

  // Entertainment (8)
  { id: 'tpl-disney-pixar', name: 'Disney / Pixar Style', description: 'Pixar-quality 3D character render', category: WORKFLOW_CATEGORIES.ENTERTAINMENT, thumbnail: getThumbnail('tpl-disney-pixar'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Photo' } }, { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 220 }, data: { label: 'Character' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: 'Pixar Video' } } ], edges: [ { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' }, { source: 'text1', target: 'video1', sourceHandle: 'textOutput', targetHandle: 'videoInput' } ] },
  { id: 'tpl-superhero-transform', name: 'Superhero Transform', description: 'Epic transformation into a superhero', category: WORKFLOW_CATEGORIES.ENTERTAINMENT, thumbnail: getThumbnail('tpl-superhero-transform'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Photo' } }, { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 220 }, data: { label: 'Hero Style' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: 'Transform' } } ], edges: [ { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' }, { source: 'text1', target: 'video1', sourceHandle: 'textOutput', targetHandle: 'videoInput' } ] },
  { id: 'tpl-lego-style', name: 'Lego Style', description: 'Everything is awesome in Lego form', category: WORKFLOW_CATEGORIES.ENTERTAINMENT, thumbnail: getThumbnail('tpl-lego-style'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Photo' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: 'Lego Video' } } ], edges: [ { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' } ] },
  { id: 'tpl-movie-poster', name: 'Movie Poster', description: 'Cinematic theatrical movie poster design', category: WORKFLOW_CATEGORIES.ENTERTAINMENT, thumbnail: getThumbnail('tpl-movie-poster'), nodes: [ { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 100 }, data: { label: 'Movie Description' } }, { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 350, y: 100 }, data: { label: 'Poster Gen' } } ], edges: [ { source: 'text1', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'imageInput' } ] },
  { id: 'tpl-magazine-cover', name: 'Magazine Cover', description: 'High fashion magazine cover aesthetic', category: WORKFLOW_CATEGORIES.ENTERTAINMENT, thumbnail: getThumbnail('tpl-magazine-cover'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Portrait' } }, { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 220 }, data: { label: 'Description' } }, { id: 'api1', type: NODE_TYPES.API, position: { x: 350, y: 100 }, data: { label: 'Magazine', apiType: 'style-transfer' } }, { id: 'image2', type: NODE_TYPES.IMAGE, position: { x: 700, y: 100 }, data: { label: 'Cover' } } ], edges: [ { source: 'image1', target: 'api1', sourceHandle: 'imageOutput', targetHandle: 'apiInput' }, { source: 'text1', target: 'api1', sourceHandle: 'textOutput', targetHandle: 'apiInput2' }, { source: 'api1', target: 'image2', sourceHandle: 'apiOutput', targetHandle: 'imageInput' } ] },
  { id: 'tpl-action-figure', name: 'Action Figure', description: 'Turn yourself into a collectible action figure', category: WORKFLOW_CATEGORIES.ENTERTAINMENT, thumbnail: getThumbnail('tpl-action-figure'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Photo' } }, { id: 'api1', type: NODE_TYPES.API, position: { x: 350, y: 100 }, data: { label: 'Action Figure', apiType: 'style-transfer' } }, { id: 'image2', type: NODE_TYPES.IMAGE, position: { x: 700, y: 100 }, data: { label: 'Figure' } } ], edges: [ { source: 'image1', target: 'api1', sourceHandle: 'imageOutput', targetHandle: 'apiInput' }, { source: 'api1', target: 'image2', sourceHandle: 'apiOutput', targetHandle: 'imageInput' } ] },
  { id: 'tpl-squid-game', name: 'Squid Game Style', description: 'Korean drama survival game aesthetic', category: WORKFLOW_CATEGORIES.ENTERTAINMENT, thumbnail: getThumbnail('tpl-squid-game'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Photo' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: 'Squid Game' } } ], edges: [ { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' } ] },
  { id: 'tpl-tiktok-video', name: 'TikTok Video Creator', description: 'Create viral 9:16 videos with trending effects', category: WORKFLOW_CATEGORIES.ENTERTAINMENT, thumbnail: getThumbnail('tpl-tiktok-video'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Photo' } }, { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 220 }, data: { label: 'Action' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: 'TikTok Video', aspectRatio: '9:16' } } ], edges: [ { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' }, { source: 'text1', target: 'video1', sourceHandle: 'textOutput', targetHandle: 'videoInput' } ] },

  // VFX (6)
  vfxWorkflow('tpl-building-explosion', 'Building Explosion', 'Hollywood-grade building explosion VFX', WORKFLOW_CATEGORIES.VFX, 'Building Explosion'),
  vfxWorkflow('tpl-car-explosion', 'Car Explosion', 'Action movie car explosion effect', WORKFLOW_CATEGORIES.VFX, 'Car Explosion'),
  vfxWorkflow('tpl-disintegration', 'Disintegration', 'Thanos snap disintegration effect', WORKFLOW_CATEGORIES.VFX, 'Disintegration'),
  vfxWorkflow('tpl-electricity', 'Electricity / Lightning', 'Electric shock and lightning effects', WORKFLOW_CATEGORIES.VFX, 'Lightning'),
  vfxWorkflow('tpl-tornado', 'Tornado', 'Devastating tornado VFX scene', WORKFLOW_CATEGORIES.VFX, 'Tornado'),
  vfxWorkflow('tpl-fire-breath', 'Fire Breath', 'Dragon-style fire breath effect', WORKFLOW_CATEGORIES.VFX, 'Fire Breath'),

  // Portrait (7)
  portraitWorkflow('tpl-face-swap', 'Face Swap', 'Realistic AI face swap technology', WORKFLOW_CATEGORIES.PORTRAIT, 'Face Swap'),
  portraitWorkflow('tpl-age-progression', 'Age Progression', 'See yourself at different ages', WORKFLOW_CATEGORIES.PORTRAIT, 'Age Progress'),
  portraitWorkflow('tpl-glamour-portrait', 'Glamour Portrait', 'Hollywood glamour photo enhancement', WORKFLOW_CATEGORIES.PORTRAIT, 'Glamour'),
  portraitWorkflow('tpl-fashion-stride', 'Fashion Stride', 'Runway model walk animation', WORKFLOW_CATEGORIES.PORTRAIT, 'Fashion Walk'),
  { id: 'tpl-gender-swap', name: 'Gender Swap', description: 'AI-powered gender transformation', category: WORKFLOW_CATEGORIES.PORTRAIT, thumbnail: getThumbnail('tpl-gender-swap'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Photo' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: 'Gender Swap' } } ], edges: [ { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' } ] },
  { id: 'tpl-younger-self', name: 'Younger Self', description: 'Travel back in time with a younger selfie', category: WORKFLOW_CATEGORIES.PORTRAIT, thumbnail: getThumbnail('tpl-younger-self'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Photo' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: 'Younger Self' } } ], edges: [ { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' } ] },
  portraitWorkflow('tpl-profile-picture', 'Profile Picture Generator', 'Professional AI-generated profile photos', WORKFLOW_CATEGORIES.PORTRAIT, 'Profile Enhance'),

  // Decade (4)
  portraitWorkflow('tpl-1920s-style', '1920s Style', 'Roaring twenties art deco aesthetic', WORKFLOW_CATEGORIES.DECADE, '1920s'),
  portraitWorkflow('tpl-1950s-style', '1950s Style', 'Mid-century Americana nostalgia', WORKFLOW_CATEGORIES.DECADE, '1950s'),
  portraitWorkflow('tpl-1970s-style', '1970s Style', 'Groovy seventies retro vibes', WORKFLOW_CATEGORIES.DECADE, '1970s'),
  portraitWorkflow('tpl-1980s-style', '1980s Style', 'Neon-lit synthwave eighties look', WORKFLOW_CATEGORIES.DECADE, '1980s'),

  // Commercial (5)
  { id: 'tpl-product-photography', name: 'Product Photography', description: 'Professional commercial product photos', category: WORKFLOW_CATEGORIES.COMMERCIAL, thumbnail: getThumbnail('tpl-product-photography'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Product' } }, { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 220 }, data: { label: 'Style' } }, { id: 'api1', type: NODE_TYPES.API, position: { x: 350, y: 100 }, data: { label: 'Photo Gen', apiType: 'product-photography' } }, { id: 'image2', type: NODE_TYPES.IMAGE, position: { x: 700, y: 100 }, data: { label: 'Result' } } ], edges: [ { source: 'image1', target: 'api1', sourceHandle: 'imageOutput', targetHandle: 'apiInput' }, { source: 'text1', target: 'api1', sourceHandle: 'textOutput', targetHandle: 'apiInput2' }, { source: 'api1', target: 'image2', sourceHandle: 'apiOutput', targetHandle: 'imageInput' } ] },
  { id: 'tpl-billboard-ad', name: 'Billboard Ad', description: 'Ultra-wide billboard advertisement design', category: WORKFLOW_CATEGORIES.COMMERCIAL, thumbnail: getThumbnail('tpl-billboard-ad'), nodes: [ { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 100 }, data: { label: 'Ad Description' } }, { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 350, y: 100 }, data: { label: 'Billboard Gen' } } ], edges: [ { source: 'text1', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'imageInput' } ] },
  { id: 'tpl-asmr-video', name: 'ASMR Video', description: 'Satisfying slow-motion close-up content', category: WORKFLOW_CATEGORIES.COMMERCIAL, thumbnail: getThumbnail('tpl-asmr-video'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Close-up' } }, { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 220 }, data: { label: 'ASMR Theme' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: 'ASMR Video' } } ], edges: [ { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' }, { source: 'text1', target: 'video1', sourceHandle: 'textOutput', targetHandle: 'videoInput' } ] },
  { id: 'tpl-product-placement', name: 'Product Placement', description: 'Natural lifestyle product integration', category: WORKFLOW_CATEGORIES.COMMERCIAL, thumbnail: getThumbnail('tpl-product-placement'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Product' } }, { id: 'api1', type: NODE_TYPES.API, position: { x: 350, y: 100 }, data: { label: 'Lifestyle', apiType: 'product-shot' } }, { id: 'image2', type: NODE_TYPES.IMAGE, position: { x: 700, y: 100 }, data: { label: 'Result' } } ], edges: [ { source: 'image1', target: 'api1', sourceHandle: 'imageOutput', targetHandle: 'apiInput' }, { source: 'api1', target: 'image2', sourceHandle: 'apiOutput', targetHandle: 'imageInput' } ] },
  { id: 'tpl-unboxing-scene', name: 'Unboxing Scene', description: 'Dramatic product unboxing reveal', category: WORKFLOW_CATEGORIES.COMMERCIAL, thumbnail: getThumbnail('tpl-unboxing-scene'), nodes: [ { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Product' } }, { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 350, y: 100 }, data: { label: 'Unbox Video' } } ], edges: [ { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput' } ] },

  // Camera (3)
  imageToVideoWorkflow('tpl-matrix-shot', 'Matrix Shot', 'Frozen-time multi-angle camera rotation', WORKFLOW_CATEGORIES.CAMERA, 'Action', 'Matrix Shot'),
  socialMediaWorkflow('tpl-instagram-reel', 'Instagram Reel Generator', 'Aesthetic reels with cinematic motion', WORKFLOW_CATEGORIES.CAMERA),
  socialMediaWorkflow('tpl-youtube-shorts', 'YouTube Shorts Creator', 'Vertical short-form video content', WORKFLOW_CATEGORIES.CAMERA),
];

export const PRESET_WORKFLOWS = workflowTemplates;
export default workflowTemplates;