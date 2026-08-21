-- Winter Internship — development reset + dev auto-enrollment helper
--
-- Runs AFTER the Winter schema and seeds. Wipes every internship user record
-- (old Summer-era test applications, demo interns, enrollments, submissions,
-- course proofs) so development and testing start from a completely fresh
-- state: the same email can apply again, and the portal only ever shows the
-- new Winter Internship assignments.
--
-- The `winter_dev_auto_enroll` function lets a freshly approved application
-- open a portal with the Winter assignments immediately. It is gated by the
-- `winter_settings.dev_auto_enroll` flag: while the flag is 'true' dev mode
-- auto-enrolls; setting it to 'false' (or deleting the row) restores the
-- normal production flow where the portal waits for admin enrollment.
--
-- Finally the PostgREST schema cache is reloaded so the new/updated RPC
-- functions resolve immediately (fixes "Could not find the function
-- public.winter_* in the schema cache").

-- 1. Wipe all internship user data (children first, then parents).
delete from public.assignment_submissions;
delete from public.course_proofs;
delete from public.internship_enrollments;
delete from public.intern_applications;

-- 2. Dev auto-enrollment helper (SECURITY DEFINER, flag-gated).
create or replace function public.winter_dev_auto_enroll(p_application_id uuid)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_app public.intern_applications%rowtype;
  v_season_id text;
  v_flag text;
begin
  select value into v_flag from public.winter_settings where key = 'dev_auto_enroll';
  if v_flag is null or lower(v_flag) <> 'true' then
    return jsonb_build_object('ok', false, 'enrolled', false, 'reason', 'dev_auto_enroll disabled');
  end if;

  select * into v_app from public.intern_applications where id = p_application_id;
  if not found then
    return jsonb_build_object('ok', false, 'enrolled', false, 'reason', 'Application not found');
  end if;
  if v_app.status <> 'approved' then
    return jsonb_build_object('ok', false, 'enrolled', false, 'reason', 'Application not approved');
  end if;
  if not exists (
    select 1 from public.internship_tracks t
    where t.id = v_app.track and t.is_active = true
  ) then
    return jsonb_build_object('ok', false, 'enrolled', false, 'reason', 'Track not found');
  end if;

  select id into v_season_id
  from public.internship_seasons
  where type = 'winter' and is_active = true
  order by year desc
  limit 1;
  if v_season_id is null then
    return jsonb_build_object('ok', false, 'enrolled', false, 'reason', 'No active winter season');
  end if;

  insert into public.internship_enrollments (application_id, season_id, track_id, status, current_week)
  values (p_application_id, v_season_id, v_app.track, 'active', 1)
  on conflict (application_id, season_id)
  do update set track_id = excluded.track_id, status = 'active';

  return jsonb_build_object('ok', true, 'enrolled', true);
end;
$$;

-- 3. Enable the dev auto-enroll flag (set to 'false' to restore production flow).
insert into public.winter_settings (key, value)
values ('dev_auto_enroll', 'true')
on conflict (key) do update set value = 'true';

-- 4. Reload the PostgREST schema cache.
notify pgrst, 'reload schema';
