/**
 * Clip Sortable — @dnd-kit based reordering
 *
 * Additive: does NOT replace the existing HTML5 drag handlers in
 * dragDrop.js. This adds @dnd-kit/sortable as an alternative
 * keyboard/pointer-accessible reorder mechanism for clips within
 * a track.
 *
 * The component provides:
 *   - Drag handles on each clip (keyboard accessible via Space/Enter)
 *   - Snap-to-grid via @dnd-kit/modifiers
 *   - Ghost preview while dragging
 *   - Autoscroll when dragging near edges
 *   - Multi-select with Shift/Cmd/Ctrl
 *   - Overwrite/ripple behavior on drop
 *
 * The actual reorder logic is emitted as an onReorder callback so
 * the parent (TimelineEditorPage) can update its state via the
 * existing track.clips / track.items alias.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

/**
 * Single sortable clip item. Renders children inside a sortable
 * wrapper. Activates on the assigned drag handle.
 */
export function SortableClip({ id, disabled, modifier, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: disabled ? 'default' : 'grab',
    touchAction: 'none'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} data-sortable-id={id}>
      {typeof children === 'function'
        ? children({ listeners, attributes, isDragging })
        : children}
    </div>
  );
}

/**
 * DragOverlay content for the clip being dragged. Renders a "ghost"
 * preview so the user sees what they're dragging.
 */
function ClipDragOverlay({ clip, modifier }) {
  if (!clip) return null;
  return (
    <div className="clip-drag-overlay" style={{ pointerEvents: 'none' }}>
      <div className="clip-drag-ghost">
        <span className="clip-drag-icon">≡</span>
        <span className="clip-drag-label">{clip.name || clip.label || `Clip ${clip.id}`}</span>
        {modifier && <span className="clip-drag-modifier">{modifier}</span>}
      </div>
    </div>
  );
}

/**
 * ClipSortable — sortable list of clips with dnd-kit.
 *
 * @param {Object} props
 * @param {Array} props.clips - Array of clip objects (each must have id)
 * @param {Function} props.onReorder - Called with (newOrder, oldIndex, newIndex, options)
 * @param {Function} [props.renderItem] - (clip, isDragging) => ReactNode
 * @param {string} [props.axis='y'] - 'x' | 'y' | 'xy'
 * @param {boolean} [props.snapToGrid=false] - Snap to grid
 * @param {number} [props.gridSize=10] - Grid size in pixels
 * @param {boolean} [props.multiSelect=true] - Allow multi-select
 * @param {boolean} [props.autoscroll=true] - Autoscroll near edges
 * @param {boolean} [props.overwrite=false] - Overwrite on drop (vs insert)
 * @param {boolean} [props.ripple=false] - Ripple insert (push neighbors)
 */
export function ClipSortable({
  clips,
  onReorder,
  renderItem,
  axis = 'y',
  snapToGrid = false,
  gridSize = 10,
  multiSelect = true,
  autoscroll = true,
  overwrite = false,
  ripple = false,
  disabled = false
}) {
  const [activeId, setActiveId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modifier, setModifier] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const items = useMemo(() => clips.map(c => ({ ...c })), [clips]);
  const activeClip = useMemo(
    () => clips.find(c => c.id === activeId) || null,
    [clips, activeId]
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
    // Detect modifier keys for overwrite/ripple
    if (event.activatorEvent) {
      if (event.activatorEvent.altKey) setModifier('alt-copy');
      else if (event.activatorEvent.shiftKey) setModifier('shift-range');
      else if (event.activatorEvent.metaKey || event.activatorEvent.ctrlKey) setModifier('cmd-multi');
      else setModifier(null);
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    setActiveId(null);
    setModifier(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(c => c.id === active.id);
    const newIndex = items.findIndex(c => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrder = arrayMove(items, oldIndex, newIndex);
    if (typeof onReorder === 'function') {
      onReorder(newOrder, oldIndex, newIndex, {
        overwrite,
        ripple,
        modifier
      });
    }
  }, [items, onReorder, overwrite, ripple, modifier]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setModifier(null);
  }, []);

  // Click on item toggles multi-select
  const handleItemClick = useCallback((id, event) => {
    if (!multiSelect) {
      setSelectedIds(new Set([id]));
      return;
    }
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (event.shiftKey || event.metaKey || event.ctrlKey) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  }, [multiSelect]);

  // Build modifier chain
  const dndModifiers = useMemo(() => {
    const mods = [];
    if (axis === 'y') mods.push(restrictToVerticalAxis);
    else if (axis === 'x') mods.push(restrictToHorizontalAxis);
    mods.push(restrictToParentElement);
    if (snapToGrid) mods.push(createSnapModifier(gridSize));
    return mods;
  }, [axis, snapToGrid, gridSize]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={dndModifiers}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      autoScroll={autoscroll}
    >
      <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {items.map(clip => (
          <SortableClip
            key={clip.id}
            id={clip.id}
            disabled={disabled}
          >
            {(handleProps) =>
              typeof renderItem === 'function'
                ? renderItem(clip, selectedIds.has(clip.id), { ...handleProps, onClick: (e) => handleItemClick(clip.id, e) })
                : <div>{clip.name || clip.id}</div>
            }
          </SortableClip>
        ))}
      </SortableContext>
      <DragOverlay>
        {activeId ? <ClipDragOverlay clip={activeClip} modifier={modifier} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// Helper: horizontal axis restrictor (from @dnd-kit/modifiers)
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';

// Helper: snap modifier factory
function createSnapModifier(gridSize) {
  return ({ transform }) => {
    if (!transform) return transform;
    return {
      ...transform,
      x: Math.round(transform.x / gridSize) * gridSize,
      y: Math.round(transform.y / gridSize) * gridSize
    };
  };
}

export default ClipSortable;
