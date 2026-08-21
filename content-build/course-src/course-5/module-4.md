# MODULE: Module 4 — Best Practices & Real-World Use
# DURATION: 45

## TOPIC: Topic 4.1 [Unlocked]: Error Handling & Validation

## Introduction & Core Concepts

A professional API handles every failure with a clear message and the right status code — and never crashes.

### try/catch Everywhere Async

```js
app.get("/courses/:id", async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM courses WHERE id = $1",
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: "Course not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
```

**Explanation:** Every awaited operation can throw. Without try/catch, the error crashes the server. With it, the client gets a structured error response and the server logs the details.

### The Validation Golden Rules

- **Never trust user input** — validate everything: types, lengths, allowed values
- **Sanitize what you store** — trim whitespace, normalize emails
- **Fail fast with 400** — return a message naming the problem
- **Use $1 placeholders** for every dynamic value (SQL injection protection)

```js
app.post("/courses", async (req, res) => {
    const { title, level } = req.body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
        return res.status(400).json({ error: "title must be at least 3 characters" });
    }
    if (level && !["Beginner", "Intermediate", "Advanced"].includes(level)) {
        return res.status(400).json({ error: "invalid level" });
    }

    try {
        const { rows } = await pool.query(
            "INSERT INTO courses (title, level) VALUES ($1, $2) RETURNING *",
            [title.trim(), level]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
```

### Common Status Codes

| Code | Meaning | Use |
|---|---|---|
| 200 | OK | Successful reads/updates |
| 201 | Created | Successful creates |
| 400 | Bad Request | Validation failure |
| 404 | Not Found | Missing resource |
| 500 | Internal Error | Unexpected failure |

**Real-world analogy:** Error handling is like a pilot's checklist: before every flight (request), checks run (validation); if anything fails, the plane diverts early (400) instead of attempting the landing and crashing (unhandled error). Passengers (clients) always know the status.

### Key Takeaways

- try/catch every async route; never let errors crash the process
- Validate ALL input; fail fast with 400
- Parameterized queries protect against injection
- Meaningful status codes + clear messages

## TOPIC: Topic 4.2 [Locked — Requires 4.1 Completion]: Project Structure & Separation of Concerns

## Introduction & Core Concepts

Real projects organize code so each file has one responsibility. A clean structure scales from day one.

### A Professional Layout

```
my-api/
 ├── server.js            ← entry point: starts the app
 ├── app.js               ← builds the Express app
 ├── .env                 ← secrets (gitignored)
 ├── package.json
 ├── config/
 │    └── db.js           ← pool setup
 ├── routes/
 │    └── courses.js      ← course endpoints (router)
 ├── controllers/
 │    └── courses.js      ← route handlers / business logic
 ├── middleware/
 │    └── validate.js     ← reusable validation
 └── utils/
      └── errors.js       ← error helpers
```

### Routes as Express Routers

```js
// routes/courses.js
const express = require("express");
const router = express.Router();
const { listCourses, createCourse } = require("../controllers/courses");

router.get("/", listCourses);
router.post("/", createCourse);
router.get("/:id", getCourse);

module.exports = router;

// app.js — mount it
const courseRoutes = require("./routes/courses");
app.use("/courses", courseRoutes);
```

**Explanation:** Express `Router`s attach paths with `router.get(...)` instead of `app.get(...)`. Mounted with `app.use("/courses", router)`, all its routes are prefixed — a base path is configured once, and each router owns its resources.

### Why Separate?

- **Routes** = URL definitions, thin
- **Controllers** = business logic, testable in isolation
- **Middleware** = reusable cross-cutting concerns (auth, logging)
- **Config** = connections and settings, environment-driven

**Real-world analogy:** Separation of concerns is like a hospital: reception (routes) directs you, doctors (controllers) treat you, and labs (config/middleware) handle tests. If one person did everything, a hospital would be chaos — same for a large codebase.

### Key Takeaways

- Entry (server/app), routes, controllers, middleware, config
- Express Router + app.use mounts resource APIs
- Thin routes, tested logic, reusable middleware
- Structure grows with the project instead of against it

## TOPIC: Topic 4.3 [Locked — Requires 4.2 Completion]: Testing & Deployment

## Introduction & Core Concepts

**Testing** proves an API works; **deployment** puts it in production. Both are professional habits.

### Testing with Node's Built-in Runner

```js
// test/courses.test.js — run with: node --test
const { test } = require("node:test");
const assert = require("node:assert");

const { isTitleValid } = require("../utils/validate");

test("accepts a valid title", () => {
    assert.strictEqual(isTitleValid("Node for Beginners"), true);
});

test("rejects titles shorter than 3 characters", () => {
    assert.strictEqual(isTitleValid("No"), false);
});
```

