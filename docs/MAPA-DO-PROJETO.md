# Mapa do projeto ClinicFlow

Guia para entender **o que cada pasta, arquivo e ferramenta faz** neste projeto.
Atualize este arquivo sempre que a estrutura mudar.

---

## 1. Visão geral em 30 segundos

O ClinicFlow é hoje um **front-end completo com dados fictícios**. Todas as telas existem e
funcionam, mas nada é salvo de verdade: os dados vêm de um arquivo de mentira
(`src/data/mock.ts`) e somem quando a página é recarregada.

O código foi organizado em **camadas**. Cada uma tem uma única responsabilidade:

```
┌──────────────────────────────────────────────────────────────────┐
│  TELAS (src/routes/)                                             │
│  Uma página por arquivo: dashboard, agenda, pacientes...         │
│        │ usam                                                    │
│        ▼                                                         │
│  COMPONENTES (src/components/ e src/modules/)                    │
│  Peças visuais reutilizáveis: botões, cards, formulários...      │
│        │                                                         │
│        ▼ pedem dados para                                        │
│  SERVIÇOS (src/services/index.ts)  ◄── único ponto de acesso     │
│        │                               aos dados                 │
│        ▼                                                         │
│  DADOS: hoje → src/data/mock.ts (fictícios)                      │
│         amanhã → banco de dados real (back-end)                  │
└──────────────────────────────────────────────────────────────────┘
```

**A regra de ouro:** nenhuma tela lê o `mock.ts` diretamente. Tudo passa por
`services/`. Por isso, para ligar um banco de dados real, trocamos o que está
**abaixo** dos serviços, e as telas continuam iguais.

---

## 2. Como rodar

| Comando | O que faz |
|---|---|
| `npm install` | Baixa todas as bibliotecas listadas no `package.json` para a pasta `node_modules/`. Rode uma vez e sempre que o `package.json` mudar. |
| `npm run dev` | Liga o servidor de desenvolvimento em **http://localhost:8080**. Toda alteração no código aparece na hora no navegador. |
| `npm run build` | Gera a versão de produção, otimizada, na pasta `.output/`. |
| `npm run preview` | Roda localmente a versão gerada pelo `build`, para testar antes de publicar. |
| `npm run lint` | Procura erros e problemas de estilo no código (ESLint). |
| `npm run format` | Formata automaticamente todo o código (Prettier). |

---

## 3. Árvore de pastas

```
clinicflow-pro/
├── docs/                        Documentação (este arquivo e a especificação original)
├── public/                      Arquivos servidos como estão (ícone, robots.txt)
├── src/                         TODO o código da aplicação
│   ├── routes/                  As páginas, uma por arquivo (o nome do arquivo vira a URL)
│   ├── components/
│   │   ├── ui/                  46 componentes base do shadcn/ui (botão, input, modal...)
│   │   ├── common/              Componentes próprios reutilizados em várias telas
│   │   └── layout/              Menu lateral, barra do topo e logo
│   ├── modules/                 Peças maiores de uma área específica (ex.: formulário de paciente)
│   ├── services/                Camada de acesso aos dados (a "porta" para o back-end)
│   ├── data/                    Tipos de dados (types.ts) e dados fictícios (mock.ts)
│   ├── lib/                     Funções utilitárias (formatar moeda, data, CPF...) e tratamento de erros
│   ├── hooks/                   Lógica reutilizável do React (ex.: detectar celular)
│   ├── styles.css               Cores, fontes e tema visual do sistema inteiro
│   ├── router.tsx               Cria o roteador (navegação entre páginas)
│   ├── routeTree.gen.ts         GERADO AUTOMATICAMENTE: mapa das rotas. Não editar.
│   ├── server.ts                Entrada do servidor: trata erros graves de renderização
│   └── start.ts                 Configuração do TanStack Start (middlewares de erro e segurança)
├── .claude/launch.json          Configuração para o Claude iniciar o servidor de desenvolvimento
├── package.json                 Lista de bibliotecas e comandos do projeto
├── package-lock.json            Versões exatas instaladas (gerado pelo npm; não editar à mão)
├── vite.config.ts               Configuração do Vite (o motor que roda e empacota o projeto)
├── tsconfig.json                Regras do TypeScript
├── eslint.config.js             Regras do verificador de código
├── .prettierrc                  Regras de formatação
├── components.json              Configuração do shadcn/ui
├── .gitignore                   O que o Git deve ignorar (node_modules, builds...)
└── .gitattributes               Força finais de linha padrão Unix (evita problemas no Windows)
```

