export const routes = [
  { path: '/', name: 'Workflows', component: 'VibeWorkflowApp' },
  { path: '/new', name: 'New Workflow', component: 'NewWorkflowPage' },
  { path: '/:workflowId', name: 'Workflow Editor', component: 'WorkflowEditorPage' },
  { path: '/:workflowId/run/:runId', name: 'Run Result', component: 'RunResultPage' },
  { path: '/templates', name: 'Templates', component: 'TemplatesPage' },
];

export default routes;
