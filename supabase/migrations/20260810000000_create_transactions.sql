-- ============================================================
-- IH ACADEMY — Billing Transactions Ledger
-- Migration: 20260810000000
--
-- transactions: audit ledger of every plan selection / course
-- purchase by a user. Written by the client once a plan is
-- selected (Pricing page) or a paid course is unlocked, and read
-- by "Billing & Purchases" in account settings.
-- RLS: users may only see and insert their own rows.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('plan', 'course')),
  item_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_created_idx
  ON public.transactions (user_id, created_at DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own"
  ON public.transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
CREATE POLICY "transactions_insert_own"
  ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);