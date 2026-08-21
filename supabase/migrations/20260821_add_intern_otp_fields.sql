-- Intern Portal custom OTP password reset.
-- Fully isolated from supabase.auth: the 6-digit reset code and its expiry live
-- directly on the intern_applications row and are read/written by the client
-- through the existing public RLS policy (using (true) with check (true)).
alter table if exists public.intern_applications
  add column if not exists reset_otp varchar(6),
  add column if not exists otp_expires_at timestamptz;
