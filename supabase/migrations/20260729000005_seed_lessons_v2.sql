-- Seed lessons for all courses (simple INSERT per course)
INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'HTML & Semantic Markup', '## HTML & Semantic Markup' || chr(10) || chr(10) || 'Learn the foundation of web structure using semantic HTML5 elements.' || chr(10) || chr(10) || '- Document structure (header, main, footer)' || chr(10) || '- Forms and input validation' || chr(10) || '- Accessibility best practices with ARIA attributes', 20, 1 FROM public.courses c WHERE c.title = 'Frontend Development';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'CSS Layouts & Responsive Design', '## CSS Layouts & Responsive Design' || chr(10) || chr(10) || 'Master modern CSS layout techniques.' || chr(10) || chr(10) || '- Flexbox: one-dimensional layouts' || chr(10) || '- CSS Grid: two-dimensional layouts' || chr(10) || '- Media queries and mobile-first design' || chr(10) || chr(10) || 'Build layouts that adapt seamlessly across devices.', 25, 2 FROM public.courses c WHERE c.title = 'Frontend Development';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'JavaScript & DOM Manipulation', '## JavaScript & DOM Manipulation' || chr(10) || chr(10) || 'Deep dive into the language of the web.' || chr(10) || chr(10) || '- Closures, promises, and async/await' || chr(10) || '- DOM traversal and event delegation' || chr(10) || '- Modern ES6+ syntax', 30, 3 FROM public.courses c WHERE c.title = 'Frontend Development';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'React: Components, State & Effects', '## React: Components, State & Effects' || chr(10) || chr(10) || 'Build modern UIs with React.' || chr(10) || chr(10) || '- Functional components and hooks' || chr(10) || '- useState, useEffect, useContext' || chr(10) || '- Performance optimization', 35, 4 FROM public.courses c WHERE c.title = 'Frontend Development';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Node.js & Express Fundamentals', '## Node.js & Express Fundamentals' || chr(10) || chr(10) || 'Build server-side applications with Node.js.' || chr(10) || chr(10) || '- Event loop and non-blocking I/O' || chr(10) || '- Express routing and middleware' || chr(10) || '- Error handling patterns', 25, 1 FROM public.courses c WHERE c.title = 'Backend Development';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'RESTful API Design', '## RESTful API Design' || chr(10) || chr(10) || 'Design and implement REST APIs that scale.' || chr(10) || chr(10) || '- Resource naming conventions' || chr(10) || '- Status codes and error responses' || chr(10) || '- Versioning and documentation', 25, 2 FROM public.courses c WHERE c.title = 'Backend Development';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Authentication & Authorization', '## Authentication & Authorization' || chr(10) || chr(10) || 'Secure your applications with robust auth.' || chr(10) || chr(10) || '- JWT tokens and refresh flows' || chr(10) || '- Role-based access control (RBAC)' || chr(10) || '- OAuth2 integration', 30, 3 FROM public.courses c WHERE c.title = 'Backend Development';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Database Integration & ORMs', '## Database Integration & ORMs' || chr(10) || chr(10) || 'Connect your backend to databases efficiently.' || chr(10) || chr(10) || '- SQL vs NoSQL trade-offs' || chr(10) || '- Prisma and Drizzle ORM patterns' || chr(10) || '- Connection pooling', 30, 4 FROM public.courses c WHERE c.title = 'Backend Development';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Python for ML & Data Processing', '## Python for ML & Data Processing' || chr(10) || chr(10) || 'Set up your Python ML environment.' || chr(10) || chr(10) || '- NumPy arrays and vectorization' || chr(10) || '- Pandas DataFrames for data wrangling' || chr(10) || '- Matplotlib and Seaborn for visualization', 25, 1 FROM public.courses c WHERE c.title = 'Machine Learning';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Supervised Learning: Regression', '## Supervised Learning: Regression' || chr(10) || chr(10) || 'Predict continuous values with regression models.' || chr(10) || chr(10) || '- Linear and polynomial regression' || chr(10) || '- Decision trees and random forests' || chr(10) || '- Model evaluation: MSE, MAE, R-squared', 30, 2 FROM public.courses c WHERE c.title = 'Machine Learning';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Supervised Learning: Classification', '## Supervised Learning: Classification' || chr(10) || chr(10) || 'Classify data into categories.' || chr(10) || chr(10) || '- Logistic regression and SVMs' || chr(10) || '- K-nearest neighbors' || chr(10) || '- Confusion matrices and ROC curves', 30, 3 FROM public.courses c WHERE c.title = 'Machine Learning';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Neural Networks & Deep Learning', '## Neural Networks & Deep Learning' || chr(10) || chr(10) || 'Dive into deep learning with TensorFlow.' || chr(10) || chr(10) || '- Perceptrons and activation functions' || chr(10) || '- Backpropagation and gradient descent' || chr(10) || '- Convolutional neural networks', 35, 4 FROM public.courses c WHERE c.title = 'Machine Learning';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Transformer Architecture', '## Transformer Architecture' || chr(10) || chr(10) || 'Understand the architecture behind modern LLMs.' || chr(10) || chr(10) || '- Self-attention mechanism' || chr(10) || '- Multi-head attention' || chr(10) || '- Positional encoding', 30, 1 FROM public.courses c WHERE c.title = 'Generative AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Fine-tuning LLMs', '## Fine-tuning LLMs' || chr(10) || chr(10) || 'Adapt pre-trained models to specific tasks.' || chr(10) || chr(10) || '- Transfer learning principles' || chr(10) || '- LoRA and QLoRA techniques' || chr(10) || '- Instruction tuning', 35, 2 FROM public.courses c WHERE c.title = 'Generative AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Retrieval Augmented Generation (RAG)', '## Retrieval Augmented Generation (RAG)' || chr(10) || chr(10) || 'Combine LLMs with external knowledge bases.' || chr(10) || chr(10) || '- Embedding models and vector databases' || chr(10) || '- Document chunking strategies' || chr(10) || '- Hybrid search', 30, 3 FROM public.courses c WHERE c.title = 'Generative AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Prompt Engineering for GenAI', '## Prompt Engineering for GenAI' || chr(10) || chr(10) || 'Master advanced prompting techniques.' || chr(10) || chr(10) || '- Chain-of-thought prompting' || chr(10) || '- Few-shot and zero-shot learning' || chr(10) || '- Structured output generation', 25, 4 FROM public.courses c WHERE c.title = 'Generative AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Introduction to AI Agents', '## Introduction to AI Agents' || chr(10) || chr(10) || 'Understanding autonomous AI agent architecture.' || chr(10) || chr(10) || '- Perception, reasoning, action loop' || chr(10) || '- Tool use and function calling' || chr(10) || '- Memory and state management', 30, 1 FROM public.courses c WHERE c.title = 'Agentic AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Tool Use & Function Calling', '## Tool Use & Function Calling' || chr(10) || chr(10) || 'Equip agents with external capabilities.' || chr(10) || chr(10) || '- Defining tool schemas' || chr(10) || '- Dynamic tool selection' || chr(10) || '- Error handling and retries', 30, 2 FROM public.courses c WHERE c.title = 'Agentic AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Multi-Agent Systems', '## Multi-Agent Systems' || chr(10) || chr(10) || 'Orchestrate multiple agents to solve complex tasks.' || chr(10) || chr(10) || '- Agent communication protocols' || chr(10) || '- Task decomposition and delegation' || chr(10) || '- Consensus and aggregation', 35, 3 FROM public.courses c WHERE c.title = 'Agentic AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Agent Memory & Planning', '## Agent Memory & Planning' || chr(10) || chr(10) || 'Implement sophisticated memory and planning systems.' || chr(10) || chr(10) || '- Short-term vs long-term memory' || chr(10) || '- ReAct and Plan-and-Solve patterns' || chr(10) || '- Reflection and self-correction', 35, 4 FROM public.courses c WHERE c.title = 'Agentic AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Project Architecture & Planning', '## Project Architecture & Planning' || chr(10) || chr(10) || 'Design scalable full-stack applications.' || chr(10) || chr(10) || '- Monorepo vs polyrepo' || chr(10) || '- API design patterns' || chr(10) || '- Database schema design', 20, 1 FROM public.courses c WHERE c.title = 'Full-Stack';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Full-Stack Authentication', '## Full-Stack Authentication' || chr(10) || chr(10) || 'Implement end-to-end authentication.' || chr(10) || chr(10) || '- JWT with refresh tokens' || chr(10) || '- Social login (Google, GitHub)' || chr(10) || '- Protected routes and middleware', 25, 2 FROM public.courses c WHERE c.title = 'Full-Stack';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'CRUD with Real-time Updates', '## CRUD with Real-time Updates' || chr(10) || chr(10) || 'Build reactive applications with live data.' || chr(10) || chr(10) || '- REST endpoints for CRUD' || chr(10) || '- WebSocket and Server-Sent Events' || chr(10) || '- Optimistic UI updates', 30, 3 FROM public.courses c WHERE c.title = 'Full-Stack';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Deployment & DevOps', '## Deployment & DevOps' || chr(10) || chr(10) || 'Ship your application to production.' || chr(10) || chr(10) || '- CI/CD pipelines' || chr(10) || '- Containerization with Docker' || chr(10) || '- Cloud deployment (Vercel, Railway, AWS)', 25, 4 FROM public.courses c WHERE c.title = 'Full-Stack';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'AI-Powered Design Tools', '## AI-Powered Design Tools' || chr(10) || chr(10) || 'Leverage AI in your design workflow.' || chr(10) || chr(10) || '- Generative fill and image creation' || chr(10) || '- AI layout suggestions' || chr(10) || '- Design system automation', 20, 1 FROM public.courses c WHERE c.title = 'Generative UI/UX';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Rapid Prototyping with AI', '## Rapid Prototyping with AI' || chr(10) || chr(10) || 'Create interactive prototypes in minutes.' || chr(10) || chr(10) || '- Text-to-design generation' || chr(10) || '- Style transfer and theming' || chr(10) || '- Design-to-code workflows', 25, 2 FROM public.courses c WHERE c.title = 'Generative UI/UX';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Designing for AI Products', '## Designing for AI Products' || chr(10) || chr(10) || 'UX patterns specific to AI-powered applications.' || chr(10) || chr(10) || '- Handling uncertainty and confidence' || chr(10) || '- Progressive disclosure of AI capabilities' || chr(10) || '- Feedback loops', 25, 3 FROM public.courses c WHERE c.title = 'Generative UI/UX';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Design Systems & Component Libraries', '## Design Systems & Component Libraries' || chr(10) || chr(10) || 'Build scalable design systems with AI assistance.' || chr(10) || chr(10) || '- Token-based theming' || chr(10) || '- Component documentation' || chr(10) || '- Accessibility-first design', 25, 4 FROM public.courses c WHERE c.title = 'Generative UI/UX';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'What is AI?', '## What is AI?' || chr(10) || chr(10) || 'Artificial Intelligence (AI) refers to machines that can perform tasks that typically require human intelligence.' || chr(10) || chr(10) || '- Narrow AI: Specialized for specific tasks' || chr(10) || '- General AI: Hypothetical human-level intelligence' || chr(10) || '- Superintelligence: Beyond human capability', 15, 1 FROM public.courses c WHERE c.title = 'AI Fluency';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Types of Machine Learning', '## Types of Machine Learning' || chr(10) || chr(10) || 'Understand the three main paradigms of machine learning.' || chr(10) || chr(10) || '- Supervised Learning: Learning from labeled data' || chr(10) || '- Unsupervised Learning: Finding patterns' || chr(10) || '- Reinforcement Learning: Trial and error', 15, 2 FROM public.courses c WHERE c.title = 'AI Fluency';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'AI in the Real World', '## AI in the Real World' || chr(10) || chr(10) || 'Explore practical applications of AI across industries.' || chr(10) || chr(10) || '- Healthcare: Diagnosis and drug discovery' || chr(10) || '- Finance: Fraud detection' || chr(10) || '- Education: Personalized learning paths', 15, 3 FROM public.courses c WHERE c.title = 'AI Fluency';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Anatomy of a Good Prompt', '## Anatomy of a Good Prompt' || chr(10) || chr(10) || 'Learn the components of effective prompts.' || chr(10) || chr(10) || '- Role: Define who the AI should be' || chr(10) || '- Context: Provide necessary background' || chr(10) || '- Task: Clearly state what you want' || chr(10) || '- Format: Specify output structure', 15, 1 FROM public.courses c WHERE c.title = 'Prompt Engineering';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Zero-shot & Few-shot Prompting', '## Zero-shot & Few-shot Prompting' || chr(10) || chr(10) || 'Master different prompting strategies.' || chr(10) || chr(10) || '- Zero-shot: Ask directly without examples' || chr(10) || '- Few-shot: Provide examples to guide' || chr(10) || '- Chain-of-thought: Show reasoning steps', 15, 2 FROM public.courses c WHERE c.title = 'Prompt Engineering';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Advanced Prompt Patterns', '## Advanced Prompt Patterns' || chr(10) || chr(10) || 'Explore sophisticated prompting techniques.' || chr(10) || chr(10) || '- Tree-of-Thought: Explore multiple reasoning paths' || chr(10) || '- ReAct: Reason + Act cycles' || chr(10) || '- Self-Consistency: Sample multiple outputs', 15, 3 FROM public.courses c WHERE c.title = 'Prompt Engineering';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Setting Up AI Coding Assistants', '## Setting Up AI Coding Assistants' || chr(10) || chr(10) || 'Configure your development environment for AI assistance.' || chr(10) || chr(10) || '- GitHub Copilot setup' || chr(10) || '- Cursor, Windsurf, and other AI editors' || chr(10) || '- API keys and configuration', 15, 1 FROM public.courses c WHERE c.title = 'AI-Assisted Coding';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Code Generation with AI', '## Code Generation with AI' || chr(10) || chr(10) || 'Generate code efficiently using AI.' || chr(10) || chr(10) || '- Writing functions from descriptions' || chr(10) || '- Converting between languages' || chr(10) || '- Generating test cases', 15, 2 FROM public.courses c WHERE c.title = 'AI-Assisted Coding';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Debugging & Refactoring with AI', '## Debugging & Refactoring with AI' || chr(10) || chr(10) || 'Use AI to improve existing code.' || chr(10) || chr(10) || '- Explain complex code' || chr(10) || '- Identify bugs and suggest fixes' || chr(10) || '- Refactor for performance', 15, 3 FROM public.courses c WHERE c.title = 'AI-Assisted Coding';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'What are Large Language Models?', '## What are Large Language Models?' || chr(10) || chr(10) || 'LLMs are neural networks trained on massive text datasets.' || chr(10) || chr(10) || '- Trained on trillions of tokens' || chr(10) || '- Learn patterns, grammar, and knowledge' || chr(10) || '- Generate human-like text', 15, 1 FROM public.courses c WHERE c.title = 'Introduction to LLMs';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'How LLMs Process Text', '## How LLMs Process Text' || chr(10) || chr(10) || 'Understand tokenization and inference.' || chr(10) || chr(10) || '- Tokenization: Converting text to numbers' || chr(10) || '- Embeddings: Semantic vector representations' || chr(10) || '- Attention: Understanding context', 15, 2 FROM public.courses c WHERE c.title = 'Introduction to LLMs';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Capabilities & Limitations', '## Capabilities & Limitations' || chr(10) || chr(10) || 'Understand what LLMs can and cannot do.' || chr(10) || chr(10) || 'Capabilities: Text generation, summarization, translation, coding.' || chr(10) || 'Limitations: Hallucinations, limited context, no true understanding.', 15, 3 FROM public.courses c WHERE c.title = 'Introduction to LLMs';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'AI Ethics & Bias', '## AI Ethics & Bias' || chr(10) || chr(10) || 'Understand ethical challenges in AI.' || chr(10) || chr(10) || '- Sources of bias in training data' || chr(10) || '- Fairness metrics and evaluation' || chr(10) || '- Mitigation strategies', 15, 1 FROM public.courses c WHERE c.title = 'AI Safety & Responsible AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Alignment & Control', '## Alignment & Control' || chr(10) || chr(10) || 'Ensure AI systems act in accordance with human values.' || chr(10) || chr(10) || '- Reward modeling and RLHF' || chr(10) || '- Constitutional AI' || chr(10) || '- Oversight and monitoring', 15, 2 FROM public.courses c WHERE c.title = 'AI Safety & Responsible AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Responsible AI Development', '## Responsible AI Development' || chr(10) || chr(10) || 'Best practices for building AI responsibly.' || chr(10) || chr(10) || '- Transparency and explainability' || chr(10) || '- Privacy and data governance' || chr(10) || '- Red-teaming and safety testing', 15, 3 FROM public.courses c WHERE c.title = 'AI Safety & Responsible AI';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Getting Started with Claude', '## Getting Started with Claude' || chr(10) || chr(10) || 'Learn the basics of interacting with Claude.' || chr(10) || chr(10) || '- Account setup and interface' || chr(10) || '- Claude Pro vs Free tier' || chr(10) || '- Projects and custom instructions', 15, 1 FROM public.courses c WHERE c.title = 'Claude Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Claude for Writing & Analysis', '## Claude for Writing & Analysis' || chr(10) || chr(10) || 'Use Claude for content creation and research.' || chr(10) || chr(10) || '- Long-form writing with artifacts' || chr(10) || '- Document analysis (PDF, images)' || chr(10) || '- Research and summarization', 15, 2 FROM public.courses c WHERE c.title = 'Claude Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Claude for Code & Technical Tasks', '## Claude for Code & Technical Tasks' || chr(10) || chr(10) || 'Claude excels at programming tasks.' || chr(10) || chr(10) || '- Code generation and debugging' || chr(10) || '- Architecture review' || chr(10) || '- Technical documentation', 15, 3 FROM public.courses c WHERE c.title = 'Claude Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Working with AI as a Teammate', '## Working with AI as a Teammate' || chr(10) || chr(10) || 'Treat AI as a collaborative partner.' || chr(10) || chr(10) || '- Defining roles and responsibilities' || chr(10) || '- Iterative refinement cycles' || chr(10) || '- Reviewing and validating AI output', 15, 1 FROM public.courses c WHERE c.title = 'AI Collaboration Techniques';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Task Decomposition with AI', '## Task Decomposition with AI' || chr(10) || chr(10) || 'Break complex tasks into manageable pieces.' || chr(10) || chr(10) || '- Top-down task breakdown' || chr(10) || '- Assigning subtasks to AI' || chr(10) || '- Combining AI outputs', 15, 2 FROM public.courses c WHERE c.title = 'AI Collaboration Techniques';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'AI-Assisted Decision Making', '## AI-Assisted Decision Making' || chr(10) || chr(10) || 'Use AI to augment your decision-making process.' || chr(10) || chr(10) || '- Generating and evaluating options' || chr(10) || '- SWOT analysis with AI' || chr(10) || '- Risk assessment', 15, 3 FROM public.courses c WHERE c.title = 'AI Collaboration Techniques';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Version Control with Git', '## Version Control with Git' || chr(10) || chr(10) || 'Understand the core concepts of version control.' || chr(10) || chr(10) || '- Repositories and commits' || chr(10) || '- Branching and merging' || chr(10) || '- Staging area and .gitignore', 15, 1 FROM public.courses c WHERE c.title = 'Git & GitHub Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Collaboration with GitHub', '## Collaboration with GitHub' || chr(10) || chr(10) || 'Use GitHub for team collaboration.' || chr(10) || chr(10) || '- Pull requests and code review' || chr(10) || '- Issues and project boards' || chr(10) || '- GitHub Actions for CI/CD', 15, 2 FROM public.courses c WHERE c.title = 'Git & GitHub Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Git Workflows & Best Practices', '## Git Workflows & Best Practices' || chr(10) || chr(10) || 'Adopt proven Git workflows.' || chr(10) || chr(10) || '- Git Flow vs GitHub Flow' || chr(10) || '- Conventional commits' || chr(10) || '- Rebasing and conflict resolution', 15, 3 FROM public.courses c WHERE c.title = 'Git & GitHub Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Navigating the Filesystem', '## Navigating the Filesystem' || chr(10) || chr(10) || 'Master basic Linux command line operations.' || chr(10) || chr(10) || '- ls, cd, pwd, mkdir, rm' || chr(10) || '- File permissions and ownership' || chr(10) || '- Paths: absolute vs relative', 15, 1 FROM public.courses c WHERE c.title = 'Linux & Command Line Basics';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Working with Files & Text', '## Working with Files & Text' || chr(10) || chr(10) || 'Process text files using command line tools.' || chr(10) || chr(10) || '- grep, sed, awk for text processing' || chr(10) || '- cat, less, tail, head' || chr(10) || '- Redirection and pipes', 15, 2 FROM public.courses c WHERE c.title = 'Linux & Command Line Basics';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Shell Scripting Basics', '## Shell Scripting Basics' || chr(10) || chr(10) || 'Automate tasks with shell scripts.' || chr(10) || chr(10) || '- Variables, conditionals, loops' || chr(10) || '- Functions and error handling' || chr(10) || '- Cron jobs and automation', 15, 3 FROM public.courses c WHERE c.title = 'Linux & Command Line Basics';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'What is an API?', '## What is an API?' || chr(10) || chr(10) || 'Understand the basics of Application Programming Interfaces.' || chr(10) || chr(10) || '- Client-server architecture' || chr(10) || '- Request-response cycle' || chr(10) || '- HTTP methods: GET, POST, PUT, DELETE', 15, 1 FROM public.courses c WHERE c.title = 'API Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'REST API Design Principles', '## REST API Design Principles' || chr(10) || chr(10) || 'Learn RESTful API design.' || chr(10) || chr(10) || '- Resource-oriented design' || chr(10) || '- Stateless operations' || chr(10) || '- Standard status codes', 15, 2 FROM public.courses c WHERE c.title = 'API Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Consuming APIs', '## Consuming APIs' || chr(10) || chr(10) || 'Learn how to interact with APIs from your code.' || chr(10) || chr(10) || '- Fetch API and Axios' || chr(10) || '- Authentication headers' || chr(10) || '- Error handling and rate limits', 15, 3 FROM public.courses c WHERE c.title = 'API Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Relational Database Concepts', '## Relational Database Concepts' || chr(10) || chr(10) || 'Understand the fundamentals of relational databases.' || chr(10) || chr(10) || '- Tables, rows, and columns' || chr(10) || '- Primary keys and foreign keys' || chr(10) || '- Relationships: 1:1, 1:N, N:M', 15, 1 FROM public.courses c WHERE c.title = 'Database Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'SQL: Querying Data', '## SQL: Querying Data' || chr(10) || chr(10) || 'Write SQL queries to retrieve and manipulate data.' || chr(10) || chr(10) || '- SELECT, WHERE, JOIN, GROUP BY' || chr(10) || '- Aggregate functions: COUNT, SUM, AVG' || chr(10) || '- Subqueries and CTEs', 20, 2 FROM public.courses c WHERE c.title = 'Database Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Database Design & Normalization', '## Database Design & Normalization' || chr(10) || chr(10) || 'Design efficient database schemas.' || chr(10) || chr(10) || '- Normal forms (1NF, 2NF, 3NF)' || chr(10) || '- Indexing strategies' || chr(10) || '- Migration management', 20, 3 FROM public.courses c WHERE c.title = 'Database Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'The Software Development Lifecycle', '## The Software Development Lifecycle' || chr(10) || chr(10) || 'Understand how software is built from idea to deployment.' || chr(10) || chr(10) || '- Requirements gathering' || chr(10) || '- Design and architecture' || chr(10) || '- Implementation and testing' || chr(10) || '- Deployment and maintenance', 20, 1 FROM public.courses c WHERE c.title = 'Software Engineering Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Clean Code Principles', '## Clean Code Principles' || chr(10) || chr(10) || 'Write code that humans can read and maintain.' || chr(10) || chr(10) || '- Meaningful names and comments' || chr(10) || '- Single responsibility principle' || chr(10) || '- DRY (Do not Repeat Yourself)', 20, 2 FROM public.courses c WHERE c.title = 'Software Engineering Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Testing & Quality Assurance', '## Testing & Quality Assurance' || chr(10) || chr(10) || 'Ensure your software works correctly.' || chr(10) || chr(10) || '- Unit testing with Jest/Vitest' || chr(10) || '- Integration testing' || chr(10) || '- Test-driven development (TDD)', 20, 3 FROM public.courses c WHERE c.title = 'Software Engineering Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Cloud Service Models', '## Cloud Service Models' || chr(10) || chr(10) || 'Understand IaaS, PaaS, and SaaS.' || chr(10) || chr(10) || '- IaaS: Virtual machines, storage, networking' || chr(10) || '- PaaS: Managed runtime platforms' || chr(10) || '- SaaS: Ready-to-use applications', 20, 1 FROM public.courses c WHERE c.title = 'Cloud Computing Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Major Cloud Providers', '## Major Cloud Providers' || chr(10) || chr(10) || 'Compare AWS, Azure, and GCP.' || chr(10) || chr(10) || '- Core services offered by each' || chr(10) || '- Pricing models and free tiers' || chr(10) || '- Regional availability', 15, 2 FROM public.courses c WHERE c.title = 'Cloud Computing Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Deploying Applications to the Cloud', '## Deploying Applications to the Cloud' || chr(10) || chr(10) || 'Learn practical deployment strategies.' || chr(10) || chr(10) || '- Containerization with Docker' || chr(10) || '- Serverless functions' || chr(10) || '- Managed databases', 20, 3 FROM public.courses c WHERE c.title = 'Cloud Computing Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'AI Tools for Daily Productivity', '## AI Tools for Daily Productivity' || chr(10) || chr(10) || 'Discover AI tools that boost everyday productivity.' || chr(10) || chr(10) || '- AI writing assistants (Claude, ChatGPT)' || chr(10) || '- Meeting summarizers' || chr(10) || '- Email and calendar assistants', 15, 1 FROM public.courses c WHERE c.title = 'AI Productivity & Automation';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Automating Workflows with AI', '## Automating Workflows with AI' || chr(10) || chr(10) || 'Build automated workflows using AI.' || chr(10) || chr(10) || '- Zapier and Make AI integrations' || chr(10) || '- Custom automation scripts' || chr(10) || '- AI-powered data processing', 20, 2 FROM public.courses c WHERE c.title = 'AI Productivity & Automation';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Building AI-Powered Productivity Systems', '## Building AI-Powered Productivity Systems' || chr(10) || chr(10) || 'Create comprehensive productivity systems.' || chr(10) || chr(10) || '- Personal knowledge management' || chr(10) || '- AI-powered research systems' || chr(10) || '- Automated reporting', 20, 3 FROM public.courses c WHERE c.title = 'AI Productivity & Automation';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Security Fundamentals', '## Security Fundamentals' || chr(10) || chr(10) || 'Understand core cybersecurity concepts.' || chr(10) || chr(10) || '- CIA triad: Confidentiality, Integrity, Availability' || chr(10) || '- Threat modeling and risk assessment' || chr(10) || '- Attack vectors', 20, 1 FROM public.courses c WHERE c.title = 'Cybersecurity Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Authentication & Access Control', '## Authentication & Access Control' || chr(10) || chr(10) || 'Implement secure access management.' || chr(10) || chr(10) || '- Password policies and hashing' || chr(10) || '- Multi-factor authentication' || chr(10) || '- Principle of least privilege', 15, 2 FROM public.courses c WHERE c.title = 'Cybersecurity Fundamentals';

INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT c.id, 'Secure Coding Practices', '## Secure Coding Practices' || chr(10) || chr(10) || 'Write code that resists attacks.' || chr(10) || chr(10) || '- SQL injection prevention' || chr(10) || '- XSS and CSRF protection' || chr(10) || '- Input validation and sanitization', 20, 3 FROM public.courses c WHERE c.title = 'Cybersecurity Fundamentals';
