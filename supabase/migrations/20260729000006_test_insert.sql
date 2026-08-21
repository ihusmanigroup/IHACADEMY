INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
SELECT id, 'Test Lesson', 'This is a test lesson to verify INSERT works in migrations.', 10, 1
FROM public.courses
WHERE title = 'Frontend Development';
