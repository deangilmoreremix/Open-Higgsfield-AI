"use client";

export { default as ImageStudio } from './src/components/ImageStudio.jsx';
export { default as VideoStudio } from './src/components/VideoStudio.jsx';
export { default as LipSyncStudio } from './src/components/LipSyncStudio.jsx';
export { default as CinemaStudio } from './src/components/CinemaStudio.jsx';
export { default as MarketingStudio } from './src/components/MarketingStudio.jsx';
export { default as WorkflowStudio } from './src/components/WorkflowStudio.jsx';
export { default as AgentStudio } from './src/components/AgentStudio.jsx';
// DesignAgentStudio requires external design-agent package
// DesignAgentStudioFull is a standalone implementation using the Creative Agent API
export { default as DesignAgentStudioFull } from './src/components/DesignAgentStudioFull.jsx';
// Alias for backward compatibility - uses the full implementation
export { default as DesignAgentStudio } from './src/components/DesignAgentStudioFull.jsx';
export { default as AppsStudio } from './src/components/AppsStudio.jsx';
export { default as McpCliStudio } from './src/components/McpCliStudio.jsx';
export { default as AudioStudio } from './src/components/AudioStudio.jsx';
export { default as AiClippingStudio } from './src/components/AiClippingStudio.jsx';
export { default as HeadshotStudio } from './src/components/HeadshotStudio.jsx';
export { default as PomelliStudio } from './src/components/PomelliStudio.jsx';
export { default as VidecoStudio } from './src/components/VidecoStudio.jsx';
export * from './src/muapi.js';
