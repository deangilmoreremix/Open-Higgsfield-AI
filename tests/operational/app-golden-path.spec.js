import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppExecutor } from '../../src/lib/app-executor.js';

const vibeManifest = {
  appId: 'vibe-workflow',
  executionMode: 'runtime-native',
  execution: {
    engine: 'WorkflowEngine',
    adapter: 'VibeWorkflowAdapter',
    pipeline: 'MuAPIGenerationPipeline'
  },
  persistence: { enabled: true, replay: true }
};

const videcoManifest = {
  appId: 'videco-ai-platform',
  executionMode: 'runtime-native',
  execution: {
    engine: 'ExecutionRuntime',
    pipeline: 'MuAPIGenerationPipeline'
  },
  persistence: { enabled: true, replay: true }
};

describe('App Executor - Golden Path Tests', () => {
  let executor;

  beforeEach(() => {
    executor = new AppExecutor();
    executor.workflowEngine = {
      registerWorkflow: vi.fn(),
      execute: vi.fn().mockResolvedValue({ success: true, results: new Map() })
    };
    executor.executionRuntime = {
      execute: vi.fn().mockResolvedValue({ success: true, executionId: 'test-id' })
    };
    executor.pipeline = {
      executeTask: vi.fn().mockResolvedValue({ success: true, result: { url: 'https://test.com/result' } })
    };
  });

  describe('Vibe Workflow Execution', () => {
    it('should execute workflow through runtime', async () => {
      const result = await executor.execute(vibeManifest, { prompt: 'test workflow' });
      expect(result.success).toBe(true);
      expect(result.executionId).toBeDefined();
    });

    it('should persist execution state', async () => {
      const mockSave = vi.fn();
      executor.persistence = { saveExecution: mockSave };

      await executor.execute(vibeManifest, { prompt: 'test' });
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Videco AI Platform Execution', () => {
    it('should execute video generation pipeline', async () => {
      const result = await executor.execute(videcoManifest, { 
        prompt: 'test video',
        duration: 5,
        type: 'video'
      });
      expect(result.success).toBe(true);
    });

    it('should route through MuAPI pipeline', async () => {
      const mockExecute = vi.fn().mockResolvedValue({ success: true });
      executor.pipeline.executeTask = mockExecute;

      const manifestWithPipeline = {
        ...videcoManifest,
        execution: { ...videcoManifest.execution, engine: 'Generic' },
        pipeline: { providers: ['muapi'] }
      };

      await executor.execute(manifestWithPipeline, { prompt: 'test', type: 'video' });
      expect(mockExecute).toHaveBeenCalled();
    });
  });
});