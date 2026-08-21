-- ============================================================
-- IH ACADEMY — Profile avatar sync across historical chat messages
-- Migration: 20260818000002
--
-- Allows an authenticated user to UPDATE their own rows in
-- `community_messages`. This is required for the profile-upload
-- flow to bulk-refresh `user_avatar` on every past message the
-- author has posted (`profiles` → `community_messages.user_avatar`).
--
-- Combined with Realtime UPDATE events already subscribed by the
-- client hook, connected users see the avatar change instantly.
-- ============================================================

DROP POLICY IF EXISTS "Allow update own messages" ON public.community_messages;
CREATE POLICY "Allow update own messages"
  ON public.community_messages
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);