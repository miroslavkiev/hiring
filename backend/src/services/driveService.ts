import { drive } from '../lib/googleClient';
import logger from '../logger';
import * as cache from '../lib/cache';

export interface SpreadsheetMeta {
  id: string;
  name: string;
}

const CACHE_KEY = 'allSheets';
const TTL = 5 * 60 * 1000; // 5 minutes

async function fetchAllSpreadsheets(): Promise<SpreadsheetMeta[]> {
  const files: SpreadsheetMeta[] = [];
  let pageToken: string | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const res = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed = false",
          fields: 'nextPageToken, files(id, name)',
          pageSize: 100,
          pageToken,
        });
        const list = res.data.files || [];
        list.forEach((f) => {
          if (f.id && f.name) files.push({ id: f.id, name: f.name });
        });
        pageToken = res.data.nextPageToken || undefined;
        if (!pageToken) break;
      }
      return files;
    } catch (err) {
      const delay = 2 ** attempt * 100;
      logger.warn(
        `Drive list attempt ${attempt + 1} failed: ${(err as Error).message}`,
      );
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }
  throw new Error('Unable to fetch spreadsheets from Drive');
}

export default async function listSpreadsheets(
  search?: string,
): Promise<SpreadsheetMeta[]> {
  let data = cache.get<SpreadsheetMeta[]>(CACHE_KEY);
  if (!data) {
    data = await fetchAllSpreadsheets();
    cache.set(CACHE_KEY, data, TTL);
  }
  if (!search) return data;
  const q = search.toLowerCase();
  return data.filter((s) => s.name.toLowerCase().includes(q));
}
