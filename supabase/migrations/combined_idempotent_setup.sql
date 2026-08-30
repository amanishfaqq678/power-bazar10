-- Idempotent combined SQL for Power Bazar schema
-- Safe to re-run (attempts to avoid errors on existing objects)
-- Prereq: run in a Supabase project with auth and storage available.

-- Ensure gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

------------------------
-- ENUM: app_role
------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    EXECUTE $$CREATE TYPE public.app_role AS ENUM ('admin','staff');$$;
  END IF;
END;
$$ LANGUAGE plpgsql;

------------------------
-- Functions (create-or-replace is safe)
------------------------
-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- is_staff
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'));
$$;

-- set_updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (user_id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

------------------------
-- Tables (IF NOT EXISTS where supported)
------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sku text,
  price numeric(12,2),
  price_available boolean NOT NULL DEFAULT false,
  availability text NOT NULL DEFAULT 'in_stock',
  stock_quantity int NOT NULL DEFAULT 0,
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url text,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 0,
  low_stock_threshold int NOT NULL DEFAULT 10,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity int,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text,
  quantity int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

------------------------
-- Grants (idempotent)
------------------------
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;

GRANT SELECT ON public.inventory TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;

GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;

GRANT INSERT ON public.quote_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_items TO authenticated;
GRANT ALL ON public.quote_items TO service_role;

------------------------
-- Enable RLS (idempotent)
------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

------------------------
-- Policies (create only if missing)
------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own profile' AND schemaname = 'public' AND tablename = 'profiles') THEN
    EXECUTE $$CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read own roles' AND schemaname = 'public' AND tablename = 'user_roles') THEN
    EXECUTE $$CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);$$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'categories public read' AND schemaname = 'public' AND tablename = 'categories') THEN
    EXECUTE $$CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'categories staff write' AND schemaname = 'public' AND tablename = 'categories') THEN
    EXECUTE $$CREATE POLICY "categories staff write" ON public.categories FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));$$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'products public read' AND schemaname = 'public' AND tablename = 'products') THEN
    EXECUTE $$CREATE POLICY "products public read" ON public.products FOR SELECT USING (true);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'products staff write' AND schemaname = 'public' AND tablename = 'products') THEN
    EXECUTE $$CREATE POLICY "products staff write" ON public.products FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));$$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'product_images public read' AND schemaname = 'public' AND tablename = 'product_images') THEN
    EXECUTE $$CREATE POLICY "product_images public read" ON public.product_images FOR SELECT USING (true);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'product_images staff write' AND schemaname = 'public' AND tablename = 'product_images') THEN
    EXECUTE $$CREATE POLICY "product_images staff write" ON public.product_images FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));$$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'inventory public read' AND schemaname = 'public' AND tablename = 'inventory') THEN
    EXECUTE $$CREATE POLICY "inventory public read" ON public.inventory FOR SELECT USING (true);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'inventory staff write' AND schemaname = 'public' AND tablename = 'inventory') THEN
    EXECUTE $$CREATE POLICY "inventory staff write" ON public.inventory FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));$$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anyone can submit inquiry' AND schemaname = 'public' AND tablename = 'inquiries') THEN
    EXECUTE $$CREATE POLICY "anyone can submit inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff read inquiries' AND schemaname = 'public' AND tablename = 'inquiries') THEN
    EXECUTE $$CREATE POLICY "staff read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff update inquiries' AND schemaname = 'public' AND tablename = 'inquiries') THEN
    EXECUTE $$CREATE POLICY "staff update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff delete inquiries' AND schemaname = 'public' AND tablename = 'inquiries') THEN
    EXECUTE $$CREATE POLICY "staff delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));$$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anyone can add quote items' AND schemaname = 'public' AND tablename = 'quote_items') THEN
    EXECUTE $$CREATE POLICY "anyone can add quote items" ON public.quote_items FOR INSERT WITH CHECK (true);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff read quote items' AND schemaname = 'public' AND tablename = 'quote_items') THEN
    EXECUTE $$CREATE POLICY "staff read quote items" ON public.quote_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff manage quote items' AND schemaname = 'public' AND tablename = 'quote_items') THEN
    EXECUTE $$CREATE POLICY "staff manage quote items" ON public.quote_items FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));$$;
  END IF;
