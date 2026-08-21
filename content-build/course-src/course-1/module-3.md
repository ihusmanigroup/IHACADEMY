# MODULE: Module 3 — Lists, Tables & Forms
# DURATION: 45

## TOPIC: Topic 3.1 [Unlocked]: Unordered & Ordered Lists

## Introduction & Core Concepts

HTML has two main types of lists: unordered (bullets) and ordered (numbers). Both use `<li>` (list item) for each entry.

```html
<ul>
    <li>Milk</li>
    <li>Eggs</li>
    <li>Bread</li>
</ul>

<ol>
    <li>Preheat the oven</li>
    <li>Mix the ingredients</li>
    <li>Bake for 20 minutes</li>
</ol>
```

**Explanation:**
- `<ul>` = unordered list (bullet points), used when order does not matter.
- `<ol>` = ordered list (numbers), used when sequence matters, like steps in a recipe.
- `<li>` = list item, used inside either list type.

**Real-world analogy:** A shopping list is an unordered list — it doesn't matter whether you grab milk first or eggs first. A recipe is an ordered list — baking before mixing would be a disaster. The same distinction exists in HTML.

### Nested Lists

Lists can be nested inside one another to create sub-lists, common in navigation menus and outlines:

```html
<ul>
    <li>Fruits
        <ul>
            <li>Apples</li>
            <li>Bananas</li>
        </ul>
    </li>
    <li>Vegetables</li>
</ul>
```

### Real-World Use Cases & Rules

- Use `<ul>` when order doesn't matter, `<ol>` when it does
- Every `<li>` must be inside a `<ul>` or `<ol>`
- Nesting creates sub-lists with different bullet styles automatically
- Lists are also the foundation of navigation menus on most websites

### Code Example / Implementation

```html
<h2>Today's Tasks</h2>
<ol>
    <li>Review pull request</li>
    <li>Deploy to staging</li>
    <li>Update documentation</li>
</ol>
```

### Key Takeaways

- `<ul>` = bullets (order irrelevant), `<ol>` = numbers (order matters)
- `<li>` wraps each list item
- Lists nest inside each other for hierarchies
- Navigation menus are usually built from lists

## TOPIC: Topic 3.2 [Locked — Requires 3.1 Completion]: Tables

## Introduction & Core Concepts

Tables display information in rows and columns, such as a price list or schedule.

```html
<table>
    <tr>
        <th>Item</th>
        <th>Price</th>
    </tr>
    <tr>
        <td>Coffee</td>
        <td>$3</td>
    </tr>
    <tr>
        <td>Tea</td>
        <td>$2</td>
    </tr>
</table>
```

**Explanation:**
- `<table>` wraps the entire table.
- `<tr>` = table row.
- `<th>` = table header cell (bold, centered by default).
- `<td>` = table data cell (regular content).

**Real-world analogy:** A table in HTML is like a spreadsheet: the first row is usually the header row (Item, Price), and each row below is a record (Coffee, $3).

### The Golden Rule: Tables Are for Data, Not Layout

**Common mistake:** Using tables to arrange a page's visual layout (like columns of a homepage). Tables should only be used for genuinely tabular data — real layout is handled with CSS. This was common in the 1990s and is now considered an anti-pattern because it creates rigid, inaccessible, hard-to-maintain pages.

### Real-World Use Cases & Rules

- Use `<th>` for header cells, `<td>` for data cells
- Always place `<th>` elements in a `<tr>` header row
- Keep tables for genuinely tabular data: schedules, pricing, statistics
- Don't use tables for page layout — CSS is the tool for that

### Code Example / Implementation

```html
<table>
    <tr>
        <th>Course</th>
        <th>Level</th>
        <th>Duration</th>
    </tr>
    <tr>
        <td>HTML Basics</td>
        <td>Beginner</td>
        <td>3 hours</td>
    </tr>
    <tr>
        <td>CSS Basics</td>
        <td>Beginner</td>
        <td>3 hours</td>
    </tr>
</table>
```

### Key Takeaways

- Tables = rows (`<tr>`) + header cells (`<th>`) + data cells (`<td>`)
- Header rows use `<th>`, data rows use `<td>`
- Use tables for tabular data only, never for page layout
- CSS handles layout; tables handle data

## TOPIC: Topic 3.3 [Locked — Requires 3.2 Completion]: Forms & Inputs

## Introduction & Core Concepts

Forms collect input from users, such as a login screen or a contact form. They are the gateway between your website and your users' data.

```html
<form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">
    <br>
    <input type="submit" value="Submit">
</form>
```

**Explanation:**
- `<form>` wraps all the input fields that will be submitted together.
- `<label>` gives a text description for an input field. The `for` attribute should match the input's `id` so clicking the label focuses the field — this also helps accessibility.
- `<input type="text">` creates a single-line text box.
- `<input type="submit">` creates a button that sends the form's data.

