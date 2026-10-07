import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { createClinicFn } from "@/functions/onboarding";
import { getSessionFn } from "@/functions/session";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Cadastrar clínica · ClinicFlow" }] }),
  beforeLoad: async () => {
    if (await getSessionFn()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SignUpPage,
});

const schema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo"),
    email: z.string().trim().email("E-mail inválido"),
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string(),
    clinicName: z.string().trim().min(2, "Informe o nome da clínica"),
    city: z.string().trim().optional(),
    uf: z
      .string()
      .trim()
      .toUpperCase()
      .refine((v) => v === "" || v.length === 2, "Use a sigla, ex.: SP")
      .optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function SignUpPage() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const err = form.formState.errors;

  const onSubmit = async (values: FormValues) => {
    // 1. Cria o usuário (o Better Auth já deixa ele logado).
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error("Não foi possível criar a conta.", {
        description: error.code === "USER_ALREADY_EXISTS" ? "Este e-mail já está cadastrado." : error.message,
      });
      return;
    }

    // 2. Cria a clínica dele (transação de onboarding, no servidor).
    try {
      await createClinicFn({
        data: {
          name: values.clinicName,
          email: values.email,
          city: values.city || undefined,
          uf: values.uf || undefined,
        },
      });
    } catch (e) {
      toast.error("Conta criada, mas a clínica não foi cadastrada.", {
        description: e instanceof Error ? e.message : String(e),
      });
      return;
    }

    toast.success("Clínica cadastrada!", { description: values.clinicName });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md space-y-8">
        <Logo />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Cadastre sua clínica</h1>
          <p className="text-sm text-muted-foreground">
            Você será o administrador e poderá convidar sua equipe depois.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <fieldset className="space-y-4">
            <legend className="mb-2 text-sm font-semibold">Seus dados</legend>
            <Field label="Nome completo" error={err.name?.message}>
              <Input autoComplete="name" {...form.register("name")} />
            </Field>
            <Field label="E-mail" error={err.email?.message}>
              <Input type="email" autoComplete="email" {...form.register("email")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Senha" error={err.password?.message}>
                <Input type="password" autoComplete="new-password" {...form.register("password")} />
              </Field>
              <Field label="Confirmar senha" error={err.confirmPassword?.message}>
                <Input type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-2 text-sm font-semibold">Sua clínica</legend>
            <Field label="Nome da clínica" error={err.clinicName?.message}>
              <Input {...form.register("clinicName")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_96px]">
              <Field label="Cidade (opcional)">
                <Input {...form.register("city")} />
              </Field>
              <Field label="UF" error={err.uf?.message}>
                <Input maxLength={2} placeholder="SP" {...form.register("uf")} />
              </Field>
            </div>
          </fieldset>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Criar conta e clínica
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
