import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { categoryImage } from "@/lib/product-images";
import { useQuoteBasket } from "@/lib/quote-basket";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useQuoteBasket();
  const canPurchase =
    product.is_active &&
    product.retail_price != null &&
    Number.isFinite(Number(product.retail_price)) &&
    product.availability !== "out_of_stock";

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block overflow-hidden bg-surface"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={categoryImage(product.category?.slug, product.image_url)}
          alt=""
          width={800}
          height={600}
          loading="lazy"
          className="aspect-4/3 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {product.category?.name ?? "Uncategorised"}
        </p>
        <h3 className="mt-2 text-base font-extrabold leading-snug">
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>
        {product.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <AvailabilityBadge availability={product.availability} />
          <span className="text-sm font-extrabold">
            {canPurchase ? `Rs. ${Number(product.retail_price).toLocaleString()}` : "Price unavailable"}
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            className="flex-1 rounded-full font-bold"
            disabled={!canPurchase}
            title={!canPurchase ? "This product is not currently available to purchase" : undefined}
            onClick={() => {
              addItem(product);
              toast.success(`${product.name} added to your cart`);
            }}
          >
            Add to Cart
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-full font-bold">
            <Link to="/products/$slug" params={{ slug: product.slug }}>
              View Product
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
