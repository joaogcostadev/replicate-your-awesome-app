import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageCircle } from "lucide-react";

const ServicesSection = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-foreground mb-12">
          Nossos Serviços
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="shadow-card hover:shadow-lg transition-all duration-300 border-border">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground">
                Agendamento Online 24h
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-muted-foreground mb-6 text-base">
                Agende consultas e exames a qualquer hora, de qualquer lugar.
              </CardDescription>
              <Button variant="default" className="w-full">
                Agendar Consulta
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-lg transition-all duration-300 border-border">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl text-foreground">
                Atendimento via WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-muted-foreground mb-6 text-base">
                Converse conosco para tirar dúvidas ou em casos de emergência.
              </CardDescription>
              <Button variant="whatsapp" className="w-full">
                Chamar no WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;