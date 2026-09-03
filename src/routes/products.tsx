import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, productsQuery } from "@/lib/products";

type Search = { category?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All Products — Quill Cards" },
      {
        name: "description",
        content:
          "Browse Salah trackers, laminated charts, flash cards and wall posters from Quill Cards. Filter by category and add to cart without signing in.",
      },
      { property: "og:title", content: "Shop All Products — Quill Cards" },
      {
        property: "og:description",
        content: "Salah trackers, laminated charts, flash cards and wall posters.",
      },
    ],
  }),
  component: Products,
});

function Products() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const { data: products = [], isLoading } = useQuery(productsQuery);

  const filtered = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl text-primary sm:text-4xl">Our products</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Every piece is designed in-house and printed on premium stock.
      </p>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={category ? "outline" : "default"}
            onClick={() => navigate({ search: {} })}
          >
            All
          </Button>
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "default" : "outline"}
              onClick={() => navigate({ search: { category: c } })}
            >
              {c}
            </Button>
          ))}
        </div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          className="sm:max-w-60"
        />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-secondary" />
            ))
          : filtered.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {!isLoading && filtered.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">No products match your search yet.</p>
      )}
    </div>
  );
}
