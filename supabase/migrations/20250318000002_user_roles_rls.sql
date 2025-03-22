-- RLS-Policies für user_roles-Tabelle
-- Diese Policies erlauben Admins, alle Rollen zu sehen

-- Überprüfen, ob RLS für user_roles aktiviert ist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'user_roles'
    AND rowsecurity = true
  ) THEN
    -- RLS aktivieren, falls nicht aktiviert
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Bestehende Policies löschen (falls vorhanden)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Policy für Admins, um alle Rollen zu sehen
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role_name = 'admin'
  )
);

-- Policy für Benutzer, um ihre eigene Rolle zu sehen
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Policy für Admins, um Rollen zu bearbeiten
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role_name = 'admin'
  )
);

-- Policy für Admins, um neue Rollen zu erstellen
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role_name = 'admin'
  )
); 