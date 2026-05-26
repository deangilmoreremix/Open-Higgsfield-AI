/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './StoryboardPanel.css';

export default function StoryboardPanel({ scenes = [], mode = 'grid', onModeChange }) {
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedScene, setSelectedScene] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const animaticRef = useRef(null);
  const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const completedCount = scenes.filter(s => s.image_url).length;

  useEffect(() => {
    if (!isPlaying || mode !== 'animatic' || scenes.length === 0) return;
    const duration = (scenes[activeScene]?.duration_seconds || 4) * 1000;
    animaticRef.current = setTimeout(() => {
      if (activeScene < scenes.length - 1) {
        setActiveScene(i => i + 1);
      } else {
        setIsPlaying(false);
        setActiveScene(0);
      }
    }, duration);
    return () => clearTimeout(animaticRef.current);
  }, [isPlaying, activeScene, mode, scenes]);

  useEffect(() => {
    if (activeScene >= scenes.length && scenes.length > 0) {
      setActiveScene(scenes.length - 1);
    }
  }, [scenes.length]);

  const handlePlayPause = useCallback(() => {
    setActiveScene(prev => {
      if (!isPlaying && prev >= scenes.length - 1) return 0;
      return prev;
    });
    setIsPlaying(p => !p);
  }, [isPlaying, scenes.length]);

  const handleSceneClick = useCallback((index) => {
    if (mode === 'animatic') {
      setActiveScene(index);
      setIsPlaying(false);
    } else {
      setSelectedScene(prev => (prev === index ? null : index));
    }
  }, [mode]);

  const handleImageError = useCallback((index) => {
    setFailedImages(prev => ({ ...prev, [index]: true }));
  }, []);

  const getImageSrc = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  }, [apiBase]);

  if (scenes.length === 0) return null;

  const currentScene = scenes[activeScene] || scenes[0];

  return (
    <div className="storyboard-panel">
      <div className="storyboard-header">
        <div className="storyboard-header-left">
          <h3 className="storyboard-title">
            {mode === 'animatic' ? 'Animatic Preview' : 'Scene Storyboard'}
          </h3>
          <span className="storyboard-count">
            {completedCount}/{scenes.length} scenes
          </span>
        </div>
        <div className="storyboard-header-right">
          {onModeChange && (
            <div className="storyboard-mode-toggle">
              <button
                className={`storyboard-mode-btn ${mode === 'grid' ? 'active' : ''}`}
                onClick={() => { onModeChange('grid'); setIsPlaying(false); }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Grid
              </button>
              <button
                className={`storyboard-mode-btn ${mode === 'animatic' ? 'active' : ''}`}
                onClick={() => { onModeChange('animatic'); setIsPlaying(false); setActiveScene(0); }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 2l8 5-8 5V2Z" fill="currentColor" />
                </svg>
                Animatic
              </button>
            </div>
          )}
        </div>
      </div>

      {mode === 'animatic' ? (
        <div className="storyboard-animatic">
          <div className="storyboard-animatic-stage">
            {currentScene.image_url && !failedImages[activeScene] ? (
              <img
                key={activeScene}
                src={getImageSrc(currentScene.image_url)}
                alt={`Scene ${activeScene + 1}`}
                className="storyboard-animatic-img"
                onError={() => handleImageError(activeScene)}
              />
            ) : (
              <div className="storyboard-animatic-placeholder">
                {currentScene.status === 'generating' ? (
                  <>
                    <div className="storyboard-animatic-spinner" />
                    <span>Generating scene {activeScene + 1}...</span>
                  </>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.4 }}>
                    <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 12l8 4-8 4v-8Z" fill="currentColor" />
                  </svg>
                )}
              </div>
            )}
            <div className="storyboard-animatic-overlay">
              <span className="storyboard-animatic-scene-num">Scene {activeScene + 1}</span>
              {currentScene.camera_angle && (
                <span className="storyboard-animatic-camera">{currentScene.camera_angle}</span>
              )}
            </div>
            {isPlaying && (
              <div
                key={`progress-${activeScene}`}
                className="storyboard-animatic-progress"
                style={{ animationDuration: `${currentScene.duration_seconds || 4}s` }}
              />
            )}
          </div>

          {currentScene.script_line && (
            <p className="storyboard-animatic-script">{currentScene.script_line}</p>
          )}

          <div className="storyboard-animatic-controls">
            <button
              className="storyboard-ctrl-btn"
              onClick={() => { setActiveScene(i => Math.max(0, i - 1)); setIsPlaying(false); }}
              disabled={activeScene === 0}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="storyboard-play-btn" onClick={handlePlayPause} disabled={scenes.length === 0}>
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="4" y="3" width="3.5" height="12" rx="1.5" fill="currentColor" />
                  <rect x="10.5" y="3" width="3.5" height="12" rx="1.5" fill="currentColor" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M5 3l10 6-10 6V3Z" fill="currentColor" />
                </svg>
              )}
            </button>
            <button
              className="storyboard-ctrl-btn"
              onClick={() => { setActiveScene(i => Math.min(scenes.length - 1, i + 1)); setIsPlaying(false); }}
              disabled={activeScene === scenes.length - 1}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="storyboard-filmstrip">
            {scenes.map((scene, i) => (
              <button
                key={i}
                className={`storyboard-filmstrip-thumb ${i === activeScene ? 'active' : ''} ${scene.status || ''}`}
                onClick={() => handleSceneClick(i)}
              >
                {scene.image_url && !failedImages[i] ? (
                  <img
                    src={getImageSrc(scene.image_url)}
                    alt={`Scene ${i + 1}`}
                    onError={() => handleImageError(i)}
                  />
                ) : (
                  <div className="storyboard-filmstrip-placeholder">
                    {scene.status === 'generating' && <div className="storyboard-mini-spinner" />}
                  </div>
                )}
                <span className="storyboard-filmstrip-num">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="storyboard-grid">
          {scenes.map((scene, i) => (
            <div
              key={i}
              className={`storyboard-card ${scene.status || ''} ${selectedScene === i ? 'expanded' : ''}`}
              onClick={() => handleSceneClick(i)}
            >
              <div className="storyboard-card-image">
                {scene.image_url && !failedImages[i] ? (
                  <img
                    src={getImageSrc(scene.image_url)}
                    alt={`Scene ${i + 1}`}
                    loading="lazy"
                    onError={() => handleImageError(i)}
                  />
                ) : (
                  <div className="storyboard-card-placeholder">
                    {scene.status === 'generating' ? (
                      <div className="storyboard-card-spinner" />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M9.5 9l5 3-5 3V9Z" fill="currentColor" />
                      </svg>
                    )}
                  </div>
                )}
                <div className="storyboard-card-num">{i + 1}</div>
                {scene.status === 'completed' && !failedImages[i] && scene.image_url && (
                  <div className="storyboard-card-badge">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="5" fill="#10b981" />
                      <path d="M2.5 5l1.5 1.5L7.5 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="storyboard-card-meta">
                <span className="storyboard-card-label">Scene {i + 1}</span>
                <span className="storyboard-card-duration">{scene.duration_seconds || 4}s</span>
              </div>
              {selectedScene === i && scene.script_line && (
                <div className="storyboard-card-detail animate-fade-in">
                  <p className="storyboard-card-script">{scene.script_line}</p>
                  {scene.camera_angle && (
                    <span className="storyboard-card-camera">{scene.camera_angle}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
