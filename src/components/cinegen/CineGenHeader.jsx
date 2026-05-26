export function CineGenHeader() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 shrink-0">
      <div className="text-xl font-bold tracking-[2px] text-white">CineGen</div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 text-xs font-bold text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
        >
          New Project
        </button>
        <button
          className="px-3 py-1.5 text-xs font-bold text-black bg-primary border-none rounded-lg hover:bg-primary/80 transition-colors"
        >
          Import Media
        </button>
      </div>
    </div>
  );
}

export default CineGenHeader;
