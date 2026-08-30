import type { Availability } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<Availability, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export function AvailabilityBadge({
  availability,
  className,
}: {
  availability: Availability;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold",
        availability === "in_stock" && "border-primary/30 bg-accent text-accent-foreground",
        availability === "low_stock" && "border-border bg-surface text-foreground",
        availability === "out_of_stock" && "border-signal/30 bg-signal/8 text-signal",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          availability === "in_stock" && "bg-primary",
          availability === "low_stock" && "bg-foreground/50",
          availability === "out_of_stock" && "bg-signal",
        )}
      />
      {LABELS[availability]}
    </span>
  );
}
