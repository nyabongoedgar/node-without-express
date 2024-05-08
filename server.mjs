// Import the http and sqlite3 modules
import http from 'http';
import sqlite3 from 'sqlite3';

// Connect to the SQLite database
const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the todos database.');
});

// Function to create a new todo
const createTodo = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const todo = JSON.parse(body);
    const sql = 'INSERT INTO todos(title, completed) VALUES(?,?)';
    db.run(sql, [todo.title, todo.completed], function(err) {
      if (err) {
        console.error(err.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'Internal server error' }));
      } else {
        res.writeHead(201, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(todo));
      }
    });
  });
};

// Function to get all todos
const getTodos = (req, res) => {
  const sql = 'SELECT * FROM todos';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'Internal server error' }));
    } else {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(rows));
    }
  });
};

// Function to get a single todo by ID
const getTodoById = (req, res) => {
  const { id } = req.url.split('/').pop();
  const sql = 'SELECT * FROM todos WHERE id=?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'Internal server error' }));
    } else if (!row) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'Todo not found' }));
    } else {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(row));
    }
  });
};

// Function to update a todo by ID
const updateTodo = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const { id, title, completed } = JSON.parse(body);
    const sql = 'UPDATE todos SET title=?, completed=? WHERE id=?';
    db.run(sql, [title, completed, id], function(err) {
      if (err) {
        console.error(err.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'Internal server error' }));
      } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: 'Todo updated' }));
      }
    });
  });
};

// Function to delete a todo by ID
const deleteTodo = (req, res) => {
  const { id } = req.url.split('/').pop();
  const sql = 'DELETE FROM todos WHERE id=?';
  db.run(sql, [id], function(err) {
    if (err) {
      console.error(err.message);
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'Internal server error' }));
    } else {
      res.writeHead(204, {});
      res.end();
    }
  });
};

// Request handler
const requestHandler = (req, res) => {
  switch (req.url) {
    case '/todos':
      switch (req.method) {
        case 'GET':
          getTodos(req, res);
          break;
        case 'POST':
          createTodo(req, res);
          break;
        default:
          res.writeHead(405, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ error: 'Method not allowed' }));
      }
      break;
    case '/todos/:id':
      switch (req.method) {
        case 'GET':
          getTodoById(req, res);
          break;
        case 'PUT':
          updateTodo(req, res);
          break;
        case 'DELETE':
          deleteTodo(req, res);
          break;
        default:
          res.writeHead(405, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ error: 'Method not allowed' }));
      }
      break;
    default:
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'Not found' }));
  }
};

// Create an HTTP server
const server = http.createServer(requestHandler);

// Listen on port 3000
const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
