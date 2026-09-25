import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, FileText, MessageCircle, Plus } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PatientAvatar } from "@/components/common/PatientAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { BlockSkeleton } from "@/components/common/LoadingState";
import { Timeline } from "@/components/common/Timeline";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  appointmentService,
  documentService,
  financialService,
  medicalRecordService,
  patientService,
  professionalService,
  therapyPlanService,
} from "@/services";
import { age, currencyPrecise, formatDate, maskCpf } from "@/lib/format";

export const Route = createFileRoute("/_shell/pacientes/$id")({
  head: () => ({
    meta: [
      { title: "Perfil do paciente · ClinicFlow" },
      { name: "description", content: "Resumo clínico, prontuário, evoluções, documentos e financeiro do paciente." },
      { property: "og:title", content: "Perfil do paciente · ClinicFlow" },
      { property: "og:description", content: "Histórico completo do paciente em um só lugar." },
    ],
  }),
  component: PatientProfilePage,
});

function PatientProfilePage() {
  const { id } = useParams({ from: "/_shell/pacientes/$id" });
  const patient = useQuery({ queryKey: ["patient", id], queryFn: () => patientService.byId(id) });
  const records = useQuery({ queryKey: ["records", id], queryFn: () => medicalRecordService.byPatient(id) });
  const appointments = useQuery({ queryKey: ["appointments", id], queryFn: () => appointmentService.byPatient(id) });
  const plan = useQuery({ queryKey: ["plan", id], queryFn: () => therapyPlanService.byPatient(id) });
  const documents = useQuery({ queryKey: ["documents"], queryFn: documentService.list });
  const charges = useQuery({ queryKey: ["charges"], queryFn: financialService.charges });
  const professionals = useQuery({ queryKey: ["professionals"], queryFn: professionalService.list });

  if (patient.isLoading) return <BlockSkeleton className="h-96" />;
  const p = patient.data;
  if (!p) {
    return (
      <EmptyState
        title="Paciente não encontrado."
        description="O registro pode ter sido removido."
        action={
          <Button asChild size="sm">
            <Link to="/pacientes">Voltar para pacientes</Link>
          </Button>
        }
      />
    );
  }

  const profName = (pid: string) => professionals.data?.find((x) => x.id === pid)?.name ?? "—";
  const patientDocs = (documents.data ?? []).filter((d) => d.patientId === id);
  const patientCharges = (charges.data ?? []).filter((c) => c.patientId === id);
  const evaluations = (records.data ?? []).filter((r) => r.type === "avaliacao");
  const evolutions = (records.data ?? []).filter((r) => r.type === "evolucao");

  return (
    <>
      <Link to="/pacientes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Pacientes
      </Link>

      <SectionCard bodyClassName="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <PatientAvatar name={p.name} tone={p.avatarTone} size="lg" />
            <div>
              <h1 className="text-xl font-semibold">{p.name}</h1>
              <p className="text-sm text-muted-foreground">
                {age(p.birthDate)} anos · {p.phone} · CPF {maskCpf(p.cpf)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="text-xs text-muted-foreground">{profName(p.professionalId)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => toast.success("Novo atendimento iniciado na agenda.")}>
              <Plus className="mr-1 size-4" /> Novo atendimento
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/avaliacoes">Nova avaliação</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/evolucoes">Nova evolução</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/documentos"><FileText className="mr-1 size-4" /> Novo documento</Link>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link to="/comunicacao"><MessageCircle className="mr-1 size-4" /> Enviar WhatsApp</Link>
            </Button>
          </div>
        </div>
      </SectionCard>

      <Tabs defaultValue="resumo">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="prontuario">Prontuário</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          <TabsTrigger value="evolucoes">Evoluções</TabsTrigger>
          <TabsTrigger value="plano">Plano terapêutico</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-4 grid gap-5 lg:grid-cols-2">
          <SectionCard title="Informações clínicas">
            <dl className="space-y-3 text-sm">
              <Row label="Queixa principal" value={p.clinical.mainComplaint} />
              <Row label="Diagnóstico" value={p.clinical.diagnosis} />
              <Row label="Médico responsável" value={p.clinical.referringDoctor} />
              <Row label="Alergias" value={p.clinical.allergies} />
              <Row label="Medicamentos" value={p.clinical.medications} />
              <Row label="Observações" value={p.clinical.notes} />
            </dl>
          </SectionCard>
          <SectionCard title="Contato e endereço">
            <dl className="space-y-3 text-sm">
              <Row label="Telefone" value={p.phone} />
              <Row label="WhatsApp" value={p.whatsapp} />
              <Row label="E-mail" value={p.email} />
              <Row
                label="Endereço"
                value={`${p.address.street}, ${p.address.number} — ${p.address.district}, ${p.address.city}/${p.address.state}`}
              />
              <Row label="CEP" value={p.address.zip} />
            </dl>
          </SectionCard>
        </TabsContent>

        <TabsContent value="prontuario" className="mt-4">
          <SectionCard title="Linha do tempo clínica">
            {(records.data ?? []).length === 0 ? (
              <EmptyState title="Nenhum registro no prontuário." />
            ) : (
              <Timeline
                items={(records.data ?? []).map((r) => ({
                  id: r.id,
                  title: `${formatDate(r.date)} · ${r.title}`,
                  meta: `${r.type === "avaliacao" ? "Avaliação" : "Evolução"} · ${profName(r.professionalId)}`,
                  description: (
                    <div className="space-y-1">
                      <p>{r.summary}</p>
                      {r.signedBy ? (
                        <p className="text-xs">Assinado por {r.signedBy} em {r.signedAt}</p>
                      ) : null}
                      {r.attachments.length > 0 ? (
                        <p className="text-xs">Anexos: {r.attachments.join(", ")}</p>
                      ) : null}
                    </div>
                  ),
                  right: <StatusBadge status={r.status} />,
                }))}
              />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="avaliacoes" className="mt-4">
          <RecordList items={evaluations} emptyLabel="Nenhuma avaliação registrada." profName={profName} />
        </TabsContent>

        <TabsContent value="evolucoes" className="mt-4">
          <RecordList items={evolutions} emptyLabel="Nenhuma evolução registrada." profName={profName} />
        </TabsContent>

        <TabsContent value="plano" className="mt-4">
          {plan.data ? (
            <SectionCard title="Plano terapêutico" description={plan.data.objective}>
              <div className="grid gap-4 sm:grid-cols-4">
                <Info label="Início" value={formatDate(plan.data.startDate)} />
                <Info label="Previsão de término" value={formatDate(plan.data.endDate)} />
                <Info label="Frequência" value={plan.data.frequency} />
                <Info label="Sessões" value={`${plan.data.usedSessions}/${plan.data.totalSessions}`} />
              </div>
              <div className="mt-6 space-y-4">
                {plan.data.goals.map((g) => (
                  <div key={g.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{g.title}</p>
                      <span className="text-xs text-muted-foreground">Prazo: {g.deadline}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {g.indicator} · objetivo {g.target}
                    </p>
                    <Progress value={g.progress} className="mt-3" />
                    <p className="mt-1 text-xs text-muted-foreground">{g.progress}% concluído</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : (
            <EmptyState title="Nenhum plano terapêutico ativo." />
          )}
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <SectionCard title="Documentos do paciente" bodyClassName="p-0">
            {patientDocs.length === 0 ? (
              <div className="p-5"><EmptyState title="Nenhum documento vinculado." /></div>
            ) : (
              <ul className="divide-y divide-border">
                {patientDocs.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                    <div>
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">Criado em {formatDate(d.createdAt)}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="financeiro" className="mt-4">
          <SectionCard title="Cobranças" bodyClassName="p-0">
            {patientCharges.length === 0 ? (
              <div className="p-5"><EmptyState title="Nenhuma cobrança registrada." /></div>
            ) : (
              <ul className="divide-y divide-border">
                {patientCharges.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                    <div>
                      <p className="text-sm font-medium">{c.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence em {formatDate(c.dueDate)} · {c.method}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{currencyPrecise(c.amount)}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <SectionCard title="Histórico de atendimentos" bodyClassName="p-0">
            {(appointments.data ?? []).length === 0 ? (
              <div className="p-5"><EmptyState title="Não há atendimentos para este período." /></div>
            ) : (
              <ul className="divide-y divide-border">
                {(appointments.data ?? []).map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                    <div>
                      <p className="text-sm font-medium">{formatDate(a.date)} · {a.start}</p>
                      <p className="text-xs text-muted-foreground">{profName(a.professionalId)}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}

function RecordList({
  items,
  emptyLabel,
  profName,
}: {
  items: { id: string; title: string; date: string; status: string; summary: string; professionalId: string }[];
  emptyLabel: string;
  profName: (id: string) => string;
}) {
  if (items.length === 0) return <EmptyState title={emptyLabel} />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((r) => (
        <SectionCard key={r.id} title={r.title} description={`${formatDate(r.date)} · ${profName(r.professionalId)}`}>
          <p className="text-sm text-muted-foreground">{r.summary}</p>
          <div className="mt-3"><StatusBadge status={r.status} /></div>
        </SectionCard>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
