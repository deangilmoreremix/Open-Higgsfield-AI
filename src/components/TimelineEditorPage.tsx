import React, { useEffect, useRef, useState } from 'react';

export default function TimelineEditorPage() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cleanup = null;

    async function initTimelineEditor() {
      try {
        const { getPendingHandoff, clearPendingHandoff } = await import('../lib/handoff.js');

        const pendingHandoff = getPendingHandoff('timeline');
        if (pendingHandoff && pendingHandoff.url) {
          console.log('[TimelineEditorPage] Received handoff with URL:', pendingHandoff.url);
          window.__pendingTimelineHandoff = pendingHandoff;
          clearPendingHandoff('timeline');
        }

        const module = await import('./TimelineEditorPage.js');
        if (containerRef.current && module.TimelineEditorPage) {
          const element = module.TimelineEditorPage();
          if (element && containerRef.current) {
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(element);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load timeline editor:', err);
        setError(err.message || 'Failed to load timeline editor');
        setLoading(false);
      }
    }

    if (containerRef.current) {
      initTimelineEditor();
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-app-bg">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        <span className="ml-3 text-secondary">Loading Timeline Editor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-app-bg p-6">
        <div className="text-red-400 text-center">
          <h2 className="text-xl font-bold mb-2">Failed to Load Timeline Editor</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-app-bg"
      data-timeline-editor="true"
    />
  );
}
