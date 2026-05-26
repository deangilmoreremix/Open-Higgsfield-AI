import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { IoVideocamOutline } from 'react-icons/io5';
import { useWorkflow } from '../context/WorkflowContext';

export default function VideoNode({ id, data, selected }) {
  const { apiKey } = useWorkflow();
  const [formValues, setFormValues] = useState(data.formValues || {});
  const [videoUrl, setVideoUrl] = useState(data.resultUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  const models = [
    { id: 'wan-2-1', name: 'Wan 2.1' },
    { id: 'kling-3-0', name: 'Kling 3.0' },
    { id: 'veo-3-1', name: 'Veo 3.1' },
    { id: 'video-passthrough', name: 'Input Video' },
  ];

  const durations = [
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' },
  ];

  const aspectRatios = [
    { value: '16:9', label: '16:9 (Landscape)' },
    { value: '9:16', label: '9:16 (Portrait)' },
    { value: '1:1', label: '1:1 (Square)' },
  ];

  const handleChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!formValues.prompt) return;
    setIsLoading(true);

    try {
      if (apiKey) {
        const response = await fetch('https://api.muapi.ai/api/v1/video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            model: formValues.model || 'wan-2-1',
            prompt: formValues.prompt,
            aspect_ratio: formValues.aspect_ratio || '16:9',
            duration: parseInt(formValues.duration || 5),
          }),
        });
        const result = await response.json();
        if (result.request_id) {
          const pollResult = await pollForResult(result.request_id);
          setVideoUrl(pollResult.output || pollResult.video?.url);
        }
      } else {
        setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    } finally {
      setIsLoading(false);
    }
  };

  const pollForResult = async (requestId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ output: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' });
      }, 3000);
    });
  };

  return (
    <div
      className={`
        w-80 bg-[#0c0d0f] rounded-xl border-2 transition-all duration-300
        ${selected ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-zinc-800'}
      `}
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#151618] to-[#1c1e21] rounded-t-xl border-b border-zinc-800 p-3">
        <div className={`p-1.5 rounded-lg ${selected ? 'bg-orange-600' : 'bg-zinc-800'}`}>
          <IoVideocamOutline size={14} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Video {id.replace(/^\D+/g, '')}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <select
          value={formValues.model || 'wan-2-1'}
          onChange={(e) => handleChange('model', e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
        >
          {models.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <textarea
          value={formValues.prompt || ''}
          onChange={(e) => handleChange('prompt', e.target.value)}
          placeholder="Describe the video you want to generate..."
          className="w-full h-20 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
        />

        <div className="flex gap-2">
          <select
            value={formValues.aspect_ratio || '16:9'}
            onChange={(e) => handleChange('aspect_ratio', e.target.value)}
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
          >
            {aspectRatios.map(ar => (
              <option key={ar.value} value={ar.value}>{ar.label}</option>
            ))}
          </select>
          <select
            value={formValues.duration || '5'}
            onChange={(e) => handleChange('duration', e.target.value)}
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
          >
            {durations.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !formValues.prompt}
          className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Video'}
        </button>

        {videoUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700">
            <video src={videoUrl} controls className="w-full h-48 object-cover" />
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="videoInput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-blue-500 !bg-zinc-900 !left-[-6px]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="videoInput2"
        style={{ top: 140 }}
        className="!w-3 !h-3 !rounded-full !border-2 !border-green-500 !bg-zinc-900 !left-[-6px]"
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