---

## 4. As páginas (`src/routes/`)

O **TanStack Router** cria as URLs a partir dos **nomes dos arquivos**:

- `index.tsx` → `/`
- `_shell.pacientes.index.tsx` → `/pacientes`
- `_shell.pacientes.$id.tsx` → `/pacientes/123`. O `$id` é uma parte variável da URL.
- O prefixo `_shell.` significa "esta página fica **dentro** do layout `_shell.tsx`". O `_`
  indica que o nome não aparece na URL.

### Arquivos estruturais

| Arquivo | O que faz |
|---|---|
| `__root.tsx` | **Raiz de tudo.** Monta o `<html>`, carrega o CSS e as fontes, define título e descrição para o Google, liga o TanStack Query e as notificações (toasts). Também tem as telas de **404** e de **erro**. |
| `_shell.tsx` | **Layout do sistema logado:** menu lateral (que pode ser recolhido), barra do topo, área central e rodapé "dados fictícios". Todas as páginas `_shell.*` aparecem dentro dele, no lugar do `<Outlet />`. |
| `index.tsx` | **Tela de login.** Por enquanto é simulada: aceita qualquer e-mail/senha válidos e vai para `/dashboard`. |

### Páginas do sistema

| Arquivo | URL | Tela | Serviços que usa |
|---|---|---|---|
| `_shell.dashboard.tsx` | `/dashboard` | Indicadores, gráficos, agenda do dia, notificações | vários |
| `_shell.agenda.tsx` | `/agenda` | Calendário semanal com filtros por profissional/sala/serviço | `appointmentService`, `patientService`, `professionalService`, `roomService`, `serviceCatalog` |
| `_shell.pacientes.index.tsx` | `/pacientes` | Lista de pacientes com busca e filtros | `patientService`, `professionalService` |
| `_shell.pacientes.$id.tsx` | `/pacientes/:id` | Perfil do paciente com abas (resumo, prontuário, financeiro...) | vários |
| `_shell.prontuarios.tsx` | `/prontuarios` | Linha do tempo clínica | `medicalRecordService` |
| `_shell.avaliacoes.tsx` | `/avaliacoes` | Modelos de avaliação e construtor de formulários | `evaluationService` |
| `_shell.evolucoes.tsx` | `/evolucoes` | Registro de evolução (rascunho → finalizado) | `medicalRecordService` |
| `_shell.planos.tsx` | `/planos` | Planos terapêuticos com metas e progresso | `therapyPlanService` |
| `_shell.documentos.tsx` | `/documentos` | Biblioteca de documentos | `documentService` |
| `_shell.assinaturas.tsx` | `/assinaturas` | Fluxo de assinatura eletrônica (visual) | `documentService` |
| `_shell.comunicacao.tsx` | `/comunicacao` | WhatsApp: templates e conversas (visual) | `whatsappService` |
| `_shell.financeiro.tsx` | `/financeiro` | Cobranças e pacotes de sessões | `financialService` |
| `_shell.relatorios.tsx` | `/relatorios` | Gráficos e relatórios | `reportService` |
| `_shell.auditoria.tsx` | `/auditoria` | Logs de quem fez o quê | `auditService` |
| `_shell.configuracoes.tsx` | `/configuracoes` | Clínica, usuários, salas, serviços, permissões | vários |

