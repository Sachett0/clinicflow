import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Info, Plus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Timeline } from "@/components/common/Timeline";
import { BlockSkeleton } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { documentService, patientService } from "@/services";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/assinaturas")({
  head: () => ({
    meta: [
      { title: "Assinatura eletrônica · ClinicFlow" },
      { name: "description", content: "Envio de documentos para assinatura eletrônica com signatários e trilha de eventos." },
      { property: "og:title", content: "Assinatura eletrônica · ClinicFlow" },
      { property: "og:description", content: "Fluxo completo de assinatura com rastreabilidade." },
    ],
  }),
  component: SignaturesPage,
});

function SignaturesPage() {
  const documents = useQuery({ queryKey: ["documents"], queryFn: documentService.list });
  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");

  const docs = documents.data ?? [];
  const selected = docs.find((d) => d.id === selectedId) ?? docs[0];
  const patientName = (id: string) => patients.data?.find((p) => p.id === id)?.name ?? "—";

  if (documents.isLoading) return <BlockSkeleton className="h-96" />;

  return (
    <>
      <PageHeader
        title="Assinatura eletrônica"
        description="Envie documentos para assinatura e acompanhe cada etapa do fluxo."
      />

      <div className="flex items-start gap-2 rounded-xl border border-border bg-info-soft p-4 text-sm text-info">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Este módulo está preparado para integração com um provedor externo especializado em
          assinatura eletrônica com validade jurídica. O protótipo não coleta assinaturas reais.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Documentos no fluxo" bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {docs.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  className={cn(
                    "w-full px-5 py-3 text-left transition-colors hover:bg-muted/60",
                    selected?.id === d.id && "bg-primary-soft",
                  )}
                >
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{patientName(d.patientId)}</p>
                  <div className="mt-1"><StatusBadge status={d.status} /></div>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        {selected ? (
          <div className="space-y-5 lg:col-span-2">
            <SectionCard
              title={selected.name}
              description={`${patientName(selected.patientId)} · criado em ${formatDate(selected.createdAt)}`}
              actions={<StatusBadge status={selected.status} />}
            >
              <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                {["Documento", "Signatários", "Envio", "Assinatura"].map((step, i) => (
                  <div key={step} className="rounded-lg border border-border p-3 text-center">
                    <p className="font-semibold text-foreground">{i + 1}. {step}</p>
                  </div>
                ))}
              </div>

              <h3 className="mt-6 text-sm font-semibold">Signatários</h3>
              {selected.signers.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Nenhum signatário adicionado.</p>
              ) : (
                <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                  {selected.signers.map((s) => (
                    <li key={s.email} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email} · {s.role}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.signedAt ? (
                          <span className="text-xs text-muted-foreground">{s.signedAt}</span>
                        ) : null}
                        <StatusBadge status={s.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 grid gap-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-[1fr_1fr_auto]">
                <div className="space-y-1">
                  <Label className="text-xs">Nome do signatário</Label>
                  <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">E-mail</Label>
                  <Input type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} />
                </div>
                <Button
                  className="self-end"
                  onClick={() => {
                    if (!signerName || !signerEmail) {
                      toast.error("Informe nome e e-mail do signatário.");
                      return;
                    }
                    toast.success("Signatário adicionado.", { description: signerEmail });
                    setSignerName("");
                    setSignerEmail("");
                  }}
                >
                  <Plus className="mr-1 size-4" /> Adicionar
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => toast.success("Documento enviado para assinatura.")}>
                  <ShieldCheck className="mr-1 size-4" /> Enviar para assinatura
                </Button>
                <Button variant="outline" onClick={() => toast.info("Lembrete reenviado aos signatários pendentes.")}>
                  Reenviar lembrete
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Trilha do documento">
              <Timeline
                items={selected.timeline.map((t, i) => ({
                  id: `${selected.id}-${i}`,
                  title: t.label,
                  meta: t.at,
                  done: t.done,
                }))}
              />
            </SectionCard>
          </div>
        ) : null}
      </div>
    </>
  );
}
