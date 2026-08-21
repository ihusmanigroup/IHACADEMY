# MODULE: Module 1 — Foundations & Core Concepts
# DURATION: 45

## TOPIC: Topic 1.1 [Unlocked]: Introduction to HTML & A Short History

## Introduction & Core Concepts

HTML stands for **HyperText Markup Language**. It is the language used to build the structure of every website you have ever visited. When you open a web page and see a heading, a paragraph, a picture, or a button, HTML is the thing that put it there.

Think of a website like a house. HTML is the bricks and beams — the basic structure that holds everything together. CSS (Cascading Style Sheets) is the paint, wallpaper, and furniture that make the house look nice. JavaScript is the electricity and plumbing that make things move and work. This module focuses only on the bricks and beams: HTML.

```
Browser
   │
   ▼
HTML  (structure)
   │
   ▼
CSS   (style)
   │
   ▼
JavaScript (behavior)
```

### Why HTML Is Not a "Programming Language"

You do not need any programming experience to learn HTML. It is not really a "programming language" in the traditional sense — it does not have loops, variables, or logic. Instead, it is a **markup language**, which means it uses tags to label and organize content so that a web browser knows how to display it.

### A Short History

HTML was created in 1991 by Tim Berners-Lee, a scientist working at CERN (a physics research organization in Switzerland). He needed a simple way for researchers to share documents over a network, and HTML was his solution. The very first version had only a handful of tags.

Over the years, HTML evolved through several versions: HTML 2, HTML 3.2, HTML 4.01, XHTML, and finally **HTML5**, which was released around 2014 and is the version we use today. HTML5 added support for video, audio, and many new structural tags without needing extra software or plugins. Every modern website is built using HTML5.

### Real-World Use Cases & Rules

- Every website you use daily — social media, online shops, news sites, banking portals — has HTML at its foundation
- Even highly interactive applications built with React or Vue ultimately produce HTML in the browser
- HTML is the only structural language that browsers universally understand
- Mastering HTML fundamentals is the permanent foundation beneath every front-end technology that exists today

### Code Example / Implementation

The simplest possible HTML document:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>
```

### Key Takeaways

- HTML is a markup language, not a programming language
- HTML builds the structure; CSS styles it; JavaScript makes it behave
- HTML was created in 1991 by Tim Berners-Lee at CERN
- HTML5 (2014) is the modern standard used by every website today

## TOPIC: Topic 1.2 [Locked — Requires 1.1 Completion]: How the Web Works: Browsers & Files

## Introduction & Core Concepts

Before writing HTML, it helps to understand the journey your code takes to become a visible web page. A **web browser** — Chrome, Firefox, Edge, or Safari — is a program whose job is to read HTML files and display them as a rendered page. When you double-click an `.html` file on your computer, the browser reads the file, interprets every tag, and paints the result on your screen.

### The Request–Response Cycle

When you visit a website over the internet, your browser sends a **request** to a **server** — a powerful computer that stores the website's files. The server sends the files back, and your browser renders them.

```
Your browser  ──request──▶  Server
  (client)                   (holds the website files)
      ◀──────response────────
```

For local files (this course), there is no server — the browser reads the file directly from your computer. Understanding this distinction matters because some HTML features (like fetching data) only work when a file is served over the internet.

### Files, Extensions, and Folders

Every web page is just a text file. What makes it "web content" is its extension:

- `.html` — a web page's structure (what you will write in this course)
- `.css` — styling rules (covered in the CSS course)
- `.js` — behavior and interactivity (covered in the JavaScript course)

**Real-world analogy:** Think of these files like the blueprints, paint swatches, and electrical wiring plan for a house — separate documents, each describing one aspect of the same building.

### Real-World Use Cases & Rules

- Browsers render HTML, CSS, and JavaScript together — one page can use all three files
- The browser's Developer Tools (F12) let you inspect exactly how a page was interpreted
- File names should be lowercase with no spaces (`my-page.html`, not `My Page.HTML`)
- The home page of a website is conventionally named `index.html`

### Code Example / Implementation

Create a file named `index.html` with this content and open it in your browser:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>My First Web Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>If you can read this in your browser, your setup is working.</p>
</body>
</html>
```

