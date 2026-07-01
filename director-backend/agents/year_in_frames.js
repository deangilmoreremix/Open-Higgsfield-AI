import { runAgent, withVideoDB, getOrCreateCollection } from './_shared.js';

export async function year_in_frames(userId, { input, options = {} }) {
  const imageIds = options.imageIds || [];
  const title = input || options.title || 'Year in Frames';
  if (imageIds.length === 0) throw new Error('imageIds[] is required');
  return runAgent(userId, 'year_in_frames', async (params) => {
    const collection = await getOrCreateCollection();
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    let cursor = 0;
    for (const id of params.options.imageIds) {
      const image = await withVideoDB((conn) => conn.getImage(id));
      await withVideoDB((conn) => timeline.addClip(cursor, { asset: image, duration: 3, transition: 'fade' }));
      cursor += 3;
    }
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { title, imageCount: imageIds.length }, streamUrl: streamUrl.url };
  }, { input, options });
}