`routes/README.md` resume as convenções de nomes de rota.

---

## 5. Componentes

### `src/components/ui/`: a base visual (shadcn/ui)

São 46 componentes **copiados para dentro do projeto** pelo shadcn/ui: `button`, `input`,
`dialog` (modal), `sheet` e `drawer` (painéis laterais), `table`, `tabs`, `select`, `calendar`,
`chart`, `sonner` (notificações), etc.

- Eles são **seus**: dá para editar à vontade. Não é uma biblioteca fechada.
- Por baixo, usam o **Radix UI**, que cuida de acessibilidade, teclado e foco, e o **Tailwind**
  para a aparência.
- Nem todos são usados hoje. Vieram no pacote padrão.

### `src/components/common/`: peças próprias do ClinicFlow

| Arquivo | O que é |
|---|---|
| `PageHeader.tsx` | Título + subtítulo + botões no topo de cada página |
| `StatCard.tsx` | Card de indicador (ex.: "Pacientes ativos: 186") |
| `SectionCard.tsx` | Caixa branca com título, usada para agrupar conteúdo |
| `StatusBadge.tsx` | Etiqueta colorida de status (agendado, pago, assinado...) |
| `PatientAvatar.tsx` | Círculo com as iniciais do paciente |
| `Timeline.tsx` | Linha do tempo vertical (prontuário, assinaturas) |
| `EmptyState.tsx` | Mensagem para "nada encontrado", com botão de ação |
| `LoadingState.tsx` | Esqueleto de carregamento enquanto os dados chegam |
| `ConfirmDialog.tsx` | Caixa "Tem certeza?" para ações destrutivas |

### `src/components/layout/`: a moldura do sistema

| Arquivo | O que é |
|---|---|
| `nav-config.ts` | **Lista dos itens do menu lateral.** Para adicionar uma página ao menu, é aqui. |
| `Sidebar.tsx` | Menu lateral (desenha os itens do `nav-config`) |
| `Topbar.tsx` | Barra do topo: busca, notificações, ajuda, menu do usuário e menu mobile |
| `Logo.tsx` | Logo do ClinicFlow |

### `src/modules/`: peças específicas de uma área

| Arquivo | O que é |
|---|---|
| `patients/NewPatientDialog.tsx` | Formulário "Novo paciente" com abas (pessoais, endereço, clínico) |
| `appointments/NewAppointmentDialog.tsx` | Formulário "Novo agendamento" com aviso de conflito de horário |
| `appointments/AppointmentDrawer.tsx` | Painel lateral com detalhes de um agendamento |

---

## 6. Dados e serviços (o coração do back-end futuro)

### `src/data/types.ts`: o rascunho do banco de dados

Define a **forma** de cada informação do sistema. Cada `interface` aqui deve virar uma
**tabela** no banco de dados:

| Tipo | Representa | Destaques |
|---|---|---|
| `Clinic` | Clínica (o "cliente" do SaaS) | |
| `User` | Usuário que faz login | `role`: admin, reception, professional, financial |
| `Professional` | Fisioterapeuta/profissional | conselho (CREFITO), cor na agenda |
| `Room` / `Service` | Salas e serviços oferecidos | duração e preço do serviço |
| `Patient` | Paciente | dados pessoais, endereço, dados clínicos |
| `Appointment` | Agendamento | 7 status: agendado → confirmado → check-in → atendimento → finalizado / cancelado / faltou |
| `MedicalRecordEntry` | Registro do prontuário | rascunho / finalizado / correção |
| `EvaluationTemplate` | Modelo de avaliação | 12 tipos de campo |
| `TherapyPlan` + `TherapyGoal` | Plano terapêutico e metas | |
| `ClinicDocument` + `Signer` | Documento e signatários | |
| `WhatsappTemplate` / `WhatsappConversation` | Mensagens | |
| `Charge` / `SessionPackage` | Cobranças e pacotes | |
| `NotificationItem` / `AuditLog` | Notificações e auditoria | |

