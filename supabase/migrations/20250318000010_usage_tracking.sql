-- Create generation_logs table to track usage
CREATE TABLE IF NOT EXISTS public.generation_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set RLS on generation_logs table
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own generation logs
CREATE POLICY "Users can view their own generation logs"
  ON public.generation_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own generation logs
CREATE POLICY "Users can insert their own generation logs"
  ON public.generation_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all generation logs
CREATE POLICY "Admins can view all generation logs"
  ON public.generation_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role_name = 'admin'
  ));

-- Function to log a generation
CREATE OR REPLACE FUNCTION public.log_generation()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.generation_logs (user_id)
  VALUES (auth.uid());
  
  RETURN TRUE;
END;
$$;

-- Function to check if a user can create a new customer
CREATE OR REPLACE FUNCTION public.can_create_customer()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_customer_count INTEGER;
  max_customers INTEGER;
BEGIN
  -- Get the user's current customer count
  SELECT COUNT(*)
  INTO current_customer_count
  FROM public.customers
  WHERE user_id = auth.uid();
  
  -- Get the user's plan max_customers
  SELECT p.max_customers
  INTO max_customers
  FROM public.user_plans up
  JOIN public.plans p ON up.plan_id = p.id
  WHERE up.user_id = auth.uid();
  
  -- Return whether the user can create another customer
  RETURN current_customer_count < max_customers;
END;
$$;

-- Function to check if a user can generate more comments this week
CREATE OR REPLACE FUNCTION public.can_generate_comments()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_week_generations INTEGER;
  weekly_generations_limit INTEGER;
BEGIN
  -- Get the count of generations for the current week
  SELECT COUNT(*)
  INTO current_week_generations
  FROM public.generation_logs
  WHERE user_id = auth.uid()
  AND timestamp > (NOW() - INTERVAL '7 days');
  
  -- Get the user's plan weekly_generations limit
  SELECT p.weekly_generations
  INTO weekly_generations_limit
  FROM public.user_plans up
  JOIN public.plans p ON up.plan_id = p.id
  WHERE up.user_id = auth.uid();
  
  -- Return whether the user can generate more comments
  RETURN current_week_generations < weekly_generations_limit;
END;
$$;

-- Function to get user's current usage
CREATE OR REPLACE FUNCTION public.get_user_usage(target_user_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_count INTEGER;
  max_customers INTEGER;
  weekly_generations INTEGER;
  weekly_generations_limit INTEGER;
  user_plan RECORD;
BEGIN
  -- Get user's plan info
  SELECT up.plan_id, p.max_customers, p.weekly_generations
  INTO user_plan
  FROM public.user_plans up
  JOIN public.plans p ON up.plan_id = p.id
  WHERE up.user_id = target_user_id;
  
  -- Get customer count
  SELECT COUNT(*)
  INTO customer_count
  FROM public.customers
  WHERE user_id = target_user_id;
  
  -- Get weekly generations count
  SELECT COUNT(*)
  INTO weekly_generations
  FROM public.generation_logs
  WHERE user_id = target_user_id
  AND timestamp > (NOW() - INTERVAL '7 days');
  
  -- Return the usage data
  RETURN jsonb_build_object(
    'customer_count', customer_count,
    'max_customers', user_plan.max_customers,
    'weekly_generations', weekly_generations,
    'weekly_generations_limit', user_plan.weekly_generations,
    'can_create_customer', customer_count < user_plan.max_customers,
    'can_generate_comments', weekly_generations < user_plan.weekly_generations
  );
END;
$$; 