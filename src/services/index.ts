/**
 * Camada de serviços.
 *
 * Hoje devolve dados mockados com uma pequena latência simulada; amanhã basta
 * trocar o corpo de cada função por `fetch("/api/v1/...")` mantendo a mesma
 * assinatura. Nenhum componente importa os mocks diretamente.
 */
import {
  appointments,
  appointmentsPerDay,
  auditLogs,
  charges,
  clinics,
  conversations,
  currentUser,
  documents,
  evaluationTemplates,
  medicalRecords,
  notifications,
  patients,
  professionals,
  revenuePerMonth,
  rooms,
  services,
  sessionPackages,
  therapyPlans,
  users,
  whatsappTemplates,
  TENANT_ID,
} from "@/data/mock";
import type {
  Appointment,
  AuditLog,
  Charge,
  Clinic,
  ClinicDocument,
  EvaluationTemplate,
  MedicalRecordEntry,
  NotificationItem,
  Patient,
  Professional,
  Room,
  Service,
  SessionPackage,
  TherapyPlan,
  User,
  WhatsappConversation,
  WhatsappTemplate,
} from "@/data/types";

const LATENCY = 320;

function resolve<T>(value: T, delay = LATENCY): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), delay));
}

/** Filtro de tenant aplicado em todas as leituras (isolamento multi-clínica). */
function scoped<T extends { tenantId: string }>(rows: T[], tenantId = TENANT_ID) {
  return rows.filter((row) => row.tenantId === tenantId);
}

export const tenantService = {
  current: () => clinics[0] as Clinic,
  list: async (): Promise<Clinic[]> => resolve(clinics),
};

export const authService = {
  me: async (): Promise<User> => resolve(currentUser),
  currentUser: () => currentUser,
};

export const patientService = {
  list: async (): Promise<Patient[]> => resolve(scoped(patients)),
  byId: async (id: string): Promise<Patient | undefined> =>
    resolve(scoped(patients).find((p) => p.id === id)),
};

export const professionalService = {
  list: async (): Promise<Professional[]> => resolve(scoped(professionals)),
};

export const roomService = {
  list: async (): Promise<Room[]> => resolve(scoped(rooms)),
};

export const serviceCatalog = {
  list: async (): Promise<Service[]> => resolve(scoped(services)),
};

export const appointmentService = {
  list: async (): Promise<Appointment[]> => resolve(scoped(appointments)),
  byPatient: async (patientId: string): Promise<Appointment[]> =>
    resolve(scoped(appointments).filter((a) => a.patientId === patientId)),
  create: async (input: Omit<Appointment, "id" | "tenantId">): Promise<Appointment> =>
    resolve({ ...input, id: `ag-${Date.now()}`, tenantId: TENANT_ID }, 600),
};

export const medicalRecordService = {
  list: async (): Promise<MedicalRecordEntry[]> => resolve(scoped(medicalRecords)),
  byPatient: async (patientId: string): Promise<MedicalRecordEntry[]> =>
    resolve(
      scoped(medicalRecords)
        .filter((r) => r.patientId === patientId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    ),
};

export const evaluationService = {
  templates: async (): Promise<EvaluationTemplate[]> => resolve(scoped(evaluationTemplates)),
};

export const therapyPlanService = {
  list: async (): Promise<TherapyPlan[]> => resolve(scoped(therapyPlans)),
  byPatient: async (patientId: string): Promise<TherapyPlan | undefined> =>
    resolve(scoped(therapyPlans).find((p) => p.patientId === patientId)),
};

export const documentService = {
  list: async (): Promise<ClinicDocument[]> => resolve(scoped(documents)),
  byId: async (id: string): Promise<ClinicDocument | undefined> =>
    resolve(scoped(documents).find((d) => d.id === id)),
};

export const whatsappService = {
  templates: async (): Promise<WhatsappTemplate[]> => resolve(scoped(whatsappTemplates)),
  conversations: async (): Promise<WhatsappConversation[]> => resolve(scoped(conversations)),
};

export const financialService = {
  charges: async (): Promise<Charge[]> => resolve(scoped(charges)),
  packages: async (): Promise<SessionPackage[]> => resolve(scoped(sessionPackages)),
  revenueSeries: async () => resolve(revenuePerMonth),
};

export const reportService = {
  appointmentSeries: async () => resolve(appointmentsPerDay),
  revenueSeries: async () => resolve(revenuePerMonth),
};

export const notificationService = {
  list: async (): Promise<NotificationItem[]> => resolve(scoped(notifications), 120),
  listSync: (): NotificationItem[] => scoped(notifications),
};

export const auditService = {
  list: async (): Promise<AuditLog[]> => resolve(scoped(auditLogs)),
};

export const userService = {
  list: async (): Promise<User[]> => resolve(scoped(users)),
};
