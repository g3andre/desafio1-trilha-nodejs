const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => {
    if (user.username === username) {
      return user;
    }
  });

  if (!user) {
    return response.status(401).json({ error: "User not found..." });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const existUsername = users.some((user) => user.username === username);
  if (existUsername) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;
  const existTodo = user.todos.find((todo) => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = new Date(deadline);
      return todo;
    }
  });

  existTodo
    ? response.status(200).json(existTodo)
    : response.status(404).json({ error: "Todo not found..." });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const existTodo = user.todos.find((todo) => {
    if (todo.id === id) {
      todo.done = true;
      return todo;
    }
  });

  existTodo
    ? response.status(200).json(existTodo)
    : response.status(404).json({ error: "Todo not found..." });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const existTodo = user.todos.find((todo) => {
    if (todo.id === id) {
      return todo;
    }
  });

  if (!existTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }
  user.todos.splice(existTodo, 1);
  return response.status(204).json(existTodo);
});

module.exports = app;
