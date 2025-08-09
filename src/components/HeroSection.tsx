import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import vetLifeLogo from "@/assets/vetlife-logo.png";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-background to-secondary py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <img src={vetLifeLogo} alt="VetLife 24h" className="w-20 h-20" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          VetLife 24h
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Conectando você e seu pet à saúde e cuidado 24h.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/agendamento">
            <Button variant="hero" size="lg">
              Agende uma Consulta
            </Button>
          </Link>
          <Button 
            variant="outline"
            size="lg"
            className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
            onClick={() => window.open('https://wa.me/553799084866', '_blank')}
          >
            <MessageCircle className="w-5 h-5 text-green-600" />
            Emergência WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;