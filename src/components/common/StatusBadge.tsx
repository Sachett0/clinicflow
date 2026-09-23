import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const toneClass: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary-soft text-accent-foreground border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning-foreground border-transparent",
  danger: "bg-destructive-soft text-destructive border-transparent",
  info: "bg-info-soft text-info border-transparent",
};

const map: Record<string, { label: string; tone: Tone }> = {
  // agendamentos
  agendado: { label: "Agendado", tone: "neutral" },
  confirmado: { label: "Confirmado", tone: "info" },
  checkin: { label: "Check-in", tone: "primary" },
  atendimento: { label: "Em atendimento", tone: "warning" },
  finalizado: { label: "Finalizado", tone: "success" },
  cancelado: { label: "Cancelado", tone: "danger" },
  faltou: { label: "Faltou", tone: "danger" },
  // pacientes
  ativo: { label: "Ativo", tone: "success" },
  inativo: { label: "Inativo", tone: "neutral" },
  alta: { label: "Alta", tone: "info" },
  // registros
  rascunho: { label: "Rascunho", tone: "neutral" },
  correcao: { label: "Em correção", tone: "warning" },
  // documentos
  enviado: { label: "Enviado", tone: "info" },
  aguardando: { label: "Aguardando assinatura", tone: "warning" },
  assinado: { label: "Assinado", tone: "success" },
  recusado: { label: "Recusado", tone: "danger" },
  expirado: { label: "Expirado", tone: "neutral" },
  // financeiro
  pendente: { label: "Pendente", tone: "warning" },
  pago: { label: "Pago", tone: "success" },
  atrasado: { label: "Em atraso", tone: "danger" },
  // assinantes / mensagens
  visualizado: { label: "Visualizado", tone: "info" },
  entregue: { label: "Entregue", tone: "info" },
  lido: { label: "Lido", tone: "success" },
  falha: { label: "Falha", tone: "danger" },
  sucesso: { label: "Sucesso", tone: "success" },
  negado: { label: "Negado", tone: "danger" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const entry = map[status] ?? { label: status, tone: "neutral" as Tone };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClass[entry.tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {entry.label}
    </span>
  );
}
