# MODULE: Module 4 — Semantic HTML & Professional Practice
# DURATION: 45

## TOPIC: Topic 4.1 [Unlocked]: Semantic HTML5 Tags

## Introduction & Core Concepts

"Semantic" means the tag name describes its meaning, not just its appearance. HTML5 introduced tags such as `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>` specifically so page structure is clearer to both developers and browsers.

```html
<header>
    <h1>My Website</h1>
    <nav>
        <a href="#">Home</a>
        <a href="#">About</a>
    </nav>
</header>
<main>
    <article>
        <h2>Blog Post Title</h2>
        <p>Post content goes here.</p>
    </article>
</main>
<footer>
    <p>&copy; 2026 My Website</p>
</footer>
```

### Before Semantic Tags Existed

Developers used generic `<div>` tags for everything, which made it hard to tell what each section of a page was for just by reading the code:

```html
<div class="header">...</div>
<div class="nav">...</div>
<div class="content">...</div>
```

Semantic tags replace these vague divs with self-describing names.

**Real-world analogy:** A building blueprint labeled "KITCHEN," "BATHROOM," "LIVING ROOM" is far more useful than one labeled "ROOM 1," "ROOM 2," "ROOM 3." Semantic HTML labels the rooms of your page.

### Why This Matters

- **Accessibility:** screen readers can announce "navigation" or "main content" directly
- **SEO:** search engines better understand page structure and content priority
- **Maintainability:** future developers instantly understand the layout
- **Consistency:** browsers apply sensible default styling

### Common Semantic Tags

| Tag | Purpose |
|---|---|
| `<header>` | Top banner — logo, site title, nav |
| `<nav>` | Navigation links |
| `<main>` | The main, unique content of the page |
| `<article>` | A self-contained piece of content (blog post, news item) |
| `<section>` | A themed grouping within a page |
| `<aside>` | Side content — related links, ads |
| `<footer>` | Bottom banner — copyright, contact info |

### Code Example / Implementation

```html
<body>
    <header>
        <h1>Tech Blog</h1>
        <nav><a href="#">Home</a> <a href="#">Articles</a></nav>
    </header>
    <main>
        <article>
            <h2>Why Semantic HTML Matters</h2>
            <p>Semantic tags improve accessibility and SEO...</p>
        </article>
        <aside>
            <p>Related articles</p>
        </aside>
    </main>
    <footer>
        <p>&copy; 2026 Tech Blog</p>
    </footer>
</body>
```

### Key Takeaways

- Semantic tags describe meaning: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`
- They improve accessibility, SEO, and code maintainability
- Prefer semantic tags over generic `<div>` containers
- HTML5 (2014) made semantic structure standard

## TOPIC: Topic 4.2 [Locked — Requires 4.1 Completion]: Accessibility & SEO Basics

## Introduction & Core Concepts

An accessible website works for everyone — including users with visual impairments, motor limitations, or who rely on screen readers. SEO (Search Engine Optimization) means helping search engines understand and rank your content. Good HTML serves both goals at once.

### Core Accessibility Practices

1. **Alt text on images** — screen readers announce it
2. **Labels on form inputs** — every input gets a `<label>` connected by `for`/`id`
3. **One `<h1>` per page** — clear document outline
4. **Semantic structure** — `<nav>`, `<main>`, `<article>` give landmarks
5. **`lang` attribute** — `<html lang="en">` tells screen readers which language to pronounce

### Core SEO Practices

1. **Unique `<title>` per page** — the headline search engines display
2. **Meta description** — the summary shown under the title in search results
3. **Meaningful heading hierarchy** — content outline for crawlers
4. **Descriptive link text** — "Buy premium headphones" beats "click here"
5. **Semantic tags** — proper landmarks help crawlers index content

**Real-world analogy:** Accessibility is like a building with ramps, braille signs, and wide doors — everyone can enter. SEO is like clear street signage so people can find the building. Good HTML provides both for free.

### Code Example / Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Learn HTML from zero — the complete beginner's guide to web structure.">
    <title>HTML for Absolute Beginners | IH Academy</title>
</head>
<body>
    <h1>HTML for Absolute Beginners</h1>
    <form>
        <label for="email">Email address:</label>
        <input type="email" id="email" name="email">
    </form>
</body>
</html>
```

### Key Takeaways

- Alt text, labels, one `<h1>`, and semantic tags = accessible pages
- Title, meta description, headings, and link text = better SEO
- Accessibility and SEO improvements come from the same good habits
- The `lang` attribute on `<html>` helps screen readers pronounce correctly

## TOPIC: Topic 4.3 [Locked — Requires 4.2 Completion]: Common Errors & Troubleshooting

## Introduction & Core Concepts

Every beginner hits the same handful of HTML problems. Knowing them in advance saves hours of confusion.

### The Five Most Common Errors

| Error | Cause | Fix |
|---|---|---|
| Page shows raw text with < > symbols | A tag was typed incorrectly, e.g. missing `>` | Check every tag is properly closed |
| Content appears in the wrong place | Tags are not nested properly | Ensure every opening tag has a matching closing tag in the right order |
| Image does not appear | Wrong file path in `src` | Double-check the file name, extension, and folder location |
| Page looks unstyled or broken | Missing `<!DOCTYPE html>` | Always start files with the doctype |
| Link goes to the wrong place | Missing `https://` or wrong relative path | Verify the full URL or file path |

