import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, ErrorBlock, LoadingBlock, PageTitle } from "@/components/AppShell";
import { MaintenanceForm } from "@/components/MaintenanceForm";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRecords } from "@/lib/queries";
import { brl, dateBR, km, serviceLabel } from "@/lib/moto";

export const Route = createFileRoute("/_authenticated/historico/$id")({
  head: () => ({ meta: [{ title: "Manutenção — MotoEmDia" }, { name: "description", content: "Detalhes da manutenção." }] }),
  component: Detalhe,
});

function Detalhe() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useRecords();
  const [editing, setEditing] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  if (isLoading) return <LoadingBlock />;
  if (error) return <ErrorBlock />;
  const r = data?.find((x) => x.id === id);
  if (!r) return <EmptyState title="Registro não encontrado." action={<Button asChild><Link to="/historico">Voltar</Link></Button>} />;

  async function remove() {
    const { error } = await supabase.from("maintenance_records").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Registro excluído");
    await qc.invalidateQueries({ queryKey: ["records"] });
    navigate({ to: "/historico" });
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/historico" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Histórico</Link>
      <PageTitle title={editing ? "Editar manutenção" : serviceLabel(r.service_type)} />
      {editing ? (
        <MaintenanceForm
          initial={r}
          submitLabel="Salvar alterações"
          onSubmit={async (v) => {
            const { error } = await supabase.from("maintenance_records").update(v).eq("id", id);
            if (error) { toast.error(error.message); return false; }
            toast.success("Registro atualizado");
            await qc.invalidateQueries({ queryKey: ["records"] });
            setEditing(false);
            return true;
          }}
        />
      ) : (
        <>
          <dl className="divide-y rounded-2xl border bg-card">
            {[
              ["Serviço", serviceLabel(r.service_type)],
              ["Data", dateBR(r.service_date)],
              ["Quilometragem", km(r.mileage)],
              ["Valor", brl(r.cost) ?? "Não informado"],
              ["Oficina", r.workshop ?? "Não informada"],
              ["Observações", r.notes ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 p-4 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium whitespace-pre-wrap">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11" onClick={() => setEditing(true)}><Pencil className="mr-1 h-4 w-4" /> Editar</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="h-11 text-danger"><Trash2 className="mr-1 h-4 w-4" /> Excluir</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir este registro?</AlertDialogTitle>
                  <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}
