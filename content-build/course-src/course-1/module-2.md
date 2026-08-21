# MODULE: Module 2 — Working with Text & Media
# DURATION: 45

## TOPIC: Topic 2.1 [Unlocked]: Headings & Document Structure

## Introduction & Core Concepts

HTML provides six levels of headings, from `<h1>` (largest, most important) to `<h6>` (smallest, least important). Headings organize content the same way chapters and subheadings organize a book.

```html
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
```

### Choosing the Right Heading Level

A common beginner mistake is choosing heading levels based on font size rather than importance. Headings should reflect the *structure* of the content, not how big you want text to look. Font size should be adjusted with CSS instead.

**Real-world analogy:** Think of a newspaper. The front-page headline is the `<h1>`, section titles are `<h2>`, and individual article titles within a section are `<h3>`. An editor would never use the headline font size for a tiny footnote — and a developer should never use `<h1>` just to make text big.

### Why Exactly One <h1> Per Page?

The `<h1>` tells search engines and screen readers what the page is fundamentally about. Having one clear main title makes a page easier to understand, navigate, and rank in search results.

### Real-World Use Cases & Rules

- Use one `<h1>` per page for the main title
- Skip heading levels only in rare cases; a document should flow naturally h1 → h2 → h3
- Never use a heading tag purely for visual size — use CSS for that
- Headings should describe content, like "Chapter 3: The Box Model," not "Big Text"

### Code Example / Implementation

```html
<h1>My Baking Blog</h1>
<h2>Recipes</h2>
<h3>Chocolate Chip Cookies</h3>
<h3>Banana Bread</h3>
<h2>Kitchen Tips</h2>
<h3>How to Measure Flour</h3>
```

**Expected output:** A clear hierarchy: the blog title at the top, two main sections (Recipes, Kitchen Tips), and subsections under each.

### Key Takeaways

- Six heading levels exist: `<h1>` (most important) to `<h6>` (least)
- Choose heading levels by importance, not by size
- One `<h1>` per page improves accessibility and SEO
- Visual sizing belongs in CSS, not in heading tags

## TOPIC: Topic 2.2 [Locked — Requires 2.1 Completion]: Paragraphs & Line Breaks

## Introduction & Core Concepts

Paragraphs are the default way to present blocks of text on a page. The `<p>` element creates a distinct block with space above and below it, while `<br>` forces a line break *within* the same paragraph.

```html
<p>This is one paragraph.</p>
<p>This is a separate paragraph.</p>
<p>Line one<br>Line two, same paragraph</p>
```

### When to Use <br> vs a New <p>

- `<br>` is meant for things like addresses or poems, where lines belong to one block of text
- A new `<p>` starts a new conceptual block, and browsers automatically add spacing between paragraphs

**Real-world analogy:** A paragraph is like a block of text in a book. A line break is like writing an address — "123 Main Street" then "Springfield" — you press Enter between lines, but it's still one block of information.

### Whitespace Collapsing

This is one of the most surprising beginner discoveries: HTML ignores extra spaces and line breaks in your code. The browser collapses multiple spaces into one.

```html
<p>Hello      world
  with lots of     spacing</p>
```

**Expected output:** "Hello world with lots of spacing" — all the extra whitespace collapses to single spaces.

### Real-World Use Cases & Rules

- Use one `<p>` per logical block of text
- Use `<br>` only for line breaks within the same block (addresses, poems)
- Do not use `<br>` to create vertical spacing — use CSS margins instead
- Extra spaces and newlines in your code are ignored by the browser

### Code Example / Implementation

```html
<p>Welcome to the bakery. We bake fresh bread every morning.</p>
<p>Visit us at:<br>123 Main Street<br>Springfield</p>
```

### Key Takeaways

- `<p>` creates a new block of text with automatic spacing
- `<br>` forces a line break inside the same paragraph
- Browsers collapse extra whitespace — use markup, not spacing, to control layout
- Use `<br>` sparingly; spacing between elements is CSS's job

## TOPIC: Topic 2.3 [Locked — Requires 2.2 Completion]: Text Formatting Tags

## Introduction & Core Concepts

HTML offers tags that give text *meaning* as well as appearance. The two most important are `<strong>` and `<em>`.

| Tag | Purpose | Example |
|---|---|---|
| `<strong>` | Marks important text (shown bold) | `<strong>Warning</strong>` |
| `<em>` | Marks emphasized text (shown italic) | `<em>really</em> important` |
| `<small>` | Smaller, fine-print text | `<small>Terms apply</small>` |
| `<mark>` | Highlights text | `<mark>highlighted</mark>` |

### Why <strong> and <em> Beat <b> and <i>

`<strong>` and `<em>` are preferred over the older `<b>` (bold) and `<i>` (italic) tags because they describe *meaning*, not just appearance. Screen readers announce `<strong>` text with extra emphasis, while `<b>` is purely visual and carries no meaning.

**Real-world analogy:** Consider a teacher who underlines important homework instructions and a student who underlines a random word because it "looks nice." Both change the page visually, but only the teacher's underlining has meaning. `<strong>` is the teacher; `<b>` is the student.

### Real-World Use Cases & Rules

- Use `<strong>` for important content — not just to make text bold
- Use `<em>` for emphasis — not just to italicize
- Reserve `<b>` and `<i>` for purely visual styling when no meaning is intended
- Combine with semantic structure: a warning inside a `<strong>` conveys urgency to both humans and screen readers

### Code Example / Implementation

```html
<p><strong>Warning:</strong> The oven is hot.</p>
<p>This is <em>really</em> important.</p>
<p><mark>Remember</mark> to save your work.</p>
<p><small>Terms and conditions apply.</small></p>
```

### Key Takeaways

