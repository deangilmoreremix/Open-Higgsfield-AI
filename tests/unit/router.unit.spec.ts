import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM elements and browser APIs
const mockContentArea = {
  innerHTML: '',
  appendChild: vi.fn(),
  _cleanup: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  _originalCleanup: undefined as (() => void) | undefined
};

// Mock history API
const mockHistory = {
  pushState: vi.fn(),
  replaceState: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  go: vi.fn()
};

// Mock global objects
global.history = mockHistory as any;
global.document = {
  createElement: vi.fn(() => mockContentArea),
  querySelector: vi.fn(() => null)
} as any;

describe('Router Unit Tests', () => {
  let mockContainer: any;
  let mockCallback: any;

  beforeEach(() => {
    mockContainer = { ...mockContentArea };
    mockCallback = vi.fn();
    vi.clearAllMocks();
  });

  describe('Router Initialization', () => {
    it('should initialize router with container and callback', async () => {
      const { initRouter } = await import('../../src/lib/router.js');
      initRouter(mockContainer, mockCallback);
      expect(mockContainer).toBeDefined();
    });

    it('should handle missing container gracefully', async () => {
      const { initRouter } = await import('../../src/lib/router.js');
      expect(() => initRouter(null as any, mockCallback)).not.toThrow();
    });
  });

  describe('Route Navigation', () => {
    beforeEach(async () => {
      const { initRouter } = await import('../../src/lib/router.js');
      initRouter(mockContainer, mockCallback);
    });

    it('should navigate to valid routes', async () => {
      const { navigate } = await import('../../src/lib/router.js');

      await navigate('timeline');
      expect(mockHistory.pushState).toHaveBeenCalledWith({}, '', '/#/timeline');
      expect(mockCallback).toHaveBeenCalledWith('timeline');
    });

    it('should handle navigation with parameters', async () => {
      const { navigate } = await import('../../src/lib/router.js');

      const params = { tab: 'videos', filter: 'recent' };
      await navigate('library', params);

      expect(mockHistory.pushState).toHaveBeenCalledWith(
        {},
        '',
        '/?tab=videos&filter=recent#/library'
      );
    });
  });

  describe('Route Map and URL Generation', () => {
    it('should map item names to routes correctly', async () => {
      const { getRouteForItem } = await import('../../src/lib/router.js');

      expect(getRouteForItem('Explore')).toBe('explore');
      expect(getRouteForItem('Image')).toBe('image');
      expect(getRouteForItem('Video')).toBe('video');
      expect(getRouteForItem('Vibe Motion')).toBe('effects');
    });
  });

  describe('Native Runtime Route Loaders (Task 0.3)', () => {
    it('should register native runtime loaders for ai-headshot-generator, videco-ai-platform, vibe-workflow, open-pomelli, ai-vfx (TDD RED until added to pageLoaders)', async () => {
      const { navigate } = await import('../../src/lib/router.js');
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await navigate('ai-headshot-generator');
      const aiCalls = errorSpy.mock.calls.filter(c => c[0] && c[0].includes('ai-headshot-generator'));
      const isNativeLoaderError = aiCalls.some(c => c[1] && typeof c[1].message === 'string' && c[1].message.includes('entry.runtime.js'));
      expect(isNativeLoaderError).toBe(true);
      await navigate('open-pomelli');
      const openCalls = errorSpy.mock.calls.filter(c => c[0] && c[0].includes('open-pomelli'));
      const isNativeForOpen = openCalls.some(c => c[1] && typeof c[1].message === 'string' && c[1].message.includes('entry.runtime.js'));
      expect(isNativeForOpen).toBe(true);
      errorSpy.mockRestore();
    });
  });
});
