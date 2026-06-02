import { VibeWorkflowStudio } from '../../components/VibeWorkflowStudio.js';
export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';

export default function VibeWorkflowReact() {
  return VibeWorkflowStudio();
}
