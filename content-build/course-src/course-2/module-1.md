# MODULE: Module 1 — Foundations & Core Concepts
# DURATION: 45

## TOPIC: Topic 1.1 [Unlocked]: Introduction to CSS & A Short History

## Introduction & Core Concepts

CSS stands for **Cascading Style Sheets**. If HTML is the skeleton of a web page — the headings, paragraphs, and images — then CSS is what gives that skeleton color, spacing, fonts, and layout. Without CSS, every website would look like a plain black-and-white document.

Think of a house again. HTML builds the walls, doors, and rooms. CSS decides the paint color, the furniture arrangement, the curtains, and the lighting. The structure works without CSS, but nobody would want to live in an unpainted, unfurnished house — and nobody wants to browse an unstyled website.

```
HTML          →  structure (walls, rooms)
CSS           →  style (paint, furniture)
JavaScript    →  behavior (lights that turn on)
```

### A Short History

CSS was proposed in 1994 by Håkon Wium Lie, and it became a web standard in 1996 through the W3C (World Wide Web Consortium). Before CSS existed, developers styled pages using messy HTML attributes directly on tags, such as `<font color="red">`, mixing content and style together in a way that was hard to maintain.

CSS solved this by separating **content** (HTML) from **presentation** (CSS). Over time it evolved through CSS1, CSS2, and the current CSS3, which is not one single specification but a collection of modules (Flexbox, Grid, Animations, etc.) that are updated individually. This modular design is why new CSS features keep arriving without requiring a full version overhaul.

### Real-World Use Cases & Rules

- Every visually designed website relies on CSS — layouts, colors, responsive design
- Frameworks like Bootstrap and Tailwind CSS are built entirely on top of core CSS
- CSS always styles HTML elements — you can't have CSS without markup to target
- The fundamentals in this course remain useful even when using CSS frameworks

### Code Example / Implementation

```css
h1 {
    color: blue;
    text-align: center;
}
```

```html
<h1>Welcome to my site</h1>
```

**Expected output:** The heading "Welcome to my site" appears in blue, centered on the page.

### Key Takeaways

- CSS = Cascading Style Sheets; it controls appearance, not structure
- CSS separates content (HTML) from presentation (CSS)
- CSS became a standard in 1996; CSS3 is a collection of evolving modules
- HTML structure + CSS style + JavaScript behavior = a complete page

## TOPIC: Topic 1.2 [Locked — Requires 1.1 Completion]: CSS Rules: Selectors & Declarations

## Introduction & Core Concepts

A CSS rule tells the browser *which* elements to style and *how* to style them. Every rule has two parts: a **selector** and a **declaration block**.

```css
p {
    color: gray;
    font-size: 16px;
}
```

**Explanation:**
- `p` is the **selector** — it selects every `<p>` element on the page.
- `{ }` contains the **declaration block**.
- `color: gray;` is a **declaration**, made of a **property** (`color`) and a **value** (`gray`).
- `font-size: 16px;` is another declaration, setting the text size to 16 pixels.
- The semicolon `;` ends each declaration — forgetting it is a very common beginner mistake.

**Expected output:** All paragraph text on the page turns gray and is displayed at 16 pixels tall.

**Real-world analogy:** Think of a CSS rule as a command to a painter: "For every wall in the building (selector), apply this paint color (property: value)." The selector chooses which walls; the declarations choose what happens to them.

### Multiple Rules, Multiple Properties

One rule can declare many properties, and one element can be targeted by many rules:

```css
p {
    color: gray;
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
}
```

### Real-World Use Cases & Rules

- Every declaration ends with a semicolon `;`
- Property names use dashes, not spaces: `font-size`, `background-color`
- Property names and values are lowercase (except special values like hex colors)
- One rule can hold many declarations; one element can match many rules

### Code Example / Implementation

```css
/* Target all paragraph elements */
p {
    color: gray;
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
}

/* Target all top-level headings */
h1 {
    color: darkblue;
    border-bottom: 2px solid lightgray;
}
```

