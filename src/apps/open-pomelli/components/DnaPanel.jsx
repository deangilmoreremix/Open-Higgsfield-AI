"use client";

import { useState } from "react";

const TONE_CHIPS = ['professional', 'casual', 'playful', 'serious', 'innovative', 'trustworthy', 'bold', 'minimal'];
const PERSONALITY_CHIPS = ['modern', 'classic', 'luxury', 'accessible', 'edgy', 'friendly', 'authoritative', 'approachable'];

export default function DnaPanel({ dna, onChange }) {
  const [editingColor, setEditingColor] = useState(null);

  const toggleChip = (type, value) => {
    const current = dna[type] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...dna, [type]: updated });
  };

  const updateColor = (index, newColor) => {
    const colors = [...(dna.colors || [])];
    colors[index] = newColor;
    onChange({ ...dna, colors });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-primary uppercase mb-2">Brand Name</h3>
        <input
          type="text"
          value={dna.name || ''}
          onChange={(e) => onChange({ ...dna, name: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          placeholder="Brand name..."
        />
      </div>

      <div>
        <h3 className="text-xs font-bold text-primary uppercase mb-2">Primary Colors</h3>
        <div className="flex gap-2 flex-wrap">
          {(dna.colors || []).map((color, i) => (
            <div key={i} className="relative">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={() => setEditingColor(i)}
              />
              {editingColor === i && (
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(i, e.target.value)}
                  onBlur={() => setEditingColor(null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  autoFocus
                />
              )}
            </div>
          ))}
          <button
            onClick={() => onChange({ ...dna, colors: [...(dna.colors || []), '#cccccc'] })}
            className="w-12 h-12 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center text-white/60 hover:border-primary"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-primary uppercase mb-2">Tone</h3>
        <div className="flex flex-wrap gap-2">
          {TONE_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => toggleChip('tone', chip)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                dna.tone?.includes(chip)
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-primary uppercase mb-2">Personality</h3>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => toggleChip('personality', chip)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                dna.personality?.includes(chip)
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}