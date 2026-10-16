import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle } from "lucide-react";

import logo from "@/assets/logo.png";
import { CONTACT_NUMBER, WHATSAPP_NUMBER } from "@/lib/cart";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Quilll Cards" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-semibold text-primary">Quilll Cards</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Thoughtfully designed Salah trackers, laminated charts, flash cards and wall posters for young
            learners and families.
          </p>
        </div>

        <div className="text-sm">
          <h3 className="font-display text-base font-semibold text-primary">Explore</h3>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-primary">
                All products
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-primary">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-primary">
                Admin login
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h3 className="font-display text-base font-semibold text-primary">Get in touch</h3>
          <a
            href={`tel:+91${CONTACT_NUMBER}`}
            className="mt-3 flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Phone className="h-4 w-4" /> {CONTACT_NUMBER}
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp us
          </a>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Quilll Cards. All rights reserved.
      </div>
    </footer>
  );
}
