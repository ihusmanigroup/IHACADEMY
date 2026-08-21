# MODULE: Module 3 — Events, Rendering & Forms
# DURATION: 45

## TOPIC: Topic 3.1 [Unlocked]: Handling Events

## Introduction & Core Concepts

React handles events with **synthetic events** — consistent cross-browser wrappers around native browser events — using JSX attributes like `onClick`, `onChange`, and `onSubmit`.

```jsx
function Button() {
    const handleClick = () => {
        alert("Button clicked!");
    };
    return <button onClick={handleClick}>Click me</button>;
}
```

**Explanation:** `onClick` receives a function reference — NOT a function call. The function runs only when the click actually happens. In plain JavaScript you wrote `addEventListener`; in React you attach handlers directly in JSX.

**Real-world analogy:** Passing `handleClick` (without parentheses) is like giving a friend your phone number: they call you when needed. Writing `handleClick()` would be like calling yourself at the moment you hand over the number — the callback fires immediately instead of later.

### Common Events

| JSX Attribute | Fires When |
|---|---|
| `onClick` | Element clicked |
| `onChange` | Input value changes |
| `onSubmit` | Form submitted |
| `onMouseEnter` | Mouse enters element |
| `onKeyDown` | Key pressed while focused |
| `onFocus` / `onBlur` | Element gains / loses focus |

### The Event Object

React passes the synthetic event to the handler:

```jsx
const handleChange = (e) => {
    console.log(e.target.value);  // current input text
};
```

### Rules to Remember

- Handlers are functions — never call them in the attribute: `onClick={handleClick}`, not `onClick={handleClick()}`
- Inline arrow functions are fine for small logic: `onClick={() => setCount(count + 1)}`
- Prevent default browser behavior with `e.preventDefault()` in forms
- Remove event listeners yourself? Not needed — React cleans up automatically

### Real-World Use Cases & Rules

- Keep handler logic in named functions for readability
- Use e.target to find what was clicked or changed
- Forms: intercept the submit event with preventDefault, then process the data

### Key Takeaways

- React events are JSX attributes: onClick, onChange, onSubmit
- Pass function references, not calls
- e.target gives you the element and its value
- preventDefault() stops reloads in forms

## TOPIC: Topic 3.2 [Locked — Requires 3.1 Completion]: Conditional Rendering

## Introduction & Core Concepts

**Conditional rendering** means the component renders different JSX based on state or props — using the exact same `if` and ternary logic you know from JavaScript.

```jsx
import { useState } from "react";

function LoginStatus({ isLoggedIn }) {
    return isLoggedIn ? <p>Welcome back!</p> : <p>Please log in.</p>;
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <div>
            <LoginStatus isLoggedIn={isLoggedIn} />
            <button onClick={() => setIsLoggedIn(!isLoggedIn)}>
                {isLoggedIn ? "Log out" : "Log in"}
            </button>
        </div>
    );
}
```

**Explanation:** The ternary `isLoggedIn ? <p>A</p> : <p>B</p>` picks one of two pieces of JSX. When state changes, React re-renders and the other branch shows — this is how loading screens, error states, and empty states appear and disappear.

**Real-world analogy:** Conditional rendering is like a restaurant menu that exists in two versions — lunch and dinner. Depending on the time of day (the condition), the host hands you one menu or the other. Same restaurant, different menu shown.

### Techniques

| Technique | When to Use | Example |
|---|---|---|
| Ternary | Two branches | `isLoading ? <Spinner/> : <Content/>` |
| && operator | Show-or-nothing | `hasError && <ErrorBox/>` |
| Early return | Whole component branch | `if (!user) return <LoginPrompt/>;` |

### Real-World Use Cases & Rules

- `{isAdmin && <AdminPanel/>}` renders AdminPanel only when isAdmin is true
- `{items.length === 0 ? <EmptyState/> : <List items={items}/>}` handles empty data gracefully
- Never render raw booleans: `{count && ...}` renders "0" when count is 0 — use an explicit comparison
- Conditions can live anywhere inside the JSX

### Code Example / Implementation

```jsx
function OrderSummary({ items }) {
    if (items.length === 0) {
        return <p>Your cart is empty.</p>;
    }
    return <p>{items.length} item(s) in cart.</p>;
}
```

### Key Takeaways

- Same if/ternary/&& logic as plain JavaScript
- Ternary for two branches, && for show-or-nothing, early returns for big branches
- Guard against rendering 0 or false accidentally
- React re-evaluates conditions on every render

## TOPIC: Topic 3.3 [Locked — Requires 3.2 Completion]: Lists & Keys

## Introduction & Core Concepts

Rendering lists in React means converting an array of data into an array of JSX elements — almost always with `.map()`. Each item needs a **key**: a stable, unique identifier that React uses to track items when the list changes.

```jsx
function StudentList({ students }) {
    return (
        <ul>
            {students.map((student) => (
                <li key={student.id}>{student.name}</li>
            ))}
        </ul>
    );
}
```

