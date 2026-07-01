import { runAgent, withVideoDB, getOrCreateCollection } from './_shared.js';

export async function meme(userId, { input, options = {} }) {
  const prompt = input || options.prompt;
  if (!prompt) throw new Error('prompt is required');
  return runAgent(userId, 'meme', async (params) => {
    const collection = await getOrCreateCollection();
    const image = await withVideoDB((conn) => collection.generateImage({ prompt: params.input || params.options.prompt }));
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: image, duration: 3, text_overlay: { top: params.options.topText || 'WHEN YOU', bottom: params.options.bottomText || 'REALIZE' } }));
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { imageId: image.id, topText: params.options.topText || 'WHEN YOU', bottomText: params.options.bottomText || 'REALIZE' }, streamUrl: streamUrl.url };
  }, { input, options });
}
