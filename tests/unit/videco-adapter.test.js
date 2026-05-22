import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RuntimeAdapterBase } from '../../src/lib/runtime/RuntimeAdapterBase.js';

vi.mock('../../src/lib/muapi.js', () => ({
  muapi: {
    generateVideo: vi.fn().mockResolvedValue({ url: 'https://test-video.url' }),
    generateVideoEffect: vi.fn().mockResolvedValue({ url: 'https://test-effect.url' }),
    generateI2V: vi.fn().mockResolvedValue({ url: 'https://test-i2v.url' }),
    processV2V: vi.fn().mockResolvedValue({ url: 'https://test-v2v.url' }),
    processLipSync: vi.fn().mockResolvedValue({ url: 'https://test-lipsync.url' }),
    generateAvatar: vi.fn().mockResolvedValue({ url: 'https://test-avatar.url' })
  }
}));

vi.mock('../../src/lib/openaiService.js', () => ({
  openaiService: {
    generateGTMPrompt: vi.fn().mockResolvedValue('Enhanced video prompt with cinematic elements'),
    generateImage: vi.fn().mockResolvedValue({ images: [{ base64: 'test' }] })
  }
}));

describe('VidecoRuntimeAdapter', () => {
  let VidecoRuntimeAdapter;
  let adapter;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import('../../src/apps/videco-ai-platform/runtime/adapter.js');
    VidecoRuntimeAdapter = module.VidecoRuntimeAdapter;
    adapter = new VidecoRuntimeAdapter();
  });

  describe('Extension of RuntimeAdapterBase', () => {
    it('should extend RuntimeAdapterBase', () => {
      expect(adapter).toBeInstanceOf(RuntimeAdapterBase);
    });

    it('should have provider property set to videco-ai-platform', () => {
      expect(adapter.provider).toBe('videco-ai-platform');
    });

    it('should have timeline state initialized', () => {
      expect(adapter.timeline).toEqual({ tracks: [], playhead: 0 });
    });
  });

  describe('Stack Lock', () => {
    it('should have frozen stack with correct values', () => {
      expect(adapter.stack).toEqual({
        llm: 'openai',
        generation: 'muapi',
        storage: 'supabase'
      });
    });

    it('should not allow stack mutation', () => {
      expect(() => {
        adapter.stack.llm = 'anthropic';
      }).toThrow();
    });
  });

  describe('execute()', () => {
    it('should call OpenAI for prompt enhancement', async () => {
      const { openaiService } = await import('../../src/lib/openaiService.js');
      const input = { prompt: 'A beautiful sunset over mountains' };
      const context = { userId: 'test-user' };

      await adapter.execute(input, context);

      expect(openaiService.generateGTMPrompt).toHaveBeenCalled();
    });

    it('should call MuAPI for video generation', async () => {
      const { muapi } = await import('../../src/lib/muapi.js');
      const input = { prompt: 'A beautiful sunset over mountains' };
      const context = { userId: 'test-user' };

      await adapter.execute(input, context);

      expect(muapi.generateVideo).toHaveBeenCalled();
    });

    it('should return execution result with correct shape', async () => {
      const input = { prompt: 'Test prompt' };
      const context = { userId: 'test-user' };

      const result = await adapter.execute(input, context);

      expect(result).toHaveProperty('executionId');
      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('outputs');
    });
  });

  describe('pause/resume/cancel', () => {
    it('should transition to paused state on pause()', async () => {
      await adapter.pause('exec-123');
      expect(adapter.state).toBe('paused');
    });

    it('should transition to running state on resume()', async () => {
      await adapter.resume('exec-123');
      expect(adapter.state).toBe('running');
    });

    it('should transition to cancelled state on cancel()', async () => {
      await adapter.cancel('exec-123');
      expect(adapter.state).toBe('cancelled');
    });
  });

  describe('serialize/deserialize', () => {
    it('should serialize execution state correctly', () => {
      adapter.executionId = 'exec-456';
      adapter.state = 'running';

      const serialized = adapter.serialize();

      expect(serialized).toHaveProperty('id', 'exec-456');
      expect(serialized).toHaveProperty('state', 'running');
    });

    it('should deserialize and restore state', () => {
      const data = { id: 'exec-789', state: 'paused' };

      adapter.deserialize(data);

      expect(adapter.executionId).toBe('exec-789');
      expect(adapter.state).toBe('paused');
    });
  });

  describe('getExecutionState()', () => {
    it('should return correct shape including stack', () => {
      adapter.executionId = 'exec-test';
      adapter.state = 'running';

      const state = adapter.getExecutionState();

      expect(state).toHaveProperty('id', 'exec-test');
      expect(state).toHaveProperty('state', 'running');
      expect(state).toHaveProperty('stack');
      expect(state.stack).toEqual({
        llm: 'openai',
        generation: 'muapi',
        storage: 'supabase'
      });
    });
  });

  describe('Timeline Operations', () => {
    it('should add a track to timeline', () => {
      adapter.addTrack('video-track-1');

      expect(adapter.timeline.tracks).toContain('video-track-1');
    });

    it('should add a clip to timeline', () => {
      adapter.addClip('video-track-1', { start: 0, duration: 5 });

      expect(adapter.timeline.tracks).toContain('video-track-1');
    });

    it('should set playhead position', () => {
      adapter.setPlayhead(10);

      expect(adapter.timeline.playhead).toBe(10);
    });
  });
});