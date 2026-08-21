-- Add internship cohort/season field to intern_applications.
-- Values: 'winter' | 'summer' | 'paid'
alter table if exists public.intern_applications
  add column if not exists cohort text;

-- Back-fill any existing rows that predate the field.
update public.intern_applications
  set cohort = 'paid'
  where cohort is null;
