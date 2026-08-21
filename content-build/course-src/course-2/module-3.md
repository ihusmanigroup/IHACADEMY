# MODULE: Module 3 — Layout: Display, Flexbox & Positioning
# DURATION: 45

## TOPIC: Topic 3.1 [Unlocked]: The display Property

## Introduction & Core Concepts

Every element has a default `display` value that affects how it behaves on the page.

- `block` — takes up the full width available and starts on a new line (e.g., `<div>`, `<p>`, `<h1>`).
- `inline` — takes up only as much width as needed and stays in line with surrounding content (e.g., `<span>`, `<a>`, `<em>`).
- `none` — hides the element completely, removing it from the page layout.

```css
p {
    display: block;   /* default for paragraphs */
}

a {
    display: inline;  /* default for links */
}

.hidden-mobile {
    display: none;    /* completely hidden */
}
```

**Real-world analogy:** Block elements are like full-width parking spots — each one takes a whole row. Inline elements are like bicycles parked in a line — they fit side by side and share the street.

### Why the Difference Matters

You cannot give `width` or `height` to an inline element — it refuses to grow beyond its content. If you need that control, change its display:

```css
.nav-link {
    display: inline-block;  /* inline flow, but accepts width/height */
    padding: 8px 16px;
}
```

### Real-World Use Cases & Rules

- `block`: full width, new line (div, p, headings, sections)
- `inline`: content width, same line (span, a, em, strong)
- `inline-block`: best of both — sits inline but respects width/height
- `none`: hides without leaving a gap (unlike visibility: hidden)
- `display: flex` and `display: grid` switch an element into modern layout modes

### Code Example / Implementation

```css
div {
    display: block;              /* explicit (already default) */
}

a {
    display: inline-block;       /* links become clickable pills */
    background: #1a73e8;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
}

.removed {
    display: none;               /* element disappears entirely */
}
```

### Key Takeaways

- block = full width, new line; inline = content width, same line
- inline elements ignore width/height — use inline-block to fix that
- display: none removes an element from the layout completely
- flex and grid are the modern layout modes covered next

## TOPIC: Topic 3.2 [Locked — Requires 3.1 Completion]: Flexbox Fundamentals

## Introduction & Core Concepts

Flexbox is a modern layout system that makes it far easier to align and distribute elements in a row or column — something that was notoriously difficult in older CSS.

```css
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

**Explanation:**
- `display: flex;` turns the container into a "flex container," making its direct children ("flex items") line up in a row by default.
- `justify-content` controls spacing along the main axis (here, spreading items apart evenly).
- `align-items` controls alignment along the cross axis (here, vertically centering items).

```
Before Flexbox:           With display: flex + space-between:
[box1]                    [box1]      [box2]      [box3]
[box2]
[box3]
```

**Real-world analogy:** Flexbox is like a smart shelf with adjustable dividers. Whatever boxes you put on it, the shelf arranges them in a single row, and you decide the gap between them (space-between, center, etc.) with one command.

### Common Flexbox Patterns

| Pattern | CSS |
|---|---|
| Horizontal menu | `display: flex; gap: 1rem;` |
| Centered content | `display: flex; justify-content: center; align-items: center;` |
| Spaced nav bar | `display: flex; justify-content: space-between;` |
| Equal-width columns | `display: flex; .child { flex: 1; }` |

### Real-World Use Cases & Rules

- `justify-content` works on the main axis (row → horizontal by default)
- `align-items` works on the cross axis (vertical by default)
- `gap` adds space between items — no margin hacks needed
- Only DIRECT children of the flex container become flex items
- Flexbox is ideal for one-dimensional layouts (a single row or column)

### Code Example / Implementation

```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.nav-links {
    display: flex;
    gap: 1.5rem;
}

.center-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
```

### Key Takeaways

- display: flex creates a flex container; children line up in a row
- justify-content = main axis spacing; align-items = cross axis alignment
- gap replaces margin hacks for spacing between items
- Flexbox = one-dimensional layout (row OR column); Grid (later) = two-dimensional

## TOPIC: Topic 3.3 [Locked — Requires 3.2 Completion]: Positioning Elements

## Introduction & Core Concepts

Positioning lets you control where an element sits — sometimes pulling it out of the normal document flow entirely.

```css
.box {
    position: relative;
    top: 10px;
    left: 20px;
}
```

| Value | Behavior |
|---|---|
| `static` | Default; follows normal document flow |
| `relative` | Shifted relative to its normal position, but still takes up its original space |
| `absolute` | Removed from normal flow, positioned relative to the nearest positioned ancestor |
| `fixed` | Stays in place even when the page is scrolled |
| `sticky` | Sticks to the viewport when scrolled past, then releases |

**Real-world analogy:** Static elements are shelves built into the wall. A relatively positioned element is a shelf you nudged 10cm to the right but whose original spot remains reserved. An absolutely positioned element is a balloon released from that spot — it floats wherever you aim it relative to its anchor. A fixed element is a billboard — it stays in your view no matter how far down the street (page) you walk.

### The Anchor Rule for absolute

An `absolute` element positions itself relative to the nearest ancestor that has `position` set (not static). If no ancestor is positioned, it anchors to the page itself.

```css
.card {
    position: relative;   /* becomes the anchor */
}

