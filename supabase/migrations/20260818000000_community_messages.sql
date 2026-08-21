-- ============================================================
-- IH ACADEMY — Developer Community Real-time Chat
-- Migration: 20260818000000
--
-- Flat, real-time message feed backed by `community_messages`. All
-- authenticated users can read + post; deletes are admin-only
-- (profiles.is_admin) OR the message author. Rows publish through
-- the `supabase_realtime` publication so `postgres_changes` delivers
-- INSERT / DELETE events to every connected client without reloads.
--
-- Rolling-window pruning: after each insert, if the table holds more
-- than 150 messages the 50 oldest rows are deleted automatically, so
-- the conversation stays recent without clearing the screen abruptly.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.community_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  user_name TEXT NOT NULL DEFAULT '',
  user_avatar TEXT,
  content TEXT NOT NULL CHECK (char_length(btrim(content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_role TEXT NOT NULL DEFAULT 'intern' CHECK (user_role IN ('admin', 'intern'))
);

CREATE INDEX IF NOT EXISTS community_messages_created_at_idx
  ON public.community_messages (created_at);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Any authenticated user may read the whole feed.
DROP POLICY IF EXISTS "community_messages_select_all" ON public.community_messages;
CREATE POLICY "community_messages_select_all"
  ON public.community_messages FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users may post; the author comes from the session.
DROP POLICY IF EXISTS "community_messages_insert_own" ON public.community_messages;
CREATE POLICY "community_messages_insert_own"
  ON public.community_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

-- Message authors may delete their own messages.
DROP POLICY IF EXISTS "community_messages_delete_own" ON public.community_messages;
CREATE POLICY "community_messages_delete_own"
  ON public.community_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Admins (profiles.is_admin) may delete any message.
DROP POLICY IF EXISTS "community_messages_delete_admin" ON public.community_messages;
CREATE POLICY "community_messages_delete_admin"
  ON public.community_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- Publish to Realtime so clients receive INSERT / DELETE events live.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
END $$;

-- Rolling-window pruning: keep the newest ~150 messages, dropping the
-- 50 oldest whenever the cap is exceeded. SECURITY DEFINER so the
-- delete runs with the function owner's rights, bypassing RLS
-- regardless of the inserting user's role.
CREATE OR REPLACE FUNCTION public.prune_community_messages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count INTEGER;
BEGIN
  SELECT count(*) INTO total_count FROM public.community_messages;
  IF total_count > 150 THEN
    DELETE FROM public.community_messages
    WHERE id IN (
      SELECT id FROM public.community_messages
      ORDER BY created_at ASC, id ASC
      LIMIT 50
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS community_messages_prune_after_insert ON public.community_messages;
CREATE TRIGGER community_messages_prune_after_insert
  AFTER INSERT ON public.community_messages
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.prune_community_messages();
