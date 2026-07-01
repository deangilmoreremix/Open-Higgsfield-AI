import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function clipper(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'clipper', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const clip = await withVideoDB((conn) => video.generateClip({ start: params.options.startTime || 0, duration: params.options.duration || 30 }));
    const streamUrl = await withVideoDB((conn) => clip.generateStream());
    return { output: { clipId: clip.id, duration: params.options.duration || 30, startTime: params.options.startTime || 0 }, streamUrl: streamUrl.url };
  }, { input, videoId, videoUrl, options });
}
