-- Reconciled retail order backend for the production products schema.
-- products.retail_price is authoritative for pricing.
-- products.stock_quantity is authoritative for quantity; inventory.quantity is a synchronized management mirror.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role IN ('admin', 'staff')
  );
$$;

CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.inventory (product_id, quantity)
SELECT id, stock_quantity
FROM public.products
ON CONFLICT (product_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.sync_inventory_from_product()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.inventory (product_id, quantity)
  VALUES (NEW.id, NEW.stock_quantity)
  ON CONFLICT (product_id) DO UPDATE
    SET quantity = EXCLUDED.quantity, updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_inventory_sync_insert ON public.products;
CREATE TRIGGER products_inventory_sync_insert
AFTER INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_from_product();

DROP TRIGGER IF EXISTS products_inventory_sync_update ON public.products;
CREATE TRIGGER products_inventory_sync_update
AFTER UPDATE OF stock_quantity ON public.products
FOR EACH ROW
WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
EXECUTE FUNCTION public.sync_inventory_from_product();

CREATE OR REPLACE FUNCTION public.sync_product_from_inventory()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = NEW.quantity
  WHERE id = NEW.product_id
    AND stock_quantity IS DISTINCT FROM NEW.quantity;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inventory_product_sync ON public.inventory;
CREATE TRIGGER inventory_product_sync
AFTER UPDATE OF quantity ON public.inventory
FOR EACH ROW
WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
EXECUTE FUNCTION public.sync_product_from_inventory();

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  city text NOT NULL,
  subtotal numeric(12,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee numeric(12,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total numeric(12,2) NOT NULL CHECK (total >= 0),
  payment_method text NOT NULL CHECK (payment_method = 'cod'),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status text NOT NULL DEFAULT 'new' CHECK (order_status IN ('new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  customer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name_snapshot text NOT NULL,
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total numeric(12,2) NOT NULL CHECK (line_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_product_id_idx ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS inventory_updated_at_idx ON public.inventory(updated_at DESC);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff read inventory" ON public.inventory;
DROP POLICY IF EXISTS "staff update inventory" ON public.inventory;
CREATE POLICY "staff read inventory" ON public.inventory FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));
CREATE POLICY "staff update inventory" ON public.inventory FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff read orders" ON public.orders;
DROP POLICY IF EXISTS "staff update orders" ON public.orders;
CREATE POLICY "staff read orders" ON public.orders FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));
CREATE POLICY "staff update orders" ON public.orders FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff read order items" ON public.order_items;
CREATE POLICY "staff read order items" ON public.order_items FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

REVOKE ALL ON TABLE public.inventory, public.orders, public.order_items FROM anon;
GRANT SELECT, UPDATE ON public.inventory TO authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_cod_order(order_input jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order public.orders;
  requested_item jsonb;
  product_row public.products;
  item_quantity integer;
  item_total numeric(12,2);
  calculated_subtotal numeric(12,2) := 0;
  item_output jsonb := '[]'::jsonb;
BEGIN
  IF COALESCE(trim(order_input->>'customer_name'), '') = ''
    OR COALESCE(trim(order_input->>'phone'), '') = ''
    OR COALESCE(trim(order_input->>'address'), '') = ''
    OR COALESCE(trim(order_input->>'city'), '') = '' THEN
    RAISE EXCEPTION 'Name, phone, address and city are required';
  END IF;
  IF jsonb_typeof(order_input->'items') <> 'array' OR jsonb_array_length(order_input->'items') = 0 THEN
    RAISE EXCEPTION 'At least one product is required';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(order_input->'items') AS duplicate_item
    GROUP BY duplicate_item->>'product_id'
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Each product may only appear once in an order';
  END IF;

  FOR requested_item IN SELECT value FROM jsonb_array_elements(order_input->'items')
  LOOP
    item_quantity := (requested_item->>'quantity')::integer;
    IF item_quantity IS NULL OR item_quantity < 1 OR item_quantity > 1000 THEN
      RAISE EXCEPTION 'Invalid product quantity';
    END IF;

    SELECT * INTO product_row
    FROM public.products
    WHERE id = (requested_item->>'product_id')::uuid
    FOR UPDATE;

    IF NOT FOUND OR NOT product_row.is_active OR product_row.retail_price IS NULL THEN
      RAISE EXCEPTION 'Product is unavailable for purchase';
    END IF;
    IF product_row.stock_quantity < item_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for %', product_row.name;
    END IF;

    item_total := product_row.retail_price * item_quantity;
    calculated_subtotal := calculated_subtotal + item_total;
    UPDATE public.products
    SET stock_quantity = stock_quantity - item_quantity
    WHERE id = product_row.id;
  END LOOP;

  INSERT INTO public.orders (
    order_number, customer_name, phone, email, address, city,
    subtotal, total, payment_method, payment_status, order_status, customer_note
  )
  VALUES (
    'PB-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISS') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    trim(order_input->>'customer_name'),
    trim(order_input->>'phone'),
    nullif(trim(order_input->>'email'), ''),
    trim(order_input->>'address'),
    trim(order_input->>'city'),
    calculated_subtotal,
    calculated_subtotal,
    'cod',
    'pending',
    'new',
    nullif(trim(order_input->>'customer_note'), '')
  )
  RETURNING * INTO new_order;

  FOR requested_item IN SELECT value FROM jsonb_array_elements(order_input->'items')
  LOOP
    SELECT * INTO product_row
    FROM public.products
    WHERE id = (requested_item->>'product_id')::uuid;
    item_quantity := (requested_item->>'quantity')::integer;
    item_total := product_row.retail_price * item_quantity;
    INSERT INTO public.order_items (
      order_id, product_id, product_name_snapshot, unit_price, quantity, line_total
    )
    VALUES (
      new_order.id, product_row.id, product_row.name, product_row.retail_price,
      item_quantity, item_total
    )
    RETURNING jsonb_build_object(
      'id', id, 'product_id', product_id, 'product_name_snapshot', product_name_snapshot,
      'unit_price', unit_price, 'quantity', quantity, 'line_total', line_total
    ) INTO requested_item;
    item_output := item_output || jsonb_build_array(requested_item);
  END LOOP;

  RETURN jsonb_build_object(
    'id', new_order.id, 'order_number', new_order.order_number,
    'customer_name', new_order.customer_name, 'phone', new_order.phone,
    'email', new_order.email, 'address', new_order.address, 'city', new_order.city,
    'subtotal', new_order.subtotal, 'delivery_fee', new_order.delivery_fee,
    'total', new_order.total, 'payment_method', new_order.payment_method,
    'payment_status', new_order.payment_status, 'order_status', new_order.order_status,
    'customer_note', new_order.customer_note, 'created_at', new_order.created_at,
    'items', item_output
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_cod_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_cod_order(jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.prevent_order_financial_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.id <> OLD.id
    OR NEW.order_number <> OLD.order_number
    OR NEW.customer_name <> OLD.customer_name
    OR NEW.phone <> OLD.phone
    OR NEW.email IS DISTINCT FROM OLD.email
    OR NEW.address <> OLD.address
    OR NEW.city <> OLD.city
    OR NEW.subtotal <> OLD.subtotal
    OR NEW.delivery_fee <> OLD.delivery_fee
    OR NEW.total <> OLD.total
    OR NEW.payment_method <> OLD.payment_method
    OR NEW.payment_status <> OLD.payment_status
    OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Order identity, customer, payment and totals are immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inventory_updated ON public.inventory;
CREATE TRIGGER inventory_updated BEFORE UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS orders_updated ON public.orders;
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS orders_financial_fields_immutable ON public.orders;
CREATE TRIGGER orders_financial_fields_immutable BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.prevent_order_financial_mutation();
