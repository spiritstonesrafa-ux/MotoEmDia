import { createFileRoute } from "@tanstack/react-router";
import { ErrorBlock, LoadingBlock, PageTitle } from "@/components/AppShell";
import { useAdminData } from "@/lib/admin-queries";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data, isLoading, error } = useAdminData();
  if (isLoading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock />;
  const usersWithMoto = new Set(data.motos.map((m) => m.user_id)).size;
  const done = data.quotes.filter((q) => q.status === "servico_realizado").length;
  const cards = [
    ["Usuários cadastrados", data.profiles.length],
    ["Usuários com moto", usersWithMoto],
    ["Motos cadastradas", data.motos.length],
    ["Manutenções registradas", data.records.length],
    ["Solicitações recebidas", data.quotes.length],
    ["Solicitações novas", data.quotes.filter((q) => q.status === "novo").length],
    ["Serviços realizados", done],
    ["Conversão em serviço", data.quotes.length ? `${Math.round((done / data.quotes.length) * 100)}%` : "—"],
  ] as const;
  return (
    <div>
      <PageTitle title="Painel administrativo" subtitle="Métricas de validação do MotoEmDia" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={l} className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-2 font-display text-3xl font-bold text-navy">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
