-- Seed: Premium PRO Major Tracks (Machine Learning, Agentic AI, Backend
-- Engineering, Frontend Engineering, Generative AI Engineering)
-- Fixed UUIDs mirror client/src/data/coursesData.js so enrollment FK
-- constraints resolve and catalog dedupe keeps exactly "Pro (5)".
-- price mirrors the Pro plan entry tier (pricingData.js: Pro $30) so the DB
-- row and the UI "From $30" label never disagree.

INSERT INTO public.courses (id, title, description, category, level, total_lessons, xp_reward, price, is_free)
VALUES
('00000000-0000-4000-8000-000000000001',
 'Machine Learning Engineering Major Course',
 'Complete Beginner → Advanced Applied ML: Python, NumPy, Pandas, Scikit-Learn, PyTorch. The flagship AI/ML track.',
 'AI & Data', 'Advanced', 93, 1200, 30, FALSE),
('00000000-0000-4000-8000-000000000005',
 'Agentic AI Engineering Major Course',
 'Autonomous Agents, Multi-Agent Swarms, Tool Use, LangGraph & Production AI.',
 'AI & Data', 'Advanced', 100, 1600, 30, FALSE),
('00000000-0000-4000-8000-000000000004',
 'Backend Engineering Major Course',
 'Node.js, Express, Databases, API Design, Security & Scalable Systems.',
 'Backend', 'Intermediate', 100, 1300, 30, FALSE),
('00000000-0000-4000-8000-000000000003',
 'Frontend Engineering Major Course',
 'HTML, CSS, JavaScript, React, State Management & Production UI Engineering.',
 'Frontend', 'Intermediate', 100, 1300, 30, FALSE),
('00000000-0000-4000-8000-000000000002',
 'Generative AI Engineering Major Course',
 'Transformers, Hugging Face, Prompt Engineering, LoRA Fine-Tuning, RAG & AI Agents.',
 'AI & Data', 'Advanced', 95, 1500, 30, FALSE)
ON CONFLICT (id) DO NOTHING;
