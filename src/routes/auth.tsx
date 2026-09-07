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
      { title: "Admin Login — Quill Cards" },
      { name: "description", content: "Sign in to manage Quill Cards products, prices and offers." },
      { property: "og:title", content: "Admin Login — Quill Cards" },
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

  async function createAccount() {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — you can sign in now");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <h1 className="text-3xl text-primary">Admin login</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        For the store owner only. First time here? Enter the owner email and password, then tap “Create
        account”.
      </p>

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
        <Button
          variant="outline"
          className="w-full"
          onClick={createAccount}
          disabled={busy || !email || !password}
        >
          Create account
        </Button>
      </div>
    </div>
  );
}
