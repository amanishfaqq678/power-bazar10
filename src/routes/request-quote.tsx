import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createInquiry } from "@/lib/api";
import { categoryImage } from "@/lib/product-images";
import { useQuoteBasket } from "@/lib/quote-basket";

export const Route = createFileRoute("/request-quote")({
  component: RequestQuotePage,
});

function RequestQuotePage() {
  const { items, setQuantity, removeItem, clear } = useQuoteBasket();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    business_name: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (items.length === 0) nextErrors["basket"] = "Your quote request is empty.";
    if (!form.customer_name.trim()) nextErrors["customer_name"] = "Full name is required.";
    if (!form.phone.trim()) nextErrors["phone"] = "Phone / WhatsApp is required.";
    else if (form.phone.trim().length < 7)
      nextErrors["phone"] = "Please enter a valid phone number.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors["email"] = "Please enter a valid email address.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const extraDetails = [
        form.business_name.trim() ? `Business: ${form.business_name.trim()}` : null,
        form.city.trim() ? `City: ${form.city.trim()}` : null,
        form.message.trim() ? `Additional requirements: ${form.message.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      await createInquiry({
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        product_id: items[0]?.productId ?? null,
        quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        message: extraDetails || null,
        items,
      });

      clear();
      setSubmitted(true);
      toast.success("Your quote request has been submitted.");
    } catch (error) {
      console.error(error);
      setErrors({ basket: "We could not submit the quote request. Please try again." });
      toast.error("We could not submit the quote request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SiteLayout>
        <div className="container-pb py-16">
          <div className="mx-auto max-w-2xl rounded-xl border border-primary/30 bg-accent p-8 text-center">
            <h2 className="text-2xl font-extrabold">Quote request received</h2>
            <p className="mt-3 text-muted-foreground">
              Thanks for your inquiry. Our team will review your request and follow up with pricing
              and availability.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild className="rounded-full font-bold">
                <Link to="/products" search={{ q: undefined, category: undefined }}>
                  Browse Products
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full font-bold">
                <Link to="/support">Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Quotation"
        title="Request a Quote"
        description="Allow customers to review the products and quantities they need and submit their details so Power Bazar can prepare a quotation."
      />

      <section className="container-pb py-10">
        {items.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <h2 className="text-xl font-extrabold">Your quote request is empty.</h2>
            <p className="mt-2 text-muted-foreground">
              Add products from the catalogue to start a quote request.
            </p>
            <Button asChild className="mt-6 rounded-full font-bold">
              <Link to="/products" search={{ q: undefined, category: undefined }}>
                Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold">Quote Items</h2>
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <img
                    src={categoryImage(item.categorySlug, item.imageUrl)}
                    alt={item.productName}
                    width={180}
                    height={120}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.categorySlug ?? "General"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                        className="text-signal"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      >
                        −
                      </Button>
                      <span className="min-w-8 text-center font-bold">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl font-extrabold">Customer Details</h2>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                <div>
                  <Label htmlFor="customer_name" className="font-bold">
                    Full Name *
                  </Label>
                  <Input
                    id="customer_name"
                    value={form.customer_name}
                    onChange={(event) => updateField("customer_name", event.target.value)}
                    className="mt-2 h-11"
                  />
                  {errors["customer_name"] ? (
                    <p className="mt-1 text-sm text-signal">{errors["customer_name"]}</p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="phone" className="font-bold">
                    Phone / WhatsApp *
                  </Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className="mt-2 h-11"
                  />
                  {errors["phone"] ? (
                    <p className="mt-1 text-sm text-signal">{errors["phone"]}</p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="business_name" className="font-bold">
                    Business Name
                  </Label>
                  <Input
                    id="business_name"
                    value={form.business_name}
                    onChange={(event) => updateField("business_name", event.target.value)}
                    className="mt-2 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="font-bold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="mt-2 h-11"
                  />
                  {errors["email"] ? (
                    <p className="mt-1 text-sm text-signal">{errors["email"]}</p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="city" className="font-bold">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    className="mt-2 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="font-bold">
                    Additional Requirements
                  </Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    rows={4}
                    className="mt-2"
                    placeholder="Tell us about quantities, project type, delivery needs, or any product-specific requirements."
                  />
                </div>

                {errors["basket"] ? (
                  <p className="rounded-lg border border-signal/30 bg-signal/8 px-3 py-2 text-sm text-signal">
                    {errors["basket"]}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="h-12 w-full rounded-full font-extrabold"
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : "Submit Quote Request"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
