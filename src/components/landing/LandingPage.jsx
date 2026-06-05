// AI Video Agency Studio Landing Page
// Premium animated landing page with full HTML content

const ALL_APPS = [
  { id: 'image', title: 'Image', description: 'AI image generation with 20+ models including Flux, SDXL, GPT Image.', icon: '🖼️', link: '/image' },
  { id: 'video', title: 'Video', description: 'Text-to-video and image-to-video generation with motion control.', icon: '🎬', link: '/video' },
  { id: 'cinema', title: 'Cinema Studio', description: 'Cinematic video generator with professional presets and LUTs.', icon: '🎬', link: '/cinema' },
  { id: 'character', title: 'Character', description: 'Character creation and animation with AI.', icon: '🧑', link: '/character' },
  { id: 'ai-vfx', title: 'AI-VFX', description: 'Visual effects powered by AI - explosions, particles, simulations.', icon: '✨', link: '/ai-vfx' },
  { id: 'influencer', title: 'Influencer', description: 'Generate influencer-style content and virtual personas.', icon: '🌟', link: '/influencer' },
  { id: 'storyboard', title: 'Storyboard', description: 'Visual scene planning with drag-and-drop shot arrangement.', icon: '📋', link: '/storyboard' },
  { id: 'edit', title: 'Edit Studio', description: 'Precision video editing with trimming, splitting, and transitions.', icon: '✂️', link: '/edit' },
  { id: 'audio', title: 'Audio Studio', description: 'Multi-track audio mixing, effects, and voiceover tools.', icon: '🎵', link: '/audio' },
  { id: 'effects', title: 'Effects Studio', description: '100+ visual effects library with real-time preview.', icon: '🎭', link: '/effects' },
  { id: 'avatar', title: 'Avatar Studio', description: 'Create AI avatars and digital personalities.', icon: '👤', link: '/avatar' },
  { id: 'upscale', title: 'Upscale Studio', description: 'Enhance media quality with AI upscaling and restoration.', icon: '🔍', link: '/upscale' },
  { id: 'commercial', title: 'Commercial', description: 'Business-focused video creation for ads and marketing.', icon: '💼', link: '/commercial' },
  { id: 'render', title: 'Render Farm', description: 'Cloud-based video rendering with GPU acceleration.', icon: '🚀', link: '/render' },
  { id: 'video-agent', title: 'Video Agent', description: 'Autonomous AI agent for automated video creation.', icon: '🤖', link: '/video-agent' },
  { id: 'library', title: 'Media Library', description: 'Asset management and media browser.', icon: '📚', link: '/library' },
  { id: 'workflows', title: 'Workflows', description: 'Automated multi-step content production pipelines.', icon: '⚡', link: '/workflows' },
  { id: 'agents', title: 'Agents', description: 'Specialized AI agents for creative tasks.', icon: '🧠', link: '/agents' },
  { id: 'templates', title: 'Templates', description: 'Pre-built sequences and motion graphics templates.', icon: '📁', link: '/templates' },
  { id: 'training', title: 'Training', description: 'Train custom AI models on your own data.', icon: '🏋️', link: '/training' }
];

