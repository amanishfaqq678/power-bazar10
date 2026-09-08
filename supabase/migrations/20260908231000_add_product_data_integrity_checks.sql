-- Enforce the canonical product pricing and stock invariants at the database layer.
-- NULL prices remain valid for products without published retail pricing.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.products'::regclass
      AND conname = 'products_retail_price_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_retail_price_nonnegative
      CHECK (retail_price IS NULL OR retail_price >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.products'::regclass
      AND conname = 'products_wholesale_price_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_wholesale_price_nonnegative
      CHECK (wholesale_price IS NULL OR wholesale_price >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.products'::regclass
      AND conname = 'products_stock_quantity_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_stock_quantity_nonnegative
      CHECK (stock_quantity >= 0);
  END IF;
END
$$;
