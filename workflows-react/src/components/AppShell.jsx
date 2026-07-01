import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useWorkflow } from '../context/WorkflowContext';
import { LuLayoutTemplate, LuFolderOpen, LuSettings, LuPlus } from 'react-icons/lu';
import { RiRobot2Line } from 'react-icons/ri';

function Header({ onApiKeyClick }) {
  const { apiKey, isDemoMode } = useWorkflow();

  return (
    <header className="h-14 bg-gradient-to-r from-[#151618] to-[#1c1e21] border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">W</span>
        </div>
        <h1 className="text-lg font-bold text-white">Workflows</h1>
        {isDemoMode && (
          <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full">
            Demo Mode
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onApiKeyClick}
          className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
        >
          {apiKey ? 'API Key Set' : 'Add API Key'}
        </button>
      </div>
    </header>
  );
}

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/workflows', label: 'My Workflows', icon: LuFolderOpen },
    { path: '/templates', label: 'Templates', icon: LuLayoutTemplate },
  ];

  return (
    <aside className="w-56 bg-[#0c0d0f] border-r border-zinc-800 flex flex-col">
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="p-3 border-t border-zinc-800">
        <Link
          to="/workflows/new"
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <LuPlus size={18} />
          New Workflow
        </Link>
      </div>
    </aside>
  );
}

function ApiKeyModal({ isOpen, onClose }) {
  const { apiKey, setApiKey } = useWorkflow();
  const [input, setInput] = useState(apiKey);

  const handleSave = () => {
    setApiKey(input);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-[#1c1e21] rounded-xl p-6 w-full max-w-md border border-zinc-700">
        <h2 className="text-lg font-bold text-white mb-4">MuAPI API Key</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Enter your MuAPI key to enable generation. Get one at muapi.ai
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter API key..."
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppShell() {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#0c0d0f]">
      <Header onApiKeyClick={() => setShowApiKey(true)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <ApiKeyModal isOpen={showApiKey} onClose={() => setShowApiKey(false)} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1c1e21',
            color: '#fff',
            border: '1px solid #3f3f46',
          },
        }}
      />
    </div>
  );
}