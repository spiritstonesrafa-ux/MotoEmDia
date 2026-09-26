import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { MessageSquareText, Settings2 } from "lucide-react";
import { DashboardView } from "@/components/DashboardView";
import { MileageDialog } from "@/components/MileageDialog";
import { ErrorBlock, LoadingBlock } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useIntervals, useMoto, useRecords } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Minha Moto — MotoEmDia" }, { name: "description", content: "Painel da sua moto." }] }),
  component: Dashboard,
});

function Dashboard() {
  const moto = useMoto();
  const records = useRecords();
  const intervals = useIntervals(moto.data?.id);

  if (moto.isLoading || records.isLoading) return <LoadingBlock />;
  if (moto.error || records.error) return <ErrorBlock />;
  if (!moto.data) return <Navigate to="/moto" />;

  return (
    <DashboardView
      moto={moto.data}
      records={records.data ?? []}
      intervals={intervals.data ?? []}
      headerActions={
        <>
          <MileageDialog moto={moto.data} />
          <Button asChild className="h-11">
            <Link to="/orcamento"><MessageSquareText className="mr-1 h-4 w-4" /> Solicitar orçamento</Link>
          </Button>
        </>
      }
      statusFooter={
        <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-accent p-4 text-sm text-accent-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>O status usa apenas os intervalos que você definiu e os registros que você salvou.</p>
          <Button asChild variant="outline" size="sm"><Link to="/intervalos"><Settings2 className="mr-1 h-4 w-4" /> Definir intervalos</Link></Button>
        </div>
      }
    />
  );
}
