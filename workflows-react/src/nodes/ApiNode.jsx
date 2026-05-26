import { Handle, Position } from 'reactflow';

export default function ApiNode({ id, data, selected }) {
  return (
    <div
      className={`
        w-80 bg-[#0c0d0f] rounded-xl border-2 transition-all duration-300
        ${selected ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-zinc-800'}
      `}
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#151618] to-[#1c1e21] rounded-t-xl border-b border-zinc-800 p-3">
        <div className={`p-1.5 rounded-lg ${selected ? 'bg-purple-600' : 'bg-zinc-800'}`}>
          <span className="text-xs font-bold text-white">API</span>
        </div>
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          API {id.replace(/^\D+/g, '')}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <select
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
        >
          <option value="">Select API Model</option>
          <option value="custom">Custom API</option>
        </select>

        <textarea
          placeholder="API endpoint or configuration..."
          className="w-full h-20 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
        />

        <button
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Call API
        </button>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="apiInput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-blue-500 !bg-zinc-900 !left-[-6px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="apiOutput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-purple-500 !bg-zinc-900 !right-[-6px]"
      />
    </div>
  );
}