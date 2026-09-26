import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, ClipboardList, Wrench } from "lucide-react";
import { computeStatus, dateBR, km, serviceLabel, STATUS_META, type Interval, type Moto, type Record } from "@/lib/moto";

export function DashboardView({
  moto,
  records,
  intervals,
  headerActions,
  statusFooter,
}: {
  moto: Moto;
  records: Record[];
  intervals: Interval[];
  headerActions?: ReactNode;
  statusFooter?: ReactNode;
}) {
  const states = computeStatus(moto, records, intervals);
  const ok = states.filter((s) => s.status === "ok").length;
  const attention = states.filter((s) => s.status === "atencao" || s.status === "verificar").length;
  const last = records[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-navy-foreground sm:p-7">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-foreground/60">Minha Moto</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          {moto.manufacturer} {moto.model}
        </h1>
        <p className="text-sm text-navy-foreground/70">
          {moto.year}
          {moto.nickname ? ` · “${moto.nickname}”` : ""}
          {moto.engine_capacity ? ` · ${moto.engine_capacity} cc` : ""}
        </p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-navy-foreground/60">Quilometragem atual</p>
            <p className="font-display text-3xl font-bold tabular-nums sm:text-4xl">{km(moto.current_mileage)}</p>
          </div>
          <div className="flex flex-wrap gap-2">{headerActions}</div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<ClipboardList className="h-4 w-4" />} label="Manutenções" value={String(records.length)} />
        <Stat icon={<CheckCircle2 className="h-4 w-4 text-ok" />} label="Itens OK" value={String(ok)} />
        <Stat icon={<AlertTriangle className="h-4 w-4 text-warn" />} label="Precisam de atenção" value={String(attention)} />
        <Stat
          icon={<Wrench className="h-4 w-4" />}
          label="Última manutenção"
          value={last ? serviceLabel(last.service_type) : "—"}
          sub={last ? dateBR(last.service_date) : undefined}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy">Situação da sua moto</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {states.map((s) => {
            const meta = STATUS_META[s.status];
            const pct = s.interval && s.used != null ? Math.min(100, (s.used / s.interval) * 100) : 0;
            return (
              <div key={s.category} className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{s.label}</p>
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                </div>
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${meta.cls}`}>{meta.label}</span>
                {s.interval && s.used != null && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${meta.dot}`} style={{ width: `${pct}%` }} />
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">{s.hint}</p>
              </div>
            );
          })}
        </div>
        {statusFooter}
      </section>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 truncate font-display text-xl font-bold text-navy">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
