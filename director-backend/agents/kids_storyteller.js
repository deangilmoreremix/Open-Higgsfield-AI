import { runAgent, withVideoDB, getOrCreateCollection, generateScript } from './_shared.js';

export async function kids_storyteller(userId, { input, options = {} }) {
  const topic = input || options.topic;
  if (!topic) throw new Error('topic is required');
  return runAgent(userId, 'kids_storyteller', async (params) => {
    const script = await generateScript({ systemPrompt: "You are a children's story writer. Use simple language, friendly tone, and vivid imagery.", userPrompt: `Write a 60-second kids story about: ${params.input || params.options.topic}`, maxTokens: 600 });
    const collection = await getOrCreateCollection();
    const voice = await withVideoDB((conn) => collection.generateVoice({ text: script, voice_name: 'friendly' }));
    const visuals = await withVideoDB((conn) => collection.generateVideo({ prompt: `Colorful cartoon animation: ${params.input || params.options.topic}`, duration: 60 }));
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: visuals, duration: 60 }));
    await withVideoDB((conn) => timeline.addClip(0, { asset: voice, duration: 60, track: 1 }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { topic: params.input || params.options.topic, script, videoId: visuals.id, voiceId: voice.id }, streamUrl: streamUrl.url };
  }, { input, options });
}
