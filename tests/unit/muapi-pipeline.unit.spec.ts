import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MuAPIGenerationPipeline } from '../../src/lib/muapi-pipeline.js';

describe('MuAPIGenerationPipeline', () => {
  let pipeline;
  let mockFetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    pipeline = new MuAPIGenerationPipeline({
      apiKey: 'test-key',
      baseUrl: 'https://test.api.dev'
    });
  });

  describe('Image Generation', () => {
    it('should create correct payload for image generation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://test.com/image.png' })
      });

      const result = await pipeline.generateImage('test prompt', {
        width: 512,
        height: 512
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.api.dev/v1/generate',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );
    });

    it('should handle generation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(pipeline.generateImage('test')).rejects.toThrow('MuAPI request failed');
    });
  });

  describe('Video Generation', () => {
    it('should create correct payload for video generation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://test.com/video.mp4' })
      });

      const result = await pipeline.generateVideo('test prompt', {
        duration: 10,
        width: 512,
        height: 512
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Upscale Image', () => {
    it('should create correct payload for upscale', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://test.com/upscaled.png' })
      });

      const result = await pipeline.upscaleImage('https://test.com/image.png', {
        scale: 4
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Task Creation', () => {
    it('should create image generation task', () => {
      const task = pipeline.createGenerationTask('test prompt', 'image', { width: 1024 });
      expect(task.type).toBe('ai-generation');
      expect(task.provider).toBe('muapi');
      expect(task.payload.prompt).toBe('test prompt');
    });

    it('should create video generation task', () => {
      const task = pipeline.createGenerationTask('test prompt', 'video', { duration: 5 });
      expect(task.type).toBe('ai-generation');
      expect(task.payload.type).toBe('video');
    });
  });
});