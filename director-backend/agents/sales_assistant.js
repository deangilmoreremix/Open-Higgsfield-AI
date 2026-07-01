import { runAgent, resolveVideo } from './_shared.js';
import { getIntegration } from '../services/credentials.js';
import { AppError, ErrorCodes } from '../lib/errors.js';

export async function sales_assistant(userId, { input, videoId, videoUrl, options = {} }) {
  const creds = await getIntegration(userId, options.crm || 'hubspot');
  if (!creds) throw new AppError(ErrorCodes.INTEGRATION_REQUIRED, `${options.crm || 'hubspot'} integration not configured.`, 400, { type: options.crm || 'hubspot' });
  return runAgent(userId, 'sales_assistant', async (params) => {
    const video = params.videoId || params.videoUrl ? await resolveVideo(params.videoId, params.videoUrl) : null;
    const summary = video ? `Video: ${video.id} (${video.duration}s)` : params.input;
    const crm = params.options.crm || 'hubspot';
    let endpoint, body;
    if (crm === 'hubspot') {
      endpoint = 'https://api.hubapi.com/crm/v3/objects/notes';
      body = { properties: { hs_note_body: summary, hs_timestamp: new Date().toISOString() } };
    } else {
      endpoint = `${creds.instanceUrl}/services/data/v59.0/sobjects/Note`;
      body = { Body: summary };
    }
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${creds.apiKey}` }, body: JSON.stringify(body) });
    if (!res.ok) { const t = await res.text(); throw new Error(`${crm} returned ${res.status}: ${t}`); }
    const result = await res.json();
    return { output: { crm, noteId: result.id, videoId: video?.id || null } };
  }, { input, videoId, videoUrl, options });
}
