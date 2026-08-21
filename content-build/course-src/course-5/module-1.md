# MODULE: Module 1 — The Node.js Runtime
# DURATION: 45

## TOPIC: Topic 1.1 [Unlocked]: What is Node.js?

## Introduction & Core Concepts

**Node.js** is a free, open-source JavaScript **runtime** that executes JavaScript outside the browser — most commonly on servers. It was created by Ryan Dahl in 2009 by wrapping Google Chrome's V8 JavaScript engine with server-side capabilities (file access, networking, processes).

**Explanation:** In the browser, JavaScript is confined to the page and its APIs. Node.js gives the same language access to the file system, HTTP servers, databases, and the operating system — so the language of the front end also powers the back end.

**Real-world analogy:** The browser is a sandbox playground where JavaScript is allowed to play with sand toys only. Node.js is the same child (same language) let out of the sandbox and into the workshop, where they can use the real tools: files, network, and the machine itself.

### Key Differences from Browser JavaScript

| Aspect | Browser JS | Node.js |
|---|---|---|
| What it runs on | Chrome, Firefox, Safari... | Node.js runtime |
| Document/DOM APIs | Available (`document`, `window`) | Not available |
| File system access | Not available | Available (`fs` module) |
| Creating a server | Not available | Available (`http` module) |
| Modules | ES modules / browser globals | CommonJS + ES modules |

### Where Node.js Shines

- Web servers and REST/GraphQL APIs
- Real-time apps (chat, live dashboards) via WebSockets
- Command-line tools (npm itself is a Node app)
- Build tooling: Vite, webpack, and test runners all run on Node
- Microservices and serverless functions (AWS Lambda, Vercel, Netlify)

### Real-World Use Cases & Rules

- Node.js = JavaScript runtime for servers and tools
- Node is event-driven and non-blocking by design (next topic)
- The same language powers front end AND back end — one skill set for the whole stack
- Companies using Node: Netflix, LinkedIn, Uber, PayPal, and thousands more

### Key Takeaways

- Node.js runs JavaScript outside the browser
- Built on Chrome's V8 engine; created by Ryan Dahl in 2009
- Gives JS file system, networking, and OS access
- Powers servers, CLIs, build tools, and serverless functions

## TOPIC: Topic 1.2 [Locked — Requires 1.1 Completion]: The Event Loop & Non-Blocking I/O

## Introduction & Core Concepts

Node.js is **single-threaded** but fast because it is **non-blocking**: instead of waiting for slow operations (reading files, network requests), it registers a callback and continues with the next task.

```js
const fs = require("fs");

console.log("1: Start reading file...");

fs.readFile("notes.txt", "utf8", (err, data) => {
    console.log("3: File contents:", data);
});

console.log("2: Continue without waiting!");
```

**Expected output (order matters):**
```
1: Start reading file...
2: Continue without waiting!
3: File contents: ...
```

**Explanation:** `fs.readFile` is non-blocking — Node passes it the callback and keeps running. The slow file read happens in the background; when it finishes, the callback runs. The program never freezes waiting.

**Real-world analogy:** A non-blocking server is like a café with one cashier who does NOT wait at the espresso machine. The cashier takes your order (the request), hands you a receipt with a callback (your coffee ticket), and immediately serves the next customer. When your coffee is ready, they call your name (the callback runs). The café serves many customers with one cashier; the server handles many requests with one thread.

### The Event Loop

Node keeps a single thread busy by cycling:

```
Pending callbacks (timers, I/O)
        │
        ▼
Event loop processes them one at a time
        │
        ▼
Callbacks run when their I/O completes
        │
        ▼
New events arrive; loop continues
```

### Synchronous vs Asynchronous

```js
// ❌ Blocking: stops everything while reading
const data = fs.readFileSync("big.txt", "utf8");
console.log(data);

// ✅ Non-blocking: continues, calls back later
fs.readFile("big.txt", "utf8", (err, data) => {
    console.log(data);
});
console.log("This prints first!");
```

### Real-World Use Cases & Rules

- Never use blocking operations (readFileSync) in server request handlers
- Always pass a callback that handles both success and error
- The order of console output reveals the non-blocking behavior
- The event loop is the reason Node handles thousands of concurrent connections on one thread

### Key Takeaways

- Node is single-threaded but non-blocking
- Slow operations get callbacks; the program never waits
- The event loop drives everything: timers, I/O, callbacks
- Blocking calls freeze the whole server — avoid them

## TOPIC: Topic 1.3 [Locked — Requires 1.2 Completion]: Modules: require, exports & ES Modules

## Introduction & Core Concepts

**Modules** are how Node splits code into reusable files. Two systems exist today: **CommonJS** (the traditional Node standard, using `require`) and **ES Modules** (the modern JavaScript standard, using `import`).

### CommonJS: require and module.exports

```js
// math.js
function add(a, b) {
    return a + b;
}
module.exports = { add };

// app.js
const { add } = require("./math");
console.log(add(2, 3)); // 5
```

**Explanation:** In CommonJS, every file is a module. `module.exports` decides what other files can import, and `require("./math")` loads that module — `.js` extension is optional. The `.` in the path means "relative to this file" — it's required for local files.

### ES Modules: import and export

```js
// math.mjs (or "type": "module" in package.json)
export function add(a, b) {
    return a + b;
}

// app.mjs
import { add } from "./math.mjs";
console.log(add(2, 3)); // 5
```

