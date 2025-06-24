import 'express-async-errors';
import express from 'express';
import dotenv from 'dotenv';
import winston from 'winston';
import healthRouter from './routes/health';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

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
