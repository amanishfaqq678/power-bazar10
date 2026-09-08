import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/common/states";
import { fetchCategories } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Category, Product, ProductImage } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Electrical Products Catalogue | Power Bazar" },
      {
        name: "description",
        content:
          "Browse Power Bazar's electrical products — LED lighting, switches, sockets, extension boards, protection devices and wiring accessories.",
      },
      { property: "og:title", content: "Electrical Products Catalogue | Power Bazar" },
      {
        property: "og:description",
        content: "Search and shop Power Bazar electrical products with clear retail pricing.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const [term, setTerm] = useState(search.q ?? "");
  const [category, setCategory] = useState(search.category ?? "all");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*), product_images(*)");

    if (error) {
      setLoadError(error);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as Array<
      Product & {
        categories: Category | Category[] | null;
        product_images: ProductImage[] | null;
      }
    >;

    setProducts(
      rows.map(({ categories, product_images, ...product }) => {
        const joinedCategory = Array.isArray(categories) ? categories[0] : categories;
        const firstImage = [...(product_images ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ?? null;

        const retailPrice =
          product.retail_price == null || !Number.isFinite(Number(product.retail_price))
            ? null
            : Number(product.retail_price);
        const stockQuantity = Number(product.stock_quantity) || 0;

        return {
          ...product,
          retail_price: retailPrice,
          stock_quantity: stockQuantity,
          availability: !product.is_active || stockQuantity <= 0
            ? "out_of_stock"
            : stockQuantity <= 10
              ? "low_stock"
              : "in_stock",
          image_url: firstImage ?? product.image_url,
          category: joinedCategory
            ? {
                id: joinedCategory.id,
                name: joinedCategory.name,
                slug: joinedCategory.slug,
              }
            : null,
        };
      }),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    const list = products.filter((product) => {
      const haystack = `${product.name} ${product.description ?? ""} ${product.sku ?? ""} ${
        product.category?.name ?? ""
      }`.toLowerCase();
      if (term && !haystack.includes(term.toLowerCase())) return false;
      if (category !== "all" && product.category?.slug !== category) return false;
      if (availability !== "all" && product.availability !== availability) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "newest") return b.created_at.localeCompare(a.created_at);
      if (sort === "availability") return a.availability.localeCompare(b.availability);
      return a.name.localeCompare(b.name);
    });
  }, [products, term, category, availability, sort]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Browse Power Bazar electrical products with clear retail pricing and availability."
      />

      <section className="container-pb py-10">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Label htmlFor="product-search" className="font-bold">
              Search
            </Label>
            <Input
              id="product-search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search by name, SKU or category"
              className="mt-2 h-11 rounded-full"
            />
          </div>

          <FilterSelect
            id="category-filter"
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              { value: "all", label: "All categories" },
              ...(categoriesQuery.data ?? []).map((item) => ({
                value: item.slug,
                label: item.name,
              })),
            ]}
          />

          <FilterSelect
            id="availability-filter"
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

          <div className="lg:col-span-4 lg:max-w-xs">
            <FilterSelect
              id="sort-filter"
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                { value: "name-asc", label: "Name A–Z" },
                { value: "name-desc", label: "Name Z–A" },
                { value: "newest", label: "Newest first" },
                { value: "availability", label: "Availability" },
              ]}
            />
          </div>
        </div>

        <div className="mt-10">
          {loading ? <ProductGridSkeleton /> : null}
          {loadError ? (
            <ErrorState
              title="Catalogue unavailable"
              description="We could not load products right now."
              onRetry={() => void loadProducts()}
            />
          ) : null}
          {!loading && !loadError && products.length > 0 && filtered.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try a different search term or clear the filters."
            />
          ) : null}
          {filtered.length > 0 ? (
            <>
              <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
                {filtered.length} product{filtered.length === 1 ? "" : "s"}
              </p>
              <ProductGrid products={filtered} />
            </>
          ) : null}
        </div>
      </section>
    </SiteLayout>
  );
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <Label htmlFor={id} className="font-bold">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="mt-2 h-11! rounded-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