END;
$$ LANGUAGE plpgsql;

------------------------
-- Triggers (create only if missing)
------------------------
-- categories_updated
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'categories_updated') THEN
    EXECUTE $$CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'products_updated') THEN
    EXECUTE $$CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'inventory_updated') THEN
    EXECUTE $$CREATE TRIGGER inventory_updated BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'inquiries_updated') THEN
    EXECUTE $$CREATE TRIGGER inquiries_updated BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();$$;
  END IF;

  -- Trigger on auth.users for handle_new_user.
  -- This requires the auth schema/table to exist. Check before trying to create.
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'auth' AND c.relname = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
      EXECUTE $$CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();$$;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

------------------------
-- Revoke function privileges (only if function exists)
------------------------
DO $$
DECLARE
  fcount int;
BEGIN
  SELECT count(*) INTO fcount FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'has_role' AND n.nspname = 'public';
  IF fcount > 0 THEN
    EXECUTE $$REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;$$;
  END IF;

  SELECT count(*) INTO fcount FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'is_staff' AND n.nspname = 'public';
  IF fcount > 0 THEN
    EXECUTE $$REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;$$;
  END IF;

  SELECT count(*) INTO fcount FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'handle_new_user' AND n.nspname = 'public';
  IF fcount > 0 THEN
    EXECUTE $$REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;$$;
  END IF;
END;
$$ LANGUAGE plpgsql;

------------------------
-- Storage policies for bucket 'product-images' (create if missing)
------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff read product images' AND schemaname = 'storage' AND tablename = 'objects') THEN
    EXECUTE $$CREATE POLICY "staff read product images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-images' AND public.is_staff(auth.uid()));$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff upload product images' AND schemaname = 'storage' AND tablename = 'objects') THEN
    EXECUTE $$CREATE POLICY "staff upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.is_staff(auth.uid()));$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff update product images' AND schemaname = 'storage' AND tablename = 'objects') THEN
    EXECUTE $$CREATE POLICY "staff update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.is_staff(auth.uid()));$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff delete product images' AND schemaname = 'storage' AND tablename = 'objects') THEN
    EXECUTE $$CREATE POLICY "staff delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.is_staff(auth.uid()));$$;
  END IF;
END;
$$ LANGUAGE plpgsql;

------------------------
-- Seed data (safe: uses ON CONFLICT DO NOTHING)
------------------------
-- categories seed
INSERT INTO public.categories (name, slug, description, sort_order)
VALUES
 ('LED Lighting','led-lighting','Energy-efficient bulbs, panels and battens for homes, shops and offices.',1),
 ('Switches & Sockets','switches-sockets','Modular and classic switches, sockets and cover plates for everyday wiring.',2),
 ('Power & Extension','power-extension','Extension boards, multi-plugs and power strips for flexible power access.',3),
 ('Electrical Protection','electrical-protection','Breakers, safety devices and distribution components that protect circuits.',4),
 ('Wiring & Accessories','wiring-accessories','Cables, conduits, connectors and installation accessories.',5),
 ('Home Electrical','home-electrical','Everyday electrical items for residential use and small installations.',6),
 ('Electrical Accessories','electrical-accessories','Supporting accessories, fittings and spares for electrical work.',7)
ON CONFLICT (slug) DO NOTHING;

