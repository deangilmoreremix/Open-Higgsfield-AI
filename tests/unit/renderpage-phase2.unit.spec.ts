import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');
const src = readFileSync(resolve(repoRoot, 'src/components/RenderPage.js'), 'utf8');

// Parse ACTION_ROUTING out of RenderPage.js source.
function parseActionRouting(s: string) {
  const start = s.indexOf('const ACTION_ROUTING = {');
  expect(start).toBeGreaterThan(-1);
  const afterStart = s.slice(start);
  let depth = 0, end = -1;
  for (let i = 0; i < afterStart.length; i++) {
    if (afterStart[i] === '{') depth++;
    else if (afterStart[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  expect(end).toBeGreaterThan(-1);
  const block = afterStart.slice(0, end + 1);
  const entries: Record<string, { target: string | null; action: string | null; disabled: string | null }> = {};
  const lineRe = /^\s*'([^']+)':\s*\{([^}]*)\}/gm;
  let m;
  while ((m = lineRe.exec(block)) !== null) {
    const tm = m[2].match(/target:\s*'([^']+)'/);
    const am = m[2].match(/action:\s*'([^']+)'/);
    const dm = m[2].match(/disabled:\s*'([^']*)'/);
    entries[m[1]] = { target: tm ? tm[1] : null, action: am ? am[1] : null, disabled: dm ? dm[1] : null };
  }
  return entries;
}

describe('RenderPage Phase 2 — fake logic replaced with real VideoDB calls', () => {
  it('executeSceneAnalyzer calls video-analysis (no hardcoded scene array)', () => {
    // The old hardcoded 3-scene set must be gone.
    expect(src).not.toContain("start: 0, end: 15, type: 'introduction'");
    expect(src).not.toContain("'three-act'");
    // And executeSceneAnalyzer must invoke the video-analysis function.
    expect(src).toMatch(/executeSceneAnalyzer[\s\S]*?supabase\.functions\.invoke\('video-analysis'/);
  });

  it('executePacingOptimizer calls video-analysis (no hardcoded pacing object)', () => {
    expect(src).not.toContain('averageClipLength: 4.2');
    expect(src).not.toContain('suggestedCuts: [0, 8, 15, 22, 30, 38, 45, 52, 60]');
    expect(src).toMatch(/executePacingOptimizer[\s\S]*?supabase\.functions\.invoke\('video-analysis'/);
  });

  it('executeGapFiller derives real gaps (no hardcoded {start:10,end:15})', () => {
    expect(src).not.toContain("{ start: 10, end: 15, duration: 5");
    expect(src).toMatch(/executeGapFiller[\s\S]*?supabase\.functions\.invoke\('video-analysis'[\s\S]*?scene-detection/);
  });

  it('executeMusicGenerator derives real mood (no hardcoded energy:medium object)', () => {
    expect(src).not.toContain("energy: 'medium'");
    expect(src).toMatch(/executeMusicGenerator[\s\S]*?supabase\.functions\.invoke\('video-analysis'[\s\S]*?pacing-optimizer/);
  });

  it('Scene Analyzer / Pacing Optimizer / Scene Detection AI are enabled and routed to video-analysis', () => {
    const routing = parseActionRouting(src);
    expect(routing['Scene Analyzer'].target).toBe('video-analysis');
    expect(routing['Scene Analyzer'].action).toBe('scene-analyzer');
    expect(routing['Scene Analyzer'].disabled).toBeNull();
    expect(routing['Pacing Optimizer'].target).toBe('video-analysis');
    expect(routing['Pacing Optimizer'].action).toBe('pacing-optimizer');
    expect(routing['Pacing Optimizer'].disabled).toBeNull();
    expect(routing['Scene Detection AI'].target).toBe('video-analysis');
    expect(routing['Scene Detection AI'].action).toBe('scene-detection');
    expect(routing['Scene Detection AI'].disabled).toBeNull();
  });

  it('render_jobs external_job_id migration is idempotent (S1 carry-over still valid)', () => {
    const migration = readFileSync(
      resolve(repoRoot, 'supabase/migrations/20260630140000_add_external_job_id_to_render_jobs.sql'),
      'utf8',
    );
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS external_job_id');
  });
});
