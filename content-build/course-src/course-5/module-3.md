# MODULE: Module 3 — Async JavaScript, Environment & Databases
# DURATION: 45

## TOPIC: Topic 3.1 [Unlocked]: Promises & async/await

## Introduction & Core Concepts

**Promises** represent a value that will be available later: pending, fulfilled, or rejected. **async/await** is modern syntax that makes promise-based code read like plain, sequential code.

```js
// A promise-based read (Node's fs.promises API)
const fs = require("fs").promises;

fs.readFile("data.txt", "utf8")
    .then((data) => console.log("Got it:", data))
    .catch((err) => console.error("Failed:", err.message));
```

### The Same Code with async/await

```js
async function loadData() {
    try {
        const data = await fs.readFile("data.txt", "utf8");
        console.log("Got it:", data);
    } catch (err) {
        console.error("Failed:", err.message);
    }
}

loadData();
```

**Explanation:**
- `await` pauses the function until the promise settles — but does NOT block other requests (the event loop keeps running)
- An `async` function always returns a promise
- try/catch replaces .catch() — errors flow like in synchronous code

**Real-world analogy:** Ordering at a restaurant: `await` is sitting down and waiting for your dish to arrive before eating (the awaited line), but the rest of the restaurant — other customers, other promises — keeps operating normally. The chef (event loop) is never idle.

### Promise States

```
new Promise(...)  ──►  Pending
                        │
                 ┌──────┴──────┐
                 ▼             ▼
              Fulfilled     Rejected
              (.then)       (.catch)
```

### Real-World Use Cases & Rules

- await can only be used inside async functions
- Wrap awaited code in try/catch to handle failures
- Never forget: async functions return promises — awaiting them is how you use them
- Parallel tasks: `Promise.all([task1, task2])` runs them concurrently

### Code Example / Implementation

```js
async function fetchCourse(id) {
    const res = await fetch(`https://api.example.com/courses/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

fetchCourse(3).then((course) => console.log(course.title));
```

### Key Takeaways

- Promises: pending → fulfilled / rejected
- await pauses the function, not the server
- try/catch handles errors in async code
- Promise.all for parallel work

## TOPIC: Topic 3.2 [Locked — Requires 3.1 Completion]: Environment Variables & .env Files

## Introduction & Core Concepts

**Environment variables** are values set outside your code — API keys, database URLs, ports. Keeping secrets out of source code is a core security practice.

```js
// config.js
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL;
const API_KEY = process.env.API_KEY;
```

### The .env File (never committed!)

```env
PORT=3000
DATABASE_URL=postgres://user:pass@host:5432/db
API_KEY=sk-live-abc123
```

**Explanation:**
- `process.env` is Node's window into environment variables
- The `dotenv` package loads `.env` into `process.env` at startup
- `.env` must be listed in `.gitignore` — otherwise secrets leak to version control

### Getting Values

```bash
# PowerShell (Windows)
$env:PORT = "4000"

# Command line
PORT=4000 node server.js

# From .env via dotenv
require("dotenv").config();
```

### Real-World Use Cases & Rules

- Never hardcode secrets in code — always environment variables
- Add `.env` to .gitignore; commit `.env.example` with dummy values instead
- Provide defaults: `process.env.PORT || 3000`
- The same code runs on any machine with a different .env

**Real-world analogy:** Environment variables are like the house key that only the owner keeps — the blueprint (code) shows where the door is, but the key (secret) is handed out separately at deploy time. The repo shares the blueprint, never the keys.

### Key Takeaways

- process.env reads environment variables
- dotenv loads .env files; never commit .env
- Defaults keep apps runnable without config
- Secrets live in the environment, not the code

## TOPIC: Topic 3.3 [Locked — Requires 3.2 Completion]: Connecting to a Database (PostgreSQL)

## Introduction & Core Concepts

Real applications store data in a **database**. PostgreSQL is the most popular open-source relational database — the same one this platform (IH Academy) uses. Node connects to it with the `pg` driver.

```js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

async function getCourses() {
    const result = await pool.query("SELECT id, title, level FROM courses");
    return result.rows;
}

