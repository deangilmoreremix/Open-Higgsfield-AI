import { navigate } from '../lib/router.js';
import { createHeroSection } from '../lib/thumbnails.js';
import { showToast } from '../lib/loading.js';

const SHOT_TYPES = ['Wide Shot', 'Medium Shot', 'Close-Up', 'Extreme Close-Up', 'POV', 'Overhead', 'Low Angle'];

const CUTAI_FEATURES = [
  { icon: '🤖', title: 'AI Script Generation', description: 'Generate complete screenplays from genre and premise' },
  { icon: '📝', title: 'Shot-by-Shot Breakdown', description: 'Professional scene analysis with camera angles and movements' },
  { icon: '🎨', title: 'Mood Analysis', description: '4D mood scoring with interactive graphs' },
  { icon: '🎵', title: 'Soundtrack Vibes', description: 'AI-suggested music genres and reference tracks' },
  { icon: '📊', title: 'Visual Timeline', description: 'React Flow-powered timeline with scene connections' },
  { icon: '📄', title: 'PDF Export', description: 'Professional storyboard documents with mood bars' },
  { icon: '🗂️', title: 'Project Management', description: 'Create, duplicate, and manage storyboard projects' },
  { icon: '🎬', title: 'Storyboard Canvas', description: 'Drag-and-drop scene cards with rich text formatting' },
];

const EXAMPLE_SCENES = [
  { 
    genre: 'Action', 
    title: 'Hero escapes burning building',
    shots: ['Wide shot of burning building', 'Close-up hero face with determination', 'Tracking shot following hero through flames'] 
  },
  { 
    genre: 'Drama', 
    title: 'Romantic confession at sunset', 
    shots: ['Medium shot couple facing each other', 'Slow zoom on emotional expressions', 'Wide shot of sunset backdrop'] 
  },
  { 
    genre: 'Horror', 
    title: 'Discovery in abandoned house', 
    shots: ['POV walking through dark hallway', 'Jump cut to monster reveal', 'Extreme close-up on terrified eyes'] 
  },
];

