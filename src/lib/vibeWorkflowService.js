import { runWorkflow } from './muapiWorkflowClient.js';
import { saveToLibrary } from './libraryClient.js';

export async function createWorkflowLocal(config) {
  return {
    id: 'local_' + Date.now(),
    ...config,
    status: 'created',
    createdAt: new Date().toISOString()
  };
}

export async function runWorkflow(workflow, inputs) {
  return runWorkflow({ workflowId: workflow.id, inputs });
}

export async function saveOutputToLibrary(result) {
  return saveToLibrary({ type: 'workflow_output', data: result });
}

export async function saveWorkflowRun(id, state) {
  const runs = JSON.parse(localStorage.getItem('higgsfield_workflow_runs') || '{}');
  runs[id] = { ...state, savedAt: new Date().toISOString() };
  localStorage.setItem('higgsfield_workflow_runs', JSON.stringify(runs));
}