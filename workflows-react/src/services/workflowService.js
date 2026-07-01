import {
  PRESET_WORKFLOWS,
  DEFAULT_WORKFLOW,
} from '../data/nodeDefinitions';

const STORAGE_KEY = 'workflows';
const TEMPLATES_KEY = 'workflow_templates';

export async function listWorkflows() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error listing workflows:', error);
    return [];
  }
}

export async function getWorkflow(id) {
  try {
    const workflows = await listWorkflows();
    return workflows.find(w => w.id === id) || null;
  } catch (error) {
    console.error('Error getting workflow:', error);
    return null;
  }
}

export async function createWorkflow(workflow) {
  try {
    const workflows = await listWorkflows();
    const newWorkflow = {
      ...DEFAULT_WORKFLOW,
      ...workflow,
      id: workflow.id || `wf_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    workflows.unshift(newWorkflow);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
    return newWorkflow;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
}

export async function updateWorkflow(id, updates) {
  try {
    const workflows = await listWorkflows();
    const index = workflows.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error('Workflow not found');
    }
    workflows[index] = {
      ...workflows[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
    return workflows[index];
  } catch (error) {
    console.error('Error updating workflow:', error);
    throw error;
  }
}

export async function deleteWorkflow(id) {
  try {
    const workflows = await listWorkflows();
    const filtered = workflows.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
}

export async function duplicateWorkflow(id) {
  try {
    const workflow = await getWorkflow(id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    const duplicated = {
      ...workflow,
      id: `wf_${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const workflows = await listWorkflows();
    workflows.unshift(duplicated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
    return duplicated;
  } catch (error) {
    console.error('Error duplicating workflow:', error);
    throw error;
  }
}

export async function listWorkflowTemplates() {
  try {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(PRESET_WORKFLOWS));
    return PRESET_WORKFLOWS;
  } catch (error) {
    console.error('Error listing templates:', error);
    return PRESET_WORKFLOWS;
  }
}

export async function createWorkflowFromTemplate(templateId) {
  try {
    const templates = await listWorkflowTemplates();
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    const workflow = {
      ...DEFAULT_WORKFLOW,
      name: template.name,
      category: template.category,
      data: {
        nodes: template.nodes.map(n => ({
          ...n,
          id: `${n.type.replace('Node', '').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        })),
        edges: template.edges.map((e, i) => ({
          ...e,
          id: `e_${Date.now()}_${i}`,
        })),
      },
      fromTemplate: templateId,
    };
    return createWorkflow(workflow);
  } catch (error) {
    console.error('Error creating workflow from template:', error);
    throw error;
  }
}

export async function saveWorkflow(workflow) {
  if (workflow.id) {
    return updateWorkflow(workflow.id, workflow);
  }
  return createWorkflow(workflow);
}

export async function exportWorkflow(id) {
  try {
    const workflow = await getWorkflow(id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    const exportData = JSON.stringify(workflow, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting workflow:', error);
    throw error;
  }
}

export async function importWorkflow(fileContent) {
  try {
    const workflowData = JSON.parse(fileContent);
    const workflow = {
      ...DEFAULT_WORKFLOW,
      ...workflowData,
      id: `wf_${Date.now()}`,
      name: workflowData.name || 'Imported Workflow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return createWorkflow(workflow);
  } catch (error) {
    console.error('Error importing workflow:', error);
    throw error;
  }
}

export function buildWorkflowPayload(nodes, edges, workflowName, workflowId, category = 'General') {
  return {
    workflow_id: workflowId || null,
    name: workflowName || 'Untitled',
    edges,
    data: { nodes },
    category,
  };
}