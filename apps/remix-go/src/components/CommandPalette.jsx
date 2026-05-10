import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreProvider';
import { Search, ArrowUp, ArrowDown, Enter, Escape, Plus, Save, Download, Play, Undo, Redo, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

const CommandPalette = observer(() => {
  const store = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const getAvailableCommands = useMemo(() => [
    {
      id: 'new-project',
      title: 'New Project',
      description: 'Create a new video project',
      icon: Plus,
      keywords: ['create', 'new', 'project'],
      action: () => {
        window.location.href = '/new';
      }
    },
    {
      id: 'save-project',
      title: 'Save Project',
      description: 'Save current project',
      icon: Save,
      keywords: ['save', 'store', 'persist'],
      action: () => {
        store?.saveProject?.();
      }
    },
    {
      id: 'export-video',
      title: 'Export Video',
      description: 'Export current project as video',
      icon: Download,
      keywords: ['export', 'download', 'render'],
      action: () => {
        store?.exportProject?.();
      }
    },
    {
      id: 'open-settings',
      title: 'Settings',
      description: 'Open application settings',
      icon: Settings,
      keywords: ['settings', 'preferences', 'config'],
      action: () => {
        // Open settings modal
      }
    },
    {
      id: 'toggle-preview',
      title: 'Toggle Preview',
      description: 'Show/hide video preview',
      icon: Play,
      keywords: ['preview', 'play', 'view'],
      action: () => {
        store?.togglePreview?.();
      }
    },
    {
      id: 'add-text',
      title: 'Add Text Element',
      description: 'Add a new text element to timeline',
      icon: 'font',
      keywords: ['text', 'element', 'add'],
      action: () => {
        store?.addElement?.('text');
      }
    },
    {
      id: 'add-image',
      title: 'Add Image Element',
      description: 'Add a new image element to timeline',
      icon: 'image',
      keywords: ['image', 'photo', 'element', 'add'],
      action: () => {
        store?.addElement?.('image');
      }
    },
    {
      id: 'undo',
      title: 'Undo',
      description: 'Undo last action',
      icon: Undo,
      keywords: ['undo', 'revert', 'back'],
      action: () => {
        store?.undo?.();
      }
    },
    {
      id: 'redo',
      title: 'Redo',
      description: 'Redo last undone action',
      icon: Redo,
      keywords: ['redo', 'forward', 'repeat'],
      action: () => {
        store?.redo?.();
      }
    },
    {
      id: 'help',
      title: 'Help & Shortcuts',
      description: 'Show keyboard shortcuts and help',
      icon: HelpCircle,
      keywords: ['help', 'shortcuts', 'guide'],
      action: () => {
        // Open help
      }
    }
  ], [store]);

  const filteredCommands = useMemo(() => {
    if (!searchQuery) return getAvailableCommands;

    const query = searchQuery.toLowerCase();
    return getAvailableCommands.filter(cmd =>
      cmd.title.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      (cmd.keywords && cmd.keywords.some(keyword => keyword.toLowerCase().includes(query)))
    );
  }, [searchQuery, getAvailableCommands]);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      if (newState) {
        setSearchQuery('');
        setSelectedIndex(0);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
      return newState;
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  }, []);

  const navigateResults = useCallback((direction) => {
    if (filteredCommands.length === 0) return;

    if (direction === 'up') {
      setSelectedIndex(prev => prev > 0 ? prev - 1 : filteredCommands.length - 1);
    } else if (direction === 'down') {
      setSelectedIndex(prev => prev < filteredCommands.length - 1 ? prev + 1 : 0);
    }
  }, [filteredCommands.length]);

  const executeSelectedCommand = useCallback(() => {
    if (filteredCommands.length > 0 && filteredCommands[selectedIndex]) {
      const command = filteredCommands[selectedIndex];
      command.action?.();
      close();
    }
  }, [filteredCommands, selectedIndex, close]);

  // Global keyboard listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ctrl+K or Cmd+K to open command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleOpen();
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', handleGlobalKeyDown);
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('keydown', handleGlobalKeyDown);
      }
    };
  }, [isOpen, toggleOpen, close]);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        navigateResults('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigateResults('down');
        break;
      case 'Enter':
        e.preventDefault();
        executeSelectedCommand();
        break;
      case 'Escape':
        close();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-96 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              placeholder="Type a command..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-64">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No commands found for "{searchQuery}"
            </div>
          ) : (
            filteredCommands.map((command, index) => {
              const IconComponent = typeof command.icon === 'function' ? command.icon : null;
              return (
                <div
                  key={command.id}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                    index === selectedIndex
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  )}
                  onClick={() => {
                    setSelectedIndex(index);
                    executeSelectedCommand();
                  }}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {IconComponent ? (
                      <IconComponent size={16} />
                    ) : (
                      <span className="text-xs">{command.icon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{command.title}</div>
                    <div className="text-xs text-gray-500">{command.description}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t bg-gray-50 flex items-center gap-4 text-xs text-gray-500">
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">↑↓</kbd>
          <span>Navigate</span>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Enter</kbd>
          <span>Execute</span>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Esc</kbd>
          <span>Close</span>
        </div>
      </div>
    </div>
  );
});

export default CommandPalette;
