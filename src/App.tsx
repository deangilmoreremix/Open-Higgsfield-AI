import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
// @ts-ignore - LandingPage is a vanilla JS component that returns a DOM element
import LandingPage from './components/landing/LandingPage.jsx';
// @ts-ignore - SignInPage is a vanilla JS component that returns a DOM element
import { SignInPage } from './components/landing/SignInPage.jsx';

const pageLoaders = {
  image: () => import('./components/ImageStudio.js').then(m => ({ default: m.ImageStudio })),
  video: () => import('./components/VideoStudio.js').then(m => ({ default: m.VideoStudio })),
  cinema: () => import('./components/CinemaStudio.js').then(m => ({ default: m.CinemaStudio })),
  apps: () => import('./components/AppsHub.js').then(m => ({ default: m.AppsHub })),
  templates: () => import('./components/TemplatesPage.js').then(m => ({ default: m.TemplatesPage })),
  effects: () => import('./components/EffectsStudio.js').then(m => ({ default: m.EffectsStudio })),
  vfx: () => import('./components/EffectsStudio.js').then(m => ({ default: m.EffectsStudio })),
  'ai-vfx': () => import('./components/AIVFXStudio.js').then(m => ({ default: m.AIVFXStudio })),
  edit: () => import('./components/EditStudio.js').then(m => ({ default: m.EditStudio })),
  upscale: () => import('./components/UpscaleStudio.js').then(m => ({ default: m.UpscaleStudio })),
  library: () => import('./components/LibraryPage.js').then(m => ({ default: m.LibraryPage })),
  character: () => import('./components/CharacterStudio.js').then(m => ({ default: m.CharacterStudio })),
  influencer: () => import('./components/InfluencerStudio.js').then(m => ({ default: m.InfluencerStudio })),
  commercial: () => import('./components/CommercialStudio.js').then(m => ({ default: m.CommercialStudio })),
  explore: () => import('./components/ExplorePage.js').then(m => ({ default: m.ExplorePage })),
  avatar: () => import('./components/AvatarStudio.js').then(m => ({ default: m.AvatarStudio })),
  audio: () => import('./components/AudioStudio.js').then(m => ({ default: m.AudioStudio })),
  training: () => import('./components/TrainingStudio.js').then(m => ({ default: m.TrainingStudio })),
  videotools: () => import('./components/VideoToolsStudio.js').then(m => ({ default: m.VideoToolsStudio })),
  chat: () => import('./components/ChatStudio.js').then(m => ({ default: m.ChatStudio })),
  lipsync: () => import('./components/LipSyncStudio.js').then(m => ({ default: m.LipSyncStudio })),
  workflows: () => import('./components/WorkflowBuilderApp.js').then(m => ({ default: m.WorkflowBuilderApp })),
  agents: () => import('./components/AgentStudio.js').then(m => ({ default: m.AgentStudio })),
  assistant: () => import('./components/AssistantStudio.js').then(m => ({ default: m.AssistantStudio })),
  studio: () => import('./components/StudioApp.js').then(m => ({ default: m.StudioApp })),
  'ai-agent': () => import('./components/AIAgentApp.js').then(m => ({ default: m.AIAgentApp })),
  'design-agent': () => import('./components/DesignAgentApp.js').then(m => ({ default: m.DesignAgentApp })),
  'marketing-studio': () => import('./components/MarketingStudioApp.js').then(m => ({ default: m.MarketingStudioApp })),
  'apps-studio': () => import('./components/AppsStudioApp.js').then(m => ({ default: m.AppsStudioApp })),
  'mcp-cli': () => import('./components/McpCliStudio.js').then(m => ({ default: m.McpCliStudio })),
  'video-outreach': () => import('./components/VideoOutreachStudio.js').then(m => ({ default: m.VideoOutreachStudio })),
  assist: () => import('./components/AssistPage.js').then(m => ({ default: m.AssistPage })),
  community: () => import('./components/CommunityPage.js').then(m => ({ default: m.CommunityPage })),
  storyboard: () => import('./components/StoryboardStudio.js').then(m => ({ default: m.StoryboardStudio })),
  'text-to-image': () => import('./components/TextToImagePage.js').then(m => ({ default: m.TextToImagePage })),
  'image-to-image': () => import('./components/ImageToImagePage.js').then(m => ({ default: m.ImageToImagePage })),
  'text-to-video': () => import('./components/TextToVideoPage.js').then(m => ({ default: m.TextToVideoPage })),
  'image-to-video': () => import('./components/ImageToVideoPage.js').then(m => ({ default: m.ImageToVideoPage })),
  'video-to-video': () => import('./components/VideoToVideoPage.js').then(m => ({ default: m.VideoToVideoPage })),
  'video-watermark': () => import('./components/VideoWatermarkPage.js').then(m => ({ default: m.VideoWatermarkPage })),
  'storyboard-page': () => import('./components/StoryboardPage.js').then(m => ({ default: m.StoryboardPage })),
  'character-page': () => import('./components/CharacterPage.js').then(m => ({ default: m.CharacterPage })),
  'effects-page': () => import('./components/EffectsPage.js').then(m => ({ default: m.EffectsPage })),
  'cinema-page': () => import('./components/CinemaPage.js').then(m => ({ default: m.CinemaPage })),
  'influencer-page': () => import('./components/InfluencerPage.js').then(m => ({ default: m.InfluencerPage })),
  'commercial-page': () => import('./components/CommercialPage.js').then(m => ({ default: m.CommercialPage })),
  'upscale-page': () => import('./components/UpscalePage.js').then(m => ({ default: m.UpscalePage })),
  render: () => import('./components/RenderPage.js').then(m => ({ default: m.RenderPage })),
  'video-agent': () => import('./components/VideoAgentPage.js').then(m => ({ default: m.VideoAgentPage })),
  director: () => import('./components/DirectorPage.js').then(m => ({ default: m.DirectorPage })),
    timeline: () => import('./components/PlaceholderPage.js').then(m => ({ default: () => m.PlaceholderPage('Timeline') })),
  'remix-go': () => import('./apps/remix-go/index.js').then(m => ({ default: m.RemixGoApp })),
  'ai-video-outreach': () => import('./components/AIVideoOutreachPage.js').then(m => ({ default: m.AIVideoOutreachPage })),
  'ai-headshot': () => import('./components/HeadshotStudio.js').then(m => ({ default: m.HeadshotStudio })),
  'runway-motion': () => import('./components/RunwayMotionStudio.js').then(m => ({ default: m.RunwayMotionStudio })),
  'tiktok-carousel': () => import('./components/TikTokCarouselStudio.js').then(m => ({ default: m.TikTokCarouselStudio })),
  'advanced-dubbing': () => import('./components/AdvancedDubbingStudio.js').then(m => ({ default: m.AdvancedDubbingStudio })),
  documentation: () => import('./components/DocumentationPage.js').then(m => ({ default: m.DocumentationPage })),
  headshots: () => import('./components/HeadshotStudio.js').then(m => ({ default: m.HeadshotStudio })),
  'headshots-generate': () => import('./components/HeadshotStudio.js').then(m => ({ default: m.HeadshotStudio })),
  'headshots-history': () => import('./components/HeadshotStudio.js').then(m => ({ default: m.HeadshotStudio })),
  'headshots-settings': () => import('./components/HeadshotStudio.js').then(m => ({ default: m.HeadshotStudio })),
  personalizer: () => import('./components/PlaceholderPage.js').then(m => ({ default: () => m.PlaceholderPage('Personalizer') })),
  'pomelli-studio': () => import('./components/PomelliStudio.js').then(m => ({ default: m.PomelliStudio })),
  'workflow-studio': () => import('./components/WorkflowStudioApp.js').then(m => ({ default: m.WorkflowStudioApp })),
  'agents/create': () => import('./components/AIAgentApp.js').then(m => ({ default: m.AIAgentApp })),
  'agents/edit': () => import('./components/AIAgentApp.js').then(m => ({ default: m.AIAgentApp })),
};

