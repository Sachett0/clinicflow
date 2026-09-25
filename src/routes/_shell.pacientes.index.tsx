import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PatientAvatar } from "@/components/common/PatientAvatar";
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
import { NewPatientDialog } from "@/modules/patients/NewPatientDialog";
import { patientService, professionalService } from "@/services";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_shell/pacientes/")({
  head: () => ({
    meta: [
      { title: "Pacientes · ClinicFlow" },
      { name: "description", content: "Cadastro de pacientes com filtros, histórico e próximos atendimentos." },
      { property: "og:title", content: "Pacientes · ClinicFlow" },
      { property: "og:description", content: "Gerencie o cadastro completo dos pacientes da clínica." },
    ],
  }),
  component: PatientsPage,
});

const PAGE_SIZE = 5;

function PatientsPage() {
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("todos");
  const [professional, setProfessional] = useState("todos");
  const [page, setPage] = useState(1);

  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });
  const professionals = useQuery({ queryKey: ["professionals"], queryFn: professionalService.list });

  const filtered = useMemo(() => {
    return (patients.data ?? []).filter(
      (p) =>
        p.name.toLowerCase().includes(term.toLowerCase()) &&
        (status === "todos" || p.status === status) &&
        (professional === "todos" || p.professionalId === professional),
    );
  }, [patients.data, term, status, professional]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const profName = (id: string) => professionals.data?.find((p) => p.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader
        title="Pacientes"
        description="Cadastro, histórico e acompanhamento dos pacientes da clínica."
        actions={<NewPatientDialog />}
      />

      <SectionCard bodyClassName="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome"
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
          <Select value={professional} onValueChange={setProfessional}>
            <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos profissionais</SelectItem>
              {(professionals.data ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      <SectionCard bodyClassName="p-0">
        {patients.isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Users}
              title="Nenhum paciente encontrado."
              description="Ajuste a busca ou cadastre um novo paciente."
              action={<NewPatientDialog trigger={<Button size="sm">+ Novo paciente</Button>} />}
            />
          </div>
        ) : (
          <>
            {/* Tabela em telas médias e maiores */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-3 font-medium">Paciente</th>
                    <th className="px-5 py-3 font-medium">Telefone</th>
                    <th className="px-5 py-3 font-medium">Último atendimento</th>
                    <th className="px-5 py-3 font-medium">Próximo atendimento</th>
                    <th className="px-5 py-3 font-medium">Profissional</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <Link to="/pacientes/$id" params={{ id: p.id }} className="flex items-center gap-3">
                          <PatientAvatar name={p.name} tone={p.avatarTone} size="sm" />
                          <span>
                            <span className="block font-medium text-foreground">{p.name}</span>
                            <span className="block text-xs text-muted-foreground">{p.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{p.phone}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {p.lastAppointment ? formatDate(p.lastAppointment) : "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {p.nextAppointment ? formatDate(p.nextAppointment) : "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{profName(p.professionalId)}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cartões no celular */}
            <ul className="divide-y divide-border md:hidden">
              {rows.map((p) => (
                <li key={p.id} className="p-4">
                  <Link to="/pacientes/$id" params={{ id: p.id }} className="flex items-start gap-3">
                    <PatientAvatar name={p.name} tone={p.avatarTone} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{p.name}</p>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{p.phone}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Próximo: {p.nextAppointment ? formatDate(p.nextAppointment) : "—"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm">
              <p className="text-muted-foreground">
                {filtered.length} paciente(s) · página {current} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current === totalPages}
                  onClick={() => setPage(current + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </SectionCard>
    </>
  );
}
