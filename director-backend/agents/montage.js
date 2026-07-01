import { runAgent, withVideoDB } from './_shared.js';

export async function montage(userId, { input, options = {} }) {
  const videoIds = options.videoIds || [];
  if (videoIds.length === 0) throw new Error('videoIds[] is required');
  return runAgent(userId, 'montage', async (params) => {
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    let cursor = 0;
    for (const id of params.options.videoIds) {
      const video = await withVideoDB((conn) => conn.getVideo(id));
      await withVideoDB((conn) => timeline.addClip(cursor, { asset: video, duration: 5, transition: params.options.transition || 'fade' }));
      cursor += 5;
    }
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { videoIds, count: videoIds.length, transition: params.options.transition || 'fade' }, streamUrl: streamUrl.url };
  }, { input, options });
}
