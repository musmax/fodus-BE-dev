const fs = require('fs');
const { parse } = require('csv-parse');
const ExcelJS = require('exceljs');
const httpStatus = require('http-status');
const ApiError = require('./ApiError');

/**
 * Validate file header
 * @param {Array} fileHeader
 * @returns {Promise<Array>} column order
 */
const handleFileColumnValidation = async (fileRows) => {
  const row = ['school_id', 'firstname', 'lastname', 'othername', 'staff_email', 'phone_number', 'position'];
  const fileHeader = fileRows.map((column) => column.toLowerCase().trim());

  row.forEach((column) => {
    if (!fileHeader.includes(column)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid column header. Column header must contain ${column}`);
    }
  });

  return fileHeader;
};

/**
 * Handle extraction of email from excel file
 * @param {Object} file
 * @returns {Promise<Array>}
 */
const handleExcelFile = async (file) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file.path);
  const worksheet = workbook.getWorksheet(1);

  // Validate excel file headers (optional)
  // const fileHeader = worksheet.getRow(1).values.splice(1);
  // await handleFileColumnValidation(fileHeader);

  const csvData = []; // Store CSV data as an array of strings
  // eslint-disable-next-line no-restricted-syntax
  for (const row of worksheet.rows) {
    const csvRow = row.values.map((value) => (value ? value.toString() : '')).join(','); // Handle empty values
    csvData.push(csvRow);
  }

  // Create a CSV string from the data array
  const csvContent = csvData.join('\n');

  return csvContent; // Return the converted CSV content
};

/**
 * Handle extraction of email from csv file
 * @param {Object} file
 * @returns {Promise<Array>}
 */
const handleCsvFile = async (file) => {
  return new Promise((resolve, reject) => {
    // Read the CSV file
    const readStream = fs.createReadStream(file.path);

    // Parse CSV data using csv-parse
    const csvParser = parse({
      delimiter: ',', // Adjust if your CSV uses a different delimiter
      columns: true, // Parse data into objects with column names as keys
      skip_empty_lines: true, // Skip empty lines
    });

    // Collect extracted data in an array
    const studentData = [];

    // Handle errors during parsing
    csvParser.on('error', (err) => {
      reject(err);
    });

    // Process each parsed CSV row
    csvParser.on('data', (row) => {
      studentData.push(row); // Add the parsed row object to the data array
    });

    // Resolve with extracted data when parsing finishes
    csvParser.on('end', () => {
      resolve(studentData);
    });

    // Optionally validate header row before parsing (if needed)
    csvParser.once('readable', async () => {
      const header = csvParser.read(); // Read the header row
      if (header) {
        try {
          await handleFileColumnValidation(Object.keys(header)); // Validate column names (if applicable)
        } catch (error) {
          csvParser.emit('error', error); // Re-emit error for handling by caller
        }
      }
    });

    // Pipe the read stream to the CSV parser
    readStream.pipe(csvParser);
  });
};

/**
 * Resolve emails and file
 * @param {Array} emails
 * @param {Object} file
 * @returns {Promise<Array>}
 */
const validateFile2 = async (file) => {
  // Handle file types and extract emails
  switch (file.mimetype) {
    case 'text/csv': {
      // Handle csv file
      await handleCsvFile(file);
      break;
    }
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
      // Handle excel file
      await handleExcelFile(file);
      break;
    }
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid file type');
  }

  // Call handleCsvFile to extract data
  const studentData = await handleCsvFile(file);

  return studentData; // Return the extracted student data
};

module.exports = validateFile2;
