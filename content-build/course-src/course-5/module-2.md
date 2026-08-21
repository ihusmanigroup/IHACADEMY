# MODULE: Module 2 — npm, Express & Your First Server
# DURATION: 45

## TOPIC: Topic 2.1 [Unlocked]: npm: The Package Manager

## Introduction & Core Concepts

**npm (Node Package Manager)** comes bundled with Node.js. It is the world's largest software registry: over two million packages you can add to a project with one command.

### The Core Commands

```bash
npm init -y                 # create package.json
npm install <package>       # install a dependency (saved to dependencies)
npm install <package> --save-dev   # dev-only tool (test runners, build tools)
npm uninstall <package>     # remove a package
npm run <script>            # run a script defined in package.json
```

**Explanation:** Every Node project has a `package.json` — the project's identity card. It stores the project name, version, scripts, and a list of dependencies. When you install a package, npm records it in `package.json` and downloads the files into `node_modules/`.

### package.json Anatomy

```json
{
    "name": "my-api",
    "version": "1.0.0",
    "scripts": {
        "start": "node server.js",
        "dev": "node --watch server.js"
    },
    "dependencies": {
        "express": "^4.19.0"
    },
    "devDependencies": {
        "nodemon": "^3.1.0"
    }
}
```

### How Sharing Works

- `package.json` + `package-lock.json` are committed to version control
- `node_modules/` is NEVER committed — it's regenerated with `npm install`
- Anyone cloning the repo runs `npm install` and gets the exact same dependency tree

**Real-world analogy:** npm is the app store for code. package.json is your shopping list (what you want installed); node_modules is your kitchen pantry (all the actual jars). You commit the list, not the pantry — new kitchens (clones) run `npm install` to restock exactly what the list says.

### Real-World Use Cases & Rules

- Start every project with npm init
- `npm install` reads package.json and restores node_modules
- Use --save-dev for tools not needed in production
- npm scripts are the standard way to run your app and tests
- Audit regularly: `npm audit` finds known vulnerabilities

### Key Takeaways

- npm = package manager bundled with Node
- package.json tracks scripts + dependencies; node_modules holds them
- Commit package.json/lock file; never commit node_modules
- `npm install`, `npm init`, `npm run <script>` are the daily commands

## TOPIC: Topic 2.2 [Locked — Requires 2.1 Completion]: Express: The Web Framework

## Introduction & Core Concepts

**Express** is the most popular Node.js web framework — a thin, fast layer on top of Node's `http` module that turns request handling into one readable route definition.

```js
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Hello from Express!");
});

app.get("/about", (req, res) => {
    res.send("This is the about page.");
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
```

**Explanation:**
- `app.get("/", handler)` registers a route: whenever a GET request arrives at `/`, the handler runs
- `res.send(...)` sends the response back to the client
- `app.listen(3000)` starts the server on port 3000
- The callback fires when the server is up

**Expected output:** Visiting `http://localhost:3000` in a browser shows "Hello from Express!", and `/about` shows the about message.

**Real-world analogy:** Express is the restaurant's order counter. Customers (HTTP requests) arrive with orders (GET /about); the counter clerk (the route handler) takes the order, calls the kitchen, and serves the dish (the response). Without Express you'd be a cook who also has to build the entire counter from scratch.

### The Anatomy of a Route

```
app.<METHOD>(<PATH>, <HANDLER>)
  │        │         │
 GET      "/"       (req, res) => { ... }
```

### Real-World Use Cases & Rules

- Express handles routing, middleware, and responses over plain http
- `req` = the incoming request (params, body, headers); `res` = the outgoing response
- Route paths can include parameters: `app.get("/users/:id", ...)` (next topic)
- Port 3000 is the convention; production deployments pick their own
- Always start with the simplest server and grow it

### Code Example / Implementation

```js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.json({ message: "Hello, API consumer!" });
});

app.listen(3000);
```

### Key Takeaways

- Express = the standard Node web framework
- app.get(path, handler) defines routes; res.send/res.json respond
- app.listen(port) starts the server
- req carries request data, res carries the response

## TOPIC: Topic 2.3 [Locked — Requires 2.2 Completion]: Routes, Parameters & Query Strings

## Introduction & Core Concepts

Real APIs need dynamic routes: `/users/42` should show user 42, not a fixed page. Express provides **route parameters** (`:id`) and **query strings** (`?search=react`).

```js
const express = require("express");
const app = express();

// Route parameter: /users/42
app.get("/users/:id", (req, res) => {
    const id = req.params.id;
    res.json({ userId: id });
});

// Multiple params: /reports/2026/jan
app.get("/reports/:year/:month", (req, res) => {
    res.json({ year: req.params.year, month: req.params.month });
});

// Query string: /search?q=react&limit=5
app.get("/search", (req, res) => {
    res.json({ query: req.query.q, limit: req.query.limit });
});
```

**Explanation:**
- `req.params` holds values from the URL path — named by the `:name` placeholder
- `req.query` holds values from the query string (after `?`)
- Values arrive as strings; convert with `Number()` when needed

