const logger = require('../../src/config/logger');
const { db } = require('../../src/models');
const { initializeDatabase } = require('../../src/utils/MockData');

const sequelizeInstance = db.sequelize;

const setupTestDB = () => {
  beforeAll(async () => {
    await sequelizeInstance.sync();
    await initializeDatabase();
    logger.info('Test set up'.bgYellow);
    jest.setTimeout(20000);
  });

  afterAll(async () => {
    // Disable foreign key constraints
    await sequelizeInstance.query('SET FOREIGN_KEY_CHECKS = 0');

    // Drop all tables
    await sequelizeInstance.sync({ force: true });
    await sequelizeInstance.close();
  });
};

module.exports = setupTestDB;
