-- Winter Internship 2026-27 — Idempotent seed
-- Source of truth: the five track specification PDFs (Frontend Engineering,
-- Backend Engineering, Full Stack Software Engineering, Machine Learning,
-- Agentic AI Engineering). Running this file twice must not duplicate rows:
-- every insert uses ON CONFLICT DO NOTHING with stable, slug-based primary
-- keys. Dates live on the single season row and are admin-configurable there.

-- ---------------------------------------------------------------------------
-- Season
-- ---------------------------------------------------------------------------
insert into public.internship_seasons
  (id, name, slug, type, year, application_open_at, application_close_at,
   program_start_at, program_end_at, status, is_active)
values
  ('winter-2026-27', 'Winter Internship 2026-27', 'winter-2026-27', 'winter', 2026,
   '2026-11-01T00:00:00Z', '2026-11-20T23:59:59Z',
   '2026-12-01T00:00:00Z', '2026-12-28T23:59:59Z', 'open', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Tracks
-- ---------------------------------------------------------------------------
insert into public.internship_tracks
  (id, season_id, name, slug, description, icon, "order", is_active)
values
  ('frontend-engineering', 'winter-2026-27', 'Frontend Engineering', 'frontend-engineering',
   'Responsive interfaces, React fundamentals, API integration, state management, accessibility and production deployment.',
   'LayoutTemplate', 1, true),
  ('backend-engineering', 'winter-2026-27', 'Backend Engineering', 'backend-engineering',
   'Node.js, Express, databases, authentication, API design, security, testing, documentation and deployment.',
   'Server', 2, true),
  ('full-stack-engineering', 'winter-2026-27', 'Full Stack Software Engineering', 'full-stack-engineering',
   'React, Node.js, database integration, authentication, end-to-end product flows, testing and deployment.',
   'Layers', 3, true),
  ('machine-learning', 'winter-2026-27', 'Machine Learning', 'machine-learning',
   'Data preparation, EDA, supervised learning, evaluation, feature engineering, deployment and reproducibility.',
   'BrainCircuit', 4, true),
  ('agentic-ai-engineering', 'winter-2026-27', 'Agentic AI Engineering', 'agentic-ai-engineering',
   'LLM applications, structured outputs, tools, memory, RAG, evaluation, safety and production agent workflows.',
   'Bot', 5, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Weeks (identical four-week structure for every track)
-- ---------------------------------------------------------------------------
insert into public.internship_weeks
  (id, track_id, week_number, title, description, unlock_rule, "order")
values
  ('frontend-engineering-w1', 'frontend-engineering', 1, 'Foundation & Workflow',
   'Complete every assignment and the required free course proof. Week 2 remains locked until mentor approval.',
   'Unlocked immediately after enrollment.', 1),
  ('frontend-engineering-w2', 'frontend-engineering', 2, 'Applied Development',
   'Complete every assignment and the required free course proof. Week 3 remains locked until mentor approval.',
   'Unlocks when all four assignments and both required course proofs in Week 1 are Approved by a mentor.', 2),
  ('frontend-engineering-w3', 'frontend-engineering', 3, 'Integration & Quality',
   'Complete every assignment and the required free course proof. Week 4 remains locked until mentor approval.',
   'Unlocks when all four assignments and the required course proof in Week 2 are Approved by a mentor.', 3),
  ('frontend-engineering-w4', 'frontend-engineering', 4, 'Production Challenge',
   'Complete every assignment and the required free course proof. The final completion review remains locked until mentor approval.',
   'Unlocks when all four assignments and the required course proof in Week 3 are Approved by a mentor.', 4),

  ('backend-engineering-w1', 'backend-engineering', 1, 'Foundation & Workflow',
   'Complete every assignment and the required free course proof. Week 2 remains locked until mentor approval.',
   'Unlocked immediately after enrollment.', 1),
  ('backend-engineering-w2', 'backend-engineering', 2, 'Applied Development',
   'Complete every assignment and the required free course proof. Week 3 remains locked until mentor approval.',
   'Unlocks when all four assignments and both required course proofs in Week 1 are Approved by a mentor.', 2),
  ('backend-engineering-w3', 'backend-engineering', 3, 'Integration & Quality',
   'Complete every assignment and the required free course proof. Week 4 remains locked until mentor approval.',
   'Unlocks when all four assignments and the required course proof in Week 2 are Approved by a mentor.', 3),
  ('backend-engineering-w4', 'backend-engineering', 4, 'Production Challenge',
   'Complete every assignment and the required free course proof. The final completion review remains locked until mentor approval.',
   'Unlocks when all four assignments and the required course proof in Week 3 are Approved by a mentor.', 4),

  ('full-stack-engineering-w1', 'full-stack-engineering', 1, 'Foundation & Workflow',
   'Complete every assignment and the required free course proof. Week 2 remains locked until mentor approval.',
   'Unlocked immediately after enrollment.', 1),
  ('full-stack-engineering-w2', 'full-stack-engineering', 2, 'Applied Development',
   'Complete every assignment and the required free course proof. Week 3 remains locked until mentor approval.',
   'Unlocks when all four assignments and both required course proofs in Week 1 are Approved by a mentor.', 2),
  ('full-stack-engineering-w3', 'full-stack-engineering', 3, 'Integration & Quality',
   'Complete every assignment and the required free course proof. Week 4 remains locked until mentor approval.',
   'Unlocks when all four assignments and the required course proof in Week 2 are Approved by a mentor.', 3),
  ('full-stack-engineering-w4', 'full-stack-engineering', 4, 'Production Challenge',
   'Complete every assignment and the required free course proof. The final completion review remains locked until mentor approval.',
   'Unlocks when all four assignments and the required course proof in Week 3 are Approved by a mentor.', 4),

  ('machine-learning-w1', 'machine-learning', 1, 'Foundation & Workflow',
   'Complete every assignment and the required free course proof. Week 2 remains locked until mentor approval.',
   'Unlocked immediately after enrollment.', 1),
  ('machine-learning-w2', 'machine-learning', 2, 'Applied Development',
   'Complete every assignment and the required free course proof. Week 3 remains locked until mentor approval.',
   'Unlocks when all four assignments and both required course proofs in Week 1 are Approved by a mentor.', 2),
  ('machine-learning-w3', 'machine-learning', 3, 'Integration & Quality',
   'Complete every assignment and the required free course proof. Week 4 remains locked until mentor approval.',
   'Unlocks when all four assignments and the required course proof in Week 2 are Approved by a mentor.', 3),
  ('machine-learning-w4', 'machine-learning', 4, 'Production Challenge',
   'Complete every assignment and the required free course proof. The final completion review remains locked until mentor approval.',
   'Unlocks when all four assignments and the required course proof in Week 3 are Approved by a mentor.', 4),

  ('agentic-ai-engineering-w1', 'agentic-ai-engineering', 1, 'Foundation & Workflow',
   'Complete every assignment and the required free course proof. Week 2 remains locked until mentor approval.',
   'Unlocked immediately after enrollment.', 1),
  ('agentic-ai-engineering-w2', 'agentic-ai-engineering', 2, 'Applied Development',
   'Complete every assignment and the required free course proof. Week 3 remains locked until mentor approval.',
   'Unlocks when all four assignments and both required course proofs in Week 1 are Approved by a mentor.', 2),
  ('agentic-ai-engineering-w3', 'agentic-ai-engineering', 3, 'Integration & Quality',
   'Complete every assignment and the required free course proof. Week 4 remains locked until mentor approval.',
   'Unlocks when all four assignments and the required course proof in Week 2 are Approved by a mentor.', 3),
  ('agentic-ai-engineering-w4', 'agentic-ai-engineering', 4, 'Production Challenge',
   'Complete every assignment and the required free course proof. The final completion review remains locked until mentor approval.',
   'Unlocks when all four assignments and the required course proof in Week 3 are Approved by a mentor.', 4)
on conflict (id) do nothing;
