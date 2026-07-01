import { runAgent, withVideoDB, getOrCreateCollection, generateScript } from './_shared.js';

export async function tiktok_lyric_video(userId, { input, options = {} }) {
  const topic = input || options.topic;
  if (!topic) throw new Error('topic is required');
  return runAgent(userId, 'tiktok_lyric_video', async (params) => {
    const lyrics = await generateScript({ userPrompt: `Write 8 lines of song lyrics about: ${params.input || params.options.topic}. One line per line.`, maxTokens: 300 });
    const collection = await getOrCreateCollection();
    const music = await withVideoDB((conn) => collection.generateAudio({ prompt: `Catchy song: ${params.input || params.options.topic}`, type: 'music' }));
    const bg = await withVideoDB((conn) => collection.generateVideo({ prompt: `Aesthetic vertical background: ${params.input || params.options.topic}`, duration: 30 }));
    const timeline = await withVideoDB((conn) => conn.createTimeline({ resolution: '608x1080' }));
    await withVideoDB((conn) => timeline.addClip(0, { asset: bg, duration: 30 }));
    await withVideoDB((conn) => timeline.addClip(0, { asset: music, duration: 30, track: 1 }));
    const lines = lyrics.split('\n').filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      await withVideoDB((conn) => timeline.addClip(i * (30 / lines.length), { asset: { text: lines[i] }, duration: 30 / lines.length, track: 2, position: 'center' }));
    }
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { topic: params.input || params.options.topic, lyrics, musicId: music.id, videoId: bg.id }, streamUrl: streamUrl.url };
  }, { input, options });
}
