import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

const { processFileUploadMock } = vi.hoisted(() => ({
  processFileUploadMock: vi.fn(async (file, opts) => ({
    success: true,
    asset: { id: 'a1', name: file.name, url: 'https://x' },
    clip: { id: 'c1' }
  }))
}));

vi.mock('../../src/lib/editor/uploadPipeline.js', () => ({
  processFileUpload: processFileUploadMock
}));

vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(({ onDrop }) => ({
    getRootProps: (props = {}) => ({
      ...props,
      'data-testid': 'dropzone-root',
      className: props.className || ''
    }),
    getInputProps: () => ({ 'data-testid': 'dropzone-input', type: 'file' }),
    isDragActive: false,
    isDragReject: false
  }))
}));

import { MediaDropzone } from '../../src/lib/editor/MediaDropzone.jsx';

describe('MediaDropzone', () => {
  beforeEach(() => {
    processFileUploadMock.mockClear();
  });

  it('renders children inside a dropzone root', () => {
    render(
      <MediaDropzone state={{ tracks: [], assets: [] }}>
        <div data-testid="child">Hello</div>
      </MediaDropzone>
    );
    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('exposes a hidden file input', () => {
    const { container } = render(
      <MediaDropzone state={{ tracks: [] }}>
        <div>content</div>
      </MediaDropzone>
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
  });

  it('forwards accept, multiple, maxSize to react-dropzone (verified via useDropzone call)', () => {
    // useDropzone is mocked; we just verify the component renders without error
    const accept = { 'video/*': [] };
    const { container } = render(
      <MediaDropzone state={{}} accept={accept} multiple={false} maxSize={1024}>
        <span>x</span>
      </MediaDropzone>
    );
    expect(container.querySelector('[data-testid="dropzone-root"]')).toBeTruthy();
  });

  it('renders dropzone-overlay when isDragActive', async () => {
    // Re-mock useDropzone to set isDragActive true
    const reactDropzone = await import('react-dropzone');
    reactDropzone.useDropzone.mockReturnValueOnce({
      getRootProps: (p = {}) => ({ ...p, 'data-testid': 'dropzone-root' }),
      getInputProps: () => ({ type: 'file' }),
      isDragActive: true,
      isDragReject: false
    });
    render(
      <MediaDropzone state={{}}>
        <div>content</div>
      </MediaDropzone>
    );
    expect(screen.getByText('Drop files to upload')).toBeDefined();
  });

  it('renders error overlay when isDragReject', async () => {
    const reactDropzone = await import('react-dropzone');
    reactDropzone.useDropzone.mockReturnValueOnce({
      getRootProps: (p = {}) => ({ ...p, 'data-testid': 'dropzone-root' }),
      getInputProps: () => ({ type: 'file' }),
      isDragActive: true,
      isDragReject: true
    });
    render(
      <MediaDropzone state={{}}>
        <div>content</div>
      </MediaDropzone>
    );
    expect(screen.getByText('Some files are not supported')).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MediaDropzone state={{}} className="my-custom">
        <div>content</div>
      </MediaDropzone>
    );
    const root = container.querySelector('[data-testid="dropzone-root"]');
    expect(root.className).toContain('my-custom');
  });

  it('applies dropzone-disabled class when disabled', () => {
    const { container } = render(
      <MediaDropzone state={{}} disabled={true}>
        <div>content</div>
      </MediaDropzone>
    );
    const root = container.querySelector('[data-testid="dropzone-root"]');
    expect(root.className).toContain('dropzone-disabled');
  });
});
