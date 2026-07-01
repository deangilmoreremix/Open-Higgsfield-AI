import { runAgent, withVideoDB, getOrCreateCollection, generateVideoScript } from './_shared.js';

export async function trailer(userId, { input, options = {} }) {
  const topic = input || options.topic;
  if (!topic) throw new Error('topic is required');
  return runAgent(userId, 'trailer', async (params) => {
    const script = await generateVideoScript(params.input || params.options.topic, { duration: 30, style: 'Dramatic cinematic trailer narration with high intensity.' });
    const collection = await getOrCreateCollection();
    const voice = await withVideoDB((conn) => collection.generateVoice({ text: script, voice_name: 'cinematic' }));
    const visuals = await withVideoDB((conn) => collection.generateVideo({ prompt: `Cinematic trailer B-roll for: ${params.input || params.options.topic}`, duration: 30 }));
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: visuals, duration: 30 }));
    await withVideoDB((conn) => timeline.addClip(0, { asset: voice, duration: 30, track: 1 }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { topic, script, videoId: visuals.id, voiceId: voice.id }, streamUrl: streamUrl.url };
  }, { input, options });
}
