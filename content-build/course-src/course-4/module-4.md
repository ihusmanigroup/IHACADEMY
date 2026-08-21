# MODULE: Module 4 — Hooks, Best Practices & Real-World Use
# DURATION: 45

## TOPIC: Topic 4.1 [Unlocked]: useEffect & Side Effects

## Introduction & Core Concepts

**Side effects** are things that reach outside the component's render: fetching data from an API, setting a browser title, timers, or subscribing to services. These belong in `useEffect`.

```jsx
import { useState, useEffect } from "react";

function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);  // cleanup
    }, []);

    return <p>{time.toLocaleTimeString()}</p>;
}
```

**Explanation:**
- `useEffect(() => {...}, [])` runs the effect after the component renders
- The empty dependency array `[]` means "run once on mount" — the timer starts once
- The **cleanup function** (`clearInterval`) runs when the component unmounts — preventing memory leaks
- With a dependency array like `[userId]`, the effect re-runs whenever `userId` changes

**Real-world analogy:** useEffect is like a hotel housekeeping schedule: the effect is the daily clean (runs after you check in — mount), the dependency array says which room changes trigger a reclean, and the cleanup is the checkout sweep that makes sure no towels are left behind (no memory leaks).

### The Three Shapes of useEffect

| Pattern | When It Runs | Use Case |
|---|---|---|
| `useEffect(fn)` | After every render | Rarely needed; usually a bug |
| `useEffect(fn, [])` | Once on mount | Timers, initial data fetch |
| `useEffect(fn, [dep])` | When dep changes | Fetch data for selected item |

### Real-World Use Cases & Rules

- Data fetching on mount: fetch inside the effect, store results with useState
- Always clean up timers, intervals, and subscriptions
- Effects run AFTER the DOM updates, never during render
- Don't forget the dependency array — it prevents infinite loops

### Code Example / Implementation

```jsx
useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.example.com/user/${userId}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setUser(data));
    return () => controller.abort();  // cancel in-flight request
}, [userId]);
```

### Key Takeaways

- useEffect runs side effects after render
- Dependency array controls when it re-runs
- Always clean up timers and subscriptions
- Standard home for API calls

## TOPIC: Topic 4.2 [Locked — Requires 4.1 Completion]: Rules of Hooks

## Introduction & Core Concepts

Hooks (`useState`, `useEffect`, and others) are functions that let components use state and lifecycle features. They work because React relies on the **order** of their calls — which is why there are strict rules.

### The Two Rules

1. **Only call hooks at the top level** — never inside loops, conditionals, or nested functions.
2. **Only call hooks from React functions** — components or custom hooks, never plain JavaScript functions.

```jsx
// ❌ BAD: conditional hook call
function Bad({ isLoggedIn }) {
    if (isLoggedIn) {
        useEffect(fetchData);  // order changes between renders!
    }
    return <p>Hello</p>;
}

// ✅ GOOD: always called, in the same order
function Good({ isLoggedIn }) {
    useEffect(fetchData);
    return <p>Hello</p>;
}
```

**Explanation:** On every render React must see the same hooks in the same order — that's how it maps state back to the right component. If a hook is skipped one render and present the next, React loses track of which state belongs where.

**Real-world analogy:** Hooks are like numbered lockers in a gym. The members (hooks) always check in at their assigned lockers in the same order, every visit. If one member suddenly switches lockers mid-week (conditional call), the staff (React) can't find anyone's gear — everything gets scrambled.

### Custom Hooks: Reusable Logic

A **custom hook** is a function starting with `use` that wraps other hooks — the way to share stateful logic between components:

```jsx
function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return width;
}
```

### Real-World Use Cases & Rules

- Hooks only at the top level, only in React functions
- Name custom hooks with `use`
- Custom hooks are just functions that use other hooks
- When logic repeats across components, extract a custom hook

### Key Takeaways

- Top-level only; same order every render
- Hooks only inside components or custom hooks
- Custom hooks (useXxx) share logic between components
- Violating the rules causes hard-to-find bugs

## TOPIC: Topic 4.3 [Locked — Requires 4.2 Completion]: React Best Practices

## Introduction & Core Concepts

Professional React code is built on habits that keep large apps maintainable.

### The Checklist

- **Components are small and single-purpose** — one component, one job; split long components
- **Props stay read-only and minimal** — pass exactly what a component needs
- **State lives as high as needed, as low as possible** — lift for sharing, keep local when isolated
- **Keys are stable IDs** — never random values or reordering indexes
- **Hooks follow the Rules of Hooks** — top level, consistent order
- **Handlers are named functions, not inline logic** where readability matters
- **Extract reusable logic into custom hooks**
- **Use functional updates** — `setCount(c => c + 1)` when the new value depends on the old one

### The Thinking Behind It

