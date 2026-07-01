import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function preview(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'preview', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const thumb = await withVideoDB((conn) => video.createThumbnail({ time: params.options.time || 1 }));
    return { output: { thumbnailId: thumb.id, url: thumb.url } };
  }, { input, videoId, videoUrl, options });
}
