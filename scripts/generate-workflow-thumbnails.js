#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'workflows-react', 'public', 'thumbnails', 'templates');

const CATEGORY_COLORS = {
  image: { bg: '#4F46E5', accent: '#818CF8', icon: '🖼️' },
  video: { bg: '#EA580C', accent: '#FB923C', icon: '🎬' },
  mixed: { bg: '#7C3AED', accent: '#A78BFA', icon: '🔗' },
  style: { bg: '#DB2777', accent: '#F472B6', icon: '🎨' },
  entertainment: { bg: '#059669', accent: '#34D399', icon: '✨' },
  vfx: { bg: '#DC2626', accent: '#F87171', icon: '💥' },
  portrait: { bg: '#0891B2', accent: '#22D3EE', icon: '👤' },
  decade: { bg: '#CA8A04', accent: '#FACC15', icon: '🕰️' },
  commercial: { bg: '#65A30D', accent: '#A3E635', icon: '📦' },
  camera: { bg: '#9333EA', accent: '#C084FC', icon: '🎥' },
};

const thumbnails = [
  // Image category
  { id: 'tpl-image-pipeline', name: 'Image Generation Pipeline', category: 'image', desc: 'Generate images from text' },
  { id: 'tpl-banner-creator', name: 'Banner Creator', category: 'image', desc: 'Wide cinematic banners' },
  { id: 'tpl-thumbnail-gen', name: 'YouTube Thumbnail', category: 'image', desc: 'Eye-catching thumbnails' },
  { id: 'tpl-product-hero', name: 'Product Hero Shot', category: 'image', desc: 'Studio product photography' },
  { id: 'tpl-story-cover', name: 'Story Highlight Cover', category: 'image', desc: 'Minimalist icon covers' },

  // Video category
  { id: 'tpl-video-pipeline', name: 'Video Pipeline', category: 'video', desc: 'Create videos from images' },
  { id: 'tpl-social-video', name: 'Social Media Video', category: 'video', desc: 'Vertical social videos' },
  { id: 'tpl-short-form-ad', name: 'Short-Form Ad', category: 'video', desc: 'Product promo videos' },
  { id: 'tpl-vhs-retro', name: 'VHS Retro', category: 'video', desc: 'Analog VHS tape effect' },
  { id: 'tpl-film-noir', name: 'Film Noir', category: 'video', desc: 'Classic black & white' },
  { id: 'tpl-bullet-time', name: 'Bullet Time', category: 'video', desc: 'Matrix-style rotation' },
  { id: 'tpl-drone-fpv', name: 'Drone FPV Shot', category: 'video', desc: 'First-person drone' },
  { id: 'tpl-dolly-zoom', name: 'Dolly Zoom', category: 'video', desc: 'Hitchcock zoom effect' },

  // Mixed category
  { id: 'tpl-multi-stage', name: 'Multi-Stage Gen', category: 'mixed', desc: 'Text to image to video' },
  { id: 'tpl-prompt-enhance', name: 'Prompt Enhancement', category: 'mixed', desc: 'AI prompt enhancement' },
  { id: 'tpl-image-video-audio', name: 'Full Media Pipeline', category: 'mixed', desc: 'Complete media chain' },

  // Video Editing
  { id: 'tpl-video-edit', name: 'Video Editing', category: 'video', desc: 'Combine multiple videos' },
  { id: 'tpl-multi-video-edit', name: 'Multi-Video Editor', category: 'video', desc: 'Edit multiple videos' },
  { id: 'tpl-car-chase', name: 'Car Chase Scene', category: 'video', desc: 'Action car chase' },

  // Style category
  { id: 'tpl-anime', name: 'Anime Converter', category: 'style', desc: 'Transform into anime' },
  { id: 'tpl-ghibli', name: 'Ghibli Style', category: 'style', desc: 'Studio Ghibli inspired' },
  { id: 'tpl-cyberpunk', name: 'Cyberpunk Style', category: 'style', desc: 'Neon-soaked cyberpunk' },
  { id: 'tpl-comic-book', name: 'Comic Book Style', category: 'style', desc: 'American comic art' },
  { id: 'tpl-pixel-art', name: 'Pixel Art', category: 'style', desc: 'Retro 16-bit pixel art' },
  { id: 'tpl-glass-ball', name: 'Glass Ball', category: 'style', desc: 'Crystal ball effect' },
  { id: 'tpl-3d-figurine', name: '3D Figurine', category: 'style', desc: 'Collectible 3D figure' },
  { id: 'tpl-gta', name: 'GTA Style', category: 'style', desc: 'Rockstar Games aesthetic' },

  // Entertainment
  { id: 'tpl-disney-pixar', name: 'Disney / Pixar', category: 'entertainment', desc: 'Pixar-quality 3D' },
  { id: 'tpl-superhero-transform', name: 'Superhero Transform', category: 'entertainment', desc: 'Epic transformation' },
  { id: 'tpl-lego-style', name: 'Lego Style', category: 'entertainment', desc: 'Everything is awesome' },
  { id: 'tpl-movie-poster', name: 'Movie Poster', category: 'entertainment', desc: 'Cinematic poster design' },
  { id: 'tpl-magazine-cover', name: 'Magazine Cover', category: 'entertainment', desc: 'High fashion aesthetic' },
  { id: 'tpl-action-figure', name: 'Action Figure', category: 'entertainment', desc: 'Collectible action figure' },
  { id: 'tpl-squid-game', name: 'Squid Game', category: 'entertainment', desc: 'Korean drama style' },
  { id: 'tpl-tiktok-video', name: 'TikTok Video', category: 'entertainment', desc: 'Viral 9:16 videos' },

  // VFX
  { id: 'tpl-building-explosion', name: 'Building Explosion', category: 'vfx', desc: 'Hollywood explosion VFX' },
  { id: 'tpl-car-explosion', name: 'Car Explosion', category: 'vfx', desc: 'Action car explosion' },
  { id: 'tpl-disintegration', name: 'Disintegration', category: 'vfx', desc: 'Thanos snap effect' },
  { id: 'tpl-electricity', name: 'Electricity', category: 'vfx', desc: 'Lightning effects' },
  { id: 'tpl-tornado', name: 'Tornado', category: 'vfx', desc: 'Devastating tornado VFX' },
  { id: 'tpl-fire-breath', name: 'Fire Breath', category: 'vfx', desc: 'Dragon fire effect' },

  // Portrait
  { id: 'tpl-face-swap', name: 'Face Swap', category: 'portrait', desc: 'AI face swap' },
  { id: 'tpl-age-progression', name: 'Age Progression', category: 'portrait', desc: 'See yourself older' },
  { id: 'tpl-glamour-portrait', name: 'Glamour Portrait', category: 'portrait', desc: 'Hollywood glamour' },
  { id: 'tpl-fashion-stride', name: 'Fashion Stride', category: 'portrait', desc: 'Runway walk' },
  { id: 'tpl-gender-swap', name: 'Gender Swap', category: 'portrait', desc: 'Gender transformation' },
  { id: 'tpl-younger-self', name: 'Younger Self', category: 'portrait', desc: 'Travel back in time' },
  { id: 'tpl-profile-picture', name: 'Profile Picture', category: 'portrait', desc: 'AI profile photos' },

  // Decade
  { id: 'tpl-1920s-style', name: '1920s Style', category: 'decade', desc: 'Roaring twenties' },
  { id: 'tpl-1950s-style', name: '1950s Style', category: 'decade', desc: 'Mid-century Americana' },
  { id: 'tpl-1970s-style', name: '1970s Style', category: 'decade', desc: 'Groovy seventies' },
  { id: 'tpl-1980s-style', name: '1980s Style', category: 'decade', desc: 'Neon synthwave' },

  // Commercial
  { id: 'tpl-product-photography', name: 'Product Photography', category: 'commercial', desc: 'Commercial product photos' },
  { id: 'tpl-billboard-ad', name: 'Billboard Ad', category: 'commercial', desc: 'Ultra-wide billboard' },
  { id: 'tpl-asmr-video', name: 'ASMR Video', category: 'commercial', desc: 'Satisfying close-up' },
  { id: 'tpl-product-placement', name: 'Product Placement', category: 'commercial', desc: 'Lifestyle integration' },
  { id: 'tpl-unboxing-scene', name: 'Unboxing Scene', category: 'commercial', desc: 'Product unboxing reveal' },

  // Camera
  { id: 'tpl-matrix-shot', name: 'Matrix Shot', category: 'camera', desc: 'Frozen-time rotation' },
  { id: 'tpl-instagram-reel', name: 'Instagram Reel', category: 'camera', desc: 'Aesthetic reels' },
  { id: 'tpl-youtube-shorts', name: 'YouTube Shorts', category: 'camera', desc: 'Short-form video' },
];

