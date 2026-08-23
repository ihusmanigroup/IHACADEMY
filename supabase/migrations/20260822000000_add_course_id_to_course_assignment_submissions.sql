-- Ensure course_assignment_submissions.course_id exists in the live database.
-- Some deployments created the table before course_id was added, so we
-- ALTER (not CREATE) to safely backfill the column on existing tables.
alter table if exists public.course_assignment_submissions
  add column if not exists course_id uuid;

-- Link to the courses table when present (non-blocking if fk absent).
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'course_assignment_submissions_course_id_fkey'
      and table_name = 'course_assignment_submissions'
  ) then
    alter table public.course_assignment_submissions
      add constraint course_assignment_submissions_course_id_fkey
      foreign key (course_id) references public.courses(id) on delete set null;
  end if;
exception when others then
  -- fk target may differ; leave the column without the constraint
  null;
end $$;

create index if not exists idx_course_assignment_submissions_course_id
  on public.course_assignment_submissions(course_id);
