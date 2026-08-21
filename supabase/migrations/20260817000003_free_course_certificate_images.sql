-- Free-course certificate uploads: allow image files (PNG/JPG) in addition to
-- PDFs. Recreates winter_save_course_proof with a relaxed extension check so
-- the Free Courses page can accept .pdf/.png/.jpg/.jpeg end-to-end.
--
-- NOT yet applied — run this against Supabase together with the other
-- 2026081700000x migrations to enable image certificate support.

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
  if p_file_name is null or lower(p_file_name) !~ '\.(pdf|png|jpe?g)$' then
    return jsonb_build_object('error', 'Course proof must be a PDF, PNG or JPG', 'code', 'validation');
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