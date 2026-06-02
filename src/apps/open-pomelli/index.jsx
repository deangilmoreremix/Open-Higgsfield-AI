import { OpenPomelliStudio } from '../../components/OpenPomelliStudio.js';
export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';

export default function OpenPomelliReact() {
  return OpenPomelliStudio();
}
