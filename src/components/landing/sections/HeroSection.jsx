// Hero Section - AI Video Agency Studio
// Cinematic design with direct-response positioning and premium motion

export function HeroSection() {
  const section = document.createElement('section');
  section.className = 'relative py-24 md:py-32 px-4 overflow-hidden min-h-screen flex items-center';
  section.setAttribute('role', 'banner');
  section.setAttribute('aria-labelledby', 'hero-headline');
  section.setAttribute('data-testid', 'hero-section');

  // Create parallax background layers
  section.innerHTML = `
    <!-- Parallax Background Layers -->
    <div class="parallax-layer parallax-base absolute inset-0 -z-10">
      <div class="absolute inset-0 bg-[#020205]"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-[#171b24] via-[#05070b] to-[#020205] opacity-90"></div>
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 3px 3px, rgba(34,211,238,0.15) 1px, transparent 0); background-size: 80px 80px;"></div>
    </div>
    <div class="parallax-layer parallax-deep absolute inset-0 -z-5" style="background-image: radial-gradient(circle at 20% 30%, rgba(34,211,238,0.08) 0%, transparent 50%); background-size: 400px 400px; animation: driftDeep 60s ease-in-out infinite;"></div>
    <div class="parallax-layer parallax-medium absolute inset-0 -z-7" style="background-image: radial-gradient(circle at 80% 70%, rgba(34,211,238,0.06) 0%, transparent 50%); background-size: 300px 300px; animation: driftMedium 45s ease-in-out infinite;"></div>
    <div class="parallax-layer parallax-shallow absolute inset-0 -z-3" style="background-image: radial-gradient(circle at 40% 60%, rgba(34,211,238,0.04) 0%, transparent 50%); background-size: 200px 200px; animation: driftShallow 30s ease-in-out infinite;"></div>

    <!-- Floating geometric shapes with animations -->
    <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl animate-pulse -z-5"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl animate-pulse -z-5" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 right-1/3 w-48 h-48 bg-purple-400/5 rounded-full blur-3xl animate-pulse -z-5" style="animation-delay: 1s;"></div>

    <div class="container mx-auto max-w-6xl text-center relative z-10">
      <!-- Trust Badge with entrance animation -->
      <div class="trust-badge opacity-0 translate-y-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 mb-8 shadow-lg shadow-cyan-400/20">
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span class="text-sm text-cyan-100 font-medium">Trusted by 10,000+ Creators & Agencies</span>
      </div>

      <!-- Main Headline with typewriter effect -->
      <h1 id="hero-headline" class="hero-headline mb-6 leading-tight opacity-0" style="max-width: 100%;">
        <span class="text-cyan-400 italic font-black" id="headline-part-1">Create Cinematic AI Videos,</span><br/>
        <span class="text-white font-black" id="headline-part-2">Images, VFX, Commercials,</span><br/>
        <span class="text-cyan-400 italic font-black" id="headline-part-3">Characters, Agents &</span><br/>
        <span class="text-white font-black" id="headline-part-4">Client-Ready Content</span><br/>
        <span class="text-cyan-400 italic font-black" id="headline-part-5">From One Powerful AI Studio</span>
      </h1>

      <!-- Subheadline -->
      <p class="hero-subheadline text-lg md:text-xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed font-medium opacity-0" style="font-size: clamp(1.125rem, 2.5vw, 1.25rem);">
        AI Video Agency Studio gives you a complete creative command center with 60+ AI-powered tools for generating videos, images, characters, commercials, cinematic effects, avatars, lip sync, dubbing, storyboards, edits, workflows, agents, and client-ready content packages — all from one organized platform.
      </p>

      <!-- Primary CTA with hover effects -->
      <div class="hero-cta flex flex-col sm:flex-row gap-4 justify-center mb-12 opacity-0">
        <button class="cta-primary px-8 md:px-12 py-4 bg-gradient-to-r from-cyan-400 to-cyan-300 text-[#020205] font-bold text-lg rounded-lg hover:from-cyan-300 hover:to-cyan-200 transition-all duration-300 shadow-2xl shadow-cyan-400/30 hover:shadow-cyan-300/50 hover:scale-105 group relative overflow-hidden">
          <span class="flex items-center justify-center gap-2">
            Start Building My AI Video Agency
            <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </span>
          <!-- Ripple effect -->
          <span class="ripple absolute inset-0"></span>
        </button>
        <button class="cta-secondary px-8 md:px-12 py-4 border-2 border-cyan-400/50 text-cyan-100 font-bold text-lg rounded-lg hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 backdrop-blur-sm group relative overflow-hidden">
          <span class="flex items-center justify-center gap-2">
            Watch The Demo Video
            <svg class="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            </svg>
          </span>
          <!-- Ripple effect -->
          <span class="ripple absolute inset-0"></span>
        </button>
      </div>

      <!-- Social Proof with stagger -->
      <div class="hero-stats flex flex-wrap justify-center gap-8 md:gap-12 text-sm opacity-0" role="region" aria-labelledby="stats-heading">
        <h2 id="stats-heading" class="sr-only">Platform Statistics</h2>
        <div class="stat-item text-center transform hover:scale-110 transition-transform duration-200">
          <div class="text-cyan-400 font-bold text-2xl md:text-3xl mb-1">33</div>
          <div class="text-gray-400">AI Creative Apps</div>
        </div>
        <div class="stat-item text-center transform hover:scale-110 transition-transform duration-200">
          <div class="text-emerald-400 font-bold text-2xl md:text-3xl mb-1">60+</div>
          <div class="text-gray-400">AI Features</div>
        </div>
        <div class="stat-item text-center transform hover:scale-110 transition-transform duration-200">
          <div class="text-cyan-400 font-bold text-2xl md:text-3xl mb-1">200+</div>
          <div class="text-gray-400">AI Models</div>
        </div>
        <div class="stat-item text-center transform hover:scale-110 transition-transform duration-200">
          <div class="text-cyan-400 font-bold text-2xl md:text-3xl mb-1">Lifetime</div>
          <div class="text-gray-400">Access</div>
        </div>
      </div>

      <!-- Scroll indicator with bounce animation -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-cyan-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </div>

    <style>
      /* Parallax animations */
      @keyframes driftDeep {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(20px, -20px) rotate(5deg); }
      }
      @keyframes driftMedium {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(-15px, 25px) rotate(-3deg); }
      }
      @keyframes driftShallow {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(10px, -15px) rotate(2deg); }
      }
      
      /* Typewriter effect */
      .hero-headline span {
        display: inline-block;
        opacity: 0;
      }
      
      /* Ripple effect */
      .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
      }
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
      
      /* Trust badge animation */
      @keyframes trustBadgePulse {
        0%, 100% { opacity: 0.6; transform: translateY(0px); }
        50% { opacity: 0.9; transform: translateY(-4px); }
      }
      .trust-badge {
        animation: trustBadgePulse 3s ease-in-out infinite;
      }
      
      /* Media queries for reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .animate-pulse, .animate-bounce { animation: none; }
        .trust-badge { animation: none; }
        .hero-headline span { opacity: 1 !important; }
        .parallax-layer { animation: none !important; }
      }
    </style>
  `;

  // Typewriter effect for headline
  setTimeout(() => {
    const parts = [
      document.getElementById('headline-part-1'),
      document.getElementById('headline-part-2'),
      document.getElementById('headline-part-3'),
      document.getElementById('headline-part-4'),
      document.getElementById('headline-part-5')
    ];
    let delay = 0;
    parts.forEach((part, index) => {
      setTimeout(() => {
        part.style.opacity = '1';
        part.style.transform = 'translateY(0)';
        part.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      }, delay);
      delay += 150; // 150ms between each part
    });
  }, 300);

  // Parallax effect on scroll
  let ticking = false;
  const updateParallax = () => {
    const scrollY = window.pageYOffset;
    const layers = section.querySelectorAll('.parallax-layer');
    layers.forEach(layer => {
      const speed = layer.getAttribute('data-speed') || 0.05;
      const yPos = scrollY * speed;
      layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
    ticking = false;
  };

  const scrollListener = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking = true;
      });
    }
  };

  window.addEventListener('scroll', scrollListener);
  
  // Cleanup on unmount (not perfect but best effort)
  section._cleanup = () => {
    window.removeEventListener('scroll', scrollListener);
  };

  return section;
}