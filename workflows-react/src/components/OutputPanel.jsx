import { LuX } from 'react-icons/lu';

export default function OutputPanel({ nodes, onClose }) {
  const nodesWithOutput = nodes.filter(n => n.data?.resultUrl);

  return (
    <div className="w-80 bg-[#151618] border-l border-zinc-800 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-white">Outputs</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LuX size={16} className="text-zinc-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {nodesWithOutput.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500">No outputs yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              Run the workflow to see results here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {nodesWithOutput.map(node => (
              <div key={node.id} className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                <div className="px-3 py-2 bg-zinc-800/50 border-b border-zinc-800">
                  <p className="text-xs font-medium text-zinc-300">
                    {node.type.replace('Node', '')} - {node.id}
                  </p>
                </div>
                <div className="p-3">
                  {node.data.resultUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={node.data.resultUrl}
                      alt={`Output for ${node.id}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ) : node.data.resultUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={node.data.resultUrl}
                      controls
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ) : node.data.resultUrl.match(/\.(mp3|wav|ogg)$/i) ? (
                    <audio
                      src={node.data.resultUrl}
                      controls
                      className="w-full"
                    />
                  ) : (
                    <p className="text-xs text-zinc-400 break-all">
                      {node.data.resultUrl}
                    </p>
                  )}

                  {node.data.outputs?.[0]?.type && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Type: {node.data.outputs[0].type}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}