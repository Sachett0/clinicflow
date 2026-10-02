import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CircleDollarSign, Clock3, Wallet } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { financialService, patientService } from "@/services";
import { currencyPrecise, currency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_shell/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro · ClinicFlow" },
      {
        name: "description",
        content: "Receita, cobranças, inadimplência e pacotes de sessões da clínica.",
      },
      { property: "og:title", content: "Financeiro · ClinicFlow" },
      { property: "og:description", content: "Controle receitas, cobranças e pacotes de sessões." },
    ],
  }),
  component: FinancialPage,
});

function FinancialPage() {
  const charges = useQuery({ queryKey: ["charges"], queryFn: financialService.charges });
  const packages = useQuery({ queryKey: ["packages"], queryFn: financialService.packages });
  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });
  const [status, setStatus] = useState("todos");

  const patientName = (id: string) => patients.data?.find((p) => p.id === id)?.name ?? "—";
  const all = charges.data ?? [];
  const rows = all.filter((c) => status === "todos" || c.status === status);

  const total = all.filter((c) => c.status !== "cancelado").reduce((s, c) => s + c.amount, 0);
  const paid = all.filter((c) => c.status === "pago").reduce((s, c) => s + c.amount, 0);
  const pending = all.filter((c) => c.status === "pendente").reduce((s, c) => s + c.amount, 0);
  const late = all.filter((c) => c.status === "atrasado").reduce((s, c) => s + c.amount, 0);

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Acompanhe receitas, recebimentos e pacotes de sessões."
        actions={
          <Button onClick={() => toast.success("Nova cobrança criada.")}>+ Nova cobrança</Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Receita do mês"
          value={currency(total)}
          icon={CircleDollarSign}
          trend={{ value: "+6,4%", positive: true }}
        />
        <StatCard
          label="Recebido"
          value={currency(paid)}
          icon={Wallet}
          trend={{ value: "+12%", positive: true }}
        />
        <StatCard label="Pendente" value={currency(pending)} icon={Clock3} />
        <StatCard
          label="Em atraso"
          value={currency(late)}
          icon={AlertCircle}
          trend={{ value: "2 cobranças", positive: false }}
        />
      </div>

      <Tabs defaultValue="cobrancas">
        <TabsList>
          <TabsTrigger value="cobrancas">Cobranças</TabsTrigger>
          <TabsTrigger value="pacotes">Pacotes de sessões</TabsTrigger>
        </TabsList>

        <TabsContent value="cobrancas" className="mt-4 space-y-4">
          <SectionCard bodyClassName="p-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="atrasado">Em atraso</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </SectionCard>

          <SectionCard bodyClassName="p-0">
            {charges.isLoading ? (
              <TableSkeleton />
            ) : rows.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Nenhuma cobrança neste filtro." />
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground uppercase">
                      <tr>
                        <th className="px-5 py-3 font-medium">Paciente</th>
                        <th className="px-5 py-3 font-medium">Descrição</th>
                        <th className="px-5 py-3 font-medium">Valor</th>
                        <th className="px-5 py-3 font-medium">Vencimento</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Forma de pagamento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((c) => (
                        <tr key={c.id} className="transition-colors hover:bg-muted/40">
                          <td className="px-5 py-3 font-medium">{patientName(c.patientId)}</td>
                          <td className="px-5 py-3 text-muted-foreground">{c.description}</td>
                          <td className="px-5 py-3 font-semibold">{currencyPrecise(c.amount)}</td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {formatDate(c.dueDate)}
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{c.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="divide-y divide-border md:hidden">
                  {rows.map((c) => (
                    <li key={c.id} className="space-y-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{patientName(c.patientId)}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                      <p className="text-sm font-semibold">{currencyPrecise(c.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence em {formatDate(c.dueDate)} · {c.method}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="pacotes" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(packages.data ?? []).map((p) => {
              const pct = Math.round((p.used / p.total) * 100);
              return (
                <SectionCard key={p.id} title={p.name} description={patientName(p.patientId)}>
                  <p className="text-sm text-muted-foreground">
                    {p.total} sessões · {p.used} utilizadas · {p.total - p.used} restantes
                  </p>
                  <Progress value={pct} className="mt-3" />
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Válido até {formatDate(p.validUntil)}</span>
                    <span className="font-semibold text-foreground">
                      {currencyPrecise(p.price)}
                    </span>
                  </div>
                </SectionCard>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
