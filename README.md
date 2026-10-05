# ClinicFlow

Sistema de gestão para clínicas de fisioterapia e saúde: agenda, pacientes, prontuário,
avaliações, evoluções, planos terapêuticos, financeiro e auditoria — com várias clínicas
(multi-tenant) no mesmo sistema e controle de acesso por perfil.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_17-4169E1?logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

> **Em desenvolvimento.** A interface está completa com dados fictícios; o back-end está sendo
> construído por etapas (veja o [roadmap](#roadmap)).

## Sobre o projeto

A interface foi prototipada com [Lovable](https://lovable.dev) a partir de uma
[especificação de produto](docs/ESPECIFICACAO-ORIGINAL.md). A partir daí, o trabalho é meu:
remover a dependência da plataforma, organizar o código e construir o back-end real —
banco de dados, autenticação, modelo de permissões e regras de negócio.

O foco do back-end é o que torna um sistema de saúde difícil de fazer direito:

- **Multi-tenant:** cada clínica é isolada. Um usuário pode pertencer a mais de uma clínica,
  com um perfil diferente em cada.
- **Permissões por perfil (RBAC):** um catálogo fixo de permissões (`patients.read`,
  `clinical.read`, `financial.create`…) que cada clínica distribui entre seus perfis.
  Dados clínicos ficam separados dos cadastrais, para que a recepção não acesse prontuários
  (LGPD).
- **Consistência:** o cadastro de uma clínica (clínica → perfil Administrador → permissões →
  vínculo do usuário) roda numa única transação: ou tudo é salvo, ou nada.

## Tecnologias

| Camada    | Ferramentas                                                                    |
| --------- | ------------------------------------------------------------------------------ |
| Front-end | React 19, TanStack Router/Query, Tailwind CSS, shadcn/ui, React Hook Form, Zod |
| Back-end  | TanStack Start (server functions), Better Auth                                 |
| Banco     | PostgreSQL 17 em Docker, Drizzle ORM e migrations versionadas                  |
| Qualidade | TypeScript estrito, ESLint, Prettier                                           |

## Modelo de acesso

```
users ──< memberships >── clinics
              │
              ▼
            roles ──< role_permissions
```

- `memberships`: liga um usuário a uma clínica com um perfil (único por clínica + usuário).
- `roles`: perfis criados por cada clínica (ex.: Administrador, Recepção, Fisioterapeuta).
- `role_permissions`: quais permissões do catálogo cada perfil recebe.

## Roadmap

- [x] **Etapa 0:** PostgreSQL no Docker, Drizzle e tabela de clínicas
- [ ] **Etapa 1:** login com Better Auth, perfis, vínculos, permissões e onboarding da clínica
      _(em andamento)_
- [ ] Pacientes e agenda persistidos no banco, com checagem de permissão
- [ ] Prontuário, avaliações e evoluções
- [ ] Financeiro e log de auditoria

## Rodando localmente

Requer [Node.js](https://nodejs.org) 20.19+ e [Docker](https://www.docker.com).

```sh
npm install
cp .env.example .env    # credenciais do banco local
npm run db:up           # sobe o PostgreSQL
npm run db:migrate      # cria as tabelas
npm run dev             # http://localhost:8080
```

| Script                | O que faz                                          |
| --------------------- | -------------------------------------------------- |
| `npm run db:down`     | Desliga o banco (os dados ficam salvos no volume)  |
| `npm run db:generate` | Gera uma migration a partir das mudanças no schema |
| `npm run db:studio`   | Abre o Drizzle Studio para ver os dados            |

## Documentação

- [Mapa do projeto](docs/MAPA-DO-PROJETO.md): o que cada pasta, arquivo e ferramenta faz.
- [Especificação original](docs/ESPECIFICACAO-ORIGINAL.md): requisitos do produto.

## Autor

**Lucas Sachetto** · [LinkedIn](https://www.linkedin.com/in/lucas-sachetto-20794919a/) ·
[GitHub](https://github.com/Sachett0)