- `<strong>` = importance (bold by default); `<em>` = emphasis (italic by default)
- Semantic tags carry meaning for screen readers and search engines
- Use `<small>` for fine print, `<mark>` for highlighting
- Prefer semantic tags over purely visual `<b>` and `<i>`

## TOPIC: Topic 2.4 [Locked — Requires 2.3 Completion]: Links, Navigation & Images

## Introduction & Core Concepts

Links are what make the web a "web" — they connect pages to each other. Without links, every page would be an isolated document.

```html
<a href="https://www.example.com">Visit Example</a>
```

**Explanation:**
- `<a>` stands for "anchor." It creates a clickable link.
- `href` (hypertext reference) is the attribute that holds the destination URL.
- The text between the tags, "Visit Example," is what the user clicks on.

### Absolute vs Relative Paths

- **Absolute URL:** a full web address — `https://www.example.com/about`
- **Relative path:** a path within your own site — `about.html` or `pages/contact.html`

```html
<a href="about.html">About Us</a>
<a href="https://www.example.com" target="_blank">Visit Example</a>
```

The `target="_blank"` attribute opens the link in a new browser tab.

**Real-world analogy:** An absolute path is like a full postal address ("1600 Pennsylvania Ave, Washington DC") that works from anywhere. A relative path is like saying "two doors down" when you're standing on the same street — it only works from the right location.

### Common Mistake

Forgetting `https://` for external links causes the browser to look for a page on your own site with that name instead of the outside website.

### Real-World Use Cases & Rules

- Always include `https://` in absolute external URLs
- Use relative paths for navigation between pages of your own site
- Write meaningful link text ("Read the pricing guide") instead of "click here"
- Use `target="_blank"` only when leaving the site is intentional

### Code Example / Implementation

```html
<nav>
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="contact.html">Contact</a>
</nav>
<a href="https://developer.mozilla.org" target="_blank">MDN Web Docs</a>
```

### Key Takeaways

- `<a href="...">text</a>` creates a clickable link
- Absolute URLs start with https://; relative paths work within your site
- `target="_blank"` opens links in a new tab
- Good link text helps accessibility and SEO

## Images: Bringing Pages to Life

### The img Element

Images bring visual life to web pages. The `<img>` element is a void element — it never has a closing tag or wraps content, because the "content" is the image file itself.

```html
<img src="cat.jpg" alt="A sleeping orange cat" width="300">
```

**Explanation:**
- `src` points to the image file location, which can be a local file or a full web address.
- `alt` describes the image for accessibility and for cases when the image cannot load.
- `width` (optional) sets the display size, in pixels, on the page.

### Why alt Text Is Not Optional

The `alt` attribute serves three critical purposes:

1. **Accessibility:** screen readers announce the description to visually impaired users.
2. **Resilience:** if the image fails to load, the alt text shows in its place.
3. **SEO:** search engines use alt text to understand what the image depicts.

**Real-world analogy:** Alt text is like a museum placard next to a painting. Visitors who can't see the painting still learn what it depicts, and even sighted visitors get context.

### Common Image Formats

| Format | Best For |
|---|---|
| JPG | Photographs — many colors, small file size |
| PNG | Graphics with transparency — logos, icons |
| GIF | Simple animations |
| WebP | Modern format — excellent compression for photos and graphics |
| SVG | Logos and icons — scales infinitely without blurriness |

### Real-World Use Cases & Rules

- Always include `alt` text on every meaningful image
- Use empty `alt=""` for decorative images the screen reader should skip
- Keep file sizes small — big images slow down page loading
- Use appropriate formats: JPG for photos, PNG/SVG for graphics

### Code Example / Implementation

```html
<img src="images/team-photo.jpg" alt="The IH Academy team standing in front of the office" width="600">
<img src="logo.svg" alt="IH Academy logo">
<img src="decorative-line.png" alt="">
```

### Key Takeaways

- `<img>` is a void element with `src` and `alt` attributes
- `alt` text serves accessibility, load-failure fallback, and SEO
- Choose JPG for photos, PNG/SVG for graphics, WebP for modern performance
- Decorative images get `alt=""` so screen readers skip them

## QUIZ: Module 2 Quiz — Pass to Unlock Module 3

Q: Which tag creates the largest heading?
A: <h6>
A: <h3>
A: <h1>
A: <head>
ANS: 2

Q: How many heading levels does HTML provide?
A: 3
A: 6
A: 10
A: 1
ANS: 1

Q: What is the correct rule for choosing heading levels?
A: Pick the level by font size you want
A: Pick the level by importance of the content
A: Always use <h1> for every section
A: Headings are optional
ANS: 1

Q: What does the <br> tag do?
A: Starts a new paragraph
A: Forces a line break within the same paragraph
A: Adds a border to text
A: Creates a horizontal line
ANS: 1

Q: What happens when you write many extra spaces in HTML code?
A: They are all displayed
A: The page shows an error
A: Browsers collapse them into a single space
A: They create extra paragraphs
ANS: 2

Q: Which tag marks text as important for screen readers, not just bold?
A: <b>
A: <i>
A: <u>
A: <strong>
ANS: 3

Q: Which attribute holds the destination URL of a link?
A: src
A: alt
A: href
A: target
ANS: 2

Q: What does target="_blank" do on a link?
A: Opens the link in a new browser tab
A: Blanks out the link
A: Prevents the link from working
A: Downloads the page
ANS: 0

Q: Why is the alt attribute required on meaningful images?
A: It makes images load faster
A: It provides alternative text for accessibility and load failures
A: It changes the image format
A: It is only for SEO
ANS: 1

Q: Which image format is best for a transparent logo?
A: JPG
A: PNG
A: GIF (photographic)
A: None of the above
ANS: 1
