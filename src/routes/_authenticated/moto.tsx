import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, LoadingBlock, ErrorBlock } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMoto } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/moto")({
  head: () => ({ meta: [{ title: "Minha moto — MotoEmDia" }, { name: "description", content: "Cadastre ou edite sua moto." }] }),
  component: MotoPage,
});

const year = new Date().getFullYear();
const schema = z.object({
  manufacturer: z.string().trim().min(1, "Informe o fabricante").max(60),
  model: z.string().trim().min(1, "Informe o modelo").max(80),
  year: z.coerce.number().int().min(1950, "Ano inválido").max(year + 1, "Ano inválido"),
  engine_capacity: z.union([z.literal(""), z.coerce.number().int().min(50).max(3000)]).transform((v) => (v === "" ? null : v)),
  plate: z.string().trim().max(10).transform((v) => v.toUpperCase() || null),
  nickname: z.string().trim().max(40).transform((v) => v || null),
  current_mileage: z.coerce.number().int().min(0, "Quilometragem inválida").max(2_000_000),
});

function MotoPage() {
  const moto = useMoto();
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  if (moto.isLoading) return <LoadingBlock />;
  if (moto.error) return <ErrorBlock />;
  const m = moto.data;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(f);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (m && parsed.data.current_mileage < m.current_mileage)
      return toast.error("A quilometragem não pode ser menor que a atual");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = m
      ? await supabase.from("motorcycles").update(parsed.data).eq("id", m.id)
      : await supabase.from("motorcycles").insert({ ...parsed.data, user_id: u.user!.id });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(m ? "Moto atualizada" : "Moto cadastrada!");
    await qc.invalidateQueries({ queryKey: ["moto"] });
    navigate({ to: "/app" });
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle
        title={m ? "Editar moto" : "Cadastre sua moto"}
        subtitle={m ? undefined : "Informe os dados da sua moto principal para começar."}
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fabricante" name="manufacturer" placeholder="Honda" defaultValue={m?.manufacturer} required />
          <Field label="Modelo" name="model" placeholder="NXR 160 Bros" defaultValue={m?.model} required />
          <Field label="Ano" name="year" type="number" placeholder="2018" defaultValue={m?.year} required />
          <Field label="Cilindrada (opcional)" name="engine_capacity" type="number" placeholder="160" defaultValue={m?.engine_capacity ?? ""} />
          <Field label="Placa (opcional)" name="plate" placeholder="ABC1D23" defaultValue={m?.plate ?? ""} />
          <Field label="Apelido (opcional)" name="nickname" placeholder="Minha Bros" defaultValue={m?.nickname ?? ""} />
        </div>
        <Field label="Quilometragem atual" name="current_mileage" type="number" placeholder="42350" defaultValue={m?.current_mileage} required min={m?.current_mileage ?? 0} />
        <Button type="submit" className="h-11 w-full" disabled={saving}>{saving ? "Salvando..." : m ? "Salvar alterações" : "Cadastrar moto"}</Button>
      </form>
    </div>
  );
}

function Field(props: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { label, name, ...rest } = props;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} className="h-11" inputMode={rest.type === "number" ? "numeric" : undefined} {...rest} />
    </div>
  );
}
