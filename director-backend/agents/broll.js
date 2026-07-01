import { runAgent, withVideoDB, getOrCreateCollection, resolveVideo } from './_shared.js';

export async function broll(userId, { input, videoId, videoUrl, options = {} }) {
  const topic = input || options.topic;
  if (!topic) throw new Error('topic is required');
  return runAgent(userId, 'broll', async (params) => {
    const collection = await getOrCreateCollection();
    const overlay = await withVideoDB((conn) => collection.generateImage({ prompt: `B-roll footage: ${params.input || params.options.topic}` }));
    if (!params.videoId && !params.videoUrl) return { output: { overlayId: overlay.id, topic } };
    const baseVideo = await resolveVideo(params.videoId, params.videoUrl);
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addOverlay(0, { asset: overlay, duration: 5 }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { overlayId: overlay.id, baseVideoId: baseVideo.id, topic }, streamUrl: streamUrl.url };
  }, { input, videoId, videoUrl, options });
}
