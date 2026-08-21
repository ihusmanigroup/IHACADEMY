-- Winter Internship 2026-27 — API functions (RPC layer)
--
-- Intern-facing tables (internship_enrollments, assignment_submissions,
-- course_proofs) have RLS enabled with no direct policies: PostgREST denies
-- every table operation. All access runs through these SECURITY DEFINER
-- functions, which enforce, server-side:
--   * the caller is an approved application,
--   * the caller only ever touches the track selected at application time,
--   * cross-track assignment/proof ids are rejected even if hand-crafted,
--   * URL/note/PDF validation,
--   * approval-based week unlocking (draft/submitted/changes_requested never
--     count as completion).

create or replace function public.winter_login(p_email text, p_password text)
returns table (ok boolean, application jsonb, error text, status text)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_app public.intern_applications%rowtype;
begin
  -- Priority order: an approved row ALWAYS wins (approved = status 'approved'
  -- OR is_approved flag), then pending/shortlisted, then the most recent row
  -- as fallback.
  select * into v_app
  from public.intern_applications
  where lower(trim(email)) = lower(trim(p_email))
    and password = p_password
  order by
    case when (intern_applications.status = 'approved' or intern_applications.is_approved = true) then 0
         when (intern_applications.status in ('pending', 'shortlisted')) then 1
         else 2 end,
    created_at desc
  limit 1;

  if not found then
    return query select false, null::jsonb, 'Invalid credentials', null::text;
    return;
  end if;

  if not (v_app.status = 'approved' or v_app.is_approved = true) then
    return query select false, null::jsonb,
      'Your application is under admin review. Once approved, you will get access to the portal.',
      v_app.status;
    return;
  end if;

  return query select true, to_jsonb(v_app), null::text, v_app.status;
end;
$$;

-- ---------------------------------------------------------------------------
-- Portal context: enrollment, selected track, weeks, assignments, course
-- requirements, prior submissions, proofs, server-calculated progress and
-- unlock state. One call drives the whole intern portal.
-- ---------------------------------------------------------------------------
create or replace function public.winter_portal_context(p_application_id uuid)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_app public.intern_applications%rowtype;
  v_season public.internship_seasons%rowtype;
  v_enrollment public.internship_enrollments%rowtype;
  v_track public.internship_tracks%rowtype;
  v_unlocked int;
  v_week record;
  v_approved int := 0;
  v_submitted int := 0;
  v_total int := 0;
  v_all_approved boolean := true;
  v_week_rows jsonb := '[]'::jsonb;
  v_week_progress jsonb := '[]'::jsonb;
  v_submissions jsonb := '{}'::jsonb;
  v_proofs jsonb := '{}'::jsonb;
