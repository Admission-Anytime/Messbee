const swaggerJsdoc = require('swagger-jsdoc');

const devServerPort = process.env.PORT || 5001;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Messbee API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for Messbee messaging platform',
      contact: {
        name: 'Messbee Support',
        email: 'support@messbee.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: `http://localhost:${devServerPort}`,
        description: 'Development server'
      },
      {
        url: 'https://api.messbee.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            phone: {
              type: 'string',
              example: '+1234567890'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user'
            },
            company: {
              type: 'string',
              example: 'Acme Corp'
            },
            subscriptionPlan: {
              type: 'string',
              enum: ['free', 'basic', 'premium', 'enterprise'],
              example: 'free'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            name: {
              type: 'string',
              example: 'Jane Smith'
            },
            phone: {
              type: 'string',
              example: '+1234567890'
            },
            email: {
              type: 'string',
              example: 'jane@example.com'
            },
            company: {
              type: 'string',
              example: 'Tech Inc'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['vip', 'customer']
            },
            notes: {
              type: 'string'
            },
            isActive: {
              type: 'boolean',
              default: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Campaign: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            name: {
              type: 'string',
              example: 'Summer Sale Campaign'
            },
            description: {
              type: 'string'
            },
            messageTemplate: {
              type: 'string',
              example: 'Hi {{name}}, check out our summer sale!'
            },
            status: {
              type: 'string',
              enum: ['draft', 'scheduled', 'active', 'paused', 'completed']
            },
            scheduledDate: {
              type: 'string',
              format: 'date-time'
            },
            stats: {
              type: 'object',
              properties: {
                sent: { type: 'number' },
                delivered: { type: 'number' },
                read: { type: 'number' },
                replied: { type: 'number' },
                failed: { type: 'number' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            sender: {
              type: 'string',
              enum: ['user', 'contact']
            },
            content: {
              type: 'string',
              example: 'Hello, how are you?'
            },
            messageType: {
              type: 'string',
              enum: ['text', 'image', 'document', 'audio', 'video'],
              default: 'text'
            },
            status: {
              type: 'string',
              enum: ['sent', 'delivered', 'read', 'failed']
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Users',
        description: 'User profile management'
      },
      {
        name: 'Contacts',
        description: 'Contact management operations'
      },
      {
        name: 'Campaigns',
        description: 'Campaign management operations'
      },
      {
        name: 'Chat',
        description: 'Real-time messaging operations'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting'
      },
      {
        name: 'Automation',
        description: 'Automation workflow management'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
