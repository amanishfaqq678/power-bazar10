import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/orders/$orderNumber")({ component: OrderConfirmationPage });

function OrderConfirmationPage() {
  const { orderNumber } = Route.useParams();
  const [copied, setCopied] = useState(false);
  let order: Order | null = null;
  try { order = JSON.parse(sessionStorage.getItem(`power-bazar-order:${orderNumber}`) ?? "null") as Order | null; } catch { order = null; }
  const number = order?.order_number ?? orderNumber;
  return <SiteLayout><PageHeader eyebrow="Order confirmed" title="Thank you for your order" description="We received your cash-on-delivery order and will contact you to confirm delivery." /><section className="container-pb section-pb"><div className="motion-fade-up mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"><div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Check aria-hidden="true" /></div><p className="mt-6 text-sm text-muted-foreground">Order number</p><div className="mt-1 flex flex-wrap items-center gap-2"><h2 className="text-2xl font-extrabold">{number}</h2><Button variant="ghost" size="sm" onClick={() => { void navigator.clipboard?.writeText(number); setCopied(true); setTimeout(() => setCopied(false), 1600); }} aria-label="Copy order number">{copied ? <Check className="text-primary" /> : <Copy />} {copied ? "Copied" : "Copy"}</Button></div>{order ? <><div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2"><div><p className="text-sm text-muted-foreground">Customer</p><p className="font-bold">{order.customer_name}</p></div><div><p className="text-sm text-muted-foreground">Payment</p><p className="font-bold">Cash on Delivery</p></div><div><p className="text-sm text-muted-foreground">Delivery</p><p className="font-bold">{order.address}, {order.city}</p></div><div><p className="text-sm text-muted-foreground">Total</p><p className="font-bold">PKR {Number(order.total).toLocaleString()}</p></div></div><div className="mt-6 border-t border-border pt-5">{order.items?.map((item) => <div key={item.id} className="flex justify-between gap-3 py-2 text-sm"><span>{item.product_name_snapshot} × {item.quantity}</span><span className="font-bold">PKR {Number(item.line_total).toLocaleString()}</span></div>)}</div></> : <p className="mt-4 text-muted-foreground">This confirmation is available on the device where the order was placed.</p>}<div className="mt-7 flex flex-wrap gap-3"><Button onClick={() => window.print()} variant="outline" className="rounded-full font-bold">Print / View Invoice</Button><Button asChild className="rounded-full font-bold"><Link to="/products" search={{ q: undefined, category: undefined }}>Continue Shopping</Link></Button></div></div></section></SiteLayout>;
}
