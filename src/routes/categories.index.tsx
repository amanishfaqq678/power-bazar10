import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/common/states";
import { fetchCategories } from "@/lib/api";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Product Categories | Power Bazar" },
      {
        name: "description",
        content:
          "Explore Power Bazar categories: LED lighting, switches and sockets, power and extension, electrical protection, wiring accessories and more.",
      },
      { property: "og:title", content: "Product Categories | Power Bazar" },
      {
        property: "og:description",
        content: "Seven focused electrical product categories from Power Bazar.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Categories"
        title="Find what you need."
        description="Every Power Bazar product sits in one of these categories."
      />
      <section className="container-pb py-12">
        {categoriesQuery.isLoading ? <ProductGridSkeleton count={7} /> : null}
        {categoriesQuery.isError ? (
          <ErrorState title="Categories unavailable" onRetry={() => categoriesQuery.refetch()} />
        ) : null}
        {categoriesQuery.data?.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Categories added in the admin panel appear here."
          />
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoriesQuery.data?.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
