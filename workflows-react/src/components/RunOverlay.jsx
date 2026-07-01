import { LuX, LuCheck, LuCircleAlert } from 'react-icons/lu';

export default function RunOverlay({ status, onClose }) {
  const isRunning = status?.status === 'running';
  const isCompleted = status?.status === 'completed';
  const isFailed = status?.status === 'failed';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-[#1c1e21] rounded-xl p-6 w-full max-w-md border border-zinc-700 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            {isRunning && 'Running Workflow'}
            {isCompleted && 'Workflow Complete'}
            {isFailed && 'Workflow Failed'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <LuX size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="flex flex-col items-center py-6">
          {isRunning && (
            <>
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-zinc-400">Processing nodes...</p>
            </>
          )}

          {isCompleted && (
            <>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <LuCheck size={24} className="text-green-500" />
              </div>
              <p className="text-sm text-zinc-400">All nodes completed successfully!</p>
              {status?.results && (
                <p className="text-xs text-zinc-500 mt-2">
                  {Object.keys(status.results).length} nodes processed
                </p>
              )}
            </>
          )}

          {isFailed && (
            <>
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <LuCircleAlert size={24} className="text-red-500" />
              </div>
              <p className="text-sm text-red-400">{status?.error || 'An error occurred'}</p>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
          {isCompleted && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              View Outputs
            </button>
          )}
        </div>
      </div>
    </div>
  );
}