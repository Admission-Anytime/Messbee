const Media = require('../models/Media');
const path = require('path');
const fs = require('fs');

// Helper: format bytes to human readable
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// @desc    Get all media for the logged-in user
// @route   GET /api/media
// @access  Private
exports.getMedia = async (req, res, next) => {
  try {
    const media = await Media.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: media.length,
      data: media
    });
  } catch (error) {
    console.error('getMedia error:', error);
    next(error);
  }
};

// @desc    Upload a media file
// @route   POST /api/media
// @access  Private
exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { filename, originalname, size, mimetype } = req.file;

    // Map mimetype to asset type
    let type = 'ARCHIVE';
    if (mimetype.startsWith('image/')) type = 'IMAGE';
    else if (mimetype.startsWith('video/')) type = 'VIDEO';
    else if (mimetype.startsWith('audio/')) type = 'AUDIO';
    else if (mimetype === 'application/pdf') type = 'PDF';

    const ext = path.extname(originalname).replace('.', '').toUpperCase() || 'BIN';

    // Build the public URL for this file
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/${filename}`;

    const media = await Media.create({
      name: originalname,
      filename: filename,
      url,
      size: formatBytes(size),
      ext,
      type,
      user: req.user.id,
      thumb: type === 'IMAGE' ? url : null,
    });

    res.status(201).json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('uploadMedia error:', error);
    next(error);
  }
};

// @desc    Delete a media asset
// @route   DELETE /api/media/:id
// @access  Private
exports.deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Make sure this media belongs to the requesting user
    if (media.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this media'
      });
    }

    // Delete file from filesystem
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.resolve(uploadDir, media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('deleteMedia error:', error);
    next(error);
  }
};

// @desc    Bulk delete media assets
// @route   POST /api/media/bulk-delete
// @access  Private
exports.bulkDeleteMedia = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of IDs'
      });
    }

    // Find only media that belongs to this user
    const mediaList = await Media.find({
      _id: { $in: ids },
      user: req.user.id
    });

    if (mediaList.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching media found'
      });
    }

    const uploadDir = process.env.UPLOAD_PATH || './uploads';

    // Delete files from filesystem
    mediaList.forEach(media => {
      const filePath = path.resolve(uploadDir, media.filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
    });

    await Media.deleteMany({
      _id: { $in: ids },
      user: req.user.id
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('bulkDeleteMedia error:', error);
    next(error);
  }
};
