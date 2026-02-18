const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
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
// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

 // Swagger fix: Prevent error if swaggerSpec is not a function

// /**
//  * @swagger
//  * /health:
//  * get:
//  * summary: Health check endpoint
//  * tags: [System]
//  * responses:
//  * 200:
//  * description: Server is running
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: OK
//  * message:
//  * type: string
//  * example: Server is running
//  */

// // Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/automation', require('./routes/automationRoutes'));
app.use('/api/quick-replies', require('./routes/quickReplyRoutes'));

// ✅ NEW: Status Route Added Here
app.use('/api/status', require('./routes/statusRoutes'));

// ================== HEALTH CHECK ==================

// For debugging: if any of these crash, it will be detected immediately

const safeUse = (path, modulePath) => {
    const module = require(modulePath);
    if (typeof module !== 'function') {
        console.error(`❌ ERROR: Module at ${modulePath} is NOT a function/router. Check module.exports!`);
    } else {
        app.use(path, module);
    }
};

try {
    safeUse('/api/auth', './routes/authRoutes');
    safeUse('/api/users', './routes/userRoutes');
    safeUse('/api/contacts', './routes/contactRoutes');
    safeUse('/api/campaigns', './routes/campaignRoutes');
    safeUse('/api/chats', './routes/chatRoutes');
    safeUse('/api/analytics', './routes/analyticsRoutes');
    safeUse('/api/automation', './routes/automationRoutes');
    safeUse('/api/quick-replies', './routes/quickReplyRoutes');
    safeUse('/api/labels', './routes/labelRoutes');
    safeUse('/api/custom-fields', './routes/customFieldRoutes');
  
} catch (err) {
    console.error("❌ Route Loading Error:", err.message);
}
//Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log('=====================================');
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log('=====================================\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  httpServer.close(() => process.exit(1));
});

module.exports = { app, io };