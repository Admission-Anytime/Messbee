const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Resolve the effective upload directory.
 *
 * Rules:
 *  - On Linux/Mac: use UPLOAD_PATH as-is (absolute or relative).
 *  - On Windows dev: if UPLOAD_PATH is a Unix-style absolute path (starts with '/')
 *    it cannot exist locally, so fall back to ./uploads.
 *  - Always fall back to ./uploads if the configured path can't be created.
 */
const rawUploadPath = (process.env.UPLOAD_PATH || './uploads').replace(/[/\\]+$/, ''); // strip trailing slash

const isUnixAbsoluteOnWindows =
  process.platform === 'win32' && rawUploadPath.startsWith('/');

const uploadDir = isUnixAbsoluteOnWindows
  ? path.join(__dirname, '..', 'uploads') // local fallback on Windows dev
  : rawUploadPath;

// Ensure the directory exists (create if needed)
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn(`⚠️  Could not create upload directory "${uploadDir}": ${e.message}`);
}

if (isUnixAbsoluteOnWindows) {
  console.info(
    `ℹ️  UPLOAD_PATH "${rawUploadPath}" is a Unix path and cannot be used on Windows. ` +
    `Falling back to local: "${uploadDir}"`
  );
}

/**
 * Returns the full public URL for a stored file.
 *
 * In production (Linux), files land in UPLOAD_PATH which is the web-root of
 * documents.messbee.com, so DOCUMENT_GET_URL is the correct base.
 *
 * In local Windows dev the file is served from Express at /uploads/…
 */
const getPublicUrl = (filename) => {
  const configuredUrl = process.env.DOCUMENT_GET_URL;
  
  // We MUST return a public URL here because this function is used 
  // to provide media links to Meta (WhatsApp). Meta cannot reach 'localhost'.
  // The Frontend Dashboard already has logic to redirect these to localhost 
  // for the UI preview if needed.
  const baseUrl = configuredUrl 
    ? configuredUrl.replace(/\/$/, '') 
    : 'https://documents.messbee.com';
    
  return `${baseUrl}/${filename}`;
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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

  // Fallback: check by extension
  const allowedExts = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.mp4', '.mov', '.avi', '.3gp',
    '.mp3', '.ogg', '.wav', '.aac',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.csv', '.zip', '.rar'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    return cb(null, true);
  }

  cb(new Error(`File type not supported: ${file.mimetype} (${path.extname(file.originalname)})`));
};

// Configure multer — 25 MB limit to match UI
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter
});

module.exports = upload;
module.exports.getPublicUrl = getPublicUrl;
module.exports.uploadDir = uploadDir;
