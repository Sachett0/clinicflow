/**
 * Rota de API do login: atende tudo em /api/auth/* (entrar, sair, cadastrar,
 * consultar sessão...). Não é uma página: só responde requisições do navegador,
 * repassando-as para o Better Auth.
 */
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/server/auth";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
