// Validation middleware for task operations

// Validate task creation
const validateTaskCreation = (req, res, next) => {
  const { title } = req.body;

  // Check if title exists and is a non-empty string
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Title is required and must be a non-empty string'
    });
  }

  next();
};

// Validate task ID parameter
const validateTaskId = (req, res, next) => {
  const taskId = parseInt(req.params.id);

  if (isNaN(taskId) || taskId < 1) {
    return res.status(400).json({
      error: 'Invalid task ID'
    });
  }

  req.taskId = taskId;
  next();
};

module.exports = {
  validateTaskCreation,
  validateTaskId
};
