const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
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
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// ================== MIDDLEWARE ==================

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Fix: Static folder setup using path.join
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================== SWAGGER DOCS ==================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Messbee API Documentation'
}));

// // ================== ROUTES ==================

// /**
//  * @swagger
//  * /health:
//  *   get:
//  *     summary: Health check endpoint
//  *     tags: [System]
//  *     responses:
//  *       200:
//  *         description: Server is running
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: OK
//  *                 message:
//  *                   type: string
//  *                   example: Server is running
//  */

// // Routes

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/automation', require('./routes/automationRoutes'));
app.use('/api/whatsapp', require('./routes/whatsappRoutes')); // WhatsApp Business API routes
app.use('/api/quick-replies', require('./routes/quickReplyRoutes'));

// ================== HEALTH CHECK ==================



app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log('=====================================');
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log('=====================================\n');
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  httpServer.close(() => process.exit(1));
});

module.exports = { app, io };
