import { runAgent, resolveVideo, withVideoDB } from './_shared.js';

export async function thumbnail(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'thumbnail', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const thumbs = await withVideoDB((conn) => video.listThumbnails());
    if (thumbs.length > 0) return { output: { thumbnailId: thumbs[0].id, url: thumbs[0].url, count: thumbs.length } };
    const thumb = await withVideoDB((conn) => video.createThumbnail({ time: params.options.time || 1 }));
    return { output: { thumbnailId: thumb.id, url: thumb.url, count: 1 } };
  }, { input, videoId, videoUrl, options });
}
