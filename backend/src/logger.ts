import winston from 'winston';
import { env } from './config';

const level = env.LOG_LEVEL || 'info';

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  process.env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
);

const logger = winston.createLogger({
  level,
  format: baseFormat,
  transports: [new winston.transports.Console()],
});

export default logger;
