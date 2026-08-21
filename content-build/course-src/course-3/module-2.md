# MODULE: Module 2 — Program Flow: Conditionals, Loops & Functions
# DURATION: 45

## TOPIC: Topic 2.1 [Unlocked]: Conditionals: Making Decisions

## Introduction & Core Concepts

Conditionals let your program make decisions.

```js
let temperature = 15;

if (temperature > 25) {
    console.log("It's hot outside.");
} else if (temperature > 10) {
    console.log("It's mild outside.");
} else {
    console.log("It's cold outside.");
}
```

**Explanation:**
- `if` checks a condition. If it's `true`, the code inside its `{ }` runs.
- `else if` checks another condition only if the first one was `false`.
- `else` runs only if none of the above conditions were true.
- Since `temperature` is 15, the program prints "It's mild outside."

```
temperature > 25?
   │
   ├── Yes → "It's hot outside."
   │
   No
   │
   ▼
temperature > 10?
   │
   ├── Yes → "It's mild outside."
   │
   No
   │
   ▼
"It's cold outside."
```

**Real-world analogy:** A conditional is like a reception desk routing visitors: "If you're here for the manager, go right. Otherwise, if you're here for support, go left. Otherwise, take a seat." Each visitor follows exactly one path.

### Real-World Use Cases & Rules

- `if` runs when its condition is true; `else if` chains alternatives; `else` catches everything else
- Conditions are usually comparisons using ===, >, <, >=, <=
- Only one branch ever runs — the first true one wins
- Keep conditions simple; complex logic can be split into named booleans

### Code Example / Implementation

```js
const age = 17;

if (age >= 18) {
    console.log("You can vote.");
} else if (age >= 16) {
    console.log("You can drive (in most places).");
} else {
    console.log("You're still growing!");
}
```

### Key Takeaways

- if / else if / else = the decision structure
- Only the first true branch executes
- Conditions use comparison operators
- else catches all remaining cases

## TOPIC: Topic 2.2 [Locked — Requires 2.1 Completion]: Loops: Repeating Work

## Introduction & Core Concepts

Loops repeat a block of code multiple times, saving you from writing the same instructions over and over.

### The for Loop

```js
for (let i = 1; i <= 5; i++) {
    console.log(i);
}
```

**Explanation:**
- `let i = 1` — starts a counter variable at 1.
- `i <= 5` — the loop continues only while this condition is true.
- `i++` — increases `i` by 1 after each pass.

**Expected output:** `1 2 3 4 5`, each printed on its own line.

### The while Loop

```js
let count = 0;
while (count < 3) {
    console.log("Counting: " + count);
    count++;
}
```

A `while` loop repeats as long as its condition remains true. It is useful when you don't know in advance how many times you'll need to repeat something.

**Real-world analogy:** A for loop is like "take 5 laps around the track" — you know the count upfront. A while loop is like "keep walking until you find the coffee shop" — you don't know how many steps, only the stopping condition.

### Common Mistake: Infinite Loops

Forgetting to update the counter variable (`i++` or `count++`) creates an **infinite loop** that never stops and can freeze the browser tab.

```js
// ❌ BUG: count never changes → infinite loop
let count = 0;
while (count < 3) {
    console.log("forever...");
}
```

### Real-World Use Cases & Rules

- for = known count; while = unknown count with a condition
- Always update the counter inside the loop
- Loops over arrays use the array's length: `for (let i = 0; i < fruits.length; i++)`
- Test loops with small counts first to avoid freezes

### Code Example / Implementation

```js
// Sum numbers 1 to 100
let total = 0;
for (let i = 1; i <= 100; i++) {
    total = total + i;
}
console.log(total); // 5050
```

### Key Takeaways

- for loops: counter + condition + step
- while loops: repeat until a condition becomes false
- Always update the counter or you get an infinite loop
- Arrays are often looped by index: 0 to length-1

## TOPIC: Topic 2.3 [Locked — Requires 2.2 Completion]: Functions: Reusable Logic

## Introduction & Core Concepts

A function is a named, reusable block of code.

```js
function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("Maria"));
```

**Explanation:**
- `function greet(name)` defines a function named `greet` that accepts one **parameter**, `name`.
- `return` sends a value back out of the function to wherever it was called.
- `greet("Maria")` **calls** the function, passing in `"Maria"` as an **argument**. This produces the string `"Hello, Maria!"`.

**Real-world analogy:** A function is like a sandwich shop with a recipe: the recipe (function) takes ingredients (parameters) and produces a sandwich (return value). You can use the same recipe endlessly with different ingredients — write once, use many times.

### Why Functions Matter

1. **Reuse** — write the logic once, call it anywhere
2. **Readability** — named functions document intent: `calculateTotal()` is self-explanatory
3. **Testing** — small functions are easy to test in isolation
4. **Maintenance** — fix a bug in one place, not in twenty copies

### Parameters vs Arguments

