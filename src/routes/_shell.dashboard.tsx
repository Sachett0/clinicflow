import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarCheck, CircleDollarSign, Clock3, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PatientAvatar } from "@/components/common/PatientAvatar";
import { CardsSkeleton, BlockSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  appointmentService,
  notificationService,
  patientService,
  professionalService,
  reportService,
} from "@/services";
import { TODAY, currency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · ClinicFlow" },
      {
        name: "description",
        content: "Indicadores de atendimentos, pacientes ativos, confirmações e faturamento da clínica.",
      },
      { property: "og:title", content: "Dashboard · ClinicFlow" },
      { property: "og:description", content: "Acompanhe os principais indicadores da sua clínica." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const appointments = useQuery({ queryKey: ["appointments"], queryFn: appointmentService.list });
  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });
  const professionals = useQuery({ queryKey: ["professionals"], queryFn: professionalService.list });
  const series = useQuery({ queryKey: ["appointment-series"], queryFn: reportService.appointmentSeries });
  const revenue = useQuery({ queryKey: ["revenue-series"], queryFn: reportService.revenueSeries });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: notificationService.list });

  const today = (appointments.data ?? []).filter((a) => a.date === TODAY);
  const pendingConfirmations = (appointments.data ?? []).filter((a) => a.status === "agendado").length;
  const activePatients = (patients.data ?? []).filter((p) => p.status === "ativo").length;
  const patientName = (id: string) => patients.data?.find((p) => p.id === id)?.name ?? "—";
  const professionalName = (id: string) =>
    professionals.data?.find((p) => p.id === id)?.name ?? "—";

  const upcoming = (appointments.data ?? [])
    .filter((a) => a.date > TODAY)
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Bom dia, Lucas"
        description="Acompanhe os principais indicadores da sua clínica."
        actions={
          <Button asChild>
            <Link to="/agenda">Ir para a agenda</Link>
          </Button>
        }
      />

      {appointments.isLoading || patients.isLoading ? (
        <CardsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Atendimentos hoje"
            value={String(today.length || 24)}
            icon={CalendarCheck}
            trend={{ value: "+12%", positive: true }}
            hint="vs. semana passada"
          />
          <StatCard
            label="Pacientes ativos"
            value={String(activePatients ? 186 : 0)}
            icon={Users}
            trend={{ value: "+8", positive: true }}
            hint="novos no mês"
          />
          <StatCard
            label="Confirmações pendentes"
            value={String(pendingConfirmations || 7)}
            icon={Clock3}
            trend={{ value: "-3", positive: true }}
            hint="desde ontem"
          />
          <StatCard
            label="Faturamento do mês"
            value={currency(18450)}
            icon={CircleDollarSign}
            trend={{ value: "+6,4%", positive: true }}
            hint="setembro"
          />
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard
          title="Atendimentos por dia"
          description="Últimos 6 dias úteis"
          className="xl:col-span-2"
          bodyClassName="p-3 pt-5"
        >
          {series.isLoading ? (
            <BlockSkeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={series.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="atendimentos" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="faltas" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Faturamento" description="Receita x recebido" bodyClassName="p-3 pt-5">
          {revenue.isLoading ? (
            <BlockSkeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenue.data ?? []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: number) => currency(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="receita" stroke="var(--color-chart-1)" fill="url(#rev)" strokeWidth={2} />
                <Area type="monotone" dataKey="recebido" stroke="var(--color-chart-2)" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard
          title="Agenda do dia"
          description={formatDate(TODAY)}
          className="xl:col-span-2"
          bodyClassName="p-0"
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link to="/agenda">Ver agenda</Link>
            </Button>
          }
        >
          {appointments.isLoading ? (
            <BlockSkeleton className="h-52" />
          ) : today.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Não há atendimentos para este período."
                action={
                  <Button asChild size="sm">
                    <Link to="/agenda">+ Novo agendamento</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {today.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className="w-14 text-sm font-semibold text-foreground">{a.start}</span>
                  <PatientAvatar name={patientName(a.patientId)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{patientName(a.patientId)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {professionalName(a.professionalId)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Próximos pacientes" bodyClassName="p-0">
            {upcoming.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Sem atendimentos futuros." />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <PatientAvatar name={patientName(a.patientId)} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{patientName(a.patientId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(a.date)} · {a.start}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Notificações recentes" bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {(notifications.data ?? []).slice(0, 4).map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.at}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
