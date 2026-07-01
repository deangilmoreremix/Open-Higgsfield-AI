import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { IoImageOutline } from 'react-icons/io5';
import { useWorkflow } from '../context/WorkflowContext';

export default function ImageNode({ id, data, selected }) {
  const { apiKey } = useWorkflow();
  const [formValues, setFormValues] = useState(data.formValues || {});
  const [imageUrl, setImageUrl] = useState(data.resultUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  const models = [
    { id: 'flux-dev', name: 'FLUX Dev' },
    { id: 'flux-2-max', name: 'FLUX 2 Max' },
    { id: 'sd3-medium', name: 'SD3 Medium' },
    { id: 'image-passthrough', name: 'Input Image' },
  ];

  const aspectRatios = [
    { value: '1:1', label: '1:1 (Square)' },
    { value: '16:9', label: '16:9 (Landscape)' },
    { value: '9:16', label: '9:16 (Portrait)' },
    { value: '4:3', label: '4:3' },
    { value: '3:4', label: '3:4' },
  ];

  const handleChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!formValues.prompt) return;
    setIsLoading(true);

    try {
      if (apiKey) {
        const response = await fetch('https://api.muapi.ai/api/v1/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            model: formValues.model || 'flux-dev',
            prompt: formValues.prompt,
            aspect_ratio: formValues.aspect_ratio || '1:1',
            size: formValues.size || '1024x1024',
          }),
        });
        const result = await response.json();
        if (result.request_id) {
          const pollResult = await pollForResult(result.request_id);
          setImageUrl(pollResult.output || pollResult.url);
        }
      } else {
        const seed = Math.random().toString(36).substr(2, 9);
        setImageUrl(`https://picsum.photos/seed/${seed}/512/512`);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setImageUrl(`https://picsum.photos/seed/${Date.now()}/512/512`);
    } finally {
      setIsLoading(false);
    }
  };

  const pollForResult = async (requestId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ output: `https://picsum.photos/seed/${requestId}/512/512` });
      }, 2000);
    });
  };

  return (
    <div
      className={`
        w-80 bg-[#0c0d0f] rounded-xl border-2 transition-all duration-300
        ${selected ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-zinc-800'}
      `}
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#151618] to-[#1c1e21] rounded-t-xl border-b border-zinc-800 p-3">
        <div className={`p-1.5 rounded-lg ${selected ? 'bg-green-600' : 'bg-zinc-800'}`}>
          <IoImageOutline size={14} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Image {id.replace(/^\D+/g, '')}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <select
          value={formValues.model || 'flux-dev'}
          onChange={(e) => handleChange('model', e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-green-500"
        >
          {models.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <textarea
          value={formValues.prompt || ''}
          onChange={(e) => handleChange('prompt', e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="w-full h-20 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 resize-none"
        />

        <select
          value={formValues.aspect_ratio || '1:1'}
          onChange={(e) => handleChange('aspect_ratio', e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-green-500"
        >
          {aspectRatios.map(ar => (
            <option key={ar.value} value={ar.value}>{ar.label}</option>
          ))}
        </select>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !formValues.prompt}
          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>

        {imageUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700">
            <img src={imageUrl} alt="Generated" className="w-full h-48 object-cover" />
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="imageInput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-blue-500 !bg-zinc-900 !left-[-6px]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="imageInput2"
        style={{ top: 140 }}
        className="!w-3 !h-3 !rounded-full !border-2 !border-green-500 !bg-zinc-900 !left-[-6px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="imageOutput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-green-500 !bg-zinc-900 !right-[-6px]"
      />
    </div>
  );
}