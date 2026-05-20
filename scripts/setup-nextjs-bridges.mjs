#!/usr/bin/env node
/**
 * Setup script for Next.js build bridges.
 * Run this after `pnpm install` to create necessary symlinks and files.
 */
import fs from 'fs';
import path from 'path';

const root = process.cwd();

// 1. Create node_modules/lib/muapi.js -> src/lib/muapi.js
const libMuapi = path.join(root, 'node_modules', 'lib', 'muapi.js');
const srcMuapi = path.join(root, 'src', 'lib', 'muapi.js');
if (!fs.existsSync(path.dirname(libMuapi))) {
  fs.mkdirSync(path.dirname(libMuapi), { recursive: true });
}
if (!fs.existsSync(libMuapi)) {
  fs.symlinkSync(path.relative(path.dirname(libMuapi), srcMuapi), libMuapi);
  console.log('Created node_modules/lib/muapi.js symlink');
}

// 2. Create packages/studio/src/models.js -> packages/studio/models.js
const studioModelsSrc = path.join(root, 'packages', 'studio', 'src', 'models.js');
const studioModelsRoot = path.join(root, 'packages', 'studio', 'models.js');
if (!fs.existsSync(studioModelsSrc)) {
  fs.symlinkSync(path.relative(path.dirname(studioModelsSrc), studioModelsRoot), studioModelsSrc);
  console.log('Created packages/studio/src/models.js symlink');
}

// 3. Create workflow-builder/dist/tailwind.css if missing
const wfCss = path.join(root, 'node_modules', 'workflow-builder', 'dist', 'tailwind.css');
if (!fs.existsSync(wfCss)) {
  const wfDist = path.dirname(wfCss);
  if (!fs.existsSync(wfDist)) fs.mkdirSync(wfDist, { recursive: true });
  fs.writeFileSync(wfCss, `/* workflow-builder tailwind CSS */
.skeleton {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
  animation: wave 1.5s ease-in-out infinite;
}
@keyframes wave {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #52525b; border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #71717a; }
@keyframes border-beam {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}
.loader-border {
  position: absolute; inset: -2px; border-radius: inherit;
  pointer-events: none; padding: 2px; overflow: hidden;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; z-index: 50;
}
.loader-border::before {
  content: ""; position: absolute; top: 50%; left: 50%;
  width: 250%; height: 250%;
  background: conic-gradient(from 0deg, var(--loader-color, #2563eb) 0deg, var(--loader-color, #2563eb) 180deg, transparent 180deg, transparent 360deg);
  animation: border-rotate 2s linear infinite;
  transform: translate(-50%, -50%);
}
@keyframes border-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
.seek-bar { -webkit-appearance: none !important; appearance: none !important; }
.seek-bar::-webkit-slider-thumb { -webkit-appearance: none !important; appearance: none !important; width: 0 !important; height: 0 !important; background: transparent !important; border: none !important; opacity: 0 !important; }
.seek-bar::-moz-range-thumb { width: 0 !important; height: 0 !important; background: transparent !important; border: none !important; opacity: 0 !important; }
`);
  console.log('Created workflow-builder/dist/tailwind.css');
}

console.log('Next.js bridges setup complete.');
