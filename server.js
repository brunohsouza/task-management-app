const express = require('express');
const taskRoutes = require('./src/routes/tasks');
const setupSwagger = require('./src/swagger');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// API Routes
app.use('/tasks', taskRoutes);

// Swagger documentation
setupSwagger(app);

/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check
 *     description: Returns API information and available endpoints
 *     tags:
 *       - General
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task Management API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 endpoints:
 *                   type: object
 */
// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Task Management API',
    version: '1.0.0',
    endpoints: {
      'GET /tasks': 'List all tasks (optional: ?completed=true/false)',
      'POST /tasks': 'Create a new task',
      'PATCH /tasks/:id': 'Mark task as completed',
      'DELETE /tasks/:id': 'Delete a task'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✓ Server is running on http://localhost:${PORT}`);
    console.log(`✓ API endpoints available at http://localhost:${PORT}/tasks`);
  });
}

// Export app for testing
module.exports = app;