**Expected output:** A page showing a large "Hello, World!" heading and a sentence below it, with the tab labeled "My First Web Page."

### Key Takeaways

- The browser is the "stage" that turns HTML text into a rendered page
- Local `.html` files need no server; internet sites are served by remote servers
- One web page is usually built from HTML + CSS + JS files working together
- `index.html` is the conventional name for a site's home page

## TOPIC: Topic 1.3 [Locked — Requires 1.2 Completion]: Elements, Tags & Attributes

## Introduction & Core Concepts

An HTML **element** is a single piece of content wrapped in tags. A **tag** is a keyword surrounded by angle brackets, like `<p>`. Most elements have an **opening tag** and a **closing tag**, with content in between.

```html
<p>This is a paragraph.</p>
```

**Explanation:**
- `<p>` is the opening tag. It tells the browser "a paragraph starts here."
- `This is a paragraph.` is the content — the actual text shown on the page.
- `</p>` is the closing tag. The forward slash `/` tells the browser "the paragraph ends here."

**Expected output:** The browser displays the sentence as regular text on the page.

### Attributes: Extra Information

An **attribute** gives extra information about an element. Attributes are written inside the opening tag, as a name and a value, like `name="value"`.

```html
<img src="dog.jpg" alt="A brown dog sitting on grass">
```

**Explanation:**
- `src` (source) tells the browser *where* to find the image file.
- `alt` (alternative text) is a description shown if the image fails to load, and it is also read aloud by screen readers for visually impaired users.

### Void (Self-Closing) Elements

Some elements do not need a closing tag because they do not wrap any content. These are called **self-closing** or **void** elements. Examples include `<br>` (line break) and `<img>` (image).

### Real-World Use Cases & Rules

- Attributes always go inside the opening tag, never the closing tag
- Attribute values are almost always wrapped in quotation marks
- Nesting means placing one element inside another — like boxes inside boxes
- Always close elements in the reverse order you opened them (last opened, first closed)

### Code Example / Implementation

```html
<p>This is <strong>important</strong> text.</p>
<p>Line one<br>Line two, same paragraph</p>
```

**Explanation:** `<strong>` wraps "important" to make it bold and meaningful; `<br>` forces a line break without starting a new paragraph.

### Key Takeaways

- An element = opening tag + content + closing tag
- Attributes add extra info inside the opening tag (`src`, `alt`, `href`, ...)
- Void elements like `<br>` and `<img>` have no closing tag
- Nesting order matters: close inner elements before outer ones

## TOPIC: Topic 1.4 [Locked — Requires 1.3 Completion]: Setting Up Your Environment & The Basic Structure of an HTML Page

## Introduction & Core Concepts

You do not need to install anything complicated to write HTML. You only need two things:

1. **A text editor** — a program to write code. Beginners commonly use Visual Studio Code, which is free and includes helpful features like color highlighting and autocompletion.
2. **A web browser** — Chrome, Firefox, Edge, or Safari all work fine.

### The Working Folder

Professional developers keep their projects organized in a dedicated folder:

```
my-website/
├── index.html
├── about.html
├── images/
│   └── dog.jpg
└── css/
    └── styles.css
```

This organization becomes essential once a website grows beyond a few pages.

### Steps to Create Your First HTML File

1. Open your text editor and create a new file.
2. Save it with the `.html` extension, for example `index.html`. The extension tells the computer and browser that this file contains HTML code.
3. Type some HTML code (shown in the next topic).
4. Double-click the file, or right-click and choose "Open with Browser," to see the result.

There is no installation, compiler, or server required to view basic HTML — the browser reads the file directly from your computer.

### Real-World Use Cases & Rules

- Use a real code editor (VS Code, Sublime Text), not Word or Notepad — they insert hidden formatting that breaks HTML
- Save files with `.html` extension, lowercase names, no spaces
- Keep related assets (images, CSS, scripts) in organized folders
- Test in the browser frequently — small steps are easier to debug than huge ones

