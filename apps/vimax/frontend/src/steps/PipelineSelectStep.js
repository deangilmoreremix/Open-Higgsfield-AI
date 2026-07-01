/* eslint-disable */
import React, { useState } from 'react';
import './PipelineSelectStep.css';

const PIPELINES = [
  {
    value: 'idea2video',
    emoji: '🌟',
    name: 'Idea2Video',
    badge: 'Just an Idea',
    tagline: 'From Concept to Finished Video',
    description: 'Idea2Video turns a single sentence or rough concept into a fully produced video. Describe what you want to see, and the AI builds the entire story — characters, scenes, visuals, and pacing — automatically. No script, storyboard, or production knowledge required. Ideal for creators who want to go from a spark of inspiration to a shareable video in the fewest steps possible.',
    cta: 'Start with an idea',
    accentColor: '#2563eb',
    accentBg: 'rgba(37, 99, 235, 0.06)',
    accentBorder: 'rgba(37, 99, 235, 0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 14h8M14 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="5" r="1.5" fill="currentColor" />
        <circle cx="23" cy="14" r="1.5" fill="currentColor" />
        <circle cx="14" cy="23" r="1.5" fill="currentColor" />
        <circle cx="5" cy="14" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: 'novel2video',
    emoji: '🎨',
    name: 'Novel2Video',
    badge: 'Written Story',
    tagline: 'Literary Adaptation Engine',
    description: 'Novel2Video takes any long-form written content — a novel, short story, or chapter — and adapts it into episodic video. The AI reads your text, compresses the narrative intelligently, tracks characters across scenes, and generates visuals that match the tone of the source material. Best for authors, fan creators, and content adapters who want to bring existing written stories to life on screen.',
    cta: 'Adapt a novel',
    accentColor: '#0d9488',
    accentBg: 'rgba(13, 148, 136, 0.06)',
    accentBorder: 'rgba(13, 148, 136, 0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 4h12l6 6v14H6V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M18 4v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 14h8M10 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 'script2video',
    emoji: '⚙️',
    name: 'Script2Video',
    badge: 'Your Script',
    tagline: 'Precision Screenplay-to-Screen Production',
    description: 'Script2Video converts a structured screenplay or detailed shot list directly into video, preserving your exact creative intent. Write your scenes, dialogue cues, and camera directions, and the AI generates each shot as specified. This mode gives directors, filmmakers, and content professionals complete control over narrative structure, pacing, and visual style — the right choice when you already know exactly what you want to produce.',
    cta: 'Use a screenplay',
    accentColor: '#dc2626',
    accentBg: 'rgba(220, 38, 38, 0.06)',
    accentBorder: 'rgba(220, 38, 38, 0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 10h10M9 14h10M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 'cameo',
    emoji: '🤳',
    name: 'AutoCameo',
    badge: 'Your Photo',
    tagline: 'Star Yourself in Any Story',
    description: 'AutoCameo lets you upload a photo of yourself, a friend, or a pet and places that subject as the featured character in any video story. The AI maps your appearance onto cinematic sequences, custom scripts, and creative scenarios you choose. Perfect for personalized gifts, branded content, social media storytelling, or simply seeing yourself as the lead character in an epic adventure.',
    cta: 'Star in a video',
    accentColor: '#0369a1',
    accentBg: 'rgba(3, 105, 161, 0.06)',
    accentBorder: 'rgba(3, 105, 161, 0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="6" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="22" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const FEATURE_HIGHLIGHTS = [
  { icon: '🧠', label: 'AI-Driven Storytelling', desc: 'Full story built from one prompt' },
  { icon: '🎬', label: 'Shot-Level Precision', desc: 'Script to screen, exactly as written' },
  { icon: '📖', label: 'Literary Adaptation', desc: 'Novels and stories become video' },
  { icon: '🤳', label: 'Personalized Characters', desc: 'Insert real faces into any story' },
  { icon: '🏆', label: 'Cinematic Output', desc: 'Broadcast-ready visual quality' },
];

export default function PipelineSelectStep({ onSelect, onUseAI }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="pipeline-select-step animate-fade-in-up">
      <div className="pipeline-select-hero">
        <div className="pipeline-select-logo">
          <span className="pipeline-select-logo-vi">Vi</span>
          <span className="pipeline-select-logo-max">Max</span>
        </div>
        <h1 className="pipeline-select-title">What do you want to create today?</h1>
        <p className="pipeline-select-subtitle">
          Choose your creation mode or let AI guide you to the perfect pipeline.
        </p>
      </div>

      <div className="pipeline-select-grid">
        {PIPELINES.map((p) => (
          <button
            key={p.value}
            className={`pipeline-select-card ${hovered === p.value ? 'hovered' : ''}`}
            style={{
              '--card-accent': p.accentColor,
              '--card-accent-bg': p.accentBg,
              '--card-accent-border': p.accentBorder,
            }}
            onClick={() => onSelect(p.value)}
            onMouseEnter={() => setHovered(p.value)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="pipeline-select-card-top">
              <div className="pipeline-select-card-icon">{p.icon}</div>
              <span className="pipeline-select-card-badge">{p.badge}</span>
            </div>
            <div className="pipeline-select-card-emoji">{p.emoji}</div>
            <h3 className="pipeline-select-card-name">{p.name}</h3>
            <p className="pipeline-select-card-tagline">{p.tagline}</p>
            <p className="pipeline-select-card-desc">{p.description}</p>
            <div className="pipeline-select-card-cta">
              {p.cta}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="pipeline-select-ai-row">
        <button className="pipeline-select-ai-btn" onClick={onUseAI}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect width="18" height="18" rx="9" fill="#2563eb" />
            <path d="M5 8h8M5 11h5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Not sure? Let AI guide me to the right pipeline
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="pipeline-select-features">
        {FEATURE_HIGHLIGHTS.map((f) => (
          <div key={f.label} className="pipeline-select-feature">
            <span className="pipeline-select-feature-icon">{f.icon}</span>
            <div>
              <p className="pipeline-select-feature-label">{f.label}</p>
              <p className="pipeline-select-feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
