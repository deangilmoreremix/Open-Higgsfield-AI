import { runAgent, withVideoDB, getOrCreateCollection } from './_shared.js';

export async function musicvideo(userId, { input, options = {} }) {
  const topic = input || options.topic;
  if (!topic) throw new Error('topic is required');
  return runAgent(userId, 'musicvideo', async (params) => {
    const collection = await getOrCreateCollection();
    const music = await withVideoDB((conn) => collection.generateAudio({ prompt: `${params.options.genre || 'pop'} song about ${params.input || params.options.topic}`, type: 'music' }));
    const video = await withVideoDB((conn) => collection.generateVideo({ prompt: `Music video for: ${params.input || params.options.topic}`, duration: params.options.duration || 60 }));
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: video, duration: params.options.duration || 60 }));
    await withVideoDB((conn) => timeline.addClip(0, { asset: music, duration: params.options.duration || 60, track: 1 }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { topic, videoId: video.id, musicId: music.id, duration: params.options.duration || 60 }, streamUrl: streamUrl.url };
  }, { input, options });
}
