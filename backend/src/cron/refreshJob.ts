import cron from 'node-cron';
import { loadSettings } from '../lib/settingsStore';
import syncPipeline from '../services/pipelineService';
import logger from '../logger';

let started = false;
export default function startRefreshJob() {
  if (started) return;
  started = true;
  cron.schedule('*/5 * * * *', async () => {
    try {
      const settings = await loadSettings();
      if (!settings) {
        logger.info('Cron: no settings yet – skip');
        return;
      }
      await syncPipeline(settings.sheetId, settings.tabGid, true);
      logger.info(`Cron: refreshed ${settings.sheetId}/${settings.tabGid}`);
    } catch (err) {
      logger.error(`Cron refresh failed: ${(err as Error).message}`);
    }
  });
}
