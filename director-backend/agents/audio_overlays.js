import { runAgent, withVideoDB, getOrCreateCollection, resolveVideo } from './_shared.js';

export async function audio_overlays(userId, { input, videoId, videoUrl, options = {} }) {
  const prompt = input || options.prompt;
  if (!prompt) throw new Error('prompt is required');
  return runAgent(userId, 'audio_overlays', async (params) => {
    const collection = await getOrCreateCollection();
    const audio = await withVideoDB((conn) => collection.generateAudio({ prompt: params.input || params.options.prompt, type: params.options.type || 'music' }));
    if (!params.videoId && !params.videoUrl) return { output: { audioId: audio.id, prompt, type: params.options.type || 'music' } };
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: video, duration: video.duration }));
    await withVideoDB((conn) => timeline.addClip(0, { asset: audio, duration: video.duration, track: 1 }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { audioId: audio.id, videoId: video.id, type: params.options.type || 'music' }, streamUrl: streamUrl.url };
  }, { input, videoId, videoUrl, options });
}
