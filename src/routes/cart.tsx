import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { useQuoteBasket } from "@/lib/quote-basket";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { items, count, setQuantity, removeItem } = useQuoteBasket();
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0);
  const hasUnavailablePrice = items.some((item) => !item.priceAvailable || item.unitPrice == null);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Your order" title="Cart" description={`${count} item${count === 1 ? "" : "s"} ready for checkout.`} />
      <section className="container-pb py-10">
        {items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-extrabold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Browse the catalogue to find what you need.</p>
            <Button asChild className="mt-6 rounded-full font-bold"><Link to="/products" search={{ q: undefined, category: undefined }}>Continue shopping</Link></Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {items.map((item) => (
                <article key={item.productId} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                  {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-20 rounded-lg object-cover" /> : <div className="size-20 rounded-lg bg-surface" />}
                  <div className="min-w-0 flex-1">
                    <Link to="/products/$slug" params={{ slug: item.slug }} className="font-extrabold hover:text-primary">{item.productName}</Link>
                    <p className="mt-1 text-sm text-muted-foreground">{item.priceAvailable && item.unitPrice != null ? `PKR ${item.unitPrice.toLocaleString()}` : "Price unavailable"}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button variant="outline" size="icon" aria-label="Decrease quantity" onClick={() => setQuantity(item.productId, item.quantity - 1)}><Minus className="size-4" /></Button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <Button variant="outline" size="icon" aria-label="Increase quantity" onClick={() => setQuantity(item.productId, item.quantity + 1)}><Plus className="size-4" /></Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <strong>{item.unitPrice != null ? `PKR ${(item.unitPrice * item.quantity).toLocaleString()}` : "—"}</strong>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${item.productName}`} onClick={() => removeItem(item.productId)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </article>
              ))}
            </div>
            <aside className="h-fit rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-extrabold">Order summary</h2>
              <div className="mt-5 flex justify-between border-t border-border pt-4 font-extrabold"><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
              {hasUnavailablePrice ? <p className="mt-4 text-sm text-destructive">Remove products without a published price before checkout.</p> : null}
              <Button asChild disabled={hasUnavailablePrice} className="mt-6 w-full rounded-full font-bold"><Link to="/checkout">Proceed to checkout</Link></Button>
            </aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
