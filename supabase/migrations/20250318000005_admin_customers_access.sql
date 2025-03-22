/*
  # Admin-Zugriff auf Kunden-Tabelle
  
  Diese Migration fügt Row Level Security (RLS) Policies für die customers-Tabelle hinzu,
  damit Administratoren auf alle Kundendaten zugreifen können.
*/

-- Überprüfen, ob RLS für customers aktiviert ist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'customers'
    AND rowsecurity = true
  ) THEN
    -- RLS aktivieren, falls nicht aktiviert
    ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Bestehende Admin-Policy löschen (falls vorhanden)
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;

-- Policy für Admins, um alle Kunden zu sehen
CREATE POLICY "Admins can view all customers"
ON public.customers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role_name = 'admin'
  )
);

-- Bestehende User-Policy löschen und neu erstellen (falls nötig)
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;

-- Policy für Benutzer, um ihre eigenen Kunden zu sehen
CREATE POLICY "Users can view their own customers"
ON public.customers
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Auch Insert/Update/Delete Policies für Admins hinzufügen
DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;

-- Policy für Admins, um alle Kunden zu verwalten
CREATE POLICY "Admins can manage all customers"
ON public.customers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role_name = 'admin'
  )
);
