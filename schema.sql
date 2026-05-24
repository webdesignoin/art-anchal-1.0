-- =========================================================================
-- Art&Anchal Varanasi Handloom — Full Database Schema
-- Run this FIRST in Supabase SQL Editor, THEN run seed.sql
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- ENUM TYPES
-- =========================================================================

CREATE TYPE public.profile_source AS ENUM ('online', 'offline', 'google', 'phone');
CREATE TYPE public.order_status  AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE public.lead_status   AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');
CREATE TYPE public.payment_mode  AS ENUM ('online', 'cash', 'card', 'upi', 'bank_transfer');

-- =========================================================================
-- TABLE: public.profiles
-- Mirrors auth.users; also holds offline/CRM leads without auth accounts.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id  UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    name          TEXT,
    email         TEXT UNIQUE,
    phone         TEXT,
    is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
    source        public.profile_source NOT NULL DEFAULT 'online',
    avatar_url    TEXT,
    city          TEXT,
    notes         TEXT,          -- CRM admin notes
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (auth_user_id, name, email, avatar_url, source)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        CASE
            WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google'::public.profile_source
            WHEN NEW.app_metadata->>'provider' = 'phone'  THEN 'phone'::public.profile_source
            ELSE 'online'::public.profile_source
        END
    )
    ON CONFLICT (email) DO UPDATE
        SET auth_user_id = EXCLUDED.auth_user_id,
            avatar_url   = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
            updated_at   = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- TABLE: public.artisans
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.artisans (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name               TEXT NOT NULL,
    age                INT,
    village            TEXT,
    experience_years   INT,
    specialty          TEXT,
    quote              TEXT,
    story              TEXT,
    image_url          TEXT,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- TABLE: public.collections
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.collections (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         TEXT NOT NULL,
    slug         TEXT UNIQUE NOT NULL,
    tagline      TEXT,
    description  TEXT,
    cover_image  TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order   INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- TABLE: public.sarees
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.sarees (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                 TEXT NOT NULL,
    price                NUMERIC(12, 2) NOT NULL,
    original_price       NUMERIC(12, 2),
    rating               NUMERIC(3, 2) DEFAULT 0,
    reviews_count        INT DEFAULT 0,
    images               TEXT[] NOT NULL DEFAULT '{}',
    collection_id        UUID REFERENCES public.collections(id) ON DELETE SET NULL,
    colors               TEXT[] DEFAULT '{}',
    zari_type            TEXT,
    weaving_technique    TEXT,
    material             TEXT,
    artisan_id           UUID REFERENCES public.artisans(id) ON DELETE SET NULL,
    description          TEXT,
    drape_recommendation TEXT,
    is_bestseller        BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured          BOOLEAN NOT NULL DEFAULT FALSE,
    is_new               BOOLEAN NOT NULL DEFAULT FALSE,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity       INT NOT NULL DEFAULT 1,
    -- Spec sheet
    spec_length          TEXT,
    spec_width           TEXT,
    spec_blouse          TEXT,
    spec_wash_care       TEXT,
    spec_origin          TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER sarees_updated_at
    BEFORE UPDATE ON public.sarees
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_sarees_collection ON public.sarees(collection_id);
CREATE INDEX IF NOT EXISTS idx_sarees_artisan    ON public.sarees(artisan_id);
CREATE INDEX IF NOT EXISTS idx_sarees_featured   ON public.sarees(is_featured) WHERE is_featured = TRUE;

-- =========================================================================
-- TABLE: public.orders
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    -- Snapshot of customer info at time of order
    customer_name    TEXT NOT NULL,
    customer_email   TEXT NOT NULL,
    customer_phone   TEXT,
    shipping_address JSONB NOT NULL DEFAULT '{}',
    -- Financials
    subtotal         NUMERIC(12, 2) NOT NULL,
    discount         NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax              NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total            NUMERIC(12, 2) NOT NULL,
    -- Status & payment
    status           public.order_status NOT NULL DEFAULT 'pending',
    payment_mode     public.payment_mode NOT NULL DEFAULT 'online',
    payment_ref      TEXT,           -- UPI ref, Razorpay order ID, etc.
    is_paid          BOOLEAN NOT NULL DEFAULT FALSE,
    -- POS / offline billing
    is_offline       BOOLEAN NOT NULL DEFAULT FALSE,
    notes            TEXT,
    invoice_number   TEXT UNIQUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_profile ON public.orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON public.orders(status);

-- Auto-generate invoice numbers: INV-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' ||
            TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
            LPAD(CAST(FLOOR(RANDOM() * 9000 + 1000) AS TEXT), 4, '0');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_invoice_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- =========================================================================
-- TABLE: public.order_items
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.order_items (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    saree_id     UUID REFERENCES public.sarees(id) ON DELETE SET NULL,
    -- Snapshot of product at time of order
    product_name TEXT NOT NULL,
    unit_price   NUMERIC(12, 2) NOT NULL,
    quantity     INT NOT NULL DEFAULT 1,
    subtotal     NUMERIC(12, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- =========================================================================
-- TABLE: public.leads
-- CRM: captures contact form submissions & showroom walk-ins
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.leads (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name         TEXT NOT NULL,
    email        TEXT,
    phone        TEXT,
    message      TEXT,
    interest     TEXT,           -- saree name / collection they're interested in
    status       public.lead_status NOT NULL DEFAULT 'new',
    source       TEXT NOT NULL DEFAULT 'contact_form',  -- 'contact_form', 'showroom', 'whatsapp', 'referral'
    assigned_to  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes  TEXT,
    followed_up_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sarees      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads       ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT COALESCE(
        (SELECT is_admin FROM public.profiles WHERE auth_user_id = auth.uid()),
        FALSE
    );
$$;

-- ---------- profiles ----------
CREATE POLICY "Public profiles are viewable by owner or admins"
    ON public.profiles FOR SELECT
    USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (TRUE);

-- ---------- artisans (public read) ----------
CREATE POLICY "Anyone can view active artisans"
    ON public.artisans FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage artisans"
    ON public.artisans FOR ALL
    USING (public.is_admin());

-- ---------- collections (public read) ----------
CREATE POLICY "Anyone can view active collections"
    ON public.collections FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage collections"
    ON public.collections FOR ALL
    USING (public.is_admin());

-- ---------- sarees (public read) ----------
CREATE POLICY "Anyone can view active sarees"
    ON public.sarees FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage sarees"
    ON public.sarees FOR ALL
    USING (public.is_admin());

-- ---------- orders ----------
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (
        profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Anyone can create an order"
    ON public.orders FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all orders"
    ON public.orders FOR ALL
    USING (public.is_admin());

-- ---------- order_items ----------
CREATE POLICY "Users can view own order items"
    ON public.order_items FOR SELECT
    USING (
        order_id IN (
            SELECT o.id FROM public.orders o
            JOIN public.profiles p ON p.id = o.profile_id
            WHERE p.auth_user_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "Anyone can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all order items"
    ON public.order_items FOR ALL
    USING (public.is_admin());

-- ---------- leads ----------
CREATE POLICY "Anyone can submit a lead"
    ON public.leads FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Admins can view and manage all leads"
    ON public.leads FOR ALL
    USING (public.is_admin());

-- =========================================================================
-- GRANT anon & authenticated roles access to public tables
-- =========================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.artisans    TO anon, authenticated;
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT SELECT ON public.sarees      TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles    TO authenticated;
GRANT SELECT, INSERT         ON public.orders      TO anon, authenticated;
GRANT SELECT, INSERT         ON public.order_items TO anon, authenticated;
GRANT INSERT                 ON public.leads        TO anon, authenticated;

-- =========================================================================
-- END OF SCHEMA
-- =========================================================================
