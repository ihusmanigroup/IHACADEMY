# MODULE: Module 4 — Best Practices & Real-World Use
# DURATION: 45

## TOPIC: Topic 4.1 [Unlocked]: Documentation & Versioning

## Introduction & Core Concepts

An API without documentation is unusable — nobody knows what to call or what comes back. **Versioning** keeps old clients working while you improve the API.

### The Two Great Standards

**OpenAPI (Swagger)** — a JSON/YAML spec describing every endpoint, parameter, and response shape. Tools can read it and auto-generate documentation pages, client libraries, and mock servers.

**GraphQL** — an alternative query language where clients request exactly the fields they need in one round trip, instead of fixed REST endpoints.

```yaml
# openapi.yaml (excerpt)
openapi: 3.0.0
info:
  title: IH Academy Courses API
  version: 1.2.0
paths:
  /courses:
    get:
      summary: List courses
      parameters:
        - name: page
          in: query
          schema: { type: integer }
      responses:
        "200":
          description: A paginated list of courses
```

### Versioning Strategies

| Strategy | Example | Notes |
|---|---|---|
| URL versioning | /v1/courses, /v2/courses | Most common; clear and simple |
| Header versioning | Accept-Version: 2 | Keeps URLs clean |
| Breaking changes | New version | Removing/changing fields requires a major version |

**Explanation:** Version the URL at the top level (`/v1/`). When you make breaking changes (removing a field, changing a response shape), publish `/v2/` and keep `/v1/` alive until clients migrate. This is why you see `https://api.github.com/v3`, `https://api.stripe.com/v1` — you've been reading versions all along.

**Real-world analogy:** Versioning is like app updates: you're on iOS 17 today; when iOS 18 ships, 17 still works for a while. If the system just vanished, every app would break overnight — same with API clients.

### Real-World Use Cases & Rules

- Document: every endpoint, every parameter, every error
- OpenAPI specs generate living documentation
- Version in the URL; keep old versions alive during migration
- Deprecate with notice: keep the old version, announce removal dates

### Key Takeaways

- Documentation is part of the product
- OpenAPI = machine-readable API description
- URL versioning keeps old clients working
- Deprecate gently, never cut clients off

## TOPIC: Topic 4.2 [Locked — Requires 4.1 Completion]: Error Formats & Consistent Responses

## Introduction & Core Concepts

Great APIs fail gracefully: predictable error shapes, accurate codes, and helpful messages — on every path.

### A Consistent Error Envelope

```json
{
    "error": {
        "code": "COURSE_NOT_FOUND",
        "message": "No course exists with id 42",
        "details": { "id": 42 }
    }
}
```

```json
{
    "error": {
        "code": "VALIDATION_FAILED",
        "message": "title must be at least 3 characters",
        "details": { "field": "title", "reason": "too_short" }
    }
}
```

**Explanation:** The envelope has three parts: a stable machine-readable `code` (clients can branch on it), a human-readable `message`, and optional `details`. Same shape for 400, 401, 404, 500 — clients write ONE error handler for the whole API.

### Design Principles

| Principle | Example |
|---|---|
| Stable error codes | `NOT_FOUND`, `INVALID_TOKEN` — never free text as the code |
| Accurate status codes | 400 vs 401 vs 403 vs 404 — get the semantics right |
| No stack traces in production | Log them server-side, return generic 500 |
| Field-level detail | Which field failed and why |
| Consistent shape | Every error: { error: { code, message, details } } |

**Real-world analogy:** Consistent errors are airline flight delays: every airline uses the same "DELAYED / CANCELLED / BOARDING" codes on the screens — passengers know exactly what to do without deciphering each airline's language. Your clients are the passengers.

### Real-World Use Cases & Rules

- One error shape across the whole API
- Machine-readable codes + human-readable messages
- Log the real error; never leak internals to clients
- Test the failure paths as hard as the happy paths

### Key Takeaways

- Errors are data too — design their shape
- code + message + details in a stable envelope
- Accurate status codes and field-level details
- Hide internals, log everything

## TOPIC: Topic 4.3 [Locked — Requires 4.2 Completion]: Testing & Observability

## Introduction & Core Concepts

**Testing** proves your API works. **Observability** tells you what it's doing in production. Both are professional requirements, not extras.

### API Testing Levels

| Level | What You Test |
|---|---|
| Unit | One function in isolation (validation, helpers) |
| Integration | Route + database together (real request → real response) |
| End-to-end | The full client→API→DB journey |

```js
// Integration test with Node's built-in runner
const { test } = require("node:test");
const assert = require("node:assert");

test("GET /courses returns an array", async () => {
    const res = await fetch("http://localhost:3000/courses");
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
});

test("GET /courses/9999 returns 404", async () => {
    const res = await fetch("http://localhost:3000/courses/9999");
    assert.strictEqual(res.status, 404);
});
```

### Observability: The Production Window

| Tool | Answers |
|---|---|
| Logs | What happened, step by step (request, status, duration, errors) |
| Metrics | How healthy: requests/sec, error rate, response times, uptime |
| Health check | GET /health → 200 when the API is alive |
| Uptime monitors | Alerts when the API goes down |

### The Minimal Logging Pattern

