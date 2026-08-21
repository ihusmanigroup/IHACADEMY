-- Intern applications — Winter shape alignment
--
-- The live database predates the Winter Internship schema: `intern_applications`
-- was created by scripts/create_intern_table.js (old Summer-era shape) and is
-- missing the fields and constraints the Winter application flow and seeds rely
-- on. This migration brings the existing table in line with the Winter schema
-- without touching any other module:
--   * `cohort` column (added by the client form + 20260804010000)
--   * unique email index (required by seed ON CONFLICT (email) upserts)
--   * legacy policy cleanup (the Winter migration installs its own policies)

alter table public.intern_applications
  add column if not exists cohort text;

update public.intern_applications
  set cohort = 'paid'
  where cohort is null;

create unique index if not exists intern_applications_email_key
  on public.intern_applications (email);

drop policy if exists "Allow public inserts" on public.intern_applications;
drop policy if exists "Allow public select" on public.intern_applications;