begin
  select * into v_app from public.intern_applications where id = p_application_id;
  if not found then
    return jsonb_build_object('error', 'Application not found');
  end if;
  if v_app.status <> 'approved' then
    return jsonb_build_object('error', 'Application not approved', 'status', v_app.status);
  end if;

  select * into v_season
  from public.internship_seasons
  where type = 'winter' and is_active = true
  order by year desc
  limit 1;
  if not found then
    return jsonb_build_object('error', 'No active winter season');
  end if;

  select * into v_enrollment
  from public.internship_enrollments
  where application_id = p_application_id and season_id = v_season.id
  order by created_at desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'application', to_jsonb(v_app),
      'season', to_jsonb(v_season),
      'needs_enrollment', true
    );
  end if;

  select * into v_track from public.internship_tracks where id = v_enrollment.track_id;
  if not found then
    return jsonb_build_object('error', 'Enrolled track not found');
  end if;

  -- Submissions and proofs for this enrollment only.
  select coalesce(jsonb_object_agg(s.assignment_id, to_jsonb(s)), '{}'::jsonb) into v_submissions
  from public.assignment_submissions s
  where s.enrollment_id = v_enrollment.id;

  select coalesce(jsonb_object_agg(p.course_requirement_id, to_jsonb(p)), '{}'::jsonb) into v_proofs
  from public.course_proofs p
  where p.enrollment_id = v_enrollment.id;

  -- Weeks, assignments and course requirements strictly scoped to the track.
  for v_week in
    select w.* from public.internship_weeks w
    where w.track_id = v_track.id
    order by w.week_number
  loop
    declare
      v_assignments jsonb;
      v_courses jsonb;
      v_week_approved int := 0;
      v_week_total int := 0;
      v_week_done boolean;
    begin
      select coalesce(jsonb_agg(to_jsonb(a) order by a."order"), '[]'::jsonb) into v_assignments
      from public.internship_assignments a
      where a.week_id = v_week.id;

      select coalesce(jsonb_agg(to_jsonb(c) order by c."order"), '[]'::jsonb) into v_courses
      from public.course_requirements c
      where c.week_id = v_week.id;

      select count(*) into v_week_total from public.internship_assignments
      where week_id = v_week.id;
      v_week_total := v_week_total + (
        select count(*) from public.course_requirements where week_id = v_week.id
      );

      select count(*) into v_week_approved
      from public.internship_assignments a
      join public.assignment_submissions s on s.assignment_id = a.id and s.enrollment_id = v_enrollment.id
      where a.week_id = v_week.id and s.status = 'approved';
      v_week_approved := v_week_approved + (
        select count(*) from public.course_requirements c
        join public.course_proofs p on p.course_requirement_id = c.id and p.enrollment_id = v_enrollment.id
        where c.week_id = v_week.id and p.status = 'approved'
      );

      v_approved := v_approved + v_week_approved;
      v_submitted := v_submitted + (
        select count(*) from public.internship_assignments a
        join public.assignment_submissions s on s.assignment_id = a.id and s.enrollment_id = v_enrollment.id
        where a.week_id = v_week.id and s.status in ('submitted', 'changes_requested')
      ) + (
        select count(*) from public.course_requirements c
        join public.course_proofs p on p.course_requirement_id = c.id and p.enrollment_id = v_enrollment.id
        where c.week_id = v_week.id and p.status in ('submitted', 'changes_requested')
      );
      v_total := v_total + v_week_total;

      v_week_done := v_week_total > 0 and v_week_approved = v_week_total;
      if not v_week_done then v_all_approved := false; end if;

      v_week_rows := v_week_rows || jsonb_build_object(
        'id', v_week.id,
        'week_number', v_week.week_number,
        'title', v_week.title,
        'description', v_week.description,
        'unlock_rule', v_week.unlock_rule,
        'assignments', v_assignments,
        'course_requirements', v_courses
      );

      v_week_progress := v_week_progress || jsonb_build_object(
        'week_number', v_week.week_number,
        'title', v_week.title,
        'approved', v_week_approved,
        'total', v_week_total,
        'complete', v_week_done
      );
    end;
  end loop;

  -- Unlock computation: Week 1 is unlocked on enrollment; Week N+1 unlocks
  -- only when every assignment and every course proof in Week N is Approved.
  v_unlocked := 1;
  for v_week in
    select w.* from public.internship_weeks w
    where w.track_id = v_track.id
    order by w.week_number
  loop
    declare
      v_done boolean;
    begin
      if v_week.week_number >= 4 then exit; end if;
      select
        (count(*) = (select count(*) from public.internship_assignments where week_id = v_week.id)) and
        (count(*) filter (where s.status = 'approved') =
          (select count(*) from public.internship_assignments where week_id = v_week.id))
      into v_done
      from public.internship_assignments a
      left join public.assignment_submissions s
        on s.assignment_id = a.id and s.enrollment_id = v_enrollment.id
      where a.week_id = v_week.id;

      if not v_done then exit; end if;

      select (count(*) =
        (select count(*) from public.course_requirements where week_id = v_week.id)) and
        (count(*) filter (where p.status = 'approved') =
          (select count(*) from public.course_requirements where week_id = v_week.id))
      into v_done
      from public.course_requirements c
      left join public.course_proofs p
        on p.course_requirement_id = c.id and p.enrollment_id = v_enrollment.id
      where c.week_id = v_week.id;

      if not v_done then exit; end if;
      v_unlocked := v_week.week_number + 1;
    end;
  end loop;

  if v_enrollment.status = 'completed' then v_unlocked := 4; end if;

  return jsonb_build_object(
    'application', to_jsonb(v_app),
    'season', to_jsonb(v_season),
    'enrollment', to_jsonb(v_enrollment),
    'track', to_jsonb(v_track),
    'weeks', v_week_rows,
    'submissions', v_submissions,
    'proofs', v_proofs,
    'unlocked_week', v_unlocked,
    'needs_enrollment', false,
    'all_approved', v_all_approved and v_total > 0,
    'progress', jsonb_build_object(
      'approved', v_approved,
      'submitted', v_submitted,
      'total', v_total,
      'overall_pct', case when v_total > 0 then round((v_approved::numeric / v_total) * 100) else 0 end,
      'week_progress', v_week_progress
    )
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Assignment detail: full unique brief + prior submission + mentor feedback.
-- Cross-track assignment ids are rejected server-side.
-- ---------------------------------------------------------------------------
create or replace function public.winter_assignment_detail(p_application_id uuid, p_assignment_id text)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_app public.intern_applications%rowtype;
  v_enrollment public.internship_enrollments%rowtype;
  v_assignment public.internship_assignments%rowtype;
  v_week public.internship_weeks%rowtype;
  v_track public.internship_tracks%rowtype;
  v_submission public.assignment_submissions%rowtype;
  v_unlocked int;
begin
  select * into v_app from public.intern_applications where id = p_application_id;
  if not found or v_app.status <> 'approved' then
    return jsonb_build_object('error', 'Not authorized');
  end if;

  select * into v_enrollment
  from public.internship_enrollments
  where application_id = p_application_id
  order by created_at desc
  limit 1;
  if not found then
    return jsonb_build_object('error', 'No enrollment');
  end if;

  select a.* into v_assignment
  from public.internship_assignments a
  where a.id = p_assignment_id;
  if not found then
    return jsonb_build_object('error', 'Assignment not found');
  end if;

  select w.* into v_week from public.internship_weeks w where w.id = v_assignment.week_id;
  select t.* into v_track from public.internship_tracks t where t.id = v_week.track_id;

  -- Server-side cross-track rejection.
  if v_week.track_id <> v_enrollment.track_id then
    return jsonb_build_object(
      'error', 'Cross-track assignment access denied',
      'code', 'cross_track'
    );
  end if;

  select * into v_submission
  from public.assignment_submissions
  where enrollment_id = v_enrollment.id and assignment_id = p_assignment_id;

  v_unlocked := (
    select public.winter_unlocked_week(v_enrollment.id, v_enrollment.track_id)
  );

  return jsonb_build_object(
    'assignment', to_jsonb(v_assignment),
    'week', jsonb_build_object(
      'id', v_week.id,
      'week_number', v_week.week_number,
      'title', v_week.title,
      'description', v_week.description,
      'unlock_rule', v_week.unlock_rule
    ),
    'track', jsonb_build_object('id', v_track.id, 'name', v_track.name, 'slug', v_track.slug),
    'submission', case when v_submission.id is null then null else to_jsonb(v_submission) end,
    'unlocked', v_unlocked >= v_week.week_number,
    'unlocked_week', v_unlocked
  );
end;
$$;

-- Private helper: approval-based unlocked week for an enrollment.
create or replace function public.winter_unlocked_week(p_enrollment_id uuid, p_track_id text)
returns int
language plpgsql stable security definer set search_path = public, pg_temp
as $$
declare
  v_week record;
  v_done boolean;
  v_unlocked int := 1;
begin
  for v_week in
    select w.* from public.internship_weeks w
    where w.track_id = p_track_id
    order by w.week_number
  loop
    if v_week.week_number >= 4 then exit; end if;

    select
      (count(*) filter (where s.status = 'approved')) =
        (select count(*) from public.internship_assignments where week_id = v_week.id)
    into v_done
    from public.internship_assignments a
    left join public.assignment_submissions s
      on s.assignment_id = a.id and s.enrollment_id = p_enrollment_id
    where a.week_id = v_week.id;

    if not v_done then exit; end if;

    select
      (count(*) filter (where p.status = 'approved')) =
        (select count(*) from public.course_requirements where week_id = v_week.id)
    into v_done
    from public.course_requirements c
    left join public.course_proofs p
      on p.course_requirement_id = c.id and p.enrollment_id = p_enrollment_id
    where c.week_id = v_week.id;

    if not v_done then exit; end if;
    v_unlocked := v_week.week_number + 1;
  end loop;

  return v_unlocked;
end;
$$;

-- ---------------------------------------------------------------------------
-- Save / update an assignment submission (draft or submit).
-- ---------------------------------------------------------------------------
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
  v_error text;
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
     status, submitted_at, updated_at)
  values
    (v_enrollment.id, p_assignment_id, nullif(p_github_url, ''), nullif(p_live_url, ''),
     nullif(p_notes, ''), nullif(p_attachment_url, ''), nullif(p_attachment_name, ''),
     p_status, case when p_status = 'submitted' then now() else null end, now())
  on conflict (enrollment_id, assignment_id)
  do update set
    github_url = nullif(excluded.github_url, ''),
    live_url = nullif(excluded.live_url, ''),
    notes = nullif(excluded.notes, ''),
    attachment_url = nullif(excluded.attachment_url, ''),
    attachment_name = nullif(excluded.attachment_name, ''),
    status = excluded.status,
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

