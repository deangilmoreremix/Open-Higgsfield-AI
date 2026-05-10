import React, { useState, useRef, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import {
  Edit3, Copy, Trash2, ArrowUp, ArrowDown, FolderOpen,
  Download, FileEdit, Eye, Plus, Exchange, Info, Pencil,
  Trash
} from 'lucide-react';

function ContextMenu({
  onEditElement,
  onDuplicateElement,
  onDeleteElement,
  onBringToFront,
  onSendToBack,
  onOpenProject,
  onDuplicateProject,
  onRenameProject,
  onExportProject,
  onDeleteProject,
  onPreviewMedia,
  onAddToTimeline,
  onReplaceMedia,
  onShowProperties
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [menuItems, setMenuItems] = useState([]);
  const [targetData, setTargetData] = useState(null);
  const menuRef = useRef(null);

  const iconMap = {
    'fa-edit': Edit3,
    'fa-copy': Copy,
    'fa-trash': Trash2,
    'fa-arrow-up': ArrowUp,
    'fa-arrow-down': ArrowDown,
    'fa-folder-open': FolderOpen,
    'fa-download': Download,
    'fa-envelope': Pencil,
    'fa-eye': Eye,
    'fa-plus': Plus,
    'fa-exchange': Exchange,
    'fa-info-circle': Info,
    'fa-pencil': Pencil,
    'fa-trash': Trash
  };

  const getMenuItems = useCallback((menuType, data) => {
    switch (menuType) {
      case 'timeline-element':
        return [
          {
            id: 'edit',
            label: 'Edit',
            icon: 'fa-edit',
            action: () => onEditElement?.(data)
          },
          {
            id: 'duplicate',
            label: 'Duplicate',
            icon: 'fa-copy',
            action: () => onDuplicateElement?.(data)
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: 'fa-trash',
            action: () => onDeleteElement?.(data),
            danger: true
          },
          { type: 'divider' },
          {
            id: 'bring-front',
            label: 'Bring to Front',
            icon: 'fa-arrow-up',
            action: () => onBringToFront?.(data)
          },
          {
            id: 'send-back',
            label: 'Send to Back',
            icon: 'fa-arrow-down',
            action: () => onSendToBack?.(data)
          }
        ];

      case 'project-item':
        return [
          {
            id: 'open',
            label: 'Open',
            icon: 'fa-folder-open',
            action: () => onOpenProject?.(data)
          },
          {
            id: 'duplicate',
            label: 'Duplicate',
            icon: 'fa-copy',
            action: () => onDuplicateProject?.(data)
          },
          {
            id: 'rename',
            label: 'Rename',
            icon: 'fa-edit',
            action: () => onRenameProject?.(data)
          },
          {
            id: 'export',
            label: 'Export',
            icon: 'fa-download',
            action: () => onExportProject?.(data)
          },
          { type: 'divider' },
          {
            id: 'delete',
            label: 'Delete',
            icon: 'fa-trash',
            action: () => onDeleteProject?.(data),
            danger: true
          }
        ];

      case 'media-item':
        return [
          {
            id: 'preview',
            label: 'Preview',
            icon: 'fa-eye',
            action: () => onPreviewMedia?.(data)
          },
          {
            id: 'add-timeline',
            label: 'Add to Timeline',
            icon: 'fa-plus',
            action: () => onAddToTimeline?.(data)
          },
          {
            id: 'replace',
            label: 'Replace Media',
            icon: 'fa-exchange',
            action: () => onReplaceMedia?.(data)
          },
          { type: 'divider' },
          {
            id: 'properties',
            label: 'Properties',
            icon: 'fa-info-circle',
            action: () => onShowProperties?.(data)
          }
        ];

      default:
        return [];
    }
  }, [onEditElement, onDuplicateElement, onDeleteElement, onBringToFront, onSendToBack,
      onOpenProject, onDuplicateProject, onRenameProject, onExportProject, onDeleteProject,
      onPreviewMedia, onAddToTimeline, onReplaceMedia, onShowProperties]);

  const showMenu = useCallback((x, y, menuType, data = null) => {
    const items = getMenuItems(menuType, data);
    setPosition({ x, y });
    setMenuItems(items);
    setTargetData(data);
    setIsVisible(true);

    // Adjust position to keep menu in viewport
    requestAnimationFrame(() => {
      if (menuRef.current) {
        const menu = menuRef.current;
        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let adjustedX = x;
        let adjustedY = y;

        if (x + rect.width > viewportWidth) {
          adjustedX = viewportWidth - rect.width - 10;
        }
        if (y + rect.height > viewportHeight) {
          adjustedY = viewportHeight - rect.height - 10;
        }

        adjustedX = Math.max(10, adjustedX);
        adjustedY = Math.max(10, adjustedY);

        setPosition({ x: adjustedX, y: adjustedY });
      }
    });
  }, [getMenuItems]);

  const hideMenu = useCallback(() => {
    setIsVisible(false);
    setMenuItems([]);
    setTargetData(null);
  }, []);

  const handleContextMenu = useCallback((e) => {
    const contextMenuTrigger = e.target.closest('[data-context-menu]');

    if (contextMenuTrigger) {
      e.preventDefault();

      const menuType = contextMenuTrigger.getAttribute('data-context-menu');
      const elementId = contextMenuTrigger.getAttribute('data-element-id');
      const elementType = contextMenuTrigger.getAttribute('data-element-type');

      showMenu(e.clientX, e.clientY, menuType, {
        element: contextMenuTrigger,
        id: elementId,
        type: elementType
      });
    }
  }, [showMenu]);

  const handleClickOutside = useCallback((e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      hideMenu();
    }
  }, [hideMenu]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isVisible) {
      hideMenu();
    }
  }, [isVisible, hideMenu]);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleContextMenu, handleClickOutside, handleKeyDown]);

  const handleMenuItemClick = useCallback((item) => {
    if (item.action) {
      item.action();
    }
    hideMenu();
  }, [hideMenu]);

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={16} /> : null;
  };

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded shadow-lg z-[9999] min-w-[160px] max-w-[250px] py-1"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'divider') {
          return <div key={`divider-${index}`} className="h-px bg-gray-200 my-1" />;
        }

        return (
          <div
            key={item.id}
            className={clsx(
              'flex items-center px-3 py-2 cursor-pointer text-sm text-gray-900 transition-colors hover:bg-gray-100',
              item.danger && 'text-red-500 hover:bg-red-50'
            )}
            onClick={() => handleMenuItemClick(item)}
          >
            {item.icon && (
              <div className="w-4 h-4 flex items-center justify-center mr-2 text-gray-600">
                {getIcon(item.icon)}
              </div>
            )}
            <span className="flex-1">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default observer(ContextMenu);
