import { runAgent, resolveVideo, withVideoDB, AppError, ErrorCodes } from './_shared.js';

export async function search(userId, { input, videoId, videoUrl, options = {} }) {
  const query = input || options.query;
  if (!query) throw new AppError(ErrorCodes.INVALID_INPUT, 'Search query is required', 400);
  return runAgent(userId, 'search', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const index = await withVideoDB((conn) => video.indexSpokenWords());
    const results = await withVideoDB((conn) => index.search(params.input || params.options.query));
    return { output: { results, query } };
  }, { input, videoId, videoUrl, options });
}
