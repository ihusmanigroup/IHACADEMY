# MODULE: Module 1 — Components & JSX
# DURATION: 45

## TOPIC: Topic 1.1 [Unlocked]: What is React?

## Introduction & Core Concepts

React is a free, open-source JavaScript library, created by Meta (Facebook) in 2013, for building user interfaces — especially single-page applications (SPAs) where the page updates dynamically without full reloads. React is a **library**, not a framework: it handles the view layer, and you choose the rest of your tools.

The core idea: **everything is a component**. You build small, reusable pieces (buttons, cards, forms) and compose them into pages.

**Real-world analogy:** React components are like LEGO bricks. Instead of molding one giant block, you snap standard bricks together. Every brick is reusable, replaceable, and you can build anything from a simple card to a full dashboard.

### How React Thinks

1. **Component-based**: UI is broken into isolated, reusable pieces
2. **Declarative**: You describe what the UI should look like for a given state; React handles updating the DOM
3. **Virtual DOM**: React keeps a lightweight copy of the DOM in memory, compares it to the new one, and applies only the differences — this is why updates are fast

### How a React App Boots

```
main.jsx ──► <App /> component tree
              │
              ▼
        React renders components
              │
              ▼
      Virtual DOM diffing
              │
              ▼
    Real DOM updated minimally
```

### Real-World Use Cases & Rules

- React is used by Facebook, Instagram, Netflix, Airbnb, and countless other companies
- React only handles the UI; routing (React Router), state (Redux/Zustand), and data fetching are separate choices
- A React app is a tree of components starting from `<App />`
- Learning React requires solid JavaScript fundamentals (functions, objects, arrays, ES6 syntax)

### Key Takeaways

- React is a JS library for building component-based UIs
- Declarative + Virtual DOM = fast, predictable updates
- Reusable components are the heart of every React app
- JavaScript first, then React

## TOPIC: Topic 1.2 [Locked — Requires 1.1 Completion]: JSX Fundamentals

## Introduction & Core Concepts

**JSX (JavaScript XML)** looks like HTML but lives inside JavaScript. It's a syntax extension that lets you describe UI structure directly in your component code.

```jsx
function Greeting() {
    return (
        <div>
            <h1>Hello, world!</h1>
            <p>Welcome to React.</p>
        </div>
    );
}
```

**Explanation:** JSX is not HTML — browsers can't read it directly. A build tool (like Vite) transpiles it into normal JavaScript function calls that create the elements. In practice, you write JSX like HTML with a few key differences.

### Key JSX Rules

| Rule | Example |
|---|---|
| Every JSX expression needs exactly one root element | Wrap siblings in a `<div>` or a fragment `<>...</>` |
| Use `className`, not `class` | `<div className="card">` |
| Embed JS with `{ }` | `<h1>{title}</h1>` |
| Self-close empty tags | `<img src={url} alt=""/>` |
| Inline styles are objects with camelCase keys | `style={{ color: "red" }}` |
| Comments in JSX: `{/* ... */}` | `{/* renders nothing */}` |

### Embedding Expressions

```jsx
function Profile() {
    const name = "Samira";
    const age = 25;
    return (
        <p>
            {name} is {age} years old and lives in{" "}
            {`New York`}.
        </p>
    );
}
```

**Expected output:** Renders "Samira is 25 years old and lives in New York." — the values are computed in JavaScript and inserted into the text.

**Real-world analogy:** JSX is like a mad-libs template. The words and pictures are fixed, and the `{ }` blanks get filled with live values from your JavaScript at render time.

### Real-World Use Cases & Rules

- One root element per component return
- `className` instead of `class`
- Anything between `{ }` is real JavaScript
- Naming: components are PascalCase (`Profile`, not `profile`)

### Code Example / Implementation

```jsx
function StudentCard({ name, course }) {
    return (
        <div className="card">
            <h2>{name}</h2>
            <p>Enrolled in {course}</p>
        </div>
    );
}
```

### Key Takeaways

- JSX = HTML-like syntax inside JavaScript
- `{ }` escapes into JavaScript; `className` replaces `class`
- One root element per component
- Components are PascalCase functions that return JSX

## TOPIC: Topic 1.3 [Locked — Requires 1.2 Completion]: Components & Composition

## Introduction & Core Concepts

A **component** is a JavaScript function (or class) that returns JSX. Components can be reused anywhere, and larger components are built by composing smaller ones.

```jsx
function Avatar({ name }) {
    return <img src={`https://avatar.example/${name}.png`} alt={name} />;
}

function UserCard({ user }) {
    return (
        <div className="card">
            <Avatar name={user.name} />
            <h2>{user.name}</h2>
            <p>{user.role}</p>
        </div>
    );
}

