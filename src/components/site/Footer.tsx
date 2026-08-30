import { Link } from "@tanstack/react-router";
import logo from "@/assets/power-bazar-logo.png";
import { CATEGORY_NAV, site } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-pb grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img
            src={logo}
            alt="Power Bazar"
            width={180}
            height={120}
            loading="lazy"
            className="h-14 w-auto"
          />
          <p className="mt-4 text-xs font-extrabold tracking-[0.18em] text-muted-foreground">
            {site.tagline}
          </p>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Wholesale and retail electrical products, presented clearly so you can choose with
            confidence.
          </p>
        </div>

        <nav aria-label="Product categories">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.12em]">Product Categories</h2>
          <ul className="mt-4 space-y-2.5">
            {CATEGORY_NAV.map((category) => (
              <li key={category.slug}>
                <Link
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.12em]">Company</h2>
          <ul className="mt-4 space-y-2.5">
            {[
              { label: "About", to: "/about" },
              { label: "Support", to: "/support" },
              { label: "Browse Products", to: "/products" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <nav aria-label="Customer">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em]">Customer</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  to="/request-quote"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-assistant"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  AI Product Assistant
                </Link>
              </li>
            </ul>
          </nav>

          <h2 className="mt-8 text-sm font-extrabold uppercase tracking-[0.12em]">Follow</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {site.social.map((channel) => (
              <li key={channel.label}>
                <span
                  className="inline-flex cursor-default rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground"
                  title="Link will be added once provided"
                >
                  {channel.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Social links will be added once confirmed.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-pb flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Power Bazar. All rights reserved.</p>
          <Link
            to="/admin/login"
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
            aria-label="Admin Portal"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
