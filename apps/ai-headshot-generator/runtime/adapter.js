import { RuntimeAdapterBase } from '../../../lib/runtime/RuntimeAdapterBase.js';
import { supabase } from '../../../lib/supabase-client.ts';
import { uploadSourcePhoto, listHeadshotPresets, generateHeadshot, generateHeadshotBatch, getGenerationStatus, saveHeadshot, saveOutputToLibrary, handoffHeadshotOutput, enhanceFace, applyLighting, applyBackground, applyOutfit, applyPose, batchGenerate, LIGHTING_PRESETS, POSE_PRESETS, BACKGROUNDS, OUTFIT_PRESETS, HEADSHOT_CATEGORIES } from '../services/headshotService.js';

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
        this.activeProject = { sourcePhoto: photo, presets: [], lighting: null, background: null, outfit: null, pose: null };
        return { executionId, state: this.state, photo };
      }

      if (input.action === 'list-presets') {
        const presets = await listHeadshotPresets();
        return { executionId, state: this.state, presets };
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
        const results = await batchGenerate(
          this.activeProject.sourcePhoto,
          input.categories,
          { aspect_ratio: input.aspect_ratio }
        );
        this.state = 'completed';
        return { executionId, state: this.state, results };
      }

      if (input.action === 'enhance') {
        if (!this.activeProject) throw new Error('No source photo uploaded');
        const result = await enhanceFace(this.activeProject.sourcePhoto.url, input.options || {});
        this.state = 'completed';
        return { executionId, state: this.state, result };
      }

      if (input.action === 'apply-lighting') {
        if (!this.activeProject) throw new Error('No source photo uploaded');
        const result = await applyLighting(this.activeProject.sourcePhoto.url, input.preset, input.options || {});
        this.activeProject.lighting = input.preset;
        this.state = 'completed';
        return { executionId, state: this.state, result };
      }

      if (input.action === 'apply-background') {
        if (!this.activeProject) throw new Error('No source photo uploaded');
        const result = await applyBackground(this.activeProject.sourcePhoto.url, input.preset, input.options || {});
        this.activeProject.background = input.preset;
        this.state = 'completed';
        return { executionId, state: this.state, result };
      }

      if (input.action === 'apply-outfit') {
        if (!this.activeProject) throw new Error('No source photo uploaded');
        const result = await applyOutfit(this.activeProject.sourcePhoto.url, input.preset, input.options || {});
        this.activeProject.outfit = input.preset;
        this.state = 'completed';
        return { executionId, state: this.state, result };
      }

      if (input.action === 'apply-pose') {
        if (!this.activeProject) throw new Error('No source photo uploaded');
        const result = await applyPose(this.activeProject.sourcePhoto.url, input.preset, input.options || {});
        this.activeProject.pose = input.preset;
        this.state = 'completed';
        return { executionId, state: this.state, result };
      }

      if (input.action === 'status') {
        const status = await getGenerationStatus(input.requestId);
        return { executionId, state: this.state, status };
      }

      if (input.action === 'save') {
        const saved = await saveHeadshot(input.headshot);
        return { executionId, state: this.state, saved };
      }

      if (input.action === 'handoff') {
        handoffHeadshotOutput(input.target, input.headshot);
        return { executionId, state: this.state, handoff: true };
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

  getLightingPresets() {
    return LIGHTING_PRESETS;
  }

  getPosePresets() {
    return POSE_PRESETS;
  }

  getBackgrounds() {
    return BACKGROUNDS;
  }

  getOutfits() {
    return OUTFIT_PRESETS;
  }

  getCategories() {
    return HEADSHOT_CATEGORIES;
  }

  serialize() {
    return {
      id: this.executionId,
      state: this.state,
      project: this.activeProject,
      presets: this.presets
    };
  }

  deserialize(data) {
    if (data.id !== undefined) this.executionId = data.id;
    if (data.state !== undefined) this.state = data.state;
    if (data.project !== undefined) this.activeProject = data.project;
    if (data.presets !== undefined) this.presets = data.presets;
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