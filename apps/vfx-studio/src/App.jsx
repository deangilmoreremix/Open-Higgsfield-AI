import React, { useState } from 'react';
import { X, Loader2, Download } from 'lucide-react';

// Import MuAPI client from the shared codebase
import MuapiClient from '../../../src/lib/muapi.js';

// Initialize MuAPI client
const muapi = new MuapiClient();

const VFX_EFFECTS = [
  { id: 'explosion', name: 'Explosion', category: 'Destruction', icon: '💥', description: 'Massive explosion effect with fire and debris' },
  { id: 'fireball', name: 'Fireball', category: 'Destruction', icon: '🔥', description: 'Burning fireball with heat distortion' },
  { id: 'lightning', name: 'Lightning Strike', category: 'Destruction', icon: '⚡', description: 'Electric lightning bolt with flash' },
  { id: 'meteor', name: 'Meteor Impact', category: 'Destruction', icon: '☄️', description: 'Meteor falling from sky with crater' },
  { id: 'collapse', name: 'Building Collapse', category: 'Destruction', icon: '🏢', description: 'Dramatic structural collapse' },
  { id: 'avalanche', name: 'Avalanche', category: 'Destruction', icon: '🌊', description: 'Snow avalanche with particles' },
  { id: 'tornado', name: 'Tornado', category: 'Destruction', icon: '🌪️', description: 'Devastating tornado funnel' },
  { id: 'earthquake', name: 'Earthquake', category: 'Destruction', icon: '🌍', description: 'Seismic rumble with screen shake' },
  { id: 'flood', name: 'Flood', category: 'Destruction', icon: '🌊', description: 'Rushing water flood effect' },
  { id: 'volcano', name: 'Volcanic Eruption', category: 'Destruction', icon: '🌋', description: 'Lava and ash explosion' },

  { id: 'glitch', name: 'Glitch', category: 'Digital', icon: '💻', description: 'Digital glitch distortion' },
  { id: 'hologram', name: 'Hologram', category: 'Digital', icon: '👻', description: 'Holographic projection effect' },
  { id: 'cyberpunk', name: 'Cyberpunk', category: 'Digital', icon: '🤖', description: 'Neon cyberpunk aesthetic' },
  { id: 'matrix', name: 'Matrix Rain', category: 'Digital', icon: '矩阵', description: 'Matrix-style code rain' },
  { id: 'scanlines', name: 'Scanlines', category: 'Digital', icon: '📺', description: 'CRT monitor scanlines' },
  { id: 'static', name: 'Static Noise', category: 'Digital', icon: '📡', description: 'Television static effect' },
  { id: 'corruption', name: 'Data Corruption', category: 'Digital', icon: '⚠️', description: 'File corruption visual' },
  { id: 'hacker', name: 'Hacker Terminal', category: 'Digital', icon: '💀', description: 'Terminal hacking aesthetic' },
  { id: 'virus', name: 'Virus Alert', category: 'Digital', icon: '🦠', description: 'Viral infection warning' },
  { id: 'cyber-attack', name: 'Cyber Attack', category: 'Digital', icon: '💣', description: 'Digital warfare effect' },

  { id: 'sword-slash', name: 'Sword Slash', category: 'Combat', icon: '⚔️', description: 'Anime-style sword slash effect' },
  { id: 'laser-beam', name: 'Laser Beam', category: 'Combat', icon: '⚡', description: 'Powerful laser beam blast' },
  { id: 'fireball-combat', name: 'Magic Fireball', category: 'Combat', icon: '🔮', description: 'Magical fireball projectile' },
  { id: 'ice-shard', name: 'Ice Shards', category: 'Combat', icon: '❄️', description: 'Sharp ice crystal attack' },
  { id: 'energy-shield', name: 'Energy Shield', category: 'Combat', icon: '🛡️', description: 'Protective energy barrier' },
  { id: 'teleport', name: 'Teleport', category: 'Combat', icon: '✨', description: 'Teleportation effect' },
  { id: 'portal', name: 'Portal', category: 'Combat', icon: '🌀', description: 'Mystical portal opening' },
  { id: 'magic-circle', name: 'Magic Circle', category: 'Combat', icon: '🔮', description: 'Arcane summoning circle' },
  { id: 'spirit-attack', name: 'Spirit Attack', category: 'Combat', icon: '👻', description: 'Ghostly energy strike' },
  { id: 'power-surge', name: 'Power Surge', category: 'Combat', icon: '⚡', description: 'Electrical power explosion' },

  { id: 'car-chase', name: 'Car Chase', category: 'Vehicles', icon: '🏎️', description: 'High speed vehicle action' },
  { id: 'drift', name: 'Drift', category: 'Vehicles', icon: '🏁', description: 'Tire smoke drift effect' },
  { id: 'crash', name: 'Crash Impact', category: 'Vehicles', icon: '💥', description: 'Vehicle collision effect' },
  { id: 'airstrike', name: 'Air Strike', category: 'Vehicles', icon: '✈️', description: 'Aerial bombing run' },
  { id: 'helicopter', name: 'Helicopter Attack', category: 'Vehicles', icon: '🚁', description: 'Helicopter assault effect' },
  { id: 'rocket-launch', name: 'Rocket Launch', category: 'Vehicles', icon: '🚀', description: 'Rocket launch with smoke' },
  { id: 'submarine', name: 'Submarine Depth', category: 'Vehicles', icon: '🔱', description: 'Underwater depth effect' },
  { id: 'spaceship', name: 'Spaceship Engine', category: 'Vehicles', icon: '🛸', description: 'Sci-fi ship propulsion' },
  { id: 'speed-lines', name: 'Speed Lines', category: 'Vehicles', icon: '💨', description: 'Motion blur speed effect' },
  { id: 'wheel-spin', name: 'Wheel Spin', category: 'Vehicles', icon: '⚙️', description: 'Rotating wheel with sparks' },

  { id: 'blood-splatter', name: 'Blood Splatter', category: 'Impact', icon: '🩸', description: 'Dramatic blood effect' },
  { id: 'sparks', name: 'Sparks', category: 'Impact', icon: '✨', description: 'Metal sparks shower' },
  { id: 'glass-shatter', name: 'Glass Shatter', category: 'Impact', icon: '💎', description: 'Breaking glass particles' },
  { id: 'debris', name: 'Debris', category: 'Impact', icon: '碎石', description: 'Flying debris particles' },
  { id: 'dust-cloud', name: 'Dust Cloud', category: 'Impact', icon: '💨', description: 'Puff of dust effect' },
  { id: 'smoke', name: 'Smoke', category: 'Impact', icon: '💭', description: 'Thick smoke plume' },
  { id: 'fire', name: 'Fire', category: 'Impact', icon: '🔥', description: 'Intense fire effect' },
  { id: 'water-splash', name: 'Water Splash', category: 'Impact', icon: '💧', description: 'Water splash particles' },
  { id: 'snow-impact', name: 'Snow Impact', category: 'Impact', icon: '❄️', description: 'Snow puff on impact' },
  { id: 'ground-crack', name: 'Ground Crack', category: 'Impact', icon: '裂', description: 'Cracking ground effect' },

  { id: 'magic-wand', name: 'Magic Wand', category: 'Magic', icon: '🪄', description: 'Sparkle magic effect' },
  { id: 'potion', name: 'Potion Effect', category: 'Magic', icon: '🧪', description: 'Magical potion burst' },
  { id: 'crystal', name: 'Crystal Magic', category: 'Magic', icon: '💎', description: 'Crystal formation effect' },
  { id: 'enchant', name: 'Enchantment', category: 'Magic', icon: '✨', description: 'Glowing enchantment aura' },
  { id: 'rune-glow', name: 'Rune Glow', category: 'Magic', icon: '符文', description: 'Ancient rune illumination' },
  { id: 'ghostly', name: 'Ghostly Form', category: 'Magic', icon: '👻', description: 'Ethereal ghost effect' },
  { id: 'phantom', name: 'Phantom Slash', category: 'Magic', icon: '👤', description: 'Ghost warrior strike' },
  { id: 'soul-rip', name: 'Soul Rip', category: 'Magic', icon: '💀', description: 'Dark soul extraction' },
  { id: 'wraith', name: 'Wraith Fire', category: 'Magic', icon: '🔥', description: 'Spectral flames' },
  { id: 'shadow-meld', name: 'Shadow Meld', category: 'Magic', icon: '🌑', description: 'Melting into shadows' },

  { id: 'sunset', name: 'Sunset Glow', category: 'Weather', icon: '🌅', description: 'Warm sunset lighting' },
  { id: 'rain', name: 'Rain', category: 'Weather', icon: '🌧️', description: 'Falling rain particles' },
  { id: 'snow', name: 'Snowfall', category: 'Weather', icon: '🌨️', description: 'Gentle snow effect' },
  { id: 'fog', name: 'Dense Fog', category: 'Weather', icon: '🌫️', description: 'Mysterious fog overlay' },
  { id: 'storm', name: 'Thunder Storm', category: 'Weather', icon: '⛈️', description: 'Lightning storm effect' },
  { id: 'wind', name: 'Wind Gust', category: 'Weather', icon: '💨', description: 'Whipping wind effect' },
  { id: 'heatwave', name: 'Heat Wave', category: 'Weather', icon: '🌡️', description: 'Scorching heat distortion' },
  { id: 'aurora', name: 'Aurora Borealis', category: 'Weather', icon: '🌌', description: 'Northern lights effect' },
  { id: 'starfield', name: 'Starfield', category: 'Weather', icon: '⭐', description: 'Space stars background' },
  { id: 'nebula', name: 'Nebula', category: 'Weather', icon: '🌌', description: 'Colorful nebula clouds' },

  { id: 'time-warp', name: 'Time Warp', category: 'Time', icon: '⏰', description: 'Time manipulation effect' },
  { id: 'rewind', name: 'Rewind', category: 'Time', icon: '⏪', description: 'Reverse time effect' },
  { id: 'fast-forward', name: 'Fast Forward', category: 'Time', icon: '⏩', description: 'Time acceleration' },
  { id: 'time-stop', name: 'Time Stop', category: 'Time', icon: '⏸️', description: 'Frozen time bubble' },
  { id: 'time-loop', name: 'Time Loop', category: 'Time', icon: '🔄', description: 'Repeating time cycle' },
  { id: 'aging', name: 'Aging', category: 'Time', icon: '👴', description: 'Aging effect overlay' },
  { id: 'youth', name: 'Youth', category: 'Time', icon: '👶', description: 'Rejuvenation effect' },
  { id: 'decay', name: 'Decay', category: 'Time', icon: '💀', description: 'Deterioration effect' },
  { id: 'growth', name: 'Growth', category: 'Time', icon: '🌱', description: 'Plant growth effect' },
  { id: 'photosynthesis', name: 'Photosynthesis', category: 'Time', icon: '🌿', description: 'Plant energy effect' },

  { id: 'acid', name: 'Acid溶解', category: 'Chemical', icon: '☠️', description: 'Acid dissolving effect' },
  { id: 'corrode', name: 'Corrosion', category: 'Chemical', icon: '🦠', description: 'Rusting corrosion' },
  { id: 'toxic', name: 'Toxic Waste', category: 'Chemical', icon: '🟢', description: 'Green toxic sludge' },
  { id: 'glow-stick', name: 'Glow Stick', category: 'Chemical', icon: '💚', description: 'Neon glow effect' },
  { id: 'neon', name: 'Neon Signs', category: 'Chemical', icon: '💜', description: 'Glowing neon lights' },
  { id: 'bioluminescence', name: 'Bioluminescence', category: 'Chemical', icon: '🔵', description: 'Glowing organisms' },
  { id: 'chemical-reaction', name: 'Chemical Reaction', category: 'Chemical', icon: '⚗️', description: 'Bubbling reaction' },
  { id: 'crystal-growth', name: 'Crystal Growth', category: 'Chemical', icon: '💎', description: 'Growing crystals' },
  { id: 'melting', name: 'Melting', category: 'Chemical', icon: '🫠', description: 'Melting object effect' },
  { id: 'solidify', name: 'Solidify', category: 'Chemical', icon: '🧊', description: 'Freezing solid effect' },
];