export default function LandingPage() {
  const container = document.createElement('div');
  container.className = 'landing-page';
  container.setAttribute('lang', document.documentElement.lang || 'en');
  container.setAttribute('dir', document.documentElement.dir || 'ltr');

  container.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Video Agency Studio - Create Cinematic AI Videos, Images & VFX</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #020205;
          color: #ffffff;
          overflow-x: hidden;
          line-height: 1.6;
        }
        
        /* Hero Section */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: linear-gradient(135deg, #020205 0%, #0a0a0f 50%, #020205 100%);
          overflow: hidden;
        }
        
        .hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
          animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 1200px;
          padding: 2rem;
        }
        
        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 9999px;
          margin-bottom: 2rem;
          animation: fadeInDown 0.8s ease-out;
        }
        
        .trust-badge-dot {
          width: 8px;
          height: 8px;
          background: #22d3ee;
          border-radius: 50%;
          animation: blink 2s infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: clamp(1.125rem, 2.5vw, 1.5rem);
          color: #a1a1aa;
          max-width: 800px;
          margin: 0 auto 2.5rem;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        
        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }
        
        .btn {
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          color: #020205;
          box-shadow: 0 10px 30px rgba(34, 211, 238, 0.3);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(34, 211, 238, 0.4);
        }
        
        .btn-secondary {
          background: transparent;
          color: #22d3ee;
          border: 2px solid rgba(34, 211, 238, 0.5);
        }
        
        .btn-secondary:hover {
          background: rgba(34, 211, 238, 0.1);
          border-color: #22d3ee;
        }
        
        .hero-stats {
          display: flex;
          gap: 3rem;
          justify-content: center;
          margin-top: 4rem;
          flex-wrap: wrap;
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }
        
        .stat {
          text-align: center;
        }
        
        .stat-value {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .stat-label {
          color: #a1a1aa;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        /* Sections */
        .section {
          padding: 6rem 2rem;
          position: relative;
        }
        
        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          text-align: center;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .section-subtitle {
          text-align: center;
          color: #a1a1aa;
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto 3rem;
        }
        
        /* Apps Grid */
        .apps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .app-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .app-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(34, 211, 238, 0.3);
          transform: translateY(-4px);
        }
        
        .app-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }
        
        .app-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }
        
        .app-desc {
          color: #a1a1aa;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        /* Features Section */
        .features {
          background: linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.03) 50%, transparent 100%);
        }
        
        /* CTA Section */
        .cta-section {
          text-align: center;
          padding: 6rem 2rem;
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
        }
        
        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
      </style>
    </head>
    <body>
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <div class="trust-badge">
            <span class="trust-badge-dot"></span>
            <span style="color: #22d3ee; font-size: 0.875rem; font-weight: 500;">Trusted by 10,000+ Creators & Agencies</span>
          </div>
          
          <h1>Create Cinematic AI Videos,<br>Images, VFX, Characters,<br>Agents & Commercials</h1>
          
          <p class="hero-subtitle">
            AI Video Agency Studio gives you a complete creative command center with 60+ AI-powered tools for generating videos, images, characters, commercials, cinematic effects, avatars, lip sync, dubbing, storyboards, edits, workflows, agents, and client-ready content packages.
          </p>
          
          <div class="hero-buttons">
            <a href="#/signup" class="btn btn-primary">
              Start Building My AI Video Agency
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
            <a href="#/video" class="btn btn-secondary">
              Watch The Demo
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              </svg>
            </a>
          </div>
          
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-value">33</div>
              <div class="stat-label">AI Creative Apps</div>
            </div>
            <div class="stat">
              <div class="stat-value">60+</div>
              <div class="stat-label">AI Features</div>
            </div>
            <div class="stat">
              <div class="stat-value">200+</div>
              <div class="stat-label">AI Models</div>
            </div>
            <div class="stat">
              <div class="stat-value">Lifetime</div>
              <div class="stat-label">Access</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Apps Grid Section -->
      <section class="section">
        <h2 class="section-title">33 AI Creative Apps</h2>
        <p class="section-subtitle">Everything you need to create professional AI-powered content</p>
        
        <div class="apps-grid" id="apps-grid">
          ${ALL_APPS.map(app => `
            <a href="${app.link}" class="app-card animate-on-scroll">
              <div class="app-icon">${app.icon || '🎯'}</div>
              <div class="app-title">${app.title}</div>
              <div class="app-desc">${app.description}</div>
            </a>
          `).join('')}
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <h2 class="section-title">Ready to Create?</h2>
        <p class="section-subtitle">Join thousands of creators and agencies using AI Video Agency Studio</p>
        <a href="#/signup" class="btn btn-primary" style="font-size: 1.125rem; padding: 1.25rem 2.5rem;">
          Get Started Free
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
      </section>

      <!-- Footer -->
      <footer style="text-align: center; padding: 2rem; border-top: 1px solid rgba(255,255,255,0.1); color: #71717a;">
        <p>© 2024 AI Video Agency Studio. All rights reserved.</p>
      </footer>
    </body>
    </html>
  `;

  // Add scroll animations
  setTimeout(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    container.querySelectorAll('.animate-on-scroll').forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.05}s`;
      observer.observe(el);
    });
  }, 100);

  return container;
}
