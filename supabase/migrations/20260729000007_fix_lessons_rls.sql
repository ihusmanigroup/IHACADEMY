-- Lessons should be viewable by everyone (like courses)
DROP POLICY IF EXISTS "Lessons are viewable by authenticated users" ON public.lessons;
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;
CREATE POLICY "Lessons are viewable by everyone"
  ON public.lessons FOR SELECT USING (true);
