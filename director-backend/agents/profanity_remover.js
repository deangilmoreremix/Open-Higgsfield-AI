import { runAgent, resolveVideo, withVideoDB, generateScript } from './_shared.js';

export async function profanity_remover(userId, { input, videoId, videoUrl, options = {} }) {
  return runAgent(userId, 'profanity_remover', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const transcript = await withVideoDB((conn) => video.generateTranscription());
    const detection = await generateScript({
      systemPrompt: 'You detect profanity. Return JSON: {"profane_words":[{"word":"...","timestamp":N}]}. If none, return {"profane_words":[]}.',
      userPrompt: `Detect profanity with timestamps:\n\n${transcript.text || JSON.stringify(transcript)}`,
      maxTokens: 600,
    });
    let parsed; try { parsed = JSON.parse(detection); } catch { parsed = { profane_words: [] }; }
    if (!parsed.profane_words?.length) return { output: { videoId: video.id, removedCount: 0, message: 'No profanity detected' } };
    const collection = await withVideoDB((conn) => conn.getDefaultCollection());
    const beeps = [];
    for (const item of parsed.profane_words) {
      const beep = await withVideoDB((conn) => collection.generateAudio({ prompt: 'beep censor', type: 'sfx', duration: 0.5 }));
      beeps.push(beep);
    }
    const timeline = await withVideoDB((conn) => conn.createTimeline());
    await withVideoDB((conn) => timeline.addClip(0, { asset: video, duration: video.duration, volume: 0.3 }));
    for (let i = 0; i < parsed.profane_words.length; i++) {
      await withVideoDB((conn) => timeline.addClip(parsed.profane_words[i].timestamp, { asset: beeps[i], duration: 0.5, track: 1, volume: 2 }));
    }
    const streamUrl = await withVideoDB((conn) => timeline.generateStream());
    return { output: { videoId: video.id, removedCount: parsed.profane_words.length }, streamUrl: streamUrl.url };
  }, { input, videoId, videoUrl, options });
}
