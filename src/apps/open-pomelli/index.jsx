'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { appManifest } from './manifest';
import { analyzeWebsite, extractBrandDNA, generateCampaignConcepts, generatePlatformCreative, generateProductPhotography, generateShortVideo, saveBrandProject, saveCreativeOutput, saveOutputToLibrary, handoffOutput } from './services/pomelliService.js';
import { securityService } from '../../../lib/services/SecurityService.js';

const CAMPAIGN_GOALS = [
  { id: 'launch', name: 'Product Launch', icon: '🚀' },
  { id: 'leads', name: 'Lead Generation', icon: '📈' },
  { id: 'awareness', name: 'Awareness', icon: '📢' },
  { id: 'engagement', name: 'Engagement', icon: '❤️' },
  { id: 'thought', name: 'Thought Leadership', icon: '🧠' },
  { id: 'sales', name: 'Sales', icon: '💰' },
];

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', dimensions: '1080x1080' },
  { id: 'linkedin', name: 'LinkedIn', dimensions: '1200x627' },
  { id: 'facebook', name: 'Facebook', dimensions: '1200x630' },
  { id: 'twitter', name: 'Twitter', dimensions: '1200x600' },
  { id: 'youtube', name: 'YouTube', dimensions: '1280x720' },
];

const PHOTO_STYLES = [
  { id: 'studio-white', name: 'Studio White', category: 'Product' },
  { id: 'marble-clean', name: 'Marble Clean', category: 'Product' },
  { id: 'urban-street', name: 'Urban Street', category: 'Product' },
  { id: 'golden-hour', name: 'Golden Hour', category: 'Product' },
  { id: 'restaurant-plated', name: 'Restaurant Plated', category: 'Food' },
  { id: 'scandi-living', name: 'Scandi Living', category: 'Lifestyle' },
  { id: 'dark-techy', name: 'Dark Techy', category: 'Tech' },
];

