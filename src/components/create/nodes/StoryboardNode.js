/**
 * Storyboard Node - Breaks scenes into sequential shots using LLM
 */

import { useState, useCallback } from 'react';
import { Handle } from '@xyflow/react';

export function StoryboardNode({ data, id }) {
  const [scene, setScene] = useState(data.scene || '');
  const [shots, setShots] = useState(data.shots || 3);
  const [llmModel, setLlmModel] = useState(data.llmModel || 'gemini');
  const [generatedShots, setGeneratedShots] = useState(data.generatedShots || []);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStoryboard = useCallback(async () => {
    if (!scene.trim()) {
      showToast('Please enter a scene description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/llm/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene,
          shotCount: shots,
          model: llmModel,
          style: 'cinematic'
        })
      });

      const result = await response.json();
      setGeneratedShots(result.shots);

      // Update node data
      data.generatedShots = result.shots;
      data.scene = scene;
      data.shots = shots;

    } catch (error) {
      console.error('Storyboard generation failed:', error);
      showToast('Failed to generate storyboard');
    } finally {
      setIsGenerating(false);
    }
  }, [scene, shots, llmModel]);

  return (
    <div className="node storyboard-node">
      <div className="node-header">
        <span className="node-icon">📚</span>
        <span className="node-title">Storyboard</span>
      </div>

      <div className="node-content">
        <div className="input-group">
          <label>Scene Description</label>
          <textarea
            placeholder="Describe the scene you want to break into shots..."
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            rows={3}
          />
        </div>

        <div className="input-group">
          <label>Number of Shots: {shots}</label>
          <input
            type="range"
            min="3"
            max="12"
            value={shots}
            onChange={(e) => setShots(parseInt(e.target.value))}
            className="shots-slider"
          />
        </div>

        <div className="input-group">
          <label>LLM Model</label>
          <select value={llmModel} onChange={(e) => setLlmModel(e.target.value)}>
            <option value="gemini">Google Gemini</option>
            <option value="claude">Anthropic Claude</option>
            <option value="gpt4">OpenAI GPT-4</option>
            <option value="llama">Llama 4</option>
          </select>
        </div>

        <button
          className={`generate-btn ${isGenerating ? 'loading' : ''}`}
          onClick={generateStoryboard}
          disabled={isGenerating}
        >
          {isGenerating ? '🎬 Generating...' : '🎬 Generate Shots'}
        </button>

        {generatedShots.length > 0 && (
          <div className="shots-preview">
            <h4>Generated Shots ({generatedShots.length})</h4>
            <div className="shots-list">
              {generatedShots.map((shot, index) => (
                <div key={index} className="shot-item">
                  <div className="shot-number">{index + 1}</div>
                  <div className="shot-content">
                    <div className="shot-description">{shot.description}</div>
                    <div className="shot-details">
                      <span className="camera-angle">{shot.cameraAngle}</span>
                      {shot.dialogue && <span className="dialogue">💬 {shot.dialogue}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle type="target" position="left" />
      <Handle type="source" position="right" />
    </div>
  );
}</content>
<parameter name="filePath">src/components/create/nodes/StoryboardNode.js