import app from './app';
import logger from './logger';
import { PORT } from './config';
import startRefreshJob from './cron/refreshJob';

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  startRefreshJob();
});
