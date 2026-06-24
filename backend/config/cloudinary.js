const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const mimeType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype);
    const extension = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(
      path.extname(file.originalname || '').toLowerCase()
    );

    if (mimeType && extension) {
      cb(null, true);
      return;
    }

    cb(new Error('Only JPG, PNG, WEBP, and GIF image files are allowed'));
  },
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const mimeType = file.mimetype === 'application/pdf';
    const extension = path.extname(file.originalname || '').toLowerCase() === '.pdf';

    if (mimeType && extension) {
      cb(null, true);
      return;
    }

    cb(new Error('Only PDF files are allowed for report uploads'));
  },
});

const uploadBufferToCloudinary = ({
  buffer,
  folder,
  resourceType = 'image',
  type = 'upload',
  publicId,
  format,
  overwrite = false,
  useFilename = false,
  uniqueFilename = true,
}) => new Promise((resolve, reject) => {
  const options = {
    folder,
    resource_type: resourceType,
    type,
    overwrite,
    use_filename: useFilename,
    unique_filename: uniqueFilename,
  };

  if (publicId) options.public_id = publicId;
  if (format) options.format = format;

  const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(result);
  });

  uploadStream.end(buffer);
});

const deleteFromCloudinary = async ({
  publicId,
  resourceType = 'image',
  type = 'upload',
}) => {
  if (!publicId) return null;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type,
  });
};

module.exports = { cloudinary, upload, pdfUpload, uploadBufferToCloudinary, deleteFromCloudinary };
