/**
 * IH Academy — Developer Community Chat DB Setup
 * ------------------------------------------------------------------
 * Usage (from repo root):
 *   npm run db:setup-community
 *   (or) node scripts/setup-community-db.js
 *
 * Creates `community_messages`, enables RLS with chat policies, adds the
 * table to the Realtime publication, and installs the rolling-window
 * pruning trigger (keeps newest ~150, purges oldest 50). Fully idempotent —
 * safe to re-run.
 *
 * Required env (root .env, loaded via dotenv):
 *   SUPABASE_DB_URL   (connection string)  — or DATABASE_URL as fallback
 *
 * NOTE: the prune function is SECURITY DEFINER so the DELETE it performs is
 * exempt from RLS — otherwise intern inserts (non-owners of old rows) would
 * have their prune rejected and the whole insert would abort.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') })
const { Client } = require('pg')

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

if (!DB_URL) {
  console.error('  ❌ SUPABASE_DB_URL (or DATABASE_URL) not set in root .env')
  process.exit(1)
}

const SQL = `
-- 1. community_messages table
CREATE TABLE IF NOT EXISTS public.community_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    user_role TEXT DEFAULT 'FREE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.community_messages;
CREATE POLICY "Allow public read" ON public.community_messages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON public.community_messages;
CREATE POLICY "Allow authenticated insert" ON public.community_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Own-row UPDATE: lets the profile avatar sync bulk-update user_avatar on the
-- author's historical messages (content edits by the author are fine too).
DROP POLICY IF EXISTS "Allow update own messages" ON public.community_messages;
CREATE POLICY "Allow update own messages" ON public.community_messages
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow delete for owners and admins" ON public.community_messages;
CREATE POLICY "Allow delete for owners and admins" ON public.community_messages
    FOR DELETE USING (
      auth.uid() = user_id
      OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
    );

-- 3. Realtime publication (idempotent)
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

-- 4. Auto-pruning function + trigger
CREATE OR REPLACE FUNCTION public.prune_old_community_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.community_messages) > 150 THEN
        DELETE FROM public.community_messages
        WHERE id IN (
            SELECT id FROM public.community_messages
            ORDER BY created_at ASC
            LIMIT 50
        );
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prune_community_messages ON public.community_messages;
CREATE TRIGGER trigger_prune_community_messages
AFTER INSERT ON public.community_messages
FOR EACH STATEMENT
EXECUTE FUNCTION public.prune_old_community_messages();

-- 5. Developer Hub columns (idempotent for existing installs):
--    tier badge source, topic filter, and optional reply reference.
ALTER TABLE public.community_messages ADD COLUMN IF NOT EXISTS user_tier TEXT DEFAULT 'FREE';
ALTER TABLE public.community_messages ADD COLUMN IF NOT EXISTS topic TEXT DEFAULT 'General';
ALTER TABLE public.community_messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.community_messages(id) ON DELETE CASCADE;

-- Default tier is FREE — legacy rows / unspecified inserts must NOT fall back
-- to INTERN. (INTERN only applies when explicitly resolved from a profile.)
ALTER TABLE public.community_messages ALTER COLUMN user_tier SET DEFAULT 'FREE';
ALTER TABLE public.community_messages ALTER COLUMN user_role SET DEFAULT 'FREE';

-- Retroactive tier backfill: re-resolve EVERY message whose stored tier is
-- stale — i.e. legacy/missing (null, 'intern', 'vvip', 'premium', typos) OR
-- a valid value that no longer matches the sender's current tier. Strict
-- hierarchy (server-side, so it can read owner-private transactions):
-- admin > EXCLUSIVE > PRO > COURSE_BUYER > FREE.
-- PRO/EXCLUSIVE only via plan flags (is_pro/is_exclusive). Course enrollment
-- does NOT confer PRO. COURSE_BUYER requires a completed individual course
-- purchase with NO paid plan.
-- Re-running is safe — only rows whose stored tier differs are touched.
UPDATE public.community_messages AS cm
SET user_tier = st.tier,
    user_role = st.tier
FROM (
    SELECT
        p.id AS user_id,
        CASE
            WHEN p.is_admin THEN 'admin'
            WHEN p.is_exclusive = true THEN 'EXCLUSIVE'
            WHEN p.is_pro = true THEN 'PRO'
            WHEN EXISTS (
                SELECT 1 FROM public.transactions t
                WHERE t.user_id = p.id
                  AND t.item_type = 'course'
                  AND COALESCE(t.status, 'completed') = 'completed'
            ) THEN 'COURSE_BUYER'
            ELSE 'FREE'
        END AS tier
    FROM public.profiles p
) AS st
WHERE st.user_id = cm.user_id
  AND (UPPER(cm.user_tier) IS DISTINCT FROM st.tier
       OR cm.user_tier IS NULL);

-- 6. Message reactions (upvote / helpful)
CREATE TABLE IF NOT EXISTS public.community_message_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL CHECK (reaction IN ('like', 'helpful')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (message_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS community_message_reactions_message_idx
  ON public.community_message_reactions (message_id);

ALTER TABLE public.community_message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read reactions" ON public.community_message_reactions;
CREATE POLICY "Allow public read reactions" ON public.community_message_reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert reactions" ON public.community_message_reactions;
CREATE POLICY "Allow authenticated insert reactions" ON public.community_message_reactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow delete own reactions" ON public.community_message_reactions;
CREATE POLICY "Allow delete own reactions" ON public.community_message_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Realtime for reactions (idempotent)
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
`

async function run() {
  console.log('  🔌 Connecting to Supabase database…')
  const client = new Client({ connectionString: DB_URL })
  await client.connect()
  try {
    await client.query('BEGIN')
    await client.query(SQL)
    await client.query('COMMIT')
    console.log('  ✅ community_messages table created / verified.')
    console.log('  ✅ RLS enabled — public read, authenticated insert, delete for owners & admins.')
    console.log('  ✅ Realtime enabled (supabase_realtime publication).')
    console.log('  ✅ Pruning trigger installed (keeps newest ~150, purges oldest 50).')
    console.log('  ✅ Hub columns added — user_tier, topic, reply_to_id.')
    console.log('  ✅ community_message_reactions table + RLS + Realtime created.')
    console.log('\n✔ Community chat database setup complete!')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('  ❌ Failed:', err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()
