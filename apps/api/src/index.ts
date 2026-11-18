import { buildApp } from './app';

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '127.0.0.1';

const app = await buildApp({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully...`);
  try {
    await app.close();
    app.log.info('Server closed.');
    process.exit(0);
  } catch (err) {
    app.log.error(err, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

try {
  await app.listen({ port, host });
  app.log.info(`API server running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
