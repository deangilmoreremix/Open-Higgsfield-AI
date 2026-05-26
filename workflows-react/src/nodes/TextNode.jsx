import { useState, useEffect, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { TfiText } from 'react-icons/tfi';
import { useWorkflow } from '../context/WorkflowContext';

export default function TextNode({ id, data, selected }) {
  const { apiKey } = useWorkflow();
  const [formValues, setFormValues] = useState(data.formValues || {});
  const [output, setOutput] = useState(data.resultUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  const models = [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'text-passthrough', name: 'Input Text' },
  ];

  const handleChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleRun = async () => {
    if (!formValues.prompt) return;
    setIsLoading(true);

    try {
      if (apiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              ...(formValues.system_prompt ? [{ role: 'system', content: formValues.system_prompt }] : []),
              { role: 'user', content: formValues.prompt },
            ],
          }),
        });
        const result = await response.json();
        const text = result.choices?.[0]?.message?.content || '';
        setOutput(text);
      } else {
        setOutput(`Mock text response for: "${formValues.prompt}"`);
      }
    } catch (error) {
      console.error('Text generation error:', error);
      setOutput('Error generating text');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`
        w-80 bg-[#0c0d0f] rounded-xl border-2 transition-all duration-300
        ${selected ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-zinc-800'}
      `}
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#151618] to-[#1c1e21] rounded-t-xl border-b border-zinc-800 p-3">
        <div className={`p-1.5 rounded-lg ${selected ? 'bg-blue-600' : 'bg-zinc-800'}`}>
          <TfiText size={14} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Text {id.replace(/^\D+/g, '')}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <select
          value={data.selectedModel?.id || 'gpt-4o'}
          onChange={(e) => handleChange('model', e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {models.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <textarea
          value={formValues.prompt || ''}
          onChange={(e) => handleChange('prompt', e.target.value)}
          placeholder="Enter your prompt..."
          className="w-full h-24 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
        />

        {data.selectedModel?.id !== 'text-passthrough' && (
          <textarea
            value={formValues.system_prompt || ''}
            onChange={(e) => handleChange('system_prompt', e.target.value)}
            placeholder="System prompt (optional)..."
            className="w-full h-16 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        )}

        <button
          onClick={handleRun}
          disabled={isLoading || !formValues.prompt}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>

        {output && (
          <div className="mt-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-1">Output:</p>
            <p className="text-sm text-white whitespace-pre-wrap">{output}</p>
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="textInput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-blue-500 !bg-zinc-900 !left-[-6px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="textOutput"
        className="!w-3 !h-3 !rounded-full !border-2 !border-blue-500 !bg-zinc-900 !right-[-6px]"
      />
    </div>
  );
}