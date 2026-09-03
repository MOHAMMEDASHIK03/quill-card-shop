import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatINR, useCart } from "@/lib/cart";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-soft">
      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-sm text-muted-foreground">
            Quill Cards
          </div>
        )}
        {product.special_offer && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground">
            {product.special_offer}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.category}</p>
        <h3 className="font-display text-lg leading-snug text-primary">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-lg font-semibold text-primary">{formatINR(product.price)}</span>
          <Button
            size="sm"
            disabled={!product.in_stock}
            onClick={() => {
              add({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image_url: product.image_url,
              });
              toast.success(`${product.name} added to cart`);
            }}
          >
            {product.in_stock ? "Add to cart" : "Sold out"}
          </Button>
        </div>
      </div>
    </article>
  );
}
