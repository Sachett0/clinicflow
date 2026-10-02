import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { BlockSkeleton } from "@/components/common/LoadingState";
import { Timeline } from "@/components/common/Timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { medicalRecordService, patientService, professionalService } from "@/services";
import { formatDate } from "@/lib/format";
import type { MedicalRecordEntry } from "@/data/types";

export const Route = createFileRoute("/_shell/prontuarios")({
  head: () => ({
    meta: [
      { title: "Prontuários · ClinicFlow" },
      {
        name: "description",
        content: "Linha do tempo clínica com avaliações, evoluções, assinaturas e anexos.",
      },
      { property: "og:title", content: "Prontuários · ClinicFlow" },
      {
        property: "og:description",
        content: "Registros clínicos organizados por paciente e profissional.",
      },
    ],
  }),
  component: RecordsPage,
});

function RecordsPage() {
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<MedicalRecordEntry | null>(null);

  const records = useQuery({ queryKey: ["records"], queryFn: medicalRecordService.list });
  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });
  const professionals = useQuery({
    queryKey: ["professionals"],
    queryFn: professionalService.list,
  });

  const patientName = (id: string) => patients.data?.find((p) => p.id === id)?.name ?? "—";
  const profName = (id: string) => professionals.data?.find((p) => p.id === id)?.name ?? "—";

  const items = (records.data ?? [])
    .filter((r) => patientName(r.patientId).toLowerCase().includes(term.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        title="Prontuários"
        description="Todos os registros clínicos da clínica em ordem cronológica."
        actions={
          <Button variant="outline" asChild>
            <Link to="/pacientes">Ver pacientes</Link>
          </Button>
        }
      />

      <SectionCard bodyClassName="p-4">
        <Input
          placeholder="Buscar por paciente"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </SectionCard>

      <SectionCard title="Linha do tempo clínica">
        {records.isLoading ? (
          <BlockSkeleton className="h-72" />
        ) : items.length === 0 ? (
          <EmptyState icon={Stethoscope} title="Nenhum registro encontrado." />
        ) : (
          <Timeline
            items={items.map((r) => ({
              id: r.id,
              title: `${formatDate(r.date)} · ${r.title}`,
              meta: `${patientName(r.patientId)} · ${profName(r.professionalId)}`,
              description: r.summary,
              right: (
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
                    Visualizar
                  </Button>
                </div>
              ),
            }))}
          />
        )}
      </SectionCard>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.title}</SheetTitle>
                <SheetDescription>
                  {formatDate(selected.date)} · {profName(selected.professionalId)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  {selected.status === "finalizado" ? (
                    <span className="text-xs text-muted-foreground">
                      Registro finalizado — edição bloqueada
                    </span>
                  ) : null}
                </div>
                <dl className="space-y-3 text-sm">
                  {selected.content.map((c) => (
                    <div key={c.label}>
                      <dt className="text-xs text-muted-foreground uppercase">{c.label}</dt>
                      <dd className="mt-0.5">{c.value}</dd>
                    </div>
                  ))}
                </dl>
                {selected.attachments.length > 0 ? (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Anexos</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {selected.attachments.map((a) => (
                        <li key={a} className="rounded-md bg-muted px-3 py-2">
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selected.signedBy ? (
                  <div className="rounded-lg bg-success-soft p-3 text-xs text-success">
                    Assinado por {selected.signedBy} em {selected.signedAt}
                  </div>
                ) : null}
                <Button variant="outline" asChild className="w-full">
                  <Link to="/pacientes/$id" params={{ id: selected.patientId }}>
                    Abrir perfil do paciente
                  </Link>
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
