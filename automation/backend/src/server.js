import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import logger from './config/logger.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import apiRoutes from './routes/api.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import './queues/delayQueue.js'; // Initialize the BullMQ Worker
import './cron/handoffReaper.js'; // Initialize Cron Jobs
import './cron/sequenceProcessor.js'; // Initialize Drip Campaign Processor

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per `window`
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, 
  legacyHeaders: false, 
});

// HTTP Request Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Body Parsing
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Static file serving for local uploads (fallback)
app.use('/uploads', express.static('uploads'));

// Routes
// We apply rate-limiting to Auth, API, and Uploads.
// CRITICAL: We EXCLUDE Webhooks from rate-limiting because Meta's servers send high volumes 
// of requests from a few shared IPs. Rate-limiting them would cause Meta to disable the webhook.
app.use('/api/auth', limiter, authRoutes);
app.use('/api', limiter, apiRoutes);
app.use('/api/upload', limiter, uploadRoutes);

// Webhook Route (No IP rate limit)
app.use('/api/webhooks', webhookRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'WhatsApp SaaS Backend is running' });
});

// Global Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Trigger nodemon restart
