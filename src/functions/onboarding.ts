/**
 * Função de servidor chamada pela tela de cadastro, logo depois de criar o
 * usuário, para criar a clínica dele (usando a transação de `server/onboarding`).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Regras que os dados vindos do navegador precisam cumprir. */
const newClinicSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da clínica"),
  email: z.string().trim().email("E-mail inválido"),
  city: z.string().trim().optional(),
  uf: z.string().trim().length(2, "Use a sigla do estado, ex.: SP").optional(),
});

export const createClinicFn = createServerFn({ method: "POST" })
  // Confere os dados ANTES do handler rodar. Se não cumprirem as regras, dá erro.
  .inputValidator(newClinicSchema)
  .handler(async ({ data }) => {
    // TODO (exercício da Etapa 1):
    //   1. descobrir QUEM está chamando (a sessão)
    //   2. se ninguém estiver logado, recusar com um erro
    //   3. chamar createClinicForUser com o id do usuário e `data`
    //   4. devolver o resultado
    void data;
    throw new Error("createClinicFn ainda não foi implementada");
  });
