/**
 * Funções de servidor sobre a sessão do usuário.
 *
 * Uma "função de servidor" (createServerFn) é chamada pelo navegador como uma
 * função comum, mas o corpo dela (`handler`) roda SÓ no servidor: o navegador
 * recebe apenas o resultado. Por isso ela pode usar o banco e o Better Auth.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { clinics, memberships, roles } from "@/server/db/schema";

/**
 * Devolve o usuário logado e as clínicas a que ele tem acesso,
 * ou `null` se ninguém estiver logado.
 */
export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  // O Better Auth lê o cookie de sessão que veio junto com a requisição.
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  if (!session) return null;

  const userClinics = await db
    .select({
      clinicId: clinics.id,
      clinicName: clinics.name,
      roleName: roles.name,
    })
    .from(memberships)
    .innerJoin(clinics, eq(clinics.id, memberships.clinicId))
    .innerJoin(roles, eq(roles.id, memberships.roleId))
    .where(eq(memberships.userId, session.user.id));

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
    clinics: userClinics,
  };
});

export type SessionData = NonNullable<Awaited<ReturnType<typeof getSessionFn>>>;
