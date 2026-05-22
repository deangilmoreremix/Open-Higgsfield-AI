import { RuntimeAdapterBase } from '../../../lib/runtime/RuntimeAdapterBase.js';
import { supabase } from '../../../lib/supabase-client.ts';
import { analyzeWebsite, extractBrandDNA, updateBrandDNA, generateCampaignConcepts, generatePlatformCreative, generateProductPhotography, generateShortVideo, saveBrandProject, listBrandProjects, getBrandProject, saveCampaign, saveCreativeOutput, saveOutputToLibrary, handoffOutput } from '../services/pomelliService.js';

export class PomelliRuntimeAdapter extends RuntimeAdapterBase {
  constructor(options = {}) {
    super(options);
    this.provider = 'open-pomelli';
    this.activeProject = null;
    this.brandDNA = null;
  }

  async execute(input, context = {}) {
    const executionId = `pomelli-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.executionId = executionId;
    this.state = 'running';

    try {
      if (input.action === 'analyze') {
        const websiteData = await analyzeWebsite(input.url);
        const screenshotUrl = input.screenshotUrl || null;
        this.brandDNA = await extractBrandDNA(websiteData, screenshotUrl);
        this.activeProject = { url: input.url, websiteData, brandDNA: this.brandDNA };
        return { executionId, state: this.state, brandDNA: this.brandDNA };
      }

      if (input.action === 'generate-concepts') {
        const concepts = await generateCampaignConcepts(input.projectId, input.goal, input.direction);
        return { executionId, state: this.state, concepts };
      }

      if (input.action === 'generate-creative') {
        const creative = await generatePlatformCreative(input.platform, input.concept, this.brandDNA || {});
        return { executionId, state: this.state, creative };
      }

      if (input.action === 'product-photography') {
        const result = await generateProductPhotography(input.prompt, input.referenceImages);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'short-video') {
        const result = await generateShortVideo(input.prompt, input.image_url);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'save-project') {
        const project = await saveBrandProject(input.project);
        return { executionId, state: this.state, project };
      }

      if (input.action === 'list-projects') {
        const projects = await listBrandProjects();
        return { executionId, state: this.state, projects };
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
    return {
      id: this.executionId,
      state: this.state,
      project: this.activeProject,
      brandDNA: this.brandDNA
    };
  }

  deserialize(data) {
    if (data.id !== undefined) this.executionId = data.id;
    if (data.state !== undefined) this.state = data.state;
    if (data.project !== undefined) this.activeProject = data.project;
    if (data.brandDNA !== undefined) this.brandDNA = data.brandDNA;
  }

  getExecutionState() {
    return {
      id: this.executionId,
      state: this.state,
      stack: this.stack,
      project: this.activeProject,
      brandDNA: this.brandDNA
    };
  }
}