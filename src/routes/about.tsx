import React from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { site } from "@/config/site";
import { createFileRoute } from "@tanstack/react-router";

function AboutPage() {
  return (
    <SiteLayout>
      <div className="container-pb section-pb">
        <section className="mx-auto max-w-5xl">
          <header className="motion-fade-up mb-10">
            <p className="eyebrow">About Power Bazar</p>
            <h1 className="mt-3 text-4xl font-extrabold text-foreground sm:text-5xl">
              Powering Better Electrical Supply
            </h1>
            <p className="mt-2 text-base text-muted-foreground">{site.description}</p>
          </header>

          <article className="grid gap-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
              <h2 className="text-xl font-semibold text-foreground">About Power Bazar</h2>
              <p className="mt-2 text-base text-muted-foreground">
                Power Bazar is being positioned as a wholesale electrical products brand focused on
                making it easy to discover and request quotes for switch boards, LED lighting,
                sockets, and related accessories. Content here uses the live catalogue where
                appropriate; placeholders remain for any business details not yet provided.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-xl font-semibold text-foreground">What We Offer</h2>
              <p className="mt-2 text-base text-muted-foreground">
                A wholesale-oriented selection of electrical products across categories such as:
              </p>
              <ul className="mt-3 list-disc pl-5 text-base text-muted-foreground">
                <li>LED Lighting</li>
                <li>Switches &amp; Sockets</li>
                <li>Power &amp; Extension</li>
                <li>Electrical Protection</li>
                <li>Wiring &amp; Accessories</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-xl font-semibold text-foreground">Why Power Bazar</h2>
              <ul className="mt-2 list-disc pl-5 text-base text-muted-foreground">
                <li>Product variety curated for wholesale customers</li>
                <li>Easy product discovery and catalogue search</li>
                <li>Quote-based purchasing for accurate pricing</li>
                <li>Customer support and product assistance</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-xl font-semibold text-foreground">Mission</h2>
              <p className="mt-2 text-lg font-medium text-foreground">
                To provide quality, reliable electrical solutions that make everyday life safer, easier, and more powered.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-xl font-semibold text-foreground">Vision</h2>
              <p className="mt-2 text-lg font-medium text-foreground">
                To become Pakistan’s trusted destination for quality electrical products and solutions, powering a brighter future.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/products" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Browse Products
              </a>
              {/* Request Quote omitted unless route exists */}
            </div>
          </article>
        </section>
      </div>
    </SiteLayout>
  );
}

export const Route = createFileRoute("/about")({
  component: AboutPage,
});
