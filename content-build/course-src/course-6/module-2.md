# MODULE: Module 2 — JSON, REST & Resources
# DURATION: 45

## TOPIC: Topic 2.1 [Unlocked]: JSON: The Data Format

## Introduction & Core Concepts

**JSON (JavaScript Object Notation)** is the standard data format for APIs — lightweight, human-readable, and understood by every programming language.

```json
{
    "id": 1,
    "title": "API Fundamentals",
    "level": "Beginner",
    "published": true,
    "tags": ["http", "rest", "json"],
    "author": {
        "name": "IH Academy",
        "rating": 4.9
    }
}
```

**Explanation:** JSON looks exactly like a JavaScript object — because it grew out of JavaScript. But it's just text: any language can read it. Objects (`{ }`), arrays (`[ ]`), strings, numbers, booleans, and null are the only building blocks.

### JSON vs JavaScript Objects

| Rule | JSON | JS Object Literal |
|---|---|---|
| Keys must be quoted | Yes ("id") | Optional (id) |
| Trailing commas | Not allowed | Allowed |
| Comments | Not allowed | Allowed |
| Functions/dates | Not possible | Possible |

### Converting Between Text and Objects

```js
// Response body (string) → object
const obj = JSON.parse('{"title":"API Basics"}');   // { title: "API Basics" }

// Object → JSON string (for sending)
const str = JSON.stringify({ title: "API Basics" }); // '{"title":"API Basics"}'
```

**Real-world analogy:** JSON is the shared language between countries (languages): like diplomats agreeing to speak in a common tongue, every programming language can parse and produce JSON — so it's the perfect middle ground for machine communication.

### Real-World Use Cases & Rules

- JSON.parse() to read response text; JSON.stringify() to send bodies
- Keys in double quotes; no comments, no trailing commas
- Objects, arrays, strings, numbers, booleans, null — that's the whole vocabulary
- APIs return JSON arrays for lists and objects for single items

### Key Takeaways

- JSON = the universal API data format
- Same shape as JS objects, but stricter (quoted keys)
- JSON.parse and JSON.stringify are the bridges
- Any language can read and write JSON

## TOPIC: Topic 2.2 [Locked — Requires 2.1 Completion]: REST Architecture

## Introduction & Core Concepts

**REST (Representational State Transfer)** is the dominant architectural style for web APIs. A REST API organizes everything as **resources** (nouns) addressed by URLs, manipulated with HTTP methods (verbs).

### Resources and Their Endpoints

```
/courses            → collection of courses
/courses/42         → one course (id 42)
/courses/42/lessons → lessons belonging to course 42
/users              → collection of users
```

### The REST Verb-URL Table

| URL | GET | POST | PUT | DELETE |
|---|---|---|---|---|
| /courses | List all | Create new | Replace all (unusual) | Delete all (dangerous) |
| /courses/42 | Get one | — | Replace course 42 | Delete course 42 |

### The 5 REST Rules in Practice

| Rule | Example |
|---|---|
| 1. Resources are nouns, never verbs | `/courses`, not `/getAllCourses` |
| 2. Plural names for collections | `/courses` not `/course` |
| 3. IDs identify single resources | `/courses/42` |
| 4. HTTP methods carry the action | GET, POST, PUT, DELETE |
| 5. Nested paths express ownership | `/courses/42/lessons` |

### REST in Action

```
GET    /courses            → 200 [all courses]
POST   /courses            → 201 new course
GET    /courses/42         → 200 one course | 404 if missing
PUT    /courses/42         → 200 updated course
DELETE /courses/42         → 204 nothing
```

**Real-world analogy:** REST is a library's classification system. The shelves (resources: /books, /authors) are fixed, the catalog numbers (IDs: /books/42) are stable, and the actions (check out, return, reserve) are the HTTP methods. A well-organized library never asks you to "do-getting-book-by-subject" URLs — the structure IS the organization.

### Real-World Use Cases & Rules

- Nouns in URLs, verbs in methods
- Nested paths for ownership: /authors/7/books
- REST is a style, not a law — but consistency is what makes APIs usable
- Versioning later: /v1/courses, /v2/courses

### Key Takeaways

- Resources = nouns, methods = verbs
- REST maps GET/POST/PUT/DELETE onto resources
- Predictable URL structure = usable API
- REST is the industry default for web APIs

## TOPIC: Topic 2.3 [Locked — Requires 2.2 Completion]: CRUD Operations in Practice

## Introduction & Core Concepts

REST APIs implement **CRUD** — the four fundamental data operations — with HTTP methods against resources. This topic walks each one with real fetch code.

```js
// CREATE — POST
const createCourse = async () => {
    const res = await fetch("https://api.example.com/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "REST in Depth", level: "Intermediate" }),
    });
    if (res.status === 201) {
        console.log("Created:", await res.json());
    }
};

// READ — GET
const listCourses = async () => {
    const res = await fetch("https://api.example.com/courses");
    const courses = await res.json();
    console.log(courses);
};

// UPDATE — PUT
const updateCourse = async (id) => {
    const res = await fetch(`https://api.example.com/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "REST Masterclass", level: "Advanced" }),
    });
    console.log(await res.json());
};

