// Platform exports - React Core Foundation
export { default as AppRegistry, registry } from './AppRegistry';
export { StudioLayout, StudioPageWrapper } from './StudioPage';
export { default as StudioHeader } from './StudioHeader';
export { AppErrorBoundary } from './ErrorBoundary';
export { Providers } from './Providers';
export { AuthProvider, useAuth } from './AuthProvider';
export { LoadingFallback, LazyLoad, lazyLoad, preload } from './LazyLoader';
export { LegacyAppWrapper, IFrameApp, AppLoader } from './LegacyAppWrapper';

// Re-export lazy for convenience
export { lazy } from 'react';