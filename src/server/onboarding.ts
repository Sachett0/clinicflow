/**
 * Onboarding: cria uma clínica nova para um usuário que acabou de se cadastrar.
 *
 * Passos (TODOS ou NENHUM, por isso uma transação):
 *   1. criar a clínica
 *   2. criar o perfil "Administrador" nessa clínica
 *   3. dar ao perfil todas as permissões do catálogo
 *   4. vincular o usuário à clínica com esse perfil
 *
 * O usuário em si já foi criado antes, pelo Better Auth, no cadastro.
 */
import { db } from "./db";
import { clinics, memberships, rolePermissions, roles } from "./db/schema";
import { ALL_PERMISSIONS } from "./permissions";

export interface NewClinicInput {
  name: string;
  email: string;
  cnpj?: string | undefined;
  phone?: string | undefined;
  city?: string | undefined;
  uf?: string | undefined;
}

export async function createClinicForUser(userId: string, input: NewClinicInput) {
  // Tudo dentro deste bloco é UMA transação: se algo falhar, nada fica salvo.
  // Dentro dele, use sempre `tx` (e nunca `db`).
  return db.transaction(async (tx) => {
    // Passo 1: criar a clínica e pegar de volta o id que o banco gerou
    const [clinic] = await tx
      .insert(clinics)
      .values({
        name: input.name,
        email: input.email,
        cnpj: input.cnpj,
        phone: input.phone,
        city: input.city,
        uf: input.uf,
      })
      .returning({ id: clinics.id });

    // Passo 2: criar o perfil "Administrador" NESTA clínica (clinic!.id)
    const [role] = await tx
      .insert(roles)
      .values({
        name: "Administrador",
        clinicId: clinic!.id,
      })
      .returning({ id: roles.id });

    // Passo 3: dar ao perfil todas as permissões (ALL_PERMISSIONS + .map)
    await tx.insert(rolePermissions).values(
      ALL_PERMISSIONS.map((permission) => ({
        roleId: role!.id,
        permission,
      })),
    );

    // Passo 4: vincular o usuário (userId) à clínica, com o perfil criado
    const [membership] = await tx
      .insert(memberships)
      .values({
        userId,
        clinicId: clinic!.id,
        roleId: role!.id,
      })
      .returning({ id: memberships.id });

    // return { clinicId: ..., roleId: ..., membershipId: ... };
    return { clinicId: clinic!.id, roleId: role!.id, membershipId: membership!.id };
  });
}
