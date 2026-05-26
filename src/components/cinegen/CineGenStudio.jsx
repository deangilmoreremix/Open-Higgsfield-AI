import CineGenHeader from './CineGenHeader.jsx';
import CineGenSidebarLeft from './CineGenSidebarLeft.jsx';
import CineGenWorkspace from './CineGenWorkspace.jsx';
import CineGenAITools from './CineGenAITools.jsx';

function runTool(tool) {
  console.log(`[CineGen] Running tool: ${tool}`);
  // This will later call the shared cinegenIntegration.js (preserved from original)
}

export function CineGenStudio() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] text-white overflow-hidden cinegen-app theme-cinematic">
      <CineGenHeader />
      <div className="cinegen-main flex flex-1 overflow-hidden">
        <CineGenSidebarLeft />
        <CineGenWorkspace />
        <CineGenAITools onToolSelect={runTool} />
      </div>
    </div>
  );
}

export default CineGenStudio;
