const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameInUse = users.some((user) => user.username === username);

  if (usernameInUse) {
    return response.status(400).json({ error: "Username already in use" });
  }

  const id = uuidv4();
  const user = {
    name,
    username,
    id,
    todos: [],
  };
  users.push(user);

  return response.status(201).send({ ...user });
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  return response.status(200).send([...user.todos]);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = users.find((user) => user.username === username);

  const taskId = uuidv4();

  const task = {
    id: taskId,
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(task);

  return response.status(201).send(task);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const user = users.find((user) => user.username === username);

  const task = user.todos.find((task) => task.id === id);

  if (!task) return response.status(404).send({ error: "Task not found" });

  task.title = title;
  task.deadline = deadline;

  return response.status(200).send({ ...task });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const task = user.todos.find((task) => task.id === id);

  if (!task) return response.status(404).send({ error: "Task not found" });

  task.done = true;

  return response.status(200).send({ ...task });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const task = user.todos.find((task) => task.id === id);

  if (!task) return response.status(404).send({ error: "Task not found" });

  user.todos.splice(task, 1);

  return response.status(204).send();
});

module.exports = app;
