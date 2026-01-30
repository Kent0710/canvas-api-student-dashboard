require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/config/logger.config');

const PORT = config.port;

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Canvas API: ${config.canvas.baseURL}`);
  logger.info(`Cache enabled: ${config.cache.enabled}`);
  logger.info(`Read-only mode: ${config.security.readOnlyMode}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
