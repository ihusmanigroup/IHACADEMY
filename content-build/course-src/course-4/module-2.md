# MODULE: Module 2 — Props & State
# DURATION: 45

## TOPIC: Topic 2.1 [Unlocked]: Props: Passing Data Down

## Introduction & Core Concepts

**Props** (short for "properties") are how a parent component passes data to a child component. They are read-only inputs — a component can never modify its own props.

```jsx
function Welcome({ name, course }) {
    return (
        <p>
            Welcome, {name}! You are taking {course}.
        </p>
    );
}

function App() {
    return <Welcome name="Ali" course="React" />;
}
```

**Explanation:** In `App`, the props `name` and `course` are passed like HTML attributes. Inside `Welcome`, they arrive as a single `props` object, which we destructure for clarity: `({ name, course })`.

**Expected output:** "Welcome, Ali! You are taking React."

**Real-world analogy:** Props are like filling out a shipping label — the parent (sender) writes the details (data) on the box, and the child (carrier) receives the box and reads the label. The carrier never rewrites the label; it only reads it.

### The Rules of Props

- Props flow **one way**: parent → child (this is called unidirectional data flow)
- Props are **read-only**: children must never mutate them
- Any JavaScript value can be a prop: strings, numbers, booleans, arrays, objects, functions
- Default values are possible: `function Card({ title = "Untitled" })`

### Real-World Use Cases & Rules

- Reuse a component with different data by passing different props
- Pass functions as props to let children communicate UP to parents (more on this in the next topic)
- Props make components predictable: same props, same output

### Code Example / Implementation

```jsx
function ProductCard({ name, price, inStock }) {
    return (
        <div className="product">
            <h3>{name}</h3>
            <p>${price}</p>
            <span>{inStock ? "In stock" : "Sold out"}</span>
        </div>
    );
}
```

### Key Takeaways

- Props carry data from parent to child
- Props are read-only inputs
- One-way data flow keeps components predictable
- Destructure props in the function signature

## TOPIC: Topic 2.2 [Locked — Requires 2.1 Completion]: State: Data That Changes

## Introduction & Core Concepts

**State** is data that changes over time and causes React to re-render the UI when it changes. Without state, React would just be static HTML templates.

```jsx
import { useState } from "react";

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>Click me</button>
        </div>
    );
}
```

**Explanation:**
- `useState(0)` declares a state variable `count` starting at 0
- `useState` returns a pair: the current value (`count`) and an updater function (`setCount`)
- Calling `setCount(count + 1)` updates the value AND tells React to re-render the component
- The UI always reflects the current state — you never touch the DOM manually

**Expected output:** Each click increases the number by 1 and updates the screen instantly.

**Real-world analogy:** State is like a scoreboard at a sports game. The scoreboard operator (React) updates the display whenever the score (state) changes — and every fan in the stadium (the UI) instantly sees the new number. You don't repaint the board; you update the value.

### State Rules

- State changes must go through the updater function (`setCount`), never by direct assignment like `count = 5`
- Calling the updater schedules a re-render — the component function runs again with the new value
- State is local to the component that declares it
- Only state that affects the UI needs to be state; static values can be plain variables

### Real-World Use Cases & Rules

- useState is a hook — all hooks start with "use" and follow the Rules of Hooks
- The updater can accept a function form for updates based on the previous value: `setCount(c => c + 1)`
- Each component instance has its own independent state

### Code Example / Implementation

```jsx
import { useState } from "react";

function Toggle() {
    const [isOn, setIsOn] = useState(false);

    return (
        <button onClick={() => setIsOn(!isOn)}>
            {isOn ? "ON" : "OFF"}
        </button>
    );
}
```

### Key Takeaways

- State = data that changes; changing it re-renders the UI
- useState returns [value, updaterFunction]
- Never mutate state directly — always use the updater
- State is local to its component

## TOPIC: Topic 2.3 [Locked — Requires 2.2 Completion]: Controlled Inputs & Two-Way Flow

## Introduction & Core Concepts

A **controlled input** is a form field whose value is driven by React state — the input shows exactly what the state holds, and every keystroke updates the state.

```jsx
import { useState } from "react";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <form>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
        </form>
    );
}
```

**Explanation:** The value of each input is `email` / `password` state, and every change event (each keystroke) calls the updater. Because the state and the input are always in sync, React is the single source of truth for the form.

**Real-world analogy:** A controlled input is like a bank teller's screen: the customer writes a deposit slip (types into the input), and the teller updates the ledger (state) — the screen and ledger never disagree because every slip goes through the teller.

### Why Control Matters

