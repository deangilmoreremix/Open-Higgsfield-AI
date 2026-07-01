import { runAgent, resolveVideo, withVideoDB, generateScript } from './_shared.js';

export async function summarizer(userId, { input, videoId, videoUrl }) {
  return runAgent(userId, 'summarizer', async (params) => {
    const video = await resolveVideo(params.videoId, params.videoUrl);
    const transcript = await withVideoDB(async (conn) => video.generateTranscription());
    const summary = await generateScript({
      systemPrompt: 'You are a video summarizer. Produce concise, accurate summaries.',
      userPrompt: `Summarize this video transcript in 3-5 bullet points:\n\n${transcript.text || transcript}`,
      maxTokens: 400,
    });
    return { output: { summary, transcriptLength: (transcript.text || '').length } };
  }, { input, videoId, videoUrl });
}
