import { pgTable, timestamp, uuid, text, varchar } from "drizzle-orm/pg-core";

export const clinics = pgTable("clinics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  cnpj: text("cnpj").unique(),
  email: text("email").notNull(),
  phone: text("phone"),
  city: text("city"),
  uf: varchar("uf", { length: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});