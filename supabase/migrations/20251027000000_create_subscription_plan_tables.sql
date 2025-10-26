-- Create normal_subscriptions table
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

-- Create premium_subscriptions table
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_normal_subscriptions_user_id ON normal_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_normal_subscriptions_status ON normal_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_normal_subscriptions_created_at ON normal_subscriptions(created_at);

CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status ON premium_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_created_at ON premium_subscriptions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE normal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for normal_subscriptions
CREATE POLICY "Users can view their own normal subscriptions"
    ON normal_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own normal subscriptions"
    ON normal_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own normal subscriptions"
    ON normal_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for premium_subscriptions
CREATE POLICY "Users can view their own premium subscriptions"
    ON premium_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own premium subscriptions"
    ON premium_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own premium subscriptions"
    ON premium_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_normal_subscriptions_updated_at
    BEFORE UPDATE ON normal_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_subscriptions_updated_at
    BEFORE UPDATE ON premium_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
