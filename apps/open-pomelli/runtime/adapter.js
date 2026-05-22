import { RuntimeAdapterBase } from '../../../lib/runtime/RuntimeAdapterBase.js';
import { supabase } from '../../../lib/supabase-client.ts';
import { analyzeWebsite, extractBrandDNA, updateBrandDNA, generateCampaignConcepts, generatePlatformCreative, generateProductPhotography, generateShortVideo, saveBrandProject, listBrandProjects, getBrandProject, saveCampaign, saveCreativeOutput, saveOutputToLibrary, handoffOutput, generateCampaignConcepts, getPhotoStudioCategories, findPhotoStyle, generatePhotoshoot, generateAnimation, generateImageToVideo, generateTextToVideo, generateImageEdit, upscaleImage, updateBrandProject, deleteBrandProject, saveGenerationJob, listCampaigns, getCampaignGoals, getPlatformSpec, getCreativeStyles, analyzeImageWithLLM, generateBrandVoice, generateBrandColors, generateAdCopy, generateHashtagSet, generateContentCalendar, analyzeCompetitor, generateAOBTest, generateCampaign } from '../services/pomelliService.js';

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

      if (input.action === 'get-presets') {
        return { executionId, state: this.state, presets: { photoStyles: getPhotoStudioCategories(), creativeStyles: getCreativeStyles() } };
      }

      if (input.action === 'get-goals') {
        return { executionId, state: this.state, goals: getCampaignGoals() };
      }

      if (input.action === 'get-platform-spec') {
        return { executionId, state: this.state, spec: getPlatformSpec(input.platformId) };
      }

      if (input.action === 'generate-campaign') {
        const c = await generateCampaignConceptsLLM(this.brandDNA || {}, input.goal, input.direction);
        if (input.projectId) await saveCampaign({ brand_id: input.projectId, goal: input.goal, concepts: JSON.stringify(c) });
        return { executionId, state: this.state, concepts: c };
      }

      if (input.action === 'photoshoot') {
        const style = findPhotoStyle(input.categoryId, input.styleId);
        if (!style) throw new Error('Photo style not found');
        const result = await generatePhotoshoot(input.imageUrl, style, this.brandDNA, input.direction);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'animate-asset') {
        const result = await generateAnimation(input.sourceImageUrl, input.prompt, { duration: input.duration, resolution: input.resolution });
        if (input.sourceId) await saveAnimationRecord({ source_image_url: input.sourceImageUrl, source_type: input.sourceType, source_id: input.sourceId, prompt: input.prompt, video_url: result?.url || null, duration: input.duration || 5 });
        return { executionId, state: this.state, result };
      }

      if (input.action === 'image-to-video') {
        const result = await generateImageToVideo(input.imageUrl, input.prompt, { duration: input.duration, resolution: input.resolution });
        return { executionId, state: this.state, result };
      }

      if (input.action === 'text-to-video') {
        const result = await generateTextToVideo(input.prompt, { duration: input.duration, resolution: input.resolution, aspectRatio: input.aspectRatio });
        return { executionId, state: this.state, result };
      }

      if (input.action === 'edit-image') {
        const result = await generateImageEdit(input.prompt, input.images_list, input.aspectRatio);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'upscale') {
        const result = await upscaleImage(input.imageUrl, input.scale);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'update-project') {
        const updated = await updateBrandProject(input.projectId, input.updates);
        return { executionId, state: this.state, project: updated };
      }

      if (input.action === 'delete-project') {
        const result = await deleteBrandProject(input.projectId);
        return { executionId, state: this.state, result };
      }

      if (input.action === 'save-job') {
        const job = await saveGenerationJob(input.job);
        return { executionId, state: this.state, job };
      }

      if (input.action === 'list-campaigns') {
        const campaigns = await listCampaigns(input.projectId);
        return { executionId, state: this.state, campaigns };
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