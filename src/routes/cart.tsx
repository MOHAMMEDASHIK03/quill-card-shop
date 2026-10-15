import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatINR, useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Quilll Cards" },
      {
        name: "description",
        content: "Review the Quilll Cards items in your cart and continue to UPI checkout — no account needed.",
      },
      { property: "og:title", content: "Your Cart — Quilll Cards" },
      { property: "og:description", content: "Review your items and continue to checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl text-primary">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Add a few favourites and come back here to check out.</p>
        <Button asChild className="mt-6">
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl text-primary">Your cart</h1>

      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg text-primary">{item.name}</h2>
              <p className="text-sm text-muted-foreground">{formatINR(item.price)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{item.qty}</span>
              <Button variant="outline" size="icon" onClick={() => setQty(item.id, item.qty + 1)} aria-label="Increase">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove(item.id)} aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-24 text-right font-display text-lg text-primary">
              {formatINR(item.price * item.qty)}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4 border-t border-border pt-6">
        <p className="text-lg">
          Total: <span className="font-display text-2xl text-primary">{formatINR(total)}</span>
        </p>
        <Button asChild size="lg">
          <Link to="/checkout">Proceed to checkout</Link>
        </Button>
      </div>
    </div>
  );
}
