import { RuntimeAdapterBase } from '../../../lib/runtime/RuntimeAdapterBase.js';
import { supabase } from '../../../lib/supabase-client.ts';
import { generateVideoFromText, generateVideoFromImage } from '../../../lib/muapi.js';

export class AIVFXRuntimeAdapter extends RuntimeAdapterBase {
  constructor(options = {}) {
    super(options);
    this.provider = 'ai-vfx';
    this.activeProject = null;
  }

  async execute(input, context = {}) {
    const executionId = `aivfx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.executionId = executionId;
    this.state = 'running';

    try {
      if (input.action === 'text-to-video') {
        const result = await generateVideoFromText(input.prompt, context);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'image-to-video') {
        const result = await generateVideoFromImage(input.imageUrl, input.prompt, context);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'list-projects') {
        return { executionId, state: this.state, projects: [] };
      }

      this.state = 'completed';
      return { executionId, state: this.state };
    } catch (error) {
      this.state = 'failed';
      throw error;
    }
  }

  async pause(executionId) {
    this.state = 'paused';
    return { executionId, state: this.state };
  }

  async resume(executionId) {
    this.state = 'running';
    return { executionId, state: this.state };
  }

  async cancel(executionId) {
    this.state = 'cancelled';
    return { executionId, state: this.state };
  }

  serialize() {
    return { id: this.executionId, state: this.state, project: this.activeProject };
  }

  deserialize(data) {
    if (data.id !== undefined) this.executionId = data.id;
    if (data.state !== undefined) this.state = data.state;
    if (data.project !== undefined) this.activeProject = data.project;
  }

  getExecutionState() {
    return { id: this.executionId, state: this.state, stack: this.stack, project: this.activeProject };
  }
}