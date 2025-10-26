-- Make user_id nullable in orders table to allow guest orders
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Add columns for transaction info and address
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS transaction_id text,
ADD COLUMN IF NOT EXISTS delivery_address text;

-- Add policy to allow anyone to insert orders (guest orders)
CREATE POLICY "Anyone can insert orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (true);