-- products seed (match categories by slug)
INSERT INTO public.products (name, slug, description, category_id, sku, availability, stock_quantity, featured, specifications)
SELECT v.name, v.slug, v.description, c.id, v.sku, v.availability, v.qty, v.featured, v.specs::jsonb
FROM (VALUES
 ('PB LED Bulb 9W','pb-led-bulb-9w','Everyday 9W LED bulb with warm, even light output and low power draw.','led-lighting','PB-LED-B9','in_stock', 480, true,  '{"Wattage":"9W","Base":"B22","Colour Temperature":"3000K / 6500K","Warranty":"Prototype data"}'),
 ('PB LED Panel 12W','pb-led-panel-12w','Slim recessed 12W panel light for clean ceiling installations.','led-lighting','PB-LED-P12','in_stock', 220, true, '{"Wattage":"12W","Shape":"Round","Cut-out":"105mm","Colour Temperature":"6500K"}'),
 ('PB LED Batten 20W','pb-led-batten-20w','Linear 20W batten for corridors, shops and workspaces.','led-lighting','PB-LED-T20','in_stock', 140, false, '{"Wattage":"20W","Length":"4ft","Body":"Polycarbonate"}'),
 ('PB Classic 1-Gang Switch','pb-classic-1-gang-switch','Durable single-gang switch with smooth action and secure terminals.','switches-sockets','PB-SW-1G','in_stock', 900, true, '{"Gangs":"1","Rating":"10A","Finish":"White"}'),
 ('PB Modular Double Socket','pb-modular-double-socket','Two-outlet modular socket suitable for rooms, shops and offices.','switches-sockets','PB-SO-2M','in_stock', 350, true, '{"Outlets":"2","Rating":"16A","Type":"Modular"}'),
 ('PB Modular Switch Board','pb-modular-switch-board','Pre-assembled modular board for quick room wiring.','switches-sockets','PB-SB-6M','low_stock', 18, false, '{"Modules":"6","Plate":"Polycarbonate"}'),
 ('PB Extension Board 4-Way','pb-extension-board-4-way','Four-way extension board with sturdy body and long lead.','power-extension','PB-EX-4W','in_stock', 260, true, '{"Sockets":"4","Cable":"1.5m","Rating":"10A"}'),
 ('PB Extension Board 6-Way','pb-extension-board-6-way','Six-way extension board with individual switching.','power-extension','PB-EX-6W','in_stock', 130, false, '{"Sockets":"6","Cable":"3m","Rating":"10A"}'),
 ('PB Multi-Plug Adaptor','pb-multi-plug-adaptor','Compact adaptor to expand a single outlet into multiple.','power-extension','PB-MP-3W','low_stock', 12, false, '{"Sockets":"3","Rating":"6A"}'),
 ('PB Miniature Circuit Breaker 16A','pb-mcb-16a','Single-pole circuit breaker for overload and short-circuit protection.','electrical-protection','PB-MCB-16','in_stock', 200, true, '{"Rating":"16A","Poles":"1","Breaking Capacity":"Prototype data"}'),
 ('PB Distribution Box 4-Way','pb-distribution-box-4-way','Wall-mount distribution enclosure for small installations.','electrical-protection','PB-DB-4','in_stock', 60, false, '{"Ways":"4","Mount":"Surface"}'),
 ('PB Copper Wire 1.5mm','pb-copper-wire-1-5mm','Insulated copper wire for general household wiring runs.','wiring-accessories','PB-WR-15','in_stock', 400, false, '{"Size":"1.5mm²","Length":"90m coil","Conductor":"Copper"}'),
 ('PB PVC Conduit Pipe 20mm','pb-pvc-conduit-20mm','Rigid PVC conduit for protected cable routing.','wiring-accessories','PB-CN-20','out_of_stock', 0, false, '{"Diameter":"20mm","Length":"3m"}'),
 ('PB Ceiling Rose','pb-ceiling-rose','Simple ceiling rose fitting for pendant installations.','home-electrical','PB-CR-01','in_stock', 300, false, '{"Terminals":"3","Finish":"White"}')
) AS v(name, slug, description, cat_slug, sku, availability, qty, featured, specs)
JOIN public.categories c ON c.slug = v.cat_slug
ON CONFLICT (slug) DO NOTHING;

-- inventory seed (only insert if missing)
INSERT INTO public.inventory (product_id, quantity, low_stock_threshold)
SELECT p.id, p.stock_quantity, 25
FROM public.products p
LEFT JOIN public.inventory i ON i.product_id = p.id
WHERE i.product_id IS NULL;

------------------------
-- Notes: final checks and reminders
------------------------
-- 1) The script checks for and avoids duplicate creation in most cases.
-- 2) It uses CREATE OR REPLACE for functions (so definitions are kept consistent).
-- 3) Policies and triggers are created only if missing.
-- 4) Seed inserts use ON CONFLICT DO NOTHING (won't override existing seeded rows).
-- 5) The 'on_auth_user_created' trigger is only created if auth.users exists.
-- 6) Storage policies assume the storage schema/table (storage.objects) exists (Supabase default).
-- 7) The script does not drop or alter existing objects in ways that would remove data.

-- If you need a variant that forcibly recreates objects (DROP + CREATE) or a version
-- that uses ALTERs to update existing objects, say so and that can be produced separately.