**Expected output for GET /users/42:** `{ "userId": "42" }`

**Real-world analogy:** Route parameters are like shelf addresses in a warehouse — the address `/users/42` tells you exactly which box to fetch, and the answer changes with the address. Query strings are like filter checkboxes on a search form — they refine the same endpoint (`/search?category=js&level=beginner`).

### REST Convention

| Method + Path | Meaning |
|---|---|
| GET /courses | List all courses |
| GET /courses/:id | Get one course |
| POST /courses | Create a course |
| PUT /courses/:id | Update a course |
| DELETE /courses/:id | Delete a course |

### Real-World Use Cases & Rules

- Use `:param` placeholders for variable path segments
- req.params for path values, req.query for optional filters
- Convert string values with Number() before arithmetic
- Follow REST conventions for predictable APIs

### Code Example / Implementation

```js
app.get("/courses/:id/lessons/:lessonId", (req, res) => {
    const { id, lessonId } = req.params;
    res.json({ courseId: id, lessonId });
});
```

### Key Takeaways

- req.params = dynamic path segments; req.query = ?key=value pairs
- REST: GET/POST/PUT/DELETE + resource paths
- Convert numbers from params/query with Number()
- One endpoint can serve unlimited values

## TOPIC: Topic 2.4 [Locked — Requires 2.3 Completion]: JSON, POST & Middleware

## Introduction & Core Concepts

APIs exchange **JSON**. To accept JSON in POST/PUT bodies, Express needs the `express.json()` middleware — code that runs between the request arriving and the route handler.

```js
const express = require("express");
const app = express();

app.use(express.json());          // middleware: parse JSON bodies

const courses = [];
let nextId = 1;

app.post("/courses", (req, res) => {
    const { title, duration } = req.body;
    if (!title || !duration) {
        return res.status(400).json({ error: "title and duration are required" });
    }
    const course = { id: nextId++, title, duration };
    courses.push(course);
    res.status(201).json(course);
});

app.get("/courses", (req, res) => {
    res.json(courses);
});

app.listen(3000);
```

**Explanation:**
- `app.use(express.json())` makes `req.body` available as a parsed object
- `req.body` contains the JSON the client sent (e.g., `{ "title": "Node", "duration": 4 }`)
- `res.status(201)` sets the HTTP status code; 201 = Created
- `400` = Bad Request — validation failed
- The courses array is the in-memory "database" (replaced by a real DB later)

**Real-world analogy:** Middleware is the airport security line: every passenger (request) passes through it before reaching the gate (route handler). `express.json()` is the bag scanner that unpacks the luggage (parses the body) so you don't get a mystery box at the gate.

### Common Middleware

| Middleware | Purpose |
|---|---|
| `express.json()` | Parse JSON request bodies |
| `express.urlencoded()` | Parse form submissions |
| Custom `(req, res, next)` | Logging, auth checks, CORS headers |
| Error handlers | Catch errors centrally |

### Real-World Use Cases & Rules

- Validate req.body before trusting it
- Return proper status codes: 201 created, 400 bad request, 404 not found
- Middleware runs in order, then calls next() to continue
- Test POST endpoints with a tool like Postman or the browser's fetch

### Code Example / Implementation

```js
// Client side test
fetch("http://localhost:3000/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "API Basics", duration: 2 }),
});
```

### Key Takeaways

- express.json() middleware enables req.body
- POST creates resources; validate input; use 201/400 statuses
- Middleware = code that processes every request in order
- In-memory arrays are fine for learning; databases come next

## QUIZ: Module 2 Quiz — Pass to Unlock Module 3

Q: What is npm?
A: A Node.js testing framework
A: The Node package manager and world's largest software registry
A: A database tool
A: A web browser
ANS: 1

Q: Which command installs a package and saves it to package.json?
A: npm init
A: npm install <package>
A: npm start
A: npm remove
ANS: 1

Q: Which folder should NEVER be committed to version control?
A: src/
A: node_modules/
A: scripts/
A: config/
ANS: 1

Q: What does Express do?
A: Manages databases
A: Simplifies creating web servers and routing
A: Compiles CSS
A: Runs tests
ANS: 1

Q: In app.get("/users/:id", handler), what does req.params.id contain?
A: The id passed in the URL path
A: The query string
A: The request body
A: The server port
ANS: 0

Q: Which request method creates a new resource?
A: GET
A: DELETE
A: POST
A: PUT
ANS: 2

Q: What is express.json() used for?
A: To pretty-print responses
A: To parse incoming JSON request bodies
A: To compress files
A: To generate passwords
ANS: 1

Q: What does res.status(201) mean?
A: Bad request
A: Server error
A: Resource created successfully
A: Not found
ANS: 2

Q: Which HTTP status code indicates a validation failure?
A: 200
A: 400
A: 500
A: 301
ANS: 1

Q: What are middleware functions in Express?
A: Components that process requests in order before reaching route handlers
A: Database queries
A: HTML templates
A: CSS classes
ANS: 0
