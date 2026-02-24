# Task Management REST API

A simple REST API for managing tasks with validation, built with Express.js.

## Project Structure

```
Task-Management-App/
├── server.js              # Main application entry point
├── src/
│   ├── models/
│   │   └── Task.js        # Task data model and storage
│   ├── routes/
│   │   └── tasks.js       # Task route handlers
│   └── middleware/
│       └── validation.js  # Request validation middleware
├── package.json
└── README.md
```

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Create a Task
- **POST** `/tasks`
- **Request Body:**
  ```json
  {
    "title": "Buy milk"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "id": 1,
    "title": "Buy milk",
    "completed": false
  }
  ```

### 2. List All Tasks
- **GET** `/tasks`
- **Response:** `200 OK`
  ```json
  [
    {
      "id": 1,
      "title": "Buy milk",
      "completed": false
    }
  ]
  ```

### 3. Filter Tasks by Completion Status
- **GET** `/tasks?completed=true`
- **GET** `/tasks?completed=false`

### 4. Mark Task as Completed
- **PATCH** `/tasks/:id`
- **Response:** `200 OK`
  ```json
  {
    "id": 1,
    "title": "Buy milk",
    "completed": true
  }
  ```

## Validation Rules

- **Title**: Required, must be a non-empty string
- **Duplicate Prevention**: Titles must be unique
- **ID**: Auto-generated, incrementing numbers
- **Completed**: Defaults to `false`

## Testing Examples

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk"}'

# List all tasks
curl http://localhost:3000/tasks

# Get only completed tasks
curl http://localhost:3000/tasks?completed=true

# Mark task as completed
curl -X PATCH http://localhost:3000/tasks/1
```

## Error Responses

- `400 Bad Request`: Invalid input or duplicate title
- `404 Not Found`: Task ID not found
