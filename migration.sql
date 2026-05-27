-- =========================================================================
-- Art&Anchal — EMERGENCY DB FIX (Run this FIRST)
-- Run in Supabase SQL Editor: supabase.com/dashboard/project/kozqszupqkueqagptwbr/sql
-- =========================================================================

-- =========================================================================
-- STEP 1: GRANT table access (CRITICAL — this is why orders disappear)
-- The GRANT statements in schema.sql were never applied to the live DB.
-- Without these, even authenticated users get "permission denied".
-- =========================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public catalog (read-only for everyone)
GRANT SELECT ON public.artisans    TO anon, authenticated;
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT SELECT ON public.sarees      TO anon, authenticated;

-- Orders (users need INSERT to checkout, SELECT to view their own)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders      TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO anon, authenticated;

-- Profiles (users manage their own)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles    TO authenticated;

-- Leads (contact form submissions)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads       TO anon, authenticated;

-- Admin-only write access
GRANT INSERT, UPDATE, DELETE ON public.sarees      TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.artisans    TO authenticated;

-- =========================================================================
-- STEP 2: Verify RLS is enabled on all tables
-- =========================================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sarees      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads       ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP 3: Ensure the is_admin() helper function exists
-- =========================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT COALESCE(
        (SELECT is_admin FROM public.profiles WHERE auth_user_id = auth.uid()),
        FALSE
    );
$$;

-- =========================================================================
-- STEP 4: Ensure all RLS policies exist (safe — uses IF NOT EXISTS via DO)
-- =========================================================================

-- profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Public profiles are viewable by owner or admins') THEN
    CREATE POLICY "Public profiles are viewable by owner or admins"
      ON public.profiles FOR SELECT
      USING (auth_user_id = auth.uid() OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      USING (auth_user_id = auth.uid())
      WITH CHECK (auth_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Service role can insert profiles') THEN
    CREATE POLICY "Service role can insert profiles"
      ON public.profiles FOR INSERT
      WITH CHECK (TRUE);
  END IF;
END $$;

-- sarees (public read)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sarees' AND policyname='Anyone can view active sarees') THEN
    CREATE POLICY "Anyone can view active sarees"
      ON public.sarees FOR SELECT
      USING (is_active = TRUE OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sarees' AND policyname='Admins can manage sarees') THEN
    CREATE POLICY "Admins can manage sarees"
      ON public.sarees FOR ALL
      USING (public.is_admin());
  END IF;
END $$;

-- orders
DO $$ BEGIN
  -- Drop stale policy if it exists with wrong column reference
  DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

  CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (
      profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
      OR customer_email = (auth.jwt() ->> 'email')
      OR public.is_admin()
    );

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Anyone can create an order') THEN
    CREATE POLICY "Anyone can create an order"
      ON public.orders FOR INSERT
      WITH CHECK (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Admins can manage all orders') THEN
    CREATE POLICY "Admins can manage all orders"
      ON public.orders FOR ALL
      USING (public.is_admin());
  END IF;
  -- Users can update their own order status (e.g. cancel)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Users can update own orders') THEN
    CREATE POLICY "Users can update own orders"
      ON public.orders FOR UPDATE
      USING (
        profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR customer_email = (auth.jwt() ->> 'email')
      );
  END IF;
END $$;

-- order_items
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='Anyone can insert order items') THEN
    CREATE POLICY "Anyone can insert order items"
      ON public.order_items FOR INSERT
      WITH CHECK (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='Users can view own order items') THEN
    CREATE POLICY "Users can view own order items"
      ON public.order_items FOR SELECT
      USING (
        order_id IN (
          SELECT id FROM public.orders
          WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
             OR customer_email = (auth.jwt() ->> 'email')
        )
        OR public.is_admin()
      );
  END IF;
END $$;

-- leads (contact form)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leads' AND policyname='Anyone can submit a lead') THEN
    CREATE POLICY "Anyone can submit a lead"
      ON public.leads FOR INSERT
      WITH CHECK (TRUE);
  END IF;
END $$;

-- =========================================================================
-- STEP 5: Add missing columns to profiles (saved_addresses already exists)
-- =========================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT;

-- =========================================================================
-- STEP 6: Verify — run these to confirm everything works
-- =========================================================================

-- Should show all your tables with rowsecurity = true
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Should show grants for anon and authenticated on orders
-- SELECT grantee, table_name, privilege_type FROM information_schema.role_table_grants
-- WHERE table_schema = 'public' AND table_name = 'orders' ORDER BY grantee;