export function CutAIPage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col items-center bg-app-bg relative p-4 md:p-6 overflow-y-auto custom-scrollbar overflow-x-hidden';

  // Hero
  const hero = document.createElement('div');
  hero.className = 'flex flex-col items-center mb-8 md:mb-12 animate-fade-in-up transition-all duration-700 w-full max-w-5xl';
  const heroBanner = createHeroSection('storyboard', 'h-32 md:h-44 mb-4');
  if (heroBanner) {
    const heroContent = document.createElement('div');
    heroContent.className = 'absolute bottom-0 left-0 right-0 p-6 z-10';
    heroContent.innerHTML = `
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-1">AI Storyboarder</h1>
      <p class="text-white/60 text-sm font-medium">Turn ideas into professional film storyboards with AI scene analysis</p>
    `;
    heroBanner.appendChild(heroContent);
    hero.appendChild(heroBanner);
  }
  container.appendChild(hero);

  // Content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'w-full max-w-5xl relative z-40 animate-fade-in-up';
  contentWrapper.style.animationDelay = '0.1s';

  contentWrapper.innerHTML = `
    <!-- Features -->
    <div class="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-4 md:p-6 shadow-3xl mb-6">
      <h2 class="text-xl font-black text-white mb-1">AI-Powered Storyboarding</h2>
      <p class="text-sm text-muted mb-6">Complete film production planning with AI script generation and mood analysis</p>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${CUTAI_FEATURES.map(f => `
          <div class="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-primary/20 transition-all duration-300">
            <div class="text-3xl mb-3">${f.icon}</div>
            <h3 class="text-base font-black text-white mb-1">${f.title}</h3>
            <p class="text-muted text-sm">${f.description}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Shot Types -->
    <div class="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-4 md:p-6 shadow-3xl mb-6">
      <h2 class="text-xl font-black text-white mb-1">Professional Shot Types</h2>
      <p class="text-sm text-muted mb-6">Industry-standard camera compositions for cinematic storytelling</p>
      <div class="flex flex-wrap gap-3">
        ${SHOT_TYPES.map(shot => `
          <span class="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-medium text-sm hover:border-primary/20 transition-all cursor-pointer">${shot}</span>
        `).join('')}
      </div>
    </div>

    <!-- Example Scenes -->
    <div class="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-4 md:p-6 shadow-3xl mb-6">
      <h2 class="text-xl font-black text-white mb-1">Example AI-Generated Scenes</h2>
      <p class="text-sm text-muted mb-6">See how CutAI breaks down scripts into professional shot sequences</p>
      <div class="grid md:grid-cols-3 gap-4">
        ${EXAMPLE_SCENES.map(s => `
          <div class="scene-card bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-primary/20 transition-all duration-300 cursor-pointer">
            <div class="mb-3">
              <span class="text-xs font-bold px-3 py-1 rounded-lg bg-primary/10 text-primary">${s.genre}</span>
            </div>
            <h4 class="text-white font-bold text-sm mb-2">${s.title}</h4>
            <ul class="text-white/70 text-xs space-y-1">
              ${s.shots.map(shot => `<li>• ${shot}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- CTA -->
    <div class="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6 md:p-8 shadow-3xl text-center">
      <h2 class="text-xl font-black text-white mb-2">Launch AI Storyboarder</h2>
      <p class="text-sm text-muted mb-6">Create professional storyboards with AI scene analysis, mood scoring, and soundtrack vibes</p>
      <button class="cta-btn bg-primary text-black px-6 py-2.5 rounded-xl font-black text-sm hover:shadow-glow hover:scale-105 active:scale-95 transition-all">
        Start Storyboarding
      </button>
    </div>
  `;

  container.appendChild(contentWrapper);

  // Modal for CutAI editor
  const editorModal = document.createElement('div');
  editorModal.className = 'fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-2 sm:p-4';
  editorModal.setAttribute('role', 'dialog');
  editorModal.setAttribute('aria-modal', 'true');
  editorModal.setAttribute('aria-labelledby', 'modal-title');
  editorModal.innerHTML = `
    <div class="bg-app-bg rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" role="document">
      <div class="p-6 border-b border-white/10">
        <div class="flex justify-between items-center">
          <div>
            <h2 id="modal-title" class="text-xl font-black text-white">CutAI Storyboard Editor</h2>
            <p class="text-white/60 text-sm">v1.0.0 - AI-Powered Storyboarding</p>
          </div>
          <button class="close-modal text-white/60 hover:text-white text-2xl" aria-label="Close modal">&times;</button>
        </div>
      </div>
      <div class="p-6">
        <div class="flex gap-4 mb-6">
          <button class="save-project bg-white/10 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/20">Save Project</button>
          <button class="load-project bg-white/10 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/20">Load Project</button>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-bold text-white mb-2">Genre</label>
          <input type="text" class="genre-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary transition-colors" placeholder="e.g., Action, Drama, Horror" title="Choose a genre for your storyboard">
        </div>
        <div class="mb-6">
          <label class="block text-sm font-bold text-white mb-2">Premise</label>
          <textarea class="premise-input w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white h-24 focus:border-primary transition-colors resize-none" placeholder="Describe your story premise..." title="Describe the core idea or plot of your story"></textarea>
        </div>
        <button class="generate-script bg-primary text-black px-4 py-2 rounded-lg font-bold hover:shadow-glow" aria-label="Generate AI storyboard script">
          <span class="generate-text">Generate Script</span>
          <span class="loading-spinner hidden animate-spin inline-block ml-2">⏳</span>
        </button>
        <div class="scenes-container mt-6 hidden">
          <h3 class="text-lg font-bold text-white mb-4">Generated Scenes</h3>
          <div class="scenes-list space-y-4 mb-6"></div>
          <button class="create-canvas bg-primary text-black px-4 py-2 rounded-lg font-bold">Create Storyboard Canvas</button>
          <div class="canvas-container mt-6 hidden">
            <h4 class="text-white font-bold mb-4">Storyboard Canvas</h4>
            <div class="canvas-area bg-white/5 border border-white/10 rounded-lg p-4 min-h-96 flex flex-wrap gap-4 mb-6"></div>
            <div class="flex gap-4 mt-4">
              <button class="show-mood bg-primary text-black px-4 py-2 rounded-lg font-bold">Show Mood Analysis</button>
              <button class="export-json bg-white/10 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/20">Export JSON</button>
            </div>
            <div class="mood-graph mt-4 hidden">
              <canvas id="moodCanvas" width="600" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(editorModal);

  // CTA button opens modal
  container.querySelector('.cta-btn').onclick = () => {
    editorModal.classList.remove('hidden');
    // Focus first input
    editorModal.querySelector('.genre-input').focus();
  };

  // Close modal
  const closeModal = () => {
    editorModal.classList.add('hidden');
    // Clear any running animations or timers
    const canvas = editorModal.querySelector('#moodCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  editorModal.querySelector('.close-modal').onclick = closeModal;

  // Click outside to close
  editorModal.onclick = (e) => {
    if (e.target === editorModal) {
      closeModal();
    }
  };

  // Keyboard navigation
  const handleKeydown = (e) => {
    if (e.key === 'Escape' && !editorModal.classList.contains('hidden')) {
      closeModal();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  // Cleanup on component unmount (placeholder for framework integration)
  container.cleanup = () => {
    document.removeEventListener('keydown', handleKeydown);
  };

  // Save project
  editorModal.querySelector('.save-project').onclick = () => {
    try {
      const genre = editorModal.querySelector('.genre-input').value.trim();
      const premise = editorModal.querySelector('.premise-input').value.trim();
      const scenes = editorModal.querySelector('.scenes-list') ? Array.from(editorModal.querySelectorAll('.scenes-list > div')).map(() => ({})) : []; // Placeholder
      const project = { genre, premise, scenes, timestamp: Date.now() };
      localStorage.setItem('cutai-project', JSON.stringify(project));
      showToast('Project saved successfully');
    } catch (error) {
      showToast('Error saving project: ' + error.message);
    }
  };

  // Load project
  editorModal.querySelector('.load-project').onclick = () => {
    try {
      const saved = localStorage.getItem('cutai-project');
      if (saved) {
        const project = JSON.parse(saved);
        editorModal.querySelector('.genre-input').value = project.genre || '';
        editorModal.querySelector('.premise-input').value = project.premise || '';
        if (project.scenes && project.scenes.length > 0) {
          displayScenes(editorModal, project.scenes);
        }
        showToast('Project loaded successfully');
      } else {
        showToast('No saved project found');
      }
    } catch (error) {
      showToast('Error loading project: ' + error.message);
    }
  };

  // Generate script
  editorModal.querySelector('.generate-script').onclick = async () => {
    const genreInput = editorModal.querySelector('.genre-input');
    const premiseInput = editorModal.querySelector('.premise-input');
    const genre = genreInput.value.trim();
    const premise = premiseInput.value.trim();

    if (!genre) {
      showToast('Please enter a genre');
      genreInput.focus();
      return;
    }
    if (!premise) {
      showToast('Please enter a premise');
      premiseInput.focus();
      return;
    }
    if (premise.length < 10) {
      showToast('Premise should be at least 10 characters');
      premiseInput.focus();
      return;
    }

    const btn = editorModal.querySelector('.generate-script');
    const textSpan = btn.querySelector('.generate-text');
    const spinner = btn.querySelector('.loading-spinner');

    btn.disabled = true;
    textSpan.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI generation
      const scenes = generateMockScenes(genre, premise);
      displayScenes(editorModal, scenes);

      // Save scenes to project
      const project = { genre, premise, scenes };
      localStorage.setItem('cutai-project', JSON.stringify(project));

      showToast('Storyboard generated successfully!');
    } catch (error) {
      showToast('Error generating storyboard: ' + error.message);
    } finally {
      btn.disabled = false;
      textSpan.classList.remove('hidden');
      spinner.classList.add('hidden');
    }
  };

  function generateMockScenes(genre, premise) {
    // Mock AI response
    return [
      {
        title: 'Opening Scene',
        description: `The story begins with ${premise.toLowerCase()}.`,
        shots: [
          { type: 'Wide Shot', description: 'Establishing the setting' },
          { type: 'Medium Shot', description: 'Introducing main character' },
          { type: 'Close-Up', description: 'Emotional reaction' }
        ],
        mood: { tension: 3, emotion: 5, energy: 7, darkness: 2 }
      },
      {
        title: 'Climax Scene',
        description: `The tension builds as ${premise.toLowerCase()}.`,
        shots: [
          { type: 'POV', description: 'Character perspective' },
          { type: 'Extreme Close-Up', description: 'Intense moment' },
          { type: 'Wide Shot', description: 'Full action reveal' }
        ],
        mood: { tension: 8, emotion: 6, energy: 9, darkness: 4 }
      }
    ];
  }

  function displayScenes(modal, scenes) {
    const container = modal.querySelector('.scenes-container');
    const list = modal.querySelector('.scenes-list');
    list.innerHTML = '';
    scenes.forEach(scene => {
      const sceneEl = document.createElement('div');
      sceneEl.className = 'bg-white/5 border border-white/10 rounded-lg p-4';
      sceneEl.innerHTML = `
        <h4 class="text-white font-bold mb-2">${scene.title}</h4>
        <p class="text-white/70 text-sm mb-3">${scene.description}</p>
        <div class="mb-3">
          <strong class="text-white text-sm">Shots:</strong>
          <ul class="text-white/70 text-xs mt-1 space-y-1">
            ${scene.shots.map(shot => `<li>• ${shot.type}: ${shot.description}</li>`).join('')}
          </ul>
        </div>
        <div class="mood-display">
          <strong class="text-white text-sm">Mood:</strong>
          <div class="flex gap-2 mt-1">
            <span class="text-xs">Tension: ${scene.mood.tension}</span>
            <span class="text-xs">Emotion: ${scene.mood.emotion}</span>
            <span class="text-xs">Energy: ${scene.mood.energy}</span>
            <span class="text-xs">Darkness: ${scene.mood.darkness}</span>
          </div>
        </div>
      `;
      list.appendChild(sceneEl);
    });
    container.classList.remove('hidden');

    // Add create canvas button event
    modal.querySelector('.create-canvas').onclick = () => {
      createStoryboardCanvas(modal, scenes);
    };

    // Add mood graph event
    modal.querySelector('.show-mood').onclick = () => {
      drawMoodGraph(modal, scenes);
    };

    // Add export event
    modal.querySelector('.export-json').onclick = () => {
      const data = JSON.stringify(scenes, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'storyboard.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Storyboard exported as JSON');
    };
  }

  function createStoryboardCanvas(modal, scenes) {
    const canvasArea = modal.querySelector('.canvas-area');
    canvasArea.innerHTML = '';
    scenes.forEach((scene, index) => {
      const card = document.createElement('div');
      card.className = 'scene-card bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 rounded-lg p-4 w-64 cursor-move';
      card.draggable = true;
      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <span class="text-white font-bold text-sm">Scene ${index + 1}</span>
          <button class="text-white/60 hover:text-white text-xs">✏️</button>
        </div>
        <h5 class="text-white font-semibold mb-2">${scene.title}</h5>
        <p class="text-white/70 text-xs mb-3">${scene.description}</p>
        <div class="mood-bar h-2 bg-white/20 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-red-500 to-blue-500" style="width: ${scene.mood.tension * 10}%"></div>
        </div>
      `;
      canvasArea.appendChild(card);
    });
    modal.querySelector('.canvas-container').classList.remove('hidden');
  }

  function drawMoodGraph(modal, scenes) {
    const canvas = modal.querySelector('#moodCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;

    // Draw axes
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw mood lines
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
    const moods = ['tension', 'emotion', 'energy', 'darkness'];

    moods.forEach((mood, i) => {
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      ctx.beginPath();
      scenes.forEach((scene, j) => {
        const x = padding + (j / (scenes.length - 1)) * plotWidth;
        const y = height - padding - (scene.mood[mood] / 10) * plotHeight;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    modal.querySelector('.mood-graph').classList.remove('hidden');
  }

  return container;

  return container;
}