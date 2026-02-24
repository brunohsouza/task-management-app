const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'A simple REST API for task management with validation',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-generated task ID',
              example: 1,
            },
            title: {
              type: 'string',
              description: 'The task title',
              example: 'Buy groceries',
            },
            completed: {
              type: 'boolean',
              description: 'Whether the task is completed',
              example: false,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;