getCourses().then((rows) => console.log(rows));
```

**Explanation:**
- `Pool` manages multiple database connections
- `pool.query(sql)` sends SQL and returns `result.rows` — an array of objects
- Parameters are never concatenated into SQL strings (see the next point)

### Parameterized Queries (Security!)

```js
// ❌ DANGEROUS: SQL injection if userId comes from user input
const rows = await pool.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ SAFE: placeholders — the driver escapes values
const rows = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [userId]
);
```

**Explanation:** `$1`, `$2`... are placeholders. The driver safely substitutes values, preventing **SQL injection** — the most common database attack, where crafted input like `1; DROP TABLE users` gets executed.

**Real-world analogy:** Parameterized queries are like ordering at a restaurant where the kitchen reads the order, never the words on the bill: the customer's text is treated as food, never as cooking instructions. Injected SQL only works when the code blindly pastes customer text into the recipe.

### Real-World Use Cases & Rules

- Pool + parameterized queries are the standard pg pattern
- Never concatenate user input into SQL
- Use environment variables for connection details
- result.rows = the data; result.rowCount = affected rows

### Key Takeaways

- pg Pool connects Node to PostgreSQL
- Always use $1 placeholders — never string concatenation
- result.rows returns the query data
- Config comes from environment variables

## TOPIC: Topic 3.4 [Locked — Requires 3.3 Completion]: Building a CRUD API with Express + PostgreSQL

## Introduction & Core Concepts

This topic ties everything together: a complete **CRUD** (Create, Read, Update, Delete) API backed by a real database.

```js
const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());

const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

// CREATE
app.post("/courses", async (req, res) => {
    const { title, level } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });
    try {
        const { rows } = await pool.query(
            "INSERT INTO courses (title, level) VALUES ($1, $2) RETURNING *",
            [title, level]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ (all)
app.get("/courses", async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM courses ORDER BY id");
    res.json(rows);
});

// READ (one)
app.get("/courses/:id", async (req, res) => {
    const { rows } = await pool.query(
        "SELECT * FROM courses WHERE id = $1",
        [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "not found" });
    res.json(rows[0]);
});

// UPDATE
app.put("/courses/:id", async (req, res) => {
    const { title, level } = req.body;
    const { rows } = await pool.query(
        "UPDATE courses SET title = $1, level = $2 WHERE id = $3 RETURNING *",
        [title, level, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "not found" });
    res.json(rows[0]);
});

// DELETE
app.delete("/courses/:id", async (req, res) => {
    const { rowCount } = await pool.query(
        "DELETE FROM courses WHERE id = $1",
        [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: "not found" });
    res.status(204).send();
});

app.listen(3000, () => console.log("API on :3000"));
```

**Explanation:** Each route maps a REST action to a parameterized SQL statement. `RETURNING *` returns the created/updated row so the client gets it back. Every route handles both success (200/201) and failure (400/404/500) paths.

### The REST ↔ SQL Mapping

| HTTP | SQL | Meaning |
|---|---|---|
| POST /courses | INSERT | Create |
| GET /courses | SELECT | Read all |
| GET /courses/:id | SELECT ... WHERE id | Read one |
| PUT /courses/:id | UPDATE | Update |
| DELETE /courses/:id | DELETE | Delete |

### Real-World Use Cases & Rules

- One try/catch per route; never let a DB error crash the process
- 204 No Content for successful deletes
- Test every route: happy path AND missing record path
- This pattern scales to real production APIs

### Key Takeaways

- CRUD = 5 routes mapping REST verbs to SQL statements
- Parameterized queries everywhere; RETURNING * returns rows
- Proper status codes for every outcome
- This API pattern is the backbone of real back ends

## QUIZ: Module 3 Quiz — Pass to Unlock Module 4

Q: What are the three states of a promise?
A: Start, middle, end
A: Pending, fulfilled, rejected
A: Open, closed, waiting
A: Small, medium, large
ANS: 1

Q: What does the await keyword do?
A: Blocks the entire server
A: Pauses the function until the promise settles
A: Deletes the promise
A: Speeds up the event loop
ANS: 1

Q: Where can await be used?
A: Anywhere in JavaScript
A: Only inside async functions
A: Only in callbacks
A: Only in the browser
ANS: 1

Q: Why should secrets live in environment variables?
A: To make code shorter
A: So they are never committed to version control
A: Environment variables are faster
A: They are required by Express
ANS: 1

Q: What does the dotenv package do?
A: Parses JSON
A: Loads .env files into process.env
A: Creates databases
A: Starts the server
ANS: 1

Q: Which file must be listed in .gitignore?
A: package.json
A: .env
A: server.js
A: node_modules
ANS: 1

Q: What is the safe way to pass values into a SQL query with pg?
A: Concatenate strings
A: Use $1 placeholders with an array of values
A: Write them into the query by hand
A: There is no safe way
ANS: 1

Q: What is SQL injection?
A: A type of indexing
A: Attackers injecting malicious SQL through unsanitized input
A: A performance optimization
A: A backup method
ANS: 1

Q: In a REST API, which method + route deletes a resource?
A: POST /courses
A: GET /courses/:id
A: DELETE /courses/:id
A: PUT /courses
ANS: 2

Q: What does RETURNING * in an INSERT query do?
A: Returns the number of rows in the table
A: Returns the newly inserted row
A: Rolls back the insert
A: Deletes the row
ANS: 1
