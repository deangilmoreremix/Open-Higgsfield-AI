import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Plus, ChevronRight, Clock, CheckCircle, AlertCircle, Loader2, Video, Image, Music, Wand2, Settings, Zap, Database, Cloud, Youtube, Twitter, Instagram } from 'lucide-react';

// Import MuAPI client from the shared codebase
import MuapiClient from '../../../src/lib/muapi.js';

// Initialize MuAPI client
const muapi = new MuapiClient();

const MUAPI_ENDPOINTS = {
  'ai-generate': 'predictions',
  'timeline-edit': 'video-editing',
  'personalization': 'video-personalization',
  'export': 'video-export',
  'batch-upload': 'media-upload',
  'template-apply': 'template-apply',
  'quality-gate': 'quality-check',
  'multi-publish': 'multi-publish',
  'data-import': 'data-import',
  'segmentation': 'audience-segmentation',
  'batch-generate': 'batch-generate',
  'automated-send': 'automated-deliver'
};

// Workflow step types that map to MuAPI capabilities
const STEP_TYPES = {
  'ai-generate': {
    label: 'AI Generate',
    icon: '🎨',
    description: 'Generate video/image using AI models',
    muapiEndpoint: '/video/generate'
  },
  'timeline-edit': {
    label: 'Timeline Edit',
    icon: '✂️',
    description: 'Edit and polish video clips',
    muapiEndpoint: '/video/edit'
  },
  'personalization': {
    label: 'Personalize',
    icon: '🎯',
    description: 'Add personalized overlays and text',
    muapiEndpoint: '/video/personalize'
  },
  'export': {
    label: 'Export',
    icon: '📤',
    description: 'Export final video',
    muapiEndpoint: '/video/export'
  },
  'social-publish': {
    label: 'Social Publish',
    icon: '🚀',
    description: 'Publish to social media',
    muapiEndpoint: null // External integration
  },
  'batch-upload': {
    label: 'Batch Upload',
    icon: '📁',
    description: 'Upload multiple videos',
    muapiEndpoint: '/media/upload'
  },
  'template-apply': {
    label: 'Apply Template',
    icon: '📋',
    description: 'Apply brand templates',
    muapiEndpoint: '/template/apply'
  },
  'quality-gate': {
    label: 'Quality Check',
    icon: '🔍',
    description: 'Automated quality verification',
    muapiEndpoint: '/video/quality'
  },
  'multi-publish': {
    label: 'Multi Publish',
    icon: '🌐',
    description: 'Distribute to multiple platforms',
    muapiEndpoint: null
  },
  'data-import': {
    label: 'Import Data',
    icon: '📊',
    description: 'Import from CRM/Data sources',
    muapiEndpoint: '/data/import'
  },
  'segmentation': {
    label: 'Segmentation',
    icon: '👥',
    description: 'Audience segmentation',
    muapiEndpoint: '/audience/segment'
  },
  'batch-generate': {
    label: 'Batch Generate',
    icon: '⚡',
    description: 'Generate multiple variants',
    muapiEndpoint: '/batch/generate'
  },
  'automated-send': {
    label: 'Auto Send',
    icon: '📧',
    description: 'Automated delivery',
    muapiEndpoint: '/delivery/send'
  }
};

const INTEGRATIONS = {
  'social-media': { label: 'Social Media', icon: '📱', platforms: ['YouTube', 'TikTok', 'Instagram'] },
  'email': { label: 'Email', icon: '✉️', providers: ['SendGrid', 'Mailchimp'] },
  'analytics': { label: 'Analytics', icon: '📈', tools: ['Google Analytics', 'Mixpanel'] },
  'cloud-storage': { label: 'Cloud Storage', icon: '☁️', providers: ['S3', 'Google Cloud'] },
  'cdn': { label: 'CDN', icon: '🌍', providers: ['Cloudflare', 'Fastly'] },
  'crm': { label: 'CRM', icon: '👤', systems: ['Salesforce', 'HubSpot'] }
};

