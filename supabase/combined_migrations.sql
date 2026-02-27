-- ============================================================
-- COMBINED MIGRATIONS FOR NEW SUPABASE PROJECT
-- Run this entire script in the Supabase SQL Editor
-- https://supabase.com/dashboard/project/druhhquhzyurgonpclmb/sql
-- ============================================================

-- ============================================================
-- MIGRATION 1: Core tables (profiles, period_data, orders)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.period_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cycle_length INTEGER NOT NULL DEFAULT 28,
  next_period_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.period_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own period data" ON public.period_data;
CREATE POLICY "Users can view own period data"
  ON public.period_data FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own period data" ON public.period_data;
CREATE POLICY "Users can insert own period data"
  ON public.period_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own period data" ON public.period_data;
CREATE POLICY "Users can update own period data"
  ON public.period_data FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own period data" ON public.period_data;
CREATE POLICY "Users can delete own period data"
  ON public.period_data FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_period_data_updated_at
  BEFORE UPDATE ON public.period_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- MIGRATION 2: Subscriptions table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  pad_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  delivery_date DATE NOT NULL,
  subscription_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  payment_notification_date DATE NOT NULL,
  card_last_four TEXT,
  bkash_number TEXT,
  nagad_number TEXT,
  delivery_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can delete own subscriptions"
ON public.subscriptions FOR DELETE
USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE OR REPLACE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- MIGRATION 3: Roles, products, admin policies
-- ============================================================

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view products" ON public.products;
CREATE POLICY "Everyone can view products"
ON public.products FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS last_delivery_date DATE,
ADD COLUMN IF NOT EXISTS next_delivery_date DATE;

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can update all subscriptions"
ON public.subscriptions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- MIGRATION 4: Guest orders + transaction info
-- ============================================================

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS transaction_id text,
ADD COLUMN IF NOT EXISTS delivery_address text;

DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders"
ON public.orders FOR INSERT
TO public
WITH CHECK (true);

-- ============================================================
-- MIGRATION 5: normal_subscriptions & premium_subscriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS normal_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_packs TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2),
    line_total DECIMAL(10, 2),
    monthly_total DECIMAL(10, 2),
    subscription_price DECIMAL(10, 2) DEFAULT 100.00,
    delivery_date DATE,
    status TEXT DEFAULT 'active',
    payment_method TEXT,
    transaction_id TEXT,
    bkash_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS premium_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_packs TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2),
    line_total DECIMAL(10, 2),
    monthly_total DECIMAL(10, 2),
    subscription_price DECIMAL(10, 2),
    delivery_date DATE,
    status TEXT DEFAULT 'active',
    payment_method TEXT,
    transaction_id TEXT,
    bkash_number TEXT,
    priority_delivery BOOLEAN DEFAULT true,
    wellness_products BOOLEAN DEFAULT true,
    support_24_7 BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_normal_subscriptions_user_id ON normal_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_normal_subscriptions_status ON normal_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_normal_subscriptions_created_at ON normal_subscriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status ON premium_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_created_at ON premium_subscriptions(created_at);

ALTER TABLE normal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own normal subscriptions" ON normal_subscriptions;
CREATE POLICY "Users can view their own normal subscriptions"
    ON normal_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own normal subscriptions" ON normal_subscriptions;
CREATE POLICY "Users can insert their own normal subscriptions"
    ON normal_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own normal subscriptions" ON normal_subscriptions;
CREATE POLICY "Users can update their own normal subscriptions"
    ON normal_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own premium subscriptions" ON premium_subscriptions;
CREATE POLICY "Users can view their own premium subscriptions"
    ON premium_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own premium subscriptions" ON premium_subscriptions;
CREATE POLICY "Users can insert their own premium subscriptions"
    ON premium_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own premium subscriptions" ON premium_subscriptions;
CREATE POLICY "Users can update their own premium subscriptions"
    ON premium_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_normal_subscriptions_updated_at ON normal_subscriptions;
CREATE TRIGGER update_normal_subscriptions_updated_at
    BEFORE UPDATE ON normal_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_premium_subscriptions_updated_at ON premium_subscriptions;
CREATE OR REPLACE TRIGGER update_premium_subscriptions_updated_at
    BEFORE UPDATE ON premium_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MIGRATION 6: delivery_date column on orders
-- ============================================================

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_date TEXT;