**Todos** têm `tenantId`, o identificador da clínica dona do dado. É isso que garante que a
Clínica A nunca veja os dados da Clínica B (**multi-tenant**).

### `src/data/mock.ts`: os dados fictícios

São cerca de 1.350 linhas de dados inventados: 8 pacientes, 4 profissionais, agendamentos,
cobranças, etc. Ele **será apagado** quando o back-end existir.

### `src/services/index.ts`: a porta de acesso aos dados

Agrupa funções por assunto: `patientService.list()`, `appointmentService.create()`,
`financialService.charges()`...

Hoje cada função:
1. pega os dados do `mock.ts`;
2. filtra pela clínica atual (`scoped(...)`);
3. espera ~0,3 s para simular a internet (`resolve(...)`).

Amanhã, o corpo de cada função vira uma chamada ao back-end real. **O nome e o formato de
resposta continuam iguais**, por isso as telas não precisam mudar.

### Como uma tela busca dados (exemplo real)

```tsx
// em _shell.pacientes.index.tsx
const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });

patients.isLoading  // true enquanto carrega → mostra <LoadingState />
patients.data       // a lista de pacientes quando chega
```

O `useQuery` (TanStack Query) cuida de: chamar o serviço, mostrar o carregamento, guardar em
cache (se outra tela pedir `["patients"]`, não busca de novo) e tentar de novo se falhar.

---

## 7. Utilitários (`src/lib/` e `src/hooks/`)

| Arquivo | O que faz |
|---|---|
| `lib/utils.ts` | `cn()`: junta classes CSS do Tailwind sem conflito. Usado em todos os componentes. |
| `lib/format.ts` | Formatação brasileira: `currency()` (R$), `formatDate()` (dd/mm/aaaa), `age()`, `maskCpf()` (***.***.123-45), `initials()`. Também define `TODAY`, a "data de hoje" fixa do protótipo. |
| `lib/error-capture.ts` | Captura erros do servidor e registra a mensagem completa no terminal (com a origem do erro). |
| `lib/error-page.ts` | Página HTML simples de "erro" mostrada quando o servidor falha gravemente. |
| `hooks/use-mobile.tsx` | `useIsMobile()`: diz se a tela é de celular (< 768px). |

### Arquivos do servidor (`src/server.ts` e `src/start.ts`)

O TanStack Start **renderiza as páginas no servidor** antes de mandá-las ao navegador (SSR),
o que deixa o carregamento inicial mais rápido.

- `server.ts`: ponto de entrada do servidor. Se algo quebrar durante a renderização, mostra a
  página de erro amigável em vez de uma mensagem técnica.
- `start.ts`: adiciona dois "filtros" (middlewares) a toda requisição. Um trata erros. O outro
  é a **proteção CSRF**, que impede outros sites de chamarem as funções do servidor em nome do
  usuário.

---

## 8. Ferramentas e bibliotecas (`package.json`)

### O motor

| Ferramenta | Para que serve |
|---|---|
| **Node.js / npm** | Node roda JavaScript fora do navegador. O npm instala as bibliotecas. |
| **Vite** | Servidor de desenvolvimento ultrarrápido e empacotador para produção |
| **TypeScript** | JavaScript com **tipos**: avisa erros (ex.: passar texto onde se espera número) antes de rodar |
| **React** | Biblioteca para montar a interface em componentes |
| **TanStack Start** | Framework "full-stack" sobre o React: SSR, funções de servidor e build. É onde o back-end pode morar. |
| **TanStack Router** | Navegação entre páginas com rotas tipadas, baseadas em arquivos |
| **TanStack Query** | Busca, cache e atualização de dados vindos do servidor |
| **Nitro** | Empacota o servidor para rodar em produção (só usado no `npm run build`) |

### Visual

