import { RuntimeAdapterBase } from '../../../lib/runtime/RuntimeAdapterBase.js';
import { supabase } from '../../../lib/supabase-client.ts';
import { listWorkflows, getWorkflow, createWorkflowLocal, updateWorkflow, deleteWorkflow, duplicateWorkflow, listWorkflowTemplates, createWorkflowFromTemplate, runWorkflow, runWorkflowNode, saveWorkflowRun, saveWorkflowOutput, saveOutputToLibrary, handoffWorkflowOutput } from '../services/vibeWorkflowService.js';

export class VibeWorkflowRuntimeAdapter extends RuntimeAdapterBase {
  constructor(options = {}) {
    super(options);
    this.provider = 'vibe-workflow';
    this.activeWorkflow = null;
    this.templates = [];
  }

  async execute(input, context = {}) {
    const executionId = `vibe-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.executionId = executionId;
    this.state = 'running';

    try {
      if (input.action === 'list-workflows') {
        const workflows = await listWorkflows();
        return { executionId, state: this.state, workflows };
      }

      if (input.action === 'get-workflow') {
        const workflow = await getWorkflow(input.workflowId);
        this.activeWorkflow = workflow;
        return { executionId, state: this.state, workflow };
      }

      if (input.action === 'create') {
        const workflow = await createWorkflowLocal(input.workflow || { name: 'New Workflow', nodes: [] });
        return { executionId, state: this.state, workflow };
      }

      if (input.action === 'create-from-template') {
        const workflow = await createWorkflowFromTemplate(input.templateId);
        return { executionId, state: this.state, workflow };
      }

      if (input.action === 'run') {
        const result = await runWorkflow(input.workflow, input.params);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'run-node') {
        const result = await runWorkflowNode(input.node, input.input);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'duplicate') {
        const workflow = await duplicateWorkflow(input.workflowId);
        return { executionId, state: this.state, workflow };
      }

      if (input.action === 'delete') {
        await deleteWorkflow(input.workflowId);
        return { executionId, state: this.state, deleted: true };
      }

      this.state = 'completed';
      return { executionId, state: this.state };
    } catch (error) {
      this.state = 'failed';
      throw error;
    }
  }

  async pause(executionId) {
    this.state = 'paused';
    return { executionId, state: this.state };
  }

  async resume(executionId) {
    this.state = 'running';
    return { executionId, state: this.state };
  }

  async cancel(executionId) {
    this.state = 'cancelled';
    return { executionId, state: this.state };
  }

  serialize() {
    return {
      id: this.executionId,
      state: this.state,
      workflow: this.activeWorkflow
    };
  }

  deserialize(data) {
    if (data.id !== undefined) this.executionId = data.id;
    if (data.state !== undefined) this.state = data.state;
    if (data.workflow !== undefined) this.activeWorkflow = data.workflow;
  }

  getExecutionState() {
    return {
      id: this.executionId,
      state: this.state,
      stack: this.stack,
      workflow: this.activeWorkflow
    };
  }
}