export default function OpenPomelliApp() {
  const [activeTab, setActiveTab] = useState('url');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [brandDNA, setBrandDNA] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [generatingCampaign, setGeneratingCampaign] = useState(false);
  const [creatives, setCreatives] = useState([]);
  const [generatingCreative, setGeneratingCreative] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => key && setApiKey(key));
  }, []);

  const handleAnalyzeUrl = useCallback(async () => {
    if (!websiteUrl || !apiKey) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const websiteData = await analyzeWebsite(websiteUrl);
      const screenshotUrl = websiteData.screenshot || websiteData.og_image;
      
      const dna = await extractBrandDNA(websiteData, screenshotUrl);
      setBrandDNA({ ...dna, projectId: 'pom_' + Date.now() });
      setActiveTab('dna');
      
      await saveBrandProject({ url: websiteUrl, ...dna });
    } catch (err) {
      setError('Analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [websiteUrl, apiKey]);

  const handleGenerateCampaigns = useCallback(async () => {
    if (!brandDNA || !selectedGoal) return;
    
    setGeneratingCampaign(true);
    setError(null);

    try {
      const concepts = await generateCampaignConcepts(brandDNA.projectId, selectedGoal.id);
      setCampaigns(concepts);
      setActiveTab('campaigns');
    } catch (err) {
      setError('Campaign generation failed: ' + err.message);
    } finally {
      setGeneratingCampaign(false);
    }
  }, [brandDNA, selectedGoal]);

  const handleGenerateCreative = useCallback(async (campaign) => {
    if (!selectedPlatform || !brandDNA) return;
    
    setGeneratingCreative(true);
    setError(null);

    try {
      const creative = await generatePlatformCreative(selectedPlatform.id, campaign, brandDNA);
      setCreatives(prev => [...prev, creative]);
      await saveCreativeOutput({ ...creative, platform: selectedPlatform.id, campaignId: campaign.id });
      await saveOutputToLibrary(creative);
    } catch (err) {
      setError('Creative generation failed: ' + err.message);
    } finally {
      setGeneratingCreative(false);
    }
  }, [selectedPlatform, brandDNA]);

  const handleGenerateProductPhoto = useCallback(async (referenceImages) => {
    if (!selectedStyle || !apiKey) return;
    
    setGeneratingCreative(true);
    setError(null);

    try {
      const result = await generateProductPhotography(`Generate product photo in ${selectedStyle.name} style`, referenceImages);
      setCreatives(prev => [...prev, result]);
      await saveOutputToLibrary(result);
    } catch (err) {
      setError('Product photo generation failed: ' + err.message);
    } finally {
      setGeneratingCreative(false);
    }
  }, [selectedStyle, apiKey]);

  const handleAnimateAsset = useCallback(async (imageUrl) => {
    if (!apiKey) return;
    
    try {
      const result = await generateShortVideo('Animate this image with dynamic motion', imageUrl);
      setCreatives(prev => [...prev, result]);
      await saveOutputToLibrary(result);
    } catch (err) {
      setError('Animation failed: ' + err.message);
    }
  }, [apiKey]);

  const tabs = [
    { id: 'url', name: 'URL Input', icon: '🔗' },
    { id: 'dna', name: 'Brand DNA', icon: '🧬' },
    { id: 'campaigns', name: 'Campaigns', icon: '📊' },
    { id: 'photo-studio', name: 'Photo Studio', icon: '📸' },
    { id: 'animate', name: 'Animate', icon: '🎥' },
  ];

  return React.createElement(
    'div',
    { className: 'w-full h-full flex flex-col bg-[#030303] text-white' },
    
    // Header
    React.createElement(
      'div',
      { className: 'px-6 py-4 border-b border-white/10 flex items-center justify-between' },
      React.createElement('h1', { className: 'text-xl font-bold' }, appManifest.name),
      React.createElement('p', { className: 'text-white/60 text-sm' }, appManifest.description)
    ),

    // Tabs
    React.createElement(
      'div',
      { className: 'px-6 py-3 border-b border-white/10 flex gap-2 overflow-x-auto' },
      tabs.map(tab =>
        React.createElement(
          'button',
          {
            key: tab.id,
            onClick: () => setActiveTab(tab.id),
            className: `px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-primary text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`
          },
          tab.icon,
          ' ',
          tab.name
        )
      )
    ),

    // Main content
    React.createElement(
      'div',
      { className: 'flex-1 p-6 overflow-y-auto' },
      
      // URL Input Tab
      activeTab === 'url' && React.createElement(
        'div',
        { className: 'max-w-2xl' },
        React.createElement(
          'div',
          { className: 'mb-6' },
          React.createElement(
            'label',
            { className: 'block text-sm font-medium text-white/60 mb-2' },
            'Website URL'
          ),
          React.createElement('input', {
            type: 'url',
            value: websiteUrl,
            onChange: (e) => setWebsiteUrl(e.target.value),
            placeholder: 'https://example.com',
            className: 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary'
          })
        ),
        React.createElement(
          'button',
          {
            onClick: handleAnalyzeUrl,
            disabled: isAnalyzing || !websiteUrl || !apiKey,
            className: `px-6 py-3 rounded-lg font-bold ${
              websiteUrl && apiKey && !isAnalyzing
                ? 'bg-primary text-black hover:shadow-glow'
                : 'bg-white/5 text-white/40'
            }`
          },
          isAnalyzing ? 'Analyzing...' : 'Analyze Website'
        ),
        !apiKey && React.createElement(
          'p',
          { className: 'mt-3 text-amber-400 text-sm' },
          '⚠️ Please set your MuAPI API key in Settings first'
        )
      ),

      // Brand DNA Tab
      activeTab === 'dna' && brandDNA && React.createElement(
        'div',
        { className: 'max-w-4xl' },
        React.createElement(
          'h2',
          { className: 'text-lg font-bold mb-4' },
          brandDNA.name || 'Untitled Brand'
        ),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6' },
          React.createElement(
            'div',
            null,
            React.createElement('h3', { className: 'text-xs font-medium text-white/60 mb-2 uppercase' }, 'Colors'),
            React.createElement(
              'div',
              { className: 'flex flex-wrap gap-2' },
              (brandDNA.colors || []).map((color, idx) =>
                React.createElement('div', {
                  key: idx,
                  className: 'w-10 h-10 rounded-lg border border-white/10',
                  style: { backgroundColor: color }
                })
              )
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('h3', { className: 'text-xs font-medium text-white/60 mb-2 uppercase' }, 'Tone'),
            React.createElement(
              'div',
              { className: 'flex flex-wrap gap-1' },
              (brandDNA.tone || []).map((tone, idx) =>
                React.createElement('span', {
                  key: idx,
                  className: 'px-2 py-1 bg-white/5 rounded text-xs'
                }, tone)
              )
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('h3', { className: 'text-xs font-medium text-white/60 mb-2 uppercase' }, 'Personality'),
            React.createElement(
              'div',
              { className: 'flex flex-wrap gap-1' },
              (brandDNA.personality || []).map((p, idx) =>
                React.createElement('span', {
                  key: idx,
                  className: 'px-2 py-1 bg-primary/10 rounded text-xs text-primary'
                }, p)
              )
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('h3', { className: 'text-xs font-medium text-white/60 mb-2 uppercase' }, 'Fonts'),
            React.createElement(
              'div',
              { className: 'flex flex-col gap-1' },
              (brandDNA.fonts || []).map((font, idx) =>
                React.createElement('span', { key: idx, className: 'text-sm' }, font)
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'mt-6' },
          React.createElement(
            'h3',
            { className: 'text-sm font-medium text-white/60 mb-3' },
            'Campaign Goal'
          ),
          React.createElement(
            'div',
            { className: 'grid grid-cols-2 md:grid-cols-3 gap-2' },
            CAMPAIGN_GOALS.map(goal =>
              React.createElement(
                'button',
                {
                  key: goal.id,
                  onClick: () => setSelectedGoal(goal),
                  className: `p-3 rounded-lg border transition-all ${
                    selectedGoal?.id === goal.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 bg-panel-bg hover:border-primary/40'
                  }`
                },
                React.createElement('span', { className: 'text-lg mr-2' }, goal.icon),
                React.createElement('span', { className: 'text-sm font-medium' }, goal.name)
              )
            )
          ),
          selectedGoal && React.createElement(
            'button',
            {
              onClick: handleGenerateCampaigns,
              disabled: generatingCampaign,
              className: 'mt-4 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:shadow-glow'
            },
            generatingCampaign ? 'Generating...' : 'Generate Campaign Concepts'
          )
        )
      ),

      // Campaigns Tab
      activeTab === 'campaigns' && campaigns.length > 0 && React.createElement(
        'div',
        null,
        React.createElement(
          'h2',
          { className: 'text-lg font-bold mb-4' },
          'Campaign Concepts'
        ),
        React.createElement(
          'div',
          { className: 'space-y-4 mb-6' },
          campaigns.map(campaign =>
            React.createElement(
              'div',
              { key: campaign.id, className: 'p-4 bg-panel-bg rounded-lg border border-white/10' },
              React.createElement('h3', { className: 'font-bold mb-1' }, campaign.title),
              React.createElement('p', { className: 'text-white/60 text-sm mb-3' }, campaign.description),
              React.createElement(
                'div',
                { className: 'flex gap-2' },
                React.createElement(
                  'select',
                  {
                    value: selectedPlatform?.id || '',
                    onChange: (e) => setSelectedPlatform(PLATFORMS.find(p => p.id === e.target.value)),
                    className: 'flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm'
                  },
                  React.createElement('option', { value: '' }, 'Select Platform'),
                  PLATFORMS.map(p =>
                    React.createElement('option', { key: p.id, value: p.id }, p.name)
                  )
                ),
                React.createElement(
                  'button',
                  {
                    onClick: () => handleGenerateCreative(campaign),
                    disabled: !selectedPlatform || generatingCreative,
                    className: `px-4 py-2 rounded font-medium text-sm ${
                      selectedPlatform && !generatingCreative
                        ? 'bg-primary text-black' 
                        : 'bg-white/5 text-white/40'
                    }`
                  },
                  generatingCreative ? '...' : 'Generate'
                )
              )
            )
          )
        )
      ),

      // Photo Studio Tab
      activeTab === 'photo-studio' && React.createElement(
        'div',
        null,
        React.createElement(
          'h2',
          { className: 'text-lg font-bold mb-4' },
          'Product Photography Studio'
        ),
        React.createElement(
          'div',
          { className: 'mb-6' },
          React.createElement(
            'h3',
            { className: 'text-sm font-medium text-white/60 mb-3' },
            'Photo Styles'
          ),
          React.createElement(
            'div',
            { className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2' },
            PHOTO_STYLES.map(style =>
              React.createElement(
                'button',
                {
                  key: style.id,
                  onClick: () => setSelectedStyle(style),
                  className: `p-3 rounded-lg border transition-all ${
                    selectedStyle?.id === style.id
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 bg-panel-bg hover:border-primary/40'
                  }`
                },
                React.createElement('div', { className: 'text-sm font-medium' }, style.name),
                React.createElement('div', { className: 'text-xs text-white/40' }, style.category)
              )
            )
          )
        ),
        selectedStyle && React.createElement(
          'button',
          {
            onClick: () => handleGenerateProductPhoto(creatives.filter(c => c.url).map(c => c.url)),
            disabled: isGenerating || !apiKey,
            className: `px-6 py-3 rounded-lg font-bold ${
              apiKey && !isGenerating
                ? 'bg-primary text-black hover:shadow-glow'
                : 'bg-white/5 text-white/40'
            }`
          },
          isGenerating ? 'Generating...' : 'Generate Product Photo'
        )
      ),

      // Animate Tab
      activeTab === 'animate' && React.createElement(
        'div',
        null,
        React.createElement(
          'h2',
          { className: 'text-lg font-bold mb-4' },
          'Animate Assets to Video'
        ),
        React.createElement(
          'p',
          { className: 'text-white/60 mb-4' },
          'Generate 3-12 second videos from images using AI'
        ),
        creatives.filter(c => c.url).length > 0 ?
          React.createElement(
            'div',
            { className: 'grid grid-cols-3 gap-4' },
            creatives.filter(c => c.url).map((creative, idx) =>
              React.createElement(
                'div',
                { key: idx, className: 'group relative bg-panel-bg rounded-lg overflow-hidden border border-white/5' },
                React.createElement('img', {
                  src: creative.url,
                  alt: 'Asset',
                  className: 'w-full aspect-square object-cover'
                }),
                React.createElement(
                  'button',
                  {
                    onClick: () => handleAnimateAsset(creative.url),
                    className: 'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium'
                  },
                  'Animate to Video'
                )
              )
            )
          ) :
          React.createElement(
            'p',
            { className: 'text-white/40 text-sm' },
            'Generate assets in the Campaigns or Photo Studio tabs first to animate them'
          )
      ),

      // Error display
      error && React.createElement(
        'div',
        { className: 'fixed bottom-6 right-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 max-w-sm' },
        error
      )
    )
  );
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';