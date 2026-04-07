const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + sanitizedFilename);
  }
});

// File filter for WhatsApp supported media types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    // Videos
    'video/mp4', 'video/3gpp', 'video/quicktime', 'video/x-msvideo', 'video/avi',
    // Audio
    'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg',
    'audio/wav', 'audio/webm',
    // Documents
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    // Archives
    'application/zip', 'application/x-zip-compressed',
    'application/x-rar-compressed', 'application/octet-stream'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  // Also allow by checking common extensions as a fallback
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.mp4', '.mov', '.avi', '.3gp',
    '.mp3', '.ogg', '.wav', '.aac',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.csv', '.zip', '.rar'];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    return cb(null, true);
  }

  cb(new Error(`File type not supported: ${file.mimetype} (${path.extname(file.originalname)})`));
};

// Configure multer — 25MB limit to match UI
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB (matches the UI)
  },
  fileFilter: fileFilter
});

module.exports = upload;
