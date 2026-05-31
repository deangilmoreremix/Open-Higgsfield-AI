"use client";

import { useState } from 'react';

const CAMPAIGN_GOALS = [
  { id: 'product-launch', name: 'Product Launch', description: 'Introduce new products to market' },
  { id: 'lead-generation', name: 'Lead Generation', description: 'Capture potential customer info' },
  { id: 'awareness', name: 'Awareness', description: 'Build brand recognition' },
  { id: 'engagement', name: 'Engagement', description: 'Drive interaction and sharing' },
  { id: 'thought-leadership', name: 'Thought Leadership', description: 'Establish expertise and authority' },
  { id: 'sales', name: 'Sales', description: 'Directly drive purchases' }
];

export default function CampaignPicker({ brandDNA, onGenerate }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [direction, setDirection] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!selectedGoal || !brandDNA) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pomelli/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: selectedGoal, direction, brandDNA })
      });
      
      if (!response.ok) throw new Error('Failed to generate campaign');
      
      const concepts = await response.json();
      if (onGenerate) {
        onGenerate(concepts);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate campaign concepts');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold text-primary uppercase">Campaign Goal</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {CAMPAIGN_GOALS.map(goal => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoal(goal.id)}
            className={`p-4 rounded-lg border transition-all text-left ${
              selectedGoal === goal.id
                ? 'border-primary bg-primary/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className={`font-bold text-sm ${
              selectedGoal === goal.id ? 'text-primary' : 'text-white'
            }`}>
              {goal.name}
            </div>
            <div className="text-xs text-white/40 mt-1">
              {goal.description}
            </div>
          </button>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-bold text-primary uppercase mb-2">Optional Direction</h3>
        <textarea
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          placeholder="Additional context or direction for the campaign..."
          className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={generating || !selectedGoal || !brandDNA}
        className="px-6 py-2 bg-primary text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
        ) : (
          'Generate Campaign'
        )}
      </button>
    </div>
  );
}