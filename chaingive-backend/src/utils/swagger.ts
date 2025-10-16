import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChainGive Admin API',
      version: '1.0.0',
      description: 'Comprehensive admin API for ChainGive platform management',
      contact: {
        name: 'ChainGive Support',
        email: 'support@chaingive.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.chaingive.com/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            error: {
              type: 'string',
              example: 'ERROR_CODE',
            },
          },
        },
        AdminAction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            adminId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            action: {
              type: 'string',
              example: 'user_banned',
            },
            targetId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            details: {
              type: 'string',
              nullable: true,
              example: 'JSON string with action details',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        FeatureFlag: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            featureName: {
              type: 'string',
              example: 'gamification_system',
            },
            isEnabled: {
              type: 'boolean',
              example: true,
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Enable the gamification system',
            },
            updatedBy: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        SystemHealth: {
          type: 'object',
          properties: {
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            uptime: {
              type: 'number',
              example: 3600,
            },
            environment: {
              type: 'string',
              example: 'production',
            },
            version: {
              type: 'string',
              example: '1.0.0',
            },
            services: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['healthy', 'degraded', 'unhealthy'],
                      example: 'healthy',
                    },
                    responseTime: {
                      type: 'string',
                      example: '45ms',
                    },
                  },
                },
                redis: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['healthy', 'degraded', 'unhealthy'],
                      example: 'healthy',
                    },
                  },
                },
                email: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['healthy', 'degraded', 'unhealthy'],
                      example: 'healthy',
                    },
                  },
                },
                sms: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['healthy', 'degraded', 'unhealthy'],
                      example: 'healthy',
                    },
                  },
                },
              },
            },
            system: {
              type: 'object',
              properties: {
                memory: {
                  type: 'object',
                  properties: {
                    usagePercent: {
                      type: 'number',
                      example: 65,
                    },
                  },
                },
                cpu: {
                  type: 'object',
                  properties: {
                    usage: {
                      type: 'string',
                      example: '25%',
                    },
                  },
                },
                disk: {
                  type: 'object',
                  properties: {
                    usePercent: {
                      type: 'string',
                      example: '45%',
                    },
                  },
                },
              },
            },
            application: {
              type: 'object',
              properties: {
                activeConnections: {
                  type: 'number',
                  example: 1250,
                },
                pendingJobs: {
                  type: 'number',
                  example: 15,
                },
                errorRate: {
                  type: 'string',
                  example: '0.05%',
                },
              },
            },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            overview: {
              type: 'object',
              properties: {
                totalUsers: {
                  type: 'number',
                  example: 15420,
                },
                activeUsers: {
                  type: 'number',
                  example: 8920,
                },
                totalTransactions: {
                  type: 'number',
                  example: 45630,
                },
                totalVolume: {
                  type: 'number',
                  example: 2500000,
                },
                pendingEscrows: {
                  type: 'number',
                  example: 125,
                },
                completedCycles: {
                  type: 'number',
                  example: 890,
                },
                totalAgents: {
                  type: 'number',
                  example: 45,
                },
                totalCoinsInCirculation: {
                  type: 'number',
                  example: 500000,
                },
              },
            },
            today: {
              type: 'object',
              properties: {
                newUsers: {
                  type: 'number',
                  example: 25,
                },
                transactions: {
                  type: 'number',
                  example: 145,
                },
                volume: {
                  type: 'number',
                  example: 75000,
                },
              },
            },
            pending: {
              type: 'object',
              properties: {
                kycVerifications: {
                  type: 'number',
                  example: 12,
                },
                purchaseRequests: {
                  type: 'number',
                  example: 8,
                },
                disputes: {
                  type: 'number',
                  example: 3,
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };