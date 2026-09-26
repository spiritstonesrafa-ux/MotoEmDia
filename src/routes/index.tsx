import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Gauge, MessageSquareText, ShieldCheck, Bike, Wrench, Eye } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MotoEmDia — Manutenção da sua moto em dia" },
      { name: "description", content: "Controle manutenções, acompanhe sua quilometragem e saiba o que precisa de atenção na sua moto." },
      { property: "og:title", content: "MotoEmDia — Manutenção da sua moto em dia" },
      { property: "og:description", content: "Controle manutenções, acompanhe a quilometragem e peça orçamento." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-1 text-sm font-medium">
            <a href="#como-funciona" className="hidden rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground sm:block">Como funciona</a>
            <a href="#beneficios" className="hidden rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground sm:block">Benefícios</a>
            <Link to="/auth" className="rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground">Entrar</Link>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/auth" search={{ mode: "signup" }}>Cadastrar minha moto</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Manutenção preventiva simples
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-navy md:text-5xl">
            Cuide da sua moto antes que ela cobre a conta.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Controle manutenções, acompanhe sua quilometragem e saiba o que precisa de atenção.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 text-base">
              <Link to="/auth" search={{ mode: "signup" }}>Cadastrar minha moto</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 text-base">
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </div>
          <Link to="/demo" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <Eye className="h-4 w-4" /> Ver demonstração
          </Link>
        </div>
        <HeroMock />
      </section>

      <section id="como-funciona" className="border-y bg-card py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-navy">Como funciona</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: 1, icon: Bike, t: "Cadastre sua moto", d: "Informe modelo, ano e quilometragem." },
              { n: 2, icon: Wrench, t: "Registre suas manutenções", d: "Salve trocas de óleo, revisões e outros serviços." },
              { n: 3, icon: Gauge, t: "Acompanhe tudo", d: "Veja rapidamente o que está OK e o que merece atenção." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border bg-background p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy font-display font-bold text-navy-foreground">{s.n}</span>
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-navy">{s.t}</h3>
                <p className="mt-1 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-navy">Benefícios</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ClipboardList, t: "Histórico organizado", d: "Todas as manutenções da moto em um único lugar." },
              { icon: Gauge, t: "Acompanhamento por quilometragem", d: "Registre a quilometragem atual da moto." },
              { icon: ShieldCheck, t: "Manutenção preventiva", d: "Visualização rápida dos itens que merecem atenção." },
              { icon: MessageSquareText, t: "Solicitação de orçamento", d: "Demonstre interesse em realizar um serviço." },
            ].map((b) => (
              <div key={b.t} className="rounded-2xl border bg-card p-6 shadow-sm">
                <b.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold text-navy">{b.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-3xl bg-navy p-8 text-center text-navy-foreground">
            <h3 className="text-2xl font-bold">Comece agora, é gratuito.</h3>
            <Button asChild size="lg" className="mt-5 h-12">
              <Link to="/auth" search={{ mode: "signup" }}>Cadastrar minha moto</Link>
            </Button>
          </div>
        </div>
      </section>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© MotoEmDia</footer>
    </div>
  );
}

function HeroMock() {
  const items = [
    { l: "Óleo", s: "OK", c: "bg-ok-soft text-ok", w: "35%", d: "bg-ok" },
    { l: "Relação", s: "Atenção", c: "bg-warn-soft text-warn", w: "85%", d: "bg-warn" },
    { l: "Freios", s: "OK", c: "bg-ok-soft text-ok", w: "50%", d: "bg-ok" },
    { l: "Pneus", s: "Verificar", c: "bg-danger-soft text-danger", w: "100%", d: "bg-danger" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-2xl" />
      <div className="relative rounded-[2rem] border bg-card p-4 shadow-xl">
        <div className="rounded-2xl bg-navy p-5 text-navy-foreground">
          <p className="text-xs uppercase tracking-widest text-navy-foreground/60">Minha Moto</p>
          <p className="mt-1 font-display text-xl font-bold">Honda NXR 160 Bros</p>
          <p className="mt-3 font-display text-3xl font-bold">42.350 km</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {items.map((i) => (
            <div key={i.l} className="rounded-xl border p-3">
              <p className="text-sm font-semibold">{i.l}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${i.c}`}>{i.s}</span>
              <div className="mt-2 h-1 rounded-full bg-muted">
                <div className={`h-full rounded-full ${i.d}`} style={{ width: i.w }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
