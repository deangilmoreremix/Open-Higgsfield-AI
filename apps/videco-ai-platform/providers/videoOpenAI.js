import { openaiService } from '../../../lib/openaiService.js';

export async function enhanceVideoPrompt(basePrompt, options = {}) {
  const {
    role = 'cinematic-director',
    industry = 'general',
    methodology = 'cinematic-storytelling',
    tonality = 'inspirational',
    focus = ['cinematic-quality'],
    cinematicOptions = {}
  } = options;

  try {
    const enhanced = await openaiService.generateGTMPrompt({
      basePrompt,
      role,
      industry,
      methodology,
      tonality,
      focus,
      cinematicOptions
    });

    return enhanced;
  } catch (error) {
    console.warn('Video prompt enhancement failed, using original:', error);
    return basePrompt;
  }
}