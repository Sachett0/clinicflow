import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const schema = z.object({
  name: z.string().min(3, "Informe o nome completo"),
  socialName: z.string().optional(),
  cpf: z.string().min(11, "CPF inválido"),
  birthDate: z.string().min(1, "Informe a data de nascimento"),
  sex: z.string().optional(),
  phone: z.string().min(8, "Telefone inválido"),
  whatsapp: z.string().optional(),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  zip: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  mainComplaint: z.string().optional(),
  diagnosis: z.string().optional(),
  referringDoctor: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function NewPatientDialog({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async (values: Values) => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Paciente cadastrado com sucesso.", { description: values.name });
    setOpen(false);
    form.reset();
  };

  const err = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>+ Novo paciente</Button>}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo paciente</DialogTitle>
          <DialogDescription>
            Cadastro completo com dados pessoais, endereço e informações clínicas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="pessoais">
            <TabsList className="w-full">
              <TabsTrigger value="pessoais" className="flex-1">
                Dados pessoais
              </TabsTrigger>
              <TabsTrigger value="endereco" className="flex-1">
                Endereço
              </TabsTrigger>
              <TabsTrigger value="clinico" className="flex-1">
                Clínico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pessoais" className="mt-4 grid gap-4 sm:grid-cols-2">
              <F label="Nome completo" error={err.name?.message} className="sm:col-span-2">
                <Input {...form.register("name")} />
              </F>
              <F label="Nome social">
                <Input {...form.register("socialName")} />
              </F>
              <F label="CPF" error={err.cpf?.message}>
                <Input placeholder="000.000.000-00" {...form.register("cpf")} />
              </F>
              <F label="Data de nascimento" error={err.birthDate?.message}>
                <Input type="date" {...form.register("birthDate")} />
              </F>
              <F label="Sexo">
                <Input placeholder="Feminino / Masculino / Outro" {...form.register("sex")} />
              </F>
              <F label="Telefone" error={err.phone?.message}>
                <Input placeholder="(11) 90000-0000" {...form.register("phone")} />
              </F>
              <F label="WhatsApp">
                <Input placeholder="(11) 90000-0000" {...form.register("whatsapp")} />
              </F>
              <F label="E-mail" error={err.email?.message} className="sm:col-span-2">
                <Input type="email" {...form.register("email")} />
              </F>
            </TabsContent>

            <TabsContent value="endereco" className="mt-4 grid gap-4 sm:grid-cols-2">
              <F label="CEP">
                <Input {...form.register("zip")} />
              </F>
              <F label="Rua">
                <Input {...form.register("street")} />
              </F>
              <F label="Número">
                <Input {...form.register("number")} />
              </F>
              <F label="Complemento">
                <Input {...form.register("complement")} />
              </F>
              <F label="Bairro">
                <Input {...form.register("district")} />
              </F>
              <F label="Cidade">
                <Input {...form.register("city")} />
              </F>
              <F label="Estado">
                <Input {...form.register("state")} />
              </F>
            </TabsContent>

            <TabsContent value="clinico" className="mt-4 grid gap-4 sm:grid-cols-2">
              <F label="Queixa principal" className="sm:col-span-2">
                <Textarea rows={2} {...form.register("mainComplaint")} />
              </F>
              <F label="Diagnóstico">
                <Input {...form.register("diagnosis")} />
              </F>
              <F label="Médico responsável">
                <Input {...form.register("referringDoctor")} />
              </F>
              <F label="Alergias">
                <Input {...form.register("allergies")} />
              </F>
              <F label="Medicamentos">
                <Input {...form.register("medications")} />
              </F>
              <F label="Observações" className="sm:col-span-2">
                <Textarea rows={2} {...form.register("notes")} />
              </F>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Salvar paciente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function F({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
