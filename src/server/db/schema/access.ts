import { boolean, pgTable, primaryKey, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { clinics } from "./clinics";
import { users } from "./auth";

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // chave estrangeira: aponta para a clínica dona deste perfil
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),

    // nome do perfil (ex: "Administrador", "Recepção", "Médico")
    name: text("name").notNull(),

    // descrição do perfil
    description: text("description"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  // a COMBINAÇÃO clínica + nome não pode repetir, ou seja, não pode haver dois perfis com o mesmo nome na mesma clínica
  (t) => [unique().on(t.clinicId, t.name)],
);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // chave estrangeira: aponta para a clínica do usuário
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),

    // chave estrangeira: aponta para o perfil do usuário
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),

    // chave estrangeira: aponta para o usuário
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },

  (t) => [unique().on(t.clinicId, t.userId)],
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permission: text("permission").notNull(),
  },
  // a COMBINAÇÃO perfil + permissão não pode repetir, ou seja, não pode haver dois registros para o mesmo perfil com a mesma permissão
  (t) => [primaryKey({ columns: [t.roleId, t.permission] })],
);
