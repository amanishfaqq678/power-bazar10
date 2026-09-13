import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, Sparkles, X, ShoppingCart } from "lucide-react";
import logo from "@/assets/power-bazar-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuoteBasket } from "@/lib/quote-basket";
import { cn } from "@/lib/utils";

const NAV = [
{ label: "Home", to: "/home" },
  { label: "Products", to: "/products" },
  { label: "Categories", to: "/categories" },
  { label: "About", to: "/about" },
  { label: "Support", to: "/support" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { count } = useQuoteBasket();

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate({ to: "/products", search: { q: term || undefined, category: undefined } });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-300",
        scrolled ? "border-border shadow-[var(--shadow-header)]" : "border-transparent",
      )}
    >
      <div className="container-pb flex min-h-16 items-center justify-between gap-3 py-2.5 sm:min-h-[4.5rem] sm:py-3">
        <Link to="/home" className="flex shrink-0 items-center" aria-label="Power Bazar home">
          <img
            src={logo}
            alt="Power Bazar — Powering Your World"
            width={180}
            height={120}
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: false }}
              activeProps={{ className: "text-primary" }}
              className="group relative rounded-full px-3.5 py-2 text-sm font-bold text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
              <span className="absolute inset-x-3.5 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-200 group-hover:scale-x-100" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search products"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
          >
            <Search className="size-5" aria-hidden="true" />
          </Button>

          <Button asChild variant="ghost" className="hidden font-bold lg:inline-flex">
            <Link to="/ai-assistant">
              <Sparkles className="size-4" aria-hidden="true" />
              AI Assistant
            </Link>
          </Button>

          <Button asChild className="rounded-full font-extrabold shadow-sm">
            <Link to="/cart">
              <ShoppingCart className="size-4" aria-hidden="true" />
              Cart
              {count > 0 ? (
                <span className="ml-1 min-w-5 rounded-full bg-primary-foreground/20 px-1.5 text-center text-xs tabular-nums">
                  {count}
                </span>
              ) : null}
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      <div className={cn("grid overflow-hidden border-t border-border bg-background transition-[grid-template-rows,opacity] duration-300", searchOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")} aria-hidden={!searchOpen} inert={!searchOpen ? true : undefined}>
        <div className="min-h-0">
          <form className="container-pb flex gap-2 py-3" onSubmit={submitSearch} role="search">
            <label htmlFor="header-search" className="sr-only">
              Search products
            </label>
            <Input
              id="header-search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search switches, LED lights, sockets…"
              className="h-11 rounded-full"
              autoFocus
            />
            <Button type="submit" className="h-11 rounded-full px-6 font-bold">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className={cn("grid overflow-hidden border-t border-border bg-background transition-[grid-template-rows,opacity] duration-300 lg:hidden", menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")} aria-hidden={!menuOpen} inert={!menuOpen ? true : undefined}>
        <div className="min-h-0">
          <nav aria-label="Mobile" className="container-pb flex flex-col py-3">
            {[
             { label: "Home", to: "/home" },
              { label: "Products", to: "/products" },
              { label: "Categories", to: "/categories" },
              { label: "AI Product Assistant", to: "/ai-assistant" },
             { label: "About", to: "/about" },
             { label: "Support", to: "/support" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="border-b border-border py-3.5 text-base font-bold last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-3 h-12 rounded-full font-extrabold">
              <Link to="/cart" onClick={() => setMenuOpen(false)}>
                <ShoppingCart className="size-4" aria-hidden="true" />
                Cart{count > 0 ? ` (${count})` : ""}
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
