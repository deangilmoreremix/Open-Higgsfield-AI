import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VidecoRuntimeAdapter } from '../../src/apps/videco-ai-platform/runtime/adapter.js';
import { VideoPipeline, VIDEO_NODE_TYPES } from '../../src/apps/videco-ai-platform/workflows/videoPipeline.js';
import { generateVideoFromText, generateVideoFromImage, generateCinematicScene } from '../../src/apps/videco-ai-platform/providers/videoProvider.js';
import { enhanceVideoPrompt } from '../../src/apps/videco-ai-platform/providers/videoOpenAI.js';

vi.mock('../../src/apps/videco-ai-platform/providers/videoProvider.js', () => ({
  generateVideoFromText: vi.fn().mockResolvedValue({ url: 'https://test.video/output.mp4' }),
  generateVideoFromImage: vi.fn().mockResolvedValue({ url: 'https://test.video/i2v.mp4' }),
  generateCinematicScene: vi.fn().mockResolvedValue({ url: 'https://test.video/cinematic.mp4' })
}));

vi.mock('../../src/apps/videco-ai-platform/providers/videoOpenAI.js', () => ({
  enhanceVideoPrompt: vi.fn().mockResolvedValue('Enhanced cinematic prompt')
}));

describe('Videco AI Platform Integration', () => {
  describe('Full Pipeline: Text-to-Video', () => {
    it('should execute complete text-to-video pipeline', async () => {
      const adapter = new VidecoRuntimeAdapter();

      const result = await adapter.execute({
        prompt: 'A serene mountain landscape at sunrise'
      }, { userId: 'test-user' });

      expect(result).toHaveProperty('executionId');
      expect(result).toHaveProperty('state', 'completed');
      expect(result).toHaveProperty('outputs');
      expect(result.outputs).toHaveProperty('url');
    });

    it('should enhance prompt before video generation', async () => {
      const adapter = new VidecoRuntimeAdapter();
      const input = { prompt: 'Test prompt' };

      await adapter.execute(input, {});

      expect(enhanceVideoPrompt).toHaveBeenCalledWith(input.prompt, expect.any(Object));
    });
  });

  describe('Full Pipeline: Image-to-Video', () => {
    it('should execute complete image-to-video pipeline', async () => {
      const adapter = new VidecoRuntimeAdapter();

      const result = await adapter.execute({
        prompt: 'An animated character walking',
        imageUrl: 'https://test.image/character.png'
      }, { userId: 'test-user' });

      expect(result).toHaveProperty('executionId');
      expect(result).toHaveProperty('state', 'completed');
      expect(generateVideoFromImage).toHaveBeenCalled();
    });
  });

  describe('Full Pipeline: Cinematic Generation', () => {
    it('should execute cinematic scene generation', async () => {
      const adapter = new VidecoRuntimeAdapter();

      const result = await adapter.execute({
        prompt: 'Epic battle scene',
        cinematic: true
      }, { userId: 'test-user' });

      expect(result).toHaveProperty('executionId');
      expect(generateCinematicScene).toHaveBeenCalled();
    });
  });

  describe('VideoPipeline Workflow Integration', () => {
    it('should create and connect video nodes', () => {
      const pipeline = new VideoPipeline();

      const textNode = pipeline.createTextToVideoNode(
        'A beautiful sunset',
        { x: 0, y: 0 },
        { duration: 5 }
      );

      expect(textNode).toBeDefined();
      expect(pipeline.videoNodes.has(textNode.id)).toBe(true);
    });

    it('should serialize and deserialize timeline', () => {
      const pipeline = new VideoPipeline();

      pipeline.createTextToVideoNode('Test', { x: 0, y: 0 });
      const timeline = pipeline.serializeTimeline();

      expect(timeline).toHaveProperty('tracks');
      expect(timeline).toHaveProperty('connections');
    });
  });

  describe('Adapter Timeline Operations', () => {
    it('should track timeline state across operations', () => {
      const adapter = new VidecoRuntimeAdapter();

      adapter.addTrack('track-1');
      adapter.setPlayhead(5);

      expect(adapter.timeline.tracks).toContain('track-1');
      expect(adapter.timeline.playhead).toBe(5);
    });

    it('should persist timeline across serialize/deserialize', () => {
      const adapter = new VidecoRuntimeAdapter();

      adapter.addTrack('track-2');
      adapter.setPlayhead(10);

      const serialized = adapter.serialize();
      const adapter2 = new VidecoRuntimeAdapter();
      adapter2.deserialize(serialized);

      expect(adapter2.timeline.tracks).toContain('track-2');
      expect(adapter2.timeline.playhead).toBe(10);
    });
  });

  describe('State Management', () => {
    it('should handle pause/resume/cancel cycle', async () => {
      const adapter = new VidecoRuntimeAdapter();

      await adapter.pause('exec-1');
      expect(adapter.state).toBe('paused');

      await adapter.resume('exec-1');
      expect(adapter.state).toBe('running');

      await adapter.cancel('exec-1');
      expect(adapter.state).toBe('cancelled');
    });
  });

  describe('Stack Enforcement', () => {
    it('should never allow stack modification', () => {
      const adapter = new VidecoRuntimeAdapter();

      expect(() => {
        adapter.stack.llm = 'other';
      }).toThrow();

      expect(() => {
        adapter.stack.generation = 'other';
      }).toThrow();

      expect(adapter.stack).toEqual({
        llm: 'openai',
        generation: 'muapi',
        storage: 'supabase'
      });
    });
  });
});