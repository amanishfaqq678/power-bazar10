import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, LogOut, Menu, Package2, Settings, Sparkles, Users, Warehouse, X } from "lucide-react";
import logo from "@/assets/power-bazar-logo.png";
import { Button } from "@/components/ui/button";
import { isAdminAuthenticated, signOutAdmin } from "@/lib/admin-auth";

const navItems = [
  { label: "Dashboard", icon: Sparkles, enabled: true },
  { label: "Products", icon: Package2, enabled: false },
  { label: "Categories", icon: Package2, enabled: false },
  { label: "Inventory", icon: Warehouse, enabled: false },
  { label: "Quote Requests", icon: Bell, enabled: false },
  { label: "Orders", icon: ChevronRight, enabled: false },
  { label: "Customers", icon: Users, enabled: false },
  { label: "Settings", icon: Settings, enabled: false },
] as const;

const summaryCards = [
  {
    title: "Products",
    description: "Manage catalogue",
    tone: "bg-primary/10 text-primary",
  },
  {
    title: "Categories",
    description: "Organize products",
    tone: "bg-[#effaf3] text-[#0c6b4f]",
  },
  {
    title: "Inventory",
    description: "Manage stock",
    tone: "bg-[#f4f4f3] text-foreground",
  },
  {
    title: "Quote Requests",
    description: "Review wholesale inquiries",
    tone: "bg-[#f3f4f6] text-foreground",
  },
] as const;

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate({ to: "/admin/login" });
    }
  }, [navigate]);

  const selectedPanelText = useMemo(() => {
    if (!activePanel) {
      return "Use the sidebar to manage your business workflows and future modules as they are added.";
    }

    return `${activePanel} is currently being prepared for a future release.`;
  }, [activePanel]);

  function handleLogout() {
    signOutAdmin();
    navigate({ to: "/admin/login" });
  }

  const sidebarContent = (
    <aside className="flex h-full flex-col border-r border-border bg-[#f8f8f5]">
      <div className="flex h-20 items-center justify-between border-b border-border px-5">
        <Link to="/home" className="flex items-center gap-3" aria-label="Power Bazar home">
          <img src={logo} alt="Power Bazar" className="h-10 w-auto" />
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 px-3 py-4">
        <div className="mb-5 rounded-xl border border-border bg-white p-3 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Logged in</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
              PB
            </div>
            <div>
              <p className="font-bold text-foreground">Power Bazar Admin</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon, enabled }) => (
            <button
              key={label}
              type="button"
              disabled={!enabled}
              onClick={() => {
                if (!enabled) {
                  setActivePanel(label);
                  setMobileOpen(false);
                }
              }}
              className={[
                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors",
                enabled
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-white hover:text-foreground",
              ].join(" ")}
            >
              <span className="flex items-center gap-3">
                <Icon className="size-4" />
                {label}
              </span>
              {!enabled ? <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Soon</span> : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t border-border bg-white p-4">
        <Button variant="outline" className="w-full justify-center gap-2 rounded-full font-bold" onClick={handleLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f1] text-foreground">
      <div className="hidden h-screen md:block">
        <div className="grid h-full grid-cols-[260px_1fr]">{sidebarContent}</div>
      </div>

      <div className="md:hidden">
        <div className="border-b border-border bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link to="/home" aria-label="Power Bazar home" className="flex items-center">
              <img src={logo} alt="Power Bazar" className="h-9 w-auto" />
            </Link>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>
        {mobileOpen ? <div className="border-b border-border bg-white">{sidebarContent}</div> : null}
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-border bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Dashboard</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Power Bazar Admin</h1>
              <p className="mt-2 text-sm text-muted-foreground">Manage your business from one place.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full font-bold">
              <Link to="/home">View public site</Link>
            </Button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ title, description, tone }) => (
            <div key={title} className="rounded-2xl border border-border bg-white p-5 shadow-[0_10px_20px_rgba(15,23,42,0.03)]">
              <div className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.13em] ${tone}`}>
                {title}
              </div>
              <p className="mt-4 text-base font-bold text-foreground">{description}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-[0_10px_20px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Business overview</h2>
              <p className="mt-2 max-w-3xl text-base text-muted-foreground">{selectedPanelText}</p>
            </div>
            {activePanel ? (
              <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
                {activePanel}
              </span>
            ) : null}
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-border bg-[#f8f8f5] p-4 text-sm text-muted-foreground">
            This dashboard is a clean foundation for the future management modules. Product, stock, customer and quote workflows will be added here as the admin experience expands.
          </div>
        </section>
      </main>
    </div>
  );
}
