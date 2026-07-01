import { runAgent, withVideoDB, getOrCreateCollection, generateScript } from './_shared.js';

export async function story(userId, { input, options = {} }) {
  const topic = input || options.topic;
  if (!topic) throw new Error('topic is required');
  return runAgent(userId, 'story', async (params) => {
    const scenes = await generateScript({
      systemPrompt: 'You are a story designer. Break the topic into 3-5 scenes with brief descriptions.',
      userPrompt: `Topic: ${params.input || params.options.topic}\n\nReturn as JSON array: [{"title":"...","description":"..."}]`,
      maxTokens: 800,
    });
    let parsed; try { parsed = JSON.parse(scenes); } catch { parsed = [{ title: 'Story', description: scenes }]; }
    const collection = await getOrCreateCollection();
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    let cursor = 0;
    for (const scene of parsed) {
      const img = await withVideoDB((conn) => collection.generateImage({ prompt: scene.description }));
      await withVideoDB((conn) => timeline.addClip(cursor, { asset: img, duration: 5 }));
      cursor += 5;
    }
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { scenes: parsed, topic }, streamUrl: streamUrl.url };
  }, { input, options });
}
