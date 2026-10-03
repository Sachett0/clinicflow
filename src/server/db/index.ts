/**
 * Conexão com o banco de dados.
 *
 * Fica dentro de `src/server/`: o vite.config.ts bloqueia qualquer import desta
 * pasta pelo código do navegador, então a senha do banco nunca vai para o cliente.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env["DATABASE_URL"];
if (!url) {
  throw new Error("DATABASE_URL não definida. Copie .env.example para .env.");
}

// `postgres` abre e gerencia as conexões; `drizzle` adiciona as consultas tipadas.
const client = postgres(url);

export const db = drizzle(client, { schema });
