import { Handle, Position } from 'reactflow';
import { TbPrompt } from 'react-icons/tb';

export default function ConcatNode({ id, data, selected }) {
  return (
    <div
      className={`
        w-72 bg-[#0c0d0f] rounded-xl border-2 transition-all duration-300
        ${selected ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'border-zinc-800'}
      `}
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#151618] to-[#1c1e21] rounded-t-xl border-b border-zinc-800 p-3">
        <div className={`p-1.5 rounded-lg ${selected ? 'bg-pink-600' : 'bg-zinc-800'}`}>
          <TbPrompt size={14} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Prompt Concat
        </span>
      </div>

      <div className="p-4">
        <p className="text-xs text-zinc-500 mb-2">
          Concatenates prompts from multiple connected nodes
        </p>
        <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <p className="text-xs text-zinc-400">Combined prompt will appear here...</p>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="concatInput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-blue-500 !bg-zinc-900 !left-[-6px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="concatOutput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-blue-500 !bg-zinc-900 !right-[-6px]"
      />
    </div>
  );
}