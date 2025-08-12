import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

const agendamentoSchema = z.object({
  nomeTutor: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  endereco: z.string().optional(),
  nomePet: z.string().min(1, "Nome do pet é obrigatório"),
  especie: z.string().min(1, "Espécie é obrigatória"),
  raca: z.string().min(1, "Raça é obrigatória"),
  dataNascimento: z.date().optional(),
  peso: z.string().min(1, "Peso é obrigatório"),
  tipoConsulta: z.string().min(1, "Tipo de consulta é obrigatório"),
  dataPreferida: z.date({
    required_error: "Data preferida é obrigatória",
  }),
  horarioPreferido: z.string().min(1, "Horário é obrigatório"),
  observacoes: z.string().optional(),
});

type AgendamentoForm = z.infer<typeof agendamentoSchema>;

// Tipos de consulta disponíveis (temporário até migração ser aplicada)
const consultationTypes = [
  { id: "1", name: "Consulta Geral", duration_minutes: 30, price_cents: 8000 },
  { id: "2", name: "Vacinação", duration_minutes: 30, price_cents: 6000 },
  { id: "3", name: "Cirurgia Simples", duration_minutes: 120, price_cents: 25000 },
  { id: "4", name: "Emergência", duration_minutes: 60, price_cents: 15000 },
  { id: "5", name: "Retorno", duration_minutes: 20, price_cents: 4000 },
];

const AgendamentoForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AgendamentoForm>({
    resolver: zodResolver(agendamentoSchema),
  });

  const convertWeightToGrams = (weightStr: string): number => {
    const cleanWeight = weightStr.toLowerCase().replace(/[^\d.,]/g, '');
    const numericWeight = parseFloat(cleanWeight.replace(',', '.'));
    
    if (weightStr.toLowerCase().includes('kg')) {
      return Math.round(numericWeight * 1000);
    }
    
    // Se não especificar unidade, assumir gramas se > 1000, kg caso contrário
    if (numericWeight > 100) {
      return Math.round(numericWeight); // Assumir gramas
    } else {
      return Math.round(numericWeight * 1000); // Assumir kg
    }
  };

  const onSubmit = async (data: AgendamentoForm) => {
    setIsLoading(true);
    
    try {
      // Converter peso para gramas
      const weightGrams = convertWeightToGrams(data.peso);
      
      // Validar peso
      if (weightGrams < 50 || weightGrams > 200000) {
        toast({
          title: "Erro",
          description: "Peso deve estar entre 50g e 200kg",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Buscar tipo de consulta selecionado
      const selectedType = consultationTypes.find(t => t.id === data.tipoConsulta);
      
      // Criar mensagem para WhatsApp
      const mensagem = `
*AGENDAMENTO - VETLIFE 24H*

*DADOS DO TUTOR:*
Nome: ${data.nomeTutor}
Telefone: ${data.telefone}
Email: ${data.email}
${data.endereco ? `Endereço: ${data.endereco}` : ''}

*DADOS DO PET:*
Nome: ${data.nomePet}
Espécie: ${data.especie}
Raça: ${data.raca}
${data.dataNascimento ? `Data de Nascimento: ${format(data.dataNascimento, "dd/MM/yyyy", { locale: ptBR })}` : ''}
Peso: ${data.peso} (${weightGrams}g)

*CONSULTA:*
Tipo: ${selectedType?.name || data.tipoConsulta}
${selectedType?.duration_minutes ? `Duração: ${selectedType.duration_minutes} minutos` : ''}
${selectedType?.price_cents ? `Preço: R$ ${(selectedType.price_cents / 100).toFixed(2)}` : ''}
Data: ${format(data.dataPreferida, "dd/MM/yyyy", { locale: ptBR })}
Horário: ${data.horarioPreferido}

${data.observacoes ? `*OBSERVAÇÕES:*\n${data.observacoes}` : ''}
      `.trim();

      const whatsappUrl = `https://wa.me/553799084866?text=${encodeURIComponent(mensagem)}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: "Redirecionamento para WhatsApp",
        description: "Você será redirecionado para o WhatsApp para finalizar o agendamento.",
      });

      // Limpar formulário após 2 segundos
      setTimeout(() => {
        form.reset();
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao processar agendamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu endereço completo" {...field} />
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
                          <SelectItem value="Cão">Cão</SelectItem>
                          <SelectItem value="Gato">Gato</SelectItem>
                          <SelectItem value="Ave">Ave</SelectItem>
                          <SelectItem value="Roedor">Roedor</SelectItem>
                          <SelectItem value="Réptil">Réptil</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
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
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Nascimento (Opcional)</FormLabel>
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
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                        <Input placeholder="Ex: 15kg, 2.5kg, 5200g" {...field} />
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
                        {consultationTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} ({type.duration_minutes} min)
                            {type.price_cents && ` - R$ ${(type.price_cents / 100).toFixed(2)}`}
                          </SelectItem>
                        ))}
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
                                <SelectItem value="08:30">08:30</SelectItem>
                                <SelectItem value="09:00">09:00</SelectItem>
                                <SelectItem value="09:30">09:30</SelectItem>
                                <SelectItem value="10:00">10:00</SelectItem>
                                <SelectItem value="10:30">10:30</SelectItem>
                                <SelectItem value="11:00">11:00</SelectItem>
                                <SelectItem value="11:30">11:30</SelectItem>
                                <SelectItem value="14:00">14:00</SelectItem>
                                <SelectItem value="14:30">14:30</SelectItem>
                                <SelectItem value="15:00">15:00</SelectItem>
                                <SelectItem value="15:30">15:30</SelectItem>
                                <SelectItem value="16:00">16:00</SelectItem>
                                <SelectItem value="16:30">16:30</SelectItem>
                                <SelectItem value="17:00">17:00</SelectItem>
                                <SelectItem value="17:30">17:30</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
              </div>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações / Motivo da Consulta</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva os sintomas, motivo da consulta ou informações adicionais..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Processando..." : "Agendar via WhatsApp"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AgendamentoForm;