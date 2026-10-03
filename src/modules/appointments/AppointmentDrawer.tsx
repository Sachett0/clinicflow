import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PatientAvatar } from "@/components/common/PatientAvatar";
import type { Appointment } from "@/data/types";
import { addMinutes, formatDate } from "@/lib/format";

export interface AppointmentView extends Appointment {
  patientName: string;
  professionalName: string;
  serviceName: string;
  roomName: string;
}

export function AppointmentDrawer({
  appointment,
  onOpenChange,
}: {
  appointment: AppointmentView | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);

  return (
    <>
      <Sheet open={!!appointment} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {appointment ? (
            <>
              <SheetHeader>
                <SheetTitle>Detalhes do atendimento</SheetTitle>
                <SheetDescription>
                  {formatDate(appointment.date)} · {appointment.start} às{" "}
                  {addMinutes(appointment.start, appointment.durationMinutes)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-6">
                <div className="flex items-center gap-3">
                  <PatientAvatar name={appointment.patientName} />
                  <div>
                    <p className="font-medium">{appointment.patientName}</p>
                    <StatusBadge status={appointment.status} />
                  </div>
                </div>

                <dl className="space-y-3 text-sm">
                  <Row label="Profissional" value={appointment.professionalName} />
                  <Row label="Serviço" value={appointment.serviceName} />
                  <Row label="Sala" value={appointment.roomName} />
                  <Row label="Data" value={formatDate(appointment.date)} />
                  <Row label="Horário" value={appointment.start} />
                  <Row label="Observações" value={appointment.notes ?? "Sem observações"} />
                </dl>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={() => toast.success("Atendimento confirmado.")}>Confirmar</Button>
                  <Button variant="secondary" onClick={() => toast.success("Atendimento iniciado.")}>
                    Iniciar atendimento
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.info("Selecione um novo horário na agenda.")}
                  >
                    Reagendar
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmCancel(true)}>
                    Cancelar
                  </Button>
                  <Button variant="ghost" className="sm:col-span-2" asChild>
                    <Link to="/pacientes/$id" params={{ id: appointment.patientId }}>
                      Abrir prontuário
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancelar atendimento?"
        description="O paciente será notificado e o horário ficará disponível na agenda."
        confirmLabel="Cancelar atendimento"
        onConfirm={() => {
          toast.success("Atendimento cancelado.");
          setConfirmCancel(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
