import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, ErrorBlock, LoadingBlock, PageTitle } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdminData } from "@/lib/admin-queries";
import { dateBR, km, QUOTE_STATUS, serviceLabel, whatsappLink, type QuoteStatus } from "@/lib/moto";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  component: Leads,
});

function Leads() {
  const { data, isLoading, error } = useAdminData();
  const [filter, setFilter] = useState("todos");
  const [openId, setOpenId] = useState<string | null>(null);
  const qc = useQueryClient();

  if (isLoading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock />;
  const list = data.quotes.filter((q) => filter === "todos" || q.status === filter);
  const open = data.quotes.find((q) => q.id === openId);
  const emailOf = (uid: string) => data.profiles.find((p) => p.user_id === uid)?.email ?? "";

  async function changeStatus(id: string, status: QuoteStatus) {
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado");
    qc.invalidateQueries({ queryKey: ["admin-data"] });
  }

  return (
    <div>
      <PageTitle
        title="Solicitações"
        action={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-10 w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {QUOTE_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
      {!list.length ? <EmptyState title="Nenhuma solicitação encontrada." /> : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="hidden grid-cols-[1.3fr_1fr_1.2fr_1fr_0.8fr_1fr] gap-3 border-b bg-secondary px-4 py-2 text-xs font-semibold text-muted-foreground md:grid">
            <span>Usuário</span><span>Telefone</span><span>Moto</span><span>Serviço</span><span>Data</span><span>Status</span>
          </div>
          <ul className="divide-y">
            {list.map((q) => (
              <li key={q.id}>
                <button onClick={() => setOpenId(q.id)} className="grid w-full gap-1 px-4 py-3 text-left text-sm hover:bg-secondary/60 md:grid-cols-[1.3fr_1fr_1.2fr_1fr_0.8fr_1fr] md:items-center md:gap-3">
                  <span className="font-semibold">{q.contact_name}</span>
                  <span className="text-muted-foreground">{q.phone}</span>
                  <span className="truncate text-muted-foreground">{q.motorcycle_label || "—"}</span>
                  <span>{serviceLabel(q.service_type)}</span>
                  <span className="text-muted-foreground">{dateBR(q.created_at)}</span>
                  <span><StatusBadge status={q.status} /></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && (
            <>
              <SheetHeader><SheetTitle>{serviceLabel(open.service_type)}</SheetTitle></SheetHeader>
              <dl className="mt-4 divide-y text-sm">
                {[
                  ["Nome", open.contact_name],
                  ["E-mail", emailOf(open.user_id)],
                  ["Telefone", open.phone],
                  ["Moto", open.motorcycle_label || "—"],
                  ["Quilometragem", km(open.mileage)],
                  ["Preferência", open.preferred_contact === "ligacao" ? "Ligação" : "WhatsApp"],
                  ["Data", dateBR(open.created_at)],
                  ["Descrição", open.description || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium whitespace-pre-wrap">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-4 space-y-3">
                <Select value={open.status} onValueChange={(v) => changeStatus(open.id, v as QuoteStatus)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>{QUOTE_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
                <Button asChild className="h-11 w-full">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={whatsappLink(
                      open.phone,
                      `Olá, ${open.contact_name}. Recebemos sua solicitação pelo MotoEmDia sobre ${serviceLabel(open.service_type).toLowerCase()}${open.motorcycle_label ? ` para sua ${open.motorcycle_label}` : ""}.`,
                    )}
                  >
                    <MessageCircle className="mr-1 h-4 w-4" /> Conversar pelo WhatsApp
                  </a>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
