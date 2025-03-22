-- EINFACHERE LÖSUNG FÜR ADMIN-DASHBOARD
-- Führe dieses SQL aus, um einen direkteren Ansatz zu implementieren

-- Lösche vorherige Funktionen, falls vorhanden
DROP FUNCTION IF EXISTS public.get_users();

-- Einfachere Funktion zum Abrufen von Benutzern für Admins
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS SETOF jsonb AS $$
BEGIN
  -- Nur Admins können diese Funktion nutzen
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role_name = 'admin'
  ) THEN
    RETURN QUERY 
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'created_at', to_char(u.created_at, 'YYYY-MM-DD"T"HH24:MI:SS')
    )
    FROM auth.users u;
  ELSE
    RAISE EXCEPTION 'Only admins can access user data';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 