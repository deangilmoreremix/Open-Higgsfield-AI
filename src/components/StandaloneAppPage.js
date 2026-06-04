export function StandaloneAppPage(appName, studioTab = null) {
  const container = document.createElement('div');
  container.className = 'w-full h-full bg-gray-900';

  const displayName = studioTab 
    ? `${appName.replace(/-/g, ' ')} / ${studioTab.charAt(0).toUpperCase() + studioTab.slice(1)}`
    : appName.replace(/-/g, ' ');

  const header = document.createElement('div');
  header.className = 'flex items-center justify-between p-4 bg-gray-800 border-b border-white/10';
  header.innerHTML = `
    <div class="flex items-center gap-3">
      <h1 class="text-xl font-bold text-white capitalize">${displayName}</h1>
      <span class="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded">Standalone App</span>
    </div>
    <div class="flex items-center gap-2">
      <a href="/apps/${appName}/" target="_blank" class="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded transition-colors">
        Open in New Tab
      </a>
    </div>
  `;
  container.appendChild(header);

  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'w-full h-[calc(100vh-73px)]';

  const iframe = document.createElement('iframe');
  const src = studioTab ? `/apps/${appName}/?studio=${studioTab}` : `/apps/${appName}/`;
  iframe.src = src;
  iframe.className = 'w-full h-full border-0';
  iframe.setAttribute('allow', 'crossorigin-isolated');
  iframeContainer.appendChild(iframe);
  container.appendChild(iframeContainer);

  return container;
}