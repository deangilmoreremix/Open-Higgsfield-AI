import { Handle, Position } from 'reactflow';
import { AiOutlineAudio } from 'react-icons/ai';

export default function AudioNode({ id, data, selected }) {
  const audioUrl = data.resultUrl || '';

  return (
    <div
      className={`
        w-80 bg-[#0c0d0f] rounded-xl border-2 transition-all duration-300
        ${selected ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-zinc-800'}
      `}
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#151618] to-[#1c1e21] rounded-t-xl border-b border-zinc-800 p-3">
        <div className={`p-1.5 rounded-lg ${selected ? 'bg-yellow-600' : 'bg-zinc-800'}`}>
          <AiOutlineAudio size={14} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Audio {id.replace(/^\D+/g, '')}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <select
          value={data.selectedModel?.id || 'music-gen'}
          onChange={(e) => {}}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-500"
        >
          <option value="music-gen">Music Generation</option>
          <option value="audio-passthrough">Input Audio</option>
        </select>

        <textarea
          value={data.formValues?.prompt || ''}
          onChange={(e) => {}}
          placeholder="Describe the audio you want to generate..."
          className="w-full h-20 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 resize-none"
        />

        <button
          onClick={() => {}}
          className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Generate Audio
        </button>

        {audioUrl && (
          <div className="mt-2">
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="audioInput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-yellow-500 !bg-zinc-900 !left-[-6px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="audioOutput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-yellow-500 !bg-zinc-900 !right-[-6px]"
      />
    </div>
  );
}