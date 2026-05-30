'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { appManifest } from './manifest';
import { uploadSourcePhoto, listHeadshotPresets, generateHeadshot, generateHeadshotBatch, saveOutputToLibrary, handoffHeadshotOutput } from './services/headshotService.js';
import { securityService } from '../../../lib/services/SecurityService.js';

const PRESET_CATEGORIES = [
  { id: 'professional', name: 'Professional', icon: '💼' },
  { id: 'creative', name: 'Creative', icon: '🎨' },
  { id: 'linkedin', name: 'LinkedIn', icon: '🔗' },
  { id: 'executive', name: 'Executive', icon: '👔' },
  { id: 'casual', name: 'Casual', icon: '😎' },
];

export default function AIHeadshotGeneratorApp() {
  const [sourcePhoto, setSourcePhoto] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('professional');
  const [generatedHeadshots, setGeneratedHeadshots] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
    });
  }, []);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const key = await securityService.getDecryptedKey();
    if (!key) {
      setError('Please set your MuAPI API key in Settings first');
      return;
    }

    try {
      const photo = await uploadSourcePhoto(file);
      setSourcePhoto(photo);
      setSourcePreview(URL.createObjectURL(file));
    } catch (err) {
      setError('Upload failed: ' + err.message);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!sourcePhoto || !selectedPreset) return;
    if (!apiKey) {
      setError('API key not configured');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const headshots = await generateHeadshotBatch(apiKey, sourcePhoto, [selectedPreset]);
      setGeneratedHeadshots(headshots);
      
      const successful = headshots.filter(h => h.url);
      for (const headshot of successful) {
        await saveOutputToLibrary(headshot);
      }
    } catch (err) {
      setError('Generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  }, [sourcePhoto, selectedPreset, apiKey]);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
  };

  const handleClearSource = () => {
    setSourcePhoto(null);
    setSourcePreview(null);
  };

  const handleHandoff = (headshot) => {
    handoffHeadshotOutput('library', headshot);
  };

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

    // Main content
    React.createElement(
      'div',
      { className: 'flex-1 p-6 overflow-y-auto' },
      
      // Source upload section
      React.createElement(
        'div',
        { className: 'mb-8' },
        React.createElement(
          'h2',
          { className: 'text-sm font-medium text-white/60 mb-3 uppercase' },
          'Source Photo'
        ),
        sourcePreview ?
          React.createElement(
            'div',
            { className: 'relative inline-block' },
            React.createElement('img', {
              src: sourcePreview,
              alt: 'Source',
              className: 'w-32 h-32 object-cover rounded-lg border border-white/10'
            }),
            React.createElement(
              'button',
              {
                onClick: handleClearSource,
                className: 'absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full text-black font-bold text-xs hover:scale-110 transition-transform'
              },
              '×'
            )
          ) :
          React.createElement(
            'label',
            { className: 'flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-primary transition-colors' },
            React.createElement('input', {
              type: 'file',
              accept: 'image/*',
              onChange: handleFileSelect,
              className: 'hidden'
            }),
            React.createElement(
              'svg',
              { className: 'w-8 h-8 text-white/40 mb-2', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' }),
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15 13a3 3 0 11-6 0 3 3 0 016 0z' })
            ),
            React.createElement('span', { className: 'text-xs text-white/60' }, 'Upload Photo')
          )
      ),

      // Preset selection
      React.createElement(
        'div',
        { className: 'mb-8' },
        React.createElement(
          'h2',
          { className: 'text-sm font-medium text-white/60 mb-3 uppercase' },
          'Style Preset'
        ),
        React.createElement(
          'div',
          { className: 'flex flex-wrap gap-2 mb-4' },
          Object.entries(PRESET_CATEGORIES).map(([id, cat]) =>
            React.createElement(
              'button',
              {
                key: id,
                onClick: () => setSelectedCategory(id),
                className: `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === id 
                    ? 'bg-primary text-black' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`
              },
              cat.icon,
              ' ',
              cat.name
            )
          )
        ),
        selectedPreset &&
          React.createElement(
            'div',
            { className: 'p-3 bg-primary/10 rounded-lg border border-primary/20 inline-block' },
            React.createElement('span', { className: 'text-primary font-medium' }, selectedPreset.name)
          )
      ),

      // Generate button
      React.createElement(
        'button',
        {
          onClick: handleGenerate,
          disabled: !sourcePhoto || !selectedPreset || isGenerating,
          className: `px-6 py-3 rounded-lg font-bold text-lg transition-all ${
            sourcePhoto && selectedPreset && !isGenerating
              ? 'bg-primary text-black hover:shadow-glow'
              : 'bg-white/5 text-white/40 cursor-not-allowed'
          }`
        },
        isGenerating ? 'Generating...' : 'Generate Headshots'
      ),

      // Error display
      error && React.createElement(
        'div',
        { className: 'mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400' },
        error
      ),

      // Results gallery
      generatedHeadshots.length > 0 &&
        React.createElement(
          'div',
          { className: 'mt-8' },
          React.createElement(
            'h2',
            { className: 'text-sm font-medium text-white/60 mb-3 uppercase' },
            'Generated Headshots'
          ),
          React.createElement(
            'div',
            { className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' },
            generatedHeadshots.map((headshot, idx) =>
              headshot.url ?
                React.createElement(
                  'div',
                  { key: idx, className: 'group relative bg-panel-bg rounded-lg overflow-hidden border border-white/5' },
                  React.createElement('img', {
                    src: headshot.url,
                    alt: `Headshot ${idx + 1}`,
                    className: 'w-full aspect-square object-cover'
                  }),
                  React.createElement(
                    'div',
                    { className: 'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2' },
                    React.createElement(
                      'a',
                      { href: headshot.url, download: true, className: 'px-3 py-1 bg-primary rounded text-black font-medium text-xs' },
                      'Download'
                    ),
                    React.createElement(
                      'button',
                      {
                        onClick: () => handleHandoff(headshot),
                        className: 'px-3 py-1 bg-white/10 rounded text-white font-medium text-xs hover:bg-white/20'
                      },
                      'Send to Studio'
                    )
                  )
                ) :
                React.createElement(
                  'div',
                  { key: idx, className: 'p-4 bg-red-500/10 rounded-lg border border-red-500/20' },
                  React.createElement('p', { className: 'text-red-400 text-sm' }, headshot.error || 'Generation failed')
                )
            )
          )
        )
    )
  );
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';