/**
 * AI-Powered Fill Gap Tool
 * Generates footage to bridge gaps between clips using adjacent frame context
 */

import { useState, useCallback } from 'react';

export function FillGapModal({ clip1, clip2, onClose, onApply }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [model, setModel] = useState('kling-3');
  const [style, setStyle] = useState('cinematic');

  const gapDuration = clip2.startTime - (clip1.startTime + clip1.duration);

  const generateFill = useCallback(async () => {
    if (gapDuration <= 0) {
      showToast('No gap to fill between these clips');
      return;
    }

    setIsGenerating(true);
    try {
      // Extract frames from adjacent clips
      const clip1EndFrame = await extractFrame(clip1, clip1.duration - 1);
      const clip2StartFrame = await extractFrame(clip2, 0);

      const response = await fetch('/api/generate/fill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gapDuration,
          clip1EndFrame,
          clip2StartFrame,
          model,
          style,
          context: {
            clip1: { id: clip1.id, content: clip1.text || 'video content' },
            clip2: { id: clip2.id, content: clip2.text || 'video content' }
          }
        })
      });

      const result = await response.json();

      // Generate multiple options
      const options = result.variations.map((video, index) => ({
        id: `fill_${Date.now()}_${index}`,
        videoUrl: video.url,
        thumbnailUrl: video.thumbnail,
        duration: gapDuration,
        prompt: result.prompt,
        confidence: video.confidence || 0.8
      }));

      setGeneratedOptions(options);

    } catch (error) {
      console.error('Fill gap generation failed:', error);
      showToast('Failed to generate fill content');
    } finally {
      setIsGenerating(false);
    }
  }, [clip1, clip2, gapDuration, model, style]);

  const applyFill = () => {
    if (!selectedOption) return;

    const fillClip = {
      id: selectedOption.id,
      type: 'video',
      startTime: clip1.startTime + clip1.duration,
      duration: gapDuration,
      videoUrl: selectedOption.videoUrl,
      thumbnailUrl: selectedOption.thumbnailUrl,
      isGenerated: true,
      generationType: 'fill-gap',
      prompt: selectedOption.prompt
    };

    onApply(fillClip);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fill-gap-modal">
        <div className="modal-header">
          <h3>🎬 Fill Gap with AI</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="gap-info">
            <div className="gap-visual">
              <div className="clip-preview clip1">
                <video src={clip1.videoUrl} poster={clip1.thumbnailUrl} />
                <span>Clip 1 End</span>
              </div>
              <div className="gap-indicator">
                <span>{formatDuration(gapDuration)}</span>
                <span>Gap to Fill</span>
              </div>
              <div className="clip-preview clip2">
                <video src={clip2.videoUrl} poster={clip2.thumbnailUrl} />
                <span>Clip 2 Start</span>
              </div>
            </div>
          </div>

          <div className="generation-controls">
            <div className="control-group">
              <label>AI Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="kling-3">Kling 3.0 (Recommended)</option>
                <option value="runway-gen4">Runway Gen-4</option>
                <option value="veo-3">Veo 3.1</option>
                <option value="ltx-2">LTX 2.3</option>
              </select>
            </div>

            <div className="control-group">
              <label>Style</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="cinematic">Cinematic</option>
                <option value="documentary">Documentary</option>
                <option value="commercial">Commercial</option>
                <option value="educational">Educational</option>
              </select>
            </div>
          </div>

          {!generatedOptions.length && (
            <button
              className={`generate-btn ${isGenerating ? 'loading' : ''}`}
              onClick={generateFill}
              disabled={isGenerating}
            >
              {isGenerating ? '🎬 Generating Fill...' : '🎬 Generate Fill Content'}
            </button>
          )}

          {generatedOptions.length > 0 && (
            <div className="generated-options">
              <h4>Select Fill Option</h4>
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
                    </div>
                    <div className="option-info">
                      <div className="confidence">
                        Confidence: {Math.round(option.confidence * 100)}%
                      </div>
                      <div className="duration">
                        {formatDuration(option.duration)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="option-details">
                {selectedOption && (
                  <div className="details-content">
                    <h5>Generated Prompt</h5>
                    <p>{selectedOption.prompt}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button
            className="primary-btn"
            onClick={applyFill}
            disabled={!selectedOption}
          >
            Apply Fill
          </button>
        </div>
      </div>
    </div>
  );
}

async function extractFrame(clip, timeOffset) {
  // Extract frame from video at specific time
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = clip.videoUrl;
    video.currentTime = timeOffset;
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

function formatDuration(seconds) {
  return `${seconds.toFixed(1)}s`;
}

// CSS Styles
const fillGapStyles = `
.fill-gap-modal .modal-content {
  max-width: 800px;
}

.gap-info {
  margin-bottom: 24px;
}

.gap-visual {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.clip-preview {
  flex: 1;
  text-align: center;
}

.clip-preview video {
  width: 120px;
  height: 68px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.clip-preview span {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.gap-indicator {
  text-align: center;
  padding: 8px 16px;
  background: var(--primary-alpha);
  border: 1px solid var(--primary);
  border-radius: 8px;
}

.gap-indicator span:first-child {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

.gap-indicator span:last-child {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.generation-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

.control-group select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
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

.generated-options {
  margin-top: 24px;
}

.generated-options h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  height: 120px;
  background: #000;
}

.option-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.option-info {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.confidence {
  font-size: 11px;
  color: var(--text-secondary);
}

.duration {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
}

.option-details {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.details-content h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.details-content p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}
`;

export default FillGapModal;</content>
<parameter name="filePath">src/lib/editor/aiTools.js