```js
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        console.log(
            `${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`
        );
    });
    next();
});
```

**Real-world analogy:** Testing is the dress rehearsal: every line, every prop, every entrance rehearsed until flawless. Observability is the stage manager's headset during the show — they know instantly if a light failed, a door stuck, or an actor skipped a cue, and they can fix it before the audience notices.

### Real-World Use Cases & Rules

- Write tests for happy paths AND failure paths (404, validation, 500)
- Ship a /health endpoint on every API
- Log method, path, status, and duration for every request
- Alert on error-rate spikes, not on individual errors

### Key Takeaways

- Unit → integration → end-to-end testing
- Logs, metrics, and health checks = observability
- /health for uptime monitors
- Test failures as carefully as successes

## TOPIC: Topic 4.4 [Locked — Requires 4.3 Completion]: Real-World Usage & Capstone

## Introduction & Core Concepts

APIs are the plumbing of the modern internet: payment rails (Stripe), maps (Google), identity (OAuth providers), AI (OpenAI/Anthropic), messaging, shipping, weather, banking — every product you use is a client of someone else's API, and most are APIs themselves. This platform (IH Academy) is exactly that: a React client talking to a REST-style API backed by PostgreSQL.

### Capstone: Course Catalog API

This endpoint family demonstrates everything from this course — REST resources, JSON, status codes, validation, and error envelopes:

```js
// server.js — a complete mini-course catalog API
const express = require("express");
const app = express();
app.use(express.json());

const courses = [
    { id: 1, title: "HTML", level: "Beginner" },
    { id: 2, title: "CSS", level: "Beginner" },
];

const notFound = (id) =>
    res.status(404).json({
        error: { code: "NOT_FOUND", message: `No course with id ${id}` },
    });

// GET /courses — list
app.get("/courses", (req, res) => res.json(courses));

// POST /courses — create (validated)
app.post("/courses", (req, res) => {
    const { title, level } = req.body;
    if (!title || typeof title !== "string" || title.length < 3) {
        return res.status(400).json({
            error: {
                code: "VALIDATION_FAILED",
                message: "title must be a string of at least 3 characters",
            },
        });
    }
    const course = { id: courses.length + 1, title, level };
    courses.push(course);
    res.status(201).json(course);
});

// GET /courses/:id — one course
app.get("/courses/:id", (req, res) => {
    const course = courses.find((c) => c.id === Number(req.params.id));
    if (!course) return notFound(req.params.id);
    res.json(course);
});

// PUT /courses/:id — replace
app.put("/courses/:id", (req, res) => {
    const course = courses.find((c) => c.id === Number(req.params.id));
    if (!course) return notFound(req.params.id);
    course.title = req.body.title ?? course.title;
    course.level = req.body.level ?? course.level;
    res.json(course);
});

// DELETE /courses/:id
app.delete("/courses/:id", (req, res) => {
    const index = courses.findIndex((c) => c.id === Number(req.params.id));
    if (index === -1) return notFound(req.params.id);
    courses.splice(index, 1);
    res.status(204).send();
});

app.listen(3000, () => console.log("Catalog API on :3000"));
```

**Explanation:** Run this server and exercise it with fetch or Postman: create a course (POST, check 201), fetch it (GET, check 200), request a missing id (check the consistent 404 envelope), update it (PUT), delete it (DELETE, check 204). This is a miniature version of the exact API architecture used in production everywhere.

### Your Next Steps

1. Add pagination and filtering to GET /courses
2. Add an API-key middleware requiring a valid key
3. Write integration tests for all five routes
4. Document the API with an OpenAPI spec
5. Consume the API from the React front end you already know

### Key Takeaways

- APIs power payments, maps, AI, and every modern product
- The catalog capstone applies all four modules
- Next: auth, versioning, testing, documentation, deployment
- You now speak the language of every web service

## QUIZ: Module 4 Quiz — Pass to Complete the Course

Q: What is OpenAPI (Swagger)?
A: A database schema
A: A machine-readable spec describing an API's endpoints and shapes
A: A web browser
A: A CSS framework
ANS: 1

Q: Which versioning strategy is the most common?
A: URL versioning like /v1/courses
A: Naming courses "old" and "new"
A: No versioning
A: Comment versioning
ANS: 0

Q: Why keep old API versions alive after releasing new ones?
A: To use more server space
A: So existing clients keep working during migration
A: It is legally required
A: To slow down attackers
ANS: 1

Q: What should an error envelope contain?
A: Only the status code
A: A stable machine-readable code, a message, and details
A: The server's IP address
A: A random string
ANS: 1

Q: Why should production error responses never include stack traces?
A: They are too long
A: They leak internal details attackers can exploit
A: They are always empty
A: They crash the client
ANS: 1

Q: What does an integration test check?
A: A single function
A: A route plus its dependencies (like the database) working together
A: The CSS
A: The documentation
ANS: 1

Q: What does a /health endpoint do?
A: Returns the user list
A: Tells uptime monitors the API is alive
A: Deletes data
A: Rotates tokens
ANS: 1

Q: Which of these is NOT part of observability?
A: Logs
A: Metrics
A: SQL comments
A: Health checks
ANS: 2

Q: What status code does the capstone API return for a missing course?
A: 200 with an empty body
A: 404 with a consistent error envelope
A: 500
A: 204
ANS: 1

Q: What should the POST route do before creating a resource?
A: Skip validation
A: Validate and whitelist the input
A: Return everything from the body
A: Log the full body
ANS: 1
