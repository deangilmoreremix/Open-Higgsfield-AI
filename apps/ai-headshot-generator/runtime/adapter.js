import { RuntimeAdapterBase } from '../../../lib/runtime/RuntimeAdapterBase.js';
import { supabase } from '../../../lib/supabase-client.ts';
import { uploadSourcePhoto, listHeadshotPresets, generateHeadshot, generateHeadshotBatch, getGenerationStatus, saveHeadshot, saveOutputToLibrary, handoffHeadshotOutput } from '../services/headshotService.js';

export class HeadshotRuntimeAdapter extends RuntimeAdapterBase {
  constructor(options = {}) {
    super(options);
    this.provider = 'ai-headshot-generator';
    this.presets = [];
    this.activeProject = null;
  }

  async execute(input, context = {}) {
    const executionId = `headshot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.executionId = executionId;
    this.state = 'running';

    try {
      if (input.action === 'upload') {
        const photo = await uploadSourcePhoto(input.file);
        this.activeProject = { sourcePhoto: photo, presets: [] };
        return { executionId, state: this.state, photo };
      }

      if (input.action === 'generate') {
        if (!this.activeProject) throw new Error('No source photo uploaded');
        const results = await generateHeadshotBatch(
          input.apiKey,
          this.activeProject.sourcePhoto,
          input.presets || [input.preset]
        );
        this.state = 'completed';
        return { executionId, state: this.state, results };
      }

      if (input.action === 'batch') {
        if (!this.activeProject) throw new Error('No source photo uploaded');
        const results = await generateHeadshotBatch(
          input.apiKey,
          this.activeProject.sourcePhoto,
          input.presets
        );
        this.state = 'completed';
        return { executionId, state: this.state, results };
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

  getPresets() {
    return listHeadshotPresets();
  }

  serialize() {
    return {
      id: this.executionId,
      state: this.state,
      project: this.activeProject
    };
  }

  deserialize(data) {
    if (data.id !== undefined) this.executionId = data.id;
    if (data.state !== undefined) this.state = data.state;
    if (data.project !== undefined) this.activeProject = data.project;
  }

  getExecutionState() {
    return {
      id: this.executionId,
      state: this.state,
      stack: this.stack,
      project: this.activeProject
    };
  }
}