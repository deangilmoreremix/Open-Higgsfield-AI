/**
 * SAM3 Segmentation Node - Object segmentation with multiple modes
 */

import { useState, useRef, useCallback } from 'react';
import { Handle } from '@xyflow/react';

const SEGMENTATION_MODES = [
  { id: 'text', name: 'Text Prompt', icon: '📝' },
  { id: 'click', name: 'Click', icon: '👆' },
  { id: 'box', name: 'Box', icon: '▭' }
];

const PREVIEW_MODES = [
  { id: 'overlay', name: 'Red Overlay', color: '#ef4444' },
  { id: 'mask', name: 'White/Black', description: 'White foreground, black background' },
  { id: 'cutout', name: 'Cutout', description: 'Transparent background' }
];

export function SAM3Node({ data, id }) {
  const [mode, setMode] = useState(data.mode || 'text');
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [previewMode, setPreviewMode] = useState(data.previewMode || 'overlay');
  const [inputImage, setInputImage] = useState(data.inputImage || null);
  const [segmentedImage, setSegmentedImage] = useState(data.segmentedImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clickPoints, setClickPoints] = useState(data.clickPoints || []);
  const [boxSelection, setBoxSelection] = useState(data.boxSelection || null);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputImage(e.target.result);
        data.inputImage = e.target.result;
        // Reset segmentation results
        setSegmentedImage(null);
        setClickPoints([]);
        setBoxSelection(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processSegmentation = useCallback(async () => {
    if (!inputImage) {
      showToast('Please upload an image first');
      return;
    }

    if (mode === 'text' && !prompt.trim()) {
      showToast('Please enter a text prompt');
      return;
    }

    if (mode === 'click' && clickPoints.length === 0) {
      showToast('Please click on the object to segment');
      return;
    }

    if (mode === 'box' && !boxSelection) {
      showToast('Please draw a box around the object');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/sam3/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: inputImage,
          mode,
          prompt: mode === 'text' ? prompt : null,
          clickPoints: mode === 'click' ? clickPoints : null,
          box: mode === 'box' ? boxSelection : null,
          previewMode
        })
      });

      const result = await response.json();
      setSegmentedImage(result.segmentedImage);
      data.segmentedImage = result.segmentedImage;

    } catch (error) {
      console.error('SAM3 segmentation failed:', error);
      showToast('Segmentation failed');
    } finally {
      setIsProcessing(false);
    }
  }, [inputImage, mode, prompt, clickPoints, boxSelection, previewMode]);

  const handleCanvasClick = (event) => {
    if (mode !== 'click' || !inputImage) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newPoint = { x, y, type: 'positive' }; // Could add negative points
    setClickPoints([...clickPoints, newPoint]);
  };

  const startBoxSelection = (event) => {
    if (mode !== 'box') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    const handleMouseMove = (moveEvent) => {
      const currentX = moveEvent.clientX - rect.left;
      const currentY = moveEvent.clientY - rect.top;

      setBoxSelection({
        x: Math.min(startX, currentX),
        y: Math.min(startY, currentY),
        width: Math.abs(currentX - startX),
        height: Math.abs(currentY - startY)
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="node sam3-node">
      <div className="node-header">
        <span className="node-icon">🎯</span>
        <span className="node-title">SAM3 Segmentation</span>
      </div>

      <div className="node-content">
        <div className="input-group">
          <label>Input Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
          />
        </div>

        <div className="input-group">
          <label>Segmentation Mode</label>
          <div className="mode-selector">
            {SEGMENTATION_MODES.map((m) => (
              <button
                key={m.id}
                className={`mode-btn ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                <span className="mode-icon">{m.icon}</span>
                <span className="mode-name">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        {mode === 'text' && (
          <div className="input-group">
            <label>Text Prompt</label>
            <input
              type="text"
              placeholder="e.g., 'the person in the foreground'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        )}

        <div className="input-group">
          <label>Preview Mode</label>
          <div className="preview-modes">
            {PREVIEW_MODES.map((pm) => (
              <button
                key={pm.id}
                className={`preview-btn ${previewMode === pm.id ? 'active' : ''}`}
                onClick={() => setPreviewMode(pm.id)}
                title={pm.description}
              >
                {pm.name}
              </button>
            ))}
          </div>
        </div>

        <div className="image-preview">
          {inputImage && (
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                onClick={mode === 'click' ? handleCanvasClick : undefined}
                onMouseDown={mode === 'box' ? startBoxSelection : undefined}
                style={{ cursor: mode === 'click' ? 'crosshair' : mode === 'box' ? 'crosshair' : 'default' }}
              />
              {inputImage && <img ref={imageRef} src={inputImage} alt="Input" style={{ display: 'none' }} />}

              {/* Click points visualization */}
              {mode === 'click' && clickPoints.map((point, index) => (
                <div
                  key={index}
                  className="click-point"
                  style={{
                    left: point.x - 5,
                    top: point.y - 5,
                    backgroundColor: point.type === 'positive' ? '#10b981' : '#ef4444'
                  }}
                />
              ))}

              {/* Box selection visualization */}
              {mode === 'box' && boxSelection && (
                <div
                  className="box-selection"
                  style={{
                    left: boxSelection.x,
                    top: boxSelection.y,
                    width: boxSelection.width,
                    height: boxSelection.height
                  }}
                />
              )}
            </div>
          )}
        </div>

        <button
          className={`segment-btn ${isProcessing ? 'loading' : ''}`}
          onClick={processSegmentation}
          disabled={isProcessing || !inputImage}
        >
          {isProcessing ? '🎯 Processing...' : '🎯 Segment Object'}
        </button>

        {segmentedImage && (
          <div className="segmentation-result">
            <h4>Segmentation Result</h4>
            <img src={segmentedImage} alt="Segmented" />
            <div className="result-actions">
              <button className="download-btn">📥 Download</button>
              <button className="export-btn">📤 Export to Timeline</button>
            </div>
          </div>
        )}
      </div>

      <Handle type="target" position="left" />
      <Handle type="source" position="right" />
    </div>
  );
}</content>
<parameter name="filePath">src/components/create/nodes/SAM3Node.js