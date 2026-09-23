import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileSignature,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Settings,
  ShieldCheck,
  Stethoscope,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  children?: { label: string; to: string; icon: LucideIcon }[];
}

export const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Operação",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Agenda", to: "/agenda", icon: CalendarDays },
      { label: "Pacientes", to: "/pacientes", icon: Users },
    ],
  },
  {
    title: "Clínico",
    items: [
      {
        label: "Prontuário",
        to: "/prontuarios",
        icon: Stethoscope,
        children: [
          { label: "Avaliações", to: "/avaliacoes", icon: ClipboardList },
          { label: "Evoluções", to: "/evolucoes", icon: Activity },
          { label: "Planos terapêuticos", to: "/planos", icon: Target },
        ],
      },
      { label: "Documentos", to: "/documentos", icon: FileText },
      { label: "Assinaturas", to: "/assinaturas", icon: FileSignature },
    ],
  },
  {
    title: "Gestão",
    items: [
      { label: "Comunicação", to: "/comunicacao", icon: MessageCircle },
      { label: "Financeiro", to: "/financeiro", icon: Wallet },
      { label: "Relatórios", to: "/relatorios", icon: BarChart3 },
      { label: "Auditoria", to: "/auditoria", icon: ShieldCheck },
      { label: "Configurações", to: "/configuracoes", icon: Settings },
    ],
  },
];
