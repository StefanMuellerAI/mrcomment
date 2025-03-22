/*
  # Migration zur Verwendung der vorhandenen user_roles-Tabelle
  
  1. Prüft, ob user_roles existiert und erstellt sie, falls nicht
  2. Fügt fehlende Spalten hinzu, falls nötig
  3. Fügt Funktionen für die Verwaltung von Benutzerrollen hinzu
  4. Sicher für Produktiv-Umgebungen
*/

-- Prüfen, ob user_roles existiert. Falls nicht, erstellen wir sie
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles'
  ) THEN
    CREATE TABLE public.user_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users NOT NULL,
      role_name text NOT NULL DEFAULT 'user',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Index für schnellere Suche
    CREATE INDEX idx_user_roles_user_id ON public.user_roles (user_id);
    
    -- RLS aktivieren
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    -- Policy für admin-Zugriff
    CREATE POLICY "Admins can do anything with roles"
      ON public.user_roles
      USING (
        (SELECT role_name FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
      );
      
    -- Selbst-Lesepolicy
    CREATE POLICY "Users can read their own role"
      ON public.user_roles
      FOR SELECT
      USING (user_id = auth.uid());
  ELSE
    -- Überprüfe, ob die role_name Spalte existiert, und füge sie hinzu falls nicht
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_roles' 
      AND column_name = 'role_name'
    ) THEN
      ALTER TABLE public.user_roles ADD COLUMN role_name text NOT NULL DEFAULT 'user';
      RAISE NOTICE 'Die Spalte role_name wurde zur user_roles-Tabelle hinzugefügt';
    ELSE
      RAISE NOTICE 'Die Spalte role_name existiert bereits in der user_roles-Tabelle';
    END IF;
    
    -- Überprüfe, ob updated_at Spalte existiert
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_roles' 
      AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE public.user_roles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
  END IF;
END
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean AS $$
DECLARE
  role text;
BEGIN
  SELECT role_name INTO role FROM public.user_roles WHERE user_id = uid;
  RETURN role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function if it exists before creating a new one
DROP FUNCTION IF EXISTS public.set_user_role(uuid, text);

-- Function to set a user's role (only admins can use this)
CREATE OR REPLACE FUNCTION public.set_user_role(user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role_name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;

  -- Check if user already has a role entry
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = set_user_role.user_id) THEN
    -- Update existing role
    UPDATE public.user_roles
    SET role_name = new_role, updated_at = now()
    WHERE user_id = set_user_role.user_id;
  ELSE
    -- Insert new role
    INSERT INTO public.user_roles (user_id, role_name)
    VALUES (set_user_role.user_id, new_role);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 