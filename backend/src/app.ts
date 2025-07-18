import 'express-async-errors';
import express from 'express';
import { google } from 'googleapis';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import sheetsRouter from './routes/sheets';
import tabsRouter from './routes/tabs';
import pipelineRouter from './routes/pipeline';
import requireAuth from './middleware/requireAuth';
import logger from './logger';
import errorHandler from './middleware/errorHandler';
import { getAuth } from './lib/googleClient';

const app = express();

app.use(express.json());

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/health', healthRouter);
app.use('/health-protected', requireAuth, (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/auth', authRouter);
app.use('/sheets', requireAuth, sheetsRouter);
app.use('/sheets', tabsRouter);
app.use('/pipeline', pipelineRouter);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      const oauth2 = google.oauth2({ auth: getAuth(), version: 'v2' });
      const me = await oauth2.userinfo.get();
      logger.info(`Google auth OK for ${me.data.email}`);
    } catch (err) {
      logger.error(`Google auth failed: ${(err as Error).message}`);
      process.exit(1);
    }
  })();
}

export default app;
