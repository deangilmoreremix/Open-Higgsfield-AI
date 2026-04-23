/**
 * AI Extend Tool - Lengthen clips before/after using frame extraction
 */

import { useState, useCallback } from 'react';

export function ExtendModal({ clip, onClose, onApply }) {
  const [extendDirection, setExtendDirection] = useState('after'); // 'before' or 'after'
  const [extendDuration, setExtendDuration] = useState(3.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [model, setModel] = useState('kling-3');

  const availableModels = [
    { id: 'kling-3', name: 'Kling 3.0', description: 'Best for cinematic extension' },
    { id: 'runway-gen4', name: 'Runway Gen-4', description: 'Fast generation' },
    { id: 'veo-3', name: 'Veo 3.1', description: 'High quality' },
    { id: 'ltx-2', name: 'LTX 2.3', description: 'Local model' },
    { id: 'wan-2', name: 'Wan 2.6', description: 'Creative extension' },
    { id: 'minimax', name: 'MiniMax', description: 'Smooth transitions' },
    { id: 'sora-2', name: 'Sora 2', description: 'Photorealistic' },
    { id: 'flux-video', name: 'Flux Video', description: 'Artistic extension' },
    { id: 'elevenlabs-music', name: 'ElevenLabs Music', description: 'With background music' }
  ];

  const generateExtension = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Extract reference frame based on direction
      const referenceFrame = await extractReferenceFrame(clip, extendDirection);

      const response = await fetch('/api/generate/extend-clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalClip: {
            id: clip.id,
            videoUrl: clip.videoUrl,
            duration: clip.duration,
            startTime: clip.startTime
          },
          extendDirection,
          extendDuration,
          referenceFrame,
          model,
          context: {
            clipContent: clip.text || 'video content',
            surroundingClips: getSurroundingClips(clip)
          }
        })
      });

      const result = await response.json();

      // Generate multiple variations
      const options = result.variations.map((video, index) => ({
        id: `extend_${Date.now()}_${index}`,
        videoUrl: video.url,
        thumbnailUrl: video.thumbnail,
        duration: extendDuration,
        direction: extendDirection,
        prompt: result.prompt,
        confidence: video.confidence || 0.8,
        style: video.style
      }));

      setGeneratedOptions(options);

    } catch (error) {
      console.error('Extend generation failed:', error);
      showToast('Failed to generate extension');
    } finally {
      setIsGenerating(false);
    }
  }, [clip, extendDirection, extendDuration, model]);

  const applyExtension = () => {
    if (!selectedOption) return;

    const extendedClip = {
      id: selectedOption.id,
      type: 'video',
      originalClipId: clip.id,
      startTime: extendDirection === 'before' ? clip.startTime - extendDuration : clip.startTime,
      duration: clip.duration + extendDuration,
      videoUrl: selectedOption.videoUrl,
      thumbnailUrl: selectedOption.thumbnailUrl,
      isGenerated: true,
      generationType: 'extend',
      extendDirection,
      originalDuration: clip.duration,
      prompt: selectedOption.prompt
    };

    onApply(extendedClip);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content extend-modal">
        <div className="modal-header">
          <h3>📏 Extend Clip with AI</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="clip-preview-section">
            <h4>Original Clip</h4>
            <div className="original-clip-display">
              <video
                src={clip.videoUrl}
                poster={clip.thumbnailUrl}
                controls
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
              <div className="clip-info">
                <span>Duration: {formatDuration(clip.duration)}</span>
                {clip.text && <span>Content: {clip.text}</span>}
              </div>
            </div>
          </div>

          <div className="extend-controls">
            <div className="control-group">
              <label>Extend Direction</label>
              <div className="direction-selector">
                <button
                  className={`direction-btn ${extendDirection === 'before' ? 'active' : ''}`}
                  onClick={() => setExtendDirection('before')}
                >
                  ⏪ Before (Add to start)
                </button>
                <button
                  className={`direction-btn ${extendDirection === 'after' ? 'active' : ''}`}
                  onClick={() => setExtendDirection('after')}
                >
                  ⏩ After (Add to end)
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Extension Duration: {extendDuration}s</label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={extendDuration}
                onChange={(e) => setExtendDuration(parseFloat(e.target.value))}
                className="duration-slider"
              />
              <div className="duration-presets">
                {[2, 3, 5, 8].map(duration => (
                  <button
                    key={duration}
                    className="preset-btn"
                    onClick={() => setExtendDuration(duration)}
                  >
                    {duration}s
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <label>AI Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                {availableModels.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} - {m.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!generatedOptions.length && (
            <div className="generation-section">
              <div className="generation-info">
                <h4>AI Extension Preview</h4>
                <p>
                  {extendDirection === 'before'
                    ? `Will generate ${extendDuration} seconds of content to play before the original clip`
                    : `Will generate ${extendDuration} seconds of content to play after the original clip`
                  }
                </p>
                <p><strong>Reference:</strong> Using frame from {extendDirection === 'before' ? 'start' : 'end'} of original clip</p>
              </div>

              <button
                className={`generate-btn ${isGenerating ? 'loading' : ''}`}
                onClick={generateExtension}
                disabled={isGenerating}
              >
                {isGenerating ? `🎬 Generating ${extendDuration}s extension...` : `🎬 Generate ${extendDuration}s Extension`}
              </button>
            </div>
          )}

          {generatedOptions.length > 0 && (
            <div className="generated-options">
              <h4>Select Extension Option</h4>
              <div className="options-grid">
                {generatedOptions.map(option => (
                  <div
                    key={option.id}
                    className={`option-card ${selectedOption?.id === option.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOption(option)}
                  >
                    <div className="option-preview">
                      <video
                        src={option.videoUrl}
                        poster={option.thumbnailUrl}
                        muted
                        loop
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => e.target.pause()}
                      />
                      <div className="option-label">
                        {option.direction === 'before' ? '⏪' : '⏩'} {formatDuration(option.duration)}
                      </div>
                    </div>
                    <div className="option-info">
                      <div className="model-name">
                        {availableModels.find(m => m.id === model)?.name}
                      </div>
                      <div className="confidence">
                        Confidence: {Math.round(option.confidence * 100)}%
                      </div>
                      {option.style && (
                        <div className="style-tag">{option.style}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedOption && (
                <div className="selected-details">
                  <h5>Extension Details</h5>
                  <div className="timeline-preview">
                    <div className="timeline-visual">
                      {selectedOption.direction === 'before' && (
                        <>
                          <div className="extension-part" style={{ width: `${(selectedOption.duration / (clip.duration + selectedOption.duration)) * 100}%` }}>
                            <span>Extension</span>
                          </div>
                          <div className="original-part" style={{ width: `${(clip.duration / (clip.duration + selectedOption.duration)) * 100}%` }}>
                            <span>Original</span>
                          </div>
                        </>
                      )}
                      {selectedOption.direction === 'after' && (
                        <>
                          <div className="original-part" style={{ width: `${(clip.duration / (clip.duration + selectedOption.duration)) * 100}%` }}>
                            <span>Original</span>
                          </div>
                          <div className="extension-part" style={{ width: `${(selectedOption.duration / (clip.duration + selectedOption.duration)) * 100}%` }}>
                            <span>Extension</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="generated-prompt">
                    <strong>Prompt:</strong> {selectedOption.prompt}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button
            className="primary-btn"
            onClick={applyExtension}
            disabled={!selectedOption}
          >
            Apply Extension
          </button>
        </div>
      </div>
    </div>
  );
}

async function extractReferenceFrame(clip, direction) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = clip.videoUrl;
    video.currentTime = direction === 'before' ? 0 : clip.duration - 0.1;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
}

function getSurroundingClips(clip) {
  // Get clips before and after this one from timeline state
  // This would need to be passed from parent component
  return {
    before: null, // Clip before this one
    after: null   // Clip after this one
  };
}

function formatDuration(seconds) {
  return `${seconds.toFixed(1)}s`;
}

// CSS Styles
const extendStyles = `
.extend-modal .modal-content {
  max-width: 900px;
}

.clip-preview-section {
  margin-bottom: 24px;
}

.clip-preview-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.original-clip-display {
  display: flex;
  gap: 16px;
  align-items: center;
}

.original-clip-display video {
  border-radius: 8px;
  border: 1px solid var(--border);
}

.clip-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.clip-info span {
  font-size: 12px;
  color: var(--text-secondary);
}

.extend-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.direction-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.direction-btn {
  padding: 10px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  transition: all 0.15s ease;
}

.direction-btn:hover {
  border-color: var(--primary);
}

.direction-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.duration-slider {
  width: 100%;
}

.duration-presets {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.preset-btn {
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  background: var(--primary-alpha);
  border-color: var(--primary);
  color: var(--primary);
}

.control-group select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}

.generation-section {
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 24px;
}

.generation-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--text);
}

.generation-info p {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
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
  margin-top: 16px;
}

.generate-btn:hover {
  background: var(--primary-hover);
}

.generate-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.generated-options h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.option-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  cursor: pointer;
  transition: all 0.15s ease;
  overflow: hidden;
}

.option-card:hover {
  border-color: var(--primary);
}

.option-card.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-alpha);
}

.option-preview {
  position: relative;
  height: 140px;
  background: #000;
}

.option-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.option-label {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.option-info {
  padding: 12px;
}

.model-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.confidence {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.style-tag {
  display: inline-block;
  padding: 2px 6px;
  background: var(--primary-alpha);
  color: var(--primary);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.selected-details {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.selected-details h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.timeline-preview {
  margin-bottom: 12px;
}

.timeline-visual {
  display: flex;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.extension-part {
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
}

.original-part {
  background: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
}

.generated-prompt {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}
`;

export default ExtendModal;</content>
<parameter name="filePath">src/lib/editor/extendTool.js