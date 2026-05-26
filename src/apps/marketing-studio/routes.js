export const routes = [
  { path: '/', name: 'Campaign Builder', component: 'MarketingStudioApp' },
  { path: '/campaigns', name: 'Campaigns', component: 'CampaignsPage' },
  { path: '/campaigns/:id', name: 'Campaign Detail', component: 'CampaignDetailPage' },
  { path: '/templates', name: 'Templates', component: 'TemplatesPage' },
  { path: '/analytics', name: 'Analytics', component: 'AnalyticsPage' },
];

export default routes;
