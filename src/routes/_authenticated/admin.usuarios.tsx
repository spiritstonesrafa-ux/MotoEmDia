import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState, ErrorBlock, LoadingBlock, PageTitle } from "@/components/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdminData } from "@/lib/admin-queries";
import { dateBR, km } from "@/lib/moto";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  component: Usuarios,
});

function Usuarios() {
  const { data, isLoading, error } = useAdminData();
  const [openId, setOpenId] = useState<string | null>(null);
  if (isLoading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock />;

  const rows = data.profiles.map((p) => {
    const moto = data.motos.find((m) => m.user_id === p.user_id);
    return {
      ...p,
      moto,
      records: data.records.filter((r) => r.user_id === p.user_id).length,
      quotes: data.quotes.filter((q) => q.user_id === p.user_id).length,
    };
  });
  const open = rows.find((r) => r.user_id === openId);

  return (
    <div>
      <PageTitle title="Usuários" subtitle={`${rows.length} cadastrados`} />
      {!rows.length ? <EmptyState title="Nenhum usuário ainda." /> : (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
          {rows.map((u) => (
            <li key={u.user_id}>
              <button onClick={() => setOpenId(u.user_id)} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left text-sm hover:bg-secondary/60">
                <div className="min-w-0">
                  <p className="font-semibold">{u.name || "Sem nome"}</p>
                  <p className="truncate text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{u.moto ? `${u.moto.manufacturer} ${u.moto.model}` : "Sem moto"}</span>
                  <span>{u.records} manut.</span>
                  <span>{u.quotes} solic.</span>
                  <span>{dateBR(u.created_at)}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {open && (
            <>
              <SheetHeader><SheetTitle>{open.name || "Usuário"}</SheetTitle></SheetHeader>
              <dl className="mt-4 divide-y text-sm">
                {[
                  ["E-mail", open.email ?? "—"],
                  ["Telefone", open.phone ?? "—"],
                  ["Cadastro", dateBR(open.created_at)],
                  ["Moto", open.moto ? `${open.moto.manufacturer} ${open.moto.model} ${open.moto.year}` : "—"],
                  ["Quilometragem", open.moto ? km(open.moto.current_mileage) : "—"],
                  ["Manutenções", String(open.records)],
                  ["Solicitações", String(open.quotes)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
                ))}
              </dl>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
