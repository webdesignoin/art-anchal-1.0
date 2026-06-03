-- Migration V2: Purchase Flow & POS Price tracking enhancements
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/kozqszupqkueqagptwbr/sql

-- 1. Create purchase_items table linking purchases to sarees
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id uuid REFERENCES public.purchases(id) ON DELETE CASCADE,
    saree_id uuid REFERENCES public.sarees(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    buying_price numeric NOT NULL,
    selling_price numeric NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admins) to manage purchase items
CREATE POLICY "Enable all access for authenticated users on purchase_items"
    ON public.purchase_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Add original_price column to order_items for price overrides
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS original_price numeric;

-- 3. Add sell_online column to sarees (default to false as per request)
ALTER TABLE public.sarees
ADD COLUMN IF NOT EXISTS sell_online boolean NOT NULL DEFAULT false;
