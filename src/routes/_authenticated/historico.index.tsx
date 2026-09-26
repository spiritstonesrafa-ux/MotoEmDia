import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Wrench } from "lucide-react";
import { EmptyState, ErrorBlock, LoadingBlock, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useRecords } from "@/lib/queries";
import { brl, dateBR, km, serviceLabel } from "@/lib/moto";

export const Route = createFileRoute("/_authenticated/historico/")({
  head: () => ({ meta: [{ title: "Histórico — MotoEmDia" }, { name: "description", content: "Histórico de manutenções." }] }),
  component: Historico,
});

function Historico() {
  const { data, isLoading, error } = useRecords();
  return (
    <div>
      <PageTitle title="Histórico" action={data?.length ? <Button asChild><Link to="/registrar">Registrar</Link></Button> : undefined} />
      {isLoading ? <LoadingBlock /> : error ? <ErrorBlock /> : !data?.length ? (
        <EmptyState
          icon={<Wrench className="h-5 w-5" />}
          title="Você ainda não registrou nenhuma manutenção."
          action={<Button asChild className="h-11"><Link to="/registrar">Registrar primeira manutenção</Link></Button>}
        />
      ) : (
        <ul className="space-y-3">
          {data.map((r) => (
            <li key={r.id}>
              <Link to="/historico/$id" params={{ id: r.id }} className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm hover:border-primary/40">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary"><Wrench className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{serviceLabel(r.service_type)}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {dateBR(r.service_date)} · {km(r.mileage)}
                    {r.workshop ? ` · ${r.workshop}` : ""}
                  </p>
                </div>
                {r.cost != null && <span className="text-sm font-semibold text-navy">{brl(r.cost)}</span>}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
