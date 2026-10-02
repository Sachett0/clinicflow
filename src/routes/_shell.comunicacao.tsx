import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCheck, MessageCircle, Send, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { BlockSkeleton } from "@/components/common/LoadingState";
import { PatientAvatar } from "@/components/common/PatientAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patientService, whatsappService } from "@/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/comunicacao")({
  head: () => ({
    meta: [
      { title: "Comunicação · ClinicFlow" },
      {
        name: "description",
        content: "Mensagens de WhatsApp, templates e indicadores de confirmação de consulta.",
      },
      { property: "og:title", content: "Comunicação · ClinicFlow" },
      { property: "og:description", content: "Converse com pacientes e automatize confirmações." },
    ],
  }),
  component: CommunicationPage,
});

function CommunicationPage() {
  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: whatsappService.conversations,
  });
  const templates = useQuery({ queryKey: ["wa-templates"], queryFn: whatsappService.templates });
  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const list = conversations.data ?? [];
  const active = list.find((c) => c.id === activeId) ?? list[0];
  const patientName = (id: string) => patients.data?.find((p) => p.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader
        title="Comunicação"
        description="WhatsApp integrado ao fluxo de atendimento da clínica."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mensagens enviadas" value="482" icon={Send} hint="últimos 30 dias" />
        <StatCard
          label="Confirmadas"
          value="367"
          icon={CheckCheck}
          trend={{ value: "76%", positive: true }}
        />
        <StatCard label="Pendentes" value="94" icon={MessageCircle} />
        <StatCard
          label="Falhas"
          value="21"
          icon={TriangleAlert}
          trend={{ value: "4,3%", positive: false }}
        />
      </div>

      <Tabs defaultValue="conversas">
        <TabsList>
          <TabsTrigger value="conversas">Conversas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="conversas" className="mt-4">
          {conversations.isLoading ? (
            <BlockSkeleton className="h-96" />
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              <SectionCard title="Pacientes" bodyClassName="p-0">
                <ul className="divide-y divide-border">
                  {list.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(c.id)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                          active?.id === c.id && "bg-primary-soft",
                        )}
                      >
                        <PatientAvatar name={patientName(c.patientId)} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{patientName(c.patientId)}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.messages[c.messages.length - 1]?.text}
                          </p>
                        </div>
                        {c.unread > 0 ? (
                          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                            {c.unread}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              {active ? (
                <SectionCard
                  title={patientName(active.patientId)}
                  description={`Última interação em ${active.updatedAt}`}
                  className="lg:col-span-2"
                  bodyClassName="p-0"
                >
                  <div className="flex h-[26rem] flex-col">
                    <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
                      {active.messages.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            "flex",
                            m.from === "clinica" ? "justify-end" : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                              m.from === "clinica"
                                ? "rounded-br-sm bg-primary text-primary-foreground"
                                : "rounded-bl-sm bg-card text-foreground",
                            )}
                          >
                            <p>{m.text}</p>
                            <p className="mt-1 text-[10px] opacity-75">
                              {m.at} · {m.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form
                      className="flex gap-2 border-t border-border p-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!draft.trim()) return;
                        toast.success("Mensagem enviada.", { description: draft });
                        setDraft("");
                      }}
                    >
                      <Input
                        placeholder="Escreva uma mensagem"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                      />
                      <Button type="submit">
                        <Send className="size-4" />
                      </Button>
                    </form>
                  </div>
                </SectionCard>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {(templates.data ?? []).map((t) => (
              <SectionCard key={t.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.active ? "ativo" : "inativo"} />
                    <Switch
                      defaultChecked={t.active}
                      onCheckedChange={(v) =>
                        toast.success(v ? "Template ativado." : "Template desativado.")
                      }
                      aria-label={`Ativar template ${t.name}`}
                    />
                  </div>
                </div>
                <p className="mt-3 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                  {t.body}
                </p>
              </SectionCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
