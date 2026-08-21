# MODULE: Module 1 — Foundations & Core Concepts
# DURATION: 45

## TOPIC: Topic 1.1 [Unlocked]: Introduction to JavaScript & A Short History

## Introduction & Core Concepts

JavaScript is the language that makes web pages **interactive**. If HTML is the structure of a house and CSS is the paint and decoration, JavaScript is the electricity and plumbing — it makes things move, respond, and react. A button that shows a pop-up when clicked, a form that checks your password strength as you type, an image slider that changes automatically — all of these are powered by JavaScript.

```
HTML          →  structure (walls, rooms)
CSS           →  style (paint, furniture)
JavaScript    →  behavior (lights, switches, movement)
```

Unlike HTML and CSS, JavaScript is a true **programming language**. That means it has variables, logic, loops, and functions — the building blocks used to tell the computer exactly what to do, step by step. This course assumes no prior programming experience and explains every concept from the ground up.

### A Short History

JavaScript was created in 1995 by Brendan Eich, an engineer at Netscape, in just ten days. Despite the name, JavaScript has almost no relation to Java — the similar name was mostly a marketing decision at the time. Early JavaScript was used for small tricks like validating a form before it was submitted.

Over time, JavaScript grew enormously. In 2009, Node.js allowed JavaScript to run outside the browser, on servers. In 2015, a major update called **ES6 (ECMAScript 2015)** modernized the language significantly, introducing features like `let`, `const`, and arrow functions that are now considered standard. Today, JavaScript is one of the most widely used programming languages in the world, powering both websites and many mobile and desktop applications.

### Real-World Use Cases & Rules

- JavaScript powers the interactive parts of nearly every modern website
- Frameworks like React, Vue, and Angular are all built on core JavaScript
- Node.js lets the same language run servers and back-end systems
- The fundamentals in this course apply no matter which framework you use later

### Code Example / Implementation

```html
<button onclick="alert('Hello from JavaScript!')">Click Me</button>
```

**Expected output:** Clicking the button shows a pop-up message saying "Hello from JavaScript!"

### Key Takeaways

- JavaScript adds behavior and interactivity to HTML + CSS pages
- It is a true programming language with variables, logic, loops, and functions
- Created in 1995 by Brendan Eich; modernized by ES6 in 2015
- The foundation for React, Vue, Angular, Node.js, and more

## TOPIC: Topic 1.2 [Locked — Requires 1.1 Completion]: Where JavaScript Runs & The Console

## Introduction & Core Concepts

JavaScript runs inside the browser, which reads and executes your code line by line. You can add JavaScript to an HTML page in similar ways to CSS:

```html
<script>
    console.log("Hello from JavaScript!");
</script>
```

or, preferably, in a separate file:

```html
<script src="script.js"></script>
```

**Explanation:**
- `<script>` tells the browser "JavaScript code follows."
- `console.log()` prints a message to the browser's **console** — a developer tool used to see output and debug code. It is not visible to normal visitors.
- Linking an external `.js` file, like linking external CSS, keeps code organized and reusable across multiple pages.

**Tip:** Place `<script>` tags just before the closing `</body>` tag when possible, so the HTML content loads first and the page doesn't appear to freeze while JavaScript loads.

### The Console: Your Best Friend

Press F12 in any browser to open Developer Tools, then click the Console tab. You can:

- See output from `console.log()`
- Read error messages with exact line numbers
- Type JavaScript directly and run it instantly
- Test small pieces of logic before adding them to your code

**Real-world analogy:** The console is like the dashboard of a car. The engine (your page) runs silently, but the dashboard (console) tells you the speed, warns you of problems, and lets you test things. A driver who ignores the dashboard is flying blind.

### Real-World Use Cases & Rules

- Use `console.log()` liberally while learning — it shows what your code is doing
- Errors appear in the console with the file and line number
- The console is invisible to page visitors
- External script files go before `</body>` for best performance

### Code Example / Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Console Demo</title>
</head>
<body>
    <h1>Open the console (F12)</h1>
    <script>
        console.log("Hello from the browser console!");
        console.log(2 + 2);
    </script>
