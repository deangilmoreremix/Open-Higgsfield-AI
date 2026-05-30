'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { appManifest } from './manifest';
import { generateVideoEffect } from '../../../lib/muapi.js';
import { securityService } from '../../../lib/services/SecurityService.js';
import { saveOutputToLibrary, handoffOutput } from './services/vfxService.js';

const VFX_CATEGORIES = {
  'AI Effects': {
    effects: [
      { name: 'Kiss Me AI', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Kiss_Me_AI.webp' },
      { name: 'Kiss', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Kiss.webp' },
      { name: 'Venom', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Venom.webp' },
      { name: 'Hulk', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Hulk_.webp' },
      { name: 'Muscle Surge', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Muscle_Surge.webp' },
      { name: 'The Tiger Touch', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/The_Tiger_Touch.webp' },
      { name: 'Anything, Robot', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Anything_Robot.webp' },
      { name: 'Warmth of Jesus', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Warmth_of_Jesus.webp' },
      { name: 'Holy Wings', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Holy_Wings.webp' },
      { name: 'Microwave', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Microwave.webp' },
    ],
    icon: '⭐'
  },
  'Motion Controls': {
    effects: [
      { name: '360 Orbit', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/360+Orbit.webp', trigger_word: '0rb4it 360 degree orbit', input_type: 'i2v' },
      { name: 'Hero Run', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Action+Run.webp', trigger_word: '4ct3ion Action Run', input_type: 'i2v' },
      { name: 'Arc Shot', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Arc.webp', trigger_word: '34Ar2c arc the camera moves in a smooth curve around', input_type: 'i2v' },
      { name: 'Matrix Shot', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Bullet+Time.webp', trigger_word: 'b4ll3t t1m3 bullet time shot', input_type: 'i2v' },
      { name: 'Car Chase', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Car+Chasing.webp', trigger_word: 'c4r ch4s3 car chase', input_type: 'i2v' },
      { name: 'Crane Down', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Crane+Down.webp', trigger_word: 'cr4n3 crane down camera motion', input_type: 'i2v' },
      { name: 'Crane Overhead', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Crane+Over+The+Head.webp', trigger_word: 'cr4n3 crane over the head movement', input_type: 'i2v' },
      { name: 'Crane Up', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Crane+Up.webp', trigger_word: 'cr4n3 crane up effect', input_type: 'i2v' },
      { name: 'Crash Zoom In', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Crash+Zoom+In.webp', trigger_word: 'cr34sh crash zoom in effect', input_type: 'i2v' },
      { name: 'Crash Zoom Out', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Crash+Zoom+Out.webp', trigger_word: 'cr34sh crash zoom out effect', input_type: 'i2v' },
    ],
    icon: '🎬'
  },
  'VFX': {
    effects: [
      { name: 'Levitate', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Levitation.webp', trigger_word: 'lev1tate2_it0 levitate effect', input_type: 'i2v' },
      { name: 'Disintegration', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Disintegration.webp', trigger_word: 'd1s1nt34gration disintegration effect', input_type: 'i2v' },
      { name: 'Flying', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Flying.webp', trigger_word: 'f1y1ng smooth gliding flight', input_type: 'i2v' },
      { name: 'Car Explosion', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Car+Explosion.webp', trigger_word: 'c3r exp356l0sion the car explodes bursting into flames and debris', input_type: 'i2v' },
      { name: 'Tornado', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Tornado.webp', trigger_word: 't0r54d0 realistic tornado', input_type: 't2v' },
      { name: 'Electricity', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Electricity.webp', trigger_word: 'e13c7r1c electricity effect', input_type: 'i2v' },
      { name: 'Huge Explosion', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Huge+Explosion.webp', trigger_word: '3xp105ion huge explosion', input_type: 'i2v' },
      { name: 'Decay Time-Lapse', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Decay+Time-Lapse.webp', trigger_word: 'd3c4y decay time-lapse begins', input_type: 'i2v' },
      { name: 'Tsunami', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Tsunami.webp', trigger_word: 't5un@m1 realistic tsunami', input_type: 't2v' },
      { name: 'Fire', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Fire.webp', trigger_word: '[r3al_f1re]', input_type: 't2v' },
      { name: 'Robotic Face Reveal', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Robotic+Face+Reveal.webp', trigger_word: 'r8b8t1c robotic face reveal', input_type: 'i2v' },
      { name: 'Building Explosion', url: 'https://d3adwkbyhxyrtq.cloudfront.net/motioncontrols/Building+Explosion.webp', trigger_word: 'b32ldi4ng exp39lsion the building explodes in a massive blast', input_type: 'i2v' },
    ],
    icon: '⭐'
  },
  'Pika Effects': {
    effects: [
      { name: 'Explode', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Explode.webp' },
      { name: 'Melt', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Melt.webp' },
      { name: 'Dissolve', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Dissolve.webp' },
      { name: 'Poke', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Poke.webp' },
      { name: 'Ta-da', effect: 'https://d3adwkbyhxyrtq.cloudfront.net/webassets/ai_effects/Ta-da.webp' },
    ],
    icon: '⚡'
  }
};

export default function AIVFXStudioApp() {
  const [activeCategory, setActiveCategory] = useState('AI Effects');
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedAspect, setSelectedAspect] = useState('9:16');
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [selectedResolution, setSelectedResolution] = useState('480p');
  const [selectedQuality, setSelectedQuality] = useState('medium');
  const [status, setStatus] = useState('idle');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => key && setApiKey(key));
  }, []);

  const isValidFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
    return validTypes.includes(file.type);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && isValidFile(file)) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const startGeneration = async () => {
    if (!selectedEffect) {
      setError('Please select an effect first.');
      return;
    }

    const key = await securityService.getDecryptedKey();
    if (!key) {
      setError('Please enter your MuAPI API key in Settings.');
      return;
    }

    if (!imageUrl && !uploadedFile) {
      setError('Please upload an image or provide an image URL.');
      return;
    }

    setStatus('submitting');
    setError('');
    setVideoUrl('');

    try {
      const payload = {
        prompt: inputText || `Apply ${selectedEffect.name} effect`,
        image_url: imageUrl,
        name: selectedEffect.name,
        aspect_ratio: selectedAspect,
        quality: selectedQuality,
        duration: selectedDuration,
        apiKey: key
      };

      const result = await generateVideoEffect(payload);

      if (result.url || result.output?.[0]) {
        setStatus('completed');
        setVideoUrl(result.url || result.output[0]);
      } else {
        throw new Error('No video URL in response');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setStatus('error');
      setError(err.message);
    }
  };

  const handleEffectSelect = (effect) => {
    setSelectedEffect(effect);
  };

  const handleImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && /^https?:\/\//.test(url)) {
      setImageUrl(url);
    }
  };

  const closeModal = () => {
    setStatus('idle');
    setError('');
    setVideoUrl('');
  };

  const handleHandoff = (output) => {
    handoffOutput('library', { url: output, name: selectedEffect?.name });
  };

  const categoryNames = Object.keys(VFX_CATEGORIES);
  const currentCategory = VFX_CATEGORIES[activeCategory];

  return React.createElement(
    'div',
    { className: 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white' },
    
    // Header
    React.createElement(
      'div',
      { className: 'px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto' },
      React.createElement(
        'h1',
        { className: 'text-3xl md:text-5xl font-black text-white tracking-tight mb-3' },
        'AI-VFX Studio'
      ),
      React.createElement(
        'p',
        { className: 'text-secondary text-sm md:text-base max-w-xl' },
        'Apply AI-powered visual effects and transformations to your videos and images with 37 cinematic effects.'
      )
    ),

    // Category tabs
    React.createElement(
      'div',
      { className: 'flex items-center gap-2 px-4 md:px-8 mb-6 overflow-x-auto pb-2' },
      categoryNames.map((name) => {
        const cat = VFX_CATEGORIES[name];
        return React.createElement(
          'button',
          {
            key: name,
            onClick: () => {
              setActiveCategory(name);
              setSelectedEffect(null);
            },
            className: `category-btn px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === name 
                ? 'bg-primary text-white' 
                : 'bg-white/5 text-secondary hover:bg-white/10'
            }`
          },
          cat.icon,
          ' ',
          name
        );
      })
    ),

    // Effects grid
    React.createElement(
      'div',
      { className: 'px-4 md:px-8 mb-8' },
      React.createElement(
        'div',
        { className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 effects-grid' },
        currentCategory.effects.map((effect, idx) =>
          React.createElement(
            'div',
            {
              key: idx,
              onClick: () => handleEffectSelect(effect),
              className: `effect-card bg-panel-bg rounded-xl overflow-hidden border cursor-pointer transition-all ${
                selectedEffect?.name === effect.name
                  ? 'border-primary bg-primary/10'
                  : 'border-white/5 hover:border-primary/40'
              }`
            },
            React.createElement(
              'div',
              { className: 'relative w-full aspect-square' },
              React.createElement('img', {
                src: effect.effect || effect.url,
                alt: effect.name,
                className: 'w-full h-full object-cover'
              }),
              React.createElement(
                'div',
                { className: 'absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity' },
                React.createElement(
                  'div',
                  { className: 'w-8 h-8 bg-primary rounded-full flex items-center justify-center' },
                  React.createElement('svg', {
                    width: '18',
                    height: '18',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'white',
                    strokeWidth: '2'
                  },
                  React.createElement('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' })
                  )
                )
              )
            )
          )
        )
      )
    ),

    // Controls panel
    React.createElement(
      'div',
      { className: 'fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl z-20' },
      React.createElement(
        'div',
        { className: 'bg-panel-bg/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 mx-4' },
        
        // Selected effect display
        selectedEffect && React.createElement(
          'div',
          { className: 'flex items-center gap-3 mb-4 bg-primary/10 rounded-lg p-3' },
          React.createElement('img', {
            src: selectedEffect.effect || selectedEffect.url,
            alt: selectedEffect.name,
            className: 'w-10 h-10 rounded-lg object-cover'
          }),
          React.createElement(
            'div',
            { className: 'flex-1' },
            React.createElement('p', { className: 'text-white font-medium text-sm' }, selectedEffect.name)
          )
        ),

        // Input row
        React.createElement(
          'div',
          { className: 'flex items-center gap-3 mb-4' },
          React.createElement('input', {
            type: 'text',
            placeholder: 'Enter your prompt (optional)...',
            value: inputText,
            onChange: (e) => setInputText(e.target.value),
            className: 'flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-secondary outline-none focus:border-primary'
          }),
          React.createElement(
            'button',
            {
              onClick: handleImageUrl,
              className: 'image-url-btn bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium'
            },
            'Add Image'
          )
        ),

        // Settings row
        React.createElement(
          'div',
          { className: 'grid grid-cols-2 md:grid-cols-4 gap-3 mb-4' },
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'text-xs text-secondary mb-1 block' }, 'Aspect Ratio'),
            React.createElement('select', {
              value: selectedAspect,
              onChange: (e) => setSelectedAspect(e.target.value),
              className: 'w-full bg-panel-bg border border-white/10 rounded-lg px-3 py-2 text-white text-sm'
            },
              React.createElement('option', { value: '9:16' }, '9:16'),
              React.createElement('option', { value: '16:9' }, '16:9'),
              React.createElement('option', { value: '1:1' }, '1:1')
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'text-xs text-secondary mb-1 block' }, 'Duration'),
            React.createElement('select', {
              value: selectedDuration,
              onChange: (e) => setSelectedDuration(parseInt(e.target.value)),
              className: 'w-full bg-panel-bg border border-white/10 rounded-lg px-3 py-2 text-white text-sm'
            },
              React.createElement('option', { value: '3' }, '3s'),
              React.createElement('option', { value: '5' }, '5s'),
              React.createElement('option', { value: '10' }, '10s')
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'text-xs text-secondary mb-1 block' }, 'Resolution'),
            React.createElement('select', {
              value: selectedResolution,
              onChange: (e) => setSelectedResolution(e.target.value),
              className: 'w-full bg-panel-bg border border-white/10 rounded-lg px-3 py-2 text-white text-sm'
            },
              React.createElement('option', { value: '480p' }, '480p'),
              React.createElement('option', { value: '720p' }, '720p')
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'text-xs text-secondary mb-1 block' }, 'Quality'),
            React.createElement('select', {
              value: selectedQuality,
              onChange: (e) => setSelectedQuality(e.target.value),
              className: 'w-full bg-panel-bg border border-white/10 rounded-lg px-3 py-2 text-white text-sm'
            },
              React.createElement('option', { value: 'medium' }, 'Medium'),
              React.createElement('option', { value: 'high' }, 'High')
            )
          )
        ),

        // Upload area
        React.createElement(
          'div',
          {
            className: `upload-area border-2 border-dashed rounded-xl p-6 text-center mb-4 cursor-pointer transition-all ${
              dragActive ? 'border-primary bg-primary/5' : 'border-white/10'
            }`
          },
          React.createElement('input', {
            type: 'file',
            accept: 'image/*,video/*',
            onChange: handleFileChange,
            className: 'hidden file-input'
          }),
          React.createElement(
            'div',
            { onClick: () => document.querySelector('.file-input')?.click() },
            React.createElement('p', { className: 'text-secondary text-sm' }, 'Drag & drop an image here, or click to browse')
          )
        ),

        // Generate button
        React.createElement(
          'button',
          {
            onClick: startGeneration,
            disabled: status === 'submitting',
            className: 'generate-btn w-full bg-primary text-black py-3 rounded-xl font-black text-lg hover:shadow-glow transition-all'
          },
          status === 'submitting' ? 'Generating...' : 'Generate VFX'
        )
      )
    ),

    // Modal
    status !== 'idle' && React.createElement(
      'div',
      { className: 'vfx-modal fixed inset-0 bg-black/50 flex items-center justify-center z-50' },
      React.createElement(
        'div',
        { className: 'bg-panel-bg rounded-xl p-6 max-w-md w-full mx-4' },
        status === 'submitting' ?
          React.createElement(
            'div',
            { className: 'text-center' },
            React.createElement('div', { className: 'animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4' }),
            React.createElement('p', { className: 'text-white font-medium' }, 'Generating your VFX...'),
            React.createElement('p', { className: 'text-secondary text-sm mt-2' }, 'This may take 30-60 seconds')
          ) :
          status === 'completed' && videoUrl ?
            React.createElement(
              'div',
              null,
              React.createElement(
                'div',
                { className: 'flex justify-between items-center mb-4' },
                React.createElement('h3', { className: 'text-lg font-semibold' }, 'Your VFX is Ready!'),
                React.createElement('button', { onClick: closeModal, className: 'close-modal text-secondary hover:text-white text-xl' }, '×')
              ),
              React.createElement('video', { src: videoUrl, controls: true, className: 'w-full h-48 object-cover rounded-lg mb-4' }),
              React.createElement(
                'div',
                { className: 'flex gap-2' },
                React.createElement('a', { href: videoUrl, download: true, className: 'flex-1 bg-primary text-white py-2 px-4 rounded-lg text-center font-medium' }, 'Download'),
                React.createElement('button', { onClick: () => { handleHandoff(videoUrl); closeModal(); }, className: 'flex-1 bg-panel-bg text-white py-2 px-4 rounded-lg border border-white/10' }, 'Send to Library'),
                React.createElement('button', { onClick: closeModal, className: 'flex-1 bg-panel-bg text-white py-2 px-4 rounded-lg border border-white/10' }, 'Close')
              )
            ) :
            status === 'error' ?
              React.createElement(
                'div',
                null,
                React.createElement(
                  'div',
                  { className: 'flex justify-between items-center mb-4' },
                  React.createElement('h3', { className: 'text-lg font-semibold text-red-400' }, 'Generation Failed'),
                  React.createElement('button', { onClick: closeModal, className: 'close-modal text-secondary hover:text-white text-xl' }, '×')
                ),
                React.createElement('p', { className: 'text-secondary text-sm mb-4' }, error),
                React.createElement(
                  'button',
                  { onClick: () => { setStatus('idle'); setError(''); startGeneration(); }, className: 'w-full bg-primary text-white py-2 px-4 rounded-lg font-medium' },
                  'Retry'
                )
              ) : null
      )
    )
  );
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';