-- ---------------------------------------------------------------------------
-- Save / update a course proof (PDF certificate).
-- ---------------------------------------------------------------------------
create or replace function public.winter_save_course_proof(
  p_application_id uuid,
  p_course_requirement_id text,
  p_file_url text,
  p_file_name text
)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_enrollment public.internship_enrollments%rowtype;
  v_req public.course_requirements%rowtype;
  v_week public.internship_weeks%rowtype;
  v_row public.course_proofs%rowtype;
  v_unlocked int;
begin
  if p_file_name is null or lower(p_file_name) not like '%.pdf' then
    return jsonb_build_object('error', 'Course proof must be a PDF', 'code', 'validation');
  end if;

  select * into v_enrollment
  from public.internship_enrollments
  where application_id = p_application_id
  order by created_at desc
  limit 1;
  if not found or v_enrollment.status <> 'active' then
    return jsonb_build_object('error', 'No active enrollment', 'code', 'validation');
  end if;

  select c.* into v_req from public.course_requirements c where c.id = p_course_requirement_id;
  if not found then
    return jsonb_build_object('error', 'Course requirement not found', 'code', 'validation');
  end if;

  select w.* into v_week from public.internship_weeks w where w.id = v_req.week_id;
  if v_week.track_id <> v_enrollment.track_id then
    return jsonb_build_object('error', 'Cross-track course proof denied', 'code', 'cross_track');
  end if;

  v_unlocked := public.winter_unlocked_week(v_enrollment.id, v_enrollment.track_id);
  if v_unlocked < v_week.week_number then
    return jsonb_build_object(
      'error', 'This week is locked. Complete and get every assignment and required course proof in the previous week approved first.',
      'code', 'locked'
    );
  end if;

  insert into public.course_proofs
    (enrollment_id, course_requirement_id, file_url, file_name, status, submitted_at, updated_at)
  values
    (v_enrollment.id, p_course_requirement_id, p_file_url, p_file_name, 'submitted', now(), now())
  on conflict (enrollment_id, course_requirement_id)
  do update set
    file_url = excluded.file_url,
    file_name = excluded.file_name,
    status = 'submitted',
    submitted_at = now(),
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object('ok', true, 'proof', to_jsonb(v_row), 'unlocked_week', v_unlocked);
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin surface (token-gated).
-- ---------------------------------------------------------------------------
create or replace function public.winter_admin_dashboard(p_admin_key text)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_key text;
  v_users jsonb;
  v_submissions jsonb;
  v_proofs jsonb;
