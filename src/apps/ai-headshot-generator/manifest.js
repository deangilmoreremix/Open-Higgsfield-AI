export const appManifest = {
  id: 'ai-headshot-generator',
  name: 'AI Headshot Generator',
  description: 'Generate professional AI headshots from photos',
  icon: 'Camera',
  category: 'image',
  route: '/headshots',
  status: 'complete',
  features: ['source-photo-upload', 'style-presets', 'batch-generation', 'library-save'],
  hasServices: true,
  hasComponents: true,
  hasAssets: true,
};

export default appManifest;
