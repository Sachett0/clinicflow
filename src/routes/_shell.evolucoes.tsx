import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Lock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { medicalRecordService, patientService, professionalService } from "@/services";
import { TODAY, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_shell/evolucoes")({
  head: () => ({
    meta: [
      { title: "Evoluções · ClinicFlow" },
      {
        name: "description",
        content: "Registro de evolução do paciente com rascunho, finalização e trilha de correção.",
      },
      { property: "og:title", content: "Evoluções · ClinicFlow" },
      { property: "og:description", content: "Registre a evolução de cada sessão com segurança." },
    ],
  }),
  component: EvolutionsPage,
});

const PROCEDURES = ["Alongamento", "Fortalecimento", "Mobilização", "Exercícios terapêuticos"];

function EvolutionsPage() {
  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });
  const professionals = useQuery({
    queryKey: ["professionals"],
    queryFn: professionalService.list,
  });
  const records = useQuery({ queryKey: ["records"], queryFn: medicalRecordService.list });

  const [patientId, setPatientId] = useState("pa-1");
  const [professionalId, setProfessionalId] = useState("p-1");
  const [date, setDate] = useState(TODAY);
  const [complaint, setComplaint] = useState("");
  const [procedures, setProcedures] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [notes, setNotes] = useState("");
  const [finalized, setFinalized] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);

  const evolutions = (records.data ?? []).filter((r) => r.type === "evolucao");
  const patientName = (id: string) => patients.data?.find((p) => p.id === id)?.name ?? "—";

  const toggleProcedure = (p: string) =>
    setProcedures((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  return (
    <>
      <PageHeader
        title="Evoluções"
        description="Registre o que aconteceu na sessão e finalize o documento clínico."
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard title="Nova evolução" className="xl:col-span-2">
          {finalized ? (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-success-soft p-3 text-sm text-success">
              <Lock className="size-4" /> Registro finalizado — edição direta bloqueada.
            </div>
          ) : null}

          <fieldset disabled={finalized} className="space-y-5 disabled:opacity-70">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(patients.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Profissional</Label>
                <Select value={professionalId} onValueChange={setProfessionalId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(professionals.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Queixa</Label>
              <Textarea
                rows={2}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Relato do paciente na sessão"
              />
            </div>

            <div className="space-y-2">
              <Label>Procedimentos realizados</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {PROCEDURES.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={procedures.includes(p)}
                      onCheckedChange={() => toggleProcedure(p)}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resposta ao tratamento</Label>
              <Textarea rows={2} value={response} onChange={(e) => setResponse(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </fieldset>

          <div className="mt-6 flex flex-wrap gap-2">
            {finalized ? (
              <Button
                variant="outline"
                onClick={() =>
                  toast.success("Solicitação de correção enviada ao responsável técnico.")
                }
              >
                Solicitar correção
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => toast.success("Rascunho salvo.")}>
                  Salvar rascunho
                </Button>
                <Button onClick={() => setConfirmFinalize(true)}>
                  <CheckCircle2 className="mr-1 size-4" /> Finalizar evolução
                </Button>
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Evoluções recentes" bodyClassName="p-0">
          {evolutions.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Nenhuma evolução registrada." />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {evolutions.map((e) => (
                <li key={e.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{patientName(e.patientId)}</p>
                    <StatusBadge status={e.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(e.date)} · {e.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{e.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <ConfirmDialog
        open={confirmFinalize}
        onOpenChange={setConfirmFinalize}
        destructive={false}
        title="Finalizar evolução?"
        description="Após finalizar, o registro fica bloqueado para edição e só pode ser alterado via solicitação de correção."
        confirmLabel="Finalizar"
        onConfirm={() => {
          setFinalized(true);
          setConfirmFinalize(false);
          toast.success("Registro finalizado.");
        }}
      />
    </>
  );
}