</body>
</html>
```

### Key Takeaways

- JavaScript runs in the browser via `<script>` tags or external `.js` files
- The console (F12) shows output, errors, and lets you experiment
- console.log() is the beginner's debugging superpower
- Place scripts before </body> so the page loads first

## TOPIC: Topic 1.3 [Locked — Requires 1.2 Completion]: Variables: let, const & var

## Introduction & Core Concepts

A variable stores a value so it can be used and changed later in your code.

```js
let age = 25;
const name = "Alex";
var city = "London";
```

**Explanation:**
- `let` declares a variable that **can** be changed later. This is the most common way to declare variables today.
- `const` declares a variable that **cannot** be reassigned after it is set. Use it whenever a value should stay fixed, like a person's date of birth.
- `var` is the older way of declaring variables, from before 2015. It still works but has confusing behavior around scope, so modern JavaScript avoids it in favor of `let` and `const`.

**Real-world analogy:** A variable is like a labeled box. `let` is a box you can repack: put shoes in today, books tomorrow. `const` is a sealed box: whatever goes in stays in. `var` is the older box design that leaks into other rooms (scope) — we keep it for legacy, but prefer the new designs.

### Reassignment vs Mutation

```js
let score = 10;
score = 20;        // ✅ allowed — let can be reassigned

const PI = 3.14;
PI = 3;            // ❌ error — const cannot be reassigned

const person = { name: "Sam" };
person.name = "Lee";  // ✅ allowed — the object's content can change
```

**Common mistake:** Trying to reassign a `const` variable, which causes an error. If a value needs to change later, use `let` instead.

### Real-World Use Cases & Rules

- Use `const` by default; use `let` only when the value must change
- Never use `var` in new code — its scope behavior causes bugs
- Variable names use camelCase: `userAge`, `totalPrice`
- Names must start with a letter, underscore, or dollar sign — not a number

### Code Example / Implementation

```js
const appName = "IH Academy";
let userScore = 0;
const maxScore = 100;

userScore = userScore + 10;   // updating a let variable

console.log(appName);   // "IH Academy"
console.log(userScore); // 10
```

### Key Takeaways

- let = changeable; const = fixed; var = legacy, avoid it
- const by default, let when needed — the modern rule
- Reassigning a const throws an error
- camelCase naming for multi-word variables

## TOPIC: Topic 1.4 [Locked — Requires 1.3 Completion]: Data Types & Operators

## Introduction & Core Concepts

JavaScript variables can hold different types of values.

| Type | Example | Description |
|---|---|---|
| String | `"Hello"` | Text, wrapped in quotes |
| Number | `42`, `3.14` | Any number, whole or decimal |
| Boolean | `true`, `false` | A yes/no, on/off value |
| Array | `[1, 2, 3]` | An ordered list of values |
| Object | `{name: "Alex"}` | A collection of related key-value pairs |
| Undefined | `undefined` | A variable declared but not yet given a value |
| Null | `null` | A value deliberately set to "nothing" |

```js
let score = 90;          // Number
let username = "sam99";  // String
let isOnline = true;     // Boolean
```

### Checking Types with typeof

You can check a variable's type using the `typeof` operator: `typeof score` returns `"number"`.

```js
console.log(typeof 90);        // "number"
console.log(typeof "hi");      // "string"
console.log(typeof true);      // "boolean"
console.log(typeof undefined); // "undefined"
```

### The Null vs Undefined Distinction

- `undefined` means "this variable has no value assigned yet" — JavaScript gives it this automatically
- `null` means "there is deliberately no value here" — a developer sets this on purpose

**Real-world analogy:** `undefined` is an empty desk that nobody has set up yet. `null` is a desk with a sign saying "intentionally unassigned." Both are empty, but only one was emptied on purpose.

### Real-World Use Cases & Rules

- Strings use quotes: double `"..."`, single `'...'`, or backticks for templates
- Booleans are `true`/`false` without quotes (quotes make them strings)
- Arrays hold ordered lists `[ ... ]`; objects hold labeled data `{ ... }`
- Use `typeof` when you're unsure what a variable holds

### Code Example / Implementation

```js
const course = {
    title: "JavaScript Basics",
    lessons: 24,
    isFree: true,
};

