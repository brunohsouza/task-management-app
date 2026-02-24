const request = require('supertest');
const app = require('../server');
const TaskModel = require('../src/models/Task');

describe('Task Management API', () => {
  // Reset task storage before each test
  beforeEach(() => {
    TaskModel.tasks = [];
    TaskModel.nextId = 1;
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Task Management API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task with valid title', async () => {
      const newTask = { title: 'Buy milk' };

      const response = await request(app)
        .post('/tasks')
        .send(newTask)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('title', 'Buy milk');
      expect(response.body).toHaveProperty('completed', false);
    });

    it('should reject task with empty title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: '' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Title is required');
    });

    it('should reject task with whitespace-only title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: '   ' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject task without title field', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject task with non-string title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 123 })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should prevent duplicate titles', async () => {
      const task = { title: 'Buy milk' };

      // Create first task
      await request(app)
        .post('/tasks')
        .send(task)
        .set('Content-Type', 'application/json');

      // Try to create duplicate
      const response = await request(app)
        .post('/tasks')
        .send(task)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should auto-increment task IDs', async () => {
      const response1 = await request(app)
        .post('/tasks')
        .send({ title: 'Task 1' })
        .set('Content-Type', 'application/json');

      const response2 = await request(app)
        .post('/tasks')
        .send({ title: 'Task 2' })
        .set('Content-Type', 'application/json');

      expect(response1.body.id).toBe(1);
      expect(response2.body.id).toBe(2);
    });
  });

  describe('GET /tasks', () => {
    beforeEach(async () => {
      // Create some test tasks
      await request(app)
        .post('/tasks')
        .send({ title: 'Task 1' });

      await request(app)
        .post('/tasks')
        .send({ title: 'Task 2' });

      // Mark first task as completed
      await request(app).patch('/tasks/1');
    });

    it('should return all tasks', async () => {
      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should filter completed tasks', async () => {
      const response = await request(app).get('/tasks?completed=true');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('completed', true);
      expect(response.body[0]).toHaveProperty('title', 'Task 1');
    });

    it('should filter incomplete tasks', async () => {
      const response = await request(app).get('/tasks?completed=false');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('completed', false);
      expect(response.body[0]).toHaveProperty('title', 'Task 2');
    });

    it('should return empty array when no tasks exist', async () => {
      TaskModel.tasks = [];

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('PATCH /tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task
      await request(app)
        .post('/tasks')
        .send({ title: 'Task to complete' });
    });

    it('should mark task as completed', async () => {
      const response = await request(app).patch('/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('completed', true);
      expect(response.body).toHaveProperty('title', 'Task to complete');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).patch('/tasks/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid task ID', async () => {
      const response = await request(app).patch('/tasks/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid task ID');
    });

    it('should keep task completed after multiple patches', async () => {
      // Mark as completed twice
      await request(app).patch('/tasks/1');
      const response = await request(app).patch('/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('completed', true);
    });
  });

  describe('DELETE /tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task
      await request(app)
        .post('/tasks')
        .send({ title: 'Task to delete' });
    });

    it('should delete an existing task', async () => {
      const response = await request(app).delete('/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Task deleted successfully');
      expect(response.body).toHaveProperty('task');
      expect(response.body.task).toHaveProperty('id', 1);
      expect(response.body.task).toHaveProperty('title', 'Task to delete');
    });

    it('should remove the task from the list after deletion', async () => {
      await request(app).delete('/tasks/1');

      const response = await request(app).get('/tasks');
      expect(response.body).toHaveLength(0);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).delete('/tasks/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 404 when deleting the same task twice', async () => {
      await request(app).delete('/tasks/1');
      const response = await request(app).delete('/tasks/1');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid task ID', async () => {
      const response = await request(app).delete('/tasks/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid task ID');
    });

    it('should not affect other tasks when deleting one', async () => {
      // Create additional tasks
      await request(app).post('/tasks').send({ title: 'Task 2' });
      await request(app).post('/tasks').send({ title: 'Task 3' });

      // Delete the middle task
      await request(app).delete('/tasks/2');

      const response = await request(app).get('/tasks');
      expect(response.body).toHaveLength(2);
      expect(response.body.map(t => t.id)).toEqual([1, 3]);
    });
  });

  describe('404 Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app).get('/unknown-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete task lifecycle', async () => {
      // Create task
      const createResponse = await request(app)
        .post('/tasks')
        .send({ title: 'Lifecycle test' });

      expect(createResponse.status).toBe(201);
      const taskId = createResponse.body.id;

      // Verify task is incomplete
      let listResponse = await request(app).get('/tasks?completed=false');
      expect(listResponse.body.find(t => t.id === taskId)).toBeDefined();

      // Mark as completed
      const patchResponse = await request(app).patch(`/tasks/${taskId}`);
      expect(patchResponse.status).toBe(200);
      expect(patchResponse.body.completed).toBe(true);

      // Verify task is completed
      listResponse = await request(app).get('/tasks?completed=true');
      expect(listResponse.body.find(t => t.id === taskId)).toBeDefined();

      // Verify task is not in incomplete list
      listResponse = await request(app).get('/tasks?completed=false');
      expect(listResponse.body.find(t => t.id === taskId)).toBeUndefined();
    });

    it('should handle multiple tasks correctly', async () => {
      const tasks = ['Task A', 'Task B', 'Task C'];

      // Create multiple tasks
      for (const title of tasks) {
        await request(app)
          .post('/tasks')
          .send({ title });
      }

      // Get all tasks
      const response = await request(app).get('/tasks');
      expect(response.body).toHaveLength(3);

      // Mark some as completed
      await request(app).patch('/tasks/1');
      await request(app).patch('/tasks/3');

      // Check filtered results
      const completedResponse = await request(app).get('/tasks?completed=true');
      const incompleteResponse = await request(app).get('/tasks?completed=false');

      expect(completedResponse.body).toHaveLength(2);
      expect(incompleteResponse.body).toHaveLength(1);
      expect(incompleteResponse.body[0].title).toBe('Task B');
    });

    it('should handle create, complete, delete lifecycle', async () => {
      // Create a task
      const createResponse = await request(app)
        .post('/tasks')
        .send({ title: 'Lifecycle delete test' });
      expect(createResponse.status).toBe(201);
      const taskId = createResponse.body.id;

      // Mark as completed
      const patchResponse = await request(app).patch(`/tasks/${taskId}`);
      expect(patchResponse.status).toBe(200);
      expect(patchResponse.body.completed).toBe(true);

      // Delete the task
      const deleteResponse = await request(app).delete(`/tasks/${taskId}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.task.completed).toBe(true);

      // Verify task is gone
      const listResponse = await request(app).get('/tasks');
      expect(listResponse.body.find(t => t.id === taskId)).toBeUndefined();
    });
  });
});
