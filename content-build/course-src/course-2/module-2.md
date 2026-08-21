# MODULE: Module 2 — Selectors & The Box Model
# DURATION: 45

## TOPIC: Topic 2.1 [Unlocked]: Selectors Deep Dive

## Introduction & Core Concepts

Selectors decide *what* gets styled. Choosing the right selector is one of the most important CSS skills.

| Selector | Example | Selects |
|---|---|---|
| Tag/Element | `p { }` | Every `<p>` element |
| Class | `.highlight { }` | Every element with `class="highlight"` |
| ID | `#header { }` | The one element with `id="header"` |
| Descendant | `div p { }` | Every `<p>` inside a `<div>` |
| Child | `ul > li { }` | `<li>` that are direct children of `<ul>` |
| Universal | `* { }` | Every element on the page |
| Grouping | `h1, h2, h3 { }` | All three heading types |

### Descendant vs Child

The difference between descendant and child selectors is subtle but important:

```css
div p { }      /* every <p> anywhere inside a <div>, at any depth */
div > p { }    /* only <p> whose direct parent is a <div> */
```

```html
<div>
    <p>Direct child — matched by both</p>
    <section>
        <p>Grandchild — matched ONLY by the descendant selector</p>
    </section>
</div>
```

**Real-world analogy:** A descendant selector is "everyone in the building who works for the company." A child selector is "only the people whose office is directly on the floor you're standing on."

### Real-World Use Cases & Rules

- Start with the simplest selector that works — don't over-nest
- Keep selectors as short as possible: `.card` beats `body main div.card`
- Use classes for reusable styling; tags for broad defaults; IDs rarely for styling
- Deeply nested selectors are harder to maintain and override later

### Code Example / Implementation

```css
/* Grouping: style multiple selectors at once */
h1, h2, h3 {
    font-family: Georgia, serif;
}

/* Descendant: style links inside nav only */
nav a {
    color: white;
    text-decoration: none;
}

/* Universal: reset every element's margins to zero */
* {
    margin: 0;
    padding: 0;
}
```

### Key Takeaways

- Selectors: tag, class, ID, descendant, child, universal, grouping
- `div p` matches all depths; `div > p` matches direct children only
- Use the simplest selector that works
- Class selectors are the workhorse of real projects

## TOPIC: Topic 2.2 [Locked — Requires 2.1 Completion]: The Box Model

## Introduction & Core Concepts

Every single HTML element is treated by the browser as a rectangular box. Understanding this "box model" is essential for controlling spacing and layout.

```
┌─────────────────────────────┐
│           margin             │
│  ┌─────────────────────┐    │
│  │       border          │   │
│  │  ┌───────────────┐   │   │
│  │  │    padding      │  │   │
│  │  │  ┌─────────┐   │  │   │
│  │  │  │ content │   │  │   │
│  │  │  └─────────┘   │  │   │
│  │  └───────────────┘   │   │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

- **Content** — the actual text or image inside the box.
- **Padding** — space between the content and the border (inside the box).
- **Border** — a visible or invisible line surrounding the padding.
- **Margin** — space outside the border, separating this box from neighboring elements.

**Real-world analogy:** Imagine a framed picture on a wall. The photo is the content. The mat (white border inside the frame) is the padding. The frame itself is the border. The gap between this frame and the next frame on the wall is the margin.

### The box-sizing Question

```css
div {
    width: 200px;
    padding: 10px;
    border: 2px solid black;
    margin: 20px;
}
```

**Explanation:** A frequent beginner confusion is expecting the final visible box to be exactly 200px — by default, padding and border are *added* to the width, making the box wider than 200px (200 + 10 + 10 + 2 + 2 = 224px) unless `box-sizing: border-box;` is used.

### Real-World Use Cases & Rules

- Padding = breathing room inside the border
- Margin = space outside the border, between elements
- Use `box-sizing: border-box` to make width include padding and border
- Apply shorthand: `padding: 10px 20px` (top/bottom, left/right)

### Code Example / Implementation

```css
/* Fix the box-sizing confusion globally */
*,
*::before,
*::after {
    box-sizing: border-box;
}

