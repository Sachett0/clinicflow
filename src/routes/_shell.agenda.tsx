import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { BlockSkeleton } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewAppointmentDialog } from "@/modules/appointments/NewAppointmentDialog";
import { AppointmentDrawer, type AppointmentView } from "@/modules/appointments/AppointmentDrawer";
import {
  appointmentService,
  patientService,
  professionalService,
  roomService,
  serviceCatalog,
} from "@/services";
import { TODAY, addMinutes, formatDate, weekdayShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda · ClinicFlow" },
      {
        name: "description",
        content: "Agenda diária, semanal e mensal por profissional, sala e tipo de atendimento.",
      },
      { property: "og:title", content: "Agenda · ClinicFlow" },
      {
        property: "og:description",
        content: "Organize atendimentos por profissional, sala e serviço.",
      },
    ],
  }),
  component: AgendaPage,
});

const WEEK = ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25", "2026-09-26"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

function AgendaPage() {
  const [view, setView] = useState<"dia" | "semana" | "mes">("dia");
  const [date, setDate] = useState(TODAY);
  const [professionalId, setProfessionalId] = useState("todos");
  const [roomId, setRoomId] = useState("todas");
  const [serviceId, setServiceId] = useState("todos");
  const [selected, setSelected] = useState<AppointmentView | null>(null);

  const appointments = useQuery({ queryKey: ["appointments"], queryFn: appointmentService.list });
  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });
  const professionals = useQuery({
    queryKey: ["professionals"],
    queryFn: professionalService.list,
  });
  const rooms = useQuery({ queryKey: ["rooms"], queryFn: roomService.list });
  const services = useQuery({ queryKey: ["services"], queryFn: serviceCatalog.list });

  const views: AppointmentView[] = useMemo(() => {
    return (appointments.data ?? []).map((a) => ({
      ...a,
      patientName: patients.data?.find((p) => p.id === a.patientId)?.name ?? "—",
      professionalName: professionals.data?.find((p) => p.id === a.professionalId)?.name ?? "—",
      serviceName: services.data?.find((s) => s.id === a.serviceId)?.name ?? "—",
      roomName: rooms.data?.find((r) => r.id === a.roomId)?.name ?? "—",
    }));
  }, [appointments.data, patients.data, professionals.data, rooms.data, services.data]);

  const filtered = views.filter(
    (a) =>
      (professionalId === "todos" || a.professionalId === professionalId) &&
      (roomId === "todas" || a.roomId === roomId) &&
      (serviceId === "todos" || a.serviceId === serviceId),
  );

  const dayItems = filtered.filter((a) => a.date === date).sort((a, b) => a.start.localeCompare(b.start));
  const loading = appointments.isLoading || patients.isLoading;

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Visualize e organize os atendimentos da clínica."
        actions={<NewAppointmentDialog />}
      />

      <SectionCard bodyClassName="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
            <TabsList>
              <TabsTrigger value="dia">Dia</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
              <TabsTrigger value="mes">Mês</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Dia anterior"
              onClick={() => setDate(WEEK[Math.max(0, WEEK.indexOf(date) - 1)] ?? date)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-36 text-center text-sm font-medium">{formatDate(date)}</span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Próximo dia"
              onClick={() => setDate(WEEK[Math.min(WEEK.length - 1, WEEK.indexOf(date) + 1)] ?? date)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="ml-auto flex flex-wrap gap-2">
            <Filter
              value={professionalId}
              onChange={setProfessionalId}
              allLabel="Todos profissionais"
              allValue="todos"
              options={(professionals.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
            />
            <Filter
              value={roomId}
              onChange={setRoomId}
              allLabel="Todas as salas"
              allValue="todas"
              options={(rooms.data ?? []).map((r) => ({ value: r.id, label: r.name }))}
            />
            <Filter
              value={serviceId}
              onChange={setServiceId}
              allLabel="Todos os serviços"
              allValue="todos"
              options={(services.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
            />
          </div>
        </div>
      </SectionCard>

      {loading ? (
        <BlockSkeleton className="h-96" />
      ) : view === "dia" ? (
        <SectionCard title={`Atendimentos de ${formatDate(date)}`} bodyClassName="p-0">
          {dayItems.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={CalendarDays}
                title="Não há atendimentos para este período."
                description="Ajuste os filtros ou crie um novo agendamento."
                action={<NewAppointmentDialog trigger={<Button size="sm">+ Novo agendamento</Button>} />}
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {HOURS.map((hour) => {
                const slot = dayItems.filter((a) => a.start === hour);
                return (
                  <div key={hour} className="flex gap-4 px-5 py-3">
                    <span className="w-14 pt-1 text-xs font-medium text-muted-foreground">{hour}</span>
                    <div className="flex-1 space-y-2">
                      {slot.length === 0 ? (
                        <p className="py-2 text-xs text-muted-foreground/70">Horário livre</p>
                      ) : (
                        slot.map((a) => (
                          <AppointmentCard key={a.id} item={a} onClick={() => setSelected(a)} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      ) : view === "semana" ? (
        <SectionCard title="Semana de 21 a 26 de setembro" bodyClassName="p-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {WEEK.map((day) => {
              const items = filtered.filter((a) => a.date === day);
              return (
                <div key={day} className="rounded-xl border border-border p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    {weekdayShort(day)} · {day.slice(8)}
                  </p>
                  <div className="mt-3 space-y-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground/70">Sem atendimentos</p>
                    ) : (
                      items.map((a) => (
                        <AppointmentCard key={a.id} item={a} compact onClick={() => setSelected(a)} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Setembro de 2026" bodyClassName="p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground uppercase">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <span key={d} className="py-2">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              const dayNumber = i + 1;
              const iso = `2026-09-${String(dayNumber).padStart(2, "0")}`;
              const items = filtered.filter((a) => a.date === iso);
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setDate(iso);
                    setView("dia");
                  }}
                  className={cn(
                    "min-h-20 rounded-lg border border-border p-2 text-left transition-colors hover:bg-muted",
                    iso === TODAY && "border-primary bg-primary-soft",
                  )}
                >
                  <span className="text-xs font-medium">{dayNumber}</span>
                  {items.length > 0 ? (
                    <span className="mt-1 block rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                      {items.length} atend.
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </SectionCard>
      )}

      <AppointmentDrawer appointment={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
}

function AppointmentCard({
  item,
  onClick,
  compact = false,
}: {
  item: AppointmentView;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{item.patientName}</p>
        <StatusBadge status={item.status} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.start}–{addMinutes(item.start, item.durationMinutes)} · {item.serviceName}
      </p>
      {!compact ? (
        <p className="text-xs text-muted-foreground">
          {item.professionalName} · {item.roomName}
        </p>
      ) : null}
    </button>
  );
}

function Filter({
  value,
  onChange,
  options,
  allLabel,
  allValue,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
  allValue: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={allValue}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
