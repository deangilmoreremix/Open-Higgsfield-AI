import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');
const renderPageSrc = readFileSync(resolve(repoRoot, 'src/components/RenderPage.js'), 'utf8');
const videoagentSrc = readFileSync(resolve(repoRoot, 'supabase/functions/videoagent/index.ts'), 'utf8');

// Parse the ACTION_ROUTING table out of RenderPage.js source.
function parseActionRouting(src) {
  const start = src.indexOf('const ACTION_ROUTING = {');
  expect(start).toBeGreaterThan(-1);
  const afterStart = src.slice(start);
  // Find the matching closing brace for the object literal.
  let depth = 0, end = -1;
  for (let i = start - start; i < afterStart.length; i++) {
    if (afterStart[i] === '{') depth++;
    else if (afterStart[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  expect(end).toBeGreaterThan(-1);
  const block = afterStart.slice(0, end + 1);

  const entries = {};
  const lineRe = /^\s*'([^']+)':\s*\{([^}]*)\}/gm;
  let m;
  while ((m = lineRe.exec(block)) !== null) {
    const label = m[1];
    const body = m[2];
    const targetMatch = body.match(/target:\s*'([^']+)'/);
    const actionMatch = body.match(/action:\s*'([^']+)'/);
    const disabledMatch = body.match(/disabled:\s*'([^']*)'/);
    entries[label] = {
      target: targetMatch ? targetMatch[1] : null,
      action: actionMatch ? actionMatch[1] : null,
      disabled: disabledMatch ? disabledMatch[1] : null,
    };
  }
  return entries;
}

// Parse the actionToAgentName map keys out of videoagent/index.ts.
function parseVideoagentActions(src) {
  const start = src.indexOf('function actionToAgentName');
  expect(start).toBeGreaterThan(-1);
  const block = src.slice(start, start + 2000);
  const keys = new Set();
  const keyRe = /"([a-z][a-z0-9-]*)":\s*"/g;
  let m;
  while ((m = keyRe.exec(block)) !== null) keys.add(m[1]);
  return keys;
}

describe('RenderPage Phase 1 — stop the bleeding regressions', () => {
  it('does not reference the undefined muapiClient (crash source)', () => {
    expect(renderPageSrc.includes('muapiClient')).toBe(false);
  });

  it('does not contain the fake setTimeout "simulate" progress loop', () => {
    expect(renderPageSrc.includes('Simulate step processing')).toBe(false);
    expect(renderPageSrc.includes('// Simulate')).toBe(false);
  });

  it('makes no GPU/CUDA/TransNet claims (CPU-only project)', () => {
    const lower = renderPageSrc.toLowerCase();
    expect(lower).not.toContain('cuda');
    expect(lower).not.toContain('gpu acceleration');
    expect(lower).not.toContain('gpu-accelerated');
    expect(lower).not.toContain('transnet');
    expect(lower).not.toContain('gpuutilization');
    expect(lower).not.toContain('cudacores');
  });

  it('does not claim repo endpoints are "connected" (they are frontend feature groups)', () => {
    expect(renderPageSrc.includes("status: 'connected'")).toBe(false);
  });

  it('does not send fake repoKeys orchestration in invoke payloads', () => {
    expect(renderPageSrc.includes('repoKeys: pipeline')).toBe(false);
  });

  it('defines the ACTION_ROUTING table', () => {
    expect(renderPageSrc.includes('const ACTION_ROUTING = {')).toBe(true);
  });

  describe('ACTION_ROUTING — every action resolves to a real handler or is honestly disabled', () => {
    const routing = parseActionRouting(renderPageSrc);
    const VALID_TARGETS = new Set(['cinegen-ai', 'videoagent', 'rendiv-render', 'video-analysis', 'client', 'navigate']);
    const CINEGEN_ACTIONS = new Set(['gap-filler', 'clip-extender', 'music-generator']);
    const RENDIV_ACTIONS = new Set([
      'export-video', 'export-variations', 'parallel-render', 'frame-control',
      'quality-encode', 'queue-render', 'download-frame',
    ]);

    it('parsed at least one routing entry', () => {
      expect(Object.keys(routing).length).toBeGreaterThan(10);
    });

    for (const [label, entry] of Object.entries(routing)) {
      it(`action "${label}" is well-formed`, () => {
        const hasEnabled = entry.target !== null && entry.action !== null;
        const hasDisabled = entry.disabled !== null;
        expect(hasEnabled || hasDisabled).toBe(true);
        if (entry.target) {
          expect(VALID_TARGETS.has(entry.target)).toBe(true);
        }
      });

      if (entry.target === 'cinegen-ai') {
        it(`cinegen-ai action "${entry.action}" is a handled cinegen action`, () => {
          expect(CINEGEN_ACTIONS.has(entry.action)).toBe(true);
        });
      }
      if (entry.target === 'rendiv-render') {
        it(`rendiv-render action "${entry.action}" is a handled rendiv action`, () => {
          expect(RENDIV_ACTIONS.has(entry.action)).toBe(true);
        });
      }
    }
  });

  describe('videoagent action-name contract — the test that would have caught the outage', () => {
    const routing = parseActionRouting(renderPageSrc);
    const videoagentActions = parseVideoagentActions(videoagentSrc);

    it('parsed videoagent actionToAgentName map keys', () => {
      expect(videoagentActions.size).toBeGreaterThan(15);
      expect(videoagentActions.has('generate-subtitles')).toBe(true);
      expect(videoagentActions.has('extract-highlights')).toBe(true);
    });

    const videoagentEntries = Object.entries(routing).filter(([, e]) => e.target === 'videoagent');
    for (const [label, entry] of videoagentEntries) {
      it(`RenderPage "${label}" -> videoagent action "${entry.action}" is a key videoagent handles`, () => {
        // videoagent's actionToAgentName falls back to action.replace(/-/g,'_'), so a
        // kebab action that isn't an explicit map key still resolves — but to a DIFFERENT
        // agent than intended. Require explicit map membership so the action is real.
        expect(
          videoagentActions.has(entry.action),
          `videoagent has no explicit handler for action "${entry.action}". ` +
          `This is exactly the outage: RenderPage sent an action videoagent doesn't know.`
        ).toBe(true);
      });
    }
  });
});

describe('render_jobs migration — external_job_id column', () => {
  const migrationPath = resolve(
    repoRoot,
    'supabase/migrations/20260630140000_add_external_job_id_to_render_jobs.sql',
  );
  const migrationSrc = readFileSync(migrationPath, 'utf8');

  it('adds external_job_id idempotently', () => {
    expect(migrationSrc).toContain('ADD COLUMN IF NOT EXISTS external_job_id');
  });

  it('does not edit the historical render_jobs migration', () => {
    expect(migrationSrc).toContain('ALTER TABLE public.render_jobs');
    expect(migrationSrc).not.toContain('CREATE TABLE');
  });
});
