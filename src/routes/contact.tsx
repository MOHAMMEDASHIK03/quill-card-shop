import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CONTACT_NUMBER, UPI_ID, WHATSAPP_NUMBER } from "@/lib/cart";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Quill Cards" },
      {
        name: "description",
        content:
          "Message Quill Cards on WhatsApp at 8903721505 for orders, bulk enquiries and custom designs.",
      },
      { property: "og:title", content: "Contact Quill Cards" },
      { property: "og:description", content: "Reach us on WhatsApp at 8903721505." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-primary sm:text-4xl">Talk to us</h1>
      <p className="mt-3 text-muted-foreground">
        Questions about a product, bulk orders for a madrasa or school, or a custom design? We reply fastest
        on WhatsApp.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <Phone className="h-5 w-5 text-accent" />
          <h2 className="mt-3 font-display text-lg text-primary">Call us</h2>
          <p className="text-sm text-muted-foreground">{CONTACT_NUMBER}</p>
          <Button asChild variant="outline" className="mt-4">
            <a href={`tel:+91${CONTACT_NUMBER}`}>Call now</a>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <MessageCircle className="h-5 w-5 text-accent" />
          <h2 className="mt-3 font-display text-lg text-primary">WhatsApp</h2>
          <p className="text-sm text-muted-foreground">Orders and enquiries</p>
          <Button asChild className="mt-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Quill Cards, I have a question.")}`}
              target="_blank"
              rel="noreferrer"
            >
              Message us
            </a>
          </Button>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Payments are accepted by UPI at <span className="font-medium text-primary">{UPI_ID}</span>.
      </p>
    </div>
  );
}
