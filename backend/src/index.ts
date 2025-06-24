import 'express-async-errors';
import express from 'express';
import winston from 'winston';
import { google } from 'googleapis';
import healthRouter from './routes/health';
import { PORT, env } from './config';
import { getAuth } from './lib/googleClient';

const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

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

const app = express();

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/health', healthRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  },
);

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
