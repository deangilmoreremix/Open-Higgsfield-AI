export function CineGenWorkspace() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden p-2 bg-[#0a0a0a]">
      <div className="viewer-area flex gap-2 h-[55%] min-h-[280px]">
        <div className="viewer flex-1 bg-black/70 border border-white/10 rounded-lg flex items-center justify-center text-white/40 text-sm font-medium tracking-wide">
          Main Viewer
        </div>
        <div className="viewer secondary flex-1 bg-black/70 border border-white/10 rounded-lg flex items-center justify-center text-white/40 text-sm font-medium tracking-wide">
          Reference Viewer
        </div>
      </div>
      <div className="timeline-area flex-1 mt-2 border-t border-white/10 bg-black/60 rounded-b-lg flex items-center justify-center text-white/40 text-sm font-medium tracking-wide">
        CineGen Timeline
      </div>
    </div>
  );
}

export default CineGenWorkspace;
