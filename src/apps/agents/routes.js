export const routes = [
  { path: '/', name: 'Agents List', component: 'AgentsApp' },
  { path: '/new', name: 'New Agent', component: 'NewAgentPage' },
  { path: '/:agentId', name: 'Agent Detail', component: 'AgentDetailPage' },
  { path: '/:agentId/chat', name: 'Agent Chat', component: 'AgentChatPage' },
  { path: '/:agentId/settings', name: 'Agent Settings', component: 'AgentSettingsPage' },
];

export default routes;