**Explanation:** ES Modules use the `export`/`import` keywords — the same syntax the browser uses. Modern projects (including this one, with Vite) increasingly standardize on ES Modules.

**Real-world analogy:** Modules are like a toolbox with labeled drawers: each drawer (module) holds the tools for one job, and you reach into the drawers you need (`require`/`import`) instead of carrying every tool in one giant bag.

### Built-in Core Modules

| Module | Purpose |
|---|---|
| `fs` | File system: read/write files |
| `http` | Create servers and make requests |
| `path` | Work with file paths |
| `os` | Operating system info |
| `events` | Event emitters |
| `url` | Parse URLs |

### Real-World Use Cases & Rules

- One file = one module; export what others should use
- Relative paths need a `./` prefix; core modules and npm packages don't
- Prefer ES Modules (`import`) for new projects; understand CommonJS because millions of existing packages use it
- You can require core modules directly: `require("fs")`

### Key Takeaways

- Modules split code into reusable, encapsulated files
- CommonJS: module.exports + require
- ES Modules: export + import
- Core modules: fs, http, path, os, events

## TOPIC: Topic 1.4 [Locked — Requires 1.3 Completion]: The File System (fs) Module

## Introduction & Core Concepts

The `fs` module is Node's gateway to reading and writing files. Every variant comes in two flavors: **blocking** (Sync) and **non-blocking** (async with callback).

```js
const fs = require("fs");

// READ (non-blocking)
fs.readFile("data.txt", "utf8", (err, data) => {
    if (err) {
        console.error("Failed to read:", err.message);
        return;
    }
    console.log("Contents:", data);
});

// WRITE (non-blocking)
fs.writeFile("output.txt", "Hello from Node!", (err) => {
    if (err) return console.error(err);
    console.log("File written.");
});
```

**Explanation:** The callback's first parameter is always `err` — the Node convention. Always check it: an unhandled error can crash the process. `utf8` tells Node to decode the file as text.

**Real-world analogy:** fs is the librarian: you hand it a call slip (the file path) and say what you need (read/write). It does the heavy lifting of finding the shelf, fetching the book, and returning it — you just say what and where.

### Common fs Operations

| Operation | Non-blocking | Blocking |
|---|---|---|
| Read file | `fs.readFile(path, cb)` | `fs.readFileSync(path)` |
| Write file | `fs.writeFile(path, data, cb)` | `fs.writeFileSync(path, data)` |
| Append | `fs.appendFile(path, data, cb)` | `fs.appendFileSync(path, data)` |
| Check existence | `fs.access(path, cb)` | `fs.existsSync(path)` |
| List directory | `fs.readdir(path, cb)` | `fs.readdirSync(path)` |
| Delete file | `fs.unlink(path, cb)` | `fs.unlinkSync(path)` |

### Real-World Use Cases & Rules

- Use the async (callback) forms in servers — never block the event loop
- Always handle the `err` parameter
- Use fs.promises for modern promise-based code: `const fs = require("fs").promises`
- Paths are relative to the current working directory unless absolute

### Code Example / Implementation

```js
const fs = require("fs").promises;

async function readConfig() {
    try {
        const data = await fs.readFile("config.json", "utf8");
        const config = JSON.parse(data);
        console.log("Theme:", config.theme);
    } catch (err) {
        console.error("Config missing or invalid:", err.message);
    }
}

readConfig();
```

### Key Takeaways

- fs reads and writes files; every op has sync and async versions
- Async versions for servers; callback's first param is err
- JSON.parse turns file text into objects
- fs.promises gives clean async/await syntax

## QUIZ: Module 1 Quiz — Pass to Unlock Module 2

Q: What is Node.js?
A: A CSS framework
A: A JavaScript runtime for running JS outside the browser
A: A database
A: A web browser
ANS: 1

Q: Which JavaScript engine powers Node.js?
A: SpiderMonkey
A: JavaScriptCore
A: V8
A: Chakra
ANS: 2

Q: What can Node.js do that browser JavaScript cannot?
A: Manipulate the DOM
A: Access the file system and create servers
A: Play videos
A: Style pages with CSS
ANS: 1

Q: What does "non-blocking" mean in Node.js?
A: The server crashes on slow operations
A: The program continues running instead of waiting for slow operations
A: Only one request can be handled
A: Files are always read synchronously
ANS: 1

Q: In the example, why does "2: Continue..." print before "3: File contents..."?
A: The file is empty
A: fs.readFile finishes later because it runs in the background
A: Console printing is broken
A: It is a random ordering
ANS: 1

Q: What is the purpose of module.exports?
A: To delete a module
A: To decide what other files can import from the module
A: To log output
A: To restart the server
ANS: 1

Q: Which syntax do ES Modules use for importing?
A: require()
A: import { x } from ...
A: include()
A: load()
ANS: 1

Q: Which core module is used to read and write files?
A: http
A: path
A: fs
A: os
ANS: 2

Q: What is the first parameter of a Node callback function?
A: The result
A: The error
A: The path
A: The file size
ANS: 1

Q: Why should servers use async (non-blocking) file operations?
A: To make code shorter
A: Blocking operations freeze the entire server
A: Sync versions are broken
A: It is a personal preference
ANS: 1
