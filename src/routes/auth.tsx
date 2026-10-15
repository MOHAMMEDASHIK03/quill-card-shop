import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Login — Quilll Cards" },
      { name: "description", content: "Sign in to manage Quilll Cards products, prices and offers." },
      { property: "og:title", content: "Admin Login — Quilll Cards" },
      { property: "og:description", content: "Store owner sign in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    await router.navigate({ to: "/admin" });
  }




  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <h1 className="text-3xl text-primary">Admin login</h1>
      <p className="mt-2 text-sm text-muted-foreground">For the store owner only.</p>

      <div className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </div>
        <Button className="w-full" onClick={signIn} disabled={busy || !email || !password}>
          Sign in
        </Button>
      </div>

    </div>
  );
}
