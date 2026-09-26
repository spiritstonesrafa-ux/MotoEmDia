import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — MotoEmDia" },
      { name: "description", content: "Defina uma nova senha para sua conta MotoEmDia." },
      { property: "og:title", content: "Redefinir senha — MotoEmDia" },
      { property: "og:description", content: "Defina uma nova senha para sua conta." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (password.length < 8) { toast.error("A senha deve ter ao menos 8 caracteres"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Senha alterada com sucesso");
    navigate({ to: "/app" });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6"><Logo /></div>
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-3xl border bg-card p-6">
        <h1 className="text-xl font-bold text-navy">Nova senha</h1>
        <div className="space-y-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <Input id="password" name="password" type="password" minLength={8} required className="h-11" autoComplete="new-password" />
        </div>
        <Button type="submit" className="h-11 w-full" disabled={loading}>{loading ? "Salvando..." : "Salvar nova senha"}</Button>
      </form>
    </div>
  );
}
