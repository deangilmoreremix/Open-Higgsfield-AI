'use client';

import React, { useState } from 'react';
import { appManifest } from './manifest';
import Timeline from './components/Timeline.jsx';
import useProjectEditor from './hooks/useProjectEditor.js';

export default function RemixGoApp() {
  const [project, setProject] = useState({ name: 'Untitled Project', clips: [] });
  const { addClip, removeClip, exportProject } = useProjectEditor(project, setProject);

  return React.createElement(
    'div',
    { className: 'w-full h-full flex flex-col bg-[#030303] text-white' },
    React.createElement(
      'div',
      { className: 'p-6 border-b border-white/10' },
      React.createElement('h1', { className: 'text-2xl font-bold text-white mb-2' }, appManifest.name),
      React.createElement('p', { className: 'text-white/60' }, appManifest.description)
    ),
    React.createElement(
      'div',
      { className: 'flex-1 flex flex-col p-6' },
      React.createElement(
        'div',
        { className: 'mb-4 flex gap-3' },
        React.createElement('input', {
          type: 'text',
          value: project.name,
          onChange: e => setProject({ ...project, name: e.target.value }),
          placeholder: 'Project name',
          className: 'px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
        }),
        React.createElement(
          'button',
          {
            onClick: () => addClip({ duration: 5, effects: [] }),
            className: 'px-4 py-2 bg-[#d9ff00] text-black rounded-lg font-medium hover:bg-[#d9ff00]/90'
          },
          'Add Clip'
        ),
        React.createElement(
          'button',
          {
            onClick: exportProject,
            className: 'px-4 py-2 bg-white/10 rounded-lg font-medium hover:bg-white/20'
          },
          'Export'
        )
      ),
      React.createElement(Timeline, { clips: project.clips })
    )
  );
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';
