/**
 * Configuração do login (Better Auth).
 *
 * A biblioteca cuida da parte sensível: hash de senha, sessões, cookies e
 * expiração. As tabelas dela (users, sessions, accounts, verifications) ficam
 * em `db/schema/auth.ts`, geradas pelo CLI do Better Auth.
 *
 * Vínculos com clínicas e perfis de acesso NÃO ficam aqui: são tabelas nossas.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "./db";

export const auth = betterAuth({
  appName: "ClinicFlow",
  database: drizzleAdapter(db, {
    provider: "pg",
    // Nomes de tabela no plural (users, sessions...), como a nossa `clinics`.
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // a sessão vale 7 dias...
    updateAge: 60 * 60 * 24, // ...e é renovada uma vez por dia de uso
  },
  advanced: {
    // IDs em UUID gerados pelo Postgres, iguais aos de `clinics`.
    database: { generateId: "uuid" },
  },
  // Deve ser o último plugin: grava os cookies de sessão nas respostas do TanStack Start.
  plugins: [tanstackStartCookies()],
});
