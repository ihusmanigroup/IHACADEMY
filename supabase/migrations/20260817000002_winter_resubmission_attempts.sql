-- ============================================================
-- IH ACADEMY — Assignment resubmission: attempt tracking
-- Migration: 20260817000002
--
-- Adds `attempt_number` to assignment_submissions so the UI can show
-- "Attempt #1 / #2 / …" and updates winter_save_submission to increment
-- it every time a student (re)submits:
--   * first submit  -> attempt_number = 1
--   * resubmit after changes_requested / rejected -> attempt_number + 1
--   * draft saves   -> attempt_number unchanged
--
-- Resubmission reuses status 'submitted' (the DB CHECK allows only
-- draft/submitted/changes_requested/approved); the UI renders it as
-- "Pending Review" / "Under Review". submitted_at is refreshed to now()
-- on every submit, which winter_save_submission already does.
-- ============================================================

ALTER TABLE public.assignment_submissions
  ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 0;

create or replace function public.winter_save_submission(
  p_application_id uuid,
  p_assignment_id text,
  p_github_url text,
  p_live_url text,
  p_notes text,
  p_attachment_url text,
  p_attachment_name text,
  p_status text
)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_enrollment public.internship_enrollments%rowtype;
  v_assignment public.internship_assignments%rowtype;
  v_week public.internship_weeks%rowtype;
  v_row public.assignment_submissions%rowtype;
  v_unlocked int;
begin
  if p_status is null or p_status not in ('draft', 'submitted') then
    return jsonb_build_object('error', 'Invalid status', 'code', 'validation');
  end if;

  select * into v_enrollment
  from public.internship_enrollments
  where application_id = p_application_id
  order by created_at desc
  limit 1;
  if not found or v_enrollment.status <> 'active' then
    return jsonb_build_object('error', 'No active enrollment', 'code', 'validation');
  end if;

  select a.* into v_assignment from public.internship_assignments a where a.id = p_assignment_id;
  if not found then
    return jsonb_build_object('error', 'Assignment not found', 'code', 'validation');
  end if;

  select w.* into v_week from public.internship_weeks w where w.id = v_assignment.week_id;
  if v_week.track_id <> v_enrollment.track_id then
    return jsonb_build_object('error', 'Cross-track assignment access denied', 'code', 'cross_track');
  end if;

  v_unlocked := public.winter_unlocked_week(v_enrollment.id, v_enrollment.track_id);
  if p_status = 'submitted' and v_unlocked < v_week.week_number then
    return jsonb_build_object(
      'error', 'This week is locked. Complete and get every assignment and required course proof in the previous week approved first.',
      'code', 'locked'
    );
  end if;

  if p_github_url is not null and p_github_url <> '' and p_github_url !~ '^https?://' then
    return jsonb_build_object('error', 'GitHub URL must start with http:// or https://', 'code', 'validation');
  end if;
  if p_live_url is not null and p_live_url <> '' and p_live_url !~ '^https?://' then
    return jsonb_build_object('error', 'Live URL must start with http:// or https://', 'code', 'validation');
  end if;
  if p_notes is not null and length(p_notes) > 4000 then
    return jsonb_build_object('error', 'Notes must be 4000 characters or fewer', 'code', 'validation');
  end if;
  if p_attachment_name is not null and p_attachment_name <> '' and lower(p_attachment_name) not like '%.pdf' then
    return jsonb_build_object('error', 'Attachment must be a PDF', 'code', 'validation');
  end if;

  insert into public.assignment_submissions
    (enrollment_id, assignment_id, github_url, live_url, notes, attachment_url, attachment_name,
     status, attempt_number, submitted_at, updated_at)
  values
    (v_enrollment.id, p_assignment_id, nullif(p_github_url, ''), nullif(p_live_url, ''),
     nullif(p_notes, ''), nullif(p_attachment_url, ''), nullif(p_attachment_name, ''),
     p_status, case when p_status = 'submitted' then 1 else 0 end,
     case when p_status = 'submitted' then now() else null end, now())
  on conflict (enrollment_id, assignment_id)
  do update set
    github_url = nullif(excluded.github_url, ''),
    live_url = nullif(excluded.live_url, ''),
    notes = nullif(excluded.notes, ''),
    attachment_url = nullif(excluded.attachment_url, ''),
    attachment_name = nullif(excluded.attachment_name, ''),
    status = excluded.status,
    attempt_number = case
      when excluded.status = 'submitted' then assignment_submissions.attempt_number + 1
      else assignment_submissions.attempt_number
    end,
    submitted_at = case when excluded.status = 'submitted' then now() else assignment_submissions.submitted_at end,
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object(
    'ok', true,
    'submission', to_jsonb(v_row),
    'unlocked_week', v_unlocked
  );
end;
$$;