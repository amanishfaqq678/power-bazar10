import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { fetchProductBySlug, fetchProductImages, fetchRelatedProducts } from "@/lib/api";
import { useQuoteBasket } from "@/lib/quote-basket";
import { Button } from "@/components/ui/button";
import { AvailabilityBadge } from "@/components/catalog/AvailabilityBadge";
import { toast } from "sonner";
import { categoryImage } from "@/lib/product-images";
import { Input } from "@/components/ui/input";
import { ProductGrid } from "@/components/catalog/ProductCard";

export const Route = createFileRoute("/products/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { addItem } = useQuoteBasket();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  const product = productQuery.data;
  const imagesQuery = useQuery({
    queryKey: ["product-images", product?.id],
    queryFn: () => fetchProductImages(product!.id),
    enabled: Boolean(product?.id),
  });
  const relatedQuery = useQuery({
    queryKey: ["related-products", product?.id],
    queryFn: () => fetchRelatedProducts(product!),
    enabled: Boolean(product?.id),
  });

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

  const canPurchase =
    product.is_active &&
    product.retail_price != null &&
    Number.isFinite(Number(product.retail_price)) &&
    product.availability !== "out_of_stock";

  function handleAddToCart() {
    if (!canPurchase) return;
    addItem(currentProduct, quantity);
    toast.success(`${currentProduct.name} added to your cart`);
  }

  function handleBuyNow() {
    if (!canPurchase) return;
    addItem(currentProduct, quantity);
    void navigate({ to: "/checkout" });
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
            <img
              src={
                imagesQuery.data?.[selectedImage]?.image_url ??
                product.image_url ??
                categoryImage(product.category?.slug, null)
              }
              alt={product.name}
              width={1200}
              height={900}
              className="w-full rounded-xl object-contain"
            />
            {imagesQuery.data && imagesQuery.data.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {imagesQuery.data.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-lg border-2 ${selectedImage === index ? "border-primary" : "border-border"}`}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img src={image.image_url} alt={image.alt_text ?? `${product.name} image ${index + 1}`} className="size-20 object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

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
                  {product.is_active && product.retail_price != null
                    ? `PKR ${Number(product.retail_price).toLocaleString()}`
                    : "Price unavailable"}
                </div>
              </div>
            </div>

            {product.sku ? <p className="mt-4 text-sm text-muted-foreground">SKU: {product.sku}</p> : null}

            <div className="mt-6">
              <label htmlFor="product-quantity" className="text-sm font-bold">Quantity</label>
              <Input
                id="product-quantity"
                type="number"
                min={1}
                max={product.stock_quantity || 1}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className="mt-2 h-11 w-28"
                disabled={!canPurchase}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="flex-1 rounded-full font-bold" onClick={handleAddToCart} disabled={!canPurchase}>
                Add to Cart
              </Button>
              <Button className="flex-1 rounded-full font-bold" onClick={handleBuyNow} disabled={!canPurchase}>
                Buy Now
              </Button>
              <Button asChild variant="outline" className="rounded-full font-bold">
                <a href="/products">Back to catalogue</a>
              </Button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              {canPurchase
                ? "Secure checkout available with Cash on Delivery."
                : "This product does not have a published retail price yet."}
            </div>
          </aside>
        </div>
        {relatedQuery.data && relatedQuery.data.length > 0 ? (
          <div className="mt-14">
            <h2 className="text-2xl font-extrabold">Related products</h2>
            <div className="mt-6">
              <ProductGrid products={relatedQuery.data} />
            </div>
          </div>
        ) : null}
      </section>
    </SiteLayout>
  );
}
