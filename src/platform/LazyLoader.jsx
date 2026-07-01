import { lazy, Suspense } from 'react';

// Lazy load a module with error handling
export function lazyLoad(factory, fallback = null) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      console.error('Lazy load failed:', error);
      return {
        default: () => fallback || <div className="p-4">Failed to load component</div>
      };
    }
  });
}

// Loading fallback component
export function LoadingFallback({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px] bg-[#030303]">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-[#d9ff00] rounded-full mx-auto mb-3" />
        <p className="text-white/60 text-sm">{message}</p>
      </div>
    </div>
  );
}

// Suspense wrapper with loading state
export function LazyLoad({ children, fallback }) {
  return (
    <Suspense fallback={fallback || <LoadingFallback />}>
      {children}
    </Suspense>
  );
}

// Preload a lazy component
export function preload(component) {
  if (component && component.preload) {
    component.preload();
  }
}

export default {
  lazyLoad,
  LoadingFallback,
  LazyLoad,
  preload,
};