import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { Logo } from "@/components/Logo";
import { DashboardView } from "@/components/DashboardView";
import { Button } from "@/components/ui/button";
import { brl, dateBR, km, serviceLabel, type Interval, type Moto, type Record } from "@/lib/moto";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demonstração — MotoEmDia" },
      { name: "description", content: "Veja como o MotoEmDia funciona com dados fictícios de exemplo." },
      { property: "og:title", content: "Demonstração — MotoEmDia" },
      { property: "og:description", content: "Veja o painel do MotoEmDia com dados de exemplo." },
    ],
  }),
  component: Demo,
});

// Fictitious sample data, shown only on this page. Never stored in the database.
const moto: Moto = {
  id: "demo", manufacturer: "Honda", model: "NXR 160 Bros", year: 2018,
  engine_capacity: 160, plate: null, nickname: null, current_mileage: 42350,
};
const records: Record[] = [
  { id: "3", service_type: "oleo", service_date: "2026-08-10", mileage: 40000, cost: 85, workshop: "Oficina exemplo", notes: null },
  { id: "2", service_type: "freios", service_date: "2026-05-02", mileage: 38500, cost: 120, workshop: null, notes: null },
  { id: "1", service_type: "revisao", service_date: "2026-01-15", mileage: 36000, cost: 350, workshop: "Oficina exemplo", notes: null },
];
const intervals: Interval[] = [
  { category: "oleo", interval_km: 3000 },
  { category: "freios", interval_km: 5000 },
  { category: "revisao", interval_km: 6000 },
];

function Demo() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo />
          <Button asChild size="sm"><Link to="/auth" search={{ mode: "signup" }}>Criar minha conta</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-5">
        <div className="flex items-start gap-3 rounded-2xl bg-warn-soft p-4 text-sm">
          <Eye className="h-5 w-5 shrink-0 text-warn" />
          <p><strong>Modo demonstração.</strong> Dados fictícios apenas para ilustrar. Os intervalos exibidos são exemplos, não recomendações — use o manual da sua moto.</p>
        </div>
        <DashboardView moto={moto} records={records} intervals={intervals} />
        <section>
          <h2 className="mb-3 text-lg font-semibold text-navy">Histórico</h2>
          <ul className="space-y-2">
            {records.map((r) => (
              <li key={r.id} className="flex justify-between rounded-2xl border bg-card p-4 text-sm">
                <div><p className="font-semibold">{serviceLabel(r.service_type)}</p><p className="text-muted-foreground">{dateBR(r.service_date)} · {km(r.mileage)}</p></div>
                <span className="font-semibold text-navy">{brl(r.cost)}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
