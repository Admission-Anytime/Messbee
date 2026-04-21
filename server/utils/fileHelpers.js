const fs = require('fs');
const path = require('path');

/**
 * Delete file from filesystem
 */
exports.deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

/**
 * Check if file exists
 */
exports.fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

/**
 * Get file extension
 */
exports.getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Get file size in bytes
 */
exports.getFileSize = (filePath) => {
  const stats = fs.statSync(filePath);
  return stats.size;
};

/**
 * Format file size to human readable
 */
exports.formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
