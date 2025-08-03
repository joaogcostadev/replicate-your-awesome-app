import { Button } from "@/components/ui/button";
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
        
        <Button 
          variant="hero" 
          size="lg"
          onClick={() => window.open(`https://wa.me/5537990848668?text=Olá! Gostaria de agendar uma consulta para meu pet.`, '_blank')}
        >
          Agende uma Consulta
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;