- Predictability: same props + same state = same UI
- Testability: small components are easy to test in isolation
- Readability: a component file you can read top-to-bottom without jumping around
- Performance: unnecessary state and giant components are the usual culprits, not React itself

**Real-world analogy:** Best practices are like a kitchen's mise en place: ingredients chopped and organized before service. A chef who preps everything (small components, clean props) cooks faster and handles a rush (a growing app) without chaos — while an improvised kitchen burns down at scale.

### Code Example / Implementation

```jsx
function useUser(id) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        fetch(`/api/users/${id}`)
            .then((r) => r.json())
            .then(setUser);
    }, [id]);
    return user;
}
```

### Key Takeaways

- Small components, minimal props, sensible state placement
- Stable keys, Rules of Hooks, named handlers
- Custom hooks for repeated logic
- Predictable code scales; clever code doesn't

## TOPIC: Topic 4.4 [Locked — Requires 4.3 Completion]: Real-World Usage & Capstone

## Introduction & Core Concepts

React powers the user interfaces of Facebook, Instagram, Netflix, Airbnb, Uber, Discord, and thousands of other products. Real apps combine components, props, state, effects, forms, and conditional rendering with two extra tools you'll learn next: **React Router** (multiple pages without reloads) and **data fetching** from APIs. Professional React apps are built with a build tool like Vite, and often TypeScript, and are deployed to platforms like Vercel or Netlify.

### Capstone: Todo List App

This app uses every concept from this course — state, props, controlled inputs, events, lists with keys, and conditional rendering:

```jsx
import { useState } from "react";

function TodoApp() {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState("");

    const addTodo = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setTodos([...todos, { id: Date.now(), text, done: false }]);
        setText("");
    };

    const toggleTodo = (id) => {
        setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    };

    return (
        <div>
            <h1>My Todos</h1>
            <form onSubmit={addTodo}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What needs doing?"
                />
                <button type="submit">Add</button>
            </form>
            {todos.length === 0 ? (
                <p>No todos yet — add one above.</p>
            ) : (
                <ul>
                    {todos.map((todo) => (
                        <li
                            key={todo.id}
                            onClick={() => toggleTodo(todo.id)}
                            style={{ textDecoration: todo.done ? "line-through" : "none" }}
                        >
                            {todo.text}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default TodoApp;
```

**Explanation:** The form is a controlled input that adds todos to state. Clicking a todo toggles it done. The list is rendered with `.map()` and stable keys (`Date.now()`), the empty state uses a ternary, and the text decoration is a computed inline style. This is a miniature version of real todo apps — and a classic first portfolio project.

### Your Next Steps

1. Build the todo app, then add a delete button and a "clear completed" button
2. Split it into TodoList, TodoItem, and TodoForm components
3. Learn React Router and data fetching from APIs next
4. Join a real codebase — everything you see there is built from these foundations

### Key Takeaways

- React is the UI standard for major web products
- The todo capstone applies every module concept
- Next: routing, API data fetching, TypeScript
- Keep building — portfolio projects compound your skills

## QUIZ: Module 4 Quiz — Pass to Complete the Course

Q: What is a side effect in React?
A: A CSS animation
A: Work that reaches outside the component, like API calls or timers
A: A re-render
A: An error in the console
ANS: 1

Q: What does useEffect(fn, []) do?
A: Runs after every render
A: Runs once when the component mounts
A: Runs before the render
A: Never runs
ANS: 1

Q: What is the cleanup function inside useEffect for?
A: To speed up rendering
A: To remove timers, subscriptions, or in-flight requests when the component unmounts
A: To reset state
A: To delete the browser history
ANS: 1

Q: Where can hooks be called?
A: Inside loops
A: Inside conditionals
A: Only at the top level of components or custom hooks
A: Anywhere in JavaScript
ANS: 2

Q: Why must hooks always run in the same order?
A: React maps state to components by call order
A: The browser requires it
A: It is only for performance
A: It is a lint rule with no functional reason
ANS: 0

Q: What is a custom hook?
A: A component that renders nothing
A: A function starting with "use" that wraps other hooks
A: A special CSS class
A: A database query
ANS: 1

Q: Why should components stay small and single-purpose?
A: They are easier to read, test, and maintain
A: They run faster in all cases
A: It is required by the browser
A: Small components cannot have bugs
ANS: 0

Q: When should you use the functional update form setCount(c => c + 1)?
A: Never
A: When the new value depends on the previous value
A: Only for arrays
A: Only when the count is negative
ANS: 1

Q: What does the todo app use to give each item a stable key?
A: The array index
A: The text content
A: Date.now()
A: A random number regenerated on every render
ANS: 2

Q: What should you learn next after mastering these React basics?
A: React Router and data fetching from APIs
A: HTML tables
A: CSS colors
A: There is nothing more to learn
ANS: 0
