const swaggerJsdoc = require('swagger-jsdoc');

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
        url: process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      },
      {
        url: process.env.PRODUCTION_API_URL || 'https://webservices.messbee.com',
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
        },
        Automation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Welcome Flow' },
            nodes: { type: 'array' },
            edges: { type: 'array' },
            channelId: { type: 'string' },
            tenantId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
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
    ],
    paths: {
      '/api/automations': {
        get: {
          summary: 'Get all automations',
          tags: ['Automation'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of automations with stats' }
          }
        },
        post: {
          summary: 'Create a new automation',
          tags: ['Automation'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Automation' }
              }
            }
          },
          responses: {
            201: { description: 'Created automation successfully' }
          }
        }
      },
      '/api/automations/activity': {
        get: {
          summary: 'Get activity log for automations',
          tags: ['Automation'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Activity log of customer sessions' }
          }
        }
      },
      '/api/automations/{id}/test': {
        post: {
          summary: 'Test an automation workflow',
          tags: ['Automation'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Automation ID' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { phoneNumber: { type: 'string', description: 'Phone number to test the automation with' } }
                }
              }
            }
          },
          responses: { 200: { description: 'Test triggered successfully' } }
        }
      },
      '/api/automations/{id}/simulate/start': {
        post: {
          summary: 'Start a simulation for an automation',
          tags: ['Automation'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Automation ID' }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { simulatorPhone: { type: 'string' } }
                }
              }
            }
          },
          responses: { 200: { description: 'Simulation started' } }
        }
      },
      '/api/automations/{id}/simulate/message': {
        post: {
          summary: 'Send a simulated message',
          tags: ['Automation'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Automation ID' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    channelId: { type: 'string' },
                    simulatorPhone: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Simulated message sent' } }
        }
      },
      '/api/automations/{id}': {
        get: {
          summary: 'Get automation by ID',
          tags: ['Automation'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Automation ID' }],
          responses: { 200: { description: 'Automation details' } }
        },
        put: {
          summary: 'Update an automation',
          tags: ['Automation'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Automation ID' }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Automation' }
              }
            }
          },
          responses: { 200: { description: 'Updated automation' } }
        },
        delete: {
          summary: 'Delete an automation',
          tags: ['Automation'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Automation ID' }],
          responses: { 200: { description: 'Automation deleted' } }
        }
      },
      '/api/users': {
        get: {
          summary: 'Get all users (Admin only)',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new user (Admin only)',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'admin'] }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'User created successfully' }
          }
        }
      },
      '/api/users/bulk-delete': {
        post: {
          summary: 'Delete multiple users at once',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userIds'],
                  properties: {
                    userIds: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Users deleted successfully' }
          }
        }
      },
      '/api/users/account-limits': {
        get: {
          summary: 'Get current user account usage and limits',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Account limits and usage data' }
          }
        }
      },
      '/api/users/pending-approval': {
        get: {
          summary: 'Get list of users pending admin approval',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of pending users' }
          }
        }
      },
      '/api/users/{id}/approve': {
        put: {
          summary: 'Approve a pending user account',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' }],
          responses: {
            200: { description: 'User approved successfully' }
          }
        }
      },
      '/api/users/{id}': {
        put: {
          summary: 'Update a specific user (Admin)',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'User updated successfully' }
          }
        },
        delete: {
          summary: 'Delete a user',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' }],
          responses: {
            200: { description: 'User deleted successfully' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
