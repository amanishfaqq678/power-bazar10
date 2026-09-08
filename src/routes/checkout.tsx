import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { useQuoteBasket } from "@/lib/quote-basket";
import { createCodOrder } from "@/lib/api";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const { items, clear } = useQuoteBasket();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ customer_name: "", phone: "", email: "", address: "", city: "", customer_note: "" });
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;
    setBusy(true);
    try {
      const order = await createCodOrder({ ...form, email: form.email || null, customer_note: form.customer_note || null, items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })) });
      sessionStorage.setItem(`power-bazar-order:${order.order_number}`, JSON.stringify(order));
      clear();
      await navigate({ to: "/orders/$orderNumber", params: { orderNumber: order.order_number } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not place your order.");
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) return <SiteLayout><div className="container-pb py-20"><h1 className="text-2xl font-extrabold">Your cart is empty</h1><Button asChild className="mt-5 rounded-full"><Link to="/products" search={{ q: undefined, category: undefined }}>Browse products</Link></Button></div></SiteLayout>;

  return <SiteLayout>
    <PageHeader eyebrow="Secure checkout" title="Delivery details" description="Cash on delivery is available. Online payment will be enabled when a gateway is connected." />
    <section className="container-pb py-10">
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {([["customer_name", "Full name", true], ["phone", "Mobile / WhatsApp number", true], ["email", "Email (optional)", false], ["city", "City", true]] as const).map(([key, label, required]) => <div key={key}><Label htmlFor={key}>{label}</Label><Input id={key} required={required} type={key === "email" ? "email" : "text"} value={form[key]} onChange={(event) => update(key, event.target.value)} className="mt-2 h-11 rounded-lg" /></div>)}
          </div>
          <div className="mt-5"><Label htmlFor="address">Delivery address</Label><Textarea id="address" required value={form.address} onChange={(event) => update("address", event.target.value)} className="mt-2 min-h-24" /></div>
          <div className="mt-5"><Label htmlFor="customer_note">Order note (optional)</Label><Textarea id="customer_note" value={form.customer_note} onChange={(event) => update("customer_note", event.target.value)} className="mt-2" /></div>
          <fieldset className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4"><legend className="px-1 text-sm font-extrabold">Payment method</legend><label className="mt-2 flex items-center gap-3 text-sm font-bold"><input type="radio" checked readOnly /> Cash on Delivery</label><p className="mt-2 text-xs text-muted-foreground">Online payment is coming soon and is not available yet.</p></fieldset>
          <Button type="submit" disabled={busy} className="mt-6 h-12 w-full rounded-full font-extrabold">{busy ? "Placing order…" : "Place COD order"}</Button>
        </div>
        <aside className="h-fit rounded-xl border border-border bg-card p-6"><h2 className="text-lg font-extrabold">Order summary</h2>{items.map((item) => <div key={item.productId} className="mt-4 flex justify-between gap-3 text-sm"><span>{item.productName} × {item.quantity}</span><span className="font-bold">PKR {((item.unitPrice ?? 0) * item.quantity).toLocaleString()}</span></div>)}<div className="mt-5 flex justify-between border-t border-border pt-4 font-extrabold"><span>Total</span><span>PKR {subtotal.toLocaleString()}</span></div></aside>
      </form>
    </section>
  </SiteLayout>;
}
