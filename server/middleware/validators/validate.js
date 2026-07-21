const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return the first error message to keep it clean, or format as an array
    const message = errors.array().map(err => err.msg).join(', ');
    return res.status(400).json({
      success: false,
      message
    });
  }
  next();
};
