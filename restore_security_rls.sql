-- =========================================================================
-- Art&Anchal — RLS SECURITY RESTORATION & POLICY FIX
-- Run this in your Supabase SQL Editor to secure all tables:
-- https://supabase.com/dashboard/project/kozqszupqkueqagptwbr/sql
-- =========================================================================

-- 1. Redefine is_admin() in plpgsql to prevent PostgreSQL function inlining.
-- PL/pgSQL functions are not inlined, which preserves the SECURITY DEFINER context.
-- This allows the function to bypass RLS checks on public.profiles and prevents circular recursion loops.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    _is_admin BOOLEAN;
BEGIN
    SELECT is_admin INTO _is_admin FROM public.profiles WHERE auth_user_id = auth.uid();
    RETURN COALESCE(_is_admin, FALSE);
END;
$$;

-- 2. Re-enable Row Level Security (RLS) on all back-office/ERP tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.due_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing conflicting policies on these tables to avoid duplication errors
DROP POLICY IF EXISTS "Admins can manage all employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can manage all purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can manage all dues" ON public.dues;
DROP POLICY IF EXISTS "Admins can manage all due payments" ON public.due_payments;
DROP POLICY IF EXISTS "Admins can manage all lead interactions" ON public.lead_interactions;

-- 4. Create secure RLS policies (only allowing users who are verified Admins to perform operations)
CREATE POLICY "Admins can manage all employees" ON public.employees
    FOR ALL TO authenticated, anon USING (public.is_admin());

CREATE POLICY "Admins can manage all attendance" ON public.attendance
    FOR ALL TO authenticated, anon USING (public.is_admin());

CREATE POLICY "Admins can manage all expenses" ON public.expenses
    FOR ALL TO authenticated, anon USING (public.is_admin());

CREATE POLICY "Admins can manage all purchases" ON public.purchases
    FOR ALL TO authenticated, anon USING (public.is_admin());

CREATE POLICY "Admins can manage all dues" ON public.dues
    FOR ALL TO authenticated, anon USING (public.is_admin());

CREATE POLICY "Admins can manage all due payments" ON public.due_payments
    FOR ALL TO authenticated, anon USING (public.is_admin());

CREATE POLICY "Admins can manage all lead interactions" ON public.lead_interactions
    FOR ALL TO authenticated, anon USING (public.is_admin());

-- 5. Force reload schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
