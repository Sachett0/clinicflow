/**
 * Teste manual do onboarding, sem precisar de tela.
 *
 *   npm run test:onboarding            → cria uma clínica para o primeiro usuário do banco
 *   npm run test:onboarding -- falhar  → simula uma falha no ÚLTIMO passo, para ver a
 *                                        transação desfazer os passos que já tinham dado certo
 */
import { randomUUID } from "node:crypto";

process.loadEnvFile();

const { db } = await import("../src/server/db");
const { clinics, memberships, rolePermissions, roles } = await import("../src/server/db/schema");
const { createClinicForUser } = await import("../src/server/onboarding");

const simulateFailure = process.argv.includes("falhar");

const user = await db.query.users.findFirst();
if (!user) {
  console.error("Nenhum usuário no banco. Cadastre um antes.");
  process.exit(1);
}

const count = async () => ({
  clinicas: await db.$count(clinics),
  perfis: await db.$count(roles),
  permissoes: await db.$count(rolePermissions),
  vinculos: await db.$count(memberships),
});

// Na simulação, usamos um ID de usuário que NÃO existe: os passos 1 a 3 funcionam,
// mas o passo 4 (vínculo) é recusado pela chave estrangeira memberships → users.
const userId = simulateFailure ? randomUUID() : user.id;

console.log(simulateFailure ? "Modo: SIMULANDO FALHA no passo 4" : `Usuário: ${user.email}`);
console.log("ANTES: ", await count());

try {
  const result = await createClinicForUser(userId, {
    name: `Clínica Teste ${new Date().toLocaleTimeString("pt-BR")}`,
    email: "contato@teste.com",
    city: "São Paulo",
    uf: "SP",
  });
  console.log("OK:    ", result);
} catch (error) {
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error;
  console.log("ERRO:  ", cause instanceof Error ? cause.message : cause);
}

console.log("DEPOIS:", await count());
process.exit(0);
