import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBlock, LoadingBlock, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMoto, useProfile } from "@/lib/queries";
import { onlyDigits, SERVICE_TYPES } from "@/lib/moto";

export const Route = createFileRoute("/_authenticated/orcamento")({
  head: () => ({ meta: [{ title: "Solicitar orçamento — MotoEmDia" }, { name: "description", content: "Peça um orçamento para sua moto." }] }),
  component: Orcamento,
});

const schema = z.object({
  service_type: z.string().min(1, "Escolha o serviço"),
  description: z.string().trim().max(1000).transform((v) => v || null),
  contact_name: z.string().trim().min(2, "Informe seu nome").max(100),
  phone: z.string().trim().max(20).refine((v) => { const d = onlyDigits(v).length; return d >= 10 && d <= 13; }, "Telefone inválido"),
  motorcycle_label: z.string().trim().max(120),
  mileage: z.union([z.literal(""), z.coerce.number().int().min(0)]).transform((v) => (v === "" ? null : v)),
  preferred_contact: z.enum(["whatsapp", "ligacao"]),
});

function Orcamento() {
  const moto = useMoto();
  const profile = useProfile();
  const [service, setService] = useState("");
  const [contact, setContact] = useState("whatsapp");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const qc = useQueryClient();

  if (moto.isLoading || profile.isLoading) return <LoadingBlock />;
  if (moto.error || profile.error) return <ErrorBlock />;
  const m = moto.data;

  if (done)
    return (
      <div className="mx-auto max-w-md rounded-3xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-ok" />
        <h1 className="mt-3 text-xl font-bold text-navy">Solicitação recebida.</h1>
        <p className="mt-1 text-muted-foreground">Entraremos em contato pelo WhatsApp.</p>
        <Button asChild className="mt-6 h-11 w-full"><Link to="/solicitacoes">Ver minhas solicitações</Link></Button>
      </div>
    );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse({ ...f, service_type: service, preferred_contact: contact });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos"); return; }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("quote_requests").insert({ ...parsed.data, user_id: u.user!.id, motorcycle_id: m?.id ?? null });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["quotes"] });
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title="Solicitar orçamento" subtitle="Receba um contato para o serviço que você precisa." />
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="space-y-1.5">
          <Label>Serviço desejado</Label>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Escolha o serviço" /></SelectTrigger>
            <SelectContent>{SERVICE_TYPES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" name="description" maxLength={1000} rows={3} placeholder="Conte um pouco sobre o que você precisa" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">Nome</Label>
            <Input id="contact_name" name="contact_name" defaultValue={profile.data?.name ?? ""} required className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <Input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={profile.data?.phone ?? ""} placeholder="(11) 91234-5678" required className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="motorcycle_label">Moto</Label>
            <Input id="motorcycle_label" name="motorcycle_label" defaultValue={m ? `${m.manufacturer} ${m.model} ${m.year}` : ""} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mileage">Quilometragem</Label>
            <Input id="mileage" name="mileage" type="number" inputMode="numeric" defaultValue={m?.current_mileage ?? ""} className="h-11" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Preferência de contato</Label>
          <div className="grid grid-cols-2 gap-2">
            {([["whatsapp", "WhatsApp"], ["ligacao", "Ligação"]] as const).map(([v, l]) => (
              <button type="button" key={v} onClick={() => setContact(v)}
                className={`h-11 rounded-xl border text-sm font-medium ${contact === v ? "border-primary bg-accent text-primary" : ""}`}>{l}</button>
            ))}
          </div>
        </div>
        <Button type="submit" className="h-11 w-full" disabled={saving}>{saving ? "Enviando..." : "Enviar solicitação"}</Button>
      </form>
    </div>
  );
}
