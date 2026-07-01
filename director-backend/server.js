import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import agentsRouter from './routes/agents.js';
import integrationsRouter from './routes/integrations.js';
import jobsRouter from './routes/jobs.js';

dotenv.config();

export function createApp() {
  const app = express();

  app.use(cors({
    origin: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
    credentials: true,
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/agents', agentsRouter);
  app.use('/api/integrations', integrationsRouter);
  app.use('/api/jobs', jobsRouter);

  app.use(errorHandler);

  return app;
}

const app = createApp();
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Director backend listening on port ${PORT}`);
  });
}

export default app;