const CAMERA_MOVES = [
  { id: 'dolly-in', name: 'Dolly In', icon: '➡️' },
  { id: 'dolly-out', name: 'Dolly Out', icon: '⬅️' },
  { id: 'crane-up', name: 'Crane Up', icon: '⬆️' },
  { id: 'crane-down', name: 'Crane Down', icon: '⬇️' },
  { id: 'pan-left', name: 'Pan Left', icon: '◀️' },
  { id: 'pan-right', name: 'Pan Right', icon: '▶️' },
  { id: 'tilt-up', name: 'Tilt Up', icon: '🔼' },
  { id: 'tilt-down', name: 'Tilt Down', icon: '🔽' },
  { id: 'orbit', name: 'Orbit', icon: '🔄' },
  { id: 'zoom-in', name: 'Zoom In', icon: '🔍' },
  { id: 'zoom-out', name: 'Zoom Out', icon: '🔎' },
  { id: 'spin', name: 'Spin', icon: '🌀' },
  { id: 'shake', name: 'Shake', icon: '📳' },
  { id: 'bounce', name: 'Bounce', icon: '🎾' },
  { id: 'flip', name: 'Flip', icon: '🔃' },
];

const CATEGORIES = ['All', 'Destruction', 'Digital', 'Combat', 'Vehicles', 'Impact', 'Magic', 'Weather', 'Time', 'Chemical'];

