import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createInquiry } from "@/lib/api";
import type { InquiryInput, Product, QuoteItem } from "@/lib/types";
import { useQuoteBasket } from "@/lib/quote-basket";

const schema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone or WhatsApp number")
    .max(30)
    .regex(/^[0-9+()\s-]+$/, "Use digits, spaces and + only"),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(100000),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export function InquiryForm({
  product,
  items,
  onSubmitted,
}: {
  product?: Product | null;
  items?: QuoteItem[];
  onSubmitted?: () => void;
}) {
  const { clear } = useQuoteBasket();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: createInquiry,
    onSuccess: () => {
      setDone(true);
      if (items && items.length > 0) clear();
      onSubmitted?.();
    },
  });

  if (done) {
    return (
      <div
        className="rounded-xl border border-primary/30 bg-accent p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto size-8 text-primary" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-extrabold">Inquiry received</h2>
        <p className="mt-2 text-sm text-accent-foreground">
          Your inquiry has been received. Power Bazar will contact you shortly.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline" className="rounded-full font-bold">
            <a href="/products">Continue browsing</a>
          </Button>
          <Button
            className="rounded-full font-bold"
            onClick={() => {
              setDone(false);
              mutation.reset();
            }}
          >
            Send another inquiry
          </Button>
        </div>
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      customer_name: formData.get("customer_name"),
      phone: formData.get("phone"),
      email: formData.get("email") ?? "",
      quantity: formData.get("quantity") ?? 1,
      message: formData.get("message") ?? "",
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const payload: InquiryInput = {
      customer_name: parsed.data.customer_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      product_id: product?.id ?? null,
      quantity: parsed.data.quantity,
      message: parsed.data.message || null,
    };
    if (items && items.length > 0) {
      payload.items = items;
    }
    mutation.mutate(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {product ? (
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Product
          </p>
          <p className="mt-1 font-extrabold">{product.name}</p>
        </div>
      ) : null}

      {items && items.length > 0 ? (
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Quote Request items
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-4">
                <span>{item.productName}</span>
                <span className="font-bold">× {item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="customer_name"
          label="Your name"
          error={errors["customer_name"]}
          required
          autoComplete="name"
        />
        <Field
          id="phone"
          label="Phone / WhatsApp"
          error={errors["phone"]}
          required
          type="tel"
          autoComplete="tel"
          placeholder="03xx xxx xxxx"
        />
        <Field
          id="email"
          label="Email (optional)"
          error={errors["email"]}
          type="email"
          autoComplete="email"
        />
        <Field
          id="quantity"
          label="Quantity"
          error={errors["quantity"]}
          type="number"
          defaultValue={items && items.length > 0 ? undefined : 1}
          min={1}
        />
      </div>

      <div>
        <Label htmlFor="message" className="font-bold">
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          className="mt-2"
          placeholder="Tell us what you need — sizes, quantities, where it will be used."
        />
        {errors["message"] ? (
          <p className="mt-1.5 text-sm text-signal">{errors["message"]}</p>
        ) : null}
      </div>

      {mutation.isError ? (
        <p className="rounded-lg border border-signal/30 bg-signal/8 px-4 py-3 text-sm text-signal">
          We could not send your inquiry. Please check your connection and try again.
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-full font-extrabold"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Sending…" : "Send Inquiry"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Power Bazar does not take online payment. Your inquiry is reviewed by the team, who will
        follow up with pricing and availability.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string | undefined;
}) {
  return (
    <div>
      <Label htmlFor={id} className="font-bold">
        {label}
      </Label>
      <Input id={id} name={id} className="mt-2 h-11" aria-invalid={!!error} {...props} />
      {error ? <p className="mt-1.5 text-sm text-signal">{error}</p> : null}
    </div>
  );
}
