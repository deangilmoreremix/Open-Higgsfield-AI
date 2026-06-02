import { WorkflowBuilderApp } from '../../components/WorkflowBuilderApp.js';
export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';

export default function WorkflowsApp() {
  return WorkflowBuilderApp();
}
