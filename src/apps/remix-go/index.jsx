import { RemixGoStudio } from '../../components/RemixGoStudio.js';
export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';

export default function RemixGoReact() {
  return RemixGoStudio();
}
