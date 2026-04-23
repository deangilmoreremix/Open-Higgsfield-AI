/**
 * AI Music Generation Tool
 * Generate music from video context with genre, mood, and style presets
 */

import { useState, useCallback, useRef } from 'react';

const MUSIC_GENRES = [
  'Cinematic', 'Electronic', 'Rock', 'Jazz', 'Classical', 'Ambient',
  'Hip-Hop', 'Pop', 'Folk', 'World', 'Experimental', 'Soundtrack'
];

const MUSIC_MOODS = [
  'Energetic', 'Calm', 'Dramatic', 'Happy', 'Sad', 'Mysterious',
  'Romantic', 'Tense', 'Peaceful', 'Dark', 'Uplifting', 'Melancholic'
];

const MUSIC_STYLES = [
  'Orchestral', 'Electronic', 'Acoustic', 'Synthetic', 'Vintage',
  'Modern', 'Minimalist', 'Complex', 'Simple', 'Epic', 'Intimate'
];

export function MusicGenerationModal({ clip, onClose, onApply }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  // Analysis results
  const [videoAnalysis, setVideoAnalysis] = useState(null);

  // Generation parameters
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [style, setStyle] = useState('');
  const [duration, setDuration] = useState(clip?.duration || 30);
  const [tempo, setTempo] = useState('auto');
  const [instrumental, setInstrumental] = useState(true);
  const [provider, setProvider] = useState('elevenlabs');

  const audioRef = useRef(null);

  const analyzeVideo = useCallback(async () => {
    if (!clip) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze/video-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: clip.videoUrl,
          duration: clip.duration,
          content: clip.text || ''
        })
      });

      const analysis = await response.json();
      setVideoAnalysis(analysis);

      // Auto-suggest based on analysis
      if (analysis.suggestedGenre) setGenre(analysis.suggestedGenre);
      if (analysis.suggestedMood) setMood(analysis.suggestedMood);
      if (analysis.suggestedStyle) setStyle(analysis.suggestedStyle);
      if (analysis.suggestedTempo) setTempo(analysis.suggestedTempo);

    } catch (error) {
      console.error('Video analysis failed:', error);
      showToast('Failed to analyze video context');
    } finally {
      setIsAnalyzing(false);
    }
  }, [clip]);

  const generateMusic = useCallback(async () => {
    if (!genre || !mood || !style) {
      showToast('Please select genre, mood, and style');
      return;
    }

    setIsGenerating(true);
    try {
      // Build context-aware prompt
      const contextPrompt = buildMusicPrompt();

      const response = await fetch('/api/generate/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: contextPrompt,
          duration,
          genre,
          mood,
          style,
          tempo,
          instrumental,
          provider,
          videoContext: videoAnalysis,
          clipId: clip?.id
        })
      });

      const result = await response.json();

      // Generate multiple variations
      const tracks = result.variations.map((track, index) => ({
        id: `music_${Date.now()}_${index}`,
        audioUrl: track.url,
        title: track.title || `Generated ${genre} ${mood}`,
        duration: track.duration,
        genre,
        mood,
        style,
        tempo: track.tempo,
        instrumental,
        prompt: contextPrompt,
        tags: track.tags || [],
        waveform: track.waveform
      }));

      setGeneratedTracks(tracks);

    } catch (error) {
      console.error('Music generation failed:', error);
      showToast('Failed to generate music');
    } finally {
      setIsGenerating(false);
    }
  }, [genre, mood, style, duration, tempo, instrumental, provider, videoAnalysis, clip]);

  const buildMusicPrompt = () => {
    const basePrompt = `${genre} music with a ${mood.toLowerCase()} mood in ${style.toLowerCase()} style`;

    if (videoAnalysis) {
      const contextElements = [];

      if (videoAnalysis.pace === 'fast') {
        contextElements.push('upbeat and energetic');
      } else if (videoAnalysis.pace === 'slow') {
        contextElements.push('calm and measured');
      }

      if (videoAnalysis.visualStyle === 'cinematic') {
        contextElements.push('dramatic orchestral elements');
      } else if (videoAnalysis.visualStyle === 'documentary') {
        contextElements.push('authentic and natural');
      }

      if (videoAnalysis.contentType === 'interview') {
        contextElements.push('conversational and supportive');
      } else if (videoAnalysis.contentType === 'product') {
        contextElements.push('professional and modern');
      }

      if (contextElements.length > 0) {
        return `${basePrompt}, featuring ${contextElements.join(', ')}`;
      }
    }

    return basePrompt;
  };

  const applyMusic = () => {
    if (!selectedTrack) return;

    const musicClip = {
      id: selectedTrack.id,
      type: 'audio',
      startTime: clip?.startTime || 0,
      duration: selectedTrack.duration,
      audioUrl: selectedTrack.audioUrl,
      waveform: selectedTrack.waveform,
      title: selectedTrack.title,
      genre: selectedTrack.genre,
      mood: selectedTrack.mood,
      style: selectedTrack.style,
      tempo: selectedTrack.tempo,
      instrumental: selectedTrack.instrumental,
      isGenerated: true,
      generationType: 'music',
      prompt: selectedTrack.prompt,
      tags: selectedTrack.tags
    };

    onApply(musicClip);
    onClose();
  };

  const playTrack = (track) => {
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.play();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content music-modal">
        <div className="modal-header">
          <h3>🎼 Generate Music</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {clip && (
            <div className="video-context-section">
              <h4>Video Context Analysis</h4>
              {!videoAnalysis && (
                <button
                  className={`analyze-btn ${isAnalyzing ? 'loading' : ''}`}
                  onClick={analyzeVideo}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? '🔍 Analyzing...' : '🔍 Analyze Video Context'}
                </button>
              )}

              {videoAnalysis && (
                <div className="analysis-results">
                  <div className="analysis-item">
                    <span className="label">Pace:</span>
                    <span className="value">{videoAnalysis.pace}</span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">Style:</span>
                    <span className="value">{videoAnalysis.visualStyle}</span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">Content:</span>
                    <span className="value">{videoAnalysis.contentType}</span>
                  </div>
                  <div className="analysis-suggestions">
                    <strong>Suggested:</strong> {videoAnalysis.suggestedGenre} • {videoAnalysis.suggestedMood} • {videoAnalysis.suggestedStyle}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="music-parameters">
            <div className="param-row">
              <div className="param-group">
                <label>Genre</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                  <option value="">Select genre...</option>
                  {MUSIC_GENRES.map(g => (
                    <option key={g} value={g.toLowerCase()}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="param-group">
                <label>Mood</label>
                <select value={mood} onChange={(e) => setMood(e.target.value)}>
                  <option value="">Select mood...</option>
                  {MUSIC_MOODS.map(m => (
                    <option key={m} value={m.toLowerCase()}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="param-group">
                <label>Style</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="">Select style...</option>
                  {MUSIC_STYLES.map(s => (
                    <option key={s} value={s.toLowerCase()}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="param-row">
              <div className="param-group">
                <label>Duration: {duration}s</label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                />
                <div className="duration-presets">
                  {[30, 60, 90, 120].map(d => (
                    <button key={d} onClick={() => setDuration(d)}>{d}s</button>
                  ))}
                </div>
              </div>

              <div className="param-group">
                <label>Tempo</label>
                <select value={tempo} onChange={(e) => setTempo(e.target.value)}>
                  <option value="auto">Auto</option>
                  <option value="slow">Slow (60-80 BPM)</option>
                  <option value="medium">Medium (80-120 BPM)</option>
                  <option value="fast">Fast (120-160 BPM)</option>
                  <option value="very-fast">Very Fast (160+ BPM)</option>
                </select>
              </div>

              <div className="param-group">
                <label>Provider</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="elevenlabs">ElevenLabs Music</option>
                  <option value="suno">Suno AI</option>
                  <option value="udio">Udio</option>
                </select>
              </div>
            </div>

            <div className="param-row">
              <div className="param-group checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={instrumental}
                    onChange={(e) => setInstrumental(e.target.checked)}
                  />
                  Instrumental only
                </label>
              </div>
            </div>
          </div>

          {!generatedTracks.length && (
            <button
              className={`generate-btn ${isGenerating ? 'loading' : ''}`}
              onClick={generateMusic}
              disabled={isGenerating || !genre || !mood || !style}
            >
              {isGenerating ? '🎼 Generating music...' : '🎼 Generate Music'}
            </button>
          )}

          {generatedTracks.length > 0 && (
            <div className="generated-tracks">
              <h4>Select Music Track</h4>
              <div className="tracks-list">
                {generatedTracks.map(track => (
                  <div
                    key={track.id}
                    className={`track-item ${selectedTrack?.id === track.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className="track-controls">
                      <button
                        className="play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track);
                        }}
                      >
                        ▶️
                      </button>
                    </div>

                    <div className="track-info">
                      <div className="track-title">{track.title}</div>
                      <div className="track-meta">
                        {track.duration}s • {track.tempo} BPM • {track.genre} • {track.mood}
                        {!track.instrumental && <span className="has-vocals">🎤</span>}
                      </div>
                      {track.waveform && (
                        <div className="mini-waveform">
                          <img src={track.waveform} alt="Waveform" />
                        </div>
                      )}
                    </div>

                    <div className="track-tags">
                      {track.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTrack && (
                <div className="selected-track-details">
                  <h5>Track Details</h5>
                  <div className="track-full-waveform">
                    <img src={selectedTrack.waveform} alt="Full waveform" />
                  </div>
                  <div className="track-description">
                    <strong>Prompt:</strong> {selectedTrack.prompt}
                  </div>
                  <div className="track-full-tags">
                    {selectedTrack.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <audio ref={audioRef} controls style={{ display: 'none' }} />
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button
            className="primary-btn"
            onClick={applyMusic}
            disabled={!selectedTrack}
          >
            Add to Timeline
          </button>
        </div>
      </div>
    </div>
  );
}

// CSS Styles
const musicStyles = `
.music-modal .modal-content {
  max-width: 1000px;
  max-height: 90vh;
}

.video-context-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.video-context-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.analyze-btn {
  padding: 8px 16px;
  background: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.analyze-btn:hover {
  background: var(--primary-hover);
}

.analyze-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.analysis-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.analysis-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.analysis-item .label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
}

.analysis-item .value {
  font-size: 14px;
  color: var(--text);
  font-weight: 600;
}

.analysis-suggestions {
  grid-column: 1 / -1;
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--primary-alpha);
  border-radius: 4px;
  font-size: 12px;
  color: var(--primary);
  font-weight: 500;
}

.music-parameters {
  margin-bottom: 24px;
}

.param-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.param-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.param-group select,
.param-group input[type="range"] {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}

.duration-presets {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.duration-presets button {
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s ease;
}

.duration-presets button:hover {
  background: var(--primary-alpha);
  border-color: var(--primary);
  color: var(--primary);
}

.param-group.checkbox {
  justify-content: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.generate-btn {
  width: 100%;
  padding: 12px 24px;
  background: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.generate-btn:hover {
  background: var(--primary-hover);
}

.generate-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.generated-tracks h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  max-height: 300px;
  overflow-y: auto;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  cursor: pointer;
  transition: all 0.15s ease;
}

.track-item:hover {
  border-color: var(--primary);
}

.track-item.selected {
  border-color: var(--primary);
  background: var(--primary-alpha);
}

.track-controls {
  flex-shrink: 0;
}

.play-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.play-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.track-meta {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.has-vocals {
  font-size: 14px;
}

.mini-waveform {
  margin-top: 4px;
  height: 20px;
  overflow: hidden;
  border-radius: 2px;
}

.mini-waveform img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 6px;
  background: var(--primary-alpha);
  color: var(--primary);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.selected-track-details {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.selected-track-details h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.track-full-waveform {
  margin-bottom: 12px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.track-full-waveform img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.track-full-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
`;

export default MusicGenerationModal;</content>
<parameter name="filePath">src/lib/editor/musicGenerationTool.js