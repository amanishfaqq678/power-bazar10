import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ImagePlus, LogOut, Menu, Package2, Settings, Trash2, Warehouse, X, ShoppingBag, FolderTree } from "lucide-react";
import logo from "@/assets/power-bazar-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminUser, signOutAdmin, type AdminUser } from "@/lib/admin-auth";
import {
  createProduct, fetchAdminOrders, fetchCategories, fetchInventory, fetchProducts,
  deleteProductImage, fetchProductImages, reorderProductImages, updateInventory, updateOrderStatus, updateProduct, uploadProductImage,
} from "@/lib/api";
import type { Category, InventoryRow, Order, Product, ProductImage } from "@/lib/types";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboardPage });

type Panel = "dashboard" | "products" | "categories" | "inventory" | "orders";
type ProductFormData = {
  name: string; slug: string; description: string; category_id: string; sku: string;
  retail_price: string; wholesale_price: string; stock_quantity: string;
  is_active: boolean; is_featured: boolean;
};
const orderStatuses: Order["order_status"][] = ["new", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [panel, setPanel] = useState<Panel>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const admin = await getAdminUser();
      if (!admin) { navigate({ to: "/admin/login" }); return; }
      const [productRows, categoryRows, inventoryRows, orderRows] = await Promise.all([
        fetchProducts(), fetchCategories(), fetchInventory(), fetchAdminOrders(),
      ]);
      setUser(admin); setProducts(productRows); setCategories(categoryRows);
      setInventory(inventoryRows); setOrders(orderRows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load admin data.");
      await signOutAdmin();
      navigate({ to: "/admin/login" });
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function logout() {
    await signOutAdmin();
    navigate({ to: "/admin/login" });
  }

  const metrics = useMemo(() => ({
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    low: inventory.filter((row) => (row.product?.stock_quantity ?? row.quantity) <= row.low_stock_threshold).length,
    pending: orders.filter((order) => order.order_status === "new").length,
  }), [products, inventory, orders]);

  const navigation: Array<{ key: Panel; label: string; icon: typeof Package2 }> = [
    { key: "dashboard", label: "Dashboard", icon: Settings },
    { key: "products", label: "Products", icon: Package2 },
    { key: "categories", label: "Categories", icon: FolderTree },
    { key: "inventory", label: "Inventory", icon: Warehouse },
    { key: "orders", label: "Orders", icon: ShoppingBag },
  ];

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading admin portal...</div>;

  return <div className="min-h-screen bg-[#f5f5f1] text-foreground">
    <div className="border-b border-border bg-white px-4 py-3 md:hidden">
      <div className="flex items-center justify-between"><img src={logo} alt="Power Bazar" className="h-9 w-auto" />
        <Button variant="outline" size="icon" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}</Button>
      </div>
    </div>
    <div className="grid min-h-screen md:grid-cols-[250px_1fr]">
      <aside className={`${mobileOpen ? "block" : "hidden"} border-r border-border bg-[#f8f8f5] md:block`}>
        <div className="hidden h-20 items-center border-b border-border px-5 md:flex"><img src={logo} alt="Power Bazar" className="h-10 w-auto" /></div>
        <div className="p-4">
          <div className="mb-5 rounded-xl border border-border bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Signed in</p><p className="mt-2 font-bold">{user?.fullName || user?.email}</p><p className="text-xs capitalize text-muted-foreground">{user?.role}</p></div>
          <nav className="space-y-1">{navigation.map(({ key, label, icon: Icon }) => <button key={key} type="button" onClick={() => { setPanel(key); setMobileOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold ${panel === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white hover:text-foreground"}`}><Icon className="size-4" />{label}</button>)}</nav>
        </div>
        <div className="border-t border-border p-4"><Button variant="outline" className="w-full rounded-full font-bold" onClick={() => void logout()}><LogOut className="mr-2 size-4" />Sign out</Button></div>
      </aside>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-primary">Admin portal</p><h1 className="mt-2 text-3xl font-extrabold">{navigation.find((item) => item.key === panel)?.label}</h1></div><Button asChild variant="outline" className="rounded-full"><Link to="/home">View public site</Link></Button></div>
        {error ? <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
        {panel === "dashboard" ? <DashboardMetrics metrics={metrics} orders={orders} /> : null}
        {panel === "products" ? <ProductsPanel products={products} categories={categories} onSaved={() => void load()} /> : null}
        {panel === "categories" ? <CategoriesPanel categories={categories} onSaved={() => void load()} /> : null}
        {panel === "inventory" ? <InventoryPanel rows={inventory} onSaved={() => void load()} /> : null}
        {panel === "orders" ? <OrdersPanel orders={orders} onSaved={() => void load()} /> : null}
      </main>
    </div>
  </div>;
}

function DashboardMetrics({ metrics, orders }: { metrics: { total: number; active: number; low: number; pending: number }; orders: Order[] }) {
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Total products", metrics.total], ["Active products", metrics.active], ["Low stock", metrics.low], ["New orders", metrics.pending]].map(([label, value]) => <div key={label} className="rounded-2xl border border-border bg-white p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-extrabold">{value}</p></div>)}</div><section className="mt-6 rounded-2xl border border-border bg-white p-5"><h2 className="text-xl font-extrabold">Recent orders</h2>{orders.slice(0, 5).map((order) => <div key={order.id} className="flex flex-wrap justify-between gap-3 border-b border-border py-3 text-sm last:border-0"><span className="font-bold">{order.order_number} · {order.customer_name}</span><span>PKR {Number(order.total).toLocaleString()} · <span className="capitalize">{order.order_status}</span></span></div>)}{orders.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No orders yet.</p> : null}</section></>;
}

function ProductsPanel({ products, categories, onSaved }: { products: Product[]; categories: Category[]; onSaved: () => void }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const blank = { name: "", slug: "", description: "", category_id: "", sku: "", retail_price: "", wholesale_price: "", stock_quantity: "0", is_active: true, is_featured: false };
  const [form, setForm] = useState<ProductFormData>(blank);
  function start(product?: Product) { setEditing(product ?? null); setShowForm(true); setForm(product ? { name: product.name, slug: product.slug, description: product.description ?? "", category_id: product.category_id ?? "", sku: product.sku ?? "", retail_price: product.retail_price?.toString() ?? "", wholesale_price: product.wholesale_price?.toString() ?? "", stock_quantity: product.stock_quantity.toString(), is_active: product.is_active, is_featured: product.is_featured } : blank); }
  async function save(event: React.FormEvent) { event.preventDefault(); setMessage(""); const stock = Number(form.stock_quantity); const retail = form.retail_price === "" ? null : Number(form.retail_price); const wholesale = form.wholesale_price === "" ? null : Number(form.wholesale_price); if (!form.name.trim() || !Number.isFinite(stock) || stock < 0 || (retail !== null && (!Number.isFinite(retail) || retail < 0)) || (wholesale !== null && (!Number.isFinite(wholesale) || wholesale < 0)) || (form.is_active && retail === null)) { setMessage("Name, non-negative numeric values, and a retail price for active products are required."); return; } setSaving(true); try { const draft = { name: form.name, slug: form.slug, description: form.description || null, category_id: form.category_id || null, sku: form.sku || null, retail_price: retail, wholesale_price: wholesale, stock_quantity: stock, is_active: form.is_active, is_featured: form.is_featured }; if (editing) await updateProduct(editing.id, draft); else await createProduct(draft); setEditing(null); setShowForm(false); onSaved(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to save product."); } finally { setSaving(false); } }
  return <section className="space-y-5"><div className="flex justify-end"><Button onClick={() => start()} className="rounded-full">New product</Button></div>{message ? <p className="text-sm text-destructive">{message}</p> : null}<div className="overflow-x-auto rounded-2xl border border-border bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-border text-muted-foreground"><th className="p-4">Product</th><th>SKU</th><th>Retail price</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>{products.map((product) => <tr key={product.id} className="border-b border-border last:border-0"><td className="p-4 font-bold">{product.name}</td><td>{product.sku ?? "—"}</td><td>{product.retail_price == null ? "Unavailable" : `PKR ${product.retail_price}`}</td><td>{product.stock_quantity}</td><td>{product.is_active ? "Active" : "Archived"}</td><td><Button variant="outline" size="sm" onClick={() => start(product)}>Edit</Button></td></tr>)}</tbody></table></div>{showForm ? <ProductForm form={form} setForm={setForm} categories={categories} product={editing} saving={saving} onSubmit={save} onCancel={() => { setEditing(null); setShowForm(false); }} /> : null}</section>;
}
function ProductForm({ form, setForm, categories, product, saving, onSubmit, onCancel }: { form: ProductFormData; setForm: (value: ProductFormData) => void; categories: Category[]; product: Product | null; saving: boolean; onSubmit: (event: React.FormEvent) => void; onCancel: () => void }) { const field = (key: keyof ProductFormData, label: string, type = "text") => <label className="space-y-1 text-sm font-semibold">{label}<Input type={type} value={String(form[key])} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>; return <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-border bg-white p-5 sm:grid-cols-2">{field("name", "Name *")}{field("slug", "Slug *")}{field("sku", "SKU")}{field("retail_price", "Retail price", "number")}{field("wholesale_price", "Wholesale price", "number")}{field("stock_quantity", "Stock quantity", "number")}<label className="space-y-1 text-sm font-semibold">Category<select className="h-10 w-full rounded-md border border-input bg-background px-3" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active for sale</label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured product</label><div className="sm:col-span-2"><ProductImageManager product={product} /></div><div className="sm:col-span-2 flex gap-3"><Button disabled={saving}>{saving ? "Saving..." : "Save product"}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div></form>; }

function ProductImageManager({ product }: { product: Product | null }) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selected, setSelected] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (product) void fetchProductImages(product.id).then(setImages).catch((cause) => setMessage(cause instanceof Error ? cause.message : "Unable to load images.")); }, [product]);
  function choose(event: React.ChangeEvent<HTMLInputElement>) { setMessage(""); const files = Array.from(event.target.files ?? []); const invalid = files.find((file) => !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024); if (invalid) { setMessage("Use JPEG, PNG, WebP, or GIF images up to 5 MB."); return; } setSelected(files); }
  async function upload() { if (!product || selected.length === 0) return; setBusy(true); setMessage(""); try { const uploaded = []; for (const [index, file] of selected.entries()) uploaded.push(await uploadProductImage(product.id, file, images.length + index)); setImages([...images, ...uploaded].sort((a, b) => a.sort_order - b.sort_order)); setSelected([]); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to upload images."); } finally { setBusy(false); } }
  async function remove(image: ProductImage) { setBusy(true); try { await deleteProductImage(image); setImages(images.filter((item) => item.id !== image.id)); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to remove image."); } finally { setBusy(false); } }
  async function move(index: number, direction: -1 | 1) { const next = [...images]; const target = index + direction; const current = next[index]; const replacement = next[target]; if (!current || !replacement) return; next[index] = replacement; next[target] = current; setBusy(true); try { await reorderProductImages(next); setImages(next.map((image, position) => ({ ...image, sort_order: position }))); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to reorder images."); } finally { setBusy(false); } }
  return <section className="rounded-xl border border-border bg-[#fafaf8] p-4 sm:col-span-2"><div className="flex items-center justify-between gap-3"><div><h3 className="font-extrabold">Product images</h3><p className="text-xs text-muted-foreground">The first image is the primary storefront image.</p></div><ImagePlus className="size-5 text-primary" /></div>{!product ? <p className="mt-3 text-sm text-muted-foreground">Save the product first, then upload images.</p> : <><label className="mt-4 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-white p-4 text-sm font-bold hover:border-primary"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="sr-only" onChange={choose} />Choose images</label>{selected.length > 0 ? <div className="mt-3 flex flex-wrap items-end gap-3">{selected.map((file) => <div key={file.name} className="text-center text-[10px]"><img src={URL.createObjectURL(file)} alt={file.name} className="size-16 rounded object-cover" /><span className="mt-1 block max-w-20 truncate">{file.name}</span></div>)}<Button type="button" size="sm" onClick={() => void upload()} disabled={busy}>Upload</Button></div> : null}<div className="mt-4 grid gap-3 sm:grid-cols-2">{images.map((image, index) => <div key={image.id} className="flex gap-3 rounded-lg border border-border bg-white p-2"><img src={image.image_url} alt={image.alt_text ?? product.name} className="size-20 rounded object-cover" /><div className="min-w-0 flex-1"><p className="text-xs font-bold">{index === 0 ? "Primary image" : `Image ${index + 1}`}</p><div className="mt-2 flex gap-1"><Button type="button" variant="outline" size="icon" onClick={() => void move(index, -1)} disabled={busy || index === 0} aria-label="Move image up"><ArrowUp className="size-3" /></Button><Button type="button" variant="outline" size="icon" onClick={() => void move(index, 1)} disabled={busy || index === images.length - 1} aria-label="Move image down"><ArrowDown className="size-3" /></Button><Button type="button" variant="outline" size="icon" onClick={() => void remove(image)} disabled={busy} aria-label="Remove image"><Trash2 className="size-3" /></Button></div></div></div>)}</div></>}{message ? <p className="mt-3 text-sm text-destructive">{message}</p> : null}</section>;
}

function CategoriesPanel({ categories, onSaved }: { categories: Category[]; onSaved: () => void }) { const [name, setName] = useState(""); const [slug, setSlug] = useState(""); const [message, setMessage] = useState(""); async function save(e: React.FormEvent) { e.preventDefault(); try { const { upsertCategory } = await import("@/lib/api"); await upsertCategory({ name, slug, description: null, image_url: null }); setName(""); setSlug(""); onSaved(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to save category."); } } return <section className="space-y-5"><form onSubmit={save} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 sm:flex-row"><Input required placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} /><Input required placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} /><Button>Create category</Button></form>{message ? <p className="text-sm text-destructive">{message}</p> : null}<div className="rounded-2xl border border-border bg-white p-5">{categories.map((category) => <div key={category.id} className="flex justify-between border-b border-border py-3 last:border-0"><span className="font-bold">{category.name}</span><span className="text-sm text-muted-foreground">{category.slug}</span></div>)}</div></section>; }
function InventoryPanel({ rows, onSaved }: { rows: InventoryRow[]; onSaved: () => void }) { return <div className="overflow-x-auto rounded-2xl border border-border bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-border text-muted-foreground"><th className="p-4">Product</th><th>SKU</th><th>Current stock</th><th>Threshold</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => <InventoryRowEditor key={row.id} row={row} onSaved={onSaved} />)}</tbody></table></div>; }
function InventoryRowEditor({ row, onSaved }: { row: InventoryRow; onSaved: () => void }) { const [quantity, setQuantity] = useState(String(row.product?.stock_quantity ?? row.quantity)); const [threshold, setThreshold] = useState(String(row.low_stock_threshold)); const [saving, setSaving] = useState(false); const stock = Number(quantity); async function save() { setSaving(true); try { await updateInventory(row.id, row.product_id, { quantity: stock, low_stock_threshold: Number(threshold) }); onSaved(); } finally { setSaving(false); } } return <tr className="border-b border-border last:border-0"><td className="p-4 font-bold">{row.product?.name ?? row.product_id}</td><td>{row.product?.sku ?? "—"}</td><td><Input className="w-24" type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></td><td><Input className="w-24" type="number" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} /></td><td>{stock <= 0 ? "Out of stock" : stock <= Number(threshold) ? "Low stock" : "In stock"}</td><td><Button size="sm" onClick={() => void save()} disabled={saving}>{saving ? "Saving" : "Save"}</Button></td></tr>; }
function OrdersPanel({ orders, onSaved }: { orders: Order[]; onSaved: () => void }) { return <div className="overflow-x-auto rounded-2xl border border-border bg-white"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b border-border text-muted-foreground"><th className="p-4">Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-border last:border-0"><td className="p-4 font-bold">{order.order_number}</td><td>{order.customer_name}<br /><span className="text-xs text-muted-foreground">{order.phone}</span></td><td>{new Date(order.created_at).toLocaleDateString()}</td><td>PKR {Number(order.total).toLocaleString()}</td><td className="capitalize">{order.payment_status}</td><td><select className="rounded-md border border-input bg-background px-2 py-1 capitalize" value={order.order_status} onChange={async (e) => { await updateOrderStatus(order.id, e.target.value as Order["order_status"]); onSaved(); }}>{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>; }