begin
  select value into v_key from public.winter_settings where key = 'admin_api_key';
  if v_key is null or p_admin_key is null or v_key <> p_admin_key then
    return jsonb_build_object('error', 'Invalid admin key', 'code', 'unauthorized');
  end if;

  select coalesce(jsonb_agg(u order by u ->> 'name'), '[]'::jsonb) into v_users
  from (
    select jsonb_build_object(
      'enrollment_id', e.id,
      'application_id', a.id,
      'name', a.full_name,
      'email', a.email,
      'track_id', e.track_id,
      'track_name', t.name,
      'season_id', e.season_id,
      'status', e.status,
      'current_week', e.current_week,
      'joined_at', e.joined_at,
      'unlocked_week', public.winter_unlocked_week(e.id, e.track_id),
      'approved', (select count(*) from public.assignment_submissions s
                   where s.enrollment_id = e.id and s.status = 'approved')
               + (select count(*) from public.course_proofs p
                   where p.enrollment_id = e.id and p.status = 'approved'),
      'total', (select count(*) from public.internship_assignments a2
                where a2.week_id in (select w.id from public.internship_weeks w where w.track_id = e.track_id))
             + (select count(*) from public.course_requirements c
                where c.week_id in (select w.id from public.internship_weeks w where w.track_id = e.track_id))
    ) as u
    from public.internship_enrollments e
    join public.intern_applications a on a.id = e.application_id
    join public.internship_tracks t on t.id = e.track_id
    where (a.status = 'approved' or a.is_approved = true)
    order by a.full_name
  ) as users;

  select coalesce(jsonb_agg(s order by s ->> 'submitted_at'), '[]'::jsonb) into v_submissions
  from (
    select jsonb_build_object(
      'id', s.id,
      'intern_name', a.full_name,
      'email', a.email,
      'track_name', t.name,
      'assignment_title', asg.title,
      'assignment_slug', asg.slug,
      'week_number', w.week_number,
      'status', s.status,
      'github_url', s.github_url,
      'live_url', s.live_url,
      'notes', s.notes,
      'attachment_name', s.attachment_name,
      'attachment_url', s.attachment_url,
      'submitted_at', s.submitted_at,
      'mentor_feedback', s.mentor_feedback,
      'reviewed_at', s.reviewed_at,
      'reviewed_by', s.reviewed_by
    ) as s
    from public.assignment_submissions s
    join public.internship_enrollments e on e.id = s.enrollment_id
    join public.intern_applications a on a.id = e.application_id
    join public.internship_assignments asg on asg.id = s.assignment_id
    join public.internship_weeks w on w.id = asg.week_id
    join public.internship_tracks t on t.id = e.track_id
    where (a.status = 'approved' or a.is_approved = true)
  ) as subs;

  select coalesce(jsonb_agg(p order by p ->> 'submitted_at'), '[]'::jsonb) into v_proofs
  from (
    select jsonb_build_object(
      'id', p.id,
      'intern_name', a.full_name,
      'email', a.email,
      'track_name', t.name,
      'course_title', cr.course_title,
      'week_number', w.week_number,
      'status', p.status,
      'file_name', p.file_name,
      'file_url', p.file_url,
      'submitted_at', p.submitted_at,
      'mentor_feedback', p.mentor_feedback,
      'reviewed_at', p.reviewed_at,
      'reviewed_by', p.reviewed_by
    ) as p
    from public.course_proofs p
    join public.internship_enrollments e on e.id = p.enrollment_id
    join public.intern_applications a on a.id = e.application_id
    join public.course_requirements cr on cr.id = p.course_requirement_id
    join public.internship_weeks w on w.id = cr.week_id
    join public.internship_tracks t on t.id = e.track_id
    where (a.status = 'approved' or a.is_approved = true)
  ) as proof_rows;

  return jsonb_build_object(
    'users', v_users,
    'submissions', v_submissions,
    'proofs', v_proofs
  );
