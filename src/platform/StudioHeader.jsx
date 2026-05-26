import { useRouter } from 'next/navigation';
import { Home, ChevronLeft } from 'lucide-react';

export function StudioHeader({ title, subtitle, showBack = true }) {
  const router = useRouter();

  return (
    <header className="h-14 px-6 md:px-10 flex items-center border-b border-white/[0.06] flex-shrink-0">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4 text-white/60" />
          </button>
        )}
        <div
          className="w-8 h-8 flex items-center justify-center"
          style={{ background: 'oklch(35% 18% 300deg)', borderRadius: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-tight" style={{ color: 'oklch(92% 0.005 270deg)' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs" style={{ color: 'oklch(58% 0.01 270deg)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => router.push('/')}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Go home"
        >
          <Home className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </header>
  );
}

export default StudioHeader;