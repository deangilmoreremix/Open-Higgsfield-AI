import { AgentStudio } from '../../components/AgentStudio.js';
export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';

export default function AgentsReact() {
  return AgentStudio();
}
