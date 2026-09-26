import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_TYPES, type Record } from "@/lib/moto";

const schema = z.object({
  service_type: z.enum(SERVICE_TYPES.map((s) => s.value) as [string, ...string[]], { message: "Escolha o tipo" }),
  service_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data"),
  mileage: z.coerce.number().int().min(0, "Quilometragem inválida").max(2_000_000),
  cost: z.union([z.literal(""), z.coerce.number().min(0).max(1_000_000)]).transform((v) => (v === "" ? null : v)),
  workshop: z.string().trim().max(100).transform((v) => v || null),
  notes: z.string().trim().max(1000).transform((v) => v || null),
});
export type MaintenanceInput = z.infer<typeof schema>;

export function MaintenanceForm({
  initial,
  defaultMileage,
  onSubmit,
  submitLabel = "Salvar manutenção",
}: {
  initial?: Record;
  defaultMileage?: number;
  onSubmit: (v: MaintenanceInput) => Promise<boolean>;
  submitLabel?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState(initial?.service_type ?? "");
  const today = new Date().toISOString().slice(0, 10);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse({ ...f, service_type: type });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (parsed.data.service_date > today) return toast.error("A data não pode estar no futuro");
    setSaving(true);
    await onSubmit(parsed.data);
    setSaving(false);
  }

  return (
    <form onSubmit={handle} className="space-y-5 rounded-2xl border bg-card p-5">
      <div>
        <Label>Tipo de serviço</Label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICE_TYPES.map((s) => (
            <button
              type="button"
              key={s.value}
              onClick={() => setType(s.value)}
              className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                type === s.value ? "border-primary bg-accent text-primary" : "hover:bg-secondary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="service_date">Data</Label>
          <Input id="service_date" name="service_date" type="date" max={today} defaultValue={initial?.service_date ?? today} required className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mileage">Quilometragem</Label>
          <Input id="mileage" name="mileage" type="number" inputMode="numeric" min={0} defaultValue={initial?.mileage ?? defaultMileage} required className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cost">Valor gasto (opcional)</Label>
          <Input id="cost" name="cost" type="number" inputMode="decimal" step="0.01" min={0} defaultValue={initial?.cost ?? ""} className="h-11" placeholder="R$" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="workshop">Oficina (opcional)</Label>
          <Input id="workshop" name="workshop" maxLength={100} defaultValue={initial?.workshop ?? ""} className="h-11" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea id="notes" name="notes" maxLength={1000} defaultValue={initial?.notes ?? ""} rows={3} />
      </div>
      <Button type="submit" className="h-11 w-full" disabled={saving}>{saving ? "Salvando..." : submitLabel}</Button>
    </form>
  );
}
