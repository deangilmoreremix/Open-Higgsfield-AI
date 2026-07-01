import { withVideoDB, getOrCreateCollection } from '../services/videodb.js';
import { generateScript } from '../services/llm.js';
import { createJob, updateJob } from '../services/jobTracker.js';
import { AppError, ErrorCodes } from '../lib/errors.js';

export { AppError, ErrorCodes, generateScript, withVideoDB, getOrCreateCollection, createJob, updateJob };

export async function runAgent(userId, agentId, handler, input) {
  const job = await createJob(userId, agentId, input);
  await updateJob(job.id, { status: 'running' });
  try {
    const result = await handler(input, { userId, jobId: job.id });
    await updateJob(job.id, {
      status: 'completed',
      output: result.output || null,
      stream_url: result.streamUrl || null,
      completed_at: new Date().toISOString(),
    });
    return { jobId: job.id, status: 'completed', ...result };
  } catch (err) {
    await updateJob(job.id, {
      status: 'failed',
      error_message: err.message,
      completed_at: new Date().toISOString(),
    });
    throw err;
  }
}

export async function generateVideoScript(topic, options = {}) {
  return generateScript({
    systemPrompt: options.system || 'You are a professional video scriptwriter.',
    userPrompt: options.prompt || `Write a ${options.duration || 30}-second video script about: ${topic}. ${options.style || 'Make it engaging and suitable for voiceover.'} Return only the script text.`,
    maxTokens: options.maxTokens || 500,
  });
}

export async function resolveVideo(videoId, videoUrl) {
  if (!videoId && !videoUrl) {
    throw new AppError(ErrorCodes.INVALID_INPUT, 'Either videoId or videoUrl is required', 400);
  }
  return withVideoDB(async (conn) => {
    if (videoId) return conn.getVideo(videoId);
    const collection = await getOrCreateCollection();
    return collection.upload({ url: videoUrl });
  });
}
