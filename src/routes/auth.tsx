import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => ({
    mode: s.mode === "signup" || s.mode === "forgot" ? s.mode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar — MotoEmDia" },
      { name: "description", content: "Entre ou crie sua conta no MotoEmDia." },
      { property: "og:title", content: "Entrar — MotoEmDia" },
      { property: "og:description", content: "Entre ou crie sua conta no MotoEmDia." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(72),
});

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(search.mode ?? "login");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse({ name: f.get("name"), email, password });
        if (!parsed.success) return toast.error(parsed.error.issues[0].message);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/app", data: { name: parsed.data.name } },
        });
        if (error) return toast.error(traduz(error.message));
        if (data.session) navigate({ to: "/moto" });
        else setSent("Enviamos um link de confirmação para o seu e-mail. Após confirmar, você poderá cadastrar sua moto.");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return toast.error(traduz(error.message));
        navigate({ to: "/app" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) return toast.error(traduz(error.message));
        setSent("Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-6"><Logo /></div>
      <div className="w-full max-w-sm rounded-3xl border bg-card p-6 shadow-sm">
        {sent ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-navy">Verifique seu e-mail</h1>
            <p className="mt-2 text-sm text-muted-foreground">{sent}</p>
            <Button variant="outline" className="mt-5 w-full" onClick={() => { setSent(null); setMode("login"); }}>
              Voltar ao login
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-navy">
              {mode === "signup" ? "Criar conta" : mode === "login" ? "Entrar" : "Recuperar senha"}
            </h1>
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" name="name" required autoComplete="name" className="h-11" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" className="h-11" />
              </div>
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" required minLength={mode === "signup" ? 8 : 1}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"} className="h-11" />
                </div>
              )}
              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? "Aguarde..." : mode === "signup" ? "Criar conta" : mode === "login" ? "Entrar" : "Enviar link"}
              </Button>
            </form>
            <div className="mt-5 space-y-2 text-center text-sm">
              {mode === "login" && (
                <>
                  <button className="text-primary hover:underline" onClick={() => setMode("forgot")}>Esqueci minha senha</button>
                  <p className="text-muted-foreground">Não tem conta? <button className="font-medium text-primary hover:underline" onClick={() => setMode("signup")}>Criar conta</button></p>
                </>
              )}
              {mode !== "login" && (
                <p className="text-muted-foreground">Já tem conta? <button className="font-medium text-primary hover:underline" onClick={() => setMode("login")}>Entrar</button></p>
              )}
            </div>
          </>
        )}
      </div>
      <Link to="/" className="mt-6 text-sm text-muted-foreground hover:text-foreground">← Voltar</Link>
    </div>
  );
}

function traduz(msg: string) {
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/already registered/i.test(msg)) return "Este e-mail já está cadastrado.";
  if (/email not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar.";
  if (/pwned|leaked|weak/i.test(msg)) return "Essa senha é muito fraca ou já vazou. Escolha outra.";
  return msg;
}
