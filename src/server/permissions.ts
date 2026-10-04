/**
 * Catálogo de permissões do ClinicFlow.
 *
 * Esta é a lista FIXA de tudo que o sistema sabe conferir. As clínicas não
 * criam permissões novas: elas só escolhem quais destas cada perfil recebe
 * (tabela `role_permissions`). Para adicionar uma permissão, inclua-a aqui E
 * escreva o código que a verifica.
 */
export const PERMISSIONS = {
  // Pacientes (dados cadastrais)
  "patients.read": "Ver pacientes",
  "patients.create": "Cadastrar pacientes",
  "patients.update": "Editar pacientes",

  // Dados clínicos (sensíveis pela LGPD; a recepção NÃO deve ter)
  "clinical.read": "Ver dados clínicos e prontuário",
  "medical_records.create": "Criar registros no prontuário",
  "evaluations.create": "Criar avaliações",
  "evolutions.create": "Criar evoluções",
  "evolutions.finalize": "Finalizar evoluções",

  // Agenda
  "appointments.read": "Ver agenda",
  "appointments.manage": "Criar e alterar agendamentos",

  // Financeiro
  "financial.read": "Ver financeiro",
  "financial.create": "Lançar cobranças e pagamentos",

  // Administração da clínica
  "clinic.manage": "Editar dados da clínica",
  "members.manage": "Convidar e gerenciar a equipe",
  "roles.manage": "Criar e editar perfis de acesso",
  "audit.read": "Ver logs de auditoria",
} as const;

/** Uma permissão válida, ex.: "patients.read". */
export type Permission = keyof typeof PERMISSIONS;

/** Todas as permissões, usadas para montar o perfil "Administrador". */
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];
