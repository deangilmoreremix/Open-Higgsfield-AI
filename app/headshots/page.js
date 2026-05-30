'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  uploadSourcePhoto, 
  listHeadshotPresets, 
  generateHeadshot, 
  generateHeadshotBatch,
  saveHeadshot,
  saveOutputToLibrary,
  handoffHeadshotOutput 
} from '../../src/apps/ai-headshot-generator/services/headshotService.js';
import { securityService } from '../../src/lib/services/SecurityService.js';

const UPLOAD_STATE = { IDLE: 'idle', UPLOADING: 'uploading', READY: 'ready' };

export default function HeadshotStudio() {
  const [uploadState, setUploadState] = useState(UPLOAD_STATE.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sourcePhoto, setSourcePhoto] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [apiKey, setApiKey] = useState(null);
  
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    listHeadshotPresets().then(setPresets).catch(() => setPresets([]));
    securityService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
    });
  }, []);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    setUploadState(UPLOAD_STATE.UPLOADING);
    setUploadProgress(0);
    
    try {
      const photo = await uploadSourcePhoto(file);
      setSourcePhoto(photo);
      setPhotoName(file.name);
      setUploadState(UPLOAD_STATE.READY);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadState(UPLOAD_STATE.IDLE);
    }
  };

  const handleGenerate = async () => {
    if (!sourcePhoto || !selectedPreset) return;
    
    const key = apiKey || import.meta.env.VITE_MUAPI_KEY;
    if (!key) {
      alert('Please set your MuAPI API key in Settings first');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await generateHeadshot(key, sourcePhoto, selectedPreset);
      const output = { ...result, preset: selectedPreset.id, prompt: selectedPreset.prompt };
      
      setBatchResults(prev => [output, ...prev]);
      await saveHeadshot(output);
      await saveOutputToLibrary(output);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (!sourcePhoto || presets.length === 0) return;
    
    const key = apiKey || import.meta.env.VITE_MUAPI_KEY;
    if (!key) {
      alert('Please set your MuAPI API key in Settings first');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const results = await generateHeadshotBatch(key, sourcePhoto, presets);
      setBatchResults(results);
      
      for (const r of results) {
        if (!r.error) {
          await saveHeadshot(r);
          await saveOutputToLibrary(r);
        }
      }
    } catch (err) {
      console.error('Batch generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return React.createElement('div', { className: 'w-full h-full flex flex-col bg-[#030303] text-white' },
    React.createElement('div', { className: 'p-6 border-b border-white/10' },
      React.createElement('h1', { className: 'text-2xl font-bold mb-2' }, 'AI Headshot Generator'),
      React.createElement('p', { className: 'text-white/60 text-sm' }, 'Transform your photos into professional headshots with AI')
    ),
    
    React.createElement('div', { className: 'flex-1 flex overflow-hidden' },
      React.createElement('div', { className: 'w-80 border-r border-white/10 p-4 overflow-y-auto' },
        React.createElement('div', { className: 'mb-4' },
          apiKey && React.createElement('div', { className: 'text-xs text-primary' }, '✓ API Key Configured')
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('div', { 
            className: 'border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-white/20',
            onClick: () => fileInputRef.current?.click()
          },
            uploadState === UPLOAD_STATE.READY 
              ? React.createElement('img', { 
                  src: sourcePhoto?.url, 
                  alt: 'Preview', 
                  className: 'max-w-full max-h-40 mx-auto rounded-lg' 
                })
              : React.createElement('div', null,
                  React.createElement('svg', { 
                    className: 'w-10 h-10 mx-auto mb-2 text-white/40',
                    fill: 'none', 
                    stroke: 'currentColor', 
                    viewBox: '0 0 24 24' 
                  },
                    React.createElement('path', { 
                      strokeLinecap: 'round', 
                      strokeLinejoin: 'round', 
                      strokeWidth: 2, 
                      d: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' 
                    })
                  ),
                  React.createElement('p', { className: 'text-sm text-white/60' }, 'Upload photo')
                )
          ),
          React.createElement('input', {
            ref: fileInputRef,
            type: 'file',
            accept: 'image/*',
            className: 'hidden',
            onChange: (e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])
          })
        ),
        
        React.createElement('div', { className: 'mb-4' },
          React.createElement('p', { className: 'text-xs text-white/40 mb-2' }, 'Styles'),
          React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
            presets.map(preset => 
              React.createElement('button', {
                key: preset.id,
                onClick: () => setSelectedPreset(preset),
                className: `p-3 rounded-lg text-sm font-medium border transition-all ${
                  selectedPreset?.id === preset.id 
                    ? 'border-[#d9ff00] bg-[#d9ff00]/10' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`
              }, preset.name)
            )
          )
        ),
        
        React.createElement('button', {
          onClick: handleGenerate,
          disabled: !sourcePhoto || !selectedPreset || isGenerating,
          className: 'w-full py-3 bg-[#d9ff00] text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50 mb-2'
        }, isGenerating ? 'Generating...' : 'Generate Headshot'),
        
        React.createElement('button', {
          onClick: handleBatchGenerate,
          disabled: !sourcePhoto || isGenerating,
          className: 'w-full py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 disabled:opacity-50'
        }, 'Generate All Styles')
      ),
      
      React.createElement('div', { className: 'flex-1 p-6 overflow-y-auto' },
        batchResults.length > 0
          ? React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 gap-4' },
              batchResults.map((result, idx) => 
                result.error
                  ? React.createElement('div', { 
                      key: idx, 
                      className: 'bg-red-500/10 border border-red-500/20 rounded-lg p-4' 
                    }, 'Error: ', result.error)
                  : React.createElement('div', { 
                      key: idx, 
                      className: 'bg-white/5 border border-white/10 rounded-lg p-3' 
                    },
                      React.createElement('img', { 
                        src: result.url, 
                        alt: `Headshot ${idx + 1}`, 
                        className: 'w-full aspect-square object-cover rounded-lg mb-2' 
                      }),
                      React.createElement('p', { className: 'text-xs text-white/60' }, result.preset)
                    )
              )
            )
          : React.createElement('div', { className: 'h-full flex items-center justify-center text-white/40' },
              React.createElement('p', null, 'Generated headshots will appear here')
            )
      )
    )
  );
}