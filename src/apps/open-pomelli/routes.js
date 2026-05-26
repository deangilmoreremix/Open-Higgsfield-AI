export const routes = [
  { path: '/', name: 'Studio', component: 'OpenPomelliApp' },
  { path: '/projects', name: 'Projects', component: 'ProjectsPage' },
  { path: '/projects/:id', name: 'Project Detail', component: 'ProjectDetailPage' },
  { path: '/campaigns/:id', name: 'Campaign', component: 'CampaignPage' },
  { path: '/brand-dna', name: 'Brand DNA', component: 'BrandDnaPage' },
];

export default routes;
