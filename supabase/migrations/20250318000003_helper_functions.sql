-- Hilfsfunktionen für das Admin-Dashboard
-- Diese Funktionen bieten zusätzliche Sicherheit und Komfort

-- Funktion zum Abrufen der Rolle eines Benutzers
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id uuid)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  -- Prüfen, ob der Aufrufer ein Admin ist oder seine eigene Rolle abfragt
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role_name = 'admin'
  ) OR target_user_id = auth.uid() THEN
    -- Rolle aus der Datenbank abrufen
    SELECT role_name INTO user_role FROM public.user_roles 
    WHERE user_id = target_user_id;
    
    -- Falls keine Rolle gefunden wurde, 'user' zurückgeben
    RETURN COALESCE(user_role, 'user');
  ELSE
    -- Keine Berechtigung
    RAISE EXCEPTION 'Permission denied to view role';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 