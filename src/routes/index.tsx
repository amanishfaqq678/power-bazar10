import { createFileRoute } from "@tanstack/react-router";
import { ShoppingExperienceEntry } from "@/components/site/ShoppingExperienceEntry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Power Bazar — Choose Wholesale or Retail" },
      {
        name: "description",
        content: "Choose the shopping experience: Wholesale or Retail at Power Bazar.",
      },
    ],
  }),
  component: ShoppingExperienceEntry,
});