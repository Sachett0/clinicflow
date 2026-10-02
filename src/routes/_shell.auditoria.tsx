import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingState";
import { Input } from "@/components/ui/input";
import { auditService } from "@/services";

export const Route = createFileRoute("/_shell/auditoria")({
  head: () => ({
    meta: [
      { title: "Logs de auditoria · ClinicFlow" },
      {
        name: "description",
        content:
          "Registro de ações dos usuários sobre pacientes, prontuários, documentos e financeiro.",
      },
      { property: "og:title", content: "Logs de auditoria · ClinicFlow" },
      {
        property: "og:description",
        content: "Rastreabilidade completa para conformidade com a LGPD.",
      },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const [term, setTerm] = useState("");
  const logs = useQuery({ queryKey: ["audit"], queryFn: auditService.list });
  const rows = (logs.data ?? []).filter((l) =>
    `${l.user} ${l.action} ${l.resource}`.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Logs de auditoria"
        description="Toda ação sensível fica registrada com usuário, recurso e IP."
      />
      <SectionCard bodyClassName="p-4">
        <Input
          placeholder="Filtrar por usuário, ação ou recurso"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </SectionCard>
      <SectionCard bodyClassName="p-0">
        {logs.isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhum registro encontrado." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground uppercase">
                <tr>
                  {["Data", "Usuário", "Ação", "Recurso", "IP", "Resultado"].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3 text-muted-foreground">{l.at}</td>
                    <td className="px-5 py-3 font-medium">{l.user}</td>
                    <td className="px-5 py-3">{l.action}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {l.resource}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={l.result} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
