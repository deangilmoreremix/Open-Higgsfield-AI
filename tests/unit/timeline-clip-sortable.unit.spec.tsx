import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => <div data-testid="dnd-context">{children}</div>,
  closestCenter: () => 'closest',
  KeyboardSensor: class {},
  PointerSensor: class {},
  useSensor: () => ({}),
  useSensors: () => ({}),
  DragOverlay: ({ children }) => <div data-testid="drag-overlay">{children}</div>
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: (arr, oldI, newI) => {
    const copy = [...arr];
    const [item] = copy.splice(oldI, 1);
    copy.splice(newI, 0, item);
    return copy;
  },
  SortableContext: ({ children }) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: () => null,
  verticalListSortingStrategy: () => null,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false
  })
}));

vi.mock('@dnd-kit/modifiers', () => ({
  restrictToVerticalAxis: { name: 'restrictToVerticalAxis' },
  restrictToHorizontalAxis: { name: 'restrictToHorizontalAxis' },
  restrictToParentElement: { name: 'restrictToParentElement' }
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => 'transform: none' } }
}));

import { ClipSortable, SortableClip } from '../../src/lib/editor/ClipSortable.jsx';

describe('ClipSortable', () => {
  const sampleClips = [
    { id: 'a', name: 'Clip A' },
    { id: 'b', name: 'Clip B' },
    { id: 'c', name: 'Clip C' }
  ];

  it('renders all clips', () => {
    render(
      <ClipSortable clips={sampleClips} renderItem={(c) => <span>{c.name}</span>} />
    );
    expect(screen.getByText('Clip A')).toBeDefined();
    expect(screen.getByText('Clip B')).toBeDefined();
    expect(screen.getByText('Clip C')).toBeDefined();
  });

  it('renders DndContext and SortableContext', () => {
    render(
      <ClipSortable clips={sampleClips} renderItem={(c) => <span>{c.name}</span>} />
    );
    expect(screen.getByTestId('dnd-context')).toBeDefined();
    expect(screen.getByTestId('sortable-context')).toBeDefined();
  });

  it('calls renderItem with isSelected and handle props', () => {
    const renderItem = vi.fn((clip, isSelected, handle) => (
      <div data-testid={`item-${clip.id}`} data-selected={isSelected}>
        {clip.name}
      </div>
    ));
    render(<ClipSortable clips={sampleClips} renderItem={renderItem} />);
    expect(renderItem).toHaveBeenCalledTimes(3);
    const firstCall = renderItem.mock.calls[0];
    expect(firstCall[0].id).toBe('a');
    expect(firstCall[1]).toBe(false); // not selected
    expect(firstCall[2]).toBeDefined(); // handle props
  });

  it('does not render drag overlay when nothing is active', () => {
    render(
      <ClipSortable clips={sampleClips} renderItem={(c) => <span>{c.name}</span>} />
    );
    const overlay = screen.getByTestId('drag-overlay');
    expect(overlay.textContent).toBe('');
  });
});

describe('SortableClip', () => {
  it('renders children', () => {
    render(
      <SortableClip id="x">
        <span data-testid="child">hello</span>
      </SortableClip>
    );
    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('renders function children with handle props', () => {
    render(
      <SortableClip id="x">
        {(handle) => (
          <div data-testid="child">
            <button {...handle.listeners}>drag</button>
          </div>
        )}
      </SortableClip>
    );
    expect(screen.getByText('drag')).toBeDefined();
  });

  it('does not throw when disabled', () => {
    expect(() => render(
      <SortableClip id="x" disabled>
        <span>hello</span>
      </SortableClip>
    )).not.toThrow();
  });
});
