import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function enhancer(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'enhancer', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const transcoded = await withVideoDB((conn) => video.transcode({ resolution: params.options.resolution || '1080p' }));
    return { output: { videoId: transcoded.id, resolution: params.options.resolution || '1080p' } };
  }, { input, videoId, videoUrl, options });
}
