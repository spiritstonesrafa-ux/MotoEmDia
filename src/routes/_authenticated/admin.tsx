import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    // UX gate only; data access is enforced by database policies (has_role).
    const { data } = await supabase.rpc("has_role", { _user_id: context.user.id, _role: "admin" });
    if (!data) throw redirect({ to: "/app" });
  },
  head: () => ({ meta: [{ title: "Admin — MotoEmDia" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const tabs = [
    { to: "/admin", label: "Visão geral", exact: true },
    { to: "/admin/leads", label: "Solicitações", exact: false },
    { to: "/admin/usuarios", label: "Usuários", exact: false },
  ] as const;
  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-secondary p-1">
        {tabs.map((t) => (
          <Link key={t.to} to={t.to} activeOptions={{ exact: t.exact }}
            className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground"
            activeProps={{ className: "bg-card !text-navy shadow-sm" }}>
            {t.label}
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
