const { unlinkSync } = require('fs');
const logger = require('../config/logger');
const { uploads, deleteFile } = require('../config/cloudinary');
const { Media } = require('../models/media.model');

/**
 * Upload files
 * @param {Object} file
 * @returns {Promise<Object>}
 */
const uploadFile = async (file) => {
  if (!file) return null;
  logger.info('uploading file');

  // get file type
  const fileType = file.mimetype;
  logger.info('got file type');

  // upload file to cloudinary
  const { url, publicId } = await uploads(file.path);
  logger.info('uploaded file');

  // delete file from server
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  unlinkSync(file.path);
  logger.info('deleted file from server');

  // save file to database
  const media = await Media.create({ url, publicId, type: fileType });

  logger.info('returned file');
  return { url, media };
};

/**
 * Get file
 * @param {string} url
 * @returns {Promise<Object>}
 */
const getFile = async (url) => {
  return Media.findOne({ where: { url } });
};

/**
 * Delete file
 * @param {string} url
 * @returns {Promise<Object>}
 */
const deleteUploadedFile = async (url) => {
  const file = await getFile(url);
  if (!file) return;

  await deleteFile(file.dataValues.publicId);
  logger.info('deleted file from cloudinary');

  await file.destroy();
  logger.info('deleted file from database');
  return file;
};

module.exports = {
  uploadFile,
  deleteUploadedFile,
};
