const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path'); // Added path module
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { createServer } = require('http');
const { initializeSocket } = require('./config/socket');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
  // One-time migration: ensure existing users have isApproved=true
  // (New users created after this will default to false and need admin approval)
  try {
    const mongoose = require('mongoose');
    const result = await mongoose.connection.db.collection('users').updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: true } }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ Migration: Set isApproved=true for ${result.modifiedCount} existing users`);
    }

    // Role Migration: Set missing tenantId users to ADMIN
    const roleResult = await mongoose.connection.db.collection('users').updateMany(
      { tenantId: { $exists: false } },
      { $set: { role: 'ADMIN' } }
    );
    if (roleResult.modifiedCount > 0) {
      console.log(`✅ Migration: Set role='ADMIN' for ${roleResult.modifiedCount} existing users`);
    }
  } catch (err) {
    console.error('Migration warning (non-fatal):', err.message);
  }
});

// Initialize automation delay queue worker
const { startDelayQueueWorker } = require('./queues/delayQueue');
startDelayQueueWorker();

const app = express();

// Only create HTTP server and Socket.IO in non-serverless environment
//  uses AWS Lambda which sets AWS_LAMBDA_FUNCTION_NAME
const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;
let httpServer;
let io;

if (!isServerless) {
  httpServer = createServer(app);
  io = initializeSocket(httpServer);
} else {
  // In serverless, just use app directly
  httpServer = null;
  io = null;
}

// ================== MIDDLEWARE ==================

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isLocalhost =
      origin.startsWith('http://localhost:') ||
      origin.startsWith('https://localhost:') ||
      origin.startsWith('http://127.0.0.1:');

    const isMessbee =
      origin === 'https://messbee.com' ||
      origin.endsWith('.messbee.com');

    const isVercel = origin.endsWith('.vercel.app');

    if (isLocalhost || isMessbee || isVercel) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({ extended: true }));

// Handle OPTIONS method for all routes (CORS preflight)
app.options('*', cors(corsOptions));

// No global rate limit as per user request

// Middleware to handle trailing slashes - strip them from URLs
app.use((req, res, next) => {
  if (req.path !== '/' && req.path.endsWith('/')) {
    req.url = req.url.slice(0, -1);
  }
  next();
});

// Static file serving — always mount the local uploads folder so dev works out of the box.
// In production, the web server (nginx/apache) serves files from UPLOAD_PATH via DOCUMENT_GET_URL.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================== SWAGGER DOCS ==================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Messbee API Documentation'
}));

// ================== ROUTES ==================

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 */

// Routes

app.use('/api/auth', require('./routes/authRoutes')); // Authentication routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/automation', require('./routes/automationRoutes'));
app.use('/api/whatsapp', require('./routes/whatsappRoutes')); // WhatsApp Business API routes
app.use('/api/quick-replies', require('./routes/quickReplyRoutes'));
app.use('/api/custom-fields', require('./routes/customFieldRoutes'));
app.use('/api/labels', require('./routes/labelRoutes'));
app.use('/api/statuses', require('./routes/statusRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/tenant-settings', require('./routes/tenantSettingsRoutes'));
app.use('/api/commerce', require('./routes/commerceRoutes'));
app.use('/api/dev', require('./routes/devApiRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes')); // Notification routes
app.use('/api/performance', require('./routes/performanceRoutes')); // Dashboard Performance Overview
app.use('/api/webhook', require('./routes/webhookRoutes')); // Webhook routes

// ================== INVENTORY & BILLING ROUTES ==================
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/reports', require('./routes/reportsRoutes'));

// ================== HEALTH CHECK ==================



app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start server if not in serverless environment
if (!isServerless && httpServer) {

  let _retries = 3;

  const startServer = () => {
    httpServer.listen(PORT, () => {
      console.log('=====================================');
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
      console.log('=====================================\n');
    });
  };

  // ── Handle port already in use — auto-retry ───────────────────────────────
  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && _retries > 0) {
      _retries--;
      console.warn(`⚠️  Port ${PORT} in use. Retrying in 1s… (${_retries} attempt(s) left)`);
      httpServer.close();
      setTimeout(startServer, 1000);
    } else {
      console.error(`❌ Server error: ${err.message}`);
      process.exit(1);
    }
  });

  // ── Graceful shutdown so port is released cleanly on nodemon restart ──────
  const shutdown = (signal) => {
    console.log(`\n🛑 ${signal} — shutting down gracefully…`);
    httpServer.close(() => {
      console.log('✅ Port released. Bye!');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    httpServer.close(() => process.exit(1));
  });

  startServer();
}

// Export app for  serverless
module.exports = app;
