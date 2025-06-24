import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import logger from '../logger';
import { ALLOWED_USERS } from '../config';

const router = Router();
const oauthClient = new OAuth2Client();

router.post('/validate', async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });
    const email = ticket.getPayload()?.email ?? 'unknown';

    const allowed = ALLOWED_USERS.includes(email);
    if (!allowed) return res.status(403).json({ error: 'forbidden' });

    logger.info(`Auth ok for ${email}`);
    return res.json({ email });
  } catch (err) {
    return next(err);
  }
});

export default router;
