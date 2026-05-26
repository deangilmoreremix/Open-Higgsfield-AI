export const routes = [
  { path: '/', name: 'Design Canvas', component: 'DesignAgentApp' },
  { path: '/projects', name: 'Projects', component: 'ProjectsPage' },
  { path: '/projects/:id', name: 'Project Detail', component: 'ProjectDetailPage' },
  { path: '/templates', name: 'Templates', component: 'TemplatesPage' },
  { path: '/assets', name: 'Assets', component: 'AssetsPage' },
];

export default routes;
