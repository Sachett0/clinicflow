import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  professionalService,
  roomService,
  serviceCatalog,
  tenantService,
  userService,
} from "@/services";
import { currencyPrecise } from "@/lib/format";

export const Route = createFileRoute("/_shell/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações · ClinicFlow" },
      { name: "description", content: "Dados da clínica, usuários, permissões, salas, serviços e integrações." },
      { property: "og:title", content: "Configurações · ClinicFlow" },
      { property: "og:description", content: "Configure a clínica, equipe, permissões e integrações." },
    ],
  }),
  component: SettingsPage,
});

const ROLES = [
  { key: "admin", label: "Administrador" },
  { key: "reception", label: "Recepção" },
  { key: "professional", label: "Profissional" },
  { key: "financial", label: "Financeiro" },
] as const;

const PERMISSIONS: { key: string; roles: string[] }[] = [
  { key: "patients.read", roles: ["admin", "reception", "professional", "financial"] },
  { key: "patients.create", roles: ["admin", "reception"] },
  { key: "patients.update", roles: ["admin", "reception", "professional"] },
  { key: "medical_records.read", roles: ["admin", "professional"] },
  { key: "medical_records.create", roles: ["admin", "professional"] },
  { key: "evaluations.create", roles: ["admin", "professional"] },
  { key: "evolutions.create", roles: ["admin", "professional"] },
  { key: "evolutions.finalize", roles: ["admin", "professional"] },
  { key: "financial.read", roles: ["admin", "financial"] },
  { key: "financial.create", roles: ["admin", "financial"] },
];

const roleLabel = (r: string) => ROLES.find((x) => x.key === r)?.label ?? r;