// DELETE
const deleteCourse = async (id) => {
    const res = await fetch(`https://api.example.com/courses/${id}`, {
        method: "DELETE",
    });
    console.log(res.status === 204 ? "Deleted" : "Failed");
};
```

### What Each Returns

| Operation | Method | Success Status | Body Back |
|---|---|---|---|
| Create | POST | 201 | The created resource (usually with its new id) |
| Read list | GET | 200 | Array of resources |
| Read one | GET /id | 200 or 404 | Single object |
| Update | PUT | 200 | The updated resource |
| Delete | DELETE | 204 | Empty |

**Real-world analogy:** CRUD is the account book of a bank: create accounts (POST), view statements (GET), update details (PUT), close accounts (DELETE). Every screen in every app is some combination of these four actions against the back end.

### Real-World Use Cases & Rules

- PUT sends the FULL resource; PATCH sends only changed fields
- Never DELETE collections casually (`DELETE /courses` without id)
- Handle the missing-resource case: 404, not a crash
- The response body of a create tells you the new resource's id

### Key Takeaways

- CRUD ↔ POST/GET/PUT/DELETE
- 201 for creates, 204 for deletes
- PUT replaces fully, PATCH partially
- Check status codes before trusting bodies

## TOPIC: Topic 2.4 [Locked — Requires 2.3 Completion]: Filtering, Pagination & Sorting

## Introduction & Core Concepts

Real APIs serve thousands of records — so they offer **filtering**, **pagination**, and **sorting** through query strings.

```js
// Filtering: only courses with level=Beginner
// Sorting: newest first
// Pagination: page 2, 20 items per page
fetch("https://api.example.com/courses?level=Beginner&sort=-created_at&page=2&limit=20");
```

### Query String Conventions

| Parameter | Example | Meaning |
|---|---|---|
| Filter field | `level=Beginner` | Only Beginner courses |
| Sort | `sort=title` or `sort=-created_at` | Ascending, or descending with minus |
| Pagination | `page=2&limit=20` | Page number and page size |
| Search | `q=react` | Full-text search |

### The Paginated Response Shape

```json
{
    "data": [ { "id": 1, "title": "..." } ],
    "pagination": {
        "page": 2,
        "limit": 20,
        "total": 145,
        "total_pages": 8
    }
}
```

**Explanation:** Instead of returning a bare array, paginated APIs wrap data in an envelope with metadata — so clients can render "Page 2 of 8" and fetch the next page.

**Real-world analogy:** Pagination is like a bookstore's shelf layout: you don't dump all 100,000 books on one table (that's a raw unfiltered list). The store organizes by aisle (filter), alphabetizes (sort), and holds a manageable number per display (limit) — you page through the results.

### Real-World Use Cases & Rules

- Clients build query strings with URLSearchParams to avoid manual encoding
- limit defaults are common (e.g., 10–25); huge limits cost the server
- Always handle empty results gracefully (empty array, not an error)
- Consistency matters more than the exact parameter names — but `page`/`limit` are near-universal

### Code Example / Implementation

```js
const url = new URL("https://api.example.com/courses");
url.searchParams.set("level", "Beginner");
url.searchParams.set("sort", "-created_at");
url.searchParams.set("page", "2");
url.searchParams.set("limit", "20");

const res = await fetch(url);
const data = await res.json();
console.log(data.pagination.total_pages); // "8" → render 8 pages
```

### Key Takeaways

- Query strings drive filtering, sorting, and pagination
- Envelope shape: data + pagination metadata
- URLSearchParams builds clean URLs
- Design responses for scale from day one

## QUIZ: Module 2 Quiz — Pass to Unlock Module 3

Q: What does JSON stand for?
A: Java Simple Object Notation
A: JavaScript Object Notation
A: Joint System Operation Network
A: Java Standard Output Namespace
ANS: 1

Q: Which of these is valid JSON?
A: { title: "API" }
A: {"title": "API"}
A: { title = "API" }
A: <title>API</title>
ANS: 1

Q: What does JSON.parse do?
A: Converts a JSON string into an object
A: Converts an object into a JSON string
A: Validates a URL
A: Formats HTML
ANS: 0

Q: In REST, what should URLs contain?
A: Verbs like /getAllCourses
A: Nouns like /courses
A: Only numbers
A: SQL queries
ANS: 1

Q: Which method + URL updates course 42?
A: POST /courses/42
A: PUT /courses/42
A: GET /courses/42
A: DELETE /courses
ANS: 1

Q: What does POST /courses return on success?
A: 204 with no body
A: 201 with the created resource
A: 404
A: 301
ANS: 1

Q: What status code does a successful DELETE return?
A: 200
A: 201
A: 204
A: 400
ANS: 2

Q: What is the difference between PUT and PATCH?
A: No difference
A: PUT replaces the full resource; PATCH updates parts
A: PATCH is for GET
A: PUT deletes resources
ANS: 1

Q: Which query parameters paginate results?
A: sort=title
A: page=2&limit=20
A: q=react
A: level=Beginner
ANS: 1

Q: Why do APIs wrap lists in { data, pagination }?
A: To confuse clients
A: To include metadata like totals and page counts
A: Because arrays are invalid
A: It is required by JSON
ANS: 1
