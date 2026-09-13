import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-products.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { ProductCard } from "@/components/catalog/ProductCard";
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
          "Shop reliable electrical products for homes, shops and businesses with clear pricing and direct checkout.",
      },
      { property: "og:title", content: "Power Bazar — Powering Your World" },
      {
        property: "og:description",
        content:
          "Electrical products made easier to find, understand and buy online.",
      },
    ],
  }),
  component: Home,
});

const WHY = [
  { title: "Quality products.", copy: "Electrical essentials selected for dependable everyday use." },
  { title: "Straightforward shopping.", copy: "Clear product information and simple online ordering." },
  { title: "Built for everyday needs.", copy: "Lighting, wiring, switching and protection in one place." },
];

const MOVING_WORDS = ["SWITCHES", "LIGHTING", "SOCKETS", "ELECTRICAL", "BOARDS"];
const BRAND_STRIP = ["POWER BAZAR", "ELECTRICAL PRODUCTS", "LIGHTING", "SWITCHES", "SOCKETS", "BOARDS"];

export function Home() {
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const featuredQuery = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => fetchProducts({ featuredOnly: true, limit: 8 }),
  });

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden border-b border-border bg-surface">
        <div aria-hidden="true" className="hero-grid absolute inset-0 opacity-60" />
        <div aria-hidden="true" className="absolute -right-32 top-16 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="container-pb relative grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow motion-fade-up">Electrical products · online store</p>
            <h1 className="motion-fade-up mt-4 max-w-xl text-5xl font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              POWERING
              <span className="block text-primary">EVERY SPACE.</span>
            </h1>
            <p className="motion-fade-up motion-stagger mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg" style={{ "--stagger-index": 1 } as CSSProperties}>
              Find lighting, wiring, switches and other electrical essentials with clear product information and simple online shopping.
            </p>
            <div className="motion-fade-up motion-stagger mt-8 flex flex-wrap gap-3" style={{ "--stagger-index": 2 } as CSSProperties}>
              <Button asChild size="lg" className="h-12 rounded-full px-7 font-extrabold">
                <Link to="/products" search={{ q: undefined, category: undefined }}>
                  Shop Products <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 font-extrabold">
                <Link to="/categories">Explore Categories</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl motion-fade-in">
            <div aria-hidden="true" className="absolute -inset-5 rounded-[2rem] border border-primary/10 bg-background/50 shadow-[var(--shadow-lift)]" />
            <div aria-hidden="true" className="absolute -bottom-6 -left-6 h-24 w-24 border-b-2 border-l-2 border-primary/50" />
            <img src={heroImage} alt="Electrical products including switches, lighting, an extension board and copper wire" width={1408} height={1104} className="hero-product relative w-full rounded-2xl object-contain" />
            <div className="vertical-headline absolute -right-2 top-1/2 hidden h-48 -translate-y-1/2 overflow-hidden border-l border-primary/25 pl-4 sm:block">
              <div className="vertical-headline-track">
                {[...MOVING_WORDS, ...MOVING_WORDS].map((word, index) => (
                  <span key={`${word}-${index}`} className="block py-2 text-xs font-extrabold tracking-[0.22em] text-muted-foreground">{word}</span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 sm:hidden" aria-label="Product categories">
              {MOVING_WORDS.map((word) => <span key={word} className="text-[10px] font-extrabold tracking-[0.18em] text-muted-foreground">{word}</span>)}
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-border bg-ink text-ink-foreground" aria-label="Power Bazar product categories">
        <div className="brand-marquee flex w-max items-center gap-5 py-3.5 text-xs font-extrabold tracking-[0.2em]">
          {[...BRAND_STRIP, ...BRAND_STRIP].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-5 whitespace-nowrap"><span className="text-primary">•</span>{item}</span>
          ))}
        </div>
      </div>

      <section className="container-pb section-pb">
        <SectionHeading eyebrow="Explore by category" title="Find the right fit for every space." description="Browse the categories available in the Power Bazar catalogue." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <div className="container-pb section-pb">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Featured products" title="Ready for the next job." />
            <Button asChild variant="outline" className="rounded-full font-bold">
              <Link to="/request-quote">
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
              <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                {featuredQuery.data.map((product) => <div key={product.id} className="w-[min(82vw,19rem)] shrink-0 snap-start sm:w-auto"><ProductCard product={product} /></div>)}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container-pb section-pb">
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
        <div className="container-pb section-pb">
          <SectionHeading eyebrow="Why Power Bazar" title="A clearer way to shop for electrical essentials." />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {WHY.map((item) => (
              <div key={item.title} className="border-l-2 border-primary/40 py-2 pl-5">
                <h3 className="text-lg font-extrabold">{item.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="container-pb flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-foreground/75">For larger requirements</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Need larger quantities?</h2>
            <p className="mt-3 max-w-xl text-primary-foreground/85">
              For shops, projects and larger requirements, send a request and the team will get back to you.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-12 shrink-0 rounded-full px-7 font-extrabold"
          >
            <Link to="/request-quote">
              Request a Bulk Quote
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="container-pb grid gap-8 py-16 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <div className="energy-rule" />
            <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">Helpful when you need a second opinion.</h2>
            <p className="mt-4 max-w-xl text-ink-foreground/70">
              Tell us what you are looking for and the AI Product Assistant can help you find a suitable item in the catalogue.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="w-fit rounded-full px-7 font-extrabold"><Link to="/ai-assistant"><Sparkles className="size-4" aria-hidden="true" />Open Product Assistant</Link></Button>
        </div>
      </section>

      <section className="container-pb section-pb">
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
            <a href="/request-quote">Request a Bulk Quote</a>
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

    </SiteLayout>
  );
}
