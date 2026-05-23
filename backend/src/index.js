import '../env-bootstrap.mjs';
import { createServer } from './server.js';
import { logger } from './lib/logger.js';

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

const app = createServer();

app.listen(port, host, () => {
  logger.info(`Hiriya backend listening on http://${host}:${port}`);
});
