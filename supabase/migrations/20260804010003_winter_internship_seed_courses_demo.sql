-- Winter Internship 2026-27 — Course requirements, catalog linking and demo interns
--
-- Week 1 carries two required free courses; Weeks 2-4 carry one each (25 records
-- across the five tracks). course_slug/course_title are the requirement titles
-- from the track PDFs. catalog_course_id links to an existing free course in
-- public.courses when a real match exists (the general catalog is never
-- modified here).

insert into public.course_requirements
  (id, week_id, course_slug, course_title, required, "order")
values
  -- Frontend Engineering
  ('frontend-engineering-w1-c1', 'frontend-engineering-w1', 'git-github-beginners', 'Git & GitHub for Beginners', true, 1),
  ('frontend-engineering-w1-c2', 'frontend-engineering-w1', 'html-css-basics', 'HTML & CSS Basics', true, 2),
  ('frontend-engineering-w2-c1', 'frontend-engineering-w2', 'modern-javascript-essentials', 'Modern JavaScript Essentials', true, 1),
  ('frontend-engineering-w3-c1', 'frontend-engineering-w3', 'react-js-modern-web-apps', 'React.js & Modern Web Apps', true, 1),
  ('frontend-engineering-w4-c1', 'frontend-engineering-w4', 'frontend-deployment-quality', 'Frontend Deployment & Quality', true, 1),

  -- Backend Engineering
  ('backend-engineering-w1-c1', 'backend-engineering-w1', 'git-github-beginners', 'Git & GitHub for Beginners', true, 1),
  ('backend-engineering-w1-c2', 'backend-engineering-w1', 'node-backend-architecture', 'Node.js & Backend Architecture', true, 2),
  ('backend-engineering-w2-c1', 'backend-engineering-w2', 'databases-rest-apis', 'Databases & REST APIs', true, 1),
  ('backend-engineering-w3-c1', 'backend-engineering-w3', 'auth-api-security', 'Authentication & API Security', true, 1),
  ('backend-engineering-w4-c1', 'backend-engineering-w4', 'testing-docs-deployment', 'Testing, Documentation & Deployment', true, 1),

  -- Full Stack Software Engineering
  ('full-stack-engineering-w1-c1', 'full-stack-engineering-w1', 'git-github-beginners', 'Git & GitHub for Beginners', true, 1),
  ('full-stack-engineering-w1-c2', 'full-stack-engineering-w1', 'web-development-foundations', 'Web Development Foundations', true, 2),
  ('full-stack-engineering-w2-c1', 'full-stack-engineering-w2', 'react-js-modern-web-apps', 'React.js & Modern Web Apps', true, 1),
  ('full-stack-engineering-w3-c1', 'full-stack-engineering-w3', 'node-express-mongodb', 'Node.js, Express & MongoDB', true, 1),
  ('full-stack-engineering-w4-c1', 'full-stack-engineering-w4', 'full-stack-deployment-security', 'Full-Stack Deployment & Security', true, 1),

  -- Machine Learning
  ('machine-learning-w1-c1', 'machine-learning-w1', 'git-github-beginners', 'Git & GitHub for Beginners', true, 1),
  ('machine-learning-w1-c2', 'machine-learning-w1', 'python-for-data-analysis', 'Python for Data Analysis', true, 2),
  ('machine-learning-w2-c1', 'machine-learning-w2', 'machine-learning-fundamentals', 'Machine Learning Fundamentals', true, 1),
  ('machine-learning-w3-c1', 'machine-learning-w3', 'feature-engineering-model-evaluation', 'Feature Engineering & Model Evaluation', true, 1),
  ('machine-learning-w4-c1', 'machine-learning-w4', 'ml-deployment-fastapi', 'ML Deployment with FastAPI', true, 1),

  -- Agentic AI Engineering
  ('agentic-ai-engineering-w1-c1', 'agentic-ai-engineering-w1', 'git-github-beginners', 'Git & GitHub for Beginners', true, 1),
  ('agentic-ai-engineering-w1-c2', 'agentic-ai-engineering-w1', 'ai-fluency-prompt-engineering', 'AI Fluency & Prompt Engineering', true, 2),
  ('agentic-ai-engineering-w2-c1', 'agentic-ai-engineering-w2', 'llm-apis-structured-outputs', 'LLM APIs & Structured Outputs', true, 1),
  ('agentic-ai-engineering-w3-c1', 'agentic-ai-engineering-w3', 'rag-embeddings-vector-search', 'RAG, Embeddings & Vector Search', true, 1),
  ('agentic-ai-engineering-w4-c1', 'agentic-ai-engineering-w4', 'agentic-workflows-evaluation', 'Agentic Workflows & Evaluation', true, 1)
