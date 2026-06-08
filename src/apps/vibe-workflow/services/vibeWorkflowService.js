// Stub vibeWorkflowService - provides local workflow functionality
export async function createWorkflowLocal(data) {
  return { id: 'local_' + Date.now(), name: data.name || 'Untitled', nodes: data.nodes || [] };
}
export async function runWorkflow(workflow) {
  await new Promise(r => setTimeout(r, 500));
  return { success: true, outputs: [], url: null };
}
export async function saveWorkflowRun(id, state) {}
export async function saveOutputToLibrary(output) {}