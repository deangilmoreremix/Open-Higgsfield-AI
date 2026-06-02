import { DesignAgentApp } from '../../components/DesignAgentApp.js';
export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';

export default function DesignAgentReact() {
  return DesignAgentApp();
}
