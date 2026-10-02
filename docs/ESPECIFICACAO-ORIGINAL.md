# Especificação original do ClinicFlow

> Este é o pedido original usado para gerar o protótipo no Lovable. Serve como referência de requisitos do produto.

Crie uma aplicação web SaaS completa e profissional chamada ClinicFlow, destinada à gestão de clínicas de fisioterapia e outras clínicas de saúde.

O sistema deve ser inspirado nas funcionalidades comuns de plataformas modernas de gestão clínica, como agenda, prontuário, avaliações, evoluções, documentos, assinatura eletrônica, WhatsApp e financeiro, mas deve possuir identidade visual, componentes, textos e layout próprios, sem copiar diretamente nenhuma plataforma existente.

O objetivo é criar uma aplicação com aparência de produto SaaS profissional, pronta para posteriormente receber backend real, banco PostgreSQL, autenticação, integrações de WhatsApp e assinatura eletrônica.

==================================================

TECNOLOGIA
==================================================

Utilize:

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

Lucide Icons

React Router

TanStack Query quando necessário

React Hook Form

Zod

Organize o projeto de forma modular e escalável.

Não coloque toda a aplicação em um único componente.

Crie componentes reutilizáveis.

A arquitetura deve permitir posteriormente integração com:

API REST em NestJS

PostgreSQL

Prisma

Redis

S3

WhatsApp Business API

provedor externo de assinatura eletrônica

==================================================
2. IDENTIDADE VISUAL

Criar uma identidade visual moderna, elegante e profissional para uma empresa de tecnologia voltada à área da saúde.

Estilo:

SaaS moderno

minimalista

profissional

clean

bastante espaço em branco

excelente legibilidade

aparência premium

não utilizar aparência excessivamente hospitalar

evitar excesso de azul típico de sistemas médicos antigos

Paleta sugerida:

fundo principal: #F7F8FA

cards: branco

texto principal: #17202A

texto secundário: #667085

cor primária: verde/teal sofisticado

sucesso: verde

alerta: amarelo

erro: vermelho

informações: azul

Use bordas suaves, sombras discretas, cantos arredondados e hierarquia visual clara.

A interface deve funcionar perfeitamente em:

desktop

notebook

tablet

celular

==================================================
3. ESTRUTURA PRINCIPAL

Criar um dashboard administrativo com:

SIDEBAR:

Dashboard

Agenda

Pacientes

Prontuários

Avaliações

Evoluções

Documentos

Financeiro

Relatórios

Comunicação

Configurações

No topo:

campo de busca global

botão de notificações

usuário logado

avatar

menu de perfil

botão de ajuda

A sidebar deve poder ser recolhida.

Em telas pequenas, transformar a sidebar em menu lateral/mobile drawer.

==================================================
4. DASHBOARD

Criar uma página inicial profissional.

Título:

"Bom dia, Lucas"

Subtítulo:

"Acompanhe os principais indicadores da sua clínica."

Cards:

Atendimentos hoje

Pacientes ativos

Confirmações pendentes

Faturamento do mês

Exemplo:

Atendimentos hoje
24

Pacientes ativos
186

Confirmações pendentes
7

Faturamento
R$ 18.450

Adicionar:

gráfico de atendimentos por dia

gráfico de faturamento

agenda do dia

pacientes próximos

notificações recentes

atividades recentes

Criar visualizações com gráficos modernos.

==================================================
5. AGENDA

Criar uma agenda completa.

Permitir:

visualização diária

semanal

mensal

por profissional

por sala

por tipo de atendimento

Criar botão:

"+ Novo agendamento"

O calendário deve mostrar os horários e os atendimentos visualmente.

Cada atendimento deve apresentar:

nome do paciente

profissional

horário

serviço

sala

status

Status:

Agendado

Confirmado

Check-in

Em atendimento

Finalizado

Cancelado

Faltou

Utilizar cores diferentes e discretas para cada status.

Ao clicar em um atendimento abrir um painel lateral/modal contendo:

Paciente
Profissional
Serviço
Sala
Data
Horário
Observações
Status

Botões:

Confirmar

Iniciar atendimento

Reagendar

Cancelar

Abrir prontuário

==================================================
6. NOVO AGENDAMENTO