.card .badge {
    position: absolute;
    top: 0;
    right: 0;             /* pinned to the card's top-right corner */
}
```

### Real-World Use Cases & Rules

- `relative` on a parent makes it the anchor for `absolute` children
- `fixed` = nav bars and floating chat buttons that never scroll away
- `sticky` = table headers and section titles that stick while scrolling
- `absolute` elements don't affect the position of siblings — layout may overlap
- Use positioning sparingly; flexbox handles most layout needs first

### Code Example / Implementation

```css
.chat-button {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
}

.nav {
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
}

.product-tag {
    position: absolute;
    top: 12px;
    left: 12px;
}
```

### Key Takeaways

- static (default), relative, absolute, fixed, sticky — five values
- relative creates an anchor; absolute positions against that anchor
- fixed stays on screen while scrolling; sticky sticks then releases
- Prefer flexbox for normal layouts; use positioning for overlays and pinning

## TOPIC: Topic 3.4 [Locked — Requires 3.3 Completion]: Responsive Design & Media Queries

## Introduction & Core Concepts

Responsive design means a page looks good on every screen — from a 320px phone to a 2560px monitor. The core tool is the **media query**, which applies CSS only when certain conditions are true.

```css
/* Default styles: phone-first */
.container {
    display: block;
}

/* Larger screens: two-column layout */
@media (min-width: 768px) {
    .container {
        display: flex;
        gap: 2rem;
    }
}
```

**Explanation:** The media query targets screens at least 768px wide. Below that, the container stacks vertically; at 768px and above, it becomes a two-column flex row.

**Real-world analogy:** Responsive design is like a restaurant with tables that seat 2 people normally, but unfold to seat 8 when a big party arrives. The same furniture adapts to the group size — the same content adapts to the screen size.

### The Viewport Meta Tag

Media queries only work properly with this tag in the HTML head:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Without it, mobile browsers render pages at desktop width and zoom out — breaking every media query.

### Common Breakpoints

| Breakpoint | Typical Device |
|---|---|
| 480px | Small phones |
| 768px | Tablets / large phones |
| 1024px | Laptops |
| 1200px+ | Desktop monitors |

### Real-World Use Cases & Rules

- Always include the viewport meta tag
- Use `min-width` queries with a phone-first approach
- Prefer flexible units (%, rem, vh/vw) so content adapts without queries
- Test by resizing the browser window and using DevTools device mode
- Breakpoints are starting points, not rules — design for your content

### Code Example / Implementation

```css
.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 768px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### Key Takeaways

- Media queries apply CSS conditionally, e.g. `@media (min-width: 768px)`
- The viewport meta tag is required for responsive behavior
- Phone-first + min-width queries is the standard workflow
- Flexible units + breakpoints + DevTools device mode = responsive mastery

## QUIZ: Module 3 Quiz — Pass to Unlock Module 4

Q: Which display value makes an element take the full width and start on a new line?
A: inline
A: block
A: none
A: flex
ANS: 1

Q: Which display value removes an element from the page completely?
A: block
A: inline
A: none
A: flex
ANS: 2

Q: What does display: flex; do to a container's direct children?
A: Hides them
A: Arranges them as flex items, typically in a row by default
A: Deletes their margins permanently
A: Converts them into table cells
ANS: 1

Q: Which property controls spacing along the main axis in Flexbox?
A: align-items
A: justify-content
A: gap-items
A: main-align
ANS: 1

Q: Which position value keeps an element fixed in place even when the page scrolls?
A: static
A: relative
A: absolute
A: fixed
ANS: 3

Q: Which position value makes an element the anchor for absolutely positioned children?
A: static
A: relative
A: absolute
A: fixed
ANS: 1

Q: An element with position: absolute positions itself relative to...
A: The whole page always
A: The nearest positioned ancestor
A: The nearest sibling
A: The browser window only
ANS: 1

Q: What is the purpose of a media query?
A: To play audio on the page
A: To apply CSS conditionally based on screen characteristics
A: To import fonts
A: To link JavaScript files
ANS: 1

Q: Which HTML meta tag is required for responsive design?
A: <meta name="description">
A: <meta name="keywords">
A: <meta name="viewport">
A: <meta name="author">
ANS: 2

Q: Which of these is the recommended responsive workflow?
A: Desktop-first with max-width queries
A: Phone-first with min-width queries
A: Using only pixel units everywhere
A: Creating a separate HTML page per device
ANS: 1
