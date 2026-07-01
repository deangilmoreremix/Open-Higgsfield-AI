import { summarizer } from './summarizer.js';
import { clipper } from './clipper.js';
import { dubbing } from './dubbing.js';
import { search } from './search.js';
import { scenes } from './scenes.js';

export const agents = { summarizer, clipper, dubbing, search, scenes };

export const agentMetadata = {
  summarizer: { name: 'Video Summarizer', category: 'analysis', needsInput: 'video' },
  clipper: { name: 'Clip Creator', category: 'extract', needsInput: 'video' },
  dubbing: { name: 'Video Dubbing', category: 'translate', needsInput: 'video' },
  search: { name: 'Video Search', category: 'search', needsInput: 'video' },
  scenes: { name: 'Scene Detector', category: 'analysis', needsInput: 'video' },
};