function LazyComponent({ loader }) {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    loader()
      .then(module => {
        if (mounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [loader]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-400 text-sm">
        Failed to load: {error.message}
      </div>
    );
  }

  if (Component) {
    const instance = Component();
    if (React.isValidElement(instance)) {
      return instance;
    }
    return <div dangerouslySetInnerHTML={{ __html: '' }} ref={el => {
      if (el && instance) el.appendChild(instance);
    }} />;
  }

  return null;
}

function PlaceholderPage({ pageName }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-app-bg p-6">
      <div className="text-center animate-fade-in-up max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-2">
          {pageName.charAt(0).toUpperCase() + pageName.slice(1)}
        </h2>
        <p className="text-secondary text-sm">Coming soon</p>
      </div>
    </div>
  );
}

function AppShell({ children }) {
  const navigate = useNavigate();
  const [personalizerOpen, setPersonalizerOpen] = useState(false);

  useEffect(() => {
    const handleOpenPersonalizer = () => setPersonalizerOpen(true);
    window.addEventListener('open-personalizer', handleOpenPersonalizer);
    return () => window.removeEventListener('open-personalizer', handleOpenPersonalizer);
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <Header navigate={navigate} />
      <div className="flex flex-1">
        <Sidebar onNavigate={(route) => navigate(`/${route}`)} />
        <main
          id="content-area"
          data-testid="content-area"
          className="flex-1 relative w-full flex flex-col bg-app-bg"
        >
          {children}
        </main>
      </div>
      <button
        id="global-personalizer-btn"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 bg-white text-black rounded-full shadow-lg hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
        aria-label="Open AI Personalizer"
        onClick={() => window.dispatchEvent(new CustomEvent('open-personalizer'))}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </button>
    </div>
  );
}

function App({ initialRoute }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/*" element={
          <AppShell>
            <DynamicRoutes />
          </AppShell>
        } />
      </Routes>
    </BrowserRouter>
  );
}

function DynamicRoutes() {
  const routes = [
    { path: '/image', name: 'image' },
    { path: '/video', name: 'video' },
    { path: '/cinema', name: 'cinema' },
    { path: '/apps', name: 'apps' },
    { path: '/templates', name: 'templates' },
    { path: '/effects', name: 'effects' },
    { path: '/vfx', name: 'vfx' },
    { path: '/ai-vfx', name: 'ai-vfx' },
    { path: '/edit', name: 'edit' },
    { path: '/upscale', name: 'upscale' },
    { path: '/library', name: 'library' },
    { path: '/character', name: 'character' },
    { path: '/influencer', name: 'influencer' },
    { path: '/commercial', name: 'commercial' },
    { path: '/explore', name: 'explore' },
    { path: '/avatar', name: 'avatar' },
    { path: '/audio', name: 'audio' },
    { path: '/training', name: 'training' },
    { path: '/videotools', name: 'videotools' },
    { path: '/chat', name: 'chat' },
    { path: '/lipsync', name: 'lipsync' },
    { path: '/workflows', name: 'workflows' },
    { path: '/workflows/editor', name: 'workflows' },
    { path: '/workflows/history', name: 'workflows' },
    { path: '/workflows/settings', name: 'workflows' },
    { path: '/agents', name: 'agents' },
    { path: '/assistant', name: 'assistant' },
    { path: '/studio', name: 'studio' },
    { path: '/workflow-builder', name: 'workflows' },
    { path: '/ai-agent', name: 'ai-agent' },
    { path: '/design-agent', name: 'design-agent' },
    { path: '/marketing-studio', name: 'marketing-studio' },
    { path: '/apps-studio', name: 'apps-studio' },
    { path: '/mcp-cli', name: 'mcp-cli' },
    { path: '/video-outreach', name: 'video-outreach' },
    { path: '/assist', name: 'assist' },
    { path: '/community', name: 'community' },
    { path: '/storyboard', name: 'storyboard' },
    { path: '/text-to-image', name: 'text-to-image' },
    { path: '/image-to-image', name: 'image-to-image' },
    { path: '/text-to-video', name: 'text-to-video' },
    { path: '/image-to-video', name: 'image-to-video' },
    { path: '/video-to-video', name: 'video-to-video' },
    { path: '/video-watermark', name: 'video-watermark' },
    { path: '/storyboard-page', name: 'storyboard-page' },
    { path: '/character-page', name: 'character-page' },
    { path: '/effects-page', name: 'effects-page' },
    { path: '/cinema-page', name: 'cinema-page' },
    { path: '/influencer-page', name: 'influencer-page' },
    { path: '/commercial-page', name: 'commercial-page' },
    { path: '/upscale-page', name: 'upscale-page' },
    { path: '/render', name: 'render' },
    { path: '/video-agent', name: 'video-agent' },
    { path: '/director', name: 'director' },
    { path: '/timeline', name: 'timeline' },
    { path: '/remix-go', name: 'remix-go' },
    { path: '/ai-video-outreach', name: 'ai-video-outreach' },
    { path: '/ai-headshot', name: 'ai-headshot' },
    { path: '/runway-motion', name: 'runway-motion' },
    { path: '/tiktok-carousel', name: 'tiktok-carousel' },
    { path: '/advanced-dubbing', name: 'advanced-dubbing' },
    { path: '/documentation', name: 'documentation' },
    { path: '/headshots', name: 'headshots' },
    { path: '/headshots-generate', name: 'headshots-generate' },
    { path: '/headshots-history', name: 'headshots-history' },
    { path: '/headshots-settings', name: 'headshots-settings' },
    { path: '/personalizer', name: 'personalizer' },
    { path: '/pomelli-studio', name: 'pomelli-studio' },
    { path: '/workflow-studio', name: 'workflow-studio' },
    { path: '/agents/create', name: 'agents/create' },
    { path: '/agents/edit', name: 'agents/edit' },
  ];

  return (
    <>
      {routes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={<LazyComponent loader={pageLoaders[route.name]} />}
        />
      ))}
      <Route path="/effects/template/:templateId" element={<PlaceholderPage pageName="Effects Template" />} />
      <Route path="/template/:templateId" element={<PlaceholderPage pageName="Template" />} />
      <Route path="/workflows/:subpage" element={<LazyComponent loader={pageLoaders.workflows} />} />
      <Route path="/agents/:subpage" element={<LazyComponent loader={pageLoaders.agents} />} />
      <Route path="*" element={<PlaceholderPage pageName="Not Found" />} />
    </>
  );
}

export default App;