# MODULE: Module 3 — Arrays, Objects & The DOM
# DURATION: 45

## TOPIC: Topic 3.1 [Unlocked]: Arrays: Ordered Lists

## Introduction & Core Concepts

An array stores an ordered list of values.

```js
let fruits = ["apple", "banana", "mango"];
console.log(fruits[0]);       // "apple"
fruits.push("orange");        // adds to the end
console.log(fruits.length);   // 4
```

**Explanation:**
- Arrays are zero-indexed, meaning the first item is at position `0`, not `1`.
- `.push()` is a **method** that adds a new item to the end of the array.
- `.length` tells you how many items the array contains.

**Real-world analogy:** An array is like a numbered locker row. The lockers are numbered starting from 0: locker 0, locker 1, locker 2. You access a locker by its number — `fruits[2]` opens locker 2, which holds "mango."

### Common Array Methods

| Method | What It Does | Example |
|---|---|---|
| `push(x)` | Add to the end | `fruits.push("kiwi")` |
| `pop()` | Remove from the end | `fruits.pop()` |
| `length` | Count of items | `fruits.length` |
| `includes(x)` | Check if present | `fruits.includes("apple")` |
| `indexOf(x)` | Find position | `fruits.indexOf("mango")` |
| `map(fn)` | Transform each item | `nums.map(n => n * 2)` |
| `filter(fn)` | Keep matching items | `nums.filter(n => n > 10)` |
| `join(sep)` | Merge into a string | `fruits.join(", ")` |

### Looping Over Arrays

```js
const fruits = ["apple", "banana", "mango"];

for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}

// Modern shorthand:
fruits.forEach((fruit) => console.log(fruit));
```

### Real-World Use Cases & Rules

- Arrays are best for ordered lists of similar items
- Zero-indexed: first item is at position 0
- map transforms every item; filter keeps matching items — both return new arrays
- Use .length in loops to avoid going out of bounds

### Code Example / Implementation

```js
const scores = [80, 95, 60, 75];

const doubled = scores.map((s) => s * 2);      // [160, 190, 120, 150]
const passing = scores.filter((s) => s >= 70); // [80, 95, 75]
const total = scores.reduce((sum, s) => sum + s, 0); // 310

console.log(scores.includes(95));  // true
```

### Key Takeaways

- Arrays = ordered, zero-indexed lists
- .push adds, .pop removes, .length counts
- map transforms, filter selects, reduce aggregates
- Loop with for or forEach

## TOPIC: Topic 3.2 [Locked — Requires 3.1 Completion]: Objects: Labeled Data

## Introduction & Core Concepts

An object stores related data as labeled key-value pairs.

```js
let person = {
    name: "Alex",
    age: 30,
    isStudent: false
};

console.log(person.name);  // "Alex"
```

**Explanation:** Objects are ideal for grouping related information together, unlike arrays, which are best for ordered lists of similar items. You access an object's values using dot notation, like `person.name`.

**Real-world analogy:** An object is like a completed application form: each labeled field (name, age, student status) holds a value, and you look things up by their label. An array is like a to-do list where position matters; an object is like a form where labels matter.

### Reading & Writing Properties

```js
const user = { name: "Sam", email: "sam@mail.com" };

user.name = "Samira";        // update
user.role = "admin";         // add new property
console.log(user.role);      // "admin"

// Bracket notation for dynamic keys
const key = "email";
console.log(user[key]);      // "sam@mail.com"
```

### Arrays of Objects: The Real-World Shape

```js
const courses = [
    { title: "HTML", level: "Beginner" },
    { title: "CSS", level: "Beginner" },
    { title: "React", level: "Intermediate" },
];

courses.forEach((c) => console.log(c.title));

const beginner = courses.filter((c) => c.level === "Beginner");
```

**Explanation:** Most real data — users, products, posts — lives as arrays of objects. This combination (list + labeled fields) is the backbone of every app's data.

### Real-World Use Cases & Rules

- Use dot notation (`person.name`) for known keys
- Use bracket notation (`person[key]`) for dynamic keys
- Objects group labeled data; arrays store ordered lists
- Combine them: arrays of objects model real-world collections

### Code Example / Implementation

```js
const product = {
    name: "Wireless Mouse",
    price: 29.99,
    inStock: true,
    features: ["wireless", "rechargeable", "silent"],
};

console.log(product.name);            // "Wireless Mouse"
console.log(product.features[1]);     // "rechargeable"
product.price = 24.99;                // price update
```

### Key Takeaways

- Objects = labeled key-value pairs, accessed with dot notation
- Update and add properties with `object.property = value`
- Arrays of objects model real collections (users, products, courses)
- Combine objects and arrays freely

## TOPIC: Topic 3.3 [Locked — Requires 3.2 Completion]: The DOM: Connecting JavaScript to HTML

## Introduction & Core Concepts

The **DOM (Document Object Model)** is how JavaScript "sees" your HTML page — as a structured tree of objects it can read and change.

```html
<p id="message">Original text</p>
<button onclick="changeText()">Click Me</button>

<script>
function changeText() {
    document.getElementById("message").textContent = "Text changed!";
}
</script>
```

**Explanation:**
- `document` represents the entire loaded web page.
- `getElementById("message")` finds the specific HTML element with `id="message"`.
- `.textContent` reads or sets the text inside that element.
- `onclick="changeText()"` tells the browser to run the `changeText` function whenever the button is clicked.

