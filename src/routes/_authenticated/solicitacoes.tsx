import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquareText } from "lucide-react";
import { EmptyState, ErrorBlock, LoadingBlock, PageTitle } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useMyQuotes } from "@/lib/queries";
import { dateBR, serviceLabel } from "@/lib/moto";

export const Route = createFileRoute("/_authenticated/solicitacoes")({
  head: () => ({ meta: [{ title: "Minhas solicitações — MotoEmDia" }, { name: "description", content: "Acompanhe suas solicitações de orçamento." }] }),
  component: Solicitacoes,
});

function Solicitacoes() {
  const { data, isLoading, error } = useMyQuotes();
  return (
    <div>
      <PageTitle title="Minhas solicitações" action={<Button asChild><Link to="/orcamento">Solicitar orçamento</Link></Button>} />
      {isLoading ? <LoadingBlock /> : error ? <ErrorBlock /> : !data?.length ? (
        <EmptyState icon={<MessageSquareText className="h-5 w-5" />} title="Você ainda não fez nenhuma solicitação."
          action={<Button asChild className="h-11"><Link to="/orcamento">Solicitar orçamento</Link></Button>} />
      ) : (
        <ul className="space-y-3">
          {data.map((q) => (
            <li key={q.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="min-w-0">
                <p className="font-semibold">{serviceLabel(q.service_type)}</p>
                <p className="text-sm text-muted-foreground">{dateBR(q.created_at)}</p>
              </div>
              <StatusBadge status={q.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