function Dashboard() {
    const users = [
        { name: "Ali", role: "Student" },
        { name: "Lee", role: "Instructor" },
    ];
    return (
        <div>
            {users.map((user) => (
                <UserCard key={user.name} user={user} />
            ))}
        </div>
    );
}
```

**Explanation:** `Dashboard` renders a list of users using `.map()`, passing each user object to `UserCard` as a prop. `UserCard` composes `Avatar` inside itself. This is **composition** — building rich UIs from small pieces.

### Why Composition Wins

- **Reuse**: write once, render many times
- **Isolation**: fix a bug in one card, not in the whole page
- **Readability**: each component has one clear job
- **Testability**: test a small component in isolation

### Component Rules

- Component names must start with a capital letter (this is what React uses to tell components apart from HTML tags)
- A component must return exactly one root element
- A component receives `props` (read-only inputs) and renders JSX

### Real-World Use Cases & Rules

- Build a component tree: pages compose sections, sections compose cards
- Map over arrays of data to render lists of components
- Each component should do one job
- Props flow one way: parent to child

### Code Example / Implementation

```jsx
function Button({ label, onClick }) {
    return <button onClick={onClick}>{label}</button>;
}
```

### Key Takeaways

- Components = functions returning JSX
- Compose small components to build big interfaces
- Components are PascalCase and take props
- Map over data to render lists

## TOPIC: Topic 1.4 [Locked — Requires 1.3 Completion]: Setting Up a React Project

## Introduction & Core Concepts

The fastest, officially recommended way to create a React project is **Vite**, a modern build tool that's faster than older tools like Create React App.

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

**Explanation:**
- The first command scaffolds a new React project with Vite
- `npm install` downloads the project's dependencies
- `npm run dev` starts a local development server (usually at http://localhost:5173) with hot reload — edits appear instantly

### Project Structure

```
my-app/
 ├── index.html          ← the single HTML page
 ├── package.json        ← project metadata & dependencies
 └── src/
      ├── main.jsx       ← entry point; renders <App /> into the DOM
      ├── App.jsx        ← root component
      └── index.css      ← global styles
```

### What main.jsx Does

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

**Explanation:** `main.jsx` is the app's entry point. It grabs the `<div id="root">` element from `index.html`, creates a React root, and renders the entire component tree starting from `<App />`. StrictMode is a development helper that highlights potential problems.

### Real-World Use Cases & Rules

- Vite + React is the modern standard setup
- One root div; the whole app renders inside it — that's why it's called a SPA (single-page application)
- `npm run dev` for development; `npm run build` creates optimized production files
- Components live in `src/`, one component per file by convention

### Code Example / Implementation

```jsx
// src/App.jsx
import "./App.css";

function App() {
    return <h1>Welcome to my first React app!</h1>;
}

export default App;
```

### Key Takeaways

- Vite scaffolds a fast modern React project
- main.jsx mounts the app into #root
- npm run dev = instant hot-reload development
- One component per file in src/

## QUIZ: Module 1 Quiz — Pass to Unlock Module 2

Q: What is React?
A: A CSS preprocessor
A: A JavaScript library for building user interfaces
A: A database management system
A: An HTML templating language
ANS: 1

Q: How does React keep updates fast?
A: By reloading the page on every change
A: By using a Virtual DOM to apply only minimal changes
A: By writing directly to disk
A: By disabling animations
ANS: 1

Q: Why is JSX transpiled before the browser reads it?
A: Browsers cannot read JSX directly
A: It improves internet speed
A: It changes the language to Python
A: It is not transpiled at all
ANS: 0

Q: Which attribute replaces "class" in JSX?
A: classname
A: cssClass
A: className
A: class
ANS: 2

Q: How do you embed a JavaScript expression in JSX?
A: {{ expression }}
A: ${ expression }
A: { expression }
A: <% expression %>
ANS: 2

Q: What is a component in React?
A: A CSS file
A: A function that returns JSX
A: A database table
A: A browser extension
ANS: 1

Q: Why should component names start with a capital letter?
A: It is only a style preference
A: React uses capital letters to distinguish components from HTML tags
A: It makes the bundle smaller
A: It is required by the browser
ANS: 1

Q: What does composition mean in React?
A: Writing code without functions
A: Building large interfaces from small, reusable components
A: Compressing images
A: Merging CSS files
ANS: 1

Q: Which tool is the modern, recommended way to start a React project?
A: Vite
A: Internet Explorer
A: Dreamweaver
A: Microsoft Word
ANS: 0

Q: What does npm run dev do?
A: Deletes the project
A: Starts a development server with hot reload
A: Installs the browser
A: Compiles the database
ANS: 1
