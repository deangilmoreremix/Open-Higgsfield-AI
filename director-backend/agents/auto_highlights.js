import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function auto_highlights(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'auto_highlights', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const sceneIndex = await withVideoDB((conn) => video.createSceneIndex({ prompt: 'Identify the most engaging moments' }));
    const results = await withVideoDB((conn) => sceneIndex.search({ query: 'most engaging highlights', limit: params.options.limit || 5 }));
    return { output: { highlights: results, count: results.length, limit: params.options.limit || 5 } };
  }, { input, videoId, videoUrl, options });
}
