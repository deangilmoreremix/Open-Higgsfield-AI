import { RuntimeAdapterBase } from '../../../lib/runtime/RuntimeAdapterBase.js';
import { supabase } from '../../../lib/supabase-client.ts';
import { generateVideoFromText, generateVideoFromImage } from '../../../lib/muapi.js';
import { generateVFXVideo, applyEffect, addMotion, combineVideos, extendVideo, listVFXProjects, saveVFXProject, getVFXProject, deleteVFXProject, handoffVFXOutput, generateThumbnail, getVideoMetadata, VFX_EFFECTS, MOTION_STYLES, ASPECT_RATIOS, VIDEO_QUALITIES } from '../services/vfxService.js';

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

      if (input.action === 'generate-vfx') {
        const result = await generateVFXVideo(input, context);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'apply-effect') {
        const result = await applyEffect(input.sourceVideoUrl, input.effect, input.options || {});
        return { executionId, state: this.state, result };
      }

      if (input.action === 'add-motion') {
        const result = await addMotion(input.sourceVideoUrl, input.motion, input.options || {});
        return { executionId, state: this.state, result };
      }

      if (input.action === 'combine-videos') {
        const result = await combineVideos(input.videoUrls, input.options || {});
        return { executionId, state: this.state, result };
      }

      if (input.action === 'extend-video') {
        const result = await extendVideo(input.sourceVideoUrl, input.duration, input.options || {});
        return { executionId, state: this.state, result };
      }

      if (input.action === 'list-projects') {
        const projects = await listVFXProjects();
        return { executionId, state: this.state, projects };
      }

      if (input.action === 'save-project') {
        const project = await saveVFXProject(input.project);
        return { executionId, state: this.state, project };
      }

      if (input.action === 'get-project') {
        const project = await getVFXProject(input.projectId);
        return { executionId, state: this.state, project };
      }

      if (input.action === 'delete-project') {
        await deleteVFXProject(input.projectId);
        return { executionId, state: this.state, deleted: true };
      }

      if (input.action === 'thumbnail') {
        const thumbnail = await generateThumbnail(input.videoUrl, input.options || {});
        return { executionId, state: this.state, thumbnail };
      }

      if (input.action === 'metadata') {
        const metadata = await getVideoMetadata(input.videoUrl);
        return { executionId, state: this.state, metadata };
      }

      if (input.action === 'handoff') {
        handoffVFXOutput(input.target, input.output);
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

  getEffects() {
    return VFX_EFFECTS;
  }

  getMotionStyles() {
    return MOTION_STYLES;
  }

  getAspectRatios() {
    return ASPECT_RATIOS;
  }

  getQualities() {
    return VIDEO_QUALITIES;
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