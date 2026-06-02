import { MarketingStudioApp } from '../../components/MarketingStudioApp.js';
export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';

export default function MarketingStudioReact() {
  return MarketingStudioApp();
}