**Expected output:** When the button is clicked, the paragraph's text changes from "Original text" to "Text changed!" — with no page reload.

```
User clicks button
       │
       ▼
Browser runs changeText()
       │
       ▼
JavaScript finds <p id="message">
       │
       ▼
Updates its text content
```

**Real-world analogy:** The DOM is like a marionette's control board. The HTML is the puppet, and JavaScript pulls the right strings (the DOM nodes) to make it move. Without the DOM, JavaScript couldn't touch the page at all.

### The Document Tree

Every HTML page becomes a tree of nodes:

```
document
 └── <html>
      ├── <head>
      └── <body>
           ├── <p id="message">
           └── <button>
```

### Real-World Use Cases & Rules

- `document` is the entry point to the whole page
- `getElementById()` finds elements by their unique id
- `.textContent` reads or sets text without triggering a full re-parse
- JavaScript must run AFTER the element exists — put scripts before </body>

### Code Example / Implementation

```html
<h1 id="title">Welcome</h1>

<script>
const heading = document.getElementById("title");
heading.textContent = "Welcome, JavaScript developer!";
heading.style.color = "blue";
</script>
```

### Key Takeaways

- The DOM is the in-browser tree representation of HTML
- document.getElementById() finds elements; .textContent changes them
- The DOM is how JavaScript reads and modifies the page live
- Order matters: the element must exist before you touch it

## TOPIC: Topic 3.4 [Locked — Requires 3.3 Completion]: Events & addEventListener

## Introduction & Core Concepts

An **event** is something that happens in the browser that JavaScript can "listen" for and react to — a click, a key press, a page load, and so on. The modern, preferred way to handle events is `addEventListener`, rather than writing `onclick` directly in HTML.

```js
const button = document.getElementById("myButton");

button.addEventListener("click", function () {
    alert("Button was clicked!");
});
```

**Explanation:**
- `addEventListener("click", ...)` attaches a listener that waits for a click on `button`.
- The function passed in runs automatically whenever that click happens.
- `alert()` shows a pop-up message box to the user.

**Real-world analogy:** addEventListener is like installing a doorbell: you wire it (attach the listener) once, and every time someone presses the button (fires the event), the chime (your function) plays. You never have to re-wire it after every ring.

### Why addEventListener Is Preferred

- Keeps JavaScript logic separate from HTML markup — no `onclick=""` scattered in HTML
- You can attach multiple listeners to the same element
- You can remove listeners later (`removeEventListener`)
- Matches the same separation-of-concerns principle used between HTML and CSS

### Common Events

| Event | Fires When |
|---|---|
| `click` | Element is clicked |
| `input` | Text field value changes |
| `submit` | A form is submitted |
| `keydown` | A key is pressed |
| `mouseover` | Mouse enters the element |
| `load` | Page or resource finishes loading |

### Real-World Use Cases & Rules

- Use addEventListener instead of HTML onclick attributes
- The event's name is a string: "click", "input", "submit"
- Access event details via the event parameter: `(e) => console.log(e.target)`
- Attach listeners only to elements that exist — or run your script after the DOM is ready

### Code Example / Implementation

```js
const input = document.getElementById("nameInput");

input.addEventListener("input", (e) => {
    const greeting = document.getElementById("greeting");
    greeting.textContent = "Hello, " + e.target.value + "!";
});
```

**Expected output:** As the user types in the input, the greeting updates live on every keystroke.

### Key Takeaways

- Events = user/browser actions your code reacts to
- addEventListener("click", fn) is the modern standard
- The event object (e) carries details like e.target
- Separate behavior (JS) from markup (HTML)

## QUIZ: Module 3 Quiz — Pass to Unlock Module 4

Q: In JavaScript, what is the index of the first item in an array?
A: 1
A: 0
A: -1
A: It depends on the array
ANS: 1

Q: Which method adds a new item to the end of an array?
A: .pop()
A: .push()
A: .length
A: .add()
ANS: 1

Q: Which array method transforms every item and returns a new array?
A: filter
A: map
A: push
A: includes
ANS: 1

Q: How do you access the name property of an object called person?
A: person[name]
A: person->name
A: person.name
A: name.person
ANS: 2

Q: What structure best models a collection of users with names and emails?
A: A string
A: An array of objects
A: A boolean
A: A single object
ANS: 1

Q: What does the DOM represent?
A: A file storage system
A: The structured, in-browser representation of the HTML page that JavaScript can read and change
A: A type of CSS selector
A: A JavaScript data type
ANS: 1

Q: What does document.getElementById("message") do?
A: Creates a new HTML element
A: Deletes an HTML element
A: Finds the HTML element with a matching id
A: Changes the page's CSS
ANS: 2

Q: What does .textContent do?
A: Styles an element
A: Reads or sets the text inside an element
A: Deletes an element
A: Creates an element
ANS: 1

Q: What is the modern, preferred way to handle a button click?
A: Writing logic only inside <style>
A: Using addEventListener
A: Using alert() for every interaction
A: Editing the HTML file every time a click happens
ANS: 1

Q: Which event fires as a user types in a text field?
A: click
A: input
A: load
A: mouseover
ANS: 1
