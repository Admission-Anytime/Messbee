# Messbee Server

Backend server for Messbee messaging platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 👥 **Contact Management** - Create, update, delete, and import contacts
- 💬 **Real-time Chat** - Socket.io powered messaging with typing indicators
- 📢 **Campaign Management** - Create and manage messaging campaigns
- 📊 **Analytics** - Comprehensive analytics for messages, campaigns, and contacts
- 🤖 **Automation** - Create automated workflows and triggers
- 📁 **File Upload** - Support for images and documents
- 🔔 **Real-time Notifications** - Socket.io integration

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Real-time:** Socket.io
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **Validation:** Express-validator

## Project Structure

```
server/
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   └── socket.js        # Socket.io setup
├── controllers/         # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── contactController.js
│   ├── campaignController.js
│   ├── chatController.js
│   ├── analyticsController.js
│   └── automationController.js
├── middleware/          # Custom middleware
│   ├── auth.js          # Authentication & authorization
│   ├── errorHandler.js  # Global error handler
│   └── upload.js        # File upload config
├── models/              # Mongoose models
│   ├── User.js
│   ├── Contact.js
│   ├── Campaign.js
│   ├── Message.js
│   └── Automation.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── contactRoutes.js
│   ├── campaignRoutes.js
│   ├── chatRoutes.js
│   ├── analyticsRoutes.js
│   └── automationRoutes.js
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── server.js            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/messbee
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

4. Start the server:

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar
- `PUT /api/users/subscription` - Update subscription

### Contacts
- `GET /api/contacts` - Get all contacts (with filters)
- `POST /api/contacts` - Create contact
- `GET /api/contacts/:id` - Get single contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `POST /api/contacts/import` - Bulk import contacts

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get single campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `PUT /api/campaigns/:id/stats` - Update campaign stats

### Chat
- `GET /api/chats/conversations` - Get all conversations
- `GET /api/chats/:contactId/messages` - Get messages
- `POST /api/chats/:contactId/messages` - Send message
- `PUT /api/chats/:contactId/read` - Mark as read

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/messages` - Message analytics
- `GET /api/analytics/campaigns` - Campaign analytics

### Automation
- `GET /api/automation` - Get all automations
- `POST /api/automation` - Create automation
- `GET /api/automation/:id` - Get single automation
- `PUT /api/automation/:id` - Update automation
- `DELETE /api/automation/:id` - Delete automation
- `PUT /api/automation/:id/toggle` - Toggle automation status

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Stack trace (development only)"
}
```

## Socket.io Events

### Client -> Server
- `join` - Join user room
- `send-message` - Send a message
- `typing` - Typing indicator

### Server -> Client
- `receive-message` - Receive new message
- `user-typing` - User is typing
- `new-message` - New message notification

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC
