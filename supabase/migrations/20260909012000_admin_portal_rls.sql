-- Admin portal authorization. Apply only after reviewing the existing policies.
-- Roles are stored in public.profiles.role and checked through the existing
-- SECURITY DEFINER public.is_staff helper.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff manage products" ON public.products;
CREATE POLICY "staff manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff manage categories" ON public.categories;
CREATE POLICY "staff manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff manage product images" ON public.product_images;
CREATE POLICY "staff manage product images" ON public.product_images
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- Keep public catalogue reads limited to published records.
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "public read active products" ON public.products;
CREATE POLICY "public read active products" ON public.products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "public read categories" ON public.categories;
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "public read categories" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public read product images" ON public.product_images;
DROP POLICY IF EXISTS "Public Read Product Images" ON public.product_images;
CREATE POLICY "public read product images" ON public.product_images
  FOR SELECT TO anon, authenticated
  USING (true);

-- Storage policy for the existing product-images bucket. The bucket itself is
-- intentionally not created here because its current production configuration
-- must be verified first.
DROP POLICY IF EXISTS "staff manage product image files" ON storage.objects;
CREATE POLICY "staff manage product image files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'product-images' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'product-images' AND public.is_staff(auth.uid()));
