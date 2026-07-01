/**
 * workflows-react FULL IMPLEMENTATION BRIDGE
 *
 * This file is the official bridge that loads the COMPLETE workflows-react application
 * (the full React + ReactFlow implementation located in ../workflows-react/)
 * into the legacy Vite-based Higgsfield shell.
 *
 * It is NOT a re-implementation.
 * It is NOT the old imperative WorkflowBuilderApp.js.
 *
 * All pages, all 7 node types (Text, Image, Video, Audio, API, Concat, VidConcat),
 * all 60+ workflow templates, PropertiesPanel, OutputPanel, RunOverlay, execution
 * service, adapters, context, and ReactFlow canvas come from the real source in
 * workflows-react/src/.
 *
 * Used by:
 * - src/lib/router.js (Vite SPA hash navigation for /#/workflows, /#/workflow-builder, etc.)
 */

'use client';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkflowProvider } from '../../workflows-react/src/context/WorkflowContext';
import WorkflowsPage from '../../workflows-react/src/pages/WorkflowsPage';
import WorkflowBuilderPage from '../../workflows-react/src/pages/WorkflowBuilderPage';
import TemplatesPage from '../../workflows-react/src/pages/TemplatesPage';

import '../../workflows-react/src/styles/index.css';

function WorkflowsApp({ initialPath = '/workflows' }) {
  return (
    <WorkflowProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <div className="w-full h-full bg-[#030303] text-white overflow-auto">
          <Routes>
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/workflows/new" element={<WorkflowBuilderPage />} />
            <Route path="/workflows/:id/*" element={<WorkflowBuilderPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="*" element={<Navigate to="/workflows" replace />} />
          </Routes>
        </div>
      </MemoryRouter>
    </WorkflowProvider>
  );
}

/**
 * Entry point used by the Vite router.
 * Returns a real DOM element containing the full React workflows app.
 */
export function WorkflowBuilderApp(initialPath = '/workflows') {
  const container = document.createElement('div');
  container.className = 'w-full h-full';
  container.style.height = '100%';

  // Cleanup hook used by the legacy router's cleanupContentArea
  container._cleanup = () => {
    if (container._reactRoot) {
      container._reactRoot.unmount();
    }
  };

  const root = createRoot(container);
  container._reactRoot = root;

  root.render(
    React.createElement(WorkflowsApp, { initialPath })
  );

  return container;
}

export { WorkflowBuilderApp as default };
