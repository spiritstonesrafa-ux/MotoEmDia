import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Bike, ChevronRight, LogOut, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBlock, LoadingBlock, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/lib/queries";
import { onlyDigits } from "@/lib/moto";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Meu perfil — MotoEmDia" }, { name: "description", content: "Seus dados no MotoEmDia." }] }),
  component: Perfil,
});

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  phone: z.string().trim().max(20).refine((v) => v === "" || (onlyDigits(v).length >= 10 && onlyDigits(v).length <= 13), "Telefone inválido").transform((v) => v || null),
});

function Perfil() {
  const profile = useProfile();
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  if (profile.isLoading) return <LoadingBlock />;
  if (profile.error || !profile.data) return <ErrorBlock />;
  const p = profile.data;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos"); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").update(parsed.data).eq("user_id", p.user_id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil atualizado");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageTitle title="Meu perfil" />
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="space-y-1.5">
          <Label>E-mail</Label>
          <Input value={p.email ?? ""} disabled className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={p.name} required className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={p.phone ?? ""} placeholder="(11) 91234-5678" className="h-11" />
        </div>
        <Button type="submit" className="h-11 w-full" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </form>
      <div className="divide-y rounded-2xl border bg-card">
        <Link to="/moto" className="flex items-center gap-3 p-4"><Bike className="h-5 w-5 text-primary" /><span className="flex-1 font-medium">Editar dados da moto</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>
        <Link to="/intervalos" className="flex items-center gap-3 p-4"><Settings2 className="h-5 w-5 text-primary" /><span className="flex-1 font-medium">Intervalos de manutenção</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>
        <button onClick={signOut} className="flex w-full items-center gap-3 p-4 text-left text-danger"><LogOut className="h-5 w-5" /><span className="font-medium">Sair da conta</span></button>
      </div>
    </div>
  );
}
