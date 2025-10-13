const cloudinary = require('cloudinary').v2;
const config = require('./config');

cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.CLOUDINARY_API_KEY,
  api_secret: config.cloudinary.CLOUDINARY_API_SECRET,
});

exports.uploads = async (file) => {
  const { public_id: publicId, url } = await cloudinary.uploader.upload(file, {
    resource_type: 'auto',
    use_filename: true,
  });

  return {
    url,
    publicId,
  };
};

exports.deleteFile = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};
