import winston from 'winston';
import { env } from './config';

const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

export default logger;