### Key Takeaways

- A CSS rule = selector + declaration block
- A declaration = property + value, ended with a semicolon
- Selectors choose elements; declarations change their appearance
- Semicolons after every declaration prevent hard-to-find bugs

## TOPIC: Topic 1.3 [Locked — Requires 1.2 Completion]: The Cascade: Specificity, Source Order & !important

## Introduction & Core Concepts

"Cascading" means that when multiple rules apply to the same element, CSS follows a predictable order to decide which one wins. Three main factors decide this:

1. **Specificity** — more specific selectors (like an ID) override more general ones (like a tag name).
2. **Source order** — if two rules have equal specificity, the one written later in the file wins.
3. **Importance** — a rule marked `!important` overrides normal rules (use this sparingly, as it can make debugging difficult).

### Specificity Points

| Selector | Specificity | Example |
|---|---|---|
| Tag | 1 point | `p` |
| Class | 10 points | `.highlight` |
| ID | 100 points | `#header` |
| Inline style | 1000 points | `style="..."` |

A class beats any number of tags; an ID beats any number of classes.

**Real-world analogy:** Specificity is like the priority tiers of a hospital emergency room: the ID is a red-alert patient, a class is a normal patient, and a tag is a visitor — when resources (styles) are limited, the higher priority wins.

### Source Order

When two selectors have the same specificity, the LAST one written wins:

```css
p { color: red; }
p { color: blue; }   /* This wins — later in the file */
```

### Real-World Use Cases & Rules

- More specific selectors always beat less specific ones
- Equal specificity → later rule wins
- `!important` beats everything normal — use only as a last resort
- Inline `style="..."` beats any external rule (except !important)
- Understanding the cascade explains why a style "isn't working" — another rule is overriding it

### Code Example / Implementation

```css
#header { color: red; }        /* ID: 100 points */
.title  { color: blue; }       /* Class: 10 points */
h1      { color: green; }      /* Tag: 1 point  */
```

```html
<h1 id="header" class="title">What color is this?</h1>
```

**Expected output:** The heading is **red** — the ID selector has the highest specificity.

### Key Takeaways

- The cascade = specificity, source order, and !important
- Specificity: tag (1) < class (10) < ID (100) < inline style (1000)
- Equal specificity: the later rule in the file wins
- `!important` overrides everything but breaks the normal cascade — use sparingly

## TOPIC: Topic 1.4 [Locked — Requires 1.3 Completion]: Adding CSS, Daily Terminology, Classes & IDs

## Introduction & Core Concepts

There is no installation needed for CSS — like HTML, it is just a text file read by the browser. There are three ways to add CSS to a page.

### 1. Inline CSS

```html
<p style="color: blue;">Hello</p>
```

Written directly on a single element using the `style` attribute. This should be avoided for real projects because it mixes content and style, and cannot be reused elsewhere. It also has maximum specificity, making overrides painful.

### 2. Internal CSS

```html
<head>
    <style>
        p { color: blue; }
    </style>
</head>
```

Written inside a `<style>` tag in the document's `<head>`. Useful for small, single-page examples, but not ideal for multi-page sites.

### 3. External CSS (Recommended)

```html
<head>
    <link rel="stylesheet" href="styles.css">
</head>
```

```css
/* styles.css */
p {
    color: blue;
}
```

**Explanation:**
- The CSS is saved in its own file, conventionally named `styles.css`.
- `<link rel="stylesheet" href="styles.css">` connects that file to the HTML page.
- This method keeps structure and style fully separate and lets one CSS file style many HTML pages at once — the standard professional approach.

**Real-world analogy:** Inline CSS is like painting one wall in a building with a single brush while standing there. External CSS is like handing every painter in every building the same printed color manual — consistent, reusable, and maintained in one place.

### Real-World Use Cases & Rules