- The form's value is always predictable — it lives in state, not hidden inside the DOM
- You can validate, transform, or restrict input (e.g., force uppercase) by processing the value in the updater
- It is the standard, reliable pattern used by virtually all real React forms

### Real-World Use Cases & Rules

- value={state} + onChange={(e) => setState(e.target.value)} is the pattern
- The event object (e) carries e.target.value — the current text in the field
- Controlled inputs make validation and submission trivial

### Code Example / Implementation

```jsx
function SearchBox({ onSearch }) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();          // prevent page reload
        onSearch(query);             // pass the value up
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
            <button type="submit">Search</button>
        </form>
    );
}
```

### Key Takeaways

- Controlled inputs: value = state, onChange updates state
- React is the single source of truth for the form
- e.target.value holds the current field text
- preventDefault() stops the page from reloading on submit

## TOPIC: Topic 2.4 [Locked — Requires 2.3 Completion]: Lifting State Up

## Introduction & Core Concepts

When two or more components need to share the same data, the data must live in their **closest common parent** — this is called **lifting state up**. The parent holds the state and passes it down via props, along with updater functions so children can change it.

```jsx
import { useState } from "react";

function TemperatureDisplay({ celsius }) {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return (
        <div>
            <p>Celsius: {celsius}°C</p>
            <p>Fahrenheit: {fahrenheit.toFixed(1)}°F</p>
        </div>
    );
}

function Slider({ value, setValue }) {
    return (
        <input
            type="range"
            min="-20"
            max="50"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
        />
    );
}

function App() {
    const [celsius, setCelsius] = useState(20);
    return (
        <div>
            <Slider value={celsius} setValue={setCelsius} />
            <TemperatureDisplay celsius={celsius} />
        </div>
    );
}
```

**Explanation:** The state `celsius` lives in `App`, the common parent of `Slider` and `TemperatureDisplay`. `Slider` receives the value and the updater as props; `TemperatureDisplay` receives only the value. When the slider moves, state changes, and BOTH children re-render with the new value — the display updates instantly in both units.

**Real-world analogy:** Lifting state up is like a school's central timetable: all classrooms (components) read the schedule from the main office (the common parent), which holds the single official copy. No classroom keeps its own version — everyone stays in sync automatically.

### When to Lift State

- Two siblings must show or change the same data
- The state controls what several components render
- If a child's state is needed by its parent or siblings, move it to the parent

### Real-World Use Cases & Rules

- State flows down as props; updates flow up through callbacks (functions passed as props)
- The parent is the single source of truth
- Every component gets exactly the props it needs — no more, no less
- This pattern (state up, events down) is the foundation of nearly every React app

### Code Example / Implementation

```jsx
function App() {
    const [isDark, setIsDark] = useState(false);

    return (
        <div className={isDark ? "dark" : "light"}>
            <Header />
            <Toolbar onToggleTheme={() => setIsDark(!isDark)} />
        </div>
    );
}
```

### Key Takeaways

- Share data by lifting state to the closest common parent
- Data flows down (props); changes flow up (callbacks)
- The parent is the single source of truth
- Siblings stay in sync automatically

## QUIZ: Module 2 Quiz — Pass to Unlock Module 3

Q: What are props?
A: Data passed from a parent component to a child component
A: Data stored in the database
A: CSS classes
A: Global variables
ANS: 0

Q: Can a component change its own props?
A: Yes, with setProps()
A: No, props are read-only
A: Yes, by reassigning them
A: Only on Tuesdays
ANS: 1

Q: Which direction do props flow in React?
A: Child to parent
A: Both directions freely
A: Parent to child
A: Randomly
ANS: 2

Q: What does useState(0) return?
A: The value 0
A: A pair: the current value and an updater function
A: A promise
A: A component
ANS: 1

Q: What happens when you call setCount(count + 1)?
A: The page reloads
A: The component re-renders with the new value
A: The browser closes
A: Nothing
ANS: 1

Q: Why should you never write count = 5 directly?
A: It is slower
A: It does not trigger a re-render, so the UI would not update
A: It deletes the variable
A: It is only forbidden in production
ANS: 1

Q: What is a controlled input?
A: An input whose value is driven by React state
A: An input without a label
A: A disabled input
A: An input that is never updated
ANS: 0

Q: Where does e.target.value come from in an onChange handler?
A: A random number generator
A: The current text content of the input field
A: The database
A: The component name
ANS: 1

Q: When should you lift state up?
A: When a component becomes too large
A: When multiple components need to share the same data
A: When the page loads
A: Never — state must stay local
ANS: 1

Q: In the lifted-state pattern, what flows down and what flows up?
A: Events flow down, state flows up
A: Props (data) flow down, updates flow up through callbacks
A: Both flow sideways
A: Nothing flows
ANS: 1