### The Browser's Developer Tools

A simple troubleshooting habit: open your browser's **Developer Tools** (usually F12) and check the "Elements" tab. It shows exactly how the browser interpreted your HTML, which quickly reveals unclosed or misplaced tags.

**Real-world analogy:** Developer Tools is like an X-ray machine for your page. Instead of guessing why the "wall" looks wrong, you can see the internal frame — every element, every tag, exactly as the browser sees it.

### Real-World Use Cases & Rules

- Save the file before refreshing — editing without saving shows old content
- Check the exact error area first: missing closing tag, wrong attribute name, bad file path
- Validate your HTML with a tool like the W3C Markup Validator to catch hidden errors
- One unclosed tag can "eat" the rest of the page — close everything

### Code Example / Implementation

```html
<!-- BUG: unclosed <strong> tag eats the rest of the page -->
<p>This is <strong>bold text.</p>
<p>This paragraph got swallowed too!</p>

<!-- FIXED -->
<p>This is <strong>bold text</strong>.</p>
<p>This paragraph is fine now.</p>
```

### Key Takeaways

- Most HTML errors are unclosed tags, wrong paths, or missing doctype
- Use F12 Developer Tools → Elements to see the interpreted structure
- Save before refreshing; validate with the W3C Validator
- One unclosed tag can break everything after it

## TOPIC: Topic 4.4 [Locked — Requires 4.3 Completion]: Best Practices & Professional Workflow

## Introduction & Core Concepts

The difference between code that "works" and code that is a pleasure to maintain comes down to habits. These are the habits professional developers use every day.

### Best Practices Checklist

- **Always close your tags** — some browsers forgive mistakes, but relying on forgiveness leads to unpredictable results
- **Indent nested elements** consistently so the structure is easy to read
- **Use lowercase tag and attribute names** — the widely accepted convention
- **Always include an `alt` attribute** on images for accessibility
- **Use one `<h1>` per page**, reserving it for the main title
- **Separate structure from style** — avoid visual styling directly in HTML; that belongs in CSS
- **Validate your HTML** with the W3C Markup Validator to catch hidden errors

### Professional Workflow

Professionals rarely write a full page by memory — they rely on editor autocompletion:

1. In VS Code, type `!` and press Tab to generate the entire page skeleton
2. Use Emmet shortcuts like `ul>li*3` to generate nested structures instantly
3. Keep files organized in folders: `images/`, `css/`, `js/`
4. Test across browsers (Chrome, Firefox, Safari) — small differences exist
5. Commit early and often with version control (covered in the Git course)

**Real-world analogy:** A chef doesn't re-invent every recipe from memory — they use well-organized prep stations, proven techniques, and mise en place (everything in its place). Professional developers do the same with snippets, shortcuts, and organized folders.

### Code Example / Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <main>
        <h1>My Project</h1>
        <img src="images/hero.jpg" alt="Project hero image">
        <p>Project description goes here.</p>
    </main>
</body>
</html>
```

### Key Takeaways

- Close tags, indent, lowercase, alt text, one `<h1>` — the five core habits
- Use editor shortcuts: `!` + Tab for the skeleton, Emmet for nested structures
- Organize files into folders from day one
- Separate structure (HTML) from style (CSS) from behavior (JS)

## QUIZ: Module 4 Quiz — Pass to Complete the Course

Q: Which HTML5 tag is meant specifically for site navigation links?
A: <nav>
A: <header>
A: <menu>
A: <links>
ANS: 0

Q: Which tag wraps the main, unique content of a page?
A: <body>
A: <main>
A: <content>
A: <center>
ANS: 1

Q: What is the purpose of semantic HTML tags like <article> and <section>?
A: They add visual styling automatically
A: They describe the meaning of page sections for accessibility and SEO
A: They replace the need for CSS entirely
A: They are only used in older websites
ANS: 1

Q: Which attribute on the <html> tag helps screen readers pronounce content correctly?
A: charset
A: lang
A: dir
A: meta
ANS: 1

Q: Why is descriptive link text like "Read the pricing guide" better than "click here"?
A: It is shorter
A: It improves accessibility and SEO
A: It loads faster
A: It is required by HTML syntax
ANS: 1

Q: What is a common cause of raw text with < > symbols showing on a page?
A: Missing <!DOCTYPE html>
A: A tag typed incorrectly, such as a missing >
A: Too many images
A: Using semantic tags
ANS: 1

Q: What browser tool shows exactly how HTML was interpreted?
A: The Print dialog
A: Developer Tools (Elements tab)
A: The bookmarks bar
A: The history tab
ANS: 1

Q: Which habit helps prevent one unclosed tag from breaking the whole page?
A: Using only <div> tags
A: Consistently indenting and closing all tags
A: Adding more comments
A: Using uppercase tags
ANS: 1

Q: In VS Code, what keystroke generates the entire HTML page skeleton?
A: Ctrl+S
A: Typing ! and pressing Tab (Emmet)
A: Ctrl+Shift+P
A: Typing html5 and pressing Enter
ANS: 1

Q: Which statement correctly separates the three web technologies?
A: HTML styles, CSS structures, JavaScript behaves
A: HTML structures, CSS styles, JavaScript behaves
A: HTML behaves, CSS structures, JavaScript styles
A: All three do the same thing
ANS: 1
