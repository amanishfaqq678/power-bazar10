import { createFileRoute } from "@tanstack/react-router";
import { Home } from "./home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Power Bazar — Electrical Products" },
      {
        name: "description",
        content: "Shop electrical products online from Power Bazar.",
      },
    ],
  }),
  component: Home,
});