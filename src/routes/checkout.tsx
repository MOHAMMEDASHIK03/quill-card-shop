import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import qr from "@/assets/upi-qr.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CONTACT_NUMBER, UPI_ID, WHATSAPP_NUMBER, formatINR, useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Quilll Cards" },
      {
        name: "description",
        content:
          "Enter your delivery details, pay by scanning the UPI QR code, then send your Quilll Cards order straight to WhatsApp.",
      },
      { property: "og:title", content: "Checkout — Quilll Cards" },
      { property: "og:description", content: "Pay by UPI and confirm your order on WhatsApp." },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  address: z.string().trim().min(10, "Please enter your full address").max(500),
  city: z.string().trim().min(2, "Enter your city").max(100),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Enter a 6-digit pincode"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  paymentRef: z.string().trim().max(100).optional().or(z.literal("")),
});

function Checkout() {
  const { items, total, clear } = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
    paymentRef: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl text-primary">Nothing to check out</h1>
        <p className="mt-3 text-muted-foreground">Add something to your cart first.</p>
        <Button asChild className="mt-6">
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  async function handleSend() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setSending(true);
    const d = parsed.data;
    const fullAddress = `${d.address}, ${d.city} - ${d.pincode}`;

    try {
      await supabase.from("orders").insert({
        customer_name: d.name,
        phone: d.phone,
        email: d.email || null,
        address: fullAddress,
        notes: [d.notes, d.paymentRef ? `UPI ref: ${d.paymentRef}` : ""].filter(Boolean).join(" | ") || null,
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        total,
      });
    } catch {
      /* order still goes through WhatsApp */
    }

    const lines = [
      "*New order — Quilll Cards*",
      "",
      "*Items*",
      ...items.map((i) => `• ${i.name} x${i.qty} — ${formatINR(i.price * i.qty)}`),
      "",
      `*Total:* ${formatINR(total)}`,
      "",
      "*Customer details*",
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      d.email ? `Email: ${d.email}` : "",
      `Address: ${fullAddress}`,
      d.notes ? `Notes: ${d.notes}` : "",
      d.paymentRef ? `UPI payment reference: ${d.paymentRef}` : "Payment: will share screenshot",
    ].filter(Boolean);

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSending(false);
    clear();
    toast.success("Order details sent to WhatsApp");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl text-primary sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        No account needed. Fill in your details, pay via UPI, then send everything to us on WhatsApp.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-5">
          <h2 className="font-display text-xl text-primary">1. Delivery details</h2>

          <Field label="Full name" error={errors["name"]}>
            <Input value={form.name} onChange={set("name")} placeholder="Your name" maxLength={100} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone number" error={errors["phone"]}>
              <Input value={form.phone} onChange={set("phone")} placeholder="10-digit mobile" maxLength={15} />
            </Field>
            <Field label="Email (optional)" error={errors["email"]}>
              <Input value={form.email} onChange={set("email")} placeholder="you@example.com" maxLength={255} />
            </Field>
          </div>
          <Field label="Delivery address" error={errors["address"]}>
            <Textarea value={form.address} onChange={set("address")} rows={3} maxLength={500} placeholder="House / street / area" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="City" error={errors["city"]}>
              <Input value={form.city} onChange={set("city")} maxLength={100} />
            </Field>
            <Field label="Pincode" error={errors["pincode"]}>
              <Input value={form.pincode} onChange={set("pincode")} maxLength={6} />
            </Field>
          </div>
          <Field label="Order notes (optional)" error={errors["notes"]}>
            <Textarea value={form.notes} onChange={set("notes")} rows={2} maxLength={500} placeholder="Anything we should know?" />
          </Field>

          <h2 className="pt-4 font-display text-xl text-primary">2. Pay with UPI</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <img
              src={qr}
              alt={`UPI QR code for ${UPI_ID}`}
              className="mx-auto w-64 max-w-full rounded-lg"
              loading="lazy"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              Scan with any UPI app and pay <span className="font-semibold text-primary">{formatINR(total)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              UPI ID: <span className="font-medium text-primary">{UPI_ID}</span>
            </p>
          </div>
          <Field label="UPI reference / transaction ID (optional)" error={errors["paymentRef"]}>
            <Input value={form.paymentRef} onChange={set("paymentRef")} maxLength={100} placeholder="e.g. 4412XXXXXXXX" />
          </Field>

          <Button size="lg" className="w-full" onClick={handleSend} disabled={sending}>
            <MessageCircle className="mr-2 h-5 w-5" />
            {sending ? "Sending…" : "Send order to WhatsApp"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Your order details go straight to {CONTACT_NUMBER} on WhatsApp.
          </p>
        </section>

        <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-xl text-primary">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {i.name} × {i.qty}
                </span>
                <span className="font-medium">{formatINR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between border-t border-border pt-4">
            <span className="font-medium">Total</span>
            <span className="font-display text-xl text-primary">{formatINR(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
