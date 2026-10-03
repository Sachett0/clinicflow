import { defineConfig } from "drizzle-kit";

// Carrega as variáveis do arquivo .env (recurso nativo do Node 20.12+).
process.loadEnvFile();

export default defineConfig({
  dialect: "postgresql",
  // Onde ficam as definições das tabelas (escritas em TypeScript).
  schema: "./src/server/db/schema",
  // Onde o Drizzle Kit grava os arquivos SQL de migration gerados.
  out: "./drizzle",
  dbCredentials: {
    url: process.env["DATABASE_URL"]!,
  },
  // Pede confirmação antes de comandos que podem apagar dados.
  strict: true,
  verbose: true,
});
