import { Suspense } from 'react';
import StudioHeader from './StudioHeader';
import { AppErrorBoundary } from './ErrorBoundary';

export function StudioLayout({ 
  children, 
  title = 'Studio', 
  subtitle,
  showBack = true,
  maxWidth = '7xl'
}) {
  return (
    <div className="h-screen flex flex-col bg-[#030303]">
      <StudioHeader title={title} subtitle={subtitle} showBack={showBack} />
      <main className={`flex-1 overflow-hidden bg-[#030303]`}>
        <div className={`h-full max-w-${maxWidth} mx-auto`}>
          {children}
        </div>
      </main>
    </div>
  );
}

export function StudioPageWrapper({ 
  children, 
  title,
  subtitle,
  isLoading = false,
  error = null
}) {
  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-[#d9ff00] rounded-full mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppErrorBoundary>
      <Suspense fallback={
        <div className="h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-[#d9ff00] rounded-full mx-auto mb-4" />
            <p className="text-white/60">Loading studio...</p>
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </AppErrorBoundary>
  );
}

export default StudioLayout;