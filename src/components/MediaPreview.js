export function createMediaPreview(options = {}) {
  const {
    maxHeight = '60vh',
    showControls = true,
    showDownload = true,
    showMeta = true,
    rounded = '2xl',
    onLoad = null,
  } = options;

  const wrapper = document.createElement('div');
  wrapper.className = 'relative group w-full';

  const mediaContainer = document.createElement('div');
  mediaContainer.className = `w-full bg-white/[0.02] border border-white/5 rounded-${rounded} overflow-hidden flex items-center justify-center`;
  mediaContainer.style.minHeight = '120px';

  const emptyState = document.createElement('div');
  emptyState.className = 'flex flex-col items-center justify-center py-12 text-muted';
  emptyState.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mb-2 opacity-40">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
    <span class="text-xs">No media loaded</span>
  `;
  mediaContainer.appendChild(emptyState);
  wrapper.appendChild(mediaContainer);

  const metaBar = document.createElement('div');
  metaBar.className = 'flex items-center justify-between mt-2 px-1 hidden';
  const metaLeft = document.createElement('div');
  metaLeft.className = 'text-[10px] text-muted truncate max-w-[70%]';
  const metaRight = document.createElement('div');
  metaRight.className = 'flex items-center gap-2';
  metaBar.appendChild(metaLeft);
  metaBar.appendChild(metaRight);
  if (showMeta) wrapper.appendChild(metaBar);

  let currentUrl = null;
  let currentType = null;

  function detectType(url) {
    if (!url) return 'unknown';
    const lower = url.toLowerCase();
    if (lower.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/)) return 'video';
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/)) return 'image';
    return 'image';
  }

  function load(url, meta = {}) {
    currentUrl = url;
    currentType = meta.type || detectType(url);
    mediaContainer.innerHTML = '';
    metaBar.classList.remove('hidden');

    if (currentType === 'video') {
      const video = document.createElement('video');
      video.src = url;
      video.controls = showControls;
      video.loop = true;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.className = 'w-full object-contain';
      video.style.maxHeight = maxHeight;

      const loadingSpinner = document.createElement('div');
      loadingSpinner.className = 'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity';
      loadingSpinner.innerHTML = '<div class="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>';
      mediaContainer.appendChild(loadingSpinner);

      video.onloadeddata = () => {
        loadingSpinner.remove();
        updateMeta({
          ...meta,
          duration: formatDuration(video.duration),
          resolution: `${video.videoWidth}x${video.videoHeight}`,
        });
        if (onLoad) onLoad({ type: 'video', url, width: video.videoWidth, height: video.videoHeight, duration: video.duration });
      };
      video.onerror = () => {
        loadingSpinner.remove();
        showError('Failed to load video');
      };
      mediaContainer.appendChild(video);

      const badge = document.createElement('div');
      badge.className = 'absolute top-3 right-3 bg-blue-500/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-white pointer-events-none';
      badge.textContent = 'VIDEO';
      mediaContainer.appendChild(badge);
    } else {
      const img = document.createElement('img');
      img.src = url;
      img.className = 'w-full object-contain';
      img.style.maxHeight = maxHeight;

      const loadingSpinner = document.createElement('div');
      loadingSpinner.className = 'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity';
      loadingSpinner.innerHTML = '<div class="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>';
      mediaContainer.appendChild(loadingSpinner);

      img.onload = () => {
        loadingSpinner.remove();
        updateMeta({
          ...meta,
          resolution: `${img.naturalWidth}x${img.naturalHeight}`,
        });
        if (onLoad) onLoad({ type: 'image', url, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        loadingSpinner.remove();
        showError('Failed to load image');
      };
      mediaContainer.appendChild(img);
    }
  }

  function loadFile(file) {
    const blobUrl = URL.createObjectURL(file);
    const type = file.type.startsWith('video') ? 'video' : 'image';
    load(blobUrl, {
      type,
      filename: file.name,
      fileSize: formatFileSize(file.size),
    });
    return blobUrl;
  }

  function showLoading(message = 'Processing...') {
    mediaContainer.innerHTML = '';
    mediaContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-3">
        <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        <span class="text-xs text-muted">${message}</span>
      </div>
    `;
    metaBar.classList.add('hidden');
  }

  function showError(message) {
    mediaContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-red-400 gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span class="text-xs">${message}</span>
      </div>
    `;
  }

  function clear() {
    currentUrl = null;
    currentType = null;
    mediaContainer.innerHTML = '';
    mediaContainer.appendChild(emptyState.cloneNode(true));
    metaBar.classList.add('hidden');
  }

  function updateMeta(meta) {
    const parts = [];
    if (meta.filename) parts.push(meta.filename);
    if (meta.resolution) parts.push(meta.resolution);
    if (meta.duration) parts.push(meta.duration);
    if (meta.fileSize) parts.push(meta.fileSize);
    if (meta.model) parts.push(meta.model);
    metaLeft.textContent = parts.join(' / ');

    metaRight.innerHTML = '';
    if (showDownload && currentUrl) {
      const dlBtn = document.createElement('a');
      dlBtn.href = currentUrl;
      dlBtn.download = meta.filename || `media-${Date.now()}`;
      dlBtn.className = 'text-[10px] font-bold text-primary hover:underline';
      dlBtn.textContent = 'Download';
      metaRight.appendChild(dlBtn);
    }
  }

  return { element: wrapper, load, loadFile, showLoading, showError, clear, getUrl: () => currentUrl, getType: () => currentType };
}

export function createFullscreenPreview() {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 hidden';
  overlay.style.backdropFilter = 'blur(20px)';

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  };

  function show(url, meta = {}) {
    overlay.classList.remove('hidden');
    overlay.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'max-w-4xl w-full flex flex-col items-center relative';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10';
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.onclick = () => overlay.classList.add('hidden');
    wrapper.appendChild(closeBtn);

    const type = meta.type || (url.match(/\.(mp4|webm|mov)/) ? 'video' : 'image');

    if (type === 'video') {
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.className = 'max-h-[80vh] max-w-full rounded-xl';
      wrapper.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = url;
      img.className = 'max-h-[80vh] max-w-full rounded-xl';
      wrapper.appendChild(img);
    }

    if (meta.prompt || meta.model) {
      const info = document.createElement('div');
      info.className = 'mt-4 text-center max-w-lg';
      if (meta.prompt) info.innerHTML += `<div class="text-sm text-white mb-1">${meta.prompt}</div>`;
      if (meta.model) info.innerHTML += `<div class="text-xs text-muted">${meta.model}</div>`;
      wrapper.appendChild(info);
    }

    const actions = document.createElement('div');
    actions.className = 'flex gap-3 mt-4';

    const dlBtn = document.createElement('a');
    dlBtn.href = url;
    dlBtn.download = `generation-${Date.now()}`;
    dlBtn.className = 'bg-primary text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-all';
    dlBtn.textContent = 'Download';
    actions.appendChild(dlBtn);

    wrapper.appendChild(actions);
    overlay.appendChild(wrapper);
  }

  function hide() {
    overlay.classList.add('hidden');
  }

  return { element: overlay, show, hide };
}

function formatDuration(seconds) {
  if (!seconds || !isFinite(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
