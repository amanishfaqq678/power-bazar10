import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/orders/$orderNumber")({ component: OrderConfirmationPage });

function OrderConfirmationPage() {
  const { orderNumber } = Route.useParams();
  let order: Order | null = null;
  try { order = JSON.parse(sessionStorage.getItem(`power-bazar-order:${orderNumber}`) ?? "null") as Order | null; } catch { order = null; }
  return <SiteLayout><PageHeader eyebrow="Order confirmed" title="Thank you for your order" description="We received your cash-on-delivery order and will contact you to confirm delivery." /><section className="container-pb py-10"><div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 sm:p-8"><p className="text-sm text-muted-foreground">Order number</p><h2 className="mt-1 text-2xl font-extrabold">{order?.order_number ?? orderNumber}</h2>{order ? <><div className="mt-6 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-muted-foreground">Customer</p><p className="font-bold">{order.customer_name}</p></div><div><p className="text-sm text-muted-foreground">Payment</p><p className="font-bold">Cash on Delivery</p></div><div><p className="text-sm text-muted-foreground">Delivery</p><p className="font-bold">{order.address}, {order.city}</p></div><div><p className="text-sm text-muted-foreground">Total</p><p className="font-bold">PKR {Number(order.total).toLocaleString()}</p></div></div><div className="mt-6 border-t border-border pt-5">{order.items?.map((item) => <div key={item.id} className="flex justify-between py-2 text-sm"><span>{item.product_name_snapshot} × {item.quantity}</span><span className="font-bold">PKR {Number(item.line_total).toLocaleString()}</span></div>)}</div></> : <p className="mt-4 text-muted-foreground">This confirmation is available on the device where the order was placed.</p>}<div className="mt-7 flex flex-wrap gap-3"><Button onClick={() => window.print()} variant="outline" className="rounded-full font-bold">Print / View Invoice</Button><Button asChild className="rounded-full font-bold"><Link to="/products" search={{ q: undefined, category: undefined }}>Continue shopping</Link></Button></div></div></section></SiteLayout>;
}