end;
$$;

create or replace function public.winter_admin_review_submission(
  p_admin_key text,
  p_submission_id uuid,
  p_status text,
  p_feedback text
)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_key text;
begin
  select value into v_key from public.winter_settings where key = 'admin_api_key';
  if v_key is null or p_admin_key is null or v_key <> p_admin_key then
    return jsonb_build_object('error', 'Invalid admin key', 'code', 'unauthorized');
  end if;
  if p_status not in ('approved', 'changes_requested') then
    return jsonb_build_object('error', 'Review status must be approved or changes_requested', 'code', 'validation');
  end if;

  update public.assignment_submissions
  set status = p_status,
      mentor_feedback = nullif(p_feedback, ''),
      reviewed_at = now(),
      reviewed_by = 'mentor'
  where id = p_submission_id;

  if not found then
    return jsonb_build_object('error', 'Submission not found', 'code', 'validation');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.winter_admin_review_proof(
  p_admin_key text,
  p_proof_id uuid,
  p_status text,
  p_feedback text
)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_key text;
begin
  select value into v_key from public.winter_settings where key = 'admin_api_key';
  if v_key is null or p_admin_key is null or v_key <> p_admin_key then
    return jsonb_build_object('error', 'Invalid admin key', 'code', 'unauthorized');
  end if;
  if p_status not in ('approved', 'changes_requested') then
    return jsonb_build_object('error', 'Review status must be approved or changes_requested', 'code', 'validation');
  end if;

  update public.course_proofs
  set status = p_status,
      mentor_feedback = nullif(p_feedback, ''),
      reviewed_at = now(),
      reviewed_by = 'mentor'
  where id = p_proof_id;

  if not found then
    return jsonb_build_object('error', 'Course proof not found', 'code', 'validation');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.winter_admin_approve_application(
  p_admin_key text,
  p_application_id uuid,
  p_track_id text
)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_key text;
  v_track public.internship_tracks%rowtype;
  v_season_id text;