**Explanation:** Tests assert expected behavior. `node --test` (built into modern Node) runs them and reports pass/fail. Test the pure logic (validation helpers) first — they're the easiest and most valuable tests.

### Deployment Essentials

| Topic | Practice |
|---|---|
| Build | `npm run build` / no build step for plain Node |
| Host | Render, Railway, Fly.io, or a VPS — or serverless (Vercel, AWS Lambda) |
| Env | Set real DATABASE_URL, API keys on the host — never in code |
| Database | Managed PostgreSQL (e.g., Supabase — like this platform) |
| Restart | Host restarts on crash; add PM2 or a process manager for VPS |
| HTTPS | The host provides TLS; never serve production on plain HTTP |

### Deployment Checklist

1. `npm test` passes locally
2. `.env` variables set on the host
3. Database migrations applied
4. `npm start` boots with `NODE_ENV=production`
5. Health check endpoint responds

**Real-world analogy:** Deployment is like opening a restaurant: the kitchen must pass inspection (tests), ingredients must be stocked (env vars), the building must be licensed (hosting), and someone must handle emergencies (process manager + logging). Skip any step and opening night fails.

### Key Takeaways

- Tests assert behavior; start with pure logic tests
- Hosts: Render/Railway/Fly.io; serverless options exist
- Secrets live on the host, not in the repo
- A checklist keeps deployments repeatable

## TOPIC: Topic 4.4 [Locked — Requires 4.3 Completion]: Real-World Usage & Capstone

## Introduction & Core Concepts

Node.js powers the back ends of Netflix, LinkedIn, Uber, PayPal, Slack, and thousands of startups — REST APIs, real-time chat with WebSockets, CLI tools, build tooling (Vite/webpack), and serverless functions all run on Node. This platform (IH Academy) itself is an Express-style API backed by PostgreSQL — exactly the architecture in this course.

### Capstone: Course Notes API

Build and run this complete API, then extend it:

```js
// server.js — a full CRUD API for your study notes
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

app.post("/notes", async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) {
        return res.status(400).json({ error: "title and body are required" });
    }
    try {
        const { rows } = await pool.query(
            "INSERT INTO notes (title, body) VALUES ($1, $2) RETURNING *",
            [title, body]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/notes", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM notes ORDER BY id");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/notes/:id", async (req, res) => {
    try {
        const { rowCount } = await pool.query("DELETE FROM notes WHERE id = $1", [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: "Note not found" });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(3000, () => console.log("Notes API running on :3000"));
```

**Explanation:** Create the `notes` table (id, title, body), run the server, and test with fetch or Postman: POST creates, GET lists, DELETE removes. Every pattern from this course appears here: express.json(), try/catch routes, parameterized queries, proper status codes.

### Your Next Steps

1. Add PUT /notes/:id and validation middleware
2. Split the code into routes/ and controllers/
3. Write tests with node --test
4. Connect it to a real React front end — you now own the full stack

### Key Takeaways

- Node powers major companies: APIs, real-time apps, CLIs, tooling
- The notes capstone applies every module concept
- Full-stack path: React + Node + PostgreSQL = a complete product
- Extend, split, test, deploy — then build the next project

## QUIZ: Module 4 Quiz — Pass to Complete the Course

Q: What happens to an unhandled rejection in an async route?
A: Nothing
A: It can crash the server
A: It is logged automatically
A: It retries the request
ANS: 1

Q: Which status code means "validation failed"?
A: 200
A: 400
A: 500
A: 302
ANS: 1

Q: Why must all user input be validated?
A: It makes the code longer
A: Users may send wrong types, missing fields, or malicious content
A: It is required by Express
A: Validation is only for production
ANS: 1

Q: What does an Express Router allow you to do?
A: Create multiple databases
A: Group routes by resource and mount them under a base path
A: Restart the server
A: Compile TypeScript
ANS: 1

Q: In a clean project structure, what belongs in controllers?
A: Business logic
A: Database config
A: CSS files
A: Secrets
ANS: 0

Q: Which Node command runs the built-in test runner?
A: npm test --run
A: node --test
A: node test.js --all
A: npx test-run
ANS: 1

Q: Where should production secrets be stored?
A: Hardcoded in server.js
A: In .env committed to the repo
A: In environment variables on the host
A: In the README
ANS: 2

Q: Why are pure logic functions the first target for tests?
A: They are easiest to test and most valuable
A: They cannot have bugs
A: They run fastest
A: They are the only testable code
ANS: 0

Q: Which query pattern protects against SQL injection?
A: String concatenation
A: Parameterized queries with placeholders
A: Uppercase SQL
A: Comments in the query
ANS: 1

Q: What does a full-stack developer build with React + Node + PostgreSQL?
A: A complete product: front end, API, and database
A: A static HTML page
A: A spreadsheet
A: An operating system
ANS: 0