**Explanation:** For each student, `.map()` produces one `<li>` containing the name. The `key` prop (`student.id`) tells React which item is which when items are added, removed, or reordered — so it can update only what changed instead of re-rendering the whole list.

**Real-world analogy:** Keys are like student ID numbers on a school roster. When a student transfers out or a new one joins, the office tracks people by ID — not by memory of names — so records stay correct without rewriting the whole roster.

### Key Rules

- Keys must be **unique among siblings**
- Prefer stable IDs from your data; never use array index when items can reorder
- Keys are a hint for React — they are not rendered into the DOM
- Every mapped element needs a key, including the top-level element in each map

### Real-World Use Cases & Rules

- `{data.map(item => <Item key={item.id} {...item} />)}` is the universal pattern
- Use index keys only for static lists that never change order
- Keys fix the most common React console warning you'll see

### Code Example / Implementation

```jsx
const courses = [
    { id: 1, title: "HTML" },
    { id: 2, title: "CSS" },
    { id: 3, title: "JavaScript" },
];

function CourseList() {
    return (
        <ul>
            {courses.map((c) => (
                <li key={c.id}>{c.title}</li>
            ))}
        </ul>
    );
}
```

### Key Takeaways

- .map() turns data arrays into JSX lists
- Every item needs a unique, stable key
- Prefer IDs over array indexes
- Keys keep lists fast and correct during updates

## TOPIC: Topic 3.4 [Locked — Requires 3.3 Completion]: Forms & Submissions

## Introduction & Core Concepts

Building forms in React combines everything so far: controlled inputs (state), onChange handlers, and onSubmit with preventDefault.

```jsx
import { useState } from "react";

function RegistrationForm() {
    const [form, setForm] = useState({ name: "", email: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitted:", form);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
            />
            <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
            />
            <button type="submit">Register</button>
        </form>
    );
}
```

**Explanation:** One state object holds the whole form. The input's `name` attribute (which exactly matches the state key) and the dynamic key `[name]` let ONE handler serve every field — a clean pattern you'll see in real codebases. On submit, `e.preventDefault()` stops the page from reloading and the data is ready to send to a server or API.

**Real-world analogy:** This form pattern is like a shared clipboard in a survey: every field (name, email) is written to the same form sheet (state object), and when the respondent finishes, the sheet (submission) goes to the office — no individual field is ever out of sync with the sheet.

### Real-World Use Cases & Rules

- One `handleChange` with name-based dynamic keys handles all fields
- Always preventDefault() on submit
- Validate before submitting: check required fields, email format, password length
- On success, reset the form by setting state back to the initial values

### Code Example / Implementation

```jsx
const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
        alert("Please fill in all fields.");
        return;
    }
    console.log("Validated submission:", form);
};
```

### Key Takeaways

- Forms = controlled inputs + one change handler + onSubmit with preventDefault
- Dynamic keys ([name]) let one handler serve all fields
- Validate before you submit
- Reset by restoring initial state

## QUIZ: Module 3 Quiz — Pass to Unlock Module 4

Q: How do you attach a click handler in React?
A: onClick="handleClick()"
A: onClick={handleClick}
A: click="handleClick"
A: addEventListener directly in JSX
ANS: 1

Q: Why must you NOT write onClick={handleClick()}?
A: It is slower
A: The function runs immediately instead of when clicked
A: It breaks the syntax highlighter
A: It deletes the handler
ANS: 1

Q: What does e.preventDefault() do in a form handler?
A: Stops the page from reloading on submit
A: Disables all buttons
A: Clears the console
A: Hides the form
ANS: 0

Q: What does the ternary `isLoggedIn ? <A/> : <B/>` do?
A: Renders both A and B
A: Renders A when isLoggedIn is true, otherwise B
A: Throws an error
A: Renders neither
ANS: 1

Q: Which technique renders something only when a condition is true?
A: {condition && <Thing/>}
A: {condition || <Thing/>}
A: {condition + <Thing/>}
A: {condition * <Thing/>}
ANS: 0

Q: Why must mapped list items have keys?
A: To style them
A: React uses keys to track items during updates
A: Keys are required by the browser
A: To make them clickable
ANS: 1

Q: What is the best key for a list item?
A: The array index
A: A stable unique ID from the data
A: The item's position in the list
A: The string "item"
ANS: 1

Q: What does .map() return in a React list render?
A: A string
A: An array of JSX elements
A: The original array unchanged
A: A single div
ANS: 1

Q: How does one handleChange serve every input field?
A: By using the field's name attribute as a dynamic state key
A: By calling setForm for each input separately
A: It cannot — each field needs its own handler
A: By using alert()
ANS: 0

Q: Which attribute should each input have so the shared handler knows which field it is?
A: type
A: name
A: placeholder
A: maxlength
ANS: 1
