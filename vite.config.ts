import { defineConfig, type PluginOption } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(async ({ command }) => {
  const plugins: PluginOption[] = [
    tailwindcss(),
    tanstackStart({
      // Usa src/server.ts (nosso wrapper de erros de SSR) como entrada do servidor.
      server: { entry: "server" },
      // Impede que código de servidor (pastas `server/` ou módulos marcados
      // com "server-only") seja enviado por engano para o navegador.
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
  ];

  // Nitro empacota o servidor para produção (`npm run build`); não é usado no dev.
  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(nitro());
  }

  // O plugin do React deve vir depois do TanStack Start.
  plugins.push(viteReact());

  return {
    plugins,
    resolve: {
      // Lê o atalho `@/` → `src/` direto do tsconfig.json.
      tsconfigPaths: true,
    },
    server: {
      host: "::",
      port: 8080,
    },
  };
});
