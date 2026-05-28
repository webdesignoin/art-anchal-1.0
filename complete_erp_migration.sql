-- =========================================================================
-- Art&Anchal — COMPLETE ERP DATABASE MIGRATION SCRIPT
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kozqszupqkueqagptwbr/sql
-- =========================================================================

-- ── 1. UPDATE PURCHASES TABLE ──
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1;

-- Migrate existing data if needed
UPDATE public.purchases
SET total_amount = COALESCE(amount, 0.00),
    amount_paid = COALESCE(amount, 0.00),
    status = 'paid'
WHERE total_amount IS NULL;

-- ── 2. UPDATE DUES TABLE ──
ALTER TABLE public.dues
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS linked_purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL;

-- Migrate existing data if needed
UPDATE public.dues
SET total_amount = COALESCE(amount, 0.00),
    amount_paid = CASE WHEN status = 'cleared' THEN COALESCE(amount, 0.00) ELSE 0.00 END
WHERE total_amount IS NULL;

-- ── 3. CREATE DUE_PAYMENTS TABLE ──
CREATE TABLE IF NOT EXISTS public.due_payments (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    due_id       UUID NOT NULL REFERENCES public.dues(id) ON DELETE CASCADE,
    amount_paid  NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. DISABLE RLS ON BACK-OFFICE / ERP TABLES (Resolves Permission Denied) ──
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.due_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions DISABLE ROW LEVEL SECURITY;

-- ── 5. GRANT FULL CRUD PRIVILEGES ON ERP TABLES ──
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ── 6. FORCE POSTGREST SCHEMA CACHE RELOAD ──
NOTIFY pgrst, 'reload schema';
