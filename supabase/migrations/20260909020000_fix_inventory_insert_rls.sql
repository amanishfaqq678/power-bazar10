-- Allow the product inventory-sync trigger to create its mirror row for staff.
-- The trigger is SECURITY INVOKER, so this remains protected by the caller's
-- authenticated staff/admin role.

DROP POLICY IF EXISTS "staff insert inventory" ON public.inventory;
CREATE POLICY "staff insert inventory" ON public.inventory
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

GRANT INSERT ON TABLE public.inventory TO authenticated;