.card {
    width: 300px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    margin: 16px;
}
```

### Key Takeaways

- Every element is a box: content → padding → border → margin
- Padding is inside the border; margin is outside it
- By default, width excludes padding/border — use `box-sizing: border-box`
- Margin collapses between adjacent vertical boxes; padding never collapses

## TOPIC: Topic 2.3 [Locked — Requires 2.2 Completion]: Colors & Units

## Introduction & Core Concepts

CSS accepts colors in several formats and sizes elements with several units. Choosing the right format and unit makes designs easier to maintain and more responsive.

### Color Formats

```css
h1 { color: red; }              /* named color */
h1 { color: #ff0000; }          /* hexadecimal */
h1 { color: rgb(255, 0, 0); }   /* red, green, blue */
h1 { color: rgba(255, 0, 0, 0.5); } /* with transparency (alpha) */
h1 { color: hsl(0, 100%, 50%); }    /* hue, saturation, lightness */
```

**Explanation:**
- Named colors (`red`, `navy`) are easy but limited to ~150 names
- Hex (`#ff0000`) is the most common professional format — six digits: red, green, blue in pairs
- `rgb()` uses numbers 0–255 per channel
- `rgba()` adds an alpha (opacity) value from 0 (invisible) to 1 (opaque)
- `hsl()` expresses color as hue (0–360), saturation %, and lightness %

**Real-world analogy:** Named colors are like saying "red" to a painter. Hex codes are like giving the painter a precise Pantone color number — both get you red, but only one is exact and reproducible.

### Units of Measurement

| Unit | Meaning | Example use |
|---|---|---|
| `px` | Pixels — a fixed size | Precise, unchanging sizes |
| `%` | Percentage of the parent element | Flexible, responsive widths |
| `em` | Relative to the parent's font size | Scalable spacing/text |
| `rem` | Relative to the root (page-wide) font size | Consistent, predictable scaling |
| `vh` / `vw` | Percentage of viewport height/width | Full-screen sections |

**Explanation:** Beginners are encouraged to start with `px` for simplicity, then move to `%`, `rem`, and `vh`/`vw` once comfortable, since these units make designs adapt better to different screen sizes.

### Real-World Use Cases & Rules

- Use hex or rgb for brand colors; rgba for overlays with transparency
- Use `rem` for font sizes to respect user's browser settings
- Use `%` for fluid widths; `vh`/`vw` for full-screen hero sections
- Avoid `em` for fonts early on — it compounds with nesting and confuses beginners

### Code Example / Implementation

```css
body {
    font-size: 16px;
    background-color: #f5f7fa;
    color: rgb(30, 41, 59);
}

.hero {
    height: 100vh;                 /* full screen height */
    background: rgba(0, 0, 0, 0.6); /* dark translucent overlay */
    padding: 2rem;                 /* scales with root font size */
}

.hero h1 {
    font-size: 3rem;
}
```

### Key Takeaways

- Colors: named, hex, rgb, rgba (with alpha), hsl
- Units: px (fixed), % (parent-relative), rem (root-relative), vh/vw (viewport)
- Start with px; graduate to %, rem, and vh/vw
- Use rgba for translucent overlays; hex/rgb for exact brand colors

## TOPIC: Topic 2.4 [Locked — Requires 2.3 Completion]: Typography

## Introduction & Core Concepts

Typography is the art of making text readable and attractive. CSS gives you complete control over fonts, sizes, weights, and spacing.

```css
body {
    font-family: Arial, sans-serif;
    font-size: 16px;
    font-weight: bold;
    line-height: 1.5;
    text-align: center;
}
```

### Understanding Each Property

- `font-family` sets the typeface. Listing multiple fonts (a "font stack") provides backups if the first choice isn't available — `sans-serif` here is a generic fallback category.
- `font-size` controls text size.
- `font-weight` controls boldness (`normal`, `bold`, or numeric values like `400`, `700`).
- `line-height` controls vertical spacing between lines of text, improving readability.
- `text-align` controls horizontal alignment (`left`, `right`, `center`, `justify`).

### Font Stacks

```css
body {
    font-family: "Segoe UI", Roboto, Arial, sans-serif;
}
```

**Explanation:** The browser tries "Segoe UI" first; if unavailable, it falls back to Roboto, then Arial, then any generic sans-serif. This guarantees a decent font on every operating system.

**Real-world analogy:** A font stack is like a restaurant's seating plan: try the window table first; if it's taken, try the corner booth; if that's taken, sit at the bar. The guest always gets seated — the page always gets a font.

### Real-World Use Cases & Rules

- Always end a font stack with a generic family: `sans-serif` or `serif`
- Body text: 16px is the readable standard; line-height 1.5–1.7 feels comfortable
- Use numeric font-weight (400 normal, 700 bold) for design consistency
- `rem` for font sizes respects user accessibility settings
- Keep line length around 60–80 characters for comfortable reading

### Code Example / Implementation

```css
body {
    font-family: "Segoe UI", Roboto, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #1f2937;
}

h1 {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
}

.note {
    font-size: 0.875rem;      /* smaller than body */
    text-align: center;
    font-style: italic;
}
```

### Key Takeaways

- font-family, font-size, font-weight, line-height, text-align = core typography
- Font stacks give fallbacks: "Segoe UI", Roboto, Arial, sans-serif
- 16px body text with 1.5+ line-height is the readability baseline
- Use rem for fonts; it respects user accessibility settings

## QUIZ: Module 2 Quiz — Pass to Unlock Module 3

Q: Which selector matches every <p> that is a DIRECT child of a <div>?
A: div p
A: div > p
A: div + p
A: p div
ANS: 1

Q: What does the universal selector * target?
A: Only headings
A: Only the body
A: Every element on the page
A: Elements with classes
ANS: 2

Q: In the box model, what surrounds the padding?
A: Margin
A: Border
A: Content
A: Background
ANS: 1

Q: What does margin control?
A: Space inside the border, around the content
A: The color of the border
A: Space outside the border, between elements
A: The font size of the text
ANS: 2

Q: With the default box-sizing, a 200px wide element with 10px padding becomes...
A: 200px total
A: 210px total
A: 220px total
A: 190px total
ANS: 2

Q: Which property fixes the box-sizing issue where padding and border add to an element's declared width?
A: width: auto;
A: box-sizing: border-box;
A: display: flex;
A: overflow: hidden;
ANS: 1

Q: Which color format includes an alpha (opacity) channel?
A: #ff0000
A: rgb(255, 0, 0)
A: rgba(255, 0, 0, 0.5)
A: red
ANS: 2

Q: Which unit is relative to the root (page-wide) font size?
A: px
A: %
A: em
A: rem
ANS: 3

Q: What does line-height control?
A: The size of the text
A: The vertical space between lines of text
A: The horizontal alignment of text
A: The boldness of text
ANS: 1

Q: In a font stack like Arial, Helvetica, sans-serif, what is sans-serif?
A: The primary font
A: The generic fallback category
A: A font weight
A: A font size
ANS: 1
