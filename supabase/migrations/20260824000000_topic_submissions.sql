-- Topic Submissions Table
-- For practical topic/lesson submissions across free and PRO courses

CREATE TABLE topic_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  course_type TEXT CHECK (course_type IN ('free', 'pro')),
  github_url TEXT,
  demo_link TEXT,
  code_snippet TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_feedback TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_topic_submissions_user_course ON topic_submissions(user_id, course_id);
CREATE INDEX idx_topic_submissions_user_lesson_topic ON topic_submissions(user_id, lesson_id, topic_id);
CREATE INDEX idx_topic_submissions_status ON topic_submissions(status);

-- Row Level Security
ALTER TABLE topic_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view own topic submissions" ON topic_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own topic submissions" ON topic_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending submissions (for resubmit)
CREATE POLICY "Users can update own pending topic submissions" ON topic_submissions
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Storage bucket for topic submission PDFs
-- Run in Supabase dashboard: Storage > Create bucket "topic-submissions" (public = false)
-- Then add policy:
-- CREATE POLICY "Users can upload own topic PDFs" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'topic-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can view own topic PDFs" ON storage.objects
--   FOR SELECT USING (bucket_id = 'topic-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);