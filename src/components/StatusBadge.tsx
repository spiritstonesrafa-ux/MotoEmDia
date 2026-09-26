import { statusLabel } from "@/lib/moto";

const CLS: { [k: string]: string } = {
  novo: "bg-accent text-primary",
  em_contato: "bg-warn-soft text-warn",
  orcamento_enviado: "bg-secondary text-navy",
  servico_realizado: "bg-ok-soft text-ok",
  encerrado: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLS[status] ?? ""}`}>{statusLabel(status)}</span>;
}
