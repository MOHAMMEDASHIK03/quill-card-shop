import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, productsQuery, type Product } from "@/lib/products";
import { formatINR } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Quilll Cards" },
      { name: "description", content: "Manage Quilll Cards products, prices, photos, offers and orders." },
      { property: "og:title", content: "Admin Dashboard — Quilll Cards" },
      { property: "og:description", content: "Store management for Quilll Cards." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const emptyForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  category: CATEGORIES[0] as string,
  image_url: "",
  special_offer: "",
  featured: false,
  in_stock: true,
};

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  total: number;
  status: string;
  created_at: string;
  items: { name: string; qty: number; price: number }[];
};

function Admin() {
  const router = useRouter();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setIsAdmin(false);
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!role);
    })();
  }, []);

  const { data: products = [] } = useQuery(productsQuery);
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Order[];
    },
    enabled: isAdmin === true,
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        category: form.category,
        image_url: form.image_url || null,
        special_offer: form.special_offer.trim() || null,
        featured: form.featured,
        in_stock: form.in_stock,
      };
      if (!payload.name) throw new Error("Product name is required");
      const res = form.id
        ? await supabase.from("products").update(payload).eq("id", form.id)
        : await supabase.from("products").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      toast.success(form.id ? "Product updated" : "Product added");
      setForm(emptyForm);
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleUpload(file: File) {
    setUploading(true);
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      toast.error(error.message);
      return;
    }
    const { data } = await supabase.storage
      .from("product-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setUploading(false);
    if (data?.signedUrl) {
      setForm((f) => ({ ...f, image_url: data.signedUrl }));
      toast.success("Photo uploaded");
    }
  }

  function edit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      image_url: p.image_url ?? "",
      special_offer: p.special_offer ?? "",
      featured: p.featured,
      in_stock: p.in_stock,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isAdmin === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl text-primary">Not an admin account</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account cannot manage the store. Sign in with the owner account.
        </p>
        <Button
          className="mt-6"
          onClick={async () => {
            await supabase.auth.signOut();
            await router.navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-primary">Admin dashboard</h1>
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            await router.navigate({ to: "/" });
          }}
        >
          Sign out
        </Button>
      </div>

      <Tabs defaultValue="products" className="mt-8">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <section className="h-fit space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-xl text-primary">
              {form.id ? "Edit product" : "Add a product"}
            </h2>

            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={800}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Special offer text (optional)</Label>
              <Input
                value={form.special_offer}
                onChange={(e) => setForm({ ...form, special_offer: e.target.value })}
                placeholder="e.g. 20% off this week"
                maxLength={60}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Product photo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
              />
              {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Product preview"
                  loading="lazy"
                  className="mt-2 h-32 w-32 rounded-lg object-cover"
                />
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label>Show on home page</Label>
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label>In stock</Label>
              <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => save.mutate()} disabled={save.isPending}>
                <Plus className="mr-1 h-4 w-4" /> {form.id ? "Save changes" : "Add product"}
              </Button>
              {form.id && (
                <Button variant="outline" onClick={() => setForm(emptyForm)}>
                  Cancel
                </Button>
              )}
            </div>
          </section>

          <section className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-primary">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {p.category} · {formatINR(p.price)}
                    {p.special_offer ? ` · ${p.special_offer}` : ""}
                    {p.in_stock ? "" : " · sold out"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => edit(p)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove.mutate(p.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </section>
        </TabsContent>

        <TabsContent value="orders" className="mt-6 space-y-3">
          {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-medium text-primary">
                  {o.customer_name} · {o.phone}
                </h3>
                <span className="font-display text-lg text-primary">{formatINR(o.total)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{o.address}</p>
              <ul className="mt-2 text-sm text-muted-foreground">
                {(o.items ?? []).map((i, idx) => (
                  <li key={idx}>
                    {i.name} × {i.qty}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
