import { LuX, LuTrash2, LuCopy } from 'react-icons/lu';

export default function PropertiesPanel({ node, onClose, onDelete, onDuplicate, onDataChange }) {
  const nodeType = node.type.replace('Node', '').toLowerCase();

  return (
    <div className="w-80 bg-[#151618] border-l border-zinc-800 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-white">
          {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LuX size={16} className="text-zinc-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Node ID
            </label>
            <p className="text-sm text-white font-mono bg-zinc-900 px-3 py-2 rounded-lg">
              {node.id}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Position
            </label>
            <p className="text-sm text-white font-mono bg-zinc-900 px-3 py-2 rounded-lg">
              x: {Math.round(node.position?.x || 0)}, y: {Math.round(node.position?.y || 0)}
            </p>
          </div>

          {node.data?.resultUrl && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Output
              </label>
              {node.data.resultUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={node.data.resultUrl}
                  alt="Output"
                  className="w-full h-32 object-cover rounded-lg border border-zinc-700"
                />
              ) : node.data.resultUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  src={node.data.resultUrl}
                  controls
                  className="w-full h-32 object-cover rounded-lg border border-zinc-700"
                />
              ) : (
                <p className="text-sm text-white bg-zinc-900 px-3 py-2 rounded-lg break-all">
                  {node.data.resultUrl}
                </p>
              )}
            </div>
          )}

          {node.data?.errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs font-medium text-red-400">Error</p>
              <p className="text-sm text-red-300 mt-1">{node.data.errorMsg}</p>
            </div>
          )}

          {node.data?.outputHistory?.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Output History ({node.data.outputHistory.length})
              </label>
              <div className="space-y-2">
                {node.data.outputHistory.map((h, i) => (
                  <div
                    key={i}
                    className="p-2 bg-zinc-900 rounded-lg border border-zinc-800"
                  >
                    <p className="text-xs text-zinc-500">
                      {new Date().toLocaleString()}
                    </p>
                    <p className="text-xs text-white mt-1 truncate">
                      {h.resultUrl || h.outputs?.[0]?.value || 'No output'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800 space-y-2">
        <button
          onClick={onDuplicate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <LuCopy size={16} />
          Duplicate Node
        </button>
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors"
        >
          <LuTrash2 size={16} />
          Delete Node
        </button>
      </div>
    </div>
  );
}