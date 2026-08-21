# MODULE: Module 1 — HTTP & The Web Foundation
# DURATION: 45

## TOPIC: Topic 1.1 [Unlocked]: What is an API?

## Introduction & Core Concepts

An **API (Application Programming Interface)** is a set of rules that lets software talk to software. On the web, APIs are how your app gets data from a server, sends data to it, or triggers actions — without showing the app's internal code.

**Explanation:** When you use a weather app, the app calls a weather API: it sends a request, the server replies with JSON data (temperature, forecast), and the app renders it. The API is the messenger, not the data owner.

**Real-world analogy:** An API is like a restaurant menu. You (the app) don't go into the kitchen and cook (access the database). You order from the menu (the API) — a defined list of things you're allowed to ask for — and the waiter (API server) brings back your dish (the data).

### Real APIs You Already Use

- Google Maps API — embedded maps everywhere
- Stripe API — payments on shopping sites
- GitHub API — stars, repos, contributions shown on profiles
- X (Twitter) API — feeds and posts
- ChatGPT API — AI features in apps

### How a Web API Call Works

```
Your app ──(HTTP request)──► API server
              GET /courses
                              │
                              ▼
                        Server queries
                        its database
                              │
                              ▼
Your app ◄──(JSON response)── API server
              [ { id: 1, ... }, ... ]
```

### API Vocabulary

| Term | Meaning |
|---|---|
| Endpoint | A specific URL where a resource lives (`/courses`) |
| Request | The call your app makes |
| Response | The data (usually JSON) returned |
| Client | The app making the request |
| Server | The computer holding the data/API |

### Real-World Use Cases & Rules

- APIs are contracts: the client asks, the server answers, both agree on the format
- Most modern web APIs return JSON
- The same API can power a website, a mobile app, and a smartwatch — one API, many clients
- APIs hide implementation: clients never see the database

### Key Takeaways

- API = defined rules for software-to-software communication
- Client → request → server → response (usually JSON)
- Real products: maps, payments, weather, AI, social
- One API can serve many client apps

## TOPIC: Topic 1.2 [Locked — Requires 1.1 Completion]: HTTP: The Language of the Web

## Introduction & Core Concepts

**HTTP (HyperText Transfer Protocol)** is the protocol APIs use: a request/response language spoken between clients and servers. An API request is made of a **method** (what to do), a **URL** (what resource), and optional **headers** and **body** (extra info and data).

### The Request-Response Cycle

```
Client sends:  METHOD  URL  HTTP/Version
               Headers
               (Body for POST/PUT)

Server answers:  Status line  (HTTP/1.1 200 OK)
                 Headers
                 Body (JSON)
```

### The Five Core Methods

| Method | Purpose | Analogy |
|---|---|---|
| GET | Read data — no side effects | Looking at a menu |
| POST | Create something new | Placing an order |
| PUT | Replace/update something | Correcting the order |
| PATCH | Partial update | Adding extra sauce |
| DELETE | Remove something | Cancelling the order |

### Anatomy of a URL

```
https://api.example.com/v2/courses/42?page=1&limit=10
│      │                │  │      │       └─ query string
│      │                │  │      └────────── resource id
│      │                │  └───────────────── version
│      │                └──────────────────── base path
│      └───────────────────────────────────── host
└──────────────────────────────────────────── scheme
```

### Real-World Use Cases & Rules

