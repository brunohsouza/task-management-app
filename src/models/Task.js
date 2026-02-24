// Task data model and storage
class TaskModel {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  // Get all tasks
  getAll() {
    return this.tasks;
  }

  // Get tasks filtered by completed status
  getByCompleted(isCompleted) {
    return this.tasks.filter(task => task.completed === isCompleted);
  }

  // Get task by ID
  getById(id) {
    return this.tasks.find(task => task.id === id);
  }

  // Check if title already exists
  titleExists(title) {
    return this.tasks.some(task => task.title === title);
  }

  // Create new task
  create(title) {
    const newTask = {
      id: this.nextId++,
      title: title,
      completed: false
    };
    this.tasks.push(newTask);
    return newTask;
  }

  // Update task completed status
  markAsCompleted(id) {
    const task = this.getById(id);
    if (task) {
      task.completed = true;
    }
    return task;
  }

  // Delete task by ID
  delete(id) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) {
      return null;
    }
    const [deleted] = this.tasks.splice(index, 1);
    return deleted;
  }
}

// Export singleton instance
module.exports = new TaskModel();
