import { PomelliStudio } from '../../components/PomelliStudio.js';
export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';

export default function OpenPomelliReact() {
  return PomelliStudio();
}