```js
function multiply(a, b) {     // a and b are parameters (placeholders)
    return a * b;
}

multiply(3, 4);               // 3 and 4 are arguments (actual values)
```

### Real-World Use Cases & Rules

- Parameters = placeholders in the definition; arguments = real values at the call
- A function without `return` returns `undefined`
- Name functions as verb phrases: `getUserAge()`, `calculateTotal()`, `validateEmail()`
- Keep functions small and focused on a single task

### Code Example / Implementation

```js
function calculatePrice(price, discountPercent) {
    const discount = price * (discountPercent / 100);
    return price - discount;
}

console.log(calculatePrice(100, 20)); // 80
console.log(calculatePrice(50, 10));  // 45
```

### Key Takeaways

- function name(parameters) { body } defines; name(arguments) calls
- return sends the result back to the caller
- Write once, reuse anywhere
- Clear verb names + small scope = maintainable code

## TOPIC: Topic 2.4 [Locked — Requires 2.3 Completion]: Arrow Functions & Scope

## Introduction & Core Concepts

Modern JavaScript allows a shorter syntax for functions called **arrow functions**:

```js
const greet = (name) => "Hello, " + name + "!";

// Same as:
function greet(name) {
    return "Hello, " + name + "!";
}
```

This does exactly the same thing as the example above, just written more concisely. Arrow functions are extremely common in modern JavaScript code.

### The Three Arrow Forms

```js
// One parameter, one expression: parentheses and braces optional
const double = n => n * 2;

// Multiple parameters: parentheses required
const add = (a, b) => a + b;

// Multiple statements: braces required, return explicit
const describe = (name, age) => {
    const status = age >= 18 ? "adult" : "minor";
    return `${name} is an ${status}`;
};
```

**Explanation:** If the body is a single expression, the arrow returns it automatically — no `return` keyword needed. If the body uses braces, you must write `return` yourself.

### Scope: Where Variables Live

**Scope** is the region of code where a variable is accessible.

```js
const globalName = "Global";   // accessible everywhere

function show() {
    const localName = "Local"; // accessible only inside this function
    console.log(globalName);   // ✅ works
    console.log(localName);    // ✅ works
}

show();
console.log(localName);        // ❌ error: not defined here
```

**Real-world analogy:** Scope is like room access in a building. The lobby (global scope) is accessible to everyone. A private office (function scope) is only accessible to the person who works there — you can't grab files from an office you don't belong to.

### Real-World Use Cases & Rules

- Prefer arrow functions for short callbacks and simple transformations
- Use const for variables you assign to arrows
- Variables declared with let/const are scoped to their block `{ }`
- Global scope is shared everywhere — minimize global variables

### Code Example / Implementation

```js
const prices = [10, 20, 30];

// Arrow function as a callback
const doubled = prices.map((p) => p * 2);
console.log(doubled); // [20, 40, 60]

const expensive = prices.filter((p) => p > 15);
console.log(expensive); // [20, 30]
```

### Key Takeaways

- Arrow functions: concise syntax, implicit return for single expressions
- const + arrow = the modern declaration style
- Scope = where a variable is visible (block vs global)
- Arrows shine as callbacks in map, filter, forEach

## QUIZ: Module 2 Quiz — Pass to Unlock Module 3

Q: What will if/else if/else do if temperature is 5 with those thresholds?
A: Run only the first block
A: Run only the second block
A: Run only the else block
A: Run all three blocks
ANS: 2

Q: How many branches of an if/else if/else chain can ever run?
A: All of them
A: Exactly one
A: Two at most
A: None
ANS: 1

Q: What is a common cause of an infinite loop?
A: Using const instead of let
A: Forgetting to update the loop's counter variable
A: Using for instead of while
A: Declaring too many variables
ANS: 1

Q: In for (let i = 1; i <= 5; i++), what does i++ do?
A: Doubles i each pass
A: Increases i by 1 after each pass
A: Decreases i by 1
A: Resets i to 1
ANS: 1

Q: Which loop should you use when you don't know the number of repetitions in advance?
A: for
A: foreach
A: while
A: repeat
ANS: 2

Q: In function greet(name), what is name called?
A: A method
A: A parameter
A: An event
A: An object
ANS: 1

Q: What does the return keyword do in a function?
A: Ends the program
A: Sends a value back to the caller
A: Prints a message to the console
A: Declares a variable
ANS: 1

Q: What does an arrow function like const add = (a, b) => a + b; do?
A: Declares an object
A: Defines a function in a shorter, modern syntax
A: Creates an array
A: Declares a loop
ANS: 1

Q: When does an arrow function return implicitly (without return)?
A: When the body is a single expression
A: When it has more than one parameter
A: When it uses braces
A: Never
ANS: 0

Q: What is scope in JavaScript?
A: The size of a variable
A: The region of code where a variable is accessible
A: A type of function
A: The browser's zoom level
ANS: 1
