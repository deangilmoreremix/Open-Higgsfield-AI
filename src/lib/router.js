// Compatibility shim for old vanilla components that import from router.js
// The actual routing is now handled by React Router in App.tsx

export function getRouteForItem(item) {
  return item.toLowerCase().replace(/\s+/g, '-');
}

export function initRouter(container, callback) {
  // No-op: routing is now handled by React Router
}

export function navigate(page, params = {}) {
  // Dispatch custom event for compatibility with existing code
  window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
}

export function getCurrentPage() {
  const path = window.location.pathname.slice(1);
  return path || 'landing';
}