console.log(typeof course);        // "object"
console.log(typeof course.lessons); // "number"
console.log(course.title);          // "JavaScript Basics"
```

### Key Takeaways

- Core types: string, number, boolean, array, object, undefined, null
- typeof reveals what type a value is
- undefined = not assigned; null = deliberately empty
- Objects group labeled data; arrays store ordered lists

## Operators: Doing Math & Comparisons

### The Operator Toolkit

Operators perform actions on values — arithmetic, comparisons, and logic.

```js
let sum = 5 + 3;          // Arithmetic: 8
let isEqual = (5 === 5);  // Comparison: true
let isAdult = (age >= 18); // Comparison: true or false
```

| Category | Examples |
|---|---|
| Arithmetic | `+  -  *  /  %` |
| Assignment | `=  +=  -=` |
| Comparison | `===  !==  >  <  >=  <=` |
| Logical | `&&` (and), `||` (or), `!` (not) |

### Strict Equality: The Rule That Saves Bugs

**Important beginner note:** Always use `===` (strict equality) instead of `==` (loose equality). `==` converts values to try to make them match, which can cause confusing bugs — for example, `"5" == 5` is `true`, but `"5" === 5` is `false`, since one is text and the other is a number. Strict equality avoids this trap.

**Real-world analogy:** Loose equality is like saying "a toy car equals a real car because both are called 'car.'" Strict equality says "these must be the same kind of thing, exactly" — a toy car and a real car are not equal.

### Logical Operators

```js
let hasTicket = true;
let hasID = true;

let canEnter = hasTicket && hasID;   // true — BOTH must be true
let needsBackup = !canEnter;          // false — NOT flips it
```

### Common String Pitfall

```js
console.log("5" + 5);   // "55" — the + joins strings!
console.log(Number("5") + 5);  // 10 — converted to number first
```

### Real-World Use Cases & Rules

- Always `===` / `!==`, never `==` / `!=`
- `&&` requires both true; `||` requires at least one true; `!` flips
- `+` joins strings when either side is a string — convert with Number()
- `%` gives the remainder (e.g., 7 % 3 = 1) — useful for even/odd checks

### Code Example / Implementation

```js
const price = 50;
const discount = 0.2;

const finalPrice = price - (price * discount);   // 40
const isDiscounted = price > 100;                // false
const canCheckout = isDiscounted || price < 60;  // true

console.log(`Final price: $${finalPrice}`);
```

### Key Takeaways

- Arithmetic (+ - * / %), comparison (=== !== > <), logical (&& || !)
- Use strict equality === to avoid type-conversion bugs
- + concatenates strings — convert with Number() before math
- Logical && || ! combine conditions into decisions

## QUIZ: Module 1 Quiz — Pass to Unlock Module 2

Q: What is JavaScript primarily used for on websites?
A: Structuring content
A: Styling content visually
A: Adding interactivity and behavior
A: Storing files on a server permanently
ANS: 2

Q: Who created JavaScript, and when?
A: Tim Berners-Lee, 1991
A: Brendan Eich, 1995
A: Ryan Dahl, 2009
A: Bill Gates, 1990
ANS: 1

Q: What does console.log() do?
A: Saves a file to the disk
A: Prints a message to the browser's console
A: Shows a message to page visitors
A: Sends data to a server
ANS: 1

Q: Where should external script tags be placed for best performance?
A: In the <head>
A: Right after <html>
A: Just before the closing </body> tag
A: Anywhere — placement doesn't matter
ANS: 2

Q: Which keyword declares a variable that cannot be reassigned later?
A: let
A: var
A: const
A: static
ANS: 2

Q: What is the modern default choice for declaring variables?
A: const
A: let
A: var
A: define
ANS: 0

Q: Which data type represents a yes/no or true/false value?
A: String
A: Number
A: Boolean
A: Undefined
ANS: 2

Q: What does the typeof operator do?
A: Converts a value to a string
A: Returns the data type of a value
A: Deletes a variable
A: Compares two values
ANS: 1

Q: Why is === preferred over ==?
A: It runs faster in all browsers
A: It avoids unexpected type conversion during comparison
A: It is required syntax in JavaScript
A: It only works with numbers
ANS: 1

Q: What does "5" + 5 evaluate to in JavaScript?
A: 10
A: "55"
A: An error
A: undefined
ANS: 1
