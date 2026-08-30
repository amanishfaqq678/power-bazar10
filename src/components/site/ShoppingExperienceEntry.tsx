import { Link } from "@tanstack/react-router";
import { ShoppingCart, Users } from "lucide-react";
import logo from "@/assets/power-bazar-logo.png";

export function ShoppingExperienceEntry() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,166,60,0.12),_transparent_35%),linear-gradient(180deg,#f8fbf9_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-center">
          <img src={logo} alt="Power Bazar" className="h-14 w-auto" />
        </div>

        <header className="mt-8 text-center">
          <p className="eyebrow">Power Bazar</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Choose How You Shop
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Power Bazar serves both individual customers and businesses. Choose the experience that
            fits you best.
          </p>
        </header>

        <main className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            to="/request-quote"
            className="group rounded-[28px] border border-border bg-card p-8 text-left shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="size-6" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-extrabold tracking-[-0.03em]">Wholesale</h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  For businesses, contractors, retailers, and bulk buyers who want competitive
                  pricing and a customized quotation.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Bulk Orders</li>
              <li>• Business Pricing</li>
              <li>• Custom Quotations</li>
            </ul>

            <span className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground transition-colors group-hover:bg-primary/90">
              Explore Wholesale
            </span>
          </Link>

          <Link
            to="/products"
            className="group rounded-[28px] border border-border bg-card p-8 text-left shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingCart className="size-6" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-extrabold tracking-[-0.03em]">Retail</h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Browse electrical products and purchase directly with an easy, accessible shopping
                  experience.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Browse Products</li>
              <li>• Easy Shopping</li>
              <li>• Direct Purchase</li>
            </ul>

            <span className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground transition-colors group-hover:bg-primary/90">
              Shop Now
            </span>
          </Link>
        </main>
      </div>
    </div>
  );
}
