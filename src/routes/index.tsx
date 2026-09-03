import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";

import heroImg from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, productsQuery } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quill Cards — Salah Trackers, Charts, Flash Cards & Posters" },
      {
        name: "description",
        content:
          "Shop Quill Cards: Salah trackers, laminated charts, flash cards and wall posters designed to make learning joyful. Pay easily by UPI and order on WhatsApp.",
      },
      { property: "og:title", content: "Quill Cards — Learning Made Beautiful" },
      {
        property: "og:description",
        content: "Salah trackers, laminated charts, flash cards and wall posters for young learners.",
      },
    ],
  }),
  component: Home,
});

const categoryBlurbs: Record<string, string> = {
  "Salah Tracker": "Build a joyful prayer habit, one day at a time.",
  "Laminated Charts": "Wipe-clean charts that survive everyday learning.",
  "Flash Cards": "Bite-sized cards for quick, playful revision.",
  "Wall Posters": "Calligraphy and reminders that brighten any room.",
};

function Home() {
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const shown = featured.length ? featured : products.slice(0, 4);

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Handcrafted learning tools
          </span>
          <h1 className="mt-5 text-4xl leading-tight text-primary sm:text-5xl">
            Learning that feels like a gift.
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            Quill Cards designs Salah trackers, laminated charts, flash cards and wall posters that make
            everyday learning beautiful for children and families.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/products">
                Shop the collection <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Ask a question</Link>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
          <img
            src={heroImg}
            alt="Salah tracker chart, flash cards and a calligraphy wall poster"
            width={1280}
            height={960}
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/products"
              search={{ category: c }}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent"
            >
              <h2 className="font-display text-lg text-primary">{c}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{categoryBlurbs[c]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl text-primary sm:text-3xl">Featured favourites</h2>
          <Link to="/products" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-xl bg-secondary" />
              ))
            : shown.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="bg-deep py-14 text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Made to last", text: "Thick, laminated stock that handles daily use." },
            { icon: Truck, title: "Shipped across India", text: "Carefully packed and dispatched quickly." },
            { icon: Sparkles, title: "Simple UPI checkout", text: "Scan, pay and confirm on WhatsApp." },
          ].map((f) => (
            <div key={f.title} className="flex gap-3">
              <f.icon className="mt-1 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-display text-lg text-primary-foreground">{f.title}</h3>
                <p className="text-sm opacity-85">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
