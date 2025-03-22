-- Dieses Skript setzt den Admin-Status für einen bestehenden Benutzer
-- Führe dieses Script nur einmal aus, um den ersten Admin zu erstellen
-- VORSICHT: Für Produktivumgebungen

DO $$
DECLARE
  admin_id uuid;
  admin_email text := 'admin@example.com'; -- WICHTIG: Diese E-Mail-Adresse anpassen!
BEGIN
  -- Get user ID from email
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  
  -- Check if user exists
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Benutzer mit E-Mail % wurde nicht gefunden', admin_email;
  END IF;
  
  -- Check if user already has a role entry
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = admin_id) THEN
    -- Update existing role
    UPDATE public.user_roles
    SET role_name = 'admin', updated_at = now()
    WHERE user_id = admin_id;
    
    RAISE NOTICE 'Benutzer % wurde zum Admin aktualisiert', admin_email;
  ELSE
    -- Insert new role
    INSERT INTO public.user_roles (user_id, role_name)
    VALUES (admin_id, 'admin');
    
    RAISE NOTICE 'Benutzer % wurde als Admin hinzugefügt', admin_email;
  END IF;
END;
$$; 