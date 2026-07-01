import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function dubbing(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'dubbing', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const dubbed = await withVideoDB((conn) => video.dub({ language: params.options.language || 'es' }));
    const streamUrl = await withVideoDB((conn) => dubbed.generateStream());
    return { output: { videoId: dubbed.id, language: params.options.language || 'es' }, streamUrl: streamUrl.url };
  }, { input, videoId, videoUrl, options });
}
