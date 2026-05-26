export const routes = [
  { path: '/', name: 'Generate', component: 'AIHeadshotGeneratorApp' },
  { path: '/projects', name: 'Projects', component: 'ProjectsPage' },
  { path: '/projects/:id', name: 'Project Detail', component: 'ProjectDetailPage' },
  { path: '/styles', name: 'Styles', component: 'StylesPage' },
  { path: '/settings', name: 'Settings', component: 'SettingsPage' },
];

export default routes;
