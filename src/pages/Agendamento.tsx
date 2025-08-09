import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const agendamentoSchema = z.object({
  nomeTutor: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  nomePet: z.string().min(1, "Nome do pet é obrigatório"),
  especie: z.string().min(1, "Espécie é obrigatória"),
  raca: z.string().min(1, "Raça é obrigatória"),
  idade: z.string().min(1, "Idade é obrigatória"),
  peso: z.string().min(1, "Peso é obrigatório"),
  tipoConsulta: z.string().min(1, "Tipo de consulta é obrigatório"),
  dataPreferida: z.date({
    required_error: "Data preferida é obrigatória",
  }),
  horarioPreferido: z.string().min(1, "Horário é obrigatório"),
  motivo: z.string().min(10, "Descreva o motivo da consulta com mais detalhes"),
  observacoes: z.string().optional(),
});

type AgendamentoForm = z.infer<typeof agendamentoSchema>;

const Agendamento = () => {
  const form = useForm<AgendamentoForm>({
    resolver: zodResolver(agendamentoSchema),
  });

  const onSubmit = (data: AgendamentoForm) => {
    const mensagem = `
*AGENDAMENTO - VETLIFE 24H*

*DADOS DO TUTOR:*
Nome: ${data.nomeTutor}
Telefone: ${data.telefone}
Email: ${data.email}

*DADOS DO PET:*
Nome: ${data.nomePet}
Espécie: ${data.especie}
Raça: ${data.raca}
Idade: ${data.idade}
Peso: ${data.peso}

*CONSULTA:*
Tipo: ${data.tipoConsulta}
Data preferida: ${format(data.dataPreferida, "dd/MM/yyyy", { locale: ptBR })}
Horário preferido: ${data.horarioPreferido}

*MOTIVO:*
${data.motivo}

${data.observacoes ? `*OBSERVAÇÕES:*\n${data.observacoes}` : ''}
    `.trim();

    const whatsappUrl = `https://wa.me/553799084866?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-primary">
                Agendamento de Consulta
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Preencha os dados abaixo para agendar uma consulta para seu pet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Dados do Tutor */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Dados do Tutor
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nomeTutor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(37) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dados do Pet */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Dados do Pet
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nomePet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Pet</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do seu pet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="especie"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Espécie</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a espécie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cao">Cão</SelectItem>
                                <SelectItem value="gato">Gato</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="raca"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Raça</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Labrador, SRD" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="idade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idade</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 3 anos, 6 meses" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="peso"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 15kg, 2.5kg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Dados da Consulta */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Dados da Consulta
                    </h3>
                    <FormField
                      control={form.control}
                      name="tipoConsulta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Consulta</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de consulta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="consulta-geral">Consulta Geral</SelectItem>
                              <SelectItem value="emergencia">Emergência</SelectItem>
                              <SelectItem value="vacinacao">Vacinação</SelectItem>
                              <SelectItem value="cirurgia">Cirurgia</SelectItem>
                              <SelectItem value="exames">Exames</SelectItem>
                              <SelectItem value="retorno">Retorno</SelectItem>
                              <SelectItem value="castração">Castração</SelectItem>
                              <SelectItem value="dermatologia">Dermatologia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dataPreferida"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data Preferida</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                    ) : (
                                      <span>Selecione a data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="horarioPreferido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário Preferido</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o horário" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="08:00">08:00</SelectItem>
                                <SelectItem value="09:00">09:00</SelectItem>
                                <SelectItem value="10:00">10:00</SelectItem>
                                <SelectItem value="11:00">11:00</SelectItem>
                                <SelectItem value="14:00">14:00</SelectItem>
                                <SelectItem value="15:00">15:00</SelectItem>
                                <SelectItem value="16:00">16:00</SelectItem>
                                <SelectItem value="17:00">17:00</SelectItem>
                                <SelectItem value="18:00">18:00</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="motivo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivo da Consulta / Sintomas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva os sintomas ou motivo da consulta..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações Adicionais (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informações adicionais, histórico médico, medicamentos em uso..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Enviar Agendamento via WhatsApp
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Agendamento;