import { runAgent, withVideoDB } from './_shared.js';

export async function compiler(userId, { input, options = {} }) {
  const videoIds = options.videoIds || [];
  if (videoIds.length === 0) throw new Error('videoIds[] is required');
  return runAgent(userId, 'compiler', async (params) => {
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    let cursor = 0;
    for (const id of params.options.videoIds) {
      const video = await withVideoDB((conn) => conn.getVideo(id));
      await withVideoDB((conn) => timeline.addClip(cursor, { asset: video, duration: 5 }));
      cursor += 5;
    }
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { videoIds, count: videoIds.length }, streamUrl: streamUrl.url };
  }, { input, options });
}