### Common Input Types

| Type | Purpose |
|---|---|
| `text` | Single-line text |
| `email` | Email address (browsers validate the format) |
| `password` | Hidden text for passwords |
| `checkbox` | On/off toggle |
| `radio` | Choose one option from a group |
| `date` | Date picker |

### Real-World Use Cases & Rules

- Every `<input>` should have a matching `<label>` with a `for`/`id` connection
- Use the most specific input type (`email`, `date`) — browsers provide built-in validation and mobile keyboards
- `name` attributes are how submitted data is identified on the server
- Processing submitted data requires a backend language (Python, PHP, Node.js) — outside the scope of this beginner course

### Code Example / Implementation

```html
<form>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email">
    <br><br>
    <label for="age">Are you over 18?</label>
    <input type="checkbox" id="age" name="age">
    <br><br>
    <input type="submit" value="Sign Up">
</form>
```

### Key Takeaways

- `<form>` + `<input>` + `<label>` = the core of data collection
- `for` on the label matches `id` on the input for accessibility
- Use specific input types for validation and better mobile keyboards
- Forms send data to a server, which needs a backend to process it

## TOPIC: Topic 3.4 [Locked — Requires 3.3 Completion]: Nesting, Comments & Document Sections

## Introduction & Core Concepts

Real pages combine everything: elements nested inside other elements, organized into logical sections, with comments to explain the code.

### Comments

Comments are notes for humans that browsers ignore entirely:

```html
<!-- This is a comment. It never appears on the page. -->
<!-- TODO: add a profile photo upload here -->
```

### Sectioning With <div> and <span>

The `<div>` element is a generic block container — it takes a full line and groups content vertically. The `<span>` element is a generic inline container — it wraps small pieces of text within a line.

```html
<div class="product-card">
    <h2>Wireless Headphones</h2>
    <p>Price: <span class="price">$49</span></p>
</div>
```

**Real-world analogy:** `<div>` is like a cardboard box you use to group related items on a shelf; `<span>` is like a sticker you put on a single item to mark it. Neither changes what things are — they just organize and label them (the visual styling comes later with CSS classes).

### Real-World Use Cases & Rules

- Use comments to explain "why," not "what" — the code already shows what it does
- Nest elements logically and indent consistently
- Use `<div>` for grouping blocks, `<span>` for inline labeling
- Add `class` attributes now — CSS (next course) will target them

### Code Example / Implementation

```html
<!-- Page header -->
<header>
    <h1>IH Academy Store</h1>
    <p>Welcome, <span class="username">Guest</span></p>
</header>

<!-- Product listing -->
<main>
    <div class="product">
        <h2>Keyboard</h2>
        <p>$39</p>
    </div>
    <div class="product">
        <h2>Mouse</h2>
        <p>$19</p>
    </div>
</main>
```

### Key Takeaways

- `<!-- comment -->` explains code without appearing on the page
- `<div>` groups blocks; `<span>` labels inline content
- Nesting with consistent indentation keeps HTML readable
- Classes added now become hooks for CSS styling later

## QUIZ: Module 3 Quiz — Pass to Unlock Module 4

Q: Which list type should you use when the order of items matters?
A: <ul>
A: <ol>
A: <li>
A: <nl>
ANS: 1

Q: What does <ul> stand for?
A: Underlined List
A: Unordered List
A: Unique List
A: Upper List
ANS: 1

Q: Which tag wraps each item inside a list?
A: <item>
A: <entry>
A: <li>
A: <list-item>
ANS: 2

Q: Inside a table, what does <th> represent?
A: A table row
A: A table header cell
A: A table body
A: A table footer
ANS: 1

Q: Which pair of tags creates a table data cell?
A: <td>...</td>
A: <tr>...</tr>
A: <th>...</th>
A: <table-cell>...</table-cell>
ANS: 0

Q: Why should tables NOT be used for page layout?
A: Tables cannot hold text
A: Browsers do not support tables anymore
A: Tables are meant for tabular data, not visual layout; CSS should handle layout
A: Tables slow down the DOCTYPE declaration
ANS: 2

Q: In a form, what does the for attribute on a <label> do?
A: Sets the form's action URL
A: Links the label to a matching input's id
A: Styles the label in bold
A: Submits the form automatically
ANS: 1

Q: Which input type hides what the user types?
A: text
A: hidden
A: password
A: secret
ANS: 2

Q: What is the correct syntax for an HTML comment?
A: // comment
A: <!-- comment -->
A: /* comment */
A: # comment
ANS: 1

Q: Which element groups content into a block that takes a full line?
A: <span>
A: <em>
A: <div>
A: <a>
ANS: 2
