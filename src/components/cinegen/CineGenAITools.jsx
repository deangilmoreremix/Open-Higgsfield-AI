const TOOLS = [
  { id: 'gap_fill', label: 'Gap Fill' },
  { id: 'extend', label: 'Extend' },
  { id: 'music', label: 'Music' },
  { id: 'mask', label: 'Mask' },
];

export function CineGenAITools({ onToolSelect }) {
  const handleClick = (toolId) => {
    if (onToolSelect) {
      onToolSelect(toolId);
    }
  };

  return (
    <div className="w-64 border-l border-white/10 bg-black/20 p-4 overflow-y-auto flex flex-col">
      <div className="text-xs font-bold uppercase tracking-[1.5px] text-white/60 mb-3">AI Tools</div>
      <div className="tools-panel flex flex-col gap-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            className="tool-btn w-full px-3 py-2 text-sm font-medium text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors active:bg-white/20"
            data-tool={tool.id}
            onClick={() => handleClick(tool.id)}
          >
            {tool.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CineGenAITools;
