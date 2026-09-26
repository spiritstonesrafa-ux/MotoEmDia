export const SERVICE_TYPES = [
  { value: "oleo", label: "Troca de óleo" },
  { value: "revisao", label: "Revisão" },
  { value: "freios", label: "Freios" },
  { value: "pneus", label: "Pneus" },
  { value: "relacao", label: "Relação" },
  { value: "filtro_ar", label: "Filtro de ar" },
  { value: "vela", label: "Vela" },
  { value: "bateria", label: "Bateria" },
  { value: "outro", label: "Outro" },
] as const;

export const CATEGORIES = [
  { value: "oleo", label: "Óleo" },
  { value: "freios", label: "Freios" },
  { value: "pneus", label: "Pneus" },
  { value: "relacao", label: "Relação" },
  { value: "revisao", label: "Revisão" },
  { value: "filtro_ar", label: "Filtro de ar" },
  { value: "vela", label: "Vela" },
] as const;

export const QUOTE_STATUS = [
  { value: "novo", label: "Novo" },
  { value: "em_contato", label: "Em contato" },
  { value: "orcamento_enviado", label: "Orçamento enviado" },
  { value: "servico_realizado", label: "Serviço realizado" },
  { value: "encerrado", label: "Encerrado" },
] as const;

export type QuoteStatus = (typeof QUOTE_STATUS)[number]["value"];

export const serviceLabel = (v: string) =>
  SERVICE_TYPES.find((s) => s.value === v)?.label ?? v;
export const statusLabel = (v: string) => QUOTE_STATUS.find((s) => s.value === v)?.label ?? v;

export const km = (n: number | null | undefined) =>
  n == null ? "—" : `${n.toLocaleString("pt-BR")} km`;
export const brl = (n: number | null | undefined) =>
  n == null ? null : Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const dateBR = (d: string) => {
  const date = d.length === 10 ? new Date(d + "T12:00:00") : new Date(d);
  return date.toLocaleDateString("pt-BR");
};

export type Moto = {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  engine_capacity: number | null;
  plate: string | null;
  nickname: string | null;
  current_mileage: number;
};
export type Record = {
  id: string;
  service_type: string;
  service_date: string;
  mileage: number;
  cost: number | null;
  workshop: string | null;
  notes: string | null;
};
export type Interval = { category: string; interval_km: number | null };

export type ItemStatus = "ok" | "atencao" | "verificar" | "sem_info";

export type CategoryState = {
  category: string;
  label: string;
  status: ItemStatus;
  lastMileage: number | null;
  interval: number | null;
  used: number | null;
  hint: string;
};

/** Status based only on user-entered interval and user records. No mechanical defaults. */
export function computeStatus(moto: Moto, records: Record[], intervals: Interval[]): CategoryState[] {
  return CATEGORIES.map((c) => {
    const last = records
      .filter((r) => r.service_type === c.value)
      .sort((a, b) => b.mileage - a.mileage)[0];
    const interval = intervals.find((i) => i.category === c.value)?.interval_km ?? null;
    if (!last) {
      return { category: c.value, label: c.label, status: "sem_info", lastMileage: null, interval, used: null, hint: "Nenhum registro" };
    }
    if (!interval) {
      return { category: c.value, label: c.label, status: "sem_info", lastMileage: last.mileage, interval: null, used: null, hint: "Defina o intervalo" };
    }
    const used = Math.max(0, moto.current_mileage - last.mileage);
    const ratio = used / interval;
    const status: ItemStatus = ratio <= 0.7 ? "ok" : ratio <= 1 ? "atencao" : "verificar";
    return {
      category: c.value,
      label: c.label,
      status,
      lastMileage: last.mileage,
      interval,
      used,
      hint: `${used.toLocaleString("pt-BR")} de ${interval.toLocaleString("pt-BR")} km`,
    };
  });
}

export const STATUS_META: { [K in ItemStatus]: { label: string; cls: string; dot: string } } = {
  ok: { label: "OK", cls: "bg-ok-soft text-ok", dot: "bg-ok" },
  atencao: { label: "Atenção", cls: "bg-warn-soft text-warn", dot: "bg-warn" },
  verificar: { label: "Verificar", cls: "bg-danger-soft text-danger", dot: "bg-danger" },
  sem_info: { label: "Sem informações", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/40" },
};

export function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}
export function whatsappLink(phone: string, message: string) {
  let d = onlyDigits(phone);
  if (d.length <= 11) d = "55" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(message)}`;
}