- Use external stylesheets for anything beyond a single quick test
- One `styles.css` file can style every page of a site
- The `<link>` tag goes in the `<head>` section
- If styles don't apply, check the `href` path matches the file location

### Code Example / Implementation

```css
/* css/styles.css */
body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
}

h1 {
    color: #1a73e8;
    text-align: center;
}
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Styled Page</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <h1>Hello, styled world!</h1>
</body>
</html>
```

### Key Takeaways

- Three ways: inline, internal, external
- External CSS is the professional standard — separate files, reusable, maintainable
- `<link rel="stylesheet" href="...">` connects a CSS file in the `<head>`
- Check the href path first when styles "aren't working"

## QUIZ: Module 1 Quiz — Pass to Unlock Module 2

Q: What does CSS stand for?
A: Creative Style Sheets
A: Cascading Style Sheets
A: Computer Styling System
A: Content Style Syntax
ANS: 1

Q: What are the two main parts of a CSS rule?
A: Tag and attribute
A: Selector and declaration block
A: Head and body
A: Class and ID
ANS: 1

Q: What symbol ends each CSS declaration?
A: A period .
A: A colon :
A: A semicolon ;
A: A comma ,
ANS: 2

Q: What does the "cascading" in CSS refer to?
A: Animations that slide down the page
A: The order and priority rules used when multiple styles apply to the same element
A: A method of linking multiple HTML files
A: A special kind of selector
ANS: 1

