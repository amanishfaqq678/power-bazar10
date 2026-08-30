import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { categoryImage } from "@/lib/product-images";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <div className="overflow-hidden bg-surface">
        <img
          src={categoryImage(category.slug, category.image_url)}
          alt={`${category.name} products`}
          width={800}
          height={600}
          loading="lazy"
          className="aspect-4/3 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-extrabold">{category.name}</h3>
        {category.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-primary">
          Browse
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