begin
  select value into v_key from public.winter_settings where key = 'admin_api_key';
  if v_key is null or p_admin_key is null or v_key <> p_admin_key then
    return jsonb_build_object('error', 'Invalid admin key', 'code', 'unauthorized');
  end if;

  select * into v_track from public.internship_tracks where id = p_track_id and is_active = true;
  if not found then
    return jsonb_build_object('error', 'Track not found', 'code', 'validation');
  end if;

  update public.intern_applications
  set status = 'approved', is_approved = true, track = p_track_id, cohort = 'winter'
  where id = p_application_id;
  if not found then
    return jsonb_build_object('error', 'Application not found', 'code', 'validation');
  end if;

  select id into v_season_id from public.internship_seasons
  where type = 'winter' and is_active = true
  order by year desc limit 1;

  if v_season_id is not null then
    insert into public.internship_enrollments (application_id, season_id, track_id, status, current_week)
    values (p_application_id, v_season_id, p_track_id, 'active', 1)
    on conflict (application_id, season_id)
    do update set track_id = excluded.track_id, status = 'active';
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.winter_admin_reject_application(p_admin_key text, p_application_id uuid)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_key text;
begin
  select value into v_key from public.winter_settings where key = 'admin_api_key';
  if v_key is null or p_admin_key is null or v_key <> p_admin_key then
    return jsonb_build_object('error', 'Invalid admin key', 'code', 'unauthorized');
  end if;

  update public.intern_applications
  set status = 'rejected', is_approved = false
  where id = p_application_id;
  if not found then
    return jsonb_build_object('error', 'Application not found', 'code', 'validation');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;