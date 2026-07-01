import { runAgent, withVideoDB, getOrCreateCollection } from './_shared.js';

export async function voice_cloning(userId, { input, options = {} }) {
  const text = input || options.text;
  if (!text) throw new Error('text is required');
  return runAgent(userId, 'voice_cloning', async (params) => {
    const collection = await getOrCreateCollection();
    const audio = await withVideoDB((conn) => collection.generateVoice({ text: params.input || params.options.text, voice_name: params.options.voiceName || 'cloned' }));
    return { output: { audioId: audio.id, text, voiceName: 'cloned' } };
  }, { input, options });
}
