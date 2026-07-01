import { runAgent, withVideoDB, getOrCreateCollection } from './_shared.js';

export async function voiceover(userId, { input, options = {} }) {
  const text = input || options.text;
  if (!text) throw new Error('text is required');
  return runAgent(userId, 'voiceover', async (params) => {
    const collection = await getOrCreateCollection();
    const audio = await withVideoDB((conn) => collection.generateVoice({ text: params.input || params.options.text, voice_name: params.options.voiceName || 'Default' }));
    return { output: { audioId: audio.id, text, voiceName: params.options.voiceName || 'Default' } };
  }, { input, options });
}