| Ferramenta | Para que serve |
|---|---|
| **Tailwind CSS** | Estilização com classes (`p-4` = espaçamento, `bg-primary` = cor primária) |
| **shadcn/ui** + **Radix UI** | Componentes de interface acessíveis (ver seção 5) |
| **lucide-react** | Ícones |
| **recharts** | Gráficos (dashboard, relatórios, financeiro) |
| **sonner** | Notificações no canto da tela ("Paciente cadastrado com sucesso") |
| **tw-animate-css** | Animações de entrada e saída |
| **class-variance-authority**, **clsx**, **tailwind-merge** | Ajudam a combinar classes CSS e variações de componentes (ex.: botão `primary` ou `outline`) |
| **cmdk**, **vaul**, **embla-carousel**, **react-day-picker**, **input-otp**, **react-resizable-panels** | Usados por componentes específicos do shadcn: busca rápida, gaveta mobile, carrossel, calendário, código de verificação e painéis redimensionáveis |

### Formulários e dados

| Ferramenta | Para que serve |
|---|---|
| **React Hook Form** | Controla formulários (valores, envio, erros) |
| **Zod** | Define **regras de validação** ("e-mail precisa ser válido", "CPF precisa ter 11 dígitos"). Pode ser reaproveitado no back-end. |
| **date-fns** | Cálculos com datas |

### Qualidade de código

| Ferramenta | Para que serve |
|---|---|
| **ESLint** (`eslint.config.js`) | Aponta erros e más práticas |
| **Prettier** (`.prettierrc`) | Formata o código sempre do mesmo jeito (linhas de até 100 caracteres, aspas duplas, vírgula no final) |

---

## 9. Pontos de atenção (o que é "de mentira" hoje)

Itens encontrados na leitura do código que precisam de trabalho para virar um produto real:

1. **Login simulado.** Qualquer e-mail/senha entra, e as páginas internas abrem mesmo sem
   login (basta digitar `/dashboard`). Falta autenticação real e bloqueio de rotas.
2. **Formulários não salvam.** "Novo paciente" e a maioria das ações só mostram a mensagem de
   sucesso. Apenas o novo agendamento chama um serviço (`appointmentService.create`), e mesmo
   ele não adiciona o item à lista. Faltam funções de criar, editar e excluir nos serviços.
3. **Clínica e usuário fixos.** O `TENANT_ID` e o `currentUser` estão escritos no `mock.ts`.
   No sistema real, vêm do login.
4. **"Hoje" é fixo em 22/09/2026** (`TODAY` em `lib/format.ts` e a semana em
   `_shell.agenda.tsx`). Isso faz a demonstração parecer coerente, mas precisa virar a data real.
5. **Integrações só visuais:** WhatsApp, assinatura eletrônica e MFA ainda não estão conectados.
6. **Formatação pendente:** cerca de 250 avisos do Prettier no código gerado pelo Lovable.
   Resolve-se com `npm run format` (é só formatação; o comportamento não muda).

---

## 10. Glossário rápido

| Termo | Significado |
|---|---|
| **Front-end** | O que roda no navegador: telas, botões, formulários |
| **Back-end** | O que roda no servidor: banco de dados, regras, login, integrações |
| **SaaS** | Software vendido como assinatura, usado pela internet por vários clientes |
| **Multi-tenant** | Um único sistema servindo várias clínicas, com dados separados |
| **Mock** | Dado falso usado para desenvolver antes de existir o real |
| **Rota** | Uma URL do sistema e a página que ela mostra |
| **Componente** | Peça reutilizável da interface (um botão, um card, um formulário) |
| **SSR** | Renderização no servidor: a página chega pronta ao navegador |
| **Build** | Processo que transforma o código em arquivos otimizados para produção |
| **Commit** | Um "ponto salvo" no histórico do Git |
| **Branch** | Uma linha paralela de trabalho no Git, para mexer sem afetar a principal (`main`) |
