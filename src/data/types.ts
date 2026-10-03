/**
 * Domain types for ClinicFlow.
 * Every entity carries `tenantId` so the multi-tenant backend can enforce
 * isolation per clinic without reshaping the frontend contracts.
 */

export type ID = string;

export interface TenantScoped {
  id: ID;
  tenantId: ID;
}

export interface Clinic extends TenantScoped {
  name: string;
  document: string;
  city: string;
  state: string;
  phone: string;
  email: string;
}

export type UserRole = "admin" | "reception" | "professional" | "financial";

export interface User extends TenantScoped {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastAccess: string;
  initials: string;
}

export interface Professional extends TenantScoped {
  name: string;
  specialty: string;
  council: string;
  color: string;
  initials: string;
}

export interface Room extends TenantScoped {
  name: string;
  floor: string;
  capacity: number;
}

export interface Service extends TenantScoped {
  name: string;
  durationMinutes: number;
  price: number;
  category: string;
}

export type PatientStatus = "ativo" | "inativo" | "alta";

export interface Patient extends TenantScoped {
  name: string;
  socialName?: string;
  cpf: string;
  birthDate: string;
  sex: "F" | "M" | "outro";
  phone: string;
  whatsapp: string;
  email: string;
  address: {
    zip: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
  };
  clinical: {
    mainComplaint: string;
    diagnosis: string;
    referringDoctor: string;
    allergies: string;
    medications: string;
    notes: string;
  };
  status: PatientStatus;
  professionalId: ID;
  lastAppointment?: string;
  nextAppointment?: string;
  avatarTone: number;
}

export type AppointmentStatus =
  "agendado" | "confirmado" | "checkin" | "atendimento" | "finalizado" | "cancelado" | "faltou";

export interface Appointment extends TenantScoped {
  patientId: ID;
  professionalId: ID;
  serviceId: ID;
  roomId: ID;
  date: string; // yyyy-mm-dd
  start: string; // HH:mm
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string | undefined;
}

export type RecordType = "avaliacao" | "evolucao" | "documento" | "plano";
export type RecordStatus = "rascunho" | "finalizado" | "correcao";

export interface MedicalRecordEntry extends TenantScoped {
  patientId: ID;
  professionalId: ID;
  type: RecordType;
  title: string;
  date: string;
  status: RecordStatus;
  summary: string;
  content: { label: string; value: string }[];
  attachments: string[];
  signedBy?: string;
  signedAt?: string;
}

export type FieldType =
  | "texto"
  | "texto-longo"
  | "numero"
  | "data"
  | "selecao"
  | "multipla"
  | "radio"
  | "checkbox"
  | "escala"
  | "tabela"
  | "imagem"
  | "assinatura";

export interface EvaluationTemplateField {
  id: ID;
  label: string;
  type: FieldType;
  required: boolean;
}

export interface EvaluationTemplate extends TenantScoped {
  name: string;
  description: string;
  active: boolean;
  fields: EvaluationTemplateField[];
  updatedAt: string;
}

export interface TherapyGoal {
  id: ID;
  title: string;
  indicator: string;
  target: string;
  deadline: string;
  progress: number;
}

export interface TherapyPlan extends TenantScoped {
  patientId: ID;
  professionalId: ID;
  startDate: string;
  endDate: string;
  objective: string;
  frequency: string;
  totalSessions: number;
  usedSessions: number;
  goals: TherapyGoal[];
}

export type DocumentStatus = "rascunho" | "enviado" | "aguardando" | "assinado" | "recusado" | "expirado";

export type DocumentCategory =
  "termos" | "contratos" | "avaliacoes" | "declaracoes" | "relatorios" | "outros";

export interface Signer {
  name: string;
  email: string;
  role: string;
  status: "pendente" | "visualizado" | "assinado" | "recusado";
  signedAt?: string;
}

export interface ClinicDocument extends TenantScoped {
  name: string;
  category: DocumentCategory;
  patientId: ID;
  createdAt: string;
  status: DocumentStatus;
  signers: Signer[];
  timeline: { label: string; at: string; done: boolean }[];
}

export type MessageStatus = "enviado" | "entregue" | "lido" | "falha";

export interface WhatsappTemplate extends TenantScoped {
  name: string;
  category: string;
  body: string;
  active: boolean;
}

export interface WhatsappMessage {
  id: ID;
  from: "clinica" | "paciente";
  text: string;
  at: string;
  status: MessageStatus;
}

export interface WhatsappConversation extends TenantScoped {
  patientId: ID;
  updatedAt: string;
  unread: number;
  messages: WhatsappMessage[];
}

export type ChargeStatus = "pendente" | "pago" | "atrasado" | "cancelado";

export interface Charge extends TenantScoped {
  patientId: ID;
  description: string;
  amount: number;
  dueDate: string;
  status: ChargeStatus;
  method: string;
}

export interface SessionPackage extends TenantScoped {
  patientId: ID;
  name: string;
  total: number;
  used: number;
  price: number;
  validUntil: string;
}

export interface NotificationItem extends TenantScoped {
  title: string;
  description: string;
  at: string;
  kind: "agenda" | "documento" | "financeiro" | "sistema";
  read: boolean;
}

export interface AuditLog extends TenantScoped {
  at: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  result: "sucesso" | "negado";
}
