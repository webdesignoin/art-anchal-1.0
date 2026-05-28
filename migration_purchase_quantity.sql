-- =========================================================================
-- Art&Anchal — ERP DATABASE MIGRATION SCRIPT (Purchase Quantity Column)
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kozqszupqkueqagptwbr/sql
-- =========================================================================

-- 1. ADD quantity COLUMN TO purchases TABLE
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1;

-- 2. FORCE POSTGREST SCHEMA CACHE RELOAD
NOTIFY pgrst, 'reload schema';