Q: Which selector has the HIGHEST specificity?
A: Tag selector (p)
A: Class selector (.title)
A: ID selector (#header)
A: They are all equal
ANS: 2

Q: When two rules have equal specificity, which one wins?
A: The first one written
A: The one written later in the file
A: The shorter one
A: The one with more properties
ANS: 1

Q: Which method of adding CSS is recommended for real, multi-page projects?
A: Inline CSS
A: Internal CSS
A: External CSS
A: Typing CSS directly into the browser address bar
ANS: 2

Q: What tag links an external stylesheet to an HTML page?
A: <style src="...">
A: <css href="...">
A: <link rel="stylesheet" href="...">
A: <import file="...">
ANS: 2

Q: Which is a correct CSS declaration?
A: color = blue;
A: color: blue;
A: color => blue
A: set color to blue
ANS: 1

Q: Why is !important discouraged except as a last resort?
A: It is not supported by any browser
A: It breaks the normal cascade and makes future changes harder to predict
A: It only works with class selectors
A: It automatically deletes conflicting rules
ANS: 1

## CSS Terminology You Will Use Daily

### The Vocabulary of CSS

CSS has a precise vocabulary. Learning the terms now prevents confusion later — in documentation, tutorials, and interviews.

| Term | Meaning |
|---|---|
| Selector | The part of a rule that chooses which elements to style |
| Property | The aspect being styled, e.g. `color`, `margin` |
| Value | The setting applied to a property, e.g. `red`, `10px` |
| Declaration | A property-value pair, e.g. `color: red;` |
| Declaration block | The `{ }` group of declarations |
| Class | A reusable label you assign to elements, styled with `.name` |
| ID | A unique label for one element, styled with `#name` |
| Specificity | The rule that decides which style "wins" when several apply |
| Cascade | The full priority system for resolving conflicting rules |

### Reading a Rule Aloud

```css
.card {
    background-color: white;
    border-radius: 8px;
}
```

Read as: "For every element with class `card`, set the background color to white and round the corners by 8 pixels."

**Real-world analogy:** Reading CSS aloud is like reading a recipe: "For the sauce (selector), add salt (property) — one teaspoon (value)." Each instruction is short, specific, and has exactly one effect.

### Real-World Use Cases & Rules

- A class can be reused on many elements; an ID should appear once per page
- Selectors and declarations always live inside the same rule
- Comments in CSS look like `/* this */`
- When debugging, say the rule aloud — it often reveals the mistake instantly

### Code Example / Implementation

```css
/* A reusable button style */
.button {
    background-color: #1a73e8;
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
}
```

```html
<a class="button" href="#">Sign Up</a>
<button class="button">Submit</button>
```

### Key Takeaways

- Selector chooses; declaration changes; property names the aspect; value sets it
- Classes (`.name`) are reusable; IDs (`#name`) are unique
- The cascade + specificity decide conflicts
- Speak CSS aloud to debug: "for every .card, set padding to 10px"

## Class Selectors vs ID Selectors

### The Two Naming Tools

Classes and IDs are both ways to give HTML elements a name that CSS can target — but they serve different purposes.

### Classes: Reusable Labels

```html
<p class="warning">Disk space is low.</p>
<p class="warning">Backup your files.</p>
```

```css
.warning {
    color: darkorange;
    font-weight: bold;
}
```

**Explanation:** The dot `.` before `warning` tells CSS "this is a class selector." Classes can be reused on many elements — here, both paragraphs get the same warning style.

### IDs: Unique Identifiers

```html
<div id="main-content">...</div>
```

```css
#main-content {
    max-width: 800px;
    margin: 0 auto;
}
```

**Explanation:** The hash `#` marks an ID selector. An ID should be used only once per page, typically for a unique section like a page header or a main container.

**Real-world analogy:** A class is like a "VIP" wristband — many people can wear it. An ID is like a passport number — it identifies exactly one person.

### The Naming Rules

- Class names and ID names can't contain spaces — use dashes: `profile-card`, `main-content`
- Names must start with a letter
- CSS uses `.` for classes and `#` for IDs; HTML uses `class=""` and `id=""`

### Common Mistake

**Confusing `.class` (dot) with `#id` (hash symbol)** — mixing these up is one of the most frequent beginner errors and results in styles silently not applying. If your style "doesn't work," check whether the HTML attribute and the CSS selector use the same symbol.

### Code Example / Implementation

```html
<header id="site-header">
    <h1 class="brand-title">IH Academy</h1>
</header>
```

```css
#site-header {
    background-color: navy;
    padding: 20px;
}

.brand-title {
    color: white;
    font-size: 28px;
}
```

### Key Takeaways

- `.class` = reusable label for many elements
- `#id` = unique label for one element
- Never mix up `.` and `#` — the #1 beginner selector bug
- Names use dashes (`profile-card`), not spaces

## QUIZ: Module 1 Bonus Quiz — Unlock Module 2

Q: What symbol is used to select a class in CSS?
A: #
A: .
A: *
A: @
ANS: 1

Q: What symbol is used to select an ID in CSS?
A: #
A: .
A: %
A: &
ANS: 0

Q: Which statement about classes and IDs is true?
A: IDs can be reused on many elements
A: Classes can be reused on many elements
A: Classes must appear only once per page
A: IDs and classes are identical in every way
ANS: 1

Q: What does the .warning selector in CSS target?
A: Every element with id="warning"
A: Every element with class="warning"
A: Every <warning> tag
A: The warning section of the page
ANS: 1

Q: Which naming style is valid for a class name?
A: profile card
A: profile-card
A: 2profile
A: profile.card
ANS: 1

Q: What happens if you use #main in CSS but class="main" in HTML?
A: The style applies perfectly
A: The style silently does not apply
A: The browser crashes
A: The HTML is deleted
ANS: 1

Q: How is a comment written in CSS?
A: // comment
A: <!-- comment -->
A: /* comment */
A: # comment
ANS: 2

Q: In CSS, what is a declaration block?
A: The selector part of a rule
A: The { } group of declarations
A: A separate CSS file
A: The HTML element being styled
ANS: 1

Q: Which selector would style only the one element with id="main-content"?
A: .main-content
A: #main-content
A: main-content
A: <main-content>
ANS: 1

Q: Why are classes preferred over IDs for most styling?
A: IDs are slower to load
A: Classes are reusable and avoid specificity conflicts
A: IDs do not work in CSS
A: Classes cannot be used with CSS frameworks
ANS: 1