### Code Example / Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
</head>
<body>
    <h1>Welcome to my site!</h1>
    <p>This is the beginning of something great.</p>
</body>
</html>
```

### Key Takeaways

- You need only a text editor and a browser — nothing else to install
- The `.html` extension tells the computer how to handle the file
- Organized folders (images/, css/) keep projects manageable
- Use VS Code's autocompletion — typing `!` and pressing Tab generates the page skeleton

## The Basic Structure of an HTML Page

### Anatomy of the Skeleton

Every HTML page follows the same skeleton. Beginners should memorize this structure because it is the starting point for every project.

```html
<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>
```

### Line-by-Line Explanation

- `<!DOCTYPE html>` — This is not a tag but a declaration. It tells the browser "this document uses modern HTML5 rules." Without it, older browsers may render the page incorrectly.
- `<html>` — The root element. Everything on the page is nested inside this tag.
- `<head>` — Contains information *about* the page that is not directly shown as page content, such as the title, links to style sheets, and metadata.
- `<title>` — Sets the text shown on the browser tab.
- `<body>` — Contains everything the visitor actually sees: text, images, buttons, and so on.
- `<h1>` — A top-level heading.
- `<p>` — A paragraph of text.

### The Document Tree

The browser reads HTML as a **tree** of nested elements — the Document Object Model (DOM):

```
<html>
  ├── <head>
  │      └── <title>
  └── <body>
         ├── <h1>
         └── <p>
```

**Real-world analogy:** This is like a family tree or an outline for a report — every element knows its parent (the element containing it) and its children (elements inside it).

### Real-World Use Cases & Rules

- Always start with `<!DOCTYPE html>` — it prevents inconsistent rendering
- Put metadata and styles in `<head>`, visible content in `<body>`
- Use exactly one `<h1>` per page for the main title
- Indent nested elements so the structure is easy to read

### Code Example / Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>
```

**Expected output:** A browser tab labeled "My First Page," showing a large heading "Hello, World!" followed by a line of text below it.

### Key Takeaways

- Every HTML page shares the same skeleton: doctype, html, head, body
- `<head>` holds page info; `<body>` holds visible content
- `<!DOCTYPE html>` triggers modern HTML5 rendering
- Understanding the document tree (DOM) prepares you for CSS and JavaScript

## QUIZ: Module 1 Quiz — Pass to Unlock Module 2

Q: What does HTML stand for?
A: Hyperlinks and Text Markup Language
A: HyperText Markup Language
A: High-Text Machine Language
A: Home Tool Markup Language
ANS: 1

Q: Who created HTML?
A: Steve Jobs
A: Bill Gates
A: Tim Berners-Lee
A: Mark Zuckerberg
ANS: 2

Q: Which best describes HTML?
A: A programming language with loops and variables
A: A markup language that labels and organizes content
A: A styling language for colors and fonts
A: A database query language
ANS: 1

Q: Which of these is a void (self-closing) element?
A: <p>
A: <div>
A: <img>
A: <h1>
ANS: 2

Q: Where do attributes like src and alt go in an element?
A: In the closing tag
A: After the content
A: Inside the opening tag
A: In a separate file
ANS: 2

Q: What does the alt attribute in an <img> tag do?
A: Changes the image size
A: Provides alternative text for accessibility and load failures
A: Aligns the image on the page
A: Adds a border to the image
ANS: 1

Q: What file extension identifies a web page's structure file?
A: .css
A: .html
A: .js
A: .txt
ANS: 1

Q: What is the conventional name for a website's home page?
A: home.html
A: start.html
A: main.html
A: index.html
ANS: 3

Q: What does the <!DOCTYPE html> declaration do?
A: Creates a comment
A: Tells the browser to use modern HTML5 rules
A: Links a CSS file
A: Is optional and has no effect
ANS: 1

Q: In the document tree, which element contains everything the visitor sees?
A: <head>
A: <title>
A: <body>
A: <meta>
ANS: 2
