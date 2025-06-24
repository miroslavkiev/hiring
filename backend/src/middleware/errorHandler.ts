import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

interface HttpError extends Error {
  httpStatus?: number;
}

export default function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error(err.message, { stack: err.stack });
  const status = err.httpStatus || 500;
  res.status(status).json({ error: err.message });
}
