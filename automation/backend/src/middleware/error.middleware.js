import logger from '../config/logger.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error
  logger.error(err.message, { stack: err.stack, url: req.originalUrl, method: req.method, ip: req.ip });

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack, // Hide stack in production
  });
};