on conflict (id) do nothing;

-- Link requirement rows to existing free courses in the catalog where a real
-- match exists (by PDF requirement slug -> catalog course title). The general
-- catalog is never modified here.
update public.course_requirements
  set catalog_course_id = (select id from public.courses where title = 'Git & GitHub Fundamentals')
  where course_slug = 'git-github-beginners' and catalog_course_id is null;

update public.course_requirements
  set catalog_course_id = (select id from public.courses where title = 'AI Fluency')
  where course_slug = 'ai-fluency-prompt-engineering' and catalog_course_id is null;

update public.course_requirements
  set catalog_course_id = (select id from public.courses where title = 'Database Fundamentals')
  where course_slug = 'databases-rest-apis' and catalog_course_id is null;

update public.course_requirements
  set catalog_course_id = (select id from public.courses where title = 'API Fundamentals')
  where course_slug = 'auth-api-security' and catalog_course_id is null;

-- ---------------------------------------------------------------------------
-- Demo interns (one per track so every track is testable in isolation)
-- ---------------------------------------------------------------------------
insert into public.intern_applications
  (full_name, email, password, status, track, cohort)
values
  ('Intern User', 'intern@ih.com', 'password123', 'approved', 'frontend-engineering', 'winter'),
  ('Demo Frontend Intern', 'demo.frontend@ih.com', 'password123', 'approved', 'frontend-engineering', 'winter'),
  ('Demo Backend Intern', 'demo.backend@ih.com', 'password123', 'approved', 'backend-engineering', 'winter'),
  ('Demo Full Stack Intern', 'demo.fullstack@ih.com', 'password123', 'approved', 'full-stack-engineering', 'winter'),
  ('Demo Machine Learning Intern', 'demo.ml@ih.com', 'password123', 'approved', 'machine-learning', 'winter'),
  ('Demo Agentic AI Intern', 'demo.agentic@ih.com', 'password123', 'approved', 'agentic-ai-engineering', 'winter')
on conflict (email) do nothing;

-- Approve any pre-existing rows with these emails so orphan sessions keep working.
update public.intern_applications
  set status = 'approved', cohort = 'winter', track = v.track
from (values
  ('intern@ih.com', 'frontend-engineering'),
  ('demo.frontend@ih.com', 'frontend-engineering'),
  ('demo.backend@ih.com', 'backend-engineering'),
  ('demo.fullstack@ih.com', 'full-stack-engineering'),
  ('demo.ml@ih.com', 'machine-learning'),
  ('demo.agentic@ih.com', 'agentic-ai-engineering')
) as v(email, track)
where public.intern_applications.email = v.email
  and public.intern_applications.status <> 'approved';

-- Enroll every demo intern into the Winter season (idempotent).
insert into public.internship_enrollments
  (application_id, season_id, track_id, status, current_week)
select a.id, 'winter-2026-27', e.id, 'active', 1
from public.intern_applications a
join public.internship_tracks e on e.slug = a.track and e.season_id = 'winter-2026-27'
where a.email in (
  'intern@ih.com', 'demo.frontend@ih.com', 'demo.backend@ih.com',
  'demo.fullstack@ih.com', 'demo.ml@ih.com', 'demo.agentic@ih.com'
)
on conflict (application_id, season_id) do nothing;

-- ---------------------------------------------------------------------------
-- Winter admin settings (token used to gate admin RPCs)
-- ---------------------------------------------------------------------------
create table if not exists public.winter_settings (
  key text primary key,
  value text not null default ''
);

insert into public.winter_settings (key, value)
values ('admin_api_key', 'ih-winter-admin-2027')
on conflict (key) do update set value = public.winter_settings.value;