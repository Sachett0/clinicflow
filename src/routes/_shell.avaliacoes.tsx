import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ClipboardList, GripVertical, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { CardsSkeleton } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { evaluationService } from "@/services";
import type { FieldType } from "@/data/types";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_shell/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações · ClinicFlow" },
      { name: "description", content: "Modelos de avaliação personalizáveis com construtor de formulários." },
      { property: "og:title", content: "Avaliações · ClinicFlow" },
      { property: "og:description", content: "Crie modelos de avaliação com campos sob medida." },
    ],
  }),
  component: EvaluationsPage,
});

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "texto", label: "Texto" },
  { value: "texto-longo", label: "Texto longo" },
  { value: "numero", label: "Número" },
  { value: "data", label: "Data" },
  { value: "selecao", label: "Seleção" },
  { value: "multipla", label: "Múltipla seleção" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "escala", label: "Escala 0–10" },
  { value: "tabela", label: "Tabela" },
  { value: "imagem", label: "Imagem" },
  { value: "assinatura", label: "Assinatura" },
];

interface DraftField {
  id: string;
  label: string;
  type: FieldType;
}

function EvaluationsPage() {
  const templates = useQuery({ queryKey: ["evaluation-templates"], queryFn: evaluationService.templates });
  const [builderOpen, setBuilderOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Modelos de avaliação"
        description="Padronize as avaliações da clínica com formulários próprios."
        actions={<FormBuilderDialog open={builderOpen} onOpenChange={setBuilderOpen} />}
      />

      {templates.isLoading ? (
        <CardsSkeleton items={4} />
      ) : (templates.data ?? []).length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nenhum modelo cadastrado." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(templates.data ?? []).map((t) => (
            <SectionCard key={t.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{t.name}</h3>
                <StatusBadge status={t.active ? "ativo" : "inativo"} />
              </div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.fields.length} campos</span>
                <span>Atualizado em {formatDate(t.updatedAt)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.info(`Editando “${t.name}”.`)}>
                  Editar campos
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast.success("Modelo duplicado.")}>
                  Duplicar
                </Button>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </>
  );
}

function FormBuilderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [fields, setFields] = useState<DraftField[]>([
    { id: "1", label: "Queixa principal", type: "texto-longo" },
    { id: "2", label: "Escala de dor", type: "escala" },
  ]);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FieldType>("texto");

  const move = (index: number, delta: number) => {
    const next = [...fields];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    setFields(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>+ Novo modelo</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Construtor de formulário</DialogTitle>
          <DialogDescription>Monte o modelo de avaliação campo a campo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Nome do modelo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Avaliação de dor crônica" />
          </div>

          <div className="space-y-2">
            <Label>Campos</Label>
            {fields.length === 0 ? (
              <EmptyState title="Nenhum campo adicionado ainda." />
            ) : (
              <ul className="space-y-2">
                {fields.map((f, index) => (
                  <li key={f.id} className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <GripVertical className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {FIELD_TYPES.find((t) => t.value === f.type)?.label}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => move(index, -1)} aria-label="Mover para cima">↑</Button>
                    <Button size="sm" variant="ghost" onClick={() => move(index, 1)} aria-label="Mover para baixo">↓</Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remover campo"
                      onClick={() => setFields(fields.filter((x) => x.id !== f.id))}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-[1fr_200px_auto]">
            <Input placeholder="Nome do campo" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
            <Select value={newType} onValueChange={(v) => setNewType(v as FieldType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={() => {
                if (!newLabel.trim()) {
                  toast.error("Informe o nome do campo.");
                  return;
                }
                setFields([...fields, { id: String(Date.now()), label: newLabel, type: newType }]);
                setNewLabel("");
              }}
            >
              <Plus className="mr-1 size-4" /> Adicionar
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (!name.trim()) {
                toast.error("Informe o nome do modelo.");
                return;
              }
              toast.success("Modelo de avaliação criado.", { description: `${fields.length} campos configurados.` });
              onOpenChange(false);
            }}
          >
            Salvar modelo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
