import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function social(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'social', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const reframed = await withVideoDB((conn) => video.reframe({ aspect_ratio: params.options.aspect || '9:16' }));
    const streamUrl = await withVideoDB((conn) => reframed.generateStream());
    return { output: { videoId: reframed.id, aspect: params.options.aspect || '9:16' }, streamUrl: streamUrl.url };
  }, { input, videoId, videoUrl, options });
}
