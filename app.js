const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const cors = require("cors");

let dbPath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(cors());
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running successfully on port 3000");
    });
  } catch (e) {
    console.log("error found");
  }
};

initializeDBAndServer();

const hasPriorityAndStatusProperties = (value) => {
  return value.priority !== undefined && value.status !== undefined;
};

const hasPriorityProperty = (value) => {
  return value.priority !== undefined;
};

const hasStatusProperty = (value) => {
  return value.status !== undefined;
};

// API 1
app.get("/todos/", async (request, response) => {
  let getTodosQuery = "";
  let output = null;
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
        select * from todo where priority = '${priority}' and status = '${status}' and todo like '%${search_q}%' ;`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
        select * from todo where priority = '${priority}'  and todo like '%${search_q}%' ;`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
        select * from todo where  status = '${status}' and todo like '%${search_q}%' ;`;
      break;
    default:
      getTodosQuery = `
        select * from todo where  todo like '%${search_q}%' ;`;
  }

  output = await db.all(getTodosQuery);
  response.send(output);
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const query = `
  select * from todo where id = ${todoId};`;
  console.log(query);
  const output = await db.get(query);
  response.send(output);
});

//API 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const query = `
  insert into todo (id, todo, priority, status) values (${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

//API 4

const statusProvided = (value) => {
  return value.status !== undefined;
};

const priorityProvided = (value) => {
  return value.priority !== undefined;
};

const todoProvided = (value) => {
  return value.todo !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;

  let query = "";
  let output = "";

  switch (true) {
    case statusProvided(request.body):
      query = `update todo set status = '${status}' where id = ${todoId};`;
      output = "Status Updated";
      break;
    case priorityProvided(request.body):
      query = `update todo set priority = '${priority}' where id = ${todoId};`;
      output = "Priority Updated";
      break;
    case todoProvided(request.body):
      query = `update todo set todo = '${todo}' where id = ${todoId};`;
      output = "Todo Updated";
      break;
    default:
      query = "";
      output = "";
      break;
  }
  await db.run(query);
  response.send(output);
});

// API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const query = `
  delete from  todo where id = ${todoId}`;
  await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
