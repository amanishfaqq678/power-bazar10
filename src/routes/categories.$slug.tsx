import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { ProductGrid } from "@/components/catalog/ProductCard";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ProductGridSkeleton,
} from "@/components/common/states";
import { fetchCategoryBySlug, fetchProducts } from "@/lib/api";
import { categoryImage } from "@/lib/product-images";
import { FilterSelect } from "./products.index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => {
    const label = params.slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${label} | Power Bazar` },
        {
          name: "description",
          content: `Browse ${label} products from Power Bazar and request a quote for wholesale or retail quantities.`,
        },
        { property: "og:title", content: `${label} | Power Bazar` },
        {
          property: "og:description",
          content: `${label} products supplied by Power Bazar.`,
        },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [term, setTerm] = useState("");
  const [availability, setAvailability] = useState("all");

  const categoryQuery = useQuery({
    queryKey: ["category", slug],
    queryFn: () => fetchCategoryBySlug(slug),
  });
  const productsQuery = useQuery({
    queryKey: ["products", "category", categoryQuery.data?.id],
    queryFn: () => fetchProducts({ categoryId: categoryQuery.data!.id }),
    enabled: !!categoryQuery.data?.id,
  });

  const filtered = useMemo(() => {
    return (productsQuery.data ?? []).filter((product) => {
      if (
        term &&
        !`${product.name} ${product.sku ?? ""}`.toLowerCase().includes(term.toLowerCase())
      )
        return false;
      if (availability !== "all" && product.availability !== availability) return false;
      return true;
    });
  }, [productsQuery.data, term, availability]);

  if (categoryQuery.isLoading) {
    return (
      <SiteLayout>
        <LoadingState label="Loading category…" />
      </SiteLayout>
    );
  }

  if (categoryQuery.isError) {
    return (
      <SiteLayout>
        <div className="container-pb py-16">
          <ErrorState title="Category unavailable" onRetry={() => categoryQuery.refetch()} />
        </div>
      </SiteLayout>
    );
  }

  const category = categoryQuery.data;
  if (!category) {
    return (
      <SiteLayout>
        <div className="container-pb py-16">
          <EmptyState
            title="Category not found"
            description="This category may have been renamed or removed."
            actionLabel="All categories"
            actionTo="/categories"
          />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Category"
        title={category.name}
        {...(category.description ? { description: category.description } : {})}
      >
        <nav aria-label="Breadcrumb" className="mt-6 text-sm text-muted-foreground">
          <Link to="/home" className="hover:text-primary">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link to="/categories" className="hover:text-primary">
            Categories
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="font-bold text-foreground">{category.name}</span>
        </nav>
      </PageHeader>

      <section className="container-pb py-10">
        <img
          src={categoryImage(category.slug, category.image_url)}
          alt={`${category.name} products from Power Bazar`}
          width={800}
          height={600}
          loading="lazy"
          className="aspect-[21/9] w-full rounded-xl border border-border object-cover"
        />

        <div className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="category-search" className="font-bold">
              Search in {category.name}
            </Label>
            <Input
              id="category-search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              className="mt-2 h-11 rounded-full"
              placeholder="Product name or SKU"
            />
          </div>
          <FilterSelect
            id="category-availability"
            label="Availability"
            value={availability}
            onChange={setAvailability}
            options={[
              { value: "all", label: "Any availability" },
              { value: "in_stock", label: "In Stock" },
              { value: "low_stock", label: "Low Stock" },
              { value: "out_of_stock", label: "Out of Stock" },
            ]}
          />
          <div className="flex items-end">
            <Button asChild variant="outline" className="h-11 w-full rounded-full font-bold">
              <a href="/request-quote">Request a Quote</a>
            </Button>
          </div>
        </div>

        <div className="mt-10">
          {productsQuery.isLoading ? <ProductGridSkeleton count={4} /> : null}
          {productsQuery.isError ? (
            <ErrorState title="Products unavailable" onRetry={() => productsQuery.refetch()} />
          ) : null}
          {productsQuery.data && filtered.length === 0 ? (
            <EmptyState
              title="No category products"
              description="No products match this view yet. Try clearing the filters or browse the full catalogue."
              actionLabel="All products"
              actionTo="/products"
            />
          ) : null}
          {filtered.length > 0 ? <ProductGrid products={filtered} /> : null}
        </div>
      </section>
    </SiteLayout>
  );
}
