import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppRegistry } from '../../src/lib/appRegistry.js';
import { AppExecutorFactory } from '../../src/lib/app-executor-factory.js';
import { RuntimeInitializer } from '../../src/lib/runtime-initializer.js';

describe('Runtime Integration', () => {
  beforeEach(() => {
    AppRegistry.clear();
    RuntimeInitializer.reset();
  });

  afterEach(() => {
    AppRegistry.clear();
    RuntimeInitializer.reset();
  });

  describe('AppExecutorFactory', () => {
    it('should create native executor', () => {
      const manifest = {
        appId: 'test-app',
        name: 'Test App',
        executionMode: 'runtime-native'
      };

      const executor = AppExecutorFactory.create('test-app', manifest);
      expect(executor.appId).toBe('test-app');
      expect(executor.name).toBe('Test App');
      expect(executor.execute).toBeDefined();
    });

    it('should create workflow executor', () => {
      const manifest = {
        appId: 'workflow-app',
        name: 'Workflow App',
        executionMode: 'workflow'
      };

      const executor = AppExecutorFactory.create('workflow-app', manifest);
      expect(executor.appId).toBe('workflow-app');
      expect(executor.execute).toBeDefined();
    });

    it('should create pipeline executor', () => {
      const manifest = {
        appId: 'pipeline-app',
        name: 'Pipeline App',
        executionMode: 'pipeline'
      };

      const executor = AppExecutorFactory.create('pipeline-app', manifest);
      expect(executor.appId).toBe('pipeline-app');
      expect(executor.execute).toBeDefined();
    });

    it('should create ai-generation executor', () => {
      const manifest = {
        appId: 'ai-app',
        name: 'AI App',
        executionMode: 'ai-generation'
      };

      const executor = AppExecutorFactory.create('ai-app', manifest);
      expect(executor.appId).toBe('ai-app');
      expect(executor.execute).toBeDefined();
    });

    it('should register app in AppRegistry', () => {
      const manifest = {
        appId: 'registered-app',
        name: 'Registered App',
        executionMode: 'runtime-native'
      };

      AppExecutorFactory.register('registered-app', manifest);
      const app = AppRegistry.get('registered-app');
      expect(app).toBeDefined();
      expect(app.appId).toBe('registered-app');
    });
  });

  describe('RuntimeInitializer', () => {
    it('should register app manifest', () => {
      const manifest = {
        appId: 'test-manifest-app',
        name: 'Test Manifest App'
      };

      RuntimeInitializer.registerAppManifest('test-manifest-app', manifest);
      const retrieved = RuntimeInitializer.getAppManifest('test-manifest-app');
      expect(retrieved).toBe(manifest);
    });

    it('should get registered apps', () => {
      const manifest1 = {
        appId: 'app1',
        name: 'App 1',
        executionMode: 'runtime-native'
      };

      const manifest2 = {
        appId: 'app2',
        name: 'App 2',
        executionMode: 'runtime-native'
      };

      RuntimeInitializer.registerApp('app1', manifest1);
      RuntimeInitializer.registerApp('app2', manifest2);

      const apps = RuntimeInitializer.getRegisteredApps();
      expect(apps).toHaveLength(2);
      expect(apps.map(a => a.appId)).toContain('app1');
      expect(apps.map(a => a.appId)).toContain('app2');
    });
  });
});