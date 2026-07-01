import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VibeWorkflowAdapter } from '../../src/lib/vibe-workflow-adapter.js';
import { WorkflowEngine } from '../../src/lib/workflow-engine.js';
import { ExecutionStateMachine, ExecutionStates } from '../../src/lib/execution-state-machine.js';

describe('VibeWorkflowAdapter', () => {
  let adapter;
  let mockWorkflowEngine;

  beforeEach(() => {
    mockWorkflowEngine = {
      registerWorkflow: vi.fn(),
      execute: vi.fn()
    };
    adapter = new VibeWorkflowAdapter({
      workflowEngine: mockWorkflowEngine
    });
  });

  describe('Node Creation', () => {
    it('should create a node with default values', () => {
      const node = adapter.createNode(100, 200, 'Test Node', 'process');
      expect(node.id).toBe('node_1');
      expect(node.x).toBe(100);
      expect(node.y).toBe(200);
      expect(node.label).toBe('Test Node');
      expect(node.type).toBe('process');
    });

    it('should increment node IDs', () => {
      const node1 = adapter.createNode(0, 0, 'Node 1');
      const node2 = adapter.createNode(0, 0, 'Node 2');
      expect(node1.id).toBe('node_1');
      expect(node2.id).toBe('node_2');
    });
  });

  describe('Edge Management', () => {
    it('should add edges between nodes', () => {
      const node1 = adapter.createNode(0, 0, 'Node 1');
      const node2 = adapter.createNode(100, 0, 'Node 2');
      adapter.addEdge(node1.id, node2.id);
      expect(adapter.edges).toHaveLength(1);
      expect(adapter.edges[0]).toEqual({ from: 'node_1', to: 'node_2' });
    });
  });

  describe('Clear', () => {
    it('should clear all nodes and edges', () => {
      adapter.createNode(0, 0, 'Node 1');
      adapter.createNode(100, 0, 'Node 2');
      adapter.addEdge('node_1', 'node_2');
      adapter.clear();
      expect(adapter.nodes).toHaveLength(0);
      expect(adapter.edges).toHaveLength(0);
      expect(adapter.nodeIdCounter).toBe(0);
    });
  });

  describe('Workflow Definition', () => {
    it('should convert nodes to workflow definition', () => {
      adapter.createNode(0, 0, 'Input', 'input');
      adapter.createNode(100, 0, 'Process', 'process');
      const def = adapter.toWorkflowDefinition();
      expect(def.nodes).toHaveLength(2);
      expect(def.edges).toHaveLength(0);
    });
  });

  describe('Workflow Registration', () => {
    it('should register workflow with engine', async () => {
      adapter.createNode(0, 0, 'Node 1');
      await adapter.registerWorkflow('test-workflow');
      expect(mockWorkflowEngine.registerWorkflow).toHaveBeenCalledWith('test-workflow', expect.objectContaining({
        nodes: expect.any(Array),
        edges: expect.any(Array)
      }));
    });
  });

  describe('Handler Creation', () => {
    it('should create input handler', async () => {
      const node = adapter.createNode(0, 0, 'Input', 'input');
      const handler = adapter.createHandlerForNode(node);
      const input = { data: 'test' };
      const result = await handler(input, {});
      expect(result.success).toBe(true);
      expect(result.input).toEqual(input);
    });

    it('should create output handler', async () => {
      const node = adapter.createNode(0, 0, 'Output', 'output');
      const handler = adapter.createHandlerForNode(node);
      const input = { result: 'test output' };
      const result = await handler(input, {});
      expect(result.success).toBe(true);
      expect(result.output).toBe('test output');
    });
  });
});