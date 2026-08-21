// IH Academy — Frontend Engineering Major Course (PRO Track #3)
// Exact same schema as genaiCourseData.js (Course 2) and mlCourseData.js (Course 1)
// so the shared viewer, roadmap engine, and progress tracking work without modification.
// 10 modules · 100 lessons · 20-question grand quiz · 3 capstone projects.

export const frontendMajorCourse = {
  "id": "frontend-major-course",
  "title": "Frontend Engineering Major Course",
  "subtitle": "Complete Beginner → Professional Frontend Engineer (HTML, CSS, JavaScript, React)",
  "badge": "MAJOR COURSE",
  "level": "Beginner",
  "duration": "36 hours",
  "tags": [
    "HTML5",
    "CSS",
    "JavaScript",
    "React",
    "Responsive Design",
    "Accessibility",
    "DOM",
    "REST APIs"
  ],
  "description": "A chapter-based course designed to teach the foundations required to build real-world frontend applications. Ten comprehensive modules take a complete beginner from HTML, CSS, and JavaScript to professional React engineering, with 50 practice questions, three capstone project choices, and a 20-question grand quiz that verifies course-wide understanding.",
  "overview": [
    "Concept first: understand the underlying concept before relying on abstractions — the course teaches HTML, CSS, and JavaScript from first principles before introducing React.",
    "Example and practice: study a worked code example in every module, then write code repeatedly rather than only reading explanations, with five exercises per module.",
    "Professional quality: treat accessibility, responsiveness, and error states as part of the interface — not optional polish — with a dedicated quality module on accessibility, performance, and testing.",
    "Capstone integration: use React only after a strong HTML, CSS, and JavaScript foundation, and finish with a substantial capstone that integrates all ten modules and gates the certificate."
  ],
  "ebook": {
    "title": "Frontend Engineering — Modern UI at Production Scale",
    "pages": 126,
    "edition": "2026 Edition"
  },
  "modules": [
    {
      "id": "mod-1",
      "number": 1,
      "title": "The Web, HTML & Semantic Structure",
      "difficulty": "Beginner",
      "summary": "Build well-structured, accessible web pages using HTML5 and understand how browsers turn markup into a document. The concept map follows the journey from URL and user through the HTTP request, the HTML document, the DOM, and the rendered page.",
      "objectives": [
        "Build a semantic HTML5 page using header, nav, main, section, article, figure, and footer.",
        "Explain how a browser resolves a URL, fetches resources, parses HTML, and renders the page.",
        "Create accessible forms with programmatically associated labels and validation attributes.",
        "Use semantic HTML as the accessibility baseline for keyboard users and assistive technology.",
        "Choose native elements over generic divs and justify each choice."
      ],
      "lessons": [
        {
          "id": "1.1",
          "title": "Introduction",
          "type": "theory",
          "content": "Welcome to the Frontend Engineering Major Course. This is a full engineering track: you will learn how the web actually works, then master the three core languages — HTML for structure, CSS for presentation, and JavaScript for behavior — before building real interfaces with React.\n\nThe module follows the course concept map: a URL entered by a user becomes an HTTP request, which returns an HTML document, which the browser parses into a DOM, which finally becomes the rendered page. Understanding this journey first is what separates engineers who reason about their work from people who paste code. Read the chapter explanations first, then study the worked example and complete the practice set without copying the solution pattern blindly.\n\n**Why it matters.** Every professional interface starts as markup. If you cannot produce a well-structured, accessible HTML document, every later layer — CSS, JavaScript, React — is built on a weak foundation.\n\n**Step-by-step intuition.** The concept map is the mental model: URL / User → HTTP Request → HTML Document → DOM → Rendered Page. Every page you will ever build moves through these five boxes.\n\n**Practitioner notes.** Keep a browser open while you study and inspect every page you visit with DevTools. Seeing the DOM of real sites turns abstract rules into habits.",
          "codeSnippet": null
        },
        {
          "id": "1.2",
          "title": "Learning Objectives",
          "type": "theory",
          "content": "By the end of this module you will be able to:\n\n- Build well-structured, accessible web pages using HTML5.\n- Explain how browsers turn markup into a document, from URL entry to the rendered page.\n- Use semantic elements — header, nav, main, section, article, footer, figure, and more — with correct meaning.\n- Create accessible forms with programmatically associated labels, appropriate input types, and validation attributes.\n- Apply accessibility foundations: native elements, keyboard reachability, and visible focus.\n\n**Why it matters.** These objectives are a self-test checklist, not bureaucracy. The professional outcome is precise: build well-structured, accessible web pages using HTML5 and understand how browsers turn markup into a document. Each objective maps forward — semantic structure becomes the markup your CSS targets, and form skills become the controlled forms of Module 6.\n\n**Step-by-step intuition.** Turn each objective into a demonstrable question: 'Can I build a page with header, nav, main, section, article, and footer and explain why each element is there?' If you can do it in a fresh file without looking anything up, the objective is done.\n\n**Practitioner notes.** Grade yourself honestly. A fuzzy 'I sort of know it' is how gaps compound silently across one hundred lessons.",
          "codeSnippet": null
        },
        {
          "id": "1.3",
          "title": "How the Web Works",
          "type": "theory",
          "content": "A frontend engineer works at the boundary between a user and the systems that deliver an application. When a user enters a URL, the browser resolves the domain, establishes a connection, requests resources, receives responses, parses HTML, downloads related CSS and JavaScript, and constructs a page that can be rendered and interacted with.\n\n**Why it matters.** This request-response journey is the ground truth of every frontend job. When a page loads slowly, when a resource 404s, when a script blocks rendering — the cause lives in one of these steps. Understanding the journey lets you debug what the user actually experiences.\n\n**Step-by-step intuition.** Follow one URL end to end: resolution (the domain becomes an address), connection (the browser establishes a connection to the server), request (the browser asks for the page), response (the server returns HTML), then parsing, fetching related resources, and rendering.\n\n**Practitioner notes.** Open DevTools on the Network tab while loading any page. Each row you see is one of these steps made visible — and it is the same tab you will use in every module of this course.",
          "codeSnippet": null
        },
        {
          "id": "1.4",
          "title": "HTML as the Document Layer",
          "type": "theory",
          "content": "HTML describes meaning and structure. It is not primarily a styling language. A good document communicates what a piece of content is: a heading, navigation area, article, form, button, list, table, image, or footer.\n\n**Why it matters.** This semantic information helps users, assistive technologies, search engines, and other developers understand the page. The same visual result can be produced with a wall of divs — but only semantic HTML carries meaning that a screen reader, a search engine, or a future maintainer can rely on.\n\n**Step-by-step intuition.** Ask one question for every element you place: 'What is this content?' The answer names the element — a list is ul/ol, a self-contained piece of content is article, a page region is section. The element is the answer to a question about meaning, not about appearance.\n\n**Practitioner notes.** Train yourself to reach for the most specific element that means something. When you type a generic div, pause and ask whether header, nav, main, article, or footer expresses the content more honestly.",
          "codeSnippet": null
        },
        {
          "id": "1.5",
          "title": "Text, Links, Lists & Media",
          "type": "theory",
          "content": "Learn headings, paragraphs, emphasis, ordered and unordered lists, links, images, figure/figcaption, audio/video, and embedded content. Headings should form a logical hierarchy rather than being chosen because of their visual size.\n\n**Why it matters.** Text and media are the substance of most pages, and their markup decisions are accessibility decisions: a skipped heading level confuses screen-reader navigation, and an image without alt text is invisible to assistive technology.\n\n**Step-by-step intuition.** (1) Headings: one h1 per page, then h2, h3 in order — hierarchy, not font size. (2) Links: the href points to a destination and the text describes it. (3) Images: use alt text that conveys the information when the image is informative, and an empty alt attribute when the image is decorative. (4) figure/figcaption pairs media with a caption.\n\n**Practitioner notes.** For audio, video, and embedded content, always consider fallbacks and captions. Every media decision has a user-visible consequence, so decide deliberately.",
          "codeSnippet": null
        },
        {
          "id": "1.6",
          "title": "Forms",
          "type": "theory",
          "content": "Forms are a major part of frontend engineering. Learn labels, inputs, textarea, select, button, fieldset, legend, validation attributes, and the difference between a submit button and a generic button. A label should be programmatically associated with its input.\n\n**Why it matters.** Forms are where users hand your application data, and the quality of that exchange decides whether the application works for them. A form without associated labels is a guessing game for screen-reader users; a form with no validation produces garbage data.\n\n**Step-by-step intuition.** Structure: a form contains controls (input, textarea, select) that are each linked to a label, grouped by fieldset/legend when related, and finished with a submit button. Programmatic association means the label's for attribute matches the control's id — clicking the label focuses the control, and assistive technology announces them as one unit.\n\n**Practitioner notes.** Learn the input types (email, password, date, checkbox) and validation attributes (required, minlength, pattern). And remember: a button with type submit submits; a generic button performs an action you attach with JavaScript — confusing them is one of the most common form bugs.",
          "codeSnippet": null
        },
        {
          "id": "1.7",
          "title": "Accessibility Foundations",
          "type": "theory",
          "content": "Semantic HTML provides a strong accessibility baseline. Use native elements before inventing custom controls. Keyboard users must be able to reach interactive controls, and focus should remain visible.\n\n**Why it matters.** Accessibility is not optional polish — it is part of the interface, exactly as the course blueprint states. Native elements ship with keyboard behavior, roles, and announcement semantics for free; custom div-based controls force you to reimplement all of it by hand, usually incompletely.\n\n**Step-by-step intuition.** Three rules cover most of the baseline: (1) choose the native element that matches the behavior — a real button for a button, a real link for a link; (2) verify every interactive control is reachable with the Tab key; (3) never remove focus outlines, because visible focus is how keyboard users know where they are.\n\n**Practitioner notes.** Test with your keyboard for five minutes on every page you build: Tab through, activate with Enter/Space, and confirm you can always see where focus is. This five-minute habit catches more accessibility defects than any tool.",
          "codeSnippet": null
        },
        {
          "id": "1.8",
          "title": "Worked Code Example",
          "type": "code",
          "content": "This worked example is the module's capstone document: a complete semantic page for a student dashboard. Study how each region uses a meaningful element — header for the page intro, nav for primary navigation with an aria-label, main for the dominant content, article for a self-contained piece, figure/figcaption for an image with a caption, and footer for the page end.\n\nNotice the details that make it professional: lang on the html element, charset and viewport metadata in the head, a meaningful alt attribute, and an aria-label that names the navigation for assistive technology.\n\n**Why it matters.** This is the smallest document a professional would ship. If you can write this from memory and explain every element's role, you have absorbed the module.\n\n**Step-by-step intuition.** Read it top to bottom as the browser does: doctype, head (metadata), body (visible content), then each landmark in order. Landmark elements (header, nav, main, footer) define the page's regions for assistive technology.\n\n**Practitioner notes.** Re-type this example from memory, then write your own version for a different product. The goal is the pattern, not the pixels.",
          "codeSnippet": "<!doctype html>\n<html lang='en'>\n<head>\n  <meta charset='UTF-8'>\n  <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n  <title>Student Dashboard</title>\n</head>\n<body>\n  <header>\n    <nav aria-label='Primary navigation'>\n      <a href='/'>IH Academy</a>\n      <a href='/courses'>Courses</a>\n      <a href='/about'>About</a>\n    </nav>\n  </header>\n  <main>\n    <article>\n      <h1>Frontend Engineering</h1>\n      <p>Build accessible interfaces from first principles.</p>\n      <figure>\n        <img src='frontend.jpg' alt='Developer working on a frontend project'>\n        <figcaption>Learning by building.</figcaption>\n      </figure>\n    </article>\n  </main>\n  <footer>\n    <p>&copy; 2026 IH Academy</p>\n  </footer>\n</body>\n</html>"
        },
        {
          "id": "1.9",
          "title": "Engineering Notes & Professional Tips",
          "type": "theory",
          "content": "The module's engineering notes define the standard that every later module repeats: prefer clarity over cleverness — code should be understandable to another developer; test the feature from the user's perspective, not only from the developer's perspective; and handle realistic states: empty data, invalid input, loading, and failure.\n\n**Why it matters.** These three rules are the difference between markup that works on your machine and markup that works for real users. 'It renders' is the developer's view; 'the user can complete their goal' is the user's view.\n\n**Step-by-step intuition.** The recommended study rhythm applies to every module: Learn (read the chapter and study the examples) → Practice (complete the five exercises) → Integrate (combine related concepts) → Capstone (choose one of three projects) → Assessment (complete the 20-question grand quiz).\n\n**Practitioner notes.** Even at this early stage, apply the three notes to every exercise: ask 'would another developer understand this?', 'does this work from the user's perspective?', and 'what happens when the data is empty or the input is invalid?'",
          "codeSnippet": null
        },
        {
          "id": "1.10",
          "title": "Practice Exercises",
          "type": "theory",
          "content": "Complete the five practice exercises for this module. Each one builds recall and confidence, and together they prepare you for the integration with the rest of the course:\n\n1. Create a semantic landing page using header, nav, main, section, article, and footer.\n2. Build a registration form with labels, email, password, date, select, checkbox, and submit controls.\n3. Create an accessible navigation menu containing five links.\n4. Explain why a button and an anchor are not interchangeable.\n5. Inspect a page and identify three places where semantic HTML could replace generic div elements.\n\n**Why it matters.** Exercises convert reading into skill. The study rhythm is explicit: practice builds recall and confidence before you integrate and combine concepts.\n\n**Step-by-step intuition.** Work in order — they move from constructing a whole page to explaining a single decision. Exercise 4 is a thinking exercise; write your explanation in full sentences.\n\n**Practitioner notes.** Do not copy the worked example blindly. Close it, write your own version, then compare. The final capstone will demand exactly this independence.",
          "codeSnippet": null
        }
      ],
      "exercises": [
        "Create a semantic landing page using header, nav, main, section, article, and footer.",
        "Build a registration form with labels, email, password, date, select, checkbox, and submit controls.",
        "Create an accessible navigation menu containing five links.",
        "Explain why a button and an anchor are not interchangeable.",
        "Inspect a page and identify three places where semantic HTML could replace generic div elements."
      ]
    },
    {
      "id": "mod-2",
      "number": 2,
      "title": "CSS Foundations, Layout & Responsive Design",
      "difficulty": "Beginner",
      "summary": "Turn semantic HTML into polished, responsive interfaces using the CSS box model, layout systems, typography, and reusable styling patterns. The concept map follows the path from HTML structure and CSS rules through the layout engine to a responsive viewport and the visual UI.",
      "objectives": [
        "Style elements with selectors and understand the cascade, specificity, and source order.",
        "Explain and control the CSS box model with box-sizing: border-box as a baseline.",
        "Build one-dimensional layouts with Flexbox and two-dimensional layouts with CSS Grid.",
        "Create responsive interfaces with fluid widths, flexible grids, and media queries.",
        "Design states, transitions, and motion while respecting the prefers-reduced-motion preference."
      ],
      "lessons": [
        {
          "id": "2.1",
          "title": "Introduction",
          "type": "theory",
          "content": "Welcome to CSS Foundations, Layout & Responsive Design. In Module 1 you gave the document meaning; this module gives it form. You will learn the CSS mental model, selectors and the cascade, the box model, typography, Flexbox, Grid, responsive design, and states, transitions and motion.\n\nThe concept map for this module: HTML structure → CSS rules → layout engine → responsive viewport → visual UI. The layout engine is the browser's core that turns your rules and structure into pixels — and the responsive viewport is the discipline that keeps the result usable at every screen size.\n\n**Why it matters.** Users judge interfaces in milliseconds. Polished, responsive, accessible CSS is what makes an application feel professional rather than functional-but-rough. The professional outcome for this module is to turn semantic HTML into polished, responsive interfaces using the CSS box model, layout systems, typography, and reusable styling patterns.\n\n**Step-by-step intuition.** CSS is rules applied to elements: a rule has a selector and declarations. Professional CSS is easier to maintain when styles are organized around predictable components, reusable tokens, and clear layout responsibilities.\n\n**Practitioner notes.** Read the explanations first, then study the worked code example and complete the practice set without copying the solution pattern blindly.",
          "codeSnippet": null
        },
        {
          "id": "2.2",
          "title": "Learning Objectives",
          "type": "theory",
          "content": "By the end of this module you will be able to:\n\n- Apply the CSS mental model: rules, selectors, declarations, and the cascade.\n- Use element, class, ID, attribute, descendant, child, pseudo-class, and pseudo-element selectors.\n- Explain and control the box model, with box-sizing: border-box as a baseline.\n- Build one-dimensional layouts with Flexbox and two-dimensional layouts with CSS Grid.\n- Create responsive interfaces with fluid widths, media queries, and responsive typography.\n\n**Why it matters.** These objectives map directly to the professional outcome: turn semantic HTML into polished, responsive interfaces using the CSS box model, layout systems, typography, and reusable styling patterns. Every later module assumes you can lay out a page without fighting the browser.\n\n**Step-by-step intuition.** Turn each objective into a demonstrable question: 'Can I build a three-card grid that reflows to one column on a phone without touching the HTML?' If yes, the objective is done.\n\n**Practitioner notes.** Grade yourself honestly — layout fluency is cumulative, and Module 8 and the capstones will exercise every one of these skills.",
          "codeSnippet": null
        },
        {
          "id": "2.3",
          "title": "Selectors & Cascade",
          "type": "theory",
          "content": "Understand element, class, ID, attribute, descendant, child, pseudo-class, and pseudo-element selectors. The cascade considers origin, importance, specificity, and source order. Avoid solving every conflict with !important.\n\n**Why it matters.** Two developers can write identical-looking CSS with wildly different maintainability. The cascade is the browser's conflict-resolution algorithm: when several rules target the same property, origin, importance, specificity, and source order decide the winner. Understanding it predicts which style wins without experimenting.\n\n**Step-by-step intuition.** Specificity counts: an ID beats a class, a class beats an element, and a later source-order rule breaks ties at the same specificity. !important overrides the cascade entirely — it is occasionally necessary, but reaching for it constantly means your selectors are poorly structured.\n\n**Practitioner notes.** Keep selectors shallow and semantic: class-based rules tied to component names are easier to reason about than deep descendant chains. When you feel the urge to write !important, look for the real conflict first.",
          "codeSnippet": null
        },
        {
          "id": "2.4",
          "title": "Box Model",
          "type": "theory",
          "content": "Every element participates in a box model consisting of content, padding, border, and margin. box-sizing: border-box is a common baseline because declared dimensions include padding and borders.\n\n**Why it matters.** Most first-time CSS confusion comes from the box model: you declare width: 300px, add padding and a border, and the element renders wider than 300px. Understanding the model explains the surprise.\n\n**Step-by-step intuition.** Inside out: content (the text or media), padding (space inside the border), border (the edge), margin (space outside the border). With content-box (the default), width describes the content only. With border-box, width includes padding and border — which is why border-box on everything is the standard professional baseline.\n\n**Practitioner notes.** Apply the universal reset — * { box-sizing: border-box; } — as the worked example does, and think in margin for spacing between elements and padding for spacing inside them.",
          "codeSnippet": null
        },
        {
          "id": "2.5",
          "title": "Flexbox",
          "type": "theory",
          "content": "Flexbox is ideal for one-dimensional layout: rows or columns where items need alignment, distribution, wrapping, or flexible sizing. Learn flex-direction, gap, justify-content, align-items, flex-wrap, flex-grow, and flex-basis.\n\n**Why it matters.** Navigation bars, button groups, card actions, and toolbars are one-dimensional arrangements — the everyday situations of a frontend engineer. Flexbox solves them with a few properties on the container and occasional values on the items.\n\n**Step-by-step intuition.** A flex container (display: flex) lays its children along the main axis set by flex-direction. justify-content distributes along that axis; align-items aligns across the perpendicular axis; gap adds spacing; flex-wrap lets items flow onto multiple lines; flex-grow and flex-basis control how items share available space.\n\n**Practitioner notes.** Draw the main and cross axes on paper for row and column directions until both are automatic. Most flexbox bugs are axis bugs — you aligned along the wrong line.",
          "codeSnippet": null
        },
        {
          "id": "2.6",
          "title": "CSS Grid",
          "type": "theory",
          "content": "Grid is powerful for two-dimensional layouts such as dashboards, galleries, and page sections. Learn grid-template-columns, rows, gap, minmax, auto-fit, and responsive grid patterns.\n\n**Why it matters.** Two-dimensional layout — rows and columns simultaneously — is where Flexbox stops and Grid begins. Dashboards, course grids, and page sections in this course and its capstones are Grid territory.\n\n**Step-by-step intuition.** display: grid creates a grid container; grid-template-columns and grid-template-rows define tracks; gap spaces them; minmax sets a track's minimum and maximum sizes; and auto-fit with minmax creates fluid responsive patterns — the browser creates as many columns as fit, as the worked example's card grid shows.\n\n**Practitioner notes.** For responsive grids, remember the pattern: repeat(auto-fit, minmax(220px, 1fr)). It gives you fluid columns without a single media query.",
          "codeSnippet": null
        },
        {
          "id": "2.7",
          "title": "Responsive Design",
          "type": "theory",
          "content": "Build for different viewport sizes rather than specific devices. Use fluid widths, max-width containers, flexible grids, responsive typography, and media queries when the layout genuinely needs a breakpoint.\n\n**Why it matters.** Devices change constantly; a design locked to a phone or a laptop is obsolete within months. Responsive design is the practice of building one interface that adapts — the course blueprint treats responsiveness as part of the interface, not optional polish.\n\n**Step-by-step intuition.** Prefer fluid primitives first: widths in percentages and min() so containers shrink with the viewport, flexible grids that reflow automatically, and relative units for type and spacing. Add media queries only where the layout genuinely needs a different arrangement — like the module's exercise of a two-column layout becoming one column on smaller screens.\n\n**Practitioner notes.** Resize your browser continuously while you develop rather than jumping between fixed widths. Watching the layout break at a specific width tells you exactly where a breakpoint belongs.",
          "codeSnippet": null
        },
        {
          "id": "2.8",
          "title": "Worked Code Example",
          "type": "code",
          "content": "This worked example is a reusable page shell — the professional starting point for any project. Study the layers: custom properties (:root) define reusable tokens for brand color, text color, surface color, and spacing; a universal border-box reset makes dimensions predictable; body sets the page baseline; .container centers content with a fluid max width using min(); .cards is a responsive Grid pattern; and .button shows a transition with a hover transform and a visible focus-visible outline.\n\nThe final media query respects prefers-reduced-motion — users who request less animation get none. That single block is a professional-quality accessibility decision.\n\n**Why it matters.** A shell like this is what professionals actually ship before writing a single component. Tokens, a reset, a container, and a responsive pattern cover most layout work.\n\n**Step-by-step intuition.** Read it as a system: tokens feed every rule; the reset normalizes the box model; the container and grid are the layout layer; the button is a stateful component (default, hover, focus); the media query is the motion policy.\n\n**Practitioner notes.** Adapt this shell for every project in the course. Consistency of structure is what makes debugging faster later.",
          "codeSnippet": "/* Reusable page shell */\n:root {\n  --brand: #1769e0;\n  --text: #17202a;\n  --surface: #ffffff;\n  --space: 1rem;\n}\n* {\n  box-sizing: border-box;\n}\nbody {\n  margin: 0;\n  color: var(--text);\n  background: #f6f8fb;\n  font-family: system-ui, sans-serif;\n}\n.container {\n  width: min(100% - 2rem, 1100px);\n  margin-inline: auto;\n}\n.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: var(--space);\n}\n.button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: .7rem 1rem;\n  border: 0;\n  border-radius: .6rem;\n  background: var(--brand);\n  color: white;\n  transition: transform .2s ease, opacity .2s ease;\n}\n.button:hover { transform: translateY(-1px); }\n.button:focus-visible { outline: 3px solid #9fc2ff; }\n@media (prefers-reduced-motion: reduce) {\n  * { scroll-behavior: auto !important; }\n  .button { transition: none; }\n}"
        },
        {
          "id": "2.9",
          "title": "Engineering Notes & Professional Tips",
          "type": "theory",
          "content": "The engineering notes for this module are the same professional standards you met in Module 1: prefer clarity over cleverness; test the feature from the user's perspective; and handle realistic states — empty data, invalid input, loading, and failure.\n\n**Why it matters.** CSS is where 'realistic states' gets concrete: a loading skeleton, an empty card grid, a disabled submit button, and an error banner are all states your styles must anticipate — not just the perfect happy path.\n\n**Step-by-step intuition.** Apply the study rhythm — Learn, Practice, Integrate, Capstone, Assessment — and, when styling, follow the chapter's progression from the mental model to selectors and cascade, box model, typography, Flexbox, Grid, responsiveness, and motion.\n\n**Practitioner notes.** For every component you style, ask: 'what does this look like in its empty, loading, error, and disabled states?' If the answer is 'I did not think about it', you are styling the developer's view, not the user's.",
          "codeSnippet": null
        },
        {
          "id": "2.10",
          "title": "Practice Exercises",
          "type": "theory",
          "content": "Complete the five practice exercises for this module. They progress from building a complete responsive layout to explaining the layout systems in your own words:\n\n1. Recreate a responsive three-card layout using CSS Grid.\n2. Build a responsive navigation that changes layout at a chosen breakpoint.\n3. Create a form style using consistent spacing, labels, focus states, and validation states.\n4. Make a two-column desktop layout become one column on smaller screens.\n5. Explain the difference between margin, padding, flexbox, and grid using your own example.\n\n**Why it matters.** Practice builds recall and confidence, and these five exercises cover the full module: layout, responsiveness, forms, and mental models.\n\n**Step-by-step intuition.** Do them in order — the final exercise forces you to articulate what you have been doing, which is where understanding crystallizes.\n\n**Practitioner notes.** Exercise 5 is an interview question in disguise. Practicing it aloud now will pay off later.",
          "codeSnippet": null
        }
      ],
      "exercises": [
        "Recreate a responsive three-card layout using CSS Grid.",
        "Build a responsive navigation that changes layout at a chosen breakpoint.",
        "Create a form style using consistent spacing, labels, focus states, and validation states.",
        "Make a two-column desktop layout become one column on smaller screens.",
        "Explain the difference between margin, padding, flexbox, and grid using your own example."
      ]
    },
    {
      "id": "mod-3",
      "number": 3,
      "title": "JavaScript Foundations",
      "difficulty": "Beginner",
      "summary": "Write clear JavaScript programs using variables, data types, control flow, functions, arrays, objects, and modern syntax. The concept map follows the loop from input through JavaScript logic and state to a DOM update and the result the user sees.",
      "objectives": [
        "Write JavaScript using const, let, data types, and operators.",
        "Use control flow, functions, arrow functions, and higher-order functions.",
        "Transform collections with map, filter, find, some, every, and reduce.",
        "Use destructuring, spread, optional chaining, nullish coalescing, and modules.",
        "Debug with browser DevTools using a reproduce-isolate-hypothesize-fix-verify loop."
      ],
      "lessons": [
        {
          "id": "3.1",
          "title": "Introduction",
          "type": "theory",
          "content": "Welcome to JavaScript Foundations. HTML gives the document structure, CSS gives it form, and JavaScript gives it behavior: it can read and change the DOM, respond to events, validate inputs, communicate with APIs, and manage application state.\n\nThe concept map for this module is a loop: Input → JavaScript logic → State/data → DOM update → the user sees a result. Every script you will ever write fits somewhere in this loop.\n\n**Why it matters.** JavaScript is the programming language of the frontend, and React — the final target of this course — is JavaScript with a component model on top. Weak JS fluency makes every later module slower; strong fluency makes React feel like a natural next step.\n\n**Step-by-step intuition.** Work through the foundations in the chapter's order: JavaScript in the browser, values/variables/types, operators and control flow, functions, arrays and objects, modern syntax, and debugging.\n\n**Practitioner notes.** Open the browser console and execute small snippets as you read. Typing code is the difference between reading about JavaScript and learning it.",
          "codeSnippet": null
        },
        {
          "id": "3.2",
          "title": "Learning Objectives",
          "type": "theory",
          "content": "By the end of this module you will be able to:\n\n- Write clear JavaScript programs using variables, data types, control flow, functions, arrays, objects, and modern syntax.\n- Choose const by default and let when reassignment is required, and explain the difference between primitive values and objects.\n- Write conditions and loops that communicate intent, with early returns where appropriate.\n- Transform collections with map, filter, find, some, every, and reduce.\n- Use template literals, optional chaining, nullish coalescing, modules, and basic error handling.\n\n**Why it matters.** The professional outcome is precise: write clear JavaScript programs. 'Clear' means another developer can read your intent — which is what the engineering notes demand.\n\n**Step-by-step intuition.** Turn each objective into a demonstrable question: 'Can I take an array of course objects and produce a filtered, mapped display list without a single loop?'\n\n**Practitioner notes.** Grade yourself by writing, not recognizing. Recognizing a function is not the same as reaching for it when a real problem appears.",
          "codeSnippet": null
        },
        {
          "id": "3.3",
          "title": "Values, Variables & Types",
          "type": "theory",
          "content": "Learn strings, numbers, booleans, null, undefined, arrays, objects, and the distinction between primitive values and objects. Prefer const by default and use let when reassignment is required.\n\n**Why it matters.** Type confusion produces the quietest bugs in frontend code: undefined reads, accidental string concatenation instead of addition, and truthiness mistakes in conditions. Knowing what each value is prevents them.\n\n**Step-by-step intuition.** Primitives (string, number, boolean, null, undefined) are single values compared by value. Objects (arrays included) are references compared by identity. Use const by default — it signals intent and catches accidental reassignment; switch to let only when the variable genuinely changes.\n\n**Practitioner notes.** Learn to read the console: typeof value is your first question when something misbehaves, and undefined reads are the most common answer.",
          "codeSnippet": null
        },
        {
          "id": "3.4",
          "title": "Functions",
          "type": "theory",
          "content": "Functions package behavior into reusable units. Learn parameters, return values, default parameters, arrow functions, scope, and higher-order functions.\n\n**Why it matters.** Functions are the unit of composition in JavaScript: every event handler, every array transformation callback, and every React component is, at heart, a function. The module's worked example — building a filtered, labeled course list — is a chain of functions.\n\n**Step-by-step intuition.** A function takes inputs (parameters), does work, and returns a value. Default parameters cover missing arguments; arrow functions provide compact syntax that matters in callbacks; scope defines which variables a function can see; higher-order functions take or return functions — which is exactly what map and filter do.\n\n**Practitioner notes.** Name functions after what they return or do, and keep them small. A function you can read in one breath is a function another developer can trust.",
          "codeSnippet": null
        },
        {
          "id": "3.5",
          "title": "Arrays & Objects",
          "type": "code",
          "content": "Frontend applications constantly transform collections of data. Become comfortable with map, filter, find, some, every, reduce, destructuring, spread syntax, and object property access.\n\n**Why it matters.** Almost everything a frontend engineer does with data is a collection transformation: courses to cards, cart items to totals, search results to a filtered list. These methods are the vocabulary of that work — and React's rendering of lists (Module 6) is built on exactly these ideas.\n\n**Step-by-step intuition.** map transforms every item into a new array of the same length. filter keeps the items that pass a test. find returns the first match. some and every answer questions about the collection. reduce folds the collection into a single value. Destructuring and spread extract and copy data without mutation.\n\n**Practitioner notes.** Build the habit of reading a chain left to right: courses → filter(price > 0) → map(label). When a chain gets longer than three steps, consider naming the intermediate result.",
          "codeSnippet": "const courses = [\n  { title: 'HTML & CSS', level: 'beginner', price: 0 },\n  { title: 'JavaScript', level: 'beginner', price: 10 },\n  { title: 'React', level: 'intermediate', price: 20 }\n];\nconst titles = courses.map(course => course.title);\nconst free = courses.filter(course => course.price === 0);\nconst react = courses.find(course => course.title === 'React');\nconst [first, ...rest] = courses;\nconst total = courses.reduce((sum, course) => sum + course.price, 0);\nconsole.log(titles, free, react, first, rest, total);"
        },
        {
          "id": "3.6",
          "title": "Modern JavaScript",
          "type": "theory",
          "content": "Learn template literals, optional chaining, nullish coalescing, modules, import/export, and basic error handling. These features make application code safer and easier to organize.\n\n**Why it matters.** Modern syntax exists for a reason: optional chaining (course?.title) replaces brittle manual checks for missing data; nullish coalescing (??) distinguishes 'null or undefined' from other falsy values like 0 or empty strings; and import/export is how real applications are organized into modules.\n\n**Step-by-step intuition.** Optional chaining stops the chain if any link is null/undefined — reading course?.title returns undefined instead of throwing. The nullish operator picks a default only when the left side is null/undefined, not when it is 0 or ''. Modules split code into files with explicit import/export boundaries. try/catch makes failures predictable instead of fatal.\n\n**Practitioner notes.** These features appear constantly in modern codebases, including React. Reading code written in older styles without them should feel like reading a dialect.",
          "codeSnippet": null
        },
        {
          "id": "3.7",
          "title": "Debugging",
          "type": "theory",
          "content": "Use browser DevTools, console output, breakpoints, network inspection, and small reproducible examples. Debugging is a reasoning process: reproduce, isolate, hypothesize, test, fix, and verify.\n\n**Why it matters.** Debugging is not a separate skill from programming — it is programming under uncertainty. The engineering notes demand handling realistic failure states; debugging is how you find out what those failures actually are.\n\n**Step-by-step intuition.** Follow the loop: reproduce (make the bug happen deterministically), isolate (find the smallest piece that fails), hypothesize (explain the cause), test (check the hypothesis), fix (change one thing), verify (confirm the fix and that nothing else broke).\n\n**Practitioner notes.** Prefer small reproducible examples when isolating. A bug in a 300-line file is hard; the same bug in a 15-line example is obvious. And use the console early and often — console.log is not shameful, it is evidence.",
          "codeSnippet": null
        },
        {
          "id": "3.8",
          "title": "Worked Code Example",
          "type": "code",
          "content": "This worked example demonstrates the module's core in one script: an array of course objects, a filter + map chain that produces a display-ready list, and a safe accessor function that never throws.\n\nStudy the chain: courses is the data, filter keeps only paid courses (price > 0), map builds a new object for each survivor using spread (...course) plus a computed label. Then getCourseLabel uses optional chaining (course?.title) with nullish coalescing (?? 'Untitled course') so a missing course object produces a safe fallback.\n\n**Why it matters.** This exact shape — data, transformation chain, safe accessor — appears in every later module, in React list rendering, and in API data handling.\n\n**Step-by-step intuition.** Read the code as a pipeline: source array → filter (keep) → map (transform). Trace what each step would output for the first course.\n\n**Practitioner notes.** Type this example, predict the console output before running, then run it. Predict-run-explain is the fastest fluency builder in this course.",
          "codeSnippet": "const courses = [\n  { title: 'HTML & CSS', level: 'beginner', price: 0 },\n  { title: 'JavaScript', level: 'beginner', price: 10 },\n  { title: 'React', level: 'intermediate', price: 20 }\n];\nconst paidCourses = courses\n  .filter(course => course.price > 0)\n  .map(course => ({\n    ...course,\n    label: course.title + ' — $' + course.price\n  }));\nfunction getCourseLabel(course) {\n  return course?.title ?? 'Untitled course';\n}\nconsole.log(paidCourses);\nconsole.log(getCourseLabel(courses[0]));"
        },
        {
          "id": "3.9",
          "title": "Engineering Notes & Professional Tips",
          "type": "theory",
          "content": "The engineering notes repeat the course standard: prefer clarity over cleverness — code should be understandable to another developer; test the feature from the user's perspective; and handle realistic states: empty data, invalid input, loading, and failure.\n\n**Why it matters.** In JavaScript, 'handle realistic states' is concrete: what happens when the array is empty, when a property is missing, when a request fails? The worked example's getCourseLabel is exactly this discipline — it handles the missing case before it happens.\n\n**Step-by-step intuition.** Apply the study rhythm — Learn, Practice, Integrate, Capstone, Assessment — and within each practice exercise, ask the user's-perspective question first: 'what will a user see if this data is empty or wrong?'\n\n**Practitioner notes.** Add the failure-path question to every function you write: 'what does this do with empty input?' A one-line guard now is a midnight debugging session avoided.",
          "codeSnippet": null
        },
        {
          "id": "3.10",
          "title": "Practice Exercises",
          "type": "theory",
          "content": "Complete the five practice exercises for this module. They move from a pure algorithm to data transformations to a full interactive counter:\n\n1. Write a function that returns the largest number in an array.\n2. Create an array of course objects and use filter + map to produce a display list.\n3. Build a counter using JavaScript and DOM event listeners.\n4. Write a function that safely reads a nested property using optional chaining.\n5. Use browser DevTools to find and fix a deliberate JavaScript error.\n\n**Why it matters.** Exercises 2-3 preview Modules 5-6: data transformations become API rendering, and DOM event listeners become React event handlers.\n\n**Step-by-step intuition.** Do them in order and write every one from scratch. Exercise 5 is your debugging-loop rehearsal — reproduce, isolate, hypothesize, test, fix, verify.\n\n**Practitioner notes.** Keep your solutions somewhere safe: Exercise 2 and Exercise 5 are candidates for the final code-quality review in Module 10.",
          "codeSnippet": null
        }
      ],
      "exercises": [
        "Write a function that returns the largest number in an array.",
        "Create an array of course objects and use filter + map to produce a display list.",
        "Build a counter using JavaScript and DOM event listeners.",
        "Write a function that safely reads a nested property using optional chaining.",
        "Use browser DevTools to find and fix a deliberate JavaScript error."
      ]
    },
    {
      "id": "mod-4",
      "number": 4,
      "title": "DOM, Events & Interactive Web Applications",
      "difficulty": "Intermediate",
      "summary": "Build interactive browser experiences by connecting user events, DOM state, forms, validation, and application logic. The concept map follows the loop from user event through the event handler, application state, DOM render/update, and feedback.",
      "objectives": [
        "Select, read, and update DOM nodes with the DOM API.",
        "Handle user events including click, input, change, submit, and keydown.",
        "Build forms with submit handling, FormData, validation, and useful errors.",
        "Persist client-side data with localStorage and JSON.",
        "Keep UI state explicit and derive the rendered UI from it."
      ],
      "lessons": [
        {
          "id": "4.1",
          "title": "Introduction",
          "type": "theory",
          "content": "Welcome to DOM, Events & Interactive Web Applications. You now know structure (HTML), form (CSS), and programming (JavaScript). This module connects all three: JavaScript selects elements in the DOM, listens for user events, updates application state, and re-renders the page.\n\nThe concept map is the loop every interactive feature follows: User event → Event handler → Application state → DOM render/update → Feedback.\n\n**Why it matters.** This is where pages become applications — where a static document becomes a to-do list, a counter, or a searchable catalogue. The professional outcome is to build interactive browser experiences by connecting user events, DOM state, forms, validation, and application logic.\n\n**Step-by-step intuition.** Work through the chapter in order: the DOM, selecting and updating elements, events, forms and validation, local storage, and UI state.\n\n**Practitioner notes.** Read the explanations first, then study the worked example and complete the practice set without copying the solution pattern blindly.",
          "codeSnippet": null
        },
        {
          "id": "4.2",
          "title": "Learning Objectives",
          "type": "theory",
          "content": "By the end of this module you will be able to:\n\n- Explain the DOM as the browser's object representation of the document.\n- Select, read, and modify nodes with querySelector, textContent, classList, and dataset.\n- Handle user events — click, input, change, submit, keydown — and understand propagation and delegation.\n- Build forms with submit handling, preventDefault, FormData, validation, and useful error messages.\n- Persist client-side data with localStorage and JSON, and keep UI state explicit.\n\n**Why it matters.** The professional outcome is precise: build interactive browser experiences by connecting user events, DOM state, forms, validation, and application logic. These objectives are the parts of that connection.\n\n**Step-by-step intuition.** Turn each objective into a demonstrable question: 'Can I build a to-do list with add, complete, and delete actions and explain where each piece of state lives?'\n\n**Practitioner notes.** Be honest about which objectives you can do from memory. This module is the bridge to React — state and re-rendering are about to become the center of your world.",
          "codeSnippet": null
        },
        {
          "id": "4.3",
          "title": "The DOM",
          "type": "theory",
          "content": "The DOM is the browser's object representation of the document. JavaScript can select nodes, read properties, modify text and attributes, create elements, and remove elements.\n\n**Why it matters.** Everything a user sees after the page loads is the DOM. When JavaScript 'does something', it reads or changes this tree — and the browser re-renders what the change affects.\n\n**Step-by-step intuition.** The HTML document becomes a tree of nodes: elements, text, attributes. You navigate it by selection (querySelector finds a node), then read or mutate (textContent changes displayed text, classList toggles classes, attributes change properties), then append/remove to restructure.\n\n**Practitioner notes.** Inspect the live DOM in DevTools on any page while a script updates it. Watching the tree change in real time makes the model concrete.",
          "codeSnippet": null
        },
        {
          "id": "4.4",
          "title": "Selecting & Updating Elements",
          "type": "code",
          "content": "Learn querySelector, querySelectorAll, textContent, classList, attributes, dataset, createElement, append, remove, and event-driven updates. Keep DOM manipulation intentional rather than scattering it throughout unrelated logic.\n\n**Why it matters.** Selection is the entry point of every interaction: you cannot respond to a button click without finding the button. And intentional, centralized updates — 'render the current state' rather than 'patch this one text' — are the discipline that later becomes React's mental model.\n\n**Step-by-step intuition.** querySelector returns the first match for a CSS selector; querySelectorAll returns a NodeList. textContent sets visible text safely; classList adds, removes, and toggles classes; dataset reads data-* attributes; createElement plus append grows the tree; remove deletes nodes. Keep updates in small render functions so the UI always reflects state.\n\n**Practitioner notes.** If you find yourself writing the same three-line DOM patch in ten places, stop — extract a render function. That instinct is the seed of the React patterns in Modules 6-7.",
          "codeSnippet": "const heading = document.querySelector('#course-title');\nheading.textContent = 'Frontend Engineering';\nheading.classList.add('highlight');\nconst cards = document.querySelectorAll('.course-card');\nfor (const card of cards) {\n  card.addEventListener('click', () => card.classList.toggle('selected'));\n}\nconst newItem = document.createElement('li');\nnewItem.textContent = 'New course';\ndocument.querySelector('#course-list').append(newItem);\nconsole.log(cards.length);"
        },
        {
          "id": "4.5",
          "title": "Events",
          "type": "theory",
          "content": "Events represent user and browser actions. Learn click, input, change, submit, keydown, and event propagation. Event delegation can be useful when many similar elements are created dynamically.\n\n**Why it matters.** Events are how the user talks to the application. Every interactive product is a set of event → state → render loops, exactly as the concept map shows.\n\n**Step-by-step intuition.** addEventListener binds a handler to an event type on an element. User actions (click), typing (input, keydown), value changes (change), and form submission (submit) are the everyday set. Events propagate from the target up through ancestors — delegation attaches one listener to a container and uses event targets, which stays efficient when many similar elements exist.\n\n**Practitioner notes.** Know when to preventDefault: for submit handlers you usually want to handle the data yourself and stop the browser's default navigation.",
          "codeSnippet": null
        },
        {
          "id": "4.6",
          "title": "Forms & Validation",
          "type": "theory",
          "content": "Use the form submit event, preventDefault when appropriate, read FormData, validate input, present useful errors, and preserve accessible labels and focus behavior.\n\n**Why it matters.** Forms are the main data-entry channel of the web, and Module 1 gave them structure. This lesson gives them behavior: interception on submit, validation before any data leaves the page, and error messages the user can actually understand and act on.\n\n**Step-by-step intuition.** Listen for submit on the form, preventDefault to take control, read the values (FormData is the modern API), validate against your rules, and either proceed or present useful errors. Errors must be associated with their controls and announced accessibly, and focus should move to the first problem.\n\n**Practitioner notes.** Never trust the user's input — validate before use. And keep labels and focus visible: validation errors that are invisible to screen readers are validation errors half-solved.",
          "codeSnippet": null
        },
        {
          "id": "4.7",
          "title": "Local Storage",
          "type": "theory",
          "content": "localStorage can persist small amounts of client-side data as strings. JSON.stringify and JSON.parse are commonly used for structured values. Never treat localStorage as a secure place for secrets.\n\n**Why it matters.** Persistence is what makes a preference stick: theme choices, drafts, and small caches survive reloads. It is also security-sensitive — anything in localStorage is readable by any script on the page.\n\n**Step-by-step intuition.** localStorage.setItem(key, string) writes; getItem reads; removeItem deletes. For structured values, stringify on the way in and parse on the way out, wrapped in try/catch because stored data may be missing or corrupted.\n\n**Practitioner notes.** Store only what is appropriate: preferences, not passwords, tokens, or anything sensitive. And always treat the read value as possibly absent or malformed.",
          "codeSnippet": null
        },
        {
          "id": "4.8",
          "title": "Worked Code Example",
          "type": "code",
          "content": "This worked example is the smallest complete interactive feature: a counter. Study the architecture because it is the pattern for everything bigger: state lives in a plain object, a render function derives the DOM output from state, and the event handler changes state then calls render.\n\nNotice the separation: the click handler never touches the DOM directly — it mutates state and lets render update the display. That separation is the seed of the React model: state, then UI derived from state.\n\n**Why it matters.** If you can explain why this tiny example is structured this way, you understand the core of interactive frontend engineering — and you are prepared for the 'derive the UI from state' discipline of Modules 6-7.\n\n**Step-by-step intuition.** Trace one click: event fires → handler increments state.count → render() rewrites output.textContent. The initial render() call at the end ensures the page and state agree from the start.\n\n**Practitioner notes.** Before moving on, rebuild this example from memory. Then extend it: add a decrement button and see how little the pattern changes.",
          "codeSnippet": "const state = {\n  count: 0\n};\nconst button = document.querySelector('#increment');\nconst output = document.querySelector('#count');\nfunction render() {\n  output.textContent = String(state.count);\n}\nbutton.addEventListener('click', () => {\n  state.count += 1;\n  render();\n});\nrender();"
        },
        {
          "id": "4.9",
          "title": "Engineering Notes & Professional Tips",
          "type": "theory",
          "content": "The engineering notes repeat the course standard: prefer clarity over cleverness; test the feature from the user's perspective, not only from the developer's perspective; and handle realistic states: empty data, invalid input, loading, and failure.\n\n**Why it matters.** Interactive code is where 'realistic states' multiplies: a to-do list with zero items, a modal reopened a hundred times, a search with no matches, a form with invalid input. Each is a state the UI must survive gracefully.\n\n**Step-by-step intuition.** Apply the study rhythm — Learn, Practice, Integrate, Capstone, Assessment — and, for every feature you build this module, list its states before its events: what renders when data is empty, mid-action, or failed?\n\n**Practitioner notes.** The user's-perspective test is especially powerful here: click through your feature as a user who does not know the code. Where do you get stuck? That is the bug to fix.",
          "codeSnippet": null
        },
        {
          "id": "4.10",
          "title": "Practice Exercises",
          "type": "theory",
          "content": "Complete the five practice exercises for this module. Together they build the full interactive toolkit: lists, modals, live feedback, persistence, and filtering:\n\n1. Build a to-do list with add, complete, and delete actions.\n2. Create a modal that opens and closes from buttons and supports Escape.\n3. Build a live character counter for a textarea.\n4. Persist a theme preference with localStorage.\n5. Create a searchable list that filters items as the user types.\n\n**Why it matters.** Every one of these exercises is a real product feature — and each reappears in React form in Modules 6-8 and in the capstones.\n\n**Step-by-step intuition.** Do them in order. Exercise 5 (searchable list) is the most demanding and the best rehearsal for API-driven search in Module 5.\n\n**Practitioner notes.** For each exercise, write the state first, then the render, then the events — the concept-map order. It keeps the code intentional.",
          "codeSnippet": null
        }
      ],
      "exercises": [
        "Build a to-do list with add, complete, and delete actions.",
        "Create a modal that opens and closes from buttons and supports Escape.",
        "Build a live character counter for a textarea.",
        "Persist a theme preference with localStorage.",
        "Create a searchable list that filters items as the user types."
      ]
    },
    {
      "id": "mod-5",
      "number": 5,
      "title": "Modern JavaScript: Async Programming & APIs",
      "difficulty": "Intermediate",
      "summary": "Understand asynchronous JavaScript and build frontend features that consume real API data while handling loading, success, empty, and error states. The concept map follows the path from UI action through fetch and the HTTP API to the JSON response and the rendered state.",
      "objectives": [
        "Explain why asynchronous code exists and how Promises represent future results.",
        "Write readable asynchronous flows with async/await and try/catch/finally.",
        "Fetch and parse JSON from an HTTP API, including non-2xx responses.",
        "Design loading, success, empty, and error states for API-driven UI.",
        "Use Promise.all and Promise.allSettled and avoid stale-request race conditions."
      ],
      "lessons": [
        {
          "id": "5.1",
          "title": "Introduction",
          "type": "theory",
          "content": "Welcome to Modern JavaScript: Async Programming & APIs. Until now, every line you wrote ran immediately, in order. Real applications are not like that: fetching data from an API takes time, and the interface must keep responding while the work is pending.\n\nThe concept map is: UI action → fetch() → HTTP API → JSON response → Render state. The 'render state' box is the discipline that makes the difference between a demo and a product: loading, success, empty, and error are all rendered states.\n\n**Why it matters.** Every serious frontend consumes data from somewhere. The professional outcome for this module: understand asynchronous JavaScript and build frontend features that consume real API data while handling loading, success, empty, and error states.\n\n**Step-by-step intuition.** Work through the chapter in order: why async exists, Promises, async/await, fetch and HTTP basics, API data and UI states, and async patterns.\n\n**Practitioner notes.** Read the explanations first, study the worked example, then complete the practice set without copying the solution pattern blindly.",
          "codeSnippet": null
        },
        {
          "id": "5.2",
          "title": "Learning Objectives",
          "type": "theory",
          "content": "By the end of this module you will be able to:\n\n- Explain why asynchronous code exists and why the interface must stay responsive while work is pending.\n- Read and write Promises with pending, fulfilled, and rejected states and then/catch/finally handling.\n- Write asynchronous flows with async/await and try/catch/finally.\n- Fetch and parse JSON from an HTTP endpoint, including non-2xx responses.\n- Build API-driven features with loading, success, empty, and error states, and parallel request patterns.\n\n**Why it matters.** These objectives map directly to the professional outcome: consume real API data while handling loading, success, empty, and error states. Every capstone in this course depends on it.\n\n**Step-by-step intuition.** Turn each objective into a demonstrable question: 'Can I load a list from an API and render four distinct states — loading, success, empty, error?'\n\n**Practitioner notes.** Be honest about error handling especially — it is the objective most often skipped and the one that decides whether your work is professional.",
          "codeSnippet": null
        },
        {
          "id": "5.3",
          "title": "Promises",
          "type": "theory",
          "content": "A Promise represents a future result. Learn pending, fulfilled, rejected, then/catch/finally, and why promise chains should have intentional error handling.\n\n**Why it matters.** Network requests finish later — and a Promise is the object that stands in for the result until it arrives. Without this model, asynchronous code becomes a tangle of callbacks and unhandled failures.\n\n**Step-by-step intuition.** A promise is created, then settles: fulfilled (success value) or rejected (failure reason). then attaches success handling, catch attaches failure handling, finally runs cleanup either way. An unhandled rejection is a silent bug — every chain should end in a catch.\n\n**Practitioner notes.** When you see a chain, read it as: do this, then this, then this — and if anything fails, here is the recovery. Intentional error handling means every branch has a destination.",
          "codeSnippet": null
        },
        {
          "id": "5.4",
          "title": "async/await",
          "type": "theory",
          "content": "async/await makes asynchronous flows easier to read. Use try/catch/finally around operations where errors must be handled and always design a visible loading state for user-facing requests.\n\n**Why it matters.** async/await turns promise chains into code that reads like ordinary sequential logic — which is easier to write, review, and debug. It is the standard style for modern frontend code, including the React effects you will write in Module 7.\n\n**Step-by-step intuition.** Mark the function async, then await promises inside it; the function returns a promise itself. Wrap the awaited work in try/catch for errors and finally for cleanup, and set the loading state before the request so the user sees progress, as the worked example's loadCourses does.\n\n**Practitioner notes.** Remember the discipline: visible loading state before the request, error state on failure, empty state when the data is empty, and success state only when the data is ready.",
          "codeSnippet": null
        },
        {
          "id": "5.5",
          "title": "Fetch & HTTP Basics",
          "type": "code",
          "content": "fetch can request resources from an HTTP endpoint. Understand methods, URLs, headers, status codes, JSON parsing, and the fact that fetch does not automatically reject merely because an HTTP response has a 4xx or 5xx status.\n\n**Why it matters.** fetch is the standard browser API for network requests, and the 4xx/5xx detail is a classic production bug: fetch only rejects on network-level failure, so a 404 or 500 resolves normally — you must check response.ok and throw yourself.\n\n**Step-by-step intuition.** fetch(url) sends a GET request and resolves to a Response. Check response.ok (or status) before trusting it; then await response.json() to parse the body; then use the data. Requests run through the browser's HTTP machinery: methods, headers, and status codes all apply.\n\n**Practitioner notes.** Always branch on response.ok before parsing. A JSON body from a 500 is usually an error page — parse it as data and you will surface the wrong message to the user.",
          "codeSnippet": "async function getCourse(id) {\n  const response = await fetch('/api/courses/' + id);\n  if (!response.ok) {\n    throw new Error('Request failed: ' + response.status);\n  }\n  return await response.json();\n}\ngetCourse(3)\n  .then(course => console.log(course.title))\n  .catch(error => console.error(error));"
        },
        {
          "id": "5.6",
          "title": "API Data & UI States",
          "type": "theory",
          "content": "A production interface should distinguish loading, success, empty, and error states. Validate assumptions about the response shape before rendering it.\n\n**Why it matters.** The course blueprint treats error states as part of the interface — not optional polish. A list that silently stays blank on failure is a broken feature; a list that explains 'no courses found' versus 'unable to load courses' is a professional feature.\n\n**Step-by-step intuition.** Model the state explicitly: loading (request in flight), success (data rendered), empty (success with no items), error (failure with a useful message). Before rendering, validate the shape you received — is it really an array? Do the expected fields exist?\n\n**Practitioner notes.** The empty case deserves its own message: 'No courses found' is not an error. Distinguishing the four states is the single highest-value habit in this module.",
          "codeSnippet": null
        },
        {
          "id": "5.7",
          "title": "Async Patterns",
          "type": "theory",
          "content": "Learn sequential versus parallel requests, Promise.all, Promise.allSettled, and when to cancel or ignore stale requests. Avoid race conditions when multiple searches can finish in an unexpected order.\n\n**Why it matters.** Real features often need several requests: a course detail and its reviews, a dashboard and its data tables. How you combine them decides speed and correctness — and search-as-you-type features are a classic race-condition source.\n\n**Step-by-step intuition.** Sequential awaits run one after another (needed when a later request depends on an earlier one). Promise.all runs independent requests in parallel and rejects on the first failure; Promise.allSettled waits for all regardless of outcomes. For stale requests, track which request is newest and ignore or abort older ones, as the Module 7 hook's AbortController does.\n\n**Practitioner notes.** Whenever results depend on ordering — search, autocomplete, pagination — assume out-of-order arrivals and guard against them explicitly.",
          "codeSnippet": null
        },
        {
          "id": "5.8",
          "title": "Worked Code Example",
          "type": "code",
          "content": "This worked example is a complete, professional data-loading function: it grabs its UI references, sets the loading state, clears the previous list, then fetches, validates the response, and renders — with every state covered.\n\nStudy the order: loading text before the request; response.ok checked so 4xx/5xx become thrown errors; empty array handled with its own message and an early return; success rendering items into the list; and a catch that shows a failure message and logs the real error.\n\n**Why it matters.** This function is the textbook answer to the module's professional outcome — consume real API data while handling loading, success, empty, and error states. In Module 7 the same logic becomes a reusable React hook.\n\n**Step-by-step intuition.** Trace the function for four scenarios: success with items, success with zero items, a 500 response, and a network failure. Every scenario has a visible destination.\n\n**Practitioner notes.** Keep this shape in mind — status element, list element, four states — because you will reimplement it in React with state objects in Modules 7-8.",
          "codeSnippet": "async function loadCourses() {\n  const status = document.querySelector('#status');\n  const list = document.querySelector('#courses');\n  status.textContent = 'Loading...';\n  list.replaceChildren();\n  try {\n    const response = await fetch('/api/courses');\n    if (!response.ok) {\n      throw new Error('Request failed: ' + response.status);\n    }\n    const courses = await response.json();\n    if (courses.length === 0) {\n      status.textContent = 'No courses found.';\n      return;\n    }\n    status.textContent = '';\n    for (const course of courses) {\n      const item = document.createElement('li');\n      item.textContent = course.title;\n      list.append(item);\n    }\n  } catch (error) {\n    status.textContent = 'Unable to load courses.';\n    console.error(error);\n  }\n}"
        },
        {
          "id": "5.9",
          "title": "Engineering Notes & Professional Tips",
          "type": "theory",
          "content": "The engineering notes repeat the course standard: prefer clarity over cleverness; test the feature from the user's perspective; and handle realistic states — empty data, invalid input, loading, and failure.\n\n**Why it matters.** No module is closer to the 'realistic states' rule than this one. Loading, empty, error, and success are the four states of every API feature, and handling all of them is the user's-perspective test applied to data.\n\n**Step-by-step intuition.** Apply the study rhythm — Learn, Practice, Integrate, Capstone, Assessment — and use the chapter's concept map when designing any data feature: UI action → fetch → HTTP API → JSON response → render state.\n\n**Practitioner notes.** For every API exercise, ask the four-state question before writing the fetch: 'what do I show while loading, when empty, on error, and on success?' Answer first, code second.",
          "codeSnippet": null
        },
        {
          "id": "5.10",
          "title": "Practice Exercises",
          "type": "theory",
          "content": "Complete the five practice exercises for this module. They move from rendering one dataset to combining two, and they end with an explanation exercise that forces the mental model to the surface:\n\n1. Fetch a list of products and render loading, success, and error states.\n2. Build a search interface that requests data based on a keyword.\n3. Use Promise.all to load two independent datasets together.\n4. Handle a non-2xx response correctly.\n5. Explain the difference between synchronous code, a Promise, and async/await.\n\n**Why it matters.** Exercises 1-2 are the exact features the capstone dashboards and storefronts require, and Exercise 5 is a classic interview question.\n\n**Step-by-step intuition.** Do them in order, and treat Exercise 2 as the race-condition rehearsal: type quickly and watch whether the latest result wins.\n\n**Practitioner notes.** Keep your four-state implementations — they become the loading/error/empty patterns of Modules 7-9.",
          "codeSnippet": null
        }
      ],
      "exercises": [
        "Fetch a list of products and render loading, success, and error states.",
        "Build a search interface that requests data based on a keyword.",
        "Use Promise.all to load two independent datasets together.",
        "Handle a non-2xx response correctly.",
        "Explain the difference between synchronous code, a Promise, and async/await."
      ]
    },
    {
      "id": "mod-6",
      "number": 6,
      "title": "React Fundamentals",
      "difficulty": "Intermediate",
      "summary": "Build real-world React interfaces using components, JSX, props, state, events, lists, forms, and basic component architecture. The concept map follows the flow from state and props through the component and its JSX output to React reconciliation and the browser UI.",
      "objectives": [
        "Write JSX and understand how it is transformed into JavaScript.",
        "Build reusable components with props as read-only inputs.",
        "Manage local state with useState and update it through event handlers.",
        "Render lists with map and stable keys.",
        "Build controlled forms with validation and clear error messages."
      ],
      "lessons": [
        {
          "id": "6.1",
          "title": "Introduction",
          "type": "theory",
          "content": "Welcome to React Fundamentals. You have built the foundation the course blueprint promised: HTML for structure, CSS for form, and JavaScript for behavior. React is the component model that organizes all three into real interfaces.\n\nThe concept map is: State / Props → Component → JSX output → React reconciliation → Browser UI. The key idea is reconciliation: instead of manually updating every DOM node, you describe what the UI should look like for a given state and let React make the changes.\n\n**Why it matters.** The professional outcome for this module: build real-world React interfaces using components, JSX, props, state, events, lists, forms, and basic component architecture. Everything from Module 4's 'derive the UI from state' becomes first-class here.\n\n**Step-by-step intuition.** Work through the chapter in order: why React, JSX, components and props, state and events, rendering lists, forms, and component composition.\n\n**Practitioner notes.** Read the explanations first, study the worked example, and complete the practice set without copying the solution pattern blindly.",
          "codeSnippet": null
        },
        {
          "id": "6.2",
          "title": "Learning Objectives",
          "type": "theory",
          "content": "By the end of this module you will be able to:\n\n- Explain why React models interfaces as reusable components and reconciles changes.\n- Write JSX and understand how it is transformed into JavaScript.\n- Build components with props as read-only inputs and clear responsibilities.\n- Manage local state with useState and update it through event handlers.\n- Render lists with map and stable keys, and build controlled forms with validation.\n\n**Why it matters.** These objectives are the components of the professional outcome. Each maps forward: props and state become data flow (Module 7), and list keys and controlled forms become application features (Module 8).\n\n**Step-by-step intuition.** Turn each objective into a demonstrable question: 'Can I build a course-card list with a checkbox filter, a controlled search input, and stable keys — without touching the DOM directly?'\n\n**Practitioner notes.** Grade yourself by building, not reading. If you have not written it, you do not know it.",
          "codeSnippet": null
        },
        {
          "id": "6.3",
          "title": "JSX",
          "type": "theory",
          "content": "JSX lets JavaScript code describe UI structures. Expressions use braces, attributes use JavaScript-friendly names, and components return UI descriptions. JSX is transformed into JavaScript before execution.\n\n**Why it matters.** JSX is the language you will write all day as a React developer. Understanding the transformation — JSX is not HTML; it is a syntax for calling functions that describe the UI — explains why className not class, why htmlFor not for, and why expressions live in braces.\n\n**Step-by-step intuition.** Write JSX as structure with embedded expressions: text and elements directly; dynamic values inside single braces ({title}); JavaScript names for attributes (className, onClick, htmlFor). The compiler transforms the whole tree into plain JavaScript calls before the browser sees anything.\n\n**Practitioner notes.** When something does not render as expected, ask which layer failed: your data, the expression, or the transformation. Reading the compiled output in DevTools once demystifies the whole system.",
          "codeSnippet": null
        },
        {
          "id": "6.4",
          "title": "Components & Props",
          "type": "theory",
          "content": "Components should have clear responsibilities. Props pass data from parent to child and should be treated as read-only inputs.\n\n**Why it matters.** Components are the unit of reuse and organization in React — the 'reusable UI' of every professional codebase. Clear responsibility and read-only props are what keep a growing component tree understandable.\n\n**Step-by-step intuition.** A component is a function that returns JSX. It receives one object, props, that carries data and behavior from the parent. Treat props as read-only: if a component needs to change data, it asks the parent through a callback prop, never by mutating the prop itself.\n\n**Practitioner notes.** Name components after what they are or do (CourseCard, CourseList), keep each one focused on a single responsibility, and resist the urge to grow one component until it does everything.",
          "codeSnippet": null
        },
        {
          "id": "6.5",
          "title": "State & Events",
          "type": "code",
          "content": "useState stores local component state. Updating state schedules a new render. Event handlers should update state rather than trying to manually force the DOM into a new state.\n\n**Why it matters.** This is the heart of React: the UI is a function of state. You never touch the DOM; you change state and React reconciles. It is the Module 4 counter pattern — state, render derived from state — made automatic and declarative.\n\n**Step-by-step intuition.** useState returns a pair: the current value and a setter. Calling the setter with a new value schedules a re-render of the component with the new value. Handlers wired through onClick, onChange, and friends call setters instead of manipulating the DOM.\n\n**Practitioner notes.** If you find yourself reaching for direct DOM manipulation inside a React component, stop — that is the Module 4 instinct. Express the new state, and let React do the work.",
          "codeSnippet": "import { useState } from 'react';\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}"
        },
        {
          "id": "6.6",
          "title": "Rendering Lists",
          "type": "theory",
          "content": "Use map to render collections and provide stable keys that identify items. Avoid using array indexes as keys when list items can be reordered, inserted, or removed.\n\n**Why it matters.** Lists are everywhere — course cards, cart items, activity feeds — and React uses keys to identify items across renders. Unstable keys produce subtle bugs: wrong animations, lost focus, mixed-up state in list items.\n\n**Step-by-step intuition.** Render a collection with items.map(item => <Component key={item.id} ... />). The key must be a stable, unique identifier of the item itself — its database id, not its position. Index keys are fine only for static lists that never reorder.\n\n**Practitioner notes.** Every item your data model produces should already carry a stable id. If it does not, ask whether your data layer should supply one — the worked example's courses have ids for exactly this reason.",
          "codeSnippet": null
        },
        {
          "id": "6.7",
          "title": "Forms",
          "type": "theory",
          "content": "Controlled inputs keep form values in React state. Learn value, onChange, submit handling, validation, and clear error messages.\n\n**Why it matters.** Forms are where users hand over data, and controlled inputs are React's answer: the input's displayed value comes from state, and every keystroke updates state through onChange. One source of truth, always in sync.\n\n**Step-by-step intuition.** For each field: state holds the value; the input's value prop shows it; onChange calls the setter with the typed value. Submit handling runs validation and either proceeds or renders error messages that are clear and accessible.\n\n**Practitioner notes.** Add validation progressively: required fields, then format checks, then submission feedback. Clear error messages next to their fields beat a wall of text at the top.",
          "codeSnippet": null
        },
        {
          "id": "6.8",
          "title": "Worked Code Example",
          "type": "code",
          "content": "This worked example shows both sides of React in one component tree: a presentational CourseCard that receives title and level as props, and a stateful CourseList that owns state, computes derived data, and renders the list.\n\nStudy the details: useState(false) for the filter toggle; derived data computed during render (visible = showFreeOnly ? filter : all); a controlled checkbox whose value lives in state; and a list rendered with map where each CourseCard gets a stable key from course.id.\n\n**Why it matters.** Every concept of this module — components, props, state, events, lists, keys — appears in this one example. If you can rebuild it from memory, you have passed Module 6.\n\n**Step-by-step intuition.** Trace one interaction: the user clicks the checkbox → onChange fires → setShowFreeOnly(true) → React re-renders → visible recomputes the filtered list → only free courses render.\n\n**Practitioner notes.** This example is also your Module 8 and capstone template: state, derived data, reusable card, mapped list. Keep it close.",
          "codeSnippet": "import { useState } from 'react';\nfunction CourseCard({ title, level }) {\n  return (\n    <article className='course-card'>\n      <h2>{title}</h2>\n      <p>{level}</p>\n    </article>\n  );\n}\nexport default function CourseList() {\n  const [showFreeOnly, setShowFreeOnly] = useState(false);\n  const courses = [\n    { id: 1, title: 'HTML & CSS', level: 'Beginner', free: true },\n    { id: 2, title: 'JavaScript', level: 'Beginner', free: false }\n  ];\n  const visible = showFreeOnly\n    ? courses.filter(course => course.free)\n    : courses;\n  return (\n    <section>\n      <label>\n        <input\n          type='checkbox'\n          checked={showFreeOnly}\n          onChange={e => setShowFreeOnly(e.target.checked)}\n        />\n        Show free only\n      </label>\n      {visible.map(course => (\n        <CourseCard\n          key={course.id}\n          title={course.title}\n          level={course.level}\n        />\n      ))}\n    </section>\n  );\n}"
        },
        {
          "id": "6.9",
          "title": "Engineering Notes & Professional Tips",
          "type": "theory",
          "content": "The engineering notes repeat the course standard: prefer clarity over cleverness; test the feature from the user's perspective; and handle realistic states — empty data, invalid input, loading, and failure.\n\n**Why it matters.** In React, 'realistic states' becomes component states: an empty course list, an invalid form, a pending request, a failed load. Components that only handle the happy path fail the user's-perspective test on day one.\n\n**Step-by-step intuition.** Apply the study rhythm — Learn, Practice, Integrate, Capstone, Assessment — and design every new component by asking 'what states can this component be in?' before writing its JSX.\n\n**Practitioner notes.** Write the empty state before the full state. Components designed from their emptiest state are almost always more robust.",
          "codeSnippet": null
        },
        {
          "id": "6.10",
          "title": "Practice Exercises",
          "type": "theory",
          "content": "Complete the five practice exercises for this module. They move from a single interactive counter to a fully controlled form:\n\n1. Build a React counter with increment, decrement, and reset.\n2. Create a reusable CourseCard component using props.\n3. Render an array of five courses with stable keys.\n4. Build a controlled search input that filters course cards.\n5. Create a registration form with controlled inputs and validation messages.\n\n**Why it matters.** These are the fundamental React patterns in isolation. Modules 7-8 and the capstones combine exactly these pieces into applications.\n\n**Step-by-step intuition.** Do them in order — each builds on the previous. Exercise 4 combines state and derived data; Exercise 5 adds validation and error rendering.\n\n**Practitioner notes.** Keep Exercise 4 and Exercise 5 solutions: they are the seed of Module 8's forms and search features.",
          "codeSnippet": null
        }
      ],
      "exercises": [
        "Build a React counter with increment, decrement, and reset.",
        "Create a reusable CourseCard component using props.",
        "Render an array of five courses with stable keys.",
        "Build a controlled search input that filters course cards.",
        "Create a registration form with controlled inputs and validation messages."
      ]
    },
    {
      "id": "mod-7",
      "number": 7,
      "title": "React Application Architecture & Data Flow",
      "difficulty": "Intermediate",
      "summary": "Organize React applications into understandable component trees and manage shared state, effects, derived data, and reusable logic. The concept map follows the flow from app state through parent and child components, events upward, and new state rendering.",
      "objectives": [
        "Break an interface into a meaningful component tree.",
        "Lift state to the nearest common parent and pass values and callbacks down.",
        "Derive data from existing state instead of duplicating it.",
        "Use useEffect for external systems and build custom hooks for reusable logic.",
        "Design components around loading, error, empty, and success states."
      ],
      "lessons": [
        {
          "id": "7.1",
          "title": "Introduction",
          "type": "theory",
          "content": "Welcome to React Application Architecture & Data Flow. You can build components; now you will organize them into a system. This module is about structure: component trees, where state lives, how data flows down and events flow up, effects, context, and reusable logic.\n\nThe concept map is: App state → Parent component → Child components → Events upward → New state → render. The 'events upward' box is the key architectural move: children never reach into shared state; they report changes up, and the parent owns the state.\n\n**Why it matters.** The professional outcome: organize React applications into understandable component trees and manage shared state, effects, derived data, and reusable logic. This is the difference between a demo and an architecture.\n\n**Step-by-step intuition.** Work through the chapter in order: thinking in component trees, lifting state up, derived state, useEffect, context, custom hooks, and loading/error/empty states.\n\n**Practitioner notes.** Read the explanations first, study the worked example, and complete the practice set without copying the solution pattern blindly.",
          "codeSnippet": null
        },
        {
          "id": "7.2",
          "title": "Learning Objectives",
          "type": "theory",
          "content": "By the end of this module you will be able to:\n\n- Break an interface into a meaningful component tree and decide which component owns each piece of state.\n- Lift state to the nearest common parent and pass values and callbacks down.\n- Derive data from existing state instead of storing it redundantly.\n- Use useEffect to synchronize with external systems, with proper cleanup.\n- Build custom hooks for reusable stateful behavior and design multi-state components.\n\n**Why it matters.** These objectives are the professional outcome's machinery: understandable component trees, shared state, effects, derived data, and reusable logic.\n\n**Step-by-step intuition.** Turn each objective into a demonstrable question: 'Can I give two sibling components a shared selected-course state without prop-drilling through ten components?'\n\n**Practitioner notes.** Grade yourself on the architecture, not just the outcome: a working app with one 500-line component does not pass this module.",
          "codeSnippet": null
        },
        {
          "id": "7.3",
          "title": "Lifting State Up",
          "type": "theory",
          "content": "When sibling components need the same state, move ownership to their nearest common parent and pass values and callbacks down.\n\n**Why it matters.** Duplicated state is a source of truth problem: two components holding the same value diverge, and the interface lies. Lifting makes the parent the single owner and data flows down as props.\n\n**Step-by-step intuition.** Ask which components read or update the state. If more than one needs it, the nearest common parent owns it: the parent keeps the state, passes the value down as props, and passes a callback down to whoever changes it. The child never owns the shared state — it reports changes upward.\n\n**Practitioner notes.** The question 'who needs to read or update this?' is the entire decision procedure. When the answer is 'two siblings', lift. When the answer is 'one component', keep it local.",
          "codeSnippet": null
        },
        {
          "id": "7.4",
          "title": "Derived State",
          "type": "theory",
          "content": "Do not store information that can be calculated from existing state unless there is a strong reason. For example, a filtered list can be derived from the original list and a search term.\n\n**Why it matters.** Stored derived data creates duplicated sources of truth — two values that must be kept in sync, with every sync an opportunity for a bug. The quiz's question on derived data is direct: avoid it because it creates duplicated sources of truth.\n\n**Step-by-step intuition.** Compute during render instead: const visible = courses.filter(course => matches(course, query)) — no extra state, no sync code, always correct. React recomputes on every render, and rendering is cheap; premature 'performance' storage is a bug factory.\n\n**Practitioner notes.** Ask 'can I calculate this from state I already have?' before adding a new state variable. Most filtered, counted, and summarized values in your UI are derived data.",
          "codeSnippet": null
        },
        {
          "id": "7.5",
          "title": "useEffect",
          "type": "code",
          "content": "Effects synchronize React with systems outside React, such as network requests, subscriptions, timers, or browser APIs. Avoid using effects for ordinary calculations that can happen during render.\n\n**Why it matters.** Most components need something React does not provide directly: a fetch, a scroll listener, a document title. useEffect is the sanctioned bridge — and using it wrongly (or for derived data) is the most common React architecture mistake.\n\n**Step-by-step intuition.** useEffect(callback, dependencies) runs the callback after render when dependencies change; the cleanup function returned by the callback runs before the next effect and on unmount. Fetching sets loading, then success or error state; listeners subscribe and the cleanup unsubscribes.\n\n**Practitioner notes.** The dependency array is a contract: list every external value the effect reads. And remember the rule of thumb — if it can be computed during render, it does not belong in an effect.",
          "codeSnippet": "import { useEffect } from 'react';\nfunction ScrollTracker() {\n  useEffect(() => {\n    const onScroll = () => console.log(window.scrollY);\n    window.addEventListener('scroll', onScroll);\n    return () => window.removeEventListener('scroll', onScroll);\n  }, []);\n  return null;\n}"
        },
        {
          "id": "7.6",
          "title": "Custom Hooks",
          "type": "theory",
          "content": "Custom hooks extract reusable stateful behavior. A good hook has a clear responsibility and a predictable API.\n\n**Why it matters.** When the same state logic — a fetch-with-states, a toggle, a form value — appears in several components, duplicating it spreads bugs. A custom hook is the extraction: reusable stateful behavior behind a function name.\n\n**Step-by-step intuition.** A custom hook is a function whose name starts with 'use' and which calls other hooks. It encapsulates state and effects and returns whatever the caller needs — the Module 5 four-state logic becomes the worked example's useCourses(query) returning { data, loading, error }.\n\n**Practitioner notes.** Name hooks by behavior (useCourses, useToggle, useLocalStorage), keep one responsibility each, and make the return shape predictable. If a hook needs more than a few lines of explanation, it is probably two hooks.",
          "codeSnippet": null
        },
        {
          "id": "7.7",
          "title": "Loading, Error & Empty States",
          "type": "theory",
          "content": "A robust component is designed around multiple states, not just the ideal successful screen. Treat these states as part of the UI architecture.\n\n**Why it matters.** The course blueprint treats error states as part of the interface — not optional polish. A data component that only renders success is not complete; it is one failed request away from a blank screen.\n\n**Step-by-step intuition.** Model the states explicitly — a single state object like { data, loading, error } — and render a branch per state: loading indicator, error message with recovery, empty message, or the data itself. The worked example's useCourses returns exactly this shape.\n\n**Practitioner notes.** Decide the empty and error messaging before writing the success markup. Components designed state-first are predictable, testable, and professional.",
          "codeSnippet": null
        },
        {
          "id": "7.8",
          "title": "Worked Code Example",
          "type": "code",
          "content": "This worked example is the module's centerpiece: a custom hook that encapsulates the entire Module 5 data-loading pattern inside React. useCourses(query) owns the state object { data, loading, error }, fetches with an AbortController, and cleans up.\n\nStudy the architecture: the effect re-runs when query changes; loading is set before each fetch; non-ok responses are thrown and caught; AbortError is filtered out so cancellation is not treated as a failure; and the cleanup aborts the controller so stale or unmounted requests never set state.\n\n**Why it matters.** This hook is the professional answer to 'how do I load API data in React?' — the same logic you will use in every capstone's search, catalogue, and dashboard views.\n\n**Step-by-step intuition.** Trace a query change: effect cleanup aborts the old request → new run() sets loading → fetch with the new query → success or error lands in state → the component re-renders with the new state.\n\n**Practitioner notes.** Keep this pattern as your default data hook: state object, AbortController, loading before fetch, AbortError filter, cleanup abort. It handles every state and the race condition from Module 5.",
          "codeSnippet": "import { useEffect, useState } from 'react';\nexport function useCourses(query) {\n  const [state, setState] = useState({\n    data: [],\n    loading: true,\n    error: null\n  });\n  useEffect(() => {\n    const controller = new AbortController();\n    async function run() {\n      setState({ data: [], loading: true, error: null });\n      try {\n        const res = await fetch(\n          '/api/courses?q=' + encodeURIComponent(query),\n          { signal: controller.signal }\n        );\n        if (!res.ok) throw new Error('Request failed');\n        const data = await res.json();\n        setState({ data, loading: false, error: null });\n      } catch (error) {\n        if (error.name !== 'AbortError') {\n          setState({ data: [], loading: false, error });\n        }\n      }\n    }\n    run();\n    return () => controller.abort();\n  }, [query]);\n  return state;\n}"
        },
        {
          "id": "7.9",
          "title": "Engineering Notes & Professional Tips",
          "type": "theory",
          "content": "The engineering notes repeat the course standard: prefer clarity over cleverness; test the feature from the user's perspective; and handle realistic states — empty data, invalid input, loading, and failure.\n\n**Why it matters.** Architecture is where clarity becomes structural: a readable component tree, single-owner state, and state-first components are 'clarity over cleverness' applied at the system level.\n\n**Step-by-step intuition.** Apply the study rhythm — Learn, Practice, Integrate, Capstone, Assessment — and, for each architecture exercise, draw the concept map first: app state → parent → children → events upward → new state → render.\n\n**Practitioner notes.** When a component grows past comfortable, the fix is usually architectural, not cosmetic: split responsibilities, lift the shared state, extract the hook. Do that before polishing styles.",
          "codeSnippet": null
        },
        {
          "id": "7.10",
          "title": "Practice Exercises",
          "type": "theory",
          "content": "Complete the five practice exercises for this module. They move from designing a tree to building a reusable hook:\n\n1. Draw the component tree for a dashboard with header, sidebar, cards, and activity list.\n2. Lift a selected-course state so two sibling components can use it.\n3. Create a derived filtered list without storing the filtered list separately.\n4. Build a custom hook that manages a boolean toggle.\n5. Create a React data component with explicit loading, error, empty, and success states.\n\n**Why it matters.** These are the architectural patterns of every professional React codebase — and the exact structures the capstones require.\n\n**Step-by-step intuition.** Do them in order. Exercise 1 is a paper exercise — draw before you code; Exercise 5 combines everything this module teaches.\n\n**Practitioner notes.** Exercise 4's toggle hook is reusable everywhere (modals, filters, menus) — keep it as a library piece for the capstones.",
          "codeSnippet": null
        }
      ],
      "exercises": [
        "Draw the component tree for a dashboard with header, sidebar, cards, and activity list.",
        "Lift a selected-course state so two sibling components can use it.",
        "Create a derived filtered list without storing the filtered list separately.",
        "Build a custom hook that manages a boolean toggle.",
        "Create a React data component with explicit loading, error, empty, and success states."
      ]
    },
    {
      "id": "mod-8",
      "number": 8,
      "title": "Building a Complete React Frontend",
      "difficulty": "Advanced",
      "summary": "Combine React fundamentals into a realistic multi-page-style application with navigation concepts, reusable UI, forms, data fetching, and coherent user flows. The concept map follows the path from page and route through layout and reusable components to data plus state and the user flow.",
      "objectives": [
        "Organize a project by responsibility: pages, components, data, hooks, and shared UI.",
        "Apply client-side navigation concepts including routes, parameters, and not-found views.",
        "Build reusable UI primitives that reuse behavior and semantics.",
        "Integrate APIs with data access separated from presentation.",
        "Design error boundaries and defensive rendering patterns."
      ],
      "lessons": [
        {
          "id": "8.1",
          "title": "Introduction",
          "type": "theory",
          "content": "Welcome to Building a Complete React Frontend. Modules 6-7 gave you components and architecture; this module combines them into a realistic, multi-page-style application with navigation, reusable UI, forms, data fetching, and coherent user flows.\n\nThe concept map: Page / route → Layout → Reusable components → Data + state → User flow. Every application you will build — including the capstones — is this chain.\n\n**Why it matters.** The professional outcome: combine React fundamentals into a realistic multi-page-style application with navigation concepts, reusable UI, forms, data fetching, and coherent user flows. This is the module where 'course' becomes 'application'.\n\n**Step-by-step intuition.** Work through the chapter in order: application structure, navigation concepts, reusable UI, forms and validation, API integration, responsive product UI, and error boundaries.\n\n**Practitioner notes.** Read the explanations first, study the worked example, and complete the practice set without copying the solution pattern blindly.",
          "codeSnippet": null
        },
        {
          "id": "8.2",
          "title": "Learning Objectives",
          "type": "theory",
          "content": "By the end of this module you will be able to:\n\n- Organize an application by responsibility: pages, components, data/API logic, hooks, and shared UI.\n- Apply client-side navigation concepts: routes, route parameters, links, nested layouts, and not-found views.\n- Build reusable UI primitives (buttons, inputs, cards, badges, modals) that reuse behavior and semantics.\n- Integrate APIs with data access separated from presentation.\n- Design error boundaries and defensive rendering so failures never produce a blank screen.\n\n**Why it matters.** These objectives are the professional outcome's parts: a realistic multi-page-style application with navigation, reusable UI, forms, data fetching, and coherent user flows.\n\n**Step-by-step intuition.** Turn each objective into a demonstrable question: 'Can I build a course dashboard with routes, reusable components, four UI states, and a defensive rendering strategy?'\n\n**Practitioner notes.** Grade yourself on the user flows, not just the views: can a user land, browse, open a detail, take an action, and get confirmation?",
          "codeSnippet": null
        },
        {
          "id": "8.3",
          "title": "Application Structure",
          "type": "theory",
          "content": "Organize an application by responsibility. A simple project can separate pages, components, data/API logic, hooks, and shared UI. Avoid creating folders simply for the sake of folders; structure should help a developer locate code quickly.\n\n**Why it matters.** Structure is communication. A new developer (or future you) should be able to find the page, the component, the hook, and the API call within seconds. Structure exists to make code findable, not to look organized.\n\n**Step-by-step intuition.** Group by responsibility: pages hold routed views; components hold presentational pieces; data/API logic holds requests and parsing; hooks hold reusable stateful behavior; shared UI holds primitives reused everywhere. Keep the grouping honest — a folder with one file is usually a sign of over-structuring.\n\n**Practitioner notes.** When you find yourself searching more than a few seconds for a piece of code, the structure failed. Move it to the place your intuition already expects it.",
          "codeSnippet": null
        },
        {
          "id": "8.4",
          "title": "Navigation Concepts",
          "type": "theory",
          "content": "Professional frontends often have multiple views. Understand the concept of client-side routing, route parameters, navigation links, nested layouts, and not-found views. A routing library can provide these capabilities in a real application.\n\n**Why it matters.** Multi-page-style applications are how products organize themselves: landing, catalogue, details, dashboard. Client-side routing switches views without full page reloads, and route parameters (the id in /courses/42) let one view render many entities.\n\n**Step-by-step intuition.** The mental model: the URL is part of the app state. Routes map paths to views; links navigate without reloading; route parameters identify the entity a detail view shows; nested layouts share chrome across routes; not-found views catch every unmatched path gracefully.\n\n**Practitioner notes.** Always design the not-found view. Unmatched paths are inevitable — a professional app greets them with a designed screen, not a browser error.",
          "codeSnippet": null
        },
        {
          "id": "8.5",
          "title": "Reusable UI",
          "type": "theory",
          "content": "Create reusable buttons, inputs, cards, badges, modals, navigation elements, and layout primitives. Reuse behavior and semantics, not just visual appearance.\n\n**Why it matters.** Consistency is a quality signal: a design system of primitives gives the product uniform behavior, semantics, and look — and it makes every feature cheaper to build because the pieces already exist.\n\n**Step-by-step intuition.** A reusable component is a prop-driven primitive: Button takes variant and disabled; Input takes label and validation state; Card takes title and children. Reuse extends to behavior and semantics — the same accessible button markup everywhere, not the same colors.\n\n**Practitioner notes.** Build the primitives before the features. The dashboard, storefront, and analytics capstones all start from the same small set: Button, Input, Card, Badge, Modal.",
          "codeSnippet": null
        },
        {
          "id": "8.6",
          "title": "API Integration",
          "type": "theory",
          "content": "Separate data access from presentation where practical. Components should not become large collections of unrelated request and formatting logic.\n\n**Why it matters.** A component that fetches, formats, validates, and renders is four responsibilities in one — hard to read, test, and reuse. Separating data access (the hook or API module) from presentation (the JSX) is the Module 7 architecture applied to real features.\n\n**Step-by-step intuition.** Keep requests in hooks or API modules (useCourses returns { data, loading, error }); components consume the shape and render branches per state. Formatting derived from data belongs with the data layer or during render, not scattered across handlers.\n\n**Practitioner notes.** If a component's file stops being readable in one screen, extract: the data logic goes to a hook, the markup stays presentational, and both get simpler.",
          "codeSnippet": null
        },
        {
          "id": "8.7",
          "title": "Error Boundaries & Defensive UI",
          "type": "theory",
          "content": "Unexpected rendering failures should not turn the entire experience into a blank screen. Understand the role of error boundaries and defensive rendering patterns at a conceptual level.\n\n**Why it matters.** One failing component can take down the whole page. Error boundaries — React's mechanism for catching rendering errors in a subtree and showing a fallback — and defensive rendering patterns (guarding null data, checking shapes) keep a single failure from becoming a blank screen.\n\n**Step-by-step intuition.** The concept: wrap risky subtrees in a boundary that renders a fallback UI when a rendering error is thrown; and render defensively — never assume data is present, validate shapes before rendering, and provide fallbacks for missing pieces.\n\n**Practitioner notes.** You do not need boundaries around every component — around each major region (page, widget, dashboard panel) is the professional default. Blank screens are the enemy; designed fallbacks are the answer.",
          "codeSnippet": null
        },
        {
          "id": "8.8",
          "title": "Worked Code Example",
          "type": "code",
          "content": "This worked example is a Dashboard page assembled from the module's patterns: an app shell layout, a header, a main container, a section labelled for assistive technology, a responsive grid of stat cards, and a course table.\n\nStudy the composition: the page is declarative — it describes the structure with props (label, value) and children (CourseTable), and the reusable StatCard and CourseTable components carry the actual presentation and data work. The aria-labelledby pairing makes the section's heading announce its region.\n\n**Why it matters.** This is the shape of every view in your capstones: layout primitives, reusable components, semantic structure, and a clear place where data flows in.\n\n**Step-by-step intuition.** Read it as a tree: app-shell → app-header, container → section → dashboard-grid (StatCards) and CourseTable. The dashboard-grid is the responsive Grid pattern from Module 2, and CourseTable is a data component from Module 7.\n\n**Practitioner notes.** Build your capstone views exactly this way: compose primitives, keep views declarative, and let data components handle the states.",
          "codeSnippet": "function Dashboard() {\n  return (\n    <div className='app-shell'>\n      <header className='app-header'>\n        <h1>IH Academy</h1>\n      </header>\n      <main className='container'>\n        <section aria-labelledby='welcome'>\n          <h2 id='welcome'>Welcome back</h2>\n          <div className='dashboard-grid'>\n            <StatCard label='Courses' value='12' />\n            <StatCard label='Completed' value='5' />\n            <StatCard label='Projects' value='2' />\n          </div>\n          <CourseTable />\n        </section>\n      </main>\n    </div>\n  );\n}"
        },
        {
          "id": "8.9",
          "title": "Engineering Notes & Professional Tips",
          "type": "theory",
          "content": "The engineering notes repeat the course standard: prefer clarity over cleverness; test the feature from the user's perspective; and handle realistic states — empty data, invalid input, loading, and failure.\n\n**Why it matters.** At application scale these three notes become user flows: every flow — landing → browse → details → action → confirmation — must work from the user's perspective across viewport sizes, with every realistic state handled.\n\n**Step-by-step intuition.** Apply the study rhythm — Learn, Practice, Integrate, Capstone, Assessment — and use the chapter's concept map when designing any feature: page/route → layout → reusable components → data + state → user flow.\n\n**Practitioner notes.** Walk each flow on mobile and desktop before calling it done. The engineering notes demand the user's perspective — and at application scale, that means the flow's perspective.",
          "codeSnippet": null
        },
        {
          "id": "8.10",
          "title": "Practice Exercises",
          "type": "theory",
          "content": "Complete the five practice exercises for this module. They move from designing the tree to shipping a responsive, state-complete dashboard:\n\n1. Design a component tree for a course dashboard.\n2. Build reusable Button, Card, Input, Badge, and Modal components.\n3. Create a multi-step form with next/back controls and validation.\n4. Build a course details view that loads data and shows all four UI states.\n5. Design a responsive dashboard that remains usable at mobile width.\n\n**Why it matters.** Exercises 2-5 are the direct ingredients of all three capstones — reusable primitives, validated forms, four-state data views, and responsive dashboards.\n\n**Step-by-step intuition.** Do them in order. Exercise 1 on paper first will make Exercises 2-5 structurally obvious.\n\n**Practitioner notes.** Exercise 2's component library is your capstone foundation — keep it clean and reusable, because you will build all three projects on it.",
          "codeSnippet": null
        }
      ],
      "exercises": [
        "Design a component tree for a course dashboard.",
        "Build reusable Button, Card, Input, Badge, and Modal components.",
        "Create a multi-step form with next/back controls and validation.",
        "Build a course details view that loads data and shows all four UI states.",
        "Design a responsive dashboard that remains usable at mobile width."
      ]
    },
    {
      "id": "mod-9",
      "number": 9,
      "title": "Frontend Engineering Quality: Accessibility, Performance & Testing",
      "difficulty": "Advanced",
      "summary": "Raise frontend work from 'it works' to professional quality through accessibility, performance thinking, maintainability, and practical testing. The concept map follows the journey from user need to accessible UI, measured performance, tested behavior, and maintainable code.",
      "objectives": [
        "Apply accessibility practices: semantics, labels, keyboard interaction, visible focus, and contrast.",
        "Reason about performance: network cost, JavaScript execution, rendering, and images.",
        "Use evidence-based React optimization: re-renders, boundaries, and memoization.",
        "Choose what to test using the unit, integration, and end-to-end mindset.",
        "Write maintainable code: readable naming, focused components, and why-comments."
      ],
      "lessons": [
        {
          "id": "9.1",
          "title": "Introduction",
          "type": "theory",
          "content": "Welcome to Frontend Engineering Quality: Accessibility, Performance & Testing. This module raises your work from 'it works' to professional quality. The course blueprint is explicit: treat accessibility, responsiveness, and error states as part of the interface — not optional polish.\n\nThe concept map: User need → Accessible UI → Measured performance → Tested behavior → Maintainable code. Each box is a discipline, and together they define what professional frontend work means.\n\n**Why it matters.** The professional outcome: raise frontend work from 'it works' to professional quality through accessibility, performance thinking, maintainability, and practical testing. These are the qualities that separate portfolio projects from hired engineers.\n\n**Step-by-step intuition.** Work through the chapter in order: accessibility as engineering quality, keyboard and focus, performance fundamentals, images and assets, React performance, the testing mindset, and maintainability.\n\n**Practitioner notes.** Read the explanations first, study the worked example, and complete the practice set without copying the solution pattern blindly.",
          "codeSnippet": null
        },
        {
          "id": "9.2",
          "title": "Learning Objectives",
          "type": "theory",
          "content": "By the end of this module you will be able to:\n\n- Apply accessibility practices: semantic structure, labels, keyboard interaction, visible focus, meaningful link text, contrast, and useful error messages.\n- Explain keyboard and focus requirements for dialogs, menus, and interactive features.\n- Reason about performance: network cost, JavaScript execution, rendering work, image size, and unnecessary updates.\n- Apply evidence-based React optimization: re-renders, stable boundaries, derived data, and memoization.\n- Use the testing mindset to decide what behavior is worth protecting with unit, integration, or end-to-end tests.\n\n**Why it matters.** Each objective is a measurable part of the professional outcome — 'it works' raised to professional quality.\n\n**Step-by-step intuition.** Turn each objective into a demonstrable question: 'Can I keyboard-audit a page, name three layout-shift causes, and list the five behaviors a course app should test?'\n\n**Practitioner notes.** Grade yourself by doing the audits on your own work — this module's exercises are checklists to run, not essays to read.",
          "codeSnippet": null
        },
        {
          "id": "9.3",
          "title": "Accessibility as Engineering Quality",
          "type": "theory",
          "content": "Accessibility is not a decorative add-on. Use semantic structure, labels, keyboard interaction, visible focus, meaningful link text, sufficient contrast, appropriate headings, and useful error messages.\n\n**Why it matters.** Accessibility is usability for people, including people using assistive technology — and the course blueprint treats it as part of the interface. It is also professional risk management: inaccessible products exclude users and fail audits.\n\n**Step-by-step intuition.** The checklist is a baseline: semantic structure (Module 1), labels for every control, keyboard reachability, visible focus, link text that says where the link goes, sufficient contrast, a real heading hierarchy, and error messages that say what happened and how to fix it.\n\n**Practitioner notes.** Run the checklist on every page you build, starting now. The checklist in the worked example — Tab reachability, visible focus, label meaning, loading communication — is the professional minimum.",
          "codeSnippet": null
        },
        {
          "id": "9.4",
          "title": "Keyboard & Focus",
          "type": "theory",
          "content": "Every interactive feature should be usable without a mouse. Focus should move logically and never become invisible. Dialogs and menus require special attention to focus behavior.\n\n**Why it matters.** Keyboard support is the backbone of accessibility: screen-reader users, motor-impaired users, and power users all rely on it. If a feature is mouse-only, it is not accessible.\n\n**Step-by-step intuition.** Tab moves forward, Shift+Tab backward, Enter/Space activate, Escape closes overlays. Focus must land logically when dialogs open (and return when they close), never disappear, and always remain visible. Invisible focus is as bad as no focus.\n\n**Practitioner notes.** Make the five-minute keyboard audit a habit: tab through every feature of every page. Dialogs and menus get the special attention — trap and restore focus deliberately.",
          "codeSnippet": null
        },
        {
          "id": "9.5",
          "title": "Performance Fundamentals",
          "type": "theory",
          "content": "Performance is influenced by network cost, JavaScript execution, rendering work, image size, and unnecessary updates. Measure before optimizing. Avoid shipping assets or code the user does not need.\n\n**Why it matters.** Performance is a user experience feature: slow interfaces lose users and trust. And the discipline 'measure before optimizing' prevents wasted effort — optimizing what is already fast is the classic amateur move.\n\n**Step-by-step intuition.** The five levers: network cost (fewer, smaller requests), JavaScript execution (less, cheaper work), rendering work (fewer layout thrash, less re-render), image size (appropriately sized, modern formats), and unnecessary updates (only change what changed). Measure with the browser's performance and network tools, then address the largest lever.\n\n**Practitioner notes.** Before any optimization, record a number. After the change, record it again. If the number did not move, the change was decoration.",
          "codeSnippet": null
        },
        {
          "id": "9.6",
          "title": "React Performance Concepts",
          "type": "theory",
          "content": "Understand unnecessary re-renders, stable component boundaries, derived data, and when memoization may help. Optimization should follow evidence rather than habit.\n\n**Why it matters.** React's performance story is mostly about avoiding unnecessary work: re-rendering components whose inputs did not change. Getting this right is about structure — stable boundaries and derived data — more than about memoization tricks.\n\n**Step-by-step intuition.** A component re-renders when its state or its props change; a large tree re-rendering on a keystroke is the common cost. Keep components stable and small, derive data during render (Module 7), keep props stable across renders, and only reach for memoization when measurement shows a real bottleneck.\n\n**Practitioner notes.** Optimization follows evidence: profile first, then change. Habit-based memoization everywhere is complexity without measured benefit.",
          "codeSnippet": null
        },
        {
          "id": "9.7",
          "title": "Testing Mindset",
          "type": "theory",
          "content": "Tests should protect important behavior. Learn the distinction between unit, integration, and end-to-end testing. Even without a dedicated testing course, students should know what behavior is worth testing.\n\n**Why it matters.** Tests are insurance for behavior you care about: a regression in cart totals or form validation is expensive. Knowing what to test is a professional judgment — and it is the question this course asks directly.\n\n**Step-by-step intuition.** Unit tests check one unit in isolation (a validation function); integration tests check units working together (a form updating state); end-to-end tests drive the whole app as a user would (complete a checkout). Protect what is important and stable: validation rules, totals, state transitions — not every line.\n\n**Practitioner notes.** For each feature ask: 'what behavior would hurt users if it broke?' That answer is your test list. Five well-chosen tests beat fifty trivial ones.",
          "codeSnippet": null
        },
        {
          "id": "9.8",
          "title": "Worked Code Example",
          "type": "code",
          "content": "This worked example is a quality test in one component: SearchButton receives loading and onClick props and renders a disabled state while loading, with aria-busy announcing the progress.\n\nStudy the accessibility details: type='button' so it never accidentally submits a form; disabled={loading} to prevent repeated submission while a request is pending; aria-busy so assistive technology announces the working state; and the label changes to 'Searching…' to communicate progress visually. The checklist comment captures the quality questions this module teaches.\n\n**Why it matters.** This component is the module's thesis in miniature: accessible, state-complete, and honest about what it is doing.\n\n**Step-by-step intuition.** Walk the checklist against the code: Tab reachable (native button), focus visible (Module 2's focus-visible outline), label explains the action, loading state communicates progress, and the button is disabled when repeated submission is unsafe.\n\n**Practitioner notes.** Apply this checklist to every interactive component you build from now on — including every capstone button.",
          "codeSnippet": "function SearchButton({ loading, onClick }) {\n  return (\n    <button\n      type='button'\n      onClick={onClick}\n      disabled={loading}\n      aria-busy={loading}\n    >\n      {loading ? 'Searching…' : 'Search'}\n    </button>\n  );\n}\n// Quality checklist:\n// - Can it be reached with Tab?\n// - Is the focus visible?\n// - Does the label explain the action?\n// - Does loading state communicate progress?\n// - Is the button disabled when repeated submission is unsafe?"
        },
        {
          "id": "9.9",
          "title": "Engineering Notes & Professional Tips",
          "type": "theory",
          "content": "The engineering notes repeat the course standard: prefer clarity over cleverness; test the feature from the user's perspective; and handle realistic states — empty data, invalid input, loading, and failure.\n\n**Why it matters.** This module is where the notes become measurable: clarity is maintainability, the user's perspective is accessibility and flows, and realistic states are what tests and performance reviews protect.\n\n**Step-by-step intuition.** Apply the study rhythm — Learn, Practice, Integrate, Capstone, Assessment — and use the concept map when reviewing any feature: user need → accessible UI → measured performance → tested behavior → maintainable code.\n\n**Practitioner notes.** Make quality review a step, not an afterthought: run the keyboard audit, check the states, measure the load, and review the naming before you call a feature done.",
          "codeSnippet": null
        },
        {
          "id": "9.10",
          "title": "Practice Exercises",
          "type": "theory",
          "content": "Complete the five practice exercises for this module. They are audits and refactors of real work — yours and others':\n\n1. Audit a page using only the keyboard and record five findings.\n2. Identify three possible causes of layout shift in a frontend page.\n3. Choose five user behaviors that should be covered by tests for a course app.\n4. Refactor a large component into smaller components with clear responsibilities.\n5. Create an accessibility checklist for a form and apply it to your own page.\n\n**Why it matters.** These exercises train judgment — knowing what to check, what causes what, and what is worth testing. The capstones will be judged against exactly these standards.\n\n**Step-by-step intuition.** Do them in order; Exercises 1, 3, and 5 are checklists you can reuse forever, and Exercise 4 applies Module 7's architecture thinking to quality.\n\n**Practitioner notes.** Exercise 4: pick the largest component you have built in this course and split it. Save the before/after — it is interview material.",
          "codeSnippet": null
        }
      ],
      "exercises": [
        "Audit a page using only the keyboard and record five findings.",
        "Identify three possible causes of layout shift in a frontend page.",
        "Choose five user behaviors that should be covered by tests for a course app.",
        "Refactor a large component into smaller components with clear responsibilities.",
        "Create an accessibility checklist for a form and apply it to your own page."
      ]
    },
    {
      "id": "mod-10",
      "number": 10,
      "title": "Professional Frontend Project Integration",
      "difficulty": "Advanced",
      "summary": "Integrate HTML, CSS, JavaScript, and React knowledge into a complete frontend engineering workflow and prepare for the capstone projects. The concept map follows the path from requirements and UI plan through the component system and implementation to the quality review.",
      "objectives": [
        "Translate requirements into user flows, page states, components, and acceptance criteria.",
        "Plan UI architecture with responsibilities and reuse in mind.",
        "Plan state and data: local, shared, derived, and server data.",
        "Iterate with a repeatable debugging loop: reproduce, isolate, inspect, change, verify.",
        "Prepare a capstone acceptance checklist and review code like another engineer."
      ],
      "lessons": [
        {
          "id": "10.1",
          "title": "Introduction",
          "type": "theory",
          "content": "Welcome to Professional Frontend Project Integration — the final module before the capstones. This is where the course comes together: you will integrate HTML, CSS, JavaScript, and React into a complete frontend engineering workflow and prepare to demonstrate independent ability.\n\nThe concept map: Requirements → UI plan → Component system → Implementation → Quality review. Every professional project — and every capstone — follows this chain.\n\n**Why it matters.** The professional outcome: integrate HTML, CSS, JavaScript, and React knowledge into a complete frontend engineering workflow and prepare for the capstone projects. The capstone is the certificate gate: it must be built independently, and this module is its preparation.\n\n**Step-by-step intuition.** Work through the chapter in order: from requirement to interface, UI architecture, state and data planning, responsive implementation, debugging and iteration, code review readiness, and capstone readiness.\n\n**Practitioner notes.** Read the explanations first, study the worked example, and complete the practice set without copying the solution pattern blindly.",
          "codeSnippet": null
        },
        {
          "id": "10.2",
          "title": "Learning Objectives",
          "type": "theory",
          "content": "By the end of this module you will be able to:\n\n- Translate requirements into user flows, page states, components, data needs, and acceptance criteria before writing code.\n- Choose a UI architecture around responsibilities and reuse.\n- Plan state and data: local state, shared state, derived data, and server/API data.\n- Iterate with a repeatable debugging loop: reproduce, isolate, inspect, change one thing, verify.\n- Review code as another engineer would and write a measurable capstone acceptance checklist.\n\n**Why it matters.** These objectives are the professional outcome's workflow: from requirements through architecture and quality review to capstone readiness.\n\n**Step-by-step intuition.** Turn each objective into a demonstrable question: 'Can I take one requirement, plan its flows, states, components, and acceptance criteria — then review the result like a stranger?'\n\n**Practitioner notes.** Grade yourself on the workflow, not just the output: professionals are judged by how they plan and review, not only by what they build.",
          "codeSnippet": null
        },
        {
          "id": "10.3",
          "title": "From Requirement to Interface",
          "type": "theory",
          "content": "Professional frontend work begins with understanding the problem. Translate requirements into user flows, page states, components, data needs, and acceptance criteria before writing large amounts of code.\n\n**Why it matters.** Coding the wrong thing is the most expensive mistake in engineering. The plan — flows, states, components, data, criteria — is cheap to change; the implementation is not.\n\n**Step-by-step intuition.** Start from the requirement and produce: user flows (who does what in what order), page states (loading, empty, error, success per view), components (the tree that realizes the flows), data needs (what each view reads and writes), and acceptance criteria (measurable, testable statements of done).\n\n**Practitioner notes.** Write the acceptance criteria before the components. If a requirement cannot be turned into a measurable criterion, you do not understand it yet.",
          "codeSnippet": null
        },
        {
          "id": "10.4",
          "title": "UI Architecture",
          "type": "theory",
          "content": "Choose components around responsibilities and reuse. Keep visual primitives separate from larger domain components when doing so makes the system easier to understand.\n\n**Why it matters.** Architecture decides the cost of every future change. Components organized by responsibility and reuse mean new features compose existing pieces instead of rewriting them.\n\n**Step-by-step intuition.** Two layers cover most applications: visual primitives (Button, Card, Input — Module 8's library) and domain components (CourseCard, SearchBar, Dashboard) that combine primitives with data and behavior. The separation keeps primitives stable and domain components expressive.\n\n**Practitioner notes.** When a domain component starts styling basic elements directly, extract the primitive. When a primitive starts knowing about your data, it has become a domain component — rename it accordingly.",
          "codeSnippet": null
        },
        {
          "id": "10.5",
          "title": "State & Data Planning",
          "type": "theory",
          "content": "Identify local state, shared state, derived data, and server/API data. Avoid turning every value into global state.\n\n**Why it matters.** State design decides the app's complexity. Every value in global/shared state is a coordination cost; every value that should have stayed local adds noise. The plan: know each value's category before coding.\n\n**Step-by-step intuition.** Four categories: local state (one component — the toggle), shared state (several components — the selected course, lifted per Module 7), derived data (calculated, not stored — the filtered list), and server/API data (fetched through hooks — the course catalogue). Route each value to its cheapest adequate category.\n\n**Practitioner notes.** The question is not 'where can I put this?' but 'how few components need it?' Start local, share only when siblings genuinely need it, derive what can be derived.",
          "codeSnippet": null
        },
        {
          "id": "10.6",
          "title": "Debugging & Iteration",
          "type": "theory",
          "content": "A professional developer expects bugs. Use a repeatable loop: reproduce → isolate → inspect → change one thing → verify → prevent regression.\n\n**Why it matters.** Bugs are normal; debugging skill is what makes them cheap. The discipline 'change one thing at a time' is what keeps debugging linear instead of random — and it is the same reasoning loop introduced in Module 3's debugging lesson, now at application scale.\n\n**Step-by-step intuition.** Reproduce deterministically, isolate to the smallest failing piece, inspect the actual state at the failure point, change one thing, verify the fix, then ask how to prevent the regression — a test, a guard, or a clearer interface.\n\n**Practitioner notes.** When debugging feels random, you skipped a step: reproduce the bug on demand before changing anything. A bug you can reproduce at will is already half-fixed.",
          "codeSnippet": null
        },
        {
          "id": "10.7",
          "title": "Capstone Readiness",
          "type": "theory",
          "content": "The capstone should demonstrate that the student can independently apply the complete course: semantic HTML, responsive CSS, JavaScript reasoning, React components, state, forms, API concepts, and quality practices.\n\n**Why it matters.** The capstone is the certificate-gating assessment — one of three projects, submitted as evidence of applied ability. The quiz proves knowledge; the capstone proves you can do the work independently.\n\n**Step-by-step intuition.** Measure your readiness against the universal acceptance checklist: HTML (semantic structure, accessible forms, meaningful headings and links), CSS (responsive layout, reusable patterns, coherent typography and spacing), JavaScript (functions, arrays/objects, event logic, validation, async where appropriate), React (components, props, state, events, lists, forms, effects/data flow), UX states (loading, success, empty, error), accessibility (keyboard, visible focus, labels), responsiveness (core flows at desktop and mobile), code quality, and originality.\n\n**Practitioner notes.** Choose your capstone now, write its acceptance checklist (Exercise 5), and check it against the universal checklist before you start. A plan that passes both is a project that passes review.",
          "codeSnippet": null
        },
        {
          "id": "10.8",
          "title": "Worked Code Example",
          "type": "code",
          "content": "This worked example is a simple feature-planning model — the Module 10 workflow in one object. Before writing any JSX, the feature is defined by its goal, its states, its inputs, its actions, and the components that will realize it.\n\nStudy the structure: goal states the intent; states enumerates the four UI states (loading, success, empty, error); inputs are the user's controls; actions are the user's intents; components lists the tree — SearchBar, CategoryFilter, CourseCard, CourseGrid, EmptyState, ErrorState.\n\n**Why it matters.** This object is the plan from which a full feature grows. Plan like this first, and implementation becomes filling in a map instead of wandering.\n\n**Step-by-step intuition.** Read it as the whole module: requirements → goal and flows (actions), UI plan (components), state and data planning (states, inputs), implementation, and quality review — every state named means every state designed.\n\n**Practitioner notes.** Write this object for every capstone feature before opening your editor. The capstones demand independent planning — this is the planning pattern.",
          "codeSnippet": "// A simple feature-planning model\nconst feature = {\n  goal: 'Allow students to browse courses',\n  states: ['loading', 'success', 'empty', 'error'],\n  inputs: ['search', 'category'],\n  actions: ['search', 'openCourse'],\n  components: [\n    'SearchBar',\n    'CategoryFilter',\n    'CourseCard',\n    'CourseGrid',\n    'EmptyState',\n    'ErrorState'\n  ]\n};\nconsole.log(feature);"
        },
        {
          "id": "10.9",
          "title": "Engineering Notes & Professional Tips",
          "type": "theory",
          "content": "The engineering notes repeat the course standard: prefer clarity over cleverness; test the feature from the user's perspective; and handle realistic states — empty data, invalid input, loading, and failure.\n\n**Why it matters.** In this final module the notes are the review lens: before calling work complete, read the code as another engineer would — remove dead code, clarify names, simplify unnecessary logic, handle edge cases, and verify accessibility.\n\n**Step-by-step intuition.** Apply the study rhythm — Learn, Practice, Integrate, Capstone, Assessment — and follow the chapter's workflow for your capstone: from requirement to interface, UI architecture, state and data planning, responsive implementation, debugging and iteration, code review readiness, capstone readiness.\n\n**Practitioner notes.** The final checklist is non-negotiable: complete all 10 modules, complete the five exercises in every module, complete the 20-question grand quiz, choose one of three capstones, build it with the course concepts rather than copying a finished implementation, and submit it for review.",
          "codeSnippet": null
        },
        {
          "id": "10.10",
          "title": "Practice Exercises",
          "type": "theory",
          "content": "Complete the five practice exercises for this module. They are the capstone preparation drills:\n\n1. Take a course marketplace requirement and break it into user flows.\n2. Create a component map for one complete frontend product.\n3. List every loading, empty, error, and success state for one feature.\n4. Perform a final code-quality review on one of your earlier exercises.\n5. Write a capstone acceptance checklist with at least ten measurable requirements.\n\n**Why it matters.** Exercises 1-3 are the planning pattern of the worked example; Exercise 4 applies the review lens to your own work; Exercise 5 is the certificate-gate checklist.\n\n**Step-by-step intuition.** Do them in order. Exercise 5 is the capstone's contract — write it for the project you actually plan to submit.\n\n**Practitioner notes.** Run Exercise 5's checklist against the universal acceptance checklist before you start building. A capstone that satisfies both is a capstone ready to submit.",
          "codeSnippet": null
        }
      ],
      "exercises": [
        "Take a course marketplace requirement and break it into user flows.",
        "Create a component map for one complete frontend product.",
        "List every loading, empty, error, and success state for one feature.",
        "Perform a final code-quality review on one of your earlier exercises.",
        "Write a capstone acceptance checklist with at least ten measurable requirements."
      ]
    }
  ],
  "grandQuiz": [
    {
      "id": 1,
      "question": "Which HTML element is the most appropriate for the primary navigation links of a site?",
      "options": [
        "<div>",
        "<nav>",
        "<section>",
        "<span>"
      ],
      "answer": 1
    },
    {
      "id": 2,
      "question": "Which CSS layout system is generally best suited to a two-dimensional page grid?",
      "options": [
        "Flexbox",
        "Grid",
        "Float",
        "Position: absolute"
      ],
      "answer": 1
    },
    {
      "id": 3,
      "question": "What does Array.prototype.map() normally return?",
      "options": [
        "The first matching item",
        "A boolean",
        "A new array",
        "The original array only"
      ],
      "answer": 2
    },
    {
      "id": 4,
      "question": "What is the main purpose of event listeners in browser JavaScript?",
      "options": [
        "To define CSS",
        "To respond to events such as clicks or input",
        "To compile React",
        "To create HTTP servers"
      ],
      "answer": 1
    },
    {
      "id": 5,
      "question": "What does async/await make easier to write?",
      "options": [
        "CSS selectors",
        "Asynchronous JavaScript flows",
        "HTML semantics",
        "Image compression"
      ],
      "answer": 1
    },
    {
      "id": 6,
      "question": "In React, props are best understood as:",
      "options": [
        "Read-only inputs passed to a component",
        "A browser API",
        "A replacement for HTML",
        "A database"
      ],
      "answer": 0
    },
    {
      "id": 7,
      "question": "Why are stable keys important when rendering React lists?",
      "options": [
        "They add CSS automatically",
        "They help React identify list items",
        "They encrypt data",
        "They replace state"
      ],
      "answer": 1
    },
    {
      "id": 8,
      "question": "When should React state generally be lifted up?",
      "options": [
        "Whenever a component has CSS",
        "When sibling components need shared state",
        "Whenever a page has a header",
        "Only when using APIs"
      ],
      "answer": 1
    },
    {
      "id": 9,
      "question": "Which is an important accessibility practice for interactive controls?",
      "options": [
        "Hide focus outlines",
        "Use only mouse events",
        "Ensure keyboard access and visible focus",
        "Replace buttons with divs"
      ],
      "answer": 2
    },
    {
      "id": 10,
      "question": "Which UI state should a frontend commonly handle while waiting for API data?",
      "options": [
        "Loading",
        "Only success",
        "Only empty",
        "No state"
      ],
      "answer": 0
    },
    {
      "id": 11,
      "question": "Which CSS property controls the space inside an element's border?",
      "options": [
        "margin",
        "padding",
        "gap",
        "outline"
      ],
      "answer": 1
    },
    {
      "id": 12,
      "question": "What is a good reason to use semantic HTML?",
      "options": [
        "It makes every page animated",
        "It communicates document meaning and improves accessibility",
        "It removes the need for CSS",
        "It prevents all bugs"
      ],
      "answer": 1
    },
    {
      "id": 13,
      "question": "Which JavaScript feature is useful for safely accessing a possibly missing nested property?",
      "options": [
        "Optional chaining",
        "forEach",
        "switch",
        "querySelector"
      ],
      "answer": 0
    },
    {
      "id": 14,
      "question": "What is a controlled React input?",
      "options": [
        "An input whose value is managed by React state",
        "An input controlled by CSS",
        "An input that cannot be changed",
        "An input with no label"
      ],
      "answer": 0
    },
    {
      "id": 15,
      "question": "What is a common purpose of useEffect?",
      "options": [
        "Synchronize React with external systems",
        "Create CSS classes",
        "Replace all props",
        "Render HTML without JavaScript"
      ],
      "answer": 0
    },
    {
      "id": 16,
      "question": "Why should developers avoid storing derived data unnecessarily in React state?",
      "options": [
        "It can create duplicated sources of truth",
        "It makes HTML semantic",
        "It improves accessibility automatically",
        "It prevents all re-renders"
      ],
      "answer": 0
    },
    {
      "id": 17,
      "question": "What should a frontend do when an API returns an error?",
      "options": [
        "Pretend it succeeded",
        "Show an appropriate error state and handle the failure",
        "Delete the application",
        "Refresh forever"
      ],
      "answer": 1
    },
    {
      "id": 18,
      "question": "Which approach is best for responsive design?",
      "options": [
        "Design only for one screen width",
        "Use fluid layouts and appropriate breakpoints when needed",
        "Use fixed pixel widths everywhere",
        "Disable mobile users"
      ],
      "answer": 1
    },
    {
      "id": 19,
      "question": "What is the main goal of a reusable React component?",
      "options": [
        "To make every file longer",
        "To encapsulate a clear UI responsibility for reuse",
        "To eliminate HTML",
        "To replace APIs"
      ],
      "answer": 1
    },
    {
      "id": 20,
      "question": "What is required for the IH Academy Frontend certificate in this course?",
      "options": [
        "Only reading the PDF",
        "Only passing the 20-question quiz",
        "Submitting one of the three capstone projects successfully",
        "Watching one video"
      ],
      "answer": 2
    }
  ],
  "capstones": [
    {
      "id": "frontend-capstone-1",
      "title": "Learning Management Frontend",
      "description": "Build a responsive learning platform frontend where users can browse courses, open a course detail page, view modules, track lesson completion, search/filter courses, and interact with a student dashboard.",
      "requirements": [
        "Required views: landing page, course catalogue, course details, lesson view, dashboard.",
        "Required UI states: loading, empty search result, error, completed lesson, incomplete lesson.",
        "Use reusable React components for cards, navigation, progress indicators, forms, and feedback states.",
        "Use responsive CSS so the core flows remain usable on mobile and desktop.",
        "Include accessible labels, keyboard-friendly controls, semantic structure, and visible focus states."
      ],
      "deliverables": [
        "The React application with its landing page, course catalogue, course details, lesson view, and student dashboard.",
        "Reusable components for cards, navigation, progress indicators, forms, and feedback states.",
        "The five required UI states demonstrated in the relevant views.",
        "A responsive CSS implementation verified at mobile and desktop widths.",
        "A short writeup of the component tree, state decisions, and accessibility checks."
      ]
    },
    {
      "id": "frontend-capstone-2",
      "title": "E-Commerce Storefront",
      "description": "Build a complete storefront frontend for a fictional brand. Users should browse products, filter/search them, open product details, manage a cart, and complete a mock checkout flow.",
      "requirements": [
        "Required views: home, catalogue, product detail, cart, checkout, confirmation.",
        "Product data may be local JSON or supplied through a mock/API source.",
        "Implement cart state, quantity changes, removal, totals, and form validation.",
        "Handle empty cart, no search results, loading, and error states.",
        "Prioritize responsive layout, semantic HTML, reusable components, and clear visual hierarchy."
      ],
      "deliverables": [
        "The storefront application with all six required views.",
        "Cart state implementation: quantity changes, removal, and totals.",
        "Mock or local product data source with its schema.",
        "Empty cart, no-search-results, loading, and error states across views.",
        "A writeup of layout decisions and the component reuse strategy."
      ]
    },
    {
      "id": "frontend-capstone-3",
      "title": "Professional Analytics Dashboard",
      "description": "Build a polished analytics dashboard for a fictional company. The interface should present metrics, lists, filters, and detail views while remaining responsive and accessible.",
      "requirements": [
        "Required views: dashboard overview, detailed metric view, activity/data table, profile/settings-style form.",
        "Use reusable cards, table/list components, filters, status indicators, and navigation.",
        "Represent realistic loading, empty, and error states.",
        "Use React state and derived data for filters and UI interactions.",
        "The visual design should communicate hierarchy rather than relying on decorative effects alone."
      ],
      "deliverables": [
        "The dashboard application with all four required views.",
        "Reusable cards, table/list, filter, status indicator, and navigation components.",
        "Loading, empty, and error states for every data-driven view.",
        "Filter interactions implemented with React state and derived data.",
        "A short design writeup explaining the visual hierarchy decisions."
      ]
    }
  ],
  "certificateRule": "You receive the IH Academy certificate ONLY after successfully completing and submitting ONE of the three capstone projects. Completing the modules, exercises, and quiz alone does NOT qualify.",
  "roadmap": {
    "modules": [
      {
        "title": "The Web, HTML & Semantic Structure",
        "lessons": 10,
        "difficulty": "Beginner",
        "summary": "How the web works, semantic HTML5, and accessible document structure.",
        "objectives": ["Semantic HTML document structure", "Accessible forms and media", "How a browser turns markup into a page"]
      },
      {
        "title": "CSS Foundations, Layout & Responsive Design",
        "lessons": 10,
        "difficulty": "Beginner",
        "summary": "Selectors and cascade, the box model, Flexbox, Grid, and responsive interfaces.",
        "objectives": ["Selectors, cascade and box model", "Flexbox and CSS Grid layouts", "Fluid responsive design"]
      },
      {
        "title": "JavaScript Foundations",
        "lessons": 10,
        "difficulty": "Beginner",
        "summary": "Values, types, control flow, functions, arrays, objects, and modern syntax.",
        "objectives": ["Variables, types and control flow", "Functions and array transformations", "Modern syntax and debugging"]
      },
      {
        "title": "DOM, Events & Interactive Web Applications",
        "lessons": 10,
        "difficulty": "Intermediate",
        "summary": "The DOM, events, forms, validation, local storage, and explicit UI state.",
        "objectives": ["DOM selection and updates", "Events and event delegation", "Forms, validation and local storage"]
      },
      {
        "title": "Modern JavaScript: Async Programming & APIs",
        "lessons": 10,
        "difficulty": "Intermediate",
        "summary": "Promises, async/await, fetch, and API data with full UI states.",
        "objectives": ["Promises and async/await", "Fetch and HTTP basics", "Loading, success, empty and error states"]
      },
      {
        "title": "React Fundamentals",
        "lessons": 10,
        "difficulty": "Intermediate",
        "summary": "Components, JSX, props, state, events, lists, and forms in React.",
        "objectives": ["JSX and components", "Props, state and events", "List keys and controlled forms"]
      },
      {
        "title": "React Application Architecture & Data Flow",
        "lessons": 10,
        "difficulty": "Intermediate",
        "summary": "Component trees, lifted state, derived data, effects, context, and custom hooks.",
        "objectives": ["Component trees and lifted state", "Derived state and effects", "Custom hooks and state-first components"]
      },
      {
        "title": "Building a Complete React Frontend",
        "lessons": 10,
        "difficulty": "Advanced",
        "summary": "Application structure, navigation, reusable UI, API integration, and defensive UI.",
        "objectives": ["Application structure and navigation", "Reusable UI primitives", "API integration and error boundaries"]
      },
      {
        "title": "Frontend Engineering Quality: Accessibility, Performance & Testing",
        "lessons": 10,
        "difficulty": "Advanced",
        "summary": "Accessibility, keyboard and focus, performance, React optimization, and the testing mindset.",
        "objectives": ["Accessibility and visible focus", "Measure-first performance", "Testing mindset and maintainability"]
      },
      {
        "title": "Professional Frontend Project Integration",
        "lessons": 10,
        "difficulty": "Advanced",
        "summary": "From requirements to interface, UI architecture, state planning, debugging, and capstone readiness.",
        "objectives": ["Requirements and UI planning", "State and data planning", "Debugging, review and capstone readiness"]
      }
    ]
  }
}
