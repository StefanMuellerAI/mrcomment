-- Behebung des 'ambiguous column' Fehlers in der set_user_role Funktion

-- Alte Funktion löschen, falls vorhanden
DROP FUNCTION IF EXISTS public.set_user_role(uuid, text);

-- Korrekte Version der Funktion erstellen
CREATE OR REPLACE FUNCTION public.set_user_role(target_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role_name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;

  -- Check if user already has a role entry
  IF EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = target_id) THEN
    -- Update existing role
    UPDATE public.user_roles
    SET role_name = new_role, updated_at = now()
    WHERE user_id = target_id;
  ELSE
    -- Insert new role
    INSERT INTO public.user_roles (user_id, role_name)
    VALUES (target_id, new_role);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 