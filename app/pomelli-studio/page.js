'use client';

import React, { useState, useEffect } from 'react';
import {
  analyzeWebsite,
  extractBrandDNA,
  generateCampaignConcepts,
  generatePlatformCreative,
  generateProductPhotography,
  generateShortVideo,
  saveBrandProject,
  listBrandProjects
} from '../../src/apps/open-pomelli/services/pomelliService';

const POMELLI_STEPS = {
  INPUT: 'input',
  DNA: 'dna',
  CAMPAIGNS: 'campaigns',
  PHOTO_STUDIO: 'photo-studio',
  ANIMATE: 'animate'
};

export default function PomelliStudio() {
  const [step, setStep] = useState(POMELLI_STEPS.INPUT);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandDNA, setBrandDNA] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [photoPrompt, setPhotoPrompt] = useState('');
  const [animatePrompt, setAnimatePrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoResult, setPhotoResult] = useState(null);
  const [videoResult, setVideoResult] = useState(null);
  const [apiKey, setApiKey] = useState('');

  const goals = [
    { id: 'product-launch', name: 'Product Launch' },
    { id: 'lead-gen', name: 'Lead Generation' },
    { id: 'awareness', name: 'Awareness' },
    { id: 'engagement', name: 'Engagement' },
    { id: 'thought-leadership', name: 'Thought Leadership' },
    { id: 'sales', name: 'Sales' }
  ];

  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl) return;
    
    setIsProcessing(true);
    try {
      const data = await analyzeWebsite(websiteUrl);
      const dna = await extractBrandDNA(data);
      setBrandDNA(dna);
      setStep(POMELLI_STEPS.DNA);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateCampaigns = async (goal) => {
    if (!brandDNA) return;
    
    setIsProcessing(true);
    try {
      const concepts = await generateCampaignConcepts(null, goal, '');
      setCampaigns(concepts);
      setStep(POMELLI_STEPS.CAMPAIGNS);
    } catch (err) {
      console.error('Campaign generation failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePhoto = async () => {
    if (!photoPrompt) return;
    
    setIsProcessing(true);
    try {
      const key = apiKey || import.meta.env.VITE_MUAPI_KEY;
      const result = await generateProductPhotography(photoPrompt, []);
      setPhotoResult(result);
    } catch (err) {
      console.error('Photo generation failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!animatePrompt) return;
    
    setIsProcessing(true);
    try {
      const key = apiKey || import.meta.env.VITE_MUAPI_KEY;
      const result = await generateShortVideo(animatePrompt, null);
      setVideoResult(result);
    } catch (err) {
      console.error('Video generation failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderInput = () => React.createElement('div', { className: 'p-6' },
    React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Brand DNA Extraction'),
    React.createElement('p', { className: 'text-sm text-white/60 mb-4' }, 
      'Paste any website URL to extract its brand DNA and generate on-brand assets'
    ),
    React.createElement('div', { className: 'mb-4' },
      React.createElement('label', { className: 'text-xs text-white/40 block mb-2' }, 'Website URL'),
      React.createElement('input', {
        type: 'url',
        value: websiteUrl,
        onChange: (e) => setWebsiteUrl(e.target.value),
        placeholder: 'https://example.com',
        className: 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3'
      })
    ),
    React.createElement('button', {
      onClick: handleAnalyzeWebsite,
      disabled: !websiteUrl || isProcessing,
      className: 'w-full py-3 bg-[#d9ff00] text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50'
    }, isProcessing ? 'Analyzing...' : 'Analyze Website')
  );

  const renderDNA = () => React.createElement('div', { className: 'p-6' },
    React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Brand DNA'),
    brandDNA && React.createElement('div', { className: 'space-y-3 mb-6' },
      React.createElement('div', null,
        React.createElement('span', { className: 'text-xs text-white/40' }, 'Colors: '),
        brandDNA.colors?.map((color, i) => 
          React.createElement('span', { 
            key: i, 
            className: 'inline-block w-6 h-6 rounded ml-1',
            style: { backgroundColor: color }
          })
        )
      ),
      React.createElement('div', null,
        React.createElement('span', { className: 'text-xs text-white/40' }, 'Tone: '),
        React.createElement('span', { className: 'text-sm' }, brandDNA.tone?.join(', '))
      ),
      React.createElement('div', null,
        React.createElement('span', { className: 'text-xs text-white/40' }, 'Personality: '),
        React.createElement('span', { className: 'text-sm' }, brandDNA.personality?.join(', '))
      )
    ),
    React.createElement('h3', { className: 'font-medium mb-2' }, 'Campaign Goals'),
    React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
      goals.map(goal => 
        React.createElement('button', {
          key: goal.id,
          onClick: () => handleGenerateCampaigns(goal.id),
          disabled: isProcessing,
          className: 'p-3 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10'
        }, goal.name)
      )
    ),
    React.createElement('div', { className: 'mt-6 border-t border-white/10 pt-4' },
      React.createElement('button', {
        onClick: () => setStep(POMELLI_STEPS.PHOTO_STUDIO),
        className: 'w-full py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20'
      }, 'Photo Studio →')
    )
  );

  const renderPhotoStudio = () => React.createElement('div', { className: 'p-6' },
    React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Product Photography'),
    React.createElement('p', { className: 'text-sm text-white/60 mb-4' },
      'Generate 30+ product photography styles with AI'
    ),
    React.createElement('div', { className: 'mb-4' },
      React.createElement('label', { className: 'text-xs text-white/40 block mb-2' }, 'Photo Prompt'),
      React.createElement('textarea', {
        value: photoPrompt,
        onChange: (e) => setPhotoPrompt(e.target.value),
        placeholder: 'A sleek luxury watch on black marble, studio lighting...',
        className: 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-24 resize-none'
      })
    ),
    React.createElement('button', {
      onClick: handleGeneratePhoto,
      disabled: !photoPrompt || isProcessing,
      className: 'w-full py-3 bg-[#d9ff00] text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50 mb-4'
    }, isProcessing ? 'Generating...' : 'Generate Photo'),
    
    photoResult && React.createElement('div', { className: 'mt-4' },
      React.createElement('img', { 
        src: photoResult.url, 
        alt: 'Generated photo', 
        className: 'w-full rounded-lg' 
      })
    ),
    
    React.createElement('div', { className: 'mt-6 border-t border-white/10 pt-4' },
      React.createElement('button', {
        onClick: () => setStep(POMELLI_STEPS.ANIMATE),
        className: 'w-full py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20'
      }, 'Animate → →')
    )
  );

  const renderAnimate = () => React.createElement('div', { className: 'p-6' },
    React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Animate to Video'),
    React.createElement('p', { className: 'text-sm text-white/60 mb-4' },
      'Turn any image into a 3-12 second video'
    ),
    React.createElement('div', { className: 'mb-4' },
      React.createElement('label', { className: 'text-xs text-white/40 block mb-2' }, 'Animation Prompt'),
      React.createElement('textarea', {
        value: animatePrompt,
        onChange: (e) => setAnimatePrompt(e.target.value),
        placeholder: 'Cinematic zoom in with film grain...',
        className: 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-24 resize-none'
      })
    ),
    React.createElement('button', {
      onClick: handleGenerateVideo,
      disabled: !animatePrompt || isProcessing,
      className: 'w-full py-3 bg-[#d9ff00] text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50 mb-4'
    }, isProcessing ? 'Animating...' : 'Generate Video'),
    
    videoResult && React.createElement('div', { className: 'mt-4' },
      React.createElement('video', { 
        src: videoResult.url, 
        controls: true, 
        className: 'w-full rounded-lg' 
      })
    )
  );

  return React.createElement('div', { className: 'w-full h-full flex flex-col bg-[#030303] text-white' },
    React.createElement('div', { className: 'p-6 border-b border-white/10' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Open Pomelli'),
      React.createElement('p', { className: 'text-sm text-white/60' }, 'Brand DNA, Campaigns, Photo Studio, Animate')
    ),
    
    step === POMELLI_STEPS.INPUT && renderInput(),
    step === POMELLI_STEPS.DNA && renderDNA(),
    step === POMELLI_STEPS.CAMPAIGNS && campaigns.length > 0 && React.createElement('div', { className: 'p-6' },
      React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Campaign Concepts'),
      React.createElement('div', { className: 'space-y-3' },
        campaigns.map(campaign => 
          React.createElement('div', { 
            key: campaign.id, 
            className: 'bg-white/5 border border-white/10 rounded-lg p-4' 
          },
            React.createElement('h3', { className: 'font-bold' }, campaign.title),
            React.createElement('p', { className: 'text-sm text-white/60' }, campaign.description)
          )
        )
      )
    ),
    step === POMELLI_STEPS.PHOTO_STUDIO && renderPhotoStudio(),
    step === POMELLI_STEPS.ANIMATE && renderAnimate()
  );
}