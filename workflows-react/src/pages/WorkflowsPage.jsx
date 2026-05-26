import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { listWorkflows, deleteWorkflow, duplicateWorkflow } from '../services/workflowService';
import { workflowTemplates } from '../data/workflowTemplates';
import { LuFolderOpen, LuLayoutTemplate, LuPlus, LuTrash2, LuCopy, LuSearch } from 'react-icons/lu';
import { FaPlay } from 'react-icons/fa6';
import toast from 'react-hot-toast';

function WorkflowCard({ workflow, onDelete, onDuplicate }) {
  const navigate = useNavigate();

  return (
    <div className="group bg-[#151618] rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
      <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden">
        {workflow.thumbnail ? (
          <img
            src={workflow.thumbnail}
            alt={workflow.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-zinc-700/50 rounded-xl flex items-center justify-center">
              <LuLayoutTemplate size={24} className="text-zinc-500" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/workflows/${workflow.id}`)}
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
            title="Edit workflow"
          >
            <LuLayoutTemplate size={18} className="text-white" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white truncate">{workflow.name}</h3>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
          {workflow.description || 'No description'}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-zinc-600">
            {workflow.nodes?.length || 0} nodes
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onDuplicate(workflow.id)}
              className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors"
              title="Duplicate"
            >
              <LuCopy size={14} className="text-zinc-400" />
            </button>
            <button
              onClick={() => onDelete(workflow.id)}
              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete"
            >
              <LuTrash2 size={14} className="text-zinc-400 hover:text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, onUse }) {
  return (
    <div className="group bg-[#151618] rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
      <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden">
        {template.thumbnail && (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white truncate">{template.name}</h3>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
          {template.description}
        </p>
        <button
          onClick={() => onUse(template.id)}
          className="w-full mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FaPlay size={12} />
          Use Template
        </button>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const { workflows, setWorkflows } = useWorkflow();
  const [activeTab, setActiveTab] = useState('my-workflows');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const loaded = await listWorkflows();
      setWorkflows(loaded);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) {
      return;
    }
    try {
      await deleteWorkflow(id);
      const updated = workflows.filter(w => w.id !== id);
      setWorkflows(updated);
      toast.success('Workflow deleted');
    } catch (error) {
      toast.error('Failed to delete workflow');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const duplicated = await duplicateWorkflow(id);
      setWorkflows([duplicated, ...workflows]);
      toast.success('Workflow duplicated');
    } catch (error) {
      toast.error('Failed to duplicate workflow');
    }
  };

  const handleUseTemplate = async (templateId) => {
    const { createWorkflowFromTemplate } = await import('../services/workflowService');
    try {
      const workflow = await createWorkflowFromTemplate(templateId);
      setWorkflows([workflow, ...workflows]);
      toast.success('Workflow created from template');
    } catch (error) {
      toast.error('Failed to create workflow');
    }
  };

  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'my-workflows', label: 'My Workflows', icon: LuFolderOpen },
    { id: 'templates', label: 'Templates', icon: LuLayoutTemplate },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Workflows</h1>
        <Link
          to="/workflows/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <LuPlus size={18} />
          New Workflow
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-[#151618] rounded-lg p-1 border border-zinc-800">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows..."
              className="w-full pl-10 pr-4 py-2 bg-[#151618] border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {activeTab === 'my-workflows' && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <LuFolderOpen size={24} className="text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No workflows yet</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Create your first workflow or start from a template
              </p>
              <Link
                to="/workflows/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <LuPlus size={18} />
                Create Workflow
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWorkflows.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {workflowTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}