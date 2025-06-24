import { google } from 'googleapis';
import { readFileSync } from 'node:fs';
import { GoogleAuth } from 'google-auth-library';

let auth: GoogleAuth | null = null;

export const getAuth = (): GoogleAuth => {
  if (auth) return auth;
  const keyPath =
    process.env.SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) throw new Error('SERVICE_ACCOUNT_JSON env var not set');
  let keyFile: string;
  try {
    keyFile = readFileSync(keyPath, 'utf8');
  } catch {
    throw new Error(`Unable to read service account file at ${keyPath}`);
  }
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ];
  try {
    auth = new GoogleAuth({ credentials: JSON.parse(keyFile), scopes });
  } catch {
    throw new Error('Invalid service account JSON');
  }
  return auth;
};

export const sheets = google.sheets({ version: 'v4', auth: getAuth() });
export const drive = google.drive({ version: 'v3', auth: getAuth() });
