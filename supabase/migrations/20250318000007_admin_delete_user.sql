/*
  # Admin-Funktion zum Löschen von Benutzern
  
  Diese Funktion ermöglicht es Administratoren, Benutzer und ihre zugehörigen Daten zu löschen.
*/

-- Bestehende Funktion löschen, falls vorhanden
DROP FUNCTION IF EXISTS public.admin_delete_user(uuid);

-- Funktion zum Löschen von Benutzern durch Administratoren
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id uuid
)
RETURNS boolean AS $$
BEGIN
  -- Nur Admins können diese Funktion nutzen
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role_name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Nur Administratoren können Benutzer löschen.';
  END IF;

  -- Verhindern, dass Admins sich selbst löschen
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Administratoren können sich nicht selbst löschen.';
  END IF;

  -- Zuerst die Benutzerrolle löschen
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id;
  
  -- Dann Kunden löschen
  DELETE FROM public.customers
  WHERE user_id = target_user_id;
  
  -- Schließlich den Benutzer aus auth.users löschen
  DELETE FROM auth.users
  WHERE id = target_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
