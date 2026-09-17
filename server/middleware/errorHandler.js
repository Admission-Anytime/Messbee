const { logRequest } = require('../utils/apiLogger');

exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Log error to file — safe, non-fatal
  try {
    logRequest({
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: error.statusCode || 500,
      durationMs: '-',
      userId: req.user ? (req.user._id || req.user.id || null) : null,
      ip: req.ip || req.headers['x-forwarded-for'] || '-',
      errorMessage: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });
  } catch (_) {
    // Silent fail — logging never crashes the server
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { statusCode: 404, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { statusCode: 400, message };
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File size too large. Please upload an image less than 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { statusCode: 400, message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
