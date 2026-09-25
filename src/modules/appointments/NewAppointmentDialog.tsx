import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  appointmentService,
  patientService,
  professionalService,
  roomService,
  serviceCatalog,
} from "@/services";
import { TODAY } from "@/lib/format";

const schema = z.object({
  patientId: z.string().min(1, "Selecione o paciente"),
  professionalId: z.string().min(1, "Selecione o profissional"),
  serviceId: z.string().min(1, "Selecione o serviço"),
  roomId: z.string().min(1, "Selecione a sala"),
  date: z.string().min(1, "Informe a data"),
  start: z.string().min(1, "Informe o horário"),
  durationMinutes: z.coerce.number().min(10, "Duração mínima de 10 minutos"),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function NewAppointmentDialog({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(true);

  const patients = useQuery({ queryKey: ["patients"], queryFn: patientService.list });
  const professionals = useQuery({ queryKey: ["professionals"], queryFn: professionalService.list });
  const rooms = useQuery({ queryKey: ["rooms"], queryFn: roomService.list });
  const services = useQuery({ queryKey: ["services"], queryFn: serviceCatalog.list });
  const appointments = useQuery({ queryKey: ["appointments"], queryFn: appointmentService.list });

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: "",
      professionalId: "",
      serviceId: "",
      roomId: "",
      date: TODAY,
      start: "09:00",
      durationMinutes: 50,
      notes: "",
    },
  });

  const values = form.watch();
  const conflict = (appointments.data ?? []).find(
    (a) =>
      a.date === values.date &&
      a.start === values.start &&
      a.status !== "cancelado" &&
      (a.professionalId === values.professionalId || a.roomId === values.roomId),
  );

  const onSubmit = async (data: Values) => {
    await appointmentService.create({ ...data, status: "agendado" });
    toast.success("Agendamento criado com sucesso.", {
      description: sendWhatsapp
        ? "Confirmação enviada pelo WhatsApp ao paciente."
        : "Nenhuma mensagem foi enviada.",
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>+ Novo agendamento</Button>}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
          <DialogDescription>Preencha os dados do atendimento.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Paciente" error={form.formState.errors.patientId?.message}>
            <SelectField
              value={values.patientId}
              onChange={(v) => form.setValue("patientId", v, { shouldValidate: true })}
              placeholder="Selecione o paciente"
              options={(patients.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Profissional" error={form.formState.errors.professionalId?.message}>
              <SelectField
                value={values.professionalId}
                onChange={(v) => form.setValue("professionalId", v, { shouldValidate: true })}
                placeholder="Selecione"
                options={(professionals.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
              />
            </Field>
            <Field label="Sala" error={form.formState.errors.roomId?.message}>
              <SelectField
                value={values.roomId}
                onChange={(v) => form.setValue("roomId", v, { shouldValidate: true })}
                placeholder="Selecione"
                options={(rooms.data ?? []).map((r) => ({ value: r.id, label: r.name }))}
              />
            </Field>
          </div>

          <Field label="Serviço" error={form.formState.errors.serviceId?.message}>
            <SelectField
              value={values.serviceId}
              onChange={(v) => {
                form.setValue("serviceId", v, { shouldValidate: true });
                const svc = services.data?.find((s) => s.id === v);
                if (svc) form.setValue("durationMinutes", svc.durationMinutes);
              }}
              placeholder="Selecione o serviço"
              options={(services.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Data" error={form.formState.errors.date?.message}>
              <Input type="date" {...form.register("date")} />
            </Field>
            <Field label="Horário" error={form.formState.errors.start?.message}>
              <Input type="time" {...form.register("start")} />
            </Field>
            <Field label="Duração (min)" error={form.formState.errors.durationMinutes?.message}>
              <Input type="number" {...form.register("durationMinutes")} />
            </Field>
          </div>

          <Field label="Observações">
            <Textarea rows={3} placeholder="Informações relevantes para o atendimento" {...form.register("notes")} />
          </Field>

          {conflict ? (
            <div className="flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-xs text-warning-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                Conflito de horário: já existe um atendimento às {conflict.start} para este
                profissional ou sala.
              </span>
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={sendWhatsapp} onCheckedChange={(v) => setSendWhatsapp(v === true)} />
            Enviar confirmação pelo WhatsApp
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Salvar agendamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