function generateSVG(thumb) {
  const colors = CATEGORY_COLORS[thumb.category] || CATEGORY_COLORS.image;
  const icon = colors.icon;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${thumb.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="glow-${thumb.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="300" fill="url(#bg-${thumb.id})"/>

  <!-- Grid pattern -->
  <g opacity="0.1">
    ${Array.from({length: 20}, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="300" stroke="white" stroke-width="0.5"/>`).join('\n    ')}
    ${Array.from({length: 15}, (_, i) => `<line x1="0" y1="${i * 20}" x2="400" y2="${i * 20}" stroke="white" stroke-width="0.5"/>`).join('\n    ')}
  </g>

  <!-- Glow effect -->
  <ellipse cx="200" cy="130" rx="100" ry="80" fill="url(#glow-${thumb.id})"/>

  <!-- Icon circle -->
  <circle cx="200" cy="120" r="50" fill="${colors.accent}" opacity="0.2"/>
  <circle cx="200" cy="120" r="40" fill="none" stroke="${colors.accent}" stroke-width="2"/>

  <!-- Icon -->
  <text x="200" y="135" font-size="40" text-anchor="middle" fill="white">${icon}</text>

  <!-- Title -->
  <text x="200" y="210" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="white" text-anchor="middle">${thumb.name}</text>

  <!-- Description -->
  <text x="200" y="235" font-family="system-ui, sans-serif" font-size="12" fill="${colors.accent}" text-anchor="middle" opacity="0.9">${thumb.desc}</text>

  <!-- Category badge -->
  <rect x="155" y="255" width="90" height="24" rx="12" fill="${colors.accent}" opacity="0.2"/>
  <text x="200" y="272" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="${colors.accent}" text-anchor="middle" text-transform="uppercase">${thumb.category}</text>

  <!-- Corner accents -->
  <path d="M0 0 L30 0 L0 30 Z" fill="${colors.accent}" opacity="0.3"/>
  <path d="M400 300 L370 300 L400 270 Z" fill="${colors.accent}" opacity="0.3"/>
</svg>`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  ensureDir(OUTPUT_DIR);

  console.log(`Generating ${thumbnails.length} thumbnails...`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  thumbnails.forEach((thumb, i) => {
    const svg = generateSVG(thumb);
    const outputPath = path.join(OUTPUT_DIR, `${thumb.id}.svg`);
    fs.writeFileSync(outputPath, svg);
    console.log(`[${i + 1}/${thumbnails.length}] Created: ${thumb.id}.svg`);
  });

  console.log('\nDone! SVGs generated. To convert to WebP, use:');
  console.log('npx @anthropic-ai/image-mcp convert-svg-to-webp');
}

main();