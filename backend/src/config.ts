import { existsSync } from 'node:fs';
import dotenv from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const schema = z.object({
  PORT: z.string().optional(),
  SERVICE_ACCOUNT_JSON: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    'Invalid environment variables:',
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;

export const PORT = parsed.data.PORT ? parseInt(parsed.data.PORT, 10) : 4000;

export const SERVICE_ACCOUNT_JSON =
  env.SERVICE_ACCOUNT_JSON || env.GOOGLE_APPLICATION_CREDENTIALS;

if (!SERVICE_ACCOUNT_JSON) {
  // eslint-disable-next-line no-console
  console.error('SERVICE_ACCOUNT_JSON env var not set');
  process.exit(1);
}

if (!existsSync(SERVICE_ACCOUNT_JSON)) {
  // eslint-disable-next-line no-console
  console.error(`Service account file not found at ${SERVICE_ACCOUNT_JSON}`);
  process.exit(1);
}
