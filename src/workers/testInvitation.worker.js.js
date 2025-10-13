const fs = require('fs');
const { parentPort } = require('worker_threads');
const { parse } = require('csv-parse');
const ExcelJS = require('exceljs');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../services/email.service');
const { getMessageTemplateById, convertTemplateToMessage } = require('../services/message_template.service');
const { db } = require('../models');

/* TODO: 
 1. Confirm if this is the best way to handle worker threads
 2. Would it be a good idea to allow the user to set password or will it be handled on the BE
*/

/**
 * Handle data extraction from file rows
 * @param {Array} fileRows
 * @param {Array} columnOrder
 * @returns
 */
const getDataFromFileRows = async (fileRow) => {
  return {
    firstname: fileRow.firstname,
    lastname: fileRow.lastname,
    othername: fileRow.othername,
    parent_email: fileRow.parent_email,
    parent_name: fileRow.parent_name,
    parent_phone_numbers: fileRow.parent_phone_numbers,
    student_school_id: fileRow.student_school_id,
  };
};

/**
 * Handle extraction of email from excel file
 * @param {Object} file
 * @returns {Promise<Array>}
 */
const handleExcelFile = async (file) => {
  const workbook = new ExcelJS.Workbook();
  return workbook.xlsx.readFile(file.path).then(async () => {
    const userDetails = [];
    const worksheet = workbook.getWorksheet(1);
    const fileHeader = worksheet.getRow(1).values.splice(1);

    worksheet.eachRow({ includeEmpty: false, skip: 1 }, async (row, rowNum) => {
      if (rowNum === 1) return;
      const record = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        record[fileHeader[colNumber - 1]] = cell.value;
      });
      const user = await getDataFromFileRows(record);
      userDetails.push(user);
    });
    return userDetails;
  });
};

/**
 * Handle extraction of email from csv file
 * @param {Object} file
 * @returns {Promise<Array>}
 */
const handleCsvFile = async (file) => {
  const userDetails = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(file.path)
      .pipe(
        parse({
          delimiter: ',',
          columns: true,
          skip_empty_lines: true,
        })
      )
      .on('data', async function (row) {
        const user = await getDataFromFileRows(row);
        userDetails.push(user);
      })
      .on('end', function () {
        resolve(userDetails);
      })
      .on('error', function (err) {
        reject(err);
      });
  });
};

/**
 * Resolve emails and file
 * @param {Array} emails
 * @param {Object} file
 * @returns {Promise<Array>}
 */
const getUserDetailsFromFile = async (file) => {
  let userDetails = [];

  // Handle file types and extract emails
  switch (file.mimetype) {
    case 'text/csv': {
      // Handle csv file - extract emails from csv file
      const csvEmails = await handleCsvFile(file);
      userDetails = [...csvEmails];
      break;
    }
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
      // Handle excel file - extract emails from excel file
      const userInfo = await handleExcelFile(file);
      userDetails = [...userInfo];
      break;
    }
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid file type');
  }

  return userDetails;
};

/**
 * Find or create new users
 * @param {Array} userDetails
 * @param {String} userDetails.email
 * @param {String} userDetails.firstName
 * @param {String} userDetails.lastName
 * @param {String} userDetails.password
 * @returns {Promise<Array>}
 */
const findOrCreateUsers = async (userDetails) => {
  const users = [];
  await Promise.all(
    userDetails.map(async ({ email, firstName, lastName }) => {
      const [user] = await db.user.findOrCreate({
        where: { email },
        defaults: {
          firstName,
          lastName,
          password: bcrypt.hashSync('password1', 8),
        },
      });
      users.push(user);
    })
  );
  return users;
};

/**
 * Send email invitation
 * @param {string} email
 * @param {string} firstName
 * @param {string} code
 * @param {number} messageId
 */
const sendTestInvitationEmail = async (email, firstName, code, messageId) => {
  const {
    dataValues: { emailSubject, emailBody },
  } = await getMessageTemplateById(messageId);

  const text = await convertTemplateToMessage(emailBody, {
    firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    code,
  });

  // Send email
  await sendEmail(email, emailSubject, text);
};

/**
 * Create test invitation
 * @param {Array} users
 * @param {Number} testId
 * @param {Number} examinerId
 * @param {Number} messageId
 * @param {Number} expiresIn
 * @param {String} expireType
 * @returns {Promise<Array>}
 */
const sendTestInvitations = async (users, testId, examinerId, messageId, expiresIn, expireType) => {
  // buld test invitation body for bulk creation
  const testInvitations = await Promise.all(
    users.map((user) => {
      return {
        testId,
        senderId: examinerId,
        messageId,
        receiverId: user.dataValues.id,
        expiresIn,
        expireType,
        code: nanoid(),
      };
    })
  );

  // Bulk Create test invitations records
  const invites = await db.testInvitation.bulkCreate(testInvitations);

  // Send test invitation emails
  invites.forEach((invite) => {
    const { code, receiverId } = invite.dataValues;
    const { email, firstName } = users.find((user) => user.dataValues.id === receiverId).dataValues;

    // Send email
    sendTestInvitationEmail(email, firstName, code, messageId);
  });

  return invites;
};

const createInvitation = async (data) => {
  let userDetails = [];
  const {
    file,
    testInvitationBody: { testId, messageId, expiresIn, expireType },
    examinerId,
  } = data;

  if (file) {
    // Resolve emails and file
    const userInfo = await getUserDetailsFromFile(file);
    userDetails = [...userInfo];
  }

  // Find or create new accounts for each email
  const users = await findOrCreateUsers(userDetails);

  // Create record and send invitation to each user
  await sendTestInvitations(users, testId, examinerId, messageId, expiresIn, expireType);
};

parentPort.on('message', async (data) => {
  await createInvitation(data);
});
