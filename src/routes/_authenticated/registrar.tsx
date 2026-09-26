import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceForm } from "@/components/MaintenanceForm";
import { ErrorBlock, LoadingBlock, PageTitle } from "@/components/AppShell";
import { useMoto } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/registrar")({
  head: () => ({ meta: [{ title: "Registrar manutenção — MotoEmDia" }, { name: "description", content: "Registre uma manutenção." }] }),
  component: Registrar,
});

function Registrar() {
  const moto = useMoto();
  const qc = useQueryClient();
  const navigate = useNavigate();
  if (moto.isLoading) return <LoadingBlock />;
  if (moto.error) return <ErrorBlock />;
  if (!moto.data) return <Navigate to="/moto" />;
  const m = moto.data;

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title="Registrar manutenção" subtitle={`${m.manufacturer} ${m.model}`} />
      <MaintenanceForm
        defaultMileage={m.current_mileage}
        onSubmit={async (v) => {
          const { data: u } = await supabase.auth.getUser();
          const { error } = await supabase.from("maintenance_records").insert({ ...v, motorcycle_id: m.id, user_id: u.user!.id });
          if (error) { toast.error(error.message); return false; }
          if (v.mileage > m.current_mileage) {
            await supabase.from("motorcycles").update({ current_mileage: v.mileage }).eq("id", m.id);
            qc.invalidateQueries({ queryKey: ["moto"] });
          }
          toast.success("Manutenção salva");
          await qc.invalidateQueries({ queryKey: ["records"] });
          navigate({ to: "/historico" });
          return true;
        }}
      />
    </div>
  );
}
