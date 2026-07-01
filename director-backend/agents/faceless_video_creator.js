import { runAgent, withVideoDB, getOrCreateCollection, generateVideoScript } from './_shared.js';

export async function faceless_video_creator(userId, { input, options = {} }) {
  const topic = (input || options.topic || '').replace(/create faceless video|make faceless video|generate faceless video/i, '').trim();
  if (!topic) throw new Error('topic is required');
  return runAgent(userId, 'faceless_video_creator', async (params) => {
    const script = await generateVideoScript(params.options.topic, { duration: 30 });
    const collection = await getOrCreateCollection();
    const voice = await withVideoDB((conn) => collection.generateVoice({ text: script, voice_name: 'narrator' }));
    const visuals = await withVideoDB((conn) => collection.generateVideo({ prompt: `Cinematic B-roll: ${params.options.topic}`, duration: 30 }));
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: visuals, duration: 30 }));
    await withVideoDB((conn) => timeline.addClip(0, { asset: voice, duration: 30, track: 1 }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { topic: params.options.topic, script, videoId: visuals.id, voiceId: voice.id }, streamUrl: streamUrl.url };
  }, { input, options: { ...options, topic } });
}
