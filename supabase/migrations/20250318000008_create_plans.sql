-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(10) NOT NULL,
  description TEXT,
  max_customers INTEGER NOT NULL,
  weekly_generations INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set RLS on plans table
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Plans can be read by anyone logged in
CREATE POLICY "Plans are viewable by authenticated users"
  ON public.plans
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default plans
INSERT INTO public.plans (name, description, max_customers, weekly_generations) VALUES
  ('S', 'Starter Plan - Basic features for small users', 10, 300),
  ('M', 'Medium Plan - Enhanced features for growing users', 25, 700),
  ('L', 'Large Plan - Advanced features for professional users', 50, 1500),
  ('XL', 'Enterprise Plan - Complete features for power users', 100, 3000);

-- Function to get plan by ID
CREATE OR REPLACE FUNCTION public.get_plan_by_id(plan_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'id', id,
      'name', name,
      'description', description,
      'max_customers', max_customers,
      'weekly_generations', weekly_generations,
      'created_at', created_at
    )
    FROM public.plans
    WHERE id = plan_id
  );
END;
$$; 