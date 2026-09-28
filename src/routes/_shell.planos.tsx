import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Target } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { CardsSkeleton } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { patientService, professionalService, therapyPlanService } from "@/services";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_shell/planos")({
  head: () => ({
    meta: [
      { title: "Planos terapêuticos · ClinicFlow" },
      { name: "description", content: "Objetivos, metas e progresso do tratamento de cada paciente." },
      { property: "og:title", content: "Planos terapêuticos · ClinicFlow" },
      { property: "og:description", content: "Acompanhe metas e progresso clínico por paciente." },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const plans = useQuery({ queryKey: ["plans"], queryFn: therapyPlanService.list });
  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });
  const professionals = useQuery({ queryKey: ["professionals"], queryFn: professionalService.list });

  const patientName = (id: string) => patients.data?.find((p) => p.id === id)?.name ?? "—";
  const profName = (id: string) => professionals.data?.find((p) => p.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader
        title="Planos terapêuticos"
        description="Objetivos, frequência e metas mensuráveis por paciente."
        actions={<Button onClick={() => toast.info("Selecione um paciente para criar o plano.")}>+ Novo plano</Button>}
      />

      {plans.isLoading ? (
        <CardsSkeleton items={2} />
      ) : (plans.data ?? []).length === 0 ? (
        <EmptyState icon={Target} title="Nenhum plano terapêutico ativo." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {(plans.data ?? []).map((plan) => {
            const sessionPct = Math.round((plan.usedSessions / plan.totalSessions) * 100);
            return (
              <SectionCard
                key={plan.id}
                title={patientName(plan.patientId)}
                description={`${profName(plan.professionalId)} · ${plan.frequency}`}
                actions={
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/pacientes/$id" params={{ id: plan.patientId }}>Abrir paciente</Link>
                  </Button>
                }
              >
                <p className="text-sm font-medium">{plan.objective}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Info label="Início" value={formatDate(plan.startDate)} />
                  <Info label="Previsão" value={formatDate(plan.endDate)} />
                  <Info label="Sessões" value={`${plan.usedSessions} de ${plan.totalSessions}`} />
                </div>
                <Progress value={sessionPct} className="mt-4" />
                <p className="mt-1 text-xs text-muted-foreground">{sessionPct}% das sessões realizadas</p>

                <div className="mt-5 space-y-3">
                  {plan.goals.map((g) => (
                    <div key={g.id} className="rounded-xl border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{g.title}</p>
                        <span className="text-xs text-muted-foreground">{g.deadline}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {g.indicator} · objetivo {g.target}
                      </p>
                      <Progress value={g.progress} className="mt-2" />
                    </div>
                  ))}
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </>
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
