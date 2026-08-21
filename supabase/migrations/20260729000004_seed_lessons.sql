-- Seed lessons for each course
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN SELECT id, title FROM public.courses LOOP
    
    IF c.title = 'Frontend Development' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'HTML & Semantic Markup', E'## HTML & Semantic Markup\n\nLearn the foundation of web structure using semantic HTML5 elements.\n\n- Document structure header, main, footer\n- Forms and input validation\n- Accessibility best practices with ARIA attributes\n\nSemantic markup improves SEO, accessibility, and code maintainability.', 20, 1),
        (c.id, 'CSS Layouts & Responsive Design', E'## CSS Layouts & Responsive Design\n\nMaster modern CSS layout techniques.\n\n- Flexbox: one-dimensional layouts\n- CSS Grid: two-dimensional layouts\n- Media queries and mobile-first design\n\nBuild layouts that adapt seamlessly across devices.', 25, 2),
        (c.id, 'JavaScript & DOM Manipulation', E'## JavaScript & DOM Manipulation\n\nDeep dive into the language of the web.\n\n- Closures, promises, and async/await\n- DOM traversal and event delegation\n- Modern ES6+ syntax\n\nWrite clean, performant JavaScript.', 30, 3),
        (c.id, 'React: Components, State & Effects', E'## React: Components, State & Effects\n\nBuild modern UIs with React.\n\n- Functional components and hooks\n- useState, useEffect, useContext\n- Performance optimization with useMemo and useCallback\n\nCreate composable, reusable component architectures.', 35, 4);
    
    ELSIF c.title = 'Backend Development' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Node.js & Express Fundamentals', E'## Node.js & Express Fundamentals\n\nBuild server-side applications with Node.js.\n\n- Event loop and non-blocking I/O\n- Express routing and middleware\n- Error handling patterns\n\nUnderstand the foundation of backend JavaScript.', 25, 1),
        (c.id, 'RESTful API Design', E'## RESTful API Design\n\nDesign and implement REST APIs that scale.\n\n- Resource naming conventions\n- Status codes and error responses\n- Versioning and documentation\n\nBuild APIs that developers love to use.', 25, 2),
        (c.id, 'Authentication & Authorization', E'## Authentication & Authorization\n\nSecure your applications with robust auth.\n\n- JWT tokens and refresh flows\n- Role-based access control (RBAC)\n- OAuth2 integration\n\nImplement secure authentication systems.', 30, 3),
        (c.id, 'Database Integration & ORMs', E'## Database Integration & ORMs\n\nConnect your backend to databases efficiently.\n\n- SQL vs NoSQL trade-offs\n- Prisma and Drizzle ORM patterns\n- Connection pooling and migrations\n\nMaster data access layer design.', 30, 4);
    
    ELSIF c.title = 'Machine Learning' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Python for ML & Data Processing', E'## Python for ML & Data Processing\n\nSet up your Python ML environment.\n\n- NumPy arrays and vectorization\n- Pandas DataFrames for data wrangling\n- Matplotlib and Seaborn for visualization\n\nFoundation for all ML workflows.', 25, 1),
        (c.id, 'Supervised Learning: Regression', E'## Supervised Learning: Regression\n\nPredict continuous values with regression models.\n\n- Linear and polynomial regression\n- Decision trees and random forests\n- Model evaluation: MSE, MAE, R-squared\n\nBuild predictive models for real-world data.', 30, 2),
        (c.id, 'Supervised Learning: Classification', E'## Supervised Learning: Classification\n\nClassify data into categories.\n\n- Logistic regression and SVMs\n- K-nearest neighbors\n- Confusion matrices and ROC curves\n\nMaster classification algorithms.', 30, 3),
        (c.id, 'Neural Networks & Deep Learning', E'## Neural Networks & Deep Learning\n\nDive into deep learning with TensorFlow.\n\n- Perceptrons and activation functions\n- Backpropagation and gradient descent\n- Convolutional neural networks\n\nBuild and train deep neural networks.', 35, 4);
    
    ELSIF c.title = 'Generative AI' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Transformer Architecture', E'## Transformer Architecture\n\nUnderstand the architecture behind modern LLMs.\n\n- Self-attention mechanism\n- Multi-head attention\n- Positional encoding\n\nUnderstand the Attention is All You Need paper.', 30, 1),
        (c.id, 'Fine-tuning LLMs', E'## Fine-tuning LLMs\n\nAdapt pre-trained models to specific tasks.\n\n- Transfer learning principles\n- LoRA and QLoRA techniques\n- Instruction tuning\n\nFine-tune LLMs efficiently.', 35, 2),
        (c.id, 'Retrieval Augmented Generation (RAG)', E'## Retrieval Augmented Generation (RAG)\n\nCombine LLMs with external knowledge bases.\n\n- Embedding models and vector databases\n- Document chunking strategies\n- Hybrid search (dense + sparse)\n\nBuild knowledge-augmented AI systems.', 30, 3),
        (c.id, 'Prompt Engineering for GenAI', E'## Prompt Engineering for GenAI\n\nMaster advanced prompting techniques.\n\n- Chain-of-thought prompting\n- Few-shot and zero-shot learning\n- Structured output generation\n\nGet the best results from generative models.', 25, 4);
    
    ELSIF c.title = 'Agentic AI' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Introduction to AI Agents', E'## Introduction to AI Agents\n\nUnderstanding autonomous AI agent architecture.\n\n- Perception, reasoning, action loop\n- Tool use and function calling\n- Memory and state management\n\nBuild agents that can reason and act autonomously.', 30, 1),
        (c.id, 'Tool Use & Function Calling', E'## Tool Use & Function Calling\n\nEquip agents with external capabilities.\n\n- Defining tool schemas\n- Dynamic tool selection\n- Error handling and retries\n\nGive your agents powerful capabilities.', 30, 2),
        (c.id, 'Multi-Agent Systems', E'## Multi-Agent Systems\n\nOrchestrate multiple agents to solve complex tasks.\n\n- Agent communication protocols\n- Task decomposition and delegation\n- Consensus and aggregation\n\nSolve complex problems through collaboration.', 35, 3),
        (c.id, 'Agent Memory & Planning', E'## Agent Memory & Planning\n\nImplement sophisticated memory and planning systems.\n\n- Short-term vs long-term memory\n- ReAct and Plan-and-Solve patterns\n- Reflection and self-correction\n\nBuild agents that learn and adapt.', 35, 4);
    
    ELSIF c.title = 'Full-Stack' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Project Architecture & Planning', E'## Project Architecture & Planning\n\nDesign scalable full-stack applications.\n\n- Monorepo vs polyrepo\n- API design patterns\n- Database schema design\n\nPlan before you code.', 20, 1),
        (c.id, 'Full-Stack Authentication', E'## Full-Stack Authentication\n\nImplement end-to-end authentication.\n\n- JWT with refresh tokens\n- Social login (Google, GitHub)\n- Protected routes and middleware\n\nSeamless auth across the stack.', 25, 2),
        (c.id, 'CRUD with Real-time Updates', E'## CRUD with Real-time Updates\n\nBuild reactive applications with live data.\n\n- REST endpoints for CRUD\n- WebSocket and Server-Sent Events\n- Optimistic UI updates\n\nReal-time features users expect.', 30, 3),
        (c.id, 'Deployment & DevOps', E'## Deployment & DevOps\n\nShip your application to production.\n\n- CI/CD pipelines\n- Containerization with Docker\n- Cloud deployment (Vercel, Railway, AWS)\n\nFrom development to production with confidence.', 25, 4);
    
    ELSIF c.title = 'Generative UI/UX' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'AI-Powered Design Tools', E'## AI-Powered Design Tools\n\nLeverage AI in your design workflow.\n\n- Generative fill and image creation\n- AI layout suggestions\n- Design system automation\n\nExplore tools like Galileo AI, Visily, and Uizard for rapid prototyping.', 20, 1),
        (c.id, 'Rapid Prototyping with AI', E'## Rapid Prototyping with AI\n\nCreate interactive prototypes in minutes.\n\n- Text-to-design generation\n- Style transfer and theming\n- Design-to-code workflows\n\nUse AI to go from concept to clickable prototype.', 25, 2),
        (c.id, 'Designing for AI Products', E'## Designing for AI Products\n\nUX patterns specific to AI-powered applications.\n\n- Handling uncertainty and confidence\n- Progressive disclosure of AI capabilities\n- Feedback loops and iteration\n\nDesign interfaces that make AI interactions intuitive.', 25, 3),
        (c.id, 'Design Systems & Component Libraries', E'## Design Systems & Component Libraries\n\nBuild scalable design systems with AI assistance.\n\n- Token-based theming\n- Component documentation\n- Accessibility-first design\n\nCreate cohesive, maintainable design systems.', 25, 4);
    
    ELSIF c.title = 'AI Fluency' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'What is AI?', E'## What is AI?\n\nArtificial Intelligence (AI) refers to machines that can perform tasks that typically require human intelligence.\n\n- Narrow AI: Specialized for specific tasks\n- General AI: Hypothetical human-level intelligence\n- Superintelligence: Beyond human capability (theoretical)\n\nToday, we primarily work with Narrow AI systems.', 15, 1),
        (c.id, 'Types of Machine Learning', E'## Types of Machine Learning\n\nUnderstand the three main paradigms of machine learning.\n\n- Supervised Learning: Learning from labeled data\n- Unsupervised Learning: Finding patterns in unlabeled data\n- Reinforcement Learning: Learning through trial and error\n\nEach approach solves different types of problems.', 15, 2),
        (c.id, 'AI in the Real World', E'## AI in the Real World\n\nExplore practical applications of AI across industries.\n\n- Healthcare: Diagnosis and drug discovery\n- Finance: Fraud detection and algorithmic trading\n- Education: Personalized learning paths\n\nAI is transforming every industry.', 15, 3);
    
    ELSIF c.title = 'Prompt Engineering' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Anatomy of a Good Prompt', E'## Anatomy of a Good Prompt\n\nLearn the components of effective prompts.\n\n- Role: Define who the AI should be\n- Context: Provide necessary background\n- Task: Clearly state what you want\n- Format: Specify output structure\n\nStructure your prompts for the best results.', 15, 1),
        (c.id, 'Zero-shot & Few-shot Prompting', E'## Zero-shot & Few-shot Prompting\n\nMaster different prompting strategies.\n\n- Zero-shot: Ask directly without examples\n- Few-shot: Provide examples to guide the model\n- Chain-of-thought: Show reasoning steps\n\nChoose the right approach for your task.', 15, 2),
        (c.id, 'Advanced Prompt Patterns', E'## Advanced Prompt Patterns\n\nExplore sophisticated prompting techniques.\n\n- Tree-of-Thought: Explore multiple reasoning paths\n- ReAct: Reason + Act cycles\n- Self-Consistency: Sample multiple outputs and vote\n\nCombine patterns to tackle complex problems reliably.', 15, 3);
    
    ELSIF c.title = 'AI-Assisted Coding' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Setting Up AI Coding Assistants', E'## Setting Up AI Coding Assistants\n\nConfigure your development environment for AI assistance.\n\n- GitHub Copilot setup\n- Cursor, Windsurf, and other AI editors\n- API keys and configuration\n\nGet your tools ready before you start coding.', 15, 1),
        (c.id, 'Code Generation with AI', E'## Code Generation with AI\n\nGenerate code efficiently using AI.\n\n- Writing functions from descriptions\n- Converting between languages\n- Generating test cases\n\nSpeed up development with AI-generated code.', 15, 2),
        (c.id, 'Debugging & Refactoring with AI', E'## Debugging & Refactoring with AI\n\nUse AI to improve existing code.\n\n- Explain complex code\n- Identify bugs and suggest fixes\n- Refactor for performance and readability\n\nTurn AI into your pair programming partner.', 15, 3);
    
    ELSIF c.title = 'Introduction to LLMs' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'What are Large Language Models?', E'## What are Large Language Models?\n\nLLMs are neural networks trained on massive text datasets.\n\n- Trained on trillions of tokens\n- Learn patterns, grammar, and knowledge\n- Generate human-like text\n\nModels like GPT-4, Claude, and Llama are examples of LLMs.', 15, 1),
        (c.id, 'How LLMs Process Text', E'## How LLMs Process Text\n\nUnderstand tokenization and inference.\n\n- Tokenization: Converting text to numbers\n- Embeddings: Semantic vector representations\n- Attention: Understanding context\n\nLLMs do not read text, they process tokens.', 15, 2),
        (c.id, 'Capabilities & Limitations', E'## Capabilities & Limitations\n\nUnderstand what LLMs can and cannot do.\n\nCapabilities: Text generation, summarization, translation, coding.\nLimitations: Hallucinations, limited context windows, no true understanding.\n\nUse LLMs wisely by understanding their boundaries.', 15, 3);
    
    ELSIF c.title = 'AI Safety & Responsible AI' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'AI Ethics & Bias', E'## AI Ethics & Bias\n\nUnderstand ethical challenges in AI.\n\n- Sources of bias in training data\n- Fairness metrics and evaluation\n- Mitigation strategies\n\nRecognizing and addressing bias is every AI practitioner responsibility.', 15, 1),
        (c.id, 'Alignment & Control', E'## Alignment & Control\n\nEnsure AI systems act in accordance with human values.\n\n- Reward modeling and RLHF\n- Constitutional AI\n- Oversight and monitoring\n\nAlignment research aims to build AI that reliably does what we want.', 15, 2),
        (c.id, 'Responsible AI Development', E'## Responsible AI Development\n\nBest practices for building AI responsibly.\n\n- Transparency and explainability\n- Privacy and data governance\n- Red-teaming and safety testing\n\nBuild AI systems that are safe, fair, and trustworthy.', 15, 3);
    
    ELSIF c.title = 'Claude Fundamentals' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Getting Started with Claude', E'## Getting Started with Claude\n\nLearn the basics of interacting with Claude.\n\n- Account setup and interface\n- Claude Pro vs Free tier\n- Projects and custom instructions\n\nStart your Claude journey with the right setup.', 15, 1),
        (c.id, 'Claude for Writing & Analysis', E'## Claude for Writing & Analysis\n\nUse Claude for content creation and research.\n\n- Long-form writing with artifacts\n- Document analysis (PDF, images)\n- Research and summarization\n\nLeverage Claude 200K context window for deep analysis.', 15, 2),
        (c.id, 'Claude for Code & Technical Tasks', E'## Claude for Code & Technical Tasks\n\nClaude excels at programming tasks.\n\n- Code generation and debugging\n- Architecture review\n- Technical documentation\n\nUse Claude code capabilities to accelerate development.', 15, 3);
    
    ELSIF c.title = 'AI Collaboration Techniques' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Working with AI as a Teammate', E'## Working with AI as a Teammate\n\nTreat AI as a collaborative partner, not a tool.\n\n- Defining roles and responsibilities\n- Iterative refinement cycles\n- Reviewing and validating AI output\n\nThe best results come from human-AI collaboration.', 15, 1),
        (c.id, 'Task Decomposition with AI', E'## Task Decomposition with AI\n\nBreak complex tasks into manageable pieces with AI.\n\n- Top-down task breakdown\n- Assigning subtasks to AI\n- Combining AI outputs\n\nUse AI to help plan and execute complex projects.', 15, 2),
        (c.id, 'AI-Assisted Decision Making', E'## AI-Assisted Decision Making\n\nUse AI to augment your decision-making process.\n\n- Generating and evaluating options\n- SWOT analysis with AI\n- Risk assessment\n\nAI provides insights, you provide judgment.', 15, 3);
    
    ELSIF c.title = 'Git & GitHub Fundamentals' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Version Control with Git', E'## Version Control with Git\n\nUnderstand the core concepts of version control.\n\n- Repositories and commits\n- Branching and merging\n- Staging area and .gitignore\n\nTrack changes and collaborate effectively.', 15, 1),
        (c.id, 'Collaboration with GitHub', E'## Collaboration with GitHub\n\nUse GitHub for team collaboration.\n\n- Pull requests and code review\n- Issues and project boards\n- GitHub Actions for CI/CD\n\nCollaborate like a professional team.', 15, 2),
        (c.id, 'Git Workflows & Best Practices', E'## Git Workflows & Best Practices\n\nAdopt proven Git workflows.\n\n- Git Flow vs GitHub Flow\n- Conventional commits\n- Rebasing and conflict resolution\n\nMaintain a clean and productive Git history.', 15, 3);
    
    ELSIF c.title = 'Linux & Command Line Basics' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Navigating the Filesystem', E'## Navigating the Filesystem\n\nMaster basic Linux command line operations.\n\n- ls, cd, pwd, mkdir, rm\n- File permissions and ownership\n- Paths: absolute vs relative\n\nNavigate the filesystem with confidence.', 15, 1),
        (c.id, 'Working with Files & Text', E'## Working with Files & Text\n\nProcess text files using command line tools.\n\n- grep, sed, awk for text processing\n- cat, less, tail, head\n- Redirection and pipes\n\nBecome efficient with text processing.', 15, 2),
        (c.id, 'Shell Scripting Basics', E'## Shell Scripting Basics\n\nAutomate tasks with shell scripts.\n\n- Variables, conditionals, loops\n- Functions and error handling\n- Cron jobs and automation\n\nAutomate repetitive tasks.', 15, 3);
    
    ELSIF c.title = 'API Fundamentals' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'What is an API?', E'## What is an API?\n\nUnderstand the basics of Application Programming Interfaces.\n\n- Client-server architecture\n- Request-response cycle\n- HTTP methods: GET, POST, PUT, DELETE\n\nAPIs are the backbone of modern software.', 15, 1),
        (c.id, 'REST API Design Principles', E'## REST API Design Principles\n\nLearn RESTful API design.\n\n- Resource-oriented design\n- Stateless operations\n- Standard status codes\n\nDesign clean, intuitive APIs that follow industry conventions.', 15, 2),
        (c.id, 'Consuming APIs', E'## Consuming APIs\n\nLearn how to interact with APIs from your code.\n\n- Fetch API and Axios\n- Authentication headers\n- Error handling and rate limits\n\nIntegrate third-party APIs into your applications.', 15, 3);
    
    ELSIF c.title = 'Database Fundamentals' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Relational Database Concepts', E'## Relational Database Concepts\n\nUnderstand the fundamentals of relational databases.\n\n- Tables, rows, and columns\n- Primary keys and foreign keys\n- Relationships: one-to-one, one-to-many, many-to-many\n\nDatabases provide structured, persistent storage for applications.', 15, 1),
        (c.id, 'SQL: Querying Data', E'## SQL: Querying Data\n\nWrite SQL queries to retrieve and manipulate data.\n\n- SELECT, WHERE, JOIN, GROUP BY\n- Aggregate functions: COUNT, SUM, AVG\n- Subqueries and CTEs\n\nExtract insights from your data.', 20, 2),
        (c.id, 'Database Design & Normalization', E'## Database Design & Normalization\n\nDesign efficient database schemas.\n\n- Normal forms (1NF, 2NF, 3NF)\n- Indexing strategies\n- Migration management\n\nWell-designed databases are fast, maintainable, and scalable.', 20, 3);
    
    ELSIF c.title = 'Software Engineering Fundamentals' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'The Software Development Lifecycle', E'## The Software Development Lifecycle\n\nUnderstand how software is built from idea to deployment.\n\n- Requirements gathering\n- Design and architecture\n- Implementation and testing\n- Deployment and maintenance\n\nFollow industry-standard development processes.', 20, 1),
        (c.id, 'Clean Code Principles', E'## Clean Code Principles\n\nWrite code that humans can read and maintain.\n\n- Meaningful names and comments\n- Single responsibility principle\n- DRY (Do not Repeat Yourself)\n\nCode is read far more often than it is written.', 20, 2),
        (c.id, 'Testing & Quality Assurance', E'## Testing & Quality Assurance\n\nEnsure your software works correctly.\n\n- Unit testing with Jest/Vitest\n- Integration testing\n- Test-driven development (TDD)\n\nShip with confidence.', 20, 3);
    
    ELSIF c.title = 'Cloud Computing Fundamentals' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Cloud Service Models', E'## Cloud Service Models\n\nUnderstand IaaS, PaaS, and SaaS.\n\n- IaaS: Virtual machines, storage, networking\n- PaaS: Managed runtime platforms\n- SaaS: Ready-to-use applications\n\nChoose the right service model for your needs.', 20, 1),
        (c.id, 'Major Cloud Providers', E'## Major Cloud Providers\n\nCompare AWS, Azure, and GCP.\n\n- Core services offered by each\n- Pricing models and free tiers\n- Regional availability\n\nEach provider has unique strengths and offerings.', 15, 2),
        (c.id, 'Deploying Applications to the Cloud', E'## Deploying Applications to the Cloud\n\nLearn practical deployment strategies.\n\n- Containerization with Docker\n- Serverless functions\n- Managed databases\n\nDeploy and scale applications with cloud infrastructure.', 20, 3);
    
    ELSIF c.title = 'AI Productivity & Automation' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'AI Tools for Daily Productivity', E'## AI Tools for Daily Productivity\n\nDiscover AI tools that boost everyday productivity.\n\n- AI writing assistants (Claude, ChatGPT)\n- Meeting summarizers (Otter.ai, Fireflies)\n- Email and calendar assistants\n\nIntegrate AI into your daily workflow.', 15, 1),
        (c.id, 'Automating Workflows with AI', E'## Automating Workflows with AI\n\nBuild automated workflows using AI.\n\n- Zapier and Make AI integrations\n- Custom automation scripts\n- AI-powered data processing\n\nEliminate repetitive tasks with automated workflows.', 20, 2),
        (c.id, 'Building AI-Powered Productivity Systems', E'## Building AI-Powered Productivity Systems\n\nCreate comprehensive productivity systems.\n\n- Personal knowledge management\n- AI-powered research systems\n- Automated reporting and dashboards\n\nDesign systems that multiply your effectiveness.', 20, 3);
    
    ELSIF c.title = 'Cybersecurity Fundamentals' THEN
      INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) VALUES
        (c.id, 'Security Fundamentals', E'## Security Fundamentals\n\nUnderstand core cybersecurity concepts.\n\n- CIA triad: Confidentiality, Integrity, Availability\n- Threat modeling and risk assessment\n- Attack vectors and surface analysis\n\nSecurity is everyone responsibility.', 20, 1),
        (c.id, 'Authentication & Access Control', E'## Authentication & Access Control\n\nImplement secure access management.\n\n- Password policies and hashing\n- Multi-factor authentication\n- Principle of least privilege\n\nKeep unauthorized users out.', 15, 2),
        (c.id, 'Secure Coding Practices', E'## Secure Coding Practices\n\nWrite code that resists attacks.\n\n- SQL injection prevention\n- XSS and CSRF protection\n- Input validation and sanitization\n\nBuild security into your code from day one.', 20, 3);
    
    END IF;
  END LOOP;
END $$ LANGUAGE plpgsql;
