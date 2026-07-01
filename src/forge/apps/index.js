export const videcoAIPlatform = {
  id: 'videco-ai-platform',
  entry: 'muapi-video-generation',
  providers: ['muapi', 'openai'],
  meta: {
    type: 'video-generation',
    name: 'Videco AI Platform',
  },
};

export const vibeWorkflowApp = {
  id: 'vibe-workflow',
  entry: 'workflow-execution-node',
  providers: ['openai'],
  meta: {
    type: 'workflow',
    name: 'Vibe Workflow',
  },
};

export const videoOutreachApp = {
  id: 'ai-video-outreach',
  entry: 'outreach-video-node',
  providers: ['muapi', 'openai'],
  meta: {
    type: 'marketing-video',
    name: 'AI Video Outreach',
  },
};

export const headshotApp = {
  id: 'ai-headshot-generator',
  entry: 'image-generation-node',
  providers: ['muapi'],
  meta: {
    type: 'image-generation',
    name: 'AI Headshot Generator',
  },
};

export const workflowApp = {
  id: 'workflow-app',
  entry: 'workflow-execution-node',
  providers: ['openai'],
  meta: {
    type: 'workflow',
    name: 'Workflow App',
  },
};

export const studioApp = {
  id: 'studio-app',
  entry: 'studio-orchestrator-node',
  providers: ['openai', 'muapi'],
  meta: {
    type: 'studio',
    name: 'Studio App',
  },
};

export const openPomelliApp = {
  id: 'open-pomelli',
  entry: 'video-generation-node',
  providers: ['muapi', 'openai'],
  meta: {
    type: 'video-generation',
    name: 'Open Pomelli',
  },
};

export const agentsApp = {
  id: 'agents-app',
  entry: 'agent-orchestration-node',
  providers: ['openai'],
  meta: {
    type: 'agents',
    name: 'Agents App',
  },
};

export const assistantApp = {
  id: 'assistant-app',
  entry: 'assistant-node',
  providers: ['openai'],
  meta: {
    type: 'assistant',
    name: 'Assistant App',
  },
};