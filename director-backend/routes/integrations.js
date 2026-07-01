import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { saveIntegration, deleteIntegration, listIntegrations } from '../services/credentials.js';
import { AppError, ErrorCodes } from '../lib/errors.js';

const router = Router();
router.use(requireAuth, rateLimit);

router.get('/', async (req, res, next) => {
  try {
    res.json({ integrations: await listIntegrations(req.user.id) });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { type, credentials } = req.body || {};
    if (!['slack', 'hubspot', 'salesforce'].includes(type)) {
      throw new AppError(ErrorCodes.INVALID_INPUT, 'type must be slack, hubspot, or salesforce', 400);
    }
    if (!credentials || typeof credentials !== 'object') {
      throw new AppError(ErrorCodes.INVALID_INPUT, 'credentials object is required', 400);
    }
    const saved = await saveIntegration(req.user.id, type, credentials);
    res.json({ ok: true, type: saved.integration_type });
  } catch (err) { next(err); }
});

router.delete('/:type', async (req, res, next) => {
  try {
    if (!['slack', 'hubspot', 'salesforce'].includes(req.params.type)) {
      throw new AppError(ErrorCodes.INVALID_INPUT, 'type must be slack, hubspot, or salesforce', 400);
    }
    await deleteIntegration(req.user.id, req.params.type);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/test/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const { credentials } = req.body || {};
    if (type === 'slack') {
      const r = await fetch(credentials.webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Director test' }) });
      if (!r.ok) throw new AppError(ErrorCodes.INVALID_INPUT, `Slack returned ${r.status}`, 400);
      return res.json({ ok: true });
    }
    if (type === 'hubspot' || type === 'salesforce') {
      const endpoint = type === 'hubspot' ? 'https://api.hubapi.com/crm/v3/owners' : `${credentials.instanceUrl}/services/data/v59.0/limits`;
      const r = await fetch(endpoint, { headers: { Authorization: `Bearer ${credentials.apiKey}` } });
      if (!r.ok) throw new AppError(ErrorCodes.INVALID_INPUT, `${type} returned ${r.status}`, 400);
      return res.json({ ok: true });
    }
    throw new AppError(ErrorCodes.INVALID_INPUT, 'Unknown type', 400);
  } catch (err) { next(err); }
});

export default router;
