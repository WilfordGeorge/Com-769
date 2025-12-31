const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const dirs = [
    uploadDir,
    path.join(uploadDir, 'photos'),
    path.join(uploadDir, 'thumbnails'),
  ];

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

ensureUploadDirs();

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'photos');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,image/webp').split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  },
});

// Middleware to create thumbnail after upload
const createThumbnail = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const thumbnailDir = path.join(process.env.UPLOAD_DIR || './uploads', 'thumbnails');
    const thumbnailFilename = `thumb_${path.basename(req.file.filename)}`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

    // Create thumbnail using sharp
    const metadata = await sharp(req.file.path)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(thumbnailPath);

    // Get original image dimensions
    const imageMetadata = await sharp(req.file.path).metadata();

    // Add thumbnail info to request
    req.file.thumbnailPath = thumbnailPath;
    req.file.width = imageMetadata.width;
    req.file.height = imageMetadata.height;

    next();
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    // Continue even if thumbnail creation fails
    next();
  }
};

// Export multer upload middleware
const uploadSingle = upload.single('photo');

// Combined middleware
const uploadPhoto = [
  uploadSingle,
  createThumbnail,
];

module.exports = {
  uploadPhoto,
};
