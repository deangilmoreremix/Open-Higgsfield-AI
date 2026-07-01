import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { agents, agentMetadata } from '../agents/index.js';
import { AppError, ErrorCodes } from '../lib/errors.js';

const router = Router();

router.post('/:agentId', requireAuth, rateLimit, async (req, res, next) => {
  try {
    const handler = agents[req.params.agentId];
    if (!handler) throw new AppError(ErrorCodes.NOT_FOUND, `Unknown agent: ${req.params.agentId}`, 404);
    const result = await handler(req.user.id, req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/', (req, res) => {
  res.json({ agents: Object.entries(agentMetadata).map(([id, m]) => ({ id, ...m })) });
});

export default router;
