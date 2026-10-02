import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { BlockSkeleton } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reportService } from "@/services";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios · ClinicFlow" },
      {
        name: "description",
        content: "Relatórios de atendimentos, faltas, cancelamentos, faturamento e produtividade.",
      },
      { property: "og:title", content: "Relatórios · ClinicFlow" },
      { property: "og:description", content: "Indicadores gerenciais da clínica por período." },
    ],
  }),
  component: ReportsPage,
});

const CATEGORIES = [
  "Atendimentos",
  "Pacientes",
  "Cancelamentos",
  "Faltas",
  "Faturamento",
  "Profissionais",
  "Salas",
  "Serviços",
];
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-card)",
  fontSize: 12,
};
const services = [
  { name: "Fisioterapia", value: 48 },
  { name: "Pilates", value: 22 },
  { name: "Esportiva", value: 16 },
  { name: "Avaliações", value: 14 },
];
const pieColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

function ReportsPage() {
  const [category, setCategory] = useState("Atendimentos");
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-09-30");
  const series = useQuery({
    queryKey: ["appointment-series"],
    queryFn: reportService.appointmentSeries,
  });
  const revenue = useQuery({ queryKey: ["revenue-series"], queryFn: reportService.revenueSeries });

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Analise o desempenho da clínica por período."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Exportação iniciada.", { description: `${category} · CSV` })
            }
          >
            <Download className="mr-1 size-4" /> Exportar
          </Button>
        }
      />

      <SectionCard bodyClassName="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                category === c && "border-primary bg-primary-soft text-accent-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <Label className="text-xs">De</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button onClick={() => toast.success("Filtros aplicados.")}>Aplicar filtros</Button>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title={`${category} por dia`} bodyClassName="p-3 pt-5">
          {series.isLoading ? (
            <BlockSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={series.data ?? []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="day"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="atendimentos" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="faltas" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
        <SectionCard title="Faturamento mensal" bodyClassName="p-3 pt-5">
          {revenue.isLoading ? (
            <BlockSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenue.data ?? []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-muted-foreground)"
                  tickFormatter={(v: number) => `${v / 1000}k`}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="recebido"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
        <SectionCard title="Distribuição por serviço" bodyClassName="p-3 pt-5">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={services}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {services.map((s, i) => (
                  <Cell key={s.name} fill={pieColors[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Produtividade por profissional">
          <ul className="space-y-4">
            {[
              ["Dra. Maria Ferraz", 92],
              ["Dr. Caio Bastos", 81],
              ["Dra. Helena Prado", 74],
              ["Dr. Tiago Moura", 68],
            ].map(([name, v]) => (
              <li key={name}>
                <div className="flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-muted-foreground">{v}% ocupação</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${v}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