Criar formulário:

Paciente
Profissional
Serviço
Sala
Data
Horário
Duração
Observações

Mostrar aviso caso exista conflito de horário.

Após salvar:

"Agendamento criado com sucesso."

Também mostrar opção:

"Enviar confirmação pelo WhatsApp"

==================================================
7. PACIENTES

Criar página de pacientes com:

tabela

pesquisa

filtros

paginação

Colunas:

Paciente
Telefone
Último atendimento
Próximo atendimento
Profissional
Status

Botão:

"+ Novo paciente"

Criar formulário completo:

Dados pessoais:

Nome completo

Nome social

CPF

Data de nascimento

Sexo

Telefone

WhatsApp

E-mail

Endereço:

CEP

Rua

Número

Complemento

Bairro

Cidade

Estado

Informações clínicas:

Queixa principal

Diagnóstico

Médico responsável

Alergias

Medicamentos

Observações

==================================================
8. PERFIL DO PACIENTE

Criar uma página detalhada.

Header:

Nome do paciente
Idade
Telefone
Status

Botões:

Novo atendimento

Nova avaliação

Nova evolução

Novo documento

Enviar WhatsApp

Criar abas:

Resumo

Prontuário

Avaliações

Evoluções

Plano terapêutico

Documentos

Financeiro

Histórico

==================================================
9. PRONTUÁRIO

Criar timeline clínica.

Exemplo:

21/09/2026
Evolução
Profissional: Dra. Maria

18/09/2026
Evolução
Profissional: Dra. Maria

10/09/2026
Avaliação inicial
Profissional: Dra. Maria

Cada item deve permitir visualizar o registro completo.

Mostrar:

data

profissional

tipo

status

conteúdo

assinatura

anexos

Registros finalizados devem apresentar indicador visual de que estão finalizados.

==================================================
10. AVALIAÇÕES

Criar uma página de modelos de avaliação.

Exemplos:

Avaliação fisioterapêutica inicial

Avaliação ortopédica

Avaliação postural

Reavaliação

Avaliação de dor

Tela:

"Modelos de avaliação"

Botão:

"+ Novo modelo"

Cada modelo deve mostrar:

Nome
Descrição
Quantidade de campos
Status

Criar também interface para construção de formulários.

Tipos de campos:

texto

texto longo

número

data

seleção

múltipla seleção

radio

checkbox

escala 0–10

tabela

imagem

assinatura

Permitir reorganizar os campos.

==================================================
11. EVOLUÇÕES

Criar tela para registrar evolução do paciente.

Exemplo:

EVOLUÇÃO

Paciente:
João da Silva

Data:
21/09/2026

Profissional:
Dra. Maria

Queixa:

Procedimentos realizados:
☐ Alongamento
☐ Fortalecimento
☐ Mobilização
☐ Exercícios terapêuticos

Resposta ao tratamento:

Observações:

Botões:

"Salvar rascunho"

"Finalizar evolução"

Quando finalizada, mostrar:

"Registro finalizado"

e impedir edição direta.

Adicionar opção:

"Solicitar correção"

==================================================
12. PLANO TERAPÊUTICO

Criar módulo:

Plano terapêutico

Informações:

Data inicial

Previsão de término

Objetivo principal

Frequência

Quantidade de sessões

Metas

Permitir criar várias metas.

Exemplo:

Meta:
Reduzir dor

Indicador:
Escala de dor

Objetivo:
≤ 3/10

Prazo:
30 dias

Mostrar progresso visual.

==================================================
13. DOCUMENTOS

Criar biblioteca de documentos.

Categorias:

Termos

Contratos

Avaliações

Declarações

Relatórios

Outros

Tabela:

Documento
Paciente
Data
Status
Assinatura

Status:

Rascunho

Enviado

Aguardando assinatura

Assinado

Recusado

Expirado

Botões:

Visualizar

Baixar

Enviar para assinatura

==================================================
14. ASSINATURA ELETRÔNICA

Criar interface de assinatura eletrônica preparada para futura integração com API externa.

Fluxo:

Documento
↓
Adicionar signatários
↓
Enviar
↓
Aguardando assinatura
↓
Assinado

Mostrar timeline:

Documento criado
Documento enviado
Documento visualizado
Documento assinado

