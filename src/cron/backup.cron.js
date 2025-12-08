const cron = require('node-cron');
const logger = require('../config/logger');
const { createBackup } = require('../services/backup.service');

/**
 * Initialize database backup cron job
 * Runs every Tuesday at 2:00 AM
 * Cron expression: '0 2 * * 2'
 * - 0: minute (0)
 * - 2: hour (2 AM)
 * - *: day of month (any)
 * - *: month (any)
 * - 2: day of week (Tuesday, 0=Sunday, 2=Tuesday)
 */
const initializeBackupCron = () => {
  // Run every Tuesday at 2:00 AM
  // const cronSchedule = '0 2 * * 2'; // Production schedule
  const cronSchedule = '* * * * *'; // Every minute (for testing)
  
  logger.info('Initializing database backup cron job...');
  logger.info(`Schedule: ${cronSchedule === '* * * * *' ? 'Every minute (testing mode)' : 'Every Tuesday at 2:00 AM'}`);

  const job = cron.schedule(cronSchedule, async () => {
    try {
      logger.info('=== Starting scheduled database backup ===');
      const backupPath = await createBackup();
      logger.info(`=== Scheduled backup completed: ${backupPath} ===`);
    } catch (error) {
      logger.error('=== Scheduled backup failed ===', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC', // Adjust timezone as needed
  });

  // Log when the job will run next
  logger.info('Backup cron job initialized successfully');
  
  return job;
};

/**
 * Manually trigger backup immediately (for testing)
 */
const runBackupNow = async () => {
  try {
    logger.info('=== Manually triggering database backup ===');
    const backupPath = await createBackup();
    logger.info(`=== Manual backup completed: ${backupPath} ===`);
    return backupPath;
  } catch (error) {
    logger.error('=== Manual backup failed ===', error);
    throw error;
  }
};

module.exports = {
  initializeBackupCron,
  runBackupNow,
};

