-- Linkedin submissions — one row per applicant so the Admin Console shows a
-- clean review list and the client can upsert with onConflict('email').
create unique index if not exists linkedin_submissions_email_key
  on public.linkedin_submissions (lower(email));