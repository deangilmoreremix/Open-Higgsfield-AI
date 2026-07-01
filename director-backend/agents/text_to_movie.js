import { runAgent, withVideoDB, getOrCreateCollection, generateScript } from './_shared.js';

export async function text_to_movie(userId, { input, options = {} }) {
  if (!input) throw new Error('input is required');
  return runAgent(userId, 'text_to_movie', async (params) => {
    const script = await generateScript({ userPrompt: `Write a 60-second movie scene: ${params.input}` });
    const collection = await getOrCreateCollection();
    const video = await withVideoDB((conn) => collection.generateVideo({ prompt: script, duration: 60 }));
    const voice = await withVideoDB((conn) => collection.generateVoice({ text: script, voice_name: 'cinematic' }));
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: video, duration: 60 }));
    await withVideoDB((conn) => timeline.addClip(0, { asset: voice, duration: 60, track: 1 }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { input: params.input, videoId: video.id, voiceId: voice.id, script }, streamUrl: streamUrl.url };
  }, { input, options });
}
