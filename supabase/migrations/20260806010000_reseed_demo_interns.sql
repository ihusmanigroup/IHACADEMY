-- Re-seed demo interns AFTER the winter reset.
--
-- 20260804020000_reset_winter_internship.sql wipes every row from
-- public.intern_applications, including the demo interns seeded by
-- 20260804010003_winter_internship_seed_courses_demo.sql. That ordering leaves
-- the advertised demo account (intern@ih.com / password123) missing, so login
-- fails with "Invalid credentials". This migration runs after the reset and
-- restores the six demo interns (one per track) plus their Winter enrollments.
--
-- Idempotent: re-running never duplicates rows and always resets the demo
-- credentials/status/track.

insert into public.intern_applications
  (full_name, email, password, status, track, cohort)
values
  ('Intern User', 'intern@ih.com', 'password123', 'approved', 'frontend-engineering', 'winter'),
  ('Demo Frontend Intern', 'demo.frontend@ih.com', 'password123', 'approved', 'frontend-engineering', 'winter'),
  ('Demo Backend Intern', 'demo.backend@ih.com', 'password123', 'approved', 'backend-engineering', 'winter'),
  ('Demo Full Stack Intern', 'demo.fullstack@ih.com', 'password123', 'approved', 'full-stack-engineering', 'winter'),
  ('Demo Machine Learning Intern', 'demo.ml@ih.com', 'password123', 'approved', 'machine-learning', 'winter'),
  ('Demo Agentic AI Intern', 'demo.agentic@ih.com', 'password123', 'approved', 'agentic-ai-engineering', 'winter')
on conflict (email) do update set
  password = 'password123',
  status = 'approved',
  track = excluded.track,
  cohort = 'winter';

-- Re-enroll every demo intern into the active Winter season (idempotent).
insert into public.internship_enrollments
  (application_id, season_id, track_id, status, current_week)
select a.id, 'winter-2026-27', t.id, 'active', 1
from public.intern_applications a
join public.internship_tracks t on t.slug = a.track and t.season_id = 'winter-2026-27'
where a.email in (
  'intern@ih.com', 'demo.frontend@ih.com', 'demo.backend@ih.com',
  'demo.fullstack@ih.com', 'demo.ml@ih.com', 'demo.agentic@ih.com'
)
on conflict (application_id, season_id)
do update set track_id = excluded.track_id, status = 'active';

-- Reload the PostgREST schema cache so nothing resolves stale.
notify pgrst, 'reload schema';
