import React from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { createFileRoute } from "@tanstack/react-router";

const FAQ = [
  {
    q: "How do I find a product?",
    a: "Use Browse Products or the Product Assistant to search by name, category or typical use.",
  },
  {
    q: "What does Add to Quote mean?",
    a: "It collects selected items into a quote request that the Power Bazar team will review and price.",
  },
  {
    q: "Can I request multiple products?",
    a: "Yes — add multiple products to a single quote request.",
  },
  {
    q: "Can I request wholesale quantities?",
    a: "Yes — include the quantity in your request and the team will advise on availability.",
  },
  {
    q: "How do I get pricing?",
    a: "Pricing is confirmed via a quote request so the team can check availability and bulk pricing.",
  },
  {
    q: "Where can I get product assistance?",
    a: "Use the Product Assistant on this site or contact the support team via the provided channels when available.",
  },
];

export default function SupportPage() {
  return (
    <SiteLayout>
      <div className="container-pb section-pb">
        <section className="mx-auto max-w-4xl">
          <header className="mb-6">
            <p className="eyebrow">Support</p><h1 className="mt-3 text-4xl font-extrabold text-foreground sm:text-5xl">
              How Can We Help?
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Find product help, quote assistance, and useful answers to common questions.
            </p>
          </header>

          <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-semibold text-foreground">Product Help</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Browse categories/products or use the Product Assistant for guided product
              suggestions.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="/ai-assistant" className="inline-flex h-11 items-center justify-center rounded-full bg-secondary px-6 text-sm font-extrabold text-secondary-foreground shadow-sm transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-secondary/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Open Product Assistant
              </a>
              <a href="/products" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Browse Products
              </a>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-semibold text-foreground">Quote Assistance</h2>
            <p className="mt-2 text-base text-muted-foreground">Quote process overview:</p>
            <ol className="mt-2 list-decimal pl-5 text-base text-muted-foreground">
              <li>Browse product</li>
              <li>Add to quote</li>
              <li>Review quote</li>
              <li>Submit request</li>
              <li>Power Bazar responds with pricing/availability</li>
            </ol>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-semibold text-foreground">FAQ</h2>
            <dl className="mt-4 space-y-4">
              {FAQ.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold text-foreground">{f.q}</dt>
                  <dd className="mt-1 text-base text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

export const Route = createFileRoute("/support")({
  component: SupportPage,
});
