const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { sequelize } = require('./config/database');
const { association } = require('./models');
const { initializeDatabase } = require('./utils/MockData');

let server;

try {
  // authenticate database
  sequelize.authenticate();

  // Initialize associations
  association();

  // sync database
  // User.sync({
  //   alter: true,
  // });

  // intit DB
  sequelize
    .sync({
      // alter: true,
      // logging: false,
    })
    .then(() => {
      // Load dummy data
      if (config.env !== 'test') {
        initializeDatabase()
          .then(() => {
            logger.info('Database initialization complete'.bgBlue);
          })
          .catch((error) => {
            logger.error('Error initializing database:', error);
          });
      }
    })
    .catch((error) => {
      logger.error('Error syncing database:', error);
    });

  server = app.listen(config.port, () => {
    logger.info(`Listening on port: ${config.port}`.cyan);
  });
} catch (error) {
  logger.error(error);
  process.exit(1);
}

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
