import { NODE_TYPES } from '../data/nodeDefinitions';
import { LuPlus } from 'react-icons/lu';

const nodeTypes = [
  { type: NODE_TYPES.TEXT, name: 'Text Input', icon: 'T', color: 'bg-blue-500/20 border-blue-500/50' },
  { type: NODE_TYPES.IMAGE, name: 'Image Gen', icon: 'I', color: 'bg-green-500/20 border-green-500/50' },
  { type: NODE_TYPES.VIDEO, name: 'Video Gen', icon: 'V', color: 'bg-orange-500/20 border-orange-500/50' },
  { type: NODE_TYPES.AUDIO, name: 'Audio Gen', icon: 'A', color: 'bg-yellow-500/20 border-yellow-500/50' },
  { type: NODE_TYPES.API, name: 'API Node', icon: 'API', color: 'bg-purple-500/20 border-purple-500/50' },
  { type: NODE_TYPES.CONCAT, name: 'Prompt Concat', icon: 'P', color: 'bg-pink-500/20 border-pink-500/50' },
  { type: NODE_TYPES.VID_CONCAT, name: 'Video Combiner', icon: 'VC', color: 'bg-red-500/20 border-red-500/50' },
];

export default function NodePalette({ onAddNode, onClose }) {
  return (
    <div className="absolute top-16 left-16 z-50 bg-[#151618] border border-zinc-800 rounded-xl shadow-2xl w-64 overflow-hidden">
      <div className="p-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-white">Add Node</h3>
      </div>
      <div className="p-2 max-h-80 overflow-y-auto">
        {nodeTypes.map(({ type, name, icon, color }) => (
          <button
            key={type}
            onClick={() => onAddNode(type)}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-800 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-lg border-2 ${color} flex items-center justify-center`}>
              <span className="text-xs font-bold text-white">{icon}</span>
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                {name}
              </span>
            </div>
            <LuPlus size={16} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-zinc-800">
        <button
          onClick={onClose}
          className="w-full px-3 py-2 text-xs text-zinc-500 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}