-- Create user_plans table to associate users with plans
CREATE TABLE IF NOT EXISTS public.user_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE, -- NULL means indefinite
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id) -- Each user can only have one active plan
);

-- Set RLS on user_plans table
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own plan
CREATE POLICY "Users can view their own plan"
  ON public.user_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all user plans
CREATE POLICY "Admins can view all user plans"
  ON public.user_plans
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role_name = 'admin'
  ));

-- Only admins can update user plans
CREATE POLICY "Admins can update user plans"
  ON public.user_plans
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role_name = 'admin'
  ));

-- Only admins can insert user plans
CREATE POLICY "Admins can insert user plans"
  ON public.user_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role_name = 'admin'
  ));

-- Function to get the default plan ID (Plan S)
CREATE OR REPLACE FUNCTION public.get_default_plan_id()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM public.plans WHERE name = 'S' LIMIT 1;
$$;

-- Function to automatically assign Plan S to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_plan_id INTEGER;
BEGIN
  -- Get the default plan ID (Plan S)
  default_plan_id := public.get_default_plan_id();
  
  -- Insert new user with default plan
  INSERT INTO public.user_plans (user_id, plan_id)
  VALUES (NEW.id, default_plan_id);
  
  RETURN NEW;
END;
$$;

-- Trigger to assign Plan S to new users
DO $$
BEGIN
  -- Check if the trigger already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    -- Create the trigger only if it doesn't exist
    EXECUTE 'CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user()';
  END IF;
END;
$$;

-- Function to get user's current plan
CREATE OR REPLACE FUNCTION public.get_user_plan(target_user_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan_record RECORD;
  plan_data JSONB;
BEGIN
  -- Check if user exists and get their plan
  SELECT up.id, up.plan_id, up.start_date, up.end_date
  INTO user_plan_record
  FROM public.user_plans up
  WHERE up.user_id = target_user_id
  LIMIT 1;
  
  -- If no plan found, return null
  IF user_plan_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get plan details
  plan_data := public.get_plan_by_id(user_plan_record.plan_id);
  
  -- Return combined data
  RETURN jsonb_build_object(
    'user_plan_id', user_plan_record.id,
    'start_date', user_plan_record.start_date,
    'end_date', user_plan_record.end_date,
    'plan', plan_data
  );
END;
$$;

-- Assign all existing users to Plan S
DO $$
DECLARE
  default_plan_id INTEGER;
BEGIN
  -- Get the default plan ID (Plan S)
  default_plan_id := public.get_default_plan_id();
  
  -- Insert for all existing users who don't already have a plan
  INSERT INTO public.user_plans (user_id, plan_id)
  SELECT id, default_plan_id
  FROM auth.users
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_plans WHERE user_id = auth.users.id
  );
END;
$$; 