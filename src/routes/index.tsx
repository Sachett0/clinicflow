import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/layout/Logo";
import { getSessionFn } from "@/functions/session";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar · ClinicFlow — Gestão para clínicas de fisioterapia" },
      {
        name: "description",
        content:
          "Acesse o ClinicFlow: agenda, prontuário eletrônico, evoluções, documentos com assinatura eletrônica, WhatsApp e financeiro em um só lugar.",
      },
      { property: "og:title", content: "ClinicFlow — Gestão completa para clínicas de saúde" },
      {
        property: "og:description",
        content: "Agenda, prontuário, documentos, comunicação e financeiro para clínicas de fisioterapia.",
      },
    ],
  }),
  // Quem já está logado não precisa ver a tela de entrada.
  beforeLoad: async () => {
    if (await getSessionFn()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

const schema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  keepConnected: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", keepConnected: true },
  });

  const onSubmit = async (values: FormValues) => {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      // Desmarcado: a sessão termina ao fechar o navegador.
      rememberMe: values.keepConnected ?? false,
    });
    if (error) {
      // Mensagem genérica de propósito: não revela se o e-mail existe ou não.
      toast.error("E-mail ou senha incorretos.");
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm space-y-8">
          <Logo />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Entrar na sua clínica</h1>
            <p className="text-sm text-muted-foreground">
              Gestão clínica completa, do agendamento ao faturamento.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute inset-y-0 right-3 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={!!form.watch("keepConnected")}
                  onCheckedChange={(v) => form.setValue("keepConnected", v === true)}
                />
                Manter conectado
              </label>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() =>
                  toast.info("Recuperação de senha", {
                    description: "Enviaremos um link assim que o backend estiver conectado.",
                  })
                }
              >
                Esqueci minha senha
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Entrar
            </Button>

            <div className="flex items-start gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Verificação em duas etapas (MFA) disponível para ativação nas configurações de segurança da
                clínica.
              </span>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link to="/cadastro" className="font-medium text-primary hover:underline">
              Cadastre sua clínica
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <p className="text-sm opacity-80">ClinicFlow para clínicas de fisioterapia e saúde</p>
        <div className="space-y-6">
          <h2 className="text-3xl leading-tight font-semibold">Toda a operação da clínica em um fluxo só.</h2>
          <ul className="space-y-3 text-sm opacity-90">
            <li>Agenda por profissional, sala e serviço com confirmação automática.</li>
            <li>Prontuário eletrônico com avaliações, evoluções e planos terapêuticos.</li>
            <li>Documentos com assinatura eletrônica e trilha completa de auditoria.</li>
            <li>Financeiro com pacotes de sessões, cobranças e indicadores.</li>
          </ul>
        </div>
        <p className="text-xs opacity-70">
          Arquitetura multi-clínica, pronta para LGPD e controle granular de permissões.
        </p>
      </div>
    </div>
  );
}
