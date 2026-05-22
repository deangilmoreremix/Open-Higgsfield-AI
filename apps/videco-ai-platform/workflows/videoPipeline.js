import { WorkflowEngine } from '../../../lib/workflow/WorkflowEngine.ts';
import { WorkflowNode } from '../../../lib/workflow/WorkflowNode.ts';

export const VIDEO_NODE_TYPES = {
  TEXT_TO_VIDEO: 'text-to-video',
  IMAGE_TO_VIDEO: 'image-to-video',
  VIDEO_TO_VIDEO: 'video-to-video',
  EFFECT: 'effect',
  TRANSITION: 'transition',
  AUDIO: 'audio',
  TEXT_OVERLAY: 'text-overlay',
  TIMELINE: 'timeline'
};

export class VideoPipeline extends WorkflowEngine {
  constructor() {
    super();
    this.videoNodes = new Map();
  }

  createVideoNode(nodeId, type, position, data = {}) {
    const validTypes = Object.values(VIDEO_NODE_TYPES);
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid video node type: ${type}. Valid types: ${validTypes.join(', ')}`);
    }

    const node = new WorkflowNode(nodeId, type, position);
    node.data = {
      ...data,
      nodeType: type
    };

    this.addNode(node);
    this.videoNodes.set(nodeId, node);

    return node;
  }

  createTextToVideoNode(prompt, position, options = {}) {
    return this.createVideoNode(
      `text-to-video-${Date.now()}`,
      VIDEO_NODE_TYPES.TEXT_TO_VIDEO,
      position,
      { prompt, ...options }
    );
  }

  createImageToVideoNode(imageUrl, prompt, position, options = {}) {
    return this.createVideoNode(
      `image-to-video-${Date.now()}`,
      VIDEO_NODE_TYPES.IMAGE_TO_VIDEO,
      position,
      { imageUrl, prompt, ...options }
    );
  }

  createTimelineTrack(trackId) {
    const trackNode = new WorkflowNode(trackId, VIDEO_NODE_TYPES.TIMELINE, { x: 0, y: 0 });
    trackNode.data = { type: 'track', clips: [] };
    this.addNode(trackNode);
    return trackNode;
  }

  connectNodes(sourceNodeId, sourcePort, targetNodeId, targetPort) {
    const sourceNode = this.videoNodes.get(sourceNodeId);
    const targetNode = this.videoNodes.get(targetNodeId);

    if (!sourceNode || !targetNode) {
      throw new Error('Source or target node not found in video pipeline');
    }

    this.addConnection(sourceNodeId, sourcePort, targetNodeId, targetPort);
  }

  async executePipeline(context = {}) {
    const results = await this.execute();

    return {
      outputs: results,
      timeline: this.serializeTimeline(),
      context
    };
  }

  serializeTimeline() {
    return {
      tracks: Array.from(this.videoNodes.values())
        .filter(n => n.data?.nodeType === VIDEO_NODE_TYPES.TIMELINE)
        .map(n => ({
          id: n.id,
          clips: n.data.clips || []
        })),
      connections: this.connections.map(c => ({
        source: c.sourceNode.id,
        target: c.targetNode.id,
        sourcePort: c.sourcePort,
        targetPort: c.targetPort
      }))
    };
  }

  deserializeTimeline(data) {
    this.clear();

    if (data.tracks) {
      for (const track of data.tracks) {
        const node = new WorkflowNode(track.id, VIDEO_NODE_TYPES.TIMELINE, { x: 0, y: 0 });
        node.data = { type: 'track', clips: track.clips || [] };
        this.addNode(node);
        this.videoNodes.set(track.id, node);
      }
    }

    if (data.connections) {
      for (const conn of data.connections) {
        try {
          this.addConnection(conn.source, conn.sourcePort, conn.target, conn.targetPort);
        } catch (e) {
          console.warn('Failed to restore connection:', e);
        }
      }
    }
  }
}