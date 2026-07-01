import { runAgent, withVideoDB, getOrCreateCollection, generateScript } from './_shared.js';

export async function ai_ad_films(userId, { input, options = {} }) {
  const product = (input || options.product || '').replace(/create ai ad|make ai ad|generate ad/i, '').trim();
  if (!product) throw new Error('product is required');
  return runAgent(userId, 'ai_ad_films', async (params) => {
    const script = await generateScript({ userPrompt: `Write a 30-second ad for: ${params.options.product}. Make it persuasive.`, maxTokens: 400 });
    const collection = await getOrCreateCollection();
    const voice = await withVideoDB((conn) => collection.generateVoice({ text: script, voice_name: 'energetic' }));
    const visuals = await withVideoDB((conn) => collection.generateVideo({ prompt: `Ad visuals for ${params.options.product}`, duration: 30 }));
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: visuals, duration: 30 }));
    await withVideoDB((conn) => timeline.addClip(0, { asset: voice, duration: 30, track: 1 }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { product: params.options.product, script, videoId: visuals.id, voiceId: voice.id }, streamUrl: streamUrl.url };
  }, { input, options: { ...options, product } });
}
