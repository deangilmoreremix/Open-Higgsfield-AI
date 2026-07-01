import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <Routes>
        <Route path="/" element={<div className="p-8 text-2xl">Higgsfield Core 2.0 — Platform Ready</div>} />
        <Route path="/workspace" element={<div className="p-8">Workspace Shell (coming in Task 5)</div>} />
      </Routes>
    </div>
  );
}
