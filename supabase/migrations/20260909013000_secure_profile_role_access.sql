-- Keep profile roles controlled by trusted database/auth tooling.
-- Admin clients only need to read the current user's own role.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.profiles FROM anon, authenticated;

DROP POLICY IF EXISTS "users read own profile" ON public.profiles;
CREATE POLICY "users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());
