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
connectDB();

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
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      process.env.CLIENT_URL
    ].filter(Boolean);

    // Allow any subdomain or explicitly allowed origins
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
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

// Middleware to handle trailing slashes - strip them from URLs
app.use((req, res, next) => {
  if (req.path !== '/' && req.path.endsWith('/')) {
    req.url = req.url.slice(0, -1);
  }
  next();
});

// ✅ Fix: Static folder setup using path.join
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
