-- ============================================================
-- IH ACADEMY — Developer Hub: tiers, topics, replies, reactions
-- Migration: 20260818000001
--
-- Builds on 20260818000000 (community_messages chat) with the
-- Developer Hub upgrade:
--   * user_tier  — 'admin' | 'premium' | 'pro' | 'intern' (badge + ring)
--   * topic      — General / Frontend / Backend / Project Showcase / Code Help
--   * reply_to_id— lightweight reply references
--   * community_message_reactions — 👍 like / 💡 helpful, unique per user+message
-- ============================================================

ALTER TABLE public.community_messages
  ADD COLUMN IF NOT EXISTS user_tier TEXT DEFAULT 'intern';

ALTER TABLE public.community_messages
  ADD COLUMN IF NOT EXISTS topic TEXT DEFAULT 'General';

ALTER TABLE public.community_messages
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.community_messages (id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.community_message_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.community_messages (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'helpful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS community_message_reactions_message_idx
  ON public.community_message_reactions (message_id);

ALTER TABLE public.community_message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read reactions" ON public.community_message_reactions;
CREATE POLICY "Allow public read reactions"
  ON public.community_message_reactions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert reactions" ON public.community_message_reactions;
CREATE POLICY "Allow authenticated insert reactions"
  ON public.community_message_reactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow delete own reactions" ON public.community_message_reactions;
CREATE POLICY "Allow delete own reactions"
  ON public.community_message_reactions FOR DELETE
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'community_message_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_message_reactions;
  END IF;
END $$;