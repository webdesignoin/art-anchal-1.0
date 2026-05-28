-- =========================================================================
-- Art&Anchal — ERP DATABASE MIGRATION SCRIPT (Finance, Ledger, POS Alignment)
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kozqszupqkueqagptwbr/sql
-- =========================================================================

-- ── 1. UPDATE PURCHASES TABLE ──
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unpaid';

-- Migrate existing data from amount column
UPDATE public.purchases
SET total_amount = COALESCE(amount, 0.00),
    amount_paid = COALESCE(amount, 0.00),
    status = 'paid'
WHERE total_amount IS NULL;

-- Make total_amount NOT NULL after migration
ALTER TABLE public.purchases
  ALTER COLUMN total_amount SET NOT NULL;

-- ── 2. UPDATE DUES TABLE ──
ALTER TABLE public.dues
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS linked_purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL;

-- Migrate existing data from amount column
UPDATE public.dues
SET total_amount = COALESCE(amount, 0.00),
    amount_paid = CASE WHEN status = 'cleared' THEN COALESCE(amount, 0.00) ELSE 0.00 END
WHERE total_amount IS NULL;

-- Make total_amount NOT NULL after migration
ALTER TABLE public.dues
  ALTER COLUMN total_amount SET NOT NULL;

-- ── 3. CREATE DUE_PAYMENTS TABLE ──
CREATE TABLE IF NOT EXISTS public.due_payments (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    due_id       UUID NOT NULL REFERENCES public.dues(id) ON DELETE CASCADE,
    amount_paid  NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.due_payments ENABLE ROW LEVEL SECURITY;

-- ── 4. RLS POLICIES & GRANTS ──

-- due_payments policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='due_payments' AND policyname='Admins can manage all due payments') THEN
    CREATE POLICY "Admins can manage all due payments"
      ON public.due_payments FOR ALL
      USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='due_payments' AND policyname='Anyone can insert due payments') THEN
    -- POS or public checkout flow may log payments
    CREATE POLICY "Anyone can insert due payments"
      ON public.due_payments FOR INSERT
      WITH CHECK (TRUE);
  END IF;
END $$;

-- Enable permissions for other ERP tables that were created manually but need policies checked
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- employees
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='employees' AND policyname='Admins can manage all employees') THEN
    CREATE POLICY "Admins can manage all employees" ON public.employees FOR ALL USING (public.is_admin());
  END IF;
  
  -- attendance
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='attendance' AND policyname='Admins can manage all attendance') THEN
    CREATE POLICY "Admins can manage all attendance" ON public.attendance FOR ALL USING (public.is_admin());
  END IF;

  -- expenses
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='expenses' AND policyname='Admins can manage all expenses') THEN
    CREATE POLICY "Admins can manage all expenses" ON public.expenses FOR ALL USING (public.is_admin());
  END IF;

  -- purchases
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='purchases' AND policyname='Admins can manage all purchases') THEN
    CREATE POLICY "Admins can manage all purchases" ON public.purchases FOR ALL USING (public.is_admin());
  END IF;

  -- dues
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dues' AND policyname='Admins can manage all dues') THEN
    CREATE POLICY "Admins can manage all dues" ON public.dues FOR ALL USING (public.is_admin());
  END IF;

  -- lead_interactions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_interactions' AND policyname='Admins can manage all lead interactions') THEN
    CREATE POLICY "Admins can manage all lead interactions" ON public.lead_interactions FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- Grant permissions to roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.due_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_interactions TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dues TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.due_payments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_interactions TO anon;

-- Done!
