export type HandoffTarget = 'library' | 'render' | 'director' | 'timeline' | 'videoAgent';

export interface HandoffPayload {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text' | 'project';
  sourceApp: string;
  prompt: string;
  url: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

const HANDOFF_KEYS: Record<HandoffTarget, string> = {
  library: 'higgsfield.pendingLibraryOutput',
  render: 'higgsfield.pendingRenderOutput',
  director: 'higgsfield.pendingDirectorOutput',
  timeline: 'higgsfield.pendingTimelineOutput',
  videoAgent: 'higgsfield.pendingVideoAgentOutput',
};

export function sendToHandoff(target: HandoffTarget, payload: HandoffPayload): void {
  const key = HANDOFF_KEYS[target];
  if (!key) {
    console.error(`[handoff] Unknown target: ${target}`);
    return;
  }
  try {
    sessionStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.error(`[handoff] Failed to store payload for ${target}:`, e);
  }
}

export function getPendingHandoff(target: HandoffTarget): HandoffPayload | null {
  const key = HANDOFF_KEYS[target];
  if (!key) return null;
  try {
    const data = sessionStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as HandoffPayload;
  } catch (e) {
    console.error(`[handoff] Failed to read payload for ${target}:`, e);
    return null;
  }
}

export function clearPendingHandoff(target: HandoffTarget): void {
  const key = HANDOFF_KEYS[target];
  if (!key) return;
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.error(`[handoff] Failed to clear payload for ${target}:`, e);
  }
}

export function createHandoffPayload(
  id: string,
  type: HandoffPayload['type'],
  sourceApp: string,
  prompt: string,
  url: string | null = null,
  thumbnailUrl: string | null = null,
  metadata: Record<string, unknown> = {}
): HandoffPayload {
  return {
    id,
    type,
    sourceApp,
    prompt,
    url,
    thumbnailUrl,
    createdAt: new Date().toISOString(),
    metadata,
  };
}