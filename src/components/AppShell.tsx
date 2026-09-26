import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { History, Home, LogOut, MessageSquareText, PlusCircle, Shield, User } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/lib/queries";

const NAV = [
  { to: "/app", label: "Início", icon: Home },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/registrar", label: "Registrar", icon: PlusCircle },
  { to: "/solicitacoes", label: "Solicitações", icon: MessageSquareText },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { data: isAdmin } = useIsAdmin();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo to="/app" />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary !text-navy" }}
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-accent">
                Admin
              </Link>
            )}
            <button onClick={signOut} className="ml-2 rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary md:hidden">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 md:pb-12">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card md:hidden">
        <div className="grid grid-cols-5">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
              activeProps={{ className: "!text-primary" }}
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, action, icon }: { title: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
      {icon && <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent text-primary">{icon}</div>}
      <p className="font-medium text-foreground">{title}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

export function ErrorBlock({ message = "Não foi possível carregar os dados." }: { message?: string }) {
  return <div className="rounded-2xl bg-danger-soft p-4 text-sm text-danger">{message}</div>;
}
