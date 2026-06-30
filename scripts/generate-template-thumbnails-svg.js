#!/usr/bin/env node
/**
 * Generate SVG thumbnail files for all templates that don't have a real .webp image.
 * Saves as `${id}.webp.svg` (matching existing project convention, e.g. heroes/pomelli.webp.svg).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { allTemplates, TEMPLATE_CATEGORIES } from '../src/lib/templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '..', 'public', 'thumbnails', 'templates');

const CATEGORY_THEMES = {
  [TEMPLATE_CATEGORIES.SOCIAL]:        { c1: '#ec4899', c2: '#a855f7', c3: '#6366f1', accent: '#fce7f3' },
  [TEMPLATE_CATEGORIES.STYLE]:         { c1: '#0ea5e9', c2: '#3b82f6', c3: '#4f46e5', accent: '#dbeafe' },
  [TEMPLATE_CATEGORIES.ENTERTAINMENT]: { c1: '#f59e0b', c2: '#f97316', c3: '#e11d48', accent: '#fef3c7' },
  [TEMPLATE_CATEGORIES.COMMERCIAL]:    { c1: '#10b981', c2: '#14b8a6', c3: '#0891b2', accent: '#d1fae5' },
  [TEMPLATE_CATEGORIES.VFX]:           { c1: '#ef4444', c2: '#f43f5e', c3: '#ea580c', accent: '#fee2e2' },
  [TEMPLATE_CATEGORIES.PORTRAIT]:     { c1: '#8b5cf6', c2: '#a855f7', c3: '#d946ef', accent: '#ede9fe' },
  [TEMPLATE_CATEGORIES.DECADE]:        { c1: '#eab308', c2: '#f59e0b', c3: '#d97706', accent: '#fef9c3' },
  [TEMPLATE_CATEGORIES.CAMERA]:        { c1: '#64748b', c2: '#3b82f6', c3: '#4338ca', accent: '#e2e8f0' },
};
const NICHE_THEME = { c1: '#06b6d4', c2: '#0ea5e9', c3: '#2563eb', accent: '#cffafe' };
const DEFAULT_THEME = { c1: '#475569', c2: '#64748b', c3: '#334155', accent: '#f1f5f9' };

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSvg(template) {
  const isNiche = !!template.niche;
  const theme = isNiche ? NICHE_THEME : (CATEGORY_THEMES[template.category] || DEFAULT_THEME);
  const id = template.id;
  const icon = template.icon || '✨';
  const name = (template.name || 'Template').toString();
  const category = (template.category || '').toString();
  const isVideo = template.outputType === 'video';

  // Deterministic layout offsets based on id hash
  const h = hashString(id);
  const angle = (h % 60) - 30; // -30..30 deg
  const offsetX = ((h >> 3) % 40) - 20; // -20..20
  const offsetY = ((h >> 7) % 30) - 15; // -15..15
  const ringR = 90 + ((h >> 5) % 30); // 90..120

  const gradId = `g_${id}`;
  const ringId = `r_${id}`;
  const shineId = `s_${id}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.c1}"/>
      <stop offset="50%" stop-color="${theme.c2}"/>
      <stop offset="100%" stop-color="${theme.c3}"/>
    </linearGradient>
    <radialGradient id="${shineId}" cx="30%" cy="20%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${ringId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1"/>
    </linearGradient>
    <filter id="blur_${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>

  <rect width="640" height="360" fill="url(#${gradId})"/>
  <rect width="640" height="360" fill="url(#${shineId})"/>

  <g opacity="0.18" transform="translate(${offsetX} ${offsetY}) rotate(${angle} 320 180)">
    <circle cx="120" cy="80" r="${ringR}" fill="none" stroke="url(#${ringId})" stroke-width="2"/>
    <circle cx="520" cy="280" r="${ringR - 20}" fill="none" stroke="url(#${ringId})" stroke-width="1.5"/>
  </g>

  <circle cx="80" cy="60" r="14" fill="${theme.accent}" opacity="0.35"/>
  <circle cx="560" cy="100" r="8" fill="${theme.accent}" opacity="0.5"/>
  <circle cx="600" cy="320" r="20" fill="${theme.accent}" opacity="0.25"/>
  <circle cx="40" cy="300" r="10" fill="${theme.accent}" opacity="0.4"/>

  <g transform="translate(320 150)">
    <circle r="78" fill="#ffffff" opacity="0.18" filter="url(#blur_${id})"/>
    <circle r="62" fill="#ffffff" opacity="0.95"/>
    <text x="0" y="22" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif" font-size="64">${escapeXml(icon)}</text>
  </g>

  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="#ffffff">
    <text x="320" y="270" text-anchor="middle" font-size="22" font-weight="700" letter-spacing="-0.3">${escapeXml(name.length > 32 ? name.slice(0, 30) + '…' : name)}</text>
    <text x="320" y="296" text-anchor="middle" font-size="11" font-weight="600" letter-spacing="2" opacity="0.75">${escapeXml(category.toUpperCase())}</text>
  </g>

  ${isVideo ? `
  <g transform="translate(572 24)">
    <rect x="0" y="0" width="56" height="22" rx="11" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <text x="28" y="15" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" fill="#ffffff" letter-spacing="1">VIDEO</text>
  </g>` : `
  <g transform="translate(572 24)">
    <rect x="0" y="0" width="56" height="22" rx="11" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <text x="28" y="15" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" fill="#ffffff" letter-spacing="1">IMAGE</text>
  </g>`}
</svg>`;
}

function main() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }

  const existing = new Set(
    fs.readdirSync(TEMPLATES_DIR)
      .filter(f => f.endsWith('.webp'))
      .map(f => f.replace(/\.webp$/, ''))
  );

  const all = allTemplates || [];
  const missing = all.filter(t => t && t.id && !existing.has(t.id));

  console.log(`Total templates: ${all.length}`);
  console.log(`Existing .webp files: ${existing.size}`);
  console.log(`Missing: ${missing.length}`);

  if (missing.length === 0) {
    console.log('Nothing to generate.');
    return;
  }

  let created = 0;
  let errors = 0;
  missing.forEach(t => {
    try {
      const svg = generateSvg(t);
      const outPath = path.join(TEMPLATES_DIR, `${t.id}.webp.svg`);
      fs.writeFileSync(outPath, svg, 'utf8');
      created++;
    } catch (e) {
      errors++;
      console.error(`  ❌ ${t.id}: ${e.message}`);
    }
  });

  console.log(`\n✅ Created ${created} SVG thumbnails`);
  if (errors > 0) console.log(`❌ ${errors} errors`);
  console.log(`Output: ${TEMPLATES_DIR}`);
}

main();
