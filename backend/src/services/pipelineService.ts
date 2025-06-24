import { sheets } from '../lib/googleClient';
import * as cache from '../lib/cache';
import logger from '../logger';
import { saveSettings } from '../lib/settingsStore';

export interface RowObject {
  [key: string]: string;
}

const CACHE_MS = 5 * 60 * 1000;

function sanitizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '_').toLowerCase();
}

async function fetchTabTitle(
  sheetId: string,
  tabGid: string,
): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        fields: 'sheets.properties',
      });
      const sheet = res.data.sheets?.find(
        (s) => String(s.properties?.sheetId ?? '') === tabGid,
      );
      if (!sheet) return null;
      return sheet.properties?.title || null;
    } catch (err) {
      if ((err as { code?: number }).code === 404) return null;
      const delay = 2 ** attempt * 100;
      logger.warn(
        `Sheets get attempt ${attempt + 1} failed: ${(err as Error).message}`,
      );
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }
  const error = new Error('google failure') as { code?: number };
  error.code = 502;
  throw error;
}

async function fetchValues(
  sheetId: string,
  title: string,
): Promise<string[][] | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${title}'`,
      });
      return res.data.values || [];
    } catch (err) {
      if ((err as { code?: number }).code === 404) return null;
      const delay = 2 ** attempt * 100;
      logger.warn(
        `Values get attempt ${attempt + 1} failed: ${(err as Error).message}`,
      );
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }
  const error = new Error('google failure') as { code?: number };
  error.code = 502;
  throw error;
}

function convert(values: string[][]): RowObject[] {
  if (!values[0]) {
    const err = new Error('header row missing') as { code?: number };
    err.code = 400;
    throw err;
  }
  const headers = values[0].map((h) => sanitizeKey(h || ''));
  if (headers.every((h) => h === '')) {
    const err = new Error('header row missing') as { code?: number };
    err.code = 400;
    throw err;
  }
  return values.slice(1).map((row) => {
    const obj: RowObject = {};
    headers.forEach((k, i) => {
      obj[k] = row[i] ?? '';
    });
    return obj;
  });
}

export default async function sync(
  sheetId: string,
  tabGid: string,
  force = false,
): Promise<RowObject[] | null> {
  const key = `${sheetId}|${tabGid}`;
  if (!force) {
    const cached = cache.get<RowObject[]>(key);
    if (cached) return cached;
  }

  const title = await fetchTabTitle(sheetId, tabGid);
  if (!title) return null;

  const values = await fetchValues(sheetId, title);
  if (values === null) return null;

  const rows = convert(values);
  cache.set(key, rows, CACHE_MS);
  cache.set('data:last', rows, CACHE_MS);
  await saveSettings({ sheetId, tabGid });
  return rows;
}
