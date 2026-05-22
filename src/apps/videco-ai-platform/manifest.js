export const appManifest = {
  id: 'videco-ai-platform',
  name: 'Videco AI Platform',
  category: 'Video Generation & Editing',
  route: '/apps/videco-ai-platform',
  description: 'AI-powered video generation with text-to-video, image-to-video, cinematic generation, timeline editing, and VFX.',
  stack: {
    frontend: 'higgsfield-compatible-react-module',
    llm: 'openai',
    generation: 'muapi',
    storage: 'supabase',
    functions: 'netlify-or-supabase-edge'
  },
  runtime: { native: true, adapter: 'runtime/adapter.js' },
  outputTypes: ['video', 'image'],
  handoffTargets: ['library', 'render', 'director', 'timeline', 'edit-studio']
};