-- Winter Internship 2026-27 — Schema
-- Replaces the old 8-week/summer assignment implementation.
--
-- Catalog tables (internship_seasons, internship_tracks, internship_weeks,
-- internship_assignments, course_requirements) are public curriculum:
-- SELECT for everyone, writes only via migration/seed.
--
-- User tables (internship_enrollments, assignment_submissions, course_proofs)
-- have RLS enabled with NO direct policies: the REST API is denied; every read
-- and write goes through SECURITY DEFINER functions in
-- 20260804010002_winter_internship_rpc.sql that enforce ownership, track
-- isolation and approval-based week unlocking server-side.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Intern identity table.
-- Mirrors the shape the application already uses (login + apply modal). The
-- live project created this table via the dashboard; on fresh stacks this
-- migration creates it so the seed below can reference it.
-- ---------------------------------------------------------------------------
create table if not exists public.intern_applications (
  id uuid default gen_random_uuid() primary key,
  full_name text not null default '',
  email text not null unique,
  password text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  track text,
  cohort text,
  created_at timestamptz not null default now()
);

alter table public.intern_applications enable row level security;

drop policy if exists "intern_applications_public_read" on public.intern_applications;
create policy "intern_applications_public_read"
  on public.intern_applications for select using (true);

drop policy if exists "intern_applications_public_insert" on public.intern_applications;
create policy "intern_applications_public_insert"
  on public.intern_applications for insert with check (true);

drop policy if exists "intern_applications_public_update" on public.intern_applications;
create policy "intern_applications_public_update"
  on public.intern_applications for update using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Internship seasons
-- ---------------------------------------------------------------------------
create table if not exists public.internship_seasons (
  id text primary key,
  name text not null,
  slug text not null unique,
  type text not null default 'winter' check (type in ('winter', 'summer', 'paid')),
  year int not null,
  application_open_at timestamptz not null,
  application_close_at timestamptz not null,
  program_start_at timestamptz not null,
  program_end_at timestamptz not null,
  status text not null default 'open' check (status in ('draft', 'open', 'closed')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.internship_seasons enable row level security;

drop policy if exists "internship_seasons_public_select" on public.internship_seasons;
create policy "internship_seasons_public_select"
  on public.internship_seasons for select using (true);

-- ---------------------------------------------------------------------------
-- Internship tracks (exactly five for Winter 2026-27)
-- ---------------------------------------------------------------------------
create table if not exists public.internship_tracks (
  id text primary key,
  season_id text not null references public.internship_seasons(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  icon text,
  "order" int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (season_id, slug)
);

alter table public.internship_tracks enable row level security;

drop policy if exists "internship_tracks_public_select" on public.internship_tracks;
create policy "internship_tracks_public_select"
  on public.internship_tracks for select using (true);

-- ---------------------------------------------------------------------------
-- Internship enrollments (one active enrollment per intern per season)
-- ---------------------------------------------------------------------------
create table if not exists public.internship_enrollments (
  id uuid default gen_random_uuid() primary key,
  application_id uuid not null references public.intern_applications(id) on delete cascade,
  season_id text not null references public.internship_seasons(id) on delete cascade,
  track_id text not null references public.internship_tracks(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'withdrawn')),
  current_week int not null default 1,
  joined_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (application_id, season_id)
);

alter table public.internship_enrollments enable row level security;

create index if not exists internship_enrollments_track_idx
  on public.internship_enrollments (track_id);

-- ---------------------------------------------------------------------------
-- Internship weeks (exactly four per track)
-- ---------------------------------------------------------------------------
create table if not exists public.internship_weeks (
  id text primary key,
  track_id text not null references public.internship_tracks(id) on delete cascade,
  week_number int not null check (week_number between 1 and 4),
  title text not null,
  description text not null default '',
  unlock_rule text not null default '',
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  unique (track_id, week_number)
);

alter table public.internship_weeks enable row level security;

drop policy if exists "internship_weeks_public_select" on public.internship_weeks;
create policy "internship_weeks_public_select"
  on public.internship_weeks for select using (true);

create index if not exists internship_weeks_track_idx
  on public.internship_weeks (track_id);

-- ---------------------------------------------------------------------------
-- Assignments (exactly four per week, sixteen per track)
-- ---------------------------------------------------------------------------
create table if not exists public.internship_assignments (
  id text primary key,
  week_id text not null references public.internship_weeks(id) on delete cascade,
  title text not null,
  slug text not null,
  difficulty text not null check (difficulty in ('Easy', 'Intermediate', 'Advanced')),
  estimated_hours numeric not null default 8,
  hours_label text not null default '',
  question text not null,
  requirements text[] not null default '{}',
  deliverables text[] not null default '{}',
  submission_mode text not null default '',
  acceptance_criteria text[] not null default '{}',
  evidence_required text not null default '',
  "order" int not null default 0,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  unique (week_id, slug)
);

alter table public.internship_assignments enable row level security;

drop policy if exists "internship_assignments_public_select" on public.internship_assignments;
create policy "internship_assignments_public_select"
  on public.internship_assignments for select using (true);

create index if not exists internship_assignments_week_idx
  on public.internship_assignments (week_id);

-- ---------------------------------------------------------------------------
-- Course requirements (Week 1: two, Weeks 2-4: one each)
-- course_slug/course_title come from the track PDFs; catalog_course_id links
-- to an existing free course in public.courses when a match exists.
-- ---------------------------------------------------------------------------
create table if not exists public.course_requirements (
  id text primary key,
  week_id text not null references public.internship_weeks(id) on delete cascade,
  course_slug text not null,
  course_title text not null,
  catalog_course_id uuid references public.courses(id) on delete set null,
  required boolean not null default true,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  unique (week_id, course_slug)
);

alter table public.course_requirements enable row level security;

drop policy if exists "course_requirements_public_select" on public.course_requirements;
create policy "course_requirements_public_select"
  on public.course_requirements for select using (true);

create index if not exists course_requirements_week_idx
  on public.course_requirements (week_id);

-- ---------------------------------------------------------------------------
-- Assignment submissions (one row per enrollment per assignment)
-- ---------------------------------------------------------------------------
create table if not exists public.assignment_submissions (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid not null references public.internship_enrollments(id) on delete cascade,
  assignment_id text not null references public.internship_assignments(id) on delete cascade,
  github_url text,
  live_url text,
  notes text,
  attachment_url text,
  attachment_name text,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'changes_requested', 'approved')),
  mentor_feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, assignment_id)
);

alter table public.assignment_submissions enable row level security;

create index if not exists assignment_submissions_enrollment_idx
  on public.assignment_submissions (enrollment_id);

-- ---------------------------------------------------------------------------
-- Course proofs (one row per enrollment per course requirement)
-- ---------------------------------------------------------------------------
create table if not exists public.course_proofs (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid not null references public.internship_enrollments(id) on delete cascade,
  course_requirement_id text not null references public.course_requirements(id) on delete cascade,
  file_url text,
  file_name text,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'changes_requested', 'approved')),
  mentor_feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, course_requirement_id)
);

alter table public.course_proofs enable row level security;

create index if not exists course_proofs_enrollment_idx
  on public.course_proofs (enrollment_id);
