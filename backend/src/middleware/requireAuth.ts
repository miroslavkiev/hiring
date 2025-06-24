import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import logger from '../logger';
import { ALLOWED_USERS } from '../config';

const oauthClient = new OAuth2Client();

export default async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'missing token' });
    }
    const idToken = auth.replace('Bearer ', '');
    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });
    const email = ticket.getPayload()?.email ?? 'unknown';
    const allowed = ALLOWED_USERS.includes(email);
    if (!allowed) {
      logger.warn(`Auth forbidden for ${email}`);
      return res.status(403).json({ error: 'forbidden' });
    }
    req.user = { email };
    return next();
  } catch (err) {
    logger.warn(`Auth failed: ${(err as Error).message}`);
    return res.status(403).json({ error: 'forbidden' });
  }
}
