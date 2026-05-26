import { RiFlightTakeoffLine, RiRobot2Line } from 'react-icons/ri';
import { LuLayoutTemplate, LuSave, LuPlay, LuEye, LuEyeOff } from 'react-icons/lu';

export default function NodesNavbar({
  workflowName,
  onNameChange,
  onSave,
  onRun,
  onTogglePalette,
  onToggleOutput,
  hasChanges,
  isRunning,
  tabs,
  onTabChange,
}) {
  return (
    <div className="h-14 bg-gradient-to-r from-[#151618] to-[#1c1e21] border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => onNameChange(e.target.value)}
          className="text-lg font-semibold bg-transparent text-white border-none outline-none focus:ring-0 w-64"
          placeholder="Untitled Workflow"
        />
        {hasChanges && (
          <span className="text-xs text-yellow-500 px-2 py-0.5 bg-yellow-500/10 rounded-full">
            Unsaved
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex bg-zinc-800 rounded-lg p-1 mr-4">
          <button
            onClick={() => onTabChange('builder')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tabs === 'builder' || !tabs
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RiFlightTakeoffLine size={14} />
            Builder
          </button>
          <button
            onClick={() => onTabChange('playground')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tabs === 'playground'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RiRobot2Line size={14} />
            Playground
          </button>
        </div>

        <button
          onClick={onTogglePalette}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          title="Toggle Node Palette"
        >
          <LuLayoutTemplate size={18} className="text-zinc-400" />
        </button>

        <button
          onClick={onToggleOutput}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          title="Toggle Output Panel"
        >
          <LuEye size={18} className="text-zinc-400" />
        </button>

        <div className="w-px h-6 bg-zinc-700 mx-2" />

        <button
          onClick={onSave}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <LuSave size={16} />
          Save
        </button>

        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <LuPlay size={16} />
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>
    </div>
  );
}