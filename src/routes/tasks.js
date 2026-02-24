const express = require('express');
const router = express.Router();
const TaskModel = require('../models/Task');
const { validateTaskCreation, validateTaskId } = require('../middleware/validation');

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: List all tasks
 *     description: Returns all tasks, optionally filtered by completion status
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         required: false
 *         description: Filter tasks by completion status
 *     responses:
 *       200:
 *         description: Array of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/', (req, res) => {
  const { completed } = req.query;

  // If completed query parameter is provided, filter tasks
  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    const filteredTasks = TaskModel.getByCompleted(isCompleted);
    return res.json(filteredTasks);
  }

  // Return all tasks if no filter
  res.json(TaskModel.getAll());
});

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     description: Creates a new task with the given title. Duplicate titles are not allowed.
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy groceries
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error (missing/empty title or duplicate title)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateTaskCreation, (req, res) => {
  const { title } = req.body;

  // Prevent duplicate titles
  if (TaskModel.titleExists(title)) {
    return res.status(400).json({
      error: 'A task with this title already exists'
    });
  }

  // Create new task
  const newTask = TaskModel.create(title);
  res.status(201).json(newTask);
});

/**
 * @openapi
 * /tasks/{id}/done:
 *   patch:
 *     summary: Mark a task as completed
 *     description: Marks the specified task as completed. This operation is idempotent.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid task ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', validateTaskId, (req, res) => {
  const task = TaskModel.markAsCompleted(req.taskId);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  res.json(task);
});

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Permanently deletes the specified task by ID.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task deleted successfully
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid task ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// DELETE /tasks/:id - Delete a task
router.delete('/:id', validateTaskId, (req, res) => {
  const task = TaskModel.delete(req.taskId);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  res.json({ message: 'Task deleted successfully', task });
});

module.exports = router;