Mostrar:

nome do signatário

data

horário

status

Não implementar uma assinatura juridicamente válida apenas desenhando uma assinatura na tela. Criar a interface preparada para integração com um provedor externo especializado.

==================================================
15. WHATSAPP

Criar módulo de comunicação.

Dashboard:

Mensagens enviadas
Confirmadas
Pendentes
Falhas

Criar templates:

"Confirmação de consulta"

"Lembrete de consulta"

"Cancelamento"

"Reagendamento"

"Documento para assinatura"

Tela de conversa visual semelhante a uma caixa de mensagens, mas com identidade própria.

Exemplo:

Clínica:
"Olá, João! Seu atendimento está confirmado para amanhã às 14:00."

Paciente:
"Confirmado."

Mostrar status:

Enviado
Entregue
Lido

Preparar arquitetura para futura integração com WhatsApp Business API.

==================================================
16. FINANCEIRO

Criar dashboard financeiro.

Cards:

Receita do mês
Recebido
Pendente
Em atraso

Criar tabela:

Paciente
Descrição
Valor
Vencimento
Status
Forma de pagamento

Status:

Pendente

Pago

Em atraso

Cancelado

Criar módulo de pacotes.

Exemplo:

Pacote de fisioterapia

10 sessões
6 utilizadas
4 restantes

Mostrar barra de progresso.

==================================================
17. RELATÓRIOS

Criar página:

Relatórios

Categorias:

Atendimentos

Pacientes

Cancelamentos

Faltas

Faturamento

Profissionais

Salas

Serviços

Permitir selecionar período.

Botões:

"Aplicar filtros"

"Exportar"

Criar gráficos profissionais.

==================================================
18. NOTIFICAÇÕES

Criar sistema de notificações.

Exemplos:

"João confirmou o atendimento."

"Documento assinado por Maria."

"Existem 5 pagamentos pendentes."

"Novo agendamento criado."

Mostrar badge de notificações no header.

==================================================
19. CONFIGURAÇÕES

Criar página de configurações com abas:

Clínica
Usuários
Profissionais
Salas
Serviços
Permissões
WhatsApp
Assinaturas
Notificações
Financeiro
Segurança

==================================================
20. USUÁRIOS E PERMISSÕES

Criar gerenciamento de usuários.

Perfis:

Administrador
Recepção
Profissional
Financeiro

Criar permissões granulares.

Exemplos:

patients.read
patients.create
patients.update

medical_records.read
medical_records.create

evaluations.create
evolutions.create
evolutions.finalize

financial.read
financial.create

Mostrar interface para definir permissões.

==================================================
21. AUDITORIA

Criar página:

"Logs de auditoria"

Tabela:

Data
Usuário
Ação
Recurso
IP
Resultado

Exemplos:

Paciente visualizado
Evolução criada
Evolução finalizada
Documento enviado
Documento assinado
Pagamento registrado

==================================================
22. LOGIN

Criar tela de login profissional.

Logo:

ClinicFlow

Campos:

E-mail
Senha

Checkbox:

"Manter conectado"

Botão:

"Entrar"

Link:

"Esqueci minha senha"

Adicionar opção visual para futura autenticação MFA.

==================================================
23. RESPONSIVIDADE

O sistema deve funcionar muito bem em:

Desktop
Notebook
Tablet
Celular

No celular:

sidebar vira drawer

tabelas tornam-se cards quando necessário

agenda deve continuar utilizável

formulários devem ocupar toda a largura

botões devem ser fáceis de tocar

==================================================
24. DADOS DEMONSTRATIVOS

Durante a construção do frontend, utilizar dados fictícios realistas apenas para demonstrar a interface.

Nunca utilizar dados reais de pacientes.

Criar:

8 pacientes fictícios
4 profissionais
3 salas
5 serviços
diversos agendamentos
alguns documentos
algumas avaliações
algumas evoluções
dados financeiros fictícios

Deixar a camada de dados organizada para posteriormente substituir facilmente os mocks por chamadas à API.

==================================================
25. REGRAS DE UX

A aplicação deve:

ter feedback visual após ações

utilizar toasts

mostrar loading states

mostrar skeletons

confirmar ações destrutivas

apresentar mensagens de erro claras

utilizar empty states

