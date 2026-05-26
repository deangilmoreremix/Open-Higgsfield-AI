"use client";

import { lazy, Suspense } from 'react';
import { StudioLayout } from '../../../src/platform/StudioPage';
import { AppErrorBoundary } from '../../../src/platform/ErrorBoundary';
import { LoadingFallback } from '../../../src/platform/LazyLoader';

// Lazy load the design agent app
const DesignAgentApp = lazy(() => import('../../../apps/design-agent/index.jsx'));

export default function DesignAgentPage() {
  return (
    <AppErrorBoundary>
      <StudioLayout title="Design Agent" subtitle="AI-powered creative canvas">
        <Suspense fallback={<LoadingFallback message="Loading Design Agent..." />}>
          <div className="h-full w-full">
            <DesignAgentApp isHeaderVisible={false} />
          </div>
        </Suspense>
      </StudioLayout>
    </AppErrorBoundary>
  );
}