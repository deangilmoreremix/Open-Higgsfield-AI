import { runAgent, resolveVideo } from './_shared.js';
import { getIntegration } from '../services/credentials.js';
import { AppError, ErrorCodes } from '../lib/errors.js';

export async function slack_agent(userId, { input, videoId, videoUrl, options = {} }) {
  const creds = await getIntegration(userId, 'slack');
  if (!creds) throw new AppError(ErrorCodes.INTEGRATION_REQUIRED, 'Slack webhook not configured. Add it via /api/integrations.', 400, { type: 'slack' });
  return runAgent(userId, 'slack_agent', async (params) => {
    const video = params.videoId || params.videoUrl ? await resolveVideo(params.videoId, params.videoUrl) : null;
    const message = params.options.message || (video ? `New video: ${video.id}` : 'Director update');
    const payload = { text: message, ...(video?.streamUrl ? { attachments: [{ title: 'Video', title_link: video.streamUrl }] } : {}) };
    const res = await fetch(creds.webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`Slack webhook returned ${res.status}`);
    return { output: { message, sent: true, videoId: video?.id || null } };
  }, { input, videoId, videoUrl, options });
}