evitar telas excessivamente carregadas

utilizar modais somente quando apropriado

usar drawers para detalhes rápidos

manter navegação consistente

Exemplo de empty state:

"Não há atendimentos para este período."

Botão:

"+ Novo agendamento"

==================================================
26. DASHBOARD MOBILE

No celular mostrar:

Atendimentos hoje
Pacientes
Confirmações
Pendências

Depois:

Próximos atendimentos

Depois:

Notificações

==================================================
27. COMPONENTES REUTILIZÁVEIS

Criar componentes reutilizáveis:

Button
Input
Select
DatePicker
Modal
Drawer
DataTable
Badge
Card
Tabs
Dropdown
Toast
Avatar
Calendar
Timeline
FormBuilder
FileUploader
StatusBadge
ConfirmDialog
EmptyState
LoadingState

==================================================
28. ARQUITETURA DO FRONTEND

Organizar por domínio, não apenas por tipo de componente.

Exemplo:

src/
modules/
auth/
dashboard/
patients/
appointments/
medical-records/
evaluations/
evolutions/
documents/
signatures/
whatsapp/
financial/
reports/
settings/

Criar hooks e serviços específicos para cada módulo.

==================================================
29. PREPARAÇÃO PARA BACKEND

Não acople os componentes diretamente aos mocks.

Criar camada:

services/

Exemplo:

patientService
appointmentService
evaluationService
evolutionService
documentService
financialService

Inicialmente podem retornar dados mockados.

Posteriormente devem ser facilmente substituídos por:

GET /api/v1/patients
GET /api/v1/appointments
POST /api/v1/appointments
etc.

==================================================
30. SEGURANÇA E PRIVACIDADE

O sistema será destinado a dados de saúde.

Portanto:

não utilizar dados reais

não exibir informações sensíveis desnecessariamente

mascarar CPF

preparar controle de acesso

preparar auditoria

preparar isolamento por clínica

não armazenar senha em frontend

não colocar secrets no código

utilizar variáveis de ambiente

preparar arquitetura para LGPD

Criar um aviso visual indicando que os dados apresentados no protótipo são fictícios.

==================================================
31. MULTI-TENANT

Mesmo sendo um protótipo inicial, preparar a arquitetura para várias clínicas.

Entidades deverão futuramente possuir:

tenant_id

Exemplo:

Clínica A
Clínica B
Clínica C

Os dados de uma clínica nunca devem ser exibidos para outra.

Criar no perfil do usuário a informação da clínica atual.

==================================================
32. EXPERIÊNCIA VISUAL

Quero uma experiência semelhante à de um produto SaaS moderno.

Priorizar:

sidebar elegante

cards limpos

tabelas bem organizadas

calendários modernos

gráficos profissionais

formulários simples

boa hierarquia tipográfica

microinterações discretas

transições suaves

estados de hover

estados de loading

feedback de sucesso/erro

Não criar um site institucional simples.

Criar uma aplicação web completa de gestão clínica, com várias páginas navegáveis.

==================================================
33. MENU FINAL

Sidebar:

Dashboard

Agenda

Pacientes

Prontuário
├── Avaliações
├── Evoluções
└── Planos terapêuticos

Documentos

Comunicação
└── WhatsApp

Financeiro

Relatórios

Configurações

==================================================
34. PRIMEIRA ENTREGA

Primeiro implemente o frontend completo e navegável.

Prioridade:

Layout principal

Login

Dashboard

Agenda

Pacientes

Perfil do paciente

Prontuário

Avaliações

Evoluções

Documentos

Assinaturas

WhatsApp

Financeiro

Relatórios

Configurações

Todas as páginas devem estar conectadas pela navegação.

Não criar apenas uma landing page.

Quero conseguir navegar pela aplicação inteira como se fosse um produto real.

==================================================
35. QUALIDADE

Antes de finalizar:

verificar responsividade

verificar navegação

verificar links

verificar formulários

verificar estados vazios

verificar loading

verificar erros

verificar modais

verificar acessibilidade básica

verificar console sem erros

verificar TypeScript

verificar componentes duplicados

verificar consistência visual

O resultado deve parecer um produto SaaS profissional pronto para receber usuários, e não um protótipo genérico de dashboard.
