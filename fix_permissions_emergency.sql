-- =========================================================================
-- Art&Anchal — EMERGENCY DATABASE PERMISSIONS FIX
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kozqszupqkueqagptwbr/sql
-- =========================================================================

-- 1. Ensure public schema usage is allowed
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Disable Row Level Security (RLS) on all back-office/ERP tables
-- This bypasses any strict policy loops or constraints for admin operations
ALTER TABLE IF EXISTS public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dues DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.due_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_interactions DISABLE ROW LEVEL SECURITY;

-- 3. Grant full permissions on all existing tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Set default privileges so future tables also get these permissions automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- 5. Force reload schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