function SettingsPage() {
  const clinic = tenantService.current();
  const users = useQuery({ queryKey: ["users"], queryFn: userService.list });
  const professionals = useQuery({ queryKey: ["professionals"], queryFn: professionalService.list });
  const rooms = useQuery({ queryKey: ["rooms"], queryFn: roomService.list });
  const services = useQuery({ queryKey: ["services"], queryFn: serviceCatalog.list });
  const save = () => toast.success("Configurações salvas.");

  return (
    <>
      <PageHeader title="Configurações" description={`Clínica atual: ${clinic.name}`} />
      <Tabs defaultValue="clinica">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          {["Clínica", "Usuários", "Profissionais", "Salas", "Serviços", "Permissões", "WhatsApp", "Assinaturas", "Notificações", "Financeiro", "Segurança"].map((t) => (
            <TabsTrigger key={t} value={t.toLowerCase()}>{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="clínica" className="mt-4">
          <ClinicForm onSave={save} />
        </TabsContent>
        <TabsContent value="clinica" className="mt-4">
          <ClinicForm onSave={save} />
        </TabsContent>

        <TabsContent value="usuários" className="mt-4">
          <SectionCard title="Usuários" actions={<Button size="sm" onClick={() => toast.success("Convite enviado.")}>+ Convidar usuário</Button>} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {(users.data ?? []).map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email} · último acesso {u.lastAccess}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs">{roleLabel(u.role)}</span>
                    <StatusBadge status={u.active ? "ativo" : "inativo"} />
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="profissionais" className="mt-4">
          <SectionCard title="Profissionais" bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {(professionals.data ?? []).map((p) => (
                <li key={p.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.specialty} · {p.council}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="salas" className="mt-4">
          <SectionCard title="Salas" bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {(rooms.data ?? []).map((r) => (
                <li key={r.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.floor} · capacidade {r.capacity}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="serviços" className="mt-4">
          <SectionCard title="Serviços" bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {(services.data ?? []).map((s) => (
                <li key={s.id} className="flex justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.category} · {s.durationMinutes} min</p>
                  </div>
                  <span className="text-sm font-semibold">{currencyPrecise(s.price)}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="permissões" className="mt-4">
          <SectionCard title="Permissões por perfil" description="Controle granular de acesso por recurso." actions={<Button size="sm" onClick={save}>Salvar</Button>} bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-3 font-medium">Permissão</th>
                    {ROLES.map((r) => <th key={r.key} className="px-5 py-3 text-center font-medium">{r.label}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PERMISSIONS.map((p) => (
                    <tr key={p.key}>
                      <td className="px-5 py-3 font-mono text-xs">{p.key}</td>
                      {ROLES.map((r) => (
                        <td key={r.key} className="px-5 py-3 text-center">
                          <Checkbox defaultChecked={p.roles.includes(r.key)} disabled={r.key === "admin"} aria-label={`${p.key} para ${r.label}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-4">
          <Integration title="WhatsApp Business API" description="Conecte o número oficial da clínica para envio de confirmações e lembretes." onSave={save} fields={["ID do número", "ID da conta comercial"]} />
        </TabsContent>
        <TabsContent value="assinaturas" className="mt-4">
          <Integration title="Provedor de assinatura eletrônica" description="Integração com provedor externo especializado. As chaves ficam guardadas apenas no servidor." onSave={save} fields={["Provedor", "Ambiente (sandbox / produção)"]} />
        </TabsContent>

        <TabsContent value="notificações" className="mt-4">
          <Toggles onSave={save} items={["Novo agendamento", "Confirmação de paciente", "Documento assinado", "Pagamento em atraso", "Resumo diário por e-mail"]} />
        </TabsContent>
        <TabsContent value="financeiro" className="mt-4">
          <Toggles onSave={save} items={["Gerar cobrança ao finalizar atendimento", "Lembrete automático de vencimento", "Aceitar Pix", "Aceitar cartão de crédito"]} />
        </TabsContent>
        <TabsContent value="segurança" className="mt-4">
          <SectionCard title="Segurança e privacidade">
            <div className="space-y-4">
              <ToggleRow label="Exigir verificação em duas etapas (MFA)" />
              <ToggleRow label="Mascarar CPF em listagens" defaultChecked />
              <ToggleRow label="Encerrar sessão após 30 minutos de inatividade" defaultChecked />
              <p className="text-xs text-muted-foreground">
                Dados isolados por clínica (tenant). Acesse os <Link to="/auditoria" className="text-primary underline">logs de auditoria</Link>.
              </p>
              <Button onClick={save}>Salvar</Button>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}

function ClinicForm({ onSave }: { onSave: () => void }) {
  const c = tenantService.current();
  return (
    <SectionCard title="Dados da clínica">
      <div className="grid gap-4 sm:grid-cols-2">
        {[["Nome", c.name], ["CNPJ", c.document], ["Telefone", c.phone], ["E-mail", c.email], ["Cidade", c.city], ["Estado", c.state]].map(([l, v]) => (
          <div key={l} className="space-y-2"><Label>{l}</Label><Input defaultValue={v} /></div>
        ))}
      </div>
      <Button className="mt-5" onClick={onSave}>Salvar alterações</Button>
    </SectionCard>
  );
}

function Integration({ title, description, fields, onSave }: { title: string; description: string; fields: string[]; onSave: () => void }) {
  return (
    <SectionCard title={title} description={description} actions={<StatusBadge status="pendente" />}>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => <div key={f} className="space-y-2"><Label>{f}</Label><Input placeholder="Não configurado" /></div>)}
      </div>
      <Button className="mt-5" onClick={onSave}>Salvar integração</Button>
    </SectionCard>
  );
}

function Toggles({ items, onSave }: { items: string[]; onSave: () => void }) {
  return (
    <SectionCard>
      <div className="space-y-4">
        {items.map((i) => <ToggleRow key={i} label={i} defaultChecked />)}
        <Button onClick={onSave}>Salvar</Button>
      </div>
    </SectionCard>
  );
}

function ToggleRow({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4 border-b border-border pb-3 text-sm">
      {label}
      <Switch defaultChecked={defaultChecked} />
    </label>
  );
}
