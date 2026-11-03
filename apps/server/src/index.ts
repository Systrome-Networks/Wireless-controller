import http from 'http';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { wsHub } from './websocket/server.js';
import { prisma } from '@wac/database';

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize WebSocket server attached to HTTP server
  wsHub.init(server);

  server.listen(config.port, () => {
    logger.info(`🚀 WAC Enterprise API Server running on port ${config.port}`, {
      env: config.env,
      wsPath: '/ws',
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, initiating graceful shutdown...`);
    server.close(async () => {
      logger.info('HTTP & WebSocket servers closed.');
      await prisma.$disconnect();
      logger.info('Database connection closed.');
      process.exit(0);
    });

    // Force exit if shutdown takes longer than 10s
    setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing process exit.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error', { error: err.message, stack: err.stack });
  process.exit(1);
});
