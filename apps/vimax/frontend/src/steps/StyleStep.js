/* eslint-disable */
import React, { useState } from 'react';
import './StyleStep.css';

const STYLES = [
  {
    value: 'Cinematic',
    label: 'Cinematic',
    desc: 'Film-grade visuals, dramatic lighting, Hollywood aesthetic',
    thumb: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg',
    accent: '#1e3a8a',
  },
  {
    value: 'Realistic',
    label: 'Realistic',
    desc: 'True-to-life imagery, natural lighting, documentary feel',
    thumb: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg',
    accent: '#1e4d2b',
  },
  {
    value: 'Anime',
    label: 'Anime',
    desc: 'Japanese animation style, expressive characters, vivid colors',
    thumb: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    accent: '#7e1d5a',
  },
  {
    value: 'Cartoon',
    label: 'Cartoon',
    desc: 'Bold colors, stylized shapes, playful and energetic',
    thumb: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
    accent: '#c2410c',
  },
];

const QUALITY_PRESETS = [
  {
    value: 'fast',
    label: 'Fast',
    desc: '720p · ~50MB · Quick preview',
    time: '~5 min',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3v14M5 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: 'standard',
    label: 'Standard',
    desc: '1080p · ~200MB · Recommended',
    time: '~15 min',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 7v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: 'high',
    label: 'High Quality',
    desc: '4K · ~1GB · Best output',
    time: '~45 min',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10l4-4 3 3 4-5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const ADVANCED_OPTIONS = {
  imageGenerator: [
    { value: 'google', label: 'Google Imagen', desc: 'Highest quality' },
    { value: 'freepik', label: 'Freepik Mystic', desc: '1K–4K photorealistic' },
    { value: 'yunwu_nanobanana', label: 'Yunwu Nanobanana', desc: 'Fast' },
    { value: 'yunwu_doubao', label: 'Yunwu Doubao', desc: 'Balanced' },
  ],
  videoGenerator: [
    { value: 'google', label: 'Google Veo', desc: 'Highest quality' },
    { value: 'yunwu_veo', label: 'Yunwu Veo', desc: 'Fast' },
    { value: 'yunwu_doubao', label: 'Yunwu Doubao', desc: 'Balanced' },
  ],
  format: [
    { value: 'mp4', label: 'MP4', desc: 'Universal' },
    { value: 'webm', label: 'WebM', desc: 'Web optimized' },
    { value: 'mov', label: 'MOV', desc: 'Apple' },
  ],
};

export default function StyleStep({ formData, onUpdate }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { style, quality, imageGenerator, videoGenerator, format } = formData;

  return (
    <div className="style-step animate-fade-in-up">
      <div className="style-step-header">
        <h2 className="style-step-title">Style & Quality</h2>
        <p className="style-step-desc">Choose how your video will look and its production quality.</p>
      </div>

      <section className="style-section">
        <h3 className="style-section-title">Visual Style</h3>
        <div className="style-cards">
          {STYLES.map((s) => (
            <button
              key={s.value}
              className={`style-card ${style === s.value ? 'active' : ''}`}
              onClick={() => onUpdate({ style: s.value })}
            >
              <div className="style-card-thumb">
                <img src={s.thumb} alt={s.label} />
                <div className="style-card-overlay" style={{ background: `${s.accent}80` }} />
                {style === s.value && (
                  <div className="style-card-selected-badge">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="7" fill="white" />
                      <path d="M3.5 7L5.5 9.5L10.5 4.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="style-card-info">
                <span className="style-card-label">{s.label}</span>
                <span className="style-card-desc">{s.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="style-section">
        <h3 className="style-section-title">Quality Preset</h3>
        <div className="quality-cards">
          {QUALITY_PRESETS.map((q) => (
            <button
              key={q.value}
              className={`quality-card ${quality === q.value ? 'active' : ''}`}
              onClick={() => onUpdate({ quality: q.value })}
            >
              <div className="quality-card-icon">{q.icon}</div>
              <div className="quality-card-info">
                <span className="quality-card-label">{q.label}</span>
                <span className="quality-card-desc">{q.desc}</span>
              </div>
              <span className="quality-card-time">{q.time}</span>
            </button>
          ))}
        </div>
      </section>

      <button
        className="advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 4l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {showAdvanced ? 'Hide' : 'Show'} advanced options
      </button>

      {showAdvanced && (
        <div className="advanced-options animate-fade-in-up">
          <div className="advanced-grid">
            <div className="advanced-group">
              <label className="advanced-label">Image Generator</label>
              <div className="advanced-select-group">
                {ADVANCED_OPTIONS.imageGenerator.map((opt) => (
                  <button
                    key={opt.value}
                    className={`advanced-option ${imageGenerator === opt.value ? 'active' : ''}`}
                    onClick={() => onUpdate({ imageGenerator: opt.value })}
                  >
                    <span className="advanced-option-label">{opt.label}</span>
                    <span className="advanced-option-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="advanced-group">
              <label className="advanced-label">Video Generator</label>
              <div className="advanced-select-group">
                {ADVANCED_OPTIONS.videoGenerator.map((opt) => (
                  <button
                    key={opt.value}
                    className={`advanced-option ${videoGenerator === opt.value ? 'active' : ''}`}
                    onClick={() => onUpdate({ videoGenerator: opt.value })}
                  >
                    <span className="advanced-option-label">{opt.label}</span>
                    <span className="advanced-option-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="advanced-group">
              <label className="advanced-label">Output Format</label>
              <div className="advanced-select-group horizontal">
                {ADVANCED_OPTIONS.format.map((opt) => (
                  <button
                    key={opt.value}
                    className={`advanced-option compact ${format === opt.value ? 'active' : ''}`}
                    onClick={() => onUpdate({ format: opt.value })}
                  >
                    <span className="advanced-option-label">{opt.label}</span>
                    <span className="advanced-option-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
