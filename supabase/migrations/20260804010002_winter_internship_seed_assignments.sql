-- Winter Internship 2026-27 — Assignment seed (80 assignments)
-- Source of truth: the five track specification PDFs. Every assignment carries
-- its own complete question, requirements, deliverables, submission mode,
-- acceptance criteria and evidence requirement. Idempotent via stable ids.

-- Shared requirement sets
-- Backend shared stack requirements
-- Frontend track resource requirement list is written inline per assignment.

-- ===========================================================================
-- FRONTEND ENGINEERING — Week 1
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('frontend-engineering-w1-a1', 'frontend-engineering-w1', 'Responsive Personal Portfolio', 'frontend-engineering-w1-a1', 'Easy', 7, '6-8 h',
   'Build a one-page personal portfolio for a junior developer. It must present a hero, skills, three projects, education/experience, contact section and working navigation.',
   '{"Use semantic HTML5 and separate CSS files.", "Create mobile, tablet and desktop layouts without horizontal overflow.", "Add an accessible navigation menu, visible focus states and meaningful alt text.", "Use real content; placeholder lorem ipsum is not accepted."}',
   '{"Deployed URL", "GitHub repository with at least 5 meaningful commits", "README containing screenshots, setup steps and feature list", "One PDF report with desktop/mobile screenshots and a 150-word reflection"}',
   'GitHub URL + deployed link + PDF report',
   '{"All sections work at 360px, 768px and 1440px; no broken links."}',
   'PDF screenshots plus repository commit history', 1),
  ('frontend-engineering-w1-a2', 'frontend-engineering-w1', 'Product Landing Page', 'frontend-engineering-w1-a2', 'Easy', 7, '6-8 h',
   'Create a conversion-focused landing page for a fictional technology product with a clear value proposition and realistic content.',
   '{"Include hero, feature grid, use cases, pricing preview, testimonials, FAQ and footer.", "Create at least two reusable UI patterns using CSS classes.", "Add a working mobile menu and client-side FAQ accordion.", "Validate the contact/lead form fields in the browser."}',
   '{"Source repository", "Live deployment", "Design decisions section in README", "PDF showing all sections and responsive states"}',
   'GitHub URL + deployed link + PDF',
   '{"CTA buttons navigate correctly; form blocks invalid input; layout is responsive."}',
   'Screenshots of desktop, mobile, menu and form validation', 2),
  ('frontend-engineering-w1-a3', 'frontend-engineering-w1', 'Multi-Step Internship Application Form', 'frontend-engineering-w1-a3', 'Easy', 8, '7-9 h',
   'Build a four-step internship application form matching the IH Academy flow: track selection, skills/profile, CV upload and confirmation.',
   '{"Persist entered values while moving between steps.", "Show step indicator, validation messages and a review screen.", "Support keyboard navigation and accessible labels.", "Store draft data in localStorage and provide Reset Draft."}',
   '{"Live app and repository", "Test checklist for required fields and navigation", "PDF with screenshots of every step and validation case"}',
   'GitHub + deployment + PDF test report',
   '{"No data is lost between steps; invalid submissions are blocked."}',
   'Screenshots of each form state and localStorage persistence', 3),
  ('frontend-engineering-w1-a4', 'frontend-engineering-w1', 'Weather Dashboard', 'frontend-engineering-w1-a4', 'Intermediate', 9, '8-10 h',
   'Build a weather dashboard that searches cities and displays current conditions plus a five-day forecast using a public weather API.',
   '{"Use async/await and handle loading, empty, success and error states.", "Display temperature, condition, humidity, wind and forecast cards.", "Save recent searches and allow removal.", "Keep the API key in an environment variable when the provider requires one."}',
   '{"Repository and deployed app", "README with API setup", "PDF containing successful search, invalid city and loading state screenshots"}',
   'GitHub + live link + PDF',
   '{"Valid cities work; errors are understandable; secret keys are not committed."}',
   'Screenshots plus .env.example file', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- FRONTEND ENGINEERING — Week 2
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('frontend-engineering-w2-a1', 'frontend-engineering-w2', 'JavaScript Todo Manager', 'frontend-engineering-w2-a1', 'Easy', 8, '7-9 h',
   'Create a task manager with add, edit, delete, complete, priority, due date and filtering features.',
   '{"Use modular JavaScript files.", "Persist tasks in localStorage.", "Add filters for all/active/completed and search by text.", "Prevent empty titles and show a confirmation before deleting."}',
   '{"Repository + live link", "README with data model", "PDF with feature screenshots and manual test results"}',
   'GitHub + deployment + PDF',
   '{"Tasks remain after refresh; all filters and edit flows work."}',
   'Screenshots before and after refresh', 1),
  ('frontend-engineering-w2-a2', 'frontend-engineering-w2', 'Expense Tracker Dashboard', 'frontend-engineering-w2-a2', 'Intermediate', 10, '9-11 h',
   'Build an expense tracker that records income and expenses, calculates totals and visualizes spending by category.',
   '{"Support add/edit/delete transactions.", "Use date and category filters.", "Render one chart without external chart screenshots.", "Validate amount, type and date fields."}',
   '{"Live app, repository, sample dataset", "PDF with totals, filtered view and chart screenshots"}',
   'GitHub + deployment + PDF',
   '{"Calculated totals exactly match stored records; chart updates after changes."}',
   'PDF calculations and test records', 2),
  ('frontend-engineering-w2-a3', 'frontend-engineering-w2', 'Movie Search Application', 'frontend-engineering-w2-a3', 'Intermediate', 9, '8-10 h',
   'Create an API-powered movie search app with search, details modal/page, pagination and favorites.',
   '{"Use a public movie API.", "Debounce search or require explicit submission to avoid excessive calls.", "Handle missing posters and incomplete metadata.", "Persist favorites locally."}',
   '{"Source and deployment", "API usage notes", "PDF showing results, details, empty state and favorites"}',
   'GitHub + live link + PDF',
   '{"Search, pagination/details and favorites function reliably."}',
   'Screenshots and network/error-handling notes', 3),
  ('frontend-engineering-w2-a4', 'frontend-engineering-w2', 'Accessible Quiz Application', 'frontend-engineering-w2-a4', 'Intermediate', 9, '8-10 h',
   'Build a timed quiz with at least 15 questions, score calculation, progress display and final review.',
   '{"Load questions from a local JSON file.", "Randomize answer choices without changing correctness.", "Support keyboard selection and visible focus.", "Show correct answer and explanation after completion."}',
   '{"Repository and deployment", "Question JSON", "PDF with start, active quiz, timeout and result screens"}',
   'GitHub + live link + PDF',
   '{"Scoring is correct and refresh behavior is documented."}',
   'Completed test run with expected score', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- FRONTEND ENGINEERING — Week 3
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('frontend-engineering-w3-a1', 'frontend-engineering-w3', 'React Portfolio with Routing', 'frontend-engineering-w3-a1', 'Intermediate', 11, '10-12 h',
   'Rebuild a portfolio as a React application with routed pages for Home, Projects, Project Details and Contact.',
   '{"Use React Router and reusable components.", "Render project data from a JSON/module source.", "Implement form validation and success state.", "Include loading skeleton for simulated project loading."}',
   '{"React repository + deployment", "Component map in README", "PDF of routes and responsive layouts"}',
   'GitHub + deployment + PDF',
   '{"Direct route refresh works; project detail routes are data-driven."}',
   'Screenshots of all routes and mobile navigation', 1),
  ('frontend-engineering-w3-a2', 'frontend-engineering-w3', 'React Notes App', 'frontend-engineering-w3-a2', 'Intermediate', 11, '10-12 h',
   'Build a React notes app with create, edit, delete, pin, tag, search and archive features.',
   '{"Use hooks and clear state separation.", "Persist data in localStorage.", "Add empty states and confirmation flow.", "Create reusable modal and input components."}',
   '{"Repository + live app", "State/data model explanation", "PDF test report"}',
   'GitHub + deployment + PDF',
   '{"Search, tags, pinned and archived views remain consistent after refresh."}',
   'Screenshots of each filtered state', 2),
  ('frontend-engineering-w3-a3', 'frontend-engineering-w3', 'Shopping Cart with API Data', 'frontend-engineering-w3-a3', 'Intermediate', 12, '11-13 h',
   'Build a React storefront using a public products API, including product listing, detail view, cart and checkout summary.',
   '{"Use context or another justified shared-state approach.", "Support quantity changes, remove item and total calculation.", "Handle loading and API errors.", "Persist cart and guard invalid quantities."}',
   '{"Live app + repository", "Architecture note", "PDF showing listing, details, cart and error state"}',
   'GitHub + deployment + PDF',
   '{"Totals are correct and cart persists across refresh."}',
   'Screenshots with manually verified total', 3),
  ('frontend-engineering-w3-a4', 'frontend-engineering-w3', 'GitHub Profile Explorer', 'frontend-engineering-w3-a4', 'Advanced', 11, '10-12 h',
   'Create a React app that searches GitHub users and shows profile information, repositories, language summaries and pagination.',
   '{"Use GitHub REST API responsibly.", "Handle rate limits and not-found responses.", "Sort/filter repositories.", "Display accessible charts or summarized language bars."}',
   '{"Repository + deployment", "README with rate-limit handling", "PDF of success, not-found and rate-limit states"}',
   'GitHub + live link + PDF',
   '{"Search and repository controls work; API errors are visible and safe."}',
   'Screenshots plus API response mapping notes', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- FRONTEND ENGINEERING — Week 4
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('frontend-engineering-w4-a1', 'frontend-engineering-w4', 'Responsive Admin Dashboard', 'frontend-engineering-w4-a1', 'Advanced', 13.5, '12-15 h',
   'Build a production-style admin dashboard for IH Academy with sidebar, topbar, metrics, table, filters, notifications and dark mode.',
   '{"Use React and reusable layout/data components.", "Create realistic dashboard data and at least two charts.", "Implement responsive sidebar behavior.", "Persist dark mode and table filter state."}',
   '{"Repository + deployed app", "Component inventory", "PDF covering desktop/mobile/dark mode/table filters"}',
   'GitHub + live link + PDF',
   '{"All dashboard controls are functional; no visual overflow."}',
   'Screenshots and Lighthouse report', 1),
  ('frontend-engineering-w4-a2', 'frontend-engineering-w4', 'E-commerce Frontend', 'frontend-engineering-w4-a2', 'Advanced', 16, '14-18 h',
   'Build a polished multi-page e-commerce frontend with catalog, product details, category filters, cart, wishlist and checkout UI.',
   '{"Use reusable components and route-based pages.", "Sync URL query parameters with filters.", "Create optimistic cart/wishlist interactions.", "Provide loading, empty and error states."}',
   '{"Live app + repository", "Feature checklist", "PDF of full purchase journey"}',
   'GitHub + deployment + PDF',
   '{"Filters, route refresh, cart and wishlist work end to end."}',
   'Journey screenshots from catalog to checkout', 2),
  ('frontend-engineering-w4-a3', 'frontend-engineering-w4', 'Realtime Chat Interface Simulation', 'frontend-engineering-w4-a3', 'Advanced', 13.5, '12-15 h',
   'Build a complete chat interface that simulates real-time messaging, conversations, typing state, unread counts and file previews.',
   '{"Use a structured mock service layer.", "Support responsive conversation list and active chat.", "Add message status, search and attachment preview.", "Include accessible keyboard interactions."}',
   '{"Repository + deployment", "UI state diagram", "PDF of chat scenarios"}',
   'GitHub + live link + PDF',
   '{"Conversation switching, unread state and responsive layout behave consistently."}',
   'Screenshots of all major states', 3),
  ('frontend-engineering-w4-a4', 'frontend-engineering-w4', 'IH Academy Mini LMS Frontend', 'frontend-engineering-w4-a4', 'Advanced', 21, '18-24 h',
   'Build the final Winter Internship frontend: login-ready screens, course catalog, course detail, internship assignments, submission panel, progress and certificate page.',
   '{"Follow the existing IH Academy blue-white visual system.", "Restrict the intern view to the selected track.", "Implement Week 1-4 locked/unlocked states using mock data.", "Create assignment detail routes and submission validation.", "Add responsive and dark mode support without redesigning unrelated public pages."}',
   '{"Production-ready repository and deployment", "README with route map and data contracts", "Final PDF report with all pages, test cases and design decisions"}',
   'GitHub + deployed URL + final PDF',
   '{"Complete user flow works from internship dashboard to assignment submission."}',
   'End-to-end screenshots, Lighthouse report and test checklist', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- BACKEND ENGINEERING — Week 1
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('backend-engineering-w1-a1', 'backend-engineering-w1', 'REST Notes API', 'backend-engineering-w1-a1', 'Easy', 8, '7-9 h',
   'Build a versioned REST API for personal notes with title, body, tags, pinned status and timestamps.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Implement create, list, single read, update and delete endpoints.", "Add pagination, text search and tag filtering.", "Return 404 for missing resources and 400/422 for invalid data."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"All CRUD endpoints, filters and validation behave according to the documentation."}',
   'Successful and failed request screenshots plus test output', 1),
  ('backend-engineering-w1-a2', 'backend-engineering-w1', 'User Authentication API', 'backend-engineering-w1-a2', 'Easy', 10, '9-11 h',
   'Build registration, login, profile and logout/refresh-token endpoints for internship users.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Hash passwords securely.", "Issue access and refresh tokens with expiry.", "Protect profile routes and never expose password hashes.", "Add duplicate email and invalid credential handling."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"A new user can register, authenticate, refresh and access only protected profile data."}',
   'Successful and failed request screenshots plus test output', 2),
  ('backend-engineering-w1-a3', 'backend-engineering-w1', 'Task Manager API', 'backend-engineering-w1-a3', 'Intermediate', 10, '9-11 h',
   'Build a multi-user task API with status, priority, due date and ownership.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Associate every task with its authenticated owner.", "Add status/priority/date filters and sorting.", "Prevent users from reading or changing another user.''s tasks."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Authorization isolation and task filters pass documented tests."}',
   'Successful and failed request screenshots plus test output', 3),
  ('backend-engineering-w1-a4', 'backend-engineering-w1', 'Blog API', 'backend-engineering-w1-a4', 'Intermediate', 11, '10-12 h',
   'Build a blog backend with users, posts, categories, comments and publishing status.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Support draft and published posts.", "Generate unique slugs.", "Paginate public posts and include author/category information.", "Allow only authors or admins to edit/delete content."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Public and protected workflows work without leaking draft content."}',
   'Successful and failed request screenshots plus test output', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- BACKEND ENGINEERING — Week 2
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('backend-engineering-w2-a1', 'backend-engineering-w2', 'Inventory Management API', 'backend-engineering-w2-a1', 'Intermediate', 11, '10-12 h',
   'Create an inventory API for products, categories, suppliers and stock adjustments.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Track stock-in and stock-out operations as immutable movement records.", "Reject operations that would make stock negative.", "Add low-stock query and date-range movement report."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Calculated stock equals movement history and negative inventory is blocked."}',
   'Successful and failed request screenshots plus test output', 1),
  ('backend-engineering-w2-a2', 'backend-engineering-w2', 'Library Management API', 'backend-engineering-w2-a2', 'Intermediate', 11, '10-12 h',
   'Build an API for books, members, borrowing and returns.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Track available copies separately from total copies.", "Prevent borrowing unavailable books.", "Calculate overdue status using configurable loan days."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Borrow/return flow updates availability correctly and invalid states are blocked."}',
   'Successful and failed request screenshots plus test output', 2),
  ('backend-engineering-w2-a3', 'backend-engineering-w2', 'URL Shortener Service', 'backend-engineering-w2-a3', 'Intermediate', 10, '9-11 h',
   'Build a URL shortener with custom aliases, expiration and click analytics.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Validate destination URLs.", "Generate collision-safe aliases.", "Redirect valid aliases and return a clear response for expired links.", "Record click timestamp, referrer and basic user-agent information."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Redirect, expiry, uniqueness and analytics work as documented."}',
   'Successful and failed request screenshots plus test output', 3),
  ('backend-engineering-w2-a4', 'backend-engineering-w2', 'Expense Tracker API', 'backend-engineering-w2-a4', 'Intermediate', 11, '10-12 h',
   'Build a secure income/expense API with categories, monthly summaries and budget alerts.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Support date/category/type filters.", "Aggregate monthly totals and category totals.", "Allow per-category monthly budgets and report overspending."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Summary values match transaction data and remain user-isolated."}',
   'Successful and failed request screenshots plus test output', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- BACKEND ENGINEERING — Week 3
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('backend-engineering-w3-a1', 'backend-engineering-w3', 'E-commerce Backend', 'backend-engineering-w3-a1', 'Advanced', 16, '14-18 h',
   'Build a backend for products, variants, carts, orders and inventory reservation.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Model products and variants cleanly.", "Calculate order totals server-side.", "Prevent checkout when requested quantity exceeds stock.", "Use transaction/session logic where supported."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Cart and order totals cannot be manipulated by the client; stock remains consistent."}',
   'Successful and failed request screenshots plus test output', 1),
  ('backend-engineering-w3-a2', 'backend-engineering-w3', 'File Upload Service', 'backend-engineering-w3-a2', 'Advanced', 11.5, '10-13 h',
   'Build a secure file upload API for images and PDFs with metadata and ownership.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Validate MIME type and size.", "Use Cloudinary/S3-compatible storage or a documented local adapter.", "Store file metadata and secure deletion.", "Reject executable or unsupported uploads."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Only permitted files are stored and users can manage only their own uploads."}',
   'Successful and failed request screenshots plus test output', 2),
  ('backend-engineering-w3-a3', 'backend-engineering-w3', 'Email Notification Service', 'backend-engineering-w3-a3', 'Advanced', 11.5, '10-13 h',
   'Create a notification module for welcome, password reset and assignment submission emails.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Use templates and a provider abstraction.", "Queue or retry failed deliveries.", "Store delivery status without exposing secrets.", "Provide a development mode using a safe test provider."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Templates render correctly and failures are logged/retried without crashing requests."}',
   'Successful and failed request screenshots plus test output', 3),
  ('backend-engineering-w3-a4', 'backend-engineering-w3', 'Role-Based Access Control', 'backend-engineering-w3-a4', 'Advanced', 12.5, '11-14 h',
   'Implement reusable RBAC for student, intern, mentor and admin roles.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Create role and permission middleware.", "Protect example resources with ownership and permission checks.", "Document an access-control matrix.", "Add automated authorization tests."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Every protected action matches the documented role-permission matrix."}',
   'Successful and failed request screenshots plus test output', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- BACKEND ENGINEERING — Week 4
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('backend-engineering-w4-a1', 'backend-engineering-w4', 'Learning Management API', 'backend-engineering-w4-a1', 'Advanced', 18, '16-20 h',
   'Build course, lesson, enrollment, progress and certificate-ready APIs for IH Academy.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Model courses, modules and ordered lessons.", "Track lesson completion per user.", "Calculate progress consistently on the server.", "Restrict course authoring actions to authorized roles."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Enrollment and progress flows are consistent, authorized and documented."}',
   'Successful and failed request screenshots plus test output', 1),
  ('backend-engineering-w4-a2', 'backend-engineering-w4', 'Winter Internship Assignment API', 'backend-engineering-w4-a2', 'Advanced', 18, '16-20 h',
   'Build APIs for tracks, four weeks, assignments, free-course proofs, week locking and submissions.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "A user must see only the selected internship track.", "Week N+1 unlocks only after all required items in Week N are approved.", "Support GitHub, live URL, notes and PDF attachment fields.", "Store submission status: draft, submitted, changes_requested, approved."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Track isolation, approval workflow and sequential unlocking work end to end."}',
   'Successful and failed request screenshots plus test output', 2),
  ('backend-engineering-w4-a3', 'backend-engineering-w4', 'Booking and Scheduling Backend', 'backend-engineering-w4-a3', 'Advanced', 16, '14-18 h',
   'Build a mentor-session booking API with availability, time slots, cancellation and conflict prevention.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Store times in UTC.", "Prevent overlapping bookings and double booking.", "Apply cancellation rules and status history.", "Provide mentor and student schedule queries."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Concurrent booking attempts cannot reserve the same slot."}',
   'Successful and failed request screenshots plus test output', 3),
  ('backend-engineering-w4-a4', 'backend-engineering-w4', 'IH Academy Backend Capstone', 'backend-engineering-w4-a4', 'Advanced', 26, '22-30 h',
   'Build a production-ready backend combining authentication, courses, winter internships, assignments, submissions, files, notifications and admin review.',
   '{"Use Node.js + Express with a clean routes/controllers/services structure.", "Use MongoDB or PostgreSQL with documented schema decisions.", "Validate all request data and return consistent JSON errors.", "Use modular architecture and centralized errors/logging.", "Provide OpenAPI documentation and automated tests for critical flows.", "Add rate limiting, secure headers and environment validation.", "Deploy with seeded demo accounts and no hardcoded secrets."}',
   '{"GitHub repository with meaningful commits", "Postman/Bruno collection or OpenAPI documentation", ".env.example and setup-ready README", "PDF report with endpoint table, schema diagram and test screenshots"}',
   'GitHub URL + deployed API URL + API collection + PDF',
   '{"Core user, internship and admin workflows pass the final acceptance checklist."}',
   'Successful and failed request screenshots plus test output', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- FULL STACK SOFTWARE ENGINEERING — Week 1
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('full-stack-engineering-w1-a1', 'full-stack-engineering-w1', 'Portfolio with Contact API', 'full-stack-engineering-w1-a1', 'Easy', 11.5, '10-13 h',
   'Build a responsive portfolio whose contact form submits messages to an Express API and stores them in a database.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Validate on client and server.", "Create an admin-only endpoint or protected page to list messages.", "Add spam-resistant basic rate limiting."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"A valid message is stored once; invalid or repeated abusive requests are handled safely."}',
   'End-to-end screenshots, API tests and commit history', 1),
  ('full-stack-engineering-w1-a2', 'full-stack-engineering-w1', 'Product Landing Page with Leads', 'full-stack-engineering-w1-a2', 'Easy', 11.5, '10-13 h',
   'Build a product landing page with a working lead-capture API and small admin lead table.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Store name, email, source and timestamp.", "Prevent duplicate active leads by email or document the chosen policy.", "Add export-to-CSV on the admin side."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Lead submission, validation, listing and export work end to end."}',
   'End-to-end screenshots, API tests and commit history', 2),
  ('full-stack-engineering-w1-a3', 'full-stack-engineering-w1', 'Authentication Starter App', 'full-stack-engineering-w1-a3', 'Intermediate', 13.5, '12-15 h',
   'Build register, login, logout, protected profile and password-change flows.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Hash passwords and use secure token/cookie handling.", "Protect frontend routes and backend endpoints.", "Display server validation errors clearly.", "Provide demo credentials only through seed scripts, not hardcoded UI logic."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Unauthorized users cannot access protected data and authentication survives refresh safely."}',
   'End-to-end screenshots, API tests and commit history', 3),
  ('full-stack-engineering-w1-a4', 'full-stack-engineering-w1', 'Full-Stack Todo Application', 'full-stack-engineering-w1-a4', 'Intermediate', 13.5, '12-15 h',
   'Build a multi-user todo app with projects, tasks, filters and persistent authentication.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Each user sees only their own projects/tasks.", "Support task CRUD, due date, priority and completion.", "Implement optimistic UI carefully or refetch after mutations."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"User isolation, CRUD and filters work across frontend, API and database."}',
   'End-to-end screenshots, API tests and commit history', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- FULL STACK SOFTWARE ENGINEERING — Week 2
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('full-stack-engineering-w2-a1', 'full-stack-engineering-w2', 'Blog Platform', 'full-stack-engineering-w2-a1', 'Intermediate', 16, '14-18 h',
   'Build a blog platform with authentication, posts, comments, tags and author profiles.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Support draft/published status.", "Create slug-based public routes.", "Allow authors to manage only their posts.", "Sanitize or safely render user content."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Public, author and comment workflows function with correct permissions."}',
   'End-to-end screenshots, API tests and commit history', 1),
  ('full-stack-engineering-w2-a2', 'full-stack-engineering-w2', 'Library Management System', 'full-stack-engineering-w2-a2', 'Intermediate', 16, '14-18 h',
   'Build member, book, borrow and return workflows with an admin dashboard.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Track copy availability server-side.", "Prevent duplicate active borrowing of the same copy.", "Show overdue records and search/filter controls."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Availability and loan status stay consistent after every operation."}',
   'End-to-end screenshots, API tests and commit history', 2),
  ('full-stack-engineering-w2-a3', 'full-stack-engineering-w2', 'Expense Tracker', 'full-stack-engineering-w2-a3', 'Intermediate', 16, '14-18 h',
   'Build a secure expense tracker with transactions, categories, budgets and dashboard charts.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Calculate summaries on the server or from verified user data.", "Provide month/category filters.", "Support export to CSV.", "Add budget warning UI."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Totals, filters, charts and exports match stored data."}',
   'End-to-end screenshots, API tests and commit history', 3),
  ('full-stack-engineering-w2-a4', 'full-stack-engineering-w2', 'Movie Discovery App', 'full-stack-engineering-w2-a4', 'Advanced', 15, '13-17 h',
   'Build a movie discovery app using an external API plus authenticated favorites and reviews stored in your database.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Proxy or safely call the external API.", "Persist favorites/reviews per user.", "Handle API rate errors and missing data."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Search, details, favorites and reviews work without exposing external API secrets."}',
   'End-to-end screenshots, API tests and commit history', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- FULL STACK SOFTWARE ENGINEERING — Week 3
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('full-stack-engineering-w3-a1', 'full-stack-engineering-w3', 'E-commerce Store', 'full-stack-engineering-w3-a1', 'Advanced', 21, '18-24 h',
   'Build a complete store with products, categories, cart, checkout simulation and order history.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Calculate totals and stock checks server-side.", "Use authenticated carts and orders.", "Add admin product/stock management.", "Use a payment mock; do not collect real card data."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Customer and admin journeys work and client-side price manipulation fails."}',
   'End-to-end screenshots, API tests and commit history', 1),
  ('full-stack-engineering-w3-a2', 'full-stack-engineering-w3', 'Realtime Chat Application', 'full-stack-engineering-w3-a2', 'Advanced', 21, '18-24 h',
   'Build authenticated one-to-one chat using Socket.io with conversation history and unread counts.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Authorize socket connections.", "Persist messages and conversation membership.", "Handle reconnect and offline history.", "Add typing state without storing it permanently."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Only conversation members receive/read messages and reconnect restores state."}',
   'End-to-end screenshots, API tests and commit history', 2),
  ('full-stack-engineering-w3-a3', 'full-stack-engineering-w3', 'Employee Management System', 'full-stack-engineering-w3-a3', 'Advanced', 19.5, '17-22 h',
   'Build an employee management portal with roles, departments, attendance records and reports.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Create admin/manager/employee permissions.", "Add searchable tables and validated forms.", "Store audit fields for important changes."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Permissions and reporting match the documented role matrix."}',
   'End-to-end screenshots, API tests and commit history', 3),
  ('full-stack-engineering-w3-a4', 'full-stack-engineering-w3', 'Learning Portal', 'full-stack-engineering-w3-a4', 'Advanced', 21, '18-24 h',
   'Build courses, lessons, enrollment and progress tracking with student and instructor views.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Model ordered course content.", "Track lesson completion and calculate progress.", "Restrict authoring to instructor/admin roles."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Enrollment, authoring and progress flows are consistent end to end."}',
   'End-to-end screenshots, API tests and commit history', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- FULL STACK SOFTWARE ENGINEERING — Week 4
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('full-stack-engineering-w4-a1', 'full-stack-engineering-w4', 'IH Academy Mini LMS', 'full-stack-engineering-w4-a1', 'Advanced', 25, '22-28 h',
   'Build a polished LMS with course catalog, learner dashboard, lesson viewer, progress and certificate-ready state.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Integrate real API and database data.", "Add search, filters and responsive navigation.", "Provide admin course CRUD and enrollment controls."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"All core LMS flows work from admin creation to learner progress."}',
   'End-to-end screenshots, API tests and commit history', 1),
  ('full-stack-engineering-w4-a2', 'full-stack-engineering-w4', 'Winter Internship Portal', 'full-stack-engineering-w4-a2', 'Advanced', 25, '22-28 h',
   'Build the four-week Winter Internship portal with track-specific assignments, course proofs, lock rules and submissions.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Users see only their selected track.", "Week unlock depends on approved completion of the previous week.", "Support GitHub URL, live URL, notes and PDF upload.", "Create mentor review status and feedback display."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Track filtering and sequential approval workflow work across UI, API and database."}',
   'End-to-end screenshots, API tests and commit history', 2),
  ('full-stack-engineering-w4-a3', 'full-stack-engineering-w4', 'Booking Platform', 'full-stack-engineering-w4-a3', 'Advanced', 23, '20-26 h',
   'Build a mentor-session booking platform with availability, conflict detection, notifications and dashboards.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Store timestamps in UTC and display local time.", "Prevent double booking server-side.", "Support reschedule/cancel rules and history."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"Concurrent requests cannot reserve the same slot and dashboards remain accurate."}',
   'End-to-end screenshots, API tests and commit history', 3),
  ('full-stack-engineering-w4-a4', 'full-stack-engineering-w4', 'IH Academy Full-Stack Capstone', 'full-stack-engineering-w4-a4', 'Advanced', 34, '28-40 h',
   'Build a production-ready IH Academy slice combining authentication, courses, Winter Internship, assignments, submissions and admin review.',
   '{"Use React for the frontend and Node.js/Express for the API.", "Use a real database and keep secrets in environment variables.", "Provide responsive loading, success, empty and error states.", "Follow existing blue-white design language instead of replacing the whole platform.", "Use RBAC, validation, file storage, notifications and logs.", "Add automated tests for critical flows.", "Deploy frontend, API and database with seed data and no exposed secrets."}',
   '{"Monorepo or clearly separated client/server repository", "Deployed frontend and backend URLs", "README with architecture, setup and API documentation", "PDF report with schema, routes, screenshots and test results"}',
   'GitHub + frontend URL + backend URL + PDF',
   '{"A reviewer can complete the full student and admin journey using the documented demo accounts."}',
   'End-to-end screenshots, API tests and commit history', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- MACHINE LEARNING — Week 1
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('machine-learning-w1-a1', 'machine-learning-w1', 'Titanic Data Exploration and Cleaning', 'machine-learning-w1-a1', 'Easy', 8, '7-9 h',
   'Analyze and clean the Titanic dataset, then produce a data-quality report ready for modeling.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Inspect shape, types, duplicates and missing values.", "Create at least five meaningful visualizations.", "Handle missing Age, Cabin and Embarked values with justified choices.", "Encode categorical variables and export a cleaned CSV."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"The cleaned dataset has documented transformations and no unexplained missing values."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 1),
  ('machine-learning-w1-a2', 'machine-learning-w1', 'House Price Regression Baseline', 'machine-learning-w1-a2', 'Easy', 10, '9-11 h',
   'Train a baseline model to predict house prices and explain which features influence results.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Separate features and target without leakage.", "Create a preprocessing pipeline for numeric and categorical data.", "Compare a dummy baseline, linear regression and one tree-based model.", "Report MAE, RMSE and R2 on held-out data."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"The final model beats the dummy baseline and metrics are calculated correctly."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 2),
  ('machine-learning-w1-a3', 'machine-learning-w1', 'Student Performance Analysis', 'machine-learning-w1-a3', 'Intermediate', 9, '8-10 h',
   'Investigate factors associated with student performance and build a simple prediction model.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Perform subgroup analysis without claiming causation.", "Visualize relationships between study time, attendance and score.", "Build either regression or classification with a justified target.", "Discuss bias, limitations and data leakage risks."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"Claims remain supported by the data and the model evaluation is honest."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 3),
  ('machine-learning-w1-a4', 'machine-learning-w1', 'Interactive Data Visualization Dashboard', 'machine-learning-w1-a4', 'Intermediate', 10.5, '9-12 h',
   'Create a Streamlit dashboard for exploring a chosen public dataset.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Provide filters, KPI cards and at least four chart types.", "Handle empty filter results.", "Cache data loading appropriately.", "Deploy the dashboard publicly."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"Dashboard filters update correctly and all charts remain readable."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- MACHINE LEARNING — Week 2
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('machine-learning-w2-a1', 'machine-learning-w2', 'Customer Churn Prediction', 'machine-learning-w2-a1', 'Intermediate', 12.5, '11-14 h',
   'Build a churn classifier and identify actionable drivers while handling class imbalance.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Create preprocessing pipelines.", "Compare logistic regression and two tree-based models.", "Report precision, recall, F1, ROC-AUC and confusion matrix.", "Select threshold based on a stated business objective."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"The chosen model/threshold is justified rather than selected only by accuracy."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 1),
  ('machine-learning-w2-a2', 'machine-learning-w2', 'Loan Approval Prediction', 'machine-learning-w2-a2', 'Intermediate', 11.5, '10-13 h',
   'Predict loan approval using a public dataset while documenting fairness and leakage risks.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Audit sensitive or proxy attributes.", "Compare at least three models with cross-validation.", "Explain false-positive and false-negative consequences.", "Produce feature importance or coefficients."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"Evaluation includes fairness/limitation discussion and correct train-test separation."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 2),
  ('machine-learning-w2-a3', 'machine-learning-w2', 'Spam Email Classifier', 'machine-learning-w2-a3', 'Intermediate', 11.5, '10-13 h',
   'Build a text classifier for spam detection using TF-IDF and compare multiple algorithms.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Clean text without destroying useful signals.", "Use a Pipeline containing vectorizer and model.", "Compare Naive Bayes, logistic regression and linear SVM or equivalent.", "Show misclassified examples and error analysis."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"Pipeline handles unseen text and reports class-specific metrics."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 3),
  ('machine-learning-w2-a4', 'machine-learning-w2', 'Movie Recommendation System', 'machine-learning-w2-a4', 'Advanced', 13.5, '12-15 h',
   'Build a content-based recommendation system that returns similar movies from metadata.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Prepare text features from genres, keywords and overview.", "Use TF-IDF/cosine similarity or a justified embedding approach.", "Return top-N results and exclude the query movie.", "Evaluate qualitatively with at least ten test titles."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"Recommendations are reproducible and evaluation examples are documented."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- MACHINE LEARNING — Week 3
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('machine-learning-w3-a1', 'machine-learning-w3', 'Image Classification with CNN', 'machine-learning-w3-a1', 'Advanced', 16, '14-18 h',
   'Train a CNN on a public image dataset and analyze overfitting and class errors.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Create train/validation/test splits.", "Normalize images and apply justified augmentation.", "Plot training history and confusion matrix.", "Save the best model and provide an inference script."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"The saved model reproduces reported test metrics and inference works on new samples."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 1),
  ('machine-learning-w3-a2', 'machine-learning-w3', 'Sentiment Analysis Pipeline', 'machine-learning-w3-a2', 'Advanced', 14, '12-16 h',
   'Build a sentiment classifier and compare a classical model with a pre-trained transformer or documented lightweight alternative.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Clean and split text safely.", "Use appropriate metrics and class balance analysis.", "Compare accuracy, latency and resource use.", "Inspect common error categories."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"Comparison is fair and includes both quality and practical tradeoffs."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 2),
  ('machine-learning-w3-a3', 'machine-learning-w3', 'Time-Series Forecasting', 'machine-learning-w3-a3', 'Advanced', 15, '13-17 h',
   'Forecast a time-indexed target using walk-forward validation and compare against naive baselines.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Preserve temporal order.", "Create lag/rolling features without future leakage.", "Compare naive, statistical and ML-based approaches.", "Report MAE/RMSE and forecast plots."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"The model is evaluated with time-aware validation and beats or honestly discusses the baseline."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 3),
  ('machine-learning-w3-a4', 'machine-learning-w3', 'Fraud Detection Challenge', 'machine-learning-w3-a4', 'Advanced', 15, '13-17 h',
   'Build an imbalanced classification pipeline for credit-card fraud detection.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Use stratified/time-aware splitting as appropriate.", "Do not oversample before splitting.", "Report PR-AUC, recall, precision and confusion matrix.", "Select a threshold based on cost assumptions."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"No leakage is introduced and metric choice reflects rare-event detection."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- MACHINE LEARNING — Week 4
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('machine-learning-w4-a1', 'machine-learning-w4', 'End-to-End ML Pipeline', 'machine-learning-w4-a1', 'Advanced', 18, '16-20 h',
   'Convert one earlier notebook into a reusable training and inference pipeline.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Create separate data, features, train, evaluate and predict modules.", "Use configuration files or CLI arguments.", "Persist preprocessing and model together.", "Add basic automated tests for data schema and prediction shape."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"A fresh environment can train and predict using documented commands."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 1),
  ('machine-learning-w4-a2', 'machine-learning-w4', 'Model Deployment with FastAPI', 'machine-learning-w4-a2', 'Advanced', 16, '14-18 h',
   'Serve a trained model through a validated FastAPI prediction service.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Define Pydantic input/output schemas.", "Load model once at startup.", "Add /health, /predict and /model-info endpoints.", "Handle invalid data and log prediction errors safely."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"API returns reproducible predictions and invalid requests receive clear errors."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 2),
  ('machine-learning-w4-a3', 'machine-learning-w4', 'Experiment Tracking and Model Comparison', 'machine-learning-w4-a3', 'Advanced', 14, '12-16 h',
   'Track at least eight model runs and select a production candidate using reproducible evidence.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Use MLflow or a lightweight documented alternative.", "Log parameters, metrics and artifacts.", "Create a model comparison table.", "Register or clearly identify the selected model version."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"Runs can be reproduced and the selected model follows declared criteria."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 3),
  ('machine-learning-w4-a4', 'machine-learning-w4', 'IH Academy ML Capstone', 'machine-learning-w4-a4', 'Advanced', 26, '22-30 h',
   'Build a production-ready ML application using a real-world dataset, API and interactive dashboard.',
   '{"Use a reproducible notebook or src/ pipeline with fixed random seeds.", "Document the dataset source, target and ethical/quality limitations.", "Include data validation, preprocessing, training, evaluation and inference.", "Expose predictions through FastAPI.", "Create a Streamlit or React dashboard consuming the API.", "Document ethics, limitations, monitoring signals and retraining plan."}',
   '{"Clean repository with requirements.txt or pyproject.toml", "Notebook/source code and saved figures", "README with setup and results", "PDF report containing methodology, charts, metrics and conclusions"}',
   'Notebook/source + dataset reference + model artifacts + PDF report',
   '{"The deployed system works end to end and all reported metrics are reproducible."}',
   'Metrics table, plots, sample predictions and reproducibility notes', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- AGENTIC AI ENGINEERING — Week 1
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('agentic-ai-engineering-w1-a1', 'agentic-ai-engineering-w1', 'Prompt Engineering Playground', 'agentic-ai-engineering-w1-a1', 'Easy', 9, '8-10 h',
   'Build a small app where users can compare prompt templates, parameters and structured-output modes.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Provide system/user prompt fields and preset templates.", "Support JSON schema or equivalent structured output.", "Show token/latency/error metadata where available.", "Save experiments locally or in a simple database."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"At least ten evaluation prompts run consistently and malformed output is handled."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 1),
  ('agentic-ai-engineering-w1-a2', 'agentic-ai-engineering-w1', 'LLM Chatbot using API', 'agentic-ai-engineering-w1-a2', 'Easy', 10.5, '9-12 h',
   'Build a conversational chatbot with session history, reset and safe error states.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Separate UI/API/model service layers.", "Implement conversation truncation or summarization strategy.", "Add a clear disclaimer and refuse unsupported high-risk claims.", "Do not hardcode one provider throughout the codebase."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Multiple turns work, session reset works and API failures do not crash the app."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 2),
  ('agentic-ai-engineering-w1-a3', 'agentic-ai-engineering-w1', 'Structured Text Summarizer', 'agentic-ai-engineering-w1-a3', 'Intermediate', 10.5, '9-12 h',
   'Build a summarizer that produces overview, key points, actions and named entities from pasted text.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Validate a structured response schema.", "Support short, medium and detailed modes.", "Reject empty/oversized input with clear messages.", "Create a factuality checklist using source-text matching."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Output always matches the schema and evaluation shows unsupported statements are minimized."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 3),
  ('agentic-ai-engineering-w1-a4', 'agentic-ai-engineering-w1', 'Document Q&A Assistant', 'agentic-ai-engineering-w1-a4', 'Intermediate', 12.5, '11-14 h',
   'Build a PDF Q&A assistant that answers only from the uploaded document and cites source chunks.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Extract and chunk document text.", "Create embeddings and retrieval.", "Return source page/chunk references.", "Say that the answer is not found when evidence is insufficient."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Answers are grounded, citations point to retrieved text and unsupported questions are refused."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- AGENTIC AI ENGINEERING — Week 2
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('agentic-ai-engineering-w2-a1', 'agentic-ai-engineering-w2', 'RAG Chatbot with PDF', 'agentic-ai-engineering-w2-a1', 'Intermediate', 14, '12-16 h',
   'Build a multi-turn RAG chatbot for one or more PDFs with conversation-aware retrieval.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Separate ingestion and chat flows.", "Store document metadata and chunk identifiers.", "Use retrieval filters by document.", "Create at least 20 question-answer evaluation cases."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Evaluation demonstrates grounded answers, correct refusal and stable document filtering."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 1),
  ('agentic-ai-engineering-w2-a2', 'agentic-ai-engineering-w2', 'AI Email Assistant', 'agentic-ai-engineering-w2-a2', 'Intermediate', 11.5, '10-13 h',
   'Build an assistant that drafts, rewrites and summarizes emails using user-selected tone and constraints.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Return structured subject/body/action fields.", "Never send email automatically.", "Support sensitive-information warning.", "Add deterministic templates for common failures."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Drafts follow requested tone/length and no send action occurs without explicit user confirmation."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 2),
  ('agentic-ai-engineering-w2-a3', 'agentic-ai-engineering-w2', 'AI Code Reviewer', 'agentic-ai-engineering-w2-a3', 'Advanced', 14, '12-16 h',
   'Build a code-review assistant that analyzes pasted diffs and returns prioritized findings.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Use structured severity, file, line, issue and recommendation fields.", "Avoid claiming execution unless tests were actually run.", "Add prompt-injection resistance for code comments.", "Evaluate on clean code and intentionally flawed examples."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Findings are traceable, prioritized and do not invent test results."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 3),
  ('agentic-ai-engineering-w2-a4', 'agentic-ai-engineering-w2', 'Tool-Calling Utility Agent', 'agentic-ai-engineering-w2-a4', 'Advanced', 15, '13-17 h',
   'Build an agent that selects and calls safe tools such as calculator, date utility and local knowledge lookup.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Define strict tool schemas.", "Validate tool arguments before execution.", "Limit loops and tool-call count.", "Show tool trace to the user."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"The agent chooses correct tools, rejects invalid arguments and stops within configured limits."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- AGENTIC AI ENGINEERING — Week 3
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('agentic-ai-engineering-w3-a1', 'agentic-ai-engineering-w3', 'Conversation Memory Assistant', 'agentic-ai-engineering-w3-a1', 'Advanced', 15, '13-17 h',
   'Build a chatbot with explicit short-term and user-approved long-term memory.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Separate chat history from durable memory.", "Require user confirmation before saving personal memory.", "Support view/edit/delete memory controls.", "Prevent cross-user memory access."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Memory behavior is transparent, editable and user-isolated."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 1),
  ('agentic-ai-engineering-w3-a2', 'agentic-ai-engineering-w3', 'Multi-Document Research Assistant', 'agentic-ai-engineering-w3-a2', 'Advanced', 17.5, '15-20 h',
   'Build an assistant that searches multiple uploaded documents and produces cited comparative answers.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Use metadata filters and source ranking.", "Return citations for every factual paragraph.", "Distinguish source facts from model inference.", "Create conflict handling when documents disagree."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Answers identify source disagreement and every claim is traceable to retrieved evidence."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 2),
  ('agentic-ai-engineering-w3-a3', 'agentic-ai-engineering-w3', 'Meeting Notes Agent', 'agentic-ai-engineering-w3-a3', 'Advanced', 15, '13-17 h',
   'Build an agent that converts a transcript into summary, decisions, actions, owners and due dates.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Use a validated schema.", "Mark unknown owner/date rather than guessing.", "Allow user corrections before export.", "Export JSON and Markdown."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Action items are extracted accurately and unknown information is not fabricated."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 3),
  ('agentic-ai-engineering-w3-a4', 'agentic-ai-engineering-w3', 'SQL Assistant with Guardrails', 'agentic-ai-engineering-w3-a4', 'Advanced', 17.5, '15-20 h',
   'Build an assistant that converts questions into read-only SQL for a sample database and explains results.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Expose schema through a controlled tool.", "Allow only SELECT queries.", "Parse/check SQL before execution and enforce row limits.", "Protect against prompt injection and destructive statements."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"No write query can execute and generated queries answer evaluation questions correctly."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 4)
on conflict (id) do nothing;

-- ===========================================================================
-- AGENTIC AI ENGINEERING — Week 4
-- ===========================================================================
insert into public.internship_assignments
  (id, week_id, title, slug, difficulty, estimated_hours, hours_label, question,
   requirements, deliverables, submission_mode, acceptance_criteria, evidence_required, "order")
values
  ('agentic-ai-engineering-w4-a1', 'agentic-ai-engineering-w4', 'Customer Support Knowledge Agent', 'agentic-ai-engineering-w4-a1', 'Advanced', 21, '18-24 h',
   'Build a support assistant grounded in a product knowledge base with escalation and feedback.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Use RAG with citations.", "Collect issue category and confidence.", "Escalate low-confidence or policy-sensitive cases.", "Store user feedback for evaluation."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Grounded answers meet the test set and low-confidence cases escalate instead of hallucinating."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 1),
  ('agentic-ai-engineering-w4-a2', 'agentic-ai-engineering-w4', 'Workflow Automation Agent', 'agentic-ai-engineering-w4-a2', 'Advanced', 21, '18-24 h',
   'Build an approval-based agent that turns a request into a multi-step workflow using safe tools.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Create planner, executor and verifier stages or a justified equivalent.", "Require confirmation before external side effects.", "Persist workflow state and recover from failed steps.", "Limit retries and total cost."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"Workflow state is auditable and no side effect occurs without approval."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 2),
  ('agentic-ai-engineering-w4-a3', 'agentic-ai-engineering-w4', 'Mini Multi-Agent System', 'agentic-ai-engineering-w4-a3', 'Advanced', 23, '20-26 h',
   'Build a small research team with planner, researcher, critic and writer agents.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Define clear agent roles and message contracts.", "Prevent infinite delegation.", "Cite research sources or provided documents.", "Compare result quality against a single-agent baseline."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"The system terminates reliably and evaluation justifies whether multiple agents add value."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 3),
  ('agentic-ai-engineering-w4-a4', 'agentic-ai-engineering-w4', 'IH Academy AI Workspace Capstone', 'agentic-ai-engineering-w4-a4', 'Advanced', 34, '28-40 h',
   'Build a production-ready AI workspace for IH Academy with document RAG, tool calling, memory controls, evaluation and admin-visible traces.',
   '{"Use a provider abstraction and keep API keys in environment variables.", "Validate model output and handle timeouts, retries and provider errors.", "Log requests safely without storing secrets or sensitive raw content.", "Use authentication-ready user isolation.", "Support institutional documents and track citations.", "Add tool limits, safety checks and cost/latency logging.", "Create an evaluation suite for grounding, refusal and tool correctness.", "Deploy a working demo with no hardcoded keys."}',
   '{"GitHub repository with clean architecture", "README with setup, prompts, model choices and limitations", "Evaluation cases with expected behavior", "PDF report containing architecture, screenshots, examples and results"}',
   'GitHub + deployed demo/API + PDF report',
   '{"The final system passes documented grounding, security, tool and reliability checks."}',
   'Prompt/output examples, failure cases, evaluation table and traces', 4)
on conflict (id) do nothing;