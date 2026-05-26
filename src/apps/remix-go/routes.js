export const routes = [
  { path: '/', name: 'Dashboard', component: 'RemixGoApp' },
  { path: '/projects', name: 'Projects', component: 'ProjectsPage' },
  { path: '/projects/:id', name: 'Project Detail', component: 'ProjectDetailPage' },
  { path: '/editor/:id', name: 'Editor', component: 'EditorPage' },
  { path: '/templates', name: 'Templates', component: 'TemplatesPage' },
];

export default routes;
