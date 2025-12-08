const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');
const config = require('../config/config');

/**
 * Escape SQL string values
 */
const escapeSQL = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  // Escape single quotes and backslashes
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
};

/**
 * Format row data as SQL INSERT values
 */
const formatRowAsSQL = (row, columns) => {
  const values = columns.map(col => escapeSQL(row[col]));
  return `(${values.join(', ')})`;
};

/**
 * Ensure backup directory exists
 */
const ensureBackupDirectory = () => {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    logger.info(`Created backup directory: ${backupDir}`);
  }
  return backupDir;
};

/**
 * Clean old backups, keeping only the last N backups
 * @param {number} keepCount - Number of backups to keep
 */
const cleanOldBackups = async (backupDir, keepCount = 10) => {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sql') || file.endsWith('.sql.gz'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time); // Sort by modification time, newest first

    // Remove backups beyond the keep count
    if (files.length > keepCount) {
      const filesToDelete = files.slice(keepCount);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        logger.info(`Deleted old backup: ${file.name}`);
      }
      logger.info(`Cleaned up ${filesToDelete.length} old backup(s)`);
    }
  } catch (error) {
    logger.error('Error cleaning old backups:', error);
  }
};

/**
 * Get all table names from the database
 */
const getTableNames = async () => {
  try {
    // Use queryInterface which is more reliable
    const queryInterface = sequelize.getQueryInterface();
    const tableNames = await queryInterface.showAllTables();
    
    // Filter out Sequelize metadata tables if needed
    const filteredTables = tableNames.filter(name => !name.startsWith('SequelizeMeta'));
    
    logger.info(`Found ${filteredTables.length} tables: ${filteredTables.join(', ')}`);
    return filteredTables;
  } catch (error) {
    logger.error('Error getting table names:', error);
    // Fallback to raw query
    try {
      const [results] = await sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'"
      );
      
      // Handle different result formats
      const tableNames = results.map(row => {
        const value = row.table_name || row.TABLE_NAME || row['table_name'] || row['TABLE_NAME'];
        if (!value) {
          // If no match, get first value from row
          const keys = Object.keys(row);
          return keys.length > 0 ? row[keys[0]] : null;
        }
        return value;
      }).filter(name => name && name !== 'undefined' && name !== null);
      
      logger.info(`Extracted table names (fallback): ${tableNames.join(', ')}`);
      return tableNames;
    } catch (fallbackError) {
      logger.error('Fallback query also failed:', fallbackError);
      throw error;
    }
  }
};

/**
 * Get CREATE TABLE statement for a table
 */
const getTableStructure = async (tableName) => {
  try {
    const [results] = await sequelize.query(`SHOW CREATE TABLE \`${tableName}\``);
    // Handle different result formats
    const createTable = results[0]['Create Table'] || results[0]['CREATE TABLE'] || results[0].Create_Table || results[0].CREATE_TABLE;
    return createTable;
  } catch (error) {
    logger.error(`Error getting structure for table ${tableName}:`, error);
    throw error;
  }
};

/**
 * Get all data from a table
 */
const getTableData = async (tableName) => {
  try {
    const [results] = await sequelize.query(`SELECT * FROM \`${tableName}\``);
    return results;
  } catch (error) {
    logger.error(`Error getting data from table ${tableName}:`, error);
    throw error;
  }
};

/**
 * Create database backup using Sequelize
 * @returns {Promise<string>} Path to the backup file
 */
const createBackup = async () => {
  try {
    const backupDir = ensureBackupDirectory();
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                      new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const backupFileName = `backup_${timestamp}.sql`;
    const backupPath = path.join(backupDir, backupFileName);

    logger.info('Starting database backup...');
    logger.info(`Database: ${config.sequelize.database}`);
    logger.info(`Backup location: ${backupPath}`);

    // Start building SQL dump
    let sqlDump = `-- MySQL dump generated by Sequelize Backup Service\n`;
    sqlDump += `-- Date: ${new Date().toISOString()}\n`;
    sqlDump += `-- Database: ${config.sequelize.database}\n\n`;
    sqlDump += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
    sqlDump += `SET time_zone = "+00:00";\n\n`;
    sqlDump += `/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;\n`;
    sqlDump += `/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;\n`;
    sqlDump += `/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;\n`;
    sqlDump += `/*!40101 SET NAMES utf8mb4 */;\n\n`;

    // Get all tables
    const tableNames = await getTableNames();
    logger.info(`Found ${tableNames.length} tables to backup`);

    // Process each table
    for (const tableName of tableNames) {
      // Skip invalid table names
      if (!tableName || tableName === 'undefined' || typeof tableName !== 'string') {
        logger.warn(`Skipping invalid table name: ${tableName}`);
        continue;
      }
      
      logger.info(`Backing up table: ${tableName}`);
      
      // Get table structure
      const createTableSQL = await getTableStructure(tableName);
      sqlDump += `\n-- --------------------------------------------------------\n`;
      sqlDump += `-- Table structure for table \`${tableName}\`\n`;
      sqlDump += `-- --------------------------------------------------------\n\n`;
      sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlDump += `${createTableSQL};\n\n`;

      // Get table data
      const tableData = await getTableData(tableName);
      
      if (tableData.length > 0) {
        sqlDump += `-- --------------------------------------------------------\n`;
        sqlDump += `-- Dumping data for table \`${tableName}\`\n`;
        sqlDump += `-- --------------------------------------------------------\n\n`;
        sqlDump += `LOCK TABLES \`${tableName}\` WRITE;\n`;
        sqlDump += `/*!40000 ALTER TABLE \`${tableName}\` DISABLE KEYS */;\n\n`;

        // Get column names
        const columns = Object.keys(tableData[0]);
        
        // Insert data in batches
        const batchSize = 100;
        for (let i = 0; i < tableData.length; i += batchSize) {
          const batch = tableData.slice(i, i + batchSize);
          const values = batch.map(row => formatRowAsSQL(row, columns));
          sqlDump += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES\n`;
          sqlDump += `  ${values.join(',\n  ')};\n\n`;
        }

        sqlDump += `/*!40000 ALTER TABLE \`${tableName}\` ENABLE KEYS */;\n`;
        sqlDump += `UNLOCK TABLES;\n\n`;
        
        logger.info(`  - Exported ${tableData.length} rows from ${tableName}`);
      } else {
        logger.info(`  - Table ${tableName} is empty`);
      }
    }

    // Add footer
    sqlDump += `/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;\n`;
    sqlDump += `/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;\n`;
    sqlDump += `/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;\n`;

    // Write to file
    fs.writeFileSync(backupPath, sqlDump, 'utf8');

    // Check if backup file was created and has content
    if (fs.existsSync(backupPath)) {
      const stats = fs.statSync(backupPath);
      if (stats.size > 0) {
        logger.info(`Backup completed successfully! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Clean old backups
        await cleanOldBackups(backupDir, 10);
        
        return backupPath;
      } else {
        throw new Error('Backup file is empty');
      }
    } else {
      throw new Error('Backup file was not created');
    }
  } catch (error) {
    logger.error('Backup failed:', error);
    throw error;
  }
};

/**
 * Test backup functionality (for manual testing)
 */
const testBackup = async () => {
  try {
    logger.info('Testing backup functionality...');
    const backupPath = await createBackup();
    logger.info(`Test backup successful: ${backupPath}`);
    return backupPath;
  } catch (error) {
    logger.error('Test backup failed:', error);
    throw error;
  }
};

module.exports = {
  createBackup,
  testBackup,
  cleanOldBackups,
};

