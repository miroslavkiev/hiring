import app from './app';
import logger from './logger';
import { PORT } from './config';

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
