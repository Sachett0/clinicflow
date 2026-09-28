import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Eye, FileText, Send } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { documentService, patientService } from "@/services";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_shell/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos · ClinicFlow" },
      { name: "description", content: "Biblioteca de termos, contratos, laudos e declarações com controle de assinatura." },
      { property: "og:title", content: "Documentos · ClinicFlow" },
      { property: "og:description", content: "Organize documentos da clínica e acompanhe assinaturas." },
    ],
  }),
  component: DocumentsPage,
});

const CATEGORIES = [
  { value: "todas", label: "Todas as categorias" },
  { value: "termos", label: "Termos" },
  { value: "contratos", label: "Contratos" },
  { value: "avaliacoes", label: "Avaliações" },
  { value: "declaracoes", label: "Declarações" },
  { value: "relatorios", label: "Relatórios" },
  { value: "outros", label: "Outros" },
];

function DocumentsPage() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("todas");

  const documents = useQuery({ queryKey: ["documents"], queryFn: documentService.list });
  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });
  const patientName = (id: string) => patients.data?.find((p) => p.id === id)?.name ?? "—";

  const rows = (documents.data ?? []).filter(
    (d) =>
      d.name.toLowerCase().includes(term.toLowerCase()) &&
      (category === "todas" || d.category === category),
  );

  return (
    <>
      <PageHeader
        title="Documentos"
        description="Biblioteca de documentos da clínica com status de assinatura."
        actions={<Button onClick={() => toast.success("Novo documento criado como rascunho.")}>+ Novo documento</Button>}
      />

      <SectionCard bodyClassName="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input placeholder="Buscar documento" value={term} onChange={(e) => setTerm(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      <SectionCard bodyClassName="p-0">
        {documents.isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={FileText} title="Nenhum documento encontrado." description="Ajuste os filtros ou crie um documento." />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-3 font-medium">Documento</th>
                    <th className="px-5 py-3 font-medium">Paciente</th>
                    <th className="px-5 py-3 font-medium">Data</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Assinatura</th>
                    <th className="px-5 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((d) => (
                    <tr key={d.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <p className="font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{d.category}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{patientName(d.patientId)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{formatDate(d.createdAt)}</td>
                      <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {d.signers.filter((s) => s.status === "assinado").length}/{d.signers.length || 0} assinaram
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label="Visualizar" onClick={() => toast.info("Pré-visualização do documento.")}>
                            <Eye className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Baixar" onClick={() => toast.success("Download iniciado.")}>
                            <Download className="size-4" />
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link to="/assinaturas"><Send className="mr-1 size-3.5" /> Assinatura</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-border md:hidden">
              {rows.map((d) => (
                <li key={d.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{d.name}</p>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {patientName(d.patientId)} · {formatDate(d.createdAt)}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.info("Pré-visualização do documento.")}>Visualizar</Button>
                    <Button size="sm" variant="outline" asChild><Link to="/assinaturas">Enviar</Link></Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </SectionCard>
    </>
  );
}
