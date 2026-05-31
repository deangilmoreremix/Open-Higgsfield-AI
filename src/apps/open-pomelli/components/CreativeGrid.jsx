"use client";

import { useState } from 'react';

const CREATIVE_FORMATS = [
  { id: 'instagram-post', name: 'Instagram Post', platform: 'instagram', dimensions: '1080x1080' },
  { id: 'instagram-story', name: 'Instagram Story', platform: 'instagram', dimensions: '1080x1920' },
  { id: 'linkedin', name: 'LinkedIn', platform: 'linkedin', dimensions: '1200x627' },
  { id: 'facebook', name: 'Facebook', platform: 'facebook', dimensions: '1200x630' },
  { id: 'twitter', name: 'X / Twitter', platform: 'twitter', dimensions: '1200x600' },
  { id: 'web-banner', name: 'Web Banner', platform: 'web', dimensions: '728x90' },
  { id: 'email-header', name: 'Email Header', platform: 'email', dimensions: '600x300' },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', platform: 'youtube', dimensions: '1280x720' }
];

export default function CreativeGrid({ concept, brandDNA, onCreativeGenerated }) {
  const [generatingFor, setGeneratingFor] = useState(null);
  const [creativeResults, setCreativeResults] = useState({});
  const [errors, setErrors] = useState({});

  const handleGenerateCreative = async (format) => {
    if (!concept) return;
    
    setGeneratingFor(format.id);
    setErrors(prev => ({ ...prev, [format.id]: null }));
    
    try {
      const response = await fetch('/api/pomelli/creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          format: format.platform,
          brandDNA
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate creative');
      
      const result = await response.json();
      setCreativeResults(prev => ({ ...prev, [format.id]: result }));
      
      if (onCreativeGenerated) {
        onCreativeGenerated(format.id, result);
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [format.id]: err.message || 'Generation failed' }));
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-primary uppercase">Platform Creatives</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CREATIVE_FORMATS.map(format => (
          <div key={format.id} className="space-y-2">
            <div className="aspect-square md:aspect-auto md:h-32 bg-white/5 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center">
              {creativeResults[format.id] ? (
                <img
                  src={creativeResults[format.id].url}
                  alt={format.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="text-xs font-bold text-white/60">{format.name}</div>
                  <div className="text-[10px] text-white/40">{format.dimensions}</div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => handleGenerateCreative(format)}
              disabled={generatingFor === format.id || !concept}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {generatingFor === format.id ? (
                <div className="flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              ) : creativeResults[format.id] ? (
                'Regenerate'
              ) : (
                'Generate'
              )}
            </button>
            
            {errors[format.id] && (
              <div className="text-[10px] text-red-400">{errors[format.id]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}