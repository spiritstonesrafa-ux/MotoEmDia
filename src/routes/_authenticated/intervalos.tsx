import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBlock, LoadingBlock, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIntervals, useMoto } from "@/lib/queries";
import { CATEGORIES } from "@/lib/moto";

export const Route = createFileRoute("/_authenticated/intervalos")({
  head: () => ({ meta: [{ title: "Intervalos de manutenção — MotoEmDia" }, { name: "description", content: "Defina os intervalos de manutenção." }] }),
  component: Intervalos,
});

function Intervalos() {
  const moto = useMoto();
  const intervals = useIntervals(moto.data?.id);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  if (moto.isLoading || intervals.isLoading) return <LoadingBlock />;
  if (moto.error || intervals.error) return <ErrorBlock />;
  if (!moto.data) return <Navigate to="/moto" />;
  const m = moto.data;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { data: u } = await supabase.auth.getUser();
    const rows = [];
    for (const c of CATEGORIES) {
      const raw = String(f.get(c.value) ?? "").trim();
      const n = raw === "" ? null : Number(raw);
      if (n !== null && (!Number.isInteger(n) || n <= 0 || n > 200000)) return toast.error(`Intervalo inválido em ${c.label}`);
      rows.push({ user_id: u.user!.id, motorcycle_id: m.id, category: c.value, interval_km: n });
    }
    setSaving(true);
    const { error } = await supabase.from("maintenance_intervals").upsert(rows, { onConflict: "motorcycle_id,category" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Intervalos salvos");
    await qc.invalidateQueries({ queryKey: ["intervals"] });
    navigate({ to: "/app" });
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title="Intervalos de manutenção" subtitle="A cada quantos km cada item deve ser verificado." />
      <div className="mb-4 flex gap-3 rounded-2xl bg-warn-soft p-4 text-sm text-foreground">
        <Info className="h-5 w-5 shrink-0 text-warn" />
        <p>
          Consulte o <strong>manual da sua motocicleta</strong> ou a orientação de um profissional para definir o intervalo adequado.
          O MotoEmDia não sugere valores. Deixe em branco os itens que não quiser acompanhar.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border bg-card p-5">
        {CATEGORIES.map((c) => (
          <div key={c.value} className="flex items-center justify-between gap-4">
            <Label htmlFor={c.value} className="text-base">{c.label}</Label>
            <div className="relative w-40">
              <Input
                id={c.value}
                name={c.value}
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Não definido"
                defaultValue={intervals.data?.find((i) => i.category === c.value)?.interval_km ?? ""}
                className="h-11 pr-10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">km</span>
            </div>
          </div>
        ))}
        <Button type="submit" className="mt-2 h-11 w-full" disabled={saving}>{saving ? "Salvando..." : "Salvar intervalos"}</Button>
      </form>
    </div>
  );
}
