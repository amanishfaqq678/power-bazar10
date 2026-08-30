import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { fetchProductBySlug } from "@/lib/api";
import { useQuoteBasket } from "@/lib/quote-basket";
import { Button } from "@/components/ui/button";
import { AvailabilityBadge } from "@/components/catalog/AvailabilityBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { addItem } = useQuoteBasket();

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  const product = productQuery.data;

  if (productQuery.isLoading) {
    return (
      <SiteLayout>
        <div className="container-pb py-20">
          <div className="max-w-3xl">
            <p className="text-muted">Loading product…</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <SiteLayout>
        <div className="container-pb py-20">
          <div className="max-w-3xl">
            <h2 className="text-xl font-extrabold">Product not found</h2>
            <p className="mt-2 text-muted">
              This product may have been removed or the link is incorrect.
            </p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const currentProduct = product;

  function handleAddToQuote() {
    if (!currentProduct) return;
    addItem(currentProduct, 1);
    toast.success(`${currentProduct.name} added to your quote request`);
  }

  return (
    <SiteLayout>
      <PageHeader
        title={product.name}
        {...(product.category?.name ? { eyebrow: product.category.name } : {})}
        {...(product.description ? { description: product.description } : {})}
      />

      <section className="container-pb py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                width={1200}
                height={900}
                className="w-full rounded-xl object-contain"
              />
            ) : (
              <div className="h-60 w-full rounded-xl bg-surface" />
            )}

            {product.description ? (
              <div className="mt-6 prose max-w-none text-muted-foreground">
                {product.description}
              </div>
            ) : null}

            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Specifications</h3>
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-border py-2">
                      <dt className="font-semibold text-sm text-muted-foreground">{k}</dt>
                      <dd className="text-sm">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>

          <aside className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <AvailabilityBadge availability={product.availability} />
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="mt-1 text-lg font-extrabold">
                  {product.price_available && product.price != null
                    ? `PKR ${Number(product.price).toLocaleString()}`
                    : "Request Price"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1 rounded-full font-bold" onClick={handleAddToQuote}>
                Add to Quote
              </Button>
              <Button asChild variant="outline" className="rounded-full font-bold">
                <a href="/products">Back to catalogue</a>
              </Button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Pricing is confirmed per enquiry — use the quote request to get current bulk pricing.
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
