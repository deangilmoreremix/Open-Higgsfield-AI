import { navigate } from '../lib/router.js';

const CONTESTS = [
  {
    id: 'weekly-theme',
    title: 'Weekly Theme Challenge',
    description: 'Create your best AI generation matching this week\'s theme. Community votes decide the winner.',
    theme: 'Underwater Worlds',
    status: 'active',
    deadline: 'Mar 16, 2026',
    entries: 142,
    prize: 'Featured on homepage + 500 credits',
  },
  {
    id: 'best-portrait',
    title: 'Best AI Portrait',
    description: 'Submit your most impressive AI-generated portrait. Judged on creativity, realism, and composition.',
    theme: 'Cinematic Portraits',
    status: 'active',
    deadline: 'Mar 20, 2026',
    entries: 89,
    prize: 'Pro membership (1 month)',
  },
  {
    id: 'video-magic',
    title: 'Video Magic Showdown',
    description: 'Use any video model to create the most captivating short clip. Motion, effects, and storytelling all count.',
    theme: 'Time Lapse',
    status: 'upcoming',
    deadline: 'Mar 24, 2026',
    entries: 0,
    prize: '1000 credits + community badge',
  },
];

const PAST_WINNERS = [
  { contest: 'Neon Dreams', winner: 'creator_42', prompt: 'Cyberpunk alley at midnight, neon reflections on wet pavement', votes: 312 },
  { contest: 'Fantasy Landscapes', winner: 'artisan_x', prompt: 'Floating islands above cloud sea, golden sunset, epic scale', votes: 278 },
  { contest: 'Retro Revival', winner: 'pixel_sage', prompt: '1980s arcade interior, synthwave colors, vintage CRT monitors', votes: 245 },
];

export function ContestsPage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full overflow-y-auto bg-app-bg';

  const inner = document.createElement('div');
  inner.className = 'max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12';

  const heroBlock = document.createElement('div');
  heroBlock.className = 'mb-10 animate-fade-in-up';
  heroBlock.innerHTML = `
    <div class="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/10">
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-primary">
              <path d="M6 9H4.5a2.5 2.5 0 010-5C7 4 7 7 7 7"/>
              <path d="M18 9h1.5a2.5 2.5 0 000-5C17 4 17 7 17 7"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
            </svg>
          </div>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">Contests</h1>
          <p class="text-white/50 text-sm md:text-base max-w-lg mx-auto">Compete, vote, and showcase your best AI creations</p>
        </div>
      </div>
    </div>
  `;
  inner.appendChild(heroBlock);

  const activeSection = document.createElement('div');
  activeSection.className = 'mb-12 animate-fade-in-up';
  activeSection.style.animationDelay = '0.1s';
  activeSection.innerHTML = '<h2 class="text-lg font-bold text-white mb-4">Active & Upcoming Contests</h2>';

  const contestGrid = document.createElement('div');
  contestGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

  CONTESTS.forEach(contest => {
    const card = document.createElement('div');
    const isActive = contest.status === 'active';
    card.className = 'bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.06] hover:border-white/10 transition-all group';

    const statusBadge = isActive
      ? '<span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>'
      : '<span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Upcoming</span>';

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <h3 class="text-sm font-bold text-white group-hover:text-primary transition-colors">${contest.title}</h3>
        ${statusBadge}
      </div>
      <p class="text-xs text-muted leading-relaxed">${contest.description}</p>
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">${contest.theme}</span>
      </div>
      <div class="flex items-center justify-between text-[11px] text-secondary mt-auto pt-3 border-t border-white/5">
        <span>Deadline: ${contest.deadline}</span>
        <span>${contest.entries} entries</span>
      </div>
      <div class="text-[11px] text-muted">Prize: ${contest.prize}</div>
    `;

    if (isActive) {
      const actions = document.createElement('div');
      actions.className = 'flex gap-2';

      const submitBtn = document.createElement('button');
      submitBtn.className = 'flex-1 bg-primary text-black py-2.5 rounded-xl font-bold text-xs hover:shadow-glow transition-all';
      submitBtn.textContent = 'Submit Entry';
      submitBtn.onclick = (e) => {
        e.stopPropagation();
        navigate('image');
      };

      const voteBtn = document.createElement('button');
      voteBtn.className = 'flex-1 bg-white/10 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-white/20 transition-all';
      voteBtn.textContent = 'View & Vote';

      actions.appendChild(submitBtn);
      actions.appendChild(voteBtn);
      card.appendChild(actions);
    }

    contestGrid.appendChild(card);
  });

  activeSection.appendChild(contestGrid);
  inner.appendChild(activeSection);

  const leaderboardSection = document.createElement('div');
  leaderboardSection.className = 'mb-12 animate-fade-in-up';
  leaderboardSection.style.animationDelay = '0.2s';
  leaderboardSection.innerHTML = '<h2 class="text-lg font-bold text-white mb-4">Past Winners</h2>';

  const winnersList = document.createElement('div');
  winnersList.className = 'flex flex-col gap-3';

  PAST_WINNERS.forEach((entry, idx) => {
    const row = document.createElement('div');
    row.className = 'bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.06] transition-all';

    const rankColors = ['text-primary', 'text-white/80', 'text-white/60'];
    row.innerHTML = `
      <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
        <span class="text-sm font-black ${rankColors[idx] || 'text-white/40'}">#${idx + 1}</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-0.5">
          <span class="text-xs font-bold text-white">${entry.contest}</span>
          <span class="text-[10px] text-muted">by ${entry.winner}</span>
        </div>
        <p class="text-[11px] text-secondary truncate">${entry.prompt}</p>
      </div>
      <div class="text-right shrink-0">
        <div class="text-sm font-black text-primary">${entry.votes}</div>
        <div class="text-[9px] text-muted uppercase">votes</div>
      </div>
    `;
    winnersList.appendChild(row);
  });

  leaderboardSection.appendChild(winnersList);
  inner.appendChild(leaderboardSection);

  const rulesSection = document.createElement('div');
  rulesSection.className = 'animate-fade-in-up';
  rulesSection.style.animationDelay = '0.3s';
  rulesSection.innerHTML = `
    <h2 class="text-lg font-bold text-white mb-4">How It Works</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center">
        <div class="w-10 h-10 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <div class="text-sm font-bold text-white mb-1">1. Create</div>
        <div class="text-xs text-muted">Generate an image or video using any studio tool</div>
      </div>
      <div class="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center">
        <div class="w-10 h-10 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="text-sm font-bold text-white mb-1">2. Submit</div>
        <div class="text-xs text-muted">Enter your creation into an active contest</div>
      </div>
      <div class="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center">
        <div class="w-10 h-10 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
        </div>
        <div class="text-sm font-bold text-white mb-1">3. Vote</div>
        <div class="text-xs text-muted">Browse entries and vote for your favorites</div>
      </div>
    </div>
  `;
  inner.appendChild(rulesSection);

  container.appendChild(inner);
  return container;
}