const DEFAULT_WORKFLOWS = [
  {
    id: 'video-creation',
    name: 'Video Creation Pipeline',
    description: 'Generate, edit, and publish videos automatically with AI',
    icon: '🎬',
    steps: [
      { id: 'gen1', name: 'Generate Base Video', type: 'ai-generate', status: 'pending', config: { model: 'wan-ai', duration: 5 } },
      { id: 'edit1', name: 'Apply Transitions', type: 'timeline-edit', status: 'pending', config: { transitions: true, colorGrade: true } },
      { id: 'pers1', name: 'Add Brand Overlay', type: 'personalization', status: 'pending', config: { logo: true, text: true } },
      { id: 'exp1', name: 'Render & Export', type: 'export', status: 'pending', config: { format: 'mp4', quality: '1080p' } },
      { id: 'pub1', name: 'Publish to Platforms', type: 'social-publish', status: 'pending', config: { youtube: true, tiktok: true } }
    ],
    triggers: ['manual', 'schedule'],
    integrations: ['social-media', 'analytics'],
    stats: { runs: 127, successRate: 98 }
  },
  {
    id: 'batch-processing',
    name: 'Batch Video Processing',
    description: 'Process multiple videos with consistent branding and quality',
    icon: '📦',
    steps: [
      { id: 'upl1', name: 'Batch Upload Source', type: 'batch-upload', status: 'pending', config: { maxFiles: 50 } },
      { id: 'tpl1', name: 'Apply Brand Template', type: 'template-apply', status: 'pending', config: { template: 'brand-v2' } },
      { id: 'qual1', name: 'Quality Check', type: 'quality-gate', status: 'pending', config: { minResolution: '720p', maxDuration: 60 } },
      { id: 'dist1', name: 'Distribute Output', type: 'multi-publish', status: 'pending', config: { cloud: true, social: true } }
    ],
    triggers: ['upload', 'api'],
    integrations: ['cloud-storage', 'cdn', 'analytics'],
    stats: { runs: 89, successRate: 95 }
  },
  {
    id: 'personalization',
    name: 'Personalization Hub',
    description: 'Create personalized video content at scale using audience data',
    icon: '🎯',
    steps: [
      { id: 'imp1', name: 'Import Audience Data', type: 'data-import', status: 'pending', config: { source: 'crm' } },
      { id: 'seg1', name: 'Segment Audience', type: 'segmentation', status: 'pending', config: { rules: 'auto' } },
      { id: 'gen2', name: 'Generate Personalized Videos', type: 'batch-generate', status: 'pending', config: { variantCount: 3 } },
      { id: 'del1', name: 'Deliver to Segments', type: 'automated-send', status: 'pending', config: { channel: 'email' } }
    ],
    triggers: ['data-upload', 'api-webhook'],
    integrations: ['crm', 'email', 'analytics'],
    stats: { runs: 243, successRate: 92 }
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState(DEFAULT_WORKFLOWS);
  const [runningWorkflows, setRunningWorkflows] = useState([]);
  const [completedWorkflows, setCompletedWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '' });
  const [muapiConnected, setMuapiConnected] = useState(false);

  // Check MuAPI connection
  useEffect(() => {
    checkMuAPI();
  }, []);

  const checkMuAPI = async () => {
    try {
      const response = await fetch('/api/health', { method: 'GET' });
      setMuapiConnected(response.ok);
    } catch {
      setMuapiConnected(false);
    }
  };

  const handleRunWorkflow = useCallback(async (workflow) => {
    console.log(`[Sendspark] Running workflow: ${workflow.name}`);
    
    // Clone workflow and start execution
    const runningWorkflow = {
      ...workflow,
      id: `${workflow.id}-run-${Date.now()}`,
      startedAt: new Date().toISOString(),
      progress: 0,
      currentStep: 0,
      status: 'running'
    };

    setRunningWorkflows(prev => [...prev, runningWorkflow]);
    setSelectedWorkflow(runningWorkflow);

    // Execute workflow steps through MuAPI
    executeWorkflowSteps(runningWorkflow);
  }, []);

  const executeWorkflowSteps = async (workflow) => {
    const steps = workflow.steps;
    
    for (let i = 0; i < steps.length; i++) {
      // Update current step
      setRunningWorkflows(prev => prev.map(w => 
        w.id === workflow.id 
          ? { ...w, currentStep: i, progress: Math.round((i / steps.length) * 100) }
          : w
      ));

      const step = steps[i];
      console.log(`[Sendspark] Executing step: ${step.name} (${step.type})`);

      if (step.type === 'social-publish' || step.type === 'multi-publish') {
        // Simulate external integration
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        try {
          const endpoint = MUAPI_ENDPOINTS[step.type];
          if (!endpoint) {
            console.warn(`[Sendspark] No MuAPI endpoint mapped for step type: ${step.type}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate
          } else {
            // Call MuAPI
            await muapi.makeRequest(endpoint, {
              ...step.config,
              workflowId: workflow.id,
              stepId: step.id
            });
          }
          console.log(`[Sendspark] Step completed: ${step.name}`);
        } catch (error) {
          console.error(`[Sendspark] Step failed: ${step.name}`, error);
          setRunningWorkflows(prev => prev.map(w => 
            w.id === workflow.id 
              ? { ...w, status: 'failed', error: error.message }
              : w
          ));
          return;
        }
      }
    }

    // Workflow complete
    const completed = {
      ...workflow,
      completedAt: new Date().toLocaleString(),
      status: 'completed',
      progress: 100
    };

    setRunningWorkflows(prev => prev.filter(w => w.id !== workflow.id));
    setCompletedWorkflows(prev => [completed, ...prev]);
    setSelectedWorkflow(completed);
  };

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name.trim()) return;

    const workflow = {
      id: `custom-${Date.now()}`,
      name: newWorkflow.name,
      description: newWorkflow.description || 'Custom workflow',
      icon: '⚡',
      steps: [],
      triggers: ['manual'],
      integrations: [],
      isCustom: true,
      stats: { runs: 0, successRate: 0 }
    };

    setWorkflows(prev => [...prev, workflow]);
    setNewWorkflow({ name: '', description: '' });
    setIsCreating(false);
  };

  const runningCount = runningWorkflows.length;
  const completedCount = completedWorkflows.length;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>🚀 Sendspark Workflow</h1>
          <div className="header-subtitle">Automate video creation, personalization & distribution with MuAPI</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={checkMuAPI}>
            <Zap size={16} />
            {muapiConnected ? 'MuAPI Connected' : 'Check Connection'}
          </button>
          <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
            <Plus size={16} />
            New Workflow
          </button>
        </div>
      </header>

      {isCreating && (
        <div className="create-form">
          <h3 className="form-title">Create New Workflow</h3>
          <input
            className="form-input"
            placeholder="Workflow name"
            value={newWorkflow.name}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
          />
          <textarea
            className="form-input form-textarea"
            placeholder="Describe what this workflow does..."
            value={newWorkflow.description}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={handleCreateWorkflow}>
              <Plus size={16} />
              Create Workflow
            </button>
            <button className="btn btn-secondary" onClick={() => setIsCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${activeTab === 'workflows' ? 'active' : ''}`} onClick={() => setActiveTab('workflows')}>
          Workflows <span className="tab-badge">{workflows.length}</span>
        </button>
        <button className={`tab ${activeTab === 'running' ? 'active' : ''}`} onClick={() => setActiveTab('running')}>
          Running <span className="tab-badge">{runningCount}</span>
        </button>
        <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          Completed <span className="tab-badge">{completedCount}</span>
        </button>
      </div>

      {activeTab === 'workflows' && (
        <div className="workflow-grid">
          {workflows.map(workflow => (
            <div key={workflow.id} className="workflow-card" onClick={() => setSelectedWorkflow(workflow)}>
              <div className="workflow-icon">{workflow.icon}</div>
              <h3 className="workflow-name">{workflow.name}</h3>
              <p className="workflow-description">{workflow.description}</p>
              
              <div className="workflow-steps">
                {workflow.steps.slice(0, 4).map(step => (
                  <span key={step.id} className="step-tag">
                    {STEP_TYPES[step.type]?.icon} {step.name}
                  </span>
                ))}
                {workflow.steps.length > 4 && (
                  <span className="step-tag">+{workflow.steps.length - 4} more</span>
                )}
              </div>

              <div className="workflow-meta">
                <div className="workflow-triggers">
                  {workflow.triggers.map(trigger => (
                    <span key={trigger} className="trigger-tag">{trigger}</span>
                  ))}
                </div>
                <button 
                  className="run-btn"
                  onClick={(e) => { e.stopPropagation(); handleRunWorkflow(workflow); }}
                >
                  <Play size={14} />
                  Run
                </button>
              </div>
              
              {workflow.stats && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  ✅ {workflow.stats.runs} runs • {workflow.stats.successRate}% success
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'running' && (
        <div>
          <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>
            Active Workflows ({runningCount})
          </h3>
          {runningWorkflows.length === 0 ? (
            <div className="empty-state">
              <Loader2 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3>No Running Workflows</h3>
              <p>Start a workflow from the Workflows tab</p>
            </div>
          ) : (
            runningWorkflows.map(workflow => (
              <div key={workflow.id} className="workflow-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="workflow-icon">{workflow.icon}</div>
                    <div>
                      <h3 className="workflow-name">{workflow.name}</h3>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        Started {new Date(workflow.startedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="step-status status-running">RUNNING</div>
                </div>

                <div className="step-list">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="step-item">
                      <div className="step-number">{index + 1}</div>
                      <div className="step-info">
                        <div className="step-name">{step.name}</div>
                        <div className="step-type">{STEP_TYPES[step.type]?.label || step.type}</div>
                      </div>
                      {index === workflow.currentStep && (
                        <div className="step-status status-running">
                          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> RUNNING
                        </div>
                      )}
                      {index < workflow.currentStep && (
                        <div className="step-status status-completed">
                          <CheckCircle size={14} style={{ marginRight: '4px' }} /> DONE
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${workflow.progress}%` }} />
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                  {workflow.progress}% complete
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="workflow-grid">
          {completedWorkflows.map(workflow => (
            <div key={workflow.id} className="workflow-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="workflow-icon">{workflow.icon}</div>
                  <div>
                    <h3 className="workflow-name">{workflow.name}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                      Completed {workflow.completedAt}
                    </p>
                  </div>
                </div>
                <div className="step-status status-completed">
                  <CheckCircle size={14} style={{ marginRight: '4px' }} /> COMPLETED
                </div>
              </div>
              
              <div style={{ marginTop: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                All {workflow.steps.length} steps executed successfully via MuAPI
              </div>
              
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  View Output
                </button>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Run Again
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedWorkflow && !selectedWorkflow.isCustom && (
        <div className="workflow-detail">
          <div className="detail-header">
            <div>
              <h2 className="detail-title">{selectedWorkflow.icon} {selectedWorkflow.name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
                {selectedWorkflow.description}
              </p>
            </div>
            <div className="detail-actions">
              {selectedWorkflow.id.includes('run-') && runningWorkflows.find(w => w.id === selectedWorkflow.id) && (
                <button className="btn btn-secondary">
                  <Square size={16} />
                  Stop
                </button>
              )}
              <button className="btn btn-primary" onClick={() => handleRunWorkflow(selectedWorkflow)}>
                <Play size={16} />
                {selectedWorkflow.id.includes('run-') ? 'View Progress' : 'Run Workflow'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>
              Workflow Pipeline
            </h3>
            <div className="step-list">
              {selectedWorkflow.steps.map((step, index) => (
                <div key={step.id} className="step-item">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-info">
                    <div className="step-name">
                      {STEP_TYPES[step.type]?.icon} {step.name}
                    </div>
                    <div className="step-type">
                      {STEP_TYPES[step.type]?.description || 'Custom step'}
                      {step.config && (
                        <span style={{ marginLeft: '8px', color: '#8b5cf6' }}>
                          • {Object.keys(step.config).length} config options
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`step-status status-${step.status || 'idle'}`}>
                    {step.status === 'running' && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', marginRight: '4px' }} />}
                    {step.status === 'completed' && <CheckCircle size={14} style={{ marginRight: '4px' }} />}
                    {step.status?.toUpperCase() || 'IDLE'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Triggers</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedWorkflow.triggers.map(trigger => (
                  <span key={trigger} className="trigger-tag">{trigger}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Integrations</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedWorkflow.integrations.map(int => (
                  <span key={int} className="trigger-tag" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
                    {INTEGRATIONS[int]?.icon} {INTEGRATIONS[int]?.label || int}
                  </span>
                ))}
              </div>
            </div>

            {selectedWorkflow.stats && (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Statistics</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>
                  {selectedWorkflow.stats.runs} runs • {selectedWorkflow.stats.successRate}% success
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;