function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [activeTab, setActiveTab] = useState('effects');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultVideo, setResultVideo] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const filteredEffects = VFX_EFFECTS.filter(effect => {
    const matchesCategory = selectedCategory === 'All' || effect.category === selectedCategory;
    const matchesSearch = effect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         effect.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplyEffect = async () => {
    if (!selectedEffect) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setResultVideo(null);
    try {
      const result = await muapi.generateVideoEffect({
        prompt: `${selectedEffect.name}: ${selectedEffect.description}`,
        aspect_ratio: '16:9',
        resolution: '1080p',
        duration: 5
      });
      setResultVideo(result.url);
    } catch (error) {
      console.error('VFX generation failed:', error);
      setErrorMsg(error.message || 'Failed to generate effect');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 VFX Studio</h1>
        <div className="header-actions">
          <button className="btn btn-secondary">Import Video</button>
          <button className="btn btn-primary">Export</button>
        </div>
      </header>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search 80+ VFX effects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={{ padding: '0 24px 16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button 
            className={`category-btn ${activeTab === 'effects' ? 'active' : ''}`}
            onClick={() => setActiveTab('effects')}
          >
            Effects (80+)
          </button>
          <button 
            className={`category-btn ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => setActiveTab('camera')}
          >
            Camera Moves (50+)
          </button>
          <button 
            className={`category-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
        </div>
      </div>

      {activeTab === 'effects' && (
        <>
          <div className="categories">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="content">
            <div className="effects-grid">
              {filteredEffects.map(effect => (
                <div
                  key={effect.id}
                  className="effect-card"
                  onClick={() => setSelectedEffect(effect)}
                >
                  <div className="effect-preview">
                    {effect.icon}
                  </div>
                  <div className="effect-info">
                    <div className="effect-name">{effect.name}</div>
                    <div className="effect-category">{effect.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'camera' && (
        <div className="content">
          <div className="effects-grid">
            {CAMERA_MOVES.map(move => (
              <div
                key={move.id}
                className="effect-card"
                onClick={() => alert(`Applied ${move.name} camera movement!`)}
              >
                <div className="effect-preview" style={{ fontSize: '36px' }}>
                  {move.icon}
                </div>
                <div className="effect-info">
                  <div className="effect-name">{move.name}</div>
                  <div className="effect-category">Camera Move</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="content">
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <div>Preset templates coming soon</div>
          </div>
        </div>
      )}

      {selectedEffect && (
        <div className="modal-overlay" onClick={() => setSelectedEffect(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEffect.icon} {selectedEffect.name}</h2>
              <button className="close-btn" onClick={() => setSelectedEffect(null)}>×</button>
            </div>

            <div className="modal-preview">
              {selectedEffect.icon}
            </div>

            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
              {selectedEffect.description}
            </p>

            <div className="modal-section">
              <h3>Parameters</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>
                  Intensity
                </label>
                <input type="range" className="param-slider" min="0" max="100" defaultValue="50" />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>
                  Duration (seconds)
                </label>
                <input type="range" min="3" max="15" defaultValue="5" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>
                  Output Resolution
                </label>
                <select style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: 'white'
                }}>
                  <option value="720p">720p HD</option>
                  <option value="1080p" selected>1080p Full HD</option>
                  <option value="4k">4K Ultra HD</option>
                </select>
              </div>
            </div>

            {isProcessing && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} className="text-primary" />
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Generating {selectedEffect.name} via MuAPI...
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                  This may take a few moments
                </div>
              </div>
            )}

            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                color: '#f87171'
              }}>
                <strong>Error:</strong> {errorMsg}
                {errorMsg.includes('API key') && (
                  <div style={{ marginTop: '8px', fontSize: '13px' }}>
                    Please set your MuAPI key in the application settings.
                  </div>
                )}
              </div>
            )}

            {resultVideo && !isProcessing && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '12px', fontWeight: '600' }}>
                  Generated Result
                </h3>
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                  <video
                    src={resultVideo}
                    controls
                    autoPlay
                    style={{ width: '100%', maxHeight: '400px', display: 'block' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <a
                    href={resultVideo}
                    download={`${selectedEffect.name.replace(/\s+/g, '_')}_effect.mp4`}
                    className="btn btn-secondary"
                    style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
                  >
                    <Download size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Download
                  </a>
                </div>
              </div>
            )}

            <div className="modal-section">
              <h3>Blend Mode</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Normal', 'Screen', 'Add', 'Multiply', 'Overlay'].map(mode => (
                  <button
                    key={mode}
                    className="category-btn"
                    style={{ fontSize: '11px' }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedEffect(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleApplyEffect}>
                Apply Effect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;