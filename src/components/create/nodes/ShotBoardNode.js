/**
 * Shot Board Node - 9-cell camera angle grid
 */

import { useState, useCallback } from 'react';
import { Handle } from '@xyflow/react';

const CAMERA_ANGLES = [
  { id: 'extreme-wide', name: 'Extreme Wide', emoji: '🌍' },
  { id: 'wide', name: 'Wide', emoji: '📹' },
  { id: 'medium-wide', name: 'Medium Wide', emoji: '📸' },
  { id: 'medium', name: 'Medium', emoji: '🎥' },
  { id: 'medium-close', name: 'Medium Close', emoji: '👤' },
  { id: 'close-up', name: 'Close Up', emoji: '👁️' },
  { id: 'extreme-close', name: 'Extreme Close', emoji: '🔍' },
  { id: 'over-shoulder', name: 'Over Shoulder', emoji: '👥' },
  { id: 'point-of-view', name: 'POV', emoji: '👀' }
];

export function ShotBoardNode({ data, id }) {
  const [referenceImage, setReferenceImage] = useState(data.referenceImage || null);
  const [generatedAngles, setGeneratedAngles] = useState(data.generatedAngles || {});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState(null);

  const generateAllAngles = useCallback(async () => {
    if (!referenceImage) {
      showToast('Please upload a reference image first');
      return;
    }

    setIsGenerating(true);
    try {
      const results = {};

      for (const angle of CAMERA_ANGLES) {
        const response = await fetch('/api/generate/camera-angle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceImage,
            angle: angle.id,
            prompt: `Generate a ${angle.name.toLowerCase()} shot of the subject`
          })
        });

        const result = await response.json();
        results[angle.id] = result.imageUrl;
      }

      setGeneratedAngles(results);
      data.generatedAngles = results;

    } catch (error) {
      console.error('Shot board generation failed:', error);
      showToast('Failed to generate camera angles');
    } finally {
      setIsGenerating(false);
    }
  }, [referenceImage]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImage(e.target.result);
        data.referenceImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="node shotboard-node">
      <div className="node-header">
        <span className="node-icon">📷</span>
        <span className="node-title">Shot Board</span>
      </div>

      <div className="node-content">
        <div className="reference-upload">
          <label>Reference Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
          />
          {referenceImage && (
            <div className="reference-preview">
              <img src={referenceImage} alt="Reference" />
            </div>
          )}
        </div>

        <button
          className={`generate-btn ${isGenerating ? 'loading' : ''}`}
          onClick={generateAllAngles}
          disabled={isGenerating || !referenceImage}
        >
          {isGenerating ? '🎬 Generating...' : '📷 Generate All Angles'}
        </button>

        <div className="camera-grid">
          {CAMERA_ANGLES.map((angle) => (
            <div
              key={angle.id}
              className={`camera-cell ${selectedAngle === angle.id ? 'selected' : ''}`}
              onClick={() => setSelectedAngle(angle.id)}
            >
              <div className="angle-emoji">{angle.emoji}</div>
              <div className="angle-name">{angle.name}</div>
              {generatedAngles[angle.id] && (
                <div className="angle-preview">
                  <img src={generatedAngles[angle.id]} alt={angle.name} />
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedAngle && generatedAngles[selectedAngle] && (
          <div className="selected-angle-details">
            <h4>{CAMERA_ANGLES.find(a => a.id === selectedAngle)?.name}</h4>
            <img src={generatedAngles[selectedAngle]} alt="Selected angle" />
            <button className="export-angle-btn">
              📤 Export to Timeline
            </button>
          </div>
        )}
      </div>

      <Handle type="target" position="left" />
      <Handle type="source" position="right" />
    </div>
  );
}</content>
<parameter name="filePath">src/components/create/nodes/ShotBoardNode.js