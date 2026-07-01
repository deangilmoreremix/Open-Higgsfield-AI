import { Link } from 'react-router-dom';
import { workflowTemplates } from '../data/workflowTemplates';
import { useWorkflow } from '../context/WorkflowContext';
import { createWorkflowFromTemplate } from '../services/workflowService';
import { LuArrowLeft } from 'react-icons/lu';
import { FaPlay } from 'react-icons/fa6';
import toast from 'react-hot-toast';

export default function TemplatesPage() {
  const { setWorkflows, workflows } = useWorkflow();

  const handleUseTemplate = async (templateId) => {
    try {
      const workflow = await createWorkflowFromTemplate(templateId);
      setWorkflows([workflow, ...workflows]);
      toast.success('Workflow created from template');
    } catch (error) {
      toast.error('Failed to create workflow');
    }
  };

  const categories = [...new Set(workflowTemplates.map(t => t.category))];

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/workflows"
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LuArrowLeft size={20} className="text-zinc-400" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Templates</h1>
      </div>

      <p className="text-sm text-zinc-500 mb-8">
        Start with a pre-built workflow template and customize it for your needs.
      </p>

      {categories.map(category => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 capitalize">
            {category} Workflows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {workflowTemplates
              .filter(t => t.category === category)
              .map(template => (
                <div
                  key={template.id}
                  className="bg-[#151618] rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all"
                >
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
                    <h3 className="text-sm font-semibold text-white">{template.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-zinc-600">
                        {template.nodes?.length || 0} nodes
                      </span>
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <FaPlay size={10} />
                        Use
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}