- GET must not change data — that's what POST/PUT/DELETE are for
- Read operations: GET; create: POST; update: PUT/PATCH; delete: DELETE
- The URL identifies the resource; the method says what to do with it
- HTTP is stateless: each request carries everything it needs (that's where headers and tokens come in, later in this course)

### Key Takeaways

- HTTP = request/response protocol of the web
- Five methods: GET, POST, PUT, PATCH, DELETE
- Method + URL = the request; status + body = the response
- URLs have structure: scheme, host, path, id, query string

## TOPIC: Topic 1.3 [Locked — Requires 1.2 Completion]: Status Codes & Headers

## Introduction & Core Concepts

The server always answers with a **status code** — a three-digit number that tells the client what happened. Codes are grouped by the first digit.

### The Groups

| Code | Group | Meaning |
|---|---|---|
| 2xx | Success | It worked |
| 3xx | Redirection | The resource moved |
| 4xx | Client error | The request was wrong |
| 5xx | Server error | The server failed |

### Codes You Must Know

| Code | Meaning | When It Happens |
|---|---|---|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE (nothing to return) |
| 301/302 | Moved/Redirect | URL changed |
| 400 | Bad Request | Missing/invalid input |
| 401 | Unauthorized | Not logged in / bad credentials |
| 403 | Forbidden | Logged in but no permission |
| 404 | Not Found | Wrong URL or missing resource |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Server Error | Server crashed/unknown failure |

### Headers: The Envelope

Headers are metadata sent with requests and responses:

```
Request headers:      Response headers:
Authorization: ...    Content-Type: application/json
Content-Type: ...     Cache-Control: ...
Accept: ...           RateLimit-Remaining: 50
```

| Header | Used For |
|---|---|
| `Content-Type: application/json` | Tells the server the body is JSON |
| `Authorization: Bearer <token>` | Proves who you are |
| `Accept: application/json` | I want JSON back |
| `Cache-Control` | How long to cache the response |

**Real-world analogy:** The status code is the parcel's tracking status: "delivered" (200), "held at customs" (403), "returned to sender" (400). Headers are the packing slip and customs forms — metadata about what's inside and who sent it.

### Real-World Use Cases & Rules

- Always check status codes before trusting a response body
- 4xx = fix the request; 5xx = server problem, retry later
- 401 vs 403: 401 = who are you? 403 = you don't have permission
- Content-Type tells both sides how to read the body

### Key Takeaways

- Status codes: 2xx success, 4xx your fault, 5xx server fault
- Know the top 10 codes by heart
- Headers carry metadata and credentials
- Check codes before parsing the body

## TOPIC: Topic 1.4 [Locked — Requires 1.3 Completion]: Making Your First Requests

## Introduction & Core Concepts

You can talk to APIs without writing a whole app — with `fetch` in the browser/Node, or a tool like Postman. Let's explore a public API.

```js
// Public example: fetch a cat fact (real public API)
async function getCatFact() {
    const res = await fetch("https://catfact.ninja/fact");
    console.log("Status:", res.status);

    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
    }

    const data = await res.json();
    console.log("Fact:", data.fact);
}

getCatFact();
```

**Explanation:**
- `fetch(url)` performs a GET request and returns a promise of a Response
- `res.status` — check it before trusting the body
- `res.json()` parses the response body into a JavaScript object
- Public APIs like catfact.ninja, jsonplaceholder.typicode.com, and OpenWeatherMap are perfect playgrounds

### The fetch Cheat Sheet

```js
// GET with headers
fetch("https://api.example.com/courses", {
    headers: { Accept: "application/json" },
});

// POST with a JSON body
fetch("https://api.example.com/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "API Basics", level: "Beginner" }),
});
```

### Practice Endpoints

- `https://jsonplaceholder.typicode.com/todos` — fake todo data
- `https://api.github.com/users/octocat` — GitHub user info
- `https://catfact.ninja/fact` — random cat facts

### Real-World Use Cases & Rules

- Check res.ok / res.status before parsing
- GET = no body; POST/PUT carry JSON.stringify(body)
- Async/await keeps the code readable
- Use the browser DevTools Network tab to watch every request live
- Start with public APIs — zero setup, instant practice

### Key Takeaways

- fetch = the standard HTTP client for JS
- Check status, then parse JSON
- POST needs method + headers + JSON body
- Practice on public test APIs

## QUIZ: Module 1 Quiz — Pass to Unlock Module 2

Q: What is an API?
A: A type of database
A: A defined set of rules that lets software communicate
A: A programming language
A: A web browser
ANS: 1

Q: What format do most modern web APIs return?
A: XML only
A: JSON
A: HTML
A: CSV
ANS: 1

Q: Which HTTP method reads data?
A: POST
A: GET
A: DELETE
A: PUT
ANS: 1

Q: Which method creates a new resource?
A: GET
A: POST
A: PATCH
A: OPTIONS
ANS: 1

Q: What does the 4xx status group mean?
A: The server crashed
A: The request was wrong (client error)
A: Success
A: Redirection
ANS: 1

Q: What does 404 mean?
A: Bad request
A: Not found
A: Created
A: Forbidden
ANS: 1

Q: What is the difference between 401 and 403?
A: No difference
A: 401 = not authenticated; 403 = authenticated but not permitted
A: 401 = server error; 403 = success
A: 401 = redirect; 403 = timeout
ANS: 1

Q: What header tells the server the body is JSON?
A: Accept-Language
A: Content-Type: application/json
A: User-Agent
A: Cache-Control
ANS: 1

Q: What does res.json() do in fetch code?
A: Converts the response body into a JavaScript object
A: Creates a JSON file
A: Sends a request
A: Logs to console
ANS: 0

Q: What does the ?page=1 part of a URL mean?
A: It is the API version
A: A query string providing extra parameters
A: The resource id
A: The protocol
ANS: 1
