import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, MessageSquare, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-products.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { ProductGrid } from "@/components/catalog/ProductCard";
import {
  EmptyState,
  ErrorState,
  ProductGridSkeleton,
  SectionHeading,
} from "@/components/common/states";
import { fetchCategories, fetchProducts } from "@/lib/api";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Power Bazar — Powering Your World | Electrical Products" },
      {
        name: "description",
        content:
          "Reliable electrical products for homes, shops and businesses. Browse LED lighting, switches, sockets, extensions and protection — then request a quote.",
      },
      { property: "og:title", content: "Power Bazar — Powering Your World" },
      {
        property: "og:description",
        content:
          "Wholesale and retail electrical products, made easier to find, understand and choose.",
      },
    ],
  }),
  component: Home,
});

const TRUST = [
  { title: "Reliable Products", copy: "Everyday electrical items chosen for dependable use." },
  { title: "Wholesale Supply", copy: "Bulk quantities for projects, shops and contractors." },
  { title: "Wide Selection", copy: "Lighting, wiring, switching and protection in one place." },
  { title: "Helpful Support", copy: "Straight answers before you commit to a purchase." },
];

const WHY = [
  { title: "Reliable", copy: "Products selected for consistent everyday performance." },
  { title: "Practical", copy: "Clear specifications, no confusing jargon." },
  { title: "Accessible", copy: "Retail quantities and wholesale supply, both welcome." },
  { title: "Helpful Service", copy: "Real people responding to your product questions." },
];

function Home() {
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const featuredQuery = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => fetchProducts({ featuredOnly: true, limit: 8 }),
  });

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="container-pb grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="eyebrow">Electrical Products · Wholesale & Retail</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              POWERING <span className="text-primary">YOUR WORLD.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Reliable electrical products for homes, shops and businesses — made easier to find,
              understand and choose.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-7 font-extrabold">
                <Link to="/products" search={{ q: undefined, category: undefined }}>
                  Explore Products
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-7 font-extrabold"
              >
                <a href="/request-quote">Request a Quote</a>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-x-6 inset-y-8 rounded-3xl bg-surface" />
            <img
              src={heroImage}
              alt="Electrical products including a modular switch plate, LED bulb, LED panel light, extension board and copper wire"
              width={1408}
              height={1104}
              className="relative w-full rounded-xl object-contain"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="container-pb grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <div key={item.title}>
              <div className="energy-rule" />
              <h2 className="mt-4 text-base font-extrabold">{item.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-pb py-16 sm:py-20">
        <SectionHeading
          eyebrow="Categories"
          title="Find what you need."
          description="Seven focused categories covering everyday electrical requirements."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoriesQuery.isLoading ? <ProductGridSkeleton count={4} /> : null}
          {categoriesQuery.isError ? (
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <ErrorState title="Categories unavailable" onRetry={() => categoriesQuery.refetch()} />
            </div>
          ) : null}
          {categoriesQuery.data?.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="container-pb py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Featured" title="Popular right now." />
            <Button asChild variant="outline" className="rounded-full font-bold">
              <Link to="/products" search={{ q: undefined, category: undefined }}>
                View all products
              </Link>
            </Button>
          </div>
          <div className="mt-10">
            {featuredQuery.isLoading ? <ProductGridSkeleton /> : null}
            {featuredQuery.isError ? (
              <ErrorState title="Products unavailable" onRetry={() => featuredQuery.refetch()} />
            ) : null}
            {featuredQuery.data?.length === 0 ? (
              <EmptyState
                title="No featured products yet"
                description="Products marked as featured in the admin panel appear here."
                actionLabel="Browse catalogue"
                actionTo="/products"
              />
            ) : null}
            {featuredQuery.data && featuredQuery.data.length > 0 ? (
              <ProductGrid products={featuredQuery.data} />
            ) : null}
          </div>
        </div>
      </section>

      <section className="container-pb py-16 sm:py-20">
        <div className="grid items-center gap-10 rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">AI Product Assistant</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Not sure what you need?</h2>
            <p className="mt-4 text-base text-muted-foreground">
              Tell us what you're looking for and we'll help you find the right product.
            </p>
            <Button asChild size="lg" className="mt-8 h-12 rounded-full px-7 font-extrabold">
              <Link to="/ai-assistant">
                <Sparkles className="size-4" aria-hidden="true" />
                Find Products
              </Link>
            </Button>
          </div>
          <figure className="rounded-xl border border-border bg-surface p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Example
            </p>
            <blockquote className="mt-3 text-lg font-bold leading-snug">
              “I need switches and sockets for a new bedroom.”
            </blockquote>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              The assistant answers using the Power Bazar catalogue.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container-pb py-16 sm:py-20">
          <SectionHeading eyebrow="Why Power Bazar" title="Built around what customers ask for." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-base font-extrabold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="container-pb flex flex-col items-start gap-6 py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20">
          <div>
            <h2 className="text-3xl font-extrabold sm:text-4xl">Power made practical.</h2>
            <p className="mt-3 max-w-xl text-primary-foreground/85">
              Clear product information, honest availability and quantities that suit both a single
              room and a full project.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-12 shrink-0 rounded-full px-7 font-extrabold"
          >
            <Link to="/products" search={{ q: undefined, category: undefined }}>
              Explore Products
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="container-pb grid gap-8 py-16 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <div className="energy-rule" />
            <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">Built for everyday power.</h2>
            <p className="mt-4 max-w-xl text-ink-foreground/70">
              From a single LED bulb to a full wiring run, Power Bazar keeps the essentials stocked
              and the answers simple.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-6">
            <div>
              <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-foreground/60">
                Categories
              </dt>
              <dd className="mt-1 text-3xl font-extrabold">7</dd>
            </div>
            <div>
              <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-foreground/60">
                Supply
              </dt>
              <dd className="mt-1 text-3xl font-extrabold">Retail & Bulk</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="container-pb py-16 sm:py-20">
        <SectionHeading align="center" eyebrow="Support" title="Need help choosing?" />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="h-12 rounded-full px-7 font-extrabold">
            <Link to="/ai-assistant">
              <MessageSquare className="size-4" aria-hidden="true" />
              Ask about a product
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full px-7 font-extrabold"
          >
            <a href="/request-quote">Request a quote</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-12 rounded-full px-7 font-extrabold"
          >
            <Link to="/support">Get Support</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container-pb py-16">
          <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <MapPin className="mx-auto size-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-extrabold">Store & contact details</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Verified store information — address, phone number and opening hours — will be added
              here as soon as it is provided by Power Bazar. Until then, please use the quote
              request form and the team will get back to you.
            </p>
            <Button asChild className="mt-6 rounded-full font-bold">
              <a href="/request-quote">Send an inquiry</a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
