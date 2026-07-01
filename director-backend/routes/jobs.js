import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getJob, listJobs } from '../services/jobTracker.js';

const router = Router();
router.use(requireAuth);

router.get('/:id', async (req, res, next) => {
  try {
    res.json({ job: await getJob(req.params.id, req.user.id) });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    res.json({ jobs: await listJobs(req.user.id, limit) });
  } catch (err) { next(err); }
});

export default router;
