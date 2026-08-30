import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Users } from "lucide-react";
import logo from "@/assets/power-bazar-logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/entry")({
  head: () => ({
    meta: [
      { title: "Power Bazar — Choose Wholesale or Retail" },
      { name: "description", content: "Choose the shopping experience: Wholesale or Retail at Power Bazar." },
    ],
  }),
  component: EntryPage,
});

function EntryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // If user already chose before, send them to products by default
    try {
      const seen = localStorage.getItem("powerbazar_entry_seen");
      if (seen === "true") {
        navigate({ to: "/products" });
      }
    } catch (_) {
      // ignore
    }
  }, [navigate]);

  function choose(path: string) {
    try {
      localStorage.setItem("powerbazar_entry_seen", "true");
    } catch (_) {}
    navigate({ to: path });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-center">
          <img src={logo} alt="Power Bazar" className="h-14 w-auto" />
        </div>

        <header className="mt-8 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">How Would You Like to Shop?</h1>
          <p className="mt-3 mx-auto max-w-2xl text-base text-muted-foreground">
            Power Bazar serves both individual customers and businesses. Choose the experience that
            fits you best.
          </p>
        </header>

        <main className="mt-10 grid gap-6 sm:grid-cols-2">
          <section
            role="button"
            tabIndex={0}
            onClick={() => choose("/request-quote")}
            onKeyDown={(e) => e.key === "Enter" && choose("/request-quote")}
            className="group cursor-pointer rounded-2xl border border-border bg-card p-8 text-left shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Wholesale — Explore Wholesale"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Users className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">Wholesale & Bulk Orders</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-lg">
                  For businesses, contractors and retailers — request a custom quotation and get
                  competitive pricing for bulk orders.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Bulk Orders</li>
              <li>• Business Pricing</li>
              <li>• Custom Quotations</li>
            </ul>

            <div className="mt-6">
              <Button className="rounded-full font-extrabold" onClick={() => choose("/request-quote")}>
                Explore Wholesale
              </Button>
            </div>
          </section>

          <section
            role="button"
            tabIndex={0}
            onClick={() => choose("/products")}
            onKeyDown={(e) => e.key === "Enter" && choose("/products")}
            className="group cursor-pointer rounded-2xl border border-border bg-card p-8 text-left shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Retail — Shop Now"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <ShoppingCart className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">Shop Retail</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-lg">
                  Browse electrical products and purchase directly. Easy shopping with direct product
                  access for personal or small-scale needs.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Browse Products</li>
              <li>• Easy Shopping</li>
              <li>• Direct Purchase</li>
            </ul>

            <div className="mt-6">
              <Button className="rounded-full font-extrabold" onClick={() => choose("/products")}>
                Shop Now
              </Button>
            </div>
          </section>
        </main>

        <div className="mt-8 text-center">
          <button
            className="text-sm text-muted-foreground underline"
            onClick={() => {
              try {
                localStorage.setItem("powerbazar_entry_seen", "true");
              } catch (_) {}
              navigate({ to: "/home" });
            }}
          >
            Continue to site
          </button>
        </div>
      </div>
    </div>
  );
}
