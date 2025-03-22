/*
  # Admin-Zugriff auf Benutzerdaten
  
  1. View für Benutzerdaten mit Sicherheitseinschränkungen
  2. Funktionen für sicheren Zugriff auf Benutzer
*/

-- View für Admin-Zugriff auf Benutzerdaten
CREATE OR REPLACE VIEW public.admin_users AS
SELECT 
  id,
  email,
  created_at
FROM 
  auth.users;

-- RLS für admin_users view aktivieren
ALTER VIEW public.admin_users SET (security_invoker = on);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_users();

-- Funktion zum Abrufen von Benutzern für Admins
CREATE OR REPLACE FUNCTION public.get_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at text
) AS $$
BEGIN
  -- Nur Admins können diese Funktion nutzen
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role_name = 'admin'
  ) THEN
    RETURN QUERY SELECT 
      au.id, 
      au.email::text, 
      au.created_at::text 
    FROM public.admin_users au;
  ELSE
    RAISE EXCEPTION 'Only admins can access user data';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 