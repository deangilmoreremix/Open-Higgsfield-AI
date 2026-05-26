import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';
import { LoadingFallback } from './LazyLoader';

// Legacy App Wrapper - wraps vanilla.js apps in React
export function LegacyAppWrapper({ 
  appPath, 
  entryPoint = 'index.js',
  onReady,
  onError,
  fallback = null
}) {
  const containerRef = useRef(null);
  const { apiKey } = useAuth();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!containerRef.current) return;

    const initializeLegacyApp = async () => {
      try {
        setStatus('loading');
        
        // Clear container
        containerRef.current.innerHTML = '';
        
        // Create script tag for legacy app
        const script = document.createElement('script');
        script.type = 'module';
        script.src = `${appPath}/${entryPoint}`;
        
        script.onload = () => {
          setStatus('ready');
          onReady?.();
        };
        
        script.onerror = (err) => {
          setStatus('error');
          console.error('Legacy app load error:', err);
          onError?.(err);
        };
        
        containerRef.current.appendChild(script);
      } catch (error) {
        setStatus('error');
        console.error('Legacy app initialization failed:', error);
        onError?.(error);
      }
    };

    initializeLegacyApp();

    return () => {
      // Cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [appPath, entryPoint]);

  if (status === 'error') {
    return fallback || (
      <div className="p-6 text-center">
        <p className="text-white/60">Failed to load legacy app</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-black text-white"
      data-app-path={appPath}
    />
  );
}

// IFrame Wrapper for external apps
export function IFrameApp({ src, title, className = '' }) {
  return (
    <iframe
      src={src}
      title={title}
      className={`w-full h-full border-0 ${className}`}
      sandbox="allow-scripts allow-same-origin allow-forms"
      loading="lazy"
    />
  );
}

// App Loader - combines lazy loading with legacy support
export function AppLoader({ 
  component,
  legacyPath,
  isLoading = false,
  error = null,
  ...props
}) {
  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-white/60">Failed to load app</p>
      </div>
    );
  }

  if (legacyPath) {
    return <LegacyAppWrapper appPath={legacyPath} {...props} />;
  }

  if (component) {
    const Component = component;
    return <Component {...props} />;
  }

  return <LoadingFallback message="App not available" />;
}

export default LegacyAppWrapper;