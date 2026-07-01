import { runAgent, resolveVideo, withVideoDB, AppError, ErrorCodes } from './_shared.js';

export async function visual_search(userId, { input, videoId, videoUrl, options = {} }) {
  const query = input || options.query;
  if (!query) throw new AppError(ErrorCodes.INVALID_INPUT, 'query is required', 400);
  return runAgent(userId, 'visual_search', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const index = await withVideoDB((conn) => video.createSceneIndex({ prompt: 'Describe visual content' }));
    const results = await withVideoDB((conn) => index.search({ query: params.input || params.options.query, limit: params.options.limit || 5 }));
    return { output: { results, query } };
  }, { input, videoId, videoUrl, options });
}
