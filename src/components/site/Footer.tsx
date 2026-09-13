import { Link } from "@tanstack/react-router";
import logo from "@/assets/power-bazar-logo.png";
import { CATEGORY_NAV, site } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-ink text-ink-foreground">
      <div className="container-pb grid gap-10 py-14 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        <div>
          <img
            src={logo}
            alt="Power Bazar"
            width={180}
            height={120}
            loading="lazy"
            className="h-12 w-auto brightness-0 invert"
          />
          <p className="mt-4 text-xs font-extrabold tracking-[0.18em] text-primary">
            {site.tagline}
          </p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-ink-foreground/65">
            {site.description}
          </p>
        </div>

        <nav aria-label="Product categories">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.12em]">Products</h2>
          <ul className="mt-4 space-y-2.5">
            {CATEGORY_NAV.map((category) => (
              <li key={category.slug}>
                <Link
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  className="text-sm text-ink-foreground/65 transition-colors hover:text-primary"
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
              { label: "Products", to: "/products" },
              { label: "Cart / Shopping", to: "/cart" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-ink-foreground/65 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <nav aria-label="Support">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em]">Support</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  to="/ai-assistant"
                  className="text-sm text-ink-foreground/65 transition-colors hover:text-primary"
                >
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link
                  to="/request-quote"
                  className="text-sm text-ink-foreground/65 transition-colors hover:text-primary"
                >
                  Need bulk quantities? Request a Bulk Quote
                </Link>
              </li>
            </ul>
          </nav>

          <h2 className="mt-8 text-sm font-extrabold uppercase tracking-[0.12em]">Connect</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {site.social.map((channel) => (
              <li key={channel.label}>
                <span
                  className="inline-flex cursor-default rounded-full border border-ink-foreground/15 bg-ink-foreground/5 px-3 py-1.5 text-xs font-bold text-ink-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
                  title="Link will be added once provided"
                >
                  {channel.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-ink-foreground/50">
            Social links will be added once confirmed.
          </p>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="container-pb flex flex-col gap-2 py-6 text-xs text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Power Bazar. All rights reserved.</p>
          <Link
            to="/admin/login"
            className="text-xs text-ink-foreground/50 transition-colors hover:text-primary"
            aria-label="Admin Portal"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
