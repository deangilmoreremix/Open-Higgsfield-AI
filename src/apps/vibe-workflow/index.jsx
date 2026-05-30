'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { appManifest } from './manifest';
import { listWorkflows, createWorkflowLocal, updateWorkflow, deleteWorkflow, duplicateWorkflow, listWorkflowTemplates, createWorkflowFromTemplate, runWorkflowNode, saveOutputToLibrary } from './services/vibeWorkflowService.js';
import { securityService } from '../../../lib/services/SecurityService.js';

const TEMPLATES = [
  { id: 'template-1', name: 'Image Generation Pipeline', description: 'Generate images from text prompts', icon: '🖼️' },
  { id: 'template-2', name: 'Video Creation Flow', description: 'Create videos from text or images', icon: '🎬' },
  { id: 'template-3', name: 'Brand Campaign', description: 'Multi-step campaign generation', icon: '📊' },
];

export default function VibeWorkflowApp() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => key && setApiKey(key));
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await listWorkflows();
      setWorkflows(data);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    }
  };

  const handleCreateWorkflow = async (templateId = null) => {
    const workflow = templateId 
      ? await createWorkflowFromTemplate(templateId)
      : await createWorkflowLocal({ 
          name: 'New Workflow', 
          description: '', 
          nodes: [] 
        });
    
    setSelectedWorkflow(workflow);
    setNodes(workflow.nodes || []);
    setShowTemplates(false);
  };

  const handleAddNode = (type) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      label: type === 'image' ? 'Generate Image' : 'Generate Video',
      x: 100,
      y: 100 + nodes.length * 80
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    
    if (selectedWorkflow) {
      updateWorkflow(selectedWorkflow.id, { nodes: updatedNodes });
    }
  };

  const handleRunWorkflow = async () => {
    if (!nodes.length || !apiKey) return;
    
    setIsRunning(true);
    setRunResults([]);

    try {
      for (const node of nodes) {
        const result = await runWorkflowNode(node, {});
        setRunResults(prev => [...prev, { nodeId: node.id, ...result }]);
      }
    } catch (err) {
      console.error('Workflow run failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDeleteWorkflow = async (id) => {
    await deleteWorkflow(id);
    setWorkflows(prev => prev.filter(w => w.id !== id));
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow(null);
      setNodes([]);
    }
  };

  const handleDuplicateWorkflow = async (id) => {
    const duplicate = await duplicateWorkflow(id);
    setWorkflows(prev => [duplicate, ...prev]);
  };

  const handleHandoffOutput = (output) => {
    if (output?.url) {
      saveOutputToLibrary(output);
    }
  };

  return React.createElement(
    'div',
    { className: 'w-full h-full flex flex-col bg-[#030303] text-white' },
    
    // Header
    React.createElement(
      'div',
      { className: 'px-6 py-4 border-b border-white/10 flex items-center justify-between' },
      React.createElement('h1', { className: 'text-xl font-bold' }, appManifest.name),
      React.createElement(
        'button',
        {
          onClick: () => setShowTemplates(true),
          className: 'px-4 py-2 bg-primary text-black rounded-lg font-medium hover:shadow-glow'
        },
        '+ New Workflow'
      )
    ),

    // Main content
    React.createElement(
      'div',
      { className: 'flex-1 flex overflow-hidden' },
      
      // Workflow list sidebar
      React.createElement(
        'div',
        { className: 'w-80 border-r border-white/10 p-4 overflow-y-auto' },
        React.createElement(
          'div',
          { className: 'space-y-2' },
          workflows.map(workflow =>
            React.createElement(
              'div',
              {
                key: workflow.id,
                onClick: () => {
                  setSelectedWorkflow(workflow);
                  setNodes(workflow.nodes || []);
                },
                className: `p-3 rounded-lg cursor-pointer transition-all ${
                  selectedWorkflow?.id === workflow.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-panel-bg border border-white/5 hover:border-primary/40'
                }`
              },
              React.createElement('div', { className: 'font-medium mb-1' }, workflow.name || 'Untitled'),
              React.createElement('div', { className: 'text-xs text-white/60 truncate' }, `${workflow.nodes?.length || 0} nodes`),
              React.createElement(
                'div',
                { className: 'flex gap-2 mt-2' },
                React.createElement(
                  'button',
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleDuplicateWorkflow(workflow.id);
                    },
                    className: 'text-xs text-white/60 hover:text-primary'
                  },
                  'Duplicate'
                ),
                React.createElement(
                  'button',
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleDeleteWorkflow(workflow.id);
                    },
                    className: 'text-xs text-red-400 hover:text-red-300'
                  },
                  'Delete'
                )
              )
            )
          )
        )
      ),

      // Canvas area
      React.createElement(
        'div',
        { className: 'flex-1 relative bg-black/20' },
        selectedWorkflow ?
          React.createElement(
            'div',
            { className: 'absolute inset-0 p-4 overflow-auto' },
            
            // Nodes
            React.createElement(
              'div',
              { className: 'relative min-h-full' },
              nodes.map((node) =>
                React.createElement(
                  'div',
                  {
                    key: node.id,
                    className: 'absolute w-48 bg-panel-bg border border-white/10 rounded-lg p-3 cursor-move',
                    style: { left: node.x, top: node.y }
                  },
                  React.createElement(
                    'div',
                    { className: 'text-sm font-medium mb-2 flex items-center gap-2' },
                    node.type === 'image' ? '🖼️' : '🎬',
                    node.label
                  ),
                  React.createElement(
                    'div',
                    { className: 'text-xs text-white/60' },
                    node.type === 'image' ? 'Generate image node' : 'Generate video node'
                  )
                )
              )
            ),

            // Run button
            React.createElement(
              'div',
              { className: 'fixed bottom-6 right-6' },
              React.createElement(
                'button',
                {
                  onClick: handleRunWorkflow,
                  disabled: isRunning || !apiKey,
                  className: `px-6 py-3 rounded-lg font-bold ${
                    apiKey && !isRunning
                      ? 'bg-primary text-black hover:shadow-glow'
                      : 'bg-white/5 text-white/40'
                  }`
                },
                isRunning ? 'Running...' : 'Run Workflow'
              )
            ),

            // Add node buttons
            React.createElement(
              'div',
              { className: 'fixed top-6 right-6 flex gap-2' },
              React.createElement(
                'button',
                {
                  onClick: () => handleAddNode('image'),
                  className: 'px-3 py-1.5 bg-white/5 rounded-lg text-sm hover:bg-primary/10'
                },
                '+ Image'
              ),
              React.createElement(
                'button',
                {
                  onClick: () => handleAddNode('video'),
                  className: 'px-3 py-1.5 bg-white/5 rounded-lg text-sm hover:bg-primary/10'
                },
                '+ Video'
              )
            )
          ) :
          React.createElement(
            'div',
            { className: 'flex items-center justify-center h-full' },
            React.createElement(
              'div',
              { className: 'text-center' },
              React.createElement('div', { className: 'text-6xl mb-4' }, '🔀'),
              React.createElement('p', { className: 'text-white/60 mb-4' }, 'Select a workflow to edit, or create a new one'),
              React.createElement(
                'button',
                {
                  onClick: () => setShowTemplates(true),
                  className: 'px-6 py-3 bg-primary text-black rounded-lg font-medium hover:shadow-glow'
                },
                'Create New Workflow'
              )
            )
          )
      )
    ),

    // Results panel
    runResults.length > 0 && React.createElement(
      'div',
      { className: 'h-64 border-t border-white/10 p-4 overflow-y-auto' },
      React.createElement(
        'h3',
        { className: 'text-sm font-medium text-white/60 mb-3 uppercase' },
        'Run Results'
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
        runResults.filter(r => r.url).map((result, idx) =>
          React.createElement(
            'div',
            { key: idx, className: 'group relative bg-panel-bg rounded-lg overflow-hidden border border-white/5' },
            result.url.includes('.mp4') || result.url.includes('.webm') ?
              React.createElement('video', {
                src: result.url,
                controls: true,
                className: 'w-full aspect-video object-cover'
              }) :
              React.createElement('img', {
                src: result.url,
                alt: 'Result',
                className: 'w-full aspect-square object-cover'
              }),
            React.createElement(
              'button',
              {
                onClick: () => handleHandoffOutput(result),
                className: 'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-medium'
              },
              'Send to Library'
            )
          )
        )
      )
    ),

    // Templates modal
    showTemplates && React.createElement(
      'div',
      { className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50' },
      React.createElement(
        'div',
        { className: 'bg-panel-bg rounded-xl p-6 max-w-md w-full mx-4' },
        React.createElement(
          'div',
          { className: 'flex justify-between items-center mb-4' },
          React.createElement('h3', { className: 'text-lg font-bold' }, 'Select Template'),
          React.createElement(
            'button',
            { onClick: () => setShowTemplates(false), className: 'text-white/60 hover:text-white' },
            '×'
          )
        ),
        React.createElement(
          'div',
          { className: 'space-y-2 mb-4' },
          TEMPLATES.map(template =>
            React.createElement(
              'button',
              {
                key: template.id,
                onClick: () => handleCreateWorkflow(template.id),
                className: 'w-full p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-primary/10 text-left transition-all'
              },
              React.createElement(
                'div',
                { className: 'flex items-center gap-3' },
                React.createElement('span', { className: 'text-2xl' }, template.icon),
                React.createElement(
                  'div',
                  null,
                  React.createElement('div', { className: 'font-medium' }, template.name),
                  React.createElement('div', { className: 'text-xs text-white/60' }, template.description)
                )
              )
            )
          )
        ),
        React.createElement(
          'button',
          {
            onClick: () => handleCreateWorkflow(),
            className: 'w-full py-2 border border-dashed border-white/20 rounded-lg text-white/60 hover:border-primary/40'
          },
          '+ Blank Workflow'
        )
      )
    )
  );
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';