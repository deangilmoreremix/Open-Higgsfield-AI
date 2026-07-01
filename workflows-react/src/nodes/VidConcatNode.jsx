import { Handle, Position } from 'reactflow';
import { MdVideoLibrary } from 'react-icons/md';

export default function VidConcatNode({ id, data, selected }) {
  return (
    <div
      className={`
        w-72 bg-[#0c0d0f] rounded-xl border-2 transition-all duration-300
        ${selected ? 'border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'border-zinc-800'}
      `}
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#151618] to-[#1c1e21] rounded-t-xl border-b border-zinc-800 p-3">
        <div className={`p-1.5 rounded-lg ${selected ? 'bg-red-600' : 'bg-zinc-800'}`}>
          <MdVideoLibrary size={14} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Video Combiner
        </span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-zinc-500">
          Combine multiple videos into one sequence
        </p>
        <select className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500">
          <option value="16:9">16:9 (Landscape)</option>
          <option value="9:16">9:16 (Portrait)</option>
          <option value="1:1">1:1 (Square)</option>
        </select>
        <button
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Combine Videos
        </button>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="videoInput7"
        style={{ top: 80 }}
        className="!w-3 !h-3 !rounded-full !border-2 !border-orange-500 !bg-zinc-900 !left-[-6px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="videoOutput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-orange-500 !bg-zinc-900 !right-[-6px]"
      />
    </div>
  );
}