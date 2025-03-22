/*
  # Admin-Funktion zum Erstellen von Benutzern
  
  Diese Funktion ermöglicht es Administratoren, neue Benutzer zu erstellen,
  ohne dass eine E-Mail-Bestätigung erforderlich ist.
*/

-- Bestehende Funktion löschen, falls vorhanden
DROP FUNCTION IF EXISTS public.admin_create_user(text, text, text, boolean);

-- Funktion zum Erstellen von Benutzern durch Administratoren
CREATE OR REPLACE FUNCTION public.admin_create_user(
  user_email text,
  user_password text,
  initial_role text DEFAULT 'user',
  skip_confirmation boolean DEFAULT true
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Nur Admins können diese Funktion nutzen
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role_name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Nur Administratoren können neue Benutzer erstellen.';
  END IF;

  -- UUID für den neuen Benutzer generieren
  new_user_id := gen_random_uuid();

  -- Benutzer in der auth.users Tabelle erstellen
  INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    encrypted_password
  ) VALUES (
    new_user_id,
    user_email,
    CASE WHEN skip_confirmation THEN now() ELSE NULL END, -- Email sofort bestätigt, wenn gewünscht
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    crypt(user_password, gen_salt('bf'))
  );

  -- Füge die Benutzerrolle hinzu
  INSERT INTO public.user_roles (user_id, role_name)
  VALUES (new_user_id, initial_role);

  -- Wenn E-Mail-Bestätigung erforderlich ist, füge einen Eintrag in auth.identities hinzu
  IF NOT skip_confirmation THEN
    -- TODO: Implement confirmation token logic if needed
    NULL;
  END IF;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
