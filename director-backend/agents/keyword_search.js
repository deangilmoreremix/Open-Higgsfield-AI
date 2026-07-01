import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function keyword_search(userId, { input, videoId, videoUrl, options = {} }) {
  const keywords = options.keywords || (input ? [input] : []);
  if (keywords.length === 0) throw new Error('keywords are required');
  return runAgent(userId, 'keyword_search', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const index = await withVideoDB((conn) => video.indexSpokenWords());
    const compiled = await withVideoDB((conn) => index.compile({ keywords: params.options.keywords || (params.input ? [params.input] : []) }));
    return { output: { keywords, streamId: compiled.id }, streamUrl: compiled.url };
  }, { input, videoId, videoUrl, options });
}
