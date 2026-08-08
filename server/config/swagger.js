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
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Electronics' },
            description: { type: 'string', example: 'Electronic items' },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Smartphone' },
            description: { type: 'string', example: 'A smart phone' },
            price: { type: 'number', example: 599.99 },
            category: { type: 'string', description: 'Category ID' },
            stock: { type: 'number', example: 100 },
            sku: { type: 'string', example: 'PHN-001' },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        InventoryLog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            product: { type: 'string', description: 'Product ID' },
            quantity: { type: 'number', example: 10 },
            type: { type: 'string', enum: ['in', 'out'], example: 'in' },
            reason: { type: 'string', example: 'Restock' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string', example: 'INR' },
            status: { type: 'string', enum: ['pending', 'success', 'failed'] },
            paymentMethod: { type: 'string', example: 'razorpay' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Sale: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            customer: { type: 'string', description: 'Customer ID' },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'completed'] },
            items: { type: 'array' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Purchase: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            supplier: { type: 'string', description: 'Supplier ID' },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'completed'] },
            items: { type: 'array' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Customer: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Acme Corp' },
            email: { type: 'string', example: 'contact@acme.com' },
            phone: { type: 'string' },
            address: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Chat: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            whatsappId: { type: 'string' },
            status: { type: 'string' },
            unread: { type: 'number' },
            lastMsg: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        MediaAsset: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            url: { type: 'string' },
            type: { type: 'string', enum: ['image', 'video', 'audio', 'document'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            read: { type: 'boolean', default: false },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Setting: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            key: { type: 'string' },
            value: { type: 'string' },
            description: { type: 'string' }
          }
        },
        TenantSetting: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            tenantId: { type: 'string' },
            settings: { type: 'object' }
          }
        },
        QuickReply: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            shortcut: { type: 'string' },
            message: { type: 'string' }
          }
        },
        DevApiKey: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            key: { type: 'string' },
            name: { type: 'string' }
          }
        },
        Supplier: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            isApproved: { type: 'boolean' },
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
      },
      {
        name: 'Categories',
        description: 'Category management'
      },
      {
        name: 'Products',
        description: 'Product management'
      },
      {
        name: 'Inventory',
        description: 'Inventory operations'
      },
      {
        name: 'Billing',
        description: 'Billing and transaction operations'
      },
      {
        name: 'Sales',
        description: 'Sales management operations'
      },
      {
        name: 'Purchases',
        description: 'Purchase management operations'
      },
      {
        name: 'Commerce',
        description: 'E-commerce operations'
      },
      {
        name: 'Customers',
        description: 'Customer management operations'
      },
      {
        name: 'Media',
        description: 'Media management operations'
      },
      {
        name: 'Notifications',
        description: 'System notifications'
      },
      {
        name: 'Performance',
        description: 'Performance metrics and configuration'
      },
      {
        name: 'Reports',
        description: 'Analytics and reports'
      },
      {
        name: 'Settings',
        description: 'System settings operations'
      },
      {
        name: 'Tenant Settings',
        description: 'Tenant specific settings'
      },
      {
        name: 'Quick Replies',
        description: 'Quick reply management'
      },
      {
        name: 'Webhooks',
        description: 'External webhook triggers'
      },
      {
        name: 'Developer API',
        description: 'Developer API keys and webhooks'
      },
      {
        name: 'Suppliers',
        description: 'Supplier management'
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
      },
      '/api/categories': {
        get: {
          summary: 'Get all categories',
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of categories' } }
        },
        post: {
          summary: 'Create a new category',
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          responses: { 201: { description: 'Category created' } }
        }
      },
      '/api/categories/{id}': {
        get: {
          summary: 'Get a single category',
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Category details' } }
        },
        put: {
          summary: 'Update a category',
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          responses: { 200: { description: 'Category updated' } }
        },
        delete: {
          summary: 'Delete a category',
          tags: ['Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Category deleted' } }
        }
      },
      '/api/products': {
        get: {
          summary: 'Get all products',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of products' } }
        },
        post: {
          summary: 'Create a new product',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          responses: { 201: { description: 'Product created' } }
        }
      },
      '/api/products/{id}': {
        get: {
          summary: 'Get a single product',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product details' } }
        },
        put: {
          summary: 'Update a product',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          responses: { 200: { description: 'Product updated' } }
        },
        delete: {
          summary: 'Delete a product',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product deleted' } }
        }
      },
      '/api/inventory/logs': {
        get: {
          summary: 'Get inventory logs',
          tags: ['Inventory'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of inventory logs' } }
        }
      },
      '/api/inventory/low-stock': {
        get: {
          summary: 'Get low stock alerts',
          tags: ['Inventory'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of low stock products' } }
        }
      },
      '/api/inventory/out-of-stock': {
        get: {
          summary: 'Get out of stock alerts',
          tags: ['Inventory'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of out of stock products' } }
        }
      },
      '/api/inventory/adjust': {
        post: {
          summary: 'Adjust product stock',
          tags: ['Inventory'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    productId: { type: 'string' },
                    quantity: { type: 'number' },
                    type: { type: 'string', enum: ['in', 'out'] },
                    reason: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Stock adjusted' } }
        }
      },
      '/api/billing/transactions': {
        get: {
          summary: 'Get all transactions',
          tags: ['Billing'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of transactions' } }
        },
        post: {
          summary: 'Create a transaction',
          tags: ['Billing'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Transaction' } } } },
          responses: { 201: { description: 'Transaction created' } }
        }
      },
      '/api/billing/razorpay/webhook': {
        post: {
          summary: 'Razorpay webhook',
          tags: ['Billing'],
          responses: { 200: { description: 'Webhook received' } }
        }
      },
      '/api/billing/razorpay/create-order': {
        post: {
          summary: 'Create Razorpay order',
          tags: ['Billing'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Order created' } }
        }
      },
      '/api/billing/razorpay/verify-payment': {
        post: {
          summary: 'Verify Razorpay payment',
          tags: ['Billing'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Payment verified' } }
        }
      },
      '/api/billing/razorpay/cross-verify': {
        post: {
          summary: 'Cross verify payment',
          tags: ['Billing'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Payment cross verified' } }
        }
      },
      '/api/billing/razorpay/order-status': {
        post: {
          summary: 'Get Razorpay order status',
          tags: ['Billing'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Order status' } }
        }
      },
      '/api/billing/razorpay/reconcile': {
        post: {
          summary: 'Reconcile payment',
          tags: ['Billing'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Payment reconciled' } }
        }
      },
      '/api/sales': {
        get: {
          summary: 'Get all sales',
          tags: ['Sales'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of sales' } }
        },
        post: {
          summary: 'Create a sale',
          tags: ['Sales'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Sale' } } } },
          responses: { 201: { description: 'Sale created' } }
        }
      },
      '/api/sales/{id}': {
        get: {
          summary: 'Get a single sale',
          tags: ['Sales'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Sale details' } }
        }
      },
      '/api/purchases/scan-invoice': {
        post: {
          summary: 'Scan an invoice',
          tags: ['Purchases'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: { type: 'object', properties: { invoice: { type: 'string', format: 'binary' } } }
              }
            }
          },
          responses: { 200: { description: 'Invoice scanned' } }
        }
      },
      '/api/purchases': {
        get: {
          summary: 'Get all purchases',
          tags: ['Purchases'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of purchases' } }
        },
        post: {
          summary: 'Create a purchase',
          tags: ['Purchases'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Purchase' } } } },
          responses: { 201: { description: 'Purchase created' } }
        }
      },
      '/api/purchases/{id}': {
        get: {
          summary: 'Get a single purchase',
          tags: ['Purchases'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Purchase details' } }
        }
      },
      '/api/commerce/products': {
        get: {
          summary: 'Get commerce products',
          tags: ['Commerce'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of commerce products' } }
        },
        post: {
          summary: 'Create commerce product',
          tags: ['Commerce'],
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Commerce product created' } }
        }
      },
      '/api/commerce/products/{id}': {
        put: {
          summary: 'Update commerce product',
          tags: ['Commerce'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product updated' } }
        },
        delete: {
          summary: 'Delete commerce product',
          tags: ['Commerce'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product deleted' } }
        }
      },
      '/api/commerce/payments': {
        get: {
          summary: 'Get commerce payments',
          tags: ['Commerce'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of payments' } }
        },
        post: {
          summary: 'Create commerce payment',
          tags: ['Commerce'],
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Payment created' } }
        }
      },
      '/api/chats': {
        get: {
          summary: 'Get all chats',
          tags: ['Chat'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of chats' } }
        },
        post: {
          summary: 'Create new chat',
          tags: ['Chat'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Chat' } } } },
          responses: { 201: { description: 'Chat created' } }
        }
      },
      '/api/chats/messages/{chatId}': {
        get: {
          summary: 'Get messages for a chat',
          tags: ['Chat'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'chatId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'List of messages' } }
        }
      },
      '/api/chats/message': {
        post: {
          summary: 'Send a message',
          tags: ['Chat'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          responses: { 200: { description: 'Message sent' } }
        }
      },
      '/api/chats/{chatId}/read': {
        put: {
          summary: 'Mark chat messages as read',
          tags: ['Chat'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'chatId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Messages marked as read' } }
        }
      },
      '/api/contacts': {
        get: {
          summary: 'Get all contacts',
          tags: ['Contacts'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of contacts' } }
        },
        post: {
          summary: 'Create a contact',
          tags: ['Contacts'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } },
          responses: { 201: { description: 'Contact created' } }
        }
      },
      '/api/contacts/bulk-delete': {
        delete: {
          summary: 'Bulk delete contacts',
          tags: ['Contacts'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Contacts deleted' } }
        }
      },
      '/api/contacts/bulk-status': {
        put: {
          summary: 'Bulk update contact status',
          tags: ['Contacts'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Status updated' } }
        }
      },
      '/api/contacts/bulk-labels': {
        put: {
          summary: 'Bulk add labels to contacts',
          tags: ['Contacts'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Labels added' } }
        }
      },
      '/api/contacts/import': {
        post: {
          summary: 'Import contacts from CSV',
          tags: ['Contacts'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } }
              }
            }
          },
          responses: { 200: { description: 'Contacts imported' } }
        }
      },
      '/api/contacts/{id}': {
        get: {
          summary: 'Get single contact',
          tags: ['Contacts'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Contact details' } }
        },
        put: {
          summary: 'Update contact',
          tags: ['Contacts'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } },
          responses: { 200: { description: 'Contact updated' } }
        },
        delete: {
          summary: 'Delete contact',
          tags: ['Contacts'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Contact deleted' } }
        }
      },
      '/api/customers': {
        get: {
          summary: 'Get all customers',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of customers' } }
        },
        post: {
          summary: 'Create a customer',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Customer' } } } },
          responses: { 201: { description: 'Customer created' } }
        }
      },
      '/api/customers/{id}': {
        get: {
          summary: 'Get single customer',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Customer details' } }
        },
        put: {
          summary: 'Update customer',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Customer' } } } },
          responses: { 200: { description: 'Customer updated' } }
        },
        delete: {
          summary: 'Delete customer',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Customer deleted' } }
        }
      },
      '/api/customers/{id}/sales': {
        get: {
          summary: 'Get customer sales',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'List of customer sales' } }
        }
      },
      '/api/media': {
        get: {
          summary: 'Get all media assets',
          tags: ['Media'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of media assets' } }
        },
        post: {
          summary: 'Upload media asset',
          tags: ['Media'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } }
              }
            }
          },
          responses: { 201: { description: 'Media uploaded' } }
        }
      },
      '/api/media/{id}': {
        delete: {
          summary: 'Delete media asset',
          tags: ['Media'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Media deleted' } }
        }
      },
      '/api/media/bulk-delete': {
        post: {
          summary: 'Bulk delete media',
          tags: ['Media'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Media deleted' } }
        }
      },
      '/api/notifications': {
        get: {
          summary: 'Get all notifications',
          tags: ['Notifications'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of notifications' } }
        }
      },
      '/api/notifications/unread-count': {
        get: {
          summary: 'Get unread notification count',
          tags: ['Notifications'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Unread count' } }
        }
      },
      '/api/notifications/mark-all-read': {
        put: {
          summary: 'Mark all notifications as read',
          tags: ['Notifications'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Notifications marked as read' } }
        }
      },
      '/api/notifications/{id}/read': {
        put: {
          summary: 'Mark single notification as read',
          tags: ['Notifications'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Notification marked as read' } }
        }
      },
      '/api/notifications/{id}': {
        delete: {
          summary: 'Delete notification',
          tags: ['Notifications'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Notification deleted' } }
        }
      },
      '/api/performance/overview': {
        get: {
          summary: 'Get performance overview',
          tags: ['Performance'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Performance overview' } }
        }
      },
      '/api/performance/waba-config': {
        get: {
          summary: 'Get WABA config',
          tags: ['Performance'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'WABA config' } }
        }
      },
      '/api/reports/dashboard': {
        get: {
          summary: 'Get dashboard stats',
          tags: ['Reports'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dashboard stats' } }
        }
      },
      '/api/reports/sales': {
        get: {
          summary: 'Get sales report',
          tags: ['Reports'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Sales report' } }
        }
      },
      '/api/reports/purchases': {
        get: {
          summary: 'Get purchases report',
          tags: ['Reports'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Purchases report' } }
        }
      },
      '/api/settings': {
        get: {
          summary: 'Get all settings',
          tags: ['Settings'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of settings' } }
        },
        post: {
          summary: 'Update or create setting',
          tags: ['Settings'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Setting' } } } },
          responses: { 200: { description: 'Setting updated' } }
        }
      },
      '/api/settings/{key}': {
        get: {
          summary: 'Get specific setting by key',
          tags: ['Settings'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'key', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Setting details' } }
        }
      },
      '/api/tenant-settings': {
        get: {
          summary: 'Get tenant settings',
          tags: ['Tenant Settings'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Tenant settings' } }
        },
        put: {
          summary: 'Update tenant settings',
          tags: ['Tenant Settings'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/TenantSetting' } } } },
          responses: { 200: { description: 'Tenant settings updated' } }
        }
      },
      '/api/quick-replies': {
        get: {
          summary: 'Get all quick replies',
          tags: ['Quick Replies'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of quick replies' } }
        },
        post: {
          summary: 'Create quick reply',
          tags: ['Quick Replies'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } }
              }
            }
          },
          responses: { 201: { description: 'Quick reply created' } }
        }
      },
      '/api/quick-replies/{id}': {
        put: {
          summary: 'Update quick reply',
          tags: ['Quick Replies'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } }
              }
            }
          },
          responses: { 200: { description: 'Quick reply updated' } }
        },
        delete: {
          summary: 'Delete quick reply',
          tags: ['Quick Replies'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Quick reply deleted' } }
        }
      },
      '/api/webhook/event': {
        post: {
          summary: 'Handle external API event trigger',
          tags: ['Webhooks'],
          responses: { 200: { description: 'Event handled' } }
        }
      },
      '/api/dev/keys': {
        get: {
          summary: 'Get API keys',
          tags: ['Developer API'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of API keys' } }
        },
        post: {
          summary: 'Create API key',
          tags: ['Developer API'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/DevApiKey' } } } },
          responses: { 201: { description: 'API key created' } }
        }
      },
      '/api/dev/keys/{id}': {
        delete: {
          summary: 'Delete API key',
          tags: ['Developer API'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'API key deleted' } }
        }
      },
      '/api/dev/webhook': {
        get: {
          summary: 'Get webhook config',
          tags: ['Developer API'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Webhook config' } }
        },
        post: {
          summary: 'Save webhook config',
          tags: ['Developer API'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Webhook config saved' } }
        }
      },
      '/api/dev/webhook/events/{eventId}': {
        patch: {
          summary: 'Toggle webhook event',
          tags: ['Developer API'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'eventId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Webhook event toggled' } }
        }
      },
      '/api/suppliers': {
        get: {
          summary: 'Get all suppliers',
          tags: ['Suppliers'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of suppliers' } }
        },
        post: {
          summary: 'Create a supplier',
          tags: ['Suppliers'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Supplier' } } } },
          responses: { 201: { description: 'Supplier created' } }
        }
      },
      '/api/suppliers/{id}': {
        get: {
          summary: 'Get single supplier',
          tags: ['Suppliers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Supplier details' } }
        },
        put: {
          summary: 'Update supplier',
          tags: ['Suppliers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Supplier' } } } },
          responses: { 200: { description: 'Supplier updated' } }
        },
        delete: {
          summary: 'Delete supplier',
          tags: ['Suppliers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Supplier deleted' } }
        }
      },
      '/api/suppliers/{id}/purchases': {
        get: {
          summary: 'Get supplier purchases',
          tags: ['Suppliers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'List of supplier purchases' } }
        }
      },
      '/api/users': {
        get: {
          summary: 'Get all users',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of users' } }
        },
        post: {
          summary: 'Create a new user',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          responses: { 201: { description: 'User created' } }
        }
      },
      '/api/users/bulk-delete': {
        post: {
          summary: 'Bulk delete users',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Users deleted' } }
        }
      },
      '/api/users/account-limits': {
        get: {
          summary: 'Get account limits',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Account limits' } }
        }
      },
      '/api/users/pending-approval': {
        get: {
          summary: 'Get pending users',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of pending users' } }
        }
      },
      '/api/users/{id}/approve': {
        put: {
          summary: 'Approve user',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'User approved' } }
        }
      },
      '/api/users/profile': {
        get: {
          summary: 'Get profile',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'User profile' } }
        },
        put: {
          summary: 'Update profile',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          responses: { 200: { description: 'Profile updated' } }
        }
      },
      '/api/users/avatar': {
        post: {
          summary: 'Upload avatar',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } } }
              }
            }
          },
          responses: { 200: { description: 'Avatar uploaded' } }
        }
      },
      '/api/users/subscription': {
        put: {
          summary: 'Update subscription',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Subscription updated' } }
        }
      },
      '/api/users/{id}': {
        put: {
          summary: 'Update user',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          responses: { 200: { description: 'User updated' } }
        },
        delete: {
          summary: 'Delete user',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'User deleted' } }
        }
      }
    }
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
