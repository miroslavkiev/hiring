import { sheets } from '../lib/googleClient';
import logger from '../logger';
import * as cache from '../lib/cache';

export interface SheetTab {
  gid: string;
  title: string;
}

const TTL = 5 * 60 * 1000; // 5 minutes

export async function listTabs(sheetId: string): Promise<SheetTab[] | null> {
  if (!sheetId || sheetId.length < 40) return null;
  const cacheKey = `tabs:${sheetId}`;
  let data = cache.get<SheetTab[]>(cacheKey);
  if (data) return data;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        fields: 'sheets.properties',
      });
      const list = res.data.sheets;
      if (!list) return null;
      data = list.map((s) => ({
        gid: String(s.properties?.sheetId ?? ''),
        title: s.properties?.title ?? '',
      }));
      cache.set(cacheKey, data, TTL);
      return data;
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
  throw new Error('Unable to fetch spreadsheet tabs');
}

export default { listTabs };
