-- ============================================================
-- COMPREHENSIVE FIX — ALL TABLES + SCHEMA CACHE RELOAD
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- ─── 1. Add any missing columns to subscriptions ─────────────────────────────
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_name TEXT,
  ADD COLUMN IF NOT EXISTS total_price NUMERIC,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS pad_type TEXT,
  ADD COLUMN IF NOT EXISTS quantity INTEGER,
  ADD COLUMN IF NOT EXISTS delivery_date DATE,
  ADD COLUMN IF NOT EXISTS subscription_start_date DATE,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_notification_date DATE,
  ADD COLUMN IF NOT EXISTS card_last_four TEXT,
  ADD COLUMN IF NOT EXISTS bkash_number TEXT,
  ADD COLUMN IF NOT EXISTS nagad_number TEXT,
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS last_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS next_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS next_delivery DATE,
  ADD COLUMN IF NOT EXISTS status TEXT;

-- ─── 2. Drop NOT NULL constraints + set defaults on every optional column ─────
--    (The original migration had many NOT NULL columns; the code doesn't always
--     send all of them — this makes every column safely nullable with fallbacks)

ALTER TABLE public.subscriptions
  ALTER COLUMN plan_name DROP NOT NULL,
  ALTER COLUMN plan_name SET DEFAULT 'Basic',
  ALTER COLUMN total_price DROP NOT NULL,
  ALTER COLUMN total_price SET DEFAULT 0,
  ALTER COLUMN full_name DROP NOT NULL,
  ALTER COLUMN full_name SET DEFAULT '',
  ALTER COLUMN pad_type DROP NOT NULL,
  ALTER COLUMN pad_type SET DEFAULT '',
  ALTER COLUMN delivery_date DROP NOT NULL,
  ALTER COLUMN delivery_address DROP NOT NULL,
  ALTER COLUMN delivery_address SET DEFAULT '',
  ALTER COLUMN payment_method DROP NOT NULL,
  ALTER COLUMN payment_method SET DEFAULT '',
  ALTER COLUMN payment_notification_date DROP NOT NULL,
  ALTER COLUMN next_delivery DROP NOT NULL,
  ALTER COLUMN next_delivery SET DEFAULT CURRENT_DATE,
  ALTER COLUMN next_delivery_date DROP NOT NULL,
  ALTER COLUMN status SET DEFAULT 'active';

-- ─── 3. Add any missing columns to orders ────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_status TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_date TEXT;

-- Drop NOT NULL from orders columns that may cause issues
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN delivery_status DROP NOT NULL,
  ALTER COLUMN delivery_status SET DEFAULT 'pending';

-- ─── 4. Force PostgREST to reload its schema cache ───────────────────────────
NOTIFY pgrst